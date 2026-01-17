"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Flame, Activity, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import StockLogo from "@/components/StockLogo"

interface Mover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  signals?: string[]
  score?: number
}

type ViewMode = 'gainers' | 'losers' | 'active'

export default function EnhancedMarketMovers() {
  const [gainers, setGainers] = useState<Mover[]>([])
  const [losers, setLosers] = useState<Mover[]>([])
  const [trending, setTrending] = useState<Mover[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('gainers')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/trending')
      if (!response.ok) {
        setLoading(false)
        return
      }
      const data = await response.json()
      setGainers(data.gainers || [])
      setLosers(data.losers || [])
      setTrending(data.trending || [])
    } catch (error) {
      console.error('Error fetching movers:', error)
    }
    setLoading(false)
  }

  const viewConfig = {
    gainers: {
      label: 'Top Gainers',
      icon: Flame,
      color: 'green',
      link: '/markets/top-gainers'
    },
    losers: {
      label: 'Top Losers',
      icon: TrendingDown,
      color: 'red',
      link: '/markets/top-losers'
    },
    active: {
      label: 'Most Active',
      icon: Activity,
      color: 'blue',
      link: '/markets/most-active'
    },
  }

  if (loading) {
    return (
      <div className="border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-[10px]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-24 bg-white/[0.025] rounded-full animate-pulse" />
              ))}
            </div>
            <div className="flex-1 flex gap-3 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 w-40 bg-white/[0.015] rounded-2xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentData = viewMode === 'gainers' ? gainers : viewMode === 'losers' ? losers : trending
  const config = viewConfig[viewMode]
  const Icon = config.icon

  return (
    <div className="border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-[10px]">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {Object.entries(viewConfig).map(([mode, conf]) => {
              const ModeIcon = conf.icon
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium motion-safe:transition-all motion-safe:duration-150 ease-out",
                    viewMode === mode
                      ? `bg-${conf.color}-500/20 text-${conf.color}-500`
                      : "text-[#868f97] hover:text-white hover:bg-white/[0.025]"
                  )}
                  style={viewMode === mode ? {
                    backgroundColor: conf.color === 'green' ? '#4ebe9633' :
                                    conf.color === 'red' ? '#ff5c5c33' :
                                    '#479ffa33',
                    color: conf.color === 'green' ? '#4ebe96' :
                           conf.color === 'red' ? '#ff5c5c' :
                           '#479ffa'
                  } : undefined}
                >
                  <ModeIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{conf.label}</span>
                </button>
              )
            })}
          </div>

          {/* Scrollable Movers */}
          <div className="flex-1 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-3">
              {currentData.slice(0, 10).map((mover) => (
                <MoverCard
                  key={mover.symbol}
                  mover={mover}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>

          {/* See All Link */}
          <Link
            href={config.link}
            className="flex items-center gap-1 text-xs text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out flex-shrink-0"
          >
            <span className="hidden sm:inline">See all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MoverCard({
  mover,
  viewMode,
}: {
  mover: Mover
  viewMode: ViewMode
}) {
  const isPositive = mover.changePercent >= 0
  const isGainer = viewMode === 'gainers'
  const isLoser = viewMode === 'losers'

  return (
    <Link
      href={`/${mover.symbol}`}
      className={cn(
        "flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out hover:scale-[1.02]",
        "border border-transparent",
        isGainer && "bg-[#4ebe96]/5 hover:bg-[#4ebe96]/10 hover:border-[#4ebe96]/30",
        isLoser && "bg-[#ff5c5c]/5 hover:bg-[#ff5c5c]/10 hover:border-[#ff5c5c]/30",
        !isGainer && !isLoser && "bg-white/[0.015] hover:bg-white/[0.025]"
      )}
    >
      {/* Logo */}
      <StockLogo symbol={mover.symbol} size="md" />

      {/* Symbol & Name */}
      <div className="min-w-0">
        <p className="font-semibold text-sm">{mover.symbol}</p>
        <p className="text-[10px] text-[#868f97] truncate max-w-[70px]">
          {mover.name}
        </p>
      </div>

      {/* Price & Change */}
      <div className="text-right">
        <p className="text-sm font-medium tabular-nums">
          ${typeof mover.price === 'number' ? mover.price.toFixed(2) : '—'}
        </p>
        <p className={cn(
          "text-xs font-semibold tabular-nums flex items-center justify-end gap-0.5",
          isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{typeof mover.changePercent === 'number' ? mover.changePercent.toFixed(2) : '0.00'}%
        </p>
      </div>
    </Link>
  )
}
