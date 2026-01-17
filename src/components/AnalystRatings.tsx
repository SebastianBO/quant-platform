"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12 text-[#868f97]">
          Unable to load analyst data for {ticker}
        </CardContent>
      </Card>
    )
  }

  const { analystRatings } = data

  // Rating distribution for pie chart
  const ratingData = analystRatings ? [
    { name: 'Strong Buy', value: analystRatings.strongBuy, color: '#4ebe96' },
    { name: 'Buy', value: analystRatings.buy, color: '#4ebe96' },
    { name: 'Hold', value: analystRatings.hold, color: '#f4a623' },
    { name: 'Sell', value: analystRatings.sell, color: '#e15241' },
    { name: 'Strong Sell', value: analystRatings.strongSell, color: '#e15241' },
  ].filter(d => d.value > 0) : []

  // Bar chart data
  const barData = analystRatings ? [
    { name: 'Strong Buy', count: analystRatings.strongBuy, fill: '#4ebe96' },
    { name: 'Buy', count: analystRatings.buy, fill: '#4ebe96' },
    { name: 'Hold', count: analystRatings.hold, fill: '#f4a623' },
    { name: 'Sell', count: analystRatings.sell, fill: '#e15241' },
    { name: 'Strong Sell', count: analystRatings.strongSell, fill: '#e15241' },
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
    if (bearish > bullish * 2) return { label: 'Strong Sell', color: 'text-[#e15241]' }
    if (bearish > bullish) return { label: 'Sell', color: 'text-[#e15241]' }
    return { label: 'Hold', color: 'text-[#f4a623]' }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#4ebe96]" />
            Analyst Ratings & Price Targets - {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consensus Rating */}
            <div className="text-center p-6 bg-white/[0.015] rounded-xl">
              <p className="text-[#868f97] text-sm mb-2">Consensus Rating</p>
              <p className={`text-4xl font-bold ${consensus.color}`}>
                {consensus.label}
              </p>
              <p className="text-[#868f97] text-sm mt-2">
                Based on {analystRatings?.totalAnalysts || 0} analysts
              </p>
            </div>

            {/* Rating Score */}
            <div className="text-center p-6 bg-white/[0.015] rounded-xl">
              <p className="text-[#868f97] text-sm mb-2">Average Rating</p>
              <p className="text-4xl font-bold text-white">
                {analystRatings?.rating?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-[#868f97] text-sm mt-2">
                out of 5.0 ({getScoreLabel(analystRatings?.rating || 0)})
              </p>
            </div>

            {/* Price Target */}
            <div className="text-center p-6 bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 rounded-xl border border-[#4ebe96]/30">
              <p className="text-[#868f97] text-sm mb-2">Target Price</p>
              <p className="text-4xl font-bold text-[#4ebe96]">
                ${targetPrice.toFixed(2)}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-2 ${upside >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                {upside >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="font-medium">
                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% {upside >= 0 ? 'Upside' : 'Downside'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analyst Recommendation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
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
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-[#868f97]">{analystRatings?.totalAnalysts} Total Analysts</p>
            </div>
          </CardContent>
        </Card>

        {/* Rating Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ratings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis type="number" stroke="#868f97" />
                  <YAxis dataKey="name" type="category" width={80} stroke="#868f97" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
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
          </CardContent>
        </Card>
      </div>

      {/* Price Target Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Target Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/[0.025] rounded-lg text-center">
              <p className="text-[#868f97] text-sm">Current Price</p>
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/[0.025] rounded-lg text-center">
              <p className="text-[#868f97] text-sm">Target Price</p>
              <p className="text-2xl font-bold text-[#4ebe96]">${targetPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/[0.025] rounded-lg text-center">
              <p className="text-[#868f97] text-sm">Price Difference</p>
              <p className={`text-2xl font-bold ${priceDiff >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-white/[0.025] rounded-lg text-center">
              <p className="text-[#868f97] text-sm">Potential Return</p>
              <p className={`text-2xl font-bold ${upside >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
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
                    className="absolute h-full bg-gradient-to-r from-[#4ebe96] to-[#4ebe96]"
                    style={{ width: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }} />
                </>
              ) : (
                <>
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#e15241] to-[#e15241]"
                    style={{ width: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }} />
                </>
              )}
            </div>
            <div className="flex justify-between mt-2 text-sm text-[#868f97]">
              <span>${Math.min(currentPrice, targetPrice).toFixed(2)}</span>
              <span>${Math.max(currentPrice, targetPrice).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Signal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investment Signal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/[0.015] rounded-lg">
              {upside > 15 ? (
                <TrendingUp className="w-8 h-8 text-[#4ebe96]" />
              ) : upside < -15 ? (
                <TrendingDown className="w-8 h-8 text-[#e15241]" />
              ) : (
                <Minus className="w-8 h-8 text-[#f4a623]" />
              )}
              <div>
                <p className="text-sm text-[#868f97]">Upside Potential</p>
                <p className={`font-bold ${upside > 15 ? 'text-[#4ebe96]' : upside < -15 ? 'text-[#e15241]' : 'text-[#f4a623]'}`}>
                  {upside > 15 ? 'Strong' : upside > 0 ? 'Moderate' : upside > -15 ? 'Limited' : 'Negative'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/[0.015] rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0) > (analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)
                  ? 'bg-[#4ebe96]/20 text-[#4ebe96]'
                  : 'bg-[#e15241]/20 text-[#e15241]'
              }`}>
                <span className="text-lg font-bold">
                  {(analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#868f97]">Buy Ratings</p>
                <p className="font-bold">
                  vs {(analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)} Sell
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/[0.015] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#479ffa]/20 text-[#479ffa] flex items-center justify-center">
                <span className="text-lg font-bold">{analystRatings?.hold || 0}</span>
              </div>
              <div>
                <p className="text-sm text-[#868f97]">Hold Ratings</p>
                <p className="font-bold text-[#868f97]">Neutral</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
