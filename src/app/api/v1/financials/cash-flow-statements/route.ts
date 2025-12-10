import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/cash-flow-statements

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
  const period = searchParams.get('period') || 'quarterly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 100)
  const dateFilters = parseDateFilters(searchParams)

  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('cash_flow_statements')
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
      console.error('Cash flow statements query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const cashFlowStatements = (data || []).map(row => ({
      ticker: row.ticker,
      report_period: row.report_period,
      fiscal_period: row.fiscal_period,
      period: row.period,
      currency: row.currency,
      net_income: row.net_income,
      depreciation_and_amortization: row.depreciation_and_amortization,
      share_based_compensation: row.share_based_compensation,
      net_cash_flow_from_operations: row.net_cash_flow_from_operations,
      capital_expenditure: row.capital_expenditure,
      business_acquisitions_and_disposals: row.acquisitions,
      investment_acquisitions_and_disposals: (row.purchases_of_investments || 0) + (row.sales_of_investments || 0),
      net_cash_flow_from_investing: row.net_cash_flow_from_investing,
      issuance_or_repayment_of_debt_securities: (row.debt_issuance || 0) + (row.debt_repayment || 0),
      issuance_or_purchase_of_equity_shares: (row.common_stock_issuance || 0) + (row.common_stock_repurchase || 0),
      dividends_and_other_cash_distributions: row.dividends_paid,
      net_cash_flow_from_financing: row.net_cash_flow_from_financing,
      change_in_cash_and_equivalents: row.change_in_cash_and_equivalents,
      effect_of_exchange_rate_changes: row.effect_of_exchange_rate_changes,
      ending_cash_balance: row.ending_cash_balance,
      free_cash_flow: row.free_cash_flow,
    }))

    return NextResponse.json({ cash_flow_statements: cashFlowStatements })
  } catch (error) {
    console.error('Cash flow statements API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
