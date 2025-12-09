"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, TrendingDown, Plus, Minus, ExternalLink } from "lucide-react"

interface Holder {
  investor: string
  shares: number
  value: number
  percentOwnership: number
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
    newPositions: number
  }
  holders: Holder[]
}

export default function InstitutionalOwnership({ ticker }: { ticker: string }) {
  const [data, setData] = useState<InstitutionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

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

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const formatShares = (shares: number) => {
    if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
    if (shares >= 1e3) return `${(shares / 1e3).toFixed(1)}K`
    return shares.toLocaleString()
  }

  const displayedHolders = showAll ? data?.holders : data?.holders.slice(0, 5)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-4 h-4" />
          Institutional Ownership
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-2 bg-secondary/30 rounded animate-pulse">
                <div className="h-4 w-32 bg-secondary rounded" />
                <div className="h-4 w-20 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : data?.holders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No institutional ownership data available
          </p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-lg font-bold">{data?.summary.totalInstitutionalHolders || 0}</p>
                <p className="text-xs text-muted-foreground">Holders</p>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded">
                <p className="text-lg font-bold text-green-500">{data?.summary.increasedPositions || 0}</p>
                <p className="text-xs text-muted-foreground">Increased</p>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <p className="text-lg font-bold text-red-500">{data?.summary.decreasedPositions || 0}</p>
                <p className="text-xs text-muted-foreground">Decreased</p>
              </div>
            </div>

            {/* Holders List */}
            <div className="space-y-2">
              {displayedHolders?.map((holder, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{holder.investor}</p>
                      {holder.isNew && (
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-500 text-xs rounded">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatShares(holder.shares)} shares • {holder.percentOwnership?.toFixed(2) || '0'}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatValue(holder.value || 0)}</p>
                    <div className={`flex items-center gap-1 text-xs ${
                      holder.changeInShares > 0 ? 'text-green-500' :
                      holder.changeInShares < 0 ? 'text-red-500' :
                      'text-muted-foreground'
                    }`}>
                      {holder.changeInShares > 0 ? (
                        <Plus className="w-3 h-3" />
                      ) : holder.changeInShares < 0 ? (
                        <Minus className="w-3 h-3" />
                      ) : null}
                      {holder.changeInShares !== 0 && (
                        <span>{formatShares(Math.abs(holder.changeInShares))}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {data && data.holders.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3"
              >
                {showAll ? 'Show Less' : `Show All ${data.holders.length} Holders`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
