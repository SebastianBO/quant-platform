"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Building2, TrendingUp, TrendingDown, Plus, Minus,
  Search, ArrowUpRight, ArrowDownRight, PieChart,
  Briefcase, ChevronRight, X, Loader2, Database, Globe,
  Gauge, AlertTriangle, Target, Activity
} from "lucide-react"
import Link from "next/link"

interface Holder {
  investor: string
  investorType: string
  shares: number
  value: number | null
  percentOwnership: number
  portfolioPercent: number | null
  changeInShares: number
  changePercent: number
  isNew: boolean
  filingDate: string
  reportDate: string
}

interface RawHoldingResponse {
  ticker?: string
  cusip?: string
  issuer?: string
  class?: string
  shares: number
  value: number
  portfolioPercent?: number
}

interface ConcentrationData {
  hhi: number
  hhiNormalized: number
  top5Percent: number
  top10Percent: number
  effectiveHolders: number
  rating: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
}

interface InstitutionalData {
  ticker: string
  summary: {
    totalInstitutionalHolders: number
    totalShares: number
    totalValue: number
    increasedPositions: number
    decreasedPositions: number
    unchangedPositions: number
    newPositions: number
    avgPosition: number
    holdersByType: Record<string, { count: number; value: number }>
    flowScore?: number
    flowSignal?: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
    concentration?: ConcentrationData
  }
  holders: Holder[]
  increasedHolders: Holder[]
  decreasedHolders: Holder[]
  topHolders: Holder[]
}

interface InvestorData {
  investor: string
  investorType: string
  summary: {
    totalAUM: number
    totalPositions: number
    increasedPositions: number
    decreasedPositions: number
    newPositions: number
    reportDate: string
  }
  holdings: {
    ticker: string
    cusip?: string
    issuer?: string
    titleOfClass?: string
    shares: number
    value: number
    portfolioPercent: number
    percentOfCompany: number | null
    changeInShares: number
    changePercent: number
    isNew: boolean
    reportDate: string
  }[]
  source?: string
  filing?: {
    reportDate: string
    filingDate: string
  }
  availableQuarters?: { reportDate: string; filingDate: string }[]
}

type DataSource = 'auto' | 'sec-edgar' | 'financial-datasets'

interface InvestorSearch {
  name: string
  rawName: string
  type: string
}

export default function InstitutionalOwnership({ ticker }: { ticker: string }) {
  const [data, setData] = useState<InstitutionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorData | null>(null)
  const [investorLoading, setInvestorLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<InvestorSearch[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [dataSource, setDataSource] = useState<DataSource>('auto')

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/institutional?ticker=${ticker}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching institutional data:', error)
    }
    setLoading(false)
  }

  // Debounced search
  const searchInstitutions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/institutional?type=search&search=${encodeURIComponent(query)}`)
      const result = await response.json()
      setSearchResults(result.investors || [])
    } catch (error) {
      console.error('Search error:', error)
    }
    setSearchLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInstitutions(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchInstitutions])

  const fetchInvestorDetails = async (investorName: string, source: DataSource = dataSource) => {
    setInvestorLoading(true)
    try {
      // If SEC data source is selected, fetch directly from SEC 13F API
      if (source === 'sec-edgar') {
        const response = await fetch(`/api/sec-13f?investor=${encodeURIComponent(investorName)}`)
        const result = await response.json()
        if (result.holdings && result.holdings.length > 0) {
          setSelectedInvestor({
            investor: result.institution?.name || investorName,
            investorType: classifyInstitutionType(investorName),
            source: 'sec-edgar',
            summary: {
              totalAUM: result.summary?.totalValue || 0,
              totalPositions: result.summary?.totalPositions || 0,
              increasedPositions: 0,
              decreasedPositions: 0,
              newPositions: 0,
              reportDate: result.filing?.reportDate || ''
            },
            holdings: result.holdings.map((h: RawHoldingResponse) => ({
              ticker: h.ticker || h.cusip,
              cusip: h.cusip,
              issuer: h.issuer,
              titleOfClass: h.class,
              shares: h.shares,
              value: h.value,
              portfolioPercent: h.portfolioPercent,
              percentOfCompany: null,
              changeInShares: 0,
              changePercent: 0,
              isNew: false,
              reportDate: result.filing?.reportDate || ''
            })),
            filing: result.filing,
            availableQuarters: result.availableQuarters
          })
          setInvestorLoading(false)
          return
        }
      }

      // Default: use institutional API (which tries Financial Datasets first, then SEC)
      const response = await fetch(`/api/institutional?type=investor&investor=${encodeURIComponent(investorName)}`)
      const result = await response.json()
      setSelectedInvestor(result)
    } catch (error) {
      console.error('Error fetching investor details:', error)
    }
    setInvestorLoading(false)
  }

  // Simple institution type classifier
  const classifyInstitutionType = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('vanguard') || lowerName.includes('blackrock') || lowerName.includes('state street') || lowerName.includes('fidelity')) return 'Index Fund'
    if (lowerName.includes('hedge') || lowerName.includes('capital management') || lowerName.includes('advisors')) return 'Hedge Fund'
    if (lowerName.includes('pension') || lowerName.includes('retirement')) return 'Pension Fund'
    if (lowerName.includes('bank') || lowerName.includes('morgan') || lowerName.includes('goldman')) return 'Bank'
    if (lowerName.includes('berkshire')) return 'Conglomerate'
    if (lowerName.includes('norges') || lowerName.includes('sovereign')) return 'Sovereign Wealth'
    return 'Investment Manager'
  }

  const formatValue = (value: number | null) => {
    if (value === null) return '-'
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const formatShares = (shares: number) => {
    if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}B`
    if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
    if (shares >= 1e3) return `${(shares / 1e3).toFixed(1)}K`
    return shares.toLocaleString()
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Index Fund': 'bg-[#479ffa]/20 text-blue-400',
      'Hedge Fund': 'bg-purple-500/20 text-purple-400',
      'Pension Fund': 'bg-orange-500/20 text-orange-400',
      'Bank': 'bg-emerald-500/20 text-emerald-400',
      'Mutual Fund': 'bg-cyan-500/20 text-cyan-400',
      'Insurance': 'bg-yellow-500/20 text-yellow-400',
      'Conglomerate': 'bg-[#e15241]/20 text-red-400',
      'Sovereign Wealth': 'bg-pink-500/20 text-pink-400',
      'Investment Manager': 'bg-gray-500/20 text-gray-400'
    }
    return colors[type] || 'bg-white/[0.05] text-white'
  }

  // Format investor name properly
  const formatInvestorName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  // Check if a ticker is a valid symbol (not a CUSIP)
  const isValidTicker = (ticker: string) => {
    if (!ticker) return false
    // CUSIPs are 9 chars, mostly digits; tickers are 1-5 chars, mostly letters
    return ticker.length <= 5 && /^[A-Z.]+$/.test(ticker)
  }

  // Investor Detail Modal/Panel
  if (selectedInvestor) {
    const hasData = selectedInvestor.holdings && selectedInvestor.holdings.length > 0

    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInvestor(null)}
                className="mb-2 -ml-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Holders
              </Button>
              <CardTitle className="text-lg">{formatInvestorName(selectedInvestor.investor)}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(selectedInvestor.investorType)}`}>
                  {selectedInvestor.investorType}
                </span>
                {selectedInvestor.source && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                    {selectedInvestor.source === 'sec-edgar' ? <Database className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {selectedInvestor.source === 'sec-edgar' ? 'SEC EDGAR' : 'Financial Datasets'}
                  </span>
                )}
              </div>
            </div>
            {/* Data Source Toggle */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-[#868f97]">Data Source</span>
              <div className="flex gap-1">
                <Button
                  variant={dataSource === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setDataSource('auto')
                    fetchInvestorDetails(selectedInvestor.investor.toUpperCase().replace(/ /g, '_'), 'auto')
                  }}
                >
                  Auto
                </Button>
                <Button
                  variant={dataSource === 'sec-edgar' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setDataSource('sec-edgar')
                    fetchInvestorDetails(selectedInvestor.investor.toUpperCase().replace(/ /g, '_'), 'sec-edgar')
                  }}
                >
                  <Database className="w-3 h-3 mr-1" />
                  SEC
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {investorLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !hasData ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-[#868f97] opacity-50" />
              <p className="text-[#868f97] mb-2">
                Detailed holdings data not available for this institution
              </p>
              <p className="text-xs text-[#868f97]">
                Full portfolio data is available for select institutions including Berkshire Hathaway, BlackRock, and others.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvestor(null)}
                >
                  Back to Holders List
                </Button>
                {dataSource !== 'sec-edgar' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setDataSource('sec-edgar')
                      fetchInvestorDetails(selectedInvestor.investor.toUpperCase().replace(/ /g, '_'), 'sec-edgar')
                    }}
                  >
                    <Database className="w-3 h-3 mr-1" />
                    Try SEC Data
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Filing Info */}
              {selectedInvestor.filing && (
                <div className="mb-4 p-2 bg-white/[0.02] rounded text-xs text-[#868f97] flex items-center justify-between">
                  <span>Report Date: {selectedInvestor.filing.reportDate}</span>
                  <span>Filed: {selectedInvestor.filing.filingDate}</span>
                </div>
              )}

              {/* Investor Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                  <p className="text-xl font-bold">{formatValue(selectedInvestor.summary.totalAUM)}</p>
                  <p className="text-xs text-[#868f97]">Total 13F AUM</p>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                  <p className="text-xl font-bold">{selectedInvestor.summary.totalPositions}</p>
                  <p className="text-xs text-[#868f97]">Positions</p>
                </div>
                <div className="p-3 bg-[#4ebe96]/10 rounded-lg text-center">
                  <p className="text-xl font-bold text-[#4ebe96]">{selectedInvestor.summary.increasedPositions}</p>
                  <p className="text-xs text-[#868f97]">Increased</p>
                </div>
                <div className="p-3 bg-[#e15241]/10 rounded-lg text-center">
                  <p className="text-xl font-bold text-[#e15241]">{selectedInvestor.summary.decreasedPositions}</p>
                  <p className="text-xs text-[#868f97]">Decreased</p>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs text-[#868f97] font-medium border-b border-white/[0.08]">
                  <div className="col-span-4">Holding</div>
                  <div className="col-span-2 text-right">Value</div>
                  <div className="col-span-2 text-right">% Portfolio</div>
                  <div className="col-span-2 text-right">Shares</div>
                  <div className="col-span-2 text-right">Change</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {selectedInvestor.holdings.map((h, i) => {
                    const isSECData = selectedInvestor.source === 'sec-edgar'
                    const tickerSymbol = h.ticker && isValidTicker(h.ticker) ? h.ticker : null
                    const displayName = h.issuer || h.ticker

                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 px-2 py-2 text-sm rounded hover:bg-white/[0.08] transition-colors duration-100"
                      >
                        <div className="col-span-4 font-medium">
                          <div className="flex items-center gap-2">
                            {tickerSymbol ? (
                              <Link
                                href={`/stock/${tickerSymbol}`}
                                className="text-primary hover:underline truncate"
                              >
                                {tickerSymbol}
                              </Link>
                            ) : (
                              <span className="truncate">{displayName}</span>
                            )}
                            {h.isNew && (
                              <span className="px-1 py-0.5 bg-[#479ffa]/20 text-blue-400 text-[10px] rounded shrink-0">NEW</span>
                            )}
                          </div>
                          {/* Show issuer name below ticker if available */}
                          {tickerSymbol && h.issuer && (
                            <span className="text-xs text-[#868f97] truncate block">{h.issuer}</span>
                          )}
                          {!tickerSymbol && h.titleOfClass && (
                            <span className="text-xs text-[#868f97]">{h.titleOfClass}</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">{formatValue(h.value)}</div>
                        <div className="col-span-2 text-right">
                          <span className="text-primary">{h.portfolioPercent?.toFixed(2)}%</span>
                        </div>
                        <div className="col-span-2 text-right text-[#868f97]">{formatShares(h.shares)}</div>
                        <div className={`col-span-2 text-right flex items-center justify-end gap-1 ${
                          h.changeInShares > 0 ? 'text-[#4ebe96]' :
                          h.changeInShares < 0 ? 'text-[#e15241]' : 'text-[#868f97]'
                        }`}>
                          {!isSECData && h.changeInShares > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                           !isSECData && h.changeInShares < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                          {!isSECData && h.changeInShares !== 0 ? `${h.changePercent > 0 ? '+' : ''}${h.changePercent?.toFixed(1)}%` : '-'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1a1a1a] border-white/[0.08]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Top Institutional Holders
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Search Firms
          </Button>
        </div>

        {/* Search Panel */}
        {showSearch && (
          <div className="mt-3 relative">
            <Input
              placeholder="Search institutions (e.g., Vanguard, BlackRock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((inv, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      fetchInvestorDetails(inv.rawName)
                      setShowSearch(false)
                      setSearchQuery("")
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center justify-between"
                  >
                    <span className="text-sm">{inv.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(inv.type)}`}>
                      {inv.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchLoading && (
              <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/[0.03] rounded animate-pulse">
                <div className="h-4 w-40 bg-white/[0.05] rounded" />
                <div className="h-4 w-24 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : data?.holders.length === 0 ? (
          <p className="text-[#868f97] text-sm text-center py-8">
            No institutional ownership data available
          </p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                <p className="text-sm text-[#868f97]">Total Institutional Value</p>
                <p className="text-xl font-bold text-emerald-500">{formatValue(data?.summary.totalValue || 0)}</p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                <p className="text-sm text-[#868f97]">Total Shares Held</p>
                <p className="text-xl font-bold">{formatShares(data?.summary.totalShares || 0)}</p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                <p className="text-sm text-[#868f97]">Number of Holders</p>
                <p className="text-xl font-bold">{data?.summary.totalInstitutionalHolders || 0}+</p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg text-center">
                <p className="text-sm text-[#868f97]">Avg Position</p>
                <p className="text-xl font-bold">{formatValue(data?.summary.avgPosition || 0)}</p>
              </div>
            </div>

            {/* Flow Score & Concentration Analysis */}
            {(data?.summary.flowScore !== undefined || data?.summary.concentration) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Flow Score */}
                {data?.summary.flowScore !== undefined && (
                  <div className={`p-3 rounded-lg border ${
                    data.summary.flowSignal === 'STRONG_BUY' ? 'bg-emerald-500/10 border-emerald-500/30' :
                    data.summary.flowSignal === 'BUY' ? 'bg-[#4ebe96]/10 border-[#4ebe96]/30' :
                    data.summary.flowSignal === 'SELL' ? 'bg-orange-500/10 border-orange-500/30' :
                    data.summary.flowSignal === 'STRONG_SELL' ? 'bg-[#e15241]/10 border-[#e15241]/30' :
                    'bg-white/[0.03] border-white/[0.08]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Institutional Flow</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        data.summary.flowSignal === 'STRONG_BUY' ? 'bg-emerald-500 text-white' :
                        data.summary.flowSignal === 'BUY' ? 'bg-[#4ebe96] text-white' :
                        data.summary.flowSignal === 'SELL' ? 'bg-orange-500 text-white' :
                        data.summary.flowSignal === 'STRONG_SELL' ? 'bg-[#e15241] text-white' :
                        'bg-white/[0.05] text-[#868f97]'
                      }`}>
                        {data.summary.flowSignal?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{data.summary.flowScore.toFixed(0)}</span>
                      <span className="text-xs text-[#868f97] mb-1">/100</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.05] rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          data.summary.flowScore >= 60 ? 'bg-[#4ebe96]' :
                          data.summary.flowScore >= 40 ? 'bg-yellow-500' : 'bg-[#e15241]'
                        }`}
                        style={{ width: `${data.summary.flowScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Concentration Analysis */}
                {data?.summary.concentration && (
                  <div className={`p-3 rounded-lg border ${
                    data.summary.concentration.rating === 'VERY_HIGH' ? 'bg-[#e15241]/10 border-[#e15241]/30' :
                    data.summary.concentration.rating === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30' :
                    data.summary.concentration.rating === 'MODERATE' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-white/[0.03] border-white/[0.08]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">Concentration (HHI)</span>
                      </div>
                      {data.summary.concentration.rating === 'VERY_HIGH' || data.summary.concentration.rating === 'HIGH' ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {data.summary.concentration.rating.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[#868f97]">
                          {data.summary.concentration.rating}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[#868f97]">Top 5:</span>
                        <span className="ml-1 font-medium">{data.summary.concentration.top5Percent.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[#868f97]">Top 10:</span>
                        <span className="ml-1 font-medium">{data.summary.concentration.top10Percent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#868f97] mt-2">
                      ~{Math.round(data.summary.concentration.effectiveHolders)} effective equal-sized holders
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Summary */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 p-2 bg-[#4ebe96]/10 rounded-lg flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4ebe96]" />
                <span className="text-[#4ebe96] font-bold">{data?.summary.increasedPositions || 0}</span>
                <span className="text-xs text-[#868f97]">Increased</span>
              </div>
              <div className="flex-1 p-2 bg-[#e15241]/10 rounded-lg flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#e15241]" />
                <span className="text-[#e15241] font-bold">{data?.summary.decreasedPositions || 0}</span>
                <span className="text-xs text-[#868f97]">Decreased</span>
              </div>
              <div className="flex-1 p-2 bg-[#479ffa]/10 rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-[#479ffa]" />
                <span className="text-[#479ffa] font-bold">{data?.summary.newPositions || 0}</span>
                <span className="text-xs text-[#868f97]">New</span>
              </div>
            </div>

            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">All Holders</TabsTrigger>
                <TabsTrigger value="increased" className="text-[#4ebe96]">Increased</TabsTrigger>
                <TabsTrigger value="decreased" className="text-[#e15241]">Decreased</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Holders Table */}
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-[#868f97] font-medium bg-white/[0.03] rounded-t-lg">
                <div className="col-span-4">Investor</div>
                <div className="col-span-2 text-right">Shares</div>
                <div className="col-span-2 text-right">Value</div>
                <div className="col-span-2 text-right">% Portfolio</div>
                <div className="col-span-2 text-right">Report Date</div>
              </div>

              {/* Rows */}
              <div className="max-h-[500px] overflow-y-auto">
                {(activeTab === 'all' ? data?.holders :
                  activeTab === 'increased' ? data?.increasedHolders :
                  data?.decreasedHolders)?.map((holder, i) => (
                  <button
                    key={i}
                    onClick={() => fetchInvestorDetails(holder.investor.toUpperCase().replace(/ /g, '_'))}
                    className="w-full grid grid-cols-12 gap-2 px-3 py-3 text-sm border-b border-white/[0.04] hover:bg-white/[0.08] transition-colors duration-100 text-left"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{holder.investor}</span>
                        {holder.isNew && (
                          <span className="px-1.5 py-0.5 bg-[#479ffa]/20 text-blue-400 text-[10px] rounded shrink-0">NEW</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${getTypeColor(holder.investorType)}`}>
                        {holder.investorType}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p>{formatShares(holder.shares)}</p>
                      <p className={`text-xs flex items-center justify-end gap-0.5 ${
                        holder.changeInShares > 0 ? 'text-[#4ebe96]' :
                        holder.changeInShares < 0 ? 'text-[#e15241]' : 'text-[#868f97]'
                      }`}>
                        {holder.changeInShares > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                         holder.changeInShares < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {holder.changeInShares !== 0 ? formatShares(Math.abs(holder.changeInShares)) : '-'}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-emerald-500">{formatValue(holder.value)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      {holder.portfolioPercent ? (
                        <div className="flex items-center justify-end gap-1">
                          <PieChart className="w-3 h-3 text-primary" />
                          <span className="text-primary">{holder.portfolioPercent.toFixed(2)}%</span>
                        </div>
                      ) : (
                        <span className="text-[#868f97]">-</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-[#868f97] text-xs">
                      {holder.reportDate || '-'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Holder Types Breakdown */}
            {data?.summary.holdersByType && Object.keys(data.summary.holdersByType).length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/[0.08]">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Holders by Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.summary.holdersByType)
                    .sort((a, b) => b[1].value - a[1].value)
                    .map(([type, stats]) => (
                      <div
                        key={type}
                        className={`px-3 py-2 rounded-lg ${getTypeColor(type)} flex items-center gap-2`}
                      >
                        <span className="text-sm font-medium">{type}</span>
                        <span className="text-xs opacity-80">{stats.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
