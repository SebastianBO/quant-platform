"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, AlertCircle, FileCheck2, FileWarning } from "lucide-react"

interface Filing {
  id: string
  formType: string
  category: string
  importance: 'high' | 'medium' | 'low'
  filedDate: string
  description: string
  documentUrl: string
  secUrl: string
}

interface SECData {
  ticker: string
  totalFilings: number
  byCategory: Record<string, number>
  filings: Filing[]
}

const IMPORTANCE_COLORS = {
  high: 'border-red-500/50 bg-red-500/5',
  medium: 'border-yellow-500/50 bg-yellow-500/5',
  low: 'border-border bg-secondary/30'
}

const IMPORTANCE_ICONS = {
  high: <AlertCircle className="w-4 h-4 text-red-500" />,
  medium: <FileWarning className="w-4 h-4 text-yellow-500" />,
  low: <FileCheck2 className="w-4 h-4 text-muted-foreground" />
}

const CATEGORY_BADGES: Record<string, string> = {
  'Annual Report': 'bg-purple-500/20 text-purple-500',
  'Quarterly Report': 'bg-blue-500/20 text-blue-500',
  'Current Report': 'bg-red-500/20 text-red-500',
  'Insider Trading': 'bg-yellow-500/20 text-yellow-500',
  'Institutional Holdings': 'bg-green-500/20 text-green-500',
  'Proxy Statement': 'bg-pink-500/20 text-pink-500',
}

export default function SECFilings({ ticker }: { ticker: string }) {
  const [data, setData] = useState<SECData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/sec-filings?ticker=${ticker}&limit=30`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching SEC filings:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredFilings = data?.filings.filter(f =>
    filter === 'all' || f.category === filter
  ) || []

  const categories = data?.byCategory ? Object.keys(data.byCategory) : []

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4" />
          SEC Filings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-16 bg-secondary rounded" />
                  <div className="h-4 w-24 bg-secondary rounded" />
                </div>
                <div className="h-3 w-full bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : data?.filings.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No SEC filings available
          </p>
        ) : (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1 mb-4">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs h-7"
              >
                All ({data?.totalFilings})
              </Button>
              {categories.slice(0, 4).map(cat => (
                <Button
                  key={cat}
                  variant={filter === cat ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className="text-xs h-7"
                >
                  {cat} ({data?.byCategory[cat]})
                </Button>
              ))}
            </div>

            {/* Filings List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFilings.slice(0, 10).map((filing) => (
                <div
                  key={filing.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-secondary/50 ${IMPORTANCE_COLORS[filing.importance]}`}
                  onClick={() => setSelectedFiling(filing)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {IMPORTANCE_ICONS[filing.importance]}
                      <span className="font-medium text-sm">{filing.formType}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${CATEGORY_BADGES[filing.category] || 'bg-secondary text-muted-foreground'}`}>
                        {filing.category}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(filing.filedDate)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {filing.description}
                  </p>
                </div>
              ))}
            </div>

            {/* View on SEC */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => window.open(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=&dateb=&owner=include&count=40`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View All on SEC.gov
            </Button>
          </>
        )}

        {/* Filing Detail Modal */}
        {selectedFiling && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFiling(null)}>
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {IMPORTANCE_ICONS[selectedFiling.importance]}
                    <h3 className="font-bold">{selectedFiling.formType}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${CATEGORY_BADGES[selectedFiling.category] || 'bg-secondary'}`}>
                      {selectedFiling.category}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFiling(null)}>
                    Close
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Filed: {formatDate(selectedFiling.filedDate)}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">{selectedFiling.description}</p>
                <div className="flex gap-2">
                  {selectedFiling.documentUrl && (
                    <Button
                      onClick={() => window.open(selectedFiling.documentUrl, '_blank')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedFiling.secUrl, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    SEC.gov
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
