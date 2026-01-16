import Link from 'next/link'
import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Lician',
  description: 'The page you are looking for could not be found. Explore our stock analysis tools, market data, and investment research.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/404`,
  },
}

// Popular pages for internal linking (SEO value)
const popularPages = {
  'Research Tools': [
    { href: '/screener', label: 'Stock Screener', desc: 'Filter stocks by metrics' },
    { href: '/compare', label: 'Stock Comparison', desc: 'Compare any two stocks' },
    { href: '/analyst-ratings', label: 'Analyst Ratings', desc: 'Upgrades & downgrades' },
    { href: '/insider-trading', label: 'Insider Trading', desc: 'CEO & CFO transactions' },
  ],
  'Market Data': [
    { href: '/markets', label: 'Market Pulse', desc: 'Real-time market overview' },
    { href: '/markets/top-gainers', label: 'Top Gainers', desc: 'Best performing stocks' },
    { href: '/markets/top-losers', label: 'Top Losers', desc: 'Biggest decliners' },
    { href: '/earnings', label: 'Earnings Calendar', desc: 'Upcoming earnings dates' },
  ],
  'Asset Classes': [
    { href: '/etfs', label: 'ETFs', desc: 'Exchange-traded funds' },
    { href: '/bonds', label: 'Bonds & Treasury', desc: 'Fixed income data' },
    { href: '/commodities', label: 'Commodities', desc: 'Gold, oil, and more' },
    { href: '/crypto', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum prices' },
  ],
  'Learning': [
    { href: '/learn/how-to-invest', label: 'How to Invest', desc: 'Beginner guide' },
    { href: '/learn/stock-analysis', label: 'Stock Analysis', desc: 'Analysis fundamentals' },
    { href: '/learn/pe-ratio', label: 'P/E Ratio Guide', desc: 'Valuation metrics' },
    { href: '/learn/dcf-valuation', label: 'DCF Valuation', desc: 'Intrinsic value calculation' },
  ],
}

// Popular stock tickers for quick access
const popularStocks = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'META', name: 'Meta' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'JPM', name: 'JPMorgan' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Try searching for a stock or explore our popular pages below.
          </p>

          {/* Search CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              href="/screener"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Stock Screener
            </Link>
          </div>
        </div>

        {/* Popular Stocks Quick Links */}
        <section className="mb-12">
          <h3 className="text-lg font-semibold mb-4 text-center">Popular Stocks</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {popularStocks.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                <span className="text-primary">{stock.ticker}</span>
                <span className="text-muted-foreground">{stock.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Category Links Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(popularPages).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group block p-2 -mx-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {link.label}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {link.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Popular Comparisons */}
        <section className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 text-center">Popular Stock Comparisons</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { slug: 'aapl-vs-msft', label: 'AAPL vs MSFT' },
              { slug: 'nvda-vs-amd', label: 'NVDA vs AMD' },
              { slug: 'googl-vs-meta', label: 'GOOGL vs META' },
              { slug: 'tsla-vs-rivn', label: 'TSLA vs RIVN' },
              { slug: 'amzn-vs-wmt', label: 'AMZN vs WMT' },
              { slug: 'ko-vs-pep', label: 'KO vs PEP' },
            ].map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary text-sm transition-colors"
              >
                {comparison.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
