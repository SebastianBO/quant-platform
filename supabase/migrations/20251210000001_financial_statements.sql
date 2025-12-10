-- Financial Statements Database Schema
-- Replicating Financial Datasets API - Income Statements, Balance Sheets, Cash Flow
-- Data sourced from SEC EDGAR XBRL filings
-- Migration: 20251210000001_financial_statements.sql

-- Drop existing tables if they exist (from previous incomplete migrations)
DROP TABLE IF EXISTS income_statements CASCADE;
DROP TABLE IF EXISTS balance_sheets CASCADE;
DROP TABLE IF EXISTS cash_flow_statements CASCADE;
DROP TABLE IF EXISTS financial_metrics CASCADE;
DROP TABLE IF EXISTS xbrl_facts CASCADE;
DROP TABLE IF EXISTS segmented_revenues CASCADE;
DROP TABLE IF EXISTS financial_sync_log CASCADE;

-- ============================================================================
-- 1. COMPANIES TABLE - Core company metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL UNIQUE,
  ticker VARCHAR(20),
  name VARCHAR(500) NOT NULL,

  -- Company info
  sic_code VARCHAR(10),
  sic_description VARCHAR(200),
  exchange VARCHAR(20),

  -- Fiscal year info
  fiscal_year_end VARCHAR(10), -- MM-DD format

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_cik ON companies(cik);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);

-- ============================================================================
-- 2. INCOME STATEMENTS TABLE
-- ============================================================================
CREATE TABLE income_statements (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Period info
  report_period DATE NOT NULL,
  fiscal_period VARCHAR(10), -- Q1, Q2, Q3, Q4, FY
  period VARCHAR(20) NOT NULL, -- annual, quarterly, ttm
  currency VARCHAR(10) DEFAULT 'USD',

  -- Revenue & Gross Profit
  revenue BIGINT,
  cost_of_revenue BIGINT,
  gross_profit BIGINT,

  -- Operating Expenses
  operating_expense BIGINT,
  selling_general_and_administrative_expenses BIGINT,
  research_and_development BIGINT,
  depreciation_and_amortization BIGINT,

  -- Operating Income
  operating_income BIGINT,

  -- Non-Operating
  interest_expense BIGINT,
  interest_income BIGINT,
  other_income_expense BIGINT,

  -- Pre-Tax Income
  ebit BIGINT,
  ebitda BIGINT,
  income_before_tax BIGINT,
  income_tax_expense BIGINT,

  -- Net Income
  net_income_discontinued_operations BIGINT,
  net_income_non_controlling_interests BIGINT,
  net_income BIGINT,
  net_income_common_stock BIGINT,
  preferred_dividends_impact BIGINT,
  consolidated_income BIGINT,

  -- Per Share
  earnings_per_share NUMERIC(20, 4),
  earnings_per_share_diluted NUMERIC(20, 4),
  dividends_per_common_share NUMERIC(20, 4),
  weighted_average_shares BIGINT,
  weighted_average_shares_diluted BIGINT,

  -- Source tracking
  accession_number VARCHAR(25),
  filing_date DATE,
  source VARCHAR(20) DEFAULT 'SEC_EDGAR',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(cik, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_income_ticker ON income_statements(ticker);
CREATE INDEX IF NOT EXISTS idx_income_cik ON income_statements(cik);
CREATE INDEX IF NOT EXISTS idx_income_report_period ON income_statements(report_period DESC);
CREATE INDEX IF NOT EXISTS idx_income_ticker_period ON income_statements(ticker, report_period DESC);
CREATE INDEX IF NOT EXISTS idx_income_period_type ON income_statements(period);

-- ============================================================================
-- 3. BALANCE SHEETS TABLE
-- ============================================================================
CREATE TABLE balance_sheets (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Period info
  report_period DATE NOT NULL,
  fiscal_period VARCHAR(10),
  period VARCHAR(20) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Assets
  total_assets BIGINT,
  current_assets BIGINT,
  cash_and_equivalents BIGINT,
  short_term_investments BIGINT,
  inventory BIGINT,
  current_investments BIGINT,
  trade_and_non_trade_receivables BIGINT,
  accounts_receivable BIGINT,
  prepaid_expenses BIGINT,
  other_current_assets BIGINT,

  -- Non-Current Assets
  non_current_assets BIGINT,
  property_plant_and_equipment BIGINT,
  accumulated_depreciation BIGINT,
  goodwill BIGINT,
  intangible_assets BIGINT,
  goodwill_and_intangible_assets BIGINT,
  investments BIGINT,
  non_current_investments BIGINT,
  tax_assets BIGINT,
  other_non_current_assets BIGINT,

  -- Liabilities
  total_liabilities BIGINT,
  current_liabilities BIGINT,
  accounts_payable BIGINT,
  trade_and_non_trade_payables BIGINT,
  current_debt BIGINT,
  short_term_debt BIGINT,
  deferred_revenue BIGINT,
  accrued_expenses BIGINT,
  other_current_liabilities BIGINT,
  deposit_liabilities BIGINT,

  -- Non-Current Liabilities
  non_current_liabilities BIGINT,
  long_term_debt BIGINT,
  non_current_debt BIGINT,
  deferred_tax_liabilities BIGINT,
  tax_liabilities BIGINT,
  other_non_current_liabilities BIGINT,

  -- Total Debt
  total_debt BIGINT,

  -- Shareholders Equity
  shareholders_equity BIGINT,
  common_stock BIGINT,
  preferred_stock BIGINT,
  additional_paid_in_capital BIGINT,
  retained_earnings BIGINT,
  treasury_stock BIGINT,
  accumulated_other_comprehensive_income BIGINT,
  minority_interest BIGINT,
  total_equity BIGINT,

  -- Shares
  outstanding_shares BIGINT,

  -- Source tracking
  accession_number VARCHAR(25),
  filing_date DATE,
  source VARCHAR(20) DEFAULT 'SEC_EDGAR',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cik, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_balance_ticker ON balance_sheets(ticker);
CREATE INDEX IF NOT EXISTS idx_balance_cik ON balance_sheets(cik);
CREATE INDEX IF NOT EXISTS idx_balance_report_period ON balance_sheets(report_period DESC);
CREATE INDEX IF NOT EXISTS idx_balance_ticker_period ON balance_sheets(ticker, report_period DESC);

-- ============================================================================
-- 4. CASH FLOW STATEMENTS TABLE
-- ============================================================================
CREATE TABLE cash_flow_statements (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Period info
  report_period DATE NOT NULL,
  fiscal_period VARCHAR(10),
  period VARCHAR(20) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Operating Activities
  net_income BIGINT,
  depreciation_and_amortization BIGINT,
  share_based_compensation BIGINT,
  deferred_income_tax BIGINT,
  change_in_working_capital BIGINT,
  change_in_receivables BIGINT,
  change_in_inventory BIGINT,
  change_in_payables BIGINT,
  other_operating_activities BIGINT,
  net_cash_flow_from_operations BIGINT,

  -- Investing Activities
  capital_expenditure BIGINT,
  acquisitions BIGINT,
  business_acquisitions_and_disposals BIGINT,
  investment_acquisitions_and_disposals BIGINT,
  purchases_of_investments BIGINT,
  sales_of_investments BIGINT,
  other_investing_activities BIGINT,
  net_cash_flow_from_investing BIGINT,

  -- Financing Activities
  debt_issuance BIGINT,
  debt_repayment BIGINT,
  issuance_or_repayment_of_debt_securities BIGINT,
  common_stock_issuance BIGINT,
  common_stock_repurchase BIGINT,
  issuance_or_purchase_of_equity_shares BIGINT,
  dividends_paid BIGINT,
  dividends_and_other_cash_distributions BIGINT,
  other_financing_activities BIGINT,
  net_cash_flow_from_financing BIGINT,

  -- Net Change
  effect_of_exchange_rate_changes BIGINT,
  change_in_cash_and_equivalents BIGINT,
  beginning_cash_balance BIGINT,
  ending_cash_balance BIGINT,

  -- Key Metrics
  free_cash_flow BIGINT,

  -- Source tracking
  accession_number VARCHAR(25),
  filing_date DATE,
  source VARCHAR(20) DEFAULT 'SEC_EDGAR',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cik, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_cashflow_ticker ON cash_flow_statements(ticker);
CREATE INDEX IF NOT EXISTS idx_cashflow_cik ON cash_flow_statements(cik);
CREATE INDEX IF NOT EXISTS idx_cashflow_report_period ON cash_flow_statements(report_period DESC);
CREATE INDEX IF NOT EXISTS idx_cashflow_ticker_period ON cash_flow_statements(ticker, report_period DESC);

-- ============================================================================
-- 5. FINANCIAL METRICS TABLE (Matches Financial Datasets API - 44 fields)
-- ============================================================================
CREATE TABLE financial_metrics (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Period info (5 fields: ticker, report_period, fiscal_period, period, currency)
  report_period DATE NOT NULL,
  fiscal_period VARCHAR(10), -- Q1, Q2, Q3, Q4, FY
  period VARCHAR(20) NOT NULL, -- annual, quarterly, ttm
  currency VARCHAR(10) DEFAULT 'USD',

  -- Valuation (9 fields)
  market_cap BIGINT,
  enterprise_value BIGINT,
  price_to_earnings_ratio NUMERIC(20, 4),
  price_to_book_ratio NUMERIC(20, 4),
  price_to_sales_ratio NUMERIC(20, 4),
  enterprise_value_to_ebitda_ratio NUMERIC(20, 4),
  enterprise_value_to_revenue_ratio NUMERIC(20, 4),
  free_cash_flow_yield NUMERIC(20, 4),
  peg_ratio NUMERIC(20, 4),

  -- Profitability (6 fields)
  gross_margin NUMERIC(10, 4),
  operating_margin NUMERIC(10, 4),
  net_margin NUMERIC(10, 4),
  return_on_equity NUMERIC(10, 4),
  return_on_assets NUMERIC(10, 4),
  return_on_invested_capital NUMERIC(10, 4),

  -- Efficiency (6 fields)
  asset_turnover NUMERIC(10, 4),
  inventory_turnover NUMERIC(10, 4),
  receivables_turnover NUMERIC(10, 4),
  days_sales_outstanding NUMERIC(10, 2),
  operating_cycle NUMERIC(10, 2),
  working_capital_turnover NUMERIC(10, 4),

  -- Liquidity (4 fields)
  current_ratio NUMERIC(10, 4),
  quick_ratio NUMERIC(10, 4),
  cash_ratio NUMERIC(10, 4),
  operating_cash_flow_ratio NUMERIC(10, 4),

  -- Leverage (3 fields)
  debt_to_equity NUMERIC(10, 4),
  debt_to_assets NUMERIC(10, 4),
  interest_coverage NUMERIC(10, 4),

  -- Growth (7 fields)
  revenue_growth NUMERIC(10, 4),
  earnings_growth NUMERIC(10, 4),
  book_value_growth NUMERIC(10, 4),
  earnings_per_share_growth NUMERIC(10, 4),
  free_cash_flow_growth NUMERIC(10, 4),
  operating_income_growth NUMERIC(10, 4),
  ebitda_growth NUMERIC(10, 4),

  -- Per Share (4 fields)
  payout_ratio NUMERIC(10, 4),
  earnings_per_share NUMERIC(20, 4),
  book_value_per_share NUMERIC(20, 4),
  free_cash_flow_per_share NUMERIC(20, 4),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cik, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_metrics_ticker ON financial_metrics(ticker);
CREATE INDEX IF NOT EXISTS idx_metrics_cik ON financial_metrics(cik);
CREATE INDEX IF NOT EXISTS idx_metrics_report_period ON financial_metrics(report_period DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_ticker_period ON financial_metrics(ticker, report_period DESC);

-- ============================================================================
-- 6. XBRL FACTS TABLE - Raw SEC XBRL data
-- ============================================================================
CREATE TABLE xbrl_facts (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,

  -- Fact identification
  taxonomy VARCHAR(50) NOT NULL, -- us-gaap, ifrs-full, dei, etc.
  concept VARCHAR(200) NOT NULL, -- Revenue, Assets, etc.

  -- Value
  value NUMERIC(30, 4),
  unit VARCHAR(20), -- USD, shares, pure

  -- Context
  start_date DATE,
  end_date DATE NOT NULL,
  instant BOOLEAN DEFAULT FALSE,

  -- Dimensions (for segment data)
  dimensions JSONB,

  -- Filing info
  accession_number VARCHAR(25) NOT NULL,
  filing_date DATE,
  form VARCHAR(20),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- No unique constraint here - handle duplicates in application layer
  -- due to dimensions being nullable JSONB
  CONSTRAINT xbrl_facts_unique UNIQUE(cik, taxonomy, concept, end_date, accession_number)
);

CREATE INDEX IF NOT EXISTS idx_xbrl_cik ON xbrl_facts(cik);
CREATE INDEX IF NOT EXISTS idx_xbrl_concept ON xbrl_facts(concept);
CREATE INDEX IF NOT EXISTS idx_xbrl_end_date ON xbrl_facts(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_xbrl_cik_concept ON xbrl_facts(cik, concept, end_date DESC);

-- ============================================================================
-- 7. SEGMENTED REVENUES TABLE
-- ============================================================================
CREATE TABLE segmented_revenues (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Period info
  report_period DATE NOT NULL,
  period VARCHAR(20) NOT NULL,

  -- Segment info
  segment_type VARCHAR(50) NOT NULL, -- 'business', 'geographic', 'product'
  segment_name VARCHAR(200) NOT NULL,

  -- Values
  revenue BIGINT,
  revenue_percent NUMERIC(10, 4), -- Percentage of total

  -- Source tracking
  accession_number VARCHAR(25),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cik, report_period, period, segment_type, segment_name)
);

CREATE INDEX IF NOT EXISTS idx_segments_ticker ON segmented_revenues(ticker);
CREATE INDEX IF NOT EXISTS idx_segments_cik ON segmented_revenues(cik);
CREATE INDEX IF NOT EXISTS idx_segments_report_period ON segmented_revenues(report_period DESC);

-- ============================================================================
-- 8. FINANCIAL SYNC LOG
-- ============================================================================
CREATE TABLE financial_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- FULL_SYNC, TICKER, DAILY_UPDATE

  -- Target
  cik VARCHAR(10),
  ticker VARCHAR(20),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'RUNNING',

  -- Stats
  filings_processed INT DEFAULT 0,
  statements_created INT DEFAULT 0,
  metrics_calculated INT DEFAULT 0,

  -- Errors
  error_count INT DEFAULT 0,
  error_message TEXT,

  -- Parameters
  parameters JSONB
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE income_statements IS 'SEC EDGAR income statement data - Financial Datasets compatible';
COMMENT ON TABLE balance_sheets IS 'SEC EDGAR balance sheet data - Financial Datasets compatible';
COMMENT ON TABLE cash_flow_statements IS 'SEC EDGAR cash flow statement data - Financial Datasets compatible';
COMMENT ON TABLE financial_metrics IS 'Calculated financial metrics from statements';
COMMENT ON TABLE xbrl_facts IS 'Raw XBRL facts from SEC filings for detailed analysis';
