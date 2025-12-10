import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/balance-sheets

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
      .from('balance_sheets')
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
      console.error('Balance sheets query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const balanceSheets = (data || []).map(row => ({
      ticker: row.ticker,
      report_period: row.report_period,
      fiscal_period: row.fiscal_period,
      period: row.period,
      currency: row.currency,
      total_assets: row.total_assets,
      current_assets: row.current_assets,
      cash_and_equivalents: row.cash_and_equivalents,
      inventory: row.inventory,
      current_investments: row.short_term_investments,
      trade_and_non_trade_receivables: row.accounts_receivable,
      non_current_assets: row.non_current_assets,
      property_plant_and_equipment: row.property_plant_and_equipment,
      goodwill_and_intangible_assets: (row.goodwill || 0) + (row.intangible_assets || 0),
      investments: row.investments,
      non_current_investments: row.investments,
      outstanding_shares: row.outstanding_shares,
      tax_assets: row.tax_assets,
      total_liabilities: row.total_liabilities,
      current_liabilities: row.current_liabilities,
      current_debt: row.current_debt,
      trade_and_non_trade_payables: row.accounts_payable,
      deferred_revenue: row.deferred_revenue,
      deposit_liabilities: row.deposit_liabilities,
      non_current_liabilities: row.non_current_liabilities,
      non_current_debt: row.long_term_debt,
      tax_liabilities: row.tax_liabilities,
      shareholders_equity: row.shareholders_equity,
      retained_earnings: row.retained_earnings,
      accumulated_other_comprehensive_income: row.accumulated_other_comprehensive_income,
      total_debt: row.total_debt,
    }))

    return NextResponse.json({ balance_sheets: balanceSheets })
  } catch (error) {
    console.error('Balance sheets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
