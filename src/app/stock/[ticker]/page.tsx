import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardContent from '@/components/DashboardContent'
import StockSSRContent from '@/components/StockSSRContent'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFinancialProductSchema,
  getFAQSchema,
  getStockFAQsExtended,
  getCorporationSchema,
  getDatasetSchema,
  getAggregateRatingSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// Dynamic rendering - stock pages need fresh data
export const dynamic = 'force-dynamic'

// Generate metadata for SEO - This is the critical fix!
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Fetch stock data for rich metadata
  let companyName = symbol
  let price: number | undefined
  let description = `${symbol} stock analysis`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      description = data.companyFacts?.description?.slice(0, 160) ||
        `${companyName} (${symbol}) stock analysis, price charts, financial statements, and AI-powered investment insights.`
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  const title = `${symbol} Stock Price, Analysis & News - ${companyName}`
  const fullDescription = `${symbol} (${companyName}) stock analysis: ${price ? `Current price $${price.toFixed(2)}.` : ''} View real-time quotes, financial statements, DCF valuation, institutional ownership, insider trades, and AI-powered investment analysis.`

  return {
    title,
    description: fullDescription,
    keywords: [
      `${symbol} stock`,
      `${symbol} stock price`,
      `${symbol} analysis`,
      `${companyName} stock`,
      `${symbol} financials`,
      `${symbol} earnings`,
      `${symbol} valuation`,
      `${symbol} institutional ownership`,
      `buy ${symbol} stock`,
      `${symbol} forecast ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Stock Analysis | Lician`,
      description: fullDescription,
      type: 'article',
      url: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Stock Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Analysis`,
      description: fullDescription,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
    },
  }
}

// Fetch stock data for structured data
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

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

export default async function StockPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Fetch data for structured schema
  const stockData = await getStockData(symbol)
  const companyName = stockData?.companyFacts?.name || symbol
  const price = stockData?.snapshot?.price
  const exchange = stockData?.snapshot?.exchange || 'NYSE'
  const sector = stockData?.companyFacts?.sector
  const industry = stockData?.companyFacts?.industry
  const description = stockData?.companyFacts?.description || `${companyName} (${symbol}) common stock`
  const pageUrl = `${SITE_URL}/stock/${ticker.toLowerCase()}`

  // Prepare metrics for extended FAQ
  const metrics = {
    price_to_earnings_ratio: stockData?.metrics?.price_to_earnings_ratio,
    price_to_book_ratio: stockData?.metrics?.price_to_book_ratio,
    market_cap: stockData?.snapshot?.market_cap,
    earnings_per_share: stockData?.metrics?.earnings_per_share,
    dividend_yield: stockData?.metrics?.dividend_yield,
    revenue_growth: stockData?.metrics?.revenue_growth,
    profit_margin: stockData?.metrics?.profit_margin,
  }

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock`, url: pageUrl },
  ])

  // Article Schema for the analysis content
  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Analysis - ${companyName}`,
    description: `Comprehensive stock analysis for ${companyName} (${symbol}) including financials, valuation, and AI insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock`,
      `${symbol} analysis`,
      `${companyName} stock`,
      `${symbol} price`,
    ],
  })

  // Financial Product Schema for rich results
  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: `${companyName} (${symbol}) common stock traded on ${exchange}`,
    url: pageUrl,
    price,
    currency: 'USD',
    exchange,
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    exchange,
    url: pageUrl,
  })

  // Dataset Schema for historical data
  const datasetSchema = getDatasetSchema({
    ticker: symbol,
    name: companyName,
    description: `Historical price and trading data for ${companyName} (${symbol})`,
    url: pageUrl,
  })

  // Aggregate Rating Schema (if we have analyst data)
  let aggregateRatingSchema = null
  if (stockData?.analystRatings?.length > 0) {
    // Calculate average rating (assuming ratings are on a 1-5 scale where 5=Strong Buy)
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
  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metrics)
  const faqSchema = getFAQSchema(extendedFaqs)

  // Combine all schemas
  const schemas: object[] = [
    breadcrumbSchema,
    articleSchema,
    financialProductSchema,
    corporationSchema,
    datasetSchema,
    faqSchema,
  ]

  if (aggregateRatingSchema) {
    schemas.push(aggregateRatingSchema)
  }

  // Prepare SSR content props
  const ssrMetrics = {
    price_to_earnings_ratio: stockData?.metrics?.price_to_earnings_ratio,
    price_to_book_ratio: stockData?.metrics?.price_to_book_ratio,
    dividend_yield: stockData?.metrics?.dividend_yield,
    revenue_growth: stockData?.metrics?.revenue_growth,
    profit_margin: stockData?.metrics?.profit_margin,
    debt_to_equity: stockData?.metrics?.debt_to_equity,
    return_on_equity: stockData?.metrics?.return_on_equity,
    earnings_per_share: stockData?.metrics?.earnings_per_share,
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

      {/* SSR Content - Visible immediately for crawlers and initial paint */}
      {/* This content is server-rendered and provides unique, indexable content */}
      <div className="ssr-content">
        <StockSSRContent
          ticker={symbol}
          companyName={companyName}
          price={price}
          dayChange={stockData?.snapshot?.day_change}
          dayChangePercent={stockData?.snapshot?.day_change_percent}
          marketCap={stockData?.snapshot?.market_cap}
          peRatio={stockData?.metrics?.price_to_earnings_ratio}
          sector={sector}
          industry={industry}
          description={description}
          exchange={exchange}
          employees={stockData?.companyFacts?.employees}
          website={stockData?.companyFacts?.website}
          headquarters={stockData?.companyFacts?.headquarters}
          metrics={ssrMetrics}
        />
      </div>

      {/* Interactive Dashboard - Loads after JS hydration */}
      <Suspense fallback={<LoadingState />}>
        <DashboardContent initialTicker={symbol} initialTab="overview" />
      </Suspense>
    </>
  )
}
