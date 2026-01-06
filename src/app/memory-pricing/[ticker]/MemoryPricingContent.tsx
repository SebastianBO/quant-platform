"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { Cpu, TrendingUp, Database } from 'lucide-react'
import Link from 'next/link'

interface MemoryPricingContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function MemoryPricingContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: MemoryPricingContentProps) {
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
            <span>Memory Pricing</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Memory Pricing - DRAM & NAND Pricing Trends
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} memory chip pricing trends and DRAM/NAND market dynamics.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
              Memory Market
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
                <div className="text-sm text-muted-foreground">DRAM Pricing</div>
                <Cpu className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Cyclical
              </div>
              <div className="text-sm text-muted-foreground">
                Market Dynamics
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">NAND Pricing</div>
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Tracking
              </div>
              <div className="text-sm text-muted-foreground">
                Storage Market
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

        {/* Memory Pricing Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Memory Pricing Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Memory pricing for {companyName} follows cyclical patterns based on supply-demand dynamics in DRAM and NAND markets.
                Pricing directly impacts revenue and profitability for memory semiconductor companies.
              </p>
              <p className="text-lg leading-relaxed">
                Memory pricing is a critical driver of stock performance. The cyclical nature of DRAM and NAND pricing creates
                volatility in revenue, margins, and earnings for memory semiconductor companies, making pricing trends essential to monitor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Dynamics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Memory Market Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Price Cycle Drivers</h3>
              <ul>
                <li><strong>Supply Discipline:</strong> Industry capacity additions and production cuts affect pricing</li>
                <li><strong>End-Market Demand:</strong> PC, smartphone, and data center demand drives memory consumption</li>
                <li><strong>Inventory Levels:</strong> Channel inventory affects short-term pricing dynamics</li>
                <li><strong>Technology Transitions:</strong> Node migrations and architecture changes impact cost structures</li>
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
                href={`/asp-trend/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">ASP Trends</div>
                <div className="text-sm text-muted-foreground">
                  Average selling prices
                </div>
              </Link>
              <Link
                href={`/margins/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Profit Margins</div>
                <div className="text-sm text-muted-foreground">
                  Profitability analysis
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
