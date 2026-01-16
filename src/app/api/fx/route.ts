import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY

// Cache FX rates for 5 minutes
let fxCache: { rates: Record<string, number>; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Common currency pairs we need (all relative to USD)
const CURRENCY_PAIRS = ['EUR', 'SEK', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NOK', 'DKK', 'NZD', 'HKD', 'SGD', 'CNY', 'INR']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USD'
    const to = searchParams.get('to')

    // Check cache
    if (fxCache && Date.now() - fxCache.timestamp < CACHE_DURATION) {
      if (to) {
        const rate = getRate(fxCache.rates, from, to)
        return NextResponse.json({ from, to, rate, cached: true })
      }
      return NextResponse.json({ rates: fxCache.rates, cached: true })
    }

    // Fetch fresh rates from EODHD
    // EODHD format: {CURRENCY}.FOREX returns that currency vs USD
    // e.g., EUR.FOREX close=0.86 means 1 EUR = 0.86 USD (so USD/EUR = 1/0.86 = 1.16)
    const rates: Record<string, number> = { USD: 1 }

    // Fetch each currency vs USD
    const promises = CURRENCY_PAIRS.map(async (currency) => {
      try {
        // Use the correct EODHD forex format: {CURRENCY}.FOREX
        const response = await fetch(
          `https://eodhd.com/api/real-time/${currency}.FOREX?api_token=${EODHD_API_KEY}&fmt=json`,
          { next: { revalidate: 300 } } // Cache for 5 minutes
        )

        if (response.ok) {
          const data = await response.json()
          // EODHD {CURRENCY}.FOREX returns USD/{CURRENCY} rate directly
          // e.g., EUR.FOREX close=0.86 means 1 USD = 0.86 EUR
          // e.g., SEK.FOREX close=9.39 means 1 USD = 9.39 SEK
          // e.g., JPY.FOREX close=149.5 means 1 USD = 149.5 JPY
          if (data && data.close && data.close > 0) {
            rates[currency] = parseFloat(data.close)
          }
        } else {
          logger.info('FX API response', { currency, status: response.status })
        }
      } catch (error) {
        logger.error('Error fetching currency rate', { currency, error: error instanceof Error ? error.message : 'Unknown' })
      }
    })

    await Promise.all(promises)
    logger.info('FX rates fetched', { count: Object.keys(rates).length })

    // Update cache
    fxCache = { rates, timestamp: Date.now() }

    if (to) {
      const rate = getRate(rates, from, to)
      return NextResponse.json({ from, to, rate, cached: false })
    }

    return NextResponse.json({ rates, cached: false })
  } catch (error) {
    logger.error('FX API error', { error: error instanceof Error ? error.message : 'Unknown' })
    // Return fallback rates on error
    return NextResponse.json({
      rates: getFallbackRates(),
      error: 'Using fallback rates',
      cached: false
    })
  }
}

function getRate(rates: Record<string, number>, from: string, to: string): number {
  if (from === to) return 1

  // Direct conversion from USD
  if (from === 'USD' && rates[to]) {
    return rates[to]
  }

  // Direct conversion to USD
  if (to === 'USD' && rates[from]) {
    return 1 / rates[from]
  }

  // Cross conversion through USD
  if (rates[from] && rates[to]) {
    return rates[to] / rates[from]
  }

  // Fallback
  return 1
}

function getFallbackRates(): Record<string, number> {
  return {
    USD: 1,
    EUR: 0.92,
    SEK: 10.85,
    GBP: 0.79,
    JPY: 149.50,
    CHF: 0.88,
    CAD: 1.36,
    AUD: 1.52,
    NOK: 10.67,
    DKK: 6.87,
    NZD: 1.64,
    HKD: 7.82,
    SGD: 1.34,
    CNY: 7.26,
    INR: 83.42,
  }
}
