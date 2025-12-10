import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/financials/segmented-revenues

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

    // Group by report_period
    const byPeriod = (data || []).reduce((acc, row) => {
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

    const segmentedRevenues = Object.values(byPeriod).slice(0, limit)

    return NextResponse.json({ segmented_revenues: segmentedRevenues })
  } catch (error) {
    console.error('Segmented revenues API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
