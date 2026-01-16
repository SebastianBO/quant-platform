import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const format = request.nextUrl.searchParams.get('format') // 'full' for chain, default for flow

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://eodhd.com/api/options/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`EODHD API error: ${response.status}`)
    }

    const rawData = await response.json()

    // If format=full, return full chain data for OptionsChain component
    if (format === 'full' || !format) {
      // Validate that we have proper data structure
      if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
        return NextResponse.json({
          code: ticker,
          lastTradeDate: new Date().toISOString().split('T')[0],
          lastTradePrice: 0,
          data: []
        })
      }
      return NextResponse.json(rawData)
    }

    // Otherwise return simplified format for OptionsFlow component
    const calls: any[] = []
    const puts: any[] = []
    let totalCallVolume = 0
    let totalPutVolume = 0
    let expirationDate = ''
    let currentPrice = rawData.lastTradePrice || 0

    // Process the options data - only nearest expiration
    if (rawData.data && Array.isArray(rawData.data) && rawData.data.length > 0) {
      // Get nearest expiration only for faster loading
      const nearestExpiration = rawData.data[0]
      expirationDate = nearestExpiration.expirationDate || ''

      if (nearestExpiration?.options) {
        // Process calls
        if (Array.isArray(nearestExpiration.options.CALL)) {
          nearestExpiration.options.CALL.forEach((opt: any) => {
            const volume = opt.volume || 0
            totalCallVolume += volume
            calls.push({
              strike: opt.strike,
              expiration: nearestExpiration.expirationDate,
              volume: volume,
              openInterest: opt.openInterest || 0,
              impliedVolatility: opt.impliedVolatility || 0,
              lastPrice: opt.lastPrice || 0,
              type: 'call'
            })
          })
        }

        // Process puts
        if (Array.isArray(nearestExpiration.options.PUT)) {
          nearestExpiration.options.PUT.forEach((opt: any) => {
            const volume = opt.volume || 0
            totalPutVolume += volume
            puts.push({
              strike: opt.strike,
              expiration: nearestExpiration.expirationDate,
              volume: volume,
              openInterest: opt.openInterest || 0,
              impliedVolatility: opt.impliedVolatility || 0,
              lastPrice: opt.lastPrice || 0,
              type: 'put'
            })
          })
        }
      }
    }

    // Calculate put/call ratio
    const putCallRatio = totalCallVolume > 0 ? totalPutVolume / totalCallVolume : 0

    // Calculate max pain (strike with max combined open interest)
    const strikeOI: Record<number, number> = {}
    calls.forEach(c => {
      strikeOI[c.strike] = (strikeOI[c.strike] || 0) + c.openInterest
    })
    puts.forEach(p => {
      strikeOI[p.strike] = (strikeOI[p.strike] || 0) + p.openInterest
    })

    let maxPain = 0
    let maxOI = 0
    Object.entries(strikeOI).forEach(([strike, oi]) => {
      if (oi > maxOI) {
        maxOI = oi
        maxPain = parseFloat(strike)
      }
    })

    // Determine sentiment
    let sentiment = 'Neutral'
    if (putCallRatio < 0.7) sentiment = 'Bullish'
    else if (putCallRatio > 1.2) sentiment = 'Bearish'

    // Find unusual activity (volume > 5x open interest or very high volume)
    const unusualActivity: any[] = []
    const allOptions = [...calls, ...puts]
    allOptions.forEach(opt => {
      const volumeToOIRatio = opt.openInterest > 0 ? opt.volume / opt.openInterest : 0
      if (volumeToOIRatio > 5 && opt.volume > 100) {
        unusualActivity.push({
          strike: opt.strike,
          type: opt.type,
          volume: opt.volume,
          openInterest: opt.openInterest,
          ratio: volumeToOIRatio.toFixed(1)
        })
      }
    })
    // Sort by volume descending
    unusualActivity.sort((a, b) => b.volume - a.volume)

    // Calculate Expected Move (ATM straddle price)
    // Find the ATM strike (closest to current price)
    let atmCall = calls[0]
    let atmPut = puts[0]
    let minCallDiff = Infinity
    let minPutDiff = Infinity

    calls.forEach(c => {
      const diff = Math.abs(c.strike - currentPrice)
      if (diff < minCallDiff) {
        minCallDiff = diff
        atmCall = c
      }
    })

    puts.forEach(p => {
      const diff = Math.abs(p.strike - currentPrice)
      if (diff < minPutDiff) {
        minPutDiff = diff
        atmPut = p
      }
    })

    // Expected Move = ATM Call Price + ATM Put Price
    const atmCallPrice = atmCall?.lastPrice || 0
    const atmPutPrice = atmPut?.lastPrice || 0
    const expectedMove = atmCallPrice + atmPutPrice
    const expectedMovePercent = currentPrice > 0 ? (expectedMove / currentPrice) * 100 : 0
    const expectedHigh = currentPrice + expectedMove
    const expectedLow = currentPrice - expectedMove

    // Calculate average IV from ATM options
    const atmIV = ((atmCall?.impliedVolatility || 0) + (atmPut?.impliedVolatility || 0)) / 2

    // Calculate IV Rank approximation (compare current ATM IV to all strikes)
    // In production, you'd compare to historical 52-week IV range
    const allIVs = allOptions.map(o => o.impliedVolatility).filter(iv => iv > 0)
    const maxIV = Math.max(...allIVs, 0.01)
    const minIV = Math.min(...allIVs, 0)
    const ivRange = maxIV - minIV
    const ivRank = ivRange > 0 ? ((atmIV - minIV) / ivRange) * 100 : 50
    const ivPercentile = ivRank // Simplified - in production use historical data

    // Calculate days until expiration for Expected Move context
    const today = new Date()
    const expDate = expirationDate ? new Date(expirationDate) : today
    const daysToExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      calls: calls.slice(0, 20),
      puts: puts.slice(0, 20),
      summary: {
        totalCallVolume,
        totalPutVolume,
        putCallRatio,
        maxPain,
        sentiment,
        expirationDate,
        currentPrice,
        unusualActivity: unusualActivity.slice(0, 5),
        // New Expected Move data
        expectedMove: {
          amount: expectedMove,
          percent: expectedMovePercent,
          high: expectedHigh,
          low: expectedLow,
          daysToExpiration,
          atmStrike: atmCall?.strike || atmPut?.strike || 0,
          atmCallPrice,
          atmPutPrice
        },
        // IV data
        iv: {
          atm: atmIV * 100, // Convert to percentage
          rank: ivRank,
          percentile: ivPercentile,
          min: minIV * 100,
          max: maxIV * 100
        }
      }
    })
  } catch (error) {
    logger.error('Options API error', { error: error instanceof Error ? error.message : 'Unknown' })

    // Return appropriate error format based on requested format
    if (format === 'full' || !format) {
      return NextResponse.json({
        code: ticker || 'UNKNOWN',
        lastTradeDate: new Date().toISOString().split('T')[0],
        lastTradePrice: 0,
        data: []
      })
    }

    return NextResponse.json({
      calls: [],
      puts: [],
      summary: {
        totalCallVolume: 0,
        totalPutVolume: 0,
        putCallRatio: 0,
        maxPain: 0,
        sentiment: 'Unknown'
      }
    })
  }
}
