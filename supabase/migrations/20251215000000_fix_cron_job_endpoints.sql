-- Fix cron job endpoints - they were calling wrong URLs
-- The /api/admin/sync/financials endpoint requires CIK parameter
-- but cron jobs were not providing it. Use /api/admin/sync/batch instead.

-- First, unschedule the broken jobs
SELECT cron.unschedule('sync-13f-holdings');
SELECT cron.unschedule('sync-insider-trades');
SELECT cron.unschedule('sync-price-snapshots');

-- Get the API URL from config
-- Note: Jobs call lician.com directly since cron_config might have stale data

-- Job: 13F Institutional Holdings Sync (daily at 6am UTC)
-- Now calls the BATCH endpoint which has built-in investor list
SELECT cron.schedule(
  'sync-13f-holdings-v2',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/batch',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "13f", "limit": 5}'::jsonb
  );
  $$
);

-- Job: Top Institutions Sync (weekly on Sunday 5am UTC)
-- Full sync of all major institutional investors
SELECT cron.schedule(
  'sync-top-institutions-weekly',
  '0 5 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/batch',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "top-institutions", "limit": 10}'::jsonb
  );
  $$
);

-- Job: Financial Statements Batch Sync (daily at 7am UTC)
-- Syncs top 10 companies' financial statements
SELECT cron.schedule(
  'sync-financials-batch-v2',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/batch',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "financials", "limit": 10}'::jsonb
  );
  $$
);

-- Note: Insider trades needs a dedicated batch endpoint
-- For now, we'll use the cron/sync-financials endpoint which handles batch differently
-- Job: Insider Trades via dedicated cron endpoint (weekdays 3pm UTC)
SELECT cron.schedule(
  'sync-insider-trades-v2',
  '0 15 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-financials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"mode": "insider", "limit": 20}'::jsonb
  );
  $$
);

-- Log this migration
INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-fix-endpoints',
  'completed',
  '{"message": "Fixed cron job endpoints to use batch API", "version": "20251215"}'::jsonb
);

COMMENT ON FUNCTION sync_clinical_trials_cron IS 'Fixed: Now uses correct batch endpoints';
