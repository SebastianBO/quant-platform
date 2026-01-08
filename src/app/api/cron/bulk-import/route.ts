import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// BULK DATA IMPORT - Downloads SEC & UK data dumps
// SEC: companyfacts.zip (~1.34 GB) - ALL US company financials
// UK: Companies House bulk data (~490 MB) - ALL UK companies
// Run this ONCE to populate database, then use incremental sync

// This is designed to be triggered externally (not via Vercel cron)
// because it needs more than 60 seconds to run

const SEC_COMPANYFACTS_URL = 'https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip'
const SEC_USER_AGENT = 'Lician contact@lician.com'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

interface CompanyFacts {
  cik: number
  entityName: string
  facts: {
    'us-gaap'?: Record<string, {
      label: string
      description: string
      units: Record<string, Array<{
        end: string
        val: number
        accn: string
        fy: number
        fp: string
        form: string
        filed: string
        frame?: string
      }>>
    }>
  }
}

// Process a single company's facts into our database format
async function processCompanyFacts(facts: CompanyFacts): Promise<number> {
  const cik = facts.cik.toString().padStart(10, '0')
  const ticker = await getTickerFromCik(cik)

  if (!ticker) return 0

  let itemsProcessed = 0
  const usGaap = facts.facts['us-gaap']

  if (!usGaap) return 0

  // Extract key financial metrics
  const incomeStatements: any[] = []
  const balanceSheets: any[] = []
  const cashFlows: any[] = []

  // Revenue items
  const revenueKeys = ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet']
  const netIncomeKeys = ['NetIncomeLoss', 'ProfitLoss']
  const epsKeys = ['EarningsPerShareBasic', 'EarningsPerShareDiluted']

  // Balance sheet items
  const totalAssetsKeys = ['Assets']
  const totalLiabilitiesKeys = ['Liabilities', 'LiabilitiesAndStockholdersEquity']
  const cashKeys = ['CashAndCashEquivalentsAtCarryingValue', 'Cash']

  // Cash flow items
  const operatingCashFlowKeys = ['NetCashProvidedByUsedInOperatingActivities']
  const investingCashFlowKeys = ['NetCashProvidedByUsedInInvestingActivities']
  const financingCashFlowKeys = ['NetCashProvidedByUsedInFinancingActivities']

  // Process each fact
  for (const [concept, data] of Object.entries(usGaap)) {
    const units = data.units
    if (!units) continue

    // Get USD values
    const usdValues = units.USD || units['USD/shares']
    if (!usdValues) continue

    for (const entry of usdValues) {
      if (!entry.form || !['10-K', '10-Q'].includes(entry.form)) continue

      const period = entry.fp === 'FY' ? 'annual' : 'quarterly'
      const reportPeriod = entry.end

      // Categorize by concept
      if (revenueKeys.includes(concept) || netIncomeKeys.includes(concept) || epsKeys.includes(concept)) {
        let existing = incomeStatements.find(i => i.report_period === reportPeriod && i.period === period)
        if (!existing) {
          existing = { ticker, cik, report_period: reportPeriod, period, source: 'SEC_BULK' }
          incomeStatements.push(existing)
        }
        if (revenueKeys.includes(concept)) existing.total_revenue = entry.val
        if (netIncomeKeys.includes(concept)) existing.net_income = entry.val
        if (concept === 'EarningsPerShareBasic') existing.eps_basic = entry.val
        if (concept === 'EarningsPerShareDiluted') existing.eps_diluted = entry.val
      }

      if (totalAssetsKeys.includes(concept) || cashKeys.includes(concept)) {
        let existing = balanceSheets.find(b => b.report_period === reportPeriod && b.period === period)
        if (!existing) {
          existing = { ticker, cik, report_period: reportPeriod, period, source: 'SEC_BULK' }
          balanceSheets.push(existing)
        }
        if (totalAssetsKeys.includes(concept)) existing.total_assets = entry.val
        if (cashKeys.includes(concept)) existing.cash_and_equivalents = entry.val
      }

      if (operatingCashFlowKeys.includes(concept) || investingCashFlowKeys.includes(concept) || financingCashFlowKeys.includes(concept)) {
        let existing = cashFlows.find(c => c.report_period === reportPeriod && c.period === period)
        if (!existing) {
          existing = { ticker, cik, report_period: reportPeriod, period, source: 'SEC_BULK' }
          cashFlows.push(existing)
        }
        if (operatingCashFlowKeys.includes(concept)) existing.operating_cash_flow = entry.val
        if (investingCashFlowKeys.includes(concept)) existing.investing_cash_flow = entry.val
        if (financingCashFlowKeys.includes(concept)) existing.financing_cash_flow = entry.val
      }
    }
  }

  // Batch insert
  if (incomeStatements.length > 0) {
    const { error } = await getSupabase()
      .from('income_statements')
      .upsert(incomeStatements.map(i => ({ ...i, updated_at: new Date().toISOString() })),
        { onConflict: 'ticker,report_period,period' })
    if (!error) itemsProcessed += incomeStatements.length
  }

  if (balanceSheets.length > 0) {
    const { error } = await getSupabase()
      .from('balance_sheets')
      .upsert(balanceSheets.map(b => ({ ...b, updated_at: new Date().toISOString() })),
        { onConflict: 'ticker,report_period,period' })
    if (!error) itemsProcessed += balanceSheets.length
  }

  if (cashFlows.length > 0) {
    const { error } = await getSupabase()
      .from('cash_flow_statements')
      .upsert(cashFlows.map(c => ({ ...c, updated_at: new Date().toISOString() })),
        { onConflict: 'ticker,report_period,period' })
    if (!error) itemsProcessed += cashFlows.length
  }

  return itemsProcessed
}

// Cache for CIK -> Ticker mapping
let tickerMap: Map<string, string> | null = null

async function getTickerFromCik(cik: string): Promise<string | null> {
  if (!tickerMap) {
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })
    const data = await response.json()
    tickerMap = new Map()
    for (const company of Object.values(data) as any[]) {
      const paddedCik = company.cik_str.toString().padStart(10, '0')
      tickerMap.set(paddedCik, company.ticker)
    }
  }
  return tickerMap.get(cik) || null
}

// Main endpoint - returns status and instructions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action') || 'status'

  if (action === 'status') {
    // Return current database status
    const { count: incomeCount } = await getSupabase()
      .from('income_statements')
      .select('*', { count: 'exact', head: true })

    const { count: balanceCount } = await getSupabase()
      .from('balance_sheets')
      .select('*', { count: 'exact', head: true })

    const { count: cashFlowCount } = await getSupabase()
      .from('cash_flow_statements')
      .select('*', { count: 'exact', head: true })

    const { data: uniqueTickers } = await getSupabase()
      .from('income_statements')
      .select('ticker')

    const uniqueCount = new Set((uniqueTickers || []).map((t: any) => t.ticker)).size

    return NextResponse.json({
      status: 'ready',
      currentData: {
        incomeStatements: incomeCount,
        balanceSheets: balanceCount,
        cashFlowStatements: cashFlowCount,
        uniqueCompanies: uniqueCount,
      },
      targetData: {
        secCompanies: 10312,
        ukCompanies: 4500000,
        coverage: `${((uniqueCount || 0) / 10312 * 100).toFixed(1)}%`,
      },
      bulkSources: {
        sec: {
          url: SEC_COMPANYFACTS_URL,
          size: '1.34 GB',
          description: 'All US company financials in one file',
        },
        uk: {
          url: 'https://download.companieshouse.gov.uk/en_accountsdata.html',
          size: '490 MB',
          description: 'All UK company accounts data',
        },
      },
      instructions: `
        To run bulk import:
        1. Download companyfacts.zip from SEC
        2. Run: node scripts/process-sec-bulk.js
        3. This will process all 10,312 companies
        4. Takes ~30-60 minutes depending on machine
      `,
    })
  }

  if (action === 'test') {
    // Test with a single company
    const cik = searchParams.get('cik') || '0000320193' // Apple

    try {
      const response = await fetch(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
        { headers: { 'User-Agent': SEC_USER_AGENT } }
      )

      if (!response.ok) {
        return NextResponse.json({ error: `SEC API error: ${response.status}` }, { status: 500 })
      }

      const facts: CompanyFacts = await response.json()
      const itemsProcessed = await processCompanyFacts(facts)

      return NextResponse.json({
        success: true,
        cik,
        entityName: facts.entityName,
        itemsProcessed,
      })
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
