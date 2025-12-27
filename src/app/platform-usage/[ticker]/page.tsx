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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Platform Usage - Engagement Metrics & Product Adoption`,
    description: `${symbol} platform usage analysis. Track user engagement, feature adoption, session metrics, and product stickiness indicators.`,
    keywords: [
      `${symbol} platform usage`,
      `${symbol} user engagement`,
      `${symbol} product adoption`,
      `${symbol} usage metrics`,
      `${symbol} DAU MAU`,
      `${symbol} engagement`,
    ],
    openGraph: {
      title: `${symbol} Platform Usage | Engagement & Adoption Metrics`,
      description: `Comprehensive analysis of ${symbol} platform usage, user engagement, and product adoption trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/platform-usage/${ticker.toLowerCase()}`,
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

export default async function PlatformUsagePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/platform-usage/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How is ${symbol}'s platform usage measured?`,
      answer: `${symbol} (${companyName}) tracks platform usage through metrics like daily/monthly active users (DAU/MAU), session frequency, feature adoption rates, and time spent on platform.`
    },
    {
      question: `What does platform usage tell us about ${symbol}?`,
      answer: `Platform usage metrics reveal product stickiness, user satisfaction, and retention health. Strong usage indicates ${companyName} has achieved product-market fit and user dependency.`
    },
    {
      question: `How does ${symbol}'s DAU/MAU ratio compare?`,
      answer: `The DAU/MAU ratio (daily active users divided by monthly active users) measures stickiness. Higher ratios indicate users engage with ${companyName}'s platform frequently, not just occasionally.`
    },
    {
      question: `Why is platform usage important for ${symbol} stock?`,
      answer: `Usage metrics are leading indicators of revenue growth and customer retention for ${symbol}. High engagement drives conversion, expansion revenue, and reduces churn risk.`
    },
    {
      question: `What drives increased platform usage for ${symbol}?`,
      answer: `Usage growth for ${companyName} is driven by new feature launches, integration additions, workflow automation, collaboration tools, and network effects.`
    },
    {
      question: `How does ${symbol} track feature adoption?`,
      answer: `${companyName} monitors which features users adopt, how quickly new features gain traction, and which capabilities drive the most value and engagement.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Platform Usage`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Platform Usage - Engagement Metrics & Product Adoption`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) platform usage and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} platform usage`,
      `${symbol} user engagement`,
      `${symbol} product adoption`,
      `${symbol} usage metrics`,
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
            <span>{symbol} Platform Usage</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Platform Usage
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Engagement metrics and product adoption for {companyName}
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

          {/* Platform Usage Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Platform Usage Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Platform usage metrics measure how frequently and deeply users engage with {companyName}'s product.
                These metrics are critical leading indicators of retention, expansion, and long-term revenue growth.
              </p>
              <p className="text-muted-foreground">
                High engagement indicates product stickiness, user satisfaction, and competitive moat strength.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Engagement Metrics</h2>
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

          {/* Usage Metrics Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Platform Usage Metrics Framework</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Active Users:</strong> Daily (DAU) and monthly (MAU) active user counts and ratios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Session Metrics:</strong> Session frequency, duration, and depth of feature usage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Feature Adoption:</strong> Percentage of users engaging with key product capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Collaboration:</strong> Multi-user engagement and team-based usage patterns</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Engagement Trends</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed usage analytics, cohort analysis, and retention metrics
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
          <RelatedLinks ticker={symbol} currentPage="platform-usage" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
