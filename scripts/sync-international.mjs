/**
 * Manual sync script for international stocks
 * Run with: node scripts/sync-international.mjs
 */
import { createClient } from '@supabase/supabase-js';

const EODHD_API_KEY = process.env.EODHD_API_KEY;
const SUPABASE_URL = 'https://wcckhqxkmhyzfpynthte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!EODHD_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars: EODHD_API_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test stocks - one from each major European exchange
const TEST_STOCKS = [
  { ticker: 'VOLV-B', exchange: 'ST', name: 'Volvo (Sweden)' },
  { ticker: 'ERIC-B', exchange: 'ST', name: 'Ericsson (Sweden)' },
  { ticker: 'NOVO-B', exchange: 'CO', name: 'Novo Nordisk (Denmark)' },
  { ticker: 'SAP', exchange: 'XETRA', name: 'SAP (Germany)' },
  { ticker: 'ASML', exchange: 'AS', name: 'ASML (Netherlands)' },
];

// Map EODHD field names to our database schema
function mapIncomeStatement(data, fiscalDate, ticker, exchange) {
  const fullTicker = `${ticker}.${exchange}`;
  // Truncate CIK to fit VARCHAR(10) constraint - use hash approach
  const cik = `E${exchange.slice(0,2)}${ticker.slice(0,5).replace(/-/g, '')}`.toUpperCase().slice(0, 10);

  return {
    cik,
    ticker: fullTicker,
    report_period: fiscalDate,
    fiscal_period: 'FY',
    period: 'annual',
    currency: data.currency_symbol || 'USD',
    revenue: parseFloat(data.totalRevenue) || null,
    cost_of_revenue: parseFloat(data.costOfRevenue) || null,
    gross_profit: parseFloat(data.grossProfit) || null,
    operating_expense: parseFloat(data.totalOperatingExpenses) || null,
    selling_general_and_administrative_expenses: parseFloat(data.sellingGeneralAdministrative) || null,
    research_and_development: parseFloat(data.researchDevelopment) || null,
    depreciation_and_amortization: parseFloat(data.depreciationAndAmortization) || null,
    operating_income: parseFloat(data.operatingIncome) || null,
    interest_expense: parseFloat(data.interestExpense) || null,
    interest_income: parseFloat(data.interestIncome) || null,
    income_before_tax: parseFloat(data.incomeBeforeTax) || null,
    income_tax_expense: parseFloat(data.incomeTaxExpense) || null,
    net_income: parseFloat(data.netIncome) || null,
    net_income_common_stock: parseFloat(data.netIncomeApplicableToCommonShares) || null,
    ebit: parseFloat(data.ebit) || null,
    ebitda: parseFloat(data.ebitda) || null,
    filing_date: data.filing_date,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  };
}

function mapBalanceSheet(data, fiscalDate, ticker, exchange) {
  const fullTicker = `${ticker}.${exchange}`;
  const cik = `E${exchange.slice(0,2)}${ticker.slice(0,5).replace(/-/g, '')}`.toUpperCase().slice(0, 10);

  return {
    cik,
    ticker: fullTicker,
    report_period: fiscalDate,
    fiscal_period: 'FY',
    period: 'annual',
    currency: data.currency_symbol || 'USD',
    total_assets: parseFloat(data.totalAssets) || null,
    current_assets: parseFloat(data.totalCurrentAssets) || null,
    cash_and_equivalents: parseFloat(data.cashAndEquivalents) || parseFloat(data.cash) || null,
    inventory: parseFloat(data.inventory) || null,
    accounts_receivable: parseFloat(data.netReceivables) || null,
    property_plant_and_equipment: parseFloat(data.propertyPlantEquipment) || null,
    goodwill: parseFloat(data.goodWill) || null,
    intangible_assets: parseFloat(data.intangibleAssets) || null,
    total_liabilities: parseFloat(data.totalLiab) || null,
    current_liabilities: parseFloat(data.totalCurrentLiabilities) || null,
    accounts_payable: parseFloat(data.accountsPayable) || null,
    short_term_debt: parseFloat(data.shortTermDebt) || null,
    long_term_debt: parseFloat(data.longTermDebt) || null,
    total_equity: parseFloat(data.totalStockholderEquity) || null,
    retained_earnings: parseFloat(data.retainedEarnings) || null,
    common_stock: parseFloat(data.commonStock) || null,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  };
}

function mapCashFlow(data, fiscalDate, ticker, exchange) {
  const fullTicker = `${ticker}.${exchange}`;
  const cik = `E${exchange.slice(0,2)}${ticker.slice(0,5).replace(/-/g, '')}`.toUpperCase().slice(0, 10);

  return {
    cik,
    ticker: fullTicker,
    report_period: fiscalDate,
    fiscal_period: 'FY',
    period: 'annual',
    currency: data.currency_symbol || 'USD',
    net_income: parseFloat(data.netIncome) || null,
    depreciation_and_amortization: parseFloat(data.depreciation) || null,
    net_cash_flow_from_operations: parseFloat(data.totalCashFromOperatingActivities) || null,
    capital_expenditure: parseFloat(data.capitalExpenditures) || null,
    net_cash_flow_from_investing: parseFloat(data.totalCashflowsFromInvestingActivities) || null,
    net_cash_flow_from_financing: parseFloat(data.totalCashFromFinancingActivities) || null,
    dividends_paid: parseFloat(data.dividendsPaid) || null,
    change_in_cash_and_equivalents: parseFloat(data.changeInCash) || null,
    free_cash_flow: parseFloat(data.freeCashFlow) || null,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  };
}

async function syncStock(ticker, exchange, name) {
  console.log(`\n=== Syncing ${name} (${ticker}.${exchange}) ===`);

  const url = `https://eodhd.com/api/fundamentals/${ticker}.${exchange}?api_token=${EODHD_API_KEY}&fmt=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log(`  Error: ${data.error}`);
      return { success: false, error: data.error };
    }

    const financials = data.Financials || {};
    const incomeStatements = financials.Income_Statement?.yearly || {};
    const balanceSheets = financials.Balance_Sheet?.yearly || {};
    const cashFlows = financials.Cash_Flow?.yearly || {};

    let incomeCount = 0, balanceCount = 0, cashFlowCount = 0;
    let errors = [];

    // Sync income statements (last 10 years)
    const incomeYears = Object.keys(incomeStatements).sort().reverse().slice(0, 10);
    for (const fiscalDate of incomeYears) {
      const mapped = mapIncomeStatement(incomeStatements[fiscalDate], fiscalDate, ticker, exchange);
      const { error } = await supabase
        .from('income_statements')
        .upsert(mapped, { onConflict: 'cik,report_period,period' });
      if (error) {
        errors.push(`Income ${fiscalDate}: ${error.message}`);
      } else {
        incomeCount++;
      }
    }

    // Sync balance sheets (last 10 years)
    const balanceYears = Object.keys(balanceSheets).sort().reverse().slice(0, 10);
    for (const fiscalDate of balanceYears) {
      const mapped = mapBalanceSheet(balanceSheets[fiscalDate], fiscalDate, ticker, exchange);
      const { error } = await supabase
        .from('balance_sheets')
        .upsert(mapped, { onConflict: 'cik,report_period,period' });
      if (error) {
        errors.push(`Balance ${fiscalDate}: ${error.message}`);
      } else {
        balanceCount++;
      }
    }

    // Sync cash flow statements (last 10 years)
    const cashFlowYears = Object.keys(cashFlows).sort().reverse().slice(0, 10);
    for (const fiscalDate of cashFlowYears) {
      const mapped = mapCashFlow(cashFlows[fiscalDate], fiscalDate, ticker, exchange);
      const { error } = await supabase
        .from('cash_flow_statements')
        .upsert(mapped, { onConflict: 'cik,report_period,period' });
      if (error) {
        errors.push(`CashFlow ${fiscalDate}: ${error.message}`);
      } else {
        cashFlowCount++;
      }
    }

    console.log(`  Income statements: ${incomeCount} years`);
    console.log(`  Balance sheets: ${balanceCount} years`);
    console.log(`  Cash flow statements: ${cashFlowCount} years`);
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.slice(0, 3).join('; ')}`);
    }

    return {
      success: errors.length === 0,
      incomeStatements: incomeCount,
      balanceSheets: balanceCount,
      cashFlowStatements: cashFlowCount
    };

  } catch (error) {
    console.log(`  Fetch error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run the sync
console.log('=== INTERNATIONAL STOCK SYNC ===');
console.log(`Syncing ${TEST_STOCKS.length} stocks from European exchanges...\n`);

let totalIncome = 0, totalBalance = 0, totalCashFlow = 0;

for (const stock of TEST_STOCKS) {
  const result = await syncStock(stock.ticker, stock.exchange, stock.name);
  if (result.incomeStatements) {
    totalIncome += result.incomeStatements;
    totalBalance += result.balanceSheets;
    totalCashFlow += result.cashFlowStatements;
  }
  // Rate limit
  await new Promise(resolve => setTimeout(resolve, 500));
}

console.log('\n=== SYNC COMPLETE ===');
console.log(`Total synced:`);
console.log(`  - Income statements: ${totalIncome}`);
console.log(`  - Balance sheets: ${totalBalance}`);
console.log(`  - Cash flow statements: ${totalCashFlow}`);

// Verify by counting international tickers
const { data: intlTickers } = await supabase
  .from('income_statements')
  .select('ticker')
  .like('ticker', '%.%')
  .limit(100);

const uniqueIntl = [...new Set(intlTickers?.map(t => t.ticker) || [])];
console.log(`\nInternational tickers now in database: ${uniqueIntl.length}`);
console.log(uniqueIntl.join(', '));
