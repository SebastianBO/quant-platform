// Supabase Edge Function: Ingest FINRA Short Volume Data
// Runs daily at 6:30 PM ET (after FINRA publishes at 6 PM)
// Cron: 30 18 * * 1-5 (Mon-Fri at 6:30 PM ET)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

  // Skip header line (Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split('|')
    if (parts.length >= 5) {
      const symbol = parts[1]
      const shortVolume = parseInt(parts[2]) || 0
      const shortExemptVolume = parseInt(parts[3]) || 0
      const totalVolume = parseInt(parts[4]) || 0

      // Find existing record for this symbol (aggregate across markets)
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

// Get the last trading day (skip weekends)
function getLastTradingDay(): Date {
  const now = new Date()
  // Convert to ET
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))

  // If before 6 PM ET, use previous day
  if (et.getHours() < 18) {
    et.setDate(et.getDate() - 1)
  }

  // Skip weekends
  while (et.getDay() === 0 || et.getDay() === 6) {
    et.setDate(et.getDate() - 1)
  }

  return et
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the date to fetch (from query param or default to last trading day)
    const url = new URL(req.url)
    const dateParam = url.searchParams.get('date')

    let targetDate: Date
    if (dateParam) {
      targetDate = new Date(dateParam)
    } else {
      targetDate = getLastTradingDay()
    }

    const dateStr = targetDate.toISOString().split('T')[0]
    const dateFileFormat = dateStr.replace(/-/g, '')

    console.log(`Fetching FINRA short volume data for ${dateStr}`)

    // Check if we already have data for this date
    const { data: existingData, error: checkError } = await supabase
      .from('short_volume')
      .select('id')
      .eq('trade_date', dateStr)
      .limit(1)

    if (existingData && existingData.length > 0) {
      console.log(`Data already exists for ${dateStr}, skipping ingestion`)
      return new Response(
        JSON.stringify({
          success: true,
          message: `Data already exists for ${dateStr}`,
          date: dateStr,
          skipped: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or update ingestion log
    const { data: logData, error: logError } = await supabase
      .from('short_volume_ingestion_log')
      .upsert({
        trade_date: dateStr,
        status: 'running',
        started_at: new Date().toISOString()
      }, { onConflict: 'trade_date' })
      .select()
      .single()

    // Fetch FINRA Consolidated NMS file
    const finraUrl = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${dateFileFormat}.txt`
    console.log(`Fetching: ${finraUrl}`)

    const response = await fetch(finraUrl)

    if (!response.ok) {
      throw new Error(`FINRA file not available: ${response.status}`)
    }

    const content = await response.text()
    const records = parseFinraFile(content, dateStr)

    console.log(`Parsed ${records.length} records`)

    // Filter out records with no volume
    const validRecords = records.filter(r => r.total_volume > 0)

    // Insert in batches of 1000
    const batchSize = 1000
    let inserted = 0
    let updated = 0

    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('short_volume')
        .upsert(batch, {
          onConflict: 'symbol,trade_date',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        console.error(`Batch insert error:`, error)
        throw error
      }

      inserted += batch.length
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`)
    }

    // Update ingestion log
    await supabase
      .from('short_volume_ingestion_log')
      .update({
        status: 'completed',
        symbols_processed: records.length,
        symbols_inserted: inserted,
        completed_at: new Date().toISOString()
      })
      .eq('trade_date', dateStr)

    console.log(`Completed: ${inserted} records inserted for ${dateStr}`)

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        totalRecords: records.length,
        inserted: inserted,
        message: `Successfully ingested ${inserted} short volume records for ${dateStr}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Ingestion error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
