import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Cache prices for 1 minute
const priceCache: Map<string, { price: number; change: number; changePercent: number; timestamp: number }> = new Map()
const CACHE_DURATION = 60 * 1000 // 1 minute

export async function GET(request: NextRequest) {
  const tickers = request.nextUrl.searchParams.get('tickers')

  if (!tickers) {
    return NextResponse.json({ error: 'Tickers parameter is required' }, { status: 400 })
  }

  const tickerList = tickers.split(',').map(t => t.trim().toUpperCase())
  const prices: Record<string, { price: number; change: number; changePercent: number; previousClose: number }> = {}
  const now = Date.now()

  // Fetch prices for each ticker
  await Promise.all(
    tickerList.map(async (ticker) => {
      // Check cache first
      const cached = priceCache.get(ticker)
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        prices[ticker] = {
          price: cached.price,
          change: cached.change,
          changePercent: cached.changePercent,
          previousClose: cached.price - cached.change
        }
        return
      }

      try {
        // Determine exchange suffix
        const tickerWithExchange = ticker.includes('.') ? ticker : `${ticker}.US`

        const response = await fetch(
          `https://eodhd.com/api/real-time/${tickerWithExchange}?api_token=${EODHD_API_KEY}&fmt=json`,
          { next: { revalidate: 60 } }
        )

        if (response.ok) {
          const data = await response.json()

          const currentPrice = parseFloat(data.close || data.price || 0)
          const previousClose = parseFloat(data.previousClose || data.open || currentPrice)
          const change = currentPrice - previousClose
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

          prices[ticker] = {
            price: currentPrice,
            change,
            changePercent,
            previousClose
          }

          // Update cache
          priceCache.set(ticker, {
            price: currentPrice,
            change,
            changePercent,
            timestamp: now
          })
        } else {
          logger.info('EODHD price fetch failed', { ticker, status: response.status })
        }
      } catch (error) {
        logger.error('Error fetching price', { ticker, error: error instanceof Error ? error.message : 'Unknown' })
      }
    })
  )

  return NextResponse.json({ prices, timestamp: now })
}

// POST endpoint to update investment prices in database
export async function POST(request: NextRequest) {
  try {
    const { investments } = await request.json()

    if (!investments || !Array.isArray(investments)) {
      return NextResponse.json({ error: 'Investments array is required' }, { status: 400 })
    }

    const tickers = investments.map((inv: any) => inv.ticker || inv.asset_identifier).filter(Boolean)
    const tickerList = [...new Set(tickers)].map(t => t.toUpperCase())

    const prices: Record<string, number> = {}

    await Promise.all(
      tickerList.map(async (ticker) => {
        try {
          const tickerWithExchange = ticker.includes('.') ? ticker : `${ticker}.US`

          const response = await fetch(
            `https://eodhd.com/api/real-time/${tickerWithExchange}?api_token=${EODHD_API_KEY}&fmt=json`,
            { next: { revalidate: 60 } }
          )

          if (response.ok) {
            const data = await response.json()
            prices[ticker] = parseFloat(data.close || data.price || 0)
          }
        } catch (error) {
          logger.error('Error fetching price in POST', { ticker, error: error instanceof Error ? error.message : 'Unknown' })
        }
      })
    )

    return NextResponse.json({ prices })
  } catch (error) {
    logger.error('Prices POST error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
