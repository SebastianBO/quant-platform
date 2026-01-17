"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Target, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface AnalystRatingsProps {
  ticker: string
  currentPrice: number
}

export default function AnalystRatings({ ticker, currentPrice: rawPrice }: AnalystRatingsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Ensure currentPrice is a valid number
  const currentPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fundamentals?ticker=${ticker}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching analyst data:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="w-full bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
        <div className="flex items-center justify-center h-64 p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
        <div className="text-center py-12 px-6 text-[#868f97]">
          Unable to load analyst data for {ticker}
        </div>
      </div>
    )
  }

  const { analystRatings } = data

  // Rating distribution for pie chart - Fey colors: success #4ebe96, warning #ffa16c, error #ff5c5c
  const ratingData = analystRatings ? [
    { name: 'Strong Buy', value: analystRatings.strongBuy, color: '#4ebe96' },
    { name: 'Buy', value: analystRatings.buy, color: '#4ebe96' },
    { name: 'Hold', value: analystRatings.hold, color: '#ffa16c' },
    { name: 'Sell', value: analystRatings.sell, color: '#ff5c5c' },
    { name: 'Strong Sell', value: analystRatings.strongSell, color: '#ff5c5c' },
  ].filter(d => d.value > 0) : []

  // Bar chart data - Fey colors
  const barData = analystRatings ? [
    { name: 'Strong Buy', count: analystRatings.strongBuy, fill: '#4ebe96' },
    { name: 'Buy', count: analystRatings.buy, fill: '#4ebe96' },
    { name: 'Hold', count: analystRatings.hold, fill: '#ffa16c' },
    { name: 'Sell', count: analystRatings.sell, fill: '#ff5c5c' },
    { name: 'Strong Sell', count: analystRatings.strongSell, fill: '#ff5c5c' },
  ] : []

  // Price calculations
  const targetPrice = analystRatings?.targetPrice || currentPrice
  const upside = ((targetPrice - currentPrice) / currentPrice) * 100
  const priceDiff = targetPrice - currentPrice

  // Calculate consensus
  const getConsensus = () => {
    if (!analystRatings) return { label: 'N/A', color: 'text-[#868f97]' }
    const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0 } = analystRatings
    const bullish = strongBuy + buy
    const bearish = sell + strongSell

    if (bullish > bearish * 2) return { label: 'Strong Buy', color: 'text-[#4ebe96]' }
    if (bullish > bearish) return { label: 'Buy', color: 'text-[#4ebe96]' }
    if (bearish > bullish * 2) return { label: 'Strong Sell', color: 'text-[#ff5c5c]' }
    if (bearish > bullish) return { label: 'Sell', color: 'text-[#ff5c5c]' }
    return { label: 'Hold', color: 'text-[#ffa16c]' }
  }

  const consensus = getConsensus()

  // Calculate score (1-5 scale)
  const getScoreLabel = (rating: number) => {
    if (rating >= 4.5) return 'Strong Buy'
    if (rating >= 3.5) return 'Buy'
    if (rating >= 2.5) return 'Hold'
    if (rating >= 1.5) return 'Sell'
    return 'Strong Sell'
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 hover:border-white/[0.15] focus-within:ring-2 focus-within:ring-[#479ffa]">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Target className="w-6 h-6 text-[#4ebe96]" />
            Analyst Ratings & Price Targets - {ticker}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consensus Rating */}
            <div className="text-center p-6 bg-white/[0.04] rounded-xl motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm mb-2">Consensus Rating</p>
              <p className={`text-4xl font-bold tracking-[-0.02em] ${consensus.color}`}>
                {consensus.label}
              </p>
              <p className="text-[#868f97] text-sm mt-2 tabular-nums">
                Based on {analystRatings?.totalAnalysts || 0} analysts
              </p>
            </div>

            {/* Rating Score */}
            <div className="text-center p-6 bg-white/[0.04] rounded-xl motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm mb-2">Average Rating</p>
              <p className="text-4xl font-bold text-white tabular-nums tracking-[-0.02em]">
                {analystRatings?.rating?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-[#868f97] text-sm mt-2">
                out of 5.0 ({getScoreLabel(analystRatings?.rating || 0)})
              </p>
            </div>

            {/* Price Target */}
            <div className="text-center p-6 bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 rounded-xl border border-[#4ebe96]/30 motion-safe:transition-all motion-safe:duration-150 hover:border-[#4ebe96]/50">
              <p className="text-[#868f97] text-sm mb-2">Target Price</p>
              <p className="text-4xl font-bold text-[#4ebe96] tabular-nums tracking-[-0.02em]">
                ${targetPrice.toFixed(2)}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-2 tabular-nums ${upside >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                {upside >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="font-medium">
                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% {upside >= 0 ? 'Upside' : 'Downside'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution Pie */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 hover:border-white/[0.15]">
          <div className="p-6 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Analyst Recommendation Distribution</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-[#868f97] tabular-nums">{analystRatings?.totalAnalysts} Total Analysts</p>
            </div>
          </div>
        </div>

        {/* Rating Bar Chart */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 hover:border-white/[0.15]">
          <div className="p-6 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Ratings Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis type="number" stroke="#868f97" />
                  <YAxis dataKey="name" type="category" width={80} stroke="#868f97" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Price Target Details */}
      <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 hover:border-white/[0.15]">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Price Target Analysis</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/[0.04] rounded-lg text-center motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm">Current Price</p>
              <p className="text-2xl font-bold tabular-nums tracking-[-0.02em]">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/[0.04] rounded-lg text-center motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm">Target Price</p>
              <p className="text-2xl font-bold text-[#4ebe96] tabular-nums tracking-[-0.02em]">${targetPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/[0.04] rounded-lg text-center motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm">Price Difference</p>
              <p className={`text-2xl font-bold tabular-nums tracking-[-0.02em] ${priceDiff >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-white/[0.04] rounded-lg text-center motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06]">
              <p className="text-[#868f97] text-sm">Potential Return</p>
              <p className={`text-2xl font-bold tabular-nums tracking-[-0.02em] ${upside >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Visual Price Gauge */}
          <div className="mt-6">
            <p className="text-sm text-[#868f97] mb-3">Price vs Target</p>
            <div className="relative h-8 bg-white/[0.05] rounded-full overflow-hidden">
              {upside >= 0 ? (
                <>
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#4ebe96] to-[#4ebe96] motion-safe:transition-all motion-safe:duration-150"
                    style={{ width: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }} />
                </>
              ) : (
                <>
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#ff5c5c] to-[#ff5c5c] motion-safe:transition-all motion-safe:duration-150"
                    style={{ width: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }} />
                </>
              )}
            </div>
            <div className="flex justify-between mt-2 text-sm text-[#868f97] tabular-nums">
              <span>${Math.min(currentPrice, targetPrice).toFixed(2)}</span>
              <span>${Math.max(currentPrice, targetPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Signal */}
      <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 hover:border-white/[0.15]">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Investment Signal Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-white/[0.04] rounded-lg motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#479ffa] focus-visible:ring-offset-2 focus-visible:ring-offset-black text-left">
              {upside > 15 ? (
                <TrendingUp className="w-8 h-8 text-[#4ebe96]" />
              ) : upside < -15 ? (
                <TrendingDown className="w-8 h-8 text-[#ff5c5c]" />
              ) : (
                <Minus className="w-8 h-8 text-[#ffa16c]" />
              )}
              <div>
                <p className="text-sm text-[#868f97]">Upside Potential</p>
                <p className={`font-bold ${upside > 15 ? 'text-[#4ebe96]' : upside < -15 ? 'text-[#ff5c5c]' : 'text-[#ffa16c]'}`}>
                  {upside > 15 ? 'Strong' : upside > 0 ? 'Moderate' : upside > -15 ? 'Limited' : 'Negative'}
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white/[0.04] rounded-lg motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#479ffa] focus-visible:ring-offset-2 focus-visible:ring-offset-black text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center tabular-nums ${
                (analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0) > (analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)
                  ? 'bg-[#4ebe96]/20 text-[#4ebe96]'
                  : 'bg-[#ff5c5c]/20 text-[#ff5c5c]'
              }`}>
                <span className="text-lg font-bold">
                  {(analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#868f97]">Buy Ratings</p>
                <p className="font-bold tabular-nums">
                  vs {(analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)} Sell
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-white/[0.04] rounded-lg motion-safe:transition-all motion-safe:duration-150 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#479ffa] focus-visible:ring-offset-2 focus-visible:ring-offset-black text-left">
              <div className="w-8 h-8 rounded-full bg-[#479ffa]/20 text-[#479ffa] flex items-center justify-center tabular-nums">
                <span className="text-lg font-bold">{analystRatings?.hold || 0}</span>
              </div>
              <div>
                <p className="text-sm text-[#868f97]">Hold Ratings</p>
                <p className="font-bold text-[#868f97]">Neutral</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
