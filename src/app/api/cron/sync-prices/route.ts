import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  withRetry,
  withCronLogging,
  RateLimiter,
  processBatch,
  isRetryableError,
} from '@/lib/cron-utils'

// Sync stock prices by scraping Yahoo Finance (FREE)
// No paid API needed - uses public Yahoo Finance data

const YAHOO_FINANCE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

// Priority tickers for price updates (most viewed)
const PRIORITY_TICKERS = [
  // Magnificent 7 + Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX', 'AVGO', 'QCOM',
  // Finance
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'AXP',
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT',
  // Consumer
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE',
  // Energy & Industrial
  'XOM', 'CVX', 'COP', 'CAT', 'DE', 'BA', 'HON', 'UPS',
  // Meme/Popular
  'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'HOOD', 'COIN',
  // AI/Cloud
  'SMCI', 'ARM', 'SNOW', 'DDOG', 'NET', 'CRWD', 'ZS',
  // EV
  'NIO', 'LI', 'XPEV',
  // Other popular
  'UBER', 'ABNB', 'DASH', 'SNAP', 'ZM', 'SQ', 'PYPL', 'SHOP',
  'RBLX', 'U', 'TTWO', 'EA', 'DIS',
]

interface YahooQuote {
  ticker: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high?: number
  low?: number
  open?: number
  time: number
}

// Fetch quote from Yahoo Finance
async function fetchYahooQuote(ticker: string): Promise<YahooQuote | null> {
  const url = `${YAHOO_FINANCE_URL}/${ticker}?interval=1d&range=1d`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status}`)
  }

  const data = await response.json()
  const result = data?.chart?.result?.[0]

  if (!result || !result.meta) {
    return null
  }

  const meta = result.meta
  const quote = result.indicators?.quote?.[0] || {}
  const lastIndex = quote.close?.length ? quote.close.length - 1 : 0

  const price = meta.regularMarketPrice || quote.close?.[lastIndex]
  const previousClose = meta.previousClose || meta.chartPreviousClose

  if (!price) return null

  return {
    ticker: ticker.toUpperCase(),
    price,
    previousClose,
    change: price - previousClose,
    changePercent: ((price - previousClose) / previousClose) * 100,
    volume: meta.regularMarketVolume || quote.volume?.[lastIndex] || 0,
    marketCap: meta.marketCap,
    high: meta.regularMarketDayHigh || quote.high?.[lastIndex],
    low: meta.regularMarketDayLow || quote.low?.[lastIndex],
    open: meta.regularMarketOpen || quote.open?.[lastIndex],
    time: meta.regularMarketTime || Date.now() / 1000,
  }
}

// Save quote to Supabase
async function saveQuote(quote: YahooQuote): Promise<void> {
  const { error } = await getSupabase()
    .from('stock_prices_snapshot')
    .upsert({
      ticker: quote.ticker,
      price: quote.price,
      close: quote.price,
      previous_close: quote.previousClose,
      change: quote.change,
      change_percent: quote.changePercent,
      volume: quote.volume,
      market_cap: quote.marketCap,
      day_high: quote.high,
      day_low: quote.low,
      open: quote.open,
      time: new Date(quote.time * 1000).toISOString(),
      time_milliseconds: quote.time * 1000,
      source: 'YAHOO_FINANCE',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'ticker' })

  if (error) {
    throw new Error(`Failed to save quote: ${error.message}`)
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const startTime = Date.now()
  const rateLimiter = new RateLimiter(5) // 5 requests per second to Yahoo

  return withCronLogging('sync-prices', async () => {
    const results: Array<{
      ticker: string
      success: boolean
      price?: number
      error?: string
    }> = []

    // Single ticker mode
    if (ticker) {
      try {
        await rateLimiter.wait()
        const quote = await withRetry(
          () => fetchYahooQuote(ticker.toUpperCase()),
          { maxRetries: 2, retryOn: isRetryableError }
        )

        if (quote) {
          await saveQuote(quote)
          results.push({ ticker: ticker.toUpperCase(), success: true, price: quote.price })
        } else {
          results.push({ ticker: ticker.toUpperCase(), success: false, error: 'No data' })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        results.push({ ticker: ticker.toUpperCase(), success: false, error: errorMsg })
      }

      return NextResponse.json({
        success: results[0]?.success || false,
        ticker: ticker.toUpperCase(),
        price: results[0]?.price,
        source: 'YAHOO_FINANCE',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode - sync priority tickers
    const tickersToSync = PRIORITY_TICKERS.slice(offset, offset + limit)

    const batchResults = await processBatch(
      tickersToSync,
      async (t) => {
        await rateLimiter.wait()
        const quote = await withRetry(
          () => fetchYahooQuote(t),
          { maxRetries: 2, retryOn: isRetryableError }
        )

        if (quote) {
          await saveQuote(quote)
          return { ticker: t, price: quote.price }
        }
        throw new Error('No data from Yahoo')
      },
      { delayBetweenItems: 0, continueOnError: true }
    )

    const successCount = batchResults.filter(r => r.success).length
    const failCount = batchResults.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      source: 'YAHOO_FINANCE',
      summary: {
        tickersProcessed: tickersToSync.length,
        successCount,
        failCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < PRIORITY_TICKERS.length,
        nextOffset: offset + limit,
        totalTickers: PRIORITY_TICKERS.length,
      },
      results: batchResults.map(r => ({
        ticker: (r.item as string),
        success: r.success,
        price: (r.result as any)?.price,
        error: r.error,
      })),
    })
  })
}
