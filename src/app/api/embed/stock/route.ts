import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Embeddable Stock Widget API
// Returns stock data with full CORS support for embedding anywhere

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const callback = searchParams.get('callback') // JSONP support

  if (!ticker) {
    const response = { error: 'ticker parameter is required' }
    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify(response)})`, {
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      })
    }
    return NextResponse.json(response, { status: 400, headers: corsHeaders })
  }

  try {
    // Get price data
    const { data: priceData } = await getSupabase()
      .from('stock_prices_snapshot')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .single()

    // Get company info
    const { data: companyData } = await getSupabase()
      .from('company_fundamentals')
      .select('name, sector, industry, market_cap')
      .eq('ticker', ticker.toUpperCase())
      .order('report_period', { ascending: false })
      .limit(1)
      .single()

    if (!priceData) {
      const response = { error: 'Ticker not found' }
      if (callback) {
        return new NextResponse(`${callback}(${JSON.stringify(response)})`, {
          headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
        })
      }
      return NextResponse.json(response, { status: 404, headers: corsHeaders })
    }

    const response = {
      ticker: priceData.ticker,
      name: companyData?.name || priceData.ticker,
      price: priceData.close || priceData.price,
      change: priceData.change || priceData.day_change,
      changePercent: priceData.change_percent || priceData.day_change_percent,
      volume: priceData.volume,
      marketCap: companyData?.market_cap || priceData.market_cap,
      sector: companyData?.sector,
      updatedAt: priceData.updated_at,
      source: 'lician.com',
      attribution: {
        text: 'Powered by Lician',
        url: 'https://lician.com',
        required: true,
      },
    }

    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify(response)})`, {
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      })
    }

    return NextResponse.json(response, { headers: corsHeaders })
  } catch (error) {
    console.error('Embed API error:', error)
    const response = { error: 'Internal server error' }
    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify(response)})`, {
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
      })
    }
    return NextResponse.json(response, { status: 500, headers: corsHeaders })
  }
}
