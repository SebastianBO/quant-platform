import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Premarket Movers Today - Stock Futures & Premarket Trading | Live Data',
  description: 'Track premarket movers, stock futures, and premarket gainers before the market opens. Get real-time premarket trading data from 4 AM - 9:30 AM ET with AI-powered analysis.',
  keywords: [
    'premarket movers',
    'premarket stock futures',
    'premarket trading',
    'stock futures today',
    'premarket gainers',
    'premarket losers',
    'premarket stocks',
    'before market open',
    'extended hours trading',
    'premarket volume',
    'stock futures live',
    'premarket winners',
  ],
  openGraph: {
    title: 'Premarket Movers & Stock Futures Today',
    description: 'Real-time premarket trading data and stock futures before the market opens.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets/premarket',
  },
}

const faqs = [
  {
    question: 'What are premarket movers?',
    answer: 'Premarket movers are stocks experiencing significant price movements or trading volume before the regular market opens at 9:30 AM ET. These stocks often react to overnight news, earnings reports, economic data, or global market events. Premarket movers can indicate which stocks will be active during regular trading hours.',
  },
  {
    question: 'What are premarket trading hours?',
    answer: 'Premarket trading hours typically run from 4:00 AM to 9:30 AM Eastern Time (ET), before the regular market session opens. Most retail brokers offer premarket trading starting at 7:00 AM ET or 8:00 AM ET. During these hours, investors can react to overnight news and position themselves before the opening bell.',
  },
  {
    question: 'Can I trade stocks during premarket hours?',
    answer: 'Yes, most major online brokers including TD Ameritrade, E*TRADE, Fidelity, Charles Schwab, and Robinhood offer premarket trading. However, premarket hours may be limited (often 7:00 AM - 9:30 AM ET for retail traders), and you may need to enable extended hours trading in your account settings. Be aware of lower liquidity and wider bid-ask spreads.',
  },
  {
    question: 'Why do stocks move in premarket trading?',
    answer: 'Stocks move in premarket for several reasons: earnings reports released before market open, overnight economic data or Federal Reserve announcements, global market movements (Asian and European markets), breaking news or corporate announcements, analyst upgrades/downgrades, and reactions to after-hours events from the previous day.',
  },
  {
    question: 'What are stock futures and how do they affect premarket?',
    answer: 'Stock futures (like S&P 500, Dow Jones, and NASDAQ futures) trade 24/5 and predict where the market will open. When futures are up significantly, the overall market typically opens higher, lifting many stocks in premarket. Futures react to overnight news, international markets, and economic data, providing early signals for the trading day ahead.',
  },
  {
    question: 'Are premarket prices reliable indicators?',
    answer: 'Premarket prices provide valuable insights but should be interpreted cautiously. Lower liquidity means prices can be more volatile and may not reflect the regular session price. Large gaps between premarket and opening prices are common. Use premarket data to gauge sentiment and identify potential opportunities, but confirm with regular hours volume and price action.',
  },
  {
    question: 'What is the difference between premarket and after-hours trading?',
    answer: 'Premarket trading occurs before the market opens (4:00 AM - 9:30 AM ET), while after-hours trading happens after the market closes (4:00 PM - 8:00 PM ET). Both are extended hours sessions with lower volume and wider spreads. Premarket often reacts to overnight news and earnings, while after-hours responds to closing bell events and earnings released post-market.',
  },
  {
    question: 'Should I buy premarket gainers?',
    answer: 'Buying premarket gainers requires caution. While strong premarket movement can continue into regular hours, it can also reverse as more traders enter the market. Consider: Why is the stock moving? (fundamental news vs. speculation), the volume supporting the move, whether the gain is sustainable, and your risk tolerance. Wait for regular hours to confirm trends unless you have a clear catalyst-based thesis.',
  },
  {
    question: 'How do I find premarket movers and stock futures?',
    answer: 'You can find premarket movers through financial platforms like our dashboard, CNBC, Bloomberg, Yahoo Finance, and TradingView. Most brokers also show premarket quotes. For stock futures, check S&P 500 futures (ES), Nasdaq futures (NQ), and Dow futures (YM) on futures exchanges or financial news sites. Our platform aggregates this data with AI-powered analysis.',
  },
  {
    question: 'What risks should I know about premarket trading?',
    answer: 'Premarket trading carries unique risks: significantly lower liquidity leading to larger spreads, higher volatility with rapid price swings, limited order types (typically limit orders only), possibility of price gaps at market open, limited access for some retail traders, and increased impact of large orders on price. Only experienced traders should actively trade during premarket hours.',
  },
]

export default function PremarketPage() {
  const pageUrl = `${SITE_URL}/markets/premarket`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: 'Premarket Movers', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Premarket Movers Today - Stock Futures & Premarket Trading',
    description: 'Real-time premarket trading data and stock futures before the market opens.',
    url: pageUrl,
    keywords: ['premarket movers', 'premarket stock futures', 'premarket trading', 'stock futures today'],
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
            <span>Premarket Movers</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Premarket Movers & Stock Futures Today</h1>
            <p className="text-xl text-muted-foreground">
              Track stocks making big moves before the market opens. Monitor premarket trading from 4:00 AM - 9:30 AM ET.
            </p>
          </div>

          {/* Premarket Trading Hours */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Premarket Trading Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🌅</div>
                <h3 className="text-lg font-bold mb-2">Early Premarket</h3>
                <p className="text-2xl font-bold text-green-500 mb-2">4:00 AM - 7:00 AM ET</p>
                <p className="text-sm text-muted-foreground">
                  Institutional and professional traders only. Extremely low liquidity.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Active Premarket</h3>
                <p className="text-2xl font-bold text-green-500 mb-2">7:00 AM - 9:30 AM ET</p>
                <p className="text-sm text-muted-foreground">
                  Retail access available. Higher volume, better liquidity for trading.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🔔</div>
                <h3 className="text-lg font-bold mb-2">Market Open</h3>
                <p className="text-2xl font-bold text-green-500 mb-2">9:30 AM ET</p>
                <p className="text-sm text-muted-foreground">
                  Regular trading begins. Full liquidity and volume restored.
                </p>
              </div>
            </div>
          </section>

          {/* Live Premarket Data CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">View Live Premarket Movers</h2>
                  <p className="text-muted-foreground">
                    Get real-time premarket data, stock futures, and AI-powered analysis on our dashboard.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </section>

          {/* Why Premarket Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Premarket Trading Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-green-500">📰</span>
                  React to Breaking News
                </h3>
                <p className="text-muted-foreground mb-4">
                  Many companies release earnings reports before the market opens. Premarket trading allows you to react to earnings beats, misses, and guidance updates before regular hours.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Earnings announcements (typically 6:00-8:30 AM ET)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Economic data releases (8:30 AM ET)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Corporate announcements and M&A news</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Overnight developments from global markets</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-green-500">🌍</span>
                  Global Market Context
                </h3>
                <p className="text-muted-foreground mb-4">
                  Premarket trading reflects overnight moves in Asian and European markets, providing context for how U.S. stocks might perform.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Asian markets close before U.S. premarket opens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>European markets trade during U.S. premarket hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Currency and commodity movements overnight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Geopolitical events and global economic news</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-green-500">🎯</span>
                  Position Before the Crowd
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sophisticated traders use premarket to establish positions before the majority of retail traders enter at market open.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Get ahead of positive earnings surprises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Exit positions on negative news before panic selling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Identify potential gap-up or gap-down stocks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Gauge market sentiment before regular hours</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-green-500">📈</span>
                  Stock Futures Guidance
                </h3>
                <p className="text-muted-foreground mb-4">
                  Stock index futures (S&P 500, NASDAQ, Dow Jones) trade nearly 24/5 and predict market direction.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>S&P 500 futures (ES) indicate broad market direction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>NASDAQ futures (NQ) show tech sector sentiment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Dow futures (YM) reflect blue-chip performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Russell 2000 futures for small-cap sentiment</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Trade Premarket */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Trade in Premarket Hours</h2>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-green-500">Getting Started</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </span>
                      <div>
                        <p className="font-medium mb-1">Enable Extended Hours Trading</p>
                        <p className="text-sm text-muted-foreground">
                          Contact your broker or enable in account settings. Most major brokers offer this feature.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </span>
                      <div>
                        <p className="font-medium mb-1">Use Limit Orders Only</p>
                        <p className="text-sm text-muted-foreground">
                          Market orders are typically not allowed. Set specific price limits to control execution.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </span>
                      <div>
                        <p className="font-medium mb-1">Check Volume and Spreads</p>
                        <p className="text-sm text-muted-foreground">
                          Low liquidity means wider bid-ask spreads. Only trade liquid stocks with clear catalysts.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        4
                      </span>
                      <div>
                        <p className="font-medium mb-1">Monitor Stock Futures</p>
                        <p className="text-sm text-muted-foreground">
                          Watch S&P 500, NASDAQ, and Dow futures for overall market sentiment.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-green-500">Best Practices</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Trade Stocks with News Catalysts</p>
                        <p className="text-sm text-muted-foreground">
                          Focus on stocks with earnings, FDA approvals, or major announcements
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Avoid Thinly Traded Stocks</p>
                        <p className="text-sm text-muted-foreground">
                          Stick to large-cap, high-volume stocks during premarket
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Set Realistic Price Targets</p>
                        <p className="text-sm text-muted-foreground">
                          Don't chase extreme prices; wait for reasonable fills
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Be Patient After 9:30 AM</p>
                        <p className="text-sm text-muted-foreground">
                          Often better to wait 15-30 minutes after open for volatility to settle
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <div>
                        <p className="font-medium mb-1">Use Smaller Position Sizes</p>
                        <p className="text-sm text-muted-foreground">
                          Higher risk means smaller positions relative to regular hours
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding Stock Futures */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Understanding Stock Futures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 text-green-500">S&P 500 Futures (ES)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The most watched futures contract. Tracks the S&P 500 index representing 500 large-cap U.S. companies.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Best for:</strong> Overall market sentiment and direction
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 text-green-500">NASDAQ Futures (NQ)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tech-heavy index futures. Strong indicator for technology and growth stocks.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Best for:</strong> Technology sector and growth stock sentiment
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 text-green-500">Dow Futures (YM)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tracks 30 large blue-chip companies. More stable, less volatile than NASDAQ.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Best for:</strong> Blue-chip and industrial sector trends
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 text-green-500">Russell 2000 (RTY)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Small-cap index futures. Indicates sentiment for smaller U.S. companies.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Best for:</strong> Small-cap stock sentiment and domestic economy
                </p>
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

          {/* Premarket Trading Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Premarket Trading Tips & Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">
                  What to Watch in Premarket
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">1.</span>
                    <div>
                      <strong className="text-foreground">Earnings Calendar:</strong> Know which companies report before the bell
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">2.</span>
                    <div>
                      <strong className="text-foreground">Economic Calendar:</strong> Track 8:30 AM ET data releases (jobs, inflation, GDP)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">3.</span>
                    <div>
                      <strong className="text-foreground">Futures Movement:</strong> Are S&P 500, NASDAQ, and Dow futures green or red?
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">4.</span>
                    <div>
                      <strong className="text-foreground">Global Markets:</strong> How did Asian and European markets perform?
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">5.</span>
                    <div>
                      <strong className="text-foreground">Volume Leaders:</strong> Which stocks have unusually high premarket volume?
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">6.</span>
                    <div>
                      <strong className="text-foreground">News Flow:</strong> Check financial news for breaking stories
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-red-500">
                  Common Premarket Mistakes to Avoid
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Using Market Orders:</strong> Always use limit orders in premarket
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Chasing Gap-Ups:</strong> Don't FOMO into stocks already up 20%+ premarket
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Ignoring Liquidity:</strong> Low volume = dangerous price swings
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Trading Without Catalyst:</strong> Only trade stocks with clear news
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Large Position Sizes:</strong> Keep positions smaller due to higher risk
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <div>
                      <strong className="text-foreground">Assuming Prices Hold:</strong> Premarket gaps often fill during regular hours
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
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📈</p>
                <p className="font-bold">Top Gainers</p>
                <p className="text-xs text-muted-foreground mt-1">Biggest % increases</p>
              </Link>
              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📊</p>
                <p className="font-bold">Most Active</p>
                <p className="text-xs text-muted-foreground mt-1">Highest volume</p>
              </Link>
              <Link
                href="/markets/top-losers"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">📉</p>
                <p className="font-bold">Top Losers</p>
                <p className="text-xs text-muted-foreground mt-1">Biggest declines</p>
              </Link>
              <Link
                href="/markets/52-week-high"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">🚀</p>
                <p className="font-bold">52-Week Highs</p>
                <p className="text-xs text-muted-foreground mt-1">New highs today</p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Start Trading Smarter with AI Analysis
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Don't just track premarket movers—understand them. Our AI-powered platform analyzes earnings reports,
              news catalysts, and fundamental data to help you make informed premarket trading decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                View Live Premarket Data
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
