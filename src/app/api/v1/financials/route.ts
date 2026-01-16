import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials
// Returns all three financial statements in one call

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
  const cik = searchParams.get('cik')
  const period = searchParams.get('period') || 'quarterly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 100)

  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    const filterColumn = ticker ? 'ticker' : 'cik'
    const filterValue = ticker ? ticker.toUpperCase() : cik

    // Fetch all three statement types in parallel
    const [incomeResult, balanceResult, cashFlowResult] = await Promise.all([
      getSupabase()
        .from('income_statements')
        .select('*')
        .eq(filterColumn, filterValue)
        .eq('period', period)
        .order('report_period', { ascending: false })
        .limit(limit),
      getSupabase()
        .from('balance_sheets')
        .select('*')
        .eq(filterColumn, filterValue)
        .eq('period', period)
        .order('report_period', { ascending: false })
        .limit(limit),
      getSupabase()
        .from('cash_flow_statements')
        .select('*')
        .eq(filterColumn, filterValue)
        .eq('period', period)
        .order('report_period', { ascending: false })
        .limit(limit),
    ])

    if (incomeResult.error || balanceResult.error || cashFlowResult.error) {
      logger.error('Financials query error', {
        income: incomeResult.error?.message,
        balance: balanceResult.error?.message,
        cashFlow: cashFlowResult.error?.message,
      })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const incomeStatements = (incomeResult.data || []).map(row => ({
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
      net_income: row.net_income,
      earnings_per_share: row.earnings_per_share,
      earnings_per_share_diluted: row.earnings_per_share_diluted,
      weighted_average_shares: row.weighted_average_shares,
      weighted_average_shares_diluted: row.weighted_average_shares_diluted,
    }))

    const balanceSheets = (balanceResult.data || []).map(row => ({
      ticker: row.ticker,
      report_period: row.report_period,
      fiscal_period: row.fiscal_period,
      period: row.period,
      currency: row.currency,
      total_assets: row.total_assets,
      current_assets: row.current_assets,
      cash_and_equivalents: row.cash_and_equivalents,
      total_liabilities: row.total_liabilities,
      current_liabilities: row.current_liabilities,
      shareholders_equity: row.shareholders_equity,
      total_debt: row.total_debt,
      outstanding_shares: row.outstanding_shares,
    }))

    const cashFlowStatements = (cashFlowResult.data || []).map(row => ({
      ticker: row.ticker,
      report_period: row.report_period,
      fiscal_period: row.fiscal_period,
      period: row.period,
      currency: row.currency,
      net_cash_flow_from_operations: row.net_cash_flow_from_operations,
      net_cash_flow_from_investing: row.net_cash_flow_from_investing,
      net_cash_flow_from_financing: row.net_cash_flow_from_financing,
      free_cash_flow: row.free_cash_flow,
      ending_cash_balance: row.ending_cash_balance,
    }))

    return NextResponse.json({
      income_statements: incomeStatements,
      balance_sheets: balanceSheets,
      cash_flow_statements: cashFlowStatements,
    })
  } catch (error) {
    logger.error('Financials API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
