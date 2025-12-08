"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import DCFCalculator from "@/components/DCFCalculator"
import PeerComparison from "@/components/PeerComparison"
import StockScreener from "@/components/StockScreener"
import EarningsCalendar from "@/components/EarningsCalendar"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface StockData {
  snapshot: {
    ticker: string
    price: number
    day_change: number
    day_change_percent: number
    volume: number
    market_cap: number
  }
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
  incomeStatements: any[]
  balanceSheets: any[]
  cashFlows: any[]
  insiderTrades: any[]
  analystEstimates: any[]
}

export default function Home() {
  const [ticker, setTicker] = useState("AAPL")
  const [inputTicker, setInputTicker] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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

  // Calculate insider sentiment
  const insiderBuys = stockData?.insiderTrades.filter(t => t.transaction_shares > 0).length || 0
  const insiderSells = stockData?.insiderTrades.filter(t => t.transaction_shares < 0).length || 0

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                QuantPlatform
              </h1>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">PRO</span>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
                placeholder="Enter ticker..."
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Analyze
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stock Header */}
        {stockData?.snapshot && (
          <div className="mb-6 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold">{stockData.snapshot.ticker}</h2>
                <p className="text-zinc-400">Real-time data from Financial Datasets API</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">${stockData.snapshot.price?.toFixed(2)}</p>
                <p className={`text-lg ${(stockData.snapshot.day_change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(stockData.snapshot.day_change_percent || 0) >= 0 ? '+' : ''}{(stockData.snapshot.day_change_percent || 0).toFixed(2)}%
                </p>
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
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dcf">DCF Valuation</TabsTrigger>
            <TabsTrigger value="peers">Peer Comparison</TabsTrigger>
            <TabsTrigger value="screener">Screener</TabsTrigger>
            <TabsTrigger value="earnings">Earnings Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {loading ? (
              <LoadingState />
            ) : stockData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Health */}
                <Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🕵️</span> Insider Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-400">{insiderBuys}</p>
                        <p className="text-zinc-400 text-sm">Buys</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-400">{insiderSells}</p>
                        <p className="text-zinc-400 text-sm">Sells</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${insiderBuys > insiderSells ? 'text-emerald-400' : 'text-red-400'}`}>
                          {insiderBuys > insiderSells ? 'BULLISH' : 'BEARISH'}
                        </p>
                        <p className="text-zinc-400 text-sm">Signal</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stockData.insiderTrades.slice(0, 10).map((trade, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded text-sm">
                          <div>
                            <p className="font-medium">{trade.name}</p>
                            <p className="text-zinc-500 text-xs">{trade.title}</p>
                          </div>
                          <div className="text-right">
                            <p className={trade.transaction_shares > 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {trade.transaction_shares > 0 ? '+' : ''}{trade.transaction_shares?.toLocaleString()} shares
                            </p>
                            <p className="text-zinc-500 text-xs">{trade.transaction_date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📈</span> Revenue & Profit History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stockData.incomeStatements.slice().reverse()}>
                          <XAxis dataKey="fiscal_period" stroke="#71717a" />
                          <YAxis stroke="#71717a" tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📊</span> Analyst Estimates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockData.analystEstimates.length > 0 ? (
                      <div className="space-y-4">
                        {stockData.analystEstimates.slice(0, 4).map((est, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded">
                            <div>
                              <p className="font-medium">{est.period}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400">EPS: ${est.eps_estimate_avg?.toFixed(2) || 'N/A'}</p>
                              <p className="text-zinc-400 text-sm">
                                Range: ${est.eps_estimate_low?.toFixed(2)} - ${est.eps_estimate_high?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500">No analyst estimates available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-zinc-500">Enter a ticker to analyze</p>
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
        </Tabs>
      </div>
    </main>
  )
}

function QuickStat({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
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
        <span className={isGood ? 'text-emerald-400' : 'text-zinc-400'}>{formatPercent(value)}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isGood ? 'bg-emerald-500' : 'bg-zinc-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
    </div>
  )
}
