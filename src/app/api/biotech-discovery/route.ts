import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Biotech Company Auto-Discovery System
 *
 * Discovers ALL biotech/pharma companies from multiple sources:
 * 1. SEC EDGAR - Companies with SIC codes 2834, 2835, 2836 (Pharma/Biotech)
 * 2. EODHD - Companies in Healthcare sector
 * 3. Existing financial_instruments table
 *
 * Runs incrementally - processes in batches to avoid rate limits
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

// SIC codes for biotech/pharma
const BIOTECH_SIC_CODES = [
  '2834', // Pharmaceutical Preparations
  '2835', // In Vitro & In Vivo Diagnostic Substances
  '2836', // Biological Products (Except Diagnostic)
  '2833', // Medicinal Chemicals and Botanical Products
  '8731', // Commercial Physical & Biological Research
]

// Keywords to identify biotech from company names
const BIOTECH_KEYWORDS = [
  'pharmaceutical', 'pharma', 'biotech', 'biotechnology',
  'therapeutics', 'biosciences', 'biopharma', 'biopharmaceutical',
  'oncology', 'genomics', 'gene therapy', 'cell therapy',
  'immunotherapy', 'biologics', 'drug', 'medicines'
]

interface DiscoveredCompany {
  ticker: string
  companyName: string
  cik: string | null
  sicCode: string | null
  exchange: string | null
  source: string
}

// Fetch SEC company tickers (has ~14000 companies with tickers)
async function fetchSECCompanyTickers(): Promise<Map<string, { cik: string; name: string }>> {
  try {
    const response = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: {
          'User-Agent': 'Lician contact@lician.com',
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) throw new Error(`SEC API error: ${response.status}`)

    const data = await response.json()
    const tickerMap = new Map<string, { cik: string; name: string }>()

    for (const key of Object.keys(data)) {
      const company = data[key]
      if (company.ticker) {
        tickerMap.set(company.ticker.toUpperCase(), {
          cik: String(company.cik_str).padStart(10, '0'),
          name: company.title
        })
      }
    }

    return tickerMap
  } catch (error) {
    console.error('SEC ticker fetch failed:', error)
    return new Map()
  }
}

// Fetch SIC codes for CIKs from SEC EDGAR
async function fetchSICCodesForCIKs(ciks: string[]): Promise<Map<string, string>> {
  const sicMap = new Map<string, string>()

  // Process in batches to avoid rate limits
  for (let i = 0; i < ciks.length; i += 10) {
    const batch = ciks.slice(i, i + 10)

    await Promise.all(batch.map(async (cik) => {
      try {
        const response = await fetch(
          `https://data.sec.gov/submissions/CIK${cik}.json`,
          {
            headers: {
              'User-Agent': 'Lician contact@lician.com',
              'Accept': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.sic) {
            sicMap.set(cik, data.sic)
          }
        }
      } catch {
        // Skip failed lookups
      }
    }))

    // Rate limit: 10 requests per second for SEC
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return sicMap
}

// Fetch biotech stocks from EODHD by sector
async function fetchEODHDBiotechStocks(): Promise<DiscoveredCompany[]> {
  if (!EODHD_API_KEY) return []

  try {
    const response = await fetch(
      `https://eodhd.com/api/screener?api_token=${EODHD_API_KEY}&filters=[["sector","=","Healthcare"]]&limit=3000&fmt=json`
    )

    if (!response.ok) {
      // Fallback: get from exchange list and filter by name
      const listResponse = await fetch(
        `https://eodhd.com/api/exchange-symbol-list/US?api_token=${EODHD_API_KEY}&fmt=json`
      )

      if (!listResponse.ok) return []

      const allStocks = await listResponse.json()

      // Filter by biotech keywords in name
      return allStocks
        .filter((stock: { Type: string; Name: string }) => {
          if (stock.Type !== 'Common Stock') return false
          const nameLower = stock.Name.toLowerCase()
          return BIOTECH_KEYWORDS.some(kw => nameLower.includes(kw))
        })
        .map((stock: { Code: string; Name: string; Exchange: string }) => ({
          ticker: stock.Code,
          companyName: stock.Name,
          cik: null,
          sicCode: null,
          exchange: stock.Exchange,
          source: 'eodhd-name-match'
        }))
    }

    const stocks = await response.json()

    return stocks.map((stock: { code: string; name: string; exchange: string }) => ({
      ticker: stock.code,
      companyName: stock.name,
      cik: null,
      sicCode: null,
      exchange: stock.exchange,
      source: 'eodhd-screener'
    }))
  } catch (error) {
    console.error('EODHD fetch failed:', error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = ReturnType<typeof createClient<any>>

// Get existing biotech companies from our database
async function fetchExistingBiotechFromDB(supabase: SupabaseClientAny): Promise<Set<string>> {
  const { data } = await supabase
    .from('biotech_company_mapping')
    .select('ticker')

  if (!data) return new Set()
  return new Set(data.map((d: { ticker: string }) => d.ticker))
}

// Get potential biotech from financial_instruments
async function fetchFromFinancialInstruments(supabase: SupabaseClientAny): Promise<DiscoveredCompany[]> {
  const { data } = await supabase
    .from('financial_instruments')
    .select('ticker, name, sector, industry, exchange')
    .or('sector.ilike.%health%,industry.ilike.%biotech%,industry.ilike.%pharma%,industry.ilike.%therapeutic%')
    .limit(5000)

  if (!data) return []

  return data.map((d: { ticker: string; name: string | null; exchange: string | null }) => ({
    ticker: d.ticker,
    companyName: d.name || d.ticker,
    cik: null,
    sicCode: null,
    exchange: d.exchange,
    source: 'financial-instruments'
  }))
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('mode') || 'discover' // discover, sync, status
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')
  const source = searchParams.get('source') || 'all' // all, sec, eodhd, db

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // Status mode - return current state
    if (mode === 'status') {
      const { count: totalMapped } = await supabase
        .from('biotech_company_mapping')
        .select('*', { count: 'exact', head: true })

      const { count: withTrials } = await supabase
        .from('clinical_trials')
        .select('ticker', { count: 'exact', head: true })

      const { data: recentAdditions } = await supabase
        .from('biotech_company_mapping')
        .select('ticker, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      return NextResponse.json({
        status: 'ok',
        totalMapped: totalMapped || 0,
        withTrials: withTrials || 0,
        recentAdditions,
        _meta: {
          timestamp: new Date().toISOString()
        }
      })
    }

    // Discovery mode - find new biotech companies
    const existingTickers = await fetchExistingBiotechFromDB(supabase)
    const allDiscovered: DiscoveredCompany[] = []

    console.log(`Starting biotech discovery. Existing companies: ${existingTickers.size}`)

    // Source 1: SEC EDGAR with SIC codes
    if (source === 'all' || source === 'sec') {
      console.log('Fetching SEC company tickers...')
      const secTickers = await fetchSECCompanyTickers()
      console.log(`Found ${secTickers.size} SEC tickers`)

      // Get SIC codes for a sample (rate limited)
      const tickersToCheck = Array.from(secTickers.entries())
        .filter(([ticker]) => !existingTickers.has(ticker))
        .slice(offset, offset + Math.min(limit, 500))

      if (tickersToCheck.length > 0) {
        const ciks = tickersToCheck.map(([, data]) => data.cik)
        console.log(`Checking SIC codes for ${ciks.length} companies...`)

        const sicCodes = await fetchSICCodesForCIKs(ciks.slice(0, 100)) // Limit to avoid timeout

        for (const [ticker, { cik, name }] of tickersToCheck) {
          const sic = sicCodes.get(cik)
          if (sic && BIOTECH_SIC_CODES.includes(sic)) {
            allDiscovered.push({
              ticker,
              companyName: name,
              cik,
              sicCode: sic,
              exchange: null,
              source: 'sec-sic'
            })
          }
        }
      }
    }

    // Source 2: EODHD Healthcare sector
    if (source === 'all' || source === 'eodhd') {
      console.log('Fetching EODHD biotech stocks...')
      const eodhd = await fetchEODHDBiotechStocks()
      console.log(`Found ${eodhd.length} from EODHD`)

      for (const company of eodhd) {
        if (!existingTickers.has(company.ticker) &&
            !allDiscovered.some(d => d.ticker === company.ticker)) {
          allDiscovered.push(company)
        }
      }
    }

    // Source 3: Our own financial_instruments table
    if (source === 'all' || source === 'db') {
      console.log('Checking financial_instruments...')
      const fromDB = await fetchFromFinancialInstruments(supabase)
      console.log(`Found ${fromDB.length} from DB`)

      for (const company of fromDB) {
        if (!existingTickers.has(company.ticker) &&
            !allDiscovered.some(d => d.ticker === company.ticker)) {
          allDiscovered.push(company)
        }
      }
    }

    // Sync mode - save discovered companies
    if (mode === 'sync') {
      const toInsert = allDiscovered.slice(0, limit)
      let inserted = 0

      for (const company of toInsert) {
        const { error } = await supabase
          .from('biotech_company_mapping')
          .upsert({
            ticker: company.ticker,
            company_name: company.companyName,
            cik: company.cik,
            sponsor_aliases: [company.companyName],
            industry: 'Biotechnology',
            is_biotech: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'ticker' })

        if (!error) inserted++
      }

      return NextResponse.json({
        success: true,
        discovered: allDiscovered.length,
        inserted,
        existing: existingTickers.size,
        sources: {
          sec: allDiscovered.filter(d => d.source === 'sec-sic').length,
          eodhd: allDiscovered.filter(d => d.source.includes('eodhd')).length,
          db: allDiscovered.filter(d => d.source === 'financial-instruments').length
        },
        _meta: {
          offset,
          limit,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Discover mode - just return what we found
    return NextResponse.json({
      success: true,
      discovered: allDiscovered.length,
      existing: existingTickers.size,
      companies: allDiscovered.slice(0, limit),
      sources: {
        sec: allDiscovered.filter(d => d.source === 'sec-sic').length,
        eodhd: allDiscovered.filter(d => d.source.includes('eodhd')).length,
        db: allDiscovered.filter(d => d.source === 'financial-instruments').length
      },
      _meta: {
        offset,
        limit,
        hasMore: allDiscovered.length > limit,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Biotech discovery error:', error)
    return NextResponse.json({
      error: 'Discovery failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST: Bulk discovery and sync
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow cron or admin access
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD
    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const body = await request.json()
    const { action, tickers } = body

    if (action === 'add-tickers' && Array.isArray(tickers)) {
      // Manually add specific tickers
      let added = 0

      for (const ticker of tickers.slice(0, 100)) {
        // Look up company name from SEC
        const secResponse = await fetch(
          'https://www.sec.gov/files/company_tickers.json',
          {
            headers: { 'User-Agent': 'Lician contact@lician.com' }
          }
        )

        let companyName = ticker
        let cik = null

        if (secResponse.ok) {
          const data = await secResponse.json()
          for (const key of Object.keys(data)) {
            if (data[key].ticker?.toUpperCase() === ticker.toUpperCase()) {
              companyName = data[key].title
              cik = String(data[key].cik_str).padStart(10, '0')
              break
            }
          }
        }

        const { error } = await supabase
          .from('biotech_company_mapping')
          .upsert({
            ticker: ticker.toUpperCase(),
            company_name: companyName,
            cik,
            sponsor_aliases: [companyName],
            industry: 'Biotechnology',
            is_biotech: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'ticker' })

        if (!error) added++
      }

      return NextResponse.json({
        success: true,
        added,
        requested: tickers.length
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Biotech POST error:', error)
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
