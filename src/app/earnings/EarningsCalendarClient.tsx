"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StockLogo from '@/components/StockLogo'
import { TrendingUp, TrendingDown, Calendar, Filter, Building2 } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'

interface EarningsEvent {
  code: string
  name?: string
  report_date: string
  estimate?: number
  actual?: number
  before_after_market?: string
  market_cap?: number
  sector?: string
}

type MarketCapFilter = 'all' | 'large' | 'mid' | 'small'
type SectorFilter = 'all' | 'technology' | 'healthcare' | 'finance' | 'consumer' | 'energy' | 'industrials'

const NOTABLE_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.A', 'BRK.B',
  'JPM', 'V', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'DIS', 'BAC', 'NFLX',
  'CRM', 'ADBE', 'ORCL', 'AMD', 'INTC', 'CSCO', 'QCOM', 'TXN', 'AVGO', 'MU',
]

export default function EarningsCalendarClient() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapFilter>('all')
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all')
  const [showNotableOnly, setShowNotableOnly] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(today.getDate() + 14)

      const from = today.toISOString().split('T')[0]
      const to = twoWeeksLater.toISOString().split('T')[0]

      const response = await fetch(`/api/earnings?from=${from}&to=${to}`)
      const data = await response.json()

      if (data.earnings) {
        // Sort by date and market timing
        const sorted = data.earnings.sort((a: EarningsEvent, b: EarningsEvent) => {
          const dateCompare = new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
          if (dateCompare !== 0) return dateCompare
          return a.before_after_market === 'bmo' ? -1 : 1
        })
        setEarnings(sorted)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
    setLoading(false)
  }

  // Filter earnings
  const filteredEarnings = earnings.filter(e => {
    const ticker = e.code?.replace('.US', '') || ''

    // Notable filter
    if (showNotableOnly && !NOTABLE_TICKERS.includes(ticker)) {
      return false
    }

    // Market cap filter
    if (marketCapFilter !== 'all' && e.market_cap) {
      const cap = e.market_cap
      if (marketCapFilter === 'large' && cap < 10e9) return false
      if (marketCapFilter === 'mid' && (cap < 2e9 || cap >= 10e9)) return false
      if (marketCapFilter === 'small' && cap >= 2e9) return false
    }

    // Sector filter (basic categorization based on ticker)
    if (sectorFilter !== 'all') {
      // This is simplified - in production you'd want actual sector data
      const ticker = e.code?.replace('.US', '')
      const techTickers = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'CSCO']
      const financeTickers = ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP', 'SCHW']
      const healthcareTickers = ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN']
      const consumerTickers = ['AMZN', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'COST', 'DIS']
      const energyTickers = ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL']

      if (sectorFilter === 'technology' && !techTickers.includes(ticker || '')) return false
      if (sectorFilter === 'finance' && !financeTickers.includes(ticker || '')) return false
      if (sectorFilter === 'healthcare' && !healthcareTickers.includes(ticker || '')) return false
      if (sectorFilter === 'consumer' && !consumerTickers.includes(ticker || '')) return false
      if (sectorFilter === 'energy' && !energyTickers.includes(ticker || '')) return false
    }

    return true
  })

  // Group by date
  const groupedByDate = filteredEarnings.reduce((acc, e) => {
    const date = e.report_date
    if (!acc[date]) acc[date] = { bmo: [], amc: [] }
    if (e.before_after_market === 'bmo') {
      acc[date].bmo.push(e)
    } else {
      acc[date].amc.push(e)
    }
    return acc
  }, {} as Record<string, { bmo: EarningsEvent[], amc: EarningsEvent[] }>)

  const sortedDates = Object.keys(groupedByDate).sort()

  // Statistics
  const totalEarnings = filteredEarnings.length
  const reported = filteredEarnings.filter(e => e.actual !== undefined && e.actual !== null)
  const beatCount = reported.filter(e =>
    (e.estimate || 0) > 0 && (e.actual || 0) > (e.estimate || 0)
  ).length
  const missCount = reported.filter(e =>
    (e.estimate || 0) > 0 && (e.actual || 0) < (e.estimate || 0)
  ).length

  // Generate ItemList schema for companies
  const generateItemListSchema = () => {
    const items = filteredEarnings.slice(0, 100).map((event, index) => {
      const ticker = event.code?.replace('.US', '')
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: `${ticker} - ${event.name || ticker}`,
        url: `${SITE_URL}/stock/${ticker}`,
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Companies Reporting Earnings',
      description: 'Complete list of companies reporting earnings in the next 2 weeks',
      numberOfItems: items.length,
      itemListElement: items,
    }
  }

  // Generate Event schema for each date
  const generateEventSchemas = () => {
    return sortedDates.slice(0, 14).map(date => {
      const dayData = groupedByDate[date]
      const companiesCount = dayData.bmo.length + dayData.amc.length
      const dateObj = new Date(date)

      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: `Earnings Reports - ${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
        description: `${companiesCount} companies reporting earnings on ${date}`,
        startDate: date,
        endDate: date,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: `${SITE_URL}/earnings`,
        },
      }
    })
  }

  return (
    <>
      {!loading && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateItemListSchema()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateEventSchemas()),
            }}
          />
        </>
      )}

      <div className="space-y-6">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl sm:text-3xl font-bold">{totalEarnings}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Reports</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl sm:text-3xl font-bold text-green-500">{beatCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Beat Estimates</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl sm:text-3xl font-bold text-red-500">{missCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Missed Estimates</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Building2 className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl sm:text-3xl font-bold text-amber-500">
              {totalEarnings - reported.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold">Filters</h3>
          </div>

          <div className="space-y-4">
            {/* Notable Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNotableOnly}
                  onChange={(e) => setShowNotableOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm font-medium">Show Notable Companies Only</span>
              </label>
            </div>

            {/* Market Cap Filter */}
            <div>
              <label className="text-sm font-medium block mb-2">Market Cap</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'large', 'mid', 'small'] as MarketCapFilter[]).map(cap => (
                  <button
                    key={cap}
                    onClick={() => setMarketCapFilter(cap)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      marketCapFilter === cap
                        ? 'bg-green-600 text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cap === 'all' ? 'All' : cap === 'large' ? 'Large Cap (>$10B)' : cap === 'mid' ? 'Mid Cap ($2B-$10B)' : 'Small Cap (<$2B)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="text-sm font-medium block mb-2">Sector</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'technology', 'finance', 'healthcare', 'consumer', 'energy'] as SectorFilter[]).map(sector => (
                  <button
                    key={sector}
                    onClick={() => setSectorFilter(sector)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sectorFilter === sector
                        ? 'bg-green-600 text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Calendar */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading earnings data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No Earnings Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more earnings reports.
                </p>
              </div>
            ) : (
              sortedDates.map(date => {
                const dayData = groupedByDate[date]
                const dateObj = new Date(date + 'T00:00:00')
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const isToday = dateObj.getTime() === today.getTime()
                const isPast = dateObj.getTime() < today.getTime()

                return (
                  <div
                    key={date}
                    className={`bg-card border rounded-lg overflow-hidden ${
                      isToday ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-border'
                    }`}
                  >
                    {/* Date Header */}
                    <div className={`p-4 sm:p-6 ${isToday ? 'bg-green-500/10' : 'bg-secondary/30'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {dayData.bmo.length + dayData.amc.length} companies reporting
                          </p>
                        </div>
                        {isToday && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            TODAY
                          </span>
                        )}
                        {isPast && (
                          <span className="bg-secondary text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
                            Past
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Companies */}
                    <div className="p-4 sm:p-6 space-y-6">
                      {/* Before Market Open */}
                      {dayData.bmo.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-amber-500 mb-3 flex items-center gap-2">
                            <span className="text-lg">☀️</span>
                            BEFORE MARKET OPEN ({dayData.bmo.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dayData.bmo.map((event, i) => (
                              <EarningsCard key={i} event={event} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* After Market Close */}
                      {dayData.amc.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                            <span className="text-lg">🌙</span>
                            AFTER MARKET CLOSE ({dayData.amc.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dayData.amc.map((event, i) => (
                              <EarningsCard key={i} event={event} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </>
  )
}

function EarningsCard({ event }: { event: EarningsEvent }) {
  const ticker = event.code?.replace('.US', '') || 'N/A'
  const hasResults = event.actual !== undefined && event.actual !== null
  const actual = event.actual ?? 0
  const estimate = event.estimate ?? 0
  const beat = hasResults && estimate > 0 && actual > estimate
  const miss = hasResults && estimate > 0 && actual < estimate
  const isNotable = NOTABLE_TICKERS.includes(ticker)

  const surprisePercent = hasResults && estimate !== 0
    ? ((actual - estimate) / Math.abs(estimate)) * 100
    : 0

  return (
    <Link
      href={`/stock/${ticker}`}
      className={`block p-4 rounded-lg border transition-all hover:scale-[1.02] ${
        beat ? 'bg-green-500/10 border-green-500/50 hover:shadow-lg hover:shadow-green-500/20' :
        miss ? 'bg-red-500/10 border-red-500/50 hover:shadow-lg hover:shadow-red-500/20' :
        isNotable ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50' :
        'bg-secondary/30 border-border hover:border-green-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <StockLogo symbol={ticker} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{ticker}</span>
                {isNotable && !hasResults && (
                  <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded font-medium">
                    Notable
                  </span>
                )}
              </div>
              {event.name && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {event.name}
                </p>
              )}
            </div>
          </div>

          {hasResults ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Actual EPS:</span>
                <span className="font-bold">${actual.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimate:</span>
                <span>${estimate.toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between text-sm font-bold ${
                beat ? 'text-green-500' : 'text-red-500'
              }`}>
                <span className="flex items-center gap-1">
                  {beat ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  Surprise:
                </span>
                <span>{surprisePercent > 0 ? '+' : ''}{surprisePercent.toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">EPS Estimate:</span>
                <span className="font-bold">${estimate?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Awaiting results
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
