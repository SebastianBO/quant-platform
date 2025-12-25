"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface AspTrendContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function AspTrendContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: AspTrendContentProps) {
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
            <span>ASP Trends</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} ASP Trends - Average Selling Price Trends
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} average selling price trends and semiconductor pricing power.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Pricing Power
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
                <div className="text-sm text-muted-foreground">ASP Trend</div>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Tracking
              </div>
              <div className="text-sm text-muted-foreground">
                Price Evolution
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Pricing Power</div>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Competitive
              </div>
              <div className="text-sm text-muted-foreground">
                Market Position
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Gross Margin</div>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {latestMetrics?.gross_margin ? formatPercent(latestMetrics.gross_margin) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                Latest Period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ASP Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">ASP Trends Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                ASP (Average Selling Price) represents the average price {companyName} receives per semiconductor unit sold.
                ASP trends indicate pricing power, product mix shifts, and competitive dynamics in the chip market.
              </p>
              <p className="text-lg leading-relaxed">
                ASP directly impacts revenue as total sales equal unit volume multiplied by ASP. ASP expansion can drive
                revenue growth even with flat unit shipments, while also improving margins and profitability.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ASP Drivers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">ASP Drivers and Implications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Factors Affecting ASP</h3>
              <ul>
                <li><strong>Product Mix:</strong> Shift toward premium products increases ASP, while mainstream mix reduces it</li>
                <li><strong>Technology Node:</strong> Advanced process nodes typically command higher prices</li>
                <li><strong>Supply-Demand:</strong> Tight supply enables pricing power, oversupply leads to price pressure</li>
                <li><strong>Competition:</strong> Competitive intensity and market share dynamics affect pricing</li>
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
              <Link
                href={`/lead-times/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Lead Times</div>
                <div className="text-sm text-muted-foreground">
                  Supply-demand indicator
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
