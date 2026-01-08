import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/balance-sheets
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
    const url = `https://api.financialdatasets.ai/financials/balance-sheets?ticker=${ticker}&period=${period}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    const sheets = data.balance_sheets || []

    // Auto-cache: Store fetched data in Supabase for future requests
    if (sheets.length > 0) {
      cacheBalanceSheets(sheets, ticker).catch(err =>
        console.error('Failed to cache balance sheets:', err)
      )
    }

    return sheets
  } catch (error) {
    console.error('Financial Datasets API error:', error)
    return null
  }
}

// Cache fetched data in Supabase (fire and forget)
async function cacheBalanceSheets(sheets: any[], ticker: string) {
  const records = sheets.map(s => ({
    ticker: ticker.toUpperCase(),
    cik: s.cik || null,
    report_period: s.report_period,
    fiscal_period: s.fiscal_period,
    period: s.period,
    currency: s.currency || 'USD',
    total_assets: s.total_assets,
    current_assets: s.current_assets,
    cash_and_equivalents: s.cash_and_equivalents,
    short_term_investments: s.current_investments,
    accounts_receivable: s.trade_and_non_trade_receivables,
    inventory: s.inventory,
    non_current_assets: s.non_current_assets,
    property_plant_and_equipment: s.property_plant_and_equipment,
    goodwill: s.goodwill,
    intangible_assets: s.intangible_assets,
    investments: s.investments || s.non_current_investments,
    tax_assets: s.tax_assets,
    total_liabilities: s.total_liabilities,
    current_liabilities: s.current_liabilities,
    current_debt: s.current_debt,
    accounts_payable: s.trade_and_non_trade_payables,
    deferred_revenue: s.deferred_revenue,
    deposit_liabilities: s.deposit_liabilities,
    non_current_liabilities: s.non_current_liabilities,
    long_term_debt: s.non_current_debt,
    tax_liabilities: s.tax_liabilities,
    shareholders_equity: s.shareholders_equity,
    retained_earnings: s.retained_earnings,
    accumulated_other_comprehensive_income: s.accumulated_other_comprehensive_income,
    total_debt: s.total_debt,
    outstanding_shares: s.outstanding_shares,
    source: 'FINANCIAL_DATASETS',
    updated_at: new Date().toISOString(),
  }))

  await getSupabase()
    .from('balance_sheets')
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

    // Check if we have local data
    let balanceSheets: unknown[] = []
    let dataSource = 'supabase'
    let dataTimestamp = new Date().toISOString()

    if (data && data.length > 0) {
      // Use Supabase data
      balanceSheets = data.map(row => ({
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
      dataTimestamp = data[0]?.updated_at || dataTimestamp
    } else if (ticker) {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), period, limit)
      if (fallbackData && fallbackData.length > 0) {
        balanceSheets = fallbackData
        dataSource = 'financialdatasets.ai'
        dataTimestamp = new Date().toISOString()
      }
    }

    return NextResponse.json({
      balance_sheets: balanceSheets,
      _meta: {
        source: dataSource,
        fetched_at: dataTimestamp,
        count: balanceSheets.length,
      }
    })
  } catch (error) {
    console.error('Balance sheets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
