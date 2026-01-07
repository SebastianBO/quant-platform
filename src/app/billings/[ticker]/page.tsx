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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Billings Growth - Total Billings ${currentYear}`,
    description: `${symbol} billings and billings growth analysis: track total billings, calculated billings, and deferred revenue trends for ${symbol}.`,
    keywords: [
      `${symbol} billings`,
      `${symbol} billings growth`,
      `${symbol} calculated billings`,
      `${symbol} deferred revenue`,
      `${symbol} total billings`,
      `${symbol} revenue metrics`,
    ],
    openGraph: {
      title: `${symbol} Billings Growth ${currentYear} | Total Billings`,
      description: `Complete ${symbol} billings analysis with growth trends, deferred revenue, and forward-looking revenue indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/billings/${ticker.toLowerCase()}`,
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

export default async function BillingsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/billings/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (proxy for billings growth)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate Billings FAQs
  const billingsFaqs = [
    {
      question: `What are ${symbol}'s billings?`,
      answer: `Billings for ${companyName} represent the total amount invoiced to customers during a period, including both recognized revenue and deferred revenue. Billings are calculated as: Revenue + Change in Deferred Revenue. This is a leading indicator of future revenue growth.`
    },
    {
      question: `Why are billings important for ${symbol}?`,
      answer: `Billings are a critical forward-looking metric for ${companyName}. Unlike revenue (which is recognized over time), billings show what customers are actually committing to pay. Strong billings growth indicates healthy demand and future revenue visibility.`
    },
    {
      question: `What is the difference between billings and revenue?`,
      answer: `For ${companyName}, billings represent cash collected or invoiced upfront, while revenue is recognized ratably over the subscription period. Multi-year contracts create deferred revenue, making billings a better indicator of current bookings and sales momentum.`
    },
    {
      question: `How does ${symbol} calculate billings?`,
      answer: `${companyName} calculates billings using the formula: Billings = Revenue + Change in Deferred Revenue. Some companies report "calculated billings" or "remaining performance obligations" as alternative metrics for future revenue visibility.`
    },
    {
      question: `What drives ${symbol}'s billings growth?`,
      answer: `Billings growth for ${companyName} is driven by new customer acquisition, expansion from existing customers, multi-year contract renewals, and pricing increases. Strong billings growth relative to revenue growth indicates accelerating business momentum.`
    },
    {
      question: `Is ${symbol}'s billings growth accelerating?`,
      answer: `Track ${companyName}'s billings growth quarter-over-quarter and year-over-year to identify acceleration or deceleration trends. Billings growth faster than revenue growth suggests building momentum and improving future revenue visibility.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Billings`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Billings Growth ${currentYear} - Total Billings Analysis`,
    description: `Complete billings analysis for ${symbol} (${companyName}) with growth trends, deferred revenue, and forward-looking indicators.`,
    url: pageUrl,
    keywords: [
      `${symbol} billings`,
      `${symbol} billings growth`,
      `${symbol} calculated billings`,
      `${symbol} deferred revenue`,
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

  const faqSchema = getFAQSchema(billingsFaqs)

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
            <span>{symbol} Billings</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Billings Growth {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Total billings and deferred revenue analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Billings Metrics</h2>
            <p className="text-muted-foreground">
              {companyName} reports revenue and deferred revenue in quarterly filings.
              Billings (Revenue + Change in Deferred Revenue) provide a forward-looking
              view of business momentum and future revenue visibility.
            </p>
          </div>

          {/* Why Billings Matter */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Billings Matter</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Leading Indicator</h3>
                <p className="text-muted-foreground">
                  Billings are a leading indicator of future revenue. For subscription businesses,
                  billings show what customers are committing to before revenue is recognized,
                  providing early signals of growth or slowdown.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Sales Momentum</h3>
                <p className="text-muted-foreground">
                  Strong billings growth indicates healthy sales execution and demand.
                  Accelerating billings relative to revenue suggests building momentum
                  and improved future revenue visibility.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Cash Collection</h3>
                <p className="text-muted-foreground">
                  Billings represent actual cash collection or committed invoices.
                  High billings relative to revenue indicates strong upfront payments
                  and healthy cash flow characteristics.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Contract Duration</h3>
                <p className="text-muted-foreground">
                  The ratio of billings to revenue reveals average contract length.
                  Higher ratios indicate longer contract commitments and greater
                  revenue predictability.
                </p>
              </div>
            </div>
          </section>

          {/* Billings Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Billings</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Billings Formula</h3>
                  <div className="bg-secondary/30 p-4 rounded-lg font-mono text-sm">
                    Billings = Revenue + Change in Deferred Revenue
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Components:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="font-medium">Revenue</p>
                        <p className="text-sm text-muted-foreground">
                          Amount recognized in the current period per GAAP
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div>
                        <p className="font-medium">Change in Deferred Revenue</p>
                        <p className="text-sm text-muted-foreground">
                          Increase in unearned revenue from upfront payments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold mb-2">Key Insight:</h3>
                  <p className="text-sm text-muted-foreground">
                    When customers pay upfront for multi-year contracts, deferred revenue increases.
                    This makes billings higher than revenue, creating a leading indicator of future performance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Billings Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Billings Metrics to Track</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Total Billings</h3>
                <p className="text-sm text-muted-foreground">
                  Absolute billings amount (Revenue + ΔDeferred Revenue)
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Billings Growth Rate</h3>
                <p className="text-sm text-muted-foreground">
                  Year-over-year or quarter-over-quarter billings growth
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Billings vs Revenue Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Compare billings growth to revenue growth to identify acceleration
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Deferred Revenue Balance</h3>
                <p className="text-sm text-muted-foreground">
                  Total unearned revenue to be recognized in future periods
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete billings data, revenue metrics, and AI-powered insights
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
              {billingsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Billings data is calculated from revenue and deferred revenue reported in SEC filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
