import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/segmented-revenues
// Falls back to Financial Datasets API if Supabase has no data

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

// Fallback to Financial Datasets API
async function fetchFromFinancialDatasets(ticker: string, period: string, limit: number) {
  if (!FINANCIAL_DATASETS_API_KEY) return null

  try {
    const url = `https://api.financialdatasets.ai/financials/segmented-revenues?ticker=${ticker}&period=${period}&limit=${limit}`
    const response = await fetch(url, {
      headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.segmented_revenues || []
  } catch (error) {
    console.error('Financial Datasets API error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const cik = searchParams.get('cik')
  const period = searchParams.get('period') || 'quarterly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 100)

  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('segmented_revenues')
      .select('*')
      .eq('period', period)
      .order('report_period', { ascending: false })
      .limit(limit * 10) // Get more rows since there are multiple segments per period

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase())
    }
    if (cik) {
      query = query.eq('cik', cik)
    }

    const { data, error } = await query

    if (error) {
      console.error('Segmented revenues query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Check if we have local data
    let segmentedRevenues: unknown[] = []
    let dataSource = 'supabase'
    let dataTimestamp = new Date().toISOString()

    if (data && data.length > 0) {
      // Group by report_period
      const byPeriod = data.reduce((acc, row) => {
        const key = row.report_period
        if (!acc[key]) {
          acc[key] = {
            ticker: row.ticker,
            report_period: row.report_period,
            period: row.period,
            segments: [],
          }
        }
        acc[key].segments.push({
          segment_type: row.segment_type,
          segment_name: row.segment_name,
          revenue: row.revenue,
          revenue_percent: row.revenue_percent,
        })
        return acc
      }, {} as Record<string, unknown>)

      segmentedRevenues = Object.values(byPeriod).slice(0, limit)
      dataTimestamp = data[0]?.updated_at || dataTimestamp
    } else if (ticker) {
      // Fallback to Financial Datasets API
      const fallbackData = await fetchFromFinancialDatasets(ticker.toUpperCase(), period, limit)
      if (fallbackData && fallbackData.length > 0) {
        segmentedRevenues = fallbackData
        dataSource = 'financialdatasets.ai'
        dataTimestamp = new Date().toISOString()
      }
    }

    return NextResponse.json({
      segmented_revenues: segmentedRevenues,
      _meta: {
        source: dataSource,
        fetched_at: dataTimestamp,
        count: segmentedRevenues.length,
      }
    })
  } catch (error) {
    console.error('Segmented revenues API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
