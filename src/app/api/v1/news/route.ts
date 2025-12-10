import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/news

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
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)

  if (!ticker) {
    return NextResponse.json({
      error: 'ticker parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('company_news')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .order('date', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('News query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const news = (data || []).map(row => ({
      ticker: row.ticker,
      title: row.title,
      author: row.author,
      source: row.source,
      date: row.date,
      url: row.url,
      sentiment: row.sentiment,
    }))

    return NextResponse.json({ news })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
