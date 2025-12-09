"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Building2, TrendingUp, TrendingDown, Plus, Minus,
  Search, ArrowUpRight, ArrowDownRight, PieChart,
  Briefcase, ChevronRight, X, Loader2
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
    shares: number
    value: number
    portfolioPercent: number
    percentOfCompany: number
    changeInShares: number
    changePercent: number
    isNew: boolean
    reportDate: string
  }[]
}

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

  const fetchInvestorDetails = async (investorName: string) => {
    setInvestorLoading(true)
    try {
      const response = await fetch(`/api/institutional?type=investor&investor=${encodeURIComponent(investorName)}`)
      const result = await response.json()
      setSelectedInvestor(result)
    } catch (error) {
      console.error('Error fetching investor details:', error)
    }
    setInvestorLoading(false)
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
      'Index Fund': 'bg-blue-500/20 text-blue-400',
      'Hedge Fund': 'bg-purple-500/20 text-purple-400',
      'Pension Fund': 'bg-orange-500/20 text-orange-400',
      'Bank': 'bg-emerald-500/20 text-emerald-400',
      'Mutual Fund': 'bg-cyan-500/20 text-cyan-400',
      'Insurance': 'bg-yellow-500/20 text-yellow-400',
      'Conglomerate': 'bg-red-500/20 text-red-400',
      'Sovereign Wealth': 'bg-pink-500/20 text-pink-400',
      'Investment Manager': 'bg-gray-500/20 text-gray-400'
    }
    return colors[type] || 'bg-secondary text-secondary-foreground'
  }

  // Format investor name properly
  const formatInvestorName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  // Investor Detail Modal/Panel
  if (selectedInvestor) {
    const hasData = selectedInvestor.holdings && selectedInvestor.holdings.length > 0

    return (
      <Card className="bg-card border-border">
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
              <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(selectedInvestor.investorType)}`}>
                {selectedInvestor.investorType}
              </span>
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
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">
                Detailed holdings data not available for this institution
              </p>
              <p className="text-xs text-muted-foreground">
                Full portfolio data is available for select institutions including Berkshire Hathaway, BlackRock, and others.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvestor(null)}
                className="mt-4"
              >
                Back to Holders List
              </Button>
            </div>
          ) : (
            <>
              {/* Investor Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xl font-bold">{formatValue(selectedInvestor.summary.totalAUM)}</p>
                  <p className="text-xs text-muted-foreground">Total 13F AUM</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xl font-bold">{selectedInvestor.summary.totalPositions}</p>
                  <p className="text-xs text-muted-foreground">Positions</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-xl font-bold text-green-500">{selectedInvestor.summary.increasedPositions}</p>
                  <p className="text-xs text-muted-foreground">Increased</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-500">{selectedInvestor.summary.decreasedPositions}</p>
                  <p className="text-xs text-muted-foreground">Decreased</p>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs text-muted-foreground font-medium border-b border-border">
                  <div className="col-span-3">Ticker</div>
                  <div className="col-span-2 text-right">Value</div>
                  <div className="col-span-2 text-right">% Portfolio</div>
                  <div className="col-span-2 text-right">Shares</div>
                  <div className="col-span-3 text-right">Change</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {selectedInvestor.holdings.map((h, i) => (
                    <Link
                      key={i}
                      href={`/stock/${h.ticker}`}
                      className="grid grid-cols-12 gap-2 px-2 py-2 text-sm rounded hover:bg-secondary/50 transition-colors"
                    >
                      <div className="col-span-3 font-medium flex items-center gap-2">
                        {h.ticker}
                        {h.isNew && (
                          <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded">NEW</span>
                        )}
                      </div>
                      <div className="col-span-2 text-right">{formatValue(h.value)}</div>
                      <div className="col-span-2 text-right">
                        <span className="text-primary">{h.portfolioPercent?.toFixed(2)}%</span>
                      </div>
                      <div className="col-span-2 text-right text-muted-foreground">{formatShares(h.shares)}</div>
                      <div className={`col-span-3 text-right flex items-center justify-end gap-1 ${
                        h.changeInShares > 0 ? 'text-green-500' :
                        h.changeInShares < 0 ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {h.changeInShares > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                         h.changeInShares < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {h.changeInShares !== 0 ? `${h.changePercent > 0 ? '+' : ''}${h.changePercent?.toFixed(1)}%` : '-'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
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
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((inv, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      fetchInvestorDetails(inv.rawName)
                      setShowSearch(false)
                      setSearchQuery("")
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-secondary/50 flex items-center justify-between"
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
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg p-4 text-center">
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
              <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded animate-pulse">
                <div className="h-4 w-40 bg-secondary rounded" />
                <div className="h-4 w-24 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : data?.holders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No institutional ownership data available
          </p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Institutional Value</p>
                <p className="text-xl font-bold text-emerald-500">{formatValue(data?.summary.totalValue || 0)}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Shares Held</p>
                <p className="text-xl font-bold">{formatShares(data?.summary.totalShares || 0)}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Number of Holders</p>
                <p className="text-xl font-bold">{data?.summary.totalInstitutionalHolders || 0}+</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Avg Position</p>
                <p className="text-xl font-bold">{formatValue(data?.summary.avgPosition || 0)}</p>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 p-2 bg-green-500/10 rounded-lg flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-bold">{data?.summary.increasedPositions || 0}</span>
                <span className="text-xs text-muted-foreground">Increased</span>
              </div>
              <div className="flex-1 p-2 bg-red-500/10 rounded-lg flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-bold">{data?.summary.decreasedPositions || 0}</span>
                <span className="text-xs text-muted-foreground">Decreased</span>
              </div>
              <div className="flex-1 p-2 bg-blue-500/10 rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span className="text-blue-500 font-bold">{data?.summary.newPositions || 0}</span>
                <span className="text-xs text-muted-foreground">New</span>
              </div>
            </div>

            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">All Holders</TabsTrigger>
                <TabsTrigger value="increased" className="text-green-500">Increased</TabsTrigger>
                <TabsTrigger value="decreased" className="text-red-500">Decreased</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Holders Table */}
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground font-medium bg-secondary/30 rounded-t-lg">
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
                    className="w-full grid grid-cols-12 gap-2 px-3 py-3 text-sm border-b border-border/50 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{holder.investor}</span>
                        {holder.isNew && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded shrink-0">NEW</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${getTypeColor(holder.investorType)}`}>
                        {holder.investorType}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p>{formatShares(holder.shares)}</p>
                      <p className={`text-xs flex items-center justify-end gap-0.5 ${
                        holder.changeInShares > 0 ? 'text-green-500' :
                        holder.changeInShares < 0 ? 'text-red-500' : 'text-muted-foreground'
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
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground text-xs">
                      {holder.reportDate || '-'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Holder Types Breakdown */}
            {data?.summary.holdersByType && Object.keys(data.summary.holdersByType).length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
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
