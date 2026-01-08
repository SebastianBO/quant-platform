import { NextRequest, NextResponse } from 'next/server'
import { syncCompanyFinancials } from '@/lib/sec-edgar'
import { createClient } from '@supabase/supabase-js'

// Cron endpoint for automated financial data sync
// Can be called by Vercel Cron or external scheduler
// Syncs data from SEC EDGAR for all tracked companies

const SEC_COMPANY_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json'
const SEC_USER_AGENT = 'Lician contact@lician.com'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

interface SECCompanyTicker {
  cik_str: number
  ticker: string
  title: string
}

// Fetch all company tickers from SEC
async function fetchAllCompanyTickers(): Promise<SECCompanyTicker[]> {
  const response = await fetch(SEC_COMPANY_TICKERS_URL, {
    headers: { 'User-Agent': SEC_USER_AGENT }
  })
  if (!response.ok) throw new Error('Failed to fetch SEC company tickers')
  const data = await response.json()
  return Object.values(data) as SECCompanyTicker[]
}

// Top tickers by priority - Mega caps + high search volume stocks
const PRIORITY_TICKERS = [
  // Magnificent 7 + Tech giants
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'AMD', 'INTC', 'CSCO', 'QCOM',
  'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA',
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY',
  // Consumer
  'WMT', 'COST', 'HD', 'MCD', 'SBUX', 'NKE', 'TGT', 'LOW', 'TJX', 'BKNG',
  'DIS', 'NFLX', 'CMCSA', 'PG', 'KO', 'PEP',
  // Energy & Industrial
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'CAT', 'DE', 'BA', 'HON', 'UPS', 'RTX', 'GE', 'LMT',
  // Meme stocks (very high search volume)
  'GME', 'AMC', 'BB', 'NOK', 'PLTR', 'SOFI', 'LCID', 'RIVN', 'NIO',
  'HOOD', 'COIN', 'MARA', 'RIOT', 'CLSK',
  // AI hype stocks
  'SMCI', 'ARM', 'SNOW', 'PATH', 'DDOG', 'NET', 'CRWD', 'ZS',
  // EV & Clean Energy
  'XPEV', 'LI', 'F', 'GM', 'ENPH', 'SEDG', 'FSLR',
  // Biotech popular
  'MRNA', 'BNTX', 'REGN', 'VRTX', 'GILD', 'BIIB', 'ILMN',
  // Other large caps
  'BRK-A', 'BRK-B', 'NEE', 'ACN', 'IBM', 'INTU', 'AMGN', 'ISRG', 'ADP',
  'MDLZ', 'ADI', 'MMC', 'SYK', 'CVS', 'CI', 'PGR', 'PANW', 'CME',
  'ETN', 'SO', 'FI', 'APD', 'CL', 'MCO', 'NOC', 'DUK', 'ICE', 'AON', 'WM', 'ITW',
  'PYPL', 'SQ', 'MSTR', 'UBER', 'ABNB', 'DASH', 'RBLX', 'U', 'TTWO', 'EA',
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('mode') || 'priority' // priority, all, recent
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Verify cron secret if configured
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()
    const results: Array<{ ticker: string; success: boolean; items: number; error?: string }> = []

    let tickersToSync: Array<{ ticker: string; cik: string }> = []

    if (mode === 'priority') {
      // Sync priority tickers first
      const allTickers = await fetchAllCompanyTickers()
      const tickerMap = new Map(allTickers.map(t => [t.ticker, t.cik_str.toString().padStart(10, '0')]))

      tickersToSync = PRIORITY_TICKERS
        .slice(offset, offset + limit)
        .filter(ticker => tickerMap.has(ticker))
        .map(ticker => ({ ticker, cik: tickerMap.get(ticker)! }))
    } else if (mode === 'all') {
      // Sync all companies (paginated)
      const allTickers = await fetchAllCompanyTickers()
      tickersToSync = allTickers
        .slice(offset, offset + limit)
        .map(t => ({
          ticker: t.ticker,
          cik: t.cik_str.toString().padStart(10, '0')
        }))
    } else if (mode === 'recent') {
      // Sync companies that haven't been updated recently
      const { data: staleCompanies } = await getSupabase()
        .from('income_statements')
        .select('ticker, cik')
        .order('updated_at', { ascending: true })
        .limit(limit)

      if (staleCompanies) {
        tickersToSync = staleCompanies.map((c: { ticker: string; cik: string }) => ({
          ticker: c.ticker,
          cik: c.cik
        }))
      }
    } else if (mode === 'continue') {
      // Continue syncing from where we left off
      // Get the list of all tickers we already have
      const { data: existingTickers } = await getSupabase()
        .from('income_statements')
        .select('ticker')
        .limit(100000)

      const existingSet = new Set((existingTickers || []).map((t: { ticker: string }) => t.ticker))

      // Get all tickers from SEC
      const allTickers = await fetchAllCompanyTickers()

      // Find tickers we haven't synced yet
      const missingTickers = allTickers
        .filter(t => !existingSet.has(t.ticker))
        .slice(0, limit)
        .map(t => ({
          ticker: t.ticker,
          cik: t.cik_str.toString().padStart(10, '0')
        }))

      tickersToSync = missingTickers
    }

    // Sync each company with rate limiting
    for (const company of tickersToSync) {
      try {
        const result = await syncCompanyFinancials(company.cik, company.ticker)
        results.push({
          ticker: company.ticker,
          success: result.success,
          items: result.itemsCreated + result.itemsUpdated,
          error: result.errors.length > 0 ? result.errors[0] : undefined
        })
      } catch (error) {
        results.push({
          ticker: company.ticker,
          success: false,
          items: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Rate limit: 100ms between requests (10/sec, SEC allows 10/sec)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const duration = Date.now() - startTime
    const successCount = results.filter(r => r.success).length
    const totalItems = results.reduce((sum, r) => sum + r.items, 0)

    return NextResponse.json({
      success: true,
      mode,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        itemsSynced: totalItems,
        durationMs: duration,
        avgPerTicker: Math.round(duration / results.length),
      },
      pagination: {
        offset,
        limit,
        hasMore: mode === 'continue' ? tickersToSync.length === limit : (mode === 'all' || mode === 'priority' ? offset + limit < (mode === 'priority' ? PRIORITY_TICKERS.length : 10196) : false),
        nextOffset: offset + limit,
        remaining: mode === 'continue' ? 'auto-continues until all synced' : undefined,
      },
      results,
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 })
  }
}

// POST for manual trigger with specific tickers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers } = body

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: 'tickers array is required' }, { status: 400 })
    }

    // Fetch CIK mapping
    const allTickers = await fetchAllCompanyTickers()
    const tickerMap = new Map(allTickers.map(t => [t.ticker, t.cik_str.toString().padStart(10, '0')]))

    const results: Array<{ ticker: string; success: boolean; items: number; error?: string }> = []

    for (const ticker of tickers.slice(0, 50)) { // Max 50 at a time
      const cik = tickerMap.get(ticker.toUpperCase())
      if (!cik) {
        results.push({ ticker, success: false, items: 0, error: 'CIK not found' })
        continue
      }

      try {
        const result = await syncCompanyFinancials(cik, ticker.toUpperCase())
        results.push({
          ticker: ticker.toUpperCase(),
          success: result.success,
          items: result.itemsCreated + result.itemsUpdated,
        })
      } catch (error) {
        results.push({
          ticker: ticker.toUpperCase(),
          success: false,
          items: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        itemsSynced: results.reduce((sum, r) => sum + r.items, 0),
      }
    })
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 })
  }
}
