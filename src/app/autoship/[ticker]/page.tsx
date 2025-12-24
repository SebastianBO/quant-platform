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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Autoship Revenue - Subscription Sales Data ${currentYear}`,
    description: `${symbol} autoship subscription revenue: recurring revenue, subscription growth, customer retention. Analyze ${symbol}'s autoship business.`,
    keywords: [
      `${symbol} autoship`,
      `${symbol} subscriptions`,
      `${symbol} recurring revenue`,
      `${symbol} autoship growth`,
    ],
    openGraph: {
      title: `${symbol} Autoship Subscriptions ${currentYear} | Recurring Revenue`,
      description: `Complete ${symbol} autoship analysis with subscription revenue and customer retention.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/autoship/${ticker.toLowerCase()}`,
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

export default async function AutoshipPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/autoship/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Find autoship/subscription segment data
  const autoshipSegment = productSegments?.find((s: any) =>
    s.name?.toLowerCase().includes('autoship') ||
    s.name?.toLowerCase().includes('subscription')
  )
  const autoshipRevenue = autoshipSegment?.revenue || 0

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate autoship as % of total revenue
  const autoshipPercentage = latestRevenue > 0 ? (autoshipRevenue / latestRevenue * 100) : 0

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate autoship FAQs
  const autoshipFaqs = [
    {
      question: `Does ${symbol} offer autoship subscriptions?`,
      answer: autoshipRevenue
        ? `Yes, ${symbol} (${companyName}) generates approximately ${autoshipRevenue >= 1e9 ? `$${(autoshipRevenue / 1e9).toFixed(2)} billion` : `$${(autoshipRevenue / 1e6).toFixed(0)} million`} from autoship subscriptions, representing ${autoshipPercentage.toFixed(1)}% of total revenue.`
        : `Yes, ${companyName} offers autoship subscription programs that allow customers to receive regular deliveries of pet food, supplies, and medications with automatic discounts and free shipping.`
    },
    {
      question: `What is ${symbol}'s autoship program?`,
      answer: `${companyName}'s autoship program allows customers to schedule automatic deliveries of their favorite pet products at customizable intervals. Subscribers typically receive discounts of 5-10% on autoship orders plus free shipping, creating significant savings.`
    },
    {
      question: `Is ${symbol}'s autoship business growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Autoship subscriptions are a key growth driver, providing predictable recurring revenue and higher customer lifetime value.`
        : `Autoship and subscription models are rapidly growing segments in pet retail, offering higher margins and better customer retention than one-time purchases. This makes autoship strategically important for ${companyName}.`
    },
    {
      question: `Why is autoship important for ${symbol}?`,
      answer: `Autoship subscriptions provide ${companyName} with predictable recurring revenue, higher customer lifetime value, improved inventory planning, and stronger customer loyalty. Subscription customers typically spend 2-3x more annually than non-subscribers.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Autoship`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Autoship Subscriptions ${currentYear} - Recurring Revenue Analysis`,
    description: `Complete autoship analysis for ${symbol} (${companyName}) with subscription revenue trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} autoship`,
      `${symbol} subscriptions`,
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

  const faqSchema = getFAQSchema(autoshipFaqs)

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
            <span>{symbol} Autoship</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Autoship Subscriptions {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Autoship subscription revenue and recurring sales analysis for {companyName}
          </p>

          {/* Latest Revenue Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Autoship Revenue</p>
                <p className="text-3xl font-bold">
                  {autoshipRevenue >= 1e9
                    ? `$${(autoshipRevenue / 1e9).toFixed(2)}B`
                    : autoshipRevenue > 0
                    ? `$${(autoshipRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-violet-500">
                  {autoshipPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">recurring revenue</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">all segments</p>
              </div>
            </div>
          </div>

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue History</h2>
            <div className="space-y-3">
              {incomeStatements?.slice(0, 5).map((statement: any, index: number) => {
                const prevStatement = incomeStatements[index + 1]
                const growth = prevStatement?.revenue
                  ? ((statement.revenue - prevStatement.revenue) / prevStatement.revenue)
                  : null

                return (
                  <div key={statement.report_period} className="bg-card p-5 rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{statement.report_period}</p>
                        <p className="text-2xl font-bold">
                          {statement.revenue >= 1e9
                            ? `$${(statement.revenue / 1e9).toFixed(2)}B`
                            : `$${(statement.revenue / 1e6).toFixed(0)}M`}
                        </p>
                      </div>
                      {growth !== null && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">YoY Growth</p>
                          <p className={`text-xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{(growth * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Quarterly Revenue */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarters.slice(0, 8).map((quarter: any) => (
                  <div key={quarter.report_period} className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{quarter.report_period}</p>
                    <p className="text-lg font-bold">
                      {quarter.revenue >= 1e9
                        ? `$${(quarter.revenue / 1e9).toFixed(2)}B`
                        : `$${(quarter.revenue / 1e6).toFixed(0)}M`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Revenue by Segment */}
          {productSegments && productSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {productSegments.slice(0, 8).map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = latestRevenue > 0 ? (segment.revenue / latestRevenue * 100) : 0
                    const isAutoship = segment.name?.toLowerCase().includes('autoship') ||
                                      segment.name?.toLowerCase().includes('subscription')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isAutoship ? 'text-violet-500' : ''}`}>
                            {segment.name}
                            {isAutoship && ' (Autoship)'}
                          </span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`${isAutoship ? 'bg-violet-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, financials, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {autoshipFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly filed financial statements. Segment data may not be available for all companies. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="autoship" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
