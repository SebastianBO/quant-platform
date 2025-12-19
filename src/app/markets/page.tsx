import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Stock Market Movers Today - Top Gainers, Losers & Most Active Stocks',
  description: 'Track today\'s biggest stock market movers. View real-time data on top gainers, losers, most active stocks, and stocks hitting 52-week highs and lows.',
  keywords: ['stock market movers', 'top gainers', 'top losers', 'most active stocks', '52 week high', '52 week low', 'stock market today'],
  openGraph: {
    title: 'Stock Market Movers Today - Live Data',
    description: 'Track today\'s biggest stock market movers in real-time.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/markets',
  },
}

const marketPages = [
  {
    title: 'Most Active Stocks',
    description: 'Stocks with the highest trading volume today',
    href: '/markets/most-active',
    icon: '📊',
    keywords: 'Volume leaders, trading activity',
  },
  {
    title: 'Top Gainers',
    description: 'Stocks with the biggest percentage gains today',
    href: '/markets/top-gainers',
    icon: '📈',
    keywords: 'Best performers, biggest movers up',
  },
  {
    title: 'Top Losers',
    description: 'Stocks with the biggest percentage losses today',
    href: '/markets/top-losers',
    icon: '📉',
    keywords: 'Worst performers, biggest movers down',
  },
  {
    title: '52-Week Highs',
    description: 'Stocks trading at or near their 52-week highs',
    href: '/markets/52-week-high',
    icon: '🚀',
    keywords: 'Breakouts, momentum stocks',
  },
  {
    title: '52-Week Lows',
    description: 'Stocks trading at or near their 52-week lows',
    href: '/markets/52-week-low',
    icon: '🔻',
    keywords: 'Value opportunities, oversold stocks',
  },
]

const faqs = [
  {
    question: 'What are stock market movers?',
    answer: 'Stock market movers are stocks experiencing significant price changes, high trading volumes, or reaching notable price levels. They include top gainers (biggest price increases), top losers (biggest price decreases), most active stocks (highest trading volume), and stocks hitting 52-week highs or lows.',
  },
  {
    question: 'How often is market movers data updated?',
    answer: 'Our market movers data is updated in real-time during market hours, with a refresh rate of approximately 1 minute. This ensures you have access to the latest information on stock price movements and trading activity.',
  },
  {
    question: 'Why should I track most active stocks?',
    answer: 'Most active stocks represent where the market\'s attention is focused. High trading volume often indicates significant news, institutional activity, or major price movements. Tracking these stocks helps identify trading opportunities and understand market sentiment.',
  },
  {
    question: 'What does it mean when a stock hits a 52-week high?',
    answer: 'A 52-week high means the stock is trading at its highest price in the past year. This can indicate strong momentum, positive sentiment, and potential continuation of upward trends. However, it can also signal overbought conditions that may lead to pullbacks.',
  },
  {
    question: 'Are stocks at 52-week lows good buying opportunities?',
    answer: 'Stocks at 52-week lows can represent value opportunities if the decline is temporary or overdone. However, they may also reflect fundamental problems. Always research the reasons for the decline and analyze the company\'s fundamentals before investing.',
  },
]

export default function MarketsHubPage() {
  const pageUrl = `${SITE_URL}/markets`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Movers - Real-Time Data & Analysis',
    description: 'Track today\'s biggest stock market movers including top gainers, losers, and most active stocks.',
    url: pageUrl,
    keywords: ['stock market movers', 'top gainers', 'top losers', 'most active stocks'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <span>Markets</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Stock Market Movers Today
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Track real-time data on the biggest movers in the stock market.
              Find top gainers, losers, most active stocks, and more.
            </p>
          </div>

          {/* Market Pages Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Explore Market Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all hover:shadow-lg group"
                >
                  <div className="text-4xl mb-4">{page.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {page.description}
                  </p>
                  <p className="text-sm text-green-500">{page.keywords}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Why Track Market Movers */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Why Track Market Movers?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Identify Opportunities
                </h3>
                <p className="text-muted-foreground">
                  Market movers help you spot stocks with momentum, unusual
                  activity, or potential value opportunities before they become
                  mainstream.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Understand Market Sentiment
                </h3>
                <p className="text-muted-foreground">
                  By tracking which stocks are moving and why, you gain insight
                  into broader market trends and investor sentiment.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Risk Management</h3>
                <p className="text-muted-foreground">
                  Monitor stocks hitting 52-week lows in your portfolio or
                  watch list to make informed decisions about position sizing
                  and exits.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Trading Opportunities
                </h3>
                <p className="text-muted-foreground">
                  High volume movers and breakouts to new highs often present
                  short-term trading opportunities for active traders.
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Explained */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Key Metrics Explained</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-green-500 mb-2">
                    Trading Volume
                  </h3>
                  <p className="text-muted-foreground">
                    The number of shares traded during a period. High volume
                    indicates strong interest and liquidity, making it easier to
                    enter and exit positions.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-green-500 mb-2">
                    Percent Change
                  </h3>
                  <p className="text-muted-foreground">
                    The percentage difference between current price and previous
                    close. This normalizes price movements across different
                    stocks for easy comparison.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-green-500 mb-2">
                    52-Week Range
                  </h3>
                  <p className="text-muted-foreground">
                    The highest and lowest prices over the past year. Helps
                    identify if a stock is near historical highs (potential
                    breakout) or lows (potential value).
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-green-500 mb-2">
                    Volume Ratio
                  </h3>
                  <p className="text-muted-foreground">
                    Current volume compared to average volume. Ratios above 2x
                    indicate unusual activity that may signal significant news
                    or events.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
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

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              Access detailed fundamental analysis, DCF valuations, and AI
              insights for any stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Analyzing Stocks
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
