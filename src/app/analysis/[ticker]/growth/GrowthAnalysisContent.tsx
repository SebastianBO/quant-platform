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
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Area,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { AnalysisNavigation } from '@/components/analysis/AnalysisNavigation'
import { AnalysisRelatedLinks } from '@/components/analysis/AnalysisRelatedLinks'
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
  return_on_equity: number
  return_on_assets: number
}

interface SegmentedRevenue {
  report_period: string
  segments: Array<{
    segment_type: string
    segment_name: string
    revenue: number
    revenue_percent: number
  }>
}

interface GrowthAnalysisContentProps {
  ticker: string
  companyName: string
  sector: string
  industry: string
  incomeStatements: IncomeStatement[]
  metrics: FinancialMetric[]
  fundamentals: any
  segmentedRevenues: SegmentedRevenue[]
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function GrowthAnalysisContent({
  ticker,
  companyName,
  sector,
  industry,
  incomeStatements,
  metrics,
  fundamentals,
  segmentedRevenues,
}: GrowthAnalysisContentProps) {
  const currentYear = new Date().getFullYear()

  // Calculate key metrics
  const latestIncome = incomeStatements[0]
  const latestMetrics = metrics[0]
  const oldestIncome = incomeStatements[incomeStatements.length - 1]

  // Calculate CAGR for revenue (5-year)
  const calculateCAGR = (endValue: number, startValue: number, years: number) => {
    if (!endValue || !startValue || startValue === 0 || years === 0) return null
    return Math.pow(endValue / startValue, 1 / years) - 1
  }

  const years = incomeStatements.length - 1
  const revenueCGAR = calculateCAGR(latestIncome?.revenue, oldestIncome?.revenue, years)
  const earningsCGAR = calculateCAGR(latestIncome?.net_income, oldestIncome?.net_income, years)

  // Determine growth status
  const isGrowing = (latestMetrics?.revenue_growth || 0) > 0
  const isEarningsGrowing = (latestMetrics?.earnings_growth || 0) > 0
  const isProfitable = (latestIncome?.net_income || 0) > 0

  // Prepare chart data
  const revenueChartData = incomeStatements
    .slice()
    .reverse()
    .map((stmt) => ({
      period: stmt.fiscal_period,
      revenue: stmt.revenue,
      grossProfit: stmt.gross_profit,
      operatingIncome: stmt.operating_income,
      netIncome: stmt.net_income,
    }))

  const growthRateData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      period: m.fiscal_period,
      revenueGrowth: (m.revenue_growth || 0) * 100,
      earningsGrowth: (m.earnings_growth || 0) * 100,
    }))

  const marginData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      period: m.fiscal_period,
      grossMargin: (m.gross_margin || 0) * 100,
      operatingMargin: (m.operating_margin || 0) * 100,
      netMargin: (m.net_margin || 0) * 100,
    }))

  // Segment data for pie chart
  const latestSegments = segmentedRevenues[0]?.segments || []
  const productSegments = latestSegments.filter((s) => s.segment_type === 'product' || s.segment_type === 'business')
  const geoSegments = latestSegments.filter((s) => s.segment_type === 'geographic')

  // Growth assessment
  const getGrowthRating = () => {
    const revenueGrowth = latestMetrics?.revenue_growth || 0
    if (revenueGrowth > 0.2) return { label: 'Excellent', color: 'bg-green-500', icon: CheckCircle }
    if (revenueGrowth > 0.1) return { label: 'Strong', color: 'bg-green-400', icon: CheckCircle }
    if (revenueGrowth > 0.05) return { label: 'Moderate', color: 'bg-yellow-500', icon: AlertCircle }
    if (revenueGrowth > 0) return { label: 'Slow', color: 'bg-yellow-400', icon: AlertCircle }
    return { label: 'Declining', color: 'bg-red-500', icon: TrendingDown }
  }

  const growthRating = getGrowthRating()
  const GrowthIcon = growthRating.icon

  return (
    <div className="min-h-screen bg-background">
      <AnalysisNavigation ticker={ticker} />
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-primary">{ticker}</Link>
            <span>/</span>
            <span>Growth Analysis</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Is {companyName} Growing?
          </h1>

          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge variant="secondary">
              {industry}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg ${growthRating.color} text-white font-semibold flex items-center gap-2`}>
              <GrowthIcon className="w-5 h-5" />
              {growthRating.label} Growth
            </div>
            {isProfitable && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Profitable
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Growth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                {companyName} ({ticker}) {isGrowing ? 'is currently growing' : 'has experienced challenges in growth'}
                {latestMetrics?.revenue_growth && (
                  <>
                    {' '}with a year-over-year revenue growth rate of{' '}
                    <strong className={latestMetrics.revenue_growth > 0 ? 'text-green-500' : 'text-red-500'}>
                      {(latestMetrics.revenue_growth * 100).toFixed(1)}%
                    </strong>
                  </>
                )}.
                {' '}The company operates in the {sector} sector, specifically in the {industry} industry.
              </p>

              {revenueCGAR !== null && (
                <p className="text-lg leading-relaxed">
                  Over the past {years} years, {companyName} has achieved a revenue compound annual growth rate (CAGR) of{' '}
                  <strong className={revenueCGAR > 0 ? 'text-green-500' : 'text-red-500'}>
                    {(revenueCGAR * 100).toFixed(1)}%
                  </strong>
                  {earningsCGAR !== null && isFinite(earningsCGAR) && (
                    <>
                      , while earnings have grown at{' '}
                      <strong className={earningsCGAR > 0 ? 'text-green-500' : 'text-red-500'}>
                        {(earningsCGAR * 100).toFixed(1)}%
                      </strong>
                      {' '}CAGR
                    </>
                  )}.
                </p>
              )}

              {latestMetrics?.net_margin && (
                <p className="text-lg leading-relaxed">
                  The company's net profit margin stands at{' '}
                  <strong>{(latestMetrics.net_margin * 100).toFixed(1)}%</strong>,
                  {latestMetrics.net_margin > 0.2 ? ' indicating strong profitability' :
                   latestMetrics.net_margin > 0.1 ? ' showing healthy profitability' :
                   latestMetrics.net_margin > 0 ? ' demonstrating modest profitability' :
                   ' reflecting current losses'}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Latest Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(latestIncome?.revenue || 0)}</div>
              {latestMetrics?.revenue_growth !== undefined && (
                <div className={`flex items-center gap-1 text-sm mt-2 ${latestMetrics.revenue_growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {latestMetrics.revenue_growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(latestMetrics.revenue_growth * 100).toFixed(1)}% YoY
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Net Income</div>
              <div className="text-2xl font-bold">{formatCurrency(latestIncome?.net_income || 0)}</div>
              {latestMetrics?.earnings_growth !== undefined && isFinite(latestMetrics.earnings_growth) && (
                <div className={`flex items-center gap-1 text-sm mt-2 ${latestMetrics.earnings_growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {latestMetrics.earnings_growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(latestMetrics.earnings_growth * 100).toFixed(1)}% YoY
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">5-Year Revenue CAGR</div>
              <div className="text-2xl font-bold">
                {revenueCGAR !== null ? `${(revenueCGAR * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {years} years of data
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Net Margin</div>
              <div className="text-2xl font-bold">
                {latestMetrics?.net_margin ? `${(latestMetrics.net_margin * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Latest period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Growth Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Revenue Growth Over Time</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Historical revenue and profitability trends for {companyName}
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
                    dataKey="grossProfit"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Gross Profit"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netIncome"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Net Income"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
              <p>
                The chart above illustrates {companyName}'s revenue trajectory over the past {years} years.
                {isGrowing ? (
                  <> The upward trend in revenue demonstrates the company's ability to expand its market presence and increase sales.</>
                ) : (
                  <> The revenue pattern shows the challenges the company has faced in recent periods.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Growth Rates */}
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
            <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
              <p>
                Growth rates provide insight into the momentum of {companyName}'s business.
                {latestMetrics?.revenue_growth !== undefined && latestMetrics.revenue_growth > 0.15 && (
                  <> The company is experiencing strong double-digit growth, which is particularly impressive for its industry.</>
                )}
                {latestMetrics?.earnings_growth !== undefined &&
                 latestMetrics.earnings_growth > (latestMetrics.revenue_growth || 0) && (
                  <> Notably, earnings are growing faster than revenue, indicating improving operational efficiency.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margins */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Profit Margin Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              How efficiently {companyName} converts revenue into profit
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marginData}>
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
                  <Line
                    type="monotone"
                    dataKey="grossMargin"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Gross Margin"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="operatingMargin"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Operating Margin"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netMargin"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Net Margin"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-3">Understanding Profit Margins</h3>
              <p>
                Profit margins reveal how much of each dollar of revenue {companyName} retains at different stages:
              </p>
              <ul>
                <li>
                  <strong>Gross Margin ({latestMetrics?.gross_margin ? (latestMetrics.gross_margin * 100).toFixed(1) : 'N/A'}%):</strong>
                  {' '}What remains after direct production costs
                </li>
                <li>
                  <strong>Operating Margin ({latestMetrics?.operating_margin ? (latestMetrics.operating_margin * 100).toFixed(1) : 'N/A'}%):</strong>
                  {' '}Profit from core operations before interest and taxes
                </li>
                <li>
                  <strong>Net Margin ({latestMetrics?.net_margin ? (latestMetrics.net_margin * 100).toFixed(1) : 'N/A'}%):</strong>
                  {' '}Final profit after all expenses
                </li>
              </ul>
              {latestMetrics?.net_margin !== undefined && (
                <p>
                  {latestMetrics.net_margin > 0.15 && (
                    <>A net margin above 15% indicates {companyName} is highly profitable relative to its revenue base.</>
                  )}
                  {latestMetrics.net_margin > 0.05 && latestMetrics.net_margin <= 0.15 && (
                    <>A net margin between 5-15% shows {companyName} maintains reasonable profitability.</>
                  )}
                  {latestMetrics.net_margin > 0 && latestMetrics.net_margin <= 0.05 && (
                    <>A low net margin suggests {companyName} operates with thin profit margins, which is common in some industries.</>
                  )}
                  {latestMetrics.net_margin <= 0 && (
                    <>{companyName} is currently unprofitable, which may be intentional if the company is investing heavily in growth.</>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown by Segment */}
        {productSegments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Revenue Breakdown by Segment</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                How {companyName} generates revenue across different product lines or business units
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment_name, revenue_percent }) =>
                          `${segment_name}: ${((revenue_percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="segment_name"
                      >
                        {productSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {productSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{segment.segment_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(segment.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          {((segment.revenue_percent || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 prose prose-slate dark:prose-invert max-w-none">
                <p>
                  Understanding {companyName}'s revenue composition helps assess business diversification and growth opportunities.
                  {productSegments.length > 3 && (
                    <> The company's diverse revenue streams provide resilience against market fluctuations in any single segment.</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Future Growth Outlook */}
        {fundamentals?.highlights && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Future Growth Outlook</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Analyst estimates and forward-looking indicators
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {fundamentals.highlights.epsEstimateCurrentYear && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">EPS Estimate {currentYear}</div>
                      <div className="text-2xl font-bold">
                        ${fundamentals.highlights.epsEstimateCurrentYear.toFixed(2)}
                      </div>
                      {latestIncome?.earnings_per_share && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Current: ${latestIncome.earnings_per_share.toFixed(2)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {fundamentals.highlights.epsEstimateNextYear && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">EPS Estimate {currentYear + 1}</div>
                      <div className="text-2xl font-bold">
                        ${fundamentals.highlights.epsEstimateNextYear.toFixed(2)}
                      </div>
                      {fundamentals.highlights.epsEstimateCurrentYear && (
                        <div className={`text-sm mt-2 ${
                          fundamentals.highlights.epsEstimateNextYear > fundamentals.highlights.epsEstimateCurrentYear
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}>
                          {((fundamentals.highlights.epsEstimateNextYear / fundamentals.highlights.epsEstimateCurrentYear - 1) * 100).toFixed(1)}%
                          {' '}expected growth
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {fundamentals.highlights.wallStreetTargetPrice && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Price Target</div>
                      <div className="text-2xl font-bold">
                        ${fundamentals.highlights.wallStreetTargetPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Analyst consensus
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-3">What Analysts Are Saying</h3>
                <p>
                  Wall Street analysts project {companyName} to continue
                  {fundamentals.highlights.epsEstimateNextYear > fundamentals.highlights.epsEstimateCurrentYear
                    ? ' growing earnings in the coming year'
                    : ' focusing on sustainable operations'
                  }.
                  {fundamentals.analystRatings?.rating && (
                    <> The consensus analyst rating is{' '}
                      <strong>{fundamentals.analystRatings.rating}</strong>
                      {fundamentals.analystRatings.totalAnalysts && (
                        <> based on {fundamentals.analystRatings.totalAnalysts} analyst{fundamentals.analystRatings.totalAnalysts > 1 ? 's' : ''}</>
                      )}.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conclusion */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Growth Analysis Conclusion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Based on our comprehensive analysis, {companyName} ({ticker}) demonstrates{' '}
                <strong className={isGrowing ? 'text-green-500' : 'text-yellow-500'}>
                  {growthRating.label.toLowerCase()} growth characteristics
                </strong>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Key Takeaways:</h3>
              <ul className="space-y-2">
                <li>
                  <strong>Revenue Growth:</strong>
                  {latestMetrics?.revenue_growth !== undefined && (
                    <> {(latestMetrics.revenue_growth * 100).toFixed(1)}% year-over-year</>
                  )}
                  {revenueCGAR !== null && (
                    <>, {(revenueCGAR * 100).toFixed(1)}% CAGR over {years} years</>
                  )}
                </li>
                <li>
                  <strong>Profitability:</strong>
                  {latestMetrics?.net_margin && (
                    <> Net margin of {(latestMetrics.net_margin * 100).toFixed(1)}%</>
                  )}
                  {isProfitable ? (
                    <> demonstrates the company is profitable</>
                  ) : (
                    <> shows the company is investing in growth over short-term profits</>
                  )}
                </li>
                <li>
                  <strong>Efficiency:</strong>
                  {latestMetrics?.return_on_equity && (
                    <> Return on equity of {(latestMetrics.return_on_equity * 100).toFixed(1)}%</>
                  )}
                  {latestMetrics?.return_on_assets && (
                    <>, return on assets of {(latestMetrics.return_on_assets * 100).toFixed(1)}%</>
                  )}
                </li>
                {productSegments.length > 0 && (
                  <li>
                    <strong>Diversification:</strong> Revenue comes from {productSegments.length} distinct segment
                    {productSegments.length > 1 ? 's' : ''}, providing business stability
                  </li>
                )}
              </ul>

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Investment Considerations</h4>
                <p className="text-sm">
                  This growth analysis provides a comprehensive view of {companyName}'s historical performance and future outlook.
                  Investors should consider these growth metrics alongside valuation, competitive positioning, and broader market conditions
                  when making investment decisions. Past performance does not guarantee future results.
                </p>
              </div>
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
                  Complete stock analysis dashboard
                </div>
              </Link>
              <Link
                href={`/analysis/${ticker.toLowerCase()}/valuation`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Valuation Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Is {ticker} overvalued or undervalued?
                </div>
              </Link>
              <Link
                href={`/analysis/${ticker.toLowerCase()}/dividends`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Dividend Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Dividend yield and payout history
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <AnalysisRelatedLinks
          ticker={ticker}
          currentAnalysisType="growth"
          companyName={companyName}
        />
      </div>
    </div>
  )
}
