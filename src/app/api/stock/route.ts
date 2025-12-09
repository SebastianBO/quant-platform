import { NextRequest, NextResponse } from 'next/server'

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

async function fetchFD(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Calculate date range for 52-week data
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const startDate = oneYearAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    // Fetch ALL available data in parallel
    const [
      snapshot,
      incomeStatements,
      balanceSheets,
      cashFlows,
      metrics,
      allMetrics,
      insiderTrades,
      analystEstimates,
      segmentedRevenues,
      companyFacts,
      quarterlyIncome,
      quarterlyBalance,
      quarterlyCashFlow,
      priceHistory,
      priceTargets,
      eohdRealtime,
      eohdFundamentals
    ] = await Promise.all([
      fetchFD('/prices/snapshot/', { ticker }).catch(() => ({ snapshot: null })),
      fetchFD('/financials/income-statements/', { ticker, period: 'annual', limit: '5' }).catch(() => ({ income_statements: [] })),
      fetchFD('/financials/balance-sheets/', { ticker, period: 'annual', limit: '5' }).catch(() => ({ balance_sheets: [] })),
      fetchFD('/financials/cash-flow-statements/', { ticker, period: 'annual', limit: '5' }).catch(() => ({ cash_flow_statements: [] })),
      fetchFD('/financial-metrics/', { ticker, period: 'annual', limit: '1' }).catch(() => ({ financial_metrics: [] })),
      fetchFD('/financial-metrics/', { ticker, period: 'annual', limit: '5' }).catch(() => ({ financial_metrics: [] })),
      fetchFD('/insider-trades/', { ticker, limit: '20' }).catch(() => ({ insider_trades: [] })),
      fetchFD('/analyst-estimates/', { ticker, limit: '8' }).catch(() => ({ analyst_estimates: [] })),
      fetchFD('/financials/segmented-revenues/', { ticker, period: 'annual', limit: '3' }).catch(() => ({ segmented_revenues: [] })),
      fetchFD('/company/facts/', { ticker }).catch(() => ({ company_facts: null })),
      fetchFD('/financials/income-statements/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ income_statements: [] })),
      fetchFD('/financials/balance-sheets/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ balance_sheets: [] })),
      fetchFD('/financials/cash-flow-statements/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ cash_flow_statements: [] })),
      fetchFD('/prices/', { ticker, interval: 'day', start_date: startDate, end_date: endDate }).catch(() => ({ prices: [] })),
      fetchFD('/analyst/price-targets/', { ticker, limit: '10' }).catch(() => ({ price_targets: [] })),
      // EODHD real-time for bid/ask and intraday data
      fetch(`https://eodhd.com/api/real-time/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`, { next: { revalidate: 60 } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // EODHD fundamentals for additional data
      fetch(`https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    // Parse segmented revenues - extract product segments and geographic segments
    const latestSegmented = segmentedRevenues?.segmented_revenues?.[0]
    const segments: { name: string; revenue: number; type: string }[] = []
    const productSegments: { name: string; revenue: number }[] = []
    const geoSegments: { name: string; revenue: number }[] = []

    if (latestSegmented?.items) {
      latestSegmented.items.forEach((item: any) => {
        const segmentInfo = item.segments?.[0]
        if (segmentInfo && item.amount > 0) {
          const label = segmentInfo.label || segmentInfo.key
          const type = segmentInfo.type || 'Unknown'

          // Categorize by type
          if (type === 'Product or Service' && !['Product', 'Service'].includes(label)) {
            productSegments.push({ name: label, revenue: item.amount })
          } else if (type === 'Statement Geographical' || type === 'Statement Business Segments') {
            geoSegments.push({ name: label, revenue: item.amount })
          }

          segments.push({ name: label, revenue: item.amount, type })
        }
      })
    }

    // Fallback: if no segments, create synthetic ones from income statement
    if (productSegments.length === 0 && incomeStatements.income_statements?.[0]) {
      const is = incomeStatements.income_statements[0]
      if (is.revenue) {
        productSegments.push({ name: 'Total Revenue', revenue: is.revenue })
      }
    }

    // Calculate 52-week high/low and average volume from price history
    const prices = priceHistory?.prices || []
    let yearHigh = 0
    let yearLow = Infinity
    let totalVolume = 0
    let volumeCount = 0

    prices.forEach((p: { high: number; low: number; volume: number }) => {
      if (p.high > yearHigh) yearHigh = p.high
      if (p.low < yearLow) yearLow = p.low
      if (p.volume) {
        totalVolume += p.volume
        volumeCount++
      }
    })

    const avgVolume = volumeCount > 0 ? Math.round(totalVolume / volumeCount) : 0
    if (yearLow === Infinity) yearLow = 0

    // Get today's OHLC from the most recent price data
    const todayPrice = prices[prices.length - 1] || {}
    const yesterdayPrice = prices[prices.length - 2] || {}

    // Get price target from analyst data
    const latestPriceTarget = priceTargets?.price_targets?.[0]
    const avgPriceTarget = latestPriceTarget?.price_target || null

    // Get company facts for beta, dividend, etc.
    const facts = companyFacts?.company_facts || {}

    // Get EODHD data
    const eohdTechnicals = eohdFundamentals?.Technicals || {}
    const eohdHighlights = eohdFundamentals?.Highlights || {}
    const eohdGeneral = eohdFundamentals?.General || {}

    // Create fallback snapshot from EODHD if Financial Datasets doesn't have the ticker
    const baseSnapshot = snapshot.snapshot || {
      ticker: ticker.toUpperCase(),
      price: eohdRealtime?.close || eohdRealtime?.previousClose || 0,
      day_change: eohdRealtime?.change || 0,
      day_change_percent: eohdRealtime?.change_p || 0,
      volume: eohdRealtime?.volume || 0,
      market_cap: eohdHighlights?.MarketCapitalization || 0,
    }

    // Enhance snapshot with calculated data
    const enhancedSnapshot = {
      ...baseSnapshot,
      // Day's OHLC - prefer EODHD real-time data
      open: eohdRealtime?.open || todayPrice.open || baseSnapshot?.open,
      dayHigh: eohdRealtime?.high || todayPrice.high || baseSnapshot?.day_high,
      dayLow: eohdRealtime?.low || todayPrice.low || baseSnapshot?.day_low,
      previousClose: eohdRealtime?.previousClose || yesterdayPrice.close || baseSnapshot?.previous_close,
      // Bid/Ask from EODHD real-time
      bid: eohdRealtime?.bid,
      ask: eohdRealtime?.ask,
      // 52-week range - prefer EODHD technicals
      yearHigh: eohdTechnicals['52WeekHigh'] || yearHigh || snapshot.snapshot?.year_high,
      yearLow: eohdTechnicals['52WeekLow'] || yearLow || snapshot.snapshot?.year_low,
      // Volume
      avgVolume,
      // From EODHD technicals
      beta: eohdTechnicals.Beta || facts.beta,
      fiftyDayMA: eohdTechnicals['50DayMA'],
      twoHundredDayMA: eohdTechnicals['200DayMA'],
      // Dividend info from EODHD
      dividendYield: eohdHighlights.DividendYield || facts.dividend_yield,
      forwardDividendYield: eohdHighlights.ForwardAnnualDividendYield || facts.forward_dividend_yield,
      dividendShare: eohdHighlights.DividendShare,
      exDividendDate: eohdGeneral.ExDividendDate || facts.ex_dividend_date,
      // Earnings info
      earningsDate: eohdGeneral.MostRecentQuarter || facts.earnings_date || facts.next_earnings_date,
      // Price target from EODHD or Financial Datasets
      priceTarget: eohdHighlights.WallStreetTargetPrice || avgPriceTarget,
    }

    return NextResponse.json({
      snapshot: enhancedSnapshot,
      companyFacts: companyFacts?.company_facts || {
        name: eohdGeneral?.Name || ticker.toUpperCase(),
        description: eohdGeneral?.Description || null,
        sector: eohdGeneral?.Sector || null,
        industry: eohdGeneral?.Industry || null,
        exchange: eohdGeneral?.Exchange || null,
        cik: eohdGeneral?.CIK || null,
        website: eohdGeneral?.WebURL || null,
      },
      // Annual statements
      incomeStatements: incomeStatements.income_statements || [],
      balanceSheets: balanceSheets.balance_sheets || [],
      cashFlows: cashFlows.cash_flow_statements || [],
      // Quarterly statements
      quarterlyIncome: quarterlyIncome.income_statements || [],
      quarterlyBalance: quarterlyBalance.balance_sheets || [],
      quarterlyCashFlow: quarterlyCashFlow.cash_flow_statements || [],
      // Metrics
      metrics: metrics.financial_metrics?.[0] || {},
      metricsHistory: allMetrics.financial_metrics || [],
      // Other data
      insiderTrades: insiderTrades.insider_trades || [],
      analystEstimates: analystEstimates.analyst_estimates || [],
      // Segmented data
      segments: productSegments,
      allSegments: segments,
      productSegments,
      geoSegments,
      rawSegmentedRevenues: segmentedRevenues?.segmented_revenues || [],
    })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
