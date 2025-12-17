-- Comprehensive Cron Job Fix Migration
-- Fixes: excessive frequency, broken jobs, missing monitoring

-- ============================================
-- 1. UNSCHEDULE BROKEN/EXCESSIVE JOBS
-- ============================================

-- Unschedule the broken SEO job (SQL syntax error)
SELECT cron.unschedule('update-seo-pages-hourly-manual-test')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'update-seo-pages-hourly-manual-test');

-- Unschedule the broken polygon websocket job (config error)
SELECT cron.unschedule('polygon-websocket-health-check')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'polygon-websocket-health-check');

-- Unschedule the excessive bulk-financial-sync (runs every minute!)
SELECT cron.unschedule('bulk-financial-sync')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'bulk-financial-sync');

-- Unschedule old broken jobs that call wrong endpoints
SELECT cron.unschedule('sync-13f-holdings')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-13f-holdings');

SELECT cron.unschedule('sync-insider-trades')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-insider-trades');

-- ============================================
-- 2. CREATE BETTER SCHEDULED JOBS
-- ============================================

-- Replace bulk-financial-sync with a more reasonable schedule (every 15 minutes)
-- This still syncs 5 companies * 4 per hour * 24 hours = 480/day
SELECT cron.schedule(
  'sync-financials-continuous',
  '*/15 * * * *',  -- Every 15 minutes instead of every minute
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-financials?mode=continue&limit=10',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- 3. CREATE HEALTH MONITORING INFRASTRUCTURE
-- ============================================

-- Table to track cron health checks
CREATE TABLE IF NOT EXISTS cron_health_checks (
  id BIGSERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  scheduler_alive BOOLEAN NOT NULL,
  total_jobs INTEGER,
  active_jobs INTEGER,
  failed_jobs_1h INTEGER,
  stale_jobs INTEGER,
  alert_sent BOOLEAN DEFAULT FALSE,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_cron_health_checks_time
ON cron_health_checks(checked_at DESC);

-- Function to check cron health and alert if issues
CREATE OR REPLACE FUNCTION check_cron_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scheduler_alive BOOLEAN;
  total_jobs INTEGER;
  active_jobs INTEGER;
  failed_jobs_1h INTEGER;
  stale_jobs INTEGER;
  health_record_id BIGINT;
  alert_payload JSONB;
  should_alert BOOLEAN := FALSE;
BEGIN
  -- Check if scheduler is running
  SELECT EXISTS(
    SELECT 1 FROM pg_stat_activity
    WHERE application_name ILIKE 'pg_cron scheduler'
  ) INTO scheduler_alive;

  -- Count jobs
  SELECT COUNT(*), COUNT(*) FILTER (WHERE active = true)
  INTO total_jobs, active_jobs
  FROM cron.job;

  -- Count recent failures (last 1 hour)
  SELECT COUNT(*) INTO failed_jobs_1h
  FROM cron.job_run_details
  WHERE status = 'failed'
    AND start_time > NOW() - INTERVAL '1 hour';

  -- Count stale jobs (haven't run in 25+ hours but should run daily)
  SELECT COUNT(*) INTO stale_jobs
  FROM (
    SELECT j.jobid
    FROM cron.job j
    LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
    WHERE j.active = true
      AND j.schedule LIKE '0 % * * *'  -- Daily jobs
    GROUP BY j.jobid
    HAVING MAX(jrd.start_time) < NOW() - INTERVAL '25 hours'
       OR MAX(jrd.start_time) IS NULL
  ) stale;

  -- Build health payload
  alert_payload := jsonb_build_object(
    'scheduler_alive', scheduler_alive,
    'total_jobs', total_jobs,
    'active_jobs', active_jobs,
    'failed_jobs_1h', failed_jobs_1h,
    'stale_jobs', stale_jobs,
    'checked_at', NOW()
  );

  -- Determine if we should alert
  IF NOT scheduler_alive THEN
    should_alert := TRUE;
    alert_payload := alert_payload || jsonb_build_object('alert_reason', 'Scheduler is DOWN');
  ELSIF failed_jobs_1h > 5 THEN
    should_alert := TRUE;
    alert_payload := alert_payload || jsonb_build_object('alert_reason', 'High failure rate');
  ELSIF stale_jobs > 0 THEN
    should_alert := TRUE;
    alert_payload := alert_payload || jsonb_build_object('alert_reason', 'Stale jobs detected');
  END IF;

  -- Log the health check
  INSERT INTO cron_health_checks (
    scheduler_alive, total_jobs, active_jobs,
    failed_jobs_1h, stale_jobs, alert_sent, details
  ) VALUES (
    scheduler_alive, total_jobs, active_jobs,
    failed_jobs_1h, stale_jobs, should_alert, alert_payload
  ) RETURNING id INTO health_record_id;

  -- If issues detected, call alert webhook
  IF should_alert THEN
    PERFORM net.http_post(
      url := 'https://lician.com/api/monitoring/cron-alert',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := alert_payload
    );
  END IF;

  RETURN alert_payload;
END;
$$;

-- Schedule health check every 15 minutes
SELECT cron.schedule(
  'cron-health-monitor',
  '*/15 * * * *',
  $$SELECT check_cron_health()$$
);

-- ============================================
-- 4. CREATE LOG CLEANUP JOB
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only 30 days of cron run details
  DELETE FROM cron.job_run_details
  WHERE start_time < NOW() - INTERVAL '30 days';

  -- Keep only 90 days of health checks
  DELETE FROM cron_health_checks
  WHERE checked_at < NOW() - INTERVAL '90 days';

  -- Keep only 90 days of custom cron logs
  DELETE FROM cron_job_log
  WHERE executed_at < NOW() - INTERVAL '90 days';

  RAISE NOTICE 'Cron log cleanup completed at %', NOW();
END;
$$;

-- Schedule cleanup weekly on Sunday 3am UTC
SELECT cron.schedule(
  'cleanup-cron-logs-weekly',
  '0 3 * * 0',
  $$SELECT cleanup_old_cron_logs()$$
);

-- ============================================
-- 5. CREATE COMPREHENSIVE CRON STATUS VIEW
-- ============================================

CREATE OR REPLACE VIEW public.cron_jobs_overview AS
WITH recent_runs AS (
  SELECT
    jobid,
    COUNT(*) FILTER (WHERE start_time > NOW() - INTERVAL '24 hours') as runs_24h,
    COUNT(*) FILTER (WHERE status = 'succeeded' AND start_time > NOW() - INTERVAL '24 hours') as success_24h,
    COUNT(*) FILTER (WHERE status = 'failed' AND start_time > NOW() - INTERVAL '24 hours') as failed_24h,
    MAX(start_time) as last_run,
    MAX(start_time) FILTER (WHERE status = 'succeeded') as last_success,
    MAX(CASE WHEN status = 'failed' THEN return_message END) as last_error
  FROM cron.job_run_details
  GROUP BY jobid
)
SELECT
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  COALESCE(r.runs_24h, 0) as runs_24h,
  COALESCE(r.success_24h, 0) as success_24h,
  COALESCE(r.failed_24h, 0) as failed_24h,
  CASE
    WHEN COALESCE(r.runs_24h, 0) = 0 THEN 0
    ELSE ROUND(100.0 * r.success_24h / r.runs_24h, 1)
  END as success_rate_24h,
  r.last_run,
  r.last_success,
  EXTRACT(EPOCH FROM (NOW() - r.last_run)) / 3600 as hours_since_last_run,
  r.last_error,
  CASE
    WHEN NOT j.active THEN 'INACTIVE'
    WHEN r.last_run IS NULL THEN 'NEVER_RAN'
    WHEN r.failed_24h > 0 AND r.success_24h = 0 THEN 'FAILING'
    WHEN r.failed_24h > r.success_24h THEN 'DEGRADED'
    WHEN EXTRACT(EPOCH FROM (NOW() - r.last_run)) / 3600 > 25
         AND j.schedule LIKE '0 % * * *' THEN 'STALE'
    ELSE 'HEALTHY'
  END as health_status
FROM cron.job j
LEFT JOIN recent_runs r ON j.jobid = r.jobid
ORDER BY
  CASE
    WHEN NOT j.active THEN 4
    WHEN r.failed_24h > 0 AND r.success_24h = 0 THEN 1
    WHEN r.failed_24h > r.success_24h THEN 2
    ELSE 3
  END,
  j.jobname;

GRANT SELECT ON public.cron_jobs_overview TO authenticated;

COMMENT ON VIEW public.cron_jobs_overview IS 'Comprehensive cron job status with health indicators';

-- ============================================
-- 6. LOG THIS MIGRATION
-- ============================================

INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-comprehensive-fix',
  'completed',
  jsonb_build_object(
    'message', 'Fixed excessive cron frequency, added health monitoring',
    'jobs_unscheduled', ARRAY[
      'update-seo-pages-hourly-manual-test',
      'polygon-websocket-health-check',
      'bulk-financial-sync',
      'sync-13f-holdings',
      'sync-insider-trades'
    ],
    'jobs_added', ARRAY[
      'sync-financials-continuous',
      'cron-health-monitor',
      'cleanup-cron-logs-weekly'
    ],
    'version', '20251215000003'
  )
);
