"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparkline: number[]
}

interface MarketData {
  region: string
  marketStatus: string
  statusMessage: string
  indices: MarketIndex[]
}

const REGIONS = [
  { id: 'us', label: 'US' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia' },
  { id: 'crypto', label: 'Cryptocurrencies' },
]

function MiniSparkline({ data, isPositive }: { data: number[], isPositive: boolean }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const height = 24
  const width = 60

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default function MarketOverview() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeRegion, setActiveRegion] = useState('us')

  useEffect(() => {
    fetchMarketData()
  }, [activeRegion])

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/market-overview?region=${activeRegion}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
    setLoading(false)
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-4">
        {/* Market Status Header */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            data?.marketStatus === 'open' ? 'bg-green-500 animate-pulse' :
            data?.marketStatus === 'premarket' || data?.marketStatus === 'afterhours' ? 'bg-yellow-500' :
            'bg-muted-foreground'
          }`} />
          <span className="text-muted-foreground">{data?.statusMessage || 'Loading...'}</span>
        </div>

        {/* Region Tabs */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {REGIONS.map(region => (
            <Button
              key={region.id}
              variant={activeRegion === region.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveRegion(region.id)}
              className={activeRegion === region.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            >
              {region.label}
            </Button>
          ))}
        </div>

        {/* Market Indices Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg animate-pulse">
                <div className="h-4 w-20 bg-secondary rounded mb-2" />
                <div className="h-6 w-16 bg-secondary rounded mb-2" />
                <div className="h-6 w-14 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data?.indices.map((index) => {
              const isPositive = index.changePercent >= 0
              return (
                <div
                  key={index.symbol}
                  className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <p className="text-primary text-sm font-medium truncate">{index.name}</p>
                  <p className="text-lg font-bold tabular-nums">
                    {index.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <MiniSparkline data={index.sparkline} isPositive={isPositive} />
                  </div>
                  <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{isPositive ? '+' : ''}{typeof index.change === 'number' ? index.change.toFixed(2) : '0.00'}</span>
                    <span className="ml-1">({isPositive ? '+' : ''}{typeof index.changePercent === 'number' ? index.changePercent.toFixed(2) : '0.00'}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
