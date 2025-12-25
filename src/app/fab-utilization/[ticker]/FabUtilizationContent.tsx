"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { TrendingUp, Activity, Gauge } from 'lucide-react'
import Link from 'next/link'

interface FabUtilizationContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function FabUtilizationContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: FabUtilizationContentProps) {
  const latestMetrics = metrics[0]

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
            <span>Fab Utilization</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Fab Utilization - Semiconductor Capacity Utilization
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} fab utilization rates and manufacturing efficiency.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Manufacturing
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
                <div className="text-sm text-muted-foreground">Utilization Rate</div>
                <Gauge className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                High
              </div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Strong Demand
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Efficiency</div>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Optimized
              </div>
              <div className="text-sm text-muted-foreground">
                Production Efficiency
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Operating Margin</div>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {latestMetrics?.operating_margin ? formatPercent(latestMetrics.operating_margin) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                Latest Period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fab Utilization Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Fab Utilization Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Fab utilization rate measures the percentage of {companyName}'s semiconductor fabrication capacity being actively used for production.
                Higher utilization typically indicates strong demand and operational efficiency.
              </p>
              <p className="text-lg leading-relaxed">
                Fab utilization is crucial because it directly impacts profitability. High utilization spreads fixed costs across more units,
                improving margins, while low utilization can signal weak demand or excess capacity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Impact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Impact on Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Why Fab Utilization Matters</h3>
              <ul>
                <li><strong>Cost Efficiency:</strong> Higher utilization spreads fixed manufacturing costs across more units</li>
                <li><strong>Demand Indicator:</strong> High utilization reflects strong market demand for products</li>
                <li><strong>Pricing Power:</strong> Tight capacity can enable better pricing and margins</li>
                <li><strong>Investment Timing:</strong> Sustained high utilization may justify capacity expansion</li>
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
                href={`/wafer-starts/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Wafer Starts</div>
                <div className="text-sm text-muted-foreground">
                  Production capacity metrics
                </div>
              </Link>
              <Link
                href={`/margins/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Profit Margins</div>
                <div className="text-sm text-muted-foreground">
                  Margin analysis
                </div>
              </Link>
              <Link
                href={`/revenue/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Revenue Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Revenue trends
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
