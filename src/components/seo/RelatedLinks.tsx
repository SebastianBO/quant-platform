import Link from 'next/link'
import { getRelatedStocks, getComparisonPairs, SITE_URL } from '@/lib/seo'

interface RelatedLinksProps {
  ticker: string
  currentPage: 'stock' | 'should-i-buy' | 'prediction' | 'compare'
  companyName?: string
}

export function RelatedLinks({ ticker, currentPage, companyName }: RelatedLinksProps) {
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const relatedStocks = getRelatedStocks(symbol)
  const comparisons = getComparisonPairs(symbol)

  return (
    <section className="mt-12 border-t border-border pt-8">
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
              {symbol} Stock Price
            </Link>
          )}
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
  ]

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h3 className="text-lg font-bold mb-4">Explore Other Categories</h3>
      <div className="flex flex-wrap gap-2">
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
    </section>
  )
}
