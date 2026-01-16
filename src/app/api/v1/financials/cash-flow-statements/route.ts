import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/cash-flow-statements
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
    const url = `https://api.financialdatasets.ai/financials/cash-flow-statements?ticker=${ticker}&period=${period}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    const statements = data.cash_flow_statements || []

    // Auto-cache: Store fetched data in Supabase for future requests
    if (statements.length > 0) {
      cacheCashFlowStatements(statements, ticker).catch(err =>
        logger.error('Failed to cache cash flow statements', { error: err instanceof Error ? err.message : 'Unknown' })
      )
    }

    return statements
  } catch (error) {
    logger.error('Financial Datasets API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Cache fetched data in Supabase (fire and forget)
async function cacheCashFlowStatements(statements: any[], ticker: string) {
  const records = statements.map(s => ({
    ticker: ticker.toUpperCase(),
    cik: s.cik || null,
    report_period: s.report_period,
    fiscal_period: s.fiscal_period,
    period: s.period,
    currency: s.currency || 'USD',
    net_income: s.net_income,
    depreciation_and_amortization: s.depreciation_and_amortization,
    share_based_compensation: s.share_based_compensation,
    net_cash_flow_from_operations: s.net_cash_flow_from_operations,
    capital_expenditure: s.capital_expenditure,
    acquisitions: s.business_acquisitions_and_disposals,
    purchases_of_investments: s.investment_acquisitions_and_disposals,
    net_cash_flow_from_investing: s.net_cash_flow_from_investing,
    debt_issuance: s.issuance_or_repayment_of_debt_securities,
    common_stock_issuance: s.issuance_or_purchase_of_equity_shares,
    dividends_paid: s.dividends_and_other_cash_distributions,
    net_cash_flow_from_financing: s.net_cash_flow_from_financing,
    change_in_cash_and_equivalents: s.change_in_cash_and_equivalents,
    effect_of_exchange_rate_changes: s.effect_of_exchange_rate_changes,
    ending_cash_balance: s.ending_cash_balance,
    free_cash_flow: s.free_cash_flow,
    source: 'FINANCIAL_DATASETS',
    updated_at: new Date().toISOString(),
  }))

  await getSupabase()
    .from('cash_flow_statements')
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
      logger.error('Cash flow statements query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Check if we have local data
    let cashFlowStatements: unknown[] = []
    let dataSource = 'supabase'
    let dataTimestamp = new Date().toISOString()

    if (data && data.length > 0) {
      // Use Supabase data
      cashFlowStatements = data.map(row => ({
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
      dataTimestamp = data[0]?.updated_at || dataTimestamp
    } else if (ticker) {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), period, limit)
      if (fallbackData && fallbackData.length > 0) {
        cashFlowStatements = fallbackData
        dataSource = 'financialdatasets.ai'
        dataTimestamp = new Date().toISOString()
      }
    }

    return NextResponse.json({
      cash_flow_statements: cashFlowStatements,
      _meta: {
        source: dataSource,
        fetched_at: dataTimestamp,
        count: cashFlowStatements.length,
      }
    })
  } catch (error) {
    logger.error('Cash flow statements API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
