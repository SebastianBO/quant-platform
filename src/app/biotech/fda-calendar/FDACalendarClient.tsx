"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Filter, Clock, AlertTriangle, CheckCircle, TrendingUp, Pill } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'

interface Catalyst {
  id: string
  ticker: string
  companyName: string
  catalystType: 'TRIAL_RESULT' | 'FDA_DECISION' | 'PDUFA_DATE' | 'PHASE_TRANSITION' | 'DATA_READOUT'
  title: string
  description: string
  expectedDate: string | null
  datePrecision: 'EXACT' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ESTIMATED'
  drugName: string | null
  indication: string | null
  phase: string | null
  sourceType: 'CLINICAL_TRIAL' | 'FDA' | 'COMPANY'
  sourceId: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'UPCOMING' | 'IMMINENT' | 'PAST'
  daysUntil: number | null
}

type CatalystFilter = 'all' | 'PDUFA_DATE' | 'FDA_DECISION' | 'DATA_READOUT' | 'TRIAL_RESULT'
type ImportanceFilter = 'all' | 'HIGH' | 'MEDIUM' | 'LOW'
type PhaseFilter = 'all' | 'PHASE3' | 'PHASE2' | 'PHASE1'

export default function FDACalendarClient() {
  const [catalysts, setCatalysts] = useState<Catalyst[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [catalystFilter, setCatalystFilter] = useState<CatalystFilter>('all')
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>('all')
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all')
  const [showImminentOnly, setShowImminentOnly] = useState(false)

  useEffect(() => {
    fetchCatalysts()
  }, [])

  const fetchCatalysts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/biotech-catalysts?timeframe=upcoming&limit=100')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.catalysts) {
        setCatalysts(data.catalysts)
      }
    } catch (err) {
      console.error('Error fetching catalysts:', err)
      setError('Failed to fetch FDA calendar data')
    }
    setLoading(false)
  }

  // Filter catalysts
  const filteredCatalysts = catalysts.filter(c => {
    if (showImminentOnly && c.status !== 'IMMINENT') return false
    if (catalystFilter !== 'all' && c.catalystType !== catalystFilter) return false
    if (importanceFilter !== 'all' && c.importance !== importanceFilter) return false
    if (phaseFilter !== 'all' && c.phase !== phaseFilter) return false
    return true
  })

  // Group by month
  const groupedByMonth = filteredCatalysts.reduce((acc, c) => {
    if (!c.expectedDate) {
      if (!acc['TBD']) acc['TBD'] = []
      acc['TBD'].push(c)
      return acc
    }
    const date = new Date(c.expectedDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(c)
    return acc
  }, {} as Record<string, Catalyst[]>)

  const sortedMonths = Object.keys(groupedByMonth).filter(k => k !== 'TBD').sort()
  if (groupedByMonth['TBD']) sortedMonths.push('TBD')

  // Statistics
  const imminentCount = catalysts.filter(c => c.status === 'IMMINENT').length
  const highImportanceCount = catalysts.filter(c => c.importance === 'HIGH').length
  const phase3Count = catalysts.filter(c => c.phase === 'PHASE3').length

  const formatMonthHeader = (monthKey: string) => {
    if (monthKey === 'TBD') return 'Date TBD'
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getCatalystTypeIcon = (type: string) => {
    switch (type) {
      case 'PDUFA_DATE': return <Calendar className="w-4 h-4" />
      case 'FDA_DECISION': return <CheckCircle className="w-4 h-4" />
      case 'DATA_READOUT': return <TrendingUp className="w-4 h-4" />
      case 'TRIAL_RESULT': return <Pill className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getCatalystTypeLabel = (type: string) => {
    switch (type) {
      case 'PDUFA_DATE': return 'PDUFA Date'
      case 'FDA_DECISION': return 'FDA Decision'
      case 'DATA_READOUT': return 'Data Readout'
      case 'TRIAL_RESULT': return 'Trial Result'
      case 'PHASE_TRANSITION': return 'Phase Transition'
      default: return type
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'HIGH': return 'bg-red-600/20 text-red-500 border-red-500/30'
      case 'MEDIUM': return 'bg-yellow-600/20 text-yellow-500 border-yellow-500/30'
      case 'LOW': return 'bg-gray-600/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-600/20 text-gray-400'
    }
  }

  const getStatusBadge = (status: string, daysUntil: number | null) => {
    if (status === 'IMMINENT') {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-600/20 text-orange-500 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {daysUntil !== null ? `${daysUntil}d` : 'Soon'}
        </span>
      )
    }
    return null
  }

  // Generate schema
  const generateEventListSchema = () => {
    const events = filteredCatalysts.slice(0, 50).map((catalyst, index) => ({
      '@type': 'Event',
      position: index + 1,
      name: `${catalyst.ticker} - ${catalyst.title}`,
      description: catalyst.description,
      startDate: catalyst.expectedDate || undefined,
      location: {
        '@type': 'VirtualLocation',
        name: 'FDA/ClinicalTrials.gov'
      },
      organizer: {
        '@type': 'Organization',
        name: catalyst.companyName
      }
    }))

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'FDA Calendar & Biotech Catalysts',
      description: 'Upcoming FDA approvals, PDUFA dates, and clinical trial results',
      numberOfItems: events.length,
      itemListElement: events,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-600/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchCatalysts}
          className="mt-4 px-4 py-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEventListSchema()) }}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-green-500">{catalysts.length}</p>
          <p className="text-sm text-muted-foreground">Total Catalysts</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-orange-500">{imminentCount}</p>
          <p className="text-sm text-muted-foreground">Within 90 Days</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-red-500">{highImportanceCount}</p>
          <p className="text-sm text-muted-foreground">High Impact</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-blue-500">{phase3Count}</p>
          <p className="text-sm text-muted-foreground">Phase 3 Trials</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={catalystFilter}
            onChange={(e) => setCatalystFilter(e.target.value as CatalystFilter)}
            className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm border border-border"
          >
            <option value="all">All Types</option>
            <option value="PDUFA_DATE">PDUFA Dates</option>
            <option value="FDA_DECISION">FDA Decisions</option>
            <option value="DATA_READOUT">Data Readouts</option>
            <option value="TRIAL_RESULT">Trial Results</option>
          </select>

          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value as ImportanceFilter)}
            className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm border border-border"
          >
            <option value="all">All Importance</option>
            <option value="HIGH">High Impact</option>
            <option value="MEDIUM">Medium Impact</option>
            <option value="LOW">Low Impact</option>
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as PhaseFilter)}
            className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm border border-border"
          >
            <option value="all">All Phases</option>
            <option value="PHASE3">Phase 3</option>
            <option value="PHASE2">Phase 2</option>
            <option value="PHASE1">Phase 1</option>
          </select>

          <button
            onClick={() => setShowImminentOnly(!showImminentOnly)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              showImminentOnly
                ? 'bg-orange-600/20 text-orange-500 border-orange-500/30'
                : 'bg-secondary text-foreground border-border hover:border-orange-500/30'
            }`}
          >
            Within 90 Days
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredCatalysts.length} of {catalysts.length} catalysts
      </p>

      {/* Calendar View */}
      {sortedMonths.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No catalysts match your filters
        </div>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map(monthKey => (
            <div key={monthKey}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                {formatMonthHeader(monthKey)}
                <span className="text-sm font-normal text-muted-foreground">
                  ({groupedByMonth[monthKey].length} events)
                </span>
              </h3>
              <div className="space-y-3">
                {groupedByMonth[monthKey]
                  .sort((a, b) => {
                    if (!a.expectedDate) return 1
                    if (!b.expectedDate) return -1
                    return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
                  })
                  .map(catalyst => (
                    <div
                      key={catalyst.id}
                      className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Date Column */}
                        <div className="flex-shrink-0 w-20 text-center">
                          {catalyst.expectedDate ? (
                            <>
                              <p className="text-2xl font-bold text-green-500">
                                {new Date(catalyst.expectedDate).getDate()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(catalyst.expectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                              </p>
                              {catalyst.datePrecision !== 'EXACT' && (
                                <p className="text-xs text-yellow-500 mt-1">~{catalyst.datePrecision}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-lg font-bold text-muted-foreground">TBD</p>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Link
                              href={`/stock/${catalyst.ticker.toLowerCase()}`}
                              className="text-lg font-bold text-green-500 hover:underline"
                            >
                              {catalyst.ticker}
                            </Link>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-sm text-muted-foreground truncate">
                              {catalyst.companyName}
                            </span>
                            {getStatusBadge(catalyst.status, catalyst.daysUntil)}
                          </div>

                          <h4 className="font-medium mb-2 line-clamp-2">{catalyst.title}</h4>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-full">
                              {getCatalystTypeIcon(catalyst.catalystType)}
                              {getCatalystTypeLabel(catalyst.catalystType)}
                            </span>
                            {catalyst.phase && (
                              <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-500 rounded-full">
                                {catalyst.phase.replace('PHASE', 'Phase ')}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full border ${getImportanceColor(catalyst.importance)}`}>
                              {catalyst.importance} Impact
                            </span>
                          </div>

                          {(catalyst.drugName || catalyst.indication) && (
                            <p className="text-sm text-muted-foreground">
                              {catalyst.drugName && <span className="font-medium">{catalyst.drugName}</span>}
                              {catalyst.drugName && catalyst.indication && ' - '}
                              {catalyst.indication}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-2">
                          <Link
                            href={`/stock/${catalyst.ticker.toLowerCase()}`}
                            className="px-3 py-2 bg-green-600/20 text-green-500 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
                          >
                            View Stock
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
