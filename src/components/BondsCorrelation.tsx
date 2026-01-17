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
    <div className={`${width} ${height} bg-white/[0.05] rounded-full overflow-hidden`}>
      <div
        className={cn(
          "h-full rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out",
          isPositive ? "bg-[#4ebe96]" : "bg-[#ff5c5c]"
        )}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function SensitivityBadge({ sensitivity, direction }: { sensitivity: Sensitivity['sensitivity']; direction: Sensitivity['direction'] }) {
  const bgColors = {
    high: direction === 'negative' ? 'bg-[#ff5c5c]/10 text-[#ff5c5c] border-[#ff5c5c]/30' : 'bg-[#4ebe96]/10 text-[#4ebe96] border-[#4ebe96]/30',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    low: 'bg-white/[0.05] text-[#868f97] border-white/[0.08]'
  }

  const icons = {
    high: direction === 'negative' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />,
    medium: <Minus className="w-3 h-3" />,
    low: <Minus className="w-3 h-3" />
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
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
              <div key={i} className="h-12 bg-white/[0.015] rounded-2xl animate-pulse" />
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
          <div className="text-center py-8 text-[#868f97]">
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
          "p-4 rounded-2xl border",
          data.sensitivity.sensitivity === 'high'
            ? data.sensitivity.direction === 'negative'
              ? 'bg-[#ff5c5c]/5 border-[#ff5c5c]/30'
              : 'bg-[#4ebe96]/5 border-[#4ebe96]/30'
            : 'bg-white/[0.015] border-white/[0.08]'
        )}>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 mt-0.5 text-[#868f97] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Interest Rate Impact on {ticker}</p>
              <p className="text-sm text-[#868f97]">{data.sensitivity.explanation}</p>
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
                    stroke="#868f97"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => {
                      const d = new Date(v)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#868f97"
                    tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                    tick={{ fontSize: 10 }}
                    width={45}
                    className="tabular-nums"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
                      name === 'stock' ? ticker : 'TLT'
                    ]}
                    wrapperClassName="tabular-nums"
                  />
                  <ReferenceLine y={0} stroke="#868f97" strokeDasharray="3 3" />
                  <Legend
                    formatter={(value) => value === 'stock' ? ticker : 'TLT'}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#4ebe96"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="tlt"
                    stroke="#479ffa"
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
                  className="p-3 bg-white/[0.015] rounded-2xl hover:bg-white/[0.025] motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{bond.symbol}</span>
                        <span className="text-xs text-[#868f97] truncate">{bond.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CorrelationBar value={bond.correlation} size="small" />
                      <span className={cn(
                        "font-mono text-sm font-medium min-w-[50px] text-right tabular-nums",
                        absCorr > 0.4
                          ? isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
                          : "text-[#868f97]"
                      )}>
                        {isPositive ? '+' : ''}{bond.correlation.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#868f97]">{bond.interpretation}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/[0.015] rounded-2xl text-center">
            <p className="text-xs text-[#868f97] mb-1">Most Correlated</p>
            <p className="font-medium text-sm">{data.summary.mostCorrelated.name}</p>
            <p className={cn(
              "text-sm font-mono tabular-nums",
              data.summary.mostCorrelated.correlation >= 0 ? "text-[#4ebe96]" : "text-[#ff5c5c]"
            )}>
              {data.summary.mostCorrelated.correlation >= 0 ? '+' : ''}
              {data.summary.mostCorrelated.correlation.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-white/[0.015] rounded-2xl text-center">
            <p className="text-xs text-[#868f97] mb-1">Avg Correlation</p>
            <p className={cn(
              "text-xl font-bold font-mono tabular-nums",
              data.summary.avgCorrelation >= 0 ? "text-[#4ebe96]" : "text-[#ff5c5c]"
            )}>
              {data.summary.avgCorrelation >= 0 ? '+' : ''}
              {data.summary.avgCorrelation.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="text-xs text-[#868f97] border-t border-white/[0.08] pt-4">
          <p className="font-medium mb-1">Understanding Correlations</p>
          <ul className="space-y-0.5">
            <li>• <span className="text-[#4ebe96]">Positive</span>: Stock moves with bonds (both rise/fall together)</li>
            <li>• <span className="text-[#ff5c5c]">Negative</span>: Stock moves opposite to bonds</li>
            <li>• <span className="text-[#868f97]">Near 0</span>: No significant relationship</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
