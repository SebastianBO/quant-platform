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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Subscriber Churn ${currentYear} - Retention Analysis & Trends`,
    description: `${symbol} subscriber churn rate analysis and retention metrics. Track customer attrition, retention strategies, and ${currentYear} churn forecasts.`,
    keywords: [
      `${symbol} churn rate`,
      `${symbol} subscriber churn`,
      `${symbol} customer retention`,
      `${symbol} attrition rate`,
      `${symbol} churn ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Subscriber Churn ${currentYear} | Retention Analysis`,
      description: `Complete ${symbol} churn analysis with retention strategies and industry benchmarks.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/churn/${ticker.toLowerCase()}`,
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

export default async function ChurnPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/churn/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Churn FAQs
  const churnFaqs = [
    {
      question: `What is ${symbol}'s subscriber churn rate?`,
      answer: `${symbol} (${companyName}) churn rate represents the percentage of subscribers who cancel their service within a given period. Churn is a critical retention metric for ${industry || 'subscription'} businesses. Check earnings reports and investor presentations for disclosed churn rates.`
    },
    {
      question: `Is ${symbol}'s churn rate increasing or decreasing?`,
      answer: `Churn trends for ${symbol} depend on content quality, pricing changes, competitive alternatives, economic conditions, and seasonal patterns. Lower churn indicates stronger customer retention and content engagement. Rising churn may signal competitive pressure or pricing resistance.`
    },
    {
      question: `How does ${symbol} churn compare to competitors?`,
      answer: `${symbol}'s churn should be benchmarked against industry peers in ${industry || 'streaming media'}. Typical streaming churn rates range from 2-8% monthly, varying by market maturity, content differentiation, and pricing. Lower churn indicates stronger customer loyalty and platform stickiness.`
    },
    {
      question: `What drives subscriber churn at ${symbol}?`,
      answer: `Churn at ${symbol} is influenced by content quality and freshness, pricing changes, competitive platform launches, customer service quality, platform usability, and economic factors. Lack of compelling content or price increases often trigger cancellations.`
    },
    {
      question: `How does ${symbol} reduce churn?`,
      answer: `${symbol} can reduce churn through consistent content releases, exclusive originals, improved personalization, pricing optimization, customer engagement initiatives, and platform enhancements. Successful retention strategies balance content investment with subscriber lifetime value.`
    },
    {
      question: `Why is churn important for ${symbol} investors?`,
      answer: `Churn directly impacts ${symbol}'s revenue predictability and growth sustainability. High churn requires constant new subscriber acquisition to maintain growth, increasing marketing costs. Low churn enables compounding subscriber base growth and higher customer lifetime value, improving unit economics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Subscriber Churn`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Subscriber Churn ${currentYear} - Retention Analysis & Trends`,
    description: `Comprehensive churn analysis for ${symbol} (${companyName}) with retention metrics and industry benchmarks.`,
    url: pageUrl,
    keywords: [
      `${symbol} churn rate`,
      `${symbol} subscriber churn`,
      `${symbol} customer retention`,
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

  const faqSchema = getFAQSchema(churnFaqs)

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
            <span>{symbol} Subscriber Churn</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Subscriber Churn {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer retention and churn analysis for {companyName}
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

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Churn Dynamics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Churn Reduction Strategies</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Consistent new content releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Exclusive original programming</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Improved personalization algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Enhanced user experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Customer engagement campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Flexible pricing tiers</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Common Churn Triggers</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Content gaps or lack of new releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Price increases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Competitive platform launches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Economic downturn pressures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Poor content recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Technical issues or platform bugs</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Churn Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Why Churn Matters</h3>
                <p className="text-muted-foreground">
                  Churn is one of the most critical metrics for subscription businesses like streaming platforms.
                  Even small changes in monthly churn rates compound over time. A streaming service with 3% monthly
                  churn loses about 30% of its subscriber base annually, requiring constant acquisition to maintain
                  growth. For {symbol}, low churn enables predictable revenue growth and improved unit economics.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Churn vs Customer Lifetime Value</h3>
                <p className="text-muted-foreground">
                  Churn directly impacts customer lifetime value (LTV). Lower churn means customers stay subscribed
                  longer, increasing total revenue per customer and justifying higher acquisition costs. A customer
                  who stays 24 months vs 12 months doubles their LTV. For {symbol}, managing churn is essential
                  for sustainable growth and profitability.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Seasonal Churn Patterns</h3>
                <p className="text-muted-foreground">
                  Streaming churn often exhibits seasonal patterns. Subscribers may cancel after binge-watching
                  a popular show or during content gaps. Some platforms see higher churn in summer months when
                  outdoor activities compete for attention. Understanding {symbol}'s churn seasonality helps
                  investors evaluate quarterly performance relative to historical patterns.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, retention metrics, and detailed valuations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {churnFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Churn metrics are subject to change and may vary by reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="churn" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
