-- Insider Trades Database Schema
-- Replicating Financial Datasets API - Form 4 insider trading data
-- Data sourced from SEC EDGAR Form 4 filings
-- Migration: 20251210000002_insider_trades.sql

-- ============================================================================
-- 1. INSIDERS TABLE - Corporate officers and directors
-- ============================================================================
CREATE TABLE IF NOT EXISTS insiders (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  normalized_name VARCHAR(500),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insiders_cik ON insiders(cik);
CREATE INDEX IF NOT EXISTS idx_insiders_name ON insiders(name);

-- ============================================================================
-- 2. INSIDER POSITIONS TABLE - Tracks positions at companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS insider_positions (
  id BIGSERIAL PRIMARY KEY,
  insider_cik VARCHAR(10) NOT NULL,
  company_cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20),

  -- Position details
  title VARCHAR(200),
  is_director BOOLEAN DEFAULT FALSE,
  is_officer BOOLEAN DEFAULT FALSE,
  is_ten_percent_owner BOOLEAN DEFAULT FALSE,
  is_other BOOLEAN DEFAULT FALSE,
  officer_title VARCHAR(200),

  -- Tracking
  first_filing_date DATE,
  last_filing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(insider_cik, company_cik)
);

CREATE INDEX IF NOT EXISTS idx_positions_insider ON insider_positions(insider_cik);
CREATE INDEX IF NOT EXISTS idx_positions_company ON insider_positions(company_cik);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON insider_positions(ticker);

-- ============================================================================
-- 3. FORM 4 FILINGS TABLE - Track individual Form 4 filings
-- ============================================================================
CREATE TABLE IF NOT EXISTS form4_filings (
  id BIGSERIAL PRIMARY KEY,
  accession_number VARCHAR(25) NOT NULL UNIQUE,

  -- Filer info
  insider_cik VARCHAR(10) NOT NULL,
  insider_name VARCHAR(500),

  -- Company info
  company_cik VARCHAR(10) NOT NULL,
  company_name VARCHAR(500),
  ticker VARCHAR(20),

  -- Filing details
  filing_date DATE NOT NULL,
  accepted_datetime TIMESTAMPTZ,

  -- Position info (from filing)
  is_director BOOLEAN DEFAULT FALSE,
  is_officer BOOLEAN DEFAULT FALSE,
  is_ten_percent_owner BOOLEAN DEFAULT FALSE,
  is_other BOOLEAN DEFAULT FALSE,
  officer_title VARCHAR(200),

  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form4_insider ON form4_filings(insider_cik);
CREATE INDEX IF NOT EXISTS idx_form4_company ON form4_filings(company_cik);
CREATE INDEX IF NOT EXISTS idx_form4_ticker ON form4_filings(ticker);
CREATE INDEX IF NOT EXISTS idx_form4_filing_date ON form4_filings(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_form4_accession ON form4_filings(accession_number);

-- ============================================================================
-- 4. INSIDER TRADES TABLE - Individual transactions from Form 4
-- ============================================================================
CREATE TABLE IF NOT EXISTS insider_trades (
  id BIGSERIAL PRIMARY KEY,
  filing_id BIGINT REFERENCES form4_filings(id) ON DELETE CASCADE,
  accession_number VARCHAR(25) NOT NULL,

  -- Company info
  ticker VARCHAR(20),
  company_cik VARCHAR(10) NOT NULL,
  issuer VARCHAR(500),

  -- Insider info
  insider_cik VARCHAR(10) NOT NULL,
  name VARCHAR(500) NOT NULL,
  title VARCHAR(200),
  is_board_director BOOLEAN DEFAULT FALSE,

  -- Transaction details
  transaction_date DATE,
  transaction_code VARCHAR(10), -- P, S, A, D, G, etc.
  transaction_type VARCHAR(50), -- Buy, Sell, Grant, etc.

  -- Shares
  transaction_shares NUMERIC(20, 4),
  transaction_price_per_share NUMERIC(20, 4),
  transaction_value NUMERIC(20, 4),

  -- Ownership before/after
  shares_owned_before_transaction BIGINT,
  shares_owned_after_transaction BIGINT,

  -- Security details
  security_title VARCHAR(200),
  security_type VARCHAR(50), -- Common Stock, Option, etc.
  underlying_security_title VARCHAR(200),
  underlying_shares NUMERIC(20, 4),

  -- Derivative details (options, etc.)
  exercise_price NUMERIC(20, 4),
  exercise_date DATE,
  expiration_date DATE,

  -- Acquisition or disposition
  acquired_disposed_code VARCHAR(5), -- A (Acquired) or D (Disposed)

  -- Direct or indirect ownership
  ownership_nature VARCHAR(10), -- D (Direct) or I (Indirect)
  indirect_ownership_explanation TEXT,

  -- Filing info
  filing_date DATE NOT NULL,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trades_ticker ON insider_trades(ticker);
CREATE INDEX IF NOT EXISTS idx_trades_company ON insider_trades(company_cik);
CREATE INDEX IF NOT EXISTS idx_trades_insider ON insider_trades(insider_cik);
CREATE INDEX IF NOT EXISTS idx_trades_transaction_date ON insider_trades(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_filing_date ON insider_trades(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_ticker_date ON insider_trades(ticker, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_type ON insider_trades(transaction_type);
CREATE INDEX IF NOT EXISTS idx_trades_code ON insider_trades(transaction_code);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_trades_ticker_type_date
  ON insider_trades(ticker, transaction_type, filing_date DESC);

-- Partial indexes for specific queries
CREATE INDEX IF NOT EXISTS idx_trades_buys ON insider_trades(ticker, filing_date DESC)
  WHERE transaction_code = 'P';
CREATE INDEX IF NOT EXISTS idx_trades_sells ON insider_trades(ticker, filing_date DESC)
  WHERE transaction_code = 'S';

-- ============================================================================
-- 5. INSIDER ACTIVITY SUMMARY TABLE (Pre-calculated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS insider_activity_summary (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  company_cik VARCHAR(10),

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- '30d', '90d', '180d', '365d'

  -- Buy activity
  buy_count INT DEFAULT 0,
  buy_shares BIGINT DEFAULT 0,
  buy_value BIGINT DEFAULT 0,
  unique_buyers INT DEFAULT 0,

  -- Sell activity
  sell_count INT DEFAULT 0,
  sell_shares BIGINT DEFAULT 0,
  sell_value BIGINT DEFAULT 0,
  unique_sellers INT DEFAULT 0,

  -- Net activity
  net_shares BIGINT DEFAULT 0,
  net_value BIGINT DEFAULT 0,

  -- Ratios
  buy_sell_ratio NUMERIC(10, 4),

  -- Tracking
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticker, period_type, period_end)
);

CREATE INDEX IF NOT EXISTS idx_activity_ticker ON insider_activity_summary(ticker);
CREATE INDEX IF NOT EXISTS idx_activity_period ON insider_activity_summary(period_end DESC);

-- ============================================================================
-- 6. TRANSACTION CODE REFERENCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_codes (
  code VARCHAR(10) PRIMARY KEY,
  description VARCHAR(200) NOT NULL,
  category VARCHAR(50) -- BUY, SELL, GRANT, EXERCISE, OTHER
);

-- Seed transaction codes
INSERT INTO transaction_codes (code, description, category) VALUES
  ('P', 'Open market or private purchase', 'BUY'),
  ('S', 'Open market or private sale', 'SELL'),
  ('A', 'Grant, award, or other acquisition', 'GRANT'),
  ('D', 'Sale back to issuer (disposition)', 'SELL'),
  ('F', 'Payment of exercise price or tax liability by delivering securities', 'EXERCISE'),
  ('I', 'Discretionary transaction', 'OTHER'),
  ('M', 'Exercise or conversion of derivative security', 'EXERCISE'),
  ('C', 'Conversion of derivative security', 'EXERCISE'),
  ('E', 'Expiration of short derivative position', 'OTHER'),
  ('H', 'Expiration of long derivative position', 'OTHER'),
  ('O', 'Exercise of out-of-the-money derivative', 'EXERCISE'),
  ('X', 'Exercise of in-the-money derivative', 'EXERCISE'),
  ('G', 'Gift', 'OTHER'),
  ('L', 'Small acquisition', 'BUY'),
  ('W', 'Acquisition or disposition by will or laws of descent', 'OTHER'),
  ('Z', 'Deposit into or withdrawal from voting trust', 'OTHER'),
  ('J', 'Other acquisition or disposition', 'OTHER'),
  ('K', 'Equity swap or similar instrument', 'OTHER'),
  ('U', 'Disposition pursuant to tender offer', 'SELL'),
  ('V', 'Transaction voluntarily reported earlier than required', 'OTHER')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 7. SYNC LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insider_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- FULL_SYNC, DAILY, TICKER

  -- Sync details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'RUNNING',

  -- Stats
  filings_processed INT DEFAULT 0,
  trades_created INT DEFAULT 0,
  summaries_updated INT DEFAULT 0,

  -- Errors
  error_count INT DEFAULT 0,
  error_message TEXT,

  -- Parameters
  parameters JSONB
);

-- ============================================================================
-- 8. VIEWS FOR API COMPATIBILITY
-- ============================================================================

-- Financial Datasets compatible view for insider trades
CREATE OR REPLACE VIEW v_insider_trades AS
SELECT
  t.ticker,
  t.issuer,
  t.name,
  t.title,
  t.is_board_director,
  t.transaction_date,
  t.transaction_shares,
  t.transaction_price_per_share,
  t.transaction_value,
  t.shares_owned_before_transaction,
  t.shares_owned_after_transaction,
  t.security_title,
  t.filing_date
FROM insider_trades t
WHERE t.ticker IS NOT NULL
ORDER BY t.filing_date DESC;

-- ============================================================================
-- 9. FUNCTION TO CALCULATE INSIDER ACTIVITY SUMMARY
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_insider_activity(
  p_ticker VARCHAR(20),
  p_days INT DEFAULT 90
)
RETURNS TABLE (
  buy_count INT,
  buy_shares BIGINT,
  buy_value NUMERIC,
  sell_count INT,
  sell_shares BIGINT,
  sell_value NUMERIC,
  net_shares BIGINT,
  net_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE transaction_code = 'P')::INT as buy_count,
    COALESCE(SUM(transaction_shares) FILTER (WHERE transaction_code = 'P'), 0)::BIGINT as buy_shares,
    COALESCE(SUM(transaction_value) FILTER (WHERE transaction_code = 'P'), 0) as buy_value,
    COUNT(*) FILTER (WHERE transaction_code = 'S')::INT as sell_count,
    COALESCE(SUM(transaction_shares) FILTER (WHERE transaction_code = 'S'), 0)::BIGINT as sell_shares,
    COALESCE(SUM(transaction_value) FILTER (WHERE transaction_code = 'S'), 0) as sell_value,
    (COALESCE(SUM(transaction_shares) FILTER (WHERE transaction_code = 'P'), 0) -
     COALESCE(SUM(transaction_shares) FILTER (WHERE transaction_code = 'S'), 0))::BIGINT as net_shares,
    (COALESCE(SUM(transaction_value) FILTER (WHERE transaction_code = 'P'), 0) -
     COALESCE(SUM(transaction_value) FILTER (WHERE transaction_code = 'S'), 0)) as net_value
  FROM insider_trades
  WHERE ticker = p_ticker
    AND filing_date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE insider_trades IS 'SEC Form 4 insider trading data - Financial Datasets compatible';
COMMENT ON TABLE form4_filings IS 'SEC Form 4 filing metadata';
COMMENT ON TABLE insiders IS 'Corporate insiders who file Form 4';
COMMENT ON TABLE insider_activity_summary IS 'Pre-calculated insider activity metrics';
