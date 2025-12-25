"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, Cpu, Factory } from 'lucide-react'
import Link from 'next/link'

interface WaferStartsContentProps {
  ticker: string
  companyName: string
  sector: string
  fundamentals: any
  metrics: any[]
}

export default function WaferStartsContent({
  ticker,
  companyName,
  sector,
  fundamentals,
  metrics,
}: WaferStartsContentProps) {
  const currentYear = new Date().getFullYear()
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
            <span>Wafer Starts</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {ticker} Wafer Starts - Semiconductor Production Capacity
          </h1>

          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive analysis of {companyName} wafer starts and semiconductor manufacturing capacity trends.
          </p>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              {ticker}
            </Badge>
            <Badge variant="secondary">
              {sector}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Semiconductor
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
                <div className="text-sm text-muted-foreground">Production Capacity</div>
                <Factory className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                High Volume
              </div>
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Manufacturing Scale
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Wafer Output</div>
                <Cpu className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                Ongoing
              </div>
              <div className="text-sm text-muted-foreground">
                Active Production
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

        {/* Wafer Starts Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Wafer Starts Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                Wafer starts represent the number of silicon wafers {companyName} begins processing in its fabrication facilities.
                This metric is a critical indicator of semiconductor production capacity and manufacturing activity.
              </p>
              <p className="text-lg leading-relaxed">
                Higher wafer start numbers typically indicate increased production capacity, stronger demand, and potential revenue growth.
                Companies with expanding wafer starts are often investing in capacity expansion to meet market demand.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Production Capacity Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Production Capacity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Key Factors Affecting Wafer Starts</h3>
              <ul>
                <li><strong>Fab Capacity:</strong> Total available manufacturing capacity across all fabrication facilities</li>
                <li><strong>Demand Trends:</strong> Customer orders and market demand for semiconductor products</li>
                <li><strong>Technology Migration:</strong> Transitions to advanced process nodes affecting production efficiency</li>
                <li><strong>Capacity Utilization:</strong> Percentage of total fab capacity being actively utilized</li>
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
                  Capacity utilization rates
                </div>
              </Link>
              <Link
                href={`/process-node/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Process Node</div>
                <div className="text-sm text-muted-foreground">
                  Technology node analysis
                </div>
              </Link>
              <Link
                href={`/revenue/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold mb-1">Revenue Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Revenue trends and growth
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
