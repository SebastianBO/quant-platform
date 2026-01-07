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
    title: `${symbol} Revenue - Annual & Quarterly Sales Data ${currentYear}`,
    description: `${symbol} revenue breakdown: total sales, revenue growth, quarterly trends, revenue by segment. Analyze ${symbol}'s annual and quarterly revenue performance.`,
    keywords: [
      `${symbol} revenue`,
      `${symbol} sales`,
      `${symbol} annual revenue`,
      `${symbol} quarterly revenue`,
      `${symbol} revenue growth`,
      `${symbol} revenue by segment`,
    ],
    openGraph: {
      title: `${symbol} Revenue ${currentYear} | Annual & Quarterly Sales`,
      description: `Complete ${symbol} revenue analysis with annual/quarterly trends, growth rates, and segment breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/revenue/${ticker.toLowerCase()}`,
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

export default async function RevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth
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

  // Generate revenue FAQs
  const revenueFaqs = [
    {
      question: `What is ${symbol}'s revenue?`,
      answer: latestRevenue
        ? `${symbol} (${companyName}) reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue for ${latestPeriod}. ${revenueGrowth > 0 ? `This represents a ${(revenueGrowth * 100).toFixed(1)}% increase compared to the previous year.` : revenueGrowth < 0 ? `This represents a ${Math.abs(revenueGrowth * 100).toFixed(1)}% decrease compared to the previous year.` : ''}`
        : `Revenue data for ${symbol} is currently being updated.`
    },
    {
      question: `How much revenue does ${symbol} make per year?`,
      answer: latestRevenue
        ? `${companyName} generates approximately ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in annual revenue based on the most recent fiscal year ending ${latestPeriod}.`
        : `Annual revenue information for ${symbol} will be available after the next earnings report.`
    },
    {
      question: `Is ${symbol} revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing. The company achieved ${(revenueGrowth * 100).toFixed(1)}% revenue growth year-over-year. ${cagr > 0 ? `Over the past ${yearsDiff} years, revenue has grown at a compound annual growth rate (CAGR) of ${(cagr * 100).toFixed(1)}%.` : ''}`
        : revenueGrowth < 0
        ? `${symbol}'s revenue declined ${Math.abs(revenueGrowth * 100).toFixed(1)}% year-over-year. This could be due to ${sector ? `${sector} sector challenges, ` : ''}market conditions, or business restructuring.`
        : `${symbol}'s revenue has remained relatively flat year-over-year.`
    },
    {
      question: `What is ${symbol}'s quarterly revenue?`,
      answer: latestQuarter?.revenue
        ? `${symbol} reported ${latestQuarter.revenue >= 1e9 ? `$${(latestQuarter.revenue / 1e9).toFixed(2)} billion` : `$${(latestQuarter.revenue / 1e6).toFixed(0)} million`} in revenue for the most recent quarter (${latestQuarter.report_period}). ${quarterlyGrowth > 0 ? `This is ${(quarterlyGrowth * 100).toFixed(1)}% higher than the previous quarter.` : ''}`
        : `Quarterly revenue data for ${symbol} will be updated after the next earnings release.`
    },
    {
      question: `What are ${symbol}'s revenue sources?`,
      answer: productSegments?.length > 0
        ? `${symbol}'s revenue comes from multiple segments: ${productSegments.slice(0, 3).map((s: { name: string }) => s.name).join(', ')}${productSegments.length > 3 ? ', and others' : ''}. See the revenue breakdown below for detailed segment analysis.`
        : `${companyName} operates in the ${sector || 'various'} ${industry ? `${industry} industry` : 'sector'}, generating revenue through its core business operations.`
    },
    {
      question: `How does ${symbol} compare to competitors in revenue?`,
      answer: `${symbol} generates ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in annual revenue${sector ? ` in the ${sector} sector` : ''}. Compare ${symbol} to competitors using our stock comparison tool to see relative market share and growth rates.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Revenue ${currentYear} - Annual & Quarterly Sales Analysis`,
    description: `Complete revenue analysis for ${symbol} (${companyName}) with annual trends, quarterly performance, and segment breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} revenue`,
      `${symbol} sales`,
      `${symbol} annual revenue`,
      `${symbol} quarterly revenue`,
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

  const faqSchema = getFAQSchema(revenueFaqs)

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
            <span>{symbol} Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Annual and quarterly sales data for {companyName}
          </p>

          {/* Latest Revenue Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Annual Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
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
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue Breakdown</h2>
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
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{segment.name}</span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
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
              View complete income statements, balance sheets, and AI-powered insights
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
              {revenueFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
