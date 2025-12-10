-- Prices and News Database Schema
-- Replicating Financial Datasets API - Stock prices and company news
-- Migration: 20251210000003_prices_news.sql

-- ============================================================================
-- 1. STOCK PRICES TABLE (OHLCV data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_prices (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,

  -- Date
  date DATE NOT NULL,

  -- OHLCV
  open NUMERIC(20, 4),
  high NUMERIC(20, 4),
  low NUMERIC(20, 4),
  close NUMERIC(20, 4),
  volume BIGINT,

  -- Adjusted prices (for splits/dividends)
  adj_open NUMERIC(20, 4),
  adj_high NUMERIC(20, 4),
  adj_low NUMERIC(20, 4),
  adj_close NUMERIC(20, 4),
  adj_volume BIGINT,

  -- Additional data
  vwap NUMERIC(20, 4),
  change NUMERIC(20, 4),
  change_percent NUMERIC(10, 4),

  -- Source
  source VARCHAR(20) DEFAULT 'EODHD',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticker, date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prices_ticker ON stock_prices(ticker);
CREATE INDEX IF NOT EXISTS idx_prices_date ON stock_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_prices_ticker_date ON stock_prices(ticker, date DESC);

-- ============================================================================
-- 2. STOCK PRICES SNAPSHOT (Latest prices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_prices_snapshot (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL UNIQUE,

  -- Latest price data
  date DATE NOT NULL,
  open NUMERIC(20, 4),
  high NUMERIC(20, 4),
  low NUMERIC(20, 4),
  close NUMERIC(20, 4),
  volume BIGINT,

  -- Previous day
  prev_close NUMERIC(20, 4),

  -- Change
  change NUMERIC(20, 4),
  change_percent NUMERIC(10, 4),

  -- 52-week
  high_52_week NUMERIC(20, 4),
  low_52_week NUMERIC(20, 4),

  -- Averages
  avg_volume_10d BIGINT,
  avg_volume_30d BIGINT,

  -- Market cap (if available)
  market_cap BIGINT,

  -- Last update
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_ticker ON stock_prices_snapshot(ticker);

-- ============================================================================
-- 3. CRYPTO PRICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL, -- BTC, ETH, etc.
  base_currency VARCHAR(10) DEFAULT 'USD',

  -- Date
  date DATE NOT NULL,

  -- OHLCV
  open NUMERIC(30, 8),
  high NUMERIC(30, 8),
  low NUMERIC(30, 8),
  close NUMERIC(30, 8),
  volume NUMERIC(30, 2),

  -- Market cap
  market_cap NUMERIC(30, 2),

  -- Source
  source VARCHAR(20),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(symbol, base_currency, date)
);

CREATE INDEX IF NOT EXISTS idx_crypto_symbol ON crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_date ON crypto_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_symbol_date ON crypto_prices(symbol, date DESC);

-- ============================================================================
-- 4. COMPANY NEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_news (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20),

  -- Article info
  title TEXT NOT NULL,
  author VARCHAR(200),
  source VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,

  -- Content
  summary TEXT,
  content TEXT,

  -- Date
  date TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,

  -- Sentiment (optional)
  sentiment VARCHAR(20), -- positive, negative, neutral
  sentiment_score NUMERIC(5, 4), -- -1.0 to 1.0

  -- Categories/tags
  categories TEXT[],
  tags TEXT[],

  -- Source metadata
  source_id VARCHAR(100),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(url)
);

CREATE INDEX IF NOT EXISTS idx_news_ticker ON company_news(ticker);
CREATE INDEX IF NOT EXISTS idx_news_date ON company_news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_ticker_date ON company_news(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON company_news(source);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON company_news(sentiment);

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_news_title_fts ON company_news USING gin(to_tsvector('english', title));

-- ============================================================================
-- 5. NEWS SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS news_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  url VARCHAR(500),
  rss_url VARCHAR(500),

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,

  -- Stats
  last_fetched TIMESTAMPTZ,
  articles_count INT DEFAULT 0,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed news sources
INSERT INTO news_sources (name, url, rss_url, is_active) VALUES
  ('Reuters', 'https://www.reuters.com', 'https://www.reuters.com/rssFeed/businessNews', TRUE),
  ('Investing.com', 'https://www.investing.com', NULL, TRUE),
  ('The Motley Fool', 'https://www.fool.com', 'https://www.fool.com/feeds/index.aspx', TRUE),
  ('Yahoo Finance', 'https://finance.yahoo.com', 'https://finance.yahoo.com/rss/', TRUE),
  ('Seeking Alpha', 'https://seekingalpha.com', NULL, TRUE),
  ('CNBC', 'https://www.cnbc.com', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', TRUE),
  ('Bloomberg', 'https://www.bloomberg.com', NULL, TRUE),
  ('MarketWatch', 'https://www.marketwatch.com', 'http://feeds.marketwatch.com/marketwatch/topstories/', TRUE),
  ('Barrons', 'https://www.barrons.com', NULL, TRUE),
  ('Wall Street Journal', 'https://www.wsj.com', NULL, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 6. SEC FILINGS TABLE
-- ============================================================================
-- Add missing columns to existing sec_filings table if they don't exist
DO $$
BEGIN
  -- Add cik column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'cik') THEN
    ALTER TABLE sec_filings ADD COLUMN cik VARCHAR(10);
  END IF;
  -- Add ticker column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'ticker') THEN
    ALTER TABLE sec_filings ADD COLUMN ticker VARCHAR(20);
  END IF;
  -- Add report_date column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'report_date') THEN
    ALTER TABLE sec_filings ADD COLUMN report_date DATE;
  END IF;
  -- Add accepted_datetime column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'accepted_datetime') THEN
    ALTER TABLE sec_filings ADD COLUMN accepted_datetime TIMESTAMPTZ;
  END IF;
  -- Add primary_document column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'primary_document') THEN
    ALTER TABLE sec_filings ADD COLUMN primary_document VARCHAR(200);
  END IF;
  -- Add primary_doc_description column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'primary_doc_description') THEN
    ALTER TABLE sec_filings ADD COLUMN primary_doc_description TEXT;
  END IF;
  -- Add documents_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'documents_url') THEN
    ALTER TABLE sec_filings ADD COLUMN documents_url TEXT;
  END IF;
  -- Add items column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'items') THEN
    ALTER TABLE sec_filings ADD COLUMN items TEXT[];
  END IF;
  -- Add is_processed column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'is_processed') THEN
    ALTER TABLE sec_filings ADD COLUMN is_processed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes if they don't exist (will skip if column doesn't exist)
CREATE INDEX IF NOT EXISTS idx_filings_cik ON sec_filings(cik);
CREATE INDEX IF NOT EXISTS idx_filings_ticker ON sec_filings(ticker);
CREATE INDEX IF NOT EXISTS idx_filings_type ON sec_filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_filings_date ON sec_filings(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_filings_ticker_date ON sec_filings(ticker, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_filings_ticker_type ON sec_filings(ticker, filing_type);

-- ============================================================================
-- 7. ANALYST ESTIMATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analyst_estimates (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10),
  ticker VARCHAR(20) NOT NULL,

  -- Period
  fiscal_period DATE NOT NULL,
  period VARCHAR(20) NOT NULL, -- annual, quarterly

  -- EPS estimates
  eps_estimate NUMERIC(20, 4),
  eps_estimate_mean NUMERIC(20, 4),
  eps_estimate_high NUMERIC(20, 4),
  eps_estimate_low NUMERIC(20, 4),
  eps_actual NUMERIC(20, 4),
  eps_surprise NUMERIC(20, 4),
  eps_surprise_percent NUMERIC(10, 4),

  -- Revenue estimates
  revenue_estimate NUMERIC(20, 0),
  revenue_estimate_mean NUMERIC(20, 0),
  revenue_estimate_high NUMERIC(20, 0),
  revenue_estimate_low NUMERIC(20, 0),
  revenue_actual NUMERIC(20, 0),
  revenue_surprise NUMERIC(20, 0),
  revenue_surprise_percent NUMERIC(10, 4),

  -- Analyst count
  num_analysts INT,

  -- Source
  source VARCHAR(50),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticker, fiscal_period, period)
);

CREATE INDEX IF NOT EXISTS idx_estimates_ticker ON analyst_estimates(ticker);
CREATE INDEX IF NOT EXISTS idx_estimates_period ON analyst_estimates(fiscal_period DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_ticker_period ON analyst_estimates(ticker, fiscal_period DESC);

-- ============================================================================
-- 8. INTEREST RATES TABLE (Macro data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interest_rates (
  id BIGSERIAL PRIMARY KEY,
  rate_type VARCHAR(50) NOT NULL, -- fed_funds, prime, 10y_treasury, etc.

  -- Date
  date DATE NOT NULL,

  -- Value
  rate NUMERIC(10, 4) NOT NULL,

  -- Source
  source VARCHAR(50) DEFAULT 'FRED',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(rate_type, date)
);

CREATE INDEX IF NOT EXISTS idx_rates_type ON interest_rates(rate_type);
CREATE INDEX IF NOT EXISTS idx_rates_date ON interest_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_rates_type_date ON interest_rates(rate_type, date DESC);

-- Seed rate types
INSERT INTO interest_rates (rate_type, date, rate, source) VALUES
  ('fed_funds', '2024-01-01', 5.33, 'FRED'),
  ('prime', '2024-01-01', 8.50, 'FRED'),
  ('10y_treasury', '2024-01-01', 3.95, 'FRED'),
  ('2y_treasury', '2024-01-01', 4.25, 'FRED'),
  ('30y_mortgage', '2024-01-01', 6.62, 'FRED')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. ECONOMIC INDICATORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS economic_indicators (
  id BIGSERIAL PRIMARY KEY,
  indicator VARCHAR(50) NOT NULL, -- gdp, cpi, unemployment, etc.

  -- Date
  date DATE NOT NULL,

  -- Value
  value NUMERIC(20, 4) NOT NULL,
  unit VARCHAR(20), -- percent, billions_usd, etc.

  -- Change
  change_percent NUMERIC(10, 4),
  yoy_change_percent NUMERIC(10, 4),

  -- Source
  source VARCHAR(50) DEFAULT 'FRED',

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(indicator, date)
);

CREATE INDEX IF NOT EXISTS idx_econ_indicator ON economic_indicators(indicator);
CREATE INDEX IF NOT EXISTS idx_econ_date ON economic_indicators(date DESC);

-- ============================================================================
-- 10. DATA SYNC LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_data_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- PRICES, NEWS, FILINGS, RATES

  -- Target
  ticker VARCHAR(20),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'RUNNING',

  -- Stats
  records_processed INT DEFAULT 0,
  records_created INT DEFAULT 0,
  records_updated INT DEFAULT 0,

  -- Errors
  error_count INT DEFAULT 0,
  error_message TEXT,

  -- Parameters
  parameters JSONB
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE stock_prices IS 'Historical OHLCV stock price data';
COMMENT ON TABLE stock_prices_snapshot IS 'Latest stock price snapshot';
COMMENT ON TABLE crypto_prices IS 'Historical cryptocurrency prices';
COMMENT ON TABLE company_news IS 'Company news articles';
COMMENT ON TABLE sec_filings IS 'SEC filing metadata';
COMMENT ON TABLE analyst_estimates IS 'Analyst earnings and revenue estimates';
COMMENT ON TABLE interest_rates IS 'Historical interest rate data';
