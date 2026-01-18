import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Cache for 1 hour - increased from 300s to reduce Vercel costs
export const revalidate = 3600

const EODHD_API_KEY = process.env.EODHD_API_KEY || ''

interface MarketMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

// Major tickers to check for movers (most liquid US stocks)
const MAJOR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'CRM',
  'AVGO', 'ORCL', 'ADBE', 'INTC', 'QCOM', 'TXN', 'MU', 'AMAT', 'LRCX', 'KLAC',
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'AXP', 'BLK', 'SCHW',
  'JNJ', 'UNH', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY',
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'PSX', 'VLO', 'OXY',
  'SMCI', 'ARM', 'MRVL', 'PANW', 'CRWD', 'SNOW', 'DDOG', 'NET', 'ZS', 'PLTR',
  'COIN', 'MSTR', 'SQ', 'PYPL', 'HOOD', 'SOFI', 'UPST', 'AFRM', 'NU', 'BILL',
]

// Fallback mock data for development or API failure
const MOCK_GAINERS: MarketMover[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 892.45, change: 37.82, changePercent: 4.43, volume: 45000000 },
  { symbol: 'SMCI', name: 'Super Micro Computer', price: 1024.50, change: 38.92, changePercent: 3.95, volume: 12000000 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.23, change: 5.12, changePercent: 2.96, volume: 32000000 },
  { symbol: 'ARM', name: 'Arm Holdings', price: 145.67, change: 3.89, changePercent: 2.74, volume: 8500000 },
  { symbol: 'MRVL', name: 'Marvell Technology', price: 72.34, change: 1.82, changePercent: 2.58, volume: 15000000 },
]

const MOCK_LOSERS: MarketMover[] = [
  { symbol: 'TSLA', name: 'Tesla Inc', price: 182.63, change: -8.42, changePercent: -4.41, volume: 89000000 },
  { symbol: 'META', name: 'Meta Platforms', price: 485.22, change: -12.38, changePercent: -2.49, volume: 15000000 },
  { symbol: 'NFLX', name: 'Netflix Inc', price: 612.45, change: -14.23, changePercent: -2.27, volume: 6500000 },
  { symbol: 'COIN', name: 'Coinbase Global', price: 178.90, change: -3.95, changePercent: -2.16, volume: 11000000 },
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.34, change: -1.28, changePercent: -2.01, volume: 9800000 },
]

async function fetchEODHDRealtime(ticker: string): Promise<any | null> {
  if (!EODHD_API_KEY) return null

  try {
    const response = await fetch(
      `https://eodhd.com/api/real-time/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function fetchBulkQuotes(): Promise<MarketMover[]> {
  if (!EODHD_API_KEY) {
    logger.info('No EODHD API key, using mock data')
    return []
  }

  try {
    // Fetch quotes in parallel (batched to avoid rate limits)
    const batchSize = 20
    const movers: MarketMover[] = []

    for (let i = 0; i < MAJOR_TICKERS.length; i += batchSize) {
      const batch = MAJOR_TICKERS.slice(i, i + batchSize)
      const quotes = await Promise.all(
        batch.map(async (ticker) => {
          const data = await fetchEODHDRealtime(ticker)
          if (!data || data.code === 'NOT_FOUND') return null

          return {
            symbol: ticker,
            name: data.name || ticker,
            price: data.close || data.previousClose || 0,
            change: data.change || 0,
            changePercent: data.change_p || 0,
            volume: data.volume || 0,
          }
        })
      )

      movers.push(...quotes.filter((q): q is MarketMover => q !== null && q.price > 0))
    }

    return movers
  } catch (error) {
    logger.error('Failed to fetch bulk quotes', { error: error instanceof Error ? error.message : 'Unknown' })
    return []
  }
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'gainers'
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)

  try {
    // Fetch real data
    const allMovers = await fetchBulkQuotes()

    let movers: MarketMover[]

    if (allMovers.length === 0) {
      // Use mock data as fallback
      movers = type === 'gainers'
        ? MOCK_GAINERS.slice(0, limit)
        : MOCK_LOSERS.slice(0, limit)
    } else {
      // Sort by change percent
      const sorted = [...allMovers].sort((a, b) => {
        if (type === 'gainers') {
          return b.changePercent - a.changePercent
        }
        return a.changePercent - b.changePercent
      })

      // Filter: gainers must be positive, losers must be negative
      const filtered = type === 'gainers'
        ? sorted.filter(m => m.changePercent > 0)
        : sorted.filter(m => m.changePercent < 0)

      movers = filtered.slice(0, limit)
    }

    const response = NextResponse.json({
      type,
      movers,
      timestamp: new Date().toISOString(),
      source: allMovers.length > 0 ? 'eodhd.com' : 'mock',
    })

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60')
    return response
  } catch (error) {
    logger.error('Market movers API error', { error: error instanceof Error ? error.message : 'Unknown' })

    // Return mock data on error
    const movers = type === 'gainers'
      ? MOCK_GAINERS.slice(0, limit)
      : MOCK_LOSERS.slice(0, limit)

    return NextResponse.json({
      type,
      movers,
      timestamp: new Date().toISOString(),
      source: 'mock',
    })
  }
}
