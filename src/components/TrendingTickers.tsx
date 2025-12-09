"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Pause, Play } from "lucide-react"
import { getSymbolColor, getClearbitLogoFromSymbol } from "@/lib/logoService"

interface Ticker {
  symbol: string
  price: number
  change: number
  changePercent: number
  logoUrl: string
}

interface TrendingTickersProps {
  onSelectTicker?: (symbol: string) => void
}

export default function TrendingTickers({ onSelectTicker }: TrendingTickersProps = {}) {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetchTrending()
    // Refresh every 60 seconds
    const interval = setInterval(fetchTrending, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/trending')
      if (!response.ok) {
        console.error('Trending API error:', response.status)
        setLoading(false)
        return
      }
      const data = await response.json()
      // API returns { trending: [], gainers: [], losers: [] }
      const trendingData = data.trending || data.tickers || []
      if (trendingData.length > 0) {
        setTickers(trendingData.map((t: any) => ({
          symbol: t.symbol,
          price: t.price,
          change: t.change || 0,
          changePercent: t.changePercent || 0,
          logoUrl: t.logoUrl || `https://eodhistoricaldata.com/img/logos/US/${t.symbol}.png`
        })))
      }
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
    setLoading(false)
  }

  if (loading || tickers.length === 0) {
    return null
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center gap-4">
        {/* Trending label */}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-shrink-0">
          Trending
        </span>

        {/* Scrolling ticker tape */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className={`flex items-center gap-6 ${isPaused ? '' : 'animate-marquee'}`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {/* Duplicate tickers for seamless loop */}
            {[...tickers, ...tickers].map((ticker, index) => (
              <TickerItem
                key={`${ticker.symbol}-${index}`}
                ticker={ticker}
                onClick={() => onSelectTicker?.(ticker.symbol)}
              />
            ))}
          </div>
        </div>

        {/* Pause/Play button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Pause className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

function TickerItem({ ticker, onClick }: { ticker: Ticker; onClick?: () => void }) {
  const [logoState, setLogoState] = useState<'eodhd' | 'clearbit' | 'fallback'>('eodhd')
  const isPositive = ticker.changePercent >= 0
  const color = getSymbolColor(ticker.symbol)
  const clearbitUrl = getClearbitLogoFromSymbol(ticker.symbol)

  const handleLogoError = () => {
    if (logoState === 'eodhd' && clearbitUrl) {
      setLogoState('clearbit')
    } else {
      setLogoState('fallback')
    }
  }

  const currentLogoUrl = logoState === 'eodhd' ? ticker.logoUrl : clearbitUrl

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 hover:bg-secondary/50 px-2 py-1 rounded-lg transition-all"
    >
      {/* Logo */}
      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
        {logoState !== 'fallback' ? (
          <img
            src={currentLogoUrl || ticker.logoUrl}
            alt={ticker.symbol}
            className="w-full h-full object-cover bg-white"
            onError={handleLogoError}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {ticker.symbol.charAt(0)}
          </div>
        )}
      </div>

      {/* Symbol */}
      <span className="font-medium text-sm text-foreground">{ticker.symbol}</span>

      {/* Change */}
      <div className={`flex items-center gap-0.5 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span className="tabular-nums">
          {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
        </span>
      </div>
    </button>
  )
}
