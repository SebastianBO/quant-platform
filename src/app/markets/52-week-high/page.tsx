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
  title: '52-Week High Stocks - Stocks at 52-Week Highs | Breakout Opportunities',
  description: 'Track stocks hitting 52-week highs today. Identify breakout opportunities, momentum stocks, and companies reaching new price milestones with real-time data.',
  keywords: ['52 week high', '52 week high stocks', 'breakout stocks', 'all time high stocks', 'momentum stocks', 'stocks at highs'],
  openGraph: {
    title: '52-Week High Stocks - Live Breakout Data',
    description: 'Real-time tracking of stocks hitting 52-week price highs.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/52-week-high',
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

async function get52WeekHighStocks(): Promise<StockMover[]> {
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

    // Combine all movers and filter for 52-week high signals
    const allStocks = [
      ...(data.gainers || []),
      ...(data.trending || []),
    ]

    // Filter for stocks with 52wk high signal and remove duplicates
    const uniqueStocks = new Map<string, StockMover>()
    allStocks
      .filter(stock => stock.signals?.some((s: string) => s.toLowerCase().includes('52wk high')))
      .forEach(stock => {
        if (!uniqueStocks.has(stock.symbol)) {
          uniqueStocks.set(stock.symbol, stock)
        }
      })

    return Array.from(uniqueStocks.values())
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 20)
  } catch (error) {
    console.error('Error fetching 52-week high stocks:', error)
    return []
  }
}

const faqs = [
  {
    question: 'What does it mean when a stock hits a 52-week high?',
    answer: 'A 52-week high means the stock is trading at its highest price point in the past year (252 trading days). This indicates strong momentum and can signal continued upward movement, though it can also indicate overbought conditions.',
  },
  {
    question: 'Should I buy stocks at 52-week highs?',
    answer: 'Contrary to intuition, many successful traders buy stocks making new highs. Research shows that stocks hitting 52-week highs often continue higher due to momentum. However, always verify the fundamentals and ensure there\'s a valid catalyst driving the move.',
  },
  {
    question: 'What causes stocks to reach 52-week highs?',
    answer: 'Common catalysts include strong earnings growth, positive industry trends, product innovations, market share gains, analyst upgrades, or favorable macroeconomic conditions. Technical breakouts above resistance also attract momentum traders.',
  },
  {
    question: 'Are 52-week highs bullish or bearish?',
    answer: 'Generally bullish. Studies show stocks making new 52-week highs have a higher probability of continuing upward than reversing. The "strength begets strength" principle often holds, especially when accompanied by strong fundamentals and high volume.',
  },
  {
    question: 'How do I trade 52-week high breakouts?',
    answer: 'Look for: 1) High volume confirmation (2x+ average volume), 2) Strong fundamentals supporting the move, 3) Clear catalyst or reason for breakout, 4) Set stop loss below recent support. Our AI analysis helps validate if the breakout is sustainable.',
  },
]

export default async function FiftyTwoWeekHighPage() {
  const stocks = await get52WeekHighStocks()
  const pageUrl = `${SITE_URL}/markets/52-week-high`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: '52-Week Highs', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stocks at 52-Week Highs - Breakout Opportunities',
    description: 'Real-time tracking of stocks hitting 52-week price highs.',
    url: pageUrl,
    keywords: ['52 week high', 'breakout stocks', 'momentum stocks'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Stocks at 52-Week Highs',
    description: 'Stocks trading at or near their 52-week highs',
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
            <span>52-Week Highs</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Stocks at 52-Week Highs
            </h1>
            <p className="text-xl text-muted-foreground">
              Track stocks breaking out to new 52-week highs. Identify momentum
              and potential continuation opportunities.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Stocks at Highs
              </p>
              <p className="text-2xl font-bold text-green-500">
                {stocks.length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Change</p>
              <p className="text-2xl font-bold text-green-500">
                +
                {stocks.length > 0
                  ? (
                      stocks.reduce((sum, s) => sum + s.changePercent, 0) /
                      stocks.length
                    ).toFixed(2)
                  : '0.00'}
                %
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                High Volume Breakouts
              </p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.volumeRatio > 2).length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Strong Momentum
              </p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.changePercent > 5).length}
              </p>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Current Breakouts</h2>
            {stocks.length === 0 ? (
              <div className="bg-card p-8 rounded-xl border border-border text-center">
                <p className="text-muted-foreground">
                  No stocks are currently at 52-week highs in today's movers.
                  Check back during market hours for live updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock, index) => (
                  <Link
                    key={stock.symbol}
                    href={`/dashboard?ticker=${stock.symbol}`}
                    className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg group relative overflow-hidden"
                  >
                    {/* Breakout badge */}
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      52W High
                    </div>

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
                            stock.volumeRatio > 2
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {stock.volumeRatio.toFixed(1)}x
                        </span>
                      </div>
                      {stock.signals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stock.signals
                            .filter(s => !s.includes('52wk'))
                            .slice(0, 2)
                            .map((signal, i) => (
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
            )}
          </section>

          {/* Strategy Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Trading 52-Week High Breakouts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Why 52-Week Highs Matter
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">📊</span>
                    <span>
                      <strong>Momentum Signal:</strong> Stocks at highs often
                      continue higher
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">🎯</span>
                    <span>
                      <strong>No Overhead Resistance:</strong> No prior sellers
                      waiting to exit
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">💰</span>
                    <span>
                      <strong>Institutional Interest:</strong> Big money often
                      follows breakouts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">📰</span>
                    <span>
                      <strong>Media Attention:</strong> Attracts new buyers and
                      analysts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">🔄</span>
                    <span>
                      <strong>Self-Reinforcing:</strong> Success attracts more
                      buyers
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Breakout Trading Checklist
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Confirm with high volume (2x+ average)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Verify strong fundamentals support the move</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Identify the catalyst driving the breakout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Check for clean technical chart pattern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Set stop loss 5-8% below breakout level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Scale into position vs. all-in immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Famous Breakouts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Historical 52-Week High Success Stories
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">
                Many of the biggest winners in market history spent extended
                periods making new 52-week highs:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">NVDA (2022-2024)</p>
                  <p className="text-sm text-muted-foreground">
                    Made 100+ new highs during AI boom, up 10x from 2022 lows
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">TSLA (2019-2021)</p>
                  <p className="text-sm text-muted-foreground">
                    Constant new highs during EV revolution, up 20x
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">AAPL (2009-2012)</p>
                  <p className="text-sm text-muted-foreground">
                    iPhone era breakouts led to 500%+ gains
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">AMZN (2016-2020)</p>
                  <p className="text-sm text-muted-foreground">
                    Cloud and e-commerce dominance drove 400%+ returns
                  </p>
                </div>
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
                href="/markets/top-losers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📉</p>
                <p className="font-bold">Top Losers</p>
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
              Validate Breakouts with AI Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered fundamental analysis to evaluate if 52-week
              high breakouts have sustainable momentum or are overextended.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Analyze Breakouts with AI
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
