import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncCompanyFinancials, syncInsiderTrades } from '@/lib/sec-edgar'

// Watch SEC EDGAR for ALL new filings (10-K, 10-Q, 8-K, Form 4)
// Automatically syncs data when new filings appear
// Runs every 5 minutes via cron - processes ALL new filings, no limits

const SEC_RSS_BASE = 'https://www.sec.gov/cgi-bin/browse-edgar'
const SEC_USER_AGENT = 'Lician contact@lician.com'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

interface Filing {
  cik: string
  ticker: string
  form: string
  filedDate: string
  accessionNumber: string
  companyName: string
}

// Cache ticker mapping
let tickerMap: Map<string, { ticker: string; name: string }> | null = null
let tickerMapExpiry = 0

async function getTickerMap(): Promise<Map<string, { ticker: string; name: string }>> {
  if (tickerMap && Date.now() < tickerMapExpiry) {
    return tickerMap
  }

  const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })
  const data = await response.json()

  tickerMap = new Map()
  for (const company of Object.values(data) as Array<{ cik_str: number; ticker: string; title: string }>) {
    const paddedCik = company.cik_str.toString().padStart(10, '0')
    tickerMap.set(paddedCik, { ticker: company.ticker, name: company.title })
  }

  tickerMapExpiry = Date.now() + 3600000 // Cache for 1 hour
  return tickerMap
}

// Fetch latest filings from SEC RSS - get maximum available
async function fetchLatestFilings(formType: string, count: number = 100): Promise<Filing[]> {
  const url = `${SEC_RSS_BASE}?action=getcurrent&type=${formType}&company=&dateb=&owner=include&count=${count}&output=atom`

  const response = await fetch(url, {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })

  if (!response.ok) {
    console.error(`Failed to fetch ${formType} RSS:`, response.status)
    return []
  }

  const text = await response.text()
  const filings: Filing[] = []

  // Parse Atom XML entries
  const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || []
  const tickers = await getTickerMap()

  for (const entry of entries) {
    try {
      const titleMatch = entry.match(/<title[^>]*>([^<]+)<\/title>/)
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/)
      const updatedMatch = entry.match(/<updated>([^<]+)<\/updated>/)

      if (!titleMatch || !linkMatch) continue

      const title = titleMatch[1]
      // Title format: "10-K - Company Name (0001234567) (Filer)" or "4 - Owner Name (0001234567)"
      const cikMatch = title.match(/\((\d{10})\)/)
      const formMatch = title.match(/^(\d+-[KQ]|8-K|4)\s/)

      if (!cikMatch) continue

      const cik = cikMatch[1]
      const tickerInfo = tickers.get(cik)
      const ticker = tickerInfo?.ticker || 'UNKNOWN'
      const accessionMatch = linkMatch[1].match(/(\d{10}-\d{2}-\d{6})/)

      // Extract company name from title
      const nameMatch = title.match(/(?:\d+-[KQ]|8-K|4)\s*-\s*(.+?)\s*\(\d{10}\)/)

      filings.push({
        cik,
        ticker,
        form: formMatch?.[1] || 'UNKNOWN',
        filedDate: updatedMatch?.[1]?.split('T')[0] || new Date().toISOString().split('T')[0],
        accessionNumber: accessionMatch?.[1] || '',
        companyName: nameMatch?.[1]?.trim() || tickerInfo?.name || ''
      })
    } catch (e) {
      console.error('Error parsing filing entry:', e)
    }
  }

  return filings
}

// Check if filing was already processed (using accession_number as unique key)
async function isAlreadyProcessed(accessionNumber: string, table: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from(table)
    .select('id')
    .eq('accession_number', accessionNumber)
    .limit(1)

  return (data?.length || 0) > 0
}

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without auth but log
    console.log('Watch filings called without CRON_SECRET')
  }

  try {
    const startTime = Date.now()

    // Fetch ALL latest filings for each form type
    const [filings10K, filings10Q, filings8K, filingsForm4] = await Promise.all([
      fetchLatestFilings('10-K', 100),
      fetchLatestFilings('10-Q', 100),
      fetchLatestFilings('8-K', 100),
      fetchLatestFilings('4', 100)  // Form 4 - insider trades
    ])

    const results = {
      financials: { processed: 0, created: 0, errors: 0 },
      form8K: { processed: 0, created: 0, errors: 0 },
      form4: { processed: 0, created: 0, errors: 0 }
    }

    // Process 10-K and 10-Q filings - sync financial statements
    const earningsFilings = [...filings10K, ...filings10Q].filter(f => f.ticker !== 'UNKNOWN')

    for (const filing of earningsFilings) {
      try {
        results.financials.processed++
        const result = await syncCompanyFinancials(filing.cik, filing.ticker)
        if (result.success) {
          results.financials.created += result.itemsCreated
        } else {
          results.financials.errors++
        }
      } catch {
        results.financials.errors++
      }
      // Rate limit - SEC allows 10 req/sec
      await new Promise(r => setTimeout(r, 100))
    }

    // Process 8-K filings - store in sec_filings table
    const ITEM_DESCRIPTIONS: Record<string, string> = {
      '2.02': 'Results of Operations',
      '5.02': 'Officer/Director Changes',
      '2.01': 'Asset Acquisition/Disposition',
      '8.01': 'Other Events',
    }

    for (const filing of filings8K.filter(f => f.ticker !== 'UNKNOWN')) {
      try {
        // Skip if already processed
        const exists = await isAlreadyProcessed(filing.accessionNumber, 'sec_filings')
        if (exists) continue

        results.form8K.processed++

        // Store 8-K filing
        const { error } = await getSupabase()
          .from('sec_filings')
          .upsert({
            cik: filing.cik,
            ticker: filing.ticker,
            company_name: filing.companyName,
            accession_number: filing.accessionNumber,
            filing_type: '8-K',
            filing_date: filing.filedDate,
            report_date: filing.filedDate,
            filing_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${filing.cik}&type=8-K`,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'accession_number',
          })

        if (!error) {
          results.form8K.created++
        } else {
          results.form8K.errors++
        }
      } catch {
        results.form8K.errors++
      }
    }

    // Process Form 4 filings - sync insider trades
    for (const filing of filingsForm4.filter(f => f.ticker !== 'UNKNOWN')) {
      try {
        results.form4.processed++

        // syncInsiderTrades uses upsert on accession_number, so no duplicates
        const result = await syncInsiderTrades(filing.cik, filing.ticker, { limit: 5 })
        if (result.success) {
          results.form4.created += result.itemsCreated
        } else {
          results.form4.errors++
        }
      } catch {
        results.form4.errors++
      }
      // Rate limit
      await new Promise(r => setTimeout(r, 100))
    }

    const duration = Date.now() - startTime

    // Log to database
    await getSupabase().from('cron_job_log').insert({
      job_name: 'watch-filings',
      status: 'completed',
      details: {
        duration_ms: duration,
        filings_found: {
          '10-K': filings10K.length,
          '10-Q': filings10Q.length,
          '8-K': filings8K.length,
          'Form4': filingsForm4.length,
        },
        results,
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalFilingsFound: filings10K.length + filings10Q.length + filings8K.length + filingsForm4.length,
        durationMs: duration,
      },
      filings: {
        '10-K': filings10K.length,
        '10-Q': filings10Q.length,
        '8-K': filings8K.length,
        'Form4': filingsForm4.length,
      },
      results,
    })

  } catch (error) {
    console.error('Watch filings error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Watch failed'
    }, { status: 500 })
  }
}
