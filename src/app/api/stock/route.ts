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
    // Fetch ALL available data in parallel
    const [
      snapshot,
      incomeStatements,
      balanceSheets,
      cashFlows,
      metrics,
      allMetrics,
      insiderTrades,
      analystEstimates,
      segmentedRevenues,
      companyFacts,
      quarterlyIncome,
      quarterlyBalance,
      quarterlyCashFlow
    ] = await Promise.all([
      fetchFD('/prices/snapshot/', { ticker }),
      fetchFD('/financials/income-statements/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financials/balance-sheets/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financials/cash-flow-statements/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/financial-metrics/', { ticker, period: 'annual', limit: '1' }),
      fetchFD('/financial-metrics/', { ticker, period: 'annual', limit: '5' }),
      fetchFD('/insider-trades/', { ticker, limit: '20' }),
      fetchFD('/analyst-estimates/', { ticker, limit: '8' }),
      fetchFD('/financials/segmented-revenues/', { ticker, period: 'annual', limit: '3' }).catch(() => ({ segmented_revenues: [] })),
      fetchFD('/company/facts/', { ticker }).catch(() => ({ company_facts: null })),
      fetchFD('/financials/income-statements/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ income_statements: [] })),
      fetchFD('/financials/balance-sheets/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ balance_sheets: [] })),
      fetchFD('/financials/cash-flow-statements/', { ticker, period: 'quarterly', limit: '8' }).catch(() => ({ cash_flow_statements: [] })),
    ])

    // Parse segmented revenues - extract product segments and geographic segments
    const latestSegmented = segmentedRevenues?.segmented_revenues?.[0]
    const segments: { name: string; revenue: number; type: string }[] = []
    const productSegments: { name: string; revenue: number }[] = []
    const geoSegments: { name: string; revenue: number }[] = []

    if (latestSegmented?.items) {
      latestSegmented.items.forEach((item: any) => {
        const segmentInfo = item.segments?.[0]
        if (segmentInfo && item.amount > 0) {
          const label = segmentInfo.label || segmentInfo.key
          const type = segmentInfo.type || 'Unknown'

          // Categorize by type
          if (type === 'Product or Service' && !['Product', 'Service'].includes(label)) {
            productSegments.push({ name: label, revenue: item.amount })
          } else if (type === 'Statement Geographical' || type === 'Statement Business Segments') {
            geoSegments.push({ name: label, revenue: item.amount })
          }

          segments.push({ name: label, revenue: item.amount, type })
        }
      })
    }

    // Fallback: if no segments, create synthetic ones from income statement
    if (productSegments.length === 0 && incomeStatements.income_statements?.[0]) {
      const is = incomeStatements.income_statements[0]
      if (is.revenue) {
        productSegments.push({ name: 'Total Revenue', revenue: is.revenue })
      }
    }

    return NextResponse.json({
      snapshot: snapshot.snapshot,
      companyFacts: companyFacts?.company_facts || null,
      // Annual statements
      incomeStatements: incomeStatements.income_statements || [],
      balanceSheets: balanceSheets.balance_sheets || [],
      cashFlows: cashFlows.cash_flow_statements || [],
      // Quarterly statements
      quarterlyIncome: quarterlyIncome.income_statements || [],
      quarterlyBalance: quarterlyBalance.balance_sheets || [],
      quarterlyCashFlow: quarterlyCashFlow.cash_flow_statements || [],
      // Metrics
      metrics: metrics.financial_metrics?.[0] || {},
      metricsHistory: allMetrics.financial_metrics || [],
      // Other data
      insiderTrades: insiderTrades.insider_trades || [],
      analystEstimates: analystEstimates.analyst_estimates || [],
      // Segmented data
      segments: productSegments,
      allSegments: segments,
      productSegments,
      geoSegments,
      rawSegmentedRevenues: segmentedRevenues?.segmented_revenues || [],
    })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
