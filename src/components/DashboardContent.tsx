"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import MarketNewsFeed from "@/components/MarketNewsFeed"
import AIInvestmentSummary from "@/components/AIInvestmentSummary"
import FinancialStatements from "@/components/FinancialStatements"
import OptionsFlow from "@/components/OptionsFlow"
import TreasuryYields from "@/components/TreasuryYields"
import TechnicalAnalysis from "@/components/TechnicalAnalysis"
import ShortVolume from "@/components/ShortVolume"
import BorrowData from "@/components/BorrowData"
import OptionsChain from "@/components/OptionsChain"
import PortfolioAnalyzer from "@/components/PortfolioAnalyzer"
import UserPortfolios from "@/components/UserPortfolios"
import StockSearch from "@/components/StockSearch"
import StockLogo from "@/components/StockLogo"
import StockSidebar from "@/components/StockSidebar"
import TrendingTickers from "@/components/TrendingTickers"
import MarketOverview from "@/components/MarketOverview"
import InstitutionalOwnership from "@/components/InstitutionalOwnership"
import SECFilings from "@/components/SECFilings"
import AnalystRatings from "@/components/AnalystRatings"
import InsiderTrading from "@/components/InsiderTrading"
import OwnershipBreakdown from "@/components/OwnershipBreakdown"
import CompanyDebt from "@/components/CompanyDebt"
import DebtAnalysis from "@/components/DebtAnalysis"
import StockChartSwitcher from "@/components/StockChartSwitcher"
import { BiotechCatalysts } from "@/components/BiotechCatalysts"
import MarketDataTable from "@/components/MarketDataTable"
import MarketSidebar from "@/components/MarketSidebar"
import UserAvatar from "@/components/UserAvatar"
import StockDiscussions from "@/components/StockDiscussions"
import StockInternalLinks from "@/components/StockInternalLinks"
import { InvestmentCalculator } from "@/components/calculators"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Star, Share2, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface DataSources {
  incomeStatements?: string
  balanceSheets?: string
  cashFlows?: string
  segmentedRevenues?: string
  quarterlyIncome?: string
  quarterlyBalance?: string
  quarterlyCashFlow?: string
  metrics?: string
  insiderTrades?: string
  analystEstimates?: string
}

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
    avgVolume?: number
    beta?: number
    dividendYield?: number
    forwardDividendYield?: number
    exDividendDate?: string
    earningsDate?: string
    priceTarget?: number
    bid?: number
    ask?: number
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
  dataSources?: DataSources
}

interface DashboardContentProps {
  initialTicker?: string
  initialTab?: string
}

export default function DashboardContent({ initialTicker, initialTab }: DashboardContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [ticker, setTicker] = useState(initialTicker || "AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab || "market")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [financialSourceOverride, setFinancialSourceOverride] = useState<'auto' | 'eodhd' | 'financialdatasets'>('auto')

  // Handle URL parameters for deep linking (only when no initialTicker provided)
  useEffect(() => {
    if (!initialTicker) {
      const tickerParam = searchParams.get('ticker')
      const tabParam = searchParams.get('tab')

      if (tickerParam) {
        setTicker(tickerParam.toUpperCase())
      }
      if (tabParam) {
        setActiveTab(tabParam)
      }
    }
  }, [searchParams, initialTicker])

  // If we have an initialTicker, switch to overview tab
  useEffect(() => {
    if (initialTicker) {
      setActiveTab(initialTab || "overview")
    }
  }, [initialTicker, initialTab])

  const fetchStockData = async (sourceOverride?: string) => {
    setLoading(true)
    try {
      const source = sourceOverride || financialSourceOverride
      const sourceParam = source !== 'auto' ? `&source=${source}` : ''
      const response = await fetch(`/api/stock?ticker=${ticker}${sourceParam}`)
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

  // Handle source override change
  const handleFinancialSourceChange = (source: 'auto' | 'eodhd' | 'financialdatasets') => {
    setFinancialSourceOverride(source)
    fetchStockData(source)
  }

  const handleSearch = (symbol: string) => {
    const newTicker = symbol.toUpperCase()
    setTicker(newTicker)
    // Navigate to /stock/TICKER for clean URL
    router.push(`/stock/${newTicker}`)
  }

  const insiderBuys = stockData?.insiderTrades?.filter(t => t.transaction_shares > 0)?.length || 0
  const insiderSells = stockData?.insiderTrades?.filter(t => t.transaction_shares < 0)?.length || 0

  // Check if we're viewing a stock (not on top-level navigation tabs)
  const isViewingStock = !["myportfolios", "earnings", "screener", "market", "watchlist", "advisor"].includes(activeTab)

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-foreground rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-base sm:text-lg">L</span>
              </div>
              <span className="font-semibold text-base sm:text-lg hidden xs:inline">Lician</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded hidden lg:inline">Dashboard</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'market' || activeTab === 'overview'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'watchlist'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Watchlist
              </button>
              <button
                onClick={() => setActiveTab('myportfolios')}
                className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'myportfolios'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('advisor')}
                className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'advisor' || activeTab === 'screener' || activeTab === 'dcf'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Advisor
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Earnings
              </button>
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-2xl hidden sm:block">
              <StockSearch onSelect={handleSearch} />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto lg:ml-0">
              <ThemeToggle />
              <UserAvatar />
            </div>
          </div>

          {/* Mobile Search - Full width below header */}
          <div className="sm:hidden mt-3">
            <StockSearch onSelect={handleSearch} />
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('market')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'market' || activeTab === 'overview'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => {
                  setActiveTab('watchlist')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'watchlist'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Watchlist
              </button>
              <button
                onClick={() => {
                  setActiveTab('myportfolios')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'myportfolios'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => {
                  setActiveTab('advisor')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'advisor' || activeTab === 'screener' || activeTab === 'dcf'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Advisor
              </button>
              <button
                onClick={() => {
                  setActiveTab('earnings')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-green-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Earnings
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Trending Tickers Bar */}
      <TrendingTickers onSelectTicker={handleSearch} />

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Stock Header - Yahoo Finance Style */}
        {stockData?.snapshot && isViewingStock && (
          <div className="mb-4 sm:mb-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-wrap">
              <span>NasdaqGS</span>
              <span>-</span>
              <span className="hidden sm:inline">Nasdaq Real Time Price</span>
              <span className="sm:hidden">Real Time Price</span>
              <span>•</span>
              <span>USD</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Logo & Name */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <StockLogo symbol={ticker} size="xl" className="hidden sm:block" />
                <StockLogo symbol={ticker} size="lg" className="sm:hidden" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-4 mb-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold truncate">
                      {stockData.companyFacts?.name || ticker}
                    </h1>
                    <span className="text-lg sm:text-xl text-muted-foreground">({ticker})</span>
                    <Button variant="outline" size="sm" className="gap-2 h-8 sm:h-9">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Follow</span>
                    </Button>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
                    <span className="text-2xl sm:text-4xl font-bold tabular-nums">
                      {typeof stockData.snapshot.price === 'number' ? stockData.snapshot.price.toFixed(2) : Number(stockData.snapshot.price || 0).toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-1 sm:gap-2 text-base sm:text-lg ${
                      (stockData.snapshot.day_change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(stockData.snapshot.day_change_percent || 0) >= 0 ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span className="text-sm sm:text-lg">
                        {(stockData.snapshot.day_change || 0) >= 0 ? '+' : ''}
                        {(stockData.snapshot.day_change || 0).toFixed(2)}
                      </span>
                      <span className="text-sm sm:text-lg">
                        ({(stockData.snapshot.day_change_percent || 0) >= 0 ? '+' : ''}
                        {(stockData.snapshot.day_change_percent || 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Market Status */}
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    At close: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} EST
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-initial min-h-[44px]">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Key Statistics Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mt-4 sm:mt-6 p-3 sm:p-4 bg-secondary/30 rounded-xl overflow-x-auto">
              <KeyStat label="Previous Close" value={Number(stockData.snapshot.previousClose || stockData.snapshot.price || 0).toFixed(2)} />
              <KeyStat label="Day's Range" value={stockData.snapshot.dayLow && stockData.snapshot.dayHigh ? `${stockData.snapshot.dayLow.toFixed(2)} - ${stockData.snapshot.dayHigh.toFixed(2)}` : '-'} />
              <KeyStat label="Market Cap" value={formatMarketCap(stockData.snapshot.market_cap)} />
              <KeyStat label="Earnings Date" value={stockData.snapshot.earningsDate || '-'} />
              <KeyStat label="Open" value={stockData.snapshot.open?.toFixed(2) || '-'} />
              <KeyStat label="52 Week Range" value={stockData.snapshot.yearLow && stockData.snapshot.yearHigh ? `${stockData.snapshot.yearLow.toFixed(2)} - ${stockData.snapshot.yearHigh.toFixed(2)}` : '-'} />
              <KeyStat label="Beta (5Y)" value={stockData.snapshot.beta?.toFixed(2) || '-'} />
              <KeyStat label="Dividend Yield" value={stockData.snapshot.forwardDividendYield ? `${(stockData.snapshot.forwardDividendYield * 100).toFixed(2)}%` : '-'} />
              <KeyStat label="Bid" value={stockData.snapshot.bid?.toFixed(2) || '-'} />
              <KeyStat label="Volume" value={stockData.snapshot.volume?.toLocaleString() || '-'} />
              <KeyStat label="PE Ratio" value={stockData.metrics?.price_to_earnings_ratio?.toFixed(2) || '-'} />
              <KeyStat label="Ex-Div Date" value={stockData.snapshot.exDividendDate || '-'} />
              <KeyStat label="Ask" value={stockData.snapshot.ask?.toFixed(2) || '-'} />
              <KeyStat label="Avg. Volume" value={stockData.snapshot.avgVolume?.toLocaleString() || '-'} />
              <KeyStat label="EPS (TTM)" value={stockData.metrics?.earnings_per_share?.toFixed(2) || '-'} />
              <KeyStat label="1y Target" value={stockData.snapshot.priceTarget ? `$${stockData.snapshot.priceTarget.toFixed(2)}` : '-'} />
            </div>
          </div>
        )}

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar - Only show when viewing a stock, hidden on mobile */}
          {isViewingStock && (
            <div className="hidden lg:block">
              <StockSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>

              <TabsContent value="overview">
                {loading ? (
                  <LoadingState />
                ) : stockData ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Chart Switcher - Simple or TradingView */}
                    <StockChartSwitcher ticker={ticker} />

                    {/* Investment Calculator - Interactive engagement tool */}
                    <InvestmentCalculator
                      ticker={ticker}
                      companyName={stockData.companyFacts?.name || ticker}
                      currentPrice={stockData.snapshot?.price || 0}
                      avgAnnualReturn={stockData.metrics?.revenue_growth || 0.12}
                    />

                    {/* Clinical Trials & Catalysts for Biotech/Pharma stocks */}
                    {(stockData.companyFacts?.sector?.toLowerCase().includes('health') ||
                      stockData.companyFacts?.industry?.toLowerCase().includes('biotech') ||
                      stockData.companyFacts?.industry?.toLowerCase().includes('pharma') ||
                      stockData.companyFacts?.industry?.toLowerCase().includes('therapeutic')) && (
                      <BiotechCatalysts ticker={ticker} />
                    )}

                    {/* Community Discussion */}
                    <StockDiscussions ticker={ticker} />

                    {/* Internal Links Section */}
                    <StockInternalLinks
                      ticker={ticker}
                      companyName={stockData.companyFacts?.name}
                      sector={stockData.companyFacts?.sector}
                    />

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
                    dataSource={stockData.dataSources?.metrics}
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

              <TabsContent value="analysts">
                {stockData && (
                  <AnalystRatings
                    ticker={ticker}
                    currentPrice={stockData.snapshot?.price || 0}
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

              <TabsContent value="short">
                <ShortVolume ticker={ticker} />
              </TabsContent>

              <TabsContent value="borrow">
                <BorrowData ticker={ticker} />
              </TabsContent>

              <TabsContent value="options" className="space-y-4 sm:space-y-6">
                <OptionsChain ticker={ticker} />
                <OptionsFlow ticker={ticker} />
              </TabsContent>

              <TabsContent value="treasury">
                <TreasuryYields />
              </TabsContent>

              <TabsContent value="bonds">
                <CompanyDebt ticker={ticker} />
              </TabsContent>

              <TabsContent value="debt">
                <DebtAnalysis ticker={ticker} />
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
                    dataSources={stockData.dataSources}
                    sourceOverride={financialSourceOverride}
                    onSourceChange={handleFinancialSourceChange}
                  />
                )}
              </TabsContent>

              <TabsContent value="peers">
                <PeerComparison
                  ticker={ticker}
                  companyName={stockData?.companyFacts?.name || ticker}
                  sector={stockData?.companyFacts?.sector}
                  industry={stockData?.companyFacts?.industry}
                  marketCap={stockData?.snapshot?.market_cap}
                  pe={stockData?.metrics?.price_to_earnings_ratio}
                />
              </TabsContent>

              <TabsContent value="insiders">
                <InsiderTrading ticker={ticker} />
              </TabsContent>

              <TabsContent value="institutional">
                <InstitutionalOwnership ticker={ticker} />
              </TabsContent>

              <TabsContent value="ownership">
                <OwnershipBreakdown ticker={ticker} />
              </TabsContent>

              <TabsContent value="sec">
                <SECFilings ticker={ticker} />
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

              {/* Market Tab - Market Overview */}
              <TabsContent value="market">
                <div className="space-y-4 sm:space-y-6">
                  {/* Market Overview with Futures, VIX, Gold */}
                  <MarketOverview />

                  {/* Market News Feed - Yahoo Finance Style */}
                  <MarketNewsFeed limit={20} />

                  {/* Full Market Data Table */}
                  <MarketDataTable />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Treasury Yields */}
                    <TreasuryYields />
                  </div>
                </div>
              </TabsContent>

              {/* Watchlist Tab */}
              <TabsContent value="watchlist">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span>Your Watchlist</span>
                      <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white w-full sm:w-auto min-h-[44px]">
                        + Add Stock
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      Your watchlist is empty. Search for stocks and click "Follow" to add them here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advisor Tab - Research Tools */}
              <TabsContent value="advisor">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Button
                      onClick={() => setActiveTab('screener')}
                      variant="outline"
                      className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 min-h-[80px] text-base"
                    >
                      <span className="text-xl sm:text-2xl">🔍</span>
                      <span className="text-sm sm:text-base">Stock Screener</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('dcf')}
                      variant="outline"
                      className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 min-h-[80px] text-base"
                    >
                      <span className="text-xl sm:text-2xl">📊</span>
                      <span className="text-sm sm:text-base">DCF Calculator</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('portfolio')}
                      variant="outline"
                      className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 min-h-[80px] text-base sm:col-span-2 lg:col-span-1"
                    >
                      <span className="text-xl sm:text-2xl">📈</span>
                      <span className="text-sm sm:text-base">Portfolio Analyzer</span>
                    </Button>
                  </div>

                  {/* Quick Research Tips */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Research Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
                          <p className="font-medium mb-2 text-sm sm:text-base">Stock Screener</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Filter stocks by market cap, P/E ratio, revenue growth, and more.
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
                          <p className="font-medium mb-2 text-sm sm:text-base">DCF Calculator</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Calculate intrinsic value using discounted cash flow analysis.
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
                          <p className="font-medium mb-2 text-sm sm:text-base">Portfolio Analyzer</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Upload a screenshot of your portfolio for AI analysis.
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
                          <p className="font-medium mb-2 text-sm sm:text-base">AI Summary</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Search for any stock and click "AI" tab for instant analysis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Market Data - Hidden on mobile and tablet */}
          <div className="hidden xl:block">
            <MarketSidebar
              onSelectTicker={handleSearch}
              currentTicker={ticker}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function KeyStat({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="text-xs sm:text-sm">
      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 truncate">{label}</p>
      <p className="font-medium tabular-nums text-xs sm:text-sm">{value || '-'}</p>
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
