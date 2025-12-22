import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { supabase, CompanyFundamentals } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

interface SearchParams {
  sector?: string
  market_cap?: string
  pe_min?: string
  pe_max?: string
  revenue_min?: string
  revenue_max?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const currentYear = new Date().getFullYear()

  // Build dynamic title based on filters
  let titleParts: string[] = []
  let description = 'Free stock screener to find the best stocks. Filter by sector, market cap, P/E ratio, revenue, and more. '

  if (params.sector) {
    const sector = params.sector.replace(/-/g, ' ')
    titleParts.push(`${sector.charAt(0).toUpperCase() + sector.slice(1)} Stocks`)
    description += `Showing ${sector} sector stocks. `
  }

  if (params.market_cap === 'large') {
    titleParts.push('Large Cap')
    description += 'Filtered for large-cap companies (>$200B market cap). '
  } else if (params.market_cap === 'mid') {
    titleParts.push('Mid Cap')
    description += 'Filtered for mid-cap companies ($10B-$200B market cap). '
  } else if (params.market_cap === 'small') {
    titleParts.push('Small Cap')
    description += 'Filtered for small-cap companies (<$10B market cap). '
  }

  if (params.pe_max) {
    titleParts.push(`P/E < ${params.pe_max}`)
    description += `P/E ratio under ${params.pe_max}. `
  }

  const title = titleParts.length > 0
    ? `${titleParts.join(' | ')} - Stock Screener | Lician`
    : `Free Stock Screener - Find Undervalued Stocks ${currentYear} | Lician`

  description += 'Powerful stock scanner with real-time data, fundamental analysis, and AI-powered insights.'

  const url = `${SITE_URL}/screener${buildQueryString(params)}`

  return {
    title,
    description,
    keywords: [
      'stock screener',
      'free stock screener',
      'stock scanner',
      'find undervalued stocks',
      'stock filter',
      'stock search tool',
      'best stock screener',
      'fundamental stock screener',
      `stock screener ${currentYear}`,
      'value stocks',
      'growth stocks',
      'dividend stocks',
      'stock screening tool',
      'stock market screener',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [
        {
          url: `${SITE_URL}/api/og/screener`,
          width: 1200,
          height: 630,
          alt: 'Stock Screener',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/api/og/screener`],
    },
    alternates: {
      canonical: url,
    },
  }
}

// Build query string from params
function buildQueryString(params: SearchParams): string {
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value)
  })
  const qs = queryParams.toString()
  return qs ? `?${qs}` : ''
}

// Format market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

// Format revenue
function formatRevenue(revenue: number): string {
  if (revenue >= 1e12) return `$${(revenue / 1e12).toFixed(2)}T`
  if (revenue >= 1e9) return `$${(revenue / 1e9).toFixed(2)}B`
  if (revenue >= 1e6) return `$${(revenue / 1e6).toFixed(2)}M`
  return `$${revenue.toLocaleString()}`
}

// Get market cap category
function getMarketCapCategory(marketCap: number): string {
  if (marketCap >= 200e9) return 'Large Cap'
  if (marketCap >= 10e9) return 'Mid Cap'
  return 'Small Cap'
}

// Fetch stocks from Supabase based on filters
async function fetchStocks(params: SearchParams): Promise<CompanyFundamentals[]> {
  let query = supabase
    .from('company_fundamentals')
    .select('*')
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(500)

  // Filter by sector
  if (params.sector) {
    const sector = params.sector.replace(/-/g, ' ')
    query = query.ilike('sector', `%${sector}%`)
  }

  // Filter by market cap
  if (params.market_cap === 'large') {
    query = query.gte('market_cap', 200e9)
  } else if (params.market_cap === 'mid') {
    query = query.gte('market_cap', 10e9).lt('market_cap', 200e9)
  } else if (params.market_cap === 'small') {
    query = query.lt('market_cap', 10e9)
  }

  // Filter by P/E ratio
  if (params.pe_min) {
    query = query.gte('pe_ratio', parseFloat(params.pe_min))
  }
  if (params.pe_max) {
    query = query.lte('pe_ratio', parseFloat(params.pe_max))
  }

  // Filter by revenue
  if (params.revenue_min) {
    query = query.gte('revenue', parseFloat(params.revenue_min))
  }
  if (params.revenue_max) {
    query = query.lte('revenue', parseFloat(params.revenue_max))
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching stocks:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

// Main screener content component
async function ScreenerContent({ params }: { params: SearchParams }) {
  const stocks = await fetchStocks(params)

  const activeFilters: string[] = []
  if (params.sector) activeFilters.push(`Sector: ${params.sector.replace(/-/g, ' ')}`)
  if (params.market_cap) activeFilters.push(`Market Cap: ${params.market_cap}`)
  if (params.pe_max) activeFilters.push(`P/E ≤ ${params.pe_max}`)
  if (params.revenue_min) activeFilters.push(`Revenue ≥ $${(parseFloat(params.revenue_min) / 1e9).toFixed(1)}B`)

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block">
            <SEOSidebar />
          </div>
          <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Stock Screener
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Filter {stocks.length.toLocaleString()}+ stocks by fundamentals to find your next investment
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?sector=technology"
                className="px-3 sm:px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Technology Stocks
              </Link>
              <Link
                href="/screener?pe_max=15"
                className="px-3 sm:px-4 py-2 bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Undervalued (P/E &lt; 15)
              </Link>
              <Link
                href="/screener?market_cap=large"
                className="px-3 sm:px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Large Cap
              </Link>
              <Link
                href="/screener?sector=healthcare"
                className="px-3 sm:px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Healthcare
              </Link>
              <Link
                href="/screener?sector=energy"
                className="px-3 sm:px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Energy
              </Link>
              <Link
                href="/screener?sector=financial"
                className="px-3 sm:px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Financial
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              By Market Cap
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?market_cap=large"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Large Cap (&gt;$200B)
              </Link>
              <Link
                href="/screener?market_cap=mid"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Mid Cap ($10B-$200B)
              </Link>
              <Link
                href="/screener?market_cap=small"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Small Cap (&lt;$10B)
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              By Valuation
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?pe_max=10"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Deep Value (P/E &lt; 10)
              </Link>
              <Link
                href="/screener?pe_max=15"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Value (P/E &lt; 15)
              </Link>
              <Link
                href="/screener?pe_max=25"
                className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Reasonable (P/E &lt; 25)
              </Link>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6 p-3 sm:p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold">Active Filters:</span>
              {activeFilters.map((filter, i) => (
                <span key={i} className="px-2 sm:px-3 py-1 bg-blue-600/20 rounded-full text-xs sm:text-sm">
                  {filter}
                </span>
              ))}
              <Link
                href="/screener"
                className="ml-auto text-xs sm:text-sm text-blue-400 hover:text-blue-300"
              >
                Clear All
              </Link>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-border bg-secondary/30">
            <h2 className="font-semibold text-sm sm:text-base">
              {stocks.length.toLocaleString()} {activeFilters.length > 0 ? 'Matching' : 'Total'} Stocks
            </h2>
          </div>

          {stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr className="border-b border-border">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Ticker</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Company</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Sector</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">Market Cap</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">P/E Ratio</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stocks.map((stock) => (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-3">
                        <Link
                          href={`/stock/${stock.ticker.toLowerCase()}`}
                          className="font-bold text-green-500 hover:text-green-400 hover:underline text-xs sm:text-sm"
                        >
                          {stock.ticker}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <Link
                          href={`/stock/${stock.ticker.toLowerCase()}`}
                          className="hover:underline"
                        >
                          {stock.company_name || stock.ticker}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                        {stock.sector || '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right font-medium text-xs sm:text-sm">
                        <div>
                          {stock.market_cap ? formatMarketCap(stock.market_cap) : '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stock.market_cap ? getMarketCapCategory(stock.market_cap) : ''}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm">
                        {stock.pe_ratio ? (
                          <span
                            className={
                              stock.pe_ratio < 15
                                ? 'text-green-500 font-semibold'
                                : stock.pe_ratio > 30
                                ? 'text-red-500'
                                : ''
                            }
                          >
                            {stock.pe_ratio.toFixed(2)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right font-medium text-xs sm:text-sm">
                        {stock.revenue ? formatRevenue(stock.revenue) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center text-muted-foreground">
              <div className="text-3xl sm:text-4xl mb-4">🔍</div>
              <p className="text-base sm:text-lg font-medium mb-2">No stocks found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Educational Content for SEO */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How to Use Our Stock Screener</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our free stock screener helps you discover investment opportunities by filtering stocks
              based on fundamental metrics. Use the quick filters above or build custom screens with
              multiple criteria.
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground space-y-2">
              <li>
                <strong>Sector Screening:</strong> Filter by industry sectors like technology,
                healthcare, energy, and financials
              </li>
              <li>
                <strong>Market Cap:</strong> Find large-cap blue chips, mid-cap growth stocks, or
                small-cap opportunities
              </li>
              <li>
                <strong>Valuation:</strong> Screen for undervalued stocks using P/E ratios and other
                metrics
              </li>
              <li>
                <strong>Revenue Size:</strong> Filter companies by annual revenue to match your
                investment strategy
              </li>
            </ul>
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Popular Screening Strategies</h2>
            <ul className="text-sm sm:text-base text-muted-foreground space-y-2">
              <li>
                <strong>Value Investing:</strong> Look for stocks with P/E ratios below 15 and strong
                fundamentals
              </li>
              <li>
                <strong>Large Cap Stability:</strong> Focus on companies with market caps over $200B
                for lower volatility
              </li>
              <li>
                <strong>Sector Rotation:</strong> Screen by sector to identify industries with
                tailwinds
              </li>
              <li>
                <strong>Small Cap Growth:</strong> Find emerging companies with high growth potential
              </li>
              <li>
                <strong>Dividend Stocks:</strong> Combine low P/E with high market cap for income
                investments
              </li>
            </ul>
          </div>
        </div>

        {/* Related Links for Internal Linking */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-secondary/30 rounded-lg">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Explore More Tools</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Market Dashboard
            </Link>
            <Link
              href="/sectors"
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Sector Analysis
            </Link>
            <Link
              href="/earnings"
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Earnings Calendar
            </Link>
            <Link
              href="/insights"
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Market Insights
            </Link>
          </div>
        </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Main page component with schema markup
export default async function ScreenerPage({ searchParams }: Props) {
  const params = await searchParams
  const pageUrl = `${SITE_URL}/screener${buildQueryString(params)}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: 'Free Stock Screener - Find the Best Stocks to Invest In',
    description:
      'Powerful stock screening tool to filter stocks by sector, market cap, P/E ratio, revenue, and fundamental metrics. Find undervalued stocks and investment opportunities.',
    url: pageUrl,
    keywords: [
      'stock screener',
      'stock scanner',
      'find stocks',
      'undervalued stocks',
      'stock filter',
    ],
  })

  // FAQ Schema
  const faqSchema = getFAQSchema([
    {
      question: 'What is a stock screener?',
      answer:
        'A stock screener is a tool that filters stocks based on specific criteria like market cap, P/E ratio, sector, and other fundamental metrics. It helps investors discover stocks that match their investment strategy.',
    },
    {
      question: 'How do I find undervalued stocks with a screener?',
      answer:
        'To find undervalued stocks, filter for low P/E ratios (typically below 15), strong fundamentals, and companies in your preferred sectors. Our screener lets you combine multiple criteria to identify potential value opportunities.',
    },
    {
      question: 'What is the best P/E ratio for value stocks?',
      answer:
        'Value investors typically look for P/E ratios below 15. A P/E ratio below 10 may indicate deep value, while ratios between 10-15 suggest reasonable valuation. However, P/E should be compared within the same industry for context.',
    },
    {
      question: 'How do I screen for large cap stocks?',
      answer:
        'Large cap stocks have market capitalizations over $200 billion. Use our market cap filter to find established companies with lower volatility and more stability.',
    },
    {
      question: 'Can I screen stocks by sector?',
      answer:
        'Yes! Our screener allows you to filter stocks by sector including technology, healthcare, energy, financials, and more. Sector screening helps you focus on industries with specific growth trends or tailwinds.',
    },
    {
      question: 'What makes a good stock screening strategy?',
      answer:
        'A good screening strategy combines multiple criteria aligned with your investment goals. For value investing, combine low P/E with stable sectors. For growth, focus on high-revenue technology sectors. Always validate screener results with deeper fundamental analysis.',
    },
  ])

  // Fetch stocks for ItemList schema
  const stocks = await fetchStocks(params)
  const itemListSchema = getItemListSchema({
    name: 'Stock Screener Results',
    description: 'Stocks matching screening criteria',
    url: pageUrl,
    items: stocks.slice(0, 50).map((stock, index) => ({
      name: `${stock.ticker} - ${stock.company_name || stock.ticker}`,
      url: `${SITE_URL}/stock/${stock.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  // Combine all schemas - explicitly type as object[]
  const schemas: object[] = [breadcrumbSchema, articleSchema, faqSchema]
  if (stocks.length > 0) {
    schemas.push(itemListSchema as object)
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <Header />
      <Suspense fallback={<LoadingState />}>
        <ScreenerContent params={params} />
      </Suspense>
      <Footer />
    </>
  )
}
