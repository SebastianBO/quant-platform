/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Sync short volume data from FINRA to Supabase
// Runs daily after market close

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
  const result: Map<string, ShortVolumeRecord> = new Map()
  const lines = content.split('\n')

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Format: Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market
    const parts = line.split('|')
    if (parts.length >= 5) {
      const symbol = parts[1]
      const shortVolume = parseInt(parts[2]) || 0
      const shortExemptVolume = parseInt(parts[3]) || 0
      const totalVolume = parseInt(parts[4]) || 0

      // Aggregate if symbol already exists (multiple markets)
      const existing = result.get(symbol)
      if (existing) {
        existing.short_volume += shortVolume
        existing.short_exempt_volume += shortExemptVolume
        existing.total_volume += totalVolume
      } else {
        result.set(symbol, {
          symbol,
          trade_date: date,
          short_volume: shortVolume,
          short_exempt_volume: shortExemptVolume,
          total_volume: totalVolume
        })
      }
    }
  }

  return Array.from(result.values())
}

// Fetch FINRA daily file
async function fetchFinraDailyFile(date: Date): Promise<ShortVolumeRecord[]> {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const formattedDate = date.toISOString().split('T')[0]

  try {
    // FINRA Consolidated NMS file - contains most stocks
    const url = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${dateStr}.txt`
    const response = await fetch(url, {
      headers: { 'Accept': 'text/plain' }
    })

    if (response.ok) {
      const content = await response.text()
      return parseFinraFile(content, formattedDate)
    }
  } catch (error) {
    console.error(`Error fetching FINRA file for ${dateStr}:`, error)
  }

  return []
}

// Get list of priority tickers to sync
function getPriorityTickers(): string[] {
  // Major tickers that should always be synced
  return [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'JNJ',
    'JPM', 'V', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'LLY', 'PEP',
    'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'WMT', 'CSCO', 'ABT', 'ACN', 'DHR',
    'AMD', 'INTC', 'NFLX', 'CRM', 'ADBE', 'ORCL', 'TXN', 'QCOM', 'AMAT', 'INTU',
    'SOFI', 'PLTR', 'RIVN', 'LCID', 'NIO', 'GME', 'AMC', 'HOOD', 'COIN',
    'AAPL', 'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'XLF', 'XLE', 'XLK'
  ]
}

export async function GET(request: NextRequest) {
  // Check for cron secret or admin auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without auth for testing, but log it
    console.log('Short volume sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const daysBack = parseInt(searchParams.get('days') || '1')
  const limit = parseInt(searchParams.get('limit') || '0') // 0 = all tickers
  const onlyPriority = searchParams.get('priority') === 'true'

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const results: { date: string; inserted: number; errors: string[] }[] = []

  try {
    // Get priority tickers if requested
    const priorityTickers = onlyPriority ? getPriorityTickers() : null

    // Sync data for each day
    for (let d = 0; d < daysBack; d++) {
      const date = new Date()
      date.setDate(date.getDate() - d)

      // Skip weekends
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const dateStr = date.toISOString().split('T')[0]
      console.log(`Fetching FINRA data for ${dateStr}...`)

      const records = await fetchFinraDailyFile(date)

      if (records.length === 0) {
        results.push({ date: dateStr, inserted: 0, errors: ['No data available'] })
        continue
      }

      // Filter to priority tickers if requested
      let filteredRecords = records
      if (priorityTickers) {
        const prioritySet = new Set(priorityTickers)
        filteredRecords = records.filter(r => prioritySet.has(r.symbol))
      }

      // Apply limit if specified
      if (limit > 0) {
        filteredRecords = filteredRecords.slice(0, limit)
      }

      console.log(`Processing ${filteredRecords.length} records for ${dateStr}...`)

      // Upsert in batches
      const batchSize = 500
      let inserted = 0
      const errors: string[] = []

      for (let i = 0; i < filteredRecords.length; i += batchSize) {
        const batch = filteredRecords.slice(i, i + batchSize)

        const { error } = await (supabase as any)
          .from('short_volume')
          .upsert(batch, {
            onConflict: 'symbol,trade_date',
            ignoreDuplicates: false
          })

        if (error) {
          console.error(`Batch error:`, error)
          errors.push(error.message)
        } else {
          inserted += batch.length
        }
      }

      results.push({ date: dateStr, inserted, errors })
    }

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    return NextResponse.json({
      success: true,
      summary: {
        daysProcessed: results.length,
        totalRecords: totalInserted,
        totalErrors
      },
      results
    })

  } catch (error) {
    console.error('Short volume sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
