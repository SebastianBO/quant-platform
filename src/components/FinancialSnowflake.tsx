"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useTheme } from "next-themes"

interface FinancialSnowflakeProps {
  ticker: string
  metrics: {
    return_on_invested_capital?: number
    gross_margin?: number
    operating_margin?: number
    net_margin?: number
    revenue_growth?: number
    debt_to_equity?: number
    current_ratio?: number
    free_cash_flow_yield?: number
    price_to_earnings_ratio?: number
  }
}

export default function FinancialSnowflake({ ticker, metrics }: FinancialSnowflakeProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Normalize metrics to 0-100 scale for radar chart
  const normalizeMetric = (value: number | undefined, max: number, inverse?: boolean): number => {
    if (value === undefined || value === null) return 0
    const normalized = Math.min(Math.abs(value) / max, 1) * 100
    return inverse ? Math.max(0, 100 - normalized) : normalized
  }

  const radarData = [
    {
      dimension: 'Profitability',
      value: normalizeMetric(metrics.return_on_invested_capital, 0.30),
      actual: `${((metrics.return_on_invested_capital || 0) * 100).toFixed(1)}% ROIC`
    },
    {
      dimension: 'Margins',
      value: normalizeMetric(metrics.gross_margin, 0.80),
      actual: `${((metrics.gross_margin || 0) * 100).toFixed(1)}% Gross`
    },
    {
      dimension: 'Growth',
      value: normalizeMetric(metrics.revenue_growth, 0.30),
      actual: `${((metrics.revenue_growth || 0) * 100).toFixed(1)}% Rev Growth`
    },
    {
      dimension: 'Value',
      value: normalizeMetric(metrics.price_to_earnings_ratio, 50, true),
      actual: `${(metrics.price_to_earnings_ratio || 0).toFixed(1)} P/E`
    },
    {
      dimension: 'Cash Flow',
      value: normalizeMetric(metrics.free_cash_flow_yield, 0.10),
      actual: `${((metrics.free_cash_flow_yield || 0) * 100).toFixed(1)}% FCF Yield`
    },
    {
      dimension: 'Stability',
      value: normalizeMetric(metrics.debt_to_equity, 2, true),
      actual: `${(metrics.debt_to_equity || 0).toFixed(2)} D/E`
    },
  ]

  // Calculate overall score
  const avgScore = radarData.reduce((sum, d) => sum + d.value, 0) / radarData.length

  const getScoreLabel = (score: number): { label: string; colorClass: string } => {
    if (score >= 75) return { label: 'Excellent', colorClass: 'text-green-500' }
    if (score >= 60) return { label: 'Good', colorClass: 'text-blue-500' }
    if (score >= 45) return { label: 'Average', colorClass: 'text-yellow-500' }
    if (score >= 30) return { label: 'Below Average', colorClass: 'text-orange-500' }
    return { label: 'Poor', colorClass: 'text-red-500' }
  }

  const scoreInfo = getScoreLabel(avgScore)

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">❄️</span>
          Financial Health Snowflake - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Score Summary */}
        <div className="flex items-center justify-center mb-6 p-6 bg-secondary/50 rounded-xl border border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">Overall Health Score</p>
            <p className={`text-5xl font-bold ${scoreInfo.colorClass}`}>
              {avgScore.toFixed(0)}
            </p>
            <p className={`text-lg font-medium ${scoreInfo.colorClass} mt-1`}>{scoreInfo.label}</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="80%">
              <PolarGrid stroke={isDark ? 'hsl(0 0% 30%)' : 'hsl(0 0% 80%)'} />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: isDark ? 'hsl(0 0% 65%)' : 'hsl(0 0% 40%)', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: isDark ? 'hsl(0 0% 50%)' : 'hsl(0 0% 50%)', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? 'hsl(0 0% 10%)' : 'hsl(0 0% 100%)',
                  border: isDark ? '1px solid hsl(0 0% 20%)' : '1px solid hsl(0 0% 85%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(0)}/100 - ${props.payload.actual}`,
                  'Score'
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {radarData.map((dim, i) => (
            <div key={i} className="p-4 bg-secondary/30 rounded-xl border border-border/50 text-center hover:bg-secondary/50 transition-colors">
              <p className="text-muted-foreground text-xs mb-1">{dim.dimension}</p>
              <p className={`text-2xl font-bold ${
                dim.value >= 70 ? 'text-green-500' :
                dim.value >= 50 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {dim.value.toFixed(0)}
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">{dim.actual}</p>
            </div>
          ))}
        </div>

        {/* Interpretation */}
        <div className="mt-6 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/50">
          <p className="font-semibold mb-2">Snowflake Analysis</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {avgScore >= 70
              ? `${ticker} shows exceptional financial health across all dimensions. The balanced snowflake indicates a well-run company with strong fundamentals.`
              : avgScore >= 50
              ? `${ticker} has solid fundamentals overall, though some dimensions could be stronger. Focus on areas where the snowflake contracts inward.`
              : `${ticker} shows some weaknesses in its financial profile. The asymmetric snowflake highlights areas that may need improvement or closer monitoring.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
