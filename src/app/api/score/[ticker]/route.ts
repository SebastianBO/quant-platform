import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  calculateLicianScore,
  getSectorMedians,
  type IncomeStatement,
  type BalanceSheet,
  type CashFlowStatement,
  type FinancialMetrics,
  type PriceData,
  type AnalystRating
} from '@/lib/scoring'

/**
 * Lician Score API
 *
 * Calculates a comprehensive 1-10 rating for stocks based on:
 * - Value (P/E, P/B, P/S relative to sector)
 * - Growth (Revenue growth, EPS growth trajectory)
 * - Quality (ROE, profit margins, debt/equity)
 * - Momentum (Price trends, analyst revisions)
 * - Safety (Volatility, interest coverage, liquidity)
 *
 * GET /api/score/[ticker]
 *
 * Query Parameters:
 * - period: 'quarterly' | 'annual' (default: quarterly)
 * - includeFactors: 'true' | 'false' (default: true) - include detailed factor breakdown
 */

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

// Fetch income statements for a ticker
async function fetchIncomeStatements(
  ticker: string,
  period: string,
  limit: number = 8
): Promise<IncomeStatement[]> {
  const { data, error } = await getSupabase()
    .from('income_statements')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .eq('period', period)
    .order('report_period', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Income statements fetch error:', error)
    return []
  }

  return (data || []).map(row => ({
    ticker: row.ticker,
    report_period: row.report_period,
    fiscal_period: row.fiscal_period,
    period: row.period,
    currency: row.currency,
    revenue: row.revenue,
    cost_of_revenue: row.cost_of_revenue,
    gross_profit: row.gross_profit,
    operating_expense: row.operating_expense,
    operating_income: row.operating_income,
    interest_expense: row.interest_expense,
    ebit: row.ebit,
    net_income: row.net_income,
    earnings_per_share: row.earnings_per_share,
    earnings_per_share_diluted: row.earnings_per_share_diluted
  }))
}

// Fetch balance sheets for a ticker
async function fetchBalanceSheets(
  ticker: string,
  period: string,
  limit: number = 8
): Promise<BalanceSheet[]> {
  const { data, error } = await getSupabase()
    .from('balance_sheets')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .eq('period', period)
    .order('report_period', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Balance sheets fetch error:', error)
    return []
  }

  return (data || []).map(row => ({
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
    total_debt: row.total_debt,
    current_debt: row.current_debt,
    non_current_debt: row.long_term_debt,
    shareholders_equity: row.shareholders_equity,
    retained_earnings: row.retained_earnings
  }))
}

// Fetch cash flow statements for a ticker
async function fetchCashFlowStatements(
  ticker: string,
  period: string,
  limit: number = 8
): Promise<CashFlowStatement[]> {
  const { data, error } = await getSupabase()
    .from('cash_flow_statements')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .eq('period', period)
    .order('report_period', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Cash flow statements fetch error:', error)
    return []
  }

  return (data || []).map(row => ({
    ticker: row.ticker,
    report_period: row.report_period,
    fiscal_period: row.fiscal_period,
    period: row.period,
    net_cash_flow_from_operations: row.net_cash_flow_from_operations,
    capital_expenditure: row.capital_expenditure,
    free_cash_flow: row.free_cash_flow
  }))
}

// Fetch financial metrics for a ticker
async function fetchFinancialMetrics(
  ticker: string,
  period: string
): Promise<FinancialMetrics | null> {
  const { data, error } = await getSupabase()
    .from('financial_metrics')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .eq('period', period)
    .order('report_period', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Financial metrics fetch error:', error)
    return null
  }

  if (!data) return null

  return {
    ticker: data.ticker,
    report_period: data.report_period,
    period: data.period,
    market_cap: data.market_cap,
    enterprise_value: data.enterprise_value,
    price_to_earnings_ratio: data.price_to_earnings_ratio,
    price_to_book_ratio: data.price_to_book_ratio,
    price_to_sales_ratio: data.price_to_sales_ratio,
    enterprise_value_to_ebitda_ratio: data.enterprise_value_to_ebitda_ratio,
    peg_ratio: data.peg_ratio,
    gross_margin: data.gross_margin,
    operating_margin: data.operating_margin,
    net_margin: data.net_margin,
    return_on_equity: data.return_on_equity,
    return_on_assets: data.return_on_assets,
    return_on_invested_capital: data.return_on_invested_capital,
    revenue_growth: data.revenue_growth,
    earnings_growth: data.earnings_growth,
    earnings_per_share_growth: data.earnings_per_share_growth,
    free_cash_flow_growth: data.free_cash_flow_growth,
    debt_to_equity: data.debt_to_equity,
    debt_to_assets: data.debt_to_assets,
    interest_coverage: data.interest_coverage,
    current_ratio: data.current_ratio,
    quick_ratio: data.quick_ratio
  }
}

// Fetch stock prices for a ticker
async function fetchPrices(
  ticker: string,
  limit: number = 250
): Promise<PriceData[]> {
  const { data, error } = await getSupabase()
    .from('stock_prices')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Prices fetch error:', error)
    return []
  }

  return (data || []).map(row => ({
    ticker: row.ticker,
    date: row.date,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
    adj_close: row.adj_close
  }))
}

// Fetch analyst ratings for a ticker
async function fetchAnalystRatings(
  ticker: string,
  daysBack: number = 180
): Promise<AnalystRating[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

  const { data, error } = await getSupabase()
    .from('analyst_ratings')
    .select('ticker, rating, rating_prior, action, price_target, price_target_prior, rating_date')
    .eq('ticker', ticker.toUpperCase())
    .gte('rating_date', cutoffDate.toISOString().split('T')[0])
    .order('rating_date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Analyst ratings fetch error:', error)
    return []
  }

  return (data || []).map(row => ({
    ticker: row.ticker,
    rating: row.rating,
    rating_prior: row.rating_prior,
    action: row.action,
    price_target: row.price_target,
    price_target_prior: row.price_target_prior,
    rating_date: row.rating_date
  }))
}

// Fetch company sector for sector-specific medians
async function fetchCompanySector(ticker: string): Promise<string | null> {
  // Try companies table first
  const { data, error } = await getSupabase()
    .from('companies')
    .select('sic_description')
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (!error && data?.sic_description) {
    return data.sic_description
  }

  // Try company_fundamentals as fallback
  const { data: fundamentals } = await getSupabase()
    .from('company_fundamentals')
    .select('sector')
    .eq('ticker', ticker.toUpperCase())
    .single()

  return fundamentals?.sector || null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params

  if (!ticker || ticker.length > 10) {
    return NextResponse.json({
      error: 'Invalid ticker parameter'
    }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || 'quarterly'
  const includeFactors = searchParams.get('includeFactors') !== 'false'

  try {
    // Fetch all data in parallel for efficiency
    const [
      incomeStatements,
      balanceSheets,
      cashFlowStatements,
      metrics,
      prices,
      analystRatings,
      sector
    ] = await Promise.all([
      fetchIncomeStatements(ticker, period),
      fetchBalanceSheets(ticker, period),
      fetchCashFlowStatements(ticker, period),
      fetchFinancialMetrics(ticker, period),
      fetchPrices(ticker),
      fetchAnalystRatings(ticker),
      fetchCompanySector(ticker)
    ])

    // Check if we have any data at all
    const hasAnyData = incomeStatements.length > 0 ||
                       balanceSheets.length > 0 ||
                       metrics !== null ||
                       prices.length > 0

    if (!hasAnyData) {
      return NextResponse.json({
        error: 'No financial data found for ticker',
        ticker: ticker.toUpperCase(),
        suggestion: 'This ticker may not exist or may not have financial data available'
      }, { status: 404 })
    }

    // Get sector-specific medians
    const sectorMedians = getSectorMedians(sector)

    // Calculate the Lician Score
    const score = calculateLicianScore(
      ticker,
      incomeStatements,
      balanceSheets,
      cashFlowStatements,
      metrics,
      prices,
      analystRatings,
      sectorMedians
    )

    // Build response
    const response: Record<string, unknown> = {
      ticker: score.ticker,
      licianScore: score.overallScore,
      confidence: Math.round(score.confidence * 100),
      summary: score.summary,
      calculatedAt: score.calculatedAt,
      dimensions: {
        value: {
          score: score.dimensions.value.score,
          weight: Math.round(score.dimensions.value.weight * 100),
          confidence: Math.round(score.dimensions.value.confidence * 100),
          explanation: score.dimensions.value.explanation,
          ...(includeFactors && { factors: score.dimensions.value.factors })
        },
        growth: {
          score: score.dimensions.growth.score,
          weight: Math.round(score.dimensions.growth.weight * 100),
          confidence: Math.round(score.dimensions.growth.confidence * 100),
          explanation: score.dimensions.growth.explanation,
          ...(includeFactors && { factors: score.dimensions.growth.factors })
        },
        quality: {
          score: score.dimensions.quality.score,
          weight: Math.round(score.dimensions.quality.weight * 100),
          confidence: Math.round(score.dimensions.quality.confidence * 100),
          explanation: score.dimensions.quality.explanation,
          ...(includeFactors && { factors: score.dimensions.quality.factors })
        },
        momentum: {
          score: score.dimensions.momentum.score,
          weight: Math.round(score.dimensions.momentum.weight * 100),
          confidence: Math.round(score.dimensions.momentum.confidence * 100),
          explanation: score.dimensions.momentum.explanation,
          ...(includeFactors && { factors: score.dimensions.momentum.factors })
        },
        safety: {
          score: score.dimensions.safety.score,
          weight: Math.round(score.dimensions.safety.weight * 100),
          confidence: Math.round(score.dimensions.safety.confidence * 100),
          explanation: score.dimensions.safety.explanation,
          ...(includeFactors && { factors: score.dimensions.safety.factors })
        }
      },
      dataQuality: score.dataQuality,
      _meta: {
        sector: sector || 'Unknown',
        period,
        source: 'supabase',
        version: '1.0.0'
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Lician Score API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
