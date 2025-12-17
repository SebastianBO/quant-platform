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

const failingJobs = [
  'weekly-portfolio-report',
  'sync-fx-rates-every-4-hours',
  'sync-earnings-daily',
  'price-alert-monitoring',
  'nightly-options-ingestion',
  'hourly-options-flow',
  'daily-sec-filings-check',
  'daily-earnings-calendar',
  'daily-portfolio-summary'
];

async function getJobCommands() {
  console.log('='.repeat(80));
  console.log('FAILING CRON JOB COMMANDS');
  console.log('='.repeat(80));
  console.log('Fetching SQL commands for jobs with app.settings.service_role_key error...\n');

  try {
    // Query to get job commands using raw SQL
    const jobNamesList = failingJobs.map(j => `'${j}'`).join(', ');
    const query = `
      SELECT jobname, command
      FROM cron.job
      WHERE jobname IN (${jobNamesList})
      ORDER BY jobname;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

    if (error) {
      console.error('Error fetching job commands:', error);
      console.log('\nTrying alternative method...\n');

      // Try direct query using postgres connection
      const pgQuery = `
        SELECT jobname, command
        FROM cron.job
        WHERE jobname = ANY($1::text[])
        ORDER BY jobname;
      `;

      const result = await supabase.rpc('get_cron_job_commands', { job_names: failingJobs });

      if (result.error) {
        console.error('Alternative method also failed:', result.error);
        console.log('\nLet me try with a simpler approach...');

        // Last resort - get all jobs and filter
        const allJobsResult: any = await supabase.rpc('get_all_cron_jobs');

        if (allJobsResult.error) {
          console.error('Failed to fetch jobs:', allJobsResult.error);
          process.exit(1);
        }

        const filteredData = allJobsResult.data.filter((job: any) =>
          failingJobs.includes(job.jobname)
        );

        if (!filteredData || filteredData.length === 0) {
          console.log('No jobs found with the specified names.');
          process.exit(0);
        }

        displayJobCommands(filteredData);
        return;
      }

      displayJobCommands(result.data);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No jobs found with the specified names.');
      process.exit(0);
    }

    displayJobCommands(data);

  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

function displayJobCommands(data: any[]) {
  // Display each job's command
  console.log(`Found ${data.length} jobs:\n`);

  data.forEach((job: any, index: number) => {
    console.log(`${index + 1}. ${job.jobname}`);
    console.log('-'.repeat(80));
    console.log('SQL Command:');
    console.log(job.command);
    console.log('\n');
  });

  console.log('='.repeat(80));
  console.log('ANALYSIS');
  console.log('='.repeat(80));
  console.log('Looking for "app.settings.service_role_key" references...\n');

  let foundIssues = false;
  data.forEach((job: any) => {
    if (job.command && job.command.includes('app.settings.service_role_key')) {
      foundIssues = true;
      console.log(`FOUND in ${job.jobname}:`);
      console.log('This job uses the app.settings.service_role_key configuration parameter');
      console.log('which is causing the "unrecognized configuration parameter" error.\n');
    }
  });

  if (!foundIssues) {
    console.log('No direct references to app.settings.service_role_key found in these jobs.');
    console.log('The error may be coming from functions these jobs call.\n');
  }

  console.log('='.repeat(80));
}

getJobCommands();
