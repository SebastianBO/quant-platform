import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardContent from '@/components/DashboardContent'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFinancialProductSchema,
  getFAQSchema,
  getStockFAQs,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

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

// Dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

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
  const pageUrl = `${SITE_URL}/stock/${ticker.toLowerCase()}`

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

  // FAQ Schema for common questions
  const faqs = getStockFAQs(symbol, companyName, price)
  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            articleSchema,
            financialProductSchema,
            faqSchema,
          ]),
        }}
      />
      <Suspense fallback={<LoadingState />}>
        <DashboardContent initialTicker={symbol} initialTab="overview" />
      </Suspense>
    </>
  )
}
