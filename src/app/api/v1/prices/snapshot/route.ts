import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/prices/snapshot

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
  const ticker = searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({
      error: 'ticker parameter is required',
    }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabase()
      .from('stock_prices_snapshot')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Price snapshot query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 })
    }

    // Match Financial Datasets exact format
    return NextResponse.json({
      snapshot: {
        ticker: data.ticker,
        price: data.close || data.price,
        day_change: data.change || data.day_change,
        day_change_percent: data.change_percent || data.day_change_percent,
        volume: data.volume,
        time: data.time || data.updated_at,
        time_milliseconds: data.time_milliseconds || (data.updated_at ? new Date(data.updated_at).getTime() : null),
        market_cap: data.market_cap,
      }
    })
  } catch (error) {
    console.error('Price snapshot API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
