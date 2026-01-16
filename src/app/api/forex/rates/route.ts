import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Free forex rates from multiple sources
// Primary: EODHD (we have API key), Fallback: Exchange Rate API

interface ForexRate {
  pair: string
  base: string
  quote: string
  rate: number
  change: number
  changePercent: number
  high: number
  low: number
  timestamp: number
  source: string
}

const MAJOR_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
  'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'
]

// EODHD forex endpoint (we have API key)
async function fetchEODHDForex(pairs: string[]): Promise<ForexRate[]> {
  const EODHD_KEY = process.env.EODHD_API_KEY
  if (!EODHD_KEY) return []

  const rates: ForexRate[] = []

  await Promise.all(
    pairs.map(async (pair) => {
      try {
        // EODHD format: EURUSD.FOREX
        const response = await fetch(
          `https://eodhd.com/api/real-time/${pair}.FOREX?api_token=${EODHD_KEY}&fmt=json`,
          { next: { revalidate: 60 } }
        )

        if (!response.ok) return

        const data = await response.json()

        rates.push({
          pair,
          base: pair.slice(0, 3),
          quote: pair.slice(3, 6),
          rate: parseFloat(data.close) || 0,
          change: parseFloat(data.change) || 0,
          changePercent: parseFloat(data.change_p) || 0,
          high: parseFloat(data.high) || 0,
          low: parseFloat(data.low) || 0,
          timestamp: data.timestamp * 1000 || Date.now(),
          source: 'eodhd',
        })
      } catch (error) {
        logger.error('EODHD forex error', { pair, error: error instanceof Error ? error.message : 'Unknown' })
      }
    })
  )

  return rates
}

// Free Exchange Rate API fallback
async function fetchExchangeRateAPI(pairs: string[]): Promise<ForexRate[]> {
  const rates: ForexRate[] = []

  // Group by base currency to minimize requests
  const baseGroups: Record<string, string[]> = {}
  for (const pair of pairs) {
    const base = pair.slice(0, 3)
    if (!baseGroups[base]) baseGroups[base] = []
    baseGroups[base].push(pair.slice(3, 6))
  }

  await Promise.all(
    Object.entries(baseGroups).map(async ([base, quotes]) => {
      try {
        const response = await fetch(
          `https://api.exchangerate.host/latest?base=${base}&symbols=${quotes.join(',')}`,
          { next: { revalidate: 300 } } // Cache 5 minutes (free tier limits)
        )

        if (!response.ok) return

        const data = await response.json()

        for (const quote of quotes) {
          const rate = data.rates?.[quote]
          if (rate) {
            rates.push({
              pair: `${base}${quote}`,
              base,
              quote,
              rate,
              change: 0, // Not available in free tier
              changePercent: 0,
              high: rate,
              low: rate,
              timestamp: Date.now(),
              source: 'exchangerate.host',
            })
          }
        }
      } catch (error) {
        logger.error('Exchange Rate API error', { base, error: error instanceof Error ? error.message : 'Unknown' })
      }
    })
  )

  return rates
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const pairsParam = searchParams.get('pairs')
  const source = searchParams.get('source')

  const pairs = pairsParam
    ? pairsParam.toUpperCase().split(',')
    : MAJOR_PAIRS

  try {
    let rates: ForexRate[] = []

    // Try EODHD first (better data)
    if (source !== 'exchangerate') {
      rates = await fetchEODHDForex(pairs)
    }

    // Fallback to Exchange Rate API
    if (rates.length === 0 || source === 'exchangerate') {
      rates = await fetchExchangeRateAPI(pairs)
    }

    // Sort by pair name
    rates.sort((a, b) => a.pair.localeCompare(b.pair))

    return NextResponse.json({
      rates,
      count: rates.length,
      timestamp: Date.now(),
      _meta: {
        sources: ['eodhd', 'exchangerate.host'],
        pairs: pairs,
      },
    })

  } catch (error) {
    logger.error('Forex API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Failed to fetch forex rates',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
