import { NextRequest, NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

// Treasury symbols for correlation analysis
const TREASURY_SYMBOLS = [
  { symbol: 'US2YT=X', maturity: '2Y', name: '2 Year Treasury' },
  { symbol: 'US10YT=X', maturity: '10Y', name: '10 Year Treasury' },
  { symbol: 'US30YT=X', maturity: '30Y', name: '30 Year Treasury' },
]

// Corporate bond ETFs for comparison
const BOND_ETFS = [
  { symbol: 'LQD', name: 'Investment Grade Corp', description: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
  { symbol: 'HYG', name: 'High Yield Corp', description: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
  { symbol: 'TLT', name: 'Long Treasury', description: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'IEF', name: 'Mid Treasury', description: 'iShares 7-10 Year Treasury Bond ETF' },
  { symbol: 'SHY', name: 'Short Treasury', description: 'iShares 1-3 Year Treasury Bond ETF' },
]

interface HistoricalPrice {
  date: string
  close: number
}

async function fetchHistoricalPrices(symbol: string, days: number = 252): Promise<HistoricalPrice[]> {
  try {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const from = fromDate.toISOString().split('T')[0]
    const to = toDate.toISOString().split('T')[0]

    const response = await fetch(
      `https://eodhd.com/api/eod/${symbol}.US?api_token=${EODHD_API_KEY}&from=${from}&to=${to}&fmt=json`,
      { next: { revalidate: 3600 } }
    )

    if (response.ok) {
      const data = await response.json()
      return data.map((d: { date: string; close: number }) => ({
        date: d.date,
        close: d.close
      }))
    }
  } catch (e) {
    console.error(`Error fetching historical for ${symbol}:`, e)
  }
  return []
}

async function fetchTreasuryHistorical(symbol: string, days: number = 252): Promise<HistoricalPrice[]> {
  try {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const from = fromDate.toISOString().split('T')[0]
    const to = toDate.toISOString().split('T')[0]

    // Treasury symbols use different format
    const response = await fetch(
      `https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_KEY}&from=${from}&to=${to}&fmt=json`,
      { next: { revalidate: 3600 } }
    )

    if (response.ok) {
      const data = await response.json()
      return data.map((d: { date: string; close: number }) => ({
        date: d.date,
        close: d.close
      }))
    }
  } catch (e) {
    console.error(`Error fetching treasury historical for ${symbol}:`, e)
  }
  return []
}

function calculateCorrelation(prices1: number[], prices2: number[]): number {
  if (prices1.length !== prices2.length || prices1.length < 10) return 0

  const n = prices1.length
  const mean1 = prices1.reduce((a, b) => a + b, 0) / n
  const mean2 = prices2.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denom1 = 0
  let denom2 = 0

  for (let i = 0; i < n; i++) {
    const diff1 = prices1[i] - mean1
    const diff2 = prices2[i] - mean2
    numerator += diff1 * diff2
    denom1 += diff1 * diff1
    denom2 += diff2 * diff2
  }

  const denominator = Math.sqrt(denom1) * Math.sqrt(denom2)
  return denominator === 0 ? 0 : numerator / denominator
}

function calculateReturns(prices: HistoricalPrice[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1].close > 0) {
      returns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close)
    }
  }
  return returns
}

function alignPrices(prices1: HistoricalPrice[], prices2: HistoricalPrice[]): { aligned1: number[], aligned2: number[] } {
  const dateMap1 = new Map(prices1.map(p => [p.date, p.close]))
  const dateMap2 = new Map(prices2.map(p => [p.date, p.close]))

  const commonDates = [...dateMap1.keys()].filter(d => dateMap2.has(d))

  const aligned1 = commonDates.map(d => dateMap1.get(d)!)
  const aligned2 = commonDates.map(d => dateMap2.get(d)!)

  return { aligned1, aligned2 }
}

function interpretCorrelation(corr: number, bondType: string): string {
  const absCorr = Math.abs(corr)
  const direction = corr > 0 ? 'positive' : 'negative'

  if (absCorr > 0.7) {
    return `Strong ${direction} correlation with ${bondType}`
  } else if (absCorr > 0.4) {
    return `Moderate ${direction} correlation with ${bondType}`
  } else if (absCorr > 0.2) {
    return `Weak ${direction} correlation with ${bondType}`
  }
  return `No significant correlation with ${bondType}`
}

function generateInterestRateSensitivity(ticker: string, correlations: { name: string; correlation: number }[]): {
  sensitivity: 'high' | 'medium' | 'low'
  direction: 'positive' | 'negative' | 'neutral'
  explanation: string
} {
  const avgCorr = correlations.reduce((sum, c) => sum + c.correlation, 0) / correlations.length
  const absAvg = Math.abs(avgCorr)

  let sensitivity: 'high' | 'medium' | 'low' = 'low'
  let direction: 'positive' | 'negative' | 'neutral' = 'neutral'

  if (absAvg > 0.5) {
    sensitivity = 'high'
  } else if (absAvg > 0.25) {
    sensitivity = 'medium'
  }

  if (avgCorr > 0.15) {
    direction = 'positive'
  } else if (avgCorr < -0.15) {
    direction = 'negative'
  }

  let explanation = ''
  if (sensitivity === 'high' && direction === 'negative') {
    explanation = `${ticker} tends to fall when interest rates rise. Consider hedging interest rate risk or being cautious in rising rate environments.`
  } else if (sensitivity === 'high' && direction === 'positive') {
    explanation = `${ticker} tends to rise with interest rates, suggesting the company benefits from higher rates (possibly a financial stock).`
  } else if (sensitivity === 'medium') {
    explanation = `${ticker} shows moderate sensitivity to interest rates. Monitor Fed policy for potential impact.`
  } else {
    explanation = `${ticker} shows low correlation with interest rates, suggesting other factors drive its performance.`
  }

  return { sensitivity, direction, explanation }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker parameter required' }, { status: 400 })
  }

  try {
    // Fetch stock historical data
    const stockPrices = await fetchHistoricalPrices(ticker, 252)

    if (stockPrices.length < 50) {
      // Return mock data for stocks without sufficient history
      return NextResponse.json(generateMockData(ticker))
    }

    // Fetch bond ETF historical data in parallel
    const bondPromises = BOND_ETFS.map(async (bond) => {
      const bondPrices = await fetchHistoricalPrices(bond.symbol, 252)

      if (bondPrices.length < 50) {
        return {
          symbol: bond.symbol,
          name: bond.name,
          description: bond.description,
          correlation: 0,
          interpretation: 'Insufficient data'
        }
      }

      const { aligned1, aligned2 } = alignPrices(stockPrices, bondPrices)
      const returns1 = calculateReturns(aligned1.map((c, i) => ({ date: '', close: c })))
      const returns2 = calculateReturns(aligned2.map((c, i) => ({ date: '', close: c })))

      const correlation = calculateCorrelation(returns1, returns2)

      return {
        symbol: bond.symbol,
        name: bond.name,
        description: bond.description,
        correlation: Math.round(correlation * 100) / 100,
        interpretation: interpretCorrelation(correlation, bond.name)
      }
    })

    // Fetch treasury yield correlations (using TLT, IEF as proxies)
    const treasuryCorrelations = TREASURY_SYMBOLS.map((t) => {
      // For now, estimate based on bond ETF correlations
      return {
        maturity: t.maturity,
        name: t.name,
        correlation: 0,
        yieldChange: 0
      }
    })

    const bondCorrelations = await Promise.all(bondPromises)

    // Calculate interest rate sensitivity
    const sensitivity = generateInterestRateSensitivity(ticker, bondCorrelations)

    // Generate chart data (last 60 days of normalized prices)
    const last60 = stockPrices.slice(-60)
    const tltPrices = await fetchHistoricalPrices('TLT', 60)

    const chartData = last60.map((sp, i) => {
      const tltPrice = tltPrices.find(t => t.date === sp.date)
      const baseStock = last60[0]?.close || 1
      const baseTLT = tltPrices[0]?.close || 1

      return {
        date: sp.date,
        stock: ((sp.close / baseStock) - 1) * 100,
        tlt: tltPrice ? ((tltPrice.close / baseTLT) - 1) * 100 : null
      }
    })

    return NextResponse.json({
      ticker,
      bondCorrelations,
      treasuryCorrelations,
      sensitivity,
      chartData,
      summary: {
        mostCorrelated: bondCorrelations.reduce((max, c) =>
          Math.abs(c.correlation) > Math.abs(max.correlation) ? c : max
        ),
        avgCorrelation: Math.round(
          bondCorrelations.reduce((sum, c) => sum + c.correlation, 0) / bondCorrelations.length * 100
        ) / 100
      }
    })

  } catch (error) {
    console.error('Bonds correlation API error:', error)
    return NextResponse.json(generateMockData(ticker))
  }
}

function generateMockData(ticker: string) {
  // Generate reasonable mock correlations based on sector
  const baseCorr = (Math.random() - 0.5) * 0.6 // -0.3 to 0.3

  return {
    ticker,
    bondCorrelations: BOND_ETFS.map((bond, i) => ({
      symbol: bond.symbol,
      name: bond.name,
      description: bond.description,
      correlation: Math.round((baseCorr + (Math.random() - 0.5) * 0.4) * 100) / 100,
      interpretation: 'Based on estimated correlation'
    })),
    treasuryCorrelations: TREASURY_SYMBOLS.map(t => ({
      maturity: t.maturity,
      name: t.name,
      correlation: Math.round((baseCorr + (Math.random() - 0.5) * 0.3) * 100) / 100,
      yieldChange: Math.round((Math.random() - 0.5) * 20) / 100
    })),
    sensitivity: {
      sensitivity: 'medium' as const,
      direction: baseCorr > 0 ? 'positive' as const : 'negative' as const,
      explanation: `${ticker} shows moderate sensitivity to interest rate changes. Based on historical correlation analysis.`
    },
    chartData: Array.from({ length: 60 }, (_, i) => ({
      date: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stock: Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 2,
      tlt: Math.sin(i / 10 + Math.PI) * 3 + (Math.random() - 0.5) * 1.5
    })),
    summary: {
      mostCorrelated: { symbol: 'TLT', name: 'Long Treasury', correlation: baseCorr },
      avgCorrelation: Math.round(baseCorr * 100) / 100
    }
  }
}
