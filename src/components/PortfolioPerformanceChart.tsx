"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts"

interface PortfolioPerformanceChartProps {
  portfolioId: string
  portfolioName: string
  currency: string
  totalValue: number
  totalCost: number
}

interface ChartDataPoint {
  date: string
  dateLabel: string
  portfolio: number
  spy: number
  portfolioNormalized: number
  spyNormalized: number
}

interface SpyHistoryDay {
  date: string
  close: number
}

const TIME_PERIODS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', days: 'ytd' },
  { label: '1Y', days: 365 },
]

export default function PortfolioPerformanceChart({
  portfolioId,
  portfolioName,
  currency,
  totalValue,
  totalCost
}: PortfolioPerformanceChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<number | string>(90)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Calculate date range
        let startDate: Date
        const endDate = new Date()

        if (selectedPeriod === 'ytd') {
          startDate = new Date(endDate.getFullYear(), 0, 1)
        } else {
          startDate = new Date()
          startDate.setDate(startDate.getDate() - (selectedPeriod as number))
        }

        const fromStr = startDate.toISOString().split('T')[0]
        const toStr = endDate.toISOString().split('T')[0]

        // Fetch S&P 500 data from EODHD
        const spyResponse = await fetch(
          `/api/stock?ticker=SPY&from=${fromStr}&to=${toStr}`
        )

        if (!spyResponse.ok) {
          throw new Error('Failed to fetch market data')
        }

        const spyData = await spyResponse.json()
        const spyHistory = spyData.history || []

        if (spyHistory.length === 0) {
          setError('No market data available for this period')
          setLoading(false)
          return
        }

        // Generate simulated portfolio performance based on current gain
        // (In production, this would come from actual portfolio history)
        const portfolioGainPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
        const spyStartPrice = spyHistory[0]?.close || 100
        const spyEndPrice = spyHistory[spyHistory.length - 1]?.close || spyStartPrice

        // Normalize both to start at 100
        const data: ChartDataPoint[] = spyHistory.map((day: SpyHistoryDay, index: number) => {
          const spyNormalized = (day.close / spyStartPrice) * 100

          // Interpolate portfolio value (simplified - in production use real history)
          const progress = index / (spyHistory.length - 1)
          const portfolioNormalized = 100 + (portfolioGainPercent * progress)

          return {
            date: day.date,
            dateLabel: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            portfolio: portfolioNormalized,
            spy: spyNormalized,
            portfolioNormalized,
            spyNormalized
          }
        })

        setChartData(data)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('Unable to load performance data')
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedPeriod, totalValue, totalCost])

  const portfolioReturn = chartData.length > 0
    ? chartData[chartData.length - 1].portfolio - 100
    : 0
  const spyReturn = chartData.length > 0
    ? chartData[chartData.length - 1].spy - 100
    : 0
  const outperformance = portfolioReturn - spyReturn

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Performance vs Market</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Performance vs Market</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Performance vs Market
          </CardTitle>
          <div className="flex items-center gap-2">
            {outperformance >= 0 ? (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{outperformance.toFixed(1)}% vs S&P 500
              </span>
            ) : (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {outperformance.toFixed(1)}% vs S&P 500
              </span>
            )}
          </div>
        </div>

        {/* Time Period Filters */}
        <div className="flex gap-1 flex-wrap">
          {TIME_PERIODS.map(period => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriod(period.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedPeriod === period.days
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="spyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  const label = name === 'portfolio' ? portfolioName : 'S&P 500'
                  return [`${(value - 100).toFixed(2)}%`, label]
                }}
              />
              <Legend
                formatter={(value) => value === 'portfolio' ? portfolioName : 'S&P 500'}
              />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                name="portfolio"
              />
              <Area
                type="monotone"
                dataKey="spy"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#spyGradient)"
                name="spy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className={`text-lg font-bold ${portfolioReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground">Portfolio</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${spyReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {spyReturn >= 0 ? '+' : ''}{spyReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground">S&P 500</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${outperformance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground">Alpha</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
