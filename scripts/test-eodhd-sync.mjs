// Test EODHD sync for a single Swedish stock
import { createClient } from '@supabase/supabase-js';

const EODHD_API_KEY = process.env.EODHD_API_KEY;
const SUPABASE_URL = 'https://wcckhqxkmhyzfpynthte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!EODHD_API_KEY) {
  console.error('EODHD_API_KEY not set');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test fetching EODHD fundamentals for a Swedish stock
async function testEODHDFetch(ticker, exchange) {
  const fullTicker = `${ticker}.${exchange}`;
  console.log(`\n=== Testing ${fullTicker} ===`);

  const url = `https://eodhd.com/api/fundamentals/${fullTicker}?api_token=${EODHD_API_KEY}&fmt=json`;
  console.log('Fetching from EODHD...');

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('EODHD Error:', data.error);
      return null;
    }

    console.log('General info:', {
      code: data.General?.Code,
      name: data.General?.Name,
      exchange: data.General?.Exchange,
      currency: data.General?.CurrencyCode,
      sector: data.General?.Sector,
    });

    const incomeStatements = data.Financials?.Income_Statement?.yearly || {};
    const balanceSheets = data.Financials?.Balance_Sheet?.yearly || {};
    const cashFlows = data.Financials?.Cash_Flow?.yearly || {};

    console.log('Financial data available:');
    console.log(`  - Income statements: ${Object.keys(incomeStatements).length} years`);
    console.log(`  - Balance sheets: ${Object.keys(balanceSheets).length} years`);
    console.log(`  - Cash flow statements: ${Object.keys(cashFlows).length} years`);

    if (Object.keys(incomeStatements).length > 0) {
      const years = Object.keys(incomeStatements).sort().reverse();
      console.log(`  - Years: ${years.slice(0, 5).join(', ')}...`);

      // Show sample data from latest year
      const latestYear = years[0];
      const latestData = incomeStatements[latestYear];
      console.log(`\n  Latest income statement (${latestYear}):`);
      console.log(`    - Revenue: ${latestData?.totalRevenue}`);
      console.log(`    - Net Income: ${latestData?.netIncome}`);
      console.log(`    - Operating Income: ${latestData?.operatingIncome}`);
    }

    return data;
  } catch (error) {
    console.log('Fetch error:', error.message);
    return null;
  }
}

// Test multiple stocks
const testStocks = [
  { ticker: 'VOLV-B', exchange: 'ST' },   // Volvo (Sweden)
  { ticker: 'NOVO-B', exchange: 'CO' },   // Novo Nordisk (Denmark)
  { ticker: 'SAP', exchange: 'XETRA' },   // SAP (Germany)
  { ticker: 'ASML', exchange: 'AS' },     // ASML (Netherlands)
];

console.log('=== EODHD INTERNATIONAL FUNDAMENTALS TEST ===');

for (const stock of testStocks) {
  await testEODHDFetch(stock.ticker, stock.exchange);
}

console.log('\n=== TEST COMPLETE ===');
