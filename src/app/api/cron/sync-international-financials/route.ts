import { NextRequest, NextResponse } from 'next/server'
import { syncEODHDFinancials, syncEODHDBatch } from '@/lib/eodhd/sync'
import {
  ALL_INTERNATIONAL_STOCKS,
  getStocksByExchange,
  getStocksByCountry,
  EXCHANGES,
  type ExchangeCode,
} from '@/lib/eodhd/international-stocks'

/**
 * Sync International Financial Statements from EODHD
 *
 * Modes:
 * - all: Sync all international stocks (paginated)
 * - exchange: Sync all stocks from a specific exchange (e.g., ST, XETRA)
 * - country: Sync all stocks from a specific country (e.g., SE, DE)
 * - ticker: Sync a specific ticker (e.g., VOLV-B.ST)
 *
 * Query Parameters:
 * - mode: all | exchange | country | ticker
 * - exchange: Exchange code (for mode=exchange)
 * - country: Country code (for mode=country)
 * - ticker: Ticker symbol (for mode=ticker)
 * - limit: Max stocks to sync (default: 20)
 * - offset: Pagination offset (default: 0)
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('mode') || 'all'
  const exchange = searchParams.get('exchange')
  const country = searchParams.get('country')
  const ticker = searchParams.get('ticker')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Verify cron secret if configured
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()

    // Single ticker mode
    if (mode === 'ticker' && ticker) {
      const [tickerSymbol, exchangeCode] = ticker.includes('.')
        ? ticker.split('.')
        : [ticker, exchange || 'US']

      const result = await syncEODHDFinancials(tickerSymbol, exchangeCode)

      return NextResponse.json({
        success: result.success,
        mode: 'ticker',
        ticker: `${tickerSymbol}.${exchangeCode}`,
        result,
        duration: Date.now() - startTime,
      })
    }

    // Get stocks to sync based on mode
    let stocksToSync: Array<{ ticker: string; exchange: string }>

    if (mode === 'exchange' && exchange) {
      if (!EXCHANGES[exchange as ExchangeCode]) {
        return NextResponse.json({
          error: `Unknown exchange: ${exchange}. Valid: ${Object.keys(EXCHANGES).join(', ')}`
        }, { status: 400 })
      }
      stocksToSync = getStocksByExchange(exchange)
        .slice(offset, offset + limit)
        .map(s => ({ ticker: s.ticker, exchange: s.exchange }))
    } else if (mode === 'country' && country) {
      stocksToSync = getStocksByCountry(country.toUpperCase())
        .slice(offset, offset + limit)
        .map(s => ({ ticker: s.ticker, exchange: s.exchange }))
    } else {
      // Default: all stocks
      stocksToSync = ALL_INTERNATIONAL_STOCKS
        .slice(offset, offset + limit)
        .map(s => ({ ticker: s.ticker, exchange: s.exchange }))
    }

    if (stocksToSync.length === 0) {
      return NextResponse.json({
        success: true,
        mode,
        message: 'No stocks to sync',
        pagination: { offset, limit, hasMore: false }
      })
    }

    // Sync batch
    const batchResult = await syncEODHDBatch(stocksToSync, { delayMs: 200 })

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: batchResult.failed === 0,
      mode,
      summary: {
        total: batchResult.total,
        successful: batchResult.successful,
        failed: batchResult.failed,
        incomeStatements: batchResult.results.reduce((sum, r) => sum + r.incomeStatements, 0),
        balanceSheets: batchResult.results.reduce((sum, r) => sum + r.balanceSheets, 0),
        cashFlowStatements: batchResult.results.reduce((sum, r) => sum + r.cashFlowStatements, 0),
        durationMs: duration,
        avgPerStock: Math.round(duration / batchResult.total),
      },
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < (
          mode === 'exchange' && exchange ? getStocksByExchange(exchange).length :
          mode === 'country' && country ? getStocksByCountry(country.toUpperCase()).length :
          ALL_INTERNATIONAL_STOCKS.length
        ),
        nextOffset: offset + limit,
        totalStocks: mode === 'exchange' && exchange ? getStocksByExchange(exchange).length :
          mode === 'country' && country ? getStocksByCountry(country.toUpperCase()).length :
          ALL_INTERNATIONAL_STOCKS.length,
      },
      results: batchResult.results.map(r => ({
        ticker: `${r.ticker}.${r.exchange}`,
        success: r.success,
        statements: r.incomeStatements + r.balanceSheets + r.cashFlowStatements,
        errors: r.errors.length > 0 ? r.errors.slice(0, 2) : undefined,
      })),
    })

  } catch (error) {
    console.error('International sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 })
  }
}

// POST for manual sync with custom tickers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers } = body as { tickers: Array<{ ticker: string; exchange: string }> }

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: 'tickers array is required' }, { status: 400 })
    }

    const startTime = Date.now()

    // Limit to 50 tickers per request
    const stocksToSync = tickers.slice(0, 50)

    const batchResult = await syncEODHDBatch(stocksToSync, { delayMs: 200 })

    return NextResponse.json({
      success: batchResult.failed === 0,
      summary: {
        total: batchResult.total,
        successful: batchResult.successful,
        failed: batchResult.failed,
        statementsCreated: batchResult.results.reduce((sum, r) =>
          sum + r.incomeStatements + r.balanceSheets + r.cashFlowStatements, 0),
        durationMs: Date.now() - startTime,
      },
      results: batchResult.results,
    })

  } catch (error) {
    console.error('Manual international sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 })
  }
}
