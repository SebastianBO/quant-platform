import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Financial Metrics from EODHD (has free tier, your API key works)
// Fetches: PE ratio, market cap, margins, ROE, debt ratios, analyst ratings, etc.
// Target: ~5,345 US companies with SEC financial data

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EODHD_API_KEY = process.env.EODHD_API_KEY || ''
const REQUEST_DELAY_MS = 250 // EODHD allows 100k requests/day

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface EODHDFundamentals {
  General?: {
    Code?: string
    Name?: string
    Sector?: string
    Industry?: string
    Description?: string
    FullTimeEmployees?: number
  }
  Highlights?: {
    MarketCapitalization?: number
    EBITDA?: number
    PERatio?: number
    PEGRatio?: number
    WallStreetTargetPrice?: number
    BookValue?: number
    DividendShare?: number
    DividendYield?: number
    EarningsShare?: number
    EPSEstimateCurrentYear?: number
    EPSEstimateNextYear?: number
    EPSEstimateNextQuarter?: number
    EPSEstimateCurrentQuarter?: number
    ProfitMargin?: number
    OperatingMarginTTM?: number
    ReturnOnAssetsTTM?: number
    ReturnOnEquityTTM?: number
    RevenueTTM?: number
    RevenuePerShareTTM?: number
    QuarterlyRevenueGrowthYOY?: number
    GrossProfitTTM?: number
    DilutedEpsTTM?: number
    QuarterlyEarningsGrowthYOY?: number
  }
  Valuation?: {
    TrailingPE?: number
    ForwardPE?: number
    PriceSalesTTM?: number
    PriceBookMRQ?: number
    EnterpriseValue?: number
    EnterpriseValueRevenue?: number
    EnterpriseValueEbitda?: number
  }
  SharesStats?: {
    SharesOutstanding?: number
    SharesFloat?: number
    PercentInsiders?: number
    PercentInstitutions?: number
    ShortPercentFloat?: number
  }
  Technicals?: {
    Beta?: number
    '52WeekHigh'?: number
    '52WeekLow'?: number
    '50DayMA'?: number
    '200DayMA'?: number
  }
  AnalystRatings?: {
    Rating?: number
    TargetPrice?: number
    StrongBuy?: number
    Buy?: number
    Hold?: number
    Sell?: number
    StrongSell?: number
  }
}

// Fetch fundamentals from EODHD
async function fetchEODHDFundamentals(ticker: string): Promise<EODHDFundamentals | null> {
  try {
    // EODHD uses .US suffix for US stocks
    const symbol = ticker.includes('.') ? ticker : `${ticker}.US`
    const url = `https://eodhd.com/api/fundamentals/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Lician/1.0',
      }
    })

    if (!response.ok) {
      console.log(`EODHD returned ${response.status} for ${ticker}`)
      return null
    }

    const data = await response.json()

    // Check if we got valid data
    if (!data || data.error || !data.General) {
      return null
    }

    return data as EODHDFundamentals
  } catch (error) {
    console.error(`Error fetching EODHD fundamentals for ${ticker}:`, error)
    return null
  }
}

// Get unique tickers from income_statements that need metrics
async function getTickersNeedingMetrics(limit: number, offset: number): Promise<string[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get all tickers from income statements
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
async function saveMetrics(ticker: string, data: EODHDFundamentals): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const highlights = data.Highlights || {}
  const valuation = data.Valuation || {}
  const general = data.General || {}
  const technicals = data.Technicals || {}

  const record = {
    ticker: ticker.toUpperCase(),
    report_period: today,
    fiscal_period: 'TTM',
    period: 'ttm',
    currency: 'USD',
    // Company info
    company_name: general.Name,
    sector: general.Sector,
    industry: general.Industry,
    employees: general.FullTimeEmployees,
    // Valuation
    market_cap: highlights.MarketCapitalization,
    enterprise_value: valuation.EnterpriseValue,
    price_to_earnings_ratio: highlights.PERatio || valuation.TrailingPE,
    forward_pe_ratio: valuation.ForwardPE,
    peg_ratio: highlights.PEGRatio,
    price_to_book_ratio: valuation.PriceBookMRQ,
    price_to_sales_ratio: valuation.PriceSalesTTM,
    enterprise_value_to_revenue_ratio: valuation.EnterpriseValueRevenue,
    enterprise_value_to_ebitda_ratio: valuation.EnterpriseValueEbitda,
    // Profitability
    gross_margin: highlights.GrossProfitTTM && highlights.RevenueTTM
      ? highlights.GrossProfitTTM / highlights.RevenueTTM
      : null,
    operating_margin: highlights.OperatingMarginTTM,
    net_margin: highlights.ProfitMargin,
    return_on_equity: highlights.ReturnOnEquityTTM,
    return_on_assets: highlights.ReturnOnAssetsTTM,
    // Growth
    revenue_growth: highlights.QuarterlyRevenueGrowthYOY,
    earnings_growth: highlights.QuarterlyEarningsGrowthYOY,
    // Per Share
    earnings_per_share: highlights.EarningsShare || highlights.DilutedEpsTTM,
    book_value_per_share: highlights.BookValue,
    revenue_per_share: highlights.RevenuePerShareTTM,
    dividend_per_share: highlights.DividendShare,
    dividend_yield: highlights.DividendYield,
    // EBITDA
    ebitda: highlights.EBITDA,
    revenue_ttm: highlights.RevenueTTM,
    // Technicals
    beta: technicals.Beta,
    fifty_two_week_high: technicals['52WeekHigh'],
    fifty_two_week_low: technicals['52WeekLow'],
    fifty_day_ma: technicals['50DayMA'],
    two_hundred_day_ma: technicals['200DayMA'],
    // Source
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('financial_metrics')
    .upsert(record, {
      onConflict: 'ticker,report_period,period',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save metrics for ${ticker}:`, error.message)
    return false
  }

  return true
}

// Save analyst ratings to separate table
async function saveAnalystRatings(ticker: string, data: EODHDFundamentals): Promise<boolean> {
  const ratings = data.AnalystRatings
  const highlights = data.Highlights

  if (!ratings && !highlights) return true // No ratings to save

  const record = {
    ticker: ticker.toUpperCase(),
    rating_date: new Date().toISOString().split('T')[0],
    consensus_rating: ratings?.Rating,
    target_price: ratings?.TargetPrice || highlights?.WallStreetTargetPrice,
    strong_buy: ratings?.StrongBuy,
    buy: ratings?.Buy,
    hold: ratings?.Hold,
    sell: ratings?.Sell,
    strong_sell: ratings?.StrongSell,
    total_analysts: ratings ?
      (ratings.StrongBuy || 0) + (ratings.Buy || 0) + (ratings.Hold || 0) +
      (ratings.Sell || 0) + (ratings.StrongSell || 0) : null,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }

  // Only save if we have meaningful data
  if (!record.consensus_rating && !record.target_price) return true

  const { error } = await getSupabase()
    .from('analyst_ratings')
    .upsert(record, {
      onConflict: 'ticker,rating_date',
      ignoreDuplicates: false
    })

  if (error) {
    // Table might not exist, that's ok
    if (!error.message.includes('does not exist')) {
      console.error(`Failed to save analyst ratings for ${ticker}:`, error.message)
    }
  }

  return true
}

// Save analyst estimates
async function saveAnalystEstimates(ticker: string, data: EODHDFundamentals): Promise<boolean> {
  const highlights = data.Highlights
  if (!highlights) return true

  const estimates = []
  const today = new Date().toISOString().split('T')[0]

  // Current quarter estimate
  if (highlights.EPSEstimateCurrentQuarter) {
    estimates.push({
      ticker: ticker.toUpperCase(),
      fiscal_period: 'current_quarter',
      period: 'quarterly',
      eps_estimate: highlights.EPSEstimateCurrentQuarter,
      source: 'EODHD',
      updated_at: new Date().toISOString(),
    })
  }

  // Next quarter estimate
  if (highlights.EPSEstimateNextQuarter) {
    estimates.push({
      ticker: ticker.toUpperCase(),
      fiscal_period: 'next_quarter',
      period: 'quarterly',
      eps_estimate: highlights.EPSEstimateNextQuarter,
      source: 'EODHD',
      updated_at: new Date().toISOString(),
    })
  }

  // Current year estimate
  if (highlights.EPSEstimateCurrentYear) {
    estimates.push({
      ticker: ticker.toUpperCase(),
      fiscal_period: 'current_year',
      period: 'annual',
      eps_estimate: highlights.EPSEstimateCurrentYear,
      source: 'EODHD',
      updated_at: new Date().toISOString(),
    })
  }

  // Next year estimate
  if (highlights.EPSEstimateNextYear) {
    estimates.push({
      ticker: ticker.toUpperCase(),
      fiscal_period: 'next_year',
      period: 'annual',
      eps_estimate: highlights.EPSEstimateNextYear,
      source: 'EODHD',
      updated_at: new Date().toISOString(),
    })
  }

  if (estimates.length === 0) return true

  const { error } = await getSupabase()
    .from('analyst_estimates')
    .upsert(estimates, {
      onConflict: 'ticker,fiscal_period,period',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save analyst estimates for ${ticker}:`, error.message)
    return false
  }

  return true
}

// Also populate company_fundamentals table
async function saveCompanyFundamentals(ticker: string, data: EODHDFundamentals): Promise<boolean> {
  const general = data.General
  const highlights = data.Highlights

  if (!general) return true

  const record = {
    ticker: ticker.toUpperCase(),
    company_name: general.Name,
    sector: general.Sector,
    industry: general.Industry,
    description: general.Description?.substring(0, 2000), // Limit length
    employees: general.FullTimeEmployees,
    market_cap: highlights?.MarketCapitalization,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('company_fundamentals')
    .upsert(record, {
      onConflict: 'ticker',
      ignoreDuplicates: false
    })

  if (error) {
    // Table might have different schema, log but don't fail
    if (!error.message.includes('does not exist')) {
      console.error(`Failed to save company fundamentals for ${ticker}:`, error.message)
    }
  }

  return true
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
  const offset = parseInt(searchParams.get('offset') || '0')
  const mode = searchParams.get('mode') || 'continue'

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  if (!EODHD_API_KEY) {
    return NextResponse.json({ error: 'EODHD_API_KEY not configured' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-financial-metrics', async () => {
    // Single ticker mode
    if (ticker) {
      const data = await fetchEODHDFundamentals(ticker.toUpperCase())

      if (!data) {
        return NextResponse.json({
          success: false,
          ticker: ticker.toUpperCase(),
          error: 'Could not fetch data from EODHD',
        }, { status: 404 })
      }

      const savedMetrics = await saveMetrics(ticker, data)
      await saveAnalystRatings(ticker, data)
      await saveAnalystEstimates(ticker, data)
      await saveCompanyFundamentals(ticker, data)

      return NextResponse.json({
        success: savedMetrics,
        ticker: ticker.toUpperCase(),
        data: {
          marketCap: data.Highlights?.MarketCapitalization,
          peRatio: data.Highlights?.PERatio,
          profitMargin: data.Highlights?.ProfitMargin,
          returnOnEquity: data.Highlights?.ReturnOnEquityTTM,
          analystRating: data.AnalystRatings?.Rating,
        },
        source: 'EODHD',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let tickersToSync: string[]

    if (mode === 'priority') {
      // Priority mode: Major stocks first
      const priorityTickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
        'JPM', 'V', 'JNJ', 'UNH', 'HD', 'PG', 'MA', 'XOM', 'CVX', 'BAC',
        'ABBV', 'KO', 'PFE', 'MRK', 'PEP', 'COST', 'TMO', 'WMT', 'DIS',
        'CSCO', 'ABT', 'VZ', 'CRM', 'INTC', 'NFLX', 'AMD', 'QCOM', 'TXN',
        'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'COIN', 'HOOD', 'MARA',
      ].slice(offset, offset + limit)
      tickersToSync = priorityTickers
    } else {
      tickersToSync = await getTickersNeedingMetrics(limit, offset)
    }

    if (tickersToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickers need metrics sync',
        duration: Date.now() - startTime,
      })
    }

    const rateLimiter = new RateLimiter(4) // 4 requests/second (conservative)
    const results: Array<{ ticker: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const t of tickersToSync) {
      await rateLimiter.wait()

      try {
        const data = await fetchEODHDFundamentals(t)

        if (data && data.Highlights) {
          const savedMetrics = await saveMetrics(t, data)
          await saveAnalystRatings(t, data)
          await saveAnalystEstimates(t, data)
          await saveCompanyFundamentals(t, data)

          if (savedMetrics) {
            successCount++
            results.push({ ticker: t, success: true })
          } else {
            failCount++
            results.push({ ticker: t, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ ticker: t, success: false, error: 'No data available' })
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
      source: 'EODHD',
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
      results: results.slice(0, 20),
    })
  })
}
