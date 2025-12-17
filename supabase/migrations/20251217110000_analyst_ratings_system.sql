-- Analyst Ratings System - Our own TipRanks-style data collection
-- Scrapes press releases and news to extract analyst ratings

-- Investment firms/banks that employ analysts
CREATE TABLE IF NOT EXISTS analyst_firms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  aliases TEXT[], -- Alternative names (e.g., "GS" for "Goldman Sachs")
  tier VARCHAR(20) DEFAULT 'unknown', -- tier1, tier2, boutique, unknown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual analysts
CREATE TABLE IF NOT EXISTS analysts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  firm_id INT REFERENCES analyst_firms(id),

  -- Performance tracking
  total_ratings INT DEFAULT 0,
  successful_ratings INT DEFAULT 0, -- Ratings where stock moved in predicted direction
  average_return NUMERIC(10, 4), -- Average return on their picks
  success_rate NUMERIC(5, 4), -- Percentage of successful calls

  -- TipRanks-style ranking
  rank_score NUMERIC(10, 4), -- Calculated score based on accuracy
  rank_percentile INT, -- Top X% of analysts

  sectors TEXT[], -- Sectors they cover

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(name, firm_id)
);

-- Individual analyst ratings (the core data)
CREATE TABLE IF NOT EXISTS analyst_ratings (
  id BIGSERIAL PRIMARY KEY,

  -- The rating
  ticker VARCHAR(20) NOT NULL,
  analyst_id INT REFERENCES analysts(id),
  firm_id INT REFERENCES analyst_firms(id),

  -- Rating details
  rating VARCHAR(50) NOT NULL, -- Buy, Hold, Sell, Overweight, etc.
  rating_prior VARCHAR(50), -- Previous rating if upgrade/downgrade
  action VARCHAR(50), -- initiated, upgraded, downgraded, maintained, reiterated

  -- Price target
  price_target NUMERIC(20, 2),
  price_target_prior NUMERIC(20, 2),

  -- Price at time of rating (for performance tracking)
  price_at_rating NUMERIC(20, 2),

  -- Performance tracking (filled in later)
  price_1d NUMERIC(20, 2), -- Price 1 day after
  price_1w NUMERIC(20, 2), -- Price 1 week after
  price_1m NUMERIC(20, 2), -- Price 1 month after
  price_3m NUMERIC(20, 2), -- Price 3 months after
  return_1d NUMERIC(10, 4),
  return_1w NUMERIC(10, 4),
  return_1m NUMERIC(10, 4),
  return_3m NUMERIC(10, 4),

  -- Source tracking
  rating_date DATE NOT NULL,
  source_url TEXT,
  source_type VARCHAR(50), -- press_release, news_article, sec_filing
  source_name VARCHAR(255), -- PR Newswire, Reuters, etc.
  raw_text TEXT, -- Original text snippet for verification

  -- Processing
  confidence NUMERIC(5, 4), -- NLP extraction confidence
  verified BOOLEAN DEFAULT FALSE, -- Manually verified

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(ticker, analyst_id, rating_date, rating)
);

-- Scraped articles (to track what we've processed)
CREATE TABLE IF NOT EXISTS analyst_news_sources (
  id BIGSERIAL PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  source_name VARCHAR(255),
  published_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT FALSE,
  ratings_extracted INT DEFAULT 0,
  raw_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyst_ratings_ticker ON analyst_ratings(ticker);
CREATE INDEX IF NOT EXISTS idx_analyst_ratings_date ON analyst_ratings(rating_date DESC);
CREATE INDEX IF NOT EXISTS idx_analyst_ratings_analyst ON analyst_ratings(analyst_id);
CREATE INDEX IF NOT EXISTS idx_analyst_ratings_firm ON analyst_ratings(firm_id);
CREATE INDEX IF NOT EXISTS idx_analyst_ratings_ticker_date ON analyst_ratings(ticker, rating_date DESC);
CREATE INDEX IF NOT EXISTS idx_analysts_rank ON analysts(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_analysts_success ON analysts(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_news_sources_processed ON analyst_news_sources(processed, created_at);

-- Seed major analyst firms
INSERT INTO analyst_firms (name, aliases, tier) VALUES
  ('Goldman Sachs', ARRAY['GS', 'Goldman']::TEXT[], 'tier1'),
  ('Morgan Stanley', ARRAY['MS']::TEXT[], 'tier1'),
  ('JPMorgan', ARRAY['JPM', 'JP Morgan', 'J.P. Morgan']::TEXT[], 'tier1'),
  ('Bank of America', ARRAY['BofA', 'Merrill Lynch', 'BofA Securities']::TEXT[], 'tier1'),
  ('Citigroup', ARRAY['Citi', 'Citibank']::TEXT[], 'tier1'),
  ('Wells Fargo', ARRAY['WFC']::TEXT[], 'tier1'),
  ('Barclays', '{}'::TEXT[], 'tier1'),
  ('UBS', '{}'::TEXT[], 'tier1'),
  ('Credit Suisse', ARRAY['CS']::TEXT[], 'tier1'),
  ('Deutsche Bank', ARRAY['DB']::TEXT[], 'tier1'),
  ('HSBC', '{}'::TEXT[], 'tier1'),
  ('RBC Capital Markets', ARRAY['RBC', 'Royal Bank of Canada']::TEXT[], 'tier1'),
  ('Jefferies', '{}'::TEXT[], 'tier2'),
  ('Piper Sandler', ARRAY['Piper Jaffray']::TEXT[], 'tier2'),
  ('Stifel', ARRAY['Stifel Nicolaus']::TEXT[], 'tier2'),
  ('Raymond James', '{}'::TEXT[], 'tier2'),
  ('Wedbush', ARRAY['Wedbush Securities']::TEXT[], 'tier2'),
  ('Needham', ARRAY['Needham & Company']::TEXT[], 'tier2'),
  ('Oppenheimer', '{}'::TEXT[], 'tier2'),
  ('Cowen', ARRAY['Cowen and Company']::TEXT[], 'tier2'),
  ('Canaccord Genuity', ARRAY['Canaccord']::TEXT[], 'tier2'),
  ('BMO Capital Markets', ARRAY['BMO']::TEXT[], 'tier2'),
  ('KeyBanc', ARRAY['KeyBanc Capital Markets']::TEXT[], 'tier2'),
  ('Wolfe Research', '{}'::TEXT[], 'tier2'),
  ('Bernstein', ARRAY['Sanford Bernstein', 'AllianceBernstein']::TEXT[], 'tier2'),
  ('Evercore', ARRAY['Evercore ISI']::TEXT[], 'tier2'),
  ('Loop Capital', '{}'::TEXT[], 'boutique'),
  ('DA Davidson', ARRAY['D.A. Davidson']::TEXT[], 'boutique'),
  ('Rosenblatt Securities', ARRAY['Rosenblatt']::TEXT[], 'boutique'),
  ('Mizuho', ARRAY['Mizuho Securities']::TEXT[], 'tier2'),
  ('Susquehanna', ARRAY['Susquehanna International Group', 'SIG']::TEXT[], 'tier2'),
  ('Truist', ARRAY['Truist Securities', 'SunTrust']::TEXT[], 'tier2'),
  ('BofA Securities', '{}'::TEXT[], 'tier1'),
  ('Argus Research', ARRAY['Argus']::TEXT[], 'boutique'),
  ('CFRA', ARRAY['CFRA Research']::TEXT[], 'boutique'),
  ('Morningstar', '{}'::TEXT[], 'tier2'),
  ('Zacks', ARRAY['Zacks Investment Research']::TEXT[], 'boutique')
ON CONFLICT (name) DO NOTHING;

-- Function to normalize rating names
CREATE OR REPLACE FUNCTION normalize_rating(raw_rating TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN CASE LOWER(TRIM(raw_rating))
    WHEN 'buy' THEN 'Buy'
    WHEN 'strong buy' THEN 'Strong Buy'
    WHEN 'outperform' THEN 'Outperform'
    WHEN 'overweight' THEN 'Overweight'
    WHEN 'accumulate' THEN 'Buy'
    WHEN 'positive' THEN 'Buy'
    WHEN 'hold' THEN 'Hold'
    WHEN 'neutral' THEN 'Hold'
    WHEN 'equal weight' THEN 'Hold'
    WHEN 'equal-weight' THEN 'Hold'
    WHEN 'market perform' THEN 'Hold'
    WHEN 'sector perform' THEN 'Hold'
    WHEN 'peer perform' THEN 'Hold'
    WHEN 'in-line' THEN 'Hold'
    WHEN 'inline' THEN 'Hold'
    WHEN 'sell' THEN 'Sell'
    WHEN 'underperform' THEN 'Underperform'
    WHEN 'underweight' THEN 'Underweight'
    WHEN 'reduce' THEN 'Sell'
    WHEN 'negative' THEN 'Sell'
    ELSE INITCAP(TRIM(raw_rating))
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate analyst performance
CREATE OR REPLACE FUNCTION update_analyst_performance(p_analyst_id INT)
RETURNS VOID AS $$
DECLARE
  v_total INT;
  v_successful INT;
  v_avg_return NUMERIC;
BEGIN
  -- Count total and successful ratings (where 1-month return matches prediction direction)
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE
      (rating IN ('Buy', 'Strong Buy', 'Outperform', 'Overweight') AND return_1m > 0) OR
      (rating IN ('Sell', 'Underperform', 'Underweight') AND return_1m < 0) OR
      (rating = 'Hold' AND ABS(return_1m) < 0.05)
    ),
    AVG(return_1m)
  INTO v_total, v_successful, v_avg_return
  FROM analyst_ratings
  WHERE analyst_id = p_analyst_id AND return_1m IS NOT NULL;

  UPDATE analysts
  SET
    total_ratings = v_total,
    successful_ratings = v_successful,
    average_return = v_avg_return,
    success_rate = CASE WHEN v_total > 0 THEN v_successful::NUMERIC / v_total ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_analyst_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE analyst_ratings IS 'Individual analyst ratings scraped from news and press releases';
COMMENT ON TABLE analysts IS 'Individual analysts with performance tracking';
COMMENT ON TABLE analyst_firms IS 'Investment banks and research firms';
COMMENT ON TABLE analyst_news_sources IS 'Processed news sources for deduplication';

-- Cron jobs for analyst ratings system

-- Scrape analyst ratings every 2 hours on weekdays
SELECT cron.schedule(
  'scrape-analyst-ratings',
  '0 */2 * * 1-5',
  $$
  SELECT net.http_get(
    url := current_setting('app.settings.base_url') || '/api/cron/sync-analyst-ratings',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);

-- Update analyst performance daily at 6 AM UTC
SELECT cron.schedule(
  'update-analyst-performance',
  '0 6 * * *',
  $$
  SELECT net.http_get(
    url := current_setting('app.settings.base_url') || '/api/cron/update-analyst-performance',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);
