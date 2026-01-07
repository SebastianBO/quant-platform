"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, TrendingUp, Calendar, AlertTriangle, ChevronUp, ChevronDown, Pill } from 'lucide-react'
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

interface CompanyStats {
  ticker: string
  companyName: string
  catalystCount: number
  imminentCount: number
  highImportanceCount: number
  phase3Count: number
  nearestCatalyst: Catalyst | null
  catalysts: Catalyst[]
}

type SortField = 'ticker' | 'catalystCount' | 'imminentCount' | 'daysUntil' | 'phase3Count'
type SortOrder = 'asc' | 'desc'

export default function BiotechScreenerClient() {
  const [catalysts, setCatalysts] = useState<Catalyst[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [minCatalysts, setMinCatalysts] = useState<number>(1)
  const [showImminentOnly, setShowImminentOnly] = useState(false)
  const [showHighImpactOnly, setShowHighImpactOnly] = useState(false)
  const [phase3Only, setPhase3Only] = useState(false)
  const [sortField, setSortField] = useState<SortField>('imminentCount')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)

  useEffect(() => {
    fetchCatalysts()
  }, [])

  const fetchCatalysts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/biotech-catalysts?timeframe=upcoming&limit=200')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.catalysts) {
        setCatalysts(data.catalysts)
      }
    } catch (err) {
      console.error('Error fetching catalysts:', err)
      setError('Failed to fetch biotech data')
    }
    setLoading(false)
  }

  // Group catalysts by company
  const companyStats = useMemo(() => {
    const grouped: Record<string, CompanyStats> = {}

    for (const catalyst of catalysts) {
      if (!grouped[catalyst.ticker]) {
        grouped[catalyst.ticker] = {
          ticker: catalyst.ticker,
          companyName: catalyst.companyName,
          catalystCount: 0,
          imminentCount: 0,
          highImportanceCount: 0,
          phase3Count: 0,
          nearestCatalyst: null,
          catalysts: [],
        }
      }

      const stats = grouped[catalyst.ticker]
      stats.catalystCount++
      stats.catalysts.push(catalyst)

      if (catalyst.status === 'IMMINENT') stats.imminentCount++
      if (catalyst.importance === 'HIGH') stats.highImportanceCount++
      if (catalyst.phase === 'PHASE3') stats.phase3Count++

      // Track nearest catalyst
      if (catalyst.daysUntil !== null && catalyst.daysUntil >= 0) {
        if (!stats.nearestCatalyst ||
            (stats.nearestCatalyst.daysUntil === null) ||
            (catalyst.daysUntil < stats.nearestCatalyst.daysUntil)) {
          stats.nearestCatalyst = catalyst
        }
      }
    }

    return Object.values(grouped)
  }, [catalysts])

  // Filter and sort
  const filteredStats = useMemo(() => {
    let result = companyStats

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.ticker.toLowerCase().includes(query) ||
        s.companyName.toLowerCase().includes(query)
      )
    }

    // Min catalysts filter
    result = result.filter(s => s.catalystCount >= minCatalysts)

    // Imminent filter
    if (showImminentOnly) {
      result = result.filter(s => s.imminentCount > 0)
    }

    // High impact filter
    if (showHighImpactOnly) {
      result = result.filter(s => s.highImportanceCount > 0)
    }

    // Phase 3 filter
    if (phase3Only) {
      result = result.filter(s => s.phase3Count > 0)
    }

    // Sort
    result.sort((a, b) => {
      let compare = 0
      switch (sortField) {
        case 'ticker':
          compare = a.ticker.localeCompare(b.ticker)
          break
        case 'catalystCount':
          compare = a.catalystCount - b.catalystCount
          break
        case 'imminentCount':
          compare = a.imminentCount - b.imminentCount
          break
        case 'phase3Count':
          compare = a.phase3Count - b.phase3Count
          break
        case 'daysUntil':
          const aDays = a.nearestCatalyst?.daysUntil ?? 999
          const bDays = b.nearestCatalyst?.daysUntil ?? 999
          compare = aDays - bDays
          break
      }
      return sortOrder === 'asc' ? compare : -compare
    })

    return result
  }, [companyStats, searchQuery, minCatalysts, showImminentOnly, showHighImpactOnly, phase3Only, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Generate schema
  const generateItemListSchema = () => {
    const items = filteredStats.slice(0, 50).map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${company.ticker} - ${company.companyName}`,
      url: `${SITE_URL}/stock/${company.ticker.toLowerCase()}`,
      description: `${company.catalystCount} catalysts, ${company.imminentCount} within 90 days`,
    }))

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Biotech Stocks with Upcoming Catalysts',
      description: 'Biotech and pharmaceutical stocks screened by upcoming FDA events and clinical trial readouts',
      numberOfItems: items.length,
      itemListElement: items,
    }
  }

  // Stats
  const totalCompanies = companyStats.length
  const companiesWithImminent = companyStats.filter(s => s.imminentCount > 0).length
  const companiesWithPhase3 = companyStats.filter(s => s.phase3Count > 0).length

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateItemListSchema()) }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-green-500">{totalCompanies}</p>
          <p className="text-sm text-muted-foreground">Companies Tracked</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-blue-500">{catalysts.length}</p>
          <p className="text-sm text-muted-foreground">Total Catalysts</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-orange-500">{companiesWithImminent}</p>
          <p className="text-sm text-muted-foreground">Imminent Events</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-purple-500">{companiesWithPhase3}</p>
          <p className="text-sm text-muted-foreground">Phase 3 Stocks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Screen Biotech Stocks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Min Catalysts */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Min Catalysts:</label>
            <select
              value={minCatalysts}
              onChange={(e) => setMinCatalysts(parseInt(e.target.value))}
              className="bg-secondary text-foreground px-3 py-2 rounded-lg border border-border flex-1"
            >
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImminentOnly(!showImminentOnly)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              showImminentOnly
                ? 'bg-orange-600/20 text-orange-500 border-orange-500/30'
                : 'bg-secondary text-foreground border-border hover:border-orange-500/30'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Within 90 Days
          </button>

          <button
            onClick={() => setShowHighImpactOnly(!showHighImpactOnly)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              showHighImpactOnly
                ? 'bg-red-600/20 text-red-500 border-red-500/30'
                : 'bg-secondary text-foreground border-border hover:border-red-500/30'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            High Impact
          </button>

          <button
            onClick={() => setPhase3Only(!phase3Only)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              phase3Only
                ? 'bg-purple-600/20 text-purple-500 border-purple-500/30'
                : 'bg-secondary text-foreground border-border hover:border-purple-500/30'
            }`}
          >
            <Pill className="w-4 h-4 inline mr-1" />
            Phase 3 Only
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredStats.length} of {companyStats.length} biotech companies
      </p>

      {/* Results Table */}
      {filteredStats.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No biotech stocks match your filters
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th
                    className="text-left py-3 px-4 font-medium cursor-pointer hover:text-green-500"
                    onClick={() => handleSort('ticker')}
                  >
                    <span className="flex items-center gap-1">
                      Stock <SortIcon field="ticker" />
                    </span>
                  </th>
                  <th
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:text-green-500"
                    onClick={() => handleSort('catalystCount')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Catalysts <SortIcon field="catalystCount" />
                    </span>
                  </th>
                  <th
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:text-green-500"
                    onClick={() => handleSort('imminentCount')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Imminent <SortIcon field="imminentCount" />
                    </span>
                  </th>
                  <th
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:text-green-500"
                    onClick={() => handleSort('phase3Count')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Phase 3 <SortIcon field="phase3Count" />
                    </span>
                  </th>
                  <th
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:text-green-500"
                    onClick={() => handleSort('daysUntil')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Next Event <SortIcon field="daysUntil" />
                    </span>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((company) => (
                  <>
                    <tr
                      key={company.ticker}
                      className="border-t border-border/50 hover:bg-secondary/30 cursor-pointer"
                      onClick={() => setExpandedTicker(expandedTicker === company.ticker ? null : company.ticker)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-500">{company.ticker}</span>
                          <span className="text-muted-foreground text-xs truncate max-w-[150px]">
                            {company.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-500 rounded-full text-xs font-medium">
                          {company.catalystCount}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {company.imminentCount > 0 ? (
                          <span className="px-2 py-1 bg-orange-600/20 text-orange-500 rounded-full text-xs font-medium">
                            {company.imminentCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {company.phase3Count > 0 ? (
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-500 rounded-full text-xs font-medium">
                            {company.phase3Count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {company.nearestCatalyst ? (
                          <span className={`font-medium ${
                            (company.nearestCatalyst.daysUntil ?? 999) <= 30 ? 'text-red-500' :
                            (company.nearestCatalyst.daysUntil ?? 999) <= 90 ? 'text-orange-500' :
                            'text-muted-foreground'
                          }`}>
                            {company.nearestCatalyst.daysUntil}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground">TBD</span>
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Link
                          href={`/stock/${company.ticker.toLowerCase()}`}
                          className="px-3 py-1 bg-green-600/20 text-green-500 rounded-lg text-xs hover:bg-green-600/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    {/* Expanded catalysts */}
                    {expandedTicker === company.ticker && (
                      <tr className="bg-secondary/20">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-3">Upcoming Catalysts for {company.ticker}:</p>
                            {company.catalysts
                              .sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999))
                              .slice(0, 5)
                              .map((catalyst) => (
                                <div key={catalyst.id} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                                  <div className="flex-shrink-0 text-center w-16">
                                    {catalyst.expectedDate ? (
                                      <p className="text-sm font-medium">
                                        {new Date(catalyst.expectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">TBD</p>
                                    )}
                                    {catalyst.daysUntil !== null && (
                                      <p className={`text-xs ${catalyst.daysUntil <= 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {catalyst.daysUntil}d
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{catalyst.title}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {catalyst.phase && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-500 rounded">
                                          {catalyst.phase.replace('PHASE', 'P')}
                                        </span>
                                      )}
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        catalyst.importance === 'HIGH' ? 'bg-red-600/20 text-red-500' :
                                        catalyst.importance === 'MEDIUM' ? 'bg-yellow-600/20 text-yellow-500' :
                                        'bg-gray-600/20 text-gray-400'
                                      }`}>
                                        {catalyst.importance}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
