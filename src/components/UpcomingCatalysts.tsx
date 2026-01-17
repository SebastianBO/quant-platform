"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  TrendingUp,
  Banknote,
  Presentation,
  FileText,
  AlertCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Beaker,
  SplitSquareVertical,
  Award,
  Sparkles
} from "lucide-react"

// Event types for the catalyst system
export type CatalystType =
  | 'earnings'
  | 'dividend'
  | 'ex_dividend'
  | 'conference'
  | 'product_launch'
  | 'regulatory'
  | 'stock_split'
  | 'guidance'
  | 'analyst_day'
  | 'shareholder_meeting'
  | 'fda_decision'
  | 'trial_result'

export interface CatalystEvent {
  id: string
  type: CatalystType
  title: string
  description?: string
  date: string // ISO date string
  dateLabel?: string // e.g., "Before Market" or "After Hours"
  isConfirmed: boolean
  importance: 'high' | 'medium' | 'low'
  source?: string
  sourceUrl?: string
  metadata?: Record<string, unknown>
}

// API response type for biotech catalysts
interface BiotechCatalystApiResponse {
  id?: string
  catalystType?: string
  expectedDate?: string
  title?: string
  drugName?: string
  indication?: string
  description?: string
  datePrecision?: 'EXACT' | 'MONTH' | 'QUARTER'
  importance?: 'HIGH' | 'MEDIUM' | 'LOW'
  sourceType?: string
  sourceId?: string
}

interface UpcomingCatalystsProps {
  ticker: string
  companyName?: string
  // Optional pre-fetched data
  earningsDate?: string
  exDividendDate?: string
  dividendDate?: string
  dividendAmount?: number
  splitDate?: string
  splitRatio?: string
  className?: string
  // Server-side events (for SSR)
  initialEvents?: CatalystEvent[]
}

// Icon mapping for catalyst types
const catalystIcons: Record<CatalystType, typeof Calendar> = {
  earnings: TrendingUp,
  dividend: Banknote,
  ex_dividend: Banknote,
  conference: Presentation,
  product_launch: Sparkles,
  regulatory: FileText,
  stock_split: SplitSquareVertical,
  guidance: Award,
  analyst_day: Presentation,
  shareholder_meeting: Calendar,
  fda_decision: Beaker,
  trial_result: Beaker,
}

// Color mapping for catalyst types
const catalystColors: Record<CatalystType, string> = {
  earnings: 'text-[#f4a623] bg-[#f4a623]/10',
  dividend: 'text-[#4ebe96] bg-[#4ebe96]/10',
  ex_dividend: 'text-emerald-500 bg-emerald-500/10',
  conference: 'text-[#479ffa] bg-[#479ffa]/10',
  product_launch: 'text-purple-500 bg-purple-500/10',
  regulatory: 'text-orange-500 bg-orange-500/10',
  stock_split: 'text-cyan-500 bg-cyan-500/10',
  guidance: 'text-indigo-500 bg-indigo-500/10',
  analyst_day: 'text-sky-500 bg-sky-500/10',
  shareholder_meeting: 'text-pink-500 bg-pink-500/10',
  fda_decision: 'text-[#e15241] bg-[#e15241]/10',
  trial_result: 'text-violet-500 bg-violet-500/10',
}

// Label mapping for catalyst types
const catalystLabels: Record<CatalystType, string> = {
  earnings: 'Earnings Report',
  dividend: 'Dividend Payment',
  ex_dividend: 'Ex-Dividend Date',
  conference: 'Conference',
  product_launch: 'Product Launch',
  regulatory: 'Regulatory Decision',
  stock_split: 'Stock Split',
  guidance: 'Guidance Update',
  analyst_day: 'Analyst Day',
  shareholder_meeting: 'Shareholder Meeting',
  fda_decision: 'FDA Decision',
  trial_result: 'Clinical Trial Result',
}

// Helper to calculate days until an event
function getDaysUntil(dateStr: string): number {
  const eventDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Helper to format days until text
function formatDaysUntil(days: number): string {
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `${days} days`
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`
  if (days <= 90) return `${Math.round(days / 30)} months`
  return `${Math.round(days / 30)} months`
}

// Helper to format date nicely
function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

// Generate a unique ID for events
function generateEventId(type: string, date: string, title: string): string {
  return `${type}-${date}-${title.slice(0, 10).replace(/\s/g, '-')}`.toLowerCase()
}

// Single catalyst event card
function CatalystEventCard({ event }: { event: CatalystEvent }) {
  const Icon = catalystIcons[event.type] || Calendar
  const colorClasses = catalystColors[event.type] || 'text-gray-500 bg-gray-500/10'
  const label = catalystLabels[event.type] || event.type
  const daysUntil = getDaysUntil(event.date)
  const isPast = daysUntil < 0
  const isImminent = daysUntil >= 0 && daysUntil <= 7

  return (
    <div className={cn(
      "relative flex items-start gap-4 p-4 rounded-lg border transition-all",
      isPast && "opacity-60",
      isImminent && !isPast && "border-[#f4a623]/50 bg-[#f4a623]/5",
      event.importance === 'high' && !isPast && "border-primary/30",
      !isPast && !isImminent && "border-white/[0.08] hover:border-white/[0.08]/80 hover:bg-white/[0.05]/30"
    )}>
      {/* Icon */}
      <div className={cn(
        "shrink-0 p-2.5 rounded-lg",
        colorClasses
      )}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className="text-xs">
            {label}
          </Badge>
          {event.importance === 'high' && (
            <Badge variant="default" className="text-xs bg-primary/80">
              High Impact
            </Badge>
          )}
          {isImminent && !isPast && (
            <Badge variant="destructive" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Soon
            </Badge>
          )}
          {!event.isConfirmed && (
            <Badge variant="secondary" className="text-xs">
              Estimated
            </Badge>
          )}
        </div>

        <h4 className="font-medium text-white line-clamp-1">
          {event.title}
        </h4>

        {event.description && (
          <p className="text-sm text-[#868f97] mt-1 line-clamp-2">
            {event.description}
          </p>
        )}

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#868f97] hover:text-white mt-2"
          >
            {event.source || 'Source'}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Date and countdown */}
      <div className="shrink-0 text-right">
        <div className="text-sm font-medium">
          {formatEventDate(event.date)}
        </div>
        {event.dateLabel && (
          <div className="text-xs text-[#868f97]">
            {event.dateLabel}
          </div>
        )}
        <div className={cn(
          "text-xs mt-1 font-medium",
          isImminent && !isPast && "text-[#f4a623]",
          isPast && "text-[#868f97]"
        )}>
          {formatDaysUntil(daysUntil)}
        </div>
      </div>
    </div>
  )
}

// Timeline visualization for 90 days
function CatalystTimeline({ events }: { events: CatalystEvent[] }) {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 90)

  // Group events by week
  const weeks: { start: Date; events: CatalystEvent[] }[] = []
  for (let i = 0; i < 13; i++) { // 13 weeks = ~90 days
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() + i * 7)
    weeks.push({ start: weekStart, events: [] })
  }

  // Assign events to weeks
  events.forEach(event => {
    const eventDate = new Date(event.date)
    const daysFromNow = getDaysUntil(event.date)
    if (daysFromNow >= 0 && daysFromNow <= 90) {
      const weekIndex = Math.floor(daysFromNow / 7)
      if (weeks[weekIndex]) {
        weeks[weekIndex].events.push(event)
      }
    }
  })

  return (
    <div className="relative">
      {/* Timeline bar */}
      <div className="flex items-center gap-1 mb-2">
        {weeks.map((week, i) => {
          const hasEvents = week.events.length > 0
          const hasHighImportance = week.events.some(e => e.importance === 'high')

          return (
            <div
              key={i}
              className={cn(
                "flex-1 h-2 rounded-full transition-all",
                hasHighImportance ? "bg-[#f4a623]" :
                hasEvents ? "bg-[#4ebe96]" :
                "bg-white/[0.05]"
              )}
              title={`Week ${i + 1}: ${week.events.length} event(s)`}
            />
          )
        })}
      </div>

      {/* Week labels */}
      <div className="flex justify-between text-xs text-[#868f97]">
        <span>Today</span>
        <span>1 Month</span>
        <span>2 Months</span>
        <span>3 Months</span>
      </div>
    </div>
  )
}

export function UpcomingCatalysts({
  ticker,
  companyName,
  earningsDate,
  exDividendDate,
  dividendDate,
  dividendAmount,
  splitDate,
  splitRatio,
  className,
  initialEvents = [],
}: UpcomingCatalystsProps) {
  const [events, setEvents] = useState<CatalystEvent[]>(initialEvents)
  const [loading, setLoading] = useState(initialEvents.length === 0)
  const [showAll, setShowAll] = useState(false)
  const [biotechEvents, setBiotechEvents] = useState<CatalystEvent[]>([])

  // Build events from props (pre-fetched data)
  useEffect(() => {
    const propEvents: CatalystEvent[] = []
    const name = companyName || ticker

    // Earnings event
    if (earningsDate) {
      const earningsDateObj = new Date(earningsDate)
      if (earningsDateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        propEvents.push({
          id: generateEventId('earnings', earningsDate, `${ticker} Q earnings`),
          type: 'earnings',
          title: `${ticker} Quarterly Earnings Report`,
          description: `${name} is scheduled to report quarterly financial results.`,
          date: earningsDate,
          isConfirmed: true,
          importance: 'high',
        })
      }
    }

    // Ex-dividend event
    if (exDividendDate) {
      const exDivDateObj = new Date(exDividendDate)
      if (exDivDateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        propEvents.push({
          id: generateEventId('ex_dividend', exDividendDate, `${ticker} ex-div`),
          type: 'ex_dividend',
          title: `${ticker} Ex-Dividend Date`,
          description: dividendAmount
            ? `Shareholders must own shares before this date to receive the $${dividendAmount.toFixed(2)} dividend.`
            : `Shareholders must own shares before this date to receive the upcoming dividend.`,
          date: exDividendDate,
          isConfirmed: true,
          importance: 'medium',
        })
      }
    }

    // Dividend payment event
    if (dividendDate && dividendDate !== exDividendDate) {
      const divDateObj = new Date(dividendDate)
      if (divDateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        propEvents.push({
          id: generateEventId('dividend', dividendDate, `${ticker} dividend`),
          type: 'dividend',
          title: `${ticker} Dividend Payment`,
          description: dividendAmount
            ? `$${dividendAmount.toFixed(2)} per share dividend payment to eligible shareholders.`
            : `Dividend payment to eligible shareholders.`,
          date: dividendDate,
          isConfirmed: true,
          importance: 'medium',
        })
      }
    }

    // Stock split event
    if (splitDate && splitRatio) {
      const splitDateObj = new Date(splitDate)
      if (splitDateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        propEvents.push({
          id: generateEventId('stock_split', splitDate, `${ticker} split`),
          type: 'stock_split',
          title: `${ticker} Stock Split (${splitRatio})`,
          description: `${name} will execute a ${splitRatio} stock split.`,
          date: splitDate,
          isConfirmed: true,
          importance: 'high',
        })
      }
    }

    // Merge with initial events and biotech events
    const allEvents = [...propEvents, ...initialEvents, ...biotechEvents]

    // Sort by date and deduplicate
    const uniqueEvents = Array.from(
      new Map(allEvents.map(e => [e.id, e])).values()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setEvents(uniqueEvents)
    setLoading(false)
  }, [ticker, companyName, earningsDate, exDividendDate, dividendDate, dividendAmount, splitDate, splitRatio, initialEvents, biotechEvents])

  // Fetch biotech catalysts if available
  useEffect(() => {
    async function fetchBiotechCatalysts() {
      try {
        const response = await fetch(`/api/biotech-catalysts?ticker=${ticker}&timeframe=upcoming`)
        if (!response.ok) return

        const data = await response.json()
        if (data.catalysts && data.catalysts.length > 0) {
          const biotechCatalystEvents: CatalystEvent[] = data.catalysts
            .filter((c: BiotechCatalystApiResponse) => c.expectedDate)
            .map((c: BiotechCatalystApiResponse) => ({
              id: c.id || generateEventId(c.catalystType?.toLowerCase() || 'regulatory', c.expectedDate!, c.title || 'catalyst'),
              type: c.catalystType === 'FDA_DECISION' || c.catalystType === 'PDUFA_DATE'
                ? 'fda_decision'
                : c.catalystType === 'TRIAL_RESULT' || c.catalystType === 'DATA_READOUT'
                ? 'trial_result'
                : 'regulatory' as CatalystType,
              title: c.title,
              description: c.drugName
                ? `${c.drugName}${c.indication ? ` for ${c.indication}` : ''}`
                : c.description,
              date: c.expectedDate!,
              dateLabel: c.datePrecision === 'MONTH' ? 'Estimated Month' :
                        c.datePrecision === 'QUARTER' ? 'Estimated Quarter' : undefined,
              isConfirmed: c.datePrecision === 'EXACT',
              importance: c.importance === 'HIGH' ? 'high' : c.importance === 'LOW' ? 'low' : 'medium',
              source: 'ClinicalTrials.gov',
              sourceUrl: c.sourceType === 'CLINICAL_TRIAL'
                ? `https://clinicaltrials.gov/study/${c.sourceId}`
                : undefined,
            } as CatalystEvent))

          setBiotechEvents(biotechCatalystEvents)
        }
      } catch (error) {
        // Silently fail for non-biotech stocks
        console.debug('No biotech catalysts for', ticker)
      }
    }

    fetchBiotechCatalysts()
  }, [ticker])

  // Filter to upcoming events (next 90 days) and recent past events (7 days)
  const filteredEvents = useMemo(() => {
    const now = new Date()
    const pastLimit = new Date(now)
    pastLimit.setDate(pastLimit.getDate() - 7)
    const futureLimit = new Date(now)
    futureLimit.setDate(futureLimit.getDate() + 90)

    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= pastLimit && eventDate <= futureLimit
    })
  }, [events])

  // Events to display (limited unless showAll)
  const displayEvents = showAll ? filteredEvents : filteredEvents.slice(0, 5)

  // Event counts by type
  const eventCounts = useMemo(() => {
    const counts: Partial<Record<CatalystType, number>> = {}
    filteredEvents.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1
    })
    return counts
  }, [filteredEvents])

  // High importance events count
  const highImportanceCount = filteredEvents.filter(e => e.importance === 'high' && getDaysUntil(e.date) >= 0).length

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#4ebe96]" />
            Upcoming Events for {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/[0.05] animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#4ebe96]" />
              Upcoming Events for {ticker}
            </CardTitle>
            <p className="text-sm text-[#868f97] mt-1">
              Key dates and catalysts for the next 90 days
            </p>
          </div>
          {highImportanceCount > 0 && (
            <Badge variant="default" className="bg-[#f4a623]">
              {highImportanceCount} High Impact
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline visualization */}
        {filteredEvents.length > 0 && (
          <CatalystTimeline events={filteredEvents} />
        )}

        {/* Event type summary */}
        {Object.keys(eventCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventCounts).map(([type, count]) => {
              const Icon = catalystIcons[type as CatalystType]
              const colorClass = catalystColors[type as CatalystType]?.split(' ')[0]
              return (
                <div
                  key={type}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] rounded-full text-xs"
                >
                  <Icon className={cn("h-3.5 w-3.5", colorClass)} />
                  <span>{count} {catalystLabels[type as CatalystType]}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Events list */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-[#868f97]">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming events found for {ticker}</p>
            <p className="text-sm mt-1">
              Check back closer to earnings season for updates
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <CatalystEventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Show more button */}
        {filteredEvents.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-[#868f97] hover:text-white flex items-center justify-center gap-1 transition-colors duration-100"
          >
            {showAll ? 'Show Less' : `Show All ${filteredEvents.length} Events`}
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              showAll && "rotate-90"
            )} />
          </button>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[#868f97] text-center pt-2 border-t">
          Event dates are subject to change. Always verify with official company announcements.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Generate EventSchema structured data for Google rich results
 * This should be rendered in the page head as JSON-LD
 */
export function generateEventSchemas(
  ticker: string,
  companyName: string,
  events: CatalystEvent[],
  baseUrl: string = 'https://lician.com'
): object[] {
  return events
    .filter(event => getDaysUntil(event.date) >= 0) // Only future events
    .slice(0, 10) // Limit to 10 events for structured data
    .map(event => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description || `${catalystLabels[event.type]} for ${companyName} (${ticker})`,
      startDate: event.date,
      endDate: event.date, // Single-day events
      eventStatus: event.isConfirmed
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventRescheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: `${baseUrl}/stock/${ticker.toLowerCase()}`,
      },
      organizer: {
        '@type': 'Corporation',
        name: companyName,
        url: `${baseUrl}/stock/${ticker.toLowerCase()}`,
      },
      performer: {
        '@type': 'Corporation',
        name: companyName,
      },
      about: {
        '@type': 'FinancialProduct',
        name: `${ticker} Stock`,
      },
    }))
}

export default memo(UpcomingCatalysts)
