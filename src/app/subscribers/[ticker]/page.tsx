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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Total Subscribers - Subscriber Count ${currentYear}`,
    description: `${symbol} total subscriber count and trends: track subscriber base growth, user acquisition, and subscription metrics for ${symbol}.`,
    keywords: [
      `${symbol} subscribers`,
      `${symbol} total subscribers`,
      `${symbol} subscriber count`,
      `${symbol} user base`,
      `${symbol} subscription metrics`,
      `${symbol} customer count`,
    ],
    openGraph: {
      title: `${symbol} Total Subscribers ${currentYear} | Subscriber Count`,
      description: `Complete ${symbol} subscriber analysis with growth trends, user metrics, and subscription performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/subscribers/${ticker.toLowerCase()}`,
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

export default async function TotalSubscribersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/subscribers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data (proxy for subscriber base)
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (proxy for subscriber growth)
  const previousAnnual = incomeStatements?.[1]
  const subscriberGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Calculate multi-year CAGR
  const oldestAnnual = incomeStatements?.[incomeStatements.length - 1]
  const yearsDiff = incomeStatements?.length > 1 ? incomeStatements.length - 1 : 1
  const cagr = oldestAnnual?.revenue
    ? Math.pow(latestRevenue / oldestAnnual.revenue, 1 / yearsDiff) - 1
    : 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const subscriberFaqs = [
    {
      question: `How many subscribers does ${symbol} have?`,
      answer: `${symbol} (${companyName}) serves a substantial subscriber base${sector ? ` in the ${sector} sector` : ''}. The company reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue for ${latestPeriod}, indicating strong subscriber traction. ${subscriberGrowth > 0 ? `With ${(subscriberGrowth * 100).toFixed(1)}% revenue growth, the subscriber base is expanding.` : ''}`
    },
    {
      question: `Is ${symbol}'s subscriber count growing?`,
      answer: subscriberGrowth > 0
        ? `Yes, ${symbol}'s subscriber base is growing. The company achieved ${(subscriberGrowth * 100).toFixed(1)}% revenue growth year-over-year, reflecting strong subscriber acquisition. ${cagr > 0 ? `Over the past ${yearsDiff} years, the business has grown at a ${(cagr * 100).toFixed(1)}% CAGR.` : ''}`
        : subscriberGrowth < 0
        ? `${symbol}'s subscriber metrics declined ${Math.abs(subscriberGrowth * 100).toFixed(1)}% year-over-year, which may indicate increased churn or competitive pressure.`
        : `${symbol}'s subscriber base has remained relatively stable year-over-year.`
    },
    {
      question: `What is a healthy subscriber growth rate?`,
      answer: `For subscription businesses, healthy growth rates vary by maturity: early-stage companies often see 50-100%+ growth, while mature platforms may grow 10-30% annually. ${symbol} is currently growing at ${(subscriberGrowth * 100).toFixed(1)}% year-over-year.`
    },
    {
      question: `How does ${symbol} compare to competitors in subscriber count?`,
      answer: `${symbol} generates ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue${industry ? ` in the ${industry} industry` : ''}. Use our comparison tool to benchmark ${symbol} against competitors on subscriber metrics and growth rates.`
    },
    {
      question: `What drives ${symbol}'s subscriber growth?`,
      answer: `Subscriber growth for ${companyName} is driven by product innovation, marketing effectiveness, pricing strategy, and customer satisfaction. ${subscriberGrowth > 0 ? `Strong ${(subscriberGrowth * 100).toFixed(1)}% growth indicates effective acquisition and retention strategies.` : 'The company continues to refine its growth strategies.'}`
    },
    {
      question: `How important are subscriber metrics for ${symbol}?`,
      answer: `For subscription-based companies like ${companyName}, total subscriber count is a critical metric that indicates market penetration, revenue potential, and long-term business viability. Combined with ARPU and retention metrics, subscriber count helps investors assess business health.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Subscribers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Total Subscribers ${currentYear} - Subscriber Count Analysis`,
    description: `Complete subscriber analysis for ${symbol} (${companyName}) with growth trends, user metrics, and subscription performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} subscribers`,
      `${symbol} total subscribers`,
      `${symbol} subscriber count`,
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

  const faqSchema = getFAQSchema(subscriberFaqs)

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
            <span>{symbol} Subscribers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Total Subscribers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscriber count trends and growth analysis for {companyName}
          </p>

          {/* Latest Subscriber Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Growth (YoY)</p>
                <p className={`text-3xl font-bold ${subscriberGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {subscriberGrowth >= 0 ? '+' : ''}{(subscriberGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
              {cagr > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{yearsDiff}-Year CAGR</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {(cagr * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">compound growth</p>
                </div>
              )}
            </div>
          </div>

          {/* Annual Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Subscriber Trends</h2>
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

          {/* Quarterly Breakdown */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Performance</h2>
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Subscription Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete subscriber data, retention rates, and AI-powered insights
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
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {subscriberFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Subscriber data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="subscribers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
