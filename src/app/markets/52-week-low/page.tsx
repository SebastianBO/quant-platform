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
  title: '52-Week Low Stocks - Stocks at 52-Week Lows | Value Opportunities',
  description: 'Track stocks hitting 52-week lows today. Identify potential value opportunities, oversold conditions, and stocks facing challenges with real-time data.',
  keywords: ['52 week low', '52 week low stocks', 'oversold stocks', 'value stocks', 'stocks at lows', 'beaten down stocks'],
  openGraph: {
    title: '52-Week Low Stocks - Live Value Opportunity Tracker',
    description: 'Real-time tracking of stocks hitting 52-week price lows.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/52-week-low',
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

async function get52WeekLowStocks(): Promise<StockMover[]> {
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

    // Combine all movers and filter for 52-week low signals
    const allStocks = [
      ...(data.losers || []),
      ...(data.trending || []),
    ]

    // Filter for stocks with 52wk low signal and remove duplicates
    const uniqueStocks = new Map<string, StockMover>()
    allStocks
      .filter(stock => stock.signals?.some((s: string) => s.toLowerCase().includes('52wk low')))
      .forEach(stock => {
        if (!uniqueStocks.has(stock.symbol)) {
          uniqueStocks.set(stock.symbol, stock)
        }
      })

    return Array.from(uniqueStocks.values())
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 20)
  } catch (error) {
    console.error('Error fetching 52-week low stocks:', error)
    return []
  }
}

const faqs = [
  {
    question: 'What does it mean when a stock hits a 52-week low?',
    answer: 'A 52-week low means the stock is trading at its lowest price point in the past year (252 trading days). This can indicate temporary oversold conditions and value opportunities, or signal fundamental problems that may persist.',
  },
  {
    question: 'Should I buy stocks at 52-week lows?',
    answer: 'It depends. While 52-week lows can present value opportunities ("buy low"), you must understand WHY the stock is at lows. Some represent temporary setbacks (good opportunities), while others reflect permanent impairment (value traps). Always research the catalyst and fundamentals.',
  },
  {
    question: 'What causes stocks to reach 52-week lows?',
    answer: 'Common causes include earnings disappointments, declining revenue/margins, industry headwinds, regulatory issues, management problems, competitive threats, or macroeconomic factors. Understanding the root cause is critical for assessing recovery potential.',
  },
  {
    question: 'How do I identify value opportunities vs. value traps?',
    answer: 'Value opportunities have: temporary issues, strong balance sheets, solid business models, and addressable problems. Value traps have: deteriorating fundamentals, structural challenges, heavy debt, and existential threats. Our AI analysis helps distinguish between them.',
  },
  {
    question: 'What is capitulation in stocks at 52-week lows?',
    answer: 'Capitulation is when panic selling reaches extremes, often marking a bottom. Signs include: extremely high volume (5x+), RSI below 20, insider buying, and sentiment at maximum pessimism. These can signal potential reversals.',
  },
]

export default async function FiftyTwoWeekLowPage() {
  const stocks = await get52WeekLowStocks()
  const pageUrl = `${SITE_URL}/markets/52-week-low`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: '52-Week Lows', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stocks at 52-Week Lows - Value Opportunities & Risks',
    description: 'Real-time tracking of stocks hitting 52-week price lows.',
    url: pageUrl,
    keywords: ['52 week low', 'oversold stocks', 'value opportunities'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Stocks at 52-Week Lows',
    description: 'Stocks trading at or near their 52-week lows',
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
            <span>52-Week Lows</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Stocks at 52-Week Lows</h1>
            <p className="text-xl text-muted-foreground">
              Track stocks hitting 52-week lows. Find potential value
              opportunities or identify risks in your portfolio.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Stocks at Lows</p>
              <p className="text-2xl font-bold text-red-500">{stocks.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Decline</p>
              <p className="text-2xl font-bold text-red-500">
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
                High Volume Sells
              </p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.volumeRatio > 2).length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Large Declines
              </p>
              <p className="text-2xl font-bold">
                {stocks.filter((s) => s.changePercent < -10).length}
              </p>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Stocks Under Pressure</h2>
            {stocks.length === 0 ? (
              <div className="bg-card p-8 rounded-xl border border-border text-center">
                <p className="text-muted-foreground">
                  No stocks are currently at 52-week lows in today's movers.
                  Check back during market hours for live updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock, index) => (
                  <Link
                    key={stock.symbol}
                    href={`/dashboard?ticker=${stock.symbol}`}
                    className="bg-card p-5 rounded-lg border border-border hover:border-yellow-500/50 transition-all hover:shadow-lg group relative overflow-hidden"
                  >
                    {/* Warning badge */}
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      52W Low
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                          <h3 className="text-xl font-bold group-hover:text-yellow-500 transition-colors">
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
                            stock.changePercent < 0
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change</span>
                        <span
                          className={`font-medium ${
                            stock.change < 0 ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {stock.change >= 0 ? '+' : ''}$
                          {stock.change.toFixed(2)}
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
                          {stock.signals
                            .filter(s => !s.includes('52wk'))
                            .slice(0, 2)
                            .map((signal, i) => (
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
            )}
          </section>

          {/* Analysis Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Evaluating 52-Week Low Stocks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  Signs of Value Opportunity
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Temporary Issue:</strong> Specific, addressable
                      problem
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Strong Balance Sheet:</strong> Low debt, ample cash
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Solid Business Model:</strong> Core operations
                      intact
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Insider Buying:</strong> Management purchasing
                      shares
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Oversold Technicals:</strong> RSI &lt; 30, extreme
                      pessimism
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      <strong>Industry Leader:</strong> Still competitive in
                      sector
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-red-500">
                  Red Flags (Value Traps)
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>Structural Problems:</strong> Business model under
                      threat
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>Declining Revenue:</strong> Consistent top-line
                      deterioration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>High Debt Load:</strong> Unsustainable leverage
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>Industry Decline:</strong> Secular headwinds
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>Management Issues:</strong> Scandals, departures,
                      incompetence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>
                      <strong>Competitive Disruption:</strong> Losing market
                      share permanently
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contrarian Investing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Contrarian Investing in 52-Week Lows
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">
                Some of history's greatest investments were made by buying
                quality companies at 52-week lows:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">
                    AAPL (Dec 2008)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hit 52W low at $12. Financial crisis panic. Up 30x since.
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">
                    NFLX (Oct 2012)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Qwikster disaster, hit $8. Streaming pivot paid off. Up 75x.
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">
                    AMZN (Sept 2001)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dot-com crash low at $6. Core business strong. Up 300x.
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold text-green-500 mb-1">
                    DIS (March 2020)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    COVID panic, parks closed. Disney+ momentum. Up 3x.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                <strong>Key lesson:</strong> Temporary problems in quality
                companies create opportunities. Permanent problems create losses.
              </p>
            </div>
          </section>

          {/* Risk Warning */}
          <section className="mb-12">
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-3 text-yellow-500">
                ⚠️ Important: Catching Falling Knives
              </h3>
              <p className="text-muted-foreground mb-3">
                The saying "don't catch a falling knife" exists for a reason.
                Stocks at 52-week lows can keep falling if fundamental problems
                persist.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Wait for price stabilization before buying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Use small position sizes to test the waters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Set strict stop losses (10-15% maximum)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Dollar-cost average over time vs. all-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>
                    Research thoroughly with our AI fundamental analysis
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
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Evaluate 52-Week Lows with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered fundamental analysis to identify true value
              opportunities and avoid value traps among stocks at 52-week lows.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Analyze Value Opportunities
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
