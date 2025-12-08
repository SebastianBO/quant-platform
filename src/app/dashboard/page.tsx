"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import StockSearch from "@/components/StockSearch"
import StockLogo from "@/components/StockLogo"
import StockSidebar from "@/components/StockSidebar"
import TrendingTickers from "@/components/TrendingTickers"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Star, Share2, ChevronDown, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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

  const handleSearch = (symbol: string) => {
    setTicker(symbol.toUpperCase())
    // If we're on portfolios tab, switch to overview to show the stock
    if (activeTab === "myportfolios") {
      setActiveTab("overview")
    }
  }

  const insiderBuys = stockData?.insiderTrades?.filter(t => t.transaction_shares > 0)?.length || 0
  const insiderSells = stockData?.insiderTrades?.filter(t => t.transaction_shares < 0)?.length || 0

  // Check if we're viewing a stock (not on portfolios or earnings tabs)
  const isViewingStock = activeTab !== "myportfolios" && activeTab !== "earnings" && activeTab !== "screener"

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Lician</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded hidden sm:inline">Dashboard</span>
            </Link>

            {/* My Portfolios & Earnings buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('myportfolios')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'myportfolios'
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                My Portfolios
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Earnings
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <StockSearch onSelect={handleSearch} />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Trending Tickers Bar */}
      <TrendingTickers onSelectTicker={handleSearch} />

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Stock Header - Yahoo Finance Style */}
        {stockData?.snapshot && isViewingStock && (
          <div className="mb-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>NasdaqGS</span>
              <span>-</span>
              <span>Nasdaq Real Time Price</span>
              <span>•</span>
              <span>USD</span>
            </div>

            <div className="flex items-start gap-6">
              {/* Logo & Name */}
              <StockLogo symbol={ticker} size="xl" />

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-2xl font-bold">
                    {stockData.companyFacts?.name || ticker}
                  </h1>
                  <span className="text-xl text-muted-foreground">({ticker})</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Star className="w-4 h-4" />
                    Follow
                  </Button>
                </div>

                {/* Price Row */}
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold tabular-nums">
                    {stockData.snapshot.price?.toFixed(2)}
                  </span>
                  <div className={`flex items-center gap-2 text-lg ${
                    (stockData.snapshot.day_change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(stockData.snapshot.day_change_percent || 0) >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span>
                      {(stockData.snapshot.day_change || 0) >= 0 ? '+' : ''}
                      {(stockData.snapshot.day_change || 0).toFixed(2)}
                    </span>
                    <span>
                      ({(stockData.snapshot.day_change_percent || 0) >= 0 ? '+' : ''}
                      {(stockData.snapshot.day_change_percent || 0).toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Market Status */}
                <p className="text-sm text-muted-foreground mt-1">
                  At close: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} EST
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Key Statistics Grid - Yahoo Finance Style */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mt-6 p-4 bg-secondary/30 rounded-xl">
              <KeyStat label="Previous Close" value={stockData.snapshot.previousClose?.toFixed(2) || stockData.snapshot.price?.toFixed(2)} />
              <KeyStat label="Day's Range" value={`${stockData.snapshot.dayLow?.toFixed(2) || '-'} - ${stockData.snapshot.dayHigh?.toFixed(2) || '-'}`} />
              <KeyStat label="Market Cap" value={formatMarketCap(stockData.snapshot.market_cap)} />
              <KeyStat label="Earnings Date" value="N/A" />
              <KeyStat label="Open" value={stockData.snapshot.open?.toFixed(2) || '-'} />
              <KeyStat label="52 Week Range" value={`${stockData.snapshot.yearLow?.toFixed(2) || '-'} - ${stockData.snapshot.yearHigh?.toFixed(2) || '-'}`} />
              <KeyStat label="Beta (5Y Monthly)" value={stockData.metrics?.debt_to_equity?.toFixed(2) || '-'} />
              <KeyStat label="Forward Dividend & Yield" value="--" />
              <KeyStat label="Bid" value="-" />
              <KeyStat label="Volume" value={stockData.snapshot.volume?.toLocaleString() || '-'} />
              <KeyStat label="PE Ratio (TTM)" value={stockData.metrics?.price_to_earnings_ratio?.toFixed(2) || '-'} />
              <KeyStat label="Ex-Dividend Date" value="--" />
              <KeyStat label="Ask" value="-" />
              <KeyStat label="Avg. Volume" value="-" />
              <KeyStat label="EPS (TTM)" value={stockData.metrics?.earnings_per_share?.toFixed(2) || '-'} />
              <KeyStat label="1y Target Est" value="-" />
            </div>
          </div>
        )}

        {/* Main Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar - Only show when viewing a stock */}
          {isViewingStock && (
            <StockSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>

              <TabsContent value="overview">
                {loading ? (
                  <LoadingState />
                ) : stockData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Health */}
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span>Financial Health</span>
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
                          <span>Insider Activity</span>
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
                          <span>Revenue & Profit History</span>
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
                          <span>Analyst Estimates</span>
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
        </div>
      </div>
    </main>
  )
}

function KeyStat({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="text-sm">
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-medium tabular-nums">{value || '-'}</p>
    </div>
  )
}

function formatMarketCap(value: number): string {
  if (!value) return '-'
  if (value >= 1e12) return `${(value / 1e12).toFixed(3)}T`
  if (value >= 1e9) return `${(value / 1e9).toFixed(3)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  return value.toLocaleString()
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}
