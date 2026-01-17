"use client"

/**
 * Market Heatmap - Finviz-style S&P 500 Sector Visualization
 *
 * Shows market performance by sector/industry using a treemap layout.
 * Green = positive returns, Red = negative returns
 * Size = market cap weight
 */

import { useMemo, useState, memo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// S&P 500 sectors with top holdings
interface Stock {
  ticker: string
  name: string
  weight: number // % weight in sector
  change?: number // daily % change
  marketCap?: number
}

interface Sector {
  name: string
  color: string
  stocks: Stock[]
  weight: number // % of total market
}

// Default sector data (will be overwritten by API data)
const DEFAULT_SECTORS: Sector[] = [
  {
    name: "Technology",
    color: "#6366f1",
    weight: 32,
    stocks: [
      { ticker: "AAPL", name: "Apple", weight: 7.2 },
      { ticker: "MSFT", name: "Microsoft", weight: 6.8 },
      { ticker: "NVDA", name: "NVIDIA", weight: 6.5 },
      { ticker: "AVGO", name: "Broadcom", weight: 1.4 },
      { ticker: "ORCL", name: "Oracle", weight: 0.8 },
      { ticker: "CRM", name: "Salesforce", weight: 0.5 },
      { ticker: "ADBE", name: "Adobe", weight: 0.4 },
      { ticker: "AMD", name: "AMD", weight: 0.4 },
    ],
  },
  {
    name: "Healthcare",
    color: "#22c55e",
    weight: 12,
    stocks: [
      { ticker: "LLY", name: "Eli Lilly", weight: 1.5 },
      { ticker: "UNH", name: "UnitedHealth", weight: 1.3 },
      { ticker: "JNJ", name: "J&J", weight: 0.9 },
      { ticker: "ABBV", name: "AbbVie", weight: 0.6 },
      { ticker: "MRK", name: "Merck", weight: 0.5 },
      { ticker: "PFE", name: "Pfizer", weight: 0.3 },
    ],
  },
  {
    name: "Financials",
    color: "#eab308",
    weight: 13,
    stocks: [
      { ticker: "BRK.B", name: "Berkshire", weight: 1.7 },
      { ticker: "JPM", name: "JPMorgan", weight: 1.3 },
      { ticker: "V", name: "Visa", weight: 1.0 },
      { ticker: "MA", name: "Mastercard", weight: 0.8 },
      { ticker: "BAC", name: "Bank of America", weight: 0.6 },
      { ticker: "WFC", name: "Wells Fargo", weight: 0.4 },
    ],
  },
  {
    name: "Consumer Discretionary",
    color: "#f97316",
    weight: 10,
    stocks: [
      { ticker: "AMZN", name: "Amazon", weight: 3.9 },
      { ticker: "TSLA", name: "Tesla", weight: 2.1 },
      { ticker: "HD", name: "Home Depot", weight: 0.7 },
      { ticker: "MCD", name: "McDonald's", weight: 0.4 },
      { ticker: "NKE", name: "Nike", weight: 0.3 },
    ],
  },
  {
    name: "Communication",
    color: "#ec4899",
    weight: 9,
    stocks: [
      { ticker: "GOOGL", name: "Alphabet", weight: 4.1 },
      { ticker: "META", name: "Meta", weight: 2.5 },
      { ticker: "NFLX", name: "Netflix", weight: 0.6 },
      { ticker: "DIS", name: "Disney", weight: 0.4 },
      { ticker: "VZ", name: "Verizon", weight: 0.3 },
    ],
  },
  {
    name: "Consumer Staples",
    color: "#14b8a6",
    weight: 6,
    stocks: [
      { ticker: "COST", name: "Costco", weight: 0.8 },
      { ticker: "WMT", name: "Walmart", weight: 0.7 },
      { ticker: "PG", name: "P&G", weight: 0.6 },
      { ticker: "KO", name: "Coca-Cola", weight: 0.5 },
      { ticker: "PEP", name: "PepsiCo", weight: 0.4 },
    ],
  },
  {
    name: "Energy",
    color: "#f43f5e",
    weight: 4,
    stocks: [
      { ticker: "XOM", name: "Exxon", weight: 1.0 },
      { ticker: "CVX", name: "Chevron", weight: 0.6 },
      { ticker: "COP", name: "ConocoPhillips", weight: 0.3 },
      { ticker: "SLB", name: "Schlumberger", weight: 0.2 },
    ],
  },
  {
    name: "Industrials",
    color: "#8b5cf6",
    weight: 8,
    stocks: [
      { ticker: "CAT", name: "Caterpillar", weight: 0.4 },
      { ticker: "GE", name: "GE Aerospace", weight: 0.4 },
      { ticker: "RTX", name: "RTX", weight: 0.3 },
      { ticker: "UNP", name: "Union Pacific", weight: 0.3 },
      { ticker: "HON", name: "Honeywell", weight: 0.3 },
    ],
  },
  {
    name: "Utilities",
    color: "#64748b",
    weight: 2,
    stocks: [
      { ticker: "NEE", name: "NextEra", weight: 0.3 },
      { ticker: "SO", name: "Southern Co", weight: 0.2 },
      { ticker: "DUK", name: "Duke Energy", weight: 0.2 },
    ],
  },
  {
    name: "Materials",
    color: "#78716c",
    weight: 2,
    stocks: [
      { ticker: "LIN", name: "Linde", weight: 0.4 },
      { ticker: "APD", name: "Air Products", weight: 0.2 },
      { ticker: "SHW", name: "Sherwin-Williams", weight: 0.2 },
    ],
  },
  {
    name: "Real Estate",
    color: "#a3a3a3",
    weight: 2,
    stocks: [
      { ticker: "PLD", name: "Prologis", weight: 0.2 },
      { ticker: "AMT", name: "American Tower", weight: 0.2 },
      { ticker: "EQIX", name: "Equinix", weight: 0.2 },
    ],
  },
]

interface MarketHeatmapProps {
  data?: Sector[]
  className?: string
  interactive?: boolean
  showLabels?: boolean
  maxStocks?: number
}

function getChangeColor(change: number | undefined): string {
  if (change === undefined) return "bg-white/[0.05]"
  if (change >= 3) return "bg-[#4ebe96]"
  if (change >= 1.5) return "bg-[#4ebe96]/90"
  if (change >= 0.5) return "bg-[#4ebe96]/80"
  if (change >= 0) return "bg-[#4ebe96]/70"
  if (change >= -0.5) return "bg-[#e15241]/70"
  if (change >= -1.5) return "bg-[#e15241]/80"
  if (change >= -3) return "bg-[#e15241]/90"
  return "bg-[#e15241]"
}

function getChangeTextColor(change: number | undefined): string {
  if (change === undefined) return "text-[#868f97]"
  if (change >= 0) return "text-white"
  return "text-white"
}

function StockTile({
  stock,
  sectorColor,
  size = "medium",
  interactive = true,
}: {
  stock: Stock
  sectorColor: string
  size?: "small" | "medium" | "large"
  interactive?: boolean
}) {
  const bgColor = getChangeColor(stock.change)
  const textColor = getChangeTextColor(stock.change)

  const sizeClasses = {
    small: "min-h-[40px] text-[9px]",
    medium: "min-h-[60px] text-xs",
    large: "min-h-[80px] text-sm",
  }

  const className = cn(
    "flex flex-col items-center justify-center p-1 rounded transition-all duration-100",
    bgColor,
    sizeClasses[size],
    interactive && "hover:ring-2 hover:ring-white/30 hover:z-10 cursor-pointer"
  )

  const style = { flex: `${stock.weight} 1 0%` }

  const content = (
    <>
      <span className={cn("font-bold truncate", textColor)}>{stock.ticker}</span>
      {stock.change !== undefined && (
        <span className={cn("text-[10px]", textColor)}>
          {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
        </span>
      )}
    </>
  )

  if (interactive) {
    return (
      <Link href={`/stock/${stock.ticker.toLowerCase()}`} className={className} style={style}>
        {content}
      </Link>
    )
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  )
}

function SectorTile({
  sector,
  interactive = true,
  showLabels = true,
  maxStocks = 8,
}: {
  sector: Sector
  interactive?: boolean
  showLabels?: boolean
  maxStocks?: number
}) {
  const displayStocks = sector.stocks.slice(0, maxStocks)
  const avgChange = displayStocks.reduce((sum, s) => sum + (s.change || 0), 0) / displayStocks.length

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden border border-white/[0.08]"
      style={{ flex: `${sector.weight} 1 0%` }}
    >
      {/* Sector header */}
      {showLabels && (
        <div
          className="px-2 py-1 text-xs font-semibold text-white flex items-center justify-between"
          style={{ backgroundColor: sector.color }}
        >
          <span className="truncate">{sector.name}</span>
          {!isNaN(avgChange) && (
            <span className={cn("text-[10px]", avgChange >= 0 ? "text-[#4ebe96]" : "text-[#e15241]")}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </span>
          )}
        </div>
      )}

      {/* Stocks grid */}
      <div className="flex flex-wrap flex-1 gap-0.5 p-1 bg-white/[0.05]">
        {displayStocks.map((stock) => (
          <StockTile
            key={stock.ticker}
            stock={stock}
            sectorColor={sector.color}
            size={sector.weight > 10 ? "medium" : "small"}
            interactive={interactive}
          />
        ))}
      </div>
    </div>
  )
}

export function MarketHeatmap({
  data,
  className,
  interactive = true,
  showLabels = true,
  maxStocks = 8,
}: MarketHeatmapProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null)

  // Use provided data or default
  const sectors = data || DEFAULT_SECTORS

  // Calculate layout - large sectors in left column, smaller in right
  const sortedSectors = useMemo(
    () => [...sectors].sort((a, b) => b.weight - a.weight),
    [sectors]
  )

  const leftColumn = sortedSectors.filter((_, i) => i % 2 === 0)
  const rightColumn = sortedSectors.filter((_, i) => i % 2 === 1)

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Market Heatmap</h2>
          <p className="text-xs text-[#868f97]">S&P 500 sectors by market cap weight</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#4ebe96]" />
            <span className="text-[#868f97]">+3%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#4ebe96]/80" />
            <span className="text-[#868f97]">+0-3%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#e15241]/80" />
            <span className="text-[#868f97]">-0-3%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#e15241]" />
            <span className="text-[#868f97]">-3%+</span>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-2 gap-2 h-[500px]">
        {/* Left column - larger sectors */}
        <div className="flex flex-col gap-2">
          {leftColumn.map((sector) => (
            <SectorTile
              key={sector.name}
              sector={sector}
              interactive={interactive}
              showLabels={showLabels}
              maxStocks={maxStocks}
            />
          ))}
        </div>

        {/* Right column - smaller sectors */}
        <div className="flex flex-col gap-2">
          {rightColumn.map((sector) => (
            <SectorTile
              key={sector.name}
              sector={sector}
              interactive={interactive}
              showLabels={showLabels}
              maxStocks={maxStocks}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#868f97]">
        <span>Size = Market cap weight • Color = Daily % change</span>
        <Link href="/markets" className="text-[#4ebe96] hover:text-[#4ebe96]/80 transition-colors duration-100">
          View full market data →
        </Link>
      </div>
    </div>
  )
}

/**
 * Compact heatmap for dashboards
 */
export function CompactHeatmap({
  data,
  className,
}: {
  data?: Sector[]
  className?: string
}) {
  const sectors = data || DEFAULT_SECTORS

  return (
    <div className={cn("space-y-2", className)}>
      {sectors.slice(0, 6).map((sector) => {
        const avgChange =
          sector.stocks.reduce((sum, s) => sum + (s.change || 0), 0) / sector.stocks.length

        return (
          <div
            key={sector.name}
            className="flex items-center gap-2"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sector.color }}
            />
            <span className="text-xs text-[#868f97] flex-1 truncate">{sector.name}</span>
            <div className="flex gap-0.5">
              {sector.stocks.slice(0, 4).map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker.toLowerCase()}`}
                  className={cn(
                    "w-6 h-6 rounded text-[8px] font-bold flex items-center justify-center transition-colors duration-100",
                    getChangeColor(stock.change),
                    "hover:ring-1 hover:ring-white/30"
                  )}
                  title={`${stock.ticker}: ${stock.change !== undefined ? (stock.change >= 0 ? "+" : "") + stock.change.toFixed(2) + "%" : "N/A"}`}
                >
                  {stock.ticker.slice(0, 2)}
                </Link>
              ))}
            </div>
            <span
              className={cn(
                "text-xs font-medium w-12 text-right",
                avgChange >= 0 ? "text-[#4ebe96]" : "text-[#e15241]"
              )}
            >
              {!isNaN(avgChange) ? `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(1)}%` : "—"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Sector bar chart alternative
 */
export function SectorBars({
  data,
  className,
}: {
  data?: Sector[]
  className?: string
}) {
  const sectors = data || DEFAULT_SECTORS

  return (
    <div className={cn("space-y-3", className)}>
      {sectors.map((sector) => {
        const avgChange =
          sector.stocks.reduce((sum, s) => sum + (s.change || 0), 0) / sector.stocks.length
        const barWidth = Math.min(Math.abs(avgChange || 0) * 10, 100)
        const isPositive = (avgChange || 0) >= 0

        return (
          <div key={sector.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-white">{sector.name}</span>
              </div>
              <span
                className={cn(
                  "font-medium",
                  isPositive ? "text-[#4ebe96]" : "text-[#e15241]"
                )}
              >
                {!isNaN(avgChange)
                  ? `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`
                  : "—"}
              </span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden flex">
              {isPositive ? (
                <>
                  <div className="w-1/2" />
                  <div
                    className="bg-[#4ebe96] rounded-full transition-all duration-100"
                    style={{ width: `${barWidth / 2}%` }}
                  />
                </>
              ) : (
                <>
                  <div className="flex-1 flex justify-end">
                    <div
                      className="bg-[#e15241] rounded-full transition-all duration-100"
                      style={{ width: `${barWidth / 2}%` }}
                    />
                  </div>
                  <div className="w-1/2" />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(MarketHeatmap)
