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
    title: `${symbol} Customer Count - Total Customers ${currentYear}`,
    description: `${symbol} customer count and growth analysis: track total customers, customer acquisition trends, and customer base expansion for ${symbol}.`,
    keywords: [
      `${symbol} customers`,
      `${symbol} customer count`,
      `${symbol} customer growth`,
      `${symbol} user base`,
      `${symbol} customer acquisition`,
      `${symbol} total customers`,
    ],
    openGraph: {
      title: `${symbol} Customer Count ${currentYear} | Total Customers`,
      description: `Complete ${symbol} customer analysis with growth trends, acquisition metrics, and customer base performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/customers/${ticker.toLowerCase()}`,
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

export default async function CustomersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/customers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate Customer FAQs
  const customerFaqs = [
    {
      question: `How many customers does ${symbol} have?`,
      answer: `${companyName} serves ${sector === 'Technology' ? 'businesses and consumers' : 'customers'} across multiple markets. Customer count is typically reported in quarterly earnings calls and annual reports. Check the latest investor relations materials for specific customer metrics.`
    },
    {
      question: `Is ${symbol}'s customer base growing?`,
      answer: `Customer growth is a key metric for ${companyName}. Look for trends in customer count, customer acquisition cost (CAC), and customer lifetime value (LTV) in quarterly earnings reports to assess growth trajectory.`
    },
    {
      question: `What types of customers does ${symbol} serve?`,
      answer: `${companyName} operates in the ${sector || 'various'} ${industry ? `${industry} industry` : 'sector'}, serving ${sector === 'Technology' ? 'both enterprise and SMB customers' : 'a diverse customer base'}. Customer segmentation is often detailed in annual 10-K filings.`
    },
    {
      question: `How does ${symbol} acquire new customers?`,
      answer: `${companyName} acquires customers through ${sector === 'Technology' ? 'digital marketing, sales teams, partnerships, and product-led growth strategies' : 'various channels including marketing, sales, and partnerships'}. Customer acquisition strategy impacts CAC and overall profitability.`
    },
    {
      question: `What is ${symbol}'s customer retention rate?`,
      answer: `Customer retention is critical for ${companyName}'s recurring revenue. Look for metrics like net revenue retention (NRR), dollar-based retention, and churn rate in investor presentations to assess customer stickiness.`
    },
    {
      question: `How does ${symbol}'s customer count compare to competitors?`,
      answer: `Compare ${symbol}'s customer metrics to competitors in the ${sector || 'industry'} sector using our comparison tool. Key metrics include total customers, customer growth rate, and average revenue per customer (ARPC).`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Customers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Customer Count ${currentYear} - Total Customers Analysis`,
    description: `Complete customer analysis for ${symbol} (${companyName}) with growth trends, acquisition metrics, and customer base insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} customers`,
      `${symbol} customer count`,
      `${symbol} customer growth`,
      `${symbol} user base`,
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

  const faqSchema = getFAQSchema(customerFaqs)

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
            <span>{symbol} Customers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Customer Count {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer growth and acquisition metrics for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Customer Metrics</h2>
            <p className="text-muted-foreground">
              {companyName} reports customer metrics in quarterly earnings calls and annual reports.
              Key metrics include total customer count, customer acquisition cost (CAC),
              customer lifetime value (LTV), and customer retention rates.
            </p>
          </div>

          {/* Why Customer Count Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Customer Count Matters</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Growth Indicator</h3>
                <p className="text-muted-foreground">
                  Customer count is a leading indicator of revenue growth, especially for subscription-based businesses.
                  Consistent customer growth signals strong product-market fit and effective sales execution.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Share</h3>
                <p className="text-muted-foreground">
                  Total customers relative to competitors indicates market share and competitive positioning.
                  Growing customer count faster than the market suggests market share gains.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Predictability</h3>
                <p className="text-muted-foreground">
                  For SaaS companies, customer count combined with average revenue per customer (ARPC)
                  helps predict future revenue and provides visibility into business health.
                </p>
              </div>
            </div>
          </section>

          {/* Key Customer Metrics to Track */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Customer Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Total Customers</h3>
                    <p className="text-sm text-muted-foreground">
                      The total number of active customers at period end
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Customer Growth Rate</h3>
                    <p className="text-sm text-muted-foreground">
                      Year-over-year or quarter-over-quarter percentage change in customer count
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Customer Acquisition Cost (CAC)</h3>
                    <p className="text-sm text-muted-foreground">
                      Total sales and marketing spend divided by new customers acquired
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Average Revenue Per Customer (ARPC)</h3>
                    <p className="text-sm text-muted-foreground">
                      Total revenue divided by total customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, SaaS metrics, and AI-powered insights
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
              {customerFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Customer data is based on publicly disclosed information in earnings reports and SEC filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
