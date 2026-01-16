import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/crypto/prices

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')
  const limit = Math.min(parseInt(searchParams.get('limit') || '5000'), 5000)

  if (!symbol) {
    return NextResponse.json({
      error: 'symbol parameter is required',
    }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabase()
      .from('crypto_prices')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Crypto prices query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const prices = (data || []).map(row => ({
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      market_cap: row.market_cap,
    }))

    return NextResponse.json({ prices })
  } catch (error) {
    logger.error('Crypto prices API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
