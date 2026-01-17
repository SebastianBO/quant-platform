"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell, LineChart, Line, Area, AreaChart } from "recharts"
import { UserCheck, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface InsiderTradingProps {
  ticker: string
}

interface InsiderTrade {
  name: string
  title: string
  transaction_shares: number
  transaction_date: string
  transaction_price_per_share?: number
  shares_owned_after_transaction?: number
  transaction_type?: string
}

interface MonthlyData {
  month: string
  buys: number
  sells: number
  buyCount: number
  sellCount: number
}

interface InsiderActivity {
  name: string
  title: string
  buys: number
  sells: number
  totalShares: number
}

function InsiderTradingComponent({ ticker }: InsiderTradingProps) {
  const [trades, setTrades] = useState<InsiderTrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stock?ticker=${ticker}`)
      const result = await response.json()
      setTrades(result.insiderTrades || [])
    } catch (error) {
      console.error('Error fetching insider data:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
        </CardContent>
      </Card>
    )
  }

  // Calculate statistics - memoized for performance
  const { buys, sells, totalBuyShares, totalSellShares, totalBuyValue, totalSellValue } = useMemo(() => {
    const buysFiltered = trades.filter(t => t.transaction_shares > 0)
    const sellsFiltered = trades.filter(t => t.transaction_shares < 0)
    return {
      buys: buysFiltered,
      sells: sellsFiltered,
      totalBuyShares: buysFiltered.reduce((sum, t) => sum + t.transaction_shares, 0),
      totalSellShares: Math.abs(sellsFiltered.reduce((sum, t) => sum + t.transaction_shares, 0)),
      totalBuyValue: buysFiltered.reduce((sum, t) => sum + (t.transaction_shares * (t.transaction_price_per_share || 0)), 0),
      totalSellValue: Math.abs(sellsFiltered.reduce((sum, t) => sum + (t.transaction_shares * (t.transaction_price_per_share || 0)), 0)),
    }
  }, [trades])

  // Net sentiment - memoized
  const { netShares, sentiment, sentimentColor, uniqueInsiders } = useMemo(() => {
    const net = totalBuyShares - totalSellShares
    const sent = buys.length > sells.length ? 'BULLISH' : buys.length < sells.length ? 'BEARISH' : 'NEUTRAL'
    return {
      netShares: net,
      sentiment: sent,
      sentimentColor: sent === 'BULLISH' ? 'text-[#4ebe96]' : sent === 'BEARISH' ? 'text-[#e15241]' : 'text-yellow-500',
      uniqueInsiders: new Set(trades.map(t => t.name)).size,
    }
  }, [buys.length, sells.length, totalBuyShares, totalSellShares, trades])

  // Monthly breakdown for chart - memoized
  const monthlyData = useMemo(() => {
    return trades.reduce((acc: MonthlyData[], trade) => {
      const date = new Date(trade.transaction_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = acc.find(d => d.month === monthKey)

      if (existing) {
        if (trade.transaction_shares > 0) {
          existing.buys += trade.transaction_shares
          existing.buyCount++
        } else {
          existing.sells += Math.abs(trade.transaction_shares)
          existing.sellCount++
        }
      } else {
        acc.push({
          month: monthKey,
          buys: trade.transaction_shares > 0 ? trade.transaction_shares : 0,
          sells: trade.transaction_shares < 0 ? Math.abs(trade.transaction_shares) : 0,
          buyCount: trade.transaction_shares > 0 ? 1 : 0,
          sellCount: trade.transaction_shares < 0 ? 1 : 0,
        })
      }
      return acc
    }, []).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [trades])

  // Top insiders by activity - memoized
  const topInsiders = useMemo(() => {
    const insiderActivity = trades.reduce((acc: Record<string, InsiderActivity>, trade) => {
      if (!acc[trade.name]) {
        acc[trade.name] = { name: trade.name, title: trade.title, buys: 0, sells: 0, totalShares: 0 }
      }
      if (trade.transaction_shares > 0) {
        acc[trade.name].buys += trade.transaction_shares
      } else {
        acc[trade.name].sells += Math.abs(trade.transaction_shares)
      }
      acc[trade.name].totalShares += Math.abs(trade.transaction_shares)
      return acc
    }, {})

    return Object.values(insiderActivity)
      .sort((a, b) => b.totalShares - a.totalShares)
      .slice(0, 5)
  }, [trades])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#4ebe96]" />
            Insider Trading Activity - {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Buys */}
            <div className="p-4 bg-[#4ebe96]/10 rounded-xl border border-[#4ebe96]/30">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-[#4ebe96]" />
                <span className="text-sm text-[#868f97]">Insider Buys</span>
              </div>
              <p className="text-3xl font-bold text-[#4ebe96]">{buys.length}</p>
              <p className="text-sm text-[#868f97]">
                {totalBuyShares.toLocaleString()} shares
              </p>
            </div>

            {/* Total Sells */}
            <div className="p-4 bg-[#e15241]/10 rounded-xl border border-[#e15241]/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[#e15241]" />
                <span className="text-sm text-[#868f97]">Insider Sells</span>
              </div>
              <p className="text-3xl font-bold text-[#e15241]">{sells.length}</p>
              <p className="text-sm text-[#868f97]">
                {totalSellShares.toLocaleString()} shares
              </p>
            </div>

            {/* Net Activity */}
            <div className="p-4 bg-white/[0.05] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {netShares >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-[#4ebe96]" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-[#e15241]" />
                )}
                <span className="text-sm text-[#868f97]">Net Activity</span>
              </div>
              <p className={`text-3xl font-bold ${netShares >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                {netShares >= 0 ? '+' : ''}{netShares.toLocaleString()}
              </p>
              <p className="text-sm text-[#868f97]">shares</p>
            </div>

            {/* Sentiment */}
            <div className="p-4 bg-white/[0.05] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#479ffa]" />
                <span className="text-sm text-[#868f97]">Signal</span>
              </div>
              <p className={`text-3xl font-bold ${sentimentColor}`}>{sentiment}</p>
              <p className="text-sm text-[#868f97]">
                {uniqueInsiders} insiders active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="month" stroke="#868f97" />
                  <YAxis stroke="#868f97" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    formatter={(value: number) => [value.toLocaleString() + ' shares', '']}
                  />
                  <Bar dataKey="buys" fill="#4ebe96" name="Buys" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sells" fill="#e15241" name="Sells" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Buy/Sell Ratio Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buy vs Sell Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Transaction Count */}
              <div>
                <p className="text-sm text-[#868f97] mb-2">By Transaction Count</p>
                <div className="flex h-8 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4ebe96] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(buys.length / (buys.length + sells.length)) * 100 || 50}%` }}
                  >
                    {buys.length}
                  </div>
                  <div
                    className="bg-[#e15241] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(sells.length / (buys.length + sells.length)) * 100 || 50}%` }}
                  >
                    {sells.length}
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-[#868f97]">
                  <span>Buys ({((buys.length / (buys.length + sells.length)) * 100 || 0).toFixed(0)}%)</span>
                  <span>Sells ({((sells.length / (buys.length + sells.length)) * 100 || 0).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Share Volume */}
              <div>
                <p className="text-sm text-[#868f97] mb-2">By Share Volume</p>
                <div className="flex h-8 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4ebe96] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(totalBuyShares / (totalBuyShares + totalSellShares)) * 100 || 50}%` }}
                  >
                    {(totalBuyShares / 1000).toFixed(0)}K
                  </div>
                  <div
                    className="bg-[#e15241] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(totalSellShares / (totalBuyShares + totalSellShares)) * 100 || 50}%` }}
                  >
                    {(totalSellShares / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-[#868f97]">
                  <span>Buy Volume</span>
                  <span>Sell Volume</span>
                </div>
              </div>

              {/* Value if available */}
              {(totalBuyValue > 0 || totalSellValue > 0) && (
                <div>
                  <p className="text-sm text-[#868f97] mb-2">By Dollar Value</p>
                  <div className="flex h-8 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4ebe96] flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(totalBuyValue / (totalBuyValue + totalSellValue)) * 100 || 50}%` }}
                    >
                      ${(totalBuyValue / 1000000).toFixed(1)}M
                    </div>
                    <div
                      className="bg-[#e15241] flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(totalSellValue / (totalBuyValue + totalSellValue)) * 100 || 50}%` }}
                    >
                      ${(totalSellValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Insiders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Most Active Insiders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topInsiders.map((insider, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.05] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ebe96] to-[#479ffa] flex items-center justify-center text-white font-bold">
                    {insider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{insider.name}</p>
                    <p className="text-sm text-[#868f97]">{insider.title}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-[#4ebe96] font-medium">+{insider.buys.toLocaleString()}</p>
                    <p className="text-xs text-[#868f97]">Bought</p>
                  </div>
                  <div>
                    <p className="text-[#e15241] font-medium">-{insider.sells.toLocaleString()}</p>
                    <p className="text-xs text-[#868f97]">Sold</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {trades.slice(0, 20).map((trade, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trade.transaction_shares > 0 ? 'bg-[#4ebe96]/20 text-[#4ebe96]' : 'bg-[#e15241]/20 text-[#e15241]'
                  }`}>
                    {trade.transaction_shares > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{trade.name}</p>
                    <p className="text-sm text-[#868f97]">{trade.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.transaction_shares > 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'}`}>
                    {trade.transaction_shares > 0 ? '+' : ''}{trade.transaction_shares.toLocaleString()} shares
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#868f97] justify-end">
                    <Calendar className="w-3 h-3" />
                    {trade.transaction_date}
                    {trade.transaction_price_per_share && (
                      <span>@ ${trade.transaction_price_per_share.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders when parent components update
export default memo(InsiderTradingComponent)
