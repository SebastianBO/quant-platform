import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} API Calls - Platform Usage & Consumption Metrics`,
    description: `${symbol} API call volume analysis. Track platform consumption, usage-based revenue, API growth, and developer engagement metrics.`,
    keywords: [
      `${symbol} API calls`,
      `${symbol} API usage`,
      `${symbol} platform consumption`,
      `${symbol} API metrics`,
      `${symbol} usage-based revenue`,
      `${symbol} API growth`,
    ],
    openGraph: {
      title: `${symbol} API Calls | Platform Consumption Metrics`,
      description: `Comprehensive analysis of ${symbol} API call volumes and platform consumption trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/api-calls/${ticker.toLowerCase()}`,
    },
  }
}

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

export default async function APICallsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/api-calls/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many API calls does ${symbol} process?`,
      answer: `${symbol} (${companyName}) reports API call volumes as a measure of platform consumption and usage intensity. API call growth indicates increasing platform engagement and revenue potential.`
    },
    {
      question: `What is ${symbol}'s API call growth rate?`,
      answer: `API call growth rate shows the trajectory of platform consumption for ${companyName}. Accelerating growth signals strong product adoption and customer expansion.`
    },
    {
      question: `How does ${symbol} monetize API calls?`,
      answer: `Companies like ${companyName} often use usage-based pricing models where API calls directly drive revenue through consumption tiers, overage charges, or volume-based plans.`
    },
    {
      question: `What drives API call volume for ${symbol}?`,
      answer: `API call growth is driven by new customer acquisition, existing customer expansion, new use case adoption, and third-party application development on ${symbol}'s platform.`
    },
    {
      question: `Are API calls a good metric for ${symbol} stock?`,
      answer: `API call volumes serve as a leading indicator of revenue growth, platform stickiness, and ecosystem health for ${companyName}. Higher usage correlates with revenue expansion.`
    },
    {
      question: `What is ${symbol}'s API infrastructure capacity?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}API infrastructure scalability is critical. ${companyName}'s ability to handle growing API volumes while maintaining performance affects customer satisfaction.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} API Calls`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} API Calls - Platform Usage & Consumption Metrics`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) API call volumes and platform consumption.`,
    url: pageUrl,
    keywords: [
      `${symbol} API calls`,
      `${symbol} API usage`,
      `${symbol} platform consumption`,
      `${symbol} API metrics`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(faqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

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
            <span>{symbol} API Calls</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} API Calls
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Platform usage and consumption metrics for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* API Calls Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">API Calls Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                API call volume measures how frequently customers and developers interact with {companyName}'s platform.
                This consumption metric is a key indicator of platform engagement and usage-based revenue potential.
              </p>
              <p className="text-muted-foreground">
                Growing API call volumes indicate increasing platform dependency, customer expansion, and ecosystem vitality.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Consumption Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(snapshot.market_cap / 1e9).toFixed(1)}B
                </p>
              </div>
              {metrics?.revenue_growth && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(metrics.revenue_growth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {metrics?.gross_margin && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-xl font-bold">{(metrics.gross_margin * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </section>

          {/* Why API Calls Matter */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why API Calls Matter</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Revenue Indicator:</strong> API calls directly correlate with usage-based revenue growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Engagement Signal:</strong> High call volumes indicate deep product integration and dependency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Retention Driver:</strong> Customers with high API usage have lower churn rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Expansion Opportunity:</strong> Growing call volumes create upsell and cross-sell opportunities</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Usage Trends</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed consumption analytics, growth metrics, and revenue projections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="api-calls" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
