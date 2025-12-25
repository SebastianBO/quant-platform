"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Factory, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'

interface IncomeStatement {
  report_period: string
  fiscal_period: string
  revenue: number
  gross_profit: number
  operating_income: number
  net_income: number
}

interface FoundryRevenueContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
  incomeStatements: IncomeStatement[]
}

export default function FoundryRevenueContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
  incomeStatements,
}: FoundryRevenueContentProps) {
  const latestMetrics = metrics[0]
  const latestIncome = incomeStatements[0]

  // Prepare chart data
  const revenueChartData = incomeStatements
    .slice()
    .reverse()
    .map((stmt) => ({
      period: stmt.fiscal_period,
      revenue: stmt.revenue,
    }))

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
            <span>Foundry Revenue</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Foundry Revenue - Semiconductor Foundry Sales
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} foundry revenue and chip manufacturing business performance.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              Foundry Business
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {latestIncome?.revenue ? formatCurrency(latestIncome.revenue) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                Latest Period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Foundry Market</div>
                <Factory className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Leading
              </div>
              <div className="text-sm text-muted-foreground">
                Market Position
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {latestMetrics?.revenue_growth ? formatPercent(latestMetrics.revenue_growth) : 'N/A'}
              </div>
              <div className="text-sm text-green-500">
                Year-over-year
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        {incomeStatements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Foundry Revenue Trends</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Historical revenue performance for {companyName}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                      formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Foundry Revenue Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Foundry Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Foundry revenue represents income {companyName} generates from semiconductor manufacturing services for other companies.
                This business model separates chip design from manufacturing, serving fabless semiconductor companies.
              </p>
              <p className="text-lg leading-relaxed">
                Foundry revenue growth indicates market share gains and industry demand trends. Strong foundry revenue reflects
                competitive technology, customer diversification, and fab capacity expansion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Position */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Foundry Market Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Foundry Business Drivers</h3>
              <ul>
                <li><strong>Technology Leadership:</strong> Advanced process nodes attract premium customers and higher margins</li>
                <li><strong>Customer Diversification:</strong> Broad customer base reduces concentration risk</li>
                <li><strong>Capacity Expansion:</strong> Fab investments enable revenue growth and market share gains</li>
                <li><strong>Market Share:</strong> Competitive position versus other foundries affects pricing power</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Related Links */}
        <Card>
          <CardHeader>
            <CardTitle>Related Semiconductor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/fab-utilization/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Fab Utilization</div>
                <div className="text-sm text-muted-foreground">
                  Capacity utilization
                </div>
              </Link>
              <Link
                href={`/process-node/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Process Node</div>
                <div className="text-sm text-muted-foreground">
                  Technology capabilities
                </div>
              </Link>
              <Link
                href={`/margins/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Profit Margins</div>
                <div className="text-sm text-muted-foreground">
                  Profitability metrics
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
