import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/insider-trades
// Falls back to Financial Datasets API if Supabase has no data

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY

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

// Fallback to Financial Datasets API with auto-caching
async function fetchFromFinancialDatasets(ticker: string, limit: number) {
  if (!FINANCIAL_DATASETS_API_KEY) return null

  try {
    const url = `https://api.financialdatasets.ai/insider-trades?ticker=${ticker}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    const trades = data.insider_trades || []

    // Auto-cache: Store fetched data in Supabase for future requests
    if (trades.length > 0) {
      cacheInsiderTrades(trades, ticker).catch(err =>
        logger.error('Failed to cache insider trades', { error: err instanceof Error ? err.message : 'Unknown' })
      )
    }

    return trades
  } catch (error) {
    logger.error('Financial Datasets API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Cache fetched data in Supabase (fire and forget)
async function cacheInsiderTrades(trades: any[], ticker: string) {
  const records = trades.map(t => ({
    ticker: ticker.toUpperCase(),
    issuer: t.issuer,
    name: t.name,
    title: t.title,
    is_board_director: t.is_board_director,
    transaction_date: t.transaction_date,
    transaction_shares: t.transaction_shares,
    transaction_price_per_share: t.transaction_price_per_share,
    transaction_value: t.transaction_value,
    shares_owned_before_transaction: t.shares_owned_before_transaction,
    shares_owned_after_transaction: t.shares_owned_after_transaction,
    security_title: t.security_title,
    filing_date: t.filing_date,
    accession_number: t.accession_number || `${ticker}-${t.filing_date}-${t.name}`,
    source: 'FINANCIAL_DATASETS',
    updated_at: new Date().toISOString(),
  }))

  await getSupabase()
    .from('insider_trades')
    .upsert(records, { onConflict: 'accession_number' })
}

// Parse date filter parameters
function parseDateFilters(params: URLSearchParams) {
  return {
    filing_date: params.get('filing_date'),
    filing_date_gte: params.get('filing_date_gte'),
    filing_date_lte: params.get('filing_date_lte'),
    filing_date_gt: params.get('filing_date_gt'),
    filing_date_lt: params.get('filing_date_lt'),
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 1000)
  const dateFilters = parseDateFilters(searchParams)

  if (!ticker) {
    return NextResponse.json({
      error: 'ticker parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('insider_trades')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .order('filing_date', { ascending: false })
      .limit(limit)

    // Apply date filters
    if (dateFilters.filing_date) {
      query = query.eq('filing_date', dateFilters.filing_date)
    }
    if (dateFilters.filing_date_gte) {
      query = query.gte('filing_date', dateFilters.filing_date_gte)
    }
    if (dateFilters.filing_date_lte) {
      query = query.lte('filing_date', dateFilters.filing_date_lte)
    }
    if (dateFilters.filing_date_gt) {
      query = query.gt('filing_date', dateFilters.filing_date_gt)
    }
    if (dateFilters.filing_date_lt) {
      query = query.lt('filing_date', dateFilters.filing_date_lt)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Insider trades query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    let insiderTrades: unknown[] = []
    let dataSource = 'supabase'

    if (data && data.length > 0) {
      // Use Supabase data
      insiderTrades = data.map(row => ({
        ticker: row.ticker,
        issuer: row.issuer,
        name: row.name,
        title: row.title,
        is_board_director: row.is_board_director,
        transaction_date: row.transaction_date,
        transaction_shares: row.transaction_shares,
        transaction_price_per_share: row.transaction_price_per_share,
        transaction_value: row.transaction_value,
        shares_owned_before_transaction: row.shares_owned_before_transaction,
        shares_owned_after_transaction: row.shares_owned_after_transaction,
        security_title: row.security_title,
        filing_date: row.filing_date,
      }))
    } else {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), limit)
      if (fallbackData && fallbackData.length > 0) {
        insiderTrades = fallbackData
        dataSource = 'financialdatasets.ai'
      }
    }

    return NextResponse.json({
      insider_trades: insiderTrades,
      _meta: {
        source: dataSource,
        count: insiderTrades.length,
        fetched_at: new Date().toISOString(),
      }
    })
  } catch (error) {
    logger.error('Insider trades API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
