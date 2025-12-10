"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from "lucide-react"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts"

interface BondCorrelation {
  symbol: string
  name: string
  description: string
  correlation: number
  interpretation: string
}

interface TreasuryCorrelation {
  maturity: string
  name: string
  correlation: number
  yieldChange: number
}

interface Sensitivity {
  sensitivity: 'high' | 'medium' | 'low'
  direction: 'positive' | 'negative' | 'neutral'
  explanation: string
}

interface ChartDataPoint {
  date: string
  stock: number
  tlt: number | null
}

interface BondsCorrelationData {
  ticker: string
  bondCorrelations: BondCorrelation[]
  treasuryCorrelations: TreasuryCorrelation[]
  sensitivity: Sensitivity
  chartData: ChartDataPoint[]
  summary: {
    mostCorrelated: { symbol: string; name: string; correlation: number }
    avgCorrelation: number
  }
}

interface BondsCorrelationProps {
  ticker: string
}

function CorrelationBar({ value, size = 'default' }: { value: number; size?: 'default' | 'small' }) {
  const absValue = Math.abs(value)
  const percentage = absValue * 100
  const isPositive = value >= 0

  const height = size === 'small' ? 'h-1.5' : 'h-2'
  const width = size === 'small' ? 'w-16' : 'w-24'

  return (
    <div className={`${width} ${height} bg-secondary rounded-full overflow-hidden`}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          isPositive ? "bg-green-500" : "bg-red-500"
        )}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function SensitivityBadge({ sensitivity, direction }: { sensitivity: Sensitivity['sensitivity']; direction: Sensitivity['direction'] }) {
  const bgColors = {
    high: direction === 'negative' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    low: 'bg-secondary text-muted-foreground border-border'
  }

  const icons = {
    high: direction === 'negative' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />,
    medium: <Minus className="w-3 h-3" />,
    low: <Minus className="w-3 h-3" />
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
      bgColors[sensitivity]
    )}>
      {icons[sensitivity]}
      {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)} Rate Sensitivity
    </span>
  )
}

export default function BondsCorrelation({ ticker }: BondsCorrelationProps) {
  const [data, setData] = useState<BondsCorrelationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/bonds-correlation?ticker=${ticker}`)
        if (!response.ok) throw new Error('Failed to fetch bonds correlation data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching bonds correlation:', err)
        setError('Unable to load bonds correlation data')
      }

      setLoading(false)
    }

    fetchData()
  }, [ticker])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            Bonds Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-secondary/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            Bonds Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{error || 'No data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span>Bonds & Rate Correlation</span>
            <DataSourceIndicator source="yahoo-finance" />
          </div>
          <SensitivityBadge
            sensitivity={data.sensitivity.sensitivity}
            direction={data.sensitivity.direction}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interest Rate Sensitivity Summary */}
        <div className={cn(
          "p-4 rounded-lg border",
          data.sensitivity.sensitivity === 'high'
            ? data.sensitivity.direction === 'negative'
              ? 'bg-red-500/5 border-red-500/30'
              : 'bg-green-500/5 border-green-500/30'
            : 'bg-secondary/30 border-border'
        )}>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Interest Rate Impact on {ticker}</p>
              <p className="text-sm text-muted-foreground">{data.sensitivity.explanation}</p>
            </div>
          </div>
        </div>

        {/* Correlation Chart */}
        {data.chartData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">60-Day Performance vs Long Treasury (TLT)</p>
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => {
                      const d = new Date(v)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                    tick={{ fontSize: 10 }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
                      name === 'stock' ? ticker : 'TLT'
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Legend
                    formatter={(value) => value === 'stock' ? ticker : 'TLT'}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="tlt"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bond ETF Correlations */}
        <div>
          <p className="text-sm font-medium mb-3">Bond ETF Correlations (1Y)</p>
          <div className="space-y-2">
            {data.bondCorrelations.map((bond) => {
              const isPositive = bond.correlation >= 0
              const absCorr = Math.abs(bond.correlation)

              return (
                <div
                  key={bond.symbol}
                  className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{bond.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate">{bond.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CorrelationBar value={bond.correlation} size="small" />
                      <span className={cn(
                        "font-mono text-sm font-medium min-w-[50px] text-right",
                        absCorr > 0.4
                          ? isPositive ? "text-green-500" : "text-red-500"
                          : "text-muted-foreground"
                      )}>
                        {isPositive ? '+' : ''}{bond.correlation.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{bond.interpretation}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Most Correlated</p>
            <p className="font-medium text-sm">{data.summary.mostCorrelated.name}</p>
            <p className={cn(
              "text-sm font-mono",
              data.summary.mostCorrelated.correlation >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {data.summary.mostCorrelated.correlation >= 0 ? '+' : ''}
              {data.summary.mostCorrelated.correlation.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Correlation</p>
            <p className={cn(
              "text-xl font-bold font-mono",
              data.summary.avgCorrelation >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {data.summary.avgCorrelation >= 0 ? '+' : ''}
              {data.summary.avgCorrelation.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-medium mb-1">Understanding Correlations</p>
          <ul className="space-y-0.5">
            <li>• <span className="text-green-500">Positive</span>: Stock moves with bonds (both rise/fall together)</li>
            <li>• <span className="text-red-500">Negative</span>: Stock moves opposite to bonds</li>
            <li>• <span className="text-muted-foreground">Near 0</span>: No significant relationship</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
