import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getStockFAQsExtended,
  getCorporationSchema,
  getAggregateRatingSchema,
  SITE_URL,
  combineSchemas,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `Should I Buy ${symbol} Stock in ${currentYear}? Expert Analysis & AI Prediction`,
    description: `Wondering if you should buy ${symbol} stock? Get AI-powered analysis, price targets, analyst ratings, and investment recommendations for ${symbol} in ${currentYear}.`,
    keywords: [
      `should i buy ${symbol}`,
      `${symbol} stock buy or sell`,
      `${symbol} stock analysis`,
      `${symbol} price prediction`,
      `${symbol} investment advice`,
      `is ${symbol} a good investment`
    ],
    openGraph: {
      title: `Should I Buy ${symbol} Stock? Expert Analysis`,
      description: `AI-powered analysis of ${symbol} stock. Get price targets, analyst ratings, and investment recommendations.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/should-i-buy/${ticker.toLowerCase()}`,
    },
  }
}

// Dynamic rendering - no static params to avoid slow build
export const dynamic = 'force-dynamic'

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

export default async function ShouldIBuyPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, analystEstimates } = stockData
  const price = snapshot.price || 0
  const peRatio = metrics?.price_to_earnings_ratio || 0
  const eps = metrics?.earnings_per_share || 0

  // Simple recommendation logic
  const getRecommendation = () => {
    if (peRatio > 0 && peRatio < 15) return { verdict: 'BUY', reason: 'Undervalued based on P/E ratio' }
    if (peRatio >= 15 && peRatio < 25) return { verdict: 'HOLD', reason: 'Fairly valued based on P/E ratio' }
    if (peRatio >= 25) return { verdict: 'CAUTION', reason: 'Premium valuation - consider waiting for a pullback' }
    return { verdict: 'RESEARCH', reason: 'More analysis needed' }
  }

  const recommendation = getRecommendation()

  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/should-i-buy/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} (${symbol}) common stock`

  // Prepare metrics for extended FAQ
  const metricsData = {
    price_to_earnings_ratio: metrics?.price_to_earnings_ratio,
    price_to_book_ratio: metrics?.price_to_book_ratio,
    market_cap: snapshot?.market_cap,
    earnings_per_share: metrics?.earnings_per_share,
    dividend_yield: metrics?.dividend_yield,
    revenue_growth: metrics?.revenue_growth,
    profit_margin: metrics?.profit_margin,
  }

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Should I Buy ${symbol}?`, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `Should I Buy ${symbol} Stock in ${currentYear}?`,
    description: `Expert analysis and AI prediction for ${symbol} (${companyName}) stock investment decision.`,
    url: pageUrl,
    keywords: [
      `should i buy ${symbol}`,
      `${symbol} stock buy or sell`,
      `${symbol} stock analysis`,
      `${symbol} investment advice`,
    ],
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  // Aggregate Rating Schema (if we have analyst data)
  let aggregateRatingSchema = null
  if (stockData?.analystRatings?.length > 0) {
    const ratings = stockData.analystRatings
    const ratingMap = { 'Strong Buy': 5, 'Buy': 4, 'Hold': 3, 'Sell': 2, 'Strong Sell': 1 }
    const avgRating = ratings.reduce((sum: number, r: any) => {
      return sum + (ratingMap[r.rating as keyof typeof ratingMap] || 3)
    }, 0) / ratings.length

    aggregateRatingSchema = getAggregateRatingSchema({
      ticker: symbol,
      ratingValue: avgRating,
      ratingCount: ratings.length,
      url: pageUrl,
    })
  }

  // Extended FAQ Schema with 18 questions
  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metricsData)
  const faqSchema = getFAQSchema(extendedFaqs)

  // Combine all schemas
  const schemas: object[] = [
    breadcrumbSchema,
    articleSchema,
    corporationSchema,
    faqSchema,
  ]

  if (aggregateRatingSchema) {
    schemas.push(aggregateRatingSchema)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>Should I Buy {symbol}?</span>
          </nav>

          {/* Main Title */}
          <h1 className="text-4xl font-bold mb-4">
            Should I Buy {symbol} Stock in {currentYear}?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered analysis and expert recommendations for {companyFacts?.name || symbol}
          </p>

          {/* Quick Answer Box */}
          <div className={`p-6 rounded-xl mb-8 ${
            recommendation.verdict === 'BUY' ? 'bg-green-500/20 border border-green-500/30' :
            recommendation.verdict === 'HOLD' ? 'bg-yellow-500/20 border border-yellow-500/30' :
            'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-3xl font-bold ${
                recommendation.verdict === 'BUY' ? 'text-green-500' :
                recommendation.verdict === 'HOLD' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {recommendation.verdict}
              </span>
              <span className="text-lg">{recommendation.reason}</span>
            </div>
            <p className="text-muted-foreground">
              Current Price: <span className="font-bold text-foreground">${price.toFixed(2)}</span>
            </p>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Investment Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-2xl font-bold">{peRatio > 0 ? peRatio.toFixed(2) : 'N/A'}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">EPS (TTM)</p>
                <p className="text-2xl font-bold">${eps > 0 ? eps.toFixed(2) : 'N/A'}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-2xl font-bold">
                  {snapshot.market_cap ? `$${(snapshot.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* Analysis Sections */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Consider {symbol}?</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="space-y-2">
                <li>{companyFacts?.name || symbol} is a leading company in its sector</li>
                {peRatio > 0 && peRatio < 20 && <li>Trading at an attractive P/E ratio of {peRatio.toFixed(2)}</li>}
                {metrics?.revenue_growth > 0 && <li>Showing positive revenue growth trends</li>}
                {metrics?.gross_margin > 0.3 && <li>Strong gross margins indicating pricing power</li>}
              </ul>
            </div>
          </section>

          {/* Analyst Estimates */}
          {analystEstimates?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Analyst Expectations</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">
                  Wall Street analysts have the following estimates for {symbol}:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {analystEstimates.slice(0, 2).map((est: any, i: number) => (
                    <div key={i}>
                      <p className="text-sm text-muted-foreground">{est.period}</p>
                      <p className="text-xl font-bold">EPS: ${est.eps_estimate_avg?.toFixed(2) || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get Detailed Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access AI-powered insights, DCF valuations, and real-time data for {symbol}
            </p>
            <Link
              href={`/dashboard?ticker=${symbol}&tab=ai`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section - using extended FAQs */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {extendedFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="should-i-buy" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
