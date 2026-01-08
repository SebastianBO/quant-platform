-- European Companies Database Schema
-- Supports: Sweden, Norway, Denmark, Finland, UK, Germany, France, Netherlands, etc.
-- Reporting Standard: IFRS (International Financial Reporting Standards)
-- Migration: 20260108000002_eu_companies_schema.sql

-- ============================================================================
-- 1. EU COMPANIES TABLE - Core company metadata for European companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_companies (
  id BIGSERIAL PRIMARY KEY,

  -- Identifiers (varies by country)
  org_number VARCHAR(50) NOT NULL, -- Organization/registration number
  country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 (SE, NO, DK, FI, GB, DE, FR, NL, etc.)

  -- Company info
  name VARCHAR(500) NOT NULL,
  legal_name VARCHAR(500),
  trade_name VARCHAR(500), -- DBA / trading as
  legal_form VARCHAR(100), -- AB, AS, Ltd, GmbH, SARL, etc.

  -- Classification
  industry_code VARCHAR(20), -- SNI (SE), NACE (EU), SIC equivalent
  industry_description VARCHAR(500),
  sector VARCHAR(100),

  -- Location
  address_street VARCHAR(500),
  address_city VARCHAR(200),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(100),

  -- Contact
  website VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(200),

  -- Stock market info (if listed)
  ticker VARCHAR(20),
  exchange VARCHAR(50), -- OMX, LSE, XETRA, Euronext, etc.
  isin VARCHAR(20), -- International Securities Identification Number
  lei VARCHAR(25), -- Legal Entity Identifier

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_listed BOOLEAN DEFAULT FALSE,
  founded_year INTEGER,
  employees INTEGER,

  -- Financial summary (latest year)
  revenue_latest BIGINT,
  profit_latest BIGINT,
  total_assets_latest BIGINT,
  equity_latest BIGINT,
  fiscal_year_end VARCHAR(10), -- MM-DD format

  -- Tracking
  source VARCHAR(50), -- ALLABOLAG, PROFF, COMPANIES_HOUSE, etc.
  source_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: org_number + country
  UNIQUE(country_code, org_number)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_eu_companies_country ON eu_companies(country_code);
CREATE INDEX IF NOT EXISTS idx_eu_companies_ticker ON eu_companies(ticker) WHERE ticker IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eu_companies_isin ON eu_companies(isin) WHERE isin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eu_companies_name ON eu_companies(name);
CREATE INDEX IF NOT EXISTS idx_eu_companies_exchange ON eu_companies(exchange) WHERE exchange IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eu_companies_revenue ON eu_companies(revenue_latest DESC) WHERE revenue_latest IS NOT NULL;

-- ============================================================================
-- 2. EU INCOME STATEMENTS TABLE (IFRS format)
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_income_statements (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES eu_companies(id) ON DELETE CASCADE,
  org_number VARCHAR(50) NOT NULL,
  country_code VARCHAR(2) NOT NULL,

  -- Period info
  report_period DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fiscal_period VARCHAR(10), -- Q1, Q2, Q3, Q4, FY
  period VARCHAR(20) NOT NULL DEFAULT 'annual', -- annual, quarterly, semi-annual
  currency VARCHAR(10) DEFAULT 'EUR',

  -- IFRS Revenue Recognition
  revenue BIGINT, -- Total revenue
  cost_of_sales BIGINT, -- IFRS: Cost of sales
  gross_profit BIGINT,

  -- Operating Expenses (IFRS breakdown)
  distribution_costs BIGINT, -- Selling & distribution
  administrative_expenses BIGINT,
  research_and_development BIGINT,
  other_operating_income BIGINT,
  other_operating_expenses BIGINT,

  -- Operating Profit
  operating_profit BIGINT, -- EBIT

  -- Finance (IFRS terminology)
  finance_income BIGINT,
  finance_costs BIGINT,
  share_of_associates BIGINT, -- Share of profit from associates

  -- Profit Before Tax
  profit_before_tax BIGINT,
  income_tax_expense BIGINT,

  -- Net Profit
  profit_from_continuing_operations BIGINT,
  profit_from_discontinued_operations BIGINT,
  profit_for_the_year BIGINT, -- Net income

  -- Attribution
  profit_attributable_to_owners BIGINT,
  profit_attributable_to_nci BIGINT, -- Non-controlling interests

  -- Per Share (if available)
  basic_eps NUMERIC(20, 4),
  diluted_eps NUMERIC(20, 4),
  dividend_per_share NUMERIC(20, 4),

  -- Additional IFRS metrics
  ebitda BIGINT,
  depreciation_and_amortization BIGINT,

  -- Source tracking
  source VARCHAR(50) DEFAULT 'ALLABOLAG',
  filing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_number, country_code, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_eu_income_company_id ON eu_income_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_eu_income_org_number ON eu_income_statements(org_number, country_code);
CREATE INDEX IF NOT EXISTS idx_eu_income_report_period ON eu_income_statements(report_period DESC);
CREATE INDEX IF NOT EXISTS idx_eu_income_fiscal_year ON eu_income_statements(fiscal_year DESC);

-- ============================================================================
-- 3. EU BALANCE SHEETS TABLE (IFRS format)
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_balance_sheets (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES eu_companies(id) ON DELETE CASCADE,
  org_number VARCHAR(50) NOT NULL,
  country_code VARCHAR(2) NOT NULL,

  -- Period info
  report_period DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'annual',
  currency VARCHAR(10) DEFAULT 'EUR',

  -- NON-CURRENT ASSETS (IFRS)
  non_current_assets BIGINT,
  property_plant_equipment BIGINT,
  right_of_use_assets BIGINT, -- IFRS 16 Leases
  investment_property BIGINT,
  intangible_assets BIGINT,
  goodwill BIGINT,
  investments_in_associates BIGINT,
  other_financial_assets_non_current BIGINT,
  deferred_tax_assets BIGINT,
  other_non_current_assets BIGINT,

  -- CURRENT ASSETS (IFRS)
  current_assets BIGINT,
  inventories BIGINT,
  trade_receivables BIGINT,
  other_receivables BIGINT,
  prepayments BIGINT,
  contract_assets BIGINT, -- IFRS 15
  cash_and_cash_equivalents BIGINT,
  other_current_assets BIGINT,
  assets_held_for_sale BIGINT, -- IFRS 5

  -- TOTAL ASSETS
  total_assets BIGINT,

  -- EQUITY (IFRS)
  share_capital BIGINT,
  share_premium BIGINT,
  treasury_shares BIGINT,
  retained_earnings BIGINT,
  other_reserves BIGINT,
  translation_reserve BIGINT, -- Foreign currency translation
  equity_attributable_to_owners BIGINT,
  non_controlling_interests BIGINT,
  total_equity BIGINT,

  -- NON-CURRENT LIABILITIES (IFRS)
  non_current_liabilities BIGINT,
  borrowings_non_current BIGINT,
  lease_liabilities_non_current BIGINT, -- IFRS 16
  deferred_tax_liabilities BIGINT,
  provisions_non_current BIGINT,
  pension_obligations BIGINT,
  other_non_current_liabilities BIGINT,

  -- CURRENT LIABILITIES (IFRS)
  current_liabilities BIGINT,
  trade_payables BIGINT,
  borrowings_current BIGINT,
  lease_liabilities_current BIGINT, -- IFRS 16
  current_tax_liabilities BIGINT,
  provisions_current BIGINT,
  contract_liabilities BIGINT, -- IFRS 15
  other_current_liabilities BIGINT,
  liabilities_held_for_sale BIGINT, -- IFRS 5

  -- TOTAL LIABILITIES
  total_liabilities BIGINT,

  -- Shares info
  shares_outstanding BIGINT,

  -- Source tracking
  source VARCHAR(50) DEFAULT 'ALLABOLAG',
  filing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_number, country_code, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_eu_balance_company_id ON eu_balance_sheets(company_id);
CREATE INDEX IF NOT EXISTS idx_eu_balance_org_number ON eu_balance_sheets(org_number, country_code);
CREATE INDEX IF NOT EXISTS idx_eu_balance_report_period ON eu_balance_sheets(report_period DESC);

-- ============================================================================
-- 4. EU CASH FLOW STATEMENTS TABLE (IFRS format)
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_cash_flow_statements (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES eu_companies(id) ON DELETE CASCADE,
  org_number VARCHAR(50) NOT NULL,
  country_code VARCHAR(2) NOT NULL,

  -- Period info
  report_period DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'annual',
  currency VARCHAR(10) DEFAULT 'EUR',

  -- OPERATING ACTIVITIES (Indirect method - IFRS)
  profit_before_tax BIGINT,
  adjustments_for_non_cash BIGINT,
  depreciation_amortization BIGINT,
  impairment_losses BIGINT,
  finance_costs_adjustment BIGINT,
  finance_income_adjustment BIGINT,
  share_based_payments BIGINT,

  -- Working capital changes
  change_in_inventories BIGINT,
  change_in_trade_receivables BIGINT,
  change_in_trade_payables BIGINT,
  change_in_other_working_capital BIGINT,

  income_tax_paid BIGINT,
  interest_paid BIGINT,
  interest_received BIGINT,
  cash_from_operating_activities BIGINT,

  -- INVESTING ACTIVITIES (IFRS)
  purchase_of_ppe BIGINT, -- CapEx
  proceeds_from_sale_of_ppe BIGINT,
  purchase_of_intangibles BIGINT,
  acquisition_of_subsidiaries BIGINT,
  disposal_of_subsidiaries BIGINT,
  purchase_of_investments BIGINT,
  proceeds_from_investments BIGINT,
  dividends_received BIGINT,
  cash_from_investing_activities BIGINT,

  -- FINANCING ACTIVITIES (IFRS)
  proceeds_from_share_issue BIGINT,
  purchase_of_treasury_shares BIGINT,
  proceeds_from_borrowings BIGINT,
  repayment_of_borrowings BIGINT,
  payment_of_lease_liabilities BIGINT, -- IFRS 16
  dividends_paid BIGINT,
  cash_from_financing_activities BIGINT,

  -- Net Change
  net_change_in_cash BIGINT,
  cash_at_beginning BIGINT,
  effect_of_exchange_rates BIGINT,
  cash_at_end BIGINT,

  -- Key metrics
  free_cash_flow BIGINT, -- Operating - CapEx

  -- Source tracking
  source VARCHAR(50) DEFAULT 'ALLABOLAG',
  filing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_number, country_code, report_period, period)
);

CREATE INDEX IF NOT EXISTS idx_eu_cashflow_company_id ON eu_cash_flow_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_eu_cashflow_org_number ON eu_cash_flow_statements(org_number, country_code);
CREATE INDEX IF NOT EXISTS idx_eu_cashflow_report_period ON eu_cash_flow_statements(report_period DESC);

-- ============================================================================
-- 5. EU FINANCIAL METRICS TABLE (Calculated ratios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_financial_metrics (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES eu_companies(id) ON DELETE CASCADE,
  org_number VARCHAR(50) NOT NULL,
  country_code VARCHAR(2) NOT NULL,

  -- Period info
  report_period DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',

  -- Valuation (if listed)
  market_cap BIGINT,
  enterprise_value BIGINT,
  price_to_earnings NUMERIC(20, 4),
  price_to_book NUMERIC(20, 4),
  price_to_sales NUMERIC(20, 4),
  ev_to_ebitda NUMERIC(20, 4),
  ev_to_revenue NUMERIC(20, 4),

  -- Profitability
  gross_margin NUMERIC(10, 4),
  operating_margin NUMERIC(10, 4),
  net_margin NUMERIC(10, 4),
  return_on_equity NUMERIC(10, 4),
  return_on_assets NUMERIC(10, 4),
  return_on_capital_employed NUMERIC(10, 4), -- ROCE (common in EU)

  -- Efficiency
  asset_turnover NUMERIC(10, 4),
  inventory_turnover NUMERIC(10, 4),
  receivables_turnover NUMERIC(10, 4),
  days_sales_outstanding NUMERIC(10, 2),
  days_inventory NUMERIC(10, 2),
  days_payable NUMERIC(10, 2),
  cash_conversion_cycle NUMERIC(10, 2),

  -- Liquidity
  current_ratio NUMERIC(10, 4),
  quick_ratio NUMERIC(10, 4),
  cash_ratio NUMERIC(10, 4),

  -- Leverage
  debt_to_equity NUMERIC(10, 4),
  debt_to_assets NUMERIC(10, 4),
  interest_coverage NUMERIC(10, 4),
  net_debt_to_ebitda NUMERIC(10, 4),

  -- Growth (YoY)
  revenue_growth NUMERIC(10, 4),
  profit_growth NUMERIC(10, 4),
  eps_growth NUMERIC(10, 4),
  asset_growth NUMERIC(10, 4),

  -- Per Share
  earnings_per_share NUMERIC(20, 4),
  book_value_per_share NUMERIC(20, 4),
  dividend_per_share NUMERIC(20, 4),
  dividend_yield NUMERIC(10, 4),

  -- Source tracking
  source VARCHAR(50) DEFAULT 'CALCULATED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_number, country_code, report_period)
);

CREATE INDEX IF NOT EXISTS idx_eu_metrics_company_id ON eu_financial_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_eu_metrics_org_number ON eu_financial_metrics(org_number, country_code);
CREATE INDEX IF NOT EXISTS idx_eu_metrics_report_period ON eu_financial_metrics(report_period DESC);

-- ============================================================================
-- 6. EU SYNC LOG - Track data sync from various sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS eu_sync_log (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL, -- ALLABOLAG, PROFF, COMPANIES_HOUSE, BRREG, etc.
  country_code VARCHAR(2) NOT NULL,
  sync_type VARCHAR(50) NOT NULL, -- FULL, INCREMENTAL, SINGLE
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'RUNNING',
  companies_synced INTEGER DEFAULT 0,
  financials_synced INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  last_offset INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_eu_sync_source ON eu_sync_log(source, country_code);
CREATE INDEX IF NOT EXISTS idx_eu_sync_status ON eu_sync_log(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE eu_companies IS 'European company master data from various national registries';
COMMENT ON TABLE eu_income_statements IS 'European income statements in IFRS format';
COMMENT ON TABLE eu_balance_sheets IS 'European balance sheets in IFRS format';
COMMENT ON TABLE eu_cash_flow_statements IS 'European cash flow statements in IFRS format';
COMMENT ON TABLE eu_financial_metrics IS 'Calculated financial metrics for European companies';
COMMENT ON TABLE eu_sync_log IS 'Sync history for European data sources';

COMMENT ON COLUMN eu_companies.org_number IS 'Organization number - format varies by country (SE: 10 digits, NO: 9 digits, UK: 8 chars, DE: HRB/HRA number)';
COMMENT ON COLUMN eu_companies.country_code IS 'ISO 3166-1 alpha-2 country code: SE, NO, DK, FI, GB, DE, FR, NL, etc.';
COMMENT ON COLUMN eu_companies.legal_form IS 'Legal entity type: AB (SE), AS (NO), Ltd/PLC (UK), GmbH/AG (DE), SARL/SA (FR)';
