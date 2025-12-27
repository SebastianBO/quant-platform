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
    title: `${symbol} Connected Fitness Subscribers - Digital Membership ${currentYear}`,
    description: `${symbol} connected fitness subscribers: digital membership count, subscriber growth, churn rate, and ARPU. Analyze ${symbol}'s digital fitness platform performance.`,
    keywords: [
      `${symbol} connected fitness`,
      `${symbol} digital subscribers`,
      `${symbol} connected fitness subs`,
      `${symbol} digital membership`,
      `${symbol} streaming fitness`,
      `${symbol} app subscribers`,
    ],
    openGraph: {
      title: `${symbol} Connected Fitness Subscribers ${currentYear} | Digital Membership`,
      description: `Complete ${symbol} connected fitness analysis with subscriber count, growth trends, and engagement metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/connected-fitness/${ticker.toLowerCase()}`,
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

export default async function ConnectedFitnessPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/connected-fitness/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate connected fitness FAQs
  const connectedFitnessFaqs = [
    {
      question: `How many connected fitness subscribers does ${symbol} have?`,
      answer: `${companyName}'s connected fitness platform has digital subscribers who access workouts, classes, and training content. Subscriber counts are typically reported in quarterly earnings and reflect the size of the digital community.`
    },
    {
      question: `What is ${symbol}'s connected fitness subscriber growth rate?`,
      answer: `Subscriber growth indicates the platform's appeal and market penetration. Strong growth suggests successful product offerings and marketing, while slowing growth may indicate market saturation or increased competition.`
    },
    {
      question: `How much does ${symbol} charge for connected fitness subscriptions?`,
      answer: `Subscription pricing affects both ARPU (average revenue per user) and conversion rates. ${symbol} may offer multiple tiers at different price points. Check the company's website or investor presentations for current pricing.`
    },
    {
      question: `What is ${symbol}'s connected fitness churn rate?`,
      answer: `Churn rate measures the percentage of subscribers who cancel their digital memberships. Lower churn indicates higher satisfaction and stickier engagement with the platform's content and features.`
    },
    {
      question: `What is the ARPU for ${symbol}'s connected fitness platform?`,
      answer: `Average revenue per user (ARPU) is calculated by dividing subscription revenue by subscriber count. Higher ARPU can result from premium pricing, upsells, or successful retention strategies.`
    },
    {
      question: `How does ${symbol}'s connected fitness compare to competitors?`,
      answer: `Compare ${symbol} to other digital fitness platforms like Peloton, Apple Fitness+, or traditional gyms with digital offerings. Evaluate subscriber counts, pricing, content quality, and engagement metrics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Connected Fitness`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Connected Fitness Subscribers ${currentYear} - Digital Membership Analysis`,
    description: `Complete connected fitness analysis for ${symbol} (${companyName}) with subscriber count, growth trends, and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} connected fitness`,
      `${symbol} digital subscribers`,
      `${symbol} connected fitness subs`,
      `${symbol} streaming fitness`,
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

  const faqSchema = getFAQSchema(connectedFitnessFaqs)

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
            <span>{symbol} Connected Fitness</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Connected Fitness Subscribers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Digital membership and subscriber analysis for {companyName}
          </p>

          {/* Connected Fitness Overview */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Connected Fitness Platform Overview</h2>
            <p className="text-muted-foreground">
              {companyName}'s connected fitness platform represents the digital subscription business,
              delivering workout content, live classes, and on-demand training to subscribers.
              Subscriber metrics, engagement rates, and ARPU are key indicators of platform success.
              Review quarterly reports for detailed subscriber data.
            </p>
          </div>

          {/* Key Subscriber Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Subscriber Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Total Subscribers</h3>
                <p className="text-muted-foreground">
                  Active digital subscribers paying for access to the connected fitness platform and content library.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Net Subscriber Additions</h3>
                <p className="text-muted-foreground">
                  New subscribers minus cancellations, showing quarterly growth in the subscriber base.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Monthly Churn Rate</h3>
                <p className="text-muted-foreground">
                  Percentage of subscribers who cancel each month, indicating platform stickiness and content quality.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average Revenue Per User (ARPU)</h3>
                <p className="text-muted-foreground">
                  Subscription revenue divided by subscriber count, showing pricing power and monetization efficiency.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Subscriber Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, subscriber trends, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {connectedFitnessFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Subscriber data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="connected-fitness" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
