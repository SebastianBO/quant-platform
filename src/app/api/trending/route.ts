import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Large universe of liquid stocks to find today's movers
// S&P 100 + popular volatile stocks
const STOCK_UNIVERSE = [
  // Mega caps
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'JNJ',
  'V', 'XOM', 'JPM', 'WMT', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
  'LLY', 'PFE', 'COST', 'KO', 'PEP', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ABT',
  'ACN', 'DHR', 'NKE', 'ADBE', 'CRM', 'TXN', 'NEE', 'VZ', 'CMCSA', 'PM',
  'INTC', 'AMD', 'QCOM', 'HON', 'UPS', 'IBM', 'AMGN', 'CAT', 'BA', 'GE',
  // Tech & Growth
  'NFLX', 'CRM', 'ORCL', 'NOW', 'UBER', 'ABNB', 'SQ', 'SHOP', 'SNOW', 'PLTR',
  'COIN', 'HOOD', 'RBLX', 'U', 'DKNG', 'CRWD', 'ZS', 'PANW', 'OKTA', 'DDOG',
  // Volatile/Meme
  'GME', 'AMC', 'RIVN', 'LCID', 'NIO', 'XPEV', 'SOFI', 'AFRM', 'UPST', 'PATH',
  // Financials
  'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP',
  // Healthcare/Biotech
  'MRNA', 'BNTX', 'REGN', 'VRTX', 'GILD', 'BMY', 'BIIB',
  // Energy
  'OXY', 'SLB', 'COP', 'EOG', 'DVN',
  // ETFs for market context
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'ARKK'
]

// Popular tickers for the trending bar
const TRENDING_DISPLAY = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META',
  'AMD', 'COIN', 'PLTR', 'GME', 'RIVN'
]

interface RealTimeQuote {
  code: string
  close: number
  previousClose: number
  change: number
  change_p: number
  volume: number
  timestamp: number
}

export async function GET() {
  try {
    const results: {
      trending: any[]
      gainers: any[]
      losers: any[]
    } = {
      trending: [],
      gainers: [],
      losers: []
    }

    // Fetch real-time quotes for entire universe (batched)
    // EODHD allows multiple tickers in one request
    const allQuotes: RealTimeQuote[] = []

    // Split into batches of 50 to avoid URL length issues
    const batchSize = 50
    for (let i = 0; i < STOCK_UNIVERSE.length; i += batchSize) {
      const batch = STOCK_UNIVERSE.slice(i, i + batchSize)
      const tickerString = batch.map(t => `${t}.US`).join(',')

      try {
        const response = await fetch(
          `https://eodhistoricaldata.com/api/real-time/${tickerString}?api_token=${EODHD_API_KEY}&fmt=json`,
          { next: { revalidate: 60 } } // Cache for 1 minute
        )

        if (response.ok) {
          const data = await response.json()
          const quotes = Array.isArray(data) ? data : [data]
          allQuotes.push(...quotes.filter((q: any) => q && q.code))
        }
      } catch (e) {
        console.error(`Error fetching batch ${i}:`, e)
      }
    }

    // Process all quotes
    const processedQuotes = allQuotes
      .map((item: any) => {
        const symbol = item.code?.replace('.US', '') || ''
        const price = parseFloat(item.close || 0)
        const prevClose = parseFloat(item.previousClose || 0)
        const change = parseFloat(item.change || 0)
        // Use API's change_p if available, otherwise calculate
        const changePercent = item.change_p !== undefined
          ? parseFloat(item.change_p)
          : (prevClose > 0 ? (change / prevClose) * 100 : 0)

        return {
          symbol,
          name: symbol, // Would need separate call for company names
          price,
          change,
          changePercent,
          volume: item.volume || 0
        }
      })
      .filter((t: any) => t.symbol && t.price > 0 && !isNaN(t.changePercent))

    // 1. Trending tickers (for the scrolling bar)
    results.trending = processedQuotes.filter(q =>
      TRENDING_DISPLAY.includes(q.symbol)
    )

    // 2. Today's top gainers (real-time!)
    results.gainers = [...processedQuotes]
      .sort((a, b) => b.changePercent - a.changePercent)
      .filter(t => t.changePercent > 0)
      .slice(0, 10)

    // 3. Today's top losers (real-time!)
    results.losers = [...processedQuotes]
      .sort((a, b) => a.changePercent - b.changePercent)
      .filter(t => t.changePercent < 0)
      .slice(0, 10)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json({ trending: [], gainers: [], losers: [] })
  }
}
