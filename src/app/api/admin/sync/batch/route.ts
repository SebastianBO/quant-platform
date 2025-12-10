import { NextRequest, NextResponse } from 'next/server'
import { syncCompanyFinancials, sync13FHoldings, syncTopInstitutions } from '@/lib/sec-edgar'

// Admin endpoint for batch data sync operations
// Used for initial data population and scheduled updates

// Top 100 tickers to sync (by market cap / importance)
const TOP_TICKERS = [
  { ticker: 'AAPL', cik: '320193' },
  { ticker: 'MSFT', cik: '789019' },
  { ticker: 'GOOGL', cik: '1652044' },
  { ticker: 'AMZN', cik: '1018724' },
  { ticker: 'NVDA', cik: '1045810' },
  { ticker: 'TSLA', cik: '1318605' },
  { ticker: 'META', cik: '1326801' },
  { ticker: 'BRK.B', cik: '1067983' },
  { ticker: 'JPM', cik: '19617' },
  { ticker: 'V', cik: '1403161' },
  { ticker: 'UNH', cik: '731766' },
  { ticker: 'JNJ', cik: '200406' },
  { ticker: 'WMT', cik: '104169' },
  { ticker: 'XOM', cik: '34088' },
  { ticker: 'MA', cik: '1141391' },
  { ticker: 'PG', cik: '80424' },
  { ticker: 'HD', cik: '354950' },
  { ticker: 'CVX', cik: '93410' },
  { ticker: 'LLY', cik: '59478' },
  { ticker: 'MRK', cik: '310158' },
  { ticker: 'ABBV', cik: '1551152' },
  { ticker: 'KO', cik: '21344' },
  { ticker: 'PEP', cik: '77476' },
  { ticker: 'COST', cik: '909832' },
  { ticker: 'AVGO', cik: '1441634' },
  { ticker: 'BAC', cik: '70858' },
  { ticker: 'MCD', cik: '63908' },
  { ticker: 'TMO', cik: '97745' },
  { ticker: 'CSCO', cik: '858877' },
  { ticker: 'ABT', cik: '1800' },
]

// Top institutional investors to sync
const TOP_INVESTORS = [
  { cik: '102909', name: 'Vanguard' },
  { cik: '1364742', name: 'BlackRock' },
  { cik: '93751', name: 'State Street' },
  { cik: '315066', name: 'Fidelity' },
  { cik: '1067983', name: 'Berkshire Hathaway' },
  { cik: '19617', name: 'JPMorgan' },
  { cik: '895421', name: 'Morgan Stanley' },
  { cik: '886982', name: 'Goldman Sachs' },
  { cik: '1423053', name: 'Citadel' },
  { cik: '1350694', name: 'Bridgewater' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, limit = 10, dryRun = false } = body

    if (!type) {
      return NextResponse.json({ error: 'type parameter is required' }, { status: 400 })
    }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        type,
        willProcess: type === 'financials'
          ? TOP_TICKERS.slice(0, limit)
          : type === '13f'
          ? TOP_INVESTORS.slice(0, limit)
          : [],
      })
    }

    const results: Array<{ target: string; result: unknown }> = []
    let successCount = 0
    let errorCount = 0

    switch (type) {
      case 'financials':
        // Sync financial statements for top tickers
        for (const company of TOP_TICKERS.slice(0, limit)) {
          console.log(`Syncing financials for ${company.ticker}...`)
          const result = await syncCompanyFinancials(company.cik, company.ticker)
          results.push({ target: company.ticker, result })
          if (result.success) successCount++
          else errorCount++

          // Rate limit: 1 second between companies
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        break

      case '13f':
        // Sync 13F holdings for top investors
        for (const investor of TOP_INVESTORS.slice(0, limit)) {
          console.log(`Syncing 13F for ${investor.name}...`)
          const result = await sync13FHoldings(investor.cik)
          results.push({ target: investor.name, result })
          if (result.success) successCount++
          else errorCount++

          // Rate limit: 2 seconds between investors (more data)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        break

      case 'top-institutions':
        // Use the built-in batch function
        const institutionResults = await syncTopInstitutions(limit)
        return NextResponse.json({
          success: true,
          type,
          results: institutionResults,
          summary: {
            total: institutionResults.length,
            successful: institutionResults.filter(r => r.success).length,
            failed: institutionResults.filter(r => !r.success).length,
          }
        })

      default:
        return NextResponse.json({ error: `Unknown batch type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      summary: {
        total: results.length,
        successful: successCount,
        failed: errorCount,
      },
      results,
    })
  } catch (error) {
    console.error('Batch sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Batch sync failed',
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Batch sync endpoint',
    supportedTypes: ['financials', '13f', 'top-institutions'],
    availableTickers: TOP_TICKERS.map(t => t.ticker),
    availableInvestors: TOP_INVESTORS.map(i => i.name),
    example: {
      method: 'POST',
      body: {
        type: 'financials',
        limit: 5,
        dryRun: true,
      }
    }
  })
}
