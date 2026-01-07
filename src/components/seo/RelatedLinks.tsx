import Link from 'next/link'
import { getRelatedStocks, getComparisonPairs, SITE_URL } from '@/lib/seo'
import { STOCK_CATEGORIES } from '@/lib/stocks'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  Heart,
  BarChart3,
  ArrowRight,
  Scale,
  Target,
  Calendar,
  LineChart,
  Building2,
  Users,
  FileText,
  Newspaper,
  Layers,
  GitCompare,
  ChevronRight
} from 'lucide-react'

interface RelatedLinksProps {
  ticker: string
  currentPage: string
  companyName?: string
  sector?: string
  industry?: string
}

// Sector to peer mapping for intelligent cross-linking
const SECTOR_PEERS: Record<string, string[]> = {
  'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'CRM', 'ADBE', 'ORCL', 'INTC'],
  'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'BMY', 'AMGN'],
  'Financial Services': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'AXP', 'V', 'MA'],
  'Financials': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'AXP', 'V', 'MA'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'BKNG', 'CMG'],
  'Consumer Defensive': ['WMT', 'PG', 'KO', 'PEP', 'COST', 'PM', 'MO', 'CL', 'KMB', 'GIS'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL'],
  'Industrials': ['UNP', 'CAT', 'BA', 'HON', 'RTX', 'GE', 'LMT', 'DE', 'UPS', 'FDX'],
  'Communication Services': ['GOOGL', 'META', 'NFLX', 'DIS', 'VZ', 'T', 'TMUS', 'CMCSA', 'EA', 'TTWO'],
  'Real Estate': ['PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'AVB'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'WEC'],
  'Materials': ['LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'DD', 'DOW', 'NUE', 'VMC'],
}

// Get sector prediction page slug
function getSectorSlug(sector?: string): string | null {
  if (!sector) return null
  const sectorMappings: Record<string, string> = {
    'Technology': 'technology',
    'Healthcare': 'healthcare',
    'Financial Services': 'financials',
    'Financials': 'financials',
    'Consumer Cyclical': 'consumer-discretionary',
    'Consumer Discretionary': 'consumer-discretionary',
    'Consumer Defensive': 'consumer-staples',
    'Consumer Staples': 'consumer-staples',
    'Energy': 'energy',
    'Industrials': 'industrials',
    'Communication Services': 'communication-services',
    'Real Estate': 'real-estate',
    'Utilities': 'utilities',
    'Materials': 'materials',
    'Basic Materials': 'materials',
  }
  return sectorMappings[sector] || null
}

export function RelatedLinks({ ticker, currentPage, companyName, sector, industry }: RelatedLinksProps) {
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const relatedStocks = getRelatedStocks(symbol)
  const comparisons = getComparisonPairs(symbol)
  const name = companyName || symbol
  const sectorSlug = getSectorSlug(sector)

  // Get sector peers for cross-linking
  const sectorPeers = sector ? (SECTOR_PEERS[sector] || []).filter(s => s !== symbol).slice(0, 8) : []

  // Top stock predictions for discovery
  const topPredictionStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'].filter(
    stock => stock !== symbol
  )

  // All analysis pages for this stock - comprehensive internal linking
  const allAnalysisLinks = [
    { href: `/stock/${symbol}`, label: `${symbol} Stock`, icon: TrendingUp, current: currentPage === 'stock' },
    { href: `/prediction/${symbol.toLowerCase()}`, label: `${symbol} Price Prediction`, icon: Target, current: currentPage === 'prediction' },
    { href: `/should-i-buy/${symbol.toLowerCase()}`, label: `Should I Buy ${symbol}?`, icon: Scale, current: currentPage === 'should-i-buy' },
    { href: `/forecast/${symbol.toLowerCase()}`, label: `${symbol} Stock Forecast`, icon: LineChart, current: currentPage === 'forecast' },
    { href: `/earnings/${symbol.toLowerCase()}`, label: `${symbol} Earnings Date`, icon: Calendar, current: currentPage === 'earnings' },
    { href: `/price/${symbol.toLowerCase()}`, label: `${symbol} Stock Price`, icon: DollarSign, current: currentPage === 'price' },
    { href: `/analysis/${symbol.toLowerCase()}/valuation`, label: `${symbol} Valuation`, icon: PieChart, current: currentPage === 'valuation' },
    { href: `/analysis/${symbol.toLowerCase()}/growth`, label: `${symbol} Growth Analysis`, icon: Activity, current: currentPage === 'growth' },
    { href: `/analysis/${symbol.toLowerCase()}/health`, label: `${symbol} Financial Health`, icon: Heart, current: currentPage === 'health' },
    { href: `/analysis/${symbol.toLowerCase()}/dividend`, label: `${symbol} Dividend`, icon: DollarSign, current: currentPage === 'dividend' },
    { href: `/financials/${symbol.toLowerCase()}`, label: `${symbol} Financials`, icon: FileText, current: currentPage === 'financials' },
    { href: `/news/${symbol.toLowerCase()}`, label: `${symbol} News`, icon: Newspaper, current: currentPage === 'news' },
    { href: `/analyst/${symbol.toLowerCase()}`, label: `${symbol} Analyst Ratings`, icon: Users, current: currentPage === 'analyst' },
    { href: `/insider/${symbol.toLowerCase()}`, label: `${symbol} Insider Trading`, icon: Building2, current: currentPage === 'insider' },
    { href: `/institutional/${symbol.toLowerCase()}`, label: `${symbol} Institutional Ownership`, icon: Layers, current: currentPage === 'institutional' },
    { href: `/competitors/${symbol.toLowerCase()}`, label: `${symbol} Competitors`, icon: GitCompare, current: currentPage === 'competitors' },
  ]

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
    },
    {
      href: `/forecast/${symbol.toLowerCase()}`,
      icon: TrendingUp,
      title: 'Stock Forecast',
      description: `12-month price forecast and analyst targets`,
      color: 'text-cyan-500'
    },
    {
      href: `/earnings/${symbol.toLowerCase()}`,
      icon: Calendar,
      title: 'Earnings Date',
      description: `Next earnings date and historical results`,
      color: 'text-yellow-500'
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

      {/* All Analysis Pages - Complete internal linking web */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Complete {symbol} Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {allAnalysisLinks.filter(link => !link.current).slice(0, 12).map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors group"
              >
                <Icon size={14} className="text-muted-foreground group-hover:text-green-500" />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sector Hub Link */}
      {sectorSlug && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">{sector} Sector</h4>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/sectors/${sectorSlug}`}
              className="px-4 py-2 bg-green-600/20 text-green-500 rounded-lg text-sm hover:bg-green-600/30 transition-colors inline-flex items-center gap-2"
            >
              <Layers size={16} />
              {sector} Stocks Overview
            </Link>
            <Link
              href={`/predictions/${sectorSlug}`}
              className="px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
            >
              <Target size={16} />
              {sector} Predictions {currentYear}
            </Link>
          </div>
        </div>
      )}

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

      {/* Sector Peers - Cross-linking with same sector stocks */}
      {sectorPeers.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Other {sector} Stocks</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sectorPeers.slice(0, 8).map((stock) => (
              <Link
                key={stock}
                href={`/stock/${stock}`}
                className="bg-card p-3 rounded-lg border border-border hover:border-green-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-green-500">{stock}</p>
                    <p className="text-xs text-muted-foreground">View Analysis</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-green-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
    { slug: 'spy-vs-qqq', label: 'SPY vs QQQ' },
    { slug: 'ko-vs-pep', label: 'KO vs PEP' },
  ]

  // Get the tickers from the current comparison for related links
  const match = currentSlug.match(/^([a-z0-9.]+)-vs-([a-z0-9.]+)$/i)
  const ticker1 = match?.[1]?.toUpperCase() || ''
  const ticker2 = match?.[2]?.toUpperCase() || ''

  return (
    <section className="mt-12 border-t border-border pt-8">
      {/* Individual Stock Analysis Links */}
      {ticker1 && ticker2 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Analyze Each Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock 1 Links */}
            <div className="bg-card p-4 rounded-lg border border-green-500/30">
              <h4 className="font-bold text-green-500 mb-3">{ticker1} Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/stock/${ticker1.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker1} Overview
                </Link>
                <Link href={`/prediction/${ticker1.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker1} Prediction
                </Link>
                <Link href={`/should-i-buy/${ticker1.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  Should I Buy {ticker1}?
                </Link>
                <Link href={`/earnings/${ticker1.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker1} Earnings
                </Link>
              </div>
            </div>
            {/* Stock 2 Links */}
            <div className="bg-card p-4 rounded-lg border border-blue-500/30">
              <h4 className="font-bold text-blue-500 mb-3">{ticker2} Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/stock/${ticker2.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker2} Overview
                </Link>
                <Link href={`/prediction/${ticker2.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker2} Prediction
                </Link>
                <Link href={`/should-i-buy/${ticker2.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  Should I Buy {ticker2}?
                </Link>
                <Link href={`/earnings/${ticker2.toLowerCase()}`} className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80">
                  {ticker2} Earnings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Comparisons for These Stocks */}
      {ticker1 && ticker2 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">More Comparisons</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getRelatedStocks(ticker1).filter(s => s !== ticker2).slice(0, 4).map(stock => (
              <Link
                key={`${ticker1}-${stock}`}
                href={`/compare/${ticker1.toLowerCase()}-vs-${stock.toLowerCase()}`}
                className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80 text-center"
              >
                {ticker1} vs {stock}
              </Link>
            ))}
            {getRelatedStocks(ticker2).filter(s => s !== ticker1).slice(0, 4).map(stock => (
              <Link
                key={`${ticker2}-${stock}`}
                href={`/compare/${ticker2.toLowerCase()}-vs-${stock.toLowerCase()}`}
                className="text-sm px-3 py-2 bg-secondary rounded hover:bg-secondary/80 text-center"
              >
                {ticker2} vs {stock}
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* Cross-links to prediction pages */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Price Predictions</h4>
        <div className="flex flex-wrap gap-2">
          {[...STOCK_CATEGORIES.MEGA_CAP.slice(0, 8)].map(stock => (
            <Link
              key={stock}
              href={`/prediction/${stock.toLowerCase()}`}
              className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {stock} Prediction
            </Link>
          ))}
        </div>
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
    { key: 'consumer-discretionary', label: 'Consumer Discretionary' },
    { key: 'industrials', label: 'Industrials Sector' },
  ]

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h3 className="text-lg font-bold mb-4">Explore Other Categories</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories
          .filter((cat) => cat.key !== currentCategory.toLowerCase())
          .slice(0, 15)
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
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Sector Predictions */}
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Sector Predictions</h4>
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => (
          <Link
            key={`pred-${sector.key}`}
            href={`/predictions/${sector.key}`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            {sector.label.replace(' Sector', '')} Predictions
          </Link>
        ))}
      </div>
    </section>
  )
}

// Compare With CTA - Can be embedded anywhere
export function CompareWithCTA({
  ticker,
  companyName,
  peers = []
}: {
  ticker: string
  companyName?: string
  peers?: string[]
}) {
  const symbol = ticker.toUpperCase()
  const relatedStocks = peers.length > 0 ? peers : getRelatedStocks(symbol)

  return (
    <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="text-blue-500" size={24} />
        <h3 className="text-lg font-bold">Compare {symbol}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        See how {companyName || symbol} stacks up against competitors
      </p>
      <div className="flex flex-wrap gap-2">
        {relatedStocks.slice(0, 4).map(stock => (
          <Link
            key={stock}
            href={`/compare/${symbol.toLowerCase()}-vs-${stock.toLowerCase()}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-blue-500/50 transition-colors group"
          >
            <span className="font-medium">{symbol} vs {stock}</span>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}

// Breadcrumb Navigation Component
export function StockBreadcrumbs({
  items
}: {
  items: { name: string; href?: string }[]
}) {
  return (
    <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-foreground">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
