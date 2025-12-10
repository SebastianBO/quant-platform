import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/analyst-estimates

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
  const period = searchParams.get('period') || 'quarterly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)

  if (!ticker) {
    return NextResponse.json({
      error: 'ticker parameter is required',
    }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabase()
      .from('analyst_estimates')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .eq('period', period)
      .order('fiscal_period', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Analyst estimates query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const estimates = (data || []).map(row => ({
      ticker: row.ticker,
      fiscal_period: row.fiscal_period,
      period: row.period,
      eps_estimate: row.eps_estimate,
      eps_actual: row.eps_actual,
      eps_surprise: row.eps_surprise,
      eps_surprise_percent: row.eps_surprise_percent,
      revenue_estimate: row.revenue_estimate,
      revenue_actual: row.revenue_actual,
      revenue_surprise: row.revenue_surprise,
      revenue_surprise_percent: row.revenue_surprise_percent,
      num_analysts: row.num_analysts,
    }))

    return NextResponse.json({ analyst_estimates: estimates })
  } catch (error) {
    console.error('Analyst estimates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
