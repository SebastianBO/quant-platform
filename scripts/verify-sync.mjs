import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wcckhqxkmhyzfpynthte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('=== VERIFICATION ===\n');

// Check all unique tickers with dots
const { data: allTickers } = await supabase
  .from('income_statements')
  .select('ticker, cik')
  .limit(5000);

const uniqueTickers = [...new Set(allTickers?.map(t => t.ticker) || [])];
console.log(`Total unique tickers: ${uniqueTickers.length}`);

// International ones (with dots)
const intlTickers = uniqueTickers.filter(t => t && t.includes('.'));
console.log(`International tickers: ${intlTickers.length}`);
console.log(intlTickers.join(', '));

// Check specific stocks
const checkStocks = ['VOLV-B.ST', 'ERIC-B.ST', 'NOVO-B.CO', 'SAP.XETRA', 'ASML.AS'];
console.log('\n=== Data by stock ===');
for (const ticker of checkStocks) {
  const { count } = await supabase
    .from('income_statements')
    .select('*', { count: 'exact', head: true })
    .eq('ticker', ticker);
  console.log(`${ticker}: ${count} income statements`);
}

// Sample data for Volvo
console.log('\n=== Sample Volvo data ===');
const { data: volvoData } = await supabase
  .from('income_statements')
  .select('ticker, report_period, revenue, net_income, currency')
  .eq('ticker', 'VOLV-B.ST')
  .order('report_period', { ascending: false })
  .limit(3);

console.log(volvoData);
