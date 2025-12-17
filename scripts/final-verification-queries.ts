import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.prod') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runVerificationQueries() {
  console.log('\n' + '='.repeat(80));
  console.log('FINAL VERIFICATION QUERIES');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Query 1: Count jobs by health status
    console.log('1. COUNT JOBS BY HEALTH STATUS');
    console.log('='.repeat(80));
    console.log('SQL: SELECT health_status, COUNT(*) as count FROM cron_jobs_overview GROUP BY health_status;\n');

    const { data: healthStatusCounts, error: error1 } = await supabase
      .from('cron_jobs_overview')
      .select('health_status');

    if (error1) {
      console.error('Error:', error1);
    } else {
      const counts = healthStatusCounts.reduce((acc: any, row: any) => {
        const status = row.health_status || 'NULL';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      console.log('Results:');
      console.table(Object.entries(counts).map(([health_status, count]) => ({
        health_status,
        count
      })));
    }

    // Query 2: Verify no jobs use current_setting anymore
    console.log('\n2. VERIFY NO JOBS USE current_setting() ANYMORE');
    console.log('='.repeat(80));
    console.log('SQL: SELECT COUNT(*) as jobs_with_current_setting FROM cron.job WHERE command ILIKE \'%current_setting%\';\n');

    const { data: allJobs, error: error2 } = await supabase.rpc('get_all_cron_jobs');

    if (error2) {
      console.error('Error:', error2);
    } else {
      const jobsWithCurrentSetting = allJobs
        ? allJobs.filter((job: any) => job.command.toLowerCase().includes('current_setting'))
        : [];

      console.log('Results:');
      console.table([{ jobs_with_current_setting: jobsWithCurrentSetting.length }]);

      if (jobsWithCurrentSetting.length > 0) {
        console.log('\nWARNING: Jobs still using current_setting():');
        jobsWithCurrentSetting.forEach((job: any, index: number) => {
          console.log(`\n  ${index + 1}. ${job.jobname}`);
          console.log(`     Command: ${job.command.substring(0, 100)}...`);
        });
      } else {
        console.log('\nSUCCESS: No jobs use current_setting() anymore!');
      }
    }

    // Query 3: List all remaining jobs with their status
    console.log('\n3. LIST ALL REMAINING JOBS WITH THEIR STATUS');
    console.log('='.repeat(80));
    console.log('SQL: SELECT jobname, schedule, health_status, success_rate_24h FROM cron_jobs_overview ORDER BY health_status, jobname;\n');

    const { data: jobsList, error: error3 } = await supabase
      .from('cron_jobs_overview')
      .select('jobname, schedule, health_status, success_rate_24h')
      .order('health_status')
      .order('jobname');

    if (error3) {
      console.error('Error:', error3);
    } else {
      console.log(`Results (${jobsList.length} total jobs):`);
      console.table(
        jobsList.map((job: any) => ({
          jobname: job.jobname,
          schedule: job.schedule,
          health_status: job.health_status,
          success_rate_24h: job.success_rate_24h ? `${(job.success_rate_24h * 100).toFixed(1)}%` : 'N/A'
        }))
      );
    }

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('CRON SYSTEM HEALTH SUMMARY');
    console.log('='.repeat(80));

    if (healthStatusCounts) {
      const counts = healthStatusCounts.reduce((acc: any, row: any) => {
        const status = row.health_status || 'NULL';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const healthy = counts['HEALTHY'] || 0;
      const unhealthy = Object.entries(counts)
        .filter(([status]) => status !== 'HEALTHY' && status !== 'NEVER_RAN' && status !== 'INACTIVE')
        .reduce((sum, [, count]) => sum + (count as number), 0);
      const neverRan = counts['NEVER_RAN'] || 0;
      const inactive = counts['INACTIVE'] || 0;
      const total = Object.values(counts).reduce((sum: number, count) => sum + (count as number), 0);

      console.log('\nOVERALL STATISTICS:');
      console.log(`  Total Jobs:          ${total}`);
      console.log(`  Healthy:             ${healthy} (${((healthy / total) * 100).toFixed(1)}%)`);
      console.log(`  Unhealthy:           ${unhealthy} (${((unhealthy / total) * 100).toFixed(1)}%)`);
      console.log(`  Never Ran:           ${neverRan} (${((neverRan / total) * 100).toFixed(1)}%)`);
      console.log(`  Inactive:            ${inactive} (${((inactive / total) * 100).toFixed(1)}%)`);

      console.log('\nMIGRATION STATUS:');
      const hasCurrentSetting = allJobs
        ? allJobs.filter((job: any) => job.command.toLowerCase().includes('current_setting')).length
        : 0;

      if (hasCurrentSetting === 0) {
        console.log('  current_setting():   MIGRATED (0 jobs)');
      } else {
        console.log(`  current_setting():   INCOMPLETE (${hasCurrentSetting} jobs remaining)`);
      }

      console.log('\nSYSTEM HEALTH:');
      if (unhealthy === 0 && hasCurrentSetting === 0) {
        console.log('  Status:              OPTIMAL');
        console.log('  All jobs are healthy and migrations are complete.');
      } else if (unhealthy === 0 && hasCurrentSetting > 0) {
        console.log('  Status:              GOOD WITH WARNINGS');
        console.log(`  Jobs are healthy but ${hasCurrentSetting} still need migration.`);
      } else if (unhealthy > 0 && hasCurrentSetting === 0) {
        console.log('  Status:              NEEDS ATTENTION');
        console.log(`  ${unhealthy} unhealthy job(s) require investigation.`);
      } else {
        console.log('  Status:              CRITICAL');
        console.log(`  ${unhealthy} unhealthy job(s) and ${hasCurrentSetting} job(s) need migration.`);
      }
    }

    console.log('\n' + '='.repeat(80));

    // Exit with appropriate code
    const hasCurrentSetting = allJobs
      ? allJobs.filter((job: any) => job.command.toLowerCase().includes('current_setting')).length
      : 0;

    if (hasCurrentSetting > 0) {
      console.log('EXIT CODE: 1 (Issues found)');
      process.exit(1);
    } else {
      console.log('EXIT CODE: 0 (All checks passed)');
      process.exit(0);
    }

  } catch (error) {
    console.error('\nFATAL ERROR:', error);
    process.exit(1);
  }
}

runVerificationQueries();
