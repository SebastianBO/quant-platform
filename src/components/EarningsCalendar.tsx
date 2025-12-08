"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface EarningsEvent {
  code: string
  name?: string
  report_date: string
  estimate?: number
  actual?: number
  before_after_market?: string
  surprise?: number
  surprisePercent?: number
}

export default function EarningsCalendar() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = this week, 1 = next week, etc.

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

  // Group by date
  const groupedByDate = earnings.reduce((acc, e) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Earnings Calendar
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedWeek(w => w - 1)}
              className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-sm"
            >
              ← Prev Week
            </button>
            <button
              onClick={() => setSelectedWeek(0)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedWeek(w => w + 1)}
              className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded text-sm"
            >
              Next Week →
            </button>
          </div>
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
                <div key={dayIndex} className={`bg-secondary/30 rounded-lg p-3 ${isToday ? 'ring-2 ring-emerald-500' : ''}`}>
                  <div className="text-center mb-3 pb-2 border-b border-border">
                    <p className="font-bold text-lg">{weekDays[dayIndex]}</p>
                    <p className="text-muted-foreground text-sm">
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
                        <p className="text-xs text-muted-foreground">+{dayData.bmo.length - 8} more</p>
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
                        <p className="text-xs text-muted-foreground">+{dayData.amc.length - 8} more</p>
                      )}
                    </div>
                  )}

                  {dayData.bmo.length === 0 && dayData.amc.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">No earnings</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Beat Estimates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Missed Estimates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-muted-foreground"></span>
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

  return (
    <div className={`p-2 mb-1 rounded text-xs ${beat ? 'bg-emerald-500/20' : miss ? 'bg-red-500/20' : 'bg-secondary/50'}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-foreground">{ticker}</span>
        {hasResults ? (
          <span className={beat ? 'text-emerald-500' : 'text-red-500'}>
            {beat ? '↑' : '↓'} {((actual - estimate) / Math.abs(estimate || 1) * 100).toFixed(0)}%
          </span>
        ) : (
          <span className="text-muted-foreground">Est: ${estimate.toFixed(2) || 'N/A'}</span>
        )}
      </div>
    </div>
  )
}
