-- Create diagnostic functions for cron job troubleshooting

-- 1. Get failed job runs in last 24 hours
CREATE OR REPLACE FUNCTION public.get_failed_cron_runs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(runs))
  INTO result
  FROM (
    SELECT
      jobid,
      jobname,
      status,
      start_time,
      return_message
    FROM cron.job_run_details
    WHERE status = 'failed'
      AND start_time > NOW() - INTERVAL '24 hours'
    ORDER BY start_time DESC
    LIMIT 30
  ) runs;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 2. Get all scheduled cron jobs
CREATE OR REPLACE FUNCTION public.get_all_cron_jobs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(jobs))
  INTO result
  FROM (
    SELECT jobid, jobname, schedule, command, active
    FROM cron.job
    ORDER BY jobid
  ) jobs;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 3. Check for duplicate job names
CREATE OR REPLACE FUNCTION public.get_duplicate_cron_jobs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(dupes))
  INTO result
  FROM (
    SELECT jobname, COUNT(*) as count
    FROM cron.job
    GROUP BY jobname
    HAVING COUNT(*) > 1
  ) dupes;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 4. Get status of specific jobs (13f-holdings, financials-batch, insider)
CREATE OR REPLACE FUNCTION public.get_key_cron_jobs_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(job_status))
  INTO result
  FROM (
    SELECT
      j.jobname,
      j.jobid,
      j.active,
      j.schedule,
      jrd.status,
      jrd.start_time,
      jrd.end_time,
      jrd.return_message,
      EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) as duration_seconds
    FROM cron.job j
    LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
    WHERE j.jobname LIKE '%13f%'
       OR j.jobname LIKE '%financials%'
       OR j.jobname LIKE '%insider%'
    ORDER BY jrd.start_time DESC NULLS LAST
    LIMIT 20
  ) job_status;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 5. Get recent job executions summary
CREATE OR REPLACE FUNCTION public.get_recent_cron_executions(hours_ago INT DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(execs))
  INTO result
  FROM (
    SELECT
      j.jobname,
      jrd.status,
      jrd.start_time,
      jrd.end_time,
      EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) as duration_seconds,
      jrd.return_message
    FROM cron.job_run_details jrd
    LEFT JOIN cron.job j ON jrd.jobid = j.jobid
    WHERE jrd.start_time > NOW() - (hours_ago || ' hours')::INTERVAL
    ORDER BY jrd.start_time DESC
    LIMIT 50
  ) execs;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_failed_cron_runs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_failed_cron_runs() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_all_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_cron_jobs() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_duplicate_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_duplicate_cron_jobs() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_key_cron_jobs_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_key_cron_jobs_status() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_recent_cron_executions(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_cron_executions(INT) TO service_role;

-- Add comments
COMMENT ON FUNCTION public.get_failed_cron_runs() IS 'Returns failed cron job runs in the last 24 hours';
COMMENT ON FUNCTION public.get_all_cron_jobs() IS 'Returns all scheduled cron jobs';
COMMENT ON FUNCTION public.get_duplicate_cron_jobs() IS 'Returns cron jobs with duplicate names';
COMMENT ON FUNCTION public.get_key_cron_jobs_status() IS 'Returns status of key cron jobs (13f, financials, insider)';
COMMENT ON FUNCTION public.get_recent_cron_executions(INT) IS 'Returns recent cron job executions';
