"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparkline?: number[]
}

interface TrendingStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface RecentStock {
  symbol: string
  name: string
  price: number
  changePercent: number
  timestamp: number
}

// Mini sparkline component
function MiniSparkline({ data, positive }: { data: number[], positive: boolean }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 60
  const height = 24
  const padding = 2

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Market index card
function MarketCard({ index }: { index: MarketIndex }) {
  const isPositive = index.changePercent >= 0

  return (
    <div className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground truncate">{index.name}</span>
        <MiniSparkline data={index.sparkline || []} positive={isPositive} />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold tabular-nums">{index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={cn(
          "text-xs tabular-nums",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{index.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

// Trending ticker row
function TrendingRow({ stock, onSelect }: { stock: TrendingStock, onSelect: (symbol: string) => void }) {
  const isPositive = stock.changePercent >= 0

  return (
    <button
      onClick={() => onSelect(stock.symbol)}
      className="w-full flex items-center justify-between py-2.5 px-1 hover:bg-secondary/30 rounded transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm group-hover:text-green-500 transition-colors">{stock.symbol}</p>
        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
      </div>
      <div className="text-right ml-3">
        <p className="font-medium tabular-nums text-sm">{stock.price.toFixed(2)}</p>
        <p className={cn(
          "text-xs tabular-nums",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
        </p>
      </div>
    </button>
  )
}

// Recently viewed row
function RecentRow({ stock, onSelect }: { stock: RecentStock, onSelect: (symbol: string) => void }) {
  const isPositive = stock.changePercent >= 0

  return (
    <button
      onClick={() => onSelect(stock.symbol)}
      className="w-full flex items-center justify-between py-2 px-1 hover:bg-secondary/30 rounded transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm group-hover:text-green-500 transition-colors">{stock.symbol}</p>
        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
      </div>
      <div className="text-right ml-3">
        <p className="font-medium tabular-nums text-sm">{stock.price.toFixed(2)}</p>
        <p className={cn(
          "text-xs tabular-nums",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </button>
  )
}

interface MarketSidebarProps {
  onSelectTicker: (symbol: string) => void
  currentTicker?: string
  isAuthenticated?: boolean
}

export default function MarketSidebar({ onSelectTicker, currentTicker, isAuthenticated = false }: MarketSidebarProps) {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([])
  const [topGainers, setTopGainers] = useState<TrendingStock[]>([])
  const [topLosers, setTopLosers] = useState<TrendingStock[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentStock[]>([])
  const [marketPage, setMarketPage] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewedStocks')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentlyViewed(parsed.slice(0, 15))
      } catch (e) {
        console.error('Error parsing recently viewed:', e)
      }
    }
  }, [])

  // Save current ticker to recently viewed
  useEffect(() => {
    if (!currentTicker) return

    const fetchAndSave = async () => {
      try {
        const response = await fetch(`/api/stock?ticker=${currentTicker}`)
        if (!response.ok) return
        const data = await response.json()

        const newStock: RecentStock = {
          symbol: currentTicker,
          name: data.companyFacts?.name || currentTicker,
          price: data.snapshot?.price || 0,
          changePercent: data.snapshot?.day_change_percent || 0,
          timestamp: Date.now()
        }

        setRecentlyViewed(prev => {
          const filtered = prev.filter(s => s.symbol !== currentTicker)
          const updated = [newStock, ...filtered].slice(0, 15)
          localStorage.setItem('recentlyViewedStocks', JSON.stringify(updated))
          return updated
        })
      } catch (e) {
        console.error('Error saving to recently viewed:', e)
      }
    }

    fetchAndSave()
  }, [currentTicker])

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market overview
        const overviewRes = await fetch('/api/market-overview')
        if (overviewRes.ok) {
          const data = await overviewRes.json()

          // Generate fake sparklines for demo (replace with real data)
          const generateSparkline = (basePrice: number, positive: boolean) => {
            const points = []
            let price = basePrice * (positive ? 0.98 : 1.02)
            for (let i = 0; i < 20; i++) {
              price += (Math.random() - (positive ? 0.3 : 0.7)) * (basePrice * 0.002)
              points.push(price)
            }
            return points
          }

          const indices: MarketIndex[] = [
            {
              symbol: '^GSPC',
              name: 'S&P 500',
              price: data.indices?.sp500?.price || 6000,
              change: data.indices?.sp500?.change || 0,
              changePercent: data.indices?.sp500?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.sp500?.price || 6000, (data.indices?.sp500?.changePercent || 0) >= 0)
            },
            {
              symbol: '^IXIC',
              name: 'Nasdaq',
              price: data.indices?.nasdaq?.price || 19000,
              change: data.indices?.nasdaq?.change || 0,
              changePercent: data.indices?.nasdaq?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.nasdaq?.price || 19000, (data.indices?.nasdaq?.changePercent || 0) >= 0)
            },
            {
              symbol: '^RUT',
              name: 'Russell 2000',
              price: data.indices?.russell?.price || 2500,
              change: data.indices?.russell?.change || 0,
              changePercent: data.indices?.russell?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.russell?.price || 2500, (data.indices?.russell?.changePercent || 0) >= 0)
            },
            {
              symbol: '^VIX',
              name: 'VIX',
              price: data.vix?.price || 15,
              change: data.vix?.change || 0,
              changePercent: data.vix?.changePercent || 0,
              sparkline: generateSparkline(data.vix?.price || 15, (data.vix?.changePercent || 0) >= 0)
            },
            {
              symbol: 'GC=F',
              name: 'Gold',
              price: data.commodities?.gold?.price || 2600,
              change: data.commodities?.gold?.change || 0,
              changePercent: data.commodities?.gold?.changePercent || 0,
              sparkline: generateSparkline(data.commodities?.gold?.price || 2600, (data.commodities?.gold?.changePercent || 0) >= 0)
            },
            {
              symbol: 'BTC-USD',
              name: 'Bitcoin USD',
              price: data.crypto?.btc?.price || 100000,
              change: data.crypto?.btc?.change || 0,
              changePercent: data.crypto?.btc?.changePercent || 0,
              sparkline: generateSparkline(data.crypto?.btc?.price || 100000, (data.crypto?.btc?.changePercent || 0) >= 0)
            },
          ]
          setMarketIndices(indices)
        }

        // Fetch trending
        const trendingRes = await fetch('/api/trending')
        if (trendingRes.ok) {
          const data = await trendingRes.json()
          setTrendingStocks(data.trending?.slice(0, 8) || [])
          setTopGainers(data.gainers?.slice(0, 5) || [])
          setTopLosers(data.losers?.slice(0, 5) || [])
        }
      } catch (e) {
        console.error('Error fetching market data:', e)
      }
      setLoading(false)
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const visibleIndices = marketIndices.slice(marketPage * 6, (marketPage + 1) * 6)
  const totalPages = Math.ceil(marketIndices.length / 6)

  return (
    <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
      <div className="space-y-6 pb-6">
        {/* Market Overview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Markets</h3>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMarketPage(p => Math.max(0, p - 1))}
                  disabled={marketPage === 0}
                  className="p-1 rounded hover:bg-secondary/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMarketPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={marketPage >= totalPages - 1}
                  className="p-1 rounded hover:bg-secondary/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
              ))
            ) : (
              visibleIndices.map((index) => (
                <MarketCard key={index.symbol} index={index} />
              ))
            )}
          </div>
        </section>

        {/* Trending Tickers */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trending</h3>
          <div className="space-y-0.5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-secondary/20 rounded animate-pulse" />
              ))
            ) : trendingStocks.length > 0 ? (
              trendingStocks.slice(0, 8).map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No trending data</p>
            )}
          </div>
        </section>

        {/* Portfolio */}
        <section className="bg-secondary/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Portfolio</h3>
          {isAuthenticated ? (
            <div className="text-center py-2">
              <Link href="/dashboard" className="text-sm text-green-500 hover:underline">
                View your portfolios
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">Sign in to access your portfolio</p>
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recently viewed</h3>
            <div className="space-y-0.5">
              {recentlyViewed.slice(0, 10).map((stock) => (
                <RecentRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}

        {/* Top Gainers */}
        {topGainers.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-green-500/80 uppercase tracking-wider mb-3">Top gainers</h3>
            <div className="space-y-0.5">
              {topGainers.map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}

        {/* Top Losers */}
        {topLosers.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-red-500/80 uppercase tracking-wider mb-3">Top losers</h3>
            <div className="space-y-0.5">
              {topLosers.map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
