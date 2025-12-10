-- pg_cron and pg_net are already enabled on Supabase
-- This migration sets up cron jobs to call our sync endpoints

-- Store the API URL for cron jobs
CREATE TABLE IF NOT EXISTS cron_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO cron_config (key, value) VALUES
  ('api_base_url', 'https://lician.com')
ON CONFLICT (key) DO NOTHING;

-- Function to sync short volume data via HTTP
CREATE OR REPLACE FUNCTION sync_short_volume_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  -- Call the sync endpoint using pg_net
  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-short-volume?priority=true',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Short volume sync triggered at %', NOW();
END;
$$;

-- Function to sync financials data via HTTP
CREATE OR REPLACE FUNCTION sync_financials_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-financials?mode=continue&limit=10',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Financials sync triggered at %', NOW();
END;
$$;

-- Function to sync portfolios via HTTP
CREATE OR REPLACE FUNCTION sync_portfolios_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-portfolios',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Portfolio sync triggered at %', NOW();
END;
$$;

-- Schedule cron jobs (times are in UTC)
-- Short volume sync: Daily at 9:30 PM UTC (4:30 PM EST after market close)
SELECT cron.schedule(
  'sync-short-volume-daily',
  '30 21 * * 1-5',
  $$SELECT sync_short_volume_cron()$$
);

-- Financials sync: Daily at 6:00 AM UTC
SELECT cron.schedule(
  'sync-financials-daily',
  '0 6 * * *',
  $$SELECT sync_financials_cron()$$
);

-- Portfolio sync: Weekdays at 9:00 PM UTC
SELECT cron.schedule(
  'sync-portfolios-daily',
  '0 21 * * 1-5',
  $$SELECT sync_portfolios_cron()$$
);

-- Table to log cron job executions
CREATE TABLE IF NOT EXISTS cron_job_log (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'triggered',
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_cron_job_log_name ON cron_job_log(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_log_executed_at ON cron_job_log(executed_at DESC);

COMMENT ON TABLE cron_config IS 'Configuration for cron jobs including API URLs';
COMMENT ON TABLE cron_job_log IS 'Log of cron job executions';
