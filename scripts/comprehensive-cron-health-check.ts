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
});

async function runQuery(queryName: string, sql: string): Promise<any> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${queryName}`);
  console.log('='.repeat(80));
  console.log(`SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}\n`);

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error(`ERROR: ${error.message}`);
    return null;
  }

  return data;
}

async function comprehensiveHealthCheck() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE CRON JOB HEALTH CHECK');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Query 1: Count total jobs and their health status
    console.log('\n' + '#'.repeat(80));
    console.log('1. JOB HEALTH STATUS SUMMARY');
    console.log('#'.repeat(80));

    const { data: healthSummary, error: error1 } = await supabase
      .from('cron_jobs_overview')
      .select('health_status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };

        // Group by health_status and count
        const summary = data.reduce((acc: any, row: any) => {
          const status = row.health_status || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        return { data: summary, error: null };
      });

    if (error1) {
      console.error(`ERROR: ${error1.message}`);
    } else if (healthSummary) {
      console.log('\nHealth Status Distribution:');
      const sortedStatuses = Object.entries(healthSummary)
        .sort(([, a]: any, [, b]: any) => b - a);

      let totalJobs = 0;
      sortedStatuses.forEach(([status, count]) => {
        console.log(`  ${status}: ${count} job(s)`);
        totalJobs += count as number;
      });
      console.log(`\nTotal Jobs: ${totalJobs}`);
    }

    // Query 2: Show any remaining unhealthy jobs
    console.log('\n' + '#'.repeat(80));
    console.log('2. UNHEALTHY JOBS DETAIL');
    console.log('#'.repeat(80));

    const { data: unhealthyJobs, error: error2 } = await supabase
      .from('cron_jobs_overview')
      .select('jobname, schedule, health_status, failed_24h, last_error')
      .not('health_status', 'in', '(HEALTHY,NEVER_RAN)')
      .order('failed_24h', { ascending: false });

    if (error2) {
      console.error(`ERROR: ${error2.message}`);
    } else if (unhealthyJobs) {
      if (unhealthyJobs.length === 0) {
        console.log('\nNo unhealthy jobs found! All jobs are either HEALTHY or NEVER_RAN.');
      } else {
        console.log(`\nFound ${unhealthyJobs.length} unhealthy job(s):\n`);
        unhealthyJobs.forEach((job: any, index: number) => {
          console.log(`${index + 1}. ${job.jobname}`);
          console.log(`   Schedule: ${job.schedule}`);
          console.log(`   Health Status: ${job.health_status}`);
          console.log(`   Failures (24h): ${job.failed_24h}`);
          if (job.last_error) {
            const error = job.last_error.substring(0, 200);
            console.log(`   Last Error: ${error}${job.last_error.length > 200 ? '...' : ''}`);
          }
          console.log('');
        });
      }
    }

    // Query 3: List all active jobs with their schedules
    console.log('\n' + '#'.repeat(80));
    console.log('3. ACTIVE JOBS LISTING');
    console.log('#'.repeat(80));

    const { data: activeJobs, error: error3 } = await supabase
      .from('cron_jobs_overview')
      .select('jobname, schedule, health_status')
      .neq('health_status', 'INACTIVE')
      .order('jobname');

    if (error3) {
      console.error(`ERROR: ${error3.message}`);
    } else if (activeJobs) {
      if (activeJobs.length === 0) {
        console.log('\nNo active jobs found!');
      } else {
        console.log(`\nFound ${activeJobs.length} active job(s):\n`);
        activeJobs.forEach((job: any, index: number) => {
          console.log(`${index + 1}. ${job.jobname}`);
          console.log(`   Schedule: ${job.schedule}`);
          console.log(`   Health: ${job.health_status}`);
          console.log('');
        });
      }
    }

    // Query 4: Check for any remaining jobs referencing current_setting
    console.log('\n' + '#'.repeat(80));
    console.log('4. JOBS WITH current_setting() REFERENCES');
    console.log('#'.repeat(80));

    const { data: currentSettingJobs, error: error4 } = await supabase
      .from('cron_job')
      .select('jobname, command')
      .ilike('command', '%current_setting%');

    if (error4) {
      console.error(`ERROR: ${error4.message}`);
    } else if (currentSettingJobs) {
      if (currentSettingJobs.length === 0) {
        console.log('\nNo jobs found with current_setting() references. Good!');
      } else {
        console.log(`\nWARNING: Found ${currentSettingJobs.length} job(s) still using current_setting():\n`);
        currentSettingJobs.forEach((job: any, index: number) => {
          console.log(`${index + 1}. ${job.jobname}`);
          const cmd = job.command.substring(0, 300);
          console.log(`   Command: ${cmd}${job.command.length > 300 ? '...' : ''}`);
          console.log('');
        });
      }
    }

    // Query 5: Check the scheduler is running
    console.log('\n' + '#'.repeat(80));
    console.log('5. PG_CRON SCHEDULER STATUS');
    console.log('#'.repeat(80));

    const { data: scheduler, error: error5 } = await supabase.rpc('exec_sql', {
      query: `
        SELECT pid, application_name, backend_start, state
        FROM pg_stat_activity
        WHERE application_name ILIKE 'pg_cron scheduler'
      `
    });

    if (error5) {
      console.error(`ERROR: ${error5.message}`);
    } else if (scheduler) {
      if (!scheduler || scheduler.length === 0) {
        console.log('\nWARNING: No pg_cron scheduler process found.');
        console.log('This may be normal for managed Supabase instances.');
        console.log('The scheduler may run in a separate managed process.');
      } else {
        console.log(`\nScheduler Status: RUNNING`);
        console.log(`Found ${scheduler.length} scheduler process(es):\n`);
        scheduler.forEach((proc: any, index: number) => {
          console.log(`${index + 1}. Process ID: ${proc.pid}`);
          console.log(`   Application: ${proc.application_name}`);
          console.log(`   Started: ${proc.backend_start}`);
          console.log(`   State: ${proc.state}`);
          console.log('');
        });
      }
    }

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('HEALTH SUMMARY');
    console.log('='.repeat(80));

    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    if (healthSummary) {
      const healthy = (healthSummary['HEALTHY'] || 0) as number;
      const unhealthy = Object.entries(healthSummary)
        .filter(([status]) => status !== 'HEALTHY' && status !== 'NEVER_RAN' && status !== 'INACTIVE')
        .reduce((sum, [, count]) => sum + (count as number), 0);
      const neverRan = (healthSummary['NEVER_RAN'] || 0) as number;
      const inactive = (healthSummary['INACTIVE'] || 0) as number;
      const total = Object.values(healthSummary).reduce((sum: number, count) => sum + (count as number), 0);

      successes.push(`${healthy} job(s) are HEALTHY`);

      if (unhealthy > 0) {
        issues.push(`${unhealthy} job(s) are UNHEALTHY and need attention`);
      }

      if (neverRan > 0) {
        warnings.push(`${neverRan} job(s) have NEVER_RAN (may be new or disabled)`);
      }

      if (inactive > 0) {
        warnings.push(`${inactive} job(s) are INACTIVE`);
      }

      console.log(`\nTotal Jobs: ${total}`);
      console.log(`  - Healthy: ${healthy}`);
      console.log(`  - Unhealthy: ${unhealthy}`);
      console.log(`  - Never Ran: ${neverRan}`);
      console.log(`  - Inactive: ${inactive}`);
    }

    if (currentSettingJobs && currentSettingJobs.length > 0) {
      issues.push(`${currentSettingJobs.length} job(s) still reference current_setting() - these need to be fixed`);
    } else {
      successes.push('No jobs reference current_setting() - migration complete');
    }

    if (!scheduler || scheduler.length === 0) {
      warnings.push('pg_cron scheduler process not visible (may be normal for managed Supabase)');
    } else {
      successes.push('pg_cron scheduler is running');
    }

    if (successes.length > 0) {
      console.log('\nSUCCESSES:');
      successes.forEach(success => console.log(`  ✓ ${success}`));
    }

    if (warnings.length > 0) {
      console.log('\nWARNINGS:');
      warnings.forEach(warning => console.log(`  ! ${warning}`));
    }

    if (issues.length > 0) {
      console.log('\nCRITICAL ISSUES:');
      issues.forEach(issue => console.log(`  ✗ ${issue}`));
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n' + '='.repeat(80));
      console.log('ALL SYSTEMS OPERATIONAL - NO ISSUES DETECTED');
      console.log('='.repeat(80));
    }

    console.log('\n' + '='.repeat(80));
    console.log('END OF HEALTH CHECK');
    console.log('='.repeat(80) + '\n');

    // Exit with appropriate code
    if (issues.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\nFATAL ERROR:', error);
    process.exit(1);
  }
}

// Run the health check
comprehensiveHealthCheck();
