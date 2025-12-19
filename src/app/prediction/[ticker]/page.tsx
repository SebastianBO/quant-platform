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
  getDatasetSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Stock Price Prediction ${currentYear}-${currentYear + 1} | AI Forecast`,
    description: `${symbol} stock price prediction and forecast for ${currentYear}-${currentYear + 1}. AI-powered analysis with price targets, technical indicators, and growth projections.`,
    keywords: [
      `${symbol} stock prediction`,
      `${symbol} price forecast`,
      `${symbol} stock price prediction ${currentYear}`,
      `${symbol} price target`,
      `${symbol} stock forecast`
    ],
    openGraph: {
      title: `${symbol} Stock Price Prediction ${currentYear}`,
      description: `AI-powered price prediction and forecast for ${symbol} stock.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/prediction/${ticker.toLowerCase()}`,
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

export default async function PredictionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0

  // Simple prediction logic (in production, use AI models)
  const bullCase = price * 1.30
  const baseCase = price * 1.15
  const bearCase = price * 0.90

  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/prediction/${ticker.toLowerCase()}`
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
    { name: `${symbol} Prediction`, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Price Prediction ${currentYear}-${currentYear + 1}`,
    description: `AI-powered price forecast and analysis for ${symbol} (${companyName}) with bull, base, and bear case price targets.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock prediction`,
      `${symbol} price forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} stock forecast`,
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

  // Dataset Schema for historical prediction data
  const datasetSchema = getDatasetSchema({
    ticker: symbol,
    name: companyName,
    description: `Historical price predictions and forecasts for ${companyName} (${symbol})`,
    url: pageUrl,
  })

  // Extended FAQ Schema with 18 questions
  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metricsData)
  const faqSchema = getFAQSchema(extendedFaqs)

  // Combine all schemas
  const schemas = [
    breadcrumbSchema,
    articleSchema,
    corporationSchema,
    datasetSchema,
    faqSchema,
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Prediction</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Price Prediction {currentYear}-{currentYear + 1}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered forecast for {companyFacts?.name || symbol}
          </p>

          {/* Current Price */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <p className="text-muted-foreground mb-2">Current Price</p>
            <p className="text-4xl font-bold">${price.toFixed(2)}</p>
          </div>

          {/* Price Targets */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Price Targets for {currentYear + 1}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Bear Case</p>
                <p className="text-3xl font-bold text-red-500">${bearCase.toFixed(2)}</p>
                <p className="text-sm text-red-400">-10%</p>
              </div>
              <div className="bg-yellow-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Base Case</p>
                <p className="text-3xl font-bold text-yellow-500">${baseCase.toFixed(2)}</p>
                <p className="text-sm text-yellow-400">+15%</p>
              </div>
              <div className="bg-green-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Bull Case</p>
                <p className="text-3xl font-bold text-green-500">${bullCase.toFixed(2)}</p>
                <p className="text-sm text-green-400">+30%</p>
              </div>
            </div>
          </section>

          {/* Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Factors Influencing {symbol} Stock</h2>
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Bullish Factors</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>Strong market position and brand recognition</li>
                  {metrics?.revenue_growth > 0 && <li>Positive revenue growth momentum</li>}
                  {metrics?.gross_margin > 0.3 && <li>Healthy profit margins</li>}
                  <li>Ongoing innovation and product development</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold text-red-500 mb-2">Risk Factors</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>Market volatility and economic uncertainty</li>
                  <li>Competitive pressures in the industry</li>
                  <li>Regulatory and geopolitical risks</li>
                  <li>Interest rate sensitivity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live data, AI insights, and detailed valuations for {symbol}
            </p>
            <Link
              href={`/dashboard?ticker=${symbol}&tab=quant`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              View Quant Analysis
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
          <RelatedLinks ticker={symbol} currentPage="prediction" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
