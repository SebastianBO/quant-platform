"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ComposedChart,
  Bar
} from "recharts"
import { TrendingUp, TrendingDown, Settings } from "lucide-react"

interface ChartDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface AnalystRating {
  date: string
  analyst: string
  rating: string
  priceTarget: number
  action: string
}

interface ChartData {
  ticker: string
  period: string
  currentPrice: number
  previousClose: number
  dayChange: number
  dayChangePercent: number
  periodChange: number
  periodChangePercent: number
  high52Week: number
  low52Week: number
  data: ChartDataPoint[]
  analystRatings: AnalystRating[]
}

interface RatingPointData extends AnalystRating {
  x: number
  y: number
}

interface ChartTooltipPayload {
  payload: ChartDataPoint & { index: number; displayDate: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string
}

const TIME_PERIODS = [
  { id: '1D', label: '1D' },
  { id: '5D', label: '5D' },
  { id: '1M', label: '1M' },
  { id: '6M', label: '6M' },
  { id: 'YTD', label: 'YTD' },
  { id: '1Y', label: '1Y' },
  { id: '5Y', label: '5Y' },
  { id: 'ALL', label: 'All' },
]

interface InteractiveStockChartProps {
  ticker: string
  initialPeriod?: string
}

export default function InteractiveStockChart({
  ticker,
  initialPeriod = '1M'
}: InteractiveStockChartProps) {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(initialPeriod)
  const [showKeyEvents, setShowKeyEvents] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null)

  useEffect(() => {
    fetchChartData()
  }, [ticker, period])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chart-data?ticker=${ticker}&period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
    setLoading(false)
  }

  const isPositive = (data?.periodChangePercent || 0) >= 0
  const chartColor = isPositive ? '#4ebe96' : '#e15241'

  // Format chart data
  const chartData = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((d, i) => ({
      ...d,
      index: i,
      displayDate: formatDate(d.date, period)
    }))
  }, [data, period])

  // Find analyst rating points on chart
  const ratingPoints = useMemo(() => {
    if (!showKeyEvents || !data?.analystRatings || !chartData.length) return []

    return data.analystRatings
      .map(rating => {
        const chartPoint = chartData.find(d => d.date === rating.date)
        if (!chartPoint) return null
        return {
          ...rating,
          x: chartPoint.index,
          y: chartPoint.close
        }
      })
      .filter((point): point is NonNullable<typeof point> => point !== null)
  }, [data, chartData, showKeyEvents])

  function formatDate(dateStr: string, period: string): string {
    const date = new Date(dateStr)
    if (period === '1D') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    if (period === '5D' || period === '1M') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload?.[0]) return null

    const point = payload[0].payload
    return (
      <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{point.displayDate}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
          <span className="text-[#868f97]">Open:</span>
          <span className="font-medium">${point.open?.toFixed(2)}</span>
          <span className="text-[#868f97]">High:</span>
          <span className="font-medium">${point.high?.toFixed(2)}</span>
          <span className="text-[#868f97]">Low:</span>
          <span className="font-medium">${point.low?.toFixed(2)}</span>
          <span className="text-[#868f97]">Close:</span>
          <span className="font-medium">${point.close?.toFixed(2)}</span>
          {showVolume && (
            <>
              <span className="text-[#868f97]">Volume:</span>
              <span className="font-medium">{(point.volume / 1e6).toFixed(2)}M</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-[#1a1a1a] border-white/[0.08]">
      <CardContent className="py-4">
        {/* Header with period change */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Period Change Badge */}
            <div className={`px-3 py-1 rounded-lg ${isPositive ? 'bg-[#4ebe96]/20' : 'bg-[#e15241]/20'}`}>
              <span className={`font-bold ${isPositive ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                {isPositive ? '+' : ''}{data?.periodChangePercent?.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={showKeyEvents ? "default" : "outline"}
              size="sm"
              onClick={() => setShowKeyEvents(!showKeyEvents)}
              className="text-xs"
            >
              Key Events
            </Button>
            <Button
              variant={showVolume ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
              className="text-xs"
            >
              Volume
            </Button>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-1 mb-4">
          {TIME_PERIODS.map(p => (
            <Button
              key={p.id}
              variant={period === p.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p.id)}
              className={`px-3 ${period === p.id ? 'bg-primary text-primary-foreground' : 'text-[#868f97]'}`}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  stroke="currentColor"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  className="text-[#868f97]"
                />
                <YAxis
                  stroke="currentColor"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${v}`}
                  className="text-[#868f97]"
                  yAxisId="price"
                />
                {showVolume && (
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'dataMax']}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />

                {/* Volume Bars */}
                {showVolume && (
                  <Bar
                    dataKey="volume"
                    fill="currentColor"
                    opacity={0.2}
                    yAxisId="volume"
                    className="text-[#868f97]"
                  />
                )}

                {/* Price Area */}
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  yAxisId="price"
                />

                {/* Analyst Rating Points */}
                {showKeyEvents && ratingPoints.map((point, i) => (
                  <ReferenceDot
                    key={i}
                    x={point.x}
                    y={point.y}
                    r={6}
                    fill="#f59e0b"
                    stroke="#f59e0b"
                    yAxisId="price"
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Current Price Display */}
        {data && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.08]">
            <div>
              <span className="text-2xl font-bold">${data.currentPrice?.toFixed(2)}</span>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{data.dayChange?.toFixed(2)} ({isPositive ? '+' : ''}{data.dayChangePercent?.toFixed(2)}%) today
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-[#868f97]">
              <p>52W High: ${data.high52Week?.toFixed(2) || '-'}</p>
              <p>52W Low: ${data.low52Week?.toFixed(2) || '-'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
