-- Add cron jobs for syncing biotech clinical trials data
-- Runs incrementally to handle thousands of companies

-- Function to sync clinical trials via HTTP (rotating batches)
CREATE OR REPLACE FUNCTION sync_clinical_trials_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  -- Sync trials in batches of 10 companies (rate limited)
  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-biotech?batch=10',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  -- Log execution
  INSERT INTO cron_job_log (job_name, status, details)
  VALUES ('sync-clinical-trials', 'triggered', '{"batch_size": 10}'::jsonb);

  RAISE NOTICE 'Clinical trials sync triggered at %', NOW();
END;
$$;

-- Function to discover new biotech companies weekly
CREATE OR REPLACE FUNCTION discover_biotech_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  -- Discover and sync new biotech companies
  PERFORM net.http_post(
    url := api_url || '/api/biotech-discovery?mode=sync&limit=50',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  INSERT INTO cron_job_log (job_name, status, details)
  VALUES ('discover-biotech', 'triggered', '{"limit": 50}'::jsonb);

  RAISE NOTICE 'Biotech discovery triggered at %', NOW();
END;
$$;

-- Schedule clinical trials sync: Every 4 hours
-- At this rate, 10 companies/run × 6 runs/day = 60 companies/day
-- Full cycle through 2000 companies = ~33 days
SELECT cron.schedule(
  'sync-clinical-trials-4h',
  '0 */4 * * *',
  $$SELECT sync_clinical_trials_cron()$$
);

-- Schedule biotech discovery: Weekly on Sunday at 4:00 AM UTC
-- Finds new biotech companies to track
SELECT cron.schedule(
  'discover-biotech-weekly',
  '0 4 * * 0',
  $$SELECT discover_biotech_cron()$$
);

-- Also run a more frequent batch during weekdays for faster initial sync
-- Runs at 10 AM and 4 PM UTC on weekdays
SELECT cron.schedule(
  'sync-clinical-trials-weekday-1',
  '0 10 * * 1-5',
  $$SELECT sync_clinical_trials_cron()$$
);

SELECT cron.schedule(
  'sync-clinical-trials-weekday-2',
  '0 16 * * 1-5',
  $$SELECT sync_clinical_trials_cron()$$
);

COMMENT ON FUNCTION sync_clinical_trials_cron IS 'Triggers incremental sync of clinical trials from ClinicalTrials.gov';
COMMENT ON FUNCTION discover_biotech_cron IS 'Discovers new biotech companies from SEC EDGAR and EODHD';
