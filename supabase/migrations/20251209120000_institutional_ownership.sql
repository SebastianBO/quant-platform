-- Institutional Ownership Database Schema
-- Replicating Financial Datasets API functionality using SEC EDGAR 13F data
-- Migration: 20251209_institutional_ownership.sql

-- ============================================================================
-- 1. INVESTORS TABLE - All institutional investors who file 13F
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_investors (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  normalized_name VARCHAR(500) NOT NULL, -- BERKSHIRE_HATHAWAY_INC format
  investor_type VARCHAR(50), -- Index Fund, Hedge Fund, Pension, Bank, etc.

  -- Metadata
  first_filing_date DATE,
  last_filing_date DATE,
  total_filings INT DEFAULT 0,

  -- Latest portfolio stats (updated after each filing)
  latest_aum BIGINT, -- Assets Under Management
  latest_positions INT,
  latest_report_date DATE,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for investors
CREATE INDEX IF NOT EXISTS idx_investors_cik ON institutional_investors(cik);
CREATE INDEX IF NOT EXISTS idx_investors_normalized_name ON institutional_investors(normalized_name);
CREATE INDEX IF NOT EXISTS idx_investors_type ON institutional_investors(investor_type);
CREATE INDEX IF NOT EXISTS idx_investors_aum ON institutional_investors(latest_aum DESC);

-- ============================================================================
-- 2. CUSIP MAPPINGS TABLE - CUSIP to ticker resolution
-- ============================================================================
CREATE TABLE IF NOT EXISTS cusip_mappings (
  id BIGSERIAL PRIMARY KEY,
  cusip VARCHAR(9) NOT NULL UNIQUE,
  ticker VARCHAR(20),
  issuer_name VARCHAR(500),
  title_of_class VARCHAR(200),

  -- Security type
  security_type VARCHAR(20) DEFAULT 'EQUITY', -- EQUITY, OPTION, etc.

  -- Resolution metadata
  source VARCHAR(50), -- SEC, OPENFIGI, MANUAL
  confidence NUMERIC(3,2) DEFAULT 1.0, -- 0.00 to 1.00
  verified BOOLEAN DEFAULT FALSE,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for CUSIP
CREATE INDEX IF NOT EXISTS idx_cusip_ticker ON cusip_mappings(ticker);
CREATE INDEX IF NOT EXISTS idx_cusip_cusip ON cusip_mappings(cusip);

-- ============================================================================
-- 3. 13F FILINGS TABLE - Track individual 13F filings
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_filings (
  id BIGSERIAL PRIMARY KEY,
  investor_cik VARCHAR(10) NOT NULL REFERENCES institutional_investors(cik),
  accession_number VARCHAR(25) NOT NULL UNIQUE,

  -- Filing dates
  filing_date DATE NOT NULL,
  report_date DATE NOT NULL, -- Quarter end date (report_period)

  -- Filing metadata
  form_type VARCHAR(20) NOT NULL, -- 13F-HR, 13F-HR/A
  is_amendment BOOLEAN DEFAULT FALSE,

  -- Aggregated stats
  total_value BIGINT, -- Total portfolio value
  total_positions INT,

  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filings
CREATE INDEX IF NOT EXISTS idx_filings_cik ON institutional_filings(investor_cik);
CREATE INDEX IF NOT EXISTS idx_filings_report_date ON institutional_filings(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_filings_cik_report ON institutional_filings(investor_cik, report_date DESC);

-- ============================================================================
-- 4. HOLDINGS TABLE - Individual positions from 13F filings
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_holdings (
  id BIGSERIAL PRIMARY KEY,
  filing_id BIGINT NOT NULL REFERENCES institutional_filings(id) ON DELETE CASCADE,
  investor_cik VARCHAR(10) NOT NULL,

  -- Security identification
  cusip VARCHAR(9) NOT NULL,
  ticker VARCHAR(20), -- Resolved from CUSIP
  issuer_name VARCHAR(500),
  title_of_class VARCHAR(200),

  -- Position data
  report_date DATE NOT NULL,
  shares BIGINT NOT NULL,
  market_value BIGINT NOT NULL, -- In dollars
  share_type VARCHAR(10) DEFAULT 'SH', -- SH (shares), PRN (principal)

  -- Calculated price (market_value / shares)
  price NUMERIC(20,4),

  -- Additional 13F fields
  investment_discretion VARCHAR(10), -- SOLE, SHARED, DFND
  voting_sole BIGINT DEFAULT 0,
  voting_shared BIGINT DEFAULT 0,
  voting_none BIGINT DEFAULT 0,
  put_call VARCHAR(10), -- PUT, CALL, or null

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for holdings (critical for query performance)
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON institutional_holdings(ticker);
CREATE INDEX IF NOT EXISTS idx_holdings_cusip ON institutional_holdings(cusip);
CREATE INDEX IF NOT EXISTS idx_holdings_cik ON institutional_holdings(investor_cik);
CREATE INDEX IF NOT EXISTS idx_holdings_report_date ON institutional_holdings(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker_report ON institutional_holdings(ticker, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_cik_report ON institutional_holdings(investor_cik, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_value ON institutional_holdings(market_value DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_filing ON institutional_holdings(filing_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_holdings_ticker_cik_report
  ON institutional_holdings(ticker, investor_cik, report_date DESC);

-- ============================================================================
-- 5. POSITION CHANGES TABLE - Pre-calculated QoQ changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_changes (
  id BIGSERIAL PRIMARY KEY,
  investor_cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  cusip VARCHAR(9) NOT NULL,

  -- Current period
  report_date DATE NOT NULL,
  shares BIGINT NOT NULL,
  market_value BIGINT NOT NULL,

  -- Prior period
  prior_report_date DATE,
  prior_shares BIGINT,
  prior_market_value BIGINT,

  -- Calculated changes
  change_in_shares BIGINT,
  change_percent NUMERIC(10,2), -- Percentage change
  change_in_value BIGINT,

  -- Position status
  is_new_position BOOLEAN DEFAULT FALSE,
  is_exit BOOLEAN DEFAULT FALSE,
  is_increased BOOLEAN DEFAULT FALSE,
  is_decreased BOOLEAN DEFAULT FALSE,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(investor_cik, ticker, report_date)
);

-- Indexes for changes
CREATE INDEX IF NOT EXISTS idx_changes_ticker ON institutional_changes(ticker);
CREATE INDEX IF NOT EXISTS idx_changes_cik ON institutional_changes(investor_cik);
CREATE INDEX IF NOT EXISTS idx_changes_report_date ON institutional_changes(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_changes_new_positions ON institutional_changes(is_new_position) WHERE is_new_position = TRUE;
CREATE INDEX IF NOT EXISTS idx_changes_exits ON institutional_changes(is_exit) WHERE is_exit = TRUE;
CREATE INDEX IF NOT EXISTS idx_changes_increased ON institutional_changes(is_increased) WHERE is_increased = TRUE;

-- ============================================================================
-- 6. TICKER COVERAGE TABLE - Track which tickers have institutional data
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_ticker_coverage (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL UNIQUE,
  cusip VARCHAR(9),
  issuer_name VARCHAR(500),

  -- Coverage stats
  total_holders INT DEFAULT 0,
  total_shares BIGINT DEFAULT 0,
  total_value BIGINT DEFAULT 0,

  -- Date range
  first_report_date DATE,
  last_report_date DATE,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ticker coverage
CREATE INDEX IF NOT EXISTS idx_ticker_coverage_ticker ON institutional_ticker_coverage(ticker);
CREATE INDEX IF NOT EXISTS idx_ticker_coverage_holders ON institutional_ticker_coverage(total_holders DESC);

-- ============================================================================
-- 7. SYNC LOG TABLE - Track data ingestion
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- FULL_SYNC, INCREMENTAL, INVESTOR, TICKER

  -- Sync details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'RUNNING', -- RUNNING, COMPLETED, FAILED

  -- Stats
  investors_processed INT DEFAULT 0,
  filings_processed INT DEFAULT 0,
  holdings_processed INT DEFAULT 0,
  changes_calculated INT DEFAULT 0,

  -- Errors
  error_count INT DEFAULT 0,
  error_message TEXT,

  -- Parameters
  parameters JSONB
);

-- ============================================================================
-- 8. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Latest holdings by ticker (Financial Datasets compatible)
CREATE OR REPLACE VIEW v_institutional_ownership_by_ticker AS
SELECT
  h.ticker,
  i.normalized_name as investor,
  h.report_date as report_period,
  h.price,
  h.shares,
  h.market_value,
  c.change_in_shares,
  c.change_percent,
  c.is_new_position
FROM institutional_holdings h
JOIN institutional_investors i ON h.investor_cik = i.cik
LEFT JOIN institutional_changes c ON c.investor_cik = h.investor_cik
  AND c.ticker = h.ticker
  AND c.report_date = h.report_date
WHERE h.report_date = (
  SELECT MAX(report_date) FROM institutional_holdings
  WHERE ticker = h.ticker
);

-- View: Latest holdings by investor (Financial Datasets compatible)
CREATE OR REPLACE VIEW v_institutional_ownership_by_investor AS
SELECT
  h.ticker,
  i.normalized_name as investor,
  h.report_date as report_period,
  h.price,
  h.shares,
  h.market_value,
  c.change_in_shares,
  c.change_percent,
  c.is_new_position
FROM institutional_holdings h
JOIN institutional_investors i ON h.investor_cik = i.cik
LEFT JOIN institutional_changes c ON c.investor_cik = h.investor_cik
  AND c.ticker = h.ticker
  AND c.report_date = h.report_date
WHERE h.report_date = (
  SELECT MAX(report_date) FROM institutional_holdings ih
  WHERE ih.investor_cik = h.investor_cik
);

-- View: Top institutional holders aggregated
CREATE OR REPLACE VIEW v_top_institutional_holders AS
SELECT
  i.cik,
  i.name,
  i.normalized_name,
  i.investor_type,
  i.latest_aum,
  i.latest_positions,
  i.last_filing_date,
  COUNT(DISTINCT h.ticker) as unique_tickers
FROM institutional_investors i
LEFT JOIN institutional_holdings h ON h.investor_cik = i.cik
GROUP BY i.cik, i.name, i.normalized_name, i.investor_type,
         i.latest_aum, i.latest_positions, i.last_filing_date
ORDER BY i.latest_aum DESC NULLS LAST;

-- ============================================================================
-- 9. FUNCTIONS FOR DATA MANAGEMENT
-- ============================================================================

-- Function: Calculate position changes for an investor
CREATE OR REPLACE FUNCTION calculate_investor_changes(p_investor_cik VARCHAR(10))
RETURNS INT AS $$
DECLARE
  v_changes_count INT := 0;
BEGIN
  -- Insert or update changes comparing consecutive quarters
  INSERT INTO institutional_changes (
    investor_cik, ticker, cusip, report_date,
    shares, market_value,
    prior_report_date, prior_shares, prior_market_value,
    change_in_shares, change_percent, change_in_value,
    is_new_position, is_exit, is_increased, is_decreased
  )
  SELECT
    curr.investor_cik,
    curr.ticker,
    curr.cusip,
    curr.report_date,
    curr.shares,
    curr.market_value,
    prev.report_date as prior_report_date,
    prev.shares as prior_shares,
    prev.market_value as prior_market_value,
    curr.shares - COALESCE(prev.shares, 0) as change_in_shares,
    CASE
      WHEN prev.shares IS NULL OR prev.shares = 0 THEN NULL
      ELSE ROUND(((curr.shares - prev.shares)::NUMERIC / prev.shares) * 100, 2)
    END as change_percent,
    curr.market_value - COALESCE(prev.market_value, 0) as change_in_value,
    prev.shares IS NULL as is_new_position,
    FALSE as is_exit, -- Current positions can't be exits
    curr.shares > COALESCE(prev.shares, 0) AND prev.shares IS NOT NULL as is_increased,
    curr.shares < COALESCE(prev.shares, curr.shares) as is_decreased
  FROM institutional_holdings curr
  LEFT JOIN LATERAL (
    SELECT h2.shares, h2.market_value, h2.report_date
    FROM institutional_holdings h2
    WHERE h2.investor_cik = curr.investor_cik
      AND h2.ticker = curr.ticker
      AND h2.report_date < curr.report_date
    ORDER BY h2.report_date DESC
    LIMIT 1
  ) prev ON TRUE
  WHERE curr.investor_cik = p_investor_cik
    AND curr.ticker IS NOT NULL
  ON CONFLICT (investor_cik, ticker, report_date)
  DO UPDATE SET
    shares = EXCLUDED.shares,
    market_value = EXCLUDED.market_value,
    prior_shares = EXCLUDED.prior_shares,
    prior_market_value = EXCLUDED.prior_market_value,
    change_in_shares = EXCLUDED.change_in_shares,
    change_percent = EXCLUDED.change_percent,
    change_in_value = EXCLUDED.change_in_value,
    is_new_position = EXCLUDED.is_new_position,
    is_increased = EXCLUDED.is_increased,
    is_decreased = EXCLUDED.is_decreased;

  GET DIAGNOSTICS v_changes_count = ROW_COUNT;
  RETURN v_changes_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Update ticker coverage stats
CREATE OR REPLACE FUNCTION update_ticker_coverage(p_ticker VARCHAR(20))
RETURNS VOID AS $$
BEGIN
  INSERT INTO institutional_ticker_coverage (
    ticker, cusip, issuer_name,
    total_holders, total_shares, total_value,
    first_report_date, last_report_date,
    updated_at
  )
  SELECT
    p_ticker,
    MAX(cusip),
    MAX(issuer_name),
    COUNT(DISTINCT investor_cik),
    SUM(shares),
    SUM(market_value),
    MIN(report_date),
    MAX(report_date),
    NOW()
  FROM institutional_holdings
  WHERE ticker = p_ticker
    AND report_date = (SELECT MAX(report_date) FROM institutional_holdings WHERE ticker = p_ticker)
  ON CONFLICT (ticker)
  DO UPDATE SET
    total_holders = EXCLUDED.total_holders,
    total_shares = EXCLUDED.total_shares,
    total_value = EXCLUDED.total_value,
    first_report_date = EXCLUDED.first_report_date,
    last_report_date = EXCLUDED.last_report_date,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Update investor stats after filing processed
CREATE OR REPLACE FUNCTION update_investor_stats(p_cik VARCHAR(10))
RETURNS VOID AS $$
BEGIN
  UPDATE institutional_investors
  SET
    latest_aum = (
      SELECT SUM(market_value)
      FROM institutional_holdings
      WHERE investor_cik = p_cik
        AND report_date = (SELECT MAX(report_date) FROM institutional_holdings WHERE investor_cik = p_cik)
    ),
    latest_positions = (
      SELECT COUNT(*)
      FROM institutional_holdings
      WHERE investor_cik = p_cik
        AND report_date = (SELECT MAX(report_date) FROM institutional_holdings WHERE investor_cik = p_cik)
    ),
    latest_report_date = (
      SELECT MAX(report_date) FROM institutional_holdings WHERE investor_cik = p_cik
    ),
    last_filing_date = (
      SELECT MAX(filing_date) FROM institutional_filings WHERE investor_cik = p_cik
    ),
    total_filings = (
      SELECT COUNT(*) FROM institutional_filings WHERE investor_cik = p_cik
    ),
    updated_at = NOW()
  WHERE cik = p_cik;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (Optional - for multi-tenant)
-- ============================================================================
-- Note: Enable RLS if you want to restrict access

-- ALTER TABLE institutional_holdings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE institutional_investors ENABLE ROW LEVEL SECURITY;
-- ... etc

-- ============================================================================
-- 11. SEED INITIAL CUSIP MAPPINGS
-- ============================================================================
INSERT INTO cusip_mappings (cusip, ticker, issuer_name, source, verified) VALUES
-- Mega caps
('037833100', 'AAPL', 'Apple Inc', 'MANUAL', TRUE),
('594918104', 'MSFT', 'Microsoft Corp', 'MANUAL', TRUE),
('02079K305', 'GOOGL', 'Alphabet Inc Class A', 'MANUAL', TRUE),
('02079K107', 'GOOG', 'Alphabet Inc Class C', 'MANUAL', TRUE),
('023135106', 'AMZN', 'Amazon.com Inc', 'MANUAL', TRUE),
('67066G104', 'NVDA', 'NVIDIA Corp', 'MANUAL', TRUE),
('88160R101', 'TSLA', 'Tesla Inc', 'MANUAL', TRUE),
('30303M102', 'META', 'Meta Platforms Inc', 'MANUAL', TRUE),
('084670702', 'BRK.B', 'Berkshire Hathaway Inc Class B', 'MANUAL', TRUE),
('084670108', 'BRK.A', 'Berkshire Hathaway Inc Class A', 'MANUAL', TRUE),
-- Financials
('060505104', 'BAC', 'Bank of America Corp', 'MANUAL', TRUE),
('46625H100', 'JPM', 'JPMorgan Chase & Co', 'MANUAL', TRUE),
('172967424', 'C', 'Citigroup Inc', 'MANUAL', TRUE),
('949746101', 'WFC', 'Wells Fargo & Co', 'MANUAL', TRUE),
('38141G104', 'GS', 'Goldman Sachs Group Inc', 'MANUAL', TRUE),
('617446448', 'MS', 'Morgan Stanley', 'MANUAL', TRUE),
('025816109', 'AXP', 'American Express Co', 'MANUAL', TRUE),
('92826C839', 'V', 'Visa Inc', 'MANUAL', TRUE),
('585055106', 'MA', 'Mastercard Inc', 'MANUAL', TRUE),
-- Healthcare
('478160104', 'JNJ', 'Johnson & Johnson', 'MANUAL', TRUE),
('91324P102', 'UNH', 'UnitedHealth Group Inc', 'MANUAL', TRUE),
('718172109', 'PFE', 'Pfizer Inc', 'MANUAL', TRUE),
('58933Y105', 'MRK', 'Merck & Co Inc', 'MANUAL', TRUE),
('002824100', 'ABBV', 'AbbVie Inc', 'MANUAL', TRUE),
('532457108', 'LLY', 'Eli Lilly & Co', 'MANUAL', TRUE),
-- Consumer
('191216100', 'KO', 'Coca-Cola Co', 'MANUAL', TRUE),
('713448108', 'PEP', 'PepsiCo Inc', 'MANUAL', TRUE),
('742718109', 'PG', 'Procter & Gamble Co', 'MANUAL', TRUE),
('931142103', 'WMT', 'Walmart Inc', 'MANUAL', TRUE),
('437076102', 'HD', 'Home Depot Inc', 'MANUAL', TRUE),
('580135101', 'MCD', 'McDonald''s Corp', 'MANUAL', TRUE),
('654106103', 'NKE', 'Nike Inc', 'MANUAL', TRUE),
('853061100', 'SBUX', 'Starbucks Corp', 'MANUAL', TRUE),
('22160K105', 'COST', 'Costco Wholesale Corp', 'MANUAL', TRUE),
-- Industrial
('097023105', 'BA', 'Boeing Co', 'MANUAL', TRUE),
('149123101', 'CAT', 'Caterpillar Inc', 'MANUAL', TRUE),
('369550108', 'GE', 'General Electric Co', 'MANUAL', TRUE),
('443556101', 'HON', 'Honeywell International Inc', 'MANUAL', TRUE),
('912909108', 'UNP', 'Union Pacific Corp', 'MANUAL', TRUE),
('902973304', 'UPS', 'United Parcel Service Inc', 'MANUAL', TRUE),
('345370860', 'F', 'Ford Motor Co', 'MANUAL', TRUE),
('370334104', 'GM', 'General Motors Co', 'MANUAL', TRUE),
-- Energy
('30231G102', 'XOM', 'Exxon Mobil Corp', 'MANUAL', TRUE),
('166764100', 'CVX', 'Chevron Corp', 'MANUAL', TRUE),
('20825C104', 'COP', 'ConocoPhillips', 'MANUAL', TRUE),
-- Tech
('00724F101', 'ADBE', 'Adobe Inc', 'MANUAL', TRUE),
('79466L302', 'CRM', 'Salesforce Inc', 'MANUAL', TRUE),
('458140100', 'INTC', 'Intel Corp', 'MANUAL', TRUE),
('17275R102', 'CSCO', 'Cisco Systems Inc', 'MANUAL', TRUE),
('254687106', 'DIS', 'Walt Disney Co', 'MANUAL', TRUE),
('64110L106', 'NFLX', 'Netflix Inc', 'MANUAL', TRUE),
('747525103', 'QCOM', 'Qualcomm Inc', 'MANUAL', TRUE),
('09061G101', 'AVGO', 'Broadcom Inc', 'MANUAL', TRUE),
('882508104', 'TXN', 'Texas Instruments Inc', 'MANUAL', TRUE),
('59517P701', 'MU', 'Micron Technology Inc', 'MANUAL', TRUE),
-- Additional popular stocks
('02005N100', 'ALLY', 'Ally Financial Inc', 'MANUAL', TRUE),
('693718108', 'OXY', 'Occidental Petroleum Corp', 'MANUAL', TRUE),
('126650100', 'CVS', 'CVS Health Corp', 'MANUAL', TRUE),
('70450Y103', 'PYPL', 'PayPal Holdings Inc', 'MANUAL', TRUE),
('90384S303', 'UBER', 'Uber Technologies Inc', 'MANUAL', TRUE),
('56585A102', 'MRNA', 'Moderna Inc', 'MANUAL', TRUE),
('742935101', 'PLD', 'Prologis Inc', 'MANUAL', TRUE),
('03027X100', 'AMT', 'American Tower Corp', 'MANUAL', TRUE),
('H1467J104', 'CB', 'Chubb Ltd', 'MANUAL', TRUE),
('500754106', 'KHC', 'Kraft Heinz Co', 'MANUAL', TRUE),
('74460D109', 'PSX', 'Phillips 66', 'MANUAL', TRUE),
('576323109', 'MDLZ', 'Mondelez International Inc', 'MANUAL', TRUE),
('45866F104', 'ICE', 'Intercontinental Exchange Inc', 'MANUAL', TRUE),
('92343E102', 'VRSN', 'Verisign Inc', 'MANUAL', TRUE),
('031162100', 'AMGN', 'Amgen Inc', 'MANUAL', TRUE),
('98978V103', 'ZTS', 'Zoetis Inc', 'MANUAL', TRUE),
('88579Y101', 'MMM', '3M Co', 'MANUAL', TRUE),
('24478K103', 'DE', 'Deere & Co', 'MANUAL', TRUE),
('826809100', 'SHW', 'Sherwin-Williams Co', 'MANUAL', TRUE),
('571900102', 'MAR', 'Marriott International Inc', 'MANUAL', TRUE),
('46284V101', 'ISRG', 'Intuitive Surgical Inc', 'MANUAL', TRUE),
-- Semi & Tech additions
('88160G103', 'TSM', 'Taiwan Semiconductor Mfg Co', 'MANUAL', TRUE),
('00287Y109', 'ABNB', 'Airbnb Inc', 'MANUAL', TRUE),
('84265V105', 'SPOT', 'Spotify Technology SA', 'MANUAL', TRUE),
('816851109', 'SQ', 'Block Inc', 'MANUAL', TRUE),
('79468M107', 'SNOW', 'Snowflake Inc', 'MANUAL', TRUE),
('26441C204', 'DDOG', 'Datadog Inc', 'MANUAL', TRUE),
('98422D105', 'ZM', 'Zoom Video Communications Inc', 'MANUAL', TRUE),
('22266T109', 'CRWD', 'CrowdStrike Holdings Inc', 'MANUAL', TRUE),
('68902V107', 'ORCL', 'Oracle Corp', 'MANUAL', TRUE),
('29355A107', 'ENPH', 'Enphase Energy Inc', 'MANUAL', TRUE),
('00971T101', 'AMAT', 'Applied Materials Inc', 'MANUAL', TRUE),
('549498100', 'NOW', 'ServiceNow Inc', 'MANUAL', TRUE),
('48203R104', 'KLAC', 'KLA Corp', 'MANUAL', TRUE),
('53578A108', 'LRCX', 'Lam Research Corp', 'MANUAL', TRUE),
('032654105', 'AMD', 'Advanced Micro Devices Inc', 'MANUAL', TRUE),
-- More financials
('92826C839', 'V', 'Visa Inc', 'MANUAL', TRUE),
('06738C101', 'BX', 'Blackstone Inc', 'MANUAL', TRUE),
('14913Q104', 'SCHW', 'Charles Schwab Corp', 'MANUAL', TRUE),
('075887109', 'BLK', 'BlackRock Inc', 'MANUAL', TRUE),
('268150109', 'SPGI', 'S&P Global Inc', 'MANUAL', TRUE),
('595112103', 'MCO', 'Moody''s Corp', 'MANUAL', TRUE),
('92532F100', 'VZ', 'Verizon Communications Inc', 'MANUAL', TRUE),
('00206R102', 'T', 'AT&T Inc', 'MANUAL', TRUE),
('87612E106', 'TMUS', 'T-Mobile US Inc', 'MANUAL', TRUE)
ON CONFLICT (cusip) DO UPDATE SET
  ticker = EXCLUDED.ticker,
  issuer_name = EXCLUDED.issuer_name,
  verified = EXCLUDED.verified,
  updated_at = NOW();

-- ============================================================================
-- 12. SEED KNOWN INSTITUTIONAL INVESTORS
-- ============================================================================
INSERT INTO institutional_investors (cik, name, normalized_name, investor_type) VALUES
-- Index Funds & Asset Managers
('102909', 'VANGUARD GROUP INC', 'VANGUARD_GROUP_INC', 'Index Fund'),
('1364742', 'BLACKROCK INC.', 'BLACKROCK_INC', 'Index Fund'),
('93751', 'STATE STREET CORP', 'STATE_STREET_CORP', 'Index Fund'),
('315066', 'FMR LLC', 'FMR_LLC', 'Asset Manager'),
('1166559', 'GEODE CAPITAL MANAGEMENT, LLC', 'GEODE_CAPITAL_MANAGEMENT_LLC', 'Index Fund'),
('70769', 'NORTHERN TRUST CORP', 'NORTHERN_TRUST_CORP', 'Asset Manager'),
-- Banks
('19617', 'JPMORGAN CHASE & CO', 'JPMORGAN_CHASE', 'Bank'),
('895421', 'MORGAN STANLEY', 'MORGAN_STANLEY', 'Bank'),
('886982', 'GOLDMAN SACHS GROUP INC', 'GOLDMAN_SACHS', 'Bank'),
('1067983', 'BERKSHIRE HATHAWAY INC', 'BERKSHIRE_HATHAWAY_INC', 'Conglomerate'),
-- Hedge Funds
('1423053', 'Citadel Advisors Llc', 'CITADEL_ADVISORS_LLC', 'Hedge Fund'),
('1350694', 'BRIDGEWATER ASSOCIATES, LP', 'BRIDGEWATER_ASSOCIATES_LP', 'Hedge Fund'),
('1037389', 'RENAISSANCE TECHNOLOGIES LLC', 'RENAISSANCE_TECHNOLOGIES_LLC', 'Hedge Fund'),
('1179392', 'TWO SIGMA INVESTMENTS, LP', 'TWO_SIGMA_INVESTMENTS_LP', 'Hedge Fund'),
('1029160', 'SOROS FUND MANAGEMENT LLC', 'SOROS_FUND_MANAGEMENT_LLC', 'Hedge Fund'),
('1336528', 'PERSHING SQUARE CAPITAL MANAGEMENT, L.P.', 'PERSHING_SQUARE_CAPITAL_MANAGEMENT_LP', 'Hedge Fund'),
('1167483', 'Tiger Global Management, LLC', 'TIGER_GLOBAL_MANAGEMENT_LLC', 'Hedge Fund'),
('1040273', 'THIRD POINT LLC', 'THIRD_POINT_LLC', 'Hedge Fund'),
('1048445', 'Elliott Investment Management L.P.', 'ELLIOTT_INVESTMENT_MANAGEMENT_LP', 'Hedge Fund'),
('1656456', 'APPALOOSA LP', 'APPALOOSA_LP', 'Hedge Fund'),
('1510199', 'D. E. Shaw & Co., L.P.', 'DE_SHAW_LP', 'Hedge Fund'),
('1582202', 'Norges Bank', 'NORGES_BANK', 'Sovereign Wealth'),
('909012', 'T. Rowe Price Associates, Inc.', 'T_ROWE_PRICE_ASSOCIATES_INC', 'Asset Manager'),
('1037389', 'RENAISSANCE TECHNOLOGIES LLC', 'RENAISSANCE_TECHNOLOGIES_LLC', 'Hedge Fund'),
('807985', 'CAPITAL WORLD INVESTORS', 'CAPITAL_WORLD_INVESTORS', 'Asset Manager'),
('1037644', 'CAPITAL RESEARCH GLOBAL INVESTORS', 'CAPITAL_RESEARCH_GLOBAL_INVESTORS', 'Asset Manager')
ON CONFLICT (cik) DO UPDATE SET
  name = EXCLUDED.name,
  normalized_name = EXCLUDED.normalized_name,
  investor_type = EXCLUDED.investor_type,
  updated_at = NOW();

-- ============================================================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================================================
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- Done!
-- ============================================================================
COMMENT ON TABLE institutional_holdings IS 'SEC Form 13F holdings data - Financial Datasets compatible';
COMMENT ON TABLE institutional_investors IS 'Institutional investors who file 13F reports';
COMMENT ON TABLE institutional_changes IS 'Pre-calculated quarter-over-quarter position changes';
COMMENT ON TABLE cusip_mappings IS 'CUSIP to ticker symbol mappings';
