import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/income-statements
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
async function fetchFromFinancialDatasets(ticker: string, period: string, limit: number) {
  if (!FINANCIAL_DATASETS_API_KEY) return null

  try {
    const url = `https://api.financialdatasets.ai/financials/income-statements?ticker=${ticker}&period=${period}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    const statements = data.income_statements || []

    // Auto-cache: Store fetched data in Supabase for future requests
    if (statements.length > 0) {
      cacheIncomeStatements(statements, ticker).catch(err =>
        logger.error('Failed to cache income statements', { error: err instanceof Error ? err.message : 'Unknown' })
      )
    }

    return statements
  } catch (error) {
    logger.error('Financial Datasets API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Cache fetched data in Supabase (fire and forget)
async function cacheIncomeStatements(statements: any[], ticker: string) {
  const records = statements.map(s => ({
    ticker: ticker.toUpperCase(),
    cik: s.cik || null,
    report_period: s.report_period,
    fiscal_period: s.fiscal_period,
    period: s.period,
    currency: s.currency || 'USD',
    revenue: s.revenue,
    cost_of_revenue: s.cost_of_revenue,
    gross_profit: s.gross_profit,
    operating_expense: s.operating_expense,
    selling_general_and_administrative_expenses: s.selling_general_and_administrative_expenses,
    research_and_development: s.research_and_development,
    operating_income: s.operating_income,
    interest_expense: s.interest_expense,
    ebit: s.ebit,
    income_tax_expense: s.income_tax_expense,
    net_income_discontinued_operations: s.net_income_discontinued_operations,
    net_income_non_controlling_interests: s.net_income_non_controlling_interests,
    net_income: s.net_income,
    net_income_common_stock: s.net_income_common_stock,
    preferred_dividends_impact: s.preferred_dividends_impact,
    consolidated_income: s.consolidated_income,
    earnings_per_share: s.earnings_per_share,
    earnings_per_share_diluted: s.earnings_per_share_diluted,
    dividends_per_common_share: s.dividends_per_common_share,
    weighted_average_shares: s.weighted_average_shares,
    weighted_average_shares_diluted: s.weighted_average_shares_diluted,
    source: 'FINANCIAL_DATASETS',
    updated_at: new Date().toISOString(),
  }))

  await getSupabase()
    .from('income_statements')
    .upsert(records, { onConflict: 'ticker,report_period,period' })
}

// Parse date filter parameters
function parseDateFilters(params: URLSearchParams) {
  return {
    report_period: params.get('report_period'),
    report_period_gte: params.get('report_period_gte'),
    report_period_lte: params.get('report_period_lte'),
    report_period_gt: params.get('report_period_gt'),
    report_period_lt: params.get('report_period_lt'),
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const cik = searchParams.get('cik')
  const period = searchParams.get('period') || 'quarterly' // annual, quarterly, ttm
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 100)
  const dateFilters = parseDateFilters(searchParams)

  // Validate: must have either ticker or cik
  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('income_statements')
      .select('*')
      .eq('period', period)
      .order('report_period', { ascending: false })
      .limit(limit)

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase())
    }
    if (cik) {
      query = query.eq('cik', cik)
    }

    // Apply date filters
    if (dateFilters.report_period) {
      query = query.eq('report_period', dateFilters.report_period)
    }
    if (dateFilters.report_period_gte) {
      query = query.gte('report_period', dateFilters.report_period_gte)
    }
    if (dateFilters.report_period_lte) {
      query = query.lte('report_period', dateFilters.report_period_lte)
    }
    if (dateFilters.report_period_gt) {
      query = query.gt('report_period', dateFilters.report_period_gt)
    }
    if (dateFilters.report_period_lt) {
      query = query.lt('report_period', dateFilters.report_period_lt)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Income statements query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Check if we have local data
    let incomeStatements: unknown[] = []
    let dataSource = 'supabase'
    let dataTimestamp = new Date().toISOString()

    if (data && data.length > 0) {
      // Use Supabase data
      incomeStatements = data.map(row => ({
        ticker: row.ticker,
        report_period: row.report_period,
        fiscal_period: row.fiscal_period,
        period: row.period,
        currency: row.currency,
        revenue: row.revenue,
        cost_of_revenue: row.cost_of_revenue,
        gross_profit: row.gross_profit,
        operating_expense: row.operating_expense,
        selling_general_and_administrative_expenses: row.selling_general_and_administrative_expenses,
        research_and_development: row.research_and_development,
        operating_income: row.operating_income,
        interest_expense: row.interest_expense,
        ebit: row.ebit,
        income_tax_expense: row.income_tax_expense,
        net_income_discontinued_operations: row.net_income_discontinued_operations,
        net_income_non_controlling_interests: row.net_income_non_controlling_interests,
        net_income: row.net_income,
        net_income_common_stock: row.net_income_common_stock,
        preferred_dividends_impact: row.preferred_dividends_impact,
        consolidated_income: row.consolidated_income,
        earnings_per_share: row.earnings_per_share,
        earnings_per_share_diluted: row.earnings_per_share_diluted,
        dividends_per_common_share: row.dividends_per_common_share,
        weighted_average_shares: row.weighted_average_shares,
        weighted_average_shares_diluted: row.weighted_average_shares_diluted,
      }))
      dataTimestamp = data[0]?.updated_at || dataTimestamp
    } else if (ticker) {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), period, limit)
      if (fallbackData && fallbackData.length > 0) {
        incomeStatements = fallbackData
        dataSource = 'financialdatasets.ai'
        dataTimestamp = new Date().toISOString()
      }
    }

    return NextResponse.json({
      income_statements: incomeStatements,
      _meta: {
        source: dataSource,
        fetched_at: dataTimestamp,
        count: incomeStatements.length,
      }
    })
  } catch (error) {
    logger.error('Income statements API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
