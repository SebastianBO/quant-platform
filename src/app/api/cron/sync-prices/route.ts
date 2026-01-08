import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  withCronLogging,
  RateLimiter,
  isRetryableError,
} from '@/lib/cron-utils'

// SMART PRICE SYNC - Uses BOTH EODHD (batch) + Yahoo Finance (backup)
// EODHD for efficiency (20+ stocks per request)
// Yahoo Finance for any missing/failed stocks

const EODHD_API_KEY = process.env.EODHD_API_KEY || ''
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

// COMPREHENSIVE ticker list - ALL major US stocks
const ALL_TICKERS = [
  // Magnificent 7
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
  // Semiconductors
  'AMD', 'INTC', 'AVGO', 'QCOM', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL', 'ON', 'ADI', 'NXPI', 'MCHP',
  // Software/Cloud
  'CRM', 'ORCL', 'ADBE', 'NOW', 'INTU', 'SNOW', 'DDOG', 'CRWD', 'ZS', 'NET', 'PANW', 'TEAM', 'WDAY', 'FTNT', 'MDB', 'OKTA', 'ZM', 'DOCU',
  // Internet/E-commerce
  'NFLX', 'SHOP', 'SQ', 'PYPL', 'UBER', 'ABNB', 'DASH', 'SNAP', 'PINS', 'RBLX', 'U', 'COIN', 'HOOD',
  // Finance - Banks
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'COF', 'SCHW', 'BK', 'STT',
  // Finance - Other
  'V', 'MA', 'AXP', 'BLK', 'SPGI', 'ICE', 'CME', 'MCO', 'MSCI', 'FIS', 'FISV',
  // Healthcare - Pharma
  'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'BMY', 'GILD', 'AMGN', 'REGN', 'VRTX', 'BIIB', 'MRNA', 'BNTX',
  // Healthcare - Devices/Services
  'UNH', 'TMO', 'ABT', 'DHR', 'ISRG', 'MDT', 'SYK', 'BSX', 'EW', 'ZBH', 'CI', 'CVS', 'HUM', 'ELV',
  // Consumer - Retail
  'WMT', 'COST', 'HD', 'LOW', 'TGT', 'TJX', 'ROST', 'DG', 'DLTR', 'ORLY', 'AZO',
  // Consumer - Food/Bev
  'PG', 'KO', 'PEP', 'MDLZ', 'KHC', 'GIS', 'K', 'HSY', 'MKC', 'SJM',
  // Consumer - Discretionary
  'MCD', 'SBUX', 'NKE', 'DIS', 'CMCSA', 'CHTR', 'BKNG', 'MAR', 'HLT', 'LVS', 'WYNN',
  // Industrial
  'CAT', 'DE', 'BA', 'HON', 'UPS', 'FDX', 'GE', 'RTX', 'LMT', 'NOC', 'GD', 'MMM', 'EMR', 'ETN', 'ITW', 'PH',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY', 'DVN', 'HAL', 'BKR',
  // Materials
  'LIN', 'APD', 'SHW', 'ECL', 'DD', 'DOW', 'NEM', 'FCX', 'NUE', 'CF',
  // Utilities
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'WEC',
  // Real Estate
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL', 'DLR', 'AVB',
  // Telecom
  'VZ', 'T', 'TMUS',
  // Meme/Popular
  'GME', 'AMC', 'BB', 'NOK', 'PLTR', 'SOFI', 'LCID', 'RIVN', 'NIO', 'XPEV', 'LI', 'MARA', 'RIOT', 'CLSK', 'MSTR',
  // AI/Hot Stocks
  'SMCI', 'ARM', 'IONQ', 'RGTI', 'QUBT', 'PATH',
  // Biotech Popular
  'NVAX', 'ILMN',
  // ETFs
  'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'ARKK', 'XLF', 'XLE', 'XLK',
]

interface PriceData {
  ticker: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  high?: number
  low?: number
  open?: number
  time: number
  source: 'EODHD' | 'YAHOO'
}

// ============================================================================
// EODHD BATCH FETCH (Primary - more efficient)
// ============================================================================

async function fetchEODHDBatch(tickers: string[]): Promise<Map<string, PriceData>> {
  const results = new Map<string, PriceData>()

  if (!EODHD_API_KEY) return results

  try {
    const symbols = tickers.map(t => `${t}.US`).join(',')
    const url = `https://eodhd.com/api/real-time/${symbols}?api_token=${EODHD_API_KEY}&fmt=json`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) return results

    const data = await response.json()
    const quotes = Array.isArray(data) ? data : [data]

    for (const q of quotes) {
      if (q && q.close && q.code) {
        const ticker = q.code.replace('.US', '')
        results.set(ticker, {
          ticker,
          price: q.close,
          previousClose: q.previousClose,
          change: q.change,
          changePercent: q.change_p,
          volume: q.volume,
          high: q.high,
          low: q.low,
          open: q.open,
          time: q.timestamp,
          source: 'EODHD',
        })
      }
    }
  } catch (err) {
    console.error('EODHD batch error:', err)
  }

  return results
}

// ============================================================================
// YAHOO FINANCE FETCH (Backup - for failed EODHD stocks)
// ============================================================================

async function fetchYahooQuote(ticker: string): Promise<PriceData | null> {
  try {
    const url = `${YAHOO_FINANCE_URL}/${ticker}?interval=1d&range=1d`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    if (!result || !result.meta) return null

    const meta = result.meta
    const price = meta.regularMarketPrice
    const previousClose = meta.previousClose || meta.chartPreviousClose

    if (!price) return null

    return {
      ticker: ticker.toUpperCase(),
      price,
      previousClose,
      change: price - previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      volume: meta.regularMarketVolume || 0,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      open: meta.regularMarketOpen,
      time: meta.regularMarketTime || Math.floor(Date.now() / 1000),
      source: 'YAHOO',
    }
  } catch {
    return null
  }
}

// ============================================================================
// SAVE TO SUPABASE
// ============================================================================

async function savePrices(prices: PriceData[]): Promise<number> {
  if (prices.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]

  const records = prices.map(p => ({
    ticker: p.ticker,
    date: today,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.price,
    volume: p.volume,
    prev_close: p.previousClose,
    change: p.change,
    change_percent: p.changePercent,
    updated_at: new Date().toISOString(),
  }))

  const { data, error } = await getSupabase()
    .from('stock_prices_snapshot')
    .upsert(records, { onConflict: 'ticker' })
    .select()

  if (error) {
    console.error('Failed to save prices:', error.message, error.details, error.hint)
    // Return error info for debugging
    throw new Error(`Upsert failed: ${error.message} - ${error.details || ''} - ${error.hint || ''}`)
  }

  return data?.length || records.length
}

// ============================================================================
// MAIN ENDPOINT
// ============================================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')
  const source = searchParams.get('source') || 'both' // 'eodhd', 'yahoo', or 'both'

  const startTime = Date.now()

  return withCronLogging('sync-prices', async () => {
    // Single ticker mode
    if (ticker) {
      let priceData: PriceData | null = null

      // Try EODHD first
      if (source !== 'yahoo' && EODHD_API_KEY) {
        const eodhd = await fetchEODHDBatch([ticker.toUpperCase()])
        priceData = eodhd.get(ticker.toUpperCase()) || null
      }

      // Fallback to Yahoo
      if (!priceData && source !== 'eodhd') {
        priceData = await fetchYahooQuote(ticker.toUpperCase())
      }

      if (priceData) {
        await savePrices([priceData])
        return NextResponse.json({
          success: true,
          ticker: priceData.ticker,
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          source: priceData.source,
          duration: Date.now() - startTime,
        })
      }

      return NextResponse.json({
        success: false,
        ticker: ticker.toUpperCase(),
        error: 'Could not fetch price from any source',
      }, { status: 404 })
    }

    // Batch mode - use EODHD for bulk, Yahoo for failures
    const tickersToSync = ALL_TICKERS.slice(offset, offset + limit)
    const allPrices: PriceData[] = []
    const failed: string[] = []

    // Step 1: Try EODHD batch (20 stocks per request)
    if (source !== 'yahoo' && EODHD_API_KEY) {
      const eodhRateLimiter = new RateLimiter(2)

      for (let i = 0; i < tickersToSync.length; i += 20) {
        const batch = tickersToSync.slice(i, i + 20)
        await eodhRateLimiter.wait()

        const eodhResults = await fetchEODHDBatch(batch)

        for (const t of batch) {
          const price = eodhResults.get(t)
          if (price) {
            allPrices.push(price)
          } else {
            failed.push(t)
          }
        }
      }
    } else {
      failed.push(...tickersToSync)
    }

    // Step 2: Try Yahoo for failed tickers
    if (failed.length > 0 && source !== 'eodhd') {
      const yahooRateLimiter = new RateLimiter(5)

      for (const t of failed) {
        await yahooRateLimiter.wait()
        const price = await fetchYahooQuote(t)
        if (price) {
          allPrices.push(price)
        }
      }
    }

    // Step 3: Save all prices
    const saved = await savePrices(allPrices)

    const eodhCount = allPrices.filter(p => p.source === 'EODHD').length
    const yahooCount = allPrices.filter(p => p.source === 'YAHOO').length
    const failedCount = tickersToSync.length - allPrices.length

    return NextResponse.json({
      success: true,
      summary: {
        tickersRequested: tickersToSync.length,
        tickersSaved: saved,
        fromEODHD: eodhCount,
        fromYahoo: yahooCount,
        failed: failedCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < ALL_TICKERS.length,
        nextOffset: offset + limit,
        totalTickers: ALL_TICKERS.length,
      },
    })
  })
}
