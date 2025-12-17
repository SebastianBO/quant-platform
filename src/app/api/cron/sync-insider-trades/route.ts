import { NextRequest, NextResponse } from 'next/server'
import { syncInsiderTrades } from '@/lib/sec-edgar'
import { createClient } from '@supabase/supabase-js'

// Sync insider trades (Form 4) from SEC EDGAR
// Runs daily on weekdays at 3:00 PM UTC

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Priority tickers to sync insider trades for
const PRIORITY_TICKERS = [
  // Mega caps
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
  // Large caps - Tech
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX', 'AVGO', 'QCOM',
  // Large caps - Finance
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK',
  // Large caps - Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT',
  // Large caps - Consumer
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE',
  // Popular retail
  'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'HOOD', 'COIN',
]

// CIK mappings for priority tickers (SEC uses CIK not ticker)
const TICKER_TO_CIK: Record<string, string> = {
  'AAPL': '320193',
  'MSFT': '789019',
  'GOOGL': '1652044',
  'AMZN': '1018724',
  'NVDA': '1045810',
  'META': '1326801',
  'TSLA': '1318605',
  'BRK-B': '1067983',
  'BRK-A': '1067983',
  'AMD': '2488',
  'INTC': '50863',
  'CRM': '1108524',
  'ORCL': '1341439',
  'ADBE': '796343',
  'NFLX': '1065280',
  'AVGO': '1441634',
  'QCOM': '804328',
  'JPM': '19617',
  'V': '1403161',
  'MA': '1141391',
  'BAC': '70858',
  'WFC': '72971',
  'GS': '886982',
  'MS': '895421',
  'BLK': '1364742',
  'UNH': '731766',
  'JNJ': '200406',
  'LLY': '59478',
  'PFE': '78003',
  'MRK': '310158',
  'ABBV': '1551152',
  'TMO': '97745',
  'ABT': '1800',
  'WMT': '104169',
  'PG': '80424',
  'KO': '21344',
  'PEP': '77476',
  'COST': '909832',
  'HD': '354950',
  'MCD': '63908',
  'NKE': '320187',
  'GME': '1326380',
  'AMC': '1411579',
  'PLTR': '1321655',
  'SOFI': '1818874',
  'RIVN': '1874178',
  'LCID': '1811210',
  'HOOD': '1783879',
  'COIN': '1679788',
}

export async function GET(request: NextRequest) {
  // Check for cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Insider trades sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '20') // Number of tickers to process
  const filingLimit = parseInt(searchParams.get('filings') || '30') // Form 4s per company
  const forceRefresh = searchParams.get('force') === 'true' // Force reprocess existing filings

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const results: Array<{
      ticker: string
      success: boolean
      tradesCreated: number
      error?: string
    }> = []

    // If specific ticker requested, sync just that one
    if (ticker) {
      const cik = TICKER_TO_CIK[ticker.toUpperCase()]
      if (!cik) {
        // Try to look up CIK from database
        const { data: tickerData } = await supabase
          .from('ticker_cik_mapping')
          .select('cik')
          .eq('ticker', ticker.toUpperCase())
          .single()

        if (!tickerData?.cik) {
          return NextResponse.json({ error: `Unknown ticker: ${ticker}` }, { status: 400 })
        }

        const result = await syncInsiderTrades(tickerData.cik, ticker.toUpperCase(), { limit: filingLimit, forceRefresh })
        return NextResponse.json({
          success: result.success,
          ticker: ticker.toUpperCase(),
          tradesCreated: result.itemsCreated,
          filingsProcessed: result.itemsProcessed,
          errors: result.errors,
          duration: result.duration,
        })
      }

      const result = await syncInsiderTrades(cik, ticker.toUpperCase(), { limit: filingLimit, forceRefresh })
      return NextResponse.json({
        success: result.success,
        ticker: ticker.toUpperCase(),
        tradesCreated: result.itemsCreated,
        filingsProcessed: result.itemsProcessed,
        errors: result.errors,
        duration: result.duration,
      })
    }

    // Otherwise, sync priority tickers
    const tickersToSync = PRIORITY_TICKERS.slice(0, limit)
    let totalTradesCreated = 0
    let totalFilingsProcessed = 0

    for (const t of tickersToSync) {
      const cik = TICKER_TO_CIK[t]
      if (!cik) {
        results.push({ ticker: t, success: false, tradesCreated: 0, error: 'No CIK mapping' })
        continue
      }

      try {
        const result = await syncInsiderTrades(cik, t, { limit: filingLimit, forceRefresh })
        totalTradesCreated += result.itemsCreated
        totalFilingsProcessed += result.itemsProcessed

        results.push({
          ticker: t,
          success: result.success,
          tradesCreated: result.itemsCreated,
          error: result.errors.length > 0 ? result.errors[0] : undefined,
        })

        // Rate limit: wait between companies
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        results.push({
          ticker: t,
          success: false,
          tradesCreated: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    // Log sync result
    await supabase.from('cron_job_log').insert({
      job_name: 'sync-insider-trades',
      status: 'completed',
      details: {
        tickersProcessed: tickersToSync.length,
        totalTradesCreated,
        totalFilingsProcessed,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length,
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        tickersProcessed: tickersToSync.length,
        totalTradesCreated,
        totalFilingsProcessed,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length,
      },
      results,
    })
  } catch (error) {
    console.error('Insider trades sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
