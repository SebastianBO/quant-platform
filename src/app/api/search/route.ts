import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = searchParams.get('limit') || '15'

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Use EODHD search API
    const response = await fetch(
      `https://eodhistoricaldata.com/api/search/${encodeURIComponent(query)}?api_token=${EODHD_API_KEY}&limit=${limit}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      console.error('EODHD search error:', response.status)
      return NextResponse.json({ results: [], error: 'Search failed' })
    }

    const data = await response.json()

    // Transform and filter results
    const results = (data || [])
      .filter((item: any) => item.Code && item.Exchange)
      .map((item: any) => ({
        symbol: item.Code,
        name: item.Name || item.Code,
        exchange: item.Exchange,
        type: item.Type || 'Stock',
        currency: item.Currency || 'USD',
        isin: item.ISIN,
        // Generate logo URL
        logoUrl: `https://eodhistoricaldata.com/img/logos/${item.Exchange}/${item.Code}.png`
      }))
      .slice(0, parseInt(limit))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' })
  }
}
