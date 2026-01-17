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
import SEOSidebar from '@/components/SEOSidebar'
import MarketPulseClient from './MarketPulseClient'
import { MarketHeatmap } from '@/components/MarketHeatmap'

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
    title: 'Premarket Movers',
    description: 'Stocks moving before the market opens (4 AM - 9:30 AM ET)',
    href: '/markets/premarket',
    icon: '🌅',
    keywords: 'Premarket trading, stock futures',
  },
  {
    title: 'After Hours Trading',
    description: 'Stocks moving after the market closes (4 PM - 8 PM ET)',
    href: '/markets/after-hours',
    icon: '🌙',
    keywords: 'Extended hours, post-market',
  },
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
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:block">
              <SEOSidebar />
            </div>
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-4 sm:mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            {' / '}
            <span>Markets</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Stock Market Movers Today
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#868f97] mb-6">
              Track real-time data on the biggest movers in the stock market.
              Find top gainers, losers, most active stocks, and more.
            </p>
          </div>

          {/* Real-Time Market Pulse */}
          <section className="mb-12">
            <MarketPulseClient />
          </section>

          {/* Market Heatmap */}
          <section className="mb-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
            <MarketHeatmap />
          </section>

          {/* Market Pages Grid */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Explore Market Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {marketPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08] hover:border-[#4ebe96]/50 transition-all hover:shadow-lg group"
                >
                  <div className="text-3xl sm:text-4xl mb-4">{page.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#4ebe96] transition-colors duration-100">
                    {page.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#868f97] mb-3">
                    {page.description}
                  </p>
                  <p className="text-xs sm:text-sm text-[#4ebe96]">{page.keywords}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Why Track Market Movers */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Why Track Market Movers?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-base sm:text-lg font-bold mb-3">
                  Identify Opportunities
                </h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  Market movers help you spot stocks with momentum, unusual
                  activity, or potential value opportunities before they become
                  mainstream.
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-base sm:text-lg font-bold mb-3">
                  Understand Market Sentiment
                </h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  By tracking which stocks are moving and why, you gain insight
                  into broader market trends and investor sentiment.
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-base sm:text-lg font-bold mb-3">Risk Management</h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  Monitor stocks hitting 52-week lows in your portfolio or
                  watch list to make informed decisions about position sizing
                  and exits.
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-base sm:text-lg font-bold mb-3">
                  Trading Opportunities
                </h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  High volume movers and breakouts to new highs often present
                  short-term trading opportunities for active traders.
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Explained */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Key Metrics Explained</h2>
            <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">
                    Trading Volume
                  </h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    The number of shares traded during a period. High volume
                    indicates strong interest and liquidity, making it easier to
                    enter and exit positions.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">
                    Percent Change
                  </h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    The percentage difference between current price and previous
                    close. This normalizes price movements across different
                    stocks for easy comparison.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">
                    52-Week Range
                  </h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    The highest and lowest prices over the past year. Helps
                    identify if a stock is near historical highs (potential
                    breakout) or lows (potential value).
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">
                    Volume Ratio
                  </h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    Current volume compared to average volume. Ratios above 2x
                    indicate unusual activity that may signal significant news
                    or events.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl border border-white/[0.08] group"
                >
                  <summary className="text-base sm:text-lg font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="flex-1">{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 transition-transform flex-shrink-0">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm sm:text-base text-[#868f97] mt-3 sm:mt-4">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl border border-white/[0.08] text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-sm sm:text-base text-[#868f97] mb-4 sm:mb-6">
              Access detailed fundamental analysis, DCF valuations, and AI
              insights for any stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full sm:w-auto bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors duration-100"
            >
              Start Analyzing Stocks
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
