"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import StockLogo from "@/components/StockLogo"
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface EarningsEvent {
  code: string
  name?: string
  report_date: string
  estimate?: number
  actual?: number
  before_after_market?: string
  surprise?: number
  surprisePercent?: number
  market_cap?: number
}

// Notable tickers to highlight
const NOTABLE_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.A', 'BRK.B',
  'JPM', 'V', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'DIS', 'BAC', 'NFLX',
  'CRM', 'ADBE', 'ORCL', 'AMD', 'INTC', 'CSCO', 'QCOM', 'TXN', 'AVGO', 'MU',
  'NKE', 'KO', 'PEP', 'MCD', 'SBUX', 'CMG', 'COST', 'TGT', 'LOW',
  'GS', 'MS', 'C', 'WFC', 'AXP', 'BLK', 'SCHW'
]

export default function EarningsCalendar() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = this week, 1 = next week, etc.
  const [filter, setFilter] = useState<'all' | 'notable'>('all')

  useEffect(() => {
    fetchEarnings()
  }, [selectedWeek])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + (selectedWeek * 7))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const from = startOfWeek.toISOString().split('T')[0]
      const to = endOfWeek.toISOString().split('T')[0]

      const response = await fetch(`/api/earnings?from=${from}&to=${to}`)
      const data = await response.json()

      if (data.earnings) {
        // Sort by date and market timing
        const sorted = data.earnings.sort((a: EarningsEvent, b: EarningsEvent) => {
          const dateCompare = new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
          if (dateCompare !== 0) return dateCompare
          // BMO (before market open) comes before AMC (after market close)
          return a.before_after_market === 'bmo' ? -1 : 1
        })
        setEarnings(sorted)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
    setLoading(false)
  }

  // Filter earnings if needed
  const filteredEarnings = filter === 'notable'
    ? earnings.filter(e => NOTABLE_TICKERS.includes(e.code?.replace('.US', '')))
    : earnings

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

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Calculate statistics
  const totalEarnings = earnings.length
  const notableEarnings = earnings.filter(e => NOTABLE_TICKERS.includes(e.code?.replace('.US', '')))
  const reported = earnings.filter(e => e.actual !== undefined && e.actual !== null)
  const beatCount = reported.filter(e => (e.estimate || 0) > 0 && (e.actual || 0) > (e.estimate || 0)).length
  const missCount = reported.filter(e => (e.estimate || 0) > 0 && (e.actual || 0) < (e.estimate || 0)).length

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#4ebe96]" />
            Earnings Calendar
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedWeek(w => w - 1)}
              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 inline" /> Prev
            </button>
            <button
              onClick={() => setSelectedWeek(0)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedWeek === 0 ? 'bg-[#4ebe96] text-white' : 'bg-white/[0.05] hover:bg-white/[0.08]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedWeek(w => w + 1)}
              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium"
            >
              Next <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/[0.05] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{totalEarnings}</p>
            <p className="text-xs text-[#868f97]">Total Reports</p>
          </div>
          <div className="bg-white/[0.05] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{notableEarnings.length}</p>
            <p className="text-xs text-[#868f97]">Notable</p>
          </div>
          <div className="bg-white/[0.05] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#4ebe96]">{beatCount}</p>
            <p className="text-xs text-[#868f97]">Beat</p>
          </div>
          <div className="bg-white/[0.05] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{missCount}</p>
            <p className="text-xs text-[#868f97]">Missed</p>
          </div>
          <div className="bg-white/[0.05] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#868f97]">{totalEarnings - reported.length}</p>
            <p className="text-xs text-[#868f97]">Pending</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
              filter === 'all'
                ? 'bg-[#4ebe96] text-white'
                : 'bg-white/[0.05] text-[#868f97] hover:text-white'
            }`}
          >
            All Earnings ({totalEarnings})
          </button>
          <button
            onClick={() => setFilter('notable')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
              filter === 'notable'
                ? 'bg-amber-500 text-white'
                : 'bg-white/[0.05] text-[#868f97] hover:text-white'
            }`}
          >
            Notable Only ({notableEarnings.length})
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Monday through Friday */}
            {[1, 2, 3, 4, 5].map(dayIndex => {
              const today = new Date()
              const startOfWeek = new Date(today)
              startOfWeek.setDate(today.getDate() - today.getDay() + (selectedWeek * 7))
              const currentDay = new Date(startOfWeek)
              currentDay.setDate(startOfWeek.getDate() + dayIndex)
              const dateStr = currentDay.toISOString().split('T')[0]
              const dayData = groupedByDate[dateStr] || { bmo: [], amc: [] }
              const isToday = dateStr === new Date().toISOString().split('T')[0]

              return (
                <div key={dayIndex} className={`bg-white/[0.05] rounded-lg p-3 ${isToday ? 'ring-2 ring-emerald-500' : ''}`}>
                  <div className="text-center mb-3 pb-2 border-b border-white/[0.08]">
                    <p className="font-bold text-lg">{weekDays[dayIndex]}</p>
                    <p className="text-[#868f97] text-sm">
                      {currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {isToday && <span className="text-xs text-emerald-500">TODAY</span>}
                  </div>

                  {/* Before Market Open */}
                  {dayData.bmo.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-amber-400 font-medium mb-1">🌅 BEFORE MARKET</p>
                      {dayData.bmo.slice(0, 8).map((e, i) => (
                        <EarningsCard key={i} event={e} />
                      ))}
                      {dayData.bmo.length > 8 && (
                        <p className="text-xs text-[#868f97]">+{dayData.bmo.length - 8} more</p>
                      )}
                    </div>
                  )}

                  {/* After Market Close */}
                  {dayData.amc.length > 0 && (
                    <div>
                      <p className="text-xs text-indigo-400 font-medium mb-1">🌙 AFTER MARKET</p>
                      {dayData.amc.slice(0, 8).map((e, i) => (
                        <EarningsCard key={i} event={e} />
                      ))}
                      {dayData.amc.length > 8 && (
                        <p className="text-xs text-[#868f97]">+{dayData.amc.length - 8} more</p>
                      )}
                    </div>
                  )}

                  {dayData.bmo.length === 0 && dayData.amc.length === 0 && (
                    <p className="text-[#868f97] text-sm text-center py-4">No earnings</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#868f97]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Beat Estimates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Missed Estimates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#868f97]"></span>
            <span>Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

  return (
    <div className={`p-2 mb-1.5 rounded-lg text-xs transition-all hover:scale-[1.02] cursor-pointer ${
      beat ? 'bg-emerald-500/20 border border-emerald-500/30' :
      miss ? 'bg-red-500/20 border border-red-500/30' :
      isNotable ? 'bg-amber-500/10 border border-amber-500/30' :
      'bg-white/[0.05] border border-transparent hover:border-white/[0.08]'
    }`}>
      <div className="flex items-center gap-2">
        <StockLogo symbol={ticker} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{ticker}</span>
              {isNotable && !hasResults && (
                <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-500 rounded">Notable</span>
              )}
            </div>
            {hasResults ? (
              <span className={`flex items-center gap-0.5 ${beat ? 'text-emerald-500' : 'text-red-500'}`}>
                {beat ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {((actual - estimate) / Math.abs(estimate || 1) * 100).toFixed(0)}%
              </span>
            ) : (
              <span className="text-[#868f97]">Est: ${estimate?.toFixed(2) || 'N/A'}</span>
            )}
          </div>
          {event.name && (
            <p className="text-[10px] text-[#868f97] truncate">{event.name}</p>
          )}
        </div>
      </div>
    </div>
  )
}
