import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Base tickers we always want (ETFs + mega caps for context)
const BASE_TICKERS = [
  'SPY', 'QQQ', 'IWM', 'DIA', // ETFs
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA' // Mega caps
]

interface ScreenerStock {
  code: string
  name: string
  adjusted_close?: number
  refund_1d_p?: number
  market_capitalization?: number
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

    // STEP 1: Get DYNAMIC universe from EOD screener
    // Find stocks that moved significantly yesterday (they often continue moving)
    const dynamicTickers: string[] = [...BASE_TICKERS]

    // Get yesterday's big gainers (>5% move, >$300M market cap)
    const gainersFilters = JSON.stringify([
      ["market_capitalization", ">", 300000000],
      ["refund_1d_p", ">", 5],
      ["exchange", "=", "us"]
    ])

    // Get yesterday's big losers
    const losersFilters = JSON.stringify([
      ["market_capitalization", ">", 300000000],
      ["refund_1d_p", "<", -5],
      ["exchange", "=", "us"]
    ])

    // Fetch both in parallel
    const [gainersRes, losersRes] = await Promise.all([
      fetch(
        `https://eodhd.com/api/screener?api_token=${EODHD_API_KEY}&filters=${encodeURIComponent(gainersFilters)}&sort=refund_1d_p.desc&limit=30`,
        { next: { revalidate: 300 } } // Cache screener for 5 min
      ),
      fetch(
        `https://eodhd.com/api/screener?api_token=${EODHD_API_KEY}&filters=${encodeURIComponent(losersFilters)}&sort=refund_1d_p.asc&limit=30`,
        { next: { revalidate: 300 } }
      )
    ])

    // Add screener results to our dynamic universe
    if (gainersRes.ok) {
      const data = await gainersRes.json()
      if (data.data) {
        data.data.forEach((stock: ScreenerStock) => {
          const symbol = stock.code?.split('.')[0]
          if (symbol && !dynamicTickers.includes(symbol)) {
            dynamicTickers.push(symbol)
          }
        })
      }
    }

    if (losersRes.ok) {
      const data = await losersRes.json()
      if (data.data) {
        data.data.forEach((stock: ScreenerStock) => {
          const symbol = stock.code?.split('.')[0]
          if (symbol && !dynamicTickers.includes(symbol)) {
            dynamicTickers.push(symbol)
          }
        })
      }
    }

    console.log(`Dynamic universe: ${dynamicTickers.length} stocks`)

    // STEP 2: Fetch REAL-TIME prices for our dynamic universe
    const allQuotes: any[] = []
    const batchSize = 50

    for (let i = 0; i < dynamicTickers.length; i += batchSize) {
      const batch = dynamicTickers.slice(i, i + batchSize)
      const tickerString = batch.map(t => `${t}.US`).join(',')

      try {
        const response = await fetch(
          `https://eodhistoricaldata.com/api/real-time/${tickerString}?api_token=${EODHD_API_KEY}&fmt=json`,
          { next: { revalidate: 60 } } // Real-time cached 1 min
        )

        if (response.ok) {
          const data = await response.json()
          const quotes = Array.isArray(data) ? data : [data]
          allQuotes.push(...quotes.filter((q: any) => q && q.code))
        }
      } catch (e) {
        console.error(`Error fetching batch:`, e)
      }
    }

    // STEP 3: Process quotes and calculate TODAY's movers
    const processedQuotes = allQuotes
      .map((item: any) => {
        const symbol = item.code?.replace('.US', '') || ''
        const price = parseFloat(item.close || 0)
        const change = parseFloat(item.change || 0)
        const changePercent = parseFloat(item.change_p || 0)

        return {
          symbol,
          name: symbol,
          price,
          change,
          changePercent,
          volume: item.volume || 0
        }
      })
      .filter((t: any) => t.symbol && t.price > 0 && !isNaN(t.changePercent))

    // Trending = base tickers for the scrolling bar
    results.trending = processedQuotes.filter(q =>
      BASE_TICKERS.includes(q.symbol)
    )

    // TODAY's top gainers from our dynamic universe
    results.gainers = [...processedQuotes]
      .sort((a, b) => b.changePercent - a.changePercent)
      .filter(t => t.changePercent > 0)
      .slice(0, 10)

    // TODAY's top losers from our dynamic universe
    results.losers = [...processedQuotes]
      .sort((a, b) => a.changePercent - b.changePercent)
      .filter(t => t.changePercent < 0)
      .slice(0, 10)

    return NextResponse.json({
      ...results,
      universeSize: dynamicTickers.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json({ trending: [], gainers: [], losers: [] })
  }
}
