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
    title: `${symbol} Platform Customers - Platform Adoption ${currentYear}`,
    description: `${symbol} platform customer count and adoption trends: track platform users, multi-product adoption, and platform engagement for ${symbol}.`,
    keywords: [
      `${symbol} platform customers`,
      `${symbol} platform adoption`,
      `${symbol} multi-product`,
      `${symbol} platform users`,
      `${symbol} platform engagement`,
      `${symbol} customer expansion`,
    ],
    openGraph: {
      title: `${symbol} Platform Customers ${currentYear} | Platform Adoption`,
      description: `Complete ${symbol} platform customer analysis with adoption trends, multi-product metrics, and engagement insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/platform-customers/${ticker.toLowerCase()}`,
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

export default async function PlatformCustomersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/platform-customers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate Platform Customer FAQs
  const platformFaqs = [
    {
      question: `What are ${symbol}'s platform customers?`,
      answer: `Platform customers for ${companyName} are users who adopt multiple products or services within the company's ecosystem. These customers typically have higher engagement, lower churn, and greater lifetime value compared to single-product users.`
    },
    {
      question: `Why is platform adoption important for ${symbol}?`,
      answer: `Platform adoption is crucial for ${companyName} because customers using multiple products have higher retention rates, expand revenue faster, and create network effects. Platform customers often represent the most valuable segment of the customer base.`
    },
    {
      question: `How does ${symbol} measure platform adoption?`,
      answer: `${companyName} typically measures platform adoption through metrics like customers using 2+ products, customers using 3+ products, average products per customer, and product attach rates. These metrics appear in quarterly earnings presentations.`
    },
    {
      question: `What drives platform customer growth?`,
      answer: `Platform customer growth for ${companyName} is driven by product innovation, cross-selling strategies, integrated workflows, and network effects that make the platform more valuable as customers adopt more products.`
    },
    {
      question: `How does platform adoption impact ${symbol}'s financials?`,
      answer: `Platform customers typically generate higher revenue per customer, have better retention rates, and lower customer acquisition costs (CAC) for additional products. This drives higher margins and more predictable revenue for ${companyName}.`
    },
    {
      question: `What is a good platform adoption rate?`,
      answer: `Strong platform companies often see 30-50%+ of customers using multiple products. ${companyName}'s platform adoption metrics can be found in investor presentations and compared to competitors in the ${sector || 'industry'} sector.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Platform Customers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Platform Customers ${currentYear} - Platform Adoption Analysis`,
    description: `Complete platform customer analysis for ${symbol} (${companyName}) with adoption trends, multi-product metrics, and engagement insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} platform customers`,
      `${symbol} platform adoption`,
      `${symbol} multi-product`,
      `${symbol} customer expansion`,
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

  const faqSchema = getFAQSchema(platformFaqs)

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
            <span>{symbol} Platform Customers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Platform Customers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Platform adoption and multi-product metrics for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Platform Adoption Metrics</h2>
            <p className="text-muted-foreground">
              {companyName} reports platform customer metrics in quarterly earnings.
              Platform customers use multiple products and represent the most valuable customer segment
              with higher engagement, retention, and lifetime value.
            </p>
          </div>

          {/* Why Platform Customers Matter */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Platform Customers Matter</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Higher Retention</h3>
                <p className="text-muted-foreground">
                  Customers using multiple products have significantly lower churn rates.
                  The switching cost increases with each additional product, creating stickier relationships.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Expansion Revenue</h3>
                <p className="text-muted-foreground">
                  Platform customers drive net revenue retention (NRR) above 100% through product expansion.
                  Each additional product increases average revenue per customer (ARPC).
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Network Effects</h3>
                <p className="text-muted-foreground">
                  Platform adoption creates network effects where products become more valuable together.
                  This defensibility makes the business more resilient to competition.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Lower CAC</h3>
                <p className="text-muted-foreground">
                  Cross-selling to existing customers costs less than acquiring new ones.
                  Platform customers improve overall unit economics and profitability.
                </p>
              </div>
            </div>
          </section>

          {/* Key Platform Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Platform Metrics to Track</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Customers Using 2+ Products</h3>
                    <p className="text-sm text-muted-foreground">
                      Percentage of customers adopting multiple products
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Customers Using 3+ Products</h3>
                    <p className="text-sm text-muted-foreground">
                      The most engaged customers with highest retention
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Average Products Per Customer</h3>
                    <p className="text-sm text-muted-foreground">
                      Total products divided by total customers
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Product Attach Rate</h3>
                    <p className="text-sm text-muted-foreground">
                      Rate at which new products are adopted by existing customers
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Platform Customer NRR</h3>
                    <p className="text-sm text-muted-foreground">
                      Net revenue retention specifically for multi-product customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} SaaS Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete platform metrics, customer data, and AI-powered insights
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
              {platformFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Platform customer data is based on publicly disclosed information in earnings reports and investor presentations. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
