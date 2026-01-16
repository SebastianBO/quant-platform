import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Real-time quotes API - aggregates from multiple free sources
// Sources: IEX Cloud, Yahoo Finance, Alpha Vantage, Finnhub

interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: number
  source: string
  marketCap?: number
  pe?: number
  week52High?: number
  week52Low?: number
}

// Fallback to Yahoo Finance (free, no key needed)
async function fetchYahooQuote(symbol: string): Promise<Quote | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 5 }, // Cache for 5 seconds
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const result = data.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const quote = result.indicators?.quote?.[0]
    const lastIndex = quote?.close?.length - 1

    return {
      symbol: meta.symbol,
      price: meta.regularMarketPrice || quote?.close?.[lastIndex] || 0,
      change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 || 0,
      volume: meta.regularMarketVolume || 0,
      high: meta.regularMarketDayHigh || Math.max(...(quote?.high || [0])),
      low: meta.regularMarketDayLow || Math.min(...(quote?.low?.filter((l: number) => l > 0) || [0])),
      open: meta.regularMarketOpen || quote?.open?.[0] || 0,
      previousClose: meta.previousClose || 0,
      timestamp: Date.now(),
      source: 'yahoo',
    }
  } catch (error) {
    logger.error('Yahoo quote error', { symbol, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// IEX Cloud (free tier - 50k messages/month)
async function fetchIEXQuote(symbol: string): Promise<Quote | null> {
  const IEX_TOKEN = process.env.IEX_CLOUD_TOKEN
  if (!IEX_TOKEN) return null

  try {
    const response = await fetch(
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${IEX_TOKEN}`,
      { next: { revalidate: 5 } }
    )

    if (!response.ok) return null

    const data = await response.json()

    return {
      symbol: data.symbol,
      price: data.latestPrice || 0,
      change: data.change || 0,
      changePercent: data.changePercent * 100 || 0,
      volume: data.volume || 0,
      high: data.high || 0,
      low: data.low || 0,
      open: data.open || 0,
      previousClose: data.previousClose || 0,
      timestamp: data.latestUpdate || Date.now(),
      source: 'iex',
      marketCap: data.marketCap,
      pe: data.peRatio,
      week52High: data.week52High,
      week52Low: data.week52Low,
    }
  } catch (error) {
    logger.error('IEX quote error', { symbol, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Alpha Vantage (free tier - 25 requests/day, 5 per minute)
async function fetchAlphaVantageQuote(symbol: string): Promise<Quote | null> {
  const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY
  if (!AV_KEY) return null

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`,
      { next: { revalidate: 60 } } // Cache longer due to rate limits
    )

    if (!response.ok) return null

    const data = await response.json()
    const quote = data['Global Quote']
    if (!quote || Object.keys(quote).length === 0) return null

    const price = parseFloat(quote['05. price']) || 0
    const previousClose = parseFloat(quote['08. previous close']) || 0

    return {
      symbol: quote['01. symbol'],
      price,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      open: parseFloat(quote['02. open']) || 0,
      previousClose,
      timestamp: Date.now(),
      source: 'alphavantage',
    }
  } catch (error) {
    logger.error('Alpha Vantage quote error', { symbol, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Main handler - tries sources in order of preference
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbolsParam = searchParams.get('symbols')
  const source = searchParams.get('source') // Optional: force specific source

  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 })
  }

  const symbols = symbolsParam.toUpperCase().split(',').slice(0, 50) // Max 50 symbols
  const quotes: Record<string, Quote> = {}
  const errors: string[] = []

  // Fetch quotes for each symbol
  await Promise.all(
    symbols.map(async (symbol) => {
      let quote: Quote | null = null

      // Try sources in order based on preference
      if (source === 'iex' || !source) {
        quote = await fetchIEXQuote(symbol)
      }

      if (!quote && (source === 'yahoo' || !source)) {
        quote = await fetchYahooQuote(symbol)
      }

      if (!quote && (source === 'alphavantage' || !source)) {
        quote = await fetchAlphaVantageQuote(symbol)
      }

      if (quote) {
        quotes[symbol] = quote
      } else {
        errors.push(symbol)
      }
    })
  )

  return NextResponse.json({
    quotes,
    count: Object.keys(quotes).length,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: Date.now(),
    _meta: {
      sources: ['iex', 'yahoo', 'alphavantage'],
      cacheTime: 5,
    },
  })
}
