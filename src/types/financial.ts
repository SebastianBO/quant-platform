/**
 * Core financial data types for the quant platform
 * These interfaces reduce `any` usage and improve type safety across the codebase
 */

// ============================================
// Stock & Quote Types
// ============================================

export interface StockQuote {
  ticker: string
  name?: string
  price: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
  open?: number
  high?: number
  low?: number
  previousClose?: number
  timestamp?: string | Date
}

export interface StockInfo {
  ticker: string
  name: string
  exchange?: string
  sector?: string
  industry?: string
  description?: string
  website?: string
  website_url?: string
  employees?: number
  number_of_employees?: number
  country?: string
  location?: string
  cik?: string
  isin?: string
  listing_date?: string
  sic_industry?: string
}

// ============================================
// Financial Statement Types
// ============================================

export interface IncomeStatement {
  ticker?: string
  fiscal_year?: number
  fiscal_period?: string
  report_date?: string
  calendar_date?: string

  // Revenue
  revenue?: number
  cost_of_revenue?: number
  gross_profit?: number

  // Operating
  operating_expenses?: number
  operating_income?: number

  // Net Income
  ebit?: number
  ebitda?: number
  interest_expense?: number
  income_before_tax?: number
  income_tax_expense?: number
  net_income?: number

  // Per Share
  eps?: number
  eps_diluted?: number

  // Margins (calculated or provided)
  gross_margin?: number
  operating_margin?: number
  net_margin?: number
}

export interface BalanceSheet {
  ticker?: string
  fiscal_year?: number
  fiscal_period?: string
  report_date?: string
  calendar_date?: string

  // Assets
  total_assets?: number
  current_assets?: number
  cash_and_equivalents?: number
  short_term_investments?: number
  accounts_receivable?: number
  inventory?: number
  non_current_assets?: number
  property_plant_equipment?: number
  goodwill?: number
  intangible_assets?: number

  // Liabilities
  total_liabilities?: number
  current_liabilities?: number
  accounts_payable?: number
  short_term_debt?: number
  non_current_liabilities?: number
  long_term_debt?: number
  total_debt?: number

  // Equity
  total_equity?: number
  stockholders_equity?: number
  retained_earnings?: number

  // Ratios
  book_value_per_share?: number
}

export interface CashFlow {
  ticker?: string
  fiscal_year?: number
  fiscal_period?: string
  report_date?: string
  calendar_date?: string

  // Operating Activities
  net_income?: number
  depreciation_amortization?: number
  operating_cash_flow?: number

  // Investing Activities
  capital_expenditure?: number
  investing_cash_flow?: number

  // Financing Activities
  dividends_paid?: number
  share_repurchases?: number
  debt_repayment?: number
  financing_cash_flow?: number

  // Free Cash Flow
  free_cash_flow?: number

  // Net Change
  net_change_in_cash?: number
  beginning_cash?: number
  ending_cash?: number
}

// ============================================
// Institutional Ownership Types
// ============================================

export interface InstitutionalHolding {
  ticker?: string
  holder?: string
  holder_name?: string
  holder_type?: 'Institution' | 'Mutual Fund' | 'Hedge Fund' | 'Pension Fund' | 'Other'

  shares: number
  value?: number
  market_value?: number

  percent_of_portfolio?: number
  percent_of_outstanding?: number
  portfolio_percent?: number

  change_in_shares?: number
  change_percent?: number

  is_new_position?: boolean
  is_new?: boolean
  isNew?: boolean

  report_date?: string
  filing_date?: string

  // Calculated fields
  portfolioPercent?: number
  percentOfCompany?: number
  changeInShares?: number
}

export interface InstitutionalOwnershipSummary {
  investor: string
  investorType: string
  source: string
  summary: {
    totalAUM: number
    totalPositions: number
    increasedPositions: number
    decreasedPositions: number
    newPositions: number
    reportDate: string | null
  }
  holdings: InstitutionalHolding[]
}

// ============================================
// Insider Trading Types
// ============================================

export interface InsiderTrade {
  ticker?: string

  // Person info
  insider_name?: string
  name?: string
  insider_title?: string
  title?: string
  relationship?: string

  // Transaction details
  transaction_type?: string
  type?: string
  shares?: number
  shares_traded?: number
  transaction_shares?: number // Alternative field name from some APIs
  price?: number
  price_per_share?: number
  value?: number
  total_value?: number

  // Post-transaction
  shares_owned_after?: number
  shares_owned?: number

  // Dates
  transaction_date?: string
  trade_date?: string
  filing_date?: string

  // Filing info
  form_type?: string
  sec_form_4?: string
}

// ============================================
// Analyst Estimates & Ratings
// ============================================

export interface AnalystEstimate {
  ticker?: string
  fiscal_year?: number
  fiscal_period?: string
  period?: string

  // EPS Estimates
  eps_estimate?: number
  eps_actual?: number
  eps_surprise?: number
  eps_surprise_percent?: number

  eps_low?: number
  eps_high?: number
  eps_avg?: number

  // Revenue Estimates
  revenue_estimate?: number
  revenue_actual?: number
  revenue_surprise?: number
  revenue_surprise_percent?: number

  revenue_low?: number
  revenue_high?: number
  revenue_avg?: number

  // Analyst count
  num_analysts?: number
  analyst_count?: number

  // Date
  report_date?: string
}

export interface AnalystRating {
  ticker?: string
  analyst?: string
  firm?: string

  rating?: string
  current_rating?: string
  previous_rating?: string

  price_target?: number
  current_price_target?: number
  previous_price_target?: number

  action?: string // 'upgrade' | 'downgrade' | 'maintain' | 'initiate'

  date?: string
  rating_date?: string
}

export interface AnalystConsensus {
  ticker?: string

  strong_buy?: number
  buy?: number
  hold?: number
  sell?: number
  strong_sell?: number

  consensus_rating?: string
  average_rating?: number

  price_target_avg?: number
  price_target_high?: number
  price_target_low?: number

  total_analysts?: number
}

// ============================================
// Business Segments
// ============================================

export interface BusinessSegment {
  name: string
  revenue?: number
  operating_income?: number
  gross_profit?: number
  percentage?: number
  growth?: number

  // Geographic or product breakdown
  type?: 'product' | 'geographic' | 'other'
  region?: string
}

// ============================================
// Options Data
// ============================================

export interface OptionsContract {
  ticker?: string
  contract_symbol?: string

  type: 'call' | 'put'
  strike: number
  expiration: string

  bid?: number
  ask?: number
  last?: number

  volume?: number
  open_interest?: number

  implied_volatility?: number
  delta?: number
  gamma?: number
  theta?: number
  vega?: number
  rho?: number
}

export interface OptionsChain {
  ticker: string
  underlying_price: number
  expiration_dates: string[]
  calls: OptionsContract[]
  puts: OptionsContract[]
}

// ============================================
// Short Interest
// ============================================

export interface ShortInterest {
  ticker?: string

  short_interest?: number
  shares_short?: number

  short_percent_of_float?: number
  short_ratio?: number
  days_to_cover?: number

  previous_short_interest?: number
  change_percent?: number

  settlement_date?: string
  report_date?: string
}

// ============================================
// Earnings Calendar
// ============================================

export interface EarningsEvent {
  ticker: string
  company_name?: string

  report_date: string
  fiscal_quarter?: string
  fiscal_year?: number

  time?: 'before_market' | 'after_market' | 'during_market' | string

  eps_estimate?: number
  revenue_estimate?: number

  eps_actual?: number
  revenue_actual?: number

  confirmed?: boolean
}

// ============================================
// Portfolio Types
// ============================================

export interface PortfolioHolding {
  id?: string
  portfolio_id: string
  user_id: string

  ticker?: string
  asset_identifier: string
  asset_type: string
  name: string

  quantity: number
  purchase_price?: number | null
  current_price?: number
  current_value?: number

  currency?: string
  isin?: string

  // Plaid integration
  plaid_holding_id?: string
  plaid_account_id?: string
  last_updated_from_plaid?: string

  // Tink integration
  tink_holding_id?: string
  last_updated_from_tink?: string

  created_at?: string
  updated_at?: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description?: string

  total_value?: number
  cash_balance?: number

  // Integration flags
  plaid_item_id?: string
  tink_connected?: boolean

  holdings?: PortfolioHolding[]

  created_at?: string
  updated_at?: string
}

// ============================================
// Market Data Types
// ============================================

export interface MarketMover {
  ticker: string
  name?: string
  price: number
  change: number
  changePercent: number
  volume?: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export interface MarketOverview {
  indices: MarketIndex[]
  gainers: MarketMover[]
  losers: MarketMover[]
  mostActive: MarketMover[]
  timestamp: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Utility Types
// ============================================

export type Ticker = string

export type Period = 'annual' | 'quarterly' | 'ttm'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK' | 'NOK' | 'DKK' | string

export interface DateRange {
  start: string | Date
  end: string | Date
}

// Type guards for runtime checking
export function isIncomeStatement(obj: unknown): obj is IncomeStatement {
  return typeof obj === 'object' && obj !== null && 'revenue' in obj
}

export function isBalanceSheet(obj: unknown): obj is BalanceSheet {
  return typeof obj === 'object' && obj !== null && 'total_assets' in obj
}

export function isCashFlow(obj: unknown): obj is CashFlow {
  return typeof obj === 'object' && obj !== null && 'operating_cash_flow' in obj
}

export function isInsiderTrade(obj: unknown): obj is InsiderTrade {
  return typeof obj === 'object' && obj !== null && ('insider_name' in obj || 'name' in obj)
}
