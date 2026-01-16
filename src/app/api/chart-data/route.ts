import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""

interface ChartDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface AnalystRating {
  date: string
  analyst: string
  rating: string
  priceTarget: number
  action: string // 'Upgrades', 'Downgrades', 'Initiates', 'Reiterates', 'Maintains'
}

// Calculate date range based on period
function getDateRange(period: string): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().split('T')[0]

  let from: Date
  switch (period) {
    case '1D':
      from = new Date(now)
      from.setDate(from.getDate() - 1)
      break
    case '5D':
      from = new Date(now)
      from.setDate(from.getDate() - 7) // Get extra days for weekends
      break
    case '1M':
      from = new Date(now)
      from.setMonth(from.getMonth() - 1)
      break
    case '6M':
      from = new Date(now)
      from.setMonth(from.getMonth() - 6)
      break
    case 'YTD':
      from = new Date(now.getFullYear(), 0, 1)
      break
    case '1Y':
      from = new Date(now)
      from.setFullYear(from.getFullYear() - 1)
      break
    case '5Y':
      from = new Date(now)
      from.setFullYear(from.getFullYear() - 5)
      break
    case 'ALL':
      from = new Date('2000-01-01')
      break
    default:
      from = new Date(now)
      from.setMonth(from.getMonth() - 3)
  }

  return { from: from.toISOString().split('T')[0], to }
}

async function fetchHistoricalData(ticker: string, from: string, to: string): Promise<ChartDataPoint[]> {
  try {
    const response = await fetch(
      `https://eodhd.com/api/eod/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json&from=${from}&to=${to}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return []
    const data = await response.json()

    return data.map((d: any) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close || d.adjusted_close,
      volume: d.volume
    }))
  } catch (error) {
    logger.error('Error fetching historical data', { error: error instanceof Error ? error.message : 'Unknown' })
    return []
  }
}

async function fetchAnalystRatings(ticker: string): Promise<AnalystRating[]> {
  try {
    // Fetch from EODHD fundamentals which includes analyst ratings
    const response = await fetch(
      `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json&filter=AnalystRatings`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) return []
    const data = await response.json()

    if (!data.AnalystRatings) return []

    // Parse analyst ratings - EODHD returns aggregated data, not individual ratings
    // We'll create synthetic events based on changes
    const ratings: AnalystRating[] = []

    // If we have target price history, create events
    if (data.AnalystRatings.TargetPrice) {
      ratings.push({
        date: new Date().toISOString().split('T')[0],
        analyst: 'Consensus',
        rating: data.AnalystRatings.Rating || 'Hold',
        priceTarget: data.AnalystRatings.TargetPrice,
        action: 'Consensus'
      })
    }

    return ratings
  } catch (error) {
    logger.error('Error fetching analyst ratings', { error: error instanceof Error ? error.message : 'Unknown' })
    return []
  }
}

async function fetchIntradayData(ticker: string): Promise<ChartDataPoint[]> {
  try {
    // EODHD intraday endpoint
    const response = await fetch(
      `https://eodhd.com/api/intraday/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json&interval=5m`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return []
    const data = await response.json()

    // Get last trading day's data
    const today = new Date().toISOString().split('T')[0]

    return data
      .filter((d: any) => d.datetime?.startsWith(today) || true) // Keep all for now
      .slice(-78) // ~6.5 hours of 5min bars
      .map((d: any) => ({
        date: d.datetime || d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume
      }))
  } catch (error) {
    logger.error('Error fetching intraday data', { error: error instanceof Error ? error.message : 'Unknown' })
    return []
  }
}

async function fetchRealTimeQuote(ticker: string) {
  try {
    const response = await fetch(
      `https://eodhd.com/api/real-time/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 30 } }
    )

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const period = request.nextUrl.searchParams.get('period') || '3M'
  const includeRatings = request.nextUrl.searchParams.get('ratings') !== 'false'

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    const { from, to } = getDateRange(period)

    // Fetch data in parallel
    const [historicalData, quote, analystRatings] = await Promise.all([
      period === '1D' ? fetchIntradayData(ticker) : fetchHistoricalData(ticker, from, to),
      fetchRealTimeQuote(ticker),
      includeRatings ? fetchAnalystRatings(ticker) : Promise.resolve([])
    ])

    // Calculate period change
    let periodChange = 0
    let periodChangePercent = 0
    if (historicalData.length > 0) {
      const firstClose = historicalData[0].close
      const lastClose = historicalData[historicalData.length - 1].close
      periodChange = lastClose - firstClose
      periodChangePercent = (periodChange / firstClose) * 100
    }

    return NextResponse.json({
      ticker,
      period,
      currentPrice: quote?.close || historicalData[historicalData.length - 1]?.close || 0,
      previousClose: quote?.previousClose || 0,
      dayChange: quote?.change || 0,
      dayChangePercent: quote?.change_p || 0,
      periodChange,
      periodChangePercent,
      high52Week: quote?.high52 || 0,
      low52Week: quote?.low52 || 0,
      volume: quote?.volume || 0,
      data: historicalData,
      analystRatings: analystRatings,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Chart data API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
