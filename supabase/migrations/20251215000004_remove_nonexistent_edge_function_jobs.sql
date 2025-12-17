-- Remove cron jobs that call non-existent Edge Functions
-- These jobs were scheduled for Edge Functions that were planned but never built.
-- They fail with: "unrecognized configuration parameter app.settings.service_role_key"
-- because current_setting() fails before the HTTP call is even attempted.

-- Jobs calling non-existent Edge Functions:

-- 1. weekly-portfolio-report → monitor-portfolio (doesn't exist)
SELECT cron.unschedule('weekly-portfolio-report')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-portfolio-report');

-- 2. sync-fx-rates-every-4-hours → sync-fx-rates (doesn't exist)
SELECT cron.unschedule('sync-fx-rates-every-4-hours')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-fx-rates-every-4-hours');

-- 3. sync-earnings-daily → auto-earnings-sync (doesn't exist)
SELECT cron.unschedule('sync-earnings-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-earnings-daily');

-- 4. price-alert-monitoring → check-price-alerts (doesn't exist)
SELECT cron.unschedule('price-alert-monitoring')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'price-alert-monitoring');

-- 5. nightly-options-ingestion → auto-financial-sync (doesn't exist)
SELECT cron.unschedule('nightly-options-ingestion')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nightly-options-ingestion');

-- 6. hourly-options-flow → monitor-options-flow (doesn't exist)
SELECT cron.unschedule('hourly-options-flow')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hourly-options-flow');

-- 7. daily-sec-filings-check → automated-data-updater (doesn't exist)
SELECT cron.unschedule('daily-sec-filings-check')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-sec-filings-check');

-- 8. daily-earnings-calendar → auto-financial-sync (doesn't exist)
SELECT cron.unschedule('daily-earnings-calendar')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-earnings-calendar');

-- 9. daily-portfolio-summary → scheduled-portfolio-summary (doesn't exist)
SELECT cron.unschedule('daily-portfolio-summary')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-portfolio-summary');

-- Log this cleanup
INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-remove-broken-jobs',
  'completed',
  jsonb_build_object(
    'message', 'Removed 9 cron jobs that called non-existent Edge Functions',
    'jobs_removed', ARRAY[
      'weekly-portfolio-report',
      'sync-fx-rates-every-4-hours',
      'sync-earnings-daily',
      'price-alert-monitoring',
      'nightly-options-ingestion',
      'hourly-options-flow',
      'daily-sec-filings-check',
      'daily-earnings-calendar',
      'daily-portfolio-summary'
    ],
    'reason', 'Edge Functions were planned but never implemented',
    'version', '20251215000004'
  )
);

-- NOTE: These features should be re-implemented as Vercel API endpoints
-- when ready, following the pattern in /api/cron/*.ts
