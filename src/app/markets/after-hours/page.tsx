import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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
      <Header />
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
      <main className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">
              Home
            </Link>
            {' / '}
            <Link href="/markets" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">
              Markets
            </Link>
            {' / '}
            <span>After Hours Trading</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-balance">After Hours Trading & Stock Movers Today</h1>
            <p className="text-xl text-[#868f97]">
              Track stocks making big moves after the market closes. Monitor after hours trading from <span className="tabular-nums">4:00 PM - 8:00 PM ET</span>.
            </p>
          </div>

          {/* After Hours Trading Hours */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">After Hours Trading Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-3xl mb-3">🔔</div>
                <h3 className="text-lg font-bold mb-2">Market Close</h3>
                <p className="text-2xl font-bold text-[#479ffa] mb-2 tabular-nums">4:00 PM ET</p>
                <p className="text-sm text-[#868f97]">
                  Regular trading session ends. After hours trading begins immediately.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Active After Hours</h3>
                <p className="text-2xl font-bold text-[#479ffa] mb-2 tabular-nums">4:00 PM - 6:00 PM ET</p>
                <p className="text-sm text-[#868f97]">
                  Peak after hours activity. Earnings releases and highest liquidity.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-3xl mb-3">🌙</div>
                <h3 className="text-lg font-bold mb-2">Late After Hours</h3>
                <p className="text-2xl font-bold text-[#479ffa] mb-2 tabular-nums">6:00 PM - 8:00 PM ET</p>
                <p className="text-sm text-[#868f97]">
                  Extended hours continue. Significantly lower volume and liquidity.
                </p>
              </div>
            </div>
          </section>

          {/* Live After Hours Data CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-[#479ffa]/10 to-[#4ebe96]/10 p-8 rounded-2xl border border-[#479ffa]/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-balance">View Live After Hours Movers</h2>
                  <p className="text-[#868f97]">
                    Get real-time after hours data, extended hours quotes, and AI-powered analysis on our dashboard.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-block bg-[#479ffa] hover:bg-[#479ffa]/90 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </section>

          {/* Why After Hours Trading Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Why After Hours Trading Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#479ffa]">📰</span>
                  Earnings Season Activity
                </h3>
                <p className="text-[#868f97] mb-4">
                  Many companies release quarterly earnings after the market closes (<span className="tabular-nums">4:00-5:30 PM ET</span>). After hours trading allows investors to react immediately to earnings beats, misses, and guidance changes.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Earnings announcements (typically <span className="tabular-nums">4:00-5:30 PM ET</span>)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Post-earnings conference calls and management guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Corporate announcements and press releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>FDA approvals and regulatory decisions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#479ffa]">⚡</span>
                  React to Breaking News
                </h3>
                <p className="text-[#868f97] mb-4">
                  After hours trading enables you to respond to late-breaking news, analyst reports, and market-moving events that occur after <span className="tabular-nums">4:00 PM ET</span>.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Analyst upgrades and downgrades released after close</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>M&A announcements and partnership deals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Breaking news affecting specific companies or sectors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Late-day Federal Reserve or government announcements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#479ffa]">🎯</span>
                  Position Before Next Day
                </h3>
                <p className="text-[#868f97] mb-4">
                  Sophisticated traders use after hours to establish positions before the next trading day opens, capitalizing on earnings surprises or breaking news.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Enter positions on positive earnings before premarket rush</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Exit holdings on negative news before next day's selloff</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Lock in profits from regular hours moves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Hedge portfolio positions against overnight risk</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#479ffa]">📈</span>
                  Gauge Market Sentiment
                </h3>
                <p className="text-[#868f97] mb-4">
                  After hours price action reveals how investors interpret earnings and news, providing clues for the next day's market direction.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Initial market reaction to earnings quality and guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Investor sentiment on corporate announcements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Sector rotation signals from key stock movements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1">•</span>
                    <span>Potential gap-up or gap-down scenarios for next day</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How After Hours Trading Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">How After Hours Trading Works</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-[#479ffa]">Getting Started</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="bg-[#479ffa]/20 text-[#479ffa] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums">
                        1
                      </span>
                      <div>
                        <p className="font-medium mb-1">Enable Extended Hours Trading</p>
                        <p className="text-sm text-[#868f97]">
                          Most brokers require you to enable after hours trading in your account settings or sign an extended hours agreement.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-[#479ffa]/20 text-[#479ffa] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums">
                        2
                      </span>
                      <div>
                        <p className="font-medium mb-1">Use Limit Orders Only</p>
                        <p className="text-sm text-[#868f97]">
                          Market orders are not allowed after hours. Always set specific price limits to avoid poor execution.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-[#479ffa]/20 text-[#479ffa] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums">
                        3
                      </span>
                      <div>
                        <p className="font-medium mb-1">Monitor Volume and Spreads</p>
                        <p className="text-sm text-[#868f97]">
                          Check trading volume and bid-ask spreads. Only trade stocks with reasonable liquidity and clear catalysts.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-[#479ffa]/20 text-[#479ffa] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums">
                        4
                      </span>
                      <div>
                        <p className="font-medium mb-1">Watch Earnings Calendar</p>
                        <p className="text-sm text-[#868f97]">
                          Know which companies report earnings after the close. These stocks typically have the highest after hours activity.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-[#479ffa]">Best Practices</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-[#479ffa] mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Trade Stocks with News Catalysts</p>
                        <p className="text-sm text-[#868f97]">
                          Focus on earnings releases, FDA approvals, or major announcements
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#479ffa] mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Stick to Large-Cap Stocks</p>
                        <p className="text-sm text-[#868f97]">
                          Big stocks have better after hours liquidity than small-caps
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#479ffa] mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Be Cautious with Price Targets</p>
                        <p className="text-sm text-[#868f97]">
                          Don't chase extreme prices; set realistic limits
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#479ffa] mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Understand Price May Not Hold</p>
                        <p className="text-sm text-[#868f97]">
                          After hours moves can reverse in premarket or at market open
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#479ffa] mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Use Smaller Position Sizes</p>
                        <p className="text-sm text-[#868f97]">
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
            <h2 className="text-2xl font-bold mb-6 text-balance">After Hours Trading: Risks & Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-4 text-[#4ebe96] flex items-center gap-2">
                  <span>✓</span> Benefits
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">React Immediately to Earnings:</strong>
                      <span className="text-[#868f97]"> Trade on earnings releases without waiting for next day's open</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Convenience for Day Traders:</strong>
                      <span className="text-[#868f97]"> Manage positions outside of <span className="tabular-nums">9:30 AM - 4:00 PM ET</span> window</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Early Position Entry:</strong>
                      <span className="text-[#868f97]"> Get ahead of premarket and regular hours crowd</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Risk Management:</strong>
                      <span className="text-[#868f97]"> Exit losing positions on negative news before next day</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Price Discovery:</strong>
                      <span className="text-[#868f97]"> See how market values new information immediately</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#ff5c5c]/30 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-[#ff5c5c]/50 motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-4 text-[#ff5c5c] flex items-center gap-2">
                  <span>!</span> Risks
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Low Liquidity:</strong>
                      <span className="text-[#868f97]"> Volume is <span className="tabular-nums">80-90%</span> lower than regular hours, making trades harder to execute</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Wide Spreads:</strong>
                      <span className="text-[#868f97]"> Bid-ask spreads can be <span className="tabular-nums">2-5x</span> wider, increasing costs</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">High Volatility:</strong>
                      <span className="text-[#868f97]"> Prices can swing wildly on low volume trades</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Price Gaps:</strong>
                      <span className="text-[#868f97]"> After hours prices may not hold at next day's open</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Limited Order Types:</strong>
                      <span className="text-[#868f97]"> Only limit orders allowed; no stop losses or market orders</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* After Hours Trading Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">After Hours Trading Tips & Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 text-[#479ffa]">
                  What to Watch After Hours
                </h3>
                <ul className="space-y-3 text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">1.</span>
                    <div>
                      <strong className="text-white">Earnings Calendar:</strong> Track which companies report after the close
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">2.</span>
                    <div>
                      <strong className="text-white">Earnings Quality:</strong> Revenue beat/miss, EPS beat/miss, and guidance changes
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">3.</span>
                    <div>
                      <strong className="text-white">Conference Calls:</strong> Listen to management commentary and Q&A
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">4.</span>
                    <div>
                      <strong className="text-white">Breaking News:</strong> FDA approvals, M&A deals, analyst calls
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">5.</span>
                    <div>
                      <strong className="text-white">Volume Spikes:</strong> Unusual after hours volume indicates significant news
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#479ffa] mt-1 tabular-nums">6.</span>
                    <div>
                      <strong className="text-white">Sector Trends:</strong> How are peers reacting to the same news?
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 text-[#ff5c5c]">
                  Common After Hours Mistakes to Avoid
                </h3>
                <ul className="space-y-3 text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Using Market Orders:</strong> Only limit orders work after hours
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Chasing Initial Moves:</strong> Wait <span className="tabular-nums">15-30</span> minutes for volatility to settle
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Ignoring the Spread:</strong> Wide spreads can cost you <span className="tabular-nums">1-3%</span> per trade
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Trading Thinly Traded Stocks:</strong> Stick to liquid large-caps
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Assuming Prices Hold:</strong> After hours gaps often fill next day
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <div>
                      <strong className="text-white">Oversized Positions:</strong> Keep position sizes smaller due to higher risk
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Related Market Pages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Explore More Market Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/markets/premarket"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">🌅</p>
                <p className="font-bold">Premarket</p>
                <p className="text-xs text-[#868f97] mt-1">Before market opens</p>
              </Link>
              <Link
                href="/markets/top-gainers"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">📈</p>
                <p className="font-bold">Top Gainers</p>
                <p className="text-xs text-[#868f97] mt-1">Biggest % increases</p>
              </Link>
              <Link
                href="/markets/most-active"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">📊</p>
                <p className="font-bold">Most Active</p>
                <p className="text-xs text-[#868f97] mt-1">Highest volume</p>
              </Link>
              <Link
                href="/markets/top-losers"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">📉</p>
                <p className="font-bold">Top Losers</p>
                <p className="text-xs text-[#868f97] mt-1">Biggest declines</p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-balance">
              Start Trading Smarter with AI Analysis
            </h2>
            <p className="text-[#868f97] mb-6 max-w-2xl mx-auto">
              Don't just track after hours movers—understand them. Our AI-powered platform analyzes earnings reports,
              news catalysts, and fundamental data to help you make informed after hours trading decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-[#479ffa] hover:bg-[#479ffa]/90 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                View Live After Hours Data
              </Link>
              <Link
                href="/markets"
                className="inline-block bg-white/[0.03] hover:bg-white/[0.05] text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out border border-white/[0.08] hover:border-white/[0.15] focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Explore All Markets
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
