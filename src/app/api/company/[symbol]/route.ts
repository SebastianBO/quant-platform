import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: Promise<{ symbol: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const { symbol } = await params
  const upperSymbol = symbol.toUpperCase()

  try {
    // First try to get from company_fundamentals
    const { data: fundamentals } = await supabase
      .from('company_fundamentals')
      .select('*')
      .eq('ticker', upperSymbol)
      .order('report_period', { ascending: false })
      .limit(1)
      .single()

    if (fundamentals) {
      return NextResponse.json({
        symbol: upperSymbol,
        name: fundamentals.company_name || upperSymbol,
        sector: fundamentals.sector,
        industry: fundamentals.industry,
        marketCap: fundamentals.market_cap,
        peRatio: fundamentals.pe_ratio,
        eps: fundamentals.eps_diluted,
        price: fundamentals.price,
        yearHigh: fundamentals.year_high,
        yearLow: fundamentals.year_low,
        employees: fundamentals.employees,
        description: fundamentals.description,
        exchange: fundamentals.exchange,
        currency: fundamentals.currency,
      })
    }

    // Fallback: Try stock_prices_snapshot for basic data
    const { data: snapshot } = await supabase
      .from('stock_prices_snapshot')
      .select('*')
      .eq('ticker', upperSymbol)
      .single()

    if (snapshot) {
      return NextResponse.json({
        symbol: upperSymbol,
        name: snapshot.name || upperSymbol,
        price: snapshot.price,
        marketCap: snapshot.market_cap,
        change: snapshot.change,
        changePercent: snapshot.change_percent,
        volume: snapshot.volume,
      })
    }

    // Fallback: Fetch from Yahoo Finance
    const yahooData = await fetchYahooProfile(upperSymbol)
    if (yahooData) {
      return NextResponse.json(yahooData)
    }

    return NextResponse.json(
      { error: 'Company not found', symbol: upperSymbol },
      { status: 404 }
    )

  } catch (error) {
    console.error('Company API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
}

async function fetchYahooProfile(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const result = data.chart?.result?.[0]
    const meta = result?.meta

    if (!meta) return null

    return {
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      marketCap: meta.marketCap,
      volume: meta.regularMarketVolume,
      yearHigh: meta.fiftyTwoWeekHigh,
      yearLow: meta.fiftyTwoWeekLow,
      exchange: meta.exchangeName,
      currency: meta.currency,
    }
  } catch {
    return null
  }
}
