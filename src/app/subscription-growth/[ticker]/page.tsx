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
    title: `${symbol} Subscription Growth - Growth Rate ${currentYear}`,
    description: `${symbol} subscription growth rate analysis: track subscription growth trends, customer acquisition velocity, and expansion metrics for ${symbol}.`,
    keywords: [
      `${symbol} subscription growth`,
      `${symbol} growth rate`,
      `${symbol} subscriber growth`,
      `${symbol} customer acquisition`,
      `${symbol} user growth`,
      `${symbol} expansion metrics`,
    ],
    openGraph: {
      title: `${symbol} Subscription Growth ${currentYear} | Growth Rate Analysis`,
      description: `Complete ${symbol} subscription growth analysis with historical trends, growth velocity, and customer expansion metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/subscription-growth/${ticker.toLowerCase()}`,
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

export default async function SubscriptionGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/subscription-growth/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate growth rate
  const previousAnnual = incomeStatements?.[1]
  const growthRate = previousAnnual?.revenue
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
  const latestQuarter = quarters[0]
  const quarterlyGrowth = quarters[4]?.revenue
    ? ((latestQuarter?.revenue - quarters[4].revenue) / quarters[4].revenue)
    : 0

  // Growth acceleration
  const previousGrowth = incomeStatements?.[2]?.revenue && previousAnnual?.revenue
    ? ((previousAnnual.revenue - incomeStatements[2].revenue) / incomeStatements[2].revenue)
    : 0
  const isAccelerating = growthRate > previousGrowth

  // Generate FAQs
  const growthFaqs = [
    {
      question: `What is ${symbol}'s subscription growth rate?`,
      answer: `${symbol} (${companyName}) achieved ${(growthRate * 100).toFixed(1)}% subscription growth year-over-year as of ${latestPeriod}. ${isAccelerating ? 'Growth is accelerating compared to the previous period.' : 'This represents the company\'s current expansion trajectory.'}${cagr > 0 ? ` Over the past ${yearsDiff} years, the company has maintained a ${(cagr * 100).toFixed(1)}% compound annual growth rate.` : ''}`
    },
    {
      question: `Is ${symbol}'s subscription growth accelerating or decelerating?`,
      answer: isAccelerating
        ? `${symbol}'s subscription growth is accelerating. Current growth of ${(growthRate * 100).toFixed(1)}% exceeds the previous year's ${(previousGrowth * 100).toFixed(1)}% growth rate, indicating improving market momentum and effective growth strategies.`
        : previousGrowth > 0
        ? `${symbol}'s subscription growth has moderated from ${(previousGrowth * 100).toFixed(1)}% to ${(growthRate * 100).toFixed(1)}%, which is common for maturing subscription businesses as they scale.`
        : `${symbol} is growing subscriptions at ${(growthRate * 100).toFixed(1)}% year-over-year.`
    },
    {
      question: `What is a healthy subscription growth rate?`,
      answer: `Healthy subscription growth varies by company stage: early-stage companies target 100%+ growth, growth-stage companies aim for 40-80%, while mature platforms may see 15-30% growth. ${symbol} is currently growing at ${(growthRate * 100).toFixed(1)}% annually, which ${growthRate > 0.4 ? 'represents strong expansion' : 'reflects steady growth'}.`
    },
    {
      question: `How does ${symbol}'s growth compare to industry peers?`,
      answer: `${symbol} is growing subscriptions at ${(growthRate * 100).toFixed(1)}% year-over-year${industry ? ` in the ${industry} industry` : ''}. Use our comparison tools to benchmark ${symbol} against competitors on growth metrics, customer acquisition costs, and retention rates.`
    },
    {
      question: `What drives ${symbol}'s subscription growth?`,
      answer: `Subscription growth for ${companyName} is driven by new customer acquisition, market expansion, product innovation, pricing optimization, and strong retention rates. ${growthRate > 0 ? `Current ${(growthRate * 100).toFixed(1)}% growth reflects effective execution across these growth levers.` : 'The company continues to optimize its growth strategies.'}`
    },
    {
      question: `Can ${symbol} sustain its subscription growth rate?`,
      answer: `Sustainability of ${symbol}'s ${(growthRate * 100).toFixed(1)}% growth depends on market size, competitive dynamics, retention rates, and unit economics. ${cagr > 0 ? `The ${yearsDiff}-year CAGR of ${(cagr * 100).toFixed(1)}% demonstrates sustained growth capabilities.` : 'Monitor quarterly trends for growth sustainability indicators.'}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Subscription Growth`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Subscription Growth ${currentYear} - Growth Rate Analysis`,
    description: `Complete subscription growth analysis for ${symbol} (${companyName}) with historical trends, growth acceleration, and expansion metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} subscription growth`,
      `${symbol} growth rate`,
      `${symbol} subscriber growth`,
      `${symbol} customer acquisition`,
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

  const faqSchema = getFAQSchema(growthFaqs)

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
            <span>{symbol} Subscription Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Subscription Growth {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscription growth rate trends and velocity analysis for {companyName}
          </p>

          {/* Latest Growth Metrics Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Growth Rate</p>
                <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthRate >= 0 ? '+' : ''}{(growthRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">year-over-year</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Growth Trend</p>
                <p className={`text-3xl font-bold ${isAccelerating ? 'text-green-500' : 'text-yellow-500'}`}>
                  {isAccelerating ? 'Accelerating' : 'Steady'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAccelerating ? `up from ${(previousGrowth * 100).toFixed(1)}%` : 'consistent growth'}
                </p>
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

          {/* Annual Growth History */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Growth Rate History</h2>
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
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
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

          {/* Quarterly Growth */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Growth Trends</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarters.slice(0, 8).map((quarter: any, index: number) => {
                  const yoyQuarter = quarters[index + 4]
                  const qoqGrowth = yoyQuarter?.revenue
                    ? ((quarter.revenue - yoyQuarter.revenue) / yoyQuarter.revenue)
                    : null

                  return (
                    <div key={quarter.report_period} className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{quarter.report_period}</p>
                      <p className="text-lg font-bold">
                        {quarter.revenue >= 1e9
                          ? `$${(quarter.revenue / 1e9).toFixed(2)}B`
                          : `$${(quarter.revenue / 1e6).toFixed(0)}M`}
                      </p>
                      {qoqGrowth !== null && (
                        <p className={`text-xs font-medium ${qoqGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {qoqGrowth >= 0 ? '+' : ''}{(qoqGrowth * 100).toFixed(1)}% YoY
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Growth Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete growth analysis, customer cohorts, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/growth/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Growth Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {growthFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Growth data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="growth" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
