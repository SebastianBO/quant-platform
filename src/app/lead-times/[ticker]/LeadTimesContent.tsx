"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { Clock, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface LeadTimesContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function LeadTimesContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: LeadTimesContentProps) {
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
            <span>Lead Times</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Lead Times - Semiconductor Delivery Times
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} lead times and chip delivery schedules.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Supply Chain
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
                <div className="text-sm text-muted-foreground">Delivery Status</div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Tracking
              </div>
              <div className="text-sm text-muted-foreground">
                Order Backlog
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Supply Chain</div>
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Active
              </div>
              <div className="text-sm text-muted-foreground">
                Fulfillment Pipeline
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
              <div className="text-sm text-muted-foreground">
                Year-over-year
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Times Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Lead Times Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Lead times represent the duration from when {companyName} receives a chip order to delivery.
                Shorter lead times indicate available capacity, while extended lead times suggest strong demand or supply constraints.
              </p>
              <p className="text-lg leading-relaxed">
                Lead times are a critical indicator of demand-supply balance. Extended lead times often precede revenue growth
                and pricing power, while normalizing lead times can signal moderating demand or capacity additions coming online.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lead Time Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Supply-Demand Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Lead Time Indicators</h3>
              <ul>
                <li><strong>Extending Lead Times:</strong> Indicates strengthening demand or supply constraints, often bullish</li>
                <li><strong>Stable Lead Times:</strong> Suggests balanced supply-demand conditions in the market</li>
                <li><strong>Shortening Lead Times:</strong> May indicate weakening demand or new capacity additions</li>
                <li><strong>Regional Variations:</strong> Different lead times across regions can signal local market dynamics</li>
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
                  Capacity metrics
                </div>
              </Link>
              <Link
                href={`/asp-trend/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">ASP Trends</div>
                <div className="text-sm text-muted-foreground">
                  Pricing analysis
                </div>
              </Link>
              <Link
                href={`/revenue/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Revenue Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Financial performance
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
