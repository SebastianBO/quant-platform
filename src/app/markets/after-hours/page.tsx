import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'After Hours Trading Today - Stock Prices & Movers After Market Close',
  description: 'Track after hours stock prices and movers from 4 PM - 8 PM ET. Get real-time after hours trading data and extended hours quotes with AI-powered analysis.',
  keywords: [
    'after hours trading',
    'after hours movers',
    'after hours stock prices',
    'extended hours trading',
    'after market trading',
    'after hours quotes',
    'post market trading',
    'after hours stocks',
    'after market hours',
    'extended trading hours',
    'after hours volume',
    'after hours gainers',
  ],
  openGraph: {
    title: 'After Hours Trading & Stock Movers Today',
    description: 'Real-time after hours trading data and stock prices after the market closes.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/after-hours',
  },
}

const faqs = [
  {
    question: 'What are after hours trading hours?',
    answer: 'After hours trading occurs from 4:00 PM to 8:00 PM Eastern Time (ET), immediately after the regular market closes at 4:00 PM. Some electronic communication networks (ECNs) may offer extended hours until 8:00 PM or later, but liquidity decreases significantly after 6:00 PM ET. Most retail brokers provide after hours trading access until 8:00 PM ET.',
  },
  {
    question: 'Can I trade stocks after hours?',
    answer: 'Yes, most major online brokers including TD Ameritrade, E*TRADE, Fidelity, Charles Schwab, Interactive Brokers, and Robinhood offer after hours trading. You typically need to enable extended hours trading in your account settings. After hours trading is restricted to limit orders only, and you may experience lower liquidity and wider bid-ask spreads compared to regular trading hours.',
  },
  {
    question: 'Why do stocks move in after hours trading?',
    answer: 'Stocks move after hours primarily due to earnings reports released after the market closes (typically between 4:00-5:30 PM ET), corporate announcements and press releases, FDA approvals or regulatory decisions, analyst upgrades or downgrades, breaking news events, and reactions to economic data or Federal Reserve announcements. After hours movements often set the tone for the next trading day.',
  },
  {
    question: 'What is the difference between after hours and premarket trading?',
    answer: 'After hours trading occurs after the market closes (4:00 PM - 8:00 PM ET), while premarket trading happens before the market opens (4:00 AM - 9:30 AM ET). Both are extended hours sessions with reduced liquidity and wider spreads. After hours often reacts to earnings released post-market and closing bell events, while premarket responds to overnight news and morning announcements.',
  },
  {
    question: 'Are after hours stock prices reliable?',
    answer: 'After hours prices provide valuable insights but should be interpreted with caution. Lower trading volume means prices can be more volatile and may not reflect the next day\'s opening price. Large gaps between after hours and next-day opening prices are common. Use after hours data to gauge initial market reaction to news, but verify trends with regular hours trading volume and price action.',
  },
  {
    question: 'What are after hours movers?',
    answer: 'After hours movers are stocks experiencing significant price changes or unusual trading volume during extended hours trading (4:00 PM - 8:00 PM ET). These stocks typically move on earnings releases, breaking news, or major corporate announcements. After hours movers often continue their momentum into premarket and regular trading hours the next day, making them important indicators for active traders.',
  },
  {
    question: 'Should I buy stocks in after hours trading?',
    answer: 'Buying stocks after hours requires careful consideration. While you can capitalize on immediate reactions to earnings or news, risks include lower liquidity leading to poor execution prices, wider bid-ask spreads increasing trading costs, higher volatility causing rapid price swings, and potential price reversals when regular trading resumes. Only trade after hours if you have a clear catalyst-based thesis and use limit orders to control execution prices.',
  },
  {
    question: 'What are the risks of after hours trading?',
    answer: 'After hours trading carries several unique risks: significantly reduced liquidity (often 10-20% of regular hours volume), wider bid-ask spreads that increase trading costs, higher volatility with potential for rapid price swings, limited order types (typically only limit orders), increased slippage on larger orders, possibility of price gaps at the next day\'s open, and limited participation from institutional investors. Only experienced traders should actively trade during after hours.',
  },
  {
    question: 'How do I find after hours movers and stock prices?',
    answer: 'You can find after hours movers through financial platforms like our dashboard, CNBC, Bloomberg, Yahoo Finance, MarketWatch, and TradingView. Most brokers display after hours quotes with extended hours enabled. Look for stocks with strong volume, clear news catalysts (especially earnings), and significant price changes. Our platform aggregates after hours data with AI-powered analysis to identify the most significant movers and their catalysts.',
  },
  {
    question: 'Do after hours gains hold into the next day?',
    answer: 'After hours gains don\'t always hold into regular trading hours. Stocks that surge after hours on strong earnings may continue higher, but can also reverse if the initial reaction was overdone or if investors take profits. Conversely, after hours losses can deepen or recover the next day. The sustainability of after hours moves depends on the strength of the catalyst, market sentiment, overall market conditions, and trading volume. Wait for regular hours price action to confirm trends.',
  },
]

export default function AfterHoursPage() {
  const pageUrl = `${SITE_URL}/markets/after-hours`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: 'After Hours Trading', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'After Hours Trading Today - Stock Prices & Movers After Market Close',
    description: 'Real-time after hours trading data and stock prices after the market closes.',
    url: pageUrl,
    keywords: ['after hours trading', 'after hours movers', 'after hours stock prices', 'extended hours trading'],
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
            <span>After Hours Trading</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">After Hours Trading & Stock Movers Today</h1>
            <p className="text-xl text-muted-foreground">
              Track stocks making big moves after the market closes. Monitor after hours trading from 4:00 PM - 8:00 PM ET.
            </p>
          </div>

          {/* After Hours Trading Hours */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">After Hours Trading Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🔔</div>
                <h3 className="text-lg font-bold mb-2">Market Close</h3>
                <p className="text-2xl font-bold text-blue-500 mb-2">4:00 PM ET</p>
                <p className="text-sm text-muted-foreground">
                  Regular trading session ends. After hours trading begins immediately.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Active After Hours</h3>
                <p className="text-2xl font-bold text-blue-500 mb-2">4:00 PM - 6:00 PM ET</p>
                <p className="text-sm text-muted-foreground">
                  Peak after hours activity. Earnings releases and highest liquidity.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🌙</div>
                <h3 className="text-lg font-bold mb-2">Late After Hours</h3>
                <p className="text-2xl font-bold text-blue-500 mb-2">6:00 PM - 8:00 PM ET</p>
                <p className="text-sm text-muted-foreground">
                  Extended hours continue. Significantly lower volume and liquidity.
                </p>
              </div>
            </div>
          </section>

          {/* Live After Hours Data CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-xl border border-blue-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">View Live After Hours Movers</h2>
                  <p className="text-muted-foreground">
                    Get real-time after hours data, extended hours quotes, and AI-powered analysis on our dashboard.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </section>

          {/* Why After Hours Trading Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why After Hours Trading Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-blue-500">📰</span>
                  Earnings Season Activity
                </h3>
                <p className="text-muted-foreground mb-4">
                  Many companies release quarterly earnings after the market closes (4:00-5:30 PM ET). After hours trading allows investors to react immediately to earnings beats, misses, and guidance changes.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Earnings announcements (typically 4:00-5:30 PM ET)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Post-earnings conference calls and management guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Corporate announcements and press releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>FDA approvals and regulatory decisions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-blue-500">⚡</span>
                  React to Breaking News
                </h3>
                <p className="text-muted-foreground mb-4">
                  After hours trading enables you to respond to late-breaking news, analyst reports, and market-moving events that occur after 4:00 PM ET.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Analyst upgrades and downgrades released after close</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>M&A announcements and partnership deals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Breaking news affecting specific companies or sectors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Late-day Federal Reserve or government announcements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-blue-500">🎯</span>
                  Position Before Next Day
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sophisticated traders use after hours to establish positions before the next trading day opens, capitalizing on earnings surprises or breaking news.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Enter positions on positive earnings before premarket rush</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Exit holdings on negative news before next day's selloff</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Lock in profits from regular hours moves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Hedge portfolio positions against overnight risk</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-blue-500">📈</span>
                  Gauge Market Sentiment
                </h3>
                <p className="text-muted-foreground mb-4">
                  After hours price action reveals how investors interpret earnings and news, providing clues for the next day's market direction.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Initial market reaction to earnings quality and guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Investor sentiment on corporate announcements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Sector rotation signals from key stock movements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Potential gap-up or gap-down scenarios for next day</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How After Hours Trading Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How After Hours Trading Works</h2>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-blue-500">Getting Started</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </span>
                      <div>
                        <p className="font-medium mb-1">Enable Extended Hours Trading</p>
                        <p className="text-sm text-muted-foreground">
                          Most brokers require you to enable after hours trading in your account settings or sign an extended hours agreement.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </span>
                      <div>
                        <p className="font-medium mb-1">Use Limit Orders Only</p>
                        <p className="text-sm text-muted-foreground">
                          Market orders are not allowed after hours. Always set specific price limits to avoid poor execution.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </span>
                      <div>
                        <p className="font-medium mb-1">Monitor Volume and Spreads</p>
                        <p className="text-sm text-muted-foreground">
                          Check trading volume and bid-ask spreads. Only trade stocks with reasonable liquidity and clear catalysts.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        4
                      </span>
                      <div>
                        <p className="font-medium mb-1">Watch Earnings Calendar</p>
                        <p className="text-sm text-muted-foreground">
                          Know which companies report earnings after the close. These stocks typically have the highest after hours activity.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-blue-500">Best Practices</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Trade Stocks with News Catalysts</p>
                        <p className="text-sm text-muted-foreground">
                          Focus on earnings releases, FDA approvals, or major announcements
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Stick to Large-Cap Stocks</p>
                        <p className="text-sm text-muted-foreground">
                          Big stocks have better after hours liquidity than small-caps
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Be Cautious with Price Targets</p>
                        <p className="text-sm text-muted-foreground">
                          Don't chase extreme prices; set realistic limits
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Understand Price May Not Hold</p>
                        <p className="text-sm text-muted-foreground">
                          After hours moves can reverse in premarket or at market open
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Use Smaller Position Sizes</p>
                        <p className="text-sm text-muted-foreground">
                          Higher risk warrants smaller positions than regular hours
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Risks and Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">After Hours Trading: Risks & Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-green-500/30">
                <h3 className="text-lg font-bold mb-4 text-green-500 flex items-center gap-2">
                  <span>✓</span> Benefits
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">React Immediately to Earnings:</strong>
                      <span className="text-muted-foreground"> Trade on earnings releases without waiting for next day's open</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Convenience for Day Traders:</strong>
                      <span className="text-muted-foreground"> Manage positions outside of 9:30 AM - 4:00 PM ET window</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Early Position Entry:</strong>
                      <span className="text-muted-foreground"> Get ahead of premarket and regular hours crowd</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Risk Management:</strong>
                      <span className="text-muted-foreground"> Exit losing positions on negative news before next day</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Price Discovery:</strong>
                      <span className="text-muted-foreground"> See how market values new information immediately</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-red-500/30">
                <h3 className="text-lg font-bold mb-4 text-red-500 flex items-center gap-2">
                  <span>!</span> Risks
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Low Liquidity:</strong>
                      <span className="text-muted-foreground"> Volume is 80-90% lower than regular hours, making trades harder to execute</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Wide Spreads:</strong>
                      <span className="text-muted-foreground"> Bid-ask spreads can be 2-5x wider, increasing costs</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">High Volatility:</strong>
                      <span className="text-muted-foreground"> Prices can swing wildly on low volume trades</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Price Gaps:</strong>
                      <span className="text-muted-foreground"> After hours prices may not hold at next day's open</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <div>
                      <strong className="text-foreground">Limited Order Types:</strong>
                      <span className="text-muted-foreground"> Only limit orders allowed; no stop losses or market orders</span>
                    </div>
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

          {/* After Hours Trading Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">After Hours Trading Tips & Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-blue-500">
                  What to Watch After Hours
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">1.</span>
                    <div>
                      <strong className="text-foreground">Earnings Calendar:</strong> Track which companies report after the close
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">2.</span>
                    <div>
                      <strong className="text-foreground">Earnings Quality:</strong> Revenue beat/miss, EPS beat/miss, and guidance changes
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">3.</span>
                    <div>
                      <strong className="text-foreground">Conference Calls:</strong> Listen to management commentary and Q&A
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">4.</span>
                    <div>
                      <strong className="text-foreground">Breaking News:</strong> FDA approvals, M&A deals, analyst calls
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">5.</span>
                    <div>
                      <strong className="text-foreground">Volume Spikes:</strong> Unusual after hours volume indicates significant news
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">6.</span>
                    <div>
                      <strong className="text-foreground">Sector Trends:</strong> How are peers reacting to the same news?
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-red-500">
                  Common After Hours Mistakes to Avoid
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Using Market Orders:</strong> Only limit orders work after hours
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Chasing Initial Moves:</strong> Wait 15-30 minutes for volatility to settle
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Ignoring the Spread:</strong> Wide spreads can cost you 1-3% per trade
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Trading Thinly Traded Stocks:</strong> Stick to liquid large-caps
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Assuming Prices Hold:</strong> After hours gaps often fill next day
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Oversized Positions:</strong> Keep position sizes smaller due to higher risk
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Related Market Pages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Explore More Market Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/markets/premarket"
                className="bg-card p-4 rounded-lg border border-border hover:border-blue-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">🌅</p>
                <p className="font-bold">Premarket</p>
                <p className="text-xs text-muted-foreground mt-1">Before market opens</p>
              </Link>
              <Link
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-lg border border-border hover:border-blue-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📈</p>
                <p className="font-bold">Top Gainers</p>
                <p className="text-xs text-muted-foreground mt-1">Biggest % increases</p>
              </Link>
              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-lg border border-border hover:border-blue-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📊</p>
                <p className="font-bold">Most Active</p>
                <p className="text-xs text-muted-foreground mt-1">Highest volume</p>
              </Link>
              <Link
                href="/markets/top-losers"
                className="bg-card p-4 rounded-lg border border-border hover:border-blue-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📉</p>
                <p className="font-bold">Top Losers</p>
                <p className="text-xs text-muted-foreground mt-1">Biggest declines</p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Start Trading Smarter with AI Analysis
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Don't just track after hours movers—understand them. Our AI-powered platform analyzes earnings reports,
              news catalysts, and fundamental data to help you make informed after hours trading decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                View Live After Hours Data
              </Link>
              <Link
                href="/markets"
                className="inline-block bg-card hover:bg-muted text-foreground px-8 py-3 rounded-lg font-medium transition-colors border border-border"
              >
                Explore All Markets
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
