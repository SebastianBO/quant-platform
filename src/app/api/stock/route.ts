import { NextRequest, NextResponse } from 'next/server'

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

async function fetchFD(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Fetch all data in parallel
    const [
      snapshot,
      incomeStatements,
      balanceSheets,
      cashFlows,
      metrics,
      insiderTrades,
      analystEstimates
    ] = await Promise.all([
      fetchFD('/prices/snapshot/', { ticker }),
      fetchFD('/financials/income-statements/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financials/balance-sheets/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financials/cash-flow-statements/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financial-metrics/', { ticker, period: 'annual', limit: '3' }),
      fetchFD('/insider-trades/', { ticker, limit: '20' }),
      fetchFD('/analyst-estimates/', { ticker, limit: '5' }),
    ])

    return NextResponse.json({
      snapshot: snapshot.snapshot,
      incomeStatements: incomeStatements.income_statements || [],
      balanceSheets: balanceSheets.balance_sheets || [],
      cashFlows: cashFlows.cash_flow_statements || [],
      metrics: metrics.financial_metrics?.[0] || {},
      insiderTrades: insiderTrades.insider_trades || [],
      analystEstimates: analystEstimates.analyst_estimates || [],
    })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
