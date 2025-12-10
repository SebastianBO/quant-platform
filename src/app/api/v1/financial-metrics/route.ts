import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financial-metrics

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
    let query = getSupabase()
      .from('financial_metrics')
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

    const { data, error } = await query

    if (error) {
      console.error('Financial metrics query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format - exact 44 fields
    const metrics = (data || []).map(row => ({
      // Identity (5 fields)
      ticker: row.ticker,
      report_period: row.report_period,
      fiscal_period: row.fiscal_period,
      period: row.period,
      currency: row.currency,
      // Valuation (9 fields)
      market_cap: row.market_cap,
      enterprise_value: row.enterprise_value,
      price_to_earnings_ratio: row.price_to_earnings_ratio,
      price_to_book_ratio: row.price_to_book_ratio,
      price_to_sales_ratio: row.price_to_sales_ratio,
      enterprise_value_to_ebitda_ratio: row.enterprise_value_to_ebitda_ratio,
      enterprise_value_to_revenue_ratio: row.enterprise_value_to_revenue_ratio,
      free_cash_flow_yield: row.free_cash_flow_yield,
      peg_ratio: row.peg_ratio,
      // Profitability (6 fields)
      gross_margin: row.gross_margin,
      operating_margin: row.operating_margin,
      net_margin: row.net_margin,
      return_on_equity: row.return_on_equity,
      return_on_assets: row.return_on_assets,
      return_on_invested_capital: row.return_on_invested_capital,
      // Efficiency (6 fields)
      asset_turnover: row.asset_turnover,
      inventory_turnover: row.inventory_turnover,
      receivables_turnover: row.receivables_turnover,
      days_sales_outstanding: row.days_sales_outstanding,
      operating_cycle: row.operating_cycle,
      working_capital_turnover: row.working_capital_turnover,
      // Liquidity (4 fields)
      current_ratio: row.current_ratio,
      quick_ratio: row.quick_ratio,
      cash_ratio: row.cash_ratio,
      operating_cash_flow_ratio: row.operating_cash_flow_ratio,
      // Leverage (3 fields)
      debt_to_equity: row.debt_to_equity,
      debt_to_assets: row.debt_to_assets,
      interest_coverage: row.interest_coverage,
      // Growth (7 fields)
      revenue_growth: row.revenue_growth,
      earnings_growth: row.earnings_growth,
      book_value_growth: row.book_value_growth,
      earnings_per_share_growth: row.earnings_per_share_growth,
      free_cash_flow_growth: row.free_cash_flow_growth,
      operating_income_growth: row.operating_income_growth,
      ebitda_growth: row.ebitda_growth,
      // Per Share (4 fields)
      payout_ratio: row.payout_ratio,
      earnings_per_share: row.earnings_per_share,
      book_value_per_share: row.book_value_per_share,
      free_cash_flow_per_share: row.free_cash_flow_per_share,
    }))

    return NextResponse.json({ financial_metrics: metrics })
  } catch (error) {
    console.error('Financial metrics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
