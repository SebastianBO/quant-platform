// Server-side rendered stock content for SEO
// This component renders critical stock information server-side
// so Google can see unique content without JavaScript

import { formatCurrency, formatPercent } from "@/lib/utils"
import Link from "next/link"

interface PeerData {
  ticker: string
  name: string
  pe: number
  revenueGrowth: number
  profitMargin: number
  marketCap: number
}

interface StockSSRContentProps {
  ticker: string
  companyName: string
  price?: number
  dayChange?: number
  dayChangePercent?: number
  marketCap?: number
  peRatio?: number
  sector?: string
  industry?: string
  description?: string
  exchange?: string
  employees?: number
  website?: string
  headquarters?: string
  metrics?: {
    price_to_earnings_ratio?: number
    price_to_book_ratio?: number
    dividend_yield?: number
    revenue_growth?: number
    profit_margin?: number
    debt_to_equity?: number
    return_on_equity?: number
    earnings_per_share?: number
  }
  peers?: PeerData[]
}

// Get ordinal suffix for rankings
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Peer comparison section component
function PeerComparisonSection({
  ticker,
  companyName,
  sector,
  industry,
  pe,
  revenueGrowth,
  profitMargin,
  marketCap,
  peers,
}: {
  ticker: string
  companyName: string
  sector?: string
  industry?: string
  pe: number
  revenueGrowth: number
  profitMargin: number
  marketCap: number
  peers: PeerData[]
}) {
  if (!peers || peers.length === 0) return null

  const symbol = ticker.toUpperCase()
  const industryName = industry || sector || 'its peer group'

  // Current stock data
  const currentStock = { ticker: symbol, name: companyName, pe, revenueGrowth, profitMargin, marketCap }
  const allStocks = [currentStock, ...peers]

  // Calculate rankings
  const validPE = allStocks.filter(s => s.pe > 0)
  const validMargin = allStocks.filter(s => s.profitMargin !== 0)
  const validGrowth = allStocks.filter(s => s.revenueGrowth !== 0)
  const validSize = allStocks.filter(s => s.marketCap > 0)

  const peRank = validPE.length > 0 ?
    [...validPE].sort((a, b) => a.pe - b.pe).findIndex(s => s.ticker === symbol) + 1 : 0
  const marginRank = validMargin.length > 0 ?
    [...validMargin].sort((a, b) => b.profitMargin - a.profitMargin).findIndex(s => s.ticker === symbol) + 1 : 0
  const growthRank = validGrowth.length > 0 ?
    [...validGrowth].sort((a, b) => b.revenueGrowth - a.revenueGrowth).findIndex(s => s.ticker === symbol) + 1 : 0
  const sizeRank = validSize.length > 0 ?
    [...validSize].sort((a, b) => b.marketCap - a.marketCap).findIndex(s => s.ticker === symbol) + 1 : 0

  // Generate unique insights
  const insights: string[] = []

  if (peRank === 1 && validPE.length > 1) {
    insights.push(`${symbol} has the lowest P/E ratio in ${industryName}, suggesting it may be the most undervalued`)
  } else if (peRank > 0 && peRank <= 2 && validPE.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(peRank)} most undervalued by P/E ratio among peers`)
  } else if (peRank === validPE.length && validPE.length > 1) {
    insights.push(`${symbol} trades at a premium valuation vs peers (highest P/E)`)
  }

  if (marginRank === 1 && validMargin.length > 1) {
    insights.push(`${symbol} has the highest profit margins in ${industryName}`)
  } else if (marginRank > 0 && marginRank <= 2 && validMargin.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(marginRank)} in profitability among competitors`)
  }

  if (growthRank === 1 && validGrowth.length > 1) {
    insights.push(`${symbol} has the fastest revenue growth among competitors`)
  } else if (growthRank > 0 && growthRank <= 2 && validGrowth.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(growthRank)} in revenue growth vs peers`)
  }

  if (sizeRank === 1 && validSize.length > 1) {
    insights.push(`${symbol} is the largest company in its peer group by market cap`)
  } else if (sizeRank === validSize.length && validSize.length > 1) {
    insights.push(`${symbol} is the smallest among peers, which may offer higher growth potential`)
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">How {symbol} Compares to Peers</h2>

      {/* Unique ranking insights - creates unique content per stock */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.slice(0, 3).map((insight, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ranking summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">P/E Rank</p>
          <p className="text-xl font-bold">{peRank > 0 ? `#${peRank}` : 'N/A'}</p>
          <p className={`text-xs ${peRank > 0 && peRank <= 2 ? 'text-green-500' : 'text-muted-foreground'}`}>
            of {validPE.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Margin Rank</p>
          <p className="text-xl font-bold">{marginRank > 0 ? `#${marginRank}` : 'N/A'}</p>
          <p className={`text-xs ${marginRank > 0 && marginRank <= 2 ? 'text-green-500' : 'text-muted-foreground'}`}>
            of {validMargin.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Growth Rank</p>
          <p className="text-xl font-bold">{growthRank > 0 ? `#${growthRank}` : 'N/A'}</p>
          <p className={`text-xs ${growthRank > 0 && growthRank <= 2 ? 'text-green-500' : 'text-muted-foreground'}`}>
            of {validGrowth.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Size Rank</p>
          <p className="text-xl font-bold">{sizeRank > 0 ? `#${sizeRank}` : 'N/A'}</p>
          <p className="text-xs text-muted-foreground">of {validSize.length}</p>
        </div>
      </div>

      {/* Peer comparison table */}
      <div className="overflow-x-auto bg-card border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="p-3 text-left font-medium">Company</th>
              <th className="p-3 text-right font-medium">Market Cap</th>
              <th className="p-3 text-right font-medium">P/E</th>
              <th className="p-3 text-right font-medium">Rev Growth</th>
              <th className="p-3 text-right font-medium">Margin</th>
              <th className="p-3 text-center font-medium">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Current stock - highlighted */}
            <tr className="bg-green-500/10">
              <td className="p-3">
                <span className="font-bold text-green-500">{symbol}</span>
                <span className="text-muted-foreground ml-2 text-xs">(This stock)</span>
              </td>
              <td className="p-3 text-right font-medium">{formatCurrency(marketCap)}</td>
              <td className="p-3 text-right">{pe > 0 ? pe.toFixed(1) : 'N/A'}</td>
              <td className="p-3 text-right">
                <span className={revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </span>
              </td>
              <td className="p-3 text-right">{(profitMargin * 100).toFixed(1)}%</td>
              <td className="p-3 text-center">-</td>
            </tr>
            {/* Peer stocks */}
            {peers.slice(0, 5).map(peer => (
              <tr key={peer.ticker} className="hover:bg-secondary/30">
                <td className="p-3">
                  <Link
                    href={`/stock/${peer.ticker.toLowerCase()}`}
                    className="font-medium hover:text-green-500 transition-colors"
                  >
                    {peer.ticker}
                  </Link>
                  <span className="text-muted-foreground ml-2 text-xs">{peer.name.split(' ').slice(0, 2).join(' ')}</span>
                </td>
                <td className="p-3 text-right">{formatCurrency(peer.marketCap)}</td>
                <td className="p-3 text-right">{peer.pe > 0 ? peer.pe.toFixed(1) : 'N/A'}</td>
                <td className="p-3 text-right">
                  <span className={peer.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {(peer.revenueGrowth * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 text-right">{(peer.profitMargin * 100).toFixed(1)}%</td>
                <td className="p-3 text-center">
                  <Link
                    href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                    className="text-xs px-2 py-1 bg-secondary hover:bg-green-500/20 hover:text-green-500 rounded transition-colors"
                  >
                    vs {peer.ticker}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison navigation links */}
      <nav className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">See full comparison:</p>
        <div className="flex flex-wrap gap-2">
          {peers.slice(0, 5).map(peer => (
            <Link
              key={peer.ticker}
              href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
              className="px-3 py-1.5 bg-secondary hover:bg-green-500/20 hover:text-green-500 rounded-lg text-sm transition-colors"
            >
              {symbol} vs {peer.ticker}
            </Link>
          ))}
        </div>
      </nav>
    </section>
  )
}

export default function StockSSRContent({
  ticker,
  companyName,
  price,
  dayChange,
  dayChangePercent,
  marketCap,
  peRatio,
  sector,
  industry,
  description,
  exchange,
  employees,
  website,
  headquarters,
  metrics,
  peers,
}: StockSSRContentProps) {
  const isPositive = (dayChange ?? 0) >= 0

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Stock Header - Critical for SEO */}
      <header className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {ticker} - {companyName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {exchange && <span>{exchange}</span>}
              {sector && <span> * {sector}</span>}
              {industry && <span> * {industry}</span>}
            </p>
          </div>

          {price !== undefined && (
            <div className="text-right">
              <p className="text-3xl sm:text-4xl font-bold">
                {formatCurrency(price)}
              </p>
              {dayChange !== undefined && dayChangePercent !== undefined && (
                <p className={`text-lg font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(dayChange)} ({isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Company Description - Unique content per stock */}
      {description && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">About {companyName}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </section>
      )}

      {/* Key Statistics Grid - SSR for SEO */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{ticker} Key Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {marketCap !== undefined && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-lg font-semibold">
                {marketCap >= 1e12 ? `$${(marketCap / 1e12).toFixed(2)}T` :
                 marketCap >= 1e9 ? `$${(marketCap / 1e9).toFixed(2)}B` :
                 `$${(marketCap / 1e6).toFixed(2)}M`}
              </p>
            </div>
          )}

          {(peRatio || metrics?.price_to_earnings_ratio) && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">P/E Ratio</p>
              <p className="text-lg font-semibold">
                {(peRatio || metrics?.price_to_earnings_ratio)?.toFixed(2)}
              </p>
            </div>
          )}

          {metrics?.price_to_book_ratio && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">P/B Ratio</p>
              <p className="text-lg font-semibold">
                {metrics.price_to_book_ratio.toFixed(2)}
              </p>
            </div>
          )}

          {metrics?.earnings_per_share && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">EPS</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.earnings_per_share)}
              </p>
            </div>
          )}

          {metrics?.dividend_yield !== undefined && metrics.dividend_yield > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Dividend Yield</p>
              <p className="text-lg font-semibold">
                {(metrics.dividend_yield * 100).toFixed(2)}%
              </p>
            </div>
          )}

          {metrics?.revenue_growth !== undefined && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Revenue Growth</p>
              <p className={`text-lg font-semibold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.revenue_growth >= 0 ? '+' : ''}{(metrics.revenue_growth * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {metrics?.profit_margin !== undefined && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-lg font-semibold">
                {(metrics.profit_margin * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {metrics?.debt_to_equity !== undefined && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Debt to Equity</p>
              <p className="text-lg font-semibold">
                {metrics.debt_to_equity.toFixed(2)}
              </p>
            </div>
          )}

          {employees !== undefined && employees > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="text-lg font-semibold">
                {employees.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Peer Comparison Section - Unique rankings per stock */}
      {peers && peers.length > 0 && (
        <PeerComparisonSection
          ticker={ticker}
          companyName={companyName}
          sector={sector}
          industry={industry}
          pe={peRatio || metrics?.price_to_earnings_ratio || 0}
          revenueGrowth={metrics?.revenue_growth || 0}
          profitMargin={metrics?.profit_margin || 0}
          marketCap={marketCap || 0}
          peers={peers}
        />
      )}

      {/* Company Info - Additional unique content */}
      {(headquarters || website) && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{companyName} Company Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {headquarters && (
              <div>
                <dt className="text-sm text-muted-foreground">Headquarters</dt>
                <dd className="text-foreground">{headquarters}</dd>
              </div>
            )}
            {website && (
              <div>
                <dt className="text-sm text-muted-foreground">Website</dt>
                <dd>
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:underline"
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            )}
            {sector && (
              <div>
                <dt className="text-sm text-muted-foreground">Sector</dt>
                <dd>
                  <Link href={`/sectors/${sector.toLowerCase().replace(/\s+/g, '-')}`} className="text-green-500 hover:underline">
                    {sector}
                  </Link>
                </dd>
              </div>
            )}
            {industry && (
              <div>
                <dt className="text-sm text-muted-foreground">Industry</dt>
                <dd className="text-foreground">{industry}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* SEO-friendly navigation links */}
      <nav className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Explore {ticker} Analysis</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/should-i-buy/${ticker.toLowerCase()}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            Should I Buy {ticker}?
          </Link>
          <Link
            href={`/valuation/${ticker.toLowerCase()}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            {ticker} Valuation
          </Link>
          <Link
            href={`/prediction/${ticker.toLowerCase()}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            {ticker} Price Prediction
          </Link>
          <Link
            href={`/analysis/${ticker.toLowerCase()}/valuation`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            Deep Valuation
          </Link>
          <Link
            href={`/debt/${ticker.toLowerCase()}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            {ticker} Debt Analysis
          </Link>
        </div>
      </nav>
    </article>
  )
}
