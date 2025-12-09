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

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const type = request.nextUrl.searchParams.get('type') || 'holders' // 'holders' or 'investor'
  const investor = request.nextUrl.searchParams.get('investor') // For investor lookup

  if (!ticker && !investor) {
    return NextResponse.json({ error: 'Ticker or investor is required' }, { status: 400 })
  }

  try {
    if (type === 'investor' && investor) {
      // Get all holdings for a specific institutional investor
      const holdings = await fetchFD('/institutional-ownership/', {
        investor_name: investor,
        limit: '50'
      })

      return NextResponse.json({
        investor,
        holdings: holdings.institutional_ownership || []
      })
    }

    // Get all institutional holders for a ticker
    const ownership = await fetchFD('/institutional-ownership/', {
      ticker: ticker!,
      limit: '20'
    })

    // Calculate summary statistics
    const holders = ownership.institutional_ownership || []
    const totalShares = holders.reduce((sum: number, h: any) => sum + (h.shares || 0), 0)
    const totalValue = holders.reduce((sum: number, h: any) => sum + (h.market_value || 0), 0)

    // Categorize by change
    const increased = holders.filter((h: any) => h.change_in_shares > 0)
    const decreased = holders.filter((h: any) => h.change_in_shares < 0)
    const newPositions = holders.filter((h: any) => h.is_new_position)

    return NextResponse.json({
      ticker,
      summary: {
        totalInstitutionalHolders: holders.length,
        totalShares,
        totalValue,
        increasedPositions: increased.length,
        decreasedPositions: decreased.length,
        newPositions: newPositions.length
      },
      holders: holders.map((h: any) => ({
        investor: h.investor_name,
        shares: h.shares,
        value: h.market_value,
        percentOwnership: h.percent_of_outstanding,
        changeInShares: h.change_in_shares,
        changePercent: h.change_percent,
        isNew: h.is_new_position,
        filingDate: h.filing_date,
        reportDate: h.report_date
      }))
    })
  } catch (error) {
    console.error('Institutional API error:', error)
    return NextResponse.json({
      ticker,
      summary: {
        totalInstitutionalHolders: 0,
        totalShares: 0,
        totalValue: 0,
        increasedPositions: 0,
        decreasedPositions: 0,
        newPositions: 0
      },
      holders: []
    })
  }
}
