"use client"

import { useState, useEffect, memo } from "react"
import { TrendingUp, TrendingDown, Flame, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface Mover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  signals?: string[]
  score?: number
}

interface TrendingTickersProps {
  onSelectTicker?: (symbol: string) => void
}

type ViewMode = 'gainers' | 'losers' | 'active'

export default function TrendingTickers({ onSelectTicker }: TrendingTickersProps = {}) {
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

  if (loading) {
    return (
      <div className="bg-background/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="h-6 w-24 bg-white/[0.025] rounded animate-pulse" />
            <div className="flex-1 flex gap-4 overflow-hidden">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-12 w-32 bg-white/[0.015] rounded-lg animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentData = viewMode === 'gainers' ? gainers : viewMode === 'losers' ? losers : trending

  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1800px] mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('gainers')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium motion-safe:transition-all motion-safe:duration-150 ease-out",
                viewMode === 'gainers'
                  ? "bg-[#4ebe96]/20 text-[#4ebe96]"
                  : "text-[#868f97] hover:text-white hover:bg-white/[0.025]"
              )}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Top Gainers</span>
            </button>
            <button
              onClick={() => setViewMode('losers')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium motion-safe:transition-all motion-safe:duration-150 ease-out",
                viewMode === 'losers'
                  ? "bg-[#ff5c5c]/20 text-[#ff5c5c]"
                  : "text-[#868f97] hover:text-white hover:bg-white/[0.025]"
              )}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Top Losers</span>
            </button>
            <button
              onClick={() => setViewMode('active')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium motion-safe:transition-all motion-safe:duration-150 ease-out",
                viewMode === 'active'
                  ? "bg-[#479ffa]/20 text-[#479ffa]"
                  : "text-[#868f97] hover:text-white hover:bg-white/[0.025]"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Most Active</span>
            </button>
          </div>

          {/* Scrollable Movers */}
          <div className="flex-1 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              {currentData.slice(0, 12).map((mover, index) => (
                <MoverCard
                  key={mover.symbol}
                  mover={mover}
                  rank={index + 1}
                  isGainer={viewMode === 'gainers'}
                  isLoser={viewMode === 'losers'}
                  onClick={() => onSelectTicker?.(mover.symbol)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MoverCard = memo(function MoverCard({
  mover,
  rank,
  isGainer,
  isLoser,
  onClick
}: {
  mover: Mover
  rank: number
  isGainer: boolean
  isLoser: boolean
  onClick?: () => void
}) {
  const isPositive = mover.changePercent >= 0
  const hasSignals = mover.signals && mover.signals.length > 0

  // Highlight top 3
  const isTop3 = rank <= 3
  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 px-3 py-2 rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out hover:scale-[1.02]",
        "border border-transparent",
        isGainer && "bg-[#4ebe96]/5 hover:bg-[#4ebe96]/10 hover:border-[#4ebe96]/30",
        isLoser && "bg-[#ff5c5c]/5 hover:bg-[#ff5c5c]/10 hover:border-[#ff5c5c]/30",
        !isGainer && !isLoser && "bg-white/[0.015] hover:bg-white/[0.025]"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        {isTop3 && (
          <span className={cn("text-lg font-bold", rankColors[rank - 1])}>
            #{rank}
          </span>
        )}

        {/* Symbol & Name */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{mover.symbol}</span>
            {hasSignals && mover.signals!.some(s => s.includes('🔥')) && (
              <Zap className="w-3 h-3 text-yellow-500" />
            )}
          </div>
          <p className="text-[10px] text-[#868f97] truncate max-w-[80px]">
            {mover.name}
          </p>
        </div>

        {/* Price & Change */}
        <div className="text-right">
          <p className="text-sm font-medium tabular-nums">${typeof mover.price === 'number' ? mover.price.toFixed(2) : '—'}</p>
          <p className={cn(
            "text-xs font-semibold tabular-nums flex items-center justify-end gap-0.5",
            isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{typeof mover.changePercent === 'number' ? mover.changePercent.toFixed(2) : '0.00'}%
          </p>
        </div>
      </div>

      {/* Signal Tags - Show first signal as badge */}
      {hasSignals && (
        <div className="mt-1.5 flex gap-1">
          {mover.signals!.slice(0, 2).map((signal, i) => (
            <span
              key={i}
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                signal.includes('🔥') ? "bg-orange-500/20 text-orange-400" :
                signal.includes('52wk') ? "bg-purple-500/20 text-purple-400" :
                signal.includes('vol') || signal.includes('Vol') ? "bg-[#479ffa]/20 text-[#479ffa]" :
                "bg-white/[0.05] text-[#868f97]"
              )}
            >
              {signal}
            </span>
          ))}
        </div>
      )}
    </button>
  )
})
