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

async function checkCronStatus() {
  console.log('='.repeat(80));
  console.log('SUPABASE PG_CRON STATUS REPORT');
  console.log('='.repeat(80));
  console.log(`Connecting to: ${supabaseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Call the check_cron_status function
    const { data, error } = await supabase.rpc('check_cron_status');

    if (error) {
      console.error('Error calling check_cron_status:', error);
      console.log('\nThis could mean:');
      console.log('  1. The migration has not been applied yet');
      console.log('  2. The function does not exist');
      console.log('  3. Permission issues');
      console.log('\nPlease run: supabase db push');
      process.exit(1);
    }

    if (!data) {
      console.error('No data returned from check_cron_status');
      process.exit(1);
    }

    // Display results
    console.log('1. EXTENSION STATUS');
    console.log('-'.repeat(80));
    console.log(`Extension Installed: ${data.extension_installed ? 'YES' : 'NO'}`);
    if (data.extension_info && data.extension_info.length > 0) {
      console.log('Extension Info:', JSON.stringify(data.extension_info, null, 2));
    }

    console.log('\n2. SCHEDULED CRON JOBS');
    console.log('-'.repeat(80));
    console.log(`Jobs Defined: ${data.jobs_defined ? 'YES' : 'NO'}`);
    console.log(`Total Jobs: ${data.jobs_count}`);

    if (data.jobs && data.jobs.length > 0) {
      console.log('\nJob Details:');
      data.jobs.forEach((job: any, index: number) => {
        console.log(`\n  Job ${index + 1}:`);
        console.log(`    ID: ${job.jobid}`);
        console.log(`    Name: ${job.jobname}`);
        console.log(`    Schedule: ${job.schedule}`);
        console.log(`    Active: ${job.active ? 'YES' : 'NO'}`);
        console.log(`    Database: ${job.database}`);
        console.log(`    Command: ${job.command.substring(0, 100)}${job.command.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log('\nNo jobs found!');
    }

    console.log('\n3. RECENT JOB EXECUTIONS');
    console.log('-'.repeat(80));
    console.log(`Total Recent Executions: ${data.executions_count}`);

    if (data.executions && data.executions.length > 0) {
      console.log('\nExecution Summary:');
      if (data.execution_summary) {
        console.log(`  Successful: ${data.execution_summary.successful}`);
        console.log(`  Failed: ${data.execution_summary.failed}`);

        if (data.execution_summary.last_execution) {
          const last = data.execution_summary.last_execution;
          console.log(`\n  Most Recent Execution:`);
          console.log(`    Job: ${last.jobname || 'Unknown'}`);
          console.log(`    Status: ${last.status}`);
          console.log(`    Time: ${last.start_time}`);
          console.log(`    Duration: ${parseFloat(last.duration_seconds || 0).toFixed(2)}s`);
          if (last.return_message) {
            console.log(`    Message: ${last.return_message}`);
          }
        }
      }

      console.log('\n  Recent Executions (showing first 10):');
      data.executions.slice(0, 10).forEach((exec: any, index: number) => {
        console.log(`\n    ${index + 1}. ${exec.jobname || 'Unknown'}`);
        console.log(`       Status: ${exec.status}`);
        console.log(`       Time: ${exec.start_time}`);
        console.log(`       Duration: ${parseFloat(exec.duration_seconds || 0).toFixed(2)}s`);
        if (exec.return_message) {
          const msg = exec.return_message.substring(0, 100);
          console.log(`       Message: ${msg}${exec.return_message.length > 100 ? '...' : ''}`);
        }
      });
    } else {
      console.log('\nWARNING: No job executions found!');
      console.log('This means the jobs have NEVER run or execution history has been cleared.');
    }

    console.log('\n4. SCHEDULER PROCESS STATUS');
    console.log('-'.repeat(80));
    console.log(`Scheduler Running: ${data.scheduler_running ? 'YES' : 'NO (may be normal for managed services)'}`);

    if (data.scheduler_processes && data.scheduler_processes.length > 0) {
      console.log('\nScheduler Processes:');
      console.log(JSON.stringify(data.scheduler_processes, null, 2));
    }

    // Display health status
    console.log('\n' + '='.repeat(80));
    console.log('HEALTH STATUS');
    console.log('='.repeat(80));
    console.log(data.health_status);

    // Detailed diagnostics
    console.log('\n' + '='.repeat(80));
    console.log('DIAGNOSTICS');
    console.log('='.repeat(80));

    const issues: string[] = [];
    const warnings: string[] = [];

    if (!data.extension_installed) {
      issues.push('pg_cron extension is NOT installed');
    }

    if (!data.jobs_defined) {
      issues.push('No cron jobs are defined');
    }

    if (data.jobs_defined && data.executions_count === 0) {
      issues.push('Jobs are defined but have NEVER executed');
      issues.push('Possible causes:');
      issues.push('  - Jobs are not marked as active');
      issues.push('  - pg_cron scheduler is not running');
      issues.push('  - Database permissions issue');
      issues.push('  - Supabase plan does not include pg_cron');
    }

    if (data.jobs_defined && data.executions_count > 0) {
      const lastExecTime = data.execution_summary?.last_execution?.start_time;
      if (lastExecTime) {
        const lastExecDate = new Date(lastExecTime);
        const hoursSinceLastExec = (Date.now() - lastExecDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastExec > 24) {
          warnings.push(`Last execution was ${hoursSinceLastExec.toFixed(1)} hours ago`);
        }
      }

      if (data.execution_summary?.failed > 0) {
        warnings.push(`${data.execution_summary.failed} executions have failed`);
      }
    }

    // Check for inactive jobs
    if (data.jobs && data.jobs.length > 0) {
      const inactiveJobs = data.jobs.filter((job: any) => !job.active);
      if (inactiveJobs.length > 0) {
        warnings.push(`${inactiveJobs.length} job(s) are marked as INACTIVE:`);
        inactiveJobs.forEach((job: any) => {
          warnings.push(`  - ${job.jobname} (ID: ${job.jobid})`);
        });
      }
    }

    if (issues.length > 0) {
      console.log('\nCRITICAL ISSUES:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (warnings.length > 0) {
      console.log('\nWARNINGS:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('\nNo issues detected. Cron jobs appear to be configured and running correctly.');
    }

    console.log('\n' + '='.repeat(80));

    // Return appropriate exit code
    if (issues.length > 0) {
      process.exit(1);
    } else if (warnings.length > 0) {
      process.exit(0); // Exit successfully but with warnings
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

// Run the check
checkCronStatus();
