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

async function finalHealthSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('FINAL COMPREHENSIVE CRON JOB HEALTH CHECK');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Get health summary from overview
    const { data: healthSummary, error: error1 } = await supabase
      .from('cron_jobs_overview')
      .select('health_status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const summary = data.reduce((acc: any, row: any) => {
          const status = row.health_status || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        return { data: summary, error: null };
      });

    // Get all jobs
    const { data: allJobs, error: error2 } = await supabase.rpc('get_all_cron_jobs');

    // Get unhealthy jobs
    const { data: unhealthyJobs, error: error3 } = await supabase
      .from('cron_jobs_overview')
      .select('jobname, schedule, health_status, failed_24h, last_error')
      .not('health_status', 'in', '(HEALTHY,NEVER_RAN)')
      .order('failed_24h', { ascending: false });

    // Check for current_setting references
    const jobsWithCurrentSetting = allJobs
      ? allJobs.filter((job: any) => job.command.toLowerCase().includes('current_setting'))
      : [];

    // Print Summary
    console.log('1. HEALTH STATUS SUMMARY');
    console.log('='.repeat(80));

    if (healthSummary) {
      const healthy = (healthSummary['HEALTHY'] || 0) as number;
      const unhealthy = Object.entries(healthSummary)
        .filter(([status]) => status !== 'HEALTHY' && status !== 'NEVER_RAN' && status !== 'INACTIVE')
        .reduce((sum, [, count]) => sum + (count as number), 0);
      const neverRan = (healthSummary['NEVER_RAN'] || 0) as number;
      const inactive = (healthSummary['INACTIVE'] || 0) as number;
      const total = Object.values(healthSummary).reduce((sum: number, count) => sum + (count as number), 0);

      console.log(`\nTotal Jobs: ${total}`);
      console.log(`  HEALTHY:    ${healthy}`);
      console.log(`  UNHEALTHY:  ${unhealthy}`);
      console.log(`  NEVER_RAN:  ${neverRan}`);
      console.log(`  INACTIVE:   ${inactive}`);
    }

    console.log('\n2. UNHEALTHY JOBS');
    console.log('='.repeat(80));

    if (unhealthyJobs && unhealthyJobs.length > 0) {
      console.log(`\nFound ${unhealthyJobs.length} unhealthy job(s):\n`);
      unhealthyJobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.jobname}`);
        console.log(`   Status: ${job.health_status}`);
        console.log(`   Failures (24h): ${job.failed_24h}`);
        if (job.last_error) {
          console.log(`   Last Error: ${job.last_error.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('\nNo unhealthy jobs found!');
    }

    console.log('\n3. JOBS STILL USING current_setting()');
    console.log('='.repeat(80));

    if (jobsWithCurrentSetting.length > 0) {
      console.log(`\nWARNING: ${jobsWithCurrentSetting.length} jobs still use current_setting():\n`);
      jobsWithCurrentSetting.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.jobname}`);
        console.log(`   Schedule: ${job.schedule}`);
        console.log(`   Active: ${job.active}`);
        console.log('');
      });
    } else {
      console.log('\nNo jobs use current_setting() - migration complete!');
    }

    console.log('\n4. NEVER RAN JOBS');
    console.log('='.repeat(80));

    const { data: neverRanJobs } = await supabase
      .from('cron_jobs_overview')
      .select('jobname, schedule')
      .eq('health_status', 'NEVER_RAN')
      .order('jobname');

    if (neverRanJobs && neverRanJobs.length > 0) {
      console.log(`\n${neverRanJobs.length} job(s) have never run:\n`);
      neverRanJobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.jobname}`);
        console.log(`   Schedule: ${job.schedule}`);
        console.log('');
      });
    } else {
      console.log('\nAll jobs have run at least once!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('FINAL ASSESSMENT');
    console.log('='.repeat(80));

    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    if (healthSummary) {
      const healthy = (healthSummary['HEALTHY'] || 0) as number;
      const unhealthy = Object.entries(healthSummary)
        .filter(([status]) => status !== 'HEALTHY' && status !== 'NEVER_RAN' && status !== 'INACTIVE')
        .reduce((sum, [, count]) => sum + (count as number), 0);

      if (healthy > 0) {
        successes.push(`${healthy} job(s) are HEALTHY and running successfully`);
      }

      if (unhealthy > 0) {
        issues.push(`${unhealthy} job(s) are UNHEALTHY and need immediate attention`);
      } else {
        successes.push('No unhealthy jobs detected');
      }
    }

    if (jobsWithCurrentSetting.length > 0) {
      issues.push(`${jobsWithCurrentSetting.length} job(s) still reference current_setting() and need migration`);
    } else {
      successes.push('All jobs have been migrated away from current_setting()');
    }

    if (neverRanJobs && neverRanJobs.length > 0) {
      warnings.push(`${neverRanJobs.length} job(s) have never run (may be new or waiting for schedule)`);
    }

    console.log('');

    if (successes.length > 0) {
      console.log('SUCCESSES:');
      successes.forEach(success => console.log(`  ✓ ${success}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('WARNINGS:');
      warnings.forEach(warning => console.log(`  ! ${warning}`));
      console.log('');
    }

    if (issues.length > 0) {
      console.log('CRITICAL ISSUES:');
      issues.forEach(issue => console.log(`  ✗ ${issue}`));
      console.log('');
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('ALL SYSTEMS OPERATIONAL - NO ISSUES DETECTED');
      console.log('');
    }

    console.log('='.repeat(80));

    // Exit code
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

finalHealthSummary();
