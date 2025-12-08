import { NextRequest, NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://eodhd.com/api/news?s=${ticker}.US&api_token=${EODHD_API_KEY}&fmt=json&limit=15`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    )

    if (!response.ok) {
      throw new Error(`EODHD API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ news: data })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ error: 'Failed to fetch news', news: [] }, { status: 500 })
  }
}
