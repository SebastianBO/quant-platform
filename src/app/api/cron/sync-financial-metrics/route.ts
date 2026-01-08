import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Financial Metrics from Yahoo Finance (FREE)
// Fetches: PE ratio, market cap, margins, ROE, debt ratios, etc.
// Target: ~5,344 US companies with SEC financial data

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const REQUEST_DELAY_MS = 500 // 2 requests/second to avoid rate limits

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface YahooMetrics {
  ticker: string
  // Valuation
  marketCap?: number
  enterpriseValue?: number
  peRatio?: number
  pegRatio?: number
  priceToBook?: number
  priceToSales?: number
  evToRevenue?: number
  evToEbitda?: number
  // Profitability
  grossMargin?: number
  operatingMargin?: number
  netMargin?: number
  returnOnEquity?: number
  returnOnAssets?: number
  // Growth
  revenueGrowth?: number
  earningsGrowth?: number
  // Efficiency & Liquidity
  currentRatio?: number
  quickRatio?: number
  debtToEquity?: number
  // Per Share
  eps?: number
  bookValuePerShare?: number
  freeCashFlowPerShare?: number
}

// Scrape key statistics from Yahoo Finance
async function fetchYahooMetrics(ticker: string): Promise<YahooMetrics | null> {
  try {
    // Use the quoteSummary endpoint for comprehensive data
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics,financialData,summaryDetail`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.log(`Yahoo returned ${response.status} for ${ticker}`)
      return null
    }

    const data = await response.json()
    const result = data?.quoteSummary?.result?.[0]
    if (!result) return null

    const keyStats = result.defaultKeyStatistics || {}
    const financialData = result.financialData || {}
    const summaryDetail = result.summaryDetail || {}

    // Helper to extract raw value
    const raw = (obj: any) => obj?.raw ?? obj?.value ?? null

    const metrics: YahooMetrics = {
      ticker: ticker.toUpperCase(),
      // Valuation
      marketCap: raw(summaryDetail.marketCap),
      enterpriseValue: raw(keyStats.enterpriseValue),
      peRatio: raw(summaryDetail.trailingPE) || raw(keyStats.forwardPE),
      pegRatio: raw(keyStats.pegRatio),
      priceToBook: raw(keyStats.priceToBook),
      priceToSales: raw(summaryDetail.priceToSalesTrailing12Months),
      evToRevenue: raw(keyStats.enterpriseToRevenue),
      evToEbitda: raw(keyStats.enterpriseToEbitda),
      // Profitability
      grossMargin: raw(financialData.grossMargins),
      operatingMargin: raw(financialData.operatingMargins),
      netMargin: raw(financialData.profitMargins),
      returnOnEquity: raw(financialData.returnOnEquity),
      returnOnAssets: raw(financialData.returnOnAssets),
      // Growth
      revenueGrowth: raw(financialData.revenueGrowth),
      earningsGrowth: raw(financialData.earningsGrowth),
      // Liquidity & Leverage
      currentRatio: raw(financialData.currentRatio),
      quickRatio: raw(financialData.quickRatio),
      debtToEquity: raw(financialData.debtToEquity),
      // Per Share
      eps: raw(keyStats.trailingEps) || raw(summaryDetail.trailingEps),
      bookValuePerShare: raw(keyStats.bookValue),
      freeCashFlowPerShare: raw(financialData.freeCashflow) && raw(keyStats.sharesOutstanding)
        ? raw(financialData.freeCashflow) / raw(keyStats.sharesOutstanding)
        : undefined,
    }

    return metrics
  } catch (error) {
    console.error(`Error fetching Yahoo metrics for ${ticker}:`, error)
    return null
  }
}

// Get unique tickers from income_statements that need metrics
async function getTickersNeedingMetrics(limit: number, offset: number): Promise<string[]> {
  // Get tickers from income_statements that don't have recent metrics
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // First get all tickers from income statements
  const { data: incomeData, error: incomeError } = await getSupabase()
    .from('income_statements')
    .select('ticker')
    .not('ticker', 'is', null)
    .order('ticker')

  if (incomeError || !incomeData) {
    console.error('Failed to get tickers from income_statements:', incomeError)
    return []
  }

  // Get unique tickers
  const allTickers = [...new Set(incomeData.map(d => d.ticker).filter(Boolean))]

  // Get tickers that already have recent metrics
  const { data: metricsData } = await getSupabase()
    .from('financial_metrics')
    .select('ticker')
    .gte('updated_at', thirtyDaysAgo.toISOString())

  const tickersWithMetrics = new Set(metricsData?.map(d => d.ticker) || [])

  // Filter to tickers needing metrics
  const tickersNeedingMetrics = allTickers.filter(t => !tickersWithMetrics.has(t))

  console.log(`Found ${tickersNeedingMetrics.length} tickers needing metrics (of ${allTickers.length} total)`)

  return tickersNeedingMetrics.slice(offset, offset + limit)
}

// Save metrics to Supabase
async function saveMetrics(metrics: YahooMetrics): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]

  const record = {
    ticker: metrics.ticker,
    report_period: today,
    fiscal_period: 'TTM',
    period: 'ttm',
    currency: 'USD',
    // Valuation
    market_cap: metrics.marketCap,
    enterprise_value: metrics.enterpriseValue,
    price_to_earnings_ratio: metrics.peRatio,
    peg_ratio: metrics.pegRatio,
    price_to_book_ratio: metrics.priceToBook,
    price_to_sales_ratio: metrics.priceToSales,
    enterprise_value_to_revenue_ratio: metrics.evToRevenue,
    enterprise_value_to_ebitda_ratio: metrics.evToEbitda,
    // Profitability
    gross_margin: metrics.grossMargin,
    operating_margin: metrics.operatingMargin,
    net_margin: metrics.netMargin,
    return_on_equity: metrics.returnOnEquity,
    return_on_assets: metrics.returnOnAssets,
    // Growth
    revenue_growth: metrics.revenueGrowth,
    earnings_growth: metrics.earningsGrowth,
    // Liquidity & Leverage
    current_ratio: metrics.currentRatio,
    quick_ratio: metrics.quickRatio,
    debt_to_equity: metrics.debtToEquity ? metrics.debtToEquity / 100 : null, // Yahoo returns as percentage
    // Per Share
    earnings_per_share: metrics.eps,
    book_value_per_share: metrics.bookValuePerShare,
    free_cash_flow_per_share: metrics.freeCashFlowPerShare,
    // Source
    source: 'YAHOO_FINANCE',
    updated_at: new Date().toISOString(),
  }

  // Use upsert with ticker + report_period + period as unique constraint
  // But we want to update if exists, so use the unique constraint
  const { error } = await getSupabase()
    .from('financial_metrics')
    .upsert(record, {
      onConflict: 'ticker,report_period,period',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save metrics for ${metrics.ticker}:`, error)
    return false
  }

  return true
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = parseInt(searchParams.get('offset') || '0')
  const mode = searchParams.get('mode') || 'continue' // 'continue' or 'priority'

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-financial-metrics', async () => {
    // Single ticker mode
    if (ticker) {
      const metrics = await fetchYahooMetrics(ticker.toUpperCase())

      if (!metrics) {
        return NextResponse.json({
          success: false,
          ticker: ticker.toUpperCase(),
          error: 'Could not fetch metrics from Yahoo Finance',
        }, { status: 404 })
      }

      const saved = await saveMetrics(metrics)

      return NextResponse.json({
        success: saved,
        ticker: metrics.ticker,
        metrics: {
          marketCap: metrics.marketCap,
          peRatio: metrics.peRatio,
          grossMargin: metrics.grossMargin,
          returnOnEquity: metrics.returnOnEquity,
        },
        source: 'YAHOO_FINANCE',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let tickersToSync: string[]

    if (mode === 'priority') {
      // Priority mode: Focus on major stocks first
      const priorityTickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
        'JPM', 'V', 'JNJ', 'UNH', 'HD', 'PG', 'MA', 'XOM', 'CVX', 'BAC',
        'ABBV', 'KO', 'PFE', 'MRK', 'PEP', 'COST', 'TMO', 'WMT', 'DIS',
        'CSCO', 'ABT', 'VZ', 'CRM', 'INTC', 'NFLX', 'AMD', 'QCOM', 'TXN',
      ].slice(offset, offset + limit)
      tickersToSync = priorityTickers
    } else {
      // Continue mode: Process all tickers needing metrics
      tickersToSync = await getTickersNeedingMetrics(limit, offset)
    }

    if (tickersToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickers need metrics sync',
        duration: Date.now() - startTime,
      })
    }

    const rateLimiter = new RateLimiter(2) // 2 requests/second
    const results: Array<{ ticker: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const t of tickersToSync) {
      await rateLimiter.wait()

      try {
        const metrics = await fetchYahooMetrics(t)

        if (metrics) {
          const hasData = metrics.marketCap || metrics.peRatio || metrics.grossMargin

          if (hasData) {
            const saved = await saveMetrics(metrics)
            if (saved) {
              successCount++
              results.push({ ticker: t, success: true })
            } else {
              failCount++
              results.push({ ticker: t, success: false, error: 'Save failed' })
            }
          } else {
            // No meaningful data from Yahoo
            results.push({ ticker: t, success: false, error: 'No data available' })
            failCount++
          }
        } else {
          failCount++
          results.push({ ticker: t, success: false, error: 'Fetch failed' })
        }
      } catch (error) {
        failCount++
        results.push({
          ticker: t,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

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
        mode,
        offset,
        limit,
        nextOffset: offset + limit,
      },
      results: results.slice(0, 20), // Only show first 20 for brevity
    })
  })
}
