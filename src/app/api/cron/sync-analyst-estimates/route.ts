import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Sync analyst estimates by SCRAPING Yahoo Finance (FREE)
// No paid API needed - we scrape public data just like FinancialDatasets.ai does

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Rate limiting and retry config
const REQUEST_DELAY_MS = 1500 // 1.5s between requests to avoid rate limits
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

// All tracked tickers
const ALL_TICKERS = [
  // Mega caps
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
  // Large caps - Tech
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX', 'AVGO', 'QCOM', 'TXN', 'CSCO',
  'IBM', 'INTU', 'AMAT', 'ADI', 'LRCX', 'MU', 'KLAC', 'SNPS', 'CDNS', 'NOW',
  'PANW', 'SNOW', 'CRWD', 'DDOG', 'ZS', 'NET', 'FTNT', 'TEAM', 'WDAY',
  // Finance
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'AXP', 'SCHW',
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY',
  'AMGN', 'GILD', 'VRTX', 'REGN', 'ISRG', 'MRNA',
  // Consumer
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE', 'LOW', 'TGT', 'SBUX',
  // Industrial
  'CAT', 'DE', 'BA', 'RTX', 'HON', 'UPS', 'GE', 'LMT',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG',
  // Popular retail/meme
  'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'HOOD', 'COIN', 'RBLX',
  // EV
  'NIO', 'LI', 'XPEV',
  // Other notable
  'UBER', 'ABNB', 'DASH', 'SNAP', 'ZM', 'SQ', 'PYPL', 'SHOP',
]

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        const waitTime = delay * Math.pow(2, attempt) // Exponential backoff
        console.log(`Retry ${attempt + 1}/${retries} after ${waitTime}ms: ${lastError.message}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}

// Log to Supabase for monitoring
async function logToSupabase(
  jobName: string,
  status: 'started' | 'completed' | 'failed',
  details: Record<string, unknown>
) {
  try {
    await getSupabase().from('cron_job_log').insert({
      job_name: jobName,
      status,
      details,
      created_at: new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to log to Supabase:', err)
  }
}

interface YahooAnalystEstimate {
  ticker: string
  fiscal_period: string
  period: string
  eps_estimate?: number
  eps_actual?: number
  eps_surprise?: number
  eps_surprise_percent?: number
  revenue_estimate?: number
  revenue_actual?: number
  num_analysts?: number
}

// Parse number from Yahoo Finance format (handles "1.23B", "45.6M", etc.)
function parseYahooNumber(value: string | null | undefined): number | undefined {
  if (!value || value === 'N/A' || value === '-') return undefined

  const cleaned = value.replace(/[,$%]/g, '').trim()

  let multiplier = 1
  if (cleaned.endsWith('T')) multiplier = 1e12
  else if (cleaned.endsWith('B')) multiplier = 1e9
  else if (cleaned.endsWith('M')) multiplier = 1e6
  else if (cleaned.endsWith('K')) multiplier = 1e3

  const numStr = cleaned.replace(/[TBMK]/gi, '')
  const num = parseFloat(numStr)

  return isNaN(num) ? undefined : num * multiplier
}

// Scrape analyst estimates from Yahoo Finance (FREE)
async function scrapeYahooAnalystEstimates(ticker: string): Promise<YahooAnalystEstimate[]> {
  const url = `https://finance.yahoo.com/quote/${ticker}/analysis`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  })

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status}`)
  }

  const html = await response.text()
  const estimates: YahooAnalystEstimate[] = []

  // Parse EPS estimates table
  // Yahoo stores data in JSON format within the page
  const jsonMatch = html.match(/root\.App\.main\s*=\s*(\{[\s\S]*?\});/)
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1])
      const earningsData = data?.context?.dispatcher?.stores?.QuoteSummaryStore?.earningsTrend?.trend || []

      for (const trend of earningsData) {
        if (trend.period && trend.earningsEstimate) {
          estimates.push({
            ticker: ticker.toUpperCase(),
            fiscal_period: trend.period, // e.g., "0q" = current quarter, "+1q" = next quarter
            period: trend.period.includes('y') ? 'annual' : 'quarterly',
            eps_estimate: trend.earningsEstimate?.avg?.raw,
            num_analysts: trend.earningsEstimate?.numberOfAnalysts?.raw,
          })
        }
      }

      // Get historical EPS actuals
      const earningsHistory = data?.context?.dispatcher?.stores?.QuoteSummaryStore?.earningsHistory?.history || []
      for (const hist of earningsHistory) {
        if (hist.epsActual) {
          const existing = estimates.find(e => e.fiscal_period === hist.period)
          if (existing) {
            existing.eps_actual = hist.epsActual?.raw
            existing.eps_surprise = hist.surprisePercent?.raw
          } else {
            estimates.push({
              ticker: ticker.toUpperCase(),
              fiscal_period: hist.period || 'historical',
              period: 'quarterly',
              eps_actual: hist.epsActual?.raw,
              eps_estimate: hist.epsEstimate?.raw,
              eps_surprise_percent: hist.surprisePercent?.raw,
            })
          }
        }
      }

      // Get revenue estimates
      const revenueData = data?.context?.dispatcher?.stores?.QuoteSummaryStore?.earningsTrend?.trend || []
      for (const trend of revenueData) {
        if (trend.revenueEstimate) {
          const existing = estimates.find(e => e.fiscal_period === trend.period)
          if (existing) {
            existing.revenue_estimate = trend.revenueEstimate?.avg?.raw
          }
        }
      }

    } catch (parseError) {
      console.error(`Failed to parse Yahoo JSON for ${ticker}:`, parseError)
    }
  }

  // Fallback: Parse HTML tables if JSON not available
  if (estimates.length === 0) {
    // Simple regex-based parsing for EPS estimates table
    const epsTableMatch = html.match(/Earnings Estimate[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i)
    if (epsTableMatch) {
      const rows = epsTableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []

      for (const row of rows) {
        const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
        if (cells.length >= 2) {
          const label = cells[0].replace(/<[^>]*>/g, '').trim()
          if (label.includes('Avg. Estimate')) {
            // Parse quarter columns
            const values = cells.slice(1).map(c => parseYahooNumber(c.replace(/<[^>]*>/g, '').trim()))
            values.forEach((val, idx) => {
              if (val !== undefined) {
                estimates.push({
                  ticker: ticker.toUpperCase(),
                  fiscal_period: `Q${idx + 1}`,
                  period: 'quarterly',
                  eps_estimate: val,
                })
              }
            })
          }
        }
      }
    }
  }

  return estimates
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '30')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()
  const results: Array<{
    ticker: string
    estimatesCreated: number
    error?: string
  }> = []

  await logToSupabase('sync-analyst-estimates', 'started', { ticker, limit, offset })

  try {
    // Single ticker mode
    if (ticker) {
      const estimates = await withRetry(() => scrapeYahooAnalystEstimates(ticker.toUpperCase()))

      let estimatesCreated = 0
      if (estimates.length > 0) {
        const rows = estimates.map(e => ({
          ticker: e.ticker,
          fiscal_period: e.fiscal_period,
          period: e.period,
          eps_estimate: e.eps_estimate,
          eps_actual: e.eps_actual,
          eps_surprise: e.eps_surprise,
          eps_surprise_percent: e.eps_surprise_percent,
          revenue_estimate: e.revenue_estimate,
          revenue_actual: e.revenue_actual,
          num_analysts: e.num_analysts,
          source: 'YAHOO_SCRAPE',
          updated_at: new Date().toISOString()
        }))

        const { error } = await getSupabase()
          .from('analyst_estimates')
          .upsert(rows, { onConflict: 'ticker,fiscal_period,period' })

        if (!error) estimatesCreated = rows.length
      }

      return NextResponse.json({
        success: true,
        ticker: ticker.toUpperCase(),
        estimatesCreated,
        source: 'YAHOO_SCRAPE',
        duration: Date.now() - startTime
      })
    }

    // Batch mode
    const tickersToSync = ALL_TICKERS.slice(offset, offset + limit)
    let totalEstimates = 0
    let successCount = 0
    let failCount = 0

    for (const t of tickersToSync) {
      try {
        const estimates = await withRetry(() => scrapeYahooAnalystEstimates(t))

        let estCount = 0
        if (estimates.length > 0) {
          const rows = estimates.map(e => ({
            ticker: e.ticker,
            fiscal_period: e.fiscal_period,
            period: e.period,
            eps_estimate: e.eps_estimate,
            eps_actual: e.eps_actual,
            eps_surprise: e.eps_surprise,
            eps_surprise_percent: e.eps_surprise_percent,
            revenue_estimate: e.revenue_estimate,
            revenue_actual: e.revenue_actual,
            num_analysts: e.num_analysts,
            source: 'YAHOO_SCRAPE',
            updated_at: new Date().toISOString()
          }))

          const { error } = await getSupabase()
            .from('analyst_estimates')
            .upsert(rows, { onConflict: 'ticker,fiscal_period,period' })

          if (!error) {
            estCount = rows.length
            successCount++
          }
        } else {
          successCount++ // No data is not a failure
        }

        totalEstimates += estCount
        results.push({ ticker: t, estimatesCreated: estCount })

        // Rate limit to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))

      } catch (err) {
        failCount++
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Failed to sync ${t}:`, errorMsg)
        results.push({ ticker: t, estimatesCreated: 0, error: errorMsg })

        // Continue to next ticker, don't fail entire job
      }
    }

    await logToSupabase('sync-analyst-estimates', 'completed', {
      tickersProcessed: tickersToSync.length,
      successCount,
      failCount,
      totalEstimates,
      duration: Date.now() - startTime
    })

    return NextResponse.json({
      success: true,
      source: 'YAHOO_SCRAPE',
      summary: {
        tickersProcessed: tickersToSync.length,
        successCount,
        failCount,
        totalEstimatesCreated: totalEstimates,
        duration: Date.now() - startTime
      },
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < ALL_TICKERS.length,
        nextOffset: offset + limit,
        totalTickers: ALL_TICKERS.length
      },
      results
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Analyst estimates sync error:', errorMsg)

    await logToSupabase('sync-analyst-estimates', 'failed', {
      error: errorMsg,
      duration: Date.now() - startTime
    })

    return NextResponse.json({
      error: 'Sync failed',
      details: errorMsg,
      source: 'YAHOO_SCRAPE'
    }, { status: 500 })
  }
}
