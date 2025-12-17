-- Price Targets table for analyst price targets
CREATE TABLE IF NOT EXISTS price_targets (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,

  -- Analyst info
  analyst_name VARCHAR(255),
  analyst_company VARCHAR(255),

  -- Rating
  rating VARCHAR(50),
  rating_prior VARCHAR(50),

  -- Price targets
  price_target NUMERIC(20, 2),
  price_target_prior NUMERIC(20, 2),

  -- Date
  reported_date DATE,

  -- Source tracking
  source VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticker, analyst_company, reported_date)
);

-- Indexes for price_targets
CREATE INDEX IF NOT EXISTS idx_price_targets_ticker ON price_targets(ticker);
CREATE INDEX IF NOT EXISTS idx_price_targets_date ON price_targets(reported_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_targets_ticker_date ON price_targets(ticker, reported_date DESC);

-- Add source column to analyst_estimates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analyst_estimates' AND column_name = 'source'
  ) THEN
    ALTER TABLE analyst_estimates ADD COLUMN source VARCHAR(50);
  END IF;
END $$;

-- Add cron jobs for analyst estimates sync
-- Morning sync (8 AM UTC) - first batch of 100 tickers
SELECT cron.schedule(
  'sync-analyst-estimates-morning',
  '0 8 * * 1-5',
  $$
  SELECT net.http_get(
    url := current_setting('app.settings.base_url') || '/api/cron/sync-analyst-estimates?limit=100&offset=0',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);

-- Afternoon sync (2 PM UTC) - second batch of 100 tickers
SELECT cron.schedule(
  'sync-analyst-estimates-afternoon',
  '0 14 * * 1-5',
  $$
  SELECT net.http_get(
    url := current_setting('app.settings.base_url') || '/api/cron/sync-analyst-estimates?limit=100&offset=100',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);

-- Evening sync (8 PM UTC) - third batch
SELECT cron.schedule(
  'sync-analyst-estimates-evening',
  '0 20 * * 1-5',
  $$
  SELECT net.http_get(
    url := current_setting('app.settings.base_url') || '/api/cron/sync-analyst-estimates?limit=100&offset=200',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);

COMMENT ON TABLE price_targets IS 'Analyst price targets from Financial Datasets API';
