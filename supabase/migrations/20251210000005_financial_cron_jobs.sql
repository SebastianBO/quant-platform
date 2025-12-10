-- Financial Data Sync Cron Jobs
-- Uses pg_cron + pg_net to call our Vercel API endpoints automatically
-- Runs every minute for bulk sync, every 5 min for new filings

-- Extensions should already exist, just verify
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    CREATE EXTENSION pg_net;
  END IF;
END $$;

-- Job 1: Bulk Financial Sync (every minute)
-- Syncs ~5 companies per minute = 7,200/day = full sync in 1.5 days
SELECT cron.schedule(
  'bulk-financial-sync',
  '* * * * *',  -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-financials?mode=continue&limit=5',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Job 2: Watch New SEC Filings (every 5 minutes)
-- Catches new earnings releases within 5 minutes of SEC publication
SELECT cron.schedule(
  'watch-sec-filings',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/watch-filings',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Job 3: Priority Ticker Refresh (hourly)
-- Refreshes top 100 companies hourly for most current data
SELECT cron.schedule(
  'priority-ticker-refresh',
  '0 * * * *',  -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-financials?mode=priority&limit=20',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Job 4: 13F Institutional Holdings Sync (daily at 6am UTC)
-- Syncs 13F filings which are updated quarterly
SELECT cron.schedule(
  'sync-13f-holdings',
  '0 6 * * *',  -- Daily at 6am UTC
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/financials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "13f", "limit": 50}'::jsonb
  );
  $$
);

-- Job 5: Insider Trading Sync (every 30 minutes during market hours)
-- Form 4 filings can come in frequently
SELECT cron.schedule(
  'sync-insider-trades',
  '*/30 14-21 * * 1-5',  -- Every 30 min, 9am-4pm EST (14-21 UTC), Mon-Fri
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/financials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "insider", "limit": 100}'::jsonb
  );
  $$
);

-- Job 6: Short Volume Sync (daily at 7pm UTC / 2pm EST after FINRA publishes)
SELECT cron.schedule(
  'sync-short-volume',
  '0 19 * * 1-5',  -- Daily at 7pm UTC (2pm EST), Mon-Fri
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/short-volume/backfill',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"days": 1}'::jsonb
  );
  $$
);

-- Create view to monitor cron jobs
CREATE OR REPLACE VIEW public.cron_job_status AS
SELECT
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  s.last_run_status,
  s.last_run_time,
  s.last_error_message
FROM cron.job j
LEFT JOIN (
  SELECT DISTINCT ON (jobid)
    jobid,
    status as last_run_status,
    start_time as last_run_time,
    return_message as last_error_message
  FROM cron.job_run_details
  ORDER BY jobid, start_time DESC
) s ON j.jobid = s.jobid
ORDER BY j.jobname;

-- Grant access to view
GRANT SELECT ON public.cron_job_status TO authenticated;

COMMENT ON VIEW public.cron_job_status IS 'Monitor pg_cron job status and last run results';
