import { NextRequest, NextResponse } from 'next/server'

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

async function fetchFD(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 3600 }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

async function fetchEODHD(ticker: string) {
  const response = await fetch(
    `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`,
    { next: { revalidate: 3600 } }
  )

  if (!response.ok) return null
  return response.json()
}

// Institution type classification based on name patterns
function classifyInstitution(name: string): string {
  const lowerName = name.toLowerCase()

  if (lowerName.includes('vanguard') || lowerName.includes('blackrock') ||
      lowerName.includes('state street') || lowerName.includes('fidelity') ||
      lowerName.includes('schwab') || lowerName.includes('index')) {
    return 'Index Fund'
  }
  if (lowerName.includes('hedge') || lowerName.includes('capital management') ||
      lowerName.includes('partners') || lowerName.includes('advisors')) {
    return 'Hedge Fund'
  }
  if (lowerName.includes('pension') || lowerName.includes('retirement') ||
      lowerName.includes('teachers') || lowerName.includes('public employees')) {
    return 'Pension Fund'
  }
  if (lowerName.includes('bank') || lowerName.includes('morgan') ||
      lowerName.includes('goldman') || lowerName.includes('jpmorgan')) {
    return 'Bank'
  }
  if (lowerName.includes('insurance') || lowerName.includes('life')) {
    return 'Insurance'
  }
  if (lowerName.includes('berkshire')) {
    return 'Conglomerate'
  }
  if (lowerName.includes('norges') || lowerName.includes('sovereign')) {
    return 'Sovereign Wealth'
  }
  return 'Investment Manager'
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const type = request.nextUrl.searchParams.get('type') || 'holders'
  const investor = request.nextUrl.searchParams.get('investor')
  const search = request.nextUrl.searchParams.get('search')

  // Search for institutions
  if (type === 'search' && search) {
    try {
      // Get list of available investors from Financial Datasets
      const investorsData = await fetchFD('/institutional-ownership/investors/', {})
      const investors = investorsData.investors || []

      // Filter by search term
      const searchLower = search.toLowerCase()
      const matches = investors
        .filter((inv: string) => inv.toLowerCase().includes(searchLower))
        .slice(0, 20)
        .map((name: string) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          rawName: name,
          type: classifyInstitution(name)
        }))

      return NextResponse.json({ investors: matches })
    } catch (error) {
      console.error('Institution search error:', error)
      return NextResponse.json({ investors: [] })
    }
  }

  // Get all holdings for a specific investor
  if (type === 'investor' && investor) {
    try {
      // First try Financial Datasets API
      const holdings = await fetchFD('/institutional-ownership/', {
        investor: investor,
        limit: '100'
      }).catch(() => null)

      const holdingsList = holdings?.institutional_ownership || []

      // If Financial Datasets returns data, use it
      if (holdingsList.length > 0) {
        const totalAUM = holdingsList.reduce((sum: number, h: any) => sum + (h.market_value || 0), 0)
        const increased = holdingsList.filter((h: any) => h.change_in_shares > 0)
        const decreased = holdingsList.filter((h: any) => h.change_in_shares < 0)
        const newPositions = holdingsList.filter((h: any) => h.is_new_position)

        return NextResponse.json({
          investor: investor.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          investorType: classifyInstitution(investor),
          source: 'financial-datasets',
          summary: {
            totalAUM,
            totalPositions: holdingsList.length,
            increasedPositions: increased.length,
            decreasedPositions: decreased.length,
            newPositions: newPositions.length,
            reportDate: holdingsList[0]?.report_date || null
          },
          holdings: holdingsList.map((h: any) => ({
            ticker: h.ticker,
            shares: h.shares,
            value: h.market_value,
            portfolioPercent: totalAUM > 0 ? (h.market_value / totalAUM) * 100 : 0,
            percentOfCompany: h.percent_of_outstanding,
            changeInShares: h.change_in_shares,
            changePercent: h.change_percent,
            isNew: h.is_new_position,
            reportDate: h.report_date
          })).sort((a: any, b: any) => b.value - a.value)
        })
      }

      // Fallback to SEC EDGAR 13F data
      const secResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'}/api/sec-13f?investor=${encodeURIComponent(investor)}`,
        { next: { revalidate: 3600 } }
      ).catch(() => null)

      if (secResponse?.ok) {
        const secData = await secResponse.json()

        if (secData.holdings && secData.holdings.length > 0) {
          return NextResponse.json({
            investor: secData.institution?.name || investor.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            investorType: classifyInstitution(investor),
            source: 'sec-edgar',
            summary: {
              totalAUM: secData.summary?.totalValue || 0,
              totalPositions: secData.summary?.totalPositions || 0,
              increasedPositions: 0, // SEC doesn't track changes
              decreasedPositions: 0,
              newPositions: 0,
              reportDate: secData.filing?.reportDate || null
            },
            holdings: secData.holdings.map((h: any) => ({
              ticker: h.cusip, // Use CUSIP as identifier (would need CUSIP->ticker mapping)
              issuer: h.issuer,
              titleOfClass: h.class,
              shares: h.shares,
              value: h.value,
              portfolioPercent: h.portfolioPercent,
              percentOfCompany: null,
              changeInShares: 0,
              changePercent: 0,
              isNew: false,
              reportDate: secData.filing?.reportDate
            })),
            filing: secData.filing,
            availableQuarters: secData.availableQuarters
          })
        }
      }

      // No data from either source
      return NextResponse.json({
        investor: investor.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        investorType: classifyInstitution(investor),
        source: 'none',
        summary: { totalAUM: 0, totalPositions: 0 },
        holdings: []
      })
    } catch (error) {
      console.error('Investor holdings error:', error)
      return NextResponse.json({
        investor,
        summary: { totalAUM: 0, totalPositions: 0 },
        holdings: []
      })
    }
  }

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Fetch from both APIs in parallel
    const [fdData, eodhData] = await Promise.all([
      fetchFD('/institutional-ownership/', { ticker, limit: '50' }).catch(() => null),
      fetchEODHD(ticker).catch(() => null)
    ])

    // Get current stock price for value calculation
    const currentPrice = eodhData?.Highlights?.MarketCapitalization && eodhData?.SharesStats?.SharesOutstanding
      ? eodhData.Highlights.MarketCapitalization / eodhData.SharesStats.SharesOutstanding
      : null

    // Process EODHD holders data
    const eodhInstitutions = eodhData?.Holders?.Institutions || {}
    const eodhFunds = eodhData?.Holders?.Funds || {}

    // Convert EODHD objects to arrays
    const eodhHolders = [
      ...Object.values(eodhInstitutions).map((h: any) => ({ ...h, holderType: 'Institution' })),
      ...Object.values(eodhFunds).map((h: any) => ({ ...h, holderType: 'Mutual Fund' }))
    ]

    // Process Financial Datasets holders
    const fdHolders = fdData?.institutional_ownership || []

    // Merge data - prefer EODHD for portfolio % data, FD for change details
    const mergedHolders = fdHolders.map((fd: any) => {
      // Handle both investor and investor_name field names
      const investorName = fd.investor_name || fd.investor || 'Unknown'
      const fdNameLower = investorName.toLowerCase().replace(/_/g, ' ')
      const eodhMatch = eodhHolders.find((eh: any) => {
        const ehNameLower = eh.name.toLowerCase()
        return ehNameLower.includes(fdNameLower.split(' ')[0]) ||
               fdNameLower.includes(ehNameLower.split(' ')[0])
      })

      // Calculate value if not provided
      const shares = fd.shares || eodhMatch?.currentShares || 0
      const value = fd.market_value || (currentPrice && shares ? shares * currentPrice : null)

      return {
        investor: investorName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        investorType: classifyInstitution(investorName),
        shares,
        value,
        percentOwnership: fd.percent_of_outstanding || eodhMatch?.totalShares,
        portfolioPercent: eodhMatch?.totalAssets || null, // % of their portfolio in this stock
        changeInShares: fd.change_in_shares || eodhMatch?.change || 0,
        changePercent: fd.change_percent || eodhMatch?.change_p || 0,
        isNew: fd.is_new_position || false,
        filingDate: fd.filing_date || fd.report_period || eodhMatch?.date,
        reportDate: fd.report_date || fd.report_period || eodhMatch?.date,
        // Additional EODHD data if available
        eodhChange: eodhMatch?.change || null,
        eodhChangePercent: eodhMatch?.change_p || null
      }
    })

    // Add EODHD-only holders that aren't in FD data
    eodhHolders.forEach((eh: any) => {
      const ehNameLower = eh.name.toLowerCase()
      const alreadyExists = mergedHolders.some((h: any) =>
        h.investor.toLowerCase().includes(ehNameLower.split(' ')[0])
      )

      if (!alreadyExists && eh.currentShares > 0) {
        const ehValue = currentPrice ? eh.currentShares * currentPrice : null
        mergedHolders.push({
          investor: eh.name,
          investorType: eh.holderType === 'Mutual Fund' ? 'Mutual Fund' : classifyInstitution(eh.name),
          shares: eh.currentShares,
          value: ehValue,
          percentOwnership: eh.totalShares,
          portfolioPercent: eh.totalAssets,
          changeInShares: eh.change,
          changePercent: eh.change_p,
          isNew: false,
          filingDate: eh.date,
          reportDate: eh.date,
          eodhChange: eh.change,
          eodhChangePercent: eh.change_p
        })
      }
    })

    // Sort by value (or shares if no value)
    mergedHolders.sort((a: any, b: any) => (b.value || b.shares) - (a.value || a.shares))

    // Calculate summary statistics
    const totalShares = mergedHolders.reduce((sum: number, h: any) => sum + (h.shares || 0), 0)
    const totalValue = mergedHolders.reduce((sum: number, h: any) => sum + (h.value || 0), 0)
    const increased = mergedHolders.filter((h: any) => (h.changeInShares || 0) > 0)
    const decreased = mergedHolders.filter((h: any) => (h.changeInShares || 0) < 0)
    const unchanged = mergedHolders.filter((h: any) => (h.changeInShares || 0) === 0)
    const newPositions = mergedHolders.filter((h: any) => h.isNew)

    // Categorize holders by type
    const holdersByType = mergedHolders.reduce((acc: any, h: any) => {
      const type = h.investorType || 'Other'
      if (!acc[type]) acc[type] = { count: 0, value: 0 }
      acc[type].count++
      acc[type].value += h.value || 0
      return acc
    }, {})

    return NextResponse.json({
      ticker,
      summary: {
        totalInstitutionalHolders: mergedHolders.length,
        totalShares,
        totalValue,
        increasedPositions: increased.length,
        decreasedPositions: decreased.length,
        unchangedPositions: unchanged.length,
        newPositions: newPositions.length,
        avgPosition: mergedHolders.length > 0 ? totalValue / mergedHolders.length : 0,
        holdersByType
      },
      holders: mergedHolders,
      // Separate lists for UI
      increasedHolders: increased.slice(0, 10),
      decreasedHolders: decreased.slice(0, 10),
      topHolders: mergedHolders.slice(0, 20)
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
        unchangedPositions: 0,
        newPositions: 0,
        avgPosition: 0,
        holdersByType: {}
      },
      holders: [],
      increasedHolders: [],
      decreasedHolders: [],
      topHolders: []
    })
  }
}
