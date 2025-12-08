import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Popular tickers to show with real-time data
const TRENDING_TICKERS = [
  'SPY', 'QQQ', 'DIA', 'IWM', // ETFs
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', // Big Tech
  'NFLX', 'AMD', 'COIN', 'PLTR', 'RIVN', 'HOOD' // Trending/Volatile
]

export async function GET() {
  try {
    // Fetch real-time quotes for trending tickers
    const tickerString = TRENDING_TICKERS.map(t => `${t}.US`).join(',')

    const response = await fetch(
      `https://eodhistoricaldata.com/api/real-time/${tickerString}?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    )

    if (!response.ok) {
      console.error('EODHD trending error:', response.status)
      return NextResponse.json({ tickers: [] })
    }

    const data = await response.json()

    // Handle both single and multiple ticker responses
    const tickersArray = Array.isArray(data) ? data : [data]

    const tickers = tickersArray
      .filter((item: any) => item && item.code)
      .map((item: any) => {
        const symbol = item.code?.replace('.US', '') || ''
        const price = parseFloat(item.close || item.previousClose || 0)
        const prevClose = parseFloat(item.previousClose || item.close || 0)
        const change = price - prevClose
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

        return {
          symbol,
          price,
          change,
          changePercent,
          volume: item.volume || 0,
          logoUrl: `https://eodhistoricaldata.com/img/logos/US/${symbol}.png`
        }
      })
      .filter((t: any) => t.symbol && t.price > 0)

    return NextResponse.json({ tickers })
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json({ tickers: [] })
  }
}
