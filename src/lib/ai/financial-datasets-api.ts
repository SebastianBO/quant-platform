/**
 * Financial Datasets API Client
 * https://api.financialdatasets.ai
 * Used as fallback when Supabase data is not available
 */

const BASE_URL = 'https://api.financialdatasets.ai'

async function fetchFromAPI<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T | null> {
  const apiKey = process.env.FINANCIAL_DATASETS_API_KEY
  if (!apiKey) {
    console.warn('FINANCIAL_DATASETS_API_KEY not configured')
    return null
  }

  // Build query string
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value))
    }
  })

  const url = `${BASE_URL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Financial Datasets API error:', error)
    return null
  }
}

// Types
export interface IncomeStatement {
  ticker: string
  report_period: string
  period: string
  revenue: number
  cost_of_revenue: number
  gross_profit: number
  operating_expenses: number
  operating_income: number
  net_income: number
  eps_basic: number
  eps_diluted: number
  shares_outstanding_basic: number
  shares_outstanding_diluted: number
}

export interface BalanceSheet {
  ticker: string
  report_period: string
  period: string
  total_assets: number
  total_liabilities: number
  total_equity: number
  cash_and_equivalents: number
  total_debt: number
  current_assets: number
  current_liabilities: number
}

export interface CashFlowStatement {
  ticker: string
  report_period: string
  period: string
  operating_cash_flow: number
  investing_cash_flow: number
  financing_cash_flow: number
  free_cash_flow: number
  capital_expenditure: number
}

export interface FinancialMetrics {
  ticker: string
  report_period: string
  pe_ratio: number
  pb_ratio: number
  ps_ratio: number
  ev_to_ebitda: number
  debt_to_equity: number
  current_ratio: number
  gross_margin: number
  operating_margin: number
  net_margin: number
  return_on_equity: number
  return_on_assets: number
  revenue_growth: number
  earnings_growth: number
}

export interface PriceSnapshot {
  ticker: string
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  time: string
}

export interface Filing {
  ticker: string
  cik: string
  form_type: string
  filed_date: string
  accepted_date: string
  period_of_report: string
  url: string
}

export interface InsiderTrade {
  ticker: string
  filing_date: string
  trade_date: string
  owner_name: string
  owner_title: string
  transaction_type: string
  shares: number
  price_per_share: number
  total_value: number
  shares_owned_following: number
}

export interface NewsArticle {
  ticker: string
  title: string
  author: string
  source: string
  summary: string
  url: string
  published_at: string
  sentiment: string
}

export interface SegmentedRevenue {
  ticker: string
  report_period: string
  segment_name: string
  revenue: number
  segment_type: string
}

export interface AnalystEstimate {
  ticker: string
  period_end: string
  estimate_type: string
  mean: number
  median: number
  high: number
  low: number
  num_analysts: number
}

// API Functions

export async function getIncomeStatements(
  ticker: string,
  period: 'annual' | 'quarterly' | 'ttm' = 'annual',
  limit = 10
): Promise<IncomeStatement[]> {
  const result = await fetchFromAPI<{ income_statements: IncomeStatement[] }>(
    `/financials/income-statements/`,
    { ticker, period, limit }
  )
  return result?.income_statements || []
}

export async function getBalanceSheets(
  ticker: string,
  period: 'annual' | 'quarterly' | 'ttm' = 'annual',
  limit = 10
): Promise<BalanceSheet[]> {
  const result = await fetchFromAPI<{ balance_sheets: BalanceSheet[] }>(
    `/financials/balance-sheets/`,
    { ticker, period, limit }
  )
  return result?.balance_sheets || []
}

export async function getCashFlowStatements(
  ticker: string,
  period: 'annual' | 'quarterly' | 'ttm' = 'annual',
  limit = 10
): Promise<CashFlowStatement[]> {
  const result = await fetchFromAPI<{ cash_flow_statements: CashFlowStatement[] }>(
    `/financials/cash-flow-statements/`,
    { ticker, period, limit }
  )
  return result?.cash_flow_statements || []
}

export async function getFinancialMetricsSnapshot(ticker: string): Promise<FinancialMetrics | null> {
  const result = await fetchFromAPI<{ financial_metrics: FinancialMetrics[] }>(
    `/financial-metrics/snapshot/`,
    { ticker }
  )
  return result?.financial_metrics?.[0] || null
}

export async function getFinancialMetrics(
  ticker: string,
  period: 'annual' | 'quarterly' | 'ttm' = 'annual',
  limit = 10
): Promise<FinancialMetrics[]> {
  const result = await fetchFromAPI<{ financial_metrics: FinancialMetrics[] }>(
    `/financial-metrics/`,
    { ticker, period, limit }
  )
  return result?.financial_metrics || []
}

export async function getPriceSnapshot(ticker: string): Promise<PriceSnapshot | null> {
  const result = await fetchFromAPI<{ prices: PriceSnapshot[] }>(
    `/prices/snapshot/`,
    { ticker }
  )
  return result?.prices?.[0] || null
}

export async function getPrices(
  ticker: string,
  startDate?: string,
  endDate?: string,
  limit = 100
): Promise<PriceSnapshot[]> {
  const params: Record<string, string | number | undefined> = { ticker, limit }
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  const result = await fetchFromAPI<{ prices: PriceSnapshot[] }>(`/prices/`, params)
  return result?.prices || []
}

export async function getFilings(
  ticker: string,
  formType?: string,
  limit = 10
): Promise<Filing[]> {
  const params: Record<string, string | number | undefined> = { ticker, limit }
  if (formType) params.form_type = formType

  const result = await fetchFromAPI<{ filings: Filing[] }>(`/filings/`, params)
  return result?.filings || []
}

export async function getInsiderTrades(ticker: string, limit = 50): Promise<InsiderTrade[]> {
  const result = await fetchFromAPI<{ insider_trades: InsiderTrade[] }>(
    `/insider-trades/`,
    { ticker, limit }
  )
  return result?.insider_trades || []
}

export async function getNews(ticker: string, limit = 10): Promise<NewsArticle[]> {
  const result = await fetchFromAPI<{ news: NewsArticle[] }>(
    `/news/`,
    { ticker, limit }
  )
  return result?.news || []
}

export async function getSegmentedRevenues(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual',
  limit = 10
): Promise<SegmentedRevenue[]> {
  const result = await fetchFromAPI<{ segmented_revenues: SegmentedRevenue[] }>(
    `/financials/segmented-revenues/`,
    { ticker, period, limit }
  )
  return result?.segmented_revenues || []
}

export async function getAnalystEstimates(ticker: string): Promise<AnalystEstimate[]> {
  const result = await fetchFromAPI<{ analyst_estimates: AnalystEstimate[] }>(
    `/analyst-estimates/`,
    { ticker }
  )
  return result?.analyst_estimates || []
}
