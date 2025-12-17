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

async function getJobsWithCurrentSetting() {
  console.log('='.repeat(80));
  console.log('JOBS STILL USING current_setting()');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const { data, error } = await supabase.rpc('get_all_cron_jobs');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  const jobsWithCurrentSetting = data.filter((job: any) =>
    job.command.toLowerCase().includes('current_setting')
  );

  if (jobsWithCurrentSetting.length === 0) {
    console.log('No jobs found with current_setting() references!');
    process.exit(0);
  }

  console.log(`Found ${jobsWithCurrentSetting.length} jobs still using current_setting():\n`);

  jobsWithCurrentSetting.forEach((job: any, index: number) => {
    console.log('='.repeat(80));
    console.log(`Job ${index + 1}: ${job.jobname}`);
    console.log('='.repeat(80));
    console.log(`Schedule: ${job.schedule}`);
    console.log(`Active: ${job.active}`);
    console.log(`\nFull Command:`);
    console.log('-'.repeat(80));
    console.log(job.command);
    console.log('-'.repeat(80));
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`Total jobs needing migration: ${jobsWithCurrentSetting.length}`);
  console.log('='.repeat(80));
}

getJobsWithCurrentSetting();
