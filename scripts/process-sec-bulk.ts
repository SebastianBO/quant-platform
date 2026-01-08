#!/usr/bin/env npx tsx
/**
 * SEC EDGAR Bulk Data Processor
 *
 * Downloads and processes companyfacts.zip (~1.34 GB) to populate
 * ALL 10,312 US company financials in our database.
 *
 * Run: npx tsx scripts/process-sec-bulk.ts
 *
 * Estimated time: 30-60 minutes
 * Requires: ~2GB RAM, ~5GB disk space
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// Load env
import 'dotenv/config'

const SEC_COMPANYFACTS_URL = 'https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip'
const SEC_USER_AGENT = 'Lician contact@lician.com'
const DATA_DIR = path.join(process.cwd(), 'data', 'sec-bulk')
const ZIP_FILE = path.join(DATA_DIR, 'companyfacts.zip')
const EXTRACT_DIR = path.join(DATA_DIR, 'companyfacts')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

// Download the bulk file if not exists
async function downloadBulkFile(): Promise<void> {
  if (fs.existsSync(ZIP_FILE)) {
    console.log('✓ companyfacts.zip already downloaded')
    return
  }

  console.log('📥 Downloading companyfacts.zip (1.34 GB)...')
  fs.mkdirSync(DATA_DIR, { recursive: true })

  // Use curl for progress
  execSync(
    `curl -L -o "${ZIP_FILE}" -H "User-Agent: ${SEC_USER_AGENT}" "${SEC_COMPANYFACTS_URL}"`,
    { stdio: 'inherit' }
  )
  console.log('✓ Download complete')
}

// Extract the zip file
function extractBulkFile(): void {
  if (fs.existsSync(EXTRACT_DIR) && fs.readdirSync(EXTRACT_DIR).length > 0) {
    console.log('✓ Already extracted')
    return
  }

  console.log('📦 Extracting companyfacts.zip...')
  fs.mkdirSync(EXTRACT_DIR, { recursive: true })
  execSync(`unzip -o "${ZIP_FILE}" -d "${EXTRACT_DIR}"`, { stdio: 'inherit' })
  console.log('✓ Extraction complete')
}

// CIK -> Ticker mapping
let tickerMap: Map<string, string> | null = null

async function loadTickerMap(): Promise<void> {
  console.log('📋 Loading CIK -> Ticker mapping...')
  const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })
  const data = await response.json()
  tickerMap = new Map()
  for (const company of Object.values(data) as any[]) {
    const paddedCik = company.cik_str.toString().padStart(10, '0')
    tickerMap!.set(paddedCik, company.ticker)
  }
  console.log(`✓ Loaded ${tickerMap!.size} ticker mappings`)
}

// Process a single company file
async function processCompanyFile(filePath: string): Promise<{ ticker: string; items: number } | null> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const facts: CompanyFacts = JSON.parse(content)

    const cik = facts.cik.toString().padStart(10, '0')
    const ticker = tickerMap?.get(cik)

    if (!ticker) return null

    const usGaap = facts.facts['us-gaap']
    if (!usGaap) return { ticker, items: 0 }

    const incomeStatements: any[] = []
    const balanceSheets: any[] = []
    const cashFlows: any[] = []

    // Key financial concepts
    const concepts = {
      revenue: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet'],
      netIncome: ['NetIncomeLoss', 'ProfitLoss'],
      epsBasic: ['EarningsPerShareBasic'],
      epsDiluted: ['EarningsPerShareDiluted'],
      totalAssets: ['Assets'],
      totalLiabilities: ['Liabilities'],
      cash: ['CashAndCashEquivalentsAtCarryingValue', 'Cash'],
      operatingCashFlow: ['NetCashProvidedByUsedInOperatingActivities'],
      investingCashFlow: ['NetCashProvidedByUsedInInvestingActivities'],
      financingCashFlow: ['NetCashProvidedByUsedInFinancingActivities'],
    }

    // Process each concept
    for (const [concept, data] of Object.entries(usGaap)) {
      const units = data.units
      if (!units) continue

      const usdValues = units.USD || units['USD/shares']
      if (!usdValues) continue

      for (const entry of usdValues) {
        if (!entry.form || !['10-K', '10-Q'].includes(entry.form)) continue
        if (!entry.end) continue

        const period = entry.fp === 'FY' ? 'annual' : 'quarterly'
        const reportPeriod = entry.end

        // Income statement items
        if (concepts.revenue.includes(concept) || concepts.netIncome.includes(concept) ||
            concepts.epsBasic.includes(concept) || concepts.epsDiluted.includes(concept)) {
          let stmt = incomeStatements.find(i => i.report_period === reportPeriod && i.period === period)
          if (!stmt) {
            stmt = { ticker, cik, report_period: reportPeriod, period }
            incomeStatements.push(stmt)
          }
          if (concepts.revenue.includes(concept)) stmt.total_revenue = entry.val
          if (concepts.netIncome.includes(concept)) stmt.net_income = entry.val
          if (concepts.epsBasic.includes(concept)) stmt.eps_basic = entry.val
          if (concepts.epsDiluted.includes(concept)) stmt.eps_diluted = entry.val
        }

        // Balance sheet items
        if (concepts.totalAssets.includes(concept) || concepts.totalLiabilities.includes(concept) ||
            concepts.cash.includes(concept)) {
          let stmt = balanceSheets.find(b => b.report_period === reportPeriod && b.period === period)
          if (!stmt) {
            stmt = { ticker, cik, report_period: reportPeriod, period }
            balanceSheets.push(stmt)
          }
          if (concepts.totalAssets.includes(concept)) stmt.total_assets = entry.val
          if (concepts.totalLiabilities.includes(concept)) stmt.total_liabilities = entry.val
          if (concepts.cash.includes(concept)) stmt.cash_and_equivalents = entry.val
        }

        // Cash flow items
        if (concepts.operatingCashFlow.includes(concept) || concepts.investingCashFlow.includes(concept) ||
            concepts.financingCashFlow.includes(concept)) {
          let stmt = cashFlows.find(c => c.report_period === reportPeriod && c.period === period)
          if (!stmt) {
            stmt = { ticker, cik, report_period: reportPeriod, period }
            cashFlows.push(stmt)
          }
          if (concepts.operatingCashFlow.includes(concept)) stmt.operating_cash_flow = entry.val
          if (concepts.investingCashFlow.includes(concept)) stmt.investing_cash_flow = entry.val
          if (concepts.financingCashFlow.includes(concept)) stmt.financing_cash_flow = entry.val
        }
      }
    }

    let totalItems = 0

    // Batch upsert
    if (incomeStatements.length > 0) {
      const { error } = await supabase
        .from('income_statements')
        .upsert(incomeStatements.map(i => ({ ...i, source: 'SEC_BULK', updated_at: new Date().toISOString() })),
          { onConflict: 'ticker,report_period,period' })
      if (!error) totalItems += incomeStatements.length
    }

    if (balanceSheets.length > 0) {
      const { error } = await supabase
        .from('balance_sheets')
        .upsert(balanceSheets.map(b => ({ ...b, source: 'SEC_BULK', updated_at: new Date().toISOString() })),
          { onConflict: 'ticker,report_period,period' })
      if (!error) totalItems += balanceSheets.length
    }

    if (cashFlows.length > 0) {
      const { error } = await supabase
        .from('cash_flow_statements')
        .upsert(cashFlows.map(c => ({ ...c, source: 'SEC_BULK', updated_at: new Date().toISOString() })),
          { onConflict: 'ticker,report_period,period' })
      if (!error) totalItems += cashFlows.length
    }

    return { ticker, items: totalItems }
  } catch (error) {
    return null
  }
}

// Main processing function
async function main(): Promise<void> {
  console.log('🚀 SEC EDGAR Bulk Data Processor')
  console.log('================================\n')

  const startTime = Date.now()

  // Step 1: Download
  await downloadBulkFile()

  // Step 2: Extract
  extractBulkFile()

  // Step 3: Load ticker mapping
  await loadTickerMap()

  // Step 4: Process all files
  console.log('\n📊 Processing company files...')

  const files = fs.readdirSync(EXTRACT_DIR).filter(f => f.endsWith('.json'))
  console.log(`Found ${files.length} company files\n`)

  let processed = 0
  let totalItems = 0
  let companiesWithData = 0

  for (const file of files) {
    const filePath = path.join(EXTRACT_DIR, file)
    const result = await processCompanyFile(filePath)

    processed++
    if (result) {
      totalItems += result.items
      if (result.items > 0) companiesWithData++
    }

    // Progress update every 100 files
    if (processed % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = processed / elapsed
      const remaining = (files.length - processed) / rate
      console.log(`Progress: ${processed}/${files.length} (${(processed/files.length*100).toFixed(1)}%) | ` +
                  `Items: ${totalItems} | Companies with data: ${companiesWithData} | ` +
                  `ETA: ${Math.round(remaining/60)}min`)
    }
  }

  const totalTime = (Date.now() - startTime) / 1000 / 60

  console.log('\n================================')
  console.log('✅ BULK IMPORT COMPLETE')
  console.log(`Files processed: ${processed}`)
  console.log(`Companies with data: ${companiesWithData}`)
  console.log(`Total items imported: ${totalItems}`)
  console.log(`Total time: ${totalTime.toFixed(1)} minutes`)
  console.log('================================\n')
}

main().catch(console.error)
