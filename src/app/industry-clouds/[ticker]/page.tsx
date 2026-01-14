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
    title: `${symbol} Industry Clouds Revenue - Vertical-Specific Cloud Sales ${currentYear}`,
    description: `${symbol} Industry Clouds revenue breakdown: vertical cloud solutions, industry-specific revenue, growth trends. Analyze ${symbol}'s Industry Clouds performance.`,
    keywords: [
      `${symbol} Industry Clouds revenue`,
      `${symbol} vertical clouds`,
      `${symbol} industry solutions`,
      `${symbol} Industry Clouds growth`,
    ],
    openGraph: {
      title: `${symbol} Industry Clouds Revenue ${currentYear} | Vertical Cloud Analytics`,
      description: `Complete ${symbol} Industry Clouds revenue analysis with growth trends and market data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/industry-clouds/${ticker.toLowerCase()}`,
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

export default async function IndustryCloudsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/industry-clouds/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Find Industry Clouds revenue segment (if available)
  const industryCloudsSegment = productSegments?.find((seg: any) =>
    seg.name?.toLowerCase().includes('industry cloud') ||
    seg.name?.toLowerCase().includes('vertical') ||
    seg.name?.toLowerCase().includes('healthcare') ||
    seg.name?.toLowerCase().includes('financial services') ||
    seg.name?.toLowerCase().includes('manufacturing')
  )
  const industryCloudsRevenue = industryCloudsSegment?.revenue || 0
  const industryCloudsPercentage = latestRevenue > 0 ? (industryCloudsRevenue / latestRevenue * 100) : 0

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate Industry Clouds FAQs
  const industryCloudsFaqs = [
    {
      question: `What is ${symbol}'s Industry Clouds revenue?`,
      answer: industryCloudsRevenue > 0
        ? `${symbol} (${companyName}) reported ${industryCloudsRevenue >= 1e9 ? `$${(industryCloudsRevenue / 1e9).toFixed(2)} billion` : `$${(industryCloudsRevenue / 1e6).toFixed(0)} million`} in Industry Clouds revenue for ${latestPeriod}, representing ${industryCloudsPercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not separately report Industry Clouds revenue in its financial statements. The company's total revenue for ${latestPeriod} was ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`}.`
    },
    {
      question: `How is ${symbol}'s Industry Clouds business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s overall business achieved ${(revenueGrowth * 100).toFixed(1)}% revenue growth year-over-year. ${industryCloudsRevenue > 0 ? 'Industry Clouds benefit from vertical-specific requirements, regulatory compliance needs, and industry best practices embedded in the solutions.' : 'Vertical cloud solutions contribute to overall growth.'}`
        : `${symbol}'s revenue growth has been ${Math.abs(revenueGrowth * 100).toFixed(1)}% year-over-year. Competition in vertical cloud markets and customer adoption cycles may be affecting growth.`
    },
    {
      question: `What industry verticals does ${symbol} serve?`,
      answer: `${companyName} operates in the ${sector || 'technology'} sector and typically serves multiple industry verticals including healthcare & life sciences, financial services, manufacturing, retail, public sector, communications & media, and automotive. Each Industry Cloud offers vertical-specific data models, processes, and compliance features.`
    },
    {
      question: `How does ${symbol} Industry Clouds compare to competitors?`,
      answer: `${symbol} competes in the vertical cloud solutions market with total revenue of ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`}. Compare ${symbol} to Salesforce Industry Clouds (CRM), Microsoft Cloud for Industries (MSFT), and Oracle Industry Solutions (ORCL) to evaluate competitive positioning.`
    },
    {
      question: `What is the industry clouds market opportunity?`,
      answer: `The global vertical/industry cloud market continues to grow as businesses seek industry-specific functionality, pre-built integrations, regulatory compliance, and best practices embedded in their cloud platforms. ${symbol}'s opportunity depends on vertical expertise, partner ecosystems, and customer success in specific industries.`
    },
    {
      question: `Where can I find ${symbol}'s Industry Clouds metrics?`,
      answer: `For detailed Industry Clouds metrics, customer counts by vertical, industry-specific ARR growth, and vertical cloud adoption rates, review ${symbol}'s quarterly earnings calls, investor presentations, and industry conference announcements available on their investor relations website.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Industry Clouds`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Industry Clouds Revenue ${currentYear} - Vertical Cloud Analytics`,
    description: `Complete Industry Clouds revenue analysis for ${symbol} (${companyName}) with growth trends and market insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} Industry Clouds revenue`,
      `${symbol} vertical clouds`,
      `${symbol} industry solutions`,
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

  const faqSchema = getFAQSchema(industryCloudsFaqs)

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
            <span>{symbol} Industry Clouds</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Industry Clouds Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Vertical-specific cloud solutions revenue data for {companyName}
          </p>

          {/* Latest Revenue Card */}
          <div className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 p-8 rounded-xl border border-rose-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              {industryCloudsRevenue > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry Clouds Revenue</p>
                  <p className="text-3xl font-bold text-rose-500">
                    {industryCloudsRevenue >= 1e9
                      ? `$${(industryCloudsRevenue / 1e9).toFixed(2)}B`
                      : `$${(industryCloudsRevenue / 1e6).toFixed(0)}M`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{industryCloudsPercentage.toFixed(1)}% of total</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          {productSegments && productSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {productSegments.slice(0, 8).map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = latestRevenue > 0 ? (segment.revenue / latestRevenue * 100) : 0
                    const isIndustryClouds = segment.name?.toLowerCase().includes('industry') ||
                                             segment.name?.toLowerCase().includes('vertical') ||
                                             segment.name?.toLowerCase().includes('healthcare') ||
                                             segment.name?.toLowerCase().includes('financial')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isIndustryClouds ? 'text-rose-500' : ''}`}>
                            {segment.name}
                            {isIndustryClouds && ' (Industry)'}
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
                            className={`${isIndustryClouds ? 'bg-rose-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete income statements, revenue segments, and AI-powered insights
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
                Full Revenue Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {industryCloudsFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="industry-clouds" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
