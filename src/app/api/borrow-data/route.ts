import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface BorrowRecord {
  date: string
  time: string
  fee: number
  available: number
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Fetch from iBorrowDesk hidden API
    const response = await fetch(
      `https://iborrowdesk.com/api/ticker/${ticker.toUpperCase()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      // Stock might not be available for borrowing or not tracked
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        available: false,
        message: 'Stock not available in borrow database',
        data: []
      })
    }

    const result = await response.json()
    const dailyData = result.daily || []

    // Parse and format the data
    const formattedData: BorrowRecord[] = dailyData.map((record: any) => ({
      date: record.date || record.Date,
      time: record.time || record.Time,
      fee: parseFloat(record.fee || record.Fee || record.feerate || 0),
      available: parseInt(record.available || record.Available || 0, 10)
    }))

    // Get the most recent data point
    const latest = formattedData[formattedData.length - 1] || null

    // Calculate stats
    const fees = formattedData.map(d => d.fee).filter(f => f > 0)
    const avgFee = fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0
    const maxFee = fees.length > 0 ? Math.max(...fees) : 0
    const minFee = fees.length > 0 ? Math.min(...fees) : 0

    // Determine if hard to borrow (fee > 10% is typically considered hard to borrow)
    const isHardToBorrow = latest?.fee > 10

    // Get trend (compare latest to 5 days ago)
    const fiveDaysAgo = formattedData[Math.max(0, formattedData.length - 50)] // ~5 trading days worth of updates
    const feeTrend = fiveDaysAgo && latest ? latest.fee - fiveDaysAgo.fee : 0
    const availabilityTrend = fiveDaysAgo && latest ? latest.available - fiveDaysAgo.available : 0

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      available: true,
      latest: latest,
      history: formattedData.slice(-100), // Last 100 records
      stats: {
        avgFee: avgFee.toFixed(2),
        maxFee: maxFee.toFixed(2),
        minFee: minFee.toFixed(2),
        isHardToBorrow,
        feeTrend: feeTrend.toFixed(2),
        availabilityTrend
      },
      source: 'Interactive Brokers via iBorrowDesk',
      disclaimer: 'Borrow rates and availability are from Interactive Brokers. Rates may vary between brokers.'
    })
  } catch (error) {
    logger.error('Borrow data API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      available: false,
      message: 'Failed to fetch borrow data',
      data: []
    })
  }
}
