"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { Cpu, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProcessNodeContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function ProcessNodeContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: ProcessNodeContentProps) {
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
            <span>Process Node</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Process Node - Semiconductor Technology Node
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} process node technology and chip manufacturing capabilities.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Advanced Tech
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
                <div className="text-sm text-muted-foreground">Technology Leadership</div>
                <Cpu className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Advanced
              </div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Leading Edge
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Node Transition</div>
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Ongoing
              </div>
              <div className="text-sm text-muted-foreground">
                Next-gen Migration
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

        {/* Process Node Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Process Node Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                {companyName} utilizes various semiconductor process nodes depending on product requirements.
                Advanced nodes (7nm, 5nm, 3nm, and beyond) are used for cutting-edge chips requiring maximum performance and power efficiency.
              </p>
              <p className="text-lg leading-relaxed">
                Process node technology is critical for competitiveness in the semiconductor industry.
                Advanced nodes enable better performance, power efficiency, and transistor density, while timely node transitions
                can capture market share in premium segments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technology Roadmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Technology Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Process Node Evolution</h3>
              <ul>
                <li><strong>Leading Edge (3nm, 5nm):</strong> Premium products with maximum performance and efficiency</li>
                <li><strong>Advanced (7nm, 10nm):</strong> High-performance computing and mobile applications</li>
                <li><strong>Mature (14nm+):</strong> Cost-effective solutions for mainstream applications</li>
                <li><strong>Legacy (28nm+):</strong> Automotive, industrial, and IoT applications</li>
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
                  Production capacity
                </div>
              </Link>
              <Link
                href={`/design-wins/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Design Wins</div>
                <div className="text-sm text-muted-foreground">
                  Customer acquisitions
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
