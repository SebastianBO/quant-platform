// Server-side rendered stock content for SEO
// This component renders critical stock information server-side
// so Google can see unique content without JavaScript

import { formatCurrency, formatPercent } from "@/lib/utils"
import Link from "next/link"

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
              {sector && <span> · {sector}</span>}
              {industry && <span> · {industry}</span>}
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
            href={`/prediction/${ticker.toLowerCase()}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            {ticker} Price Prediction
          </Link>
          <Link
            href={`/analysis/${ticker.toLowerCase()}/valuation`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
          >
            {ticker} Valuation
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
