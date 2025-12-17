-- Create a function to check pg_cron status
-- This function returns comprehensive diagnostics about cron jobs

CREATE OR REPLACE FUNCTION public.check_cron_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  jobs_data jsonb;
  executions_data jsonb;
  scheduler_data jsonb;
  extension_data jsonb;
BEGIN
  -- Check if pg_cron extension is installed
  SELECT jsonb_agg(row_to_json(ext))
  INTO extension_data
  FROM (
    SELECT
      extname,
      extversion,
      extrelocatable,
      nspname as schema
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE extname = 'pg_cron'
  ) ext;

  -- Get all scheduled jobs
  SELECT jsonb_agg(row_to_json(job))
  INTO jobs_data
  FROM (
    SELECT
      jobid,
      jobname,
      schedule,
      command,
      active,
      database
    FROM cron.job
    ORDER BY jobid
  ) job;

  -- Get last 30 job executions
  SELECT jsonb_agg(row_to_json(exec))
  INTO executions_data
  FROM (
    SELECT
      j.jobname,
      jrd.runid,
      jrd.job_pid,
      jrd.database,
      jrd.username,
      jrd.command,
      jrd.status,
      jrd.return_message,
      jrd.start_time,
      jrd.end_time,
      EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) as duration_seconds
    FROM cron.job_run_details jrd
    LEFT JOIN cron.job j ON jrd.jobid = j.jobid
    ORDER BY jrd.start_time DESC
    LIMIT 30
  ) exec;

  -- Check for pg_cron scheduler process
  SELECT jsonb_agg(row_to_json(proc))
  INTO scheduler_data
  FROM (
    SELECT
      pid,
      usename,
      application_name,
      client_addr,
      backend_start,
      state,
      LEFT(query, 100) as query_preview,
      state_change
    FROM pg_stat_activity
    WHERE application_name LIKE '%cron%'
       OR query LIKE '%cron%'
       OR usename = 'cron'
  ) proc;

  -- Build result object
  result := jsonb_build_object(
    'timestamp', now(),
    'extension_installed', extension_data IS NOT NULL AND jsonb_array_length(extension_data) > 0,
    'extension_info', COALESCE(extension_data, '[]'::jsonb),
    'jobs_defined', jobs_data IS NOT NULL AND jsonb_array_length(jobs_data) > 0,
    'jobs', COALESCE(jobs_data, '[]'::jsonb),
    'jobs_count', COALESCE(jsonb_array_length(jobs_data), 0),
    'executions', COALESCE(executions_data, '[]'::jsonb),
    'executions_count', COALESCE(jsonb_array_length(executions_data), 0),
    'scheduler_processes', COALESCE(scheduler_data, '[]'::jsonb),
    'scheduler_running', scheduler_data IS NOT NULL AND jsonb_array_length(scheduler_data) > 0
  );

  -- Add execution summary if we have executions
  IF executions_data IS NOT NULL AND jsonb_array_length(executions_data) > 0 THEN
    result := result || jsonb_build_object(
      'execution_summary', (
        SELECT jsonb_build_object(
          'successful', COUNT(*) FILTER (WHERE (exec->>'status') = 'succeeded'),
          'failed', COUNT(*) FILTER (WHERE (exec->>'status') = 'failed'),
          'last_execution', (
            SELECT row_to_json(last_exec)
            FROM (
              SELECT
                exec->>'jobname' as jobname,
                exec->>'status' as status,
                exec->>'start_time' as start_time,
                exec->>'duration_seconds' as duration_seconds,
                exec->>'return_message' as return_message
              FROM jsonb_array_elements(executions_data) exec
              ORDER BY exec->>'start_time' DESC
              LIMIT 1
            ) last_exec
          )
        )
        FROM jsonb_array_elements(executions_data) exec
      )
    );
  END IF;

  -- Add health status
  result := result || jsonb_build_object(
    'health_status',
    CASE
      WHEN NOT (result->>'extension_installed')::boolean THEN 'CRITICAL: pg_cron extension not installed'
      WHEN NOT (result->>'jobs_defined')::boolean THEN 'WARNING: No cron jobs defined'
      WHEN (result->>'executions_count')::int = 0 THEN 'CRITICAL: Jobs defined but no executions found'
      WHEN (result->'execution_summary'->>'failed')::int > 0 THEN 'WARNING: Some job executions have failed'
      ELSE 'OK: Cron jobs are running'
    END
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_cron_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_cron_status() TO service_role;

-- Add comment
COMMENT ON FUNCTION public.check_cron_status() IS 'Returns comprehensive diagnostics about pg_cron status including jobs, executions, and scheduler health';
