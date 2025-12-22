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
  title: 'Top Losing Stocks Today - Biggest Stock Losers | Real-Time Data',
  description: 'Track today\'s top losing stocks with the biggest percentage declines. View real-time price movements, volume data, and trading signals for the worst performing stocks.',
  keywords: ['top losers', 'biggest losers', 'worst performing stocks', 'stocks down today', 'stock losers', 'declining stocks'],
  openGraph: {
    title: 'Top Losing Stocks Today - Live Market Data',
    description: 'Real-time data on stocks with the biggest percentage losses.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/top-losers',
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
  score: number
}

async function getTopLosers(): Promise<StockMover[]> {
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
    return data.losers || []
  } catch (error) {
    console.error('Error fetching top losers:', error)
    return []
  }
}

const faqs = [
  {
    question: 'What are top losing stocks?',
    answer: 'Top losing stocks are those with the largest percentage price declines during a given period, typically measured daily. These stocks are experiencing significant selling pressure often due to negative news, earnings misses, or unfavorable market conditions.',
  },
  {
    question: 'Should I buy stocks that are down the most today?',
    answer: 'Be cautious. While some declining stocks represent value opportunities ("catching a falling knife"), others are falling for good reasons like deteriorating fundamentals, competitive threats, or regulatory issues. Always research why a stock is declining before considering it.',
  },
  {
    question: 'What causes stocks to be top losers?',
    answer: 'Common catalysts include disappointing earnings, negative analyst downgrades, product failures, regulatory setbacks, legal issues, competitive threats, sector-wide selloffs, or general market downturns. Understanding the catalyst is crucial for assessing recovery potential.',
  },
  {
    question: 'Are stocks at their lows good buying opportunities?',
    answer: 'Sometimes, but not always. Stocks at lows may be oversold and present value opportunities, or they may be "value traps" with deteriorating fundamentals. Look for temporary setbacks in quality companies rather than structural problems. Our AI analysis helps identify genuine opportunities.',
  },
  {
    question: 'What is capitulation in declining stocks?',
    answer: 'Capitulation occurs when investors give up and sell in panic, often marking a bottom. Signs include extreme volume spikes, rapid price drops, and widespread negativity. However, timing capitulation is difficult - stocks can always fall further.',
  },
]

export default async function TopLosersPage() {
  const stocks = await getTopLosers()
  const pageUrl = `${SITE_URL}/markets/top-losers`

  // Calculate average loss
  const avgLoss =
    stocks.length > 0
      ? (stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length).toFixed(2)
      : '0.00'

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: 'Top Losers', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Top Losing Stocks Today - Biggest Stock Losers',
    description: 'Real-time data on stocks with the biggest percentage losses.',
    url: pageUrl,
    keywords: ['top losers', 'biggest losers', 'worst performing stocks'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Top Losing Stocks Today',
    description: 'Stocks with the biggest percentage decreases',
    url: pageUrl,
    items: stocks.slice(0, 15).map((stock, index) => ({
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
            <span>Top Losers</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Top Losing Stocks Today</h1>
            <p className="text-xl text-muted-foreground">
              Stocks with the biggest percentage losses. Real-time data with
              opportunity scoring.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Top Losers</p>
              <p className="text-2xl font-bold text-red-500">{stocks.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average Loss</p>
              <p className="text-2xl font-bold text-red-500">{avgLoss}%</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Worst Performer</p>
              <p className="text-2xl font-bold">
                {stocks[0]?.symbol || 'N/A'}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">High Volume</p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.volumeRatio > 2).length}
              </p>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Today's Worst Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock, index) => (
                <Link
                  key={stock.symbol}
                  href={`/dashboard?ticker=${stock.symbol}`}
                  className="bg-card p-5 rounded-lg border border-border hover:border-red-500/50 transition-all hover:shadow-lg group relative overflow-hidden"
                >
                  {/* Rank badge */}
                  {index < 3 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      #{index + 1}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {index >= 3 && (
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                        )}
                        <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">
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
                      <p className="text-sm font-medium text-red-500">
                        {stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-medium text-red-500">
                        ${stock.change.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">
                        {stock.volume >= 1000000
                          ? `${(stock.volume / 1000000).toFixed(1)}M`
                          : `${(stock.volume / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vol Ratio</span>
                      <span
                        className={`font-medium ${
                          stock.volumeRatio > 3
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {stock.volumeRatio.toFixed(1)}x
                      </span>
                    </div>
                    {stock.signals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stock.signals.slice(0, 2).map((signal, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded"
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

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Understanding Top Losers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-red-500">
                  Common Catalysts for Declines
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">📊</span>
                    <span>
                      <strong>Earnings Misses:</strong> Revenue or profit below
                      expectations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">📉</span>
                    <span>
                      <strong>Analyst Downgrades:</strong> Price target cuts or
                      rating downgrades
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span>
                      <strong>Product Failures:</strong> Recalls, failed trials,
                      or poor reception
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚖️</span>
                    <span>
                      <strong>Regulatory Issues:</strong> FDA rejections,
                      lawsuits, or fines
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">🔄</span>
                    <span>
                      <strong>Competitive Threats:</strong> Market share loss or
                      new competitors
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-yellow-500">
                  Evaluating Decline Opportunities
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>
                      Identify if decline is temporary or structural
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>
                      Check if fundamentals remain strong despite selloff
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>
                      Look for oversold conditions with quality companies
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>
                      Avoid catching falling knives without research
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>
                      Use our AI analysis to identify recovery candidates
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
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
                href="/markets/most-active"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📊</p>
                <p className="font-bold">Most Active</p>
              </Link>
              <Link
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📈</p>
                <p className="font-bold">Top Gainers</p>
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
              Analyze Declining Stocks
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered analysis to determine if today's losers are
              value opportunities or value traps. Get fundamental insights to
              make informed decisions.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Analyze Stocks with AI
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
