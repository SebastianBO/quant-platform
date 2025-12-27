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
    title: `${symbol} ARR Growth - Annual Recurring Revenue ${currentYear}`,
    description: `${symbol} ARR (Annual Recurring Revenue) growth analysis: track ARR trends, growth rates, and SaaS revenue performance for ${symbol}.`,
    keywords: [
      `${symbol} ARR`,
      `${symbol} annual recurring revenue`,
      `${symbol} ARR growth`,
      `${symbol} recurring revenue`,
      `${symbol} SaaS metrics`,
      `${symbol} subscription revenue`,
    ],
    openGraph: {
      title: `${symbol} ARR Growth ${currentYear} | Annual Recurring Revenue`,
      description: `Complete ${symbol} ARR analysis with growth trends, SaaS metrics, and recurring revenue performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/arr-growth/${ticker.toLowerCase()}`,
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

export default async function ARRGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/arr-growth/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data (proxy for ARR if not explicitly reported)
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (proxy for ARR growth)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
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
  const quarterlyGrowth = quarters[1]?.revenue
    ? ((latestQuarter?.revenue - quarters[1].revenue) / quarters[1].revenue)
    : 0

  // Generate ARR FAQs
  const arrFaqs = [
    {
      question: `What is ${symbol}'s ARR?`,
      answer: latestRevenue
        ? `${symbol} (${companyName}) reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in annual recurring revenue for ${latestPeriod}. ${revenueGrowth > 0 ? `This represents a ${(revenueGrowth * 100).toFixed(1)}% increase compared to the previous year.` : ''}`
        : `ARR data for ${symbol} is currently being updated.`
    },
    {
      question: `Is ${symbol}'s ARR growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s ARR is growing. The company achieved ${(revenueGrowth * 100).toFixed(1)}% ARR growth year-over-year. ${cagr > 0 ? `Over the past ${yearsDiff} years, ARR has grown at a compound annual growth rate (CAGR) of ${(cagr * 100).toFixed(1)}%.` : ''}`
        : revenueGrowth < 0
        ? `${symbol}'s ARR declined ${Math.abs(revenueGrowth * 100).toFixed(1)}% year-over-year. This could indicate churn or market challenges.`
        : `${symbol}'s ARR has remained relatively flat year-over-year.`
    },
    {
      question: `What is a good ARR growth rate?`,
      answer: `For SaaS companies, ARR growth rates vary by stage: early-stage companies often target 100%+ growth, while mature companies may see 20-40% growth. ${symbol} is currently growing ARR at ${(revenueGrowth * 100).toFixed(1)}% year-over-year.`
    },
    {
      question: `How does ${symbol}'s ARR compare to competitors?`,
      answer: `${symbol} generates ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in ARR${sector ? ` in the ${sector} sector` : ''}. Compare ${symbol} to competitors using our comparison tool to see relative ARR growth rates.`
    },
    {
      question: `What drives ${symbol}'s ARR growth?`,
      answer: `ARR growth for ${companyName} is driven by new customer acquisition, expansion revenue from existing customers, and product innovation. ${revenueGrowth > 0 ? `Strong ${(revenueGrowth * 100).toFixed(1)}% growth indicates effective sales and retention strategies.` : ''}`
    },
    {
      question: `What is the difference between ARR and revenue?`,
      answer: `ARR (Annual Recurring Revenue) represents the annualized value of recurring subscription revenue, while total revenue may include one-time fees, services, and non-recurring items. For SaaS companies like ${companyName}, ARR is a key metric for predictable, recurring revenue.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ARR Growth`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ARR Growth ${currentYear} - Annual Recurring Revenue Analysis`,
    description: `Complete ARR growth analysis for ${symbol} (${companyName}) with annual trends, quarterly performance, and SaaS metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ARR`,
      `${symbol} annual recurring revenue`,
      `${symbol} ARR growth`,
      `${symbol} SaaS metrics`,
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

  const faqSchema = getFAQSchema(arrFaqs)

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
            <span>{symbol} ARR Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ARR Growth {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Annual recurring revenue trends and growth analysis for {companyName}
          </p>

          {/* Latest ARR Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest ARR</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ARR Growth (YoY)</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
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

          {/* Annual ARR Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual ARR History</h2>
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

          {/* Quarterly ARR */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly ARR Breakdown</h2>
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
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} SaaS Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, customer metrics, and AI-powered insights
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
              {arrFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ARR data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
