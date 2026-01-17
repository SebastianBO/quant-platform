"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, Info, ExternalLink, RefreshCw } from "lucide-react"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Legend,
  Area
} from "recharts"

interface ShortVolumeData {
  date: string
  shortVolume: number
  totalVolume: number
  shortPercent: number
  shortExemptVolume: number
  close?: number
  open?: number
  high?: number
  low?: number
}

interface ShortInterestData {
  settlementDate: string
  shortInterest: number
  avgDailyVolume: number
  daysToCover: number
  percentFloat: number
}

interface ShortVolumeResponse {
  ticker: string
  shortInterest: ShortInterestData | null
  dailyShortVolume: ShortVolumeData[]
  summary: {
    avgShortPercent: string
    recentTrend: string
    trendPercent: string
    sharesOutstanding: number
    sharesFloat: number
    dataSource: string
  }
  disclaimer: string
}

interface ShortVolumeProps {
  ticker: string
}

const TIME_PERIODS = [
  { label: '5D', days: 5 },
  { label: '10D', days: 10 },
  { label: '1M', days: 30 },
  { label: '2M', days: 60 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
]

export default function ShortVolume({ ticker }: ShortVolumeProps) {
  const [data, setData] = useState<ShortVolumeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(45)
  const [showPrice, setShowPrice] = useState(true)

  const fetchData = useCallback(async (days: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/short-volume?ticker=${ticker}&period=${days}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Unable to load short volume data')
      console.error('Short volume error:', err)
    }
    setLoading(false)
  }, [ticker])

  useEffect(() => {
    if (ticker) {
      fetchData(selectedPeriod)
    }
  }, [ticker, selectedPeriod, fetchData])

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toString()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading && !data) {
    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Short Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Short Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#868f97] text-center py-8">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.dailyShortVolume.map(d => ({
    ...d,
    dateLabel: formatDate(d.date),
    shortVolumeM: d.shortVolume / 1e6,
    totalVolumeM: d.totalVolume / 1e6,
    regularVolumeM: (d.totalVolume - d.shortVolume) / 1e6
  }))

  const isBearish = data.shortInterest && data.shortInterest.percentFloat > 15
  const isHighShort = data.shortInterest && data.shortInterest.daysToCover > 5

  // Calculate price range for Y axis
  const prices = chartData.filter(d => d.close).map(d => d.close as number)
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.95 : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.05 : 100

  return (
    <div className="space-y-6">
      {/* Short Interest Summary */}
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Short Interest - {ticker}
            </div>
            <a
              href="https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#868f97] hover:text-white flex items-center gap-1"
            >
              FINRA Data <ExternalLink className="w-3 h-3" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.shortInterest ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/[0.025] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{formatVolume(data.shortInterest.shortInterest)}</p>
                <p className="text-xs text-[#868f97]">Short Interest</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${isBearish ? 'bg-[#e15241]/20' : 'bg-white/[0.025]'}`}>
                <p className={`text-2xl font-bold ${isBearish ? 'text-[#e15241]' : ''}`}>
                  {data.shortInterest.percentFloat.toFixed(2)}%
                </p>
                <p className="text-xs text-[#868f97]">% of Float</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${isHighShort ? 'bg-amber-500/20' : 'bg-white/[0.025]'}`}>
                <p className={`text-2xl font-bold ${isHighShort ? 'text-amber-500' : ''}`}>
                  {data.shortInterest.daysToCover.toFixed(1)}
                </p>
                <p className="text-xs text-[#868f97]">Days to Cover</p>
              </div>
              <div className="bg-white/[0.025] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{formatVolume(data.shortInterest.avgDailyVolume)}</p>
                <p className="text-xs text-[#868f97]">Avg Daily Volume</p>
              </div>
            </div>
          ) : (
            <p className="text-[#868f97] text-center py-4">Short interest data not available</p>
          )}

          {/* Short Squeeze Indicator */}
          {data.shortInterest && data.shortInterest.percentFloat > 20 && (
            <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-500">High Short Interest Alert</span>
              </div>
              <p className="text-sm text-[#868f97] mt-1">
                {ticker} has over 20% of float sold short. This could indicate potential for a short squeeze if positive catalysts emerge.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Short Volume Chart */}
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Daily Short Volume
              <span className={`text-xs px-2 py-0.5 rounded ${
                data.summary.dataSource.includes('FINRA') ? 'bg-[#4ebe96]/20 text-[#4ebe96]' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {data.summary.dataSource}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(selectedPeriod)}
                className="p-1.5 hover:bg-white/[0.08] rounded"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className={`text-sm px-2 py-1 rounded ${
                data.summary.recentTrend === 'Increasing' ? 'bg-[#e15241]/20 text-[#e15241]' :
                data.summary.recentTrend === 'Decreasing' ? 'bg-[#4ebe96]/20 text-[#4ebe96]' :
                'bg-white/[0.05] text-[#868f97]'
              }`}>
                {data.summary.recentTrend === 'Increasing' ? <TrendingUp className="w-4 h-4 inline mr-1" /> :
                 data.summary.recentTrend === 'Decreasing' ? <TrendingDown className="w-4 h-4 inline mr-1" /> : null}
                {data.summary.recentTrend}
              </span>
            </div>
          </div>

          {/* Time Period Filters */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 flex-wrap">
              {TIME_PERIODS.map(period => (
                <button
                  key={period.days}
                  onClick={() => setSelectedPeriod(period.days)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-100 ${
                    selectedPeriod === period.days
                      ? 'bg-[#4ebe96] text-white'
                      : 'bg-white/[0.05] text-[#868f97] hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-100 ${
                showPrice ? 'bg-[#479ffa] text-white' : 'bg-white/[0.05] text-[#868f97]'
              }`}
            >
              Price Overlay
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="dateLabel"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="volume"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}M`}
                />
                <YAxis
                  yAxisId="percent"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 70]}
                />
                {showPrice && prices.length > 0 && (
                  <YAxis
                    yAxisId="price"
                    orientation="right"
                    stroke="#479ffa"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                    domain={[minPrice, maxPrice]}
                    hide
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Short %') return [`${value.toFixed(1)}%`, name]
                    if (name === 'Price') return [`$${value.toFixed(2)}`, name]
                    return [`${value.toFixed(2)}M`, name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="volume"
                  dataKey="regularVolumeM"
                  fill="#4ebe96"
                  fillOpacity={0.85}
                  name="Regular Volume"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="shortVolumeM"
                  fill="#e15241"
                  fillOpacity={0.85}
                  name="Short Volume"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="percent"
                  type="monotone"
                  dataKey="shortPercent"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Short %"
                />
                {showPrice && prices.length > 0 && (
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="close"
                    stroke="#479ffa"
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                    connectNulls
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.08]">
            <div className="text-center">
              <p className="text-lg font-bold">{data.summary.avgShortPercent}%</p>
              <p className="text-xs text-[#868f97]">Avg Short %</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{formatVolume(data.summary.sharesFloat)}</p>
              <p className="text-xs text-[#868f97]">Float</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{formatVolume(data.summary.sharesOutstanding)}</p>
              <p className="text-xs text-[#868f97]">Shares Out</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 p-2 bg-white/[0.015] rounded text-xs text-[#868f97] flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{data.disclaimer}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
