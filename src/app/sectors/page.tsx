import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const metadata: Metadata = {
  title: 'Stock Market Sectors - Explore All 11 Sectors | Lician',
  description: 'Explore all 11 stock market sectors including technology, healthcare, financials, energy, and more. Find the best stocks in each sector with AI-powered analysis.',
  keywords: [
    'stock market sectors',
    'sector analysis',
    'tech stocks',
    'healthcare stocks',
    'financial stocks',
    'sector investing',
    'best stocks by sector'
  ],
  openGraph: {
    title: 'Stock Market Sectors - Explore All 11 Sectors',
    description: 'Explore all 11 stock market sectors with top stocks, analysis tools, and AI-powered insights.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/sectors',
  },
}

// Sector data for the hub page
const SECTORS = [
  {
    slug: 'technology',
    title: 'Technology',
    icon: '💻',
    description: 'Software, semiconductors, cloud computing, AI, and tech hardware',
    topStocks: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'],
    stockCount: 20,
  },
  {
    slug: 'healthcare',
    title: 'Healthcare',
    icon: '🏥',
    description: 'Pharmaceuticals, biotechnology, medical devices, health insurance',
    topStocks: ['UNH', 'LLY', 'JNJ', 'ABBV', 'MRK'],
    stockCount: 20,
  },
  {
    slug: 'financials',
    title: 'Financials',
    icon: '🏦',
    description: 'Banks, investment firms, insurance, payment processors',
    topStocks: ['BRK.B', 'JPM', 'V', 'MA', 'BAC'],
    stockCount: 20,
  },
  {
    slug: 'energy',
    title: 'Energy',
    icon: '⚡',
    description: 'Oil & gas, refiners, renewables, energy infrastructure',
    topStocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB'],
    stockCount: 20,
  },
  {
    slug: 'consumer-discretionary',
    title: 'Consumer Discretionary',
    icon: '🛍️',
    description: 'Retail, automotive, restaurants, travel, entertainment',
    topStocks: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE'],
    stockCount: 20,
  },
  {
    slug: 'consumer-staples',
    title: 'Consumer Staples',
    icon: '🛒',
    description: 'Food, beverages, household products, personal care',
    topStocks: ['PG', 'KO', 'PEP', 'COST', 'WMT'],
    stockCount: 20,
  },
  {
    slug: 'industrials',
    title: 'Industrials',
    icon: '🏭',
    description: 'Aerospace, manufacturing, defense, construction, transportation',
    topStocks: ['CAT', 'BA', 'GE', 'HON', 'UNP'],
    stockCount: 20,
  },
  {
    slug: 'materials',
    title: 'Materials',
    icon: '⚒️',
    description: 'Chemicals, metals & mining, packaging, construction materials',
    topStocks: ['LIN', 'APD', 'SHW', 'ECL', 'NEM'],
    stockCount: 20,
  },
  {
    slug: 'utilities',
    title: 'Utilities',
    icon: '💡',
    description: 'Electric, natural gas, water utilities, renewable infrastructure',
    topStocks: ['NEE', 'SO', 'DUK', 'AEP', 'EXC'],
    stockCount: 20,
  },
  {
    slug: 'real-estate',
    title: 'Real Estate',
    icon: '🏢',
    description: 'REITs, residential, commercial, data centers, cell towers',
    topStocks: ['PLD', 'AMT', 'EQIX', 'CCI', 'PSA'],
    stockCount: 20,
  },
  {
    slug: 'communication-services',
    title: 'Communication Services',
    icon: '📱',
    description: 'Social media, telecom, streaming, gaming, entertainment',
    topStocks: ['GOOGL', 'META', 'NFLX', 'DIS', 'CMCSA'],
    stockCount: 20,
  },
]

export default function SectorsHubPage() {
  const pageUrl = `${SITE_URL}/sectors`
  const currentYear = new Date().getFullYear()

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Sectors', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `Stock Market Sectors ${currentYear} - Complete Sector Analysis`,
    description: 'Explore all 11 stock market sectors with top stocks, performance analysis, and investment opportunities.',
    url: pageUrl,
    keywords: ['stock market sectors', 'sector analysis', 'sector investing', 'best stocks by sector'],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema])
        }}
      />
      <Header />
      <main className="min-h-dvh bg-black text-white pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <span>Sectors</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Stock Market Sectors {currentYear}
            </h1>
            <p className="text-xl text-[#868f97] mb-4">
              Explore all 11 stock market sectors with top-performing stocks, comprehensive analysis, and AI-powered insights.
            </p>
            <p className="text-base text-[#868f97] max-w-3xl">
              The stock market is divided into 11 sectors based on the Global Industry Classification Standard (GICS).
              Each sector represents companies with similar business characteristics and economic drivers. Understanding
              sector dynamics is crucial for portfolio diversification and identifying investment opportunities.
            </p>
          </div>

          {/* Sectors Grid */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECTORS.map((sector) => (
                <Link
                  key={sector.slug}
                  href={`/sectors/${sector.slug}`}
                  className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{sector.icon}</span>
                    <span className="text-xs text-[#868f97] bg-white/[0.05] px-2 py-1 rounded-full">
                      {sector.stockCount} stocks
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                    {sector.title}
                  </h2>
                  <p className="text-sm text-[#868f97] mb-4">
                    {sector.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sector.topStocks.map((stock) => (
                      <span
                        key={stock}
                        className="text-xs bg-white/[0.05] px-2 py-1 rounded-full font-medium"
                      >
                        {stock}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-[#4ebe96] group-hover:underline">
                    Explore {sector.title} →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Sector Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Understanding Stock Market Sectors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3 text-[#4ebe96]">Growth Sectors</h3>
                <p className="text-sm text-[#868f97] mb-3">
                  High-growth potential with above-average earnings growth
                </p>
                <div className="space-y-2">
                  <Link href="/sectors/technology" className="block text-sm hover:text-[#4ebe96]">
                    • Technology
                  </Link>
                  <Link href="/sectors/healthcare" className="block text-sm hover:text-[#4ebe96]">
                    • Healthcare
                  </Link>
                  <Link href="/sectors/communication-services" className="block text-sm hover:text-[#4ebe96]">
                    • Communication Services
                  </Link>
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3 text-[#479ffa]">Cyclical Sectors</h3>
                <p className="text-sm text-[#868f97] mb-3">
                  Performance tied to economic cycles and growth
                </p>
                <div className="space-y-2">
                  <Link href="/sectors/consumer-discretionary" className="block text-sm hover:text-[#4ebe96]">
                    • Consumer Discretionary
                  </Link>
                  <Link href="/sectors/industrials" className="block text-sm hover:text-[#4ebe96]">
                    • Industrials
                  </Link>
                  <Link href="/sectors/materials" className="block text-sm hover:text-[#4ebe96]">
                    • Materials
                  </Link>
                  <Link href="/sectors/financials" className="block text-sm hover:text-[#4ebe96]">
                    • Financials
                  </Link>
                  <Link href="/sectors/energy" className="block text-sm hover:text-[#4ebe96]">
                    • Energy
                  </Link>
                  <Link href="/sectors/real-estate" className="block text-sm hover:text-[#4ebe96]">
                    • Real Estate
                  </Link>
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3 text-[#ffa16c]">Defensive Sectors</h3>
                <p className="text-sm text-[#868f97] mb-3">
                  Stable earnings regardless of economic conditions
                </p>
                <div className="space-y-2">
                  <Link href="/sectors/consumer-staples" className="block text-sm hover:text-[#4ebe96]">
                    • Consumer Staples
                  </Link>
                  <Link href="/sectors/utilities" className="block text-sm hover:text-[#4ebe96]">
                    • Utilities
                  </Link>
                  <Link href="/sectors/healthcare" className="block text-sm hover:text-[#4ebe96]">
                    • Healthcare
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Why Sector Analysis Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Sector Analysis Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">Diversification</h3>
                <p className="text-[#868f97]">
                  Spreading investments across different sectors reduces portfolio risk by minimizing exposure
                  to sector-specific downturns. Different sectors perform well at different stages of the
                  economic cycle.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">Opportunity Identification</h3>
                <p className="text-[#868f97]">
                  Understanding sector trends helps identify emerging opportunities and avoid declining
                  industries. Sector rotation strategies can enhance returns by shifting capital to
                  sectors poised to outperform.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">Risk Management</h3>
                <p className="text-[#868f97]">
                  Different sectors have different risk profiles. Defensive sectors like utilities provide
                  stability, while growth sectors like technology offer higher returns with greater volatility.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">Economic Understanding</h3>
                <p className="text-[#868f97]">
                  Sector performance reflects broader economic conditions. Monitoring sector trends provides
                  insights into economic health, inflation, interest rates, and consumer confidence.
                </p>
              </div>
            </div>
          </section>

          {/* Popular Stock Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Stock Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/best-stocks/tech"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-colors motion-safe:duration-150 ease-out text-center"
              >
                <p className="font-bold mb-1">Tech Stocks</p>
                <p className="text-xs text-[#868f97]">Innovation leaders</p>
              </Link>
              <Link
                href="/best-stocks/dividend"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-colors motion-safe:duration-150 ease-out text-center"
              >
                <p className="font-bold mb-1">Dividend Stocks</p>
                <p className="text-xs text-[#868f97]">Income generators</p>
              </Link>
              <Link
                href="/best-stocks/growth"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-colors motion-safe:duration-150 ease-out text-center"
              >
                <p className="font-bold mb-1">Growth Stocks</p>
                <p className="text-xs text-[#868f97]">High potential</p>
              </Link>
              <Link
                href="/best-stocks/value"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-colors motion-safe:duration-150 ease-out text-center"
              >
                <p className="font-bold mb-1">Value Stocks</p>
                <p className="text-xs text-[#868f97]">Undervalued gems</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] p-8 rounded-2xl border border-white/[0.08] text-center">
            <h2 className="text-2xl font-bold mb-4">Start Analyzing Stocks Today</h2>
            <p className="text-[#868f97] mb-6">
              Get AI-powered analysis, DCF valuations, and comprehensive insights for any stock across all sectors
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-8 py-3 rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out"
            >
              Access Dashboard
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
