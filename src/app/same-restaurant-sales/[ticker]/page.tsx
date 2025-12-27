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
    title: `${symbol} Same-Restaurant Sales - Comp Sales Growth ${currentYear}`,
    description: `${symbol} same-restaurant sales (comp sales) analysis: growth trends, quarterly performance, and traffic patterns. Track ${symbol}'s comparable store sales.`,
    keywords: [
      `${symbol} same restaurant sales`,
      `${symbol} comp sales`,
      `${symbol} comparable sales`,
      `${symbol} SSS`,
      `${symbol} comps`,
      `${symbol} same store sales`,
    ],
    openGraph: {
      title: `${symbol} Same-Restaurant Sales ${currentYear} | Comp Sales`,
      description: `Complete ${symbol} comp sales analysis with growth trends and quarterly performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/same-restaurant-sales/${ticker.toLowerCase()}`,
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

export default async function SameRestaurantSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/same-restaurant-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What are ${symbol}'s same-restaurant sales?`,
      answer: `Same-restaurant sales (also called comparable store sales or "comps") measure revenue growth at ${symbol} locations that have been open for at least 12-13 months. This metric excludes new store openings and closures, showing organic growth.`
    },
    {
      question: `Are ${symbol}'s comp sales growing?`,
      answer: `${symbol}'s comp sales growth can be tracked through quarterly earnings reports. Positive comp sales indicate strong customer demand and pricing power, while negative comps may signal operational challenges.`
    },
    {
      question: `What drives ${symbol}'s same-restaurant sales?`,
      answer: `Comp sales are driven by traffic (customer visits) and average check (spending per visit). ${symbol}'s performance depends on factors like menu innovation, pricing, marketing, and overall consumer demand.`
    },
    {
      question: `How do ${symbol}'s comps compare to competitors?`,
      answer: `Compare ${symbol}'s same-restaurant sales growth to industry peers to assess competitive positioning. Strong comps relative to competitors indicate market share gains.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Same-Restaurant Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Same-Restaurant Sales ${currentYear} - Comp Sales Analysis`,
    description: `Complete comp sales analysis for ${symbol} (${companyName}) with growth trends and quarterly performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} same restaurant sales`,
      `${symbol} comp sales`,
      `${symbol} comparable sales`,
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
            <span>{symbol} Same-Restaurant Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Same-Restaurant Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comp sales growth and performance analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, comp sales trends, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Same-restaurant sales data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="same-restaurant-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
