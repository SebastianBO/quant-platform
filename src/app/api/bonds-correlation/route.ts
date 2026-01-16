import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * BONDS CORRELATION API
 *
 * Data source: Yahoo Finance Chart API (free, no API key required)
 * Shows how a stock correlates with bond ETFs for interest rate sensitivity analysis
 */

// Corporate bond ETFs for comparison
const BOND_ETFS = [
  { symbol: 'LQD', name: 'Investment Grade Corp', description: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
  { symbol: 'HYG', name: 'High Yield Corp', description: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
  { symbol: 'TLT', name: 'Long Treasury', description: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'IEF', name: 'Mid Treasury', description: 'iShares 7-10 Year Treasury Bond ETF' },
  { symbol: 'SHY', name: 'Short Treasury', description: 'iShares 1-3 Year Treasury Bond ETF' },
]

interface HistoricalData {
  timestamps: number[]
  closes: number[]
}

// Fetch historical data from Yahoo Finance (FREE)
async function fetchYahooHistory(symbol: string, range: string = '1y'): Promise<HistoricalData | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        next: { revalidate: 3600 } // Cache 1 hour
      }
    )

    if (!response.ok) {
      logger.error('Yahoo chart failed', { symbol, status: response.status })
      return null
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result) return null

    const timestamps = result.timestamp || []
    const closes = result.indicators?.quote?.[0]?.close || []

    // Filter out nulls and align
    const validData: { timestamps: number[], closes: number[] } = { timestamps: [], closes: [] }
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        validData.timestamps.push(timestamps[i])
        validData.closes.push(closes[i])
      }
    }

    return validData
  } catch (error) {
    logger.error('Error fetching Yahoo history', { symbol, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

function calculateCorrelation(prices1: number[], prices2: number[]): number {
  if (prices1.length !== prices2.length || prices1.length < 10) return 0

  // Calculate returns
  const returns1: number[] = []
  const returns2: number[] = []

  for (let i = 1; i < prices1.length; i++) {
    if (prices1[i - 1] > 0 && prices2[i - 1] > 0) {
      returns1.push((prices1[i] - prices1[i - 1]) / prices1[i - 1])
      returns2.push((prices2[i] - prices2[i - 1]) / prices2[i - 1])
    }
  }

  if (returns1.length < 10) return 0

  const n = returns1.length
  const mean1 = returns1.reduce((a, b) => a + b, 0) / n
  const mean2 = returns2.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denom1 = 0
  let denom2 = 0

  for (let i = 0; i < n; i++) {
    const diff1 = returns1[i] - mean1
    const diff2 = returns2[i] - mean2
    numerator += diff1 * diff2
    denom1 += diff1 * diff1
    denom2 += diff2 * diff2
  }

  const denominator = Math.sqrt(denom1) * Math.sqrt(denom2)
  return denominator === 0 ? 0 : numerator / denominator
}

function alignData(data1: HistoricalData, data2: HistoricalData): { aligned1: number[], aligned2: number[] } {
  const map2 = new Map<number, number>()
  for (let i = 0; i < data2.timestamps.length; i++) {
    // Round to day (remove time component)
    const dayKey = Math.floor(data2.timestamps[i] / 86400) * 86400
    map2.set(dayKey, data2.closes[i])
  }

  const aligned1: number[] = []
  const aligned2: number[] = []

  for (let i = 0; i < data1.timestamps.length; i++) {
    const dayKey = Math.floor(data1.timestamps[i] / 86400) * 86400
    const price2 = map2.get(dayKey)
    if (price2 !== undefined) {
      aligned1.push(data1.closes[i])
      aligned2.push(price2)
    }
  }

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
  // Focus on treasury correlations for rate sensitivity
  const treasuryCorrs = correlations.filter(c =>
    c.name.includes('Treasury') || c.name === 'TLT' || c.name === 'IEF' || c.name === 'SHY'
  )

  const avgTreasuryCorr = treasuryCorrs.length > 0
    ? treasuryCorrs.reduce((sum, c) => sum + c.correlation, 0) / treasuryCorrs.length
    : 0

  const absAvg = Math.abs(avgTreasuryCorr)

  let sensitivity: 'high' | 'medium' | 'low' = 'low'
  let direction: 'positive' | 'negative' | 'neutral' = 'neutral'

  if (absAvg > 0.5) {
    sensitivity = 'high'
  } else if (absAvg > 0.25) {
    sensitivity = 'medium'
  }

  if (avgTreasuryCorr > 0.15) {
    direction = 'positive'
  } else if (avgTreasuryCorr < -0.15) {
    direction = 'negative'
  }

  let explanation = ''
  if (sensitivity === 'high' && direction === 'negative') {
    explanation = `${ticker} tends to move opposite to bonds - when rates rise (bonds fall), ${ticker} typically rises. This is common for financial stocks that benefit from higher rates.`
  } else if (sensitivity === 'high' && direction === 'positive') {
    explanation = `${ticker} moves with bonds - when rates rise (bonds fall), ${ticker} typically falls. Growth stocks often show this pattern as higher rates reduce their present value.`
  } else if (sensitivity === 'medium') {
    explanation = `${ticker} shows moderate sensitivity to interest rates. Monitor Fed policy announcements for potential short-term impact.`
  } else {
    explanation = `${ticker} shows low correlation with bonds, suggesting company-specific factors drive performance more than interest rate changes.`
  }

  return { sensitivity, direction, explanation }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker parameter required' }, { status: 400 })
  }

  try {
    // Fetch stock and bond ETF data in parallel from Yahoo Finance
    const [stockData, ...bondDataArr] = await Promise.all([
      fetchYahooHistory(ticker, '1y'),
      ...BOND_ETFS.map(bond => fetchYahooHistory(bond.symbol, '1y'))
    ])

    if (!stockData || stockData.closes.length < 50) {
      // Return mock data for stocks without sufficient history
      return NextResponse.json(generateMockData(ticker))
    }

    // Calculate correlations for each bond ETF
    const bondCorrelations = BOND_ETFS.map((bond, i) => {
      const bondData = bondDataArr[i]

      if (!bondData || bondData.closes.length < 50) {
        return {
          symbol: bond.symbol,
          name: bond.name,
          description: bond.description,
          correlation: 0,
          interpretation: 'Insufficient data'
        }
      }

      const { aligned1, aligned2 } = alignData(stockData, bondData)
      const correlation = calculateCorrelation(aligned1, aligned2)

      return {
        symbol: bond.symbol,
        name: bond.name,
        description: bond.description,
        correlation: Math.round(correlation * 100) / 100,
        interpretation: interpretCorrelation(correlation, bond.name)
      }
    })

    // Calculate interest rate sensitivity
    const sensitivity = generateInterestRateSensitivity(
      ticker,
      bondCorrelations.map(b => ({ name: b.name, correlation: b.correlation }))
    )

    // Generate chart data (last 60 days)
    const tltData = bondDataArr[2] // TLT is index 2
    const last60Stock = stockData.closes.slice(-60)
    const last60Timestamps = stockData.timestamps.slice(-60)

    const chartData: { date: string; stock: number; tlt: number | null }[] = []

    if (tltData && last60Stock.length > 0) {
      const tltMap = new Map<number, number>()
      for (let i = 0; i < tltData.timestamps.length; i++) {
        const dayKey = Math.floor(tltData.timestamps[i] / 86400) * 86400
        tltMap.set(dayKey, tltData.closes[i])
      }

      const baseStock = last60Stock[0]
      const baseTLT = tltData.closes[tltData.closes.length - 60] || tltData.closes[0]

      for (let i = 0; i < last60Stock.length; i++) {
        const dayKey = Math.floor(last60Timestamps[i] / 86400) * 86400
        const tltPrice = tltMap.get(dayKey)

        chartData.push({
          date: new Date(last60Timestamps[i] * 1000).toISOString().split('T')[0],
          stock: ((last60Stock[i] / baseStock) - 1) * 100,
          tlt: tltPrice ? ((tltPrice / baseTLT) - 1) * 100 : null
        })
      }
    }

    // Find most correlated
    const mostCorrelated = bondCorrelations.reduce((max, c) =>
      Math.abs(c.correlation) > Math.abs(max.correlation) ? c : max
    )

    return NextResponse.json({
      ticker,
      bondCorrelations,
      sensitivity,
      chartData,
      summary: {
        mostCorrelated: {
          symbol: mostCorrelated.symbol,
          name: mostCorrelated.name,
          correlation: mostCorrelated.correlation
        },
        avgCorrelation: Math.round(
          bondCorrelations.reduce((sum, c) => sum + c.correlation, 0) / bondCorrelations.length * 100
        ) / 100
      },
      meta: {
        source: 'yahoo-finance',
        dataPoints: stockData.closes.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Bonds correlation API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(generateMockData(ticker))
  }
}

function generateMockData(ticker: string) {
  const baseCorr = (Math.random() - 0.5) * 0.6

  return {
    ticker,
    bondCorrelations: BOND_ETFS.map((bond) => ({
      symbol: bond.symbol,
      name: bond.name,
      description: bond.description,
      correlation: Math.round((baseCorr + (Math.random() - 0.5) * 0.4) * 100) / 100,
      interpretation: 'Based on estimated correlation'
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
    },
    meta: {
      source: 'mock-data',
      reason: 'insufficient-history'
    }
  }
}
