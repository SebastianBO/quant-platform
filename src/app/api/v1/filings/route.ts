import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/filings

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
  const filingType = searchParams.get('filing_type')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('sec_filings')
      .select('*')
      .order('filing_date', { ascending: false })
      .limit(limit)

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase())
    }
    if (cik) {
      query = query.eq('cik', cik)
    }
    if (filingType) {
      query = query.eq('filing_type', filingType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Filings query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const filings = (data || []).map(row => ({
      cik: row.cik,
      accession_number: row.accession_number,
      filing_type: row.filing_type,
      report_date: row.report_date,
      ticker: row.ticker,
      url: row.filing_url,
    }))

    return NextResponse.json({ filings })
  } catch (error) {
    console.error('Filings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
