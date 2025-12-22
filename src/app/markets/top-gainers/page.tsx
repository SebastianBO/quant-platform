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
  title: 'Top Gaining Stocks Today - Biggest Stock Gainers | Real-Time Data',
  description: 'Track today\'s top gaining stocks with the biggest percentage increases. View real-time price movements, volume data, and trading signals for the best performing stocks.',
  keywords: ['top gainers', 'biggest gainers', 'best performing stocks', 'stocks up today', 'stock gainers', 'winning stocks'],
  openGraph: {
    title: 'Top Gaining Stocks Today - Live Market Data',
    description: 'Real-time data on stocks with the biggest percentage gains.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/top-gainers',
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

async function getTopGainers(): Promise<StockMover[]> {
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
    return data.gainers || []
  } catch (error) {
    console.error('Error fetching top gainers:', error)
    return []
  }
}

const faqs = [
  {
    question: 'What are top gaining stocks?',
    answer: 'Top gaining stocks are those with the largest percentage price increases during a given period, typically measured daily. These stocks are experiencing strong upward momentum and often reflect positive news, earnings beats, or favorable market conditions.',
  },
  {
    question: 'Should I buy stocks that are up the most today?',
    answer: 'Not necessarily. While top gainers show strong momentum, they may also be overbought or driven by short-term hype. Always research the reason behind the gain, analyze fundamentals, and consider your investment strategy before buying.',
  },
  {
    question: 'What causes stocks to be top gainers?',
    answer: 'Common catalysts include better-than-expected earnings, positive analyst upgrades, major product announcements, favorable regulatory news, industry tailwinds, or technical breakouts. Understanding the catalyst helps assess if gains are sustainable.',
  },
  {
    question: 'How do you identify sustainable gainers?',
    answer: 'Look for gains accompanied by high volume (confirms strong interest), solid fundamentals (revenue growth, profitability), clear catalysts (not just hype), and reasonable valuation multiples. Our AI analysis helps evaluate sustainability.',
  },
  {
    question: 'What is the "volume ratio" indicator?',
    answer: 'Volume ratio compares today\'s trading volume to the stock\'s average daily volume. A ratio above 2-3x indicates unusual activity. High volume with price gains suggests strong conviction and can signal continuation of the trend.',
  },
]

export default async function TopGainersPage() {
  const stocks = await getTopGainers()
  const pageUrl = `${SITE_URL}/markets/top-gainers`

  // Calculate average gain
  const avgGain =
    stocks.length > 0
      ? (stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length).toFixed(2)
      : '0.00'

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: 'Top Gainers', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Top Gaining Stocks Today - Biggest Stock Gainers',
    description: 'Real-time data on stocks with the biggest percentage gains.',
    url: pageUrl,
    keywords: ['top gainers', 'biggest gainers', 'best performing stocks'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Top Gaining Stocks Today',
    description: 'Stocks with the biggest percentage increases',
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
            <span>Top Gainers</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Top Gaining Stocks Today</h1>
            <p className="text-xl text-muted-foreground">
              Stocks with the biggest percentage gains. Real-time data with
              proprietary scoring.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Top Gainers</p>
              <p className="text-2xl font-bold text-green-500">{stocks.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average Gain</p>
              <p className="text-2xl font-bold text-green-500">+{avgGain}%</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Top Performer</p>
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
            <h2 className="text-2xl font-bold mb-6">Today's Best Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock, index) => (
                <Link
                  key={stock.symbol}
                  href={`/dashboard?ticker=${stock.symbol}`}
                  className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg group relative overflow-hidden"
                >
                  {/* Rank badge */}
                  {index < 3 && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
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
                      <p className="text-sm font-medium text-green-500">
                        +{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-medium text-green-500">
                        +${stock.change.toFixed(2)}
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
                            ? 'text-green-500'
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

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Understanding Top Gainers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Common Catalysts for Gains
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">📊</span>
                    <span>
                      <strong>Earnings Beats:</strong> Revenue and profit
                      exceeding expectations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">📈</span>
                    <span>
                      <strong>Analyst Upgrades:</strong> Price target increases
                      or rating improvements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">🚀</span>
                    <span>
                      <strong>Product Launches:</strong> Successful new
                      products or services
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">🤝</span>
                    <span>
                      <strong>M&A Activity:</strong> Acquisition announcements
                      or merger proposals
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">⚖️</span>
                    <span>
                      <strong>Regulatory Wins:</strong> FDA approvals,
                      favorable rulings
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Trading Top Gainers Wisely
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Research the catalyst - understand why it's gaining
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Check volume - high volume confirms strong interest
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Avoid FOMO - don't chase without proper analysis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Set stop losses - protect against momentum reversal
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Use our AI analysis for fundamental validation
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
              Deep Dive into Top Gainers
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered analysis to evaluate if today's gainers have
              sustainable momentum or if you're chasing the top.
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
