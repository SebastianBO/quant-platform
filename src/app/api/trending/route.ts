import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Popular tickers for the main trending section
const POPULAR_TICKERS = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META',
  'AMD', 'COIN', 'PLTR'
]

interface ScreenerResult {
  code: string
  name: string
  exchange: string
  market_capitalization?: number
  refund_1d_p?: number
  close?: number
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

    // 1. Fetch real-time quotes for popular/trending tickers
    const tickerString = POPULAR_TICKERS.map(t => `${t}.US`).join(',')
    const trendingResponse = await fetch(
      `https://eodhistoricaldata.com/api/real-time/${tickerString}?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 60 } }
    )

    if (trendingResponse.ok) {
      const data = await trendingResponse.json()
      const tickersArray = Array.isArray(data) ? data : [data]

      results.trending = tickersArray
        .filter((item: any) => item && item.code)
        .map((item: any) => {
          const symbol = item.code?.replace('.US', '') || ''
          const price = parseFloat(item.close || item.previousClose || 0)
          const prevClose = parseFloat(item.previousClose || item.close || 0)
          const change = price - prevClose
          const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

          return {
            symbol,
            name: symbol, // Will be enriched if we have company data
            price,
            change,
            changePercent,
            volume: item.volume || 0
          }
        })
        .filter((t: any) => t.symbol && t.price > 0)
    }

    // 2. Fetch top gainers using screener API
    // Filter: US stocks, market cap > $500M, daily gain > 3%
    const gainersFilters = JSON.stringify([
      ["market_capitalization", ">", 500000000],
      ["refund_1d_p", ">", 3],
      ["exchange", "=", "us"]
    ])

    const gainersResponse = await fetch(
      `https://eodhd.com/api/screener?api_token=${EODHD_API_KEY}&filters=${encodeURIComponent(gainersFilters)}&sort=refund_1d_p.desc&limit=10&offset=0`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (gainersResponse.ok) {
      const gainersData = await gainersResponse.json()
      if (gainersData.data && Array.isArray(gainersData.data)) {
        results.gainers = gainersData.data.map((item: ScreenerResult) => ({
          symbol: item.code?.split('.')[0] || item.code,
          name: item.name || item.code,
          price: item.close || 0,
          change: 0, // Screener doesn't provide absolute change
          changePercent: item.refund_1d_p || 0,
          marketCap: item.market_capitalization
        }))
      }
    }

    // 3. Fetch top losers using screener API
    // Filter: US stocks, market cap > $500M, daily loss < -3%
    const losersFilters = JSON.stringify([
      ["market_capitalization", ">", 500000000],
      ["refund_1d_p", "<", -3],
      ["exchange", "=", "us"]
    ])

    const losersResponse = await fetch(
      `https://eodhd.com/api/screener?api_token=${EODHD_API_KEY}&filters=${encodeURIComponent(losersFilters)}&sort=refund_1d_p.asc&limit=10&offset=0`,
      { next: { revalidate: 300 } }
    )

    if (losersResponse.ok) {
      const losersData = await losersResponse.json()
      if (losersData.data && Array.isArray(losersData.data)) {
        results.losers = losersData.data.map((item: ScreenerResult) => ({
          symbol: item.code?.split('.')[0] || item.code,
          name: item.name || item.code,
          price: item.close || 0,
          change: 0,
          changePercent: item.refund_1d_p || 0,
          marketCap: item.market_capitalization
        }))
      }
    }

    // Fallback: if screener fails, sort trending by change%
    if (results.gainers.length === 0 && results.trending.length > 0) {
      results.gainers = [...results.trending]
        .sort((a, b) => b.changePercent - a.changePercent)
        .filter(t => t.changePercent > 0)
        .slice(0, 5)
    }

    if (results.losers.length === 0 && results.trending.length > 0) {
      results.losers = [...results.trending]
        .sort((a, b) => a.changePercent - b.changePercent)
        .filter(t => t.changePercent < 0)
        .slice(0, 5)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json({ trending: [], gainers: [], losers: [] })
  }
}
