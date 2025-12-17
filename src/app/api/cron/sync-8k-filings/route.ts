import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Sync 8-K filings from SEC EDGAR
// 8-Ks are material event reports (earnings, executive changes, M&A, etc.)

const SEC_RSS_BASE = 'https://www.sec.gov/cgi-bin/browse-edgar'
const SEC_USER_AGENT = 'Lician contact@lician.com'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

interface Filing8K {
  cik: string
  ticker: string
  company_name: string
  accession_number: string
  filing_date: string
  filing_url: string
  items: string[] // 8-K items (e.g., "Item 2.02", "Item 5.02")
  description?: string
}

// 8-K Items and their meanings
const ITEM_DESCRIPTIONS: Record<string, string> = {
  '1.01': 'Entry into Material Agreement',
  '1.02': 'Termination of Material Agreement',
  '1.03': 'Bankruptcy or Receivership',
  '1.04': 'Mine Safety',
  '2.01': 'Acquisition or Disposition of Assets',
  '2.02': 'Results of Operations and Financial Condition', // Earnings!
  '2.03': 'Creation of Direct Financial Obligation',
  '2.04': 'Triggering Events',
  '2.05': 'Costs for Exit Activities',
  '2.06': 'Material Impairments',
  '3.01': 'Notice of Delisting',
  '3.02': 'Unregistered Sales of Equity Securities',
  '3.03': 'Material Modification to Rights',
  '4.01': 'Changes in Registrant\'s Certifying Accountant',
  '4.02': 'Non-Reliance on Financial Statements',
  '5.01': 'Changes in Control',
  '5.02': 'Departure/Appointment of Officers/Directors', // Executive changes
  '5.03': 'Amendments to Articles',
  '5.04': 'Temporary Suspension of Trading',
  '5.05': 'Amendments to Code of Ethics',
  '5.06': 'Change in Shell Company Status',
  '5.07': 'Submission of Matters to Vote',
  '5.08': 'Shareholder Nominations',
  '6.01': 'ABS Informational Events',
  '6.02': 'Change of Servicer or Trustee',
  '6.03': 'Change in Credit Enhancement',
  '6.04': 'Failure to Make Distribution',
  '6.05': 'Securities Act Updating Disclosure',
  '7.01': 'Regulation FD Disclosure',
  '8.01': 'Other Events',
  '9.01': 'Financial Statements and Exhibits',
}

// Priority tickers to sync
const PRIORITY_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AMD', 'INTC', 'CRM', 'NFLX', 'AVGO',
  'JPM', 'V', 'MA', 'BAC', 'GS',
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK',
  'WMT', 'PG', 'KO', 'COST', 'HD',
  'GME', 'AMC', 'PLTR', 'SOFI', 'COIN',
]

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

// Fetch 8-K filings from SEC RSS
async function fetch8KFilings(count: number = 100): Promise<Filing8K[]> {
  const url = `${SEC_RSS_BASE}?action=getcurrent&type=8-K&company=&dateb=&owner=include&count=${count}&output=atom`

  const response = await fetch(url, {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })

  if (!response.ok) {
    console.error(`Failed to fetch 8-K RSS:`, response.status)
    return []
  }

  const text = await response.text()
  const filings: Filing8K[] = []
  const tickers = await getTickerMap()

  // Parse Atom XML entries
  const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || []

  for (const entry of entries) {
    try {
      const titleMatch = entry.match(/<title[^>]*>([^<]+)<\/title>/)
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/)
      const updatedMatch = entry.match(/<updated>([^<]+)<\/updated>/)
      const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)

      if (!titleMatch || !linkMatch) continue

      const title = titleMatch[1]
      // Title format: "8-K - Company Name (0001234567) (Filer)"
      const cikMatch = title.match(/\((\d{10})\)/)
      const formMatch = title.match(/^8-K/)

      if (!cikMatch || !formMatch) continue

      const cik = cikMatch[1]
      const tickerInfo = tickers.get(cik)

      if (!tickerInfo) continue // Skip unknown companies

      const accessionMatch = linkMatch[1].match(/(\d{10}-\d{2}-\d{6})/)
      const summary = summaryMatch?.[1] || ''

      // Extract items from the filing
      const items: string[] = []
      const itemMatches = summary.matchAll(/Item\s*(\d+\.\d+)/gi)
      for (const match of itemMatches) {
        if (!items.includes(match[1])) {
          items.push(match[1])
        }
      }

      // Build filing URL
      const accession = accessionMatch?.[1] || ''
      const accessionNoHyphens = accession.replace(/-/g, '')
      const cikNoZeros = cik.replace(/^0+/, '')
      const filingUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoZeros}/${accessionNoHyphens}/${accession}-index.htm`

      filings.push({
        cik,
        ticker: tickerInfo.ticker,
        company_name: tickerInfo.name,
        accession_number: accession,
        filing_date: updatedMatch?.[1]?.split('T')[0] || new Date().toISOString().split('T')[0],
        filing_url: filingUrl,
        items,
        description: items.map(i => ITEM_DESCRIPTIONS[i] || i).join('; '),
      })
    } catch (e) {
      console.error('Error parsing 8-K entry:', e)
    }
  }

  return filings
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('8-K sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const priorityOnly = searchParams.get('priority') === 'true'
  const limit = parseInt(searchParams.get('limit') || '100')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // Fetch 8-K filings from SEC
    const filings = await fetch8KFilings(limit)

    if (filings.length === 0) {
      return NextResponse.json({ success: true, message: 'No new 8-K filings found' })
    }

    // Filter to priority tickers if requested
    let filingsToStore = filings
    if (priorityOnly) {
      const prioritySet = new Set(PRIORITY_TICKERS)
      filingsToStore = filings.filter(f => prioritySet.has(f.ticker))
    }

    // Store filings in sec_filings table
    let inserted = 0
    let errors: string[] = []

    for (const filing of filingsToStore) {
      const { error } = await supabase
        .from('sec_filings')
        .upsert({
          cik: filing.cik,
          ticker: filing.ticker,
          company_name: filing.company_name,
          accession_number: filing.accession_number,
          filing_type: '8-K',
          filing_date: filing.filing_date,
          report_date: filing.filing_date, // For 8-K, report date = filing date
          filing_url: filing.filing_url,
          items: filing.items,
          description: filing.description,
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'accession_number',
          ignoreDuplicates: false,
        })

      if (error) {
        errors.push(`${filing.ticker}: ${error.message}`)
      } else {
        inserted++
      }
    }

    // Identify important 8-Ks (earnings, executive changes)
    const earningsFilings = filingsToStore.filter(f => f.items.includes('2.02'))
    const executiveFilings = filingsToStore.filter(f => f.items.includes('5.02'))
    const mnaFilings = filingsToStore.filter(f => f.items.includes('2.01'))

    // Log sync result
    await supabase.from('cron_job_log').insert({
      job_name: 'sync-8k-filings',
      status: 'completed',
      details: {
        totalFound: filings.length,
        filtered: filingsToStore.length,
        inserted,
        errors: errors.length,
        earnings: earningsFilings.length,
        executive: executiveFilings.length,
        mna: mnaFilings.length,
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalFound: filings.length,
        filtered: filingsToStore.length,
        inserted,
        errors: errors.length,
        highlights: {
          earnings: earningsFilings.map(f => ({ ticker: f.ticker, date: f.filing_date })),
          executive: executiveFilings.map(f => ({ ticker: f.ticker, date: f.filing_date })),
          mna: mnaFilings.map(f => ({ ticker: f.ticker, date: f.filing_date })),
        },
      },
      ...(errors.length > 0 && { errors: errors.slice(0, 10) }),
    })

  } catch (error) {
    console.error('8-K sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
