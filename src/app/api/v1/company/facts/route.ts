import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/company/facts

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

  if (!ticker && !cik) {
    return NextResponse.json({
      error: 'Either ticker or cik parameter is required',
    }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('companies')
      .select('*')

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase())
    }
    if (cik) {
      query = query.eq('cik', cik)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Company facts query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      company: {
        cik: data.cik,
        ticker: data.ticker,
        name: data.name,
        sic_code: data.sic_code,
        sic_description: data.sic_description,
        exchange: data.exchange,
        fiscal_year_end: data.fiscal_year_end,
        is_active: data.is_active,
      }
    })
  } catch (error) {
    console.error('Company facts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
