"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { Trophy, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DesignWinsContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function DesignWinsContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: DesignWinsContentProps) {
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
            <span>Design Wins</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Design Wins - Semiconductor Customer Wins
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} design wins and customer acquisitions in the semiconductor industry.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Customer Growth
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
                <div className="text-sm text-muted-foreground">Design Win Pipeline</div>
                <Trophy className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Strong
              </div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Growing Pipeline
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Customer Base</div>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Diversified
              </div>
              <div className="text-sm text-muted-foreground">
                Multiple Segments
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

        {/* Design Wins Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Design Wins Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Design wins are customer commitments to use {companyName}'s semiconductor products in their devices.
                These wins represent future revenue opportunities and validate the company's technology competitiveness in the market.
              </p>
              <p className="text-lg leading-relaxed">
                Design wins are leading indicators of future revenue. They typically convert to actual sales over 12-24 months
                as customer products move from development into production, creating a predictable revenue pipeline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Design Win Impact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Strategic Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Why Design Wins Matter</h3>
              <ul>
                <li><strong>Revenue Visibility:</strong> Create predictable future revenue streams over product lifecycles</li>
                <li><strong>Market Validation:</strong> Demonstrate technology competitiveness and customer acceptance</li>
                <li><strong>Competitive Moats:</strong> Once designed in, switching costs create customer stickiness</li>
                <li><strong>Growth Indicator:</strong> Leading indicator of market share gains and revenue expansion</li>
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
                href={`/process-node/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Process Node</div>
                <div className="text-sm text-muted-foreground">
                  Technology capabilities
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
              <Link
                href={`/growth/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Growth Rates</div>
                <div className="text-sm text-muted-foreground">
                  Growth metrics
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
