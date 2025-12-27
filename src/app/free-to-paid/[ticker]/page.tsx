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
    title: `${symbol} Free-to-Paid Conversion - User Activation & Monetization`,
    description: `${symbol} free-to-paid conversion rate analysis. Track user activation, conversion funnel, trial-to-paid metrics, and monetization efficiency.`,
    keywords: [
      `${symbol} free to paid`,
      `${symbol} conversion rate`,
      `${symbol} user activation`,
      `${symbol} trial conversion`,
      `${symbol} monetization`,
      `${symbol} freemium model`,
    ],
    openGraph: {
      title: `${symbol} Free-to-Paid Conversion | Monetization Metrics`,
      description: `Comprehensive analysis of ${symbol} free-to-paid conversion rates and user monetization strategies.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/free-to-paid/${ticker.toLowerCase()}`,
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

export default async function FreeToPaidPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/free-to-paid/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s free-to-paid conversion rate?`,
      answer: `${symbol} (${companyName}) reports free-to-paid conversion as a key metric for evaluating the effectiveness of its freemium or trial model. This rate shows the percentage of free users who convert to paying customers.`
    },
    {
      question: `How does ${symbol} convert free users to paid?`,
      answer: `${companyName} uses product-led growth strategies including feature limitations, usage caps, team collaboration incentives, and value demonstrations to convert free users into paying customers.`
    },
    {
      question: `What is a good free-to-paid conversion rate?`,
      answer: `Industry benchmarks for SaaS free-to-paid conversion typically range from 2-5%, though this varies by product type, pricing, and target market. ${symbol}'s conversion rate should be evaluated in context of its business model.`
    },
    {
      question: `How does free-to-paid impact ${symbol} revenue?`,
      answer: `Free-to-paid conversion directly impacts ${symbol}'s revenue growth and customer acquisition efficiency. Higher conversion rates reduce customer acquisition costs and improve unit economics.`
    },
    {
      question: `What factors improve ${symbol}'s conversion rate?`,
      answer: `Key drivers of free-to-paid conversion include product value delivery, onboarding experience, feature differentiation, pricing optimization, and timing of upgrade prompts.`
    },
    {
      question: `How is ${symbol}'s conversion rate trending?`,
      answer: `Monitoring ${companyName}'s free-to-paid conversion trends over time reveals product-market fit improvements, pricing effectiveness, and competitive positioning strength.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Free-to-Paid`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Free-to-Paid Conversion - User Activation & Monetization`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) free-to-paid conversion metrics and monetization strategy.`,
    url: pageUrl,
    keywords: [
      `${symbol} free to paid`,
      `${symbol} conversion rate`,
      `${symbol} user activation`,
      `${symbol} monetization`,
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
            <span>{symbol} Free-to-Paid</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Free-to-Paid Conversion
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            User activation and monetization metrics for {companyName}
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

          {/* Free-to-Paid Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Free-to-Paid Conversion Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Free-to-paid conversion measures the percentage of free or trial users who upgrade to paying subscriptions.
                This metric is critical for companies like {companyName} that use product-led growth strategies.
              </p>
              <p className="text-muted-foreground">
                High conversion rates indicate strong product-market fit, effective value delivery, and efficient
                go-to-market motion.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Monetization Metrics</h2>
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

          {/* Conversion Funnel Stages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Conversion Funnel Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Activation:</strong> New users experiencing core product value for the first time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Engagement:</strong> Regular usage and feature adoption during trial or free tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Value Realization:</strong> Users achieving meaningful outcomes with the product</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Conversion:</strong> Upgrade to paid subscription driven by demonstrated value</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Growth Metrics</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed monetization analysis, user metrics, and revenue projections
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
          <RelatedLinks ticker={symbol} currentPage="free-to-paid" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
