import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

interface ShortVolumeRecord {
  symbol: string
  trade_date: string
  short_volume: number
  short_exempt_volume: number
  total_volume: number
}

// Parse FINRA daily short volume file
function parseFinraFile(content: string, date: string): ShortVolumeRecord[] {
  const records: ShortVolumeRecord[] = []
  const lines = content.split('\n')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split('|')
    if (parts.length >= 5) {
      const symbol = parts[1]
      const shortVolume = parseInt(parts[2]) || 0
      const shortExemptVolume = parseInt(parts[3]) || 0
      const totalVolume = parseInt(parts[4]) || 0

      const existing = records.find(r => r.symbol === symbol)
      if (existing) {
        existing.short_volume += shortVolume
        existing.short_exempt_volume += shortExemptVolume
        existing.total_volume += totalVolume
      } else {
        records.push({
          symbol,
          trade_date: date,
          short_volume: shortVolume,
          short_exempt_volume: shortExemptVolume,
          total_volume: totalVolume
        })
      }
    }
  }

  return records
}

// POST /api/short-volume/backfill?days=30
export async function POST(request: NextRequest) {
  const daysParam = request.nextUrl.searchParams.get('days') || '30'
  const days = Math.min(parseInt(daysParam) || 30, 90) // Max 90 days

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const results: { date: string; status: string; records?: number; error?: string }[] = []

  let currentDate = new Date()
  let processedDays = 0

  while (processedDays < days) {
    const dayOfWeek = currentDate.getDay()

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dateFileFormat = dateStr.replace(/-/g, '')

      // Check if we already have data for this date
      const { data: existing } = await supabase
        .from('short_volume')
        .select('id')
        .eq('trade_date', dateStr)
        .limit(1)

      if (existing && existing.length > 0) {
        results.push({ date: dateStr, status: 'skipped', records: 0 })
        processedDays++
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }

      // Fetch FINRA file
      const finraUrl = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${dateFileFormat}.txt`

      try {
        const response = await fetch(finraUrl)

        if (response.ok) {
          const content = await response.text()
          const records = parseFinraFile(content, dateStr)
          const validRecords = records.filter(r => r.total_volume > 0)

          // Insert in batches
          const batchSize = 1000
          for (let i = 0; i < validRecords.length; i += batchSize) {
            const batch = validRecords.slice(i, i + batchSize)
            await supabase
              .from('short_volume')
              .upsert(batch, { onConflict: 'symbol,trade_date' })
          }

          results.push({ date: dateStr, status: 'success', records: validRecords.length })
        } else {
          results.push({ date: dateStr, status: 'not_available', error: `HTTP ${response.status}` })
        }
      } catch (err: any) {
        results.push({ date: dateStr, status: 'error', error: err.message })
      }

      processedDays++
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  const totalInserted = results.filter(r => r.status === 'success').reduce((sum, r) => sum + (r.records || 0), 0)

  return NextResponse.json({
    success: true,
    daysProcessed: processedDays,
    totalRecordsInserted: totalInserted,
    details: results
  })
}

// GET to check status
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: stats, error } = await supabase
    .from('short_volume')
    .select('trade_date')
    .order('trade_date', { ascending: false })
    .limit(1)

  const { count } = await supabase
    .from('short_volume')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    totalRecords: count || 0,
    latestDate: stats?.[0]?.trade_date || null,
    status: count && count > 0 ? 'populated' : 'empty'
  })
}
