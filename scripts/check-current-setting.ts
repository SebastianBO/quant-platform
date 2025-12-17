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

async function check() {
  console.log('Checking for current_setting() references in cron jobs...\n');

  const { data, error } = await supabase.rpc('get_all_cron_jobs');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  const jobsWithCurrentSetting = data.filter((job: any) =>
    job.command.toLowerCase().includes('current_setting')
  );

  console.log(`Total jobs: ${data.length}`);
  console.log(`Jobs with current_setting(): ${jobsWithCurrentSetting.length}`);

  if (jobsWithCurrentSetting.length > 0) {
    console.log('\nWARNING: Jobs still using current_setting():');
    jobsWithCurrentSetting.forEach((job: any, index: number) => {
      console.log(`\n${index + 1}. ${job.jobname}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   Command preview: ${job.command.substring(0, 150)}...`);
    });
    process.exit(1);
  } else {
    console.log('\nSUCCESS: No jobs reference current_setting() - migration complete!');
    process.exit(0);
  }
}

check();
