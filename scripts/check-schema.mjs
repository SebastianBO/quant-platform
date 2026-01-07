import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wcckhqxkmhyzfpynthte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Try a direct insert to see the error
const testRecord = {
  cik: 'EODHD_VOLV-B.ST',
  ticker: 'VOLV-B.ST',
  fiscal_date_ending: '2024-12-31',
  fiscal_year: '2024',
  total_revenue: 526816000000,
  net_income: 50389000000,
  updated_at: new Date().toISOString(),
};

console.log('Testing insert to income_statements...');
const { data, error } = await supabase
  .from('income_statements')
  .insert(testRecord);

if (error) {
  console.log('Insert error:', error);
} else {
  console.log('Insert success:', data);
}

// Check what columns exist
console.log('\nFetching existing record...');
const { data: existing, error: fetchError } = await supabase
  .from('income_statements')
  .select('*')
  .eq('ticker', 'AAPL')
  .limit(1);

if (fetchError) {
  console.log('Fetch error:', fetchError);
} else if (existing?.[0]) {
  console.log('Sample record columns:');
  console.log(Object.keys(existing[0]).join(', '));
}
