import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Top Losing Stocks Today - Biggest Stock Losers | Real-Time Data',
  description: 'Track today\'s top losing stocks with the biggest percentage declines. View real-time price movements, volume data, and identify potential value opportunities or risks.',
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
    answer: 'Top losing stocks are those with the largest percentage price decreases during a given period, typically measured daily. These stocks are experiencing downward momentum and often reflect negative news, earnings misses, or unfavorable market conditions.',
  },
  {
    question: 'Should I buy stocks that are down the most today?',
    answer: 'It depends. While some losers represent oversold value opportunities ("buy the dip"), others may have legitimate fundamental problems. Always research why the stock is declining, analyze the company\'s financials, and assess if the sell-off is justified before buying.',
  },
  {
    question: 'What causes stocks to be top losers?',
    answer: 'Common catalysts include disappointing earnings, negative analyst downgrades, product failures or recalls, regulatory issues, management scandals, industry headwinds, or technical breakdowns. Understanding the cause is crucial for determining if it\'s temporary or systemic.',
  },
  {
    question: 'How do I identify oversold stocks vs. falling knives?',
    answer: 'Oversold stocks have temporary setbacks with solid fundamentals intact - look for strong balance sheets, consistent revenue, and specific addressable issues. Falling knives have deteriorating fundamentals, structural problems, or existential threats. Our AI analysis helps distinguish between the two.',
  },
  {
    question: 'What is panic selling?',
    answer: 'Panic selling occurs when investors rush to exit positions, often due to fear rather than fundamental analysis. This can create oversold conditions with high volume. Stocks with volume ratios above 3x combined with sharp declines may indicate panic selling and potential reversal opportunities.',
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
      <main className="min-h-screen bg-background text-foreground">
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
              Stocks with the biggest percentage losses. Identify risks or find
              oversold opportunities.
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
              <p className="text-sm text-muted-foreground mb-1">
                Worst Performer
              </p>
              <p className="text-2xl font-bold">
                {stocks[0]?.symbol || 'N/A'}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Panic Sells</p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.volumeRatio > 3).length}
              </p>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Today's Biggest Decliners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock, index) => (
                <Link
                  key={stock.symbol}
                  href={`/dashboard?ticker=${stock.symbol}`}
                  className="bg-card p-5 rounded-lg border border-border hover:border-red-500/50 transition-all hover:shadow-lg group relative overflow-hidden"
                >
                  {/* Warning badge for large drops */}
                  {Math.abs(stock.changePercent) > 15 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Large Drop
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
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
                            className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded"
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
                  Common Causes of Declines
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">📉</span>
                    <span>
                      <strong>Earnings Misses:</strong> Revenue or profit below
                      expectations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⬇️</span>
                    <span>
                      <strong>Analyst Downgrades:</strong> Price target cuts or
                      rating reductions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span>
                      <strong>Product Issues:</strong> Recalls, failures, or
                      safety concerns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚖️</span>
                    <span>
                      <strong>Regulatory Problems:</strong> FDA rejections,
                      lawsuits, fines
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">📰</span>
                    <span>
                      <strong>Negative News:</strong> Management changes,
                      scandals, guidance cuts
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Evaluating Losers Safely
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Research the catalyst - understand WHY it's falling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Check fundamentals - balance sheet, debt levels, cash flow
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Assess if temporary - one-time issue vs. structural problem
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Watch for capitulation - extreme volume may signal bottom
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Use our AI analysis to evaluate recovery potential
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Risk Warning */}
          <section className="mb-12">
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-3 text-red-500">
                ⚠️ Important Risk Disclosure
              </h3>
              <p className="text-muted-foreground mb-3">
                Stocks on the top losers list are experiencing significant
                downward pressure. While some may represent value opportunities,
                others may continue declining due to fundamental issues.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Never catch a "falling knife" without proper research
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Use stop losses to protect capital if buying dips
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Consider dollar-cost averaging rather than lump sum purchases
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Monitor position size - don't overexpose to risky situations
                  </span>
                </li>
              </ul>
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
              Evaluate Losers with AI Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered fundamental analysis to distinguish between
              temporary setbacks and permanent value destruction.
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
    </>
  )
}
