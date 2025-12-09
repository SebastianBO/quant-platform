import { Metadata } from 'next'
import {
  getBreadcrumbSchema,
  getFinancialProductSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  children: React.ReactNode
  params: Promise<{ ticker: string }>
}

// Generate dynamic metadata for stock pages
export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Fetch stock data for enhanced metadata
  let companyName = symbol
  let price: number | undefined
  let description = `${symbol} stock analysis, real-time quotes, financials, AI insights, and investment research.`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      if (companyName && price) {
        description = `${companyName} (${symbol}) stock at $${price.toFixed(2)}. Get AI-powered analysis, DCF valuations, short interest data, and comprehensive investment research.`
      }
    }
  } catch {
    // Use defaults if fetch fails
  }

  return {
    title: `${symbol} Stock Price, Quote & Analysis`,
    description,
    keywords: [
      `${symbol} stock`,
      `${symbol} stock price`,
      `${symbol} analysis`,
      `${symbol} quote`,
      `${companyName} stock`,
      `${symbol} financials`,
      `${symbol} valuation`,
    ],
    openGraph: {
      title: `${symbol} Stock - ${companyName}`,
      description: `Real-time ${symbol} stock analysis with AI insights, DCF valuations, and comprehensive research tools.`,
      type: 'website',
      url: `${SITE_URL}/stock/${symbol}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Analysis`,
      description: `AI-powered analysis for ${companyName} (${symbol})`,
    },
    alternates: {
      canonical: `${SITE_URL}/stock/${symbol}`,
    },
  }
}

export default async function StockLayout({ children, params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const pageUrl = `${SITE_URL}/stock/${symbol}`

  // Fetch company data for schema
  let companyName = symbol
  let price: number | undefined

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
    }
  } catch {
    // Use defaults
  }

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock`, url: pageUrl },
  ])

  // Financial Product Schema
  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: `${companyName} (${symbol}) stock analysis and investment research`,
    url: pageUrl,
    price,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, financialProductSchema]) }}
      />
      {children}
    </>
  )
}
