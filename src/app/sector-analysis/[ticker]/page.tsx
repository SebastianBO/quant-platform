import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase, CompanyFundamentals } from '@/lib/supabase'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'
import { formatCurrency } from '@/lib/utils'

interface Props {
  params: Promise<{ ticker: string }>
}

// Dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

// Helper function to format market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

// Fetch stock data including company facts
async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Fetch peer companies from Supabase based on sector and industry
async function fetchPeerCompanies(sector: string, industry: string, currentTicker: string): Promise<CompanyFundamentals[]> {
  if (!sector) return []

  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .ilike('sector', `%${sector}%`)
    .neq('ticker', currentTicker.toUpperCase())
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(20)

  if (error) {
    console.error('Error fetching peer companies:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  const companyName = stockData?.companyFacts?.name || symbol
  const sector = stockData?.companyFacts?.sector || 'Technology'
  const industry = stockData?.companyFacts?.industry || ''

  const title = `${symbol} Sector Analysis - ${sector} Industry Overview`
  const description = `${symbol} (${companyName}) sector and industry analysis. Compare ${symbol} to peers in the ${sector} sector${industry ? ` (${industry})` : ''}. View competitive positioning, sector performance, and peer comparison.`

  return {
    title,
    description,
    keywords: [
      `${symbol} sector`,
      `${symbol} industry`,
      `${symbol} peers`,
      `${symbol} competition`,
      `${sector} stocks`,
      `${symbol} vs competitors`,
      `${symbol} sector analysis`,
      `${companyName} industry`,
    ],
    openGraph: {
      title: `${symbol} Sector Analysis | Lician`,
      description,
      type: 'article',
      url: `${SITE_URL}/sector-analysis/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Sector Analysis`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/sector-analysis/${ticker.toLowerCase()}`,
    },
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

export default async function SectorAnalysisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  // Fetch stock data
  const stockData = await getStockData(symbol)

  if (!stockData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground pt-20">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-4">Stock Not Found</h1>
            <p className="text-muted-foreground">Unable to load sector analysis for {symbol}</p>
            <Link href="/dashboard" className="text-green-500 hover:underline mt-4 inline-block">
              Go to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const companyName = stockData.companyFacts?.name || symbol
  const sector = stockData.companyFacts?.sector || 'Unknown'
  const industry = stockData.companyFacts?.industry || 'Unknown'
  const description = stockData.companyFacts?.description || ''
  const price = stockData.snapshot?.price
  const marketCap = stockData.snapshot?.market_cap
  const peRatio = stockData.metrics?.price_to_earnings_ratio

  // Fetch peer companies
  const peerCompanies = await fetchPeerCompanies(sector, industry, symbol)
  const topPeers = peerCompanies.slice(0, 10)

  const pageUrl = `${SITE_URL}/sector-analysis/${ticker.toLowerCase()}`

  // Structured Data Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Sector Analysis', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Sector Analysis - ${sector} Industry Overview`,
    description: `Comprehensive sector and industry analysis for ${companyName} (${symbol}) including peer comparison and competitive positioning.`,
    url: pageUrl,
    keywords: [`${symbol} sector`, `${symbol} industry`, sector, industry],
  })

  const itemListSchema = getItemListSchema({
    name: `${symbol} Peer Companies in ${sector}`,
    description: `Top peer companies of ${symbol} in the ${sector} sector`,
    url: pageUrl,
    items: topPeers.map((peer, index) => ({
      name: `${peer.ticker} - ${peer.company_name || peer.ticker}`,
      url: `${SITE_URL}/stock/${peer.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema([
    {
      question: `What sector is ${symbol} in?`,
      answer: `${companyName} (${symbol}) operates in the ${sector} sector${industry !== 'Unknown' ? `, specifically in the ${industry} industry` : ''}.`,
    },
    {
      question: `Who are ${symbol}'s main competitors?`,
      answer: `${symbol}'s main competitors in the ${sector} sector include ${topPeers.slice(0, 5).map(p => p.ticker).join(', ')}. These companies compete in similar markets and product categories.`,
    },
    {
      question: `How does ${symbol} compare to its peers?`,
      answer: `${symbol} can be compared to peers using metrics like P/E ratio, market cap, revenue growth, and profitability. Visit our comparison page to see detailed side-by-side analysis with competitors.`,
    },
    {
      question: `What industry does ${symbol} operate in?`,
      answer: `${companyName} operates in the ${industry !== 'Unknown' ? industry : sector} industry, which is part of the broader ${sector} sector.`,
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, itemListSchema, faqSchema]),
        }}
      />

      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-foreground">{symbol}</Link>
            {' / '}
            <span>Sector Analysis</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {symbol} Sector Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              {companyName}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/sectors/${sector.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-colors font-medium"
              >
                {sector} Sector
              </Link>
              {industry !== 'Unknown' && (
                <span className="px-4 py-2 bg-secondary rounded-lg">
                  {industry}
                </span>
              )}
            </div>
          </div>

          {/* Company Overview */}
          <section className="mb-12 bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Company Overview</h2>
            {description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {description}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {price !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(price)}</p>
                </div>
              )}
              {marketCap !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">{formatMarketCap(marketCap)}</p>
                </div>
              )}
              {peRatio !== undefined && peRatio > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                  <p className="text-2xl font-bold">{peRatio.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Sector & Industry Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Sector & Industry Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Sector</h3>
                <p className="text-3xl font-bold text-green-500 mb-3">{sector}</p>
                <p className="text-sm text-muted-foreground">
                  {companyName} is classified in the {sector} sector, which includes companies in similar business categories and market segments.
                </p>
                <Link
                  href={`/sectors/${sector.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-block mt-4 text-green-500 hover:underline text-sm font-medium"
                >
                  View All {sector} Stocks →
                </Link>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Industry</h3>
                <p className="text-3xl font-bold text-green-500 mb-3">{industry}</p>
                <p className="text-sm text-muted-foreground">
                  Within the {sector} sector, {companyName} operates in the {industry} industry, competing with similar businesses in this specialized market.
                </p>
              </div>
            </div>
          </section>

          {/* Peer Comparison */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Peer Companies in {sector}
              </h2>
              <span className="text-sm text-muted-foreground">
                {topPeers.length} companies
              </span>
            </div>

            {topPeers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topPeers.map((peer, i) => (
                  <Link
                    key={peer.ticker}
                    href={`/stock/${peer.ticker.toLowerCase()}`}
                    className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <span className="text-xl font-bold">{peer.ticker}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {peer.company_name || peer.ticker}
                        </p>
                      </div>
                      <span className="text-xs text-green-500">View</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Market Cap</p>
                        <p className="font-semibold">
                          {peer.market_cap ? formatMarketCap(peer.market_cap) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">P/E Ratio</p>
                        <p className={`font-semibold ${
                          peer.pe_ratio && peer.pe_ratio < 15
                            ? 'text-green-500'
                            : peer.pe_ratio && peer.pe_ratio > 30
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {peer.pe_ratio ? peer.pe_ratio.toFixed(2) : '—'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">No peer companies found in this sector.</p>
              </div>
            )}
          </section>

          {/* Compare with Peers */}
          {topPeers.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Compare {symbol} with Peers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topPeers.slice(0, 6).map((peer) => (
                  <Link
                    key={peer.ticker}
                    href={`/compare/${ticker.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                    className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <p className="font-medium text-green-500">
                      {symbol} vs {peer.ticker}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {companyName} vs {peer.company_name || peer.ticker}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Analysis Tools */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{symbol} Analysis Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={`/stock/${ticker.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Full Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Complete financial analysis and valuation
                </p>
              </Link>

              <Link
                href={`/should-i-buy/${ticker.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Should I Buy?</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered buy/hold/sell recommendation
                </p>
              </Link>

              <Link
                href={`/prediction/${ticker.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Price Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Bull, base, and bear case scenarios
                </p>
              </Link>

              <Link
                href={`/analysis/${ticker.toLowerCase()}/valuation`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Valuation</h3>
                <p className="text-sm text-muted-foreground">
                  DCF model and valuation metrics
                </p>
              </Link>

              <Link
                href={`/financials/${ticker.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Financials</h3>
                <p className="text-sm text-muted-foreground">
                  Income, balance sheet, cash flow
                </p>
              </Link>

              <Link
                href={`/analyst/${ticker.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2">Analyst Ratings</h3>
                <p className="text-sm text-muted-foreground">
                  Wall Street consensus and targets
                </p>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold mb-2">What sector is {symbol} in?</h3>
                <p className="text-muted-foreground">
                  {companyName} ({symbol}) operates in the {sector} sector
                  {industry !== 'Unknown' ? `, specifically in the ${industry} industry` : ''}.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold mb-2">Who are {symbol}'s main competitors?</h3>
                <p className="text-muted-foreground">
                  {symbol}'s main competitors in the {sector} sector include {topPeers.slice(0, 5).map(p => p.ticker).join(', ')}.
                  These companies compete in similar markets and product categories.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold mb-2">How does {symbol} compare to its peers?</h3>
                <p className="text-muted-foreground">
                  {symbol} can be compared to peers using metrics like P/E ratio, market cap, revenue growth, and profitability.
                  Use our comparison tool above to see detailed side-by-side analysis with competitors.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold mb-2">What industry does {symbol} operate in?</h3>
                <p className="text-muted-foreground">
                  {companyName} operates in the {industry !== 'Unknown' ? industry : sector} industry,
                  which is part of the broader {sector} sector.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Explore More {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive financial analysis, AI insights, and real-time data for {companyName}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={`/stock/${ticker.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View {symbol} Stock Page
              </Link>
              <Link
                href={`/sectors/${sector.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block bg-secondary hover:bg-secondary/80 text-foreground px-8 py-3 rounded-lg font-medium"
              >
                Browse {sector} Stocks
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
