import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Sync analyst estimates and price targets from Financial Datasets API
// Runs daily on weekdays at 4:00 PM UTC

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

// All tracked tickers - comprehensive list for full coverage
const ALL_TICKERS = [
  // Mega caps
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'BRK-A',
  // Large caps - Tech
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX', 'AVGO', 'QCOM', 'TXN', 'CSCO',
  'IBM', 'INTU', 'AMAT', 'ADI', 'LRCX', 'MU', 'KLAC', 'SNPS', 'CDNS', 'NOW',
  'PANW', 'SNOW', 'CRWD', 'DDOG', 'ZS', 'NET', 'FTNT', 'TEAM', 'WDAY', 'SPLK',
  // Large caps - Finance
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'USB',
  'AXP', 'SCHW', 'PNC', 'TFC', 'COF', 'BK', 'STT', 'CME', 'ICE', 'SPGI',
  'MCO', 'MSCI', 'CB', 'MMC', 'AON', 'MET', 'PRU', 'AFL', 'TRV', 'ALL',
  // Large caps - Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY',
  'AMGN', 'GILD', 'VRTX', 'REGN', 'ISRG', 'SYK', 'MDT', 'ELV', 'CI', 'CVS',
  'HCA', 'HUM', 'MCK', 'CAH', 'BIIB', 'ZTS', 'ILMN', 'IQV', 'MRNA', 'DXCM',
  // Large caps - Consumer
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE', 'LOW', 'TGT',
  'SBUX', 'TJX', 'EL', 'CL', 'MDLZ', 'KHC', 'GIS', 'K', 'HSY', 'CLX',
  'YUM', 'DPZ', 'CMG', 'ORLY', 'AZO', 'ROST', 'DG', 'DLTR', 'BBY', 'TSCO',
  // Industrial
  'CAT', 'DE', 'BA', 'RTX', 'HON', 'UPS', 'FDX', 'GE', 'LMT', 'NOC',
  'GD', 'MMM', 'EMR', 'ITW', 'ETN', 'ROK', 'CMI', 'PH', 'IR', 'DOV',
  'WM', 'RSG', 'FAST', 'ODFL', 'URI', 'PWR', 'CSX', 'NSC', 'UNP', 'CP',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY',
  'DVN', 'HES', 'FANG', 'KMI', 'WMB', 'OKE', 'ET', 'LNG', 'HAL', 'BKR',
  // Real Estate
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL', 'DLR', 'AVB',
  // Utilities
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'PEG',
  // Materials
  'LIN', 'APD', 'SHW', 'FCX', 'NEM', 'ECL', 'DD', 'NUE', 'VMC', 'MLM',
  // Communications
  'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'NXPI', 'ATVI', 'EA', 'TTWO',
  // Popular retail/meme
  'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'HOOD', 'COIN', 'RBLX', 'U',
  'PATH', 'DOCS', 'UPST', 'AFRM', 'SE', 'SHOP', 'MELI', 'SQ', 'PYPL', 'ROKU',
  // Biotech
  'MRNA', 'BNTX', 'SGEN', 'ALNY', 'IONS', 'SRRK', 'SRPT', 'BMRN', 'EXEL', 'NBIX',
  // China ADRs
  'BABA', 'PDD', 'JD', 'NIO', 'BIDU', 'NTES', 'LI', 'XPEV', 'BILI', 'TME',
  // Other notable
  'UBER', 'LYFT', 'ABNB', 'DASH', 'SNAP', 'PINS', 'ZM', 'PTON', 'DOCU', 'OKTA',
]

interface AnalystEstimate {
  ticker: string
  fiscal_period: string
  period: string
  eps_estimate?: number
  eps_estimate_mean?: number
  eps_estimate_high?: number
  eps_estimate_low?: number
  eps_actual?: number
  eps_surprise?: number
  eps_surprise_percent?: number
  revenue_estimate?: number
  revenue_estimate_mean?: number
  revenue_estimate_high?: number
  revenue_estimate_low?: number
  revenue_actual?: number
  revenue_surprise?: number
  revenue_surprise_percent?: number
  num_analysts?: number
}

interface PriceTarget {
  ticker: string
  analyst_name?: string
  analyst_company?: string
  rating?: string
  rating_prior?: string
  price_target?: number
  price_target_prior?: number
  reported_date?: string
}

async function fetchAnalystEstimates(ticker: string, limit: number = 8): Promise<AnalystEstimate[]> {
  try {
    const url = `${FD_BASE_URL}/analyst-estimates/?ticker=${ticker}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-KEY': FINANCIAL_DATASETS_API_KEY }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.analyst_estimates || []
  } catch {
    return []
  }
}

async function fetchPriceTargets(ticker: string, limit: number = 10): Promise<PriceTarget[]> {
  try {
    const url = `${FD_BASE_URL}/analyst/price-targets/?ticker=${ticker}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-KEY': FINANCIAL_DATASETS_API_KEY }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.price_targets || []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Analyst sync called without valid CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const mode = searchParams.get('mode') || 'all' // all, estimates, targets

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !FINANCIAL_DATASETS_API_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const startTime = Date.now()
    const results: Array<{
      ticker: string
      estimatesCreated: number
      targetsCreated: number
      error?: string
    }> = []

    // If specific ticker, sync just that one
    if (ticker) {
      const estimates = mode !== 'targets' ? await fetchAnalystEstimates(ticker.toUpperCase()) : []
      const targets = mode !== 'estimates' ? await fetchPriceTargets(ticker.toUpperCase()) : []

      let estimatesCreated = 0
      let targetsCreated = 0

      // Upsert estimates
      if (estimates.length > 0) {
        const estimateRows = estimates.map(e => ({
          ticker: e.ticker,
          fiscal_period: e.fiscal_period,
          period: e.period || 'quarterly',
          eps_estimate: e.eps_estimate,
          eps_estimate_mean: e.eps_estimate_mean,
          eps_estimate_high: e.eps_estimate_high,
          eps_estimate_low: e.eps_estimate_low,
          eps_actual: e.eps_actual,
          eps_surprise: e.eps_surprise,
          eps_surprise_percent: e.eps_surprise_percent,
          revenue_estimate: e.revenue_estimate,
          revenue_estimate_mean: e.revenue_estimate_mean,
          revenue_estimate_high: e.revenue_estimate_high,
          revenue_estimate_low: e.revenue_estimate_low,
          revenue_actual: e.revenue_actual,
          revenue_surprise: e.revenue_surprise,
          revenue_surprise_percent: e.revenue_surprise_percent,
          num_analysts: e.num_analysts,
          source: 'financialdatasets.ai',
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('analyst_estimates')
          .upsert(estimateRows, { onConflict: 'ticker,fiscal_period,period' })

        if (!error) estimatesCreated = estimateRows.length
      }

      // Upsert price targets
      if (targets.length > 0) {
        const targetRows = targets.map(t => ({
          ticker: t.ticker,
          analyst_name: t.analyst_name,
          analyst_company: t.analyst_company,
          rating: t.rating,
          rating_prior: t.rating_prior,
          price_target: t.price_target,
          price_target_prior: t.price_target_prior,
          reported_date: t.reported_date,
          source: 'financialdatasets.ai',
          updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('price_targets')
          .upsert(targetRows, { onConflict: 'ticker,analyst_company,reported_date' })

        if (!error) targetsCreated = targetRows.length
      }

      return NextResponse.json({
        success: true,
        ticker: ticker.toUpperCase(),
        estimatesCreated,
        targetsCreated,
        duration: Date.now() - startTime
      })
    }

    // Batch sync all tickers
    const tickersToSync = ALL_TICKERS.slice(offset, offset + limit)
    let totalEstimates = 0
    let totalTargets = 0

    for (const t of tickersToSync) {
      try {
        const estimates = mode !== 'targets' ? await fetchAnalystEstimates(t) : []
        const targets = mode !== 'estimates' ? await fetchPriceTargets(t) : []

        let estCount = 0
        let tgtCount = 0

        if (estimates.length > 0) {
          const rows = estimates.map(e => ({
            ticker: e.ticker,
            fiscal_period: e.fiscal_period,
            period: e.period || 'quarterly',
            eps_estimate: e.eps_estimate,
            eps_actual: e.eps_actual,
            eps_surprise: e.eps_surprise,
            eps_surprise_percent: e.eps_surprise_percent,
            revenue_estimate: e.revenue_estimate,
            revenue_actual: e.revenue_actual,
            revenue_surprise: e.revenue_surprise,
            revenue_surprise_percent: e.revenue_surprise_percent,
            num_analysts: e.num_analysts,
            source: 'financialdatasets.ai',
            updated_at: new Date().toISOString()
          }))

          const { error } = await supabase
            .from('analyst_estimates')
            .upsert(rows, { onConflict: 'ticker,fiscal_period,period' })

          if (!error) estCount = rows.length
        }

        if (targets.length > 0) {
          const rows = targets.map(tgt => ({
            ticker: tgt.ticker,
            analyst_name: tgt.analyst_name,
            analyst_company: tgt.analyst_company,
            rating: tgt.rating,
            price_target: tgt.price_target,
            reported_date: tgt.reported_date,
            source: 'financialdatasets.ai',
            updated_at: new Date().toISOString()
          }))

          const { error } = await supabase
            .from('price_targets')
            .upsert(rows, { onConflict: 'ticker,analyst_company,reported_date' })

          if (!error) tgtCount = rows.length
        }

        totalEstimates += estCount
        totalTargets += tgtCount

        results.push({
          ticker: t,
          estimatesCreated: estCount,
          targetsCreated: tgtCount
        })

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (err) {
        results.push({
          ticker: t,
          estimatesCreated: 0,
          targetsCreated: 0,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Log sync result
    await supabase.from('cron_job_log').insert({
      job_name: 'sync-analyst-estimates',
      status: 'completed',
      details: {
        tickersProcessed: tickersToSync.length,
        totalEstimates,
        totalTargets,
        mode,
        offset,
        limit
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        tickersProcessed: tickersToSync.length,
        totalEstimatesCreated: totalEstimates,
        totalTargetsCreated: totalTargets,
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
    console.error('Analyst estimates sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
