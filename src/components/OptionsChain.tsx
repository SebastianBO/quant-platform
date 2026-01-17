"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react"

interface OptionContract {
  contractName: string
  type: "CALL" | "PUT"
  strike: number
  lastPrice: number
  bid: number
  ask: number
  change: number
  changePercent: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  expirationDate: string
  inTheMoney: string
}

interface ExpirationData {
  expirationDate: string
  options: {
    CALL: OptionContract[]
    PUT: OptionContract[]
  }
}

interface OptionsData {
  code: string
  lastTradeDate: string
  lastTradePrice: number
  data: ExpirationData[]
}

interface OptionsChainProps {
  ticker: string
}

type ViewMode = "straddle" | "calls" | "puts"

export default function OptionsChain({ ticker }: OptionsChainProps) {
  const [data, setData] = useState<OptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpiration, setSelectedExpiration] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("straddle")
  const [strikeFilter, setStrikeFilter] = useState<"all" | "itm" | "otm" | "near">("all")
  const [showExpirationDropdown, setShowExpirationDropdown] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/options?ticker=${ticker}`)
        if (!response.ok) throw new Error("Failed to fetch options data")

        const result = await response.json()
        setData(result)

        // Set default expiration to first available
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          setSelectedExpiration(result.data[0].expirationDate)
        }
      } catch (err) {
        console.error("Options fetch error:", err)
        setError("Unable to load options data")
      }

      setLoading(false)
    }

    if (ticker) {
      fetchOptions()
    }
  }, [ticker])

  const currentExpiration = useMemo(() => {
    if (!data || !data.data || !Array.isArray(data.data) || !selectedExpiration) return null
    return data.data.find(d => d.expirationDate === selectedExpiration) || null
  }, [data, selectedExpiration])

  const filteredOptions = useMemo(() => {
    if (!currentExpiration || !currentExpiration.options) return { calls: [], puts: [], strikes: [] }

    const calls = currentExpiration.options?.CALL || []
    const puts = currentExpiration.options?.PUT || []
    const currentPrice = data?.lastTradePrice || 0

    // Get all unique strikes
    const allStrikes = new Set<number>()
    if (Array.isArray(calls)) calls.forEach(c => allStrikes.add(c.strike))
    if (Array.isArray(puts)) puts.forEach(p => allStrikes.add(p.strike))
    let strikes = Array.from(allStrikes).sort((a, b) => a - b)

    // Apply strike filter
    if (strikeFilter === "near") {
      const nearRange = currentPrice * 0.1 // 10% range
      strikes = strikes.filter(s => Math.abs(s - currentPrice) <= nearRange)
    } else if (strikeFilter === "itm") {
      // ITM: calls below current price, puts above
      strikes = strikes.filter(s => s < currentPrice || s > currentPrice)
    }

    return { calls: Array.isArray(calls) ? calls : [], puts: Array.isArray(puts) ? puts : [], strikes }
  }, [currentExpiration, strikeFilter, data?.lastTradePrice])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatPrice = (value: number) => {
    if (!value || value === 0) return "-"
    return value.toFixed(2)
  }

  const formatChange = (value: number) => {
    if (!value || value === 0) return "0.00"
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    if (!value || value === 0) return "0.00%"
    const sign = value > 0 ? "+" : ""
    return `${sign}${(value * 100).toFixed(2)}%`
  }

  const formatVolume = (value: number) => {
    if (!value) return "-"
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  if (loading) {
    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader>
          <CardTitle>Options Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader>
          <CardTitle>Options Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#868f97] text-center py-8">{error || "No options data available for this ticker"}</p>
        </CardContent>
      </Card>
    )
  }

  const currentPrice = data.lastTradePrice || 0

  return (
    <Card className="bg-[#1a1a1a] border-white/[0.08]">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Options Chain - {ticker}
          </CardTitle>
          <div className="text-sm text-[#868f97]">
            {data.lastTradeDate && (
              <>At close: {formatDate(data.lastTradeDate)} | </>
            )}
            Last: ${currentPrice.toFixed(2)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Expiration Date Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExpirationDropdown(!showExpirationDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-lg text-sm font-medium hover:bg-white/[0.08] transition-colors duration-100"
            >
              {selectedExpiration ? formatDate(selectedExpiration) : "Select Date"}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExpirationDropdown && data?.data && Array.isArray(data.data) && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#1a1a1a] border border-white/[0.08] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {data.data.map(exp => (
                  <button
                    key={exp.expirationDate}
                    onClick={() => {
                      setSelectedExpiration(exp.expirationDate)
                      setShowExpirationDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/[0.08] transition-colors duration-100 ${
                      selectedExpiration === exp.expirationDate ? "bg-[#4ebe96]/20 text-[#4ebe96]" : ""
                    }`}
                  >
                    {formatDate(exp.expirationDate)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Strike Filter */}
          <div className="relative">
            <select
              value={strikeFilter}
              onChange={(e) => setStrikeFilter(e.target.value as typeof strikeFilter)}
              className="px-4 py-2 bg-white/[0.05] rounded-lg text-sm font-medium appearance-none pr-8 cursor-pointer hover:bg-white/[0.08] transition-colors duration-100"
            >
              <option value="all">All Strikes</option>
              <option value="near">Near the Money</option>
              <option value="itm">In the Money</option>
              <option value="otm">Out of Money</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="flex bg-white/[0.05] rounded-lg p-1">
            {(["straddle", "calls", "puts"] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors duration-100 ${
                  viewMode === mode
                    ? "bg-[#4ebe96] text-white"
                    : "text-[#868f97] hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "straddle" ? (
          <StraddleView
            calls={filteredOptions.calls}
            puts={filteredOptions.puts}
            strikes={filteredOptions.strikes}
            currentPrice={currentPrice}
            formatPrice={formatPrice}
            formatChange={formatChange}
            formatPercent={formatPercent}
            formatVolume={formatVolume}
          />
        ) : (
          <ListView
            options={viewMode === "calls" ? filteredOptions.calls : filteredOptions.puts}
            type={viewMode === "calls" ? "CALL" : "PUT"}
            currentPrice={currentPrice}
            formatPrice={formatPrice}
            formatChange={formatChange}
            formatPercent={formatPercent}
            formatVolume={formatVolume}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Straddle View Component
function StraddleView({
  calls,
  puts,
  strikes,
  currentPrice,
  formatPrice,
  formatChange,
  formatPercent,
  formatVolume
}: {
  calls: OptionContract[]
  puts: OptionContract[]
  strikes: number[]
  currentPrice: number
  formatPrice: (v: number) => string
  formatChange: (v: number) => string
  formatPercent: (v: number) => string
  formatVolume: (v: number) => string
}) {
  if (!strikes || strikes.length === 0) {
    return <div className="text-[#868f97] text-center py-8">No options data available</div>
  }
  const callMap = new Map((calls || []).map(c => [c.strike, c]))
  const putMap = new Map((puts || []).map(p => [p.strike, p]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th colSpan={5} className="text-left py-2 px-2 font-semibold text-[#4ebe96]">Calls</th>
            <th className="py-2 px-4 font-semibold"></th>
            <th colSpan={5} className="text-right py-2 px-2 font-semibold text-[#e15241]">Puts</th>
          </tr>
          <tr className="border-b border-white/[0.08] text-[#868f97] text-xs">
            <th className="py-2 px-2 text-left">Last</th>
            <th className="py-2 px-2 text-left">Chg</th>
            <th className="py-2 px-2 text-left">%Chg</th>
            <th className="py-2 px-2 text-right">Vol</th>
            <th className="py-2 px-2 text-right">OI</th>
            <th className="py-2 px-4 text-center font-semibold text-white">Strike</th>
            <th className="py-2 px-2 text-left">Last</th>
            <th className="py-2 px-2 text-left">Chg</th>
            <th className="py-2 px-2 text-left">%Chg</th>
            <th className="py-2 px-2 text-right">Vol</th>
            <th className="py-2 px-2 text-right">OI</th>
          </tr>
        </thead>
        <tbody>
          {strikes.map(strike => {
            const call = callMap.get(strike)
            const put = putMap.get(strike)
            const isATM = Math.abs(strike - currentPrice) < currentPrice * 0.01
            const isITMCall = strike < currentPrice
            const isITMPut = strike > currentPrice

            return (
              <tr
                key={strike}
                className={`border-b border-white/[0.08]/50 hover:bg-white/[0.05]/30 transition-colors duration-100 ${
                  isATM ? "bg-yellow-500/10" : ""
                }`}
              >
                {/* Calls */}
                <td className={`py-2 px-2 ${isITMCall ? "bg-[#4ebe96]/5" : ""}`}>
                  {call ? formatPrice(call.lastPrice) : "-"}
                </td>
                <td className={`py-2 px-2 ${isITMCall ? "bg-[#4ebe96]/5" : ""} ${
                  call && call.change > 0 ? "text-[#4ebe96]" : call && call.change < 0 ? "text-[#e15241]" : ""
                }`}>
                  {call ? formatChange(call.change) : "-"}
                </td>
                <td className={`py-2 px-2 ${isITMCall ? "bg-[#4ebe96]/5" : ""} ${
                  call && call.changePercent > 0 ? "text-[#4ebe96]" : call && call.changePercent < 0 ? "text-[#e15241]" : ""
                }`}>
                  {call ? formatPercent(call.changePercent) : "-"}
                </td>
                <td className={`py-2 px-2 text-right ${isITMCall ? "bg-[#4ebe96]/5" : ""}`}>
                  {call ? formatVolume(call.volume) : "-"}
                </td>
                <td className={`py-2 px-2 text-right ${isITMCall ? "bg-[#4ebe96]/5" : ""}`}>
                  {call ? formatVolume(call.openInterest) : "-"}
                </td>

                {/* Strike */}
                <td className={`py-2 px-4 text-center font-semibold ${isATM ? "text-yellow-500" : ""}`}>
                  {strike.toFixed(2)}
                </td>

                {/* Puts */}
                <td className={`py-2 px-2 ${isITMPut ? "bg-[#e15241]/5" : ""}`}>
                  {put ? formatPrice(put.lastPrice) : "-"}
                </td>
                <td className={`py-2 px-2 ${isITMPut ? "bg-[#e15241]/5" : ""} ${
                  put && put.change > 0 ? "text-[#4ebe96]" : put && put.change < 0 ? "text-[#e15241]" : ""
                }`}>
                  {put ? formatChange(put.change) : "-"}
                </td>
                <td className={`py-2 px-2 ${isITMPut ? "bg-[#e15241]/5" : ""} ${
                  put && put.changePercent > 0 ? "text-[#4ebe96]" : put && put.changePercent < 0 ? "text-[#e15241]" : ""
                }`}>
                  {put ? formatPercent(put.changePercent) : "-"}
                </td>
                <td className={`py-2 px-2 text-right ${isITMPut ? "bg-[#e15241]/5" : ""}`}>
                  {put ? formatVolume(put.volume) : "-"}
                </td>
                <td className={`py-2 px-2 text-right ${isITMPut ? "bg-[#e15241]/5" : ""}`}>
                  {put ? formatVolume(put.openInterest) : "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// List View Component
function ListView({
  options,
  type,
  currentPrice,
  formatPrice,
  formatChange,
  formatPercent,
  formatVolume
}: {
  options: OptionContract[]
  type: "CALL" | "PUT"
  currentPrice: number
  formatPrice: (v: number) => string
  formatChange: (v: number) => string
  formatPercent: (v: number) => string
  formatVolume: (v: number) => string
}) {
  // Safe guard against null/undefined options
  const safeOptions = options && Array.isArray(options) ? options : []

  if (safeOptions.length === 0) {
    return <div className="text-[#868f97] text-center py-8">No options data available</div>
  }
  const sortedOptions = safeOptions.slice().sort((a, b) => a.strike - b.strike)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-[#868f97] text-xs">
            <th className="py-2 px-2 text-left">Contract</th>
            <th className="py-2 px-2 text-center">Strike</th>
            <th className="py-2 px-2 text-right">Last</th>
            <th className="py-2 px-2 text-right">Bid</th>
            <th className="py-2 px-2 text-right">Ask</th>
            <th className="py-2 px-2 text-right">Chg</th>
            <th className="py-2 px-2 text-right">%Chg</th>
            <th className="py-2 px-2 text-right">Vol</th>
            <th className="py-2 px-2 text-right">OI</th>
            <th className="py-2 px-2 text-right">IV</th>
            <th className="py-2 px-2 text-right">Delta</th>
          </tr>
        </thead>
        <tbody>
          {sortedOptions.map(option => {
            const isITM = type === "CALL" ? option.strike < currentPrice : option.strike > currentPrice
            const isATM = Math.abs(option.strike - currentPrice) < currentPrice * 0.01

            return (
              <tr
                key={option.contractName}
                className={`border-b border-white/[0.08]/50 hover:bg-white/[0.05]/30 cursor-pointer transition-colors duration-100 ${
                  isATM ? "bg-yellow-500/10" : isITM ? (type === "CALL" ? "bg-[#4ebe96]/5" : "bg-[#e15241]/5") : ""
                }`}
              >
                <td className="py-2 px-2 font-mono text-xs">{option.contractName}</td>
                <td className={`py-2 px-2 text-center font-semibold ${isATM ? "text-yellow-500" : ""}`}>
                  ${option.strike.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right">{formatPrice(option.lastPrice)}</td>
                <td className="py-2 px-2 text-right text-[#868f97]">{formatPrice(option.bid)}</td>
                <td className="py-2 px-2 text-right text-[#868f97]">{formatPrice(option.ask)}</td>
                <td className={`py-2 px-2 text-right ${
                  option.change > 0 ? "text-[#4ebe96]" : option.change < 0 ? "text-[#e15241]" : ""
                }`}>
                  {formatChange(option.change)}
                </td>
                <td className={`py-2 px-2 text-right ${
                  option.changePercent > 0 ? "text-[#4ebe96]" : option.changePercent < 0 ? "text-[#e15241]" : ""
                }`}>
                  {formatPercent(option.changePercent)}
                </td>
                <td className="py-2 px-2 text-right">{formatVolume(option.volume)}</td>
                <td className="py-2 px-2 text-right">{formatVolume(option.openInterest)}</td>
                <td className="py-2 px-2 text-right">
                  {option.impliedVolatility ? `${option.impliedVolatility.toFixed(1)}%` : "-"}
                </td>
                <td className="py-2 px-2 text-right">
                  {option.delta ? option.delta.toFixed(3) : "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
