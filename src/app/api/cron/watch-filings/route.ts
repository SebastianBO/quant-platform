import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncCompanyFinancials } from '@/lib/sec-edgar'

// Watch SEC EDGAR for new filings (10-K, 10-Q, 8-K)
// Automatically syncs financial data when earnings are released
// Call every 5 minutes via external cron

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
let tickerMap: Map<string, string> | null = null
let tickerMapExpiry = 0

async function getTickerMap(): Promise<Map<string, string>> {
  if (tickerMap && Date.now() < tickerMapExpiry) {
    return tickerMap
  }

  const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })
  const data = await response.json()

  tickerMap = new Map<string, string>()
  for (const company of Object.values(data) as Array<{ cik_str: number; ticker: string }>) {
    tickerMap.set(company.cik_str.toString().padStart(10, '0'), company.ticker)
  }

  tickerMapExpiry = Date.now() + 3600000 // Cache for 1 hour
  return tickerMap
}

// Fetch latest filings from SEC RSS
async function fetchLatestFilings(formType: string, count: number = 40): Promise<Filing[]> {
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
      // Title format: "10-K - Company Name (0001234567) (Filer)"
      const cikMatch = title.match(/\((\d{10})\)/)
      const formMatch = title.match(/^(\d+-[KQ]|8-K)/)
      const nameMatch = title.match(/^(?:\d+-[KQ]|8-K)\s*-\s*(.+?)\s*\(\d{10}\)/)

      if (!cikMatch || !formMatch) continue

      const cik = cikMatch[1]
      const ticker = tickers.get(cik) || 'UNKNOWN'
      const accessionMatch = linkMatch[1].match(/(\d{10}-\d{2}-\d{6})/)

      filings.push({
        cik,
        ticker,
        form: formMatch[1],
        filedDate: updatedMatch?.[1] || new Date().toISOString(),
        accessionNumber: accessionMatch?.[1] || '',
        companyName: nameMatch?.[1]?.trim() || ''
      })
    } catch (e) {
      console.error('Error parsing filing entry:', e)
    }
  }

  return filings
}

// Get recently processed filings to avoid duplicates
async function getRecentlyProcessed(): Promise<Set<string>> {
  const { data } = await getSupabase()
    .from('sync_queue')
    .select('ticker')
    .gte('queued_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  return new Set((data || []).map((r: { ticker: string }) => r.ticker))
}

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()

    // Fetch latest filings for each form type
    const [filings10K, filings10Q, filings8K] = await Promise.all([
      fetchLatestFilings('10-K', 20),
      fetchLatestFilings('10-Q', 30),
      fetchLatestFilings('8-K', 30)
    ])

    const allFilings = [...filings10K, ...filings10Q, ...filings8K]

    // Get already processed to avoid duplicates
    const recentlyProcessed = await getRecentlyProcessed()

    // Filter to new filings only
    const newFilings = allFilings.filter(f =>
      f.ticker !== 'UNKNOWN' &&
      !recentlyProcessed.has(f.ticker)
    )

    // Dedupe by ticker (keep most recent)
    const uniqueFilings = new Map<string, Filing>()
    for (const filing of newFilings) {
      if (!uniqueFilings.has(filing.ticker)) {
        uniqueFilings.set(filing.ticker, filing)
      }
    }

    const filingsToProcess = Array.from(uniqueFilings.values())
    const results: Array<{
      ticker: string
      form: string
      success: boolean
      items: number
      error?: string
    }> = []

    // Process new filings - sync their financial data
    // Only process 10-K and 10-Q (earnings) - 8-K is just logged
    const earningsFilings = filingsToProcess.filter(f => f.form === '10-K' || f.form === '10-Q')

    for (const filing of earningsFilings.slice(0, 10)) { // Max 10 per run
      try {
        // Queue for tracking
        await getSupabase().from('sync_queue').upsert({
          ticker: filing.ticker,
          cik: filing.cik,
          reason: `new_${filing.form.toLowerCase()}`,
          priority: filing.form === '10-K' ? 10 : 5,
          status: 'processing'
        }, { onConflict: 'ticker,status' })

        // Sync the company's financial data
        const result = await syncCompanyFinancials(filing.cik, filing.ticker)

        // Update queue status
        await getSupabase().from('sync_queue').update({
          status: result.success ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          error_message: result.errors.length > 0 ? result.errors[0] : null
        }).eq('ticker', filing.ticker).eq('status', 'processing')

        results.push({
          ticker: filing.ticker,
          form: filing.form,
          success: result.success,
          items: result.itemsCreated + result.itemsUpdated,
          error: result.errors.length > 0 ? result.errors[0] : undefined
        })

      } catch (error) {
        results.push({
          ticker: filing.ticker,
          form: filing.form,
          success: false,
          items: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 150))
    }

    // Log 8-K filings (material events) but don't sync
    const materialEvents = filingsToProcess.filter(f => f.form === '8-K')
    for (const filing of materialEvents.slice(0, 20)) {
      try {
        await getSupabase().from('sync_queue').upsert({
          ticker: filing.ticker,
          cik: filing.cik,
          reason: 'new_8k',
          priority: 1,
          status: 'logged'
        }, { onConflict: 'ticker,status' })
      } catch {
        // Ignore errors for 8-K logging
      }
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      summary: {
        totalFilingsFound: allFilings.length,
        newFilings: filingsToProcess.length,
        earningsProcessed: results.length,
        materialEventsLogged: materialEvents.length,
        successfulSyncs: results.filter(r => r.success).length,
        itemsSynced: results.reduce((sum, r) => sum + r.items, 0),
        durationMs: duration
      },
      filings: {
        '10-K': filings10K.length,
        '10-Q': filings10Q.length,
        '8-K': filings8K.length
      },
      results
    })

  } catch (error) {
    console.error('Watch filings error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Watch failed'
    }, { status: 500 })
  }
}
