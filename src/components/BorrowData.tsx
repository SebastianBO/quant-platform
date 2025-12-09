"use client"

import { useState, useEffect } from "react"
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
  Legend
} from "recharts"

interface BorrowRecord {
  date: string
  time: string
  fee: number
  available: number
}

interface BorrowDataResponse {
  ticker: string
  available: boolean
  message?: string
  latest: BorrowRecord | null
  history: BorrowRecord[]
  stats: {
    avgFee: string
    maxFee: string
    minFee: string
    isHardToBorrow: boolean
    feeTrend: string
    availabilityTrend: number
  }
  source: string
  disclaimer: string
}

interface BorrowDataProps {
  ticker: string
  compact?: boolean
}

export default function BorrowData({ ticker, compact = false }: BorrowDataProps) {
  const [data, setData] = useState<BorrowDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/borrow-data?ticker=${ticker}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Unable to load borrow data')
      console.error('Borrow data error:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (ticker) {
      fetchData()
    }
  }, [ticker])

  const formatNumber = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Borrow Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data?.available) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Borrow Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-muted-foreground text-sm text-center">
            {data?.message || error || 'Not available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Compact sidebar view
  if (compact) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>Borrow Data</span>
              {data.stats.isHardToBorrow && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">HTB</span>
              )}
            </CardTitle>
            <button onClick={fetchData} className="p-1 hover:bg-secondary rounded">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="py-2 space-y-3">
          {/* Current Fee */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Borrow Fee</span>
            <span className={`text-sm font-bold ${
              data.latest && data.latest.fee > 50 ? 'text-red-500' :
              data.latest && data.latest.fee > 10 ? 'text-amber-500' :
              'text-green-500'
            }`}>
              {data.latest?.fee?.toFixed(1) || '-'}%
            </span>
          </div>

          {/* Available Shares */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Available</span>
            <span className="text-sm font-medium">
              {data.latest?.available ? formatNumber(data.latest.available) : '-'}
            </span>
          </div>

          {/* Fee Trend */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Fee Trend</span>
            <div className={`flex items-center gap-1 text-sm ${
              parseFloat(data.stats.feeTrend) > 0 ? 'text-red-500' :
              parseFloat(data.stats.feeTrend) < 0 ? 'text-green-500' :
              'text-muted-foreground'
            }`}>
              {parseFloat(data.stats.feeTrend) > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : parseFloat(data.stats.feeTrend) < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              <span>{data.stats.feeTrend}%</span>
            </div>
          </div>

          {/* Fee Range */}
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Min: {data.stats.minFee}%</span>
              <span>Avg: {data.stats.avgFee}%</span>
              <span>Max: {data.stats.maxFee}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  data.latest && data.latest.fee > 50 ? 'bg-red-500' :
                  data.latest && data.latest.fee > 10 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(100, ((data.latest?.fee || 0) / Math.max(parseFloat(data.stats.maxFee), 1)) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Hard to Borrow Warning */}
          {data.stats.isHardToBorrow && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded text-xs text-red-500">
              <AlertTriangle className="w-3 h-3" />
              <span>Hard to Borrow</span>
            </div>
          )}

          {/* Source */}
          <a
            href={`https://iborrowdesk.com/report/${ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>via Interactive Brokers</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>
    )
  }

  // Full view with chart
  const chartData = data.history.slice(-50).map((record, index) => ({
    ...record,
    index,
    availableK: record.available / 1000
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Borrow Availability - {ticker}</span>
            {data.stats.isHardToBorrow && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">Hard to Borrow</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <a
              href={`https://iborrowdesk.com/report/${ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              iBorrowDesk <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={fetchData} className="p-1.5 hover:bg-secondary rounded">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg text-center ${
            data.latest && data.latest.fee > 50 ? 'bg-red-500/20' :
            data.latest && data.latest.fee > 10 ? 'bg-amber-500/20' :
            'bg-green-500/20'
          }`}>
            <p className={`text-2xl font-bold ${
              data.latest && data.latest.fee > 50 ? 'text-red-500' :
              data.latest && data.latest.fee > 10 ? 'text-amber-500' :
              'text-green-500'
            }`}>
              {data.latest?.fee?.toFixed(1) || '-'}%
            </p>
            <p className="text-xs text-muted-foreground">Current Fee</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">
              {data.latest?.available ? formatNumber(data.latest.available) : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Shares Available</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{data.stats.avgFee}%</p>
            <p className="text-xs text-muted-foreground">Avg Fee</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            parseFloat(data.stats.feeTrend) > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              parseFloat(data.stats.feeTrend) > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {parseFloat(data.stats.feeTrend) > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {data.stats.feeTrend}%
            </div>
            <p className="text-xs text-muted-foreground">Fee Trend</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                />
                <YAxis
                  yAxisId="fee"
                  stroke="#f59e0b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  yAxisId="available"
                  orientation="right"
                  stroke="#22c55e"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Borrow Fee') return [`${value.toFixed(2)}%`, name]
                    if (name === 'Available') return [`${(value * 1000).toLocaleString()}`, name]
                    return [value, name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="available"
                  dataKey="availableK"
                  fill="#22c55e"
                  fillOpacity={0.5}
                  name="Available"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="fee"
                  type="monotone"
                  dataKey="fee"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Borrow Fee"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-2 bg-secondary/30 rounded text-xs text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{data.disclaimer}</span>
        </div>
      </CardContent>
    </Card>
  )
}
