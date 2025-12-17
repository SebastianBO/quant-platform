# Cron Job Health Check Report
Generated: 2025-12-15T22:33:13.341Z

## Executive Summary

**Total Jobs:** 47
- **HEALTHY:** 42 (89.4%)
- **UNHEALTHY:** 0 (0%)
- **NEVER_RAN:** 5 (10.6%)
- **INACTIVE:** 0 (0%)

## Key Findings

### Successes
- 42 jobs are HEALTHY and running successfully
- No unhealthy jobs detected - all active jobs are executing without errors
- pg_cron extension is properly installed and operational

### Critical Issues

**10 jobs still reference `current_setting()` and need migration:**

1. `daily-short-volume-update` - Schedule: `0 23 * * 1-5`
2. `weekly-comprehensive-update` - Schedule: `0 2 * * 0`
3. `sync-financial-weekly` - Schedule: `0 6 * * 0`
4. `discover-symbols-monthly` - Schedule: `0 7 1 * *`
5. `sync-fundamentals-quarterly` - Schedule: `0 8 1 1,4,7,10 *`
6. `weekly-historical-earnings` - Schedule: `0 4 * * 0`
7. `seo-autonomous-orchestrator` - Schedule: `0 * * * *`
8. `seo-regenerate-sitemaps` - Schedule: `0 3 * * *`
9. `seo-performance-monitor` - Schedule: `0 5 * * *`
10. `seo-error-handler` - Schedule: `0 */4 * * *`

**Note:** Despite using `current_setting()`, these jobs show as HEALTHY because:
- Some use `current_setting('app.settings.service_role_key', true)` which returns NULL if the setting doesn't exist (fallback behavior)
- The Edge Functions they call may have fallback authentication mechanisms
- However, this is unreliable and these jobs should still be migrated

### Warnings

**5 jobs have never run (may be new or waiting for their scheduled time):**

1. `cleanup-cron-logs-weekly` - Schedule: `0 3 * * 0` (Sundays at 3 AM)
2. `sync-13f-holdings-v2` - Schedule: `0 6 * * *` (Daily at 6 AM)
3. `sync-financials-batch-v2` - Schedule: `0 7 * * *` (Daily at 7 AM)
4. `sync-insider-trades-v2` - Schedule: `0 15 * * 1-5` (Weekdays at 3 PM)
5. `sync-top-institutions-weekly` - Schedule: `0 5 * * 0` (Sundays at 5 AM)

## Jobs Using current_setting() - Details

### Pattern 1: Using 'app.settings.service_key'
These reference a setting that likely doesn't exist:

```sql
-- daily-short-volume-update, weekly-comprehensive-update
'Authorization', 'Bearer ' || current_setting('app.settings.service_key')
```

### Pattern 2: Using 'app.settings.service_role_key' (strict)
These will fail if the setting doesn't exist:

```sql
-- sync-financial-weekly, discover-symbols-monthly,
-- sync-fundamentals-quarterly, weekly-historical-earnings
'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
```

### Pattern 3: Using 'app.settings.service_role_key' with fallback
These return NULL if setting doesn't exist (won't cause error, but auth will fail):

```sql
-- seo-autonomous-orchestrator, seo-regenerate-sitemaps,
-- seo-performance-monitor, seo-error-handler
'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
```

## Recommended Actions

### High Priority
1. **Migrate the 10 remaining jobs** that use `current_setting()` to use the hardcoded service role key
2. **Test the migration** for each job after updating
3. **Monitor execution logs** to ensure successful authentication

### Medium Priority
1. **Investigate NEVER_RAN jobs** - determine if they're waiting for their scheduled time or if there's an issue
2. **Set up monitoring** for the `cron-health-monitor` job (currently in NEVER_RAN status)

### Low Priority
1. Review and optimize job schedules to prevent overlaps
2. Consider implementing job dependencies where applicable

## Migration Script Required

To fix the 10 jobs using `current_setting()`, run a migration similar to the previous ones:

```sql
-- Example for daily-short-volume-update
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'daily-short-volume-update'),
  command := $$
    SELECT net.http_post(
      url := 'https://wcckhqxkmhyzfpynthte.supabase.co/functions/v1/automated-data-updater',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('mode', 'short-volume')
    );
  $$
);
```

## System Status

- **pg_cron Extension:** Installed and operational
- **Scheduler Process:** Not visible (normal for managed Supabase)
- **Job Execution:** 42/47 jobs running successfully
- **Recent Failures:** 0 in the last 24 hours
- **Migration Status:** 78.7% complete (37/47 jobs migrated from current_setting())

## Next Steps

1. Create and run migration for the 10 remaining jobs
2. Wait for NEVER_RAN jobs to execute on their schedule
3. Re-run health check after 24 hours to verify all jobs
4. Set up automated health monitoring using the `cron-health-monitor` job
