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

export default function AnalystRatings({ ticker, currentPrice }: AnalystRatingsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12 text-muted-foreground">
          Unable to load analyst data for {ticker}
        </CardContent>
      </Card>
    )
  }

  const { analystRatings } = data

  // Rating distribution for pie chart
  const ratingData = analystRatings ? [
    { name: 'Strong Buy', value: analystRatings.strongBuy, color: '#10b981' },
    { name: 'Buy', value: analystRatings.buy, color: '#6ee7b7' },
    { name: 'Hold', value: analystRatings.hold, color: '#fbbf24' },
    { name: 'Sell', value: analystRatings.sell, color: '#f97316' },
    { name: 'Strong Sell', value: analystRatings.strongSell, color: '#ef4444' },
  ].filter(d => d.value > 0) : []

  // Bar chart data
  const barData = analystRatings ? [
    { name: 'Strong Buy', count: analystRatings.strongBuy, fill: '#10b981' },
    { name: 'Buy', count: analystRatings.buy, fill: '#6ee7b7' },
    { name: 'Hold', count: analystRatings.hold, fill: '#fbbf24' },
    { name: 'Sell', count: analystRatings.sell, fill: '#f97316' },
    { name: 'Strong Sell', count: analystRatings.strongSell, fill: '#ef4444' },
  ] : []

  // Price calculations
  const targetPrice = analystRatings?.targetPrice || currentPrice
  const upside = ((targetPrice - currentPrice) / currentPrice) * 100
  const priceDiff = targetPrice - currentPrice

  // Calculate consensus
  const getConsensus = () => {
    if (!analystRatings) return { label: 'N/A', color: 'text-muted-foreground' }
    const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0 } = analystRatings
    const bullish = strongBuy + buy
    const bearish = sell + strongSell

    if (bullish > bearish * 2) return { label: 'Strong Buy', color: 'text-emerald-500' }
    if (bullish > bearish) return { label: 'Buy', color: 'text-emerald-400' }
    if (bearish > bullish * 2) return { label: 'Strong Sell', color: 'text-red-500' }
    if (bearish > bullish) return { label: 'Sell', color: 'text-red-400' }
    return { label: 'Hold', color: 'text-yellow-500' }
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
            <Target className="w-6 h-6 text-emerald-500" />
            Analyst Ratings & Price Targets - {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consensus Rating */}
            <div className="text-center p-6 bg-secondary/30 rounded-xl">
              <p className="text-muted-foreground text-sm mb-2">Consensus Rating</p>
              <p className={`text-4xl font-bold ${consensus.color}`}>
                {consensus.label}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Based on {analystRatings?.totalAnalysts || 0} analysts
              </p>
            </div>

            {/* Rating Score */}
            <div className="text-center p-6 bg-secondary/30 rounded-xl">
              <p className="text-muted-foreground text-sm mb-2">Average Rating</p>
              <p className="text-4xl font-bold text-foreground">
                {analystRatings?.rating?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                out of 5.0 ({getScoreLabel(analystRatings?.rating || 0)})
              </p>
            </div>

            {/* Price Target */}
            <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/30">
              <p className="text-muted-foreground text-sm mb-2">Target Price</p>
              <p className="text-4xl font-bold text-emerald-500">
                ${targetPrice.toFixed(2)}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-2 ${upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-muted-foreground">{analystRatings?.totalAnalysts} Total Analysts</p>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" width={80} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
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
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Current Price</p>
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Target Price</p>
              <p className="text-2xl font-bold text-emerald-500">${targetPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Price Difference</p>
              <p className={`text-2xl font-bold ${priceDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Potential Return</p>
              <p className={`text-2xl font-bold ${upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Visual Price Gauge */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Price vs Target</p>
            <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
              {upside >= 0 ? (
                <>
                  <div
                    className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((currentPrice / targetPrice) * 100, 100)}%` }} />
                </>
              ) : (
                <>
                  <div
                    className="absolute h-full bg-gradient-to-r from-red-500 to-red-400"
                    style={{ width: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }}
                  />
                  <div className="absolute h-full w-1 bg-white/50" style={{ left: `${Math.min((targetPrice / currentPrice) * 100, 100)}%` }} />
                </>
              )}
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
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
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
              {upside > 15 ? (
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              ) : upside < -15 ? (
                <TrendingDown className="w-8 h-8 text-red-500" />
              ) : (
                <Minus className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Upside Potential</p>
                <p className={`font-bold ${upside > 15 ? 'text-emerald-500' : upside < -15 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {upside > 15 ? 'Strong' : upside > 0 ? 'Moderate' : upside > -15 ? 'Limited' : 'Negative'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0) > (analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'bg-red-500/20 text-red-500'
              }`}>
                <span className="text-lg font-bold">
                  {(analystRatings?.strongBuy || 0) + (analystRatings?.buy || 0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buy Ratings</p>
                <p className="font-bold">
                  vs {(analystRatings?.sell || 0) + (analystRatings?.strongSell || 0)} Sell
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <span className="text-lg font-bold">{analystRatings?.hold || 0}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hold Ratings</p>
                <p className="font-bold text-muted-foreground">Neutral</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
