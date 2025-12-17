-- Add biotech data sync cron jobs

-- Sync clinical trials data daily at 6 AM UTC
SELECT cron.schedule(
  'sync-clinical-trials-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-clinical-trials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Sync biotech company data twice daily (6 AM and 6 PM UTC)
SELECT cron.schedule(
  'sync-biotech-data',
  '0 6,18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-biotech',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Log migration
INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-add-biotech-crons',
  'completed',
  jsonb_build_object(
    'message', 'Added biotech cron jobs for clinical trials and biotech data sync',
    'jobs_created', ARRAY['sync-clinical-trials-daily', 'sync-biotech-data'],
    'version', '20251217000004'
  )
);
