"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DCFCalculator from "@/components/DCFCalculator"
import PeerComparison from "@/components/PeerComparison"
import StockScreener from "@/components/StockScreener"
import EarningsCalendar from "@/components/EarningsCalendar"
import IPValuation from "@/components/IPValuation"
import QuantAnalysis from "@/components/QuantAnalysis"
import FinancialSnowflake from "@/components/FinancialSnowflake"
import NewsSentiment from "@/components/NewsSentiment"
import AIInvestmentSummary from "@/components/AIInvestmentSummary"
import FinancialStatements from "@/components/FinancialStatements"
import OptionsFlow from "@/components/OptionsFlow"
import TreasuryYields from "@/components/TreasuryYields"
import TechnicalAnalysis from "@/components/TechnicalAnalysis"
import PortfolioAnalyzer from "@/components/PortfolioAnalyzer"
import UserPortfolios from "@/components/UserPortfolios"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface StockData {
  snapshot: {
    ticker: string
    price: number
    day_change: number
    day_change_percent: number
    volume: number
    market_cap: number
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
  metricsHistory: any[]
  incomeStatements: any[]
  balanceSheets: any[]
  cashFlows: any[]
  quarterlyIncome: any[]
  quarterlyBalance: any[]
  quarterlyCashFlow: any[]
  insiderTrades: any[]
  analystEstimates: any[]
  segments: { name: string; revenue: number }[]
  productSegments: { name: string; revenue: number }[]
  geoSegments: { name: string; revenue: number }[]
}

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL")
  const [inputTicker, setInputTicker] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("myportfolios")

  const fetchStockData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stock?ticker=${ticker}`)
      const data = await response.json()
      setStockData(data)
    } catch (error) {
      console.error("Error fetching stock data:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStockData()
  }, [ticker])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setTicker(inputTicker.toUpperCase())
  }

  const insiderBuys = stockData?.insiderTrades?.filter(t => t.transaction_shares > 0)?.length || 0
  const insiderSells = stockData?.insiderTrades?.filter(t => t.transaction_shares < 0)?.length || 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-lg">L</span>
                </div>
                <span className="font-semibold text-lg">Lician</span>
              </Link>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Dashboard</span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={inputTicker}
                    onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
                    placeholder="Search ticker..."
                    className="pl-9 w-40 bg-secondary border-border"
                  />
                </div>
                <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                  Analyze
                </Button>
              </form>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stock Header */}
        {stockData?.snapshot && (
          <div className="mb-6 p-6 bg-card rounded-2xl border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold">{stockData.snapshot.ticker}</h2>
                <p className="text-muted-foreground">Real-time data powered by Financial Datasets API</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">${stockData.snapshot.price?.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-1 text-lg ${(stockData.snapshot.day_change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stockData.snapshot.day_change_percent || 0) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {(stockData.snapshot.day_change_percent || 0) >= 0 ? '+' : ''}{(stockData.snapshot.day_change_percent || 0).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
              <QuickStat label="Market Cap" value={formatCurrency(stockData.snapshot.market_cap || 0)} />
              <QuickStat label="P/E Ratio" value={stockData.metrics?.price_to_earnings_ratio?.toFixed(1) || 'N/A'} />
              <QuickStat label="ROIC" value={formatPercent(stockData.metrics?.return_on_invested_capital || 0)} highlight />
              <QuickStat label="Revenue Growth" value={formatPercent(stockData.metrics?.revenue_growth || 0)} />
              <QuickStat label="Gross Margin" value={formatPercent(stockData.metrics?.gross_margin || 0)} />
              <QuickStat label="FCF Yield" value={formatPercent(stockData.metrics?.free_cash_flow_yield || 0)} />
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap gap-1 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="myportfolios" className="data-[state=active]:bg-background text-green-500">My Portfolios</TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-background">Earnings</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
            <TabsTrigger value="quant" className="data-[state=active]:bg-background">Quant</TabsTrigger>
            <TabsTrigger value="snowflake" className="data-[state=active]:bg-background">Snowflake</TabsTrigger>
            <TabsTrigger value="ip" className="data-[state=active]:bg-background">IP Valuation</TabsTrigger>
            <TabsTrigger value="dcf" className="data-[state=active]:bg-background">DCF</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-background">AI Analysis</TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-background">Technical</TabsTrigger>
            <TabsTrigger value="options" className="data-[state=active]:bg-background">Options</TabsTrigger>
            <TabsTrigger value="treasury" className="data-[state=active]:bg-background">Yields</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-background">News</TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-background">Financials</TabsTrigger>
            <TabsTrigger value="peers" className="data-[state=active]:bg-background">Peers</TabsTrigger>
            <TabsTrigger value="screener" className="data-[state=active]:bg-background">Screener</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-background">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {loading ? (
              <LoadingState />
            ) : stockData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Health */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>💪</span> Financial Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <MetricBar label="ROIC" value={stockData.metrics?.return_on_invested_capital || 0} max={0.5} threshold={0.15} />
                      <MetricBar label="Gross Margin" value={stockData.metrics?.gross_margin || 0} max={1} threshold={0.4} />
                      <MetricBar label="Operating Margin" value={stockData.metrics?.operating_margin || 0} max={0.5} threshold={0.15} />
                      <MetricBar label="Net Margin" value={stockData.metrics?.net_margin || 0} max={0.4} threshold={0.1} />
                      <MetricBar label="FCF Yield" value={stockData.metrics?.free_cash_flow_yield || 0} max={0.1} threshold={0.04} />
                    </div>
                  </CardContent>
                </Card>

                {/* Insider Activity */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🕵️</span> Insider Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{insiderBuys}</p>
                        <p className="text-muted-foreground text-sm">Buys</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{insiderSells}</p>
                        <p className="text-muted-foreground text-sm">Sells</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${insiderBuys > insiderSells ? 'text-green-500' : 'text-red-500'}`}>
                          {insiderBuys > insiderSells ? 'BULLISH' : 'BEARISH'}
                        </p>
                        <p className="text-muted-foreground text-sm">Signal</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stockData.insiderTrades?.slice(0, 10).map((trade, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg text-sm">
                          <div>
                            <p className="font-medium">{trade.name}</p>
                            <p className="text-muted-foreground text-xs">{trade.title}</p>
                          </div>
                          <div className="text-right">
                            <p className={trade.transaction_shares > 0 ? 'text-green-500' : 'text-red-500'}>
                              {trade.transaction_shares > 0 ? '+' : ''}{trade.transaction_shares?.toLocaleString()} shares
                            </p>
                            <p className="text-muted-foreground text-xs">{trade.transaction_date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue History */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📈</span> Revenue & Profit History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stockData.incomeStatements?.slice().reverse()}>
                          <XAxis dataKey="fiscal_period" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Revenue" />
                          <Area type="monotone" dataKey="net_income" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Net Income" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Analyst Estimates */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📊</span> Analyst Estimates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockData.analystEstimates?.length > 0 ? (
                      <div className="space-y-4">
                        {stockData.analystEstimates.slice(0, 4).map((est, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                            <div>
                              <p className="font-medium">{est.period}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-500">EPS: ${est.eps_estimate_avg?.toFixed(2) || 'N/A'}</p>
                              <p className="text-muted-foreground text-sm">
                                Range: ${est.eps_estimate_low?.toFixed(2)} - ${est.eps_estimate_high?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No analyst estimates available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground">Enter a ticker to analyze</p>
            )}
          </TabsContent>

          <TabsContent value="quant">
            {stockData && (
              <QuantAnalysis
                ticker={ticker}
                metrics={stockData.metrics}
                currentPrice={stockData.snapshot?.price || 0}
              />
            )}
          </TabsContent>

          <TabsContent value="snowflake">
            {stockData && (
              <FinancialSnowflake
                ticker={ticker}
                metrics={stockData.metrics}
              />
            )}
          </TabsContent>

          <TabsContent value="ip">
            {stockData && (
              <IPValuation
                ticker={ticker}
                marketCap={stockData.snapshot?.market_cap || 0}
                revenue={stockData.incomeStatements?.[0]?.revenue || 0}
                segments={stockData.segments || []}
              />
            )}
          </TabsContent>

          <TabsContent value="dcf">
            {stockData && (
              <DCFCalculator
                ticker={ticker}
                currentPrice={stockData.snapshot?.price || 0}
                freeCashFlow={stockData.cashFlows?.[0]?.free_cash_flow || stockData.cashFlows?.[0]?.operating_cash_flow || 1e9}
                revenueGrowth={stockData.metrics?.revenue_growth || 0.05}
                shares={stockData.snapshot?.market_cap / stockData.snapshot?.price || 1e9}
                beta={1.0}
                debtToEquity={stockData.metrics?.debt_to_equity || 0.5}
                marketCap={stockData.snapshot?.market_cap || 0}
                totalDebt={stockData.balanceSheets?.[0]?.total_debt || 0}
                cashAndEquivalents={stockData.balanceSheets?.[0]?.cash_and_equivalents || 0}
                eps={stockData.metrics?.earnings_per_share || 0}
                bookValue={stockData.metrics?.book_value_per_share || 0}
                dividendYield={0}
              />
            )}
          </TabsContent>

          <TabsContent value="ai">
            {stockData && (
              <AIInvestmentSummary
                ticker={ticker}
                stockData={stockData}
              />
            )}
          </TabsContent>

          <TabsContent value="technical">
            {stockData && (
              <TechnicalAnalysis
                ticker={ticker}
                currentPrice={stockData.snapshot?.price || 0}
              />
            )}
          </TabsContent>

          <TabsContent value="options">
            <OptionsFlow ticker={ticker} />
          </TabsContent>

          <TabsContent value="treasury">
            <TreasuryYields />
          </TabsContent>

          <TabsContent value="news">
            <NewsSentiment ticker={ticker} />
          </TabsContent>

          <TabsContent value="financials">
            {stockData && (
              <FinancialStatements
                ticker={ticker}
                companyFacts={stockData.companyFacts}
                incomeStatements={stockData.incomeStatements || []}
                balanceSheets={stockData.balanceSheets || []}
                cashFlows={stockData.cashFlows || []}
                quarterlyIncome={stockData.quarterlyIncome || []}
                quarterlyBalance={stockData.quarterlyBalance || []}
                quarterlyCashFlow={stockData.quarterlyCashFlow || []}
                metricsHistory={stockData.metricsHistory || []}
                productSegments={stockData.productSegments || []}
                geoSegments={stockData.geoSegments || []}
              />
            )}
          </TabsContent>

          <TabsContent value="peers">
            <PeerComparison selectedTicker={ticker} />
          </TabsContent>

          <TabsContent value="screener">
            <StockScreener />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsCalendar />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioAnalyzer />
          </TabsContent>

          <TabsContent value="myportfolios">
            <UserPortfolios />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function QuickStat({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="text-center p-3 bg-secondary/30 rounded-lg">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-green-500' : ''}`}>{value}</p>
    </div>
  )
}

function MetricBar({ label, value, max, threshold }: { label: string, value: number, max: number, threshold: number }) {
  const percentage = Math.min((value / max) * 100, 100)
  const isGood = value >= threshold

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isGood ? 'text-green-500' : 'text-muted-foreground'}>{formatPercent(value)}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isGood ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-foreground"></div>
    </div>
  )
}
