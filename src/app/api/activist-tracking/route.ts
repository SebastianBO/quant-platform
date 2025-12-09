import { NextRequest, NextResponse } from 'next/server'

const SEC_USER_AGENT = 'Lician contact@lician.com'

// Known activist investors and their CIKs
const KNOWN_ACTIVISTS: Record<string, { name: string; type: string }> = {
  '1048445': { name: 'Elliott Investment Management', type: 'Activist Hedge Fund' },
  '1336528': { name: 'Pershing Square Capital', type: 'Activist Hedge Fund' },
  '1040273': { name: 'Third Point LLC', type: 'Activist Hedge Fund' },
  '921669': { name: 'Icahn Enterprises', type: 'Activist Investor' },
  '1345471': { name: 'ValueAct Capital', type: 'Activist Hedge Fund' },
  '1517137': { name: 'Starboard Value', type: 'Activist Hedge Fund' },
  '1418814': { name: 'Jana Partners', type: 'Activist Hedge Fund' },
  '1061165': { name: 'Trian Fund Management', type: 'Activist Hedge Fund' },
  '1029160': { name: 'Soros Fund Management', type: 'Macro Hedge Fund' },
  '1167483': { name: 'Tiger Global Management', type: 'Growth Hedge Fund' },
}

interface ActivistFiling {
  ticker?: string
  companyName: string
  companyCik: string
  filingType: '13D' | '13G' | '13D/A' | '13G/A'
  investorName: string
  investorCik: string
  filingDate: string
  percentOwnership: number
  shares: number
  value?: number
  isKnownActivist: boolean
  activistType?: string
  purposeOfTransaction?: string
  flags: {
    isNew: boolean
    crossedThreshold: boolean
    significantChange: boolean
    potentialActivist: boolean
  }
}

interface RecentFilingsResponse {
  filings: ActivistFiling[]
  summary: {
    total13D: number
    total13G: number
    knownActivistFilings: number
    newPositions: number
  }
}

// Fetch recent 13D/13G filings from SEC EDGAR
async function fetchRecent13DGFilings(days: number = 7): Promise<ActivistFiling[]> {
  const filings: ActivistFiling[] = []

  try {
    // SEC EDGAR full-text search for recent 13D filings
    const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=*&dateRange=custom&forms=SC%2013D,SC%2013D/A,SC%2013G,SC%2013G/A&startdt=${getDateDaysAgo(days)}&enddt=${getTodayDate()}`

    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })

    if (!response.ok) {
      // Fallback: Use SEC's RSS feed for recent filings
      return await fetchFromRSS()
    }

    const data = await response.json()
    const hits = data.hits?.hits || []

    for (const hit of hits.slice(0, 50)) {
      const source = hit._source || {}
      const form = source.form || ''

      if (!form.includes('13D') && !form.includes('13G')) continue

      const filing: ActivistFiling = {
        companyName: source.display_names?.[0] || source.entity || 'Unknown',
        companyCik: source.ciks?.[0] || '',
        filingType: form.includes('13D') ?
          (form.includes('/A') ? '13D/A' : '13D') :
          (form.includes('/A') ? '13G/A' : '13G'),
        investorName: source.display_names?.[1] || 'Unknown Investor',
        investorCik: source.ciks?.[1] || '',
        filingDate: source.file_date || source.filing_date || '',
        percentOwnership: 0, // Would need to parse filing
        shares: 0,
        isKnownActivist: false,
        flags: {
          isNew: !form.includes('/A'),
          crossedThreshold: !form.includes('/A'),
          significantChange: false,
          potentialActivist: form.includes('13D')
        }
      }

      // Check if known activist
      if (KNOWN_ACTIVISTS[filing.investorCik]) {
        filing.isKnownActivist = true
        filing.activistType = KNOWN_ACTIVISTS[filing.investorCik].type
        filing.investorName = KNOWN_ACTIVISTS[filing.investorCik].name
      }

      filings.push(filing)
    }

  } catch (error) {
    console.error('Error fetching 13D/G filings:', error)
  }

  return filings
}

// Fallback: Fetch from SEC RSS
async function fetchFromRSS(): Promise<ActivistFiling[]> {
  const filings: ActivistFiling[] = []

  try {
    // SEC provides RSS feeds for form types
    const rssUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=SC%2013&company=&dateb=&owner=include&count=40&output=atom'

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })

    if (!response.ok) return filings

    const text = await response.text()

    // Parse RSS/Atom feed
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
    let match

    while ((match = entryRegex.exec(text)) !== null) {
      const entry = match[1]

      const getTag = (tag: string): string => {
        const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
        const m = entry.match(regex)
        return m ? m[1].trim() : ''
      }

      const title = getTag('title')
      const updated = getTag('updated')

      // Parse title: "13D - Company Name (CIK)"
      const titleMatch = title.match(/(SC 13[DG](?:\/A)?)\s*-\s*(.+?)\s*\((\d+)\)/i)
      if (!titleMatch) continue

      const formType = titleMatch[1].replace('SC ', '')
      const companyName = titleMatch[2]
      const cik = titleMatch[3]

      const filing: ActivistFiling = {
        companyName,
        companyCik: cik,
        filingType: formType.includes('13D') ?
          (formType.includes('/A') ? '13D/A' : '13D') :
          (formType.includes('/A') ? '13G/A' : '13G'),
        investorName: 'See Filing', // Would need to fetch full filing
        investorCik: '',
        filingDate: updated.split('T')[0],
        percentOwnership: 0,
        shares: 0,
        isKnownActivist: false,
        flags: {
          isNew: !formType.includes('/A'),
          crossedThreshold: !formType.includes('/A'),
          significantChange: false,
          potentialActivist: formType.includes('13D')
        }
      }

      filings.push(filing)
    }

  } catch (error) {
    console.error('RSS fetch error:', error)
  }

  return filings
}

// Get filings for a specific ticker/company
async function getFilingsForTicker(ticker: string): Promise<ActivistFiling[]> {
  const filings: ActivistFiling[] = []

  try {
    // First, get the company CIK from ticker
    const tickerResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      { headers: { 'User-Agent': SEC_USER_AGENT } }
    )

    if (!tickerResponse.ok) return filings

    const tickers = await tickerResponse.json()
    let companyCik: string | null = null

    for (const key in tickers) {
      if (tickers[key].ticker === ticker.toUpperCase()) {
        companyCik = String(tickers[key].cik_str).padStart(10, '0')
        break
      }
    }

    if (!companyCik) return filings

    // Fetch company's filings
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${companyCik}.json`
    const submissionsResponse = await fetch(submissionsUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })

    if (!submissionsResponse.ok) return filings

    const data = await submissionsResponse.json()
    const recent = data.filings?.recent || {}

    // Find 13D/13G filings
    if (recent.form) {
      for (let i = 0; i < recent.form.length && i < 100; i++) {
        const form = recent.form[i]
        if (!form.includes('13D') && !form.includes('13G')) continue

        const filing: ActivistFiling = {
          ticker,
          companyName: data.name,
          companyCik: data.cik,
          filingType: form.includes('13D') ?
            (form.includes('/A') ? '13D/A' : '13D') :
            (form.includes('/A') ? '13G/A' : '13G'),
          investorName: 'See Filing',
          investorCik: '',
          filingDate: recent.filingDate[i],
          percentOwnership: 0,
          shares: 0,
          isKnownActivist: false,
          flags: {
            isNew: !form.includes('/A'),
            crossedThreshold: !form.includes('/A'),
            significantChange: false,
            potentialActivist: form.includes('13D')
          }
        }

        filings.push(filing)
      }
    }

  } catch (error) {
    console.error('Error fetching ticker filings:', error)
  }

  return filings
}

// Helper functions
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const type = request.nextUrl.searchParams.get('type') || 'recent' // 'recent' or 'ticker'
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

  try {
    let filings: ActivistFiling[]

    if (type === 'ticker' && ticker) {
      // Get filings for specific ticker
      filings = await getFilingsForTicker(ticker)
    } else {
      // Get recent filings across all companies
      filings = await fetchRecent13DGFilings(days)
    }

    // Sort by date descending
    filings.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime())

    // Calculate summary
    const summary = {
      total13D: filings.filter(f => f.filingType.includes('13D')).length,
      total13G: filings.filter(f => f.filingType.includes('13G')).length,
      knownActivistFilings: filings.filter(f => f.isKnownActivist).length,
      newPositions: filings.filter(f => f.flags.isNew).length
    }

    const response: RecentFilingsResponse = {
      filings: filings.slice(0, 50),
      summary
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Activist tracking error:', error)
    return NextResponse.json({ error: 'Failed to fetch activist data' }, { status: 500 })
  }
}
