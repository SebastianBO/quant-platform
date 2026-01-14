import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Lazy-load Supabase client to avoid build-time errors
let supabaseClient: SupabaseClient | null = null
function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseClient
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '15')

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Strategy 1: Search Supabase company_fundamentals (141k+ companies)
    const { data: supabaseResults, error } = await getSupabase()
      .from('company_fundamentals')
      .select('ticker, company_name, sector, industry, market_cap, exchange')
      .or(`ticker.ilike.%${query}%,company_name.ilike.%${query}%,industry.ilike.%${query}%,sector.ilike.%${query}%`)
      .order('market_cap', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (!error && supabaseResults && supabaseResults.length > 0) {
      const results = supabaseResults.map(item => ({
        symbol: item.ticker,
        name: item.company_name || item.ticker,
        exchange: item.exchange || 'US',
        type: 'Stock',
        sector: item.sector,
        industry: item.industry,
        marketCap: item.market_cap,
        logoUrl: `https://logo.clearbit.com/${item.company_name?.toLowerCase().replace(/[^a-z]/g, '')}.com`
      }))
      return NextResponse.json({ results, source: 'supabase' })
    }

    // Strategy 2: Fallback to income_statements tickers
    const { data: tickerResults } = await getSupabase()
      .from('income_statements')
      .select('ticker')
      .ilike('ticker', `%${query}%`)
      .limit(limit)

    if (tickerResults && tickerResults.length > 0) {
      const uniqueTickers = [...new Set(tickerResults.map(r => r.ticker))]
      const results = uniqueTickers.slice(0, limit).map(ticker => ({
        symbol: ticker,
        name: ticker,
        exchange: 'US',
        type: 'Stock'
      }))
      return NextResponse.json({ results, source: 'income_statements' })
    }

    // Strategy 3: EODHD API fallback (only if Supabase returns nothing)
    if (EODHD_API_KEY) {
      const response = await fetch(
        `https://eodhistoricaldata.com/api/search/${encodeURIComponent(query)}?api_token=${EODHD_API_KEY}&limit=${limit}`,
        { next: { revalidate: 300 } }
      )

      if (response.ok) {
        const data = await response.json()
        const results = (data || [])
          .filter((item: { Code?: string; Exchange?: string }) => item.Code && item.Exchange)
          .map((item: { Code: string; Name?: string; Exchange: string; Type?: string; Currency?: string; ISIN?: string }) => ({
            symbol: item.Code,
            name: item.Name || item.Code,
            exchange: item.Exchange,
            type: item.Type || 'Stock',
            currency: item.Currency || 'USD',
            isin: item.ISIN,
            logoUrl: `https://eodhistoricaldata.com/img/logos/${item.Exchange}/${item.Code}.png`
          }))
          .slice(0, limit)
        return NextResponse.json({ results, source: 'eodhd' })
      }
    }

    return NextResponse.json({ results: [], error: 'No results found' })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' })
  }
}
