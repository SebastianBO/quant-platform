import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wcckhqxkmhyzfpynthte.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== SUPABASE DATABASE STATUS ===\n');

// Check table counts
const tables = ['income_statements', 'balance_sheets', 'cash_flow_statements'];
for (const table of tables) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  console.log(`${table}: ${count || 0} rows${error ? ` (error: ${error.message})` : ''}`);
}

// Check unique tickers
const { data: tickers } = await supabase
  .from('income_statements')
  .select('ticker')
  .limit(10000);

const uniqueTickers = [...new Set(tickers?.map(t => t.ticker) || [])];
console.log(`\nUnique tickers in income_statements: ${uniqueTickers.length}`);
console.log('Sample tickers:', uniqueTickers.slice(0, 15).join(', '));

// Check for international stocks (non-US format)
const intlTickers = uniqueTickers.filter(t => t && (t.includes('.') || t.includes('-')));
console.log(`\nInternational/special format tickers: ${intlTickers.length}`);
if (intlTickers.length > 0) {
  console.log('Samples:', intlTickers.slice(0, 10).join(', '));
}

// Check cron job history if available
console.log('\n=== CHECKING CRON JOB HISTORY ===');
const { data: cronHistory, error: cronError } = await supabase
  .from('cron_job_runs')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(10);

if (cronError) {
  console.log('Cron history table not found or error:', cronError.message);
} else if (cronHistory?.length > 0) {
  console.log('Recent cron runs:');
  cronHistory.forEach(run => {
    console.log(`  ${run.job_name}: ${run.status} at ${run.started_at}`);
  });
} else {
  console.log('No cron history found');
}

// Check for any European exchange tickers
console.log('\n=== CHECKING FOR EUROPEAN DATA ===');
const europeanExchanges = ['ST', 'XETRA', 'AS', 'PA', 'LSE', 'SW', 'CO', 'OL', 'HE'];
for (const exchange of europeanExchanges) {
  const { data: euData } = await supabase
    .from('income_statements')
    .select('ticker')
    .ilike('ticker', `%.${exchange}`)
    .limit(5);

  if (euData?.length > 0) {
    console.log(`${exchange}: ${euData.length} stocks found - ${euData.map(d => d.ticker).join(', ')}`);
  }
}

console.log('\n=== DONE ===');
