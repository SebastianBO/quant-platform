import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.prod') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

async function verifyFixes() {
  console.log('='.repeat(80));
  console.log('CRON JOB FIXES VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database: ${supabaseUrl}\n`);

  try {
    // ========================================
    // 1. List all cron jobs and their schedules
    // ========================================
    console.log('='.repeat(80));
    console.log('1. ALL ACTIVE CRON JOBS AND SCHEDULES');
    console.log('='.repeat(80));

    const { data: allJobs, error: allJobsError } = await supabase.rpc('get_all_cron_jobs');

    if (allJobsError) {
      console.error('Error fetching all jobs:', allJobsError);
    } else if (allJobs && allJobs.length > 0) {
      const activeJobs = allJobs.filter((job: any) => job.active);
      console.log(`Total jobs: ${allJobs.length}, Active: ${activeJobs.length}, Inactive: ${allJobs.length - activeJobs.length}\n`);

      console.log('Active Jobs:');
      activeJobs.forEach((job: any) => {
        console.log(`  - [${job.jobid}] ${job.jobname}`);
        console.log(`    Schedule: ${job.schedule}`);
        console.log(`    Active: ${job.active}\n`);
      });
    } else {
      console.log('No jobs found!\n');
    }

    // ========================================
    // 2. Verify broken jobs were removed
    // ========================================
    console.log('='.repeat(80));
    console.log('2. VERIFY BROKEN JOBS WERE REMOVED');
    console.log('='.repeat(80));

    const brokenJobNames = [
      'update-seo-pages-hourly-manual-test',
      'polygon-websocket-health-check',
      'bulk-financial-sync'
    ];

    if (allJobs) {
      const foundBrokenJobs = allJobs.filter((job: any) =>
        brokenJobNames.includes(job.jobname)
      );

      if (foundBrokenJobs.length === 0) {
        console.log('SUCCESS: All broken jobs have been removed');
      } else {
        console.log('WARNING: Found broken jobs that should have been removed:');
        foundBrokenJobs.forEach((job: any) => {
          console.log(`  - ${job.jobname} (ID: ${job.jobid})`);
        });
      }
    }
    console.log('');

    // ========================================
    // 3. Verify new health monitoring jobs exist
    // ========================================
    console.log('='.repeat(80));
    console.log('3. VERIFY NEW HEALTH MONITORING JOBS EXIST');
    console.log('='.repeat(80));

    const expectedNewJobs = [
      'cron-health-monitor',
      'cleanup-cron-logs-weekly',
      'sync-financials-continuous'
    ];

    if (allJobs) {
      const foundNewJobs = allJobs.filter((job: any) =>
        expectedNewJobs.includes(job.jobname)
      );

      console.log(`Expected: ${expectedNewJobs.length}, Found: ${foundNewJobs.length}\n`);

      expectedNewJobs.forEach(jobName => {
        const found = foundNewJobs.find((job: any) => job.jobname === jobName);
        if (found) {
          console.log(`  SUCCESS: ${jobName}`);
          console.log(`    ID: ${found.jobid}, Schedule: ${found.schedule}, Active: ${found.active}`);
        } else {
          console.log(`  MISSING: ${jobName}`);
        }
      });
    }
    console.log('');

    // ========================================
    // 4. Check cron_jobs_overview view
    // ========================================
    console.log('='.repeat(80));
    console.log('4. CRON JOBS OVERVIEW - HEALTH STATUS');
    console.log('='.repeat(80));

    const { data: overview, error: overviewError } = await supabase
      .from('cron_jobs_overview')
      .select('*')
      .order('health_status', { ascending: false });

    if (overviewError) {
      console.error('Error fetching cron_jobs_overview:', overviewError);
    } else if (overview && overview.length > 0) {
      console.log(`Total jobs in overview: ${overview.length}\n`);

      const unhealthyJobs = overview.filter((job: any) => job.health_status !== 'HEALTHY');

      if (unhealthyJobs.length > 0) {
        console.log(`Unhealthy jobs found: ${unhealthyJobs.length}\n`);
        unhealthyJobs.forEach((job: any) => {
          console.log(`  Job: ${job.jobname}`);
          console.log(`    Status: ${job.health_status}`);
          console.log(`    Schedule: ${job.schedule}`);
          console.log(`    Runs (24h): ${job.runs_24h}, Success Rate: ${job.success_rate_24h}%`);
          console.log(`    Last Run: ${job.last_run || 'Never'}`);
          if (job.last_error) {
            console.log(`    Last Error: ${job.last_error.substring(0, 100)}`);
          }
          console.log('');
        });
      } else {
        console.log('SUCCESS: All jobs are HEALTHY!\n');
      }

      // Show summary by status
      const statusCounts = overview.reduce((acc: any, job: any) => {
        acc[job.health_status] = (acc[job.health_status] || 0) + 1;
        return acc;
      }, {});

      console.log('Health Status Summary:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    } else {
      console.log('No jobs in overview or view does not exist');
    }
    console.log('');

    // ========================================
    // 5. Verify cron_health_checks table exists
    // ========================================
    console.log('='.repeat(80));
    console.log('5. VERIFY CRON_HEALTH_CHECKS TABLE SCHEMA');
    console.log('='.repeat(80));

    const { data: healthChecks, error: healthChecksError } = await supabase
      .from('cron_health_checks')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(5);

    if (healthChecksError) {
      console.error('Error fetching cron_health_checks:', healthChecksError);
      console.log('WARNING: cron_health_checks table may not exist or has permission issues');
    } else {
      console.log('SUCCESS: cron_health_checks table exists and is accessible\n');

      if (healthChecks && healthChecks.length > 0) {
        console.log(`Recent health checks (showing ${healthChecks.length}):\n`);
        healthChecks.forEach((check: any, index: number) => {
          console.log(`  ${index + 1}. Checked at: ${check.checked_at}`);
          console.log(`     Scheduler Alive: ${check.scheduler_alive}`);
          console.log(`     Total Jobs: ${check.total_jobs}, Active: ${check.active_jobs}`);
          console.log(`     Failed (1h): ${check.failed_jobs_1h}, Stale: ${check.stale_jobs}`);
          console.log(`     Alert Sent: ${check.alert_sent}`);
          console.log('');
        });
      } else {
        console.log('No health check records yet (table exists but empty)\n');
      }
    }

    // ========================================
    // 6. Show recent failed jobs
    // ========================================
    console.log('='.repeat(80));
    console.log('6. RECENT FAILED CRON JOBS (LAST 24 HOURS)');
    console.log('='.repeat(80));

    const { data: failedRuns, error: failedError } = await supabase.rpc('get_failed_cron_runs');

    if (failedError) {
      console.error('Error fetching failed runs:', failedError);
    } else if (failedRuns && failedRuns.length > 0) {
      console.log(`Failed runs in last 24h: ${failedRuns.length}\n`);
      failedRuns.slice(0, 10).forEach((run: any, index: number) => {
        console.log(`  ${index + 1}. ${run.jobname || `Job ${run.jobid}`}`);
        console.log(`     Status: ${run.status}`);
        console.log(`     Time: ${run.start_time}`);
        console.log(`     Message: ${run.return_message?.substring(0, 100) || 'No message'}`);
        console.log('');
      });
    } else {
      console.log('SUCCESS: No failed job runs in the last 24 hours!\n');
    }

    // ========================================
    // 7. Recent executions
    // ========================================
    console.log('='.repeat(80));
    console.log('7. RECENT CRON JOB EXECUTIONS (LAST 24 HOURS)');
    console.log('='.repeat(80));

    const { data: recentExecs, error: execsError } = await supabase.rpc('get_recent_cron_executions', { hours_ago: 24 });

    if (execsError) {
      console.error('Error fetching recent executions:', execsError);
    } else if (recentExecs && recentExecs.length > 0) {
      console.log(`Total executions in last 24h: ${recentExecs.length}\n`);

      const successCount = recentExecs.filter((e: any) => e.status === 'succeeded').length;
      const failCount = recentExecs.filter((e: any) => e.status === 'failed').length;

      console.log(`Success: ${successCount}, Failed: ${failCount}\n`);

      console.log('Last 10 executions:');
      recentExecs.slice(0, 10).forEach((exec: any, index: number) => {
        const statusIcon = exec.status === 'succeeded' ? '✓' : '✗';
        console.log(`  ${index + 1}. [${statusIcon}] ${exec.jobname || 'Unknown'}`);
        console.log(`     Status: ${exec.status}, Time: ${exec.start_time}`);
        console.log(`     Duration: ${exec.duration_seconds?.toFixed(2) || 'N/A'}s`);
        console.log('');
      });
    } else {
      console.log('No executions found in the last 24 hours\n');
    }

    console.log('='.repeat(80));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\nFatal error during verification:', error);
    process.exit(1);
  }
}

// Run verification
verifyFixes().then(() => {
  console.log('\nExiting...');
  process.exit(0);
}).catch((error) => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
