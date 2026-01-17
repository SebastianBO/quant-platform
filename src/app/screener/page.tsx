import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'

// Force dynamic rendering since we use searchParams
export const revalidate = 3600
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

// Define type for what we actually fetch from company_fundamentals table
interface ScreenerStock {
  symbol: string
  company_name: string | null
  sector: string | null
  industry: string | null
  market_cap: number | null
  pe_ratio: number | null
  revenue: number | null
  exchange_code: string | null
  profit_margin: number | null
  revenue_growth: number | null
  dividend_yield: number | null
}

// Fetch stocks from Supabase based on filters
async function fetchStocks(params: SearchParams): Promise<ScreenerStock[]> {
  // Only select needed columns for better performance
  // Note: Using 'symbol' directly from company_fundamentals table
  const columns = 'symbol,company_name,sector,industry,market_cap,pe_ratio,revenue,exchange_code,profit_margin,revenue_growth,dividend_yield'

  let query = supabase
    .from('company_fundamentals')
    .select(columns)
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(100) // Reduced from 500 for faster initial load

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

  return (data || []) as ScreenerStock[]
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#4ebe96]"></div>
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
          <p className="text-base sm:text-lg text-[#868f97]">
            Filter {stocks.length.toLocaleString()}+ stocks by fundamentals to find your next investment
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-[#868f97] uppercase tracking-wide">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?sector=technology"
                className="px-3 sm:px-4 py-2 bg-[#479ffa]/10 hover:bg-[#479ffa]/20 border border-[#479ffa]/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Technology Stocks
              </Link>
              <Link
                href="/screener?pe_max=15"
                className="px-3 sm:px-4 py-2 bg-[#4ebe96]/10 hover:bg-[#4ebe96]/20 border border-[#4ebe96]/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Undervalued (P/E &lt; 15)
              </Link>
              <Link
                href="/screener?market_cap=large"
                className="px-3 sm:px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Large Cap
              </Link>
              <Link
                href="/screener?sector=healthcare"
                className="px-3 sm:px-4 py-2 bg-[#e15241]/10 hover:bg-[#e15241]/20 border border-[#e15241]/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Healthcare
              </Link>
              <Link
                href="/screener?sector=energy"
                className="px-3 sm:px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Energy
              </Link>
              <Link
                href="/screener?sector=financial"
                className="px-3 sm:px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Financial
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-[#868f97] uppercase tracking-wide">
              By Market Cap
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?market_cap=large"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Large Cap (&gt;$200B)
              </Link>
              <Link
                href="/screener?market_cap=mid"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Mid Cap ($10B-$200B)
              </Link>
              <Link
                href="/screener?market_cap=small"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Small Cap (&lt;$10B)
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold mb-3 text-[#868f97] uppercase tracking-wide">
              By Valuation
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/screener?pe_max=10"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Deep Value (P/E &lt; 10)
              </Link>
              <Link
                href="/screener?pe_max=15"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Value (P/E &lt; 15)
              </Link>
              <Link
                href="/screener?pe_max=25"
                className="px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs sm:text-sm font-medium transition-colors duration-100"
              >
                Reasonable (P/E &lt; 25)
              </Link>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6 p-3 sm:p-4 bg-[#479ffa]/10 border border-[#479ffa]/20 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold">Active Filters:</span>
              {activeFilters.map((filter, i) => (
                <span key={i} className="px-2 sm:px-3 py-1 bg-blue-600/20 rounded-full text-xs sm:text-sm">
                  {filter}
                </span>
              ))}
              <Link
                href="/screener"
                className="ml-auto text-xs sm:text-sm text-[#479ffa] hover:text-[#479ffa]"
              >
                Clear All
              </Link>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-white/[0.05]">
            <h2 className="font-semibold text-sm sm:text-base">
              {stocks.length.toLocaleString()} {activeFilters.length > 0 ? 'Matching' : 'Total'} Stocks
            </h2>
          </div>

          {stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.05]">
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Ticker</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Company</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Sector</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">Market Cap</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">P/E Ratio</th>
                    <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-white/[0.08] transition-colors duration-100"
                    >
                      <td className="px-3 sm:px-4 py-3">
                        <Link
                          href={`/stock/${stock.symbol.toLowerCase()}`}
                          className="font-bold text-[#4ebe96] hover:text-[#4ebe96] hover:underline text-xs sm:text-sm"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <Link
                          href={`/stock/${stock.symbol.toLowerCase()}`}
                          className="hover:underline"
                        >
                          {stock.company_name || stock.symbol}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-[#868f97]">
                        {stock.sector || '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right font-medium text-xs sm:text-sm">
                        <div>
                          {stock.market_cap ? formatMarketCap(stock.market_cap) : '—'}
                        </div>
                        <div className="text-xs text-[#868f97]">
                          {stock.market_cap ? getMarketCapCategory(stock.market_cap) : ''}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm">
                        {stock.pe_ratio ? (
                          <span
                            className={
                              stock.pe_ratio < 15
                                ? 'text-[#4ebe96] font-semibold'
                                : stock.pe_ratio > 30
                                ? 'text-[#e15241]'
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
            <div className="p-8 sm:p-12 text-center text-[#868f97]">
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
            <p className="text-sm sm:text-base text-[#868f97]">
              Our free stock screener helps you discover investment opportunities by filtering stocks
              based on fundamental metrics. Use the quick filters above or build custom screens with
              multiple criteria.
            </p>
            <ul className="text-sm sm:text-base text-[#868f97] space-y-2">
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
            <ul className="text-sm sm:text-base text-[#868f97] space-y-2">
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
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white/[0.05] rounded-lg">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Explore More Tools</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-[#479ffa] hover:text-[#479ffa] hover:underline"
            >
              Market Dashboard
            </Link>
            <Link
              href="/sectors"
              className="text-xs sm:text-sm text-[#479ffa] hover:text-[#479ffa] hover:underline"
            >
              Sector Analysis
            </Link>
            <Link
              href="/earnings"
              className="text-xs sm:text-sm text-[#479ffa] hover:text-[#479ffa] hover:underline"
            >
              Earnings Calendar
            </Link>
            <Link
              href="/insights"
              className="text-xs sm:text-sm text-[#479ffa] hover:text-[#479ffa] hover:underline"
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
      name: `${stock.symbol} - ${stock.company_name || stock.symbol}`,
      url: `${SITE_URL}/stock/${stock.symbol.toLowerCase()}`,
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

      {/* SSR Content - Visible immediately for crawlers */}
      <div className="ssr-content">
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <article>
              <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Free Stock Screener - Find Undervalued Stocks
                </h1>
                <p className="text-lg text-[#868f97]">
                  Filter {stocks.length.toLocaleString()}+ stocks by sector, market cap, P/E ratio, revenue, and more.
                  Our powerful stock scanner helps you discover investment opportunities with real-time data and fundamental analysis.
                </p>
              </header>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Popular Stock Screens</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Link href="/screener?sector=technology" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Technology Stocks</h3>
                    <p className="text-sm text-[#868f97]">Tech sector stocks</p>
                  </Link>
                  <Link href="/screener?pe_max=15" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Value Stocks</h3>
                    <p className="text-sm text-[#868f97]">P/E ratio under 15</p>
                  </Link>
                  <Link href="/screener?market_cap=large" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Large Cap Stocks</h3>
                    <p className="text-sm text-[#868f97]">Market cap &gt;$200B</p>
                  </Link>
                  <Link href="/screener?sector=healthcare" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Healthcare Stocks</h3>
                    <p className="text-sm text-[#868f97]">Healthcare sector</p>
                  </Link>
                  <Link href="/screener?sector=energy" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Energy Stocks</h3>
                    <p className="text-sm text-[#868f97]">Energy sector stocks</p>
                  </Link>
                  <Link href="/screener?pe_max=10" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Deep Value</h3>
                    <p className="text-sm text-[#868f97]">P/E ratio under 10</p>
                  </Link>
                  <Link href="/screener?market_cap=mid" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Mid Cap Stocks</h3>
                    <p className="text-sm text-[#868f97]">$10B - $200B market cap</p>
                  </Link>
                  <Link href="/screener?sector=financial" className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 hover:border-[#4ebe96]/50 transition-colors duration-100">
                    <h3 className="font-medium">Financial Stocks</h3>
                    <p className="text-sm text-[#868f97]">Financial sector</p>
                  </Link>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">How to Use Our Stock Screener</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-[#868f97]">
                    Our free stock screener helps you discover investment opportunities by filtering stocks
                    based on fundamental metrics. Screen for undervalued stocks using P/E ratios, find
                    large-cap blue chips for stability, or explore sector-specific opportunities.
                  </p>
                  <ul className="text-[#868f97] space-y-2 mt-4">
                    <li><strong>Sector Screening:</strong> Filter by technology, healthcare, energy, financials, and more</li>
                    <li><strong>Market Cap:</strong> Large cap (&gt;$200B), mid cap ($10B-$200B), or small cap (&lt;$10B)</li>
                    <li><strong>Valuation:</strong> Screen by P/E ratio to find undervalued stocks</li>
                    <li><strong>Revenue:</strong> Filter by company size based on annual revenue</li>
                  </ul>
                </div>
              </section>

              <nav className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
                <div className="flex flex-wrap gap-2">
                  <Link href="/earnings" className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium transition-colors duration-100">
                    Earnings Calendar
                  </Link>
                  <Link href="/sectors" className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium transition-colors duration-100">
                    Sector Analysis
                  </Link>
                  <Link href="/analyst-ratings" className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium transition-colors duration-100">
                    Analyst Ratings
                  </Link>
                  <Link href="/insider-trading" className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-sm font-medium transition-colors duration-100">
                    Insider Trading
                  </Link>
                </div>
              </nav>
            </article>
          </div>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <ScreenerContent params={params} />
      </Suspense>
      <Footer />
    </>
  )
}
