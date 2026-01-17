import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Cache for 1 hour
export const revalidate = 3600

interface EarningsEvent {
  symbol: string
  name: string
  date: string
  time: 'BMO' | 'AMC' | 'TBD'
  estimatedEPS?: number
}

// Mock upcoming earnings data (in production, this would come from a financial data API)
const MOCK_EARNINGS: EarningsEvent[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', date: '2026-01-22', time: 'AMC', estimatedEPS: 4.62 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', date: '2026-01-23', time: 'AMC', estimatedEPS: 2.78 },
  { symbol: 'TSLA', name: 'Tesla Inc', date: '2026-01-24', time: 'AMC', estimatedEPS: 0.72 },
  { symbol: 'AAPL', name: 'Apple Inc', date: '2026-01-26', time: 'AMC', estimatedEPS: 2.35 },
  { symbol: 'META', name: 'Meta Platforms', date: '2026-01-28', time: 'AMC', estimatedEPS: 5.12 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', date: '2026-01-29', time: 'AMC', estimatedEPS: 1.89 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', date: '2026-01-30', time: 'AMC', estimatedEPS: 1.45 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', date: '2026-01-31', time: 'AMC', estimatedEPS: 0.92 },
]

export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '7', 10)
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)

  try {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + days)

    // Filter earnings within the date range
    const filtered = MOCK_EARNINGS.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= today && eventDate <= endDate
    })

    const earnings = filtered.slice(0, limit)

    const response = NextResponse.json({
      earnings,
      daysAhead: days,
      timestamp: new Date().toISOString(),
      source: 'mock',
    })

    // Cache for 1 hour
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600')
    return response
  } catch (error) {
    logger.error('Earnings API error', { error: error instanceof Error ? error.message : 'Unknown' })

    return NextResponse.json({
      earnings: MOCK_EARNINGS.slice(0, limit),
      daysAhead: days,
      timestamp: new Date().toISOString(),
      source: 'mock',
    })
  }
}
