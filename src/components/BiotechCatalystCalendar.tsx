"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import {
  Beaker,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Activity,
  Pill,
  Target,
  TrendingUp
} from "lucide-react"

interface Catalyst {
  id: string
  ticker: string
  companyName: string
  catalystType: 'TRIAL_RESULT' | 'FDA_DECISION' | 'PDUFA_DATE' | 'PHASE_TRANSITION' | 'DATA_READOUT'
  title: string
  description: string
  expectedDate: string | null
  datePrecision: string
  drugName: string | null
  indication: string | null
  phase: string | null
  sourceType: string
  sourceId: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'UPCOMING' | 'IMMINENT' | 'PAST'
  daysUntil: number | null
}

interface CalendarData {
  catalysts: Catalyst[]
  totalCount: number
  byTicker: Record<string, Catalyst[]>
  companiesTracked: number
  summary: {
    upcoming: number
    imminent: number
    highImportance: number
    phase3Trials: number
  }
}

const importanceColors: Record<string, string> = {
  HIGH: 'bg-purple-500 text-white',
  MEDIUM: 'bg-blue-500 text-white',
  LOW: 'bg-gray-400 text-white'
}

const phaseColors: Record<string, string> = {
  PHASE1: 'bg-gray-500',
  EARLY_PHASE1: 'bg-gray-500',
  PHASE2: 'bg-blue-500',
  'PHASE2/PHASE3': 'bg-indigo-500',
  PHASE3: 'bg-purple-600',
  PHASE4: 'bg-green-500',
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

interface MonthViewProps {
  catalysts: Catalyst[]
  month: Date
}

function MonthView({ catalysts, month }: MonthViewProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  // Filter catalysts for this month
  const monthCatalysts = catalysts.filter(c => {
    if (!c.expectedDate) return false
    const d = new Date(c.expectedDate)
    return d.getFullYear() === year && d.getMonth() === monthIndex
  })

  // Group by date
  const byDate: Record<string, Catalyst[]> = {}
  monthCatalysts.forEach(c => {
    const dateKey = c.expectedDate!.split('T')[0]
    if (!byDate[dateKey]) byDate[dateKey] = []
    byDate[dateKey].push(c)
  })

  // Get days in month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()

  const weeks: (number | null)[][] = []
  let currentWeek: (number | null)[] = []

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null)
  }

  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Fill remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === monthIndex &&
    today.getDate() === day

  return (
    <div>
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, index) => {
          if (day === null) {
            return <div key={index} className="min-h-[80px]" />
          }

          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayCatalysts = byDate[dateStr] || []
          const hasHighImportance = dayCatalysts.some(c => c.importance === 'HIGH')

          return (
            <div
              key={index}
              className={cn(
                "min-h-[80px] border rounded-lg p-1 transition-colors",
                isToday(day) && "border-primary bg-primary/5",
                dayCatalysts.length > 0 && "bg-muted/50",
                hasHighImportance && "border-purple-500/50"
              )}
            >
              <div className={cn(
                "text-xs font-medium mb-1",
                isToday(day) && "text-primary"
              )}>
                {day}
              </div>
              <div className="space-y-1">
                {dayCatalysts.slice(0, 3).map((catalyst) => (
                  <div
                    key={catalyst.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                      importanceColors[catalyst.importance]
                    )}
                    title={`${catalyst.ticker}: ${catalyst.title}`}
                  >
                    <span className="font-medium">{catalyst.ticker}</span>
                  </div>
                ))}
                {dayCatalysts.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayCatalysts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface CatalystListItemProps {
  catalyst: Catalyst
}

function CatalystListItem({ catalyst }: CatalystListItemProps) {
  const phaseColor = catalyst.phase ? phaseColors[catalyst.phase] : 'bg-gray-400'

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors",
      catalyst.importance === 'HIGH' && "border-purple-500/30"
    )}>
      <div className={cn(
        "w-2 h-full min-h-[40px] rounded-full",
        phaseColor
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{catalyst.ticker}</span>
          {catalyst.phase && (
            <Badge variant="outline" className="text-xs">
              {catalyst.phase.replace('PHASE', 'P')}
            </Badge>
          )}
          <Badge
            variant={catalyst.importance === 'HIGH' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {catalyst.importance}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {catalyst.title}
        </p>
        {catalyst.drugName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Pill className="h-3 w-3" />
            {catalyst.drugName}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-medium">
          {formatDateShort(catalyst.expectedDate)}
        </div>
        {catalyst.daysUntil !== null && (
          <div className={cn(
            "text-xs",
            catalyst.daysUntil <= 30 ? "text-orange-500 font-medium" :
            catalyst.daysUntil <= 90 ? "text-yellow-600" :
            "text-muted-foreground"
          )}>
            {catalyst.daysUntil <= 0 ? 'Now' : `${catalyst.daysUntil}d`}
          </div>
        )}
      </div>
    </div>
  )
}

export function BiotechCatalystCalendar() {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [importanceFilter, setImportanceFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL')
  const [phaseFilter, setPhaseFilter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCalendarData() {
      try {
        setLoading(true)
        const response = await fetch('/api/biotech-catalysts?timeframe=upcoming&limit=100')

        if (!response.ok) {
          throw new Error('Failed to fetch biotech catalysts')
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching biotech catalysts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarData()
  }, [])

  // Filter catalysts
  const filteredCatalysts = data?.catalysts.filter(c => {
    if (importanceFilter !== 'ALL' && c.importance !== importanceFilter) return false
    if (phaseFilter && c.phase !== phaseFilter) return false
    return true
  }) || []

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Biotech Catalyst Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Biotech Catalyst Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load catalyst calendar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Biotech Catalyst Calendar
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.companiesTracked} companies tracked · {data.totalCount} upcoming catalysts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataSourceIndicator source="clinicaltrials-gov" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="text-center p-2 bg-orange-500/10 rounded-lg">
            <div className="text-xl font-bold text-orange-500">{data.summary.imminent}</div>
            <div className="text-xs text-muted-foreground">Within 90 Days</div>
          </div>
          <div className="text-center p-2 bg-purple-500/10 rounded-lg">
            <div className="text-xl font-bold text-purple-500">{data.summary.highImportance}</div>
            <div className="text-xs text-muted-foreground">High Impact</div>
          </div>
          <div className="text-center p-2 bg-blue-500/10 rounded-lg">
            <div className="text-xl font-bold text-blue-500">{data.summary.phase3Trials}</div>
            <div className="text-xs text-muted-foreground">Phase 3 Trials</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xl font-bold">{data.summary.upcoming}</div>
            <div className="text-xs text-muted-foreground">Total Upcoming</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={importanceFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportanceFilter('ALL')}
            >
              All
            </Button>
            <Button
              variant={importanceFilter === 'HIGH' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportanceFilter('HIGH')}
            >
              High
            </Button>
            <Button
              variant={phaseFilter === 'PHASE3' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPhaseFilter(phaseFilter === 'PHASE3' ? null : 'PHASE3')}
            >
              Phase 3
            </Button>
          </div>

          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {getMonthName(currentMonth)}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'calendar' ? (
          <MonthView catalysts={filteredCatalysts} month={currentMonth} />
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCatalysts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No catalysts match your filters
              </div>
            ) : (
              filteredCatalysts.map(catalyst => (
                <CatalystListItem key={catalyst.id} catalyst={catalyst} />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
