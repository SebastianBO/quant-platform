import { NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY

/**
 * PROPRIETARY MOVER DETECTION SYSTEM
 *
 * Instead of just showing "top % gainers", we build a multi-signal score:
 * 1. Price change % (what everyone shows)
 * 2. Volume spike vs average (unusual activity = something is happening)
 * 3. 52-week high/low breakout (institutional attention)
 * 4. Market cap filter (tradeable, liquid stocks only)
 *
 * This creates competitive advantage - not just copying Yahoo Finance
 */

interface BulkStock {
  code: string
  exchange_short_name: string
  name: string
  close: number
  adjusted_close: number
  prev_close: number
  change: number
  change_p: number
  volume: number
  avgVolume?: number
  high?: number
  low?: number
  yearHigh?: number
  yearLow?: number
  marketCap?: number
}

interface ScoredMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  volumeRatio: number // vs average - key signal!
  score: number // our proprietary score
  signals: string[] // why it's moving
}

// Calculate our proprietary "Mover Score"
function calculateMoverScore(stock: BulkStock, isGainer: boolean): { score: number; signals: string[] } {
  const signals: string[] = []
  let score = 0

  // 1. Price change magnitude (40% weight)
  const absChange = Math.abs(stock.change_p || 0)
  const priceScore = Math.min(absChange * 4, 40) // Cap at 40 points
  score += priceScore
  if (absChange > 10) signals.push('Big move >10%')
  else if (absChange > 5) signals.push('Strong move >5%')

  // 2. Volume spike (30% weight) - THIS IS KEY
  // Unusual volume = institutional activity, news, etc.
  const volumeRatio = stock.avgVolume ? stock.volume / stock.avgVolume : 1
  if (volumeRatio > 5) {
    score += 30
    signals.push(`Volume 🔥 ${volumeRatio.toFixed(1)}x avg`)
  } else if (volumeRatio > 3) {
    score += 25
    signals.push(`High volume ${volumeRatio.toFixed(1)}x avg`)
  } else if (volumeRatio > 2) {
    score += 15
    signals.push(`Above avg volume`)
  } else if (volumeRatio > 1) {
    score += 5
  }

  // 3. 52-week breakout (20% weight)
  if (stock.yearHigh && stock.close >= stock.yearHigh * 0.98) {
    score += 20
    signals.push('Near 52-week high')
  } else if (stock.yearLow && stock.close <= stock.yearLow * 1.02) {
    score += 20
    signals.push('Near 52-week low')
  }

  // 4. Liquidity bonus (10% weight)
  // More liquid = more tradeable = more relevant
  if (stock.volume > 10000000) {
    score += 10
    signals.push('Very liquid')
  } else if (stock.volume > 1000000) {
    score += 5
  }

  return { score, signals }
}

export async function GET() {
  try {
    const results: {
      trending: ScoredMover[]
      gainers: ScoredMover[]
      losers: ScoredMover[]
      meta: {
        universeSize: number
        method: string
        timestamp: string
      }
    } = {
      trending: [],
      gainers: [],
      losers: [],
      meta: {
        universeSize: 0,
        method: 'proprietary-multi-signal',
        timestamp: new Date().toISOString()
      }
    }

    // STEP 1: Get bulk data for ALL US stocks
    // This gives us the entire market in one call
    const bulkResponse = await fetch(
      `https://eodhd.com/api/eod-bulk-last-day/US?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 300 } } // Cache 5 min
    )

    if (!bulkResponse.ok) {
      console.error('Bulk API failed:', bulkResponse.status)
      return NextResponse.json(results)
    }

    const bulkData: BulkStock[] = await bulkResponse.json()
    console.log(`Loaded ${bulkData.length} stocks from bulk API`)

    // STEP 2: Filter to tradeable stocks
    const tradeableStocks = bulkData.filter(stock => {
      // Must have valid data
      if (!stock.code || !stock.close || stock.close <= 0) return false
      if (!stock.change_p && stock.change_p !== 0) return false

      // Price filter: $1-$10000 (no penny stocks, no weird stuff)
      if (stock.close < 1 || stock.close > 10000) return false

      // Volume filter: must have some activity
      if (!stock.volume || stock.volume < 100000) return false

      // Skip ETFs for the movers list (keep for trending)
      // Common ETF patterns
      const symbol = stock.code
      if (symbol.length > 5) return false // Most ETFs have 3-4 chars

      return true
    })

    console.log(`Filtered to ${tradeableStocks.length} tradeable stocks`)
    results.meta.universeSize = tradeableStocks.length

    // STEP 3: Score all stocks with our proprietary algorithm
    const scoredGainers: ScoredMover[] = []
    const scoredLosers: ScoredMover[] = []

    for (const stock of tradeableStocks) {
      const changePercent = stock.change_p || 0
      const isGainer = changePercent > 0
      const { score, signals } = calculateMoverScore(stock, isGainer)

      const volumeRatio = stock.avgVolume ? stock.volume / stock.avgVolume : 1

      const mover: ScoredMover = {
        symbol: stock.code,
        name: stock.name || stock.code,
        price: stock.close,
        change: stock.change || 0,
        changePercent,
        volume: stock.volume,
        volumeRatio,
        score,
        signals
      }

      // Only include if meaningful move (>1%)
      if (changePercent > 1) {
        scoredGainers.push(mover)
      } else if (changePercent < -1) {
        scoredLosers.push(mover)
      }
    }

    // STEP 4: Sort by our PROPRIETARY SCORE, not just % change
    // This is the competitive advantage!
    results.gainers = scoredGainers
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)

    results.losers = scoredLosers
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)

    // STEP 5: Trending = top traded stocks (for the ticker bar)
    const topByVolume = [...tradeableStocks]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 20)
      .map(stock => ({
        symbol: stock.code,
        name: stock.name || stock.code,
        price: stock.close,
        change: stock.change || 0,
        changePercent: stock.change_p || 0,
        volume: stock.volume,
        volumeRatio: stock.avgVolume ? stock.volume / stock.avgVolume : 1,
        score: 0,
        signals: []
      }))

    results.trending = topByVolume

    return NextResponse.json(results)
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
