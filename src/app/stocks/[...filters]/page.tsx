import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ filters: string[] }>
}

// Filter definitions with stocks
const FILTERS: Record<string, {
  label: string
  description: string
  stocks: string[]
}> = {
  // Sectors
  'technology': {
    label: 'Technology',
    description: 'Tech sector stocks including software, hardware, and semiconductors',
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMD', 'INTC', 'CRM', 'ADBE', 'ORCL', 'NOW']
  },
  'healthcare': {
    label: 'Healthcare',
    description: 'Healthcare and biotech companies',
    stocks: ['UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY']
  },
  'finance': {
    label: 'Finance',
    description: 'Banks, insurance, and financial services',
    stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'SCHW', 'COF']
  },
  'energy': {
    label: 'Energy',
    description: 'Oil, gas, and renewable energy companies',
    stocks: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY', 'PSX', 'VLO', 'MPC', 'PXD']
  },
  'consumer': {
    label: 'Consumer',
    description: 'Consumer goods and retail companies',
    stocks: ['AMZN', 'WMT', 'HD', 'COST', 'TGT', 'LOW', 'NKE', 'SBUX', 'MCD', 'DIS']
  },
  // Characteristics
  'dividend': {
    label: 'Dividend',
    description: 'High dividend yield stocks',
    stocks: ['JNJ', 'PG', 'KO', 'PEP', 'VZ', 'T', 'XOM', 'CVX', 'ABBV', 'MO']
  },
  'growth': {
    label: 'Growth',
    description: 'High growth potential stocks',
    stocks: ['NVDA', 'TSLA', 'AMD', 'CRM', 'SNOW', 'PLTR', 'CRWD', 'DDOG', 'NET', 'SHOP']
  },
  'value': {
    label: 'Value',
    description: 'Undervalued stocks with strong fundamentals',
    stocks: ['BRK.B', 'JPM', 'BAC', 'WFC', 'GM', 'F', 'INTC', 'VZ', 'CVS', 'WBA']
  },
  'ai': {
    label: 'AI',
    description: 'Artificial intelligence focused companies',
    stocks: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD', 'PLTR', 'CRM', 'SNOW', 'AI', 'PATH']
  },
  // Market cap
  'large-cap': {
    label: 'Large Cap',
    description: 'Companies with $10B+ market cap',
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ']
  },
  'mid-cap': {
    label: 'Mid Cap',
    description: 'Companies with $2B-$10B market cap',
    stocks: ['SNAP', 'ROKU', 'ETSY', 'PINS', 'ZM', 'DOCU', 'OKTA', 'TWLO', 'FSLY', 'NET']
  },
  // Price
  'under-50': {
    label: 'Under $50',
    description: 'Stocks priced under $50',
    stocks: ['F', 'T', 'VZ', 'INTC', 'WBD', 'PARA', 'SNAP', 'HOOD', 'SOFI', 'PLTR']
  },
  'under-100': {
    label: 'Under $100',
    description: 'Stocks priced under $100',
    stocks: ['AMD', 'QCOM', 'SBUX', 'NKE', 'DIS', 'BA', 'GM', 'PFE', 'MRK', 'C']
  },
}

function parseFilters(filters: string[]): string[] {
  // Handle formats like "dividend-technology" or ["dividend", "technology"]
  if (filters.length === 1 && filters[0].includes('-')) {
    return filters[0].split('-').filter(f => FILTERS[f])
  }
  return filters.filter(f => FILTERS[f])
}

function getFilteredStocks(activeFilters: string[]): string[] {
  if (activeFilters.length === 0) return []

  // Get intersection of stocks from all filters
  const stockSets = activeFilters.map(f => new Set(FILTERS[f]?.stocks || []))

  if (stockSets.length === 1) {
    return Array.from(stockSets[0])
  }

  // Find stocks that appear in ALL filter sets
  const intersection = stockSets.reduce((acc, set) => {
    return new Set([...acc].filter(stock => set.has(stock)))
  })

  // If no intersection, combine unique stocks from all filters
  if (intersection.size === 0) {
    const combined = new Set<string>()
    stockSets.forEach(set => set.forEach(stock => combined.add(stock)))
    return Array.from(combined).slice(0, 15)
  }

  return Array.from(intersection)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filters } = await params
  const activeFilters = parseFilters(filters)

  if (activeFilters.length === 0) {
    return { title: 'Stock Screener | Lician' }
  }

  const filterLabels = activeFilters.map(f => FILTERS[f]?.label).filter(Boolean)
  const title = `Best ${filterLabels.join(' ')} Stocks ${new Date().getFullYear()}`
  const description = `Find the best ${filterLabels.join(' ').toLowerCase()} stocks. AI-powered analysis with real-time data and valuations.`
  const slug = activeFilters.join('-')

  return {
    title,
    description,
    keywords: [
      ...activeFilters.map(f => `${f} stocks`),
      ...activeFilters.map(f => `best ${f} stocks`),
      `${filterLabels.join(' ')} stocks ${new Date().getFullYear()}`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      images: [`${SITE_URL}/api/og/stocks/${slug}`],
    },
    alternates: {
      canonical: `${SITE_URL}/stocks/${slug}`,
    },
  }
}

export default async function FilteredStocksPage({ params }: Props) {
  const { filters } = await params
  const activeFilters = parseFilters(filters)

  if (activeFilters.length === 0) {
    notFound()
  }

  const filterLabels = activeFilters.map(f => FILTERS[f]?.label).filter(Boolean)
  const stocks = getFilteredStocks(activeFilters)
  const currentYear = new Date().getFullYear()
  const slug = activeFilters.join('-')
  const pageUrl = `${SITE_URL}/stocks/${slug}`

  const title = `Best ${filterLabels.join(' ')} Stocks ${currentYear}`
  const description = `Top ${filterLabels.join(' ').toLowerCase()} stocks for ${currentYear} with AI-powered analysis.`

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: title, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: title,
    description,
    url: pageUrl,
    keywords: activeFilters,
  })

  const itemListSchema = getItemListSchema({
    name: title,
    description,
    url: pageUrl,
    items: stocks.map((stock, index) => ({
      name: stock,
      url: `${SITE_URL}/stock/${stock}`,
      position: index + 1,
    })),
  })

  // Generate related filter combinations
  const otherFilters = Object.keys(FILTERS).filter(f => !activeFilters.includes(f))
  const relatedCombinations = otherFilters.slice(0, 6).map(f => ({
    slug: [...activeFilters, f].sort().join('-'),
    label: [...filterLabels, FILTERS[f].label].join(' + '),
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, itemListSchema]) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Stocks</Link>
            {' / '}
            <span>{filterLabels.join(' + ')}</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-balance">{title}</h1>
          <p className="text-xl text-[#868f97] mb-8">{description}</p>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="px-3 py-1 bg-[#4ebe96]/20 text-[#4ebe96] rounded-full text-sm font-medium"
              >
                {FILTERS[filter]?.label}
              </span>
            ))}
          </div>

          {/* Stock Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Top Picks ({stocks.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stocks.map((stock, i) => (
                <Link
                  key={stock}
                  href={`/stock/${stock}`}
                  className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#868f97] tabular-nums">#{i + 1}</span>
                    <span className="text-xs text-[#4ebe96]">View</span>
                  </div>
                  <p className="text-lg font-bold tabular-nums">{stock}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Analysis Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Quick Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stocks.slice(0, 6).map((stock) => (
                <div key={stock} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4">
                  <p className="font-bold text-lg mb-2 tabular-nums">{stock}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Link href={`/should-i-buy/${stock.toLowerCase()}`} className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                      Should I Buy?
                    </Link>
                    <span className="text-[#868f97]">|</span>
                    <Link href={`/prediction/${stock.toLowerCase()}`} className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                      Prediction
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Combinations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Refine Your Search</h2>
            <div className="flex flex-wrap gap-2">
              {relatedCombinations.map((combo) => (
                <Link
                  key={combo.slug}
                  href={`/stocks/${combo.slug}`}
                  className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm"
                >
                  {combo.label}
                </Link>
              ))}
            </div>
          </section>

          {/* Other Filters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Explore Other Filters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {otherFilters.slice(0, 8).map((filter) => (
                <Link
                  key={filter}
                  href={`/stocks/${filter}`}
                  className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm text-center"
                >
                  {FILTERS[filter].label}
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-balance">Get AI-Powered Analysis</h2>
            <p className="text-[#868f97] mb-6">
              Access detailed analysis, DCF valuations, and AI insights for any stock
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
            >
              Start Research
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
