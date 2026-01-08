import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/analyst-estimates
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
    const url = `https://api.financialdatasets.ai/analyst-estimates/?ticker=${ticker}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    const estimates = data.analyst_estimates || []

    // Auto-cache: Store fetched data in Supabase for future requests
    if (estimates.length > 0) {
      cacheAnalystEstimates(estimates, ticker).catch(err =>
        console.error('Failed to cache analyst estimates:', err)
      )
    }

    return estimates
  } catch (error) {
    console.error('Financial Datasets API error:', error)
    return null
  }
}

// Cache fetched data in Supabase (fire and forget)
async function cacheAnalystEstimates(estimates: any[], ticker: string) {
  const records = estimates.map(e => ({
    ticker: ticker.toUpperCase(),
    fiscal_period: e.fiscal_period,
    period: e.period || 'quarterly',
    eps_estimate: e.eps_estimate,
    eps_actual: e.eps_actual,
    eps_surprise: e.eps_surprise,
    eps_surprise_percent: e.eps_surprise_percent,
    revenue_estimate: e.revenue_estimate,
    revenue_actual: e.revenue_actual,
    revenue_surprise: e.revenue_surprise,
    revenue_surprise_percent: e.revenue_surprise_percent,
    num_analysts: e.num_analysts,
    source: 'FINANCIAL_DATASETS',
    updated_at: new Date().toISOString(),
  }))

  await getSupabase()
    .from('analyst_estimates')
    .upsert(records, { onConflict: 'ticker,fiscal_period,period' })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const period = searchParams.get('period') || 'quarterly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)

  if (!ticker) {
    return NextResponse.json({
      error: 'ticker parameter is required',
    }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabase()
      .from('analyst_estimates')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .eq('period', period)
      .order('fiscal_period', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Analyst estimates query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    let estimates: unknown[] = []
    let dataSource = 'supabase'

    if (data && data.length > 0) {
      // Use Supabase data
      estimates = data.map(row => ({
        ticker: row.ticker,
        fiscal_period: row.fiscal_period,
        period: row.period,
        eps_estimate: row.eps_estimate,
        eps_actual: row.eps_actual,
        eps_surprise: row.eps_surprise,
        eps_surprise_percent: row.eps_surprise_percent,
        revenue_estimate: row.revenue_estimate,
        revenue_actual: row.revenue_actual,
        revenue_surprise: row.revenue_surprise,
        revenue_surprise_percent: row.revenue_surprise_percent,
        num_analysts: row.num_analysts,
      }))
    } else {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), limit)
      if (fallbackData && fallbackData.length > 0) {
        estimates = fallbackData
        dataSource = 'financialdatasets.ai'
      }
    }

    return NextResponse.json({
      analyst_estimates: estimates,
      _meta: {
        source: dataSource,
        count: estimates.length,
        fetched_at: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Analyst estimates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
