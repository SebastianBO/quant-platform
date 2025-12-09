import { NextResponse } from 'next/server'

/**
 * PROPRIETARY MOVER DETECTION SYSTEM
 *
 * Data source: Yahoo Finance (free, real-time, entire market)
 * Our value-add: Multi-signal scoring and filtering
 *
 * Why this is better than raw Yahoo data:
 * 1. Volume spike detection (unusual activity = opportunity)
 * 2. Liquidity filtering (only tradeable stocks)
 * 3. Signal tagging (why it's moving)
 * 4. Combined score for ranking
 */

interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketVolume: number
  averageDailyVolume3Month?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  marketCap?: number
}

interface ScoredMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  volumeRatio: number
  score: number
  signals: string[]
}

// Calculate proprietary score
function scoreMover(quote: YahooQuote): { score: number; signals: string[]; volumeRatio: number } {
  const signals: string[] = []
  let score = 0

  const absChange = Math.abs(quote.regularMarketChangePercent || 0)

  // 1. Price magnitude (40%)
  score += Math.min(absChange * 4, 40)
  if (absChange > 10) signals.push('Big move >10%')
  else if (absChange > 5) signals.push('Strong >5%')

  // 2. Volume spike (35%) - KEY SIGNAL
  const avgVol = quote.averageDailyVolume3Month || quote.regularMarketVolume
  const volumeRatio = avgVol > 0 ? quote.regularMarketVolume / avgVol : 1

  if (volumeRatio > 5) {
    score += 35
    signals.push(`Vol 🔥${volumeRatio.toFixed(1)}x`)
  } else if (volumeRatio > 3) {
    score += 28
    signals.push(`High vol ${volumeRatio.toFixed(1)}x`)
  } else if (volumeRatio > 2) {
    score += 18
    signals.push(`Above avg vol`)
  } else if (volumeRatio > 1.5) {
    score += 10
  }

  // 3. 52-week extremes (15%)
  if (quote.fiftyTwoWeekHigh && quote.regularMarketPrice >= quote.fiftyTwoWeekHigh * 0.98) {
    score += 15
    signals.push('52wk high')
  } else if (quote.fiftyTwoWeekLow && quote.regularMarketPrice <= quote.fiftyTwoWeekLow * 1.02) {
    score += 15
    signals.push('52wk low')
  }

  // 4. Liquidity (10%)
  if (quote.regularMarketVolume > 10000000) {
    score += 10
    signals.push('Liquid')
  } else if (quote.regularMarketVolume > 1000000) {
    score += 5
  }

  return { score, signals, volumeRatio }
}

async function fetchYahooMovers(type: 'day_gainers' | 'day_losers'): Promise<YahooQuote[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${type}&count=50`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        next: { revalidate: 60 } // Cache 1 min
      }
    )

    if (!response.ok) {
      console.error(`Yahoo ${type} failed:`, response.status)
      return []
    }

    const data = await response.json()
    return data.finance?.result?.[0]?.quotes || []
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return []
  }
}

async function fetchYahooTrending(): Promise<YahooQuote[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives&count=30`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) return []
    const data = await response.json()
    return data.finance?.result?.[0]?.quotes || []
  } catch (error) {
    console.error('Error fetching trending:', error)
    return []
  }
}

export async function GET() {
  try {
    // Fetch all data in parallel
    const [gainersRaw, losersRaw, trendingRaw] = await Promise.all([
      fetchYahooMovers('day_gainers'),
      fetchYahooMovers('day_losers'),
      fetchYahooTrending()
    ])

    // Process and score gainers
    const gainers: ScoredMover[] = gainersRaw
      .filter(q => q.regularMarketVolume > 100000 && q.regularMarketPrice > 1)
      .map(quote => {
        const { score, signals, volumeRatio } = scoreMover(quote)
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          volumeRatio,
          score,
          signals
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)

    // Process and score losers
    const losers: ScoredMover[] = losersRaw
      .filter(q => q.regularMarketVolume > 100000 && q.regularMarketPrice > 1)
      .map(quote => {
        const { score, signals, volumeRatio } = scoreMover(quote)
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          volumeRatio,
          score,
          signals
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)

    // Trending (most active by volume)
    const trending: ScoredMover[] = trendingRaw
      .slice(0, 20)
      .map(quote => {
        const { score, signals, volumeRatio } = scoreMover(quote)
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          volumeRatio,
          score,
          signals
        }
      })

    return NextResponse.json({
      trending,
      gainers,
      losers,
      meta: {
        method: 'proprietary-scoring-yahoo-data',
        timestamp: new Date().toISOString(),
        gainersCount: gainers.length,
        losersCount: losers.length
      }
    })
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json({
      trending: [],
      gainers: [],
      losers: [],
      meta: { error: String(error) }
    })
  }
}
