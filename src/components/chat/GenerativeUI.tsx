"use client"

import React from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, ExternalLink, Building2, BarChart3, LineChart, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import StockLogo from "@/components/StockLogo"

// Tool result types from AI agent
export interface ToolResult {
  toolName: string
  args: Record<string, unknown>
  result: unknown
  status: 'pending' | 'success' | 'error'
  error?: string
}

// Stock Quote Card - renders inline in chat
interface StockQuoteProps {
  symbol: string
  name?: string
  price: number
  change: number
  changePercent: number
  marketCap?: number
  volume?: number
}

export function StockQuoteCard({ symbol, name, price, change, changePercent, marketCap, volume }: StockQuoteProps) {
  const isPositive = changePercent >= 0

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  return (
    <Link href={`/stock/${symbol}`} className="block">
      <div className="flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary/70 rounded-xl transition-colors border border-border/50 my-2">
        <StockLogo symbol={symbol} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{symbol}</span>
            {name && <span className="text-xs text-muted-foreground truncate">{name}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold">${price.toFixed(2)}</span>
            <span className={cn(
              "flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded",
              isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {marketCap && <div>MCap: {formatNumber(marketCap)}</div>}
          <ArrowRight className="w-4 h-4 ml-auto mt-1 opacity-50" />
        </div>
      </div>
    </Link>
  )
}

// Stock Comparison Card
interface StockComparisonProps {
  stocks: Array<{
    symbol: string
    name?: string
    price: number
    changePercent: number
    pe?: number
    marketCap?: number
    revenue?: number
  }>
}

export function StockComparisonCard({ stocks }: StockComparisonProps) {
  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    return num.toLocaleString()
  }

  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border border-border/50 rounded-xl overflow-hidden">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left p-2 font-medium">Stock</th>
            <th className="text-right p-2 font-medium">Price</th>
            <th className="text-right p-2 font-medium">Change</th>
            <th className="text-right p-2 font-medium">P/E</th>
            <th className="text-right p-2 font-medium">MCap</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, i) => (
            <tr key={stock.symbol} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
              <td className="p-2">
                <Link href={`/stock/${stock.symbol}`} className="flex items-center gap-2 hover:text-green-500">
                  <StockLogo symbol={stock.symbol} size="sm" />
                  <span className="font-medium">{stock.symbol}</span>
                </Link>
              </td>
              <td className="text-right p-2 font-mono">${stock.price.toFixed(2)}</td>
              <td className={cn(
                "text-right p-2",
                stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </td>
              <td className="text-right p-2">{stock.pe?.toFixed(1) || "N/A"}</td>
              <td className="text-right p-2">{formatNumber(stock.marketCap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Financials Summary Card
interface FinancialsSummaryProps {
  symbol: string
  revenue?: number
  netIncome?: number
  eps?: number
  pe?: number
  debtToEquity?: number
  profitMargin?: number
}

export function FinancialsSummaryCard({ symbol, revenue, netIncome, eps, pe, debtToEquity, profitMargin }: FinancialsSummaryProps) {
  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A"
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  return (
    <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 my-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-500" />
          <span className="font-semibold">{symbol} Financials</span>
        </div>
        <Link href={`/stock/${symbol}/financials`} className="text-xs text-green-500 hover:underline flex items-center gap-1">
          Full Report <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Revenue</div>
          <div className="font-semibold">{formatNumber(revenue)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Net Income</div>
          <div className="font-semibold">{formatNumber(netIncome)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">EPS</div>
          <div className="font-semibold">{eps ? `$${eps.toFixed(2)}` : "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">P/E Ratio</div>
          <div className="font-semibold">{pe?.toFixed(2) || "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">D/E Ratio</div>
          <div className="font-semibold">{debtToEquity?.toFixed(2) || "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Profit Margin</div>
          <div className="font-semibold">{profitMargin ? `${(profitMargin * 100).toFixed(1)}%` : "N/A"}</div>
        </div>
      </div>
    </div>
  )
}

// Market Movers Card
interface MarketMoversProps {
  type: 'gainers' | 'losers' | 'active'
  stocks: Array<{
    symbol: string
    name?: string
    price: number
    changePercent: number
  }>
}

export function MarketMoversCard({ type, stocks }: MarketMoversProps) {
  const titles = {
    gainers: "Top Gainers",
    losers: "Top Losers",
    active: "Most Active"
  }

  return (
    <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 my-3">
      <div className="flex items-center gap-2 mb-2">
        <LineChart className="w-4 h-4 text-green-500" />
        <span className="font-semibold text-sm">{titles[type]}</span>
      </div>
      <div className="space-y-1">
        {stocks.slice(0, 5).map((stock) => (
          <Link key={stock.symbol} href={`/stock/${stock.symbol}`}>
            <div className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <StockLogo symbol={stock.symbol} size="sm" />
                <span className="font-medium text-sm">{stock.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">${stock.price.toFixed(2)}</span>
                <span className={cn(
                  "text-xs font-medium",
                  stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Sector Breakdown Card
interface SectorBreakdownProps {
  symbol: string
  sector?: string
  industry?: string
  employees?: number
  headquarters?: string
}

export function SectorBreakdownCard({ symbol, sector, industry, employees, headquarters }: SectorBreakdownProps) {
  return (
    <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 my-2 inline-flex flex-wrap gap-2">
      {sector && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">
          <Building2 className="w-3 h-3" />
          {sector}
        </span>
      )}
      {industry && (
        <span className="px-2.5 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
          {industry}
        </span>
      )}
      {employees && (
        <span className="px-2.5 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
          {employees.toLocaleString()} employees
        </span>
      )}
      <Link href={`/stock/${symbol}`}>
        <span className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-full text-xs flex items-center gap-1">
          View Profile <ArrowRight className="w-3 h-3" />
        </span>
      </Link>
    </div>
  )
}

// Tool Loading Indicator
export function ToolLoadingCard({ toolName }: { toolName: string }) {
  const toolLabels: Record<string, string> = {
    getStockQuote: "Fetching stock quote",
    getCompanyFundamentals: "Loading fundamentals",
    getFinancialStatements: "Retrieving financials",
    compareStocks: "Comparing stocks",
    getMarketMovers: "Getting market movers",
    searchStocks: "Searching stocks",
    getInsiderTrades: "Loading insider trades",
    getSECFilings: "Fetching SEC filings",
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg text-sm text-muted-foreground my-1">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{toolLabels[toolName] || `Running ${toolName}`}...</span>
    </div>
  )
}

// Main renderer for tool results
export function renderToolResult(toolResult: ToolResult): React.ReactNode {
  const { toolName, result, status } = toolResult

  if (status === 'pending') {
    return <ToolLoadingCard toolName={toolName} />
  }

  if (status === 'error') {
    return (
      <div className="p-2 bg-red-500/10 text-red-500 rounded-lg text-sm my-1">
        Failed to load data
      </div>
    )
  }

  // Handle different tool types
  switch (toolName) {
    case 'getStockQuote': {
      const data = result as {
        symbol: string
        name?: string
        price: number
        change: number
        changePercent: number
        marketCap?: number
        volume?: number
      }
      if (data?.symbol && data?.price) {
        return <StockQuoteCard {...data} />
      }
      break
    }

    case 'compareStocks': {
      const data = result as {
        comparison: Array<{
          symbol: string
          name?: string
          price: number
          changePercent: number
          pe?: number
          marketCap?: number
        }>
      }
      if (data?.comparison?.length) {
        return <StockComparisonCard stocks={data.comparison} />
      }
      break
    }

    case 'getCompanyFundamentals': {
      const data = result as {
        symbol: string
        revenue?: number
        netIncome?: number
        eps?: number
        pe?: number
        debtToEquity?: number
        profitMargin?: number
      }
      if (data?.symbol) {
        return <FinancialsSummaryCard {...data} />
      }
      break
    }

    case 'getMarketMovers': {
      const data = result as {
        type: 'gainers' | 'losers' | 'active'
        movers: Array<{
          symbol: string
          name?: string
          price: number
          changePercent: number
        }>
      }
      if (data?.movers?.length) {
        return <MarketMoversCard type={data.type || 'gainers'} stocks={data.movers} />
      }
      break
    }

    default:
      // For unknown tools, don't render anything - let the text handle it
      return null
  }

  return null
}
