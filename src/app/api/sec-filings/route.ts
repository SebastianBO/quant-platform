import { NextRequest, NextResponse } from 'next/server'
import { getCompanySubmissions } from '@/lib/sec-edgar/client'

// CIK cache to avoid repeated lookups
const cikCache: Record<string, string> = {}

// Map form types to categories
function categorizeFilingType(formType: string): string {
  const type = formType.toUpperCase()
  if (type.includes('10-K')) return 'Annual Report'
  if (type.includes('10-Q')) return 'Quarterly Report'
  if (type.includes('8-K')) return 'Current Report'
  if (type === '4' || type.includes('FORM 4')) return 'Insider Trading'
  if (type.includes('13F')) return 'Institutional Holdings'
  if (type.includes('DEF 14A') || type.includes('PROXY')) return 'Proxy Statement'
  if (type.includes('S-1') || type.includes('S-3')) return 'Registration'
  if (type.includes('SC 13')) return 'Schedule 13D/G'
  return 'Other'
}

// Get importance level
function getFilingImportance(formType: string): 'high' | 'medium' | 'low' {
  const type = formType.toUpperCase()
  if (type.includes('10-K') || type.includes('10-Q') || type.includes('8-K')) return 'high'
  if (type === '4' || type.includes('13F') || type.includes('DEF 14A')) return 'medium'
  return 'low'
}

// Get filing description based on form type
function getFilingDescription(formType: string, items?: string[]): string {
  const type = formType.toUpperCase()

  if (type.includes('10-K')) return 'Annual Report - Comprehensive overview of business and financial condition'
  if (type.includes('10-Q')) return 'Quarterly Report - Financial statements and MD&A'
  if (type.includes('8-K')) {
    if (items && items.length > 0) {
      return `Current Report - ${items.join(', ')}`
    }
    return 'Current Report - Material events or corporate changes'
  }
  if (type === '4') return 'Statement of Changes in Beneficial Ownership'
  if (type.includes('13F')) return '13F Holdings Report - Institutional investment manager holdings'
  if (type.includes('DEF 14A')) return 'Proxy Statement - Shareholder meeting information'
  if (type.includes('S-1')) return 'Registration Statement - Initial public offering'
  if (type.includes('S-3')) return 'Registration Statement - Secondary offering'
  if (type.includes('SC 13D')) return 'Schedule 13D - Beneficial ownership over 5%'
  if (type.includes('SC 13G')) return 'Schedule 13G - Passive beneficial ownership'

  return formType
}

// Fetch CIK for a ticker
async function getCikForTicker(ticker: string): Promise<string | null> {
  // Check cache first
  if (cikCache[ticker.toUpperCase()]) {
    return cikCache[ticker.toUpperCase()]
  }

  try {
    // Fetch company info from our stock API which has the CIK
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const response = await fetch(`${baseUrl}/api/stock?ticker=${ticker}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (response.ok) {
      const data = await response.json()
      if (data.companyFacts?.cik) {
        const cik = data.companyFacts.cik.replace(/^0+/, '') // Remove leading zeros
        cikCache[ticker.toUpperCase()] = cik
        return cik
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching CIK for ticker:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const formTypeFilter = request.nextUrl.searchParams.get('form_type')
  const limitParam = request.nextUrl.searchParams.get('limit') || '30'
  const limit = parseInt(limitParam, 10)

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Get CIK for the ticker
    const cik = await getCikForTicker(ticker.toUpperCase())

    if (!cik) {
      console.log(`No CIK found for ticker: ${ticker}`)
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        totalFilings: 0,
        byCategory: {},
        filings: []
      })
    }

    // Fetch company submissions from SEC EDGAR
    const submissions = await getCompanySubmissions(cik)

    if (!submissions || !submissions.filings?.recent) {
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        totalFilings: 0,
        byCategory: {},
        filings: []
      })
    }

    const recent = submissions.filings.recent
    const filingCount = Math.min(recent.form?.length || 0, limit * 2) // Get more to filter

    const processedFilings = []

    for (let i = 0; i < filingCount && processedFilings.length < limit; i++) {
      const formType = recent.form?.[i]
      const accessionNumber = recent.accessionNumber?.[i]
      const filingDate = recent.filingDate?.[i]
      const primaryDocument = recent.primaryDocument?.[i]

      if (!formType || !accessionNumber) continue

      // Apply form type filter if specified
      if (formTypeFilter && !formType.toUpperCase().includes(formTypeFilter.toUpperCase())) {
        continue
      }

      const category = categorizeFilingType(formType)

      // Build SEC URLs
      const accessionNoHyphens = accessionNumber.replace(/-/g, '')
      const cikPadded = cik.padStart(10, '0')
      const secUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${formType}&dateb=&owner=include&count=40`
      const documentUrl = primaryDocument
        ? `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoHyphens}/${primaryDocument}`
        : secUrl

      processedFilings.push({
        id: accessionNumber,
        formType,
        category,
        importance: getFilingImportance(formType),
        filedDate: filingDate,
        description: getFilingDescription(formType),
        documentUrl,
        secUrl
      })
    }

    // Group by category for summary
    const byCategory: Record<string, number> = {}
    processedFilings.forEach((f) => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1
    })

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      companyName: submissions.name,
      cik,
      totalFilings: processedFilings.length,
      byCategory,
      filings: processedFilings
    })
  } catch (error) {
    console.error('SEC Filings API error:', error)
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      totalFilings: 0,
      byCategory: {},
      filings: [],
      error: 'Failed to fetch SEC filings'
    })
  }
}
