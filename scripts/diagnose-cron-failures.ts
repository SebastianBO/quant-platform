import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.prod
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

async function runDiagnostic(functionName: string, title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(title);
  console.log('='.repeat(80));

  try {
    const { data, error } = await supabase.rpc(functionName);

    if (error) {
      console.error('ERROR:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No results found.');
      return null;
    }

    // Pretty print the results
    console.log(JSON.stringify(data, null, 2));
    console.log(`\nTotal records: ${data.length}`);
    return data;
  } catch (err) {
    console.error('Exception:', err);
    return null;
  }
}

async function diagnoseCronFailures() {
  console.log('='.repeat(80));
  console.log('CRON JOB FAILURE DIAGNOSTICS');
  console.log('='.repeat(80));
  console.log(`Connecting to: ${supabaseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Query 1: Failed job runs in last 24 hours
  const failed = await runDiagnostic(
    'get_failed_cron_runs',
    'QUERY 1: Failed Job Runs (Last 24 Hours)'
  );

  // Query 2: All scheduled cron jobs
  const allJobs = await runDiagnostic(
    'get_all_cron_jobs',
    'QUERY 2: All Scheduled Cron Jobs'
  );

  // Query 3: Check for duplicate job names
  const duplicates = await runDiagnostic(
    'get_duplicate_cron_jobs',
    'QUERY 3: Duplicate Job Names'
  );

  // Query 4: Specific jobs status (13f-holdings, financials-batch, insider)
  const keyJobs = await runDiagnostic(
    'get_key_cron_jobs_status',
    'QUERY 4: Status of Key Jobs (13F, Financials, Insider)'
  );

  // Bonus Query: Recent executions summary
  const recentExecs = await runDiagnostic(
    'get_recent_cron_executions',
    'BONUS QUERY: Recent Cron Executions (Last 24 Hours)'
  );

  // Analysis and recommendations
  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS & RECOMMENDATIONS');
  console.log('='.repeat(80));

  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for failed jobs
  if (failed && failed.length > 0) {
    issues.push(`Found ${failed.length} failed job execution(s) in the last 24 hours`);

    // Group failures by job name
    const failuresByJob = failed.reduce((acc: any, run: any) => {
      const jobName = run.jobname || 'Unknown';
      if (!acc[jobName]) {
        acc[jobName] = [];
      }
      acc[jobName].push(run);
      return acc;
    }, {});

    console.log('\nFailed Jobs Summary:');
    Object.entries(failuresByJob).forEach(([jobName, runs]: [string, any]) => {
      console.log(`  - ${jobName}: ${runs.length} failure(s)`);
      const latestFailure = runs[0];
      if (latestFailure.return_message) {
        console.log(`    Latest error: ${latestFailure.return_message.substring(0, 150)}...`);
      }
    });
  }

  // Check for duplicate jobs
  if (duplicates && duplicates.length > 0) {
    issues.push(`Found ${duplicates.length} duplicate job name(s)`);
    console.log('\nDuplicate Jobs:');
    duplicates.forEach((dup: any) => {
      console.log(`  - ${dup.jobname}: ${dup.count} instances`);
    });
    recommendations.push('Remove duplicate cron jobs to prevent conflicts');
  }

  // Check if key jobs are active
  if (allJobs && allJobs.length > 0) {
    const inactiveJobs = allJobs.filter((job: any) => !job.active);
    if (inactiveJobs.length > 0) {
      warnings.push(`${inactiveJobs.length} job(s) are marked as INACTIVE`);
      console.log('\nInactive Jobs:');
      inactiveJobs.forEach((job: any) => {
        console.log(`  - ${job.jobname} (ID: ${job.jobid})`);
      });
    }

    console.log(`\nTotal Active Jobs: ${allJobs.filter((j: any) => j.active).length}`);
    console.log(`Total Inactive Jobs: ${inactiveJobs.length}`);
  }

  // Check key jobs status
  if (keyJobs && keyJobs.length > 0) {
    console.log('\nKey Jobs Status:');

    // Group by job name and get latest execution
    const jobsMap = keyJobs.reduce((acc: any, job: any) => {
      if (!acc[job.jobname]) {
        acc[job.jobname] = {
          jobid: job.jobid,
          active: job.active,
          schedule: job.schedule,
          executions: []
        };
      }
      if (job.start_time) {
        acc[job.jobname].executions.push({
          status: job.status,
          start_time: job.start_time,
          duration: job.duration_seconds,
          message: job.return_message
        });
      }
      return acc;
    }, {});

    Object.entries(jobsMap).forEach(([jobName, info]: [string, any]) => {
      console.log(`\n  ${jobName}:`);
      console.log(`    Active: ${info.active ? 'YES' : 'NO'}`);
      console.log(`    Schedule: ${info.schedule}`);

      if (info.executions.length > 0) {
        const latest = info.executions[0];
        console.log(`    Last Run: ${latest.start_time}`);
        console.log(`    Last Status: ${latest.status}`);
        if (latest.duration) {
          console.log(`    Last Duration: ${parseFloat(latest.duration).toFixed(2)}s`);
        }

        const failedExecs = info.executions.filter((e: any) => e.status === 'failed');
        if (failedExecs.length > 0) {
          warnings.push(`${jobName} has ${failedExecs.length} failed execution(s)`);
        }
      } else {
        warnings.push(`${jobName} has never executed`);
        console.log(`    Status: NEVER EXECUTED`);
      }
    });
  }

  // Recent executions analysis
  if (recentExecs && recentExecs.length > 0) {
    const successful = recentExecs.filter((e: any) => e.status === 'succeeded').length;
    const failed = recentExecs.filter((e: any) => e.status === 'failed').length;

    console.log('\n' + '-'.repeat(80));
    console.log('Recent Execution Statistics:');
    console.log(`  Total Executions (24h): ${recentExecs.length}`);
    console.log(`  Successful: ${successful} (${((successful / recentExecs.length) * 100).toFixed(1)}%)`);
    console.log(`  Failed: ${failed} (${((failed / recentExecs.length) * 100).toFixed(1)}%)`);
  }

  // Display issues and recommendations
  console.log('\n' + '='.repeat(80));
  if (issues.length > 0) {
    console.log('\nCRITICAL ISSUES:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  if (warnings.length > 0) {
    console.log('\nWARNINGS:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (recommendations.length > 0) {
    console.log('\nRECOMMENDATIONS:');
    recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\nNo critical issues detected. Cron jobs appear to be healthy.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('DIAGNOSTICS COMPLETE');
  console.log('='.repeat(80));

  // Return appropriate exit code
  if (issues.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run the diagnostics
diagnoseCronFailures().catch((error) => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
