"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  Share2,
  Bell,
  Plus
} from "lucide-react"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import StockLogo from "@/components/StockLogo"
import ShortVolume from "@/components/ShortVolume"
import NewsSentiment from "@/components/NewsSentiment"
import FinancialStatements from "@/components/FinancialStatements"
import TechnicalAnalysis from "@/components/TechnicalAnalysis"
import AIInvestmentSummary from "@/components/AIInvestmentSummary"
import DCFCalculator from "@/components/DCFCalculator"
import PeerComparison from "@/components/PeerComparison"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface StockData {
  snapshot: {
    ticker: string
    price: number
    day_change: number
    day_change_percent: number
    volume: number
    market_cap: number
    previousClose?: number
    open?: number
    dayHigh?: number
    dayLow?: number
    yearHigh?: number
    yearLow?: number
  }
  companyFacts: any
  metrics: {
    price_to_earnings_ratio: number
    return_on_invested_capital: number
    revenue_growth: number
    gross_margin: number
    operating_margin: number
    net_margin: number
    debt_to_equity: number
    free_cash_flow_yield: number
    book_value_per_share: number
    earnings_per_share: number
    free_cash_flow_per_share: number
  }
  history?: { date: string; close: number; volume: number }[]
  metricsHistory?: any[]
  incomeStatements: any[]
  balanceSheets: any[]
  cashFlows: any[]
  quarterlyIncome: any[]
  quarterlyBalance?: any[]
  quarterlyCashFlow?: any[]
  insiderTrades: any[]
  analystEstimates: any[]
  productSegments?: { name: string; revenue: number }[]
  geoSegments?: { name: string; revenue: number }[]
  segments: { name: string; revenue: number }[]
}

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = (params.ticker as string)?.toUpperCase()

  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [chartPeriod, setChartPeriod] = useState("3M")

  useEffect(() => {
    const fetchData = async () => {
      if (!ticker) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/stock?ticker=${ticker}`)
        if (!response.ok) throw new Error("Failed to fetch stock data")

        const data = await response.json()
        setStockData(data)
      } catch (err) {
        console.error("Error fetching stock:", err)
        setError("Unable to load stock data")
      }

      setLoading(false)
    }

    fetchData()
  }, [ticker])

  const formatMarketCap = (value: number) => {
    if (!value) return "-"
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const formatVolume = (value: number) => {
    if (!value) return "-"
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-secondary animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-8 w-32 bg-secondary animate-pulse rounded" />
              <div className="h-4 w-48 bg-secondary animate-pulse rounded" />
            </div>
          </div>
          <div className="h-64 bg-secondary animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-destructive">{error || "Stock not found"}</p>
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { snapshot, companyFacts, metrics, history } = stockData
  const isPositive = snapshot.day_change >= 0
  const chartData = history?.slice(-90).map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: d.close
  })) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <StockLogo symbol={ticker} size="xl" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{ticker}</h1>
                  <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                    isPositive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  }`}>
                    {isPositive ? "+" : ""}{snapshot.day_change_percent?.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {companyFacts?.General?.Name || ticker}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Watch
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Alert
              </Button>
              <Button className="bg-green-600 hover:bg-green-500 text-white" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add to Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Price & Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Price Card */}
          <Card className="bg-card border-border">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
                  <div className={`flex items-center gap-2 mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">
                      {isPositive ? "+" : ""}${snapshot.day_change?.toFixed(2)} ({isPositive ? "+" : ""}{snapshot.day_change_percent?.toFixed(2)}%)
                    </span>
                    <span className="text-muted-foreground text-sm">today</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Open</p>
                    <p className="font-medium">${snapshot.open?.toFixed(2) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prev Close</p>
                    <p className="font-medium">${snapshot.previousClose?.toFixed(2) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Day High</p>
                    <p className="font-medium">${snapshot.dayHigh?.toFixed(2) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Day Low</p>
                    <p className="font-medium">${snapshot.dayLow?.toFixed(2) || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardContent className="py-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Stats */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="font-semibold">{formatMarketCap(snapshot.market_cap)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
                <p className="font-semibold">{metrics?.price_to_earnings_ratio?.toFixed(1) || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EPS</p>
                <p className="font-semibold">${metrics?.earnings_per_share?.toFixed(2) || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-semibold">{formatVolume(snapshot.volume)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W High</p>
                <p className="font-semibold">${snapshot.yearHigh?.toFixed(2) || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W Low</p>
                <p className="font-semibold">${snapshot.yearLow?.toFixed(2) || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="short">Short Volume</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            <TabsTrigger value="dcf">Valuation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewsSentiment ticker={ticker} />
              <PeerComparison selectedTicker={ticker} />
            </div>
          </TabsContent>

          <TabsContent value="financials">
            <FinancialStatements
              ticker={ticker}
              companyFacts={stockData.companyFacts}
              incomeStatements={stockData.incomeStatements}
              balanceSheets={stockData.balanceSheets}
              cashFlows={stockData.cashFlows}
              quarterlyIncome={stockData.quarterlyIncome}
              quarterlyBalance={stockData.quarterlyBalance || []}
              quarterlyCashFlow={stockData.quarterlyCashFlow || []}
              metricsHistory={stockData.metricsHistory || []}
              productSegments={stockData.productSegments || []}
              geoSegments={stockData.geoSegments || []}
            />
          </TabsContent>

          <TabsContent value="short">
            <ShortVolume ticker={ticker} />
          </TabsContent>

          <TabsContent value="technical">
            <TechnicalAnalysis ticker={ticker} currentPrice={snapshot.price} />
          </TabsContent>

          <TabsContent value="ai">
            <AIInvestmentSummary
              ticker={ticker}
              stockData={{
                ...stockData,
                segments: stockData.segments || []
              }}
            />
          </TabsContent>

          <TabsContent value="dcf">
            <DCFCalculator
              ticker={ticker}
              currentPrice={snapshot.price}
              freeCashFlow={metrics?.free_cash_flow_per_share * (companyFacts?.SharesStats?.SharesOutstanding || 1000000000) || 0}
              revenueGrowth={metrics?.revenue_growth || 0}
              shares={companyFacts?.SharesStats?.SharesOutstanding || 1000000000}
              marketCap={snapshot.market_cap}
              debtToEquity={metrics?.debt_to_equity}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
