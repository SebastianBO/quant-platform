"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, ExternalLink, Loader2, Building2, DollarSign, BarChart3, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import StockLogo from "@/components/StockLogo"
import Link from "next/link"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap?: number
  volume?: number
  pe?: number
  eps?: number
  high52w?: number
  low52w?: number
  sector?: string
  industry?: string
  employees?: number
  description?: string
}

interface StockProfilePopupProps {
  symbol: string
  isOpen: boolean
  onClose: () => void
  position?: { x: number; y: number }
}

export default function StockProfilePopup({ symbol, isOpen, onClose, position }: StockProfilePopupProps) {
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !symbol) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch from our API
        const [quoteRes, profileRes] = await Promise.all([
          fetch(`/api/quotes/realtime?symbols=${symbol}`),
          fetch(`/api/company/${symbol}`),
        ])

        const quoteData = await quoteRes.json()
        const profileData = await profileRes.json()

        const quote = quoteData.quotes?.[symbol] || {}
        const profile = profileData || {}

        setData({
          symbol,
          name: profile.name || quote.name || symbol,
          price: quote.price || profile.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
          marketCap: profile.marketCap || quote.marketCap,
          volume: quote.volume,
          pe: profile.peRatio || profile.pe,
          eps: profile.eps,
          high52w: profile.high52Week || profile.yearHigh,
          low52w: profile.low52Week || profile.yearLow,
          sector: profile.sector,
          industry: profile.industry,
          employees: profile.employees,
          description: profile.description,
        })
      } catch (err) {
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, symbol])

  if (!isOpen) return null

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString()
  }

  const formatVolume = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className={cn(
          "fixed z-50 w-[400px] max-w-[90vw] max-h-[80vh] overflow-hidden",
          "bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-200",
          position
            ? ""
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
        style={position ? { top: position.y, left: position.x } : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <StockLogo symbol={symbol} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{symbol}</span>
                {data && (
                  <span className={cn(
                    "text-sm px-2 py-0.5 rounded",
                    data.changePercent >= 0 ? "bg-[#4ebe96]/10 text-[#4ebe96]" : "bg-[#e15241]/10 text-[#e15241]"
                  )}>
                    {data.changePercent >= 0 ? "+" : ""}{data.changePercent?.toFixed(2)}%
                  </span>
                )}
              </div>
              {data && <p className="text-sm text-[#868f97] line-clamp-1">{data.name}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors duration-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#868f97]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-[#868f97]">{error}</div>
          ) : data ? (
            <div className="space-y-4">
              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold">${data.price?.toFixed(2)}</span>
                <span className={cn(
                  "flex items-center gap-1 text-lg",
                  data.change >= 0 ? "text-[#4ebe96]" : "text-[#e15241]"
                )}>
                  {data.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {data.change >= 0 ? "+" : ""}{data.change?.toFixed(2)}
                </span>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/[0.025] rounded-lg">
                  <p className="text-xs text-[#868f97] mb-1">Market Cap</p>
                  <p className="font-semibold">{formatNumber(data.marketCap)}</p>
                </div>
                <div className="p-3 bg-white/[0.025] rounded-lg">
                  <p className="text-xs text-[#868f97] mb-1">Volume</p>
                  <p className="font-semibold">{formatVolume(data.volume)}</p>
                </div>
                <div className="p-3 bg-white/[0.025] rounded-lg">
                  <p className="text-xs text-[#868f97] mb-1">P/E Ratio</p>
                  <p className="font-semibold">{data.pe?.toFixed(2) || "N/A"}</p>
                </div>
                <div className="p-3 bg-white/[0.025] rounded-lg">
                  <p className="text-xs text-[#868f97] mb-1">EPS</p>
                  <p className="font-semibold">{data.eps ? `$${data.eps.toFixed(2)}` : "N/A"}</p>
                </div>
              </div>

              {/* 52 Week Range */}
              {data.low52w && data.high52w && (
                <div className="p-3 bg-white/[0.025] rounded-lg">
                  <p className="text-xs text-[#868f97] mb-2">52 Week Range</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">${data.low52w?.toFixed(2)}</span>
                    <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ebe96] rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((data.price - data.low52w) / (data.high52w - data.low52w)) * 100))}%`
                        }}
                      />
                    </div>
                    <span className="text-sm">${data.high52w?.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Company Info */}
              {(data.sector || data.industry) && (
                <div className="flex flex-wrap gap-2">
                  {data.sector && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#479ffa]/10 text-[#479ffa] rounded-full text-xs">
                      <Building2 className="w-3 h-3" />
                      {data.sector}
                    </span>
                  )}
                  {data.industry && (
                    <span className="px-2.5 py-1 bg-white/[0.05] rounded-full text-xs text-[#868f97]">
                      {data.industry}
                    </span>
                  )}
                  {data.employees && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] rounded-full text-xs text-[#868f97]">
                      <Users className="w-3 h-3" />
                      {data.employees.toLocaleString()} employees
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {data.description && (
                <p className="text-sm text-[#868f97] line-clamp-3">
                  {data.description}
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/[0.08] bg-white/[0.015]">
          <Link
            href={`/stock/${symbol}`}
            className="flex items-center gap-2 text-sm text-[#4ebe96] hover:text-[#4ebe96] transition-colors duration-100"
          >
            Full Profile
            <ExternalLink className="w-4 h-4" />
          </Link>
          <div className="flex gap-2">
            <Link href={`/stock/${symbol}/financials`}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.08] rounded-lg transition-colors duration-100">
                <BarChart3 className="w-3.5 h-3.5" />
                Financials
              </button>
            </Link>
            <Link href={`/stock/${symbol}/analysis`}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#4ebe96] hover:bg-[#4ebe96] text-white rounded-lg transition-colors duration-100">
                <DollarSign className="w-3.5 h-3.5" />
                Analyze
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// Clickable stock ticker chip component
interface StockTickerChipProps {
  symbol: string
  className?: string
}

export function StockTickerChip({ symbol, className }: StockTickerChipProps) {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md",
          "bg-[#4ebe96]/10 text-[#4ebe96] hover:bg-[#4ebe96]/20",
          "text-sm font-mono font-medium transition-colors duration-100 cursor-pointer",
          className
        )}
      >
        <span className="text-xs opacity-70">$</span>
        {symbol}
      </button>

      <StockProfilePopup
        symbol={symbol}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </>
  )
}
