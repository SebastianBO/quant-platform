import { NextRequest, NextResponse } from 'next/server'

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

async function fetchFD(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Map form types to categories
function categorizeFilingType(formType: string): string {
  const type = formType.toUpperCase()
  if (type.includes('10-K')) return 'Annual Report'
  if (type.includes('10-Q')) return 'Quarterly Report'
  if (type.includes('8-K')) return 'Current Report'
  if (type.includes('4') || type.includes('FORM 4')) return 'Insider Trading'
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
  if (type.includes('4') || type.includes('13F') || type.includes('DEF 14A')) return 'medium'
  return 'low'
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const formType = request.nextUrl.searchParams.get('form_type') // Optional filter
  const limit = request.nextUrl.searchParams.get('limit') || '20'

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    const params: Record<string, string> = {
      ticker,
      limit
    }

    if (formType) {
      params.form_type = formType
    }

    const filings = await fetchFD('/sec-filings/', params)

    const processedFilings = (filings.sec_filings || []).map((filing: any) => ({
      id: filing.accession_number,
      formType: filing.form_type,
      category: categorizeFilingType(filing.form_type),
      importance: getFilingImportance(filing.form_type),
      filedDate: filing.filing_date,
      acceptedDate: filing.accepted_date,
      description: filing.description || filing.form_type,
      documentUrl: filing.document_url,
      secUrl: filing.sec_url || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=${filing.form_type}&dateb=&owner=include&count=40`,
      items: filing.items || []
    }))

    // Group by category for summary
    const byCategory: Record<string, number> = {}
    processedFilings.forEach((f: any) => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1
    })

    return NextResponse.json({
      ticker,
      totalFilings: processedFilings.length,
      byCategory,
      filings: processedFilings
    })
  } catch (error) {
    console.error('SEC Filings API error:', error)
    return NextResponse.json({
      ticker,
      totalFilings: 0,
      byCategory: {},
      filings: []
    })
  }
}
