import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Most Active Stocks Today - Highest Volume Stocks | Real-Time Data',
  description: 'Track the most active stocks by volume today. View real-time trading data, price changes, and volume ratios for the highest volume stocks in the market.',
  keywords: ['most active stocks', 'highest volume stocks', 'stock volume', 'most traded stocks', 'volume leaders', 'active stocks today'],
  openGraph: {
    title: 'Most Active Stocks Today - Live Volume Data',
    description: 'Real-time data on the most actively traded stocks by volume.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/most-active',
  },
}

interface StockMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  volumeRatio: number
  signals: string[]
}

async function getMostActiveStocks(): Promise<StockMover[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/trending`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error('Failed to fetch trending data')
      return []
    }

    const data = await response.json()
    return data.trending || []
  } catch (error) {
    console.error('Error fetching most active stocks:', error)
    return []
  }
}

const faqs = [
  {
    question: 'What makes a stock "most active"?',
    answer: 'Most active stocks are those with the highest trading volume during a given period, typically measured over a single trading day. High volume indicates strong investor interest and can signal significant news, earnings reports, or major price movements.',
  },
  {
    question: 'Why is trading volume important?',
    answer: 'Trading volume is crucial because it indicates liquidity and market interest. High-volume stocks are easier to buy and sell without significantly affecting the price. Volume spikes often precede or accompany major price movements, making them valuable indicators for traders.',
  },
  {
    question: 'Should I invest in high-volume stocks?',
    answer: 'High volume alone isn\'t a reason to invest. However, most active stocks offer better liquidity, tighter spreads, and easier entry/exit. Always analyze fundamentals, technicals, and your investment goals before making decisions.',
  },
  {
    question: 'What is a good volume ratio?',
    answer: 'A volume ratio above 2x (twice the average daily volume) indicates unusual activity. Ratios above 5x are considered highly significant and often coincide with major news, earnings, or market events.',
  },
  {
    question: 'How often is most active stocks data updated?',
    answer: 'Our most active stocks data is updated in real-time during market hours, with approximately 1-minute refresh intervals to ensure you have access to the latest trading activity.',
  },
]

export default async function MostActivePage() {
  const stocks = await getMostActiveStocks()
  const pageUrl = `${SITE_URL}/markets/most-active`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: 'Most Active', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Most Active Stocks Today - Highest Volume Stocks',
    description: 'Real-time data on the most actively traded stocks by volume.',
    url: pageUrl,
    keywords: ['most active stocks', 'highest volume stocks', 'volume leaders'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Most Active Stocks Today',
    description: 'Stocks with the highest trading volume',
    url: pageUrl,
    items: stocks.slice(0, 20).map((stock, index) => ({
      name: stock.symbol,
      url: `${SITE_URL}/dashboard?ticker=${stock.symbol}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            articleSchema,
            itemListSchema,
            faqSchema,
          ]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <Link href="/markets" className="hover:text-foreground">
              Markets
            </Link>
            {' / '}
            <span>Most Active</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Most Active Stocks Today</h1>
            <p className="text-xl text-muted-foreground">
              Stocks with the highest trading volume. Updated in real-time during market hours.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Stocks</p>
              <p className="text-2xl font-bold">{stocks.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Volume Ratio</p>
              <p className="text-2xl font-bold">
                {stocks.length > 0
                  ? (
                      stocks.reduce((sum, s) => sum + s.volumeRatio, 0) /
                      stocks.length
                    ).toFixed(1)
                  : '0.0'}
                x
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Gainers</p>
              <p className="text-2xl font-bold text-green-500">
                {stocks.filter((s) => s.changePercent > 0).length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Losers</p>
              <p className="text-2xl font-bold text-red-500">
                {stocks.filter((s) => s.changePercent < 0).length}
              </p>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Live Volume Leaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock, index) => (
                <Link
                  key={stock.symbol}
                  href={`/dashboard?ticker=${stock.symbol}`}
                  className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                          {stock.symbol}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${stock.price.toFixed(2)}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          stock.changePercent >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">
                        {(stock.volume / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vol Ratio</span>
                      <span className="font-medium text-green-500">
                        {stock.volumeRatio.toFixed(1)}x
                      </span>
                    </div>
                    {stock.signals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stock.signals.slice(0, 2).map((signal, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Market Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Understanding Volume Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">What Drives High Volume?</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Earnings reports and guidance updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Major news events or product announcements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Analyst upgrades or downgrades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Institutional buying or selling activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Technical breakouts or breakdowns</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Trading Volume Tips</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Compare current volume to average daily volume</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Look for volume confirmation with price moves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Higher volume = better liquidity for trading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Volume spikes often precede trend changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Use volume analysis with other indicators</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Explore More Market Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📈</p>
                <p className="font-bold">Top Gainers</p>
              </Link>
              <Link
                href="/markets/top-losers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📉</p>
                <p className="font-bold">Top Losers</p>
              </Link>
              <Link
                href="/markets/52-week-high"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">🚀</p>
                <p className="font-bold">52-Week Highs</p>
              </Link>
              <Link
                href="/markets/52-week-low"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">🔻</p>
                <p className="font-bold">52-Week Lows</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Analyze Any Stock with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Get detailed fundamental analysis, DCF valuations, and AI-powered
              insights for stocks in our most active list.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Analysis
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
