import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import PredictionAccuracy from '@/components/PredictionAccuracy'

export const metadata: Metadata = {
  title: 'Stock Market Insights 2026 - Predictions, Analysis & Trends | Lician',
  description: 'Expert stock market predictions and insights for 2026. Discover the best stocks to buy, AI stocks, dividend stocks, and comprehensive market analysis.',
  keywords: ['stock market insights 2026', 'stock predictions 2026', 'best stocks 2026', 'AI stocks 2026', 'dividend stocks 2026', 'stock market trends'],
  openGraph: {
    title: 'Stock Market Insights & Predictions for 2026',
    description: 'Expert analysis, predictions, and top stock picks for 2026. AI-powered insights for smarter investing.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/insights',
  },
}

const insights = [
  {
    title: 'Our Prediction Track Record',
    description: 'Transparent accountability: See how our AI predictions performed against actual results and Wall Street consensus.',
    href: '/insights/prediction-accuracy',
    category: 'Accountability',
    icon: '🎯',
    featured: true,
  },
  {
    title: 'Stock Market Predictions 2026',
    description: 'Comprehensive market forecasts, trends analysis, and expert predictions for the 2026 stock market.',
    href: '/insights/2026-stock-predictions',
    category: 'Market Analysis',
    icon: '📊',
  },
  {
    title: 'Best Stocks to Buy for 2026',
    description: 'Top stock picks across all sectors with detailed fundamental analysis and growth potential.',
    href: '/insights/best-stocks-2026',
    category: 'Stock Picks',
    icon: '🚀',
  },
  {
    title: 'Best AI Stocks for 2026',
    description: 'Leading artificial intelligence stocks positioned to benefit from the AI revolution in 2026.',
    href: '/insights/ai-stocks-2026',
    category: 'AI & Technology',
    icon: '🤖',
  },
  {
    title: 'Best Dividend Stocks for 2026',
    description: 'Top dividend-paying stocks with high yields, consistent payouts, and income growth potential.',
    href: '/insights/dividend-stocks-2026',
    category: 'Income Investing',
    icon: '💰',
  },
]

export default function InsightsPage() {
  const pageUrl = `${SITE_URL}/insights`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Insights & Predictions for 2026',
    description: 'Expert analysis, predictions, and top stock picks for 2026. AI-powered insights for smarter investing.',
    url: pageUrl,
    keywords: ['stock market insights 2026', 'stock predictions 2026', 'best stocks 2026'],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema]) }}
      />
      <Header />
      <main className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <span>Insights</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Stock Market Insights 2026
            </h1>
            <p className="text-xl text-[#868f97] max-w-3xl">
              Expert predictions, comprehensive analysis, and top stock picks for 2026.
              Make informed investment decisions with AI-powered insights and data-driven research.
            </p>
          </div>

          {/* Prediction Accuracy Summary Banner */}
          <section className="mb-12">
            <Link href="/insights/prediction-accuracy" className="block hover:opacity-90 motion-safe:transition-all motion-safe:duration-150 ease-out">
              <PredictionAccuracy />
            </Link>
            <div className="mt-3 text-center">
              <Link
                href="/insights/prediction-accuracy"
                className="text-[#4ebe96] hover:text-[#4ebe96]/80 font-medium text-sm inline-flex items-center gap-1 motion-safe:transition-all motion-safe:duration-150 ease-out"
              >
                View Full Track Record
                <span>→</span>
              </Link>
            </div>
          </section>

          {/* Featured Insights Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Featured Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <Link
                  key={insight.href}
                  href={insight.href}
                  className={`group bg-white/[0.03] backdrop-blur-[10px] p-8 rounded-2xl border motion-safe:transition-all motion-safe:duration-150 ease-out ${
                    insight.featured
                      ? 'border-[#4ebe96]/50 hover:border-[#4ebe96] bg-gradient-to-br from-[#4ebe96]/10 to-transparent'
                      : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{insight.icon}</span>
                    <div className="flex-1">
                      <span className={`text-xs font-medium uppercase tracking-wider ${
                        insight.featured ? 'text-[#4ebe96]' : 'text-[#4ebe96]'
                      }`}>
                        {insight.category}
                      </span>
                      <h3 className="text-2xl font-bold mt-1 group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                        {insight.title}
                      </h3>
                    </div>
                    {insight.featured && (
                      <span className="bg-[#4ebe96]/20 text-[#4ebe96] text-xs px-2 py-1 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-[#868f97] mb-4">
                    {insight.description}
                  </p>
                  <span className="text-[#4ebe96] font-medium inline-flex items-center gap-2">
                    Read Full Analysis
                    <span className="group-hover:translate-x-1 motion-safe:transition-all motion-safe:duration-150 ease-out">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Key Market Trends */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">2026 Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-lg font-bold mb-2">AI Revolution</h3>
                <p className="text-sm text-[#868f97]">
                  Artificial intelligence continues to drive market growth with enterprise adoption accelerating
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">💹</div>
                <h3 className="text-lg font-bold mb-2">Rate Normalization</h3>
                <p className="text-sm text-[#868f97]">
                  Interest rates stabilizing creating opportunities across growth and value stocks
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-lg font-bold mb-2">Global Expansion</h3>
                <p className="text-sm text-[#868f97]">
                  Emerging markets and international growth driving diversification strategies
                </p>
              </div>
            </div>
          </section>

          {/* Quick Access to Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Explore by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/best-stocks/tech" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">💻</div>
                <p className="font-medium">Tech Stocks</p>
              </Link>
              <Link href="/best-stocks/growth" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">📈</div>
                <p className="font-medium">Growth Stocks</p>
              </Link>
              <Link href="/best-stocks/dividend" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">💵</div>
                <p className="font-medium">Dividend Stocks</p>
              </Link>
              <Link href="/best-stocks/value" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">💎</div>
                <p className="font-medium">Value Stocks</p>
              </Link>
              <Link href="/best-stocks/healthcare" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">🏥</div>
                <p className="font-medium">Healthcare</p>
              </Link>
              <Link href="/best-stocks/energy" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-medium">Energy</p>
              </Link>
              <Link href="/sectors" className="bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] border border-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">🏭</div>
                <p className="font-medium">All Sectors</p>
              </Link>
              <Link href="/dashboard" className="bg-[#4ebe96]/20 text-[#4ebe96] p-4 rounded-2xl hover:bg-[#4ebe96]/30 border border-[#4ebe96]/30 motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
                <div className="text-2xl mb-2">🔍</div>
                <p className="font-medium">Research Tool</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 p-10 rounded-2xl border border-[#4ebe96]/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Get AI-Powered Stock Analysis</h2>
            <p className="text-[#868f97] mb-6 max-w-2xl mx-auto">
              Access detailed DCF valuations, AI insights, financial analysis, and real-time data for any stock.
              Make smarter investment decisions backed by data.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-black px-8 py-3 rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
            >
              Start Researching Now
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
