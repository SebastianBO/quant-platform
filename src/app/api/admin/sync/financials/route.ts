import { NextRequest, NextResponse } from 'next/server'
import { syncCompanyFinancials, sync13FHoldings, syncInsiderTrades, syncTicker } from '@/lib/sec-edgar'

// Admin endpoint to trigger data sync from SEC EDGAR
// Protected by admin auth in production

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ticker, cik, limit } = body

    if (!type) {
      return NextResponse.json({ error: 'type parameter is required' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'financials':
        if (!cik && !ticker) {
          return NextResponse.json({ error: 'cik or ticker is required for financials sync' }, { status: 400 })
        }
        result = await syncCompanyFinancials(cik || '', ticker)
        break

      case '13f':
        if (!cik) {
          return NextResponse.json({ error: 'cik is required for 13F sync' }, { status: 400 })
        }
        result = await sync13FHoldings(cik, { limit })
        break

      case 'insider':
        if (!cik && !ticker) {
          return NextResponse.json({ error: 'cik or ticker is required for insider trades sync' }, { status: 400 })
        }
        result = await syncInsiderTrades(cik || '', ticker, { limit })
        break

      case 'all':
        if (!ticker) {
          return NextResponse.json({ error: 'ticker is required for full sync' }, { status: 400 })
        }
        const { financials, insiderTrades } = await syncTicker(ticker)
        result = {
          financials,
          insiderTrades,
          combined: {
            success: financials.success && insiderTrades.success,
            itemsProcessed: financials.itemsProcessed + insiderTrades.itemsProcessed,
            itemsCreated: financials.itemsCreated + insiderTrades.itemsCreated,
            errors: [...financials.errors, ...insiderTrades.errors],
            duration: financials.duration + insiderTrades.duration,
          }
        }
        break

      default:
        return NextResponse.json({ error: `Unknown sync type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      result,
    })
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 })
  }
}

// GET to check sync status / recent syncs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'all'

  // Return recent sync logs
  // This would query the sync log tables
  return NextResponse.json({
    message: 'Sync status endpoint',
    supportedTypes: ['financials', '13f', 'insider', 'all'],
    example: {
      method: 'POST',
      body: {
        type: 'financials',
        ticker: 'AAPL',
        cik: '320193',
      }
    }
  })
}
