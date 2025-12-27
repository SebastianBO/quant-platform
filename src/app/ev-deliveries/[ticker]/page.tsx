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
    title: `${symbol} EV Deliveries - Electric Vehicle Sales Data ${currentYear}`,
    description: `${symbol} electric vehicle deliveries: quarterly and annual EV sales, delivery growth trends, and production targets. Track ${symbol}'s EV delivery performance.`,
    keywords: [
      `${symbol} EV deliveries`,
      `${symbol} electric vehicle sales`,
      `${symbol} vehicle deliveries`,
      `${symbol} EV production`,
      `${symbol} delivery numbers`,
      `${symbol} quarterly deliveries`,
    ],
    openGraph: {
      title: `${symbol} EV Deliveries ${currentYear} | Electric Vehicle Sales`,
      description: `Complete ${symbol} EV delivery analysis with quarterly trends, growth rates, and production targets.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ev-deliveries/${ticker.toLowerCase()}`,
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

export default async function EVDeliveriesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ev-deliveries/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate EV deliveries FAQs
  const evDeliveriesFaqs = [
    {
      question: `How many EVs does ${symbol} deliver?`,
      answer: `${symbol} (${companyName}) is ${sector === 'Consumer Cyclical' ? 'an automotive company' : 'a company'} that reports EV delivery numbers quarterly. Check the latest earnings reports and investor relations updates for current delivery figures.`
    },
    {
      question: `What are ${symbol}'s quarterly EV deliveries?`,
      answer: `${companyName} typically announces quarterly delivery numbers at the start of each quarter. These figures include all electric vehicle deliveries to customers during the three-month period.`
    },
    {
      question: `Is ${symbol}'s EV delivery growth increasing?`,
      answer: `EV delivery growth for ${symbol} can be tracked through quarterly earnings reports and year-over-year comparisons. Growth trends depend on production capacity, demand, and market conditions.`
    },
    {
      question: `What are ${symbol}'s EV production targets?`,
      answer: `${companyName} announces production and delivery guidance during earnings calls and investor presentations. These targets help investors gauge the company's manufacturing scale and market expansion plans.`
    },
    {
      question: `How does ${symbol} compare to competitors in EV deliveries?`,
      answer: `Compare ${symbol} to other automotive manufacturers and EV companies to assess market share and competitive positioning in the electric vehicle market.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} EV Deliveries`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EV Deliveries ${currentYear} - Electric Vehicle Sales Analysis`,
    description: `Complete EV delivery analysis for ${symbol} (${companyName}) with quarterly performance and growth trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} EV deliveries`,
      `${symbol} electric vehicle sales`,
      `${symbol} vehicle deliveries`,
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

  const faqSchema = getFAQSchema(evDeliveriesFaqs)

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
            <span>{symbol} EV Deliveries</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EV Deliveries {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Electric vehicle delivery data and trends for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">EV Deliveries</p>
                <p className="text-sm text-muted-foreground mt-1">Quarterly & Annual</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EV Delivery Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                EV deliveries represent the number of electric vehicles delivered to customers during a specific period.
                This metric is crucial for understanding production capacity, demand, and market share in the rapidly
                growing electric vehicle market.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, tracking delivery numbers provides insights into manufacturing efficiency,
                supply chain performance, and customer demand trends.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why EV Deliveries Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Revenue Indicator</h3>
                <p className="text-sm text-muted-foreground">
                  Higher delivery numbers typically translate to increased revenue and market share.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Production Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  Delivery growth indicates manufacturing scale and operational efficiency.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Market Demand</h3>
                <p className="text-sm text-muted-foreground">
                  Strong delivery numbers reflect customer demand and brand strength.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Position</h3>
                <p className="text-sm text-muted-foreground">
                  Delivery trends help assess market share versus competitors.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, production data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evDeliveriesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> EV delivery data is based on company announcements and public filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ev-deliveries" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
