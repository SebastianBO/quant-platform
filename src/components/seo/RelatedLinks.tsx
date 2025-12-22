import Link from 'next/link'
import { getRelatedStocks, getComparisonPairs, SITE_URL } from '@/lib/seo'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  Heart,
  BarChart3,
  ArrowRight,
  Scale,
  Target
} from 'lucide-react'

interface RelatedLinksProps {
  ticker: string
  currentPage: 'stock' | 'should-i-buy' | 'prediction' | 'compare' | 'health' | 'buy'
  companyName?: string
}

export function RelatedLinks({ ticker, currentPage, companyName }: RelatedLinksProps) {
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const relatedStocks = getRelatedStocks(symbol)
  const comparisons = getComparisonPairs(symbol)
  const name = companyName || symbol

  // Top stock predictions
  const topPredictionStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'].filter(
    stock => stock !== symbol
  )

  // Deep dive analysis links for should-i-buy and buy pages
  const deepDiveLinks = [
    {
      href: `/stock/${symbol}`,
      icon: TrendingUp,
      title: 'Full Stock Analysis',
      description: `Complete ${symbol} overview with charts and data`,
      color: 'text-blue-500'
    },
    {
      href: `/analysis/${symbol.toLowerCase()}/valuation`,
      icon: DollarSign,
      title: `Is ${symbol} Undervalued?`,
      description: 'DCF valuation and intrinsic value analysis',
      color: 'text-green-500'
    },
    {
      href: `/analysis/${symbol.toLowerCase()}/dividend`,
      icon: PieChart,
      title: 'Dividend Analysis',
      description: 'Yield, payout ratio, and dividend history',
      color: 'text-purple-500'
    },
    {
      href: `/analysis/${symbol.toLowerCase()}/growth`,
      icon: Activity,
      title: 'Growth Analysis',
      description: 'Revenue, earnings, and expansion metrics',
      color: 'text-emerald-500'
    },
    {
      href: `/analysis/${symbol.toLowerCase()}/health`,
      icon: Heart,
      title: 'Financial Health',
      description: 'Debt, liquidity, and balance sheet strength',
      color: 'text-red-500'
    },
    {
      href: `/prediction/${symbol.toLowerCase()}`,
      icon: Target,
      title: 'Price Prediction',
      description: `${currentYear} forecast and price targets`,
      color: 'text-orange-500'
    }
  ]

  // Comparison pairs for "Compare Before You Buy"
  const comparisonLinks = relatedStocks.slice(0, 4).map(stock => ({
    href: `/compare/${symbol.toLowerCase()}-vs-${stock.toLowerCase()}`,
    ticker: stock,
    label: `${symbol} vs ${stock}`
  }))

  // Similar investment decision links
  const similarDecisionLinks = relatedStocks.map(stock => ({
    href: `/should-i-buy/${stock.toLowerCase()}`,
    ticker: stock,
    label: `Should I Buy ${stock}?`
  }))

  return (
    <section className="mt-12 border-t border-border pt-8">
      {/* Deep Dive Analysis Section - For should-i-buy and buy pages */}
      {(currentPage === 'should-i-buy' || currentPage === 'buy') && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-2">Deep Dive Analysis</h3>
          <p className="text-muted-foreground mb-6">
            Explore comprehensive analysis tools to make an informed decision about {name}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deepDiveLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className={`${link.color} mt-1`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1 group-hover:text-green-500 transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Compare Before You Buy Section - For should-i-buy and buy pages */}
      {(currentPage === 'should-i-buy' || currentPage === 'buy') && comparisonLinks.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-2">Compare Before You Buy</h3>
          <p className="text-muted-foreground mb-6">
            See how {symbol} stacks up against its competitors
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisonLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="text-blue-500" size={24} />
                    <div>
                      <h4 className="font-bold group-hover:text-green-500 transition-colors">
                        {link.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Side-by-side comparison
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Similar Investment Decisions Section - For should-i-buy and buy pages */}
      {(currentPage === 'should-i-buy' || currentPage === 'buy') && similarDecisionLinks.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-2">Similar Investment Decisions</h3>
          <p className="text-muted-foreground mb-6">
            Explore investment analyses for stocks similar to {name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarDecisionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="text-green-500" size={28} />
                  <div>
                    <p className="font-bold text-lg group-hover:text-green-500 transition-colors">
                      {link.ticker}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Buy or Sell?
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Original Related Links */}
      <h3 className="text-lg font-bold mb-6">Related Analysis</h3>

      {/* Direct Links for Current Stock */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">More on {symbol}</h4>
        <div className="flex flex-wrap gap-2">
          {currentPage !== 'stock' && (
            <Link
              href={`/stock/${symbol}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {symbol} Overview
            </Link>
          )}
          <Link
            href={`/analysis/${symbol.toLowerCase()}/valuation`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            Valuation Analysis
          </Link>
          <Link
            href={`/analysis/${symbol.toLowerCase()}/growth`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            Growth Analysis
          </Link>
          {currentPage !== 'should-i-buy' && (
            <Link
              href={`/should-i-buy/${symbol.toLowerCase()}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              Should I Buy {symbol}?
            </Link>
          )}
          {currentPage !== 'prediction' && (
            <Link
              href={`/prediction/${symbol.toLowerCase()}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {symbol} Price Prediction {currentYear}
            </Link>
          )}
          {currentPage !== 'health' && (
            <Link
              href={`/analysis/${symbol.toLowerCase()}/health`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {symbol} Financial Health
            </Link>
          )}
          <Link
            href={`/dashboard?ticker=${symbol}&tab=ai`}
            className="px-3 py-1.5 bg-green-600/20 text-green-500 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
          >
            AI Analysis
          </Link>
          <Link
            href={`/dashboard?ticker=${symbol}&tab=dcf`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            DCF Valuation
          </Link>
        </div>
      </div>

      {/* Compare Predictions - Only show on prediction page */}
      {currentPage === 'prediction' && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Compare Predictions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedStocks.map((stock) => (
              <Link
                key={stock}
                href={`/prediction/${stock.toLowerCase()}`}
                className="bg-card p-3 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <p className="font-bold text-green-500">{stock}</p>
                <p className="text-xs text-muted-foreground">Price Prediction</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stock Comparisons */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Compare {symbol} With</h4>
        <div className="flex flex-wrap gap-2">
          {relatedStocks.map((stock) => (
            <Link
              key={stock}
              href={`/compare/${symbol.toLowerCase()}-vs-${stock.toLowerCase()}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {symbol} vs {stock}
            </Link>
          ))}
        </div>
      </div>

      {/* Related Stock Analysis */}
      {currentPage !== 'prediction' && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Similar Stocks</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedStocks.map((stock) => (
              <Link
                key={stock}
                href={`/stock/${stock}`}
                className="bg-card p-3 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <p className="font-bold text-green-500">{stock}</p>
                <p className="text-xs text-muted-foreground">View Analysis</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More Predictions - Only show on prediction page */}
      {currentPage === 'prediction' && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">More Predictions</h4>
          <div className="flex flex-wrap gap-2">
            {topPredictionStocks.map((stock) => (
              <Link
                key={stock}
                href={`/prediction/${stock.toLowerCase()}`}
                className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors font-medium"
              >
                {stock} Prediction
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Links */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Explore Categories</h4>
        <div className="flex flex-wrap gap-2">
          <Link href="/best-stocks/tech" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best Tech Stocks
          </Link>
          <Link href="/best-stocks/growth" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best Growth Stocks
          </Link>
          <Link href="/best-stocks/dividend" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best Dividend Stocks
          </Link>
          <Link href="/best-stocks/ai" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best AI Stocks
          </Link>
          <Link href="/best-stocks/value" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best Value Stocks
          </Link>
          <Link href="/best-stocks/etf" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best ETFs
          </Link>
          <Link href="/best-stocks/blue-chip" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best Blue Chip Stocks
          </Link>
          <Link href="/best-stocks/reit" className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
            Best REITs
          </Link>
          <Link href="/sectors" className="px-3 py-1.5 bg-green-600/20 text-green-500 rounded-lg text-sm hover:bg-green-600/30 transition-colors">
            Browse All Sectors
          </Link>
        </div>
      </div>
    </section>
  )
}

// Popular comparisons component for comparison pages
export function PopularComparisons({ currentSlug }: { currentSlug: string }) {
  const popularPairs = [
    { slug: 'aapl-vs-msft', label: 'AAPL vs MSFT' },
    { slug: 'nvda-vs-amd', label: 'NVDA vs AMD' },
    { slug: 'googl-vs-meta', label: 'GOOGL vs META' },
    { slug: 'tsla-vs-rivn', label: 'TSLA vs RIVN' },
    { slug: 'jpm-vs-bac', label: 'JPM vs BAC' },
    { slug: 'amzn-vs-wmt', label: 'AMZN vs WMT' },
  ]

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h3 className="text-lg font-bold mb-4">Popular Stock Comparisons</h3>
      <div className="flex flex-wrap gap-2">
        {popularPairs
          .filter((pair) => pair.slug !== currentSlug.toLowerCase())
          .map((pair) => (
            <Link
              key={pair.slug}
              href={`/compare/${pair.slug}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {pair.label}
            </Link>
          ))}
      </div>
    </section>
  )
}

// Category links for best-stocks pages
export function CategoryLinks({ currentCategory }: { currentCategory: string }) {
  const categories = [
    { key: 'dividend', label: 'Dividend Stocks' },
    { key: 'growth', label: 'Growth Stocks' },
    { key: 'value', label: 'Value Stocks' },
    { key: 'tech', label: 'Tech Stocks' },
    { key: 'healthcare', label: 'Healthcare Stocks' },
    { key: 'energy', label: 'Energy Stocks' },
    { key: 'ai', label: 'AI Stocks' },
    { key: 'small-cap', label: 'Small Cap Stocks' },
    { key: 'large-cap', label: 'Large Cap Stocks' },
    { key: 'etf', label: 'ETFs' },
    { key: 'penny', label: 'Penny Stocks' },
    { key: 'safe', label: 'Safe Stocks' },
    { key: 'recession-proof', label: 'Recession-Proof Stocks' },
    { key: 'beginner', label: 'Stocks for Beginners' },
    { key: 'monthly-dividend', label: 'Monthly Dividend Stocks' },
    { key: 'high-growth', label: 'High Growth Stocks' },
    { key: 'undervalued', label: 'Undervalued Stocks' },
    { key: 'momentum', label: 'Momentum Stocks' },
    { key: 'blue-chip', label: 'Blue Chip Stocks' },
    { key: 'index-fund', label: 'Index Funds' },
    { key: 'reit', label: 'REIT Stocks' },
  ]

  const sectors = [
    { key: 'technology', label: 'Technology Sector' },
    { key: 'healthcare', label: 'Healthcare Sector' },
    { key: 'financials', label: 'Financial Sector' },
    { key: 'energy', label: 'Energy Sector' },
  ]

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h3 className="text-lg font-bold mb-4">Explore Other Categories</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories
          .filter((cat) => cat.key !== currentCategory.toLowerCase())
          .map((cat) => (
            <Link
              key={cat.key}
              href={`/best-stocks/${cat.key}`}
              className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Best {cat.label}
            </Link>
          ))}
      </div>
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Browse by Sector</h4>
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => (
          <Link
            key={sector.key}
            href={`/sectors/${sector.key}`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            {sector.label}
          </Link>
        ))}
        <Link
          href="/sectors"
          className="px-3 py-1.5 bg-green-600/20 text-green-500 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
        >
          View All Sectors
        </Link>
      </div>
    </section>
  )
}
