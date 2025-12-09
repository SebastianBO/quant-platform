import { NextRequest, NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
}

// Market indices and futures symbols
const US_MARKET_SYMBOLS = [
  { symbol: 'SPY.US', name: 'S&P 500', displaySymbol: 'SPY' },
  { symbol: 'DIA.US', name: 'Dow Jones', displaySymbol: 'DIA' },
  { symbol: 'QQQ.US', name: 'Nasdaq', displaySymbol: 'QQQ' },
  { symbol: 'IWM.US', name: 'Russell 2000', displaySymbol: 'IWM' },
  { symbol: 'VIX.INDX', name: 'VIX', displaySymbol: 'VIX' },
  { symbol: 'GLD.US', name: 'Gold', displaySymbol: 'GLD' },
]

const EUROPE_SYMBOLS = [
  { symbol: 'EWG.US', name: 'Germany DAX', displaySymbol: 'DAX' },
  { symbol: 'EWU.US', name: 'UK FTSE', displaySymbol: 'FTSE' },
  { symbol: 'EWQ.US', name: 'France CAC', displaySymbol: 'CAC' },
]

const ASIA_SYMBOLS = [
  { symbol: 'EWJ.US', name: 'Japan Nikkei', displaySymbol: 'NIKKEI' },
  { symbol: 'FXI.US', name: 'China', displaySymbol: 'CHINA' },
  { symbol: 'EWH.US', name: 'Hong Kong', displaySymbol: 'HSI' },
]

const CRYPTO_SYMBOLS = [
  { symbol: 'BTC-USD.CC', name: 'Bitcoin', displaySymbol: 'BTC' },
  { symbol: 'ETH-USD.CC', name: 'Ethereum', displaySymbol: 'ETH' },
  { symbol: 'SOL-USD.CC', name: 'Solana', displaySymbol: 'SOL' },
]

async function fetchQuote(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `https://eodhd.com/api/real-time/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    )

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return null
  }
}

async function fetchHistory(symbol: string, days: number = 5): Promise<any[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const response = await fetch(
      `https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_KEY}&fmt=json&from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) return []
    return response.json()
  } catch (error) {
    return []
  }
}

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region') || 'us'

  try {
    let symbols: typeof US_MARKET_SYMBOLS

    switch (region.toLowerCase()) {
      case 'europe':
        symbols = EUROPE_SYMBOLS
        break
      case 'asia':
        symbols = ASIA_SYMBOLS
        break
      case 'crypto':
        symbols = CRYPTO_SYMBOLS
        break
      default:
        symbols = US_MARKET_SYMBOLS
    }

    // Fetch all quotes in parallel
    const quotes = await Promise.all(
      symbols.map(async ({ symbol, name, displaySymbol }) => {
        const [quote, history] = await Promise.all([
          fetchQuote(symbol),
          fetchHistory(symbol, 5)
        ])

        if (!quote) {
          return {
            symbol: displaySymbol,
            name,
            price: 0,
            change: 0,
            changePercent: 0,
            previousClose: 0,
            sparkline: []
          }
        }

        return {
          symbol: displaySymbol,
          name,
          price: quote.close || quote.previousClose || 0,
          change: quote.change || 0,
          changePercent: quote.change_p || 0,
          previousClose: quote.previousClose || 0,
          high: quote.high || 0,
          low: quote.low || 0,
          volume: quote.volume || 0,
          sparkline: history.slice(-5).map((d: any) => d.close)
        }
      })
    )

    // Get market status
    const now = new Date()
    const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const hour = nyTime.getHours()
    const day = nyTime.getDay()

    let marketStatus = 'closed'
    let statusMessage = 'U.S. markets closed'

    if (day >= 1 && day <= 5) { // Weekday
      if (hour >= 4 && hour < 9.5) {
        marketStatus = 'premarket'
        statusMessage = 'Pre-market trading'
      } else if (hour >= 9.5 && hour < 16) {
        marketStatus = 'open'
        statusMessage = 'U.S. markets open'
      } else if (hour >= 16 && hour < 20) {
        marketStatus = 'afterhours'
        statusMessage = 'After-hours trading'
      }
    }

    return NextResponse.json({
      region,
      marketStatus,
      statusMessage,
      lastUpdated: new Date().toISOString(),
      indices: quotes
    })
  } catch (error) {
    console.error('Market overview API error:', error)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
