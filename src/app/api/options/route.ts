import { NextRequest, NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

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

    // Parse options data - EODHD returns array of expirations
    const calls: any[] = []
    const puts: any[] = []
    let totalCallVolume = 0
    let totalPutVolume = 0

    // Process the options data
    if (Array.isArray(rawData) && rawData.length > 0) {
      // Get nearest expiration
      const nearestExpiration = rawData[0]

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

    return NextResponse.json({
      calls: calls.slice(0, 20),
      puts: puts.slice(0, 20),
      summary: {
        totalCallVolume,
        totalPutVolume,
        putCallRatio,
        maxPain,
        sentiment
      }
    })
  } catch (error) {
    console.error('Options API error:', error)
    // Return mock data if API fails
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
