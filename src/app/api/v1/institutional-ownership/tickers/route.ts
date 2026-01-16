import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/institutional-ownership/tickers/

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
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 5000)

  try {
    let query = getSupabase()
      .from('institutional_ticker_coverage')
      .select('ticker, total_holders, total_value')
      .order('total_value', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (search) {
      query = query.ilike('ticker', `%${search.toUpperCase()}%`)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      // Fallback to CUSIP mappings
      const { data: cusipData } = await getSupabase()
        .from('cusip_mappings')
        .select('ticker')
        .not('ticker', 'is', null)
        .order('ticker')
        .limit(limit)

      if (cusipData && cusipData.length > 0) {
        const tickers = [...new Set(cusipData.map(c => c.ticker).filter(Boolean))]
        return NextResponse.json({
          tickers: search
            ? tickers.filter(t => t.includes(search.toUpperCase()))
            : tickers
        })
      }

      // Ultimate fallback: hardcoded popular tickers
      return NextResponse.json({
        tickers: getDefaultTickers(search, limit)
      })
    }

    return NextResponse.json({
      tickers: data.map(d => d.ticker)
    })
  } catch (error) {
    logger.error('Tickers list API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      tickers: getDefaultTickers(search, limit)
    })
  }
}

// Default tickers list (fallback)
function getDefaultTickers(search: string | null, limit: number): string[] {
  const allTickers = [
    // Mega cap tech
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META',
    // Berkshire
    'BRK.A', 'BRK.B',
    // Financials
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'AXP', 'BLK', 'SCHW', 'C',
    // Healthcare
    'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY',
    // Consumer
    'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT',
    // Industrial
    'CAT', 'DE', 'HON', 'UNP', 'UPS', 'BA', 'GE', 'LMT', 'RTX', 'MMM',
    // Energy
    'XOM', 'CVX', 'COP', 'OXY', 'SLB', 'EOG', 'PSX', 'VLO', 'MPC',
    // Tech
    'CRM', 'ADBE', 'ORCL', 'CSCO', 'INTC', 'AMD', 'AVGO', 'TXN', 'QCOM', 'NOW',
    // Telecom & Media
    'DIS', 'NFLX', 'CMCSA', 'T', 'VZ', 'TMUS',
    // Other popular
    'PYPL', 'SQ', 'COIN', 'UBER', 'ABNB', 'SNOW', 'DDOG', 'ZM', 'CRWD', 'NET',
    // Semis
    'TSM', 'ASML', 'MU', 'LRCX', 'KLAC', 'AMAT', 'MRVL', 'ON',
    // REITs
    'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O',
    // Retail
    'AMZN', 'LOW', 'TJX', 'ROST', 'DG', 'DLTR',
  ]

  // Remove duplicates
  const uniqueTickers = [...new Set(allTickers)]

  if (search) {
    const searchUpper = search.toUpperCase()
    return uniqueTickers
      .filter(t => t.includes(searchUpper))
      .slice(0, limit)
  }

  return uniqueTickers.slice(0, limit)
}
