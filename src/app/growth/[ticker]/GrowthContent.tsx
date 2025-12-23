"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

interface IncomeStatement {
  report_period: string
  fiscal_period: string
  revenue: number
  gross_profit: number
  operating_income: number
  net_income: number
  earnings_per_share: number
}

interface FinancialMetric {
  report_period: string
  fiscal_period: string
  revenue_growth: number
  earnings_growth: number
  gross_margin: number
  operating_margin: number
  net_margin: number
}

interface GrowthContentProps {
  ticker: string
  companyName: string
  sector: string
  incomeStatements: IncomeStatement[]
  metrics: FinancialMetric[]
  fundamentals: any
}

export default function GrowthContent({
  ticker,
  companyName,
  sector,
  incomeStatements,
  metrics,
  fundamentals,
}: GrowthContentProps) {
  const currentYear = new Date().getFullYear()

  // Calculate key metrics
  const latestIncome = incomeStatements[0]
  const latestMetrics = metrics[0]
  const oldestIncome = incomeStatements[incomeStatements.length - 1]

  // Calculate CAGR
  const calculateCAGR = (endValue: number, startValue: number, years: number) => {
    if (!endValue || !startValue || startValue === 0 || years === 0) return null
    return Math.pow(endValue / startValue, 1 / years) - 1
  }

  const years = incomeStatements.length - 1
  const revenueCGAR = calculateCAGR(latestIncome?.revenue, oldestIncome?.revenue, years)
  const earningsCGAR = calculateCAGR(latestIncome?.net_income, oldestIncome?.net_income, years)
  const epsCGAR = calculateCAGR(latestIncome?.earnings_per_share, oldestIncome?.earnings_per_share, years)

  // Prepare chart data
  const revenueChartData = incomeStatements
    .slice()
    .reverse()
    .map((stmt) => ({
      period: stmt.fiscal_period,
      revenue: stmt.revenue,
      netIncome: stmt.net_income,
      eps: stmt.earnings_per_share,
    }))

  const growthRateData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      period: m.fiscal_period,
      revenueGrowth: (m.revenue_growth || 0) * 100,
      earningsGrowth: (m.earnings_growth || 0) * 100,
    }))

  // Growth status
  const isGrowing = (latestMetrics?.revenue_growth || 0) > 0
  const currentRevenueGrowth = latestMetrics?.revenue_growth || 0
  const currentEarningsGrowth = latestMetrics?.earnings_growth || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-primary">{ticker}</Link>
            <span>/</span>
            <span>Growth Rates</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Growth Rates - Revenue & Earnings Growth
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} growth metrics including revenue, earnings, and EPS growth rates.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            {isGrowing && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Growing
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {currentRevenueGrowth !== undefined
                  ? formatPercent(currentRevenueGrowth)
                  : 'N/A'}
              </div>
              <div className={`flex items-center gap-1 text-sm ${currentRevenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currentRevenueGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                Year-over-year
              </div>
              {revenueCGAR !== null && (
                <div className="text-xs text-muted-foreground mt-2">
                  {formatPercent(revenueCGAR)} CAGR ({years}yr)
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Earnings Growth</div>
                <TrendingUpIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {currentEarningsGrowth !== undefined && isFinite(currentEarningsGrowth)
                  ? formatPercent(currentEarningsGrowth)
                  : 'N/A'}
              </div>
              <div className={`flex items-center gap-1 text-sm ${currentEarningsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currentEarningsGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                Year-over-year
              </div>
              {earningsCGAR !== null && isFinite(earningsCGAR) && (
                <div className="text-xs text-muted-foreground mt-2">
                  {formatPercent(earningsCGAR)} CAGR ({years}yr)
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">EPS Growth</div>
                <TrendingUpIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {latestIncome?.earnings_per_share
                  ? `$${latestIncome.earnings_per_share.toFixed(2)}`
                  : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                Latest EPS
              </div>
              {epsCGAR !== null && isFinite(epsCGAR) && (
                <div className="text-xs text-muted-foreground mt-2">
                  {formatPercent(epsCGAR)} CAGR ({years}yr)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Growth Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Growth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                {companyName} ({ticker}) {isGrowing ? 'is experiencing' : 'has shown'}{' '}
                {currentRevenueGrowth !== undefined && (
                  <>
                    a revenue growth rate of{' '}
                    <strong className={currentRevenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatPercent(currentRevenueGrowth)}
                    </strong>
                    {' '}year-over-year
                  </>
                )}.
                {currentEarningsGrowth !== undefined && isFinite(currentEarningsGrowth) && (
                  <>
                    {' '}Earnings have grown by{' '}
                    <strong className={currentEarningsGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatPercent(currentEarningsGrowth)}
                    </strong>
                    {' '}in the same period
                  </>
                )}.
              </p>

              {revenueCGAR !== null && (
                <p className="text-lg leading-relaxed">
                  Over the past {years} years, {companyName} has delivered a compound annual growth rate (CAGR) of{' '}
                  <strong className={revenueCGAR > 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercent(revenueCGAR)}
                  </strong>
                  {' '}for revenue
                  {earningsCGAR !== null && isFinite(earningsCGAR) && (
                    <>
                      {' '}and{' '}
                      <strong className={earningsCGAR > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(earningsCGAR)}
                      </strong>
                      {' '}for earnings
                    </>
                  )}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue and Earnings Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Revenue & Earnings Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Historical revenue and net income for {companyName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="netIncome"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Net Income"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Growth Rate Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Year-over-Year Growth Rates</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Annual percentage change in revenue and earnings
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Legend />
                  <Bar dataKey="revenueGrowth" fill="#10b981" name="Revenue Growth %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="earningsGrowth" fill="#6366f1" name="Earnings Growth %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EPS History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Earnings Per Share (EPS) Growth</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Historical EPS trends for {companyName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'EPS']}
                  />
                  <Line
                    type="monotone"
                    dataKey="eps"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="EPS"
                    dot={{ r: 5, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
              <p>
                Earnings per share (EPS) is a key metric that shows how much profit {companyName} generates for each share of stock.
                {epsCGAR !== null && isFinite(epsCGAR) && (
                  <>
                    {' '}Over the past {years} years, EPS has grown at a CAGR of{' '}
                    <strong className={epsCGAR > 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatPercent(epsCGAR)}
                    </strong>.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Links */}
        <Card>
          <CardHeader>
            <CardTitle>Related Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/stock/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">{ticker} Overview</div>
                <div className="text-sm text-muted-foreground">
                  Complete stock analysis
                </div>
              </Link>
              <Link
                href={`/earnings/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Earnings Calendar</div>
                <div className="text-sm text-muted-foreground">
                  Upcoming earnings dates
                </div>
              </Link>
              <Link
                href={`/financials/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Financial Statements</div>
                <div className="text-sm text-muted-foreground">
                  Income, balance sheet, cash flow
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
