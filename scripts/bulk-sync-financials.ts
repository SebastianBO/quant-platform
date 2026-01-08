#!/usr/bin/env npx tsx
/**
 * Bulk Sync Financial Data from SEC EDGAR
 *
 * SEC allows 10 requests/second. This script syncs all stocks efficiently.
 *
 * Usage:
 *   npx tsx scripts/bulk-sync-financials.ts
 *   npx tsx scripts/bulk-sync-financials.ts --limit 1000
 *   npx tsx scripts/bulk-sync-financials.ts --offset 2000 --limit 500
 *   npx tsx scripts/bulk-sync-financials.ts --continue (resumes from last synced)
 */

import { createClient } from '@supabase/supabase-js'

const SEC_COMPANY_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json'
const SEC_COMPANY_FACTS_URL = 'https://data.sec.gov/api/xbrl/companyfacts/CIK'
const SEC_USER_AGENT = 'Lician contact@lician.com'

// Rate limiting: SEC allows 10 req/sec, we'll do 8 to be safe
const REQUESTS_PER_SECOND = 8
const DELAY_MS = 1000 / REQUESTS_PER_SECOND

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SECCompanyTicker {
  cik_str: number
  ticker: string
  title: string
}

// Parse command line args
const args = process.argv.slice(2)
const getArg = (name: string, defaultVal: string) => {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal
}
const hasFlag = (name: string) => args.includes(`--${name}`)

const LIMIT = parseInt(getArg('limit', '10000'))
const OFFSET = parseInt(getArg('offset', '0'))
const CONTINUE_MODE = hasFlag('continue')
const DRY_RUN = hasFlag('dry-run')

async function fetchAllCompanyTickers(): Promise<SECCompanyTicker[]> {
  console.log('Fetching company tickers from SEC...')
  const response = await fetch(SEC_COMPANY_TICKERS_URL, {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })
  if (!response.ok) throw new Error('Failed to fetch SEC company tickers')
  const data = await response.json()
  const tickers = Object.values(data) as SECCompanyTicker[]
  console.log(`Found ${tickers.length} companies in SEC database`)
  return tickers
}

async function getExistingTickers(): Promise<Set<string>> {
  console.log('Fetching existing synced tickers from Supabase...')
  const { data, error } = await supabase
    .from('income_statements')
    .select('ticker')
    .limit(100000)

  if (error) {
    console.error('Error fetching existing tickers:', error)
    return new Set()
  }

  const tickers = new Set((data || []).map(d => d.ticker))
  console.log(`Found ${tickers.size} tickers already synced`)
  return tickers
}

async function fetchCompanyFacts(cik: string) {
  const paddedCik = cik.toString().padStart(10, '0')
  const url = `${SEC_COMPANY_FACTS_URL}${paddedCik}.json`

  const response = await fetch(url, {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`SEC API error: ${response.status}`)
  }

  return response.json()
}

function parseIncomeStatements(facts: any, ticker: string, cik: string) {
  const statements: any[] = []
  const usGaap = facts.facts?.['us-gaap'] || {}

  // Key income statement fields
  const revenueField = usGaap.Revenues || usGaap.RevenueFromContractWithCustomerExcludingAssessedTax
  const netIncomeField = usGaap.NetIncomeLoss
  const grossProfitField = usGaap.GrossProfit
  const operatingIncomeField = usGaap.OperatingIncomeLoss
  const epsField = usGaap.EarningsPerShareBasic
  const epsDilutedField = usGaap.EarningsPerShareDiluted

  if (!revenueField?.units?.USD && !netIncomeField?.units?.USD) {
    return []
  }

  // Build a map of periods
  const periodMap = new Map<string, any>()

  // Process revenue
  const revenueData = revenueField?.units?.USD || []
  for (const item of revenueData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          cik,
          ticker,
          report_period: item.end,
          fiscal_period: item.fp,
          period: item.form === '10-K' ? 'annual' : 'quarterly',
          currency: 'USD',
        })
      }
      periodMap.get(key).revenue = item.val
    }
  }

  // Process net income
  const netIncomeData = netIncomeField?.units?.USD || []
  for (const item of netIncomeData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (periodMap.has(key)) {
        periodMap.get(key).net_income = item.val
      }
    }
  }

  // Process gross profit
  const grossProfitData = grossProfitField?.units?.USD || []
  for (const item of grossProfitData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (periodMap.has(key)) {
        periodMap.get(key).gross_profit = item.val
      }
    }
  }

  // Process operating income
  const operatingIncomeData = operatingIncomeField?.units?.USD || []
  for (const item of operatingIncomeData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (periodMap.has(key)) {
        periodMap.get(key).operating_income = item.val
      }
    }
  }

  // Process EPS
  const epsData = epsField?.units?.['USD/shares'] || []
  for (const item of epsData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (periodMap.has(key)) {
        periodMap.get(key).earnings_per_share = item.val
      }
    }
  }

  const epsDilutedData = epsDilutedField?.units?.['USD/shares'] || []
  for (const item of epsDilutedData) {
    if (item.form === '10-Q' || item.form === '10-K') {
      const key = `${item.end}-${item.form === '10-K' ? 'annual' : 'quarterly'}`
      if (periodMap.has(key)) {
        periodMap.get(key).earnings_per_share_diluted = item.val
      }
    }
  }

  return Array.from(periodMap.values())
}

async function syncCompany(ticker: string, cik: string): Promise<{ success: boolean; items: number; error?: string }> {
  try {
    const facts = await fetchCompanyFacts(cik)
    if (!facts) {
      return { success: false, items: 0, error: 'No SEC data' }
    }

    const statements = parseIncomeStatements(facts, ticker, cik)
    if (statements.length === 0) {
      return { success: true, items: 0 }
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would sync ${statements.length} statements for ${ticker}`)
      return { success: true, items: statements.length }
    }

    // Upsert to Supabase
    const { error } = await supabase
      .from('income_statements')
      .upsert(
        statements.map(s => ({
          ...s,
          source: 'SEC_EDGAR',
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'cik,report_period,period' }
      )

    if (error) {
      return { success: false, items: 0, error: error.message }
    }

    return { success: true, items: statements.length }
  } catch (error) {
    return {
      success: false,
      items: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('SEC EDGAR Bulk Financial Data Sync')
  console.log('='.repeat(60))
  console.log(`Mode: ${CONTINUE_MODE ? 'Continue from last sync' : 'Fresh sync'}`)
  console.log(`Limit: ${LIMIT}, Offset: ${OFFSET}`)
  console.log(`Dry run: ${DRY_RUN}`)
  console.log('')

  // Fetch all tickers from SEC
  const allTickers = await fetchAllCompanyTickers()

  let tickersToSync: { ticker: string; cik: string }[]

  if (CONTINUE_MODE) {
    const existing = await getExistingTickers()
    tickersToSync = allTickers
      .filter(t => !existing.has(t.ticker))
      .slice(0, LIMIT)
      .map(t => ({ ticker: t.ticker, cik: t.cik_str.toString() }))
    console.log(`Continuing sync: ${tickersToSync.length} remaining tickers`)
  } else {
    tickersToSync = allTickers
      .slice(OFFSET, OFFSET + LIMIT)
      .map(t => ({ ticker: t.ticker, cik: t.cik_str.toString() }))
    console.log(`Syncing ${tickersToSync.length} tickers (offset: ${OFFSET})`)
  }

  console.log('')

  let successCount = 0
  let failCount = 0
  let totalItems = 0
  const startTime = Date.now()

  for (let i = 0; i < tickersToSync.length; i++) {
    const { ticker, cik } = tickersToSync[i]
    process.stdout.write(`[${i + 1}/${tickersToSync.length}] ${ticker}... `)

    const result = await syncCompany(ticker, cik)

    if (result.success) {
      successCount++
      totalItems += result.items
      console.log(`✓ ${result.items} statements`)
    } else {
      failCount++
      console.log(`✗ ${result.error}`)
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, DELAY_MS))

    // Progress update every 100 tickers
    if ((i + 1) % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = (i + 1) / elapsed
      const remaining = tickersToSync.length - i - 1
      const eta = remaining / rate
      console.log(`\n--- Progress: ${i + 1}/${tickersToSync.length} (${(rate).toFixed(1)}/sec, ETA: ${Math.round(eta / 60)}min) ---\n`)
    }
  }

  const duration = (Date.now() - startTime) / 1000

  console.log('')
  console.log('='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total tickers: ${tickersToSync.length}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Total statements: ${totalItems}`)
  console.log(`Duration: ${Math.round(duration)}s (${(tickersToSync.length / duration).toFixed(1)} tickers/sec)`)
}

main().catch(console.error)
