import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/income-statements

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
      console.error('Income statements query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const incomeStatements = (data || []).map(row => ({
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

    return NextResponse.json({ income_statements: incomeStatements })
  } catch (error) {
    console.error('Income statements API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
