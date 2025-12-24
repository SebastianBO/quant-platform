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
    title: `${symbol} Cross-Border Revenue - ${currentYear} International Payment Data`,
    description: `${symbol} cross-border revenue analysis: international payments, global expansion, cross-border volume. Analyze ${symbol}'s international payment processing growth.`,
    keywords: [
      `${symbol} cross-border`,
      `${symbol} international payments`,
      `${symbol} global expansion`,
      `${symbol} cross-border revenue`,
      `${symbol} international volume`,
      `${symbol} global payments`,
    ],
    openGraph: {
      title: `${symbol} Cross-Border Revenue ${currentYear} | International Payments`,
      description: `Complete ${symbol} cross-border analysis with international payment trends, global expansion metrics, and regional revenue data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cross-border/${ticker.toLowerCase()}`,
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

export default async function CrossBorderPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, geographicSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cross-border/${ticker.toLowerCase()}`
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

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []
  const latestQuarter = quarters[0]

  // Generate Cross-Border FAQs
  const crossBorderFaqs = [
    {
      question: `What is ${symbol}'s cross-border revenue?`,
      answer: geographicSegments && geographicSegments.length > 1
        ? `${symbol} (${companyName}) operates globally with revenue from multiple regions. For ${latestPeriod}, the company reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in total revenue across ${geographicSegments.length} geographic segments.`
        : `${symbol} (${companyName}) processes payments in the ${sector || 'payments'} sector. For ${latestPeriod}, the company reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue from its global operations.`
    },
    {
      question: `Is ${symbol}'s international business growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s global business is expanding. The company achieved ${(revenueGrowth * 100).toFixed(1)}% year-over-year growth, driven by international market penetration and cross-border payment volume.`
        : `${symbol}'s international growth is ${revenueGrowth < 0 ? `facing headwinds with ${Math.abs(revenueGrowth * 100).toFixed(1)}% decline` : 'stabilizing'} year-over-year, reflecting global market dynamics.`
    },
    {
      question: `Which regions drive ${symbol}'s cross-border revenue?`,
      answer: geographicSegments && geographicSegments.length > 0
        ? `${symbol}'s cross-border revenue comes from multiple regions including ${geographicSegments.slice(0, 3).map((s: { region: string }) => s.region).join(', ')}${geographicSegments.length > 3 ? ', and others' : ''}. See the regional breakdown below for detailed geographic analysis.`
        : `${companyName} operates globally in the ${sector || 'payments'} sector, processing cross-border payments across multiple regions and currencies.`
    },
    {
      question: `What affects ${symbol}'s cross-border payment volume?`,
      answer: `${symbol}'s cross-border volume is influenced by currency fluctuations, regulatory changes, international trade growth, e-commerce expansion, and competitive dynamics in global payment processing.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Cross-Border`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Cross-Border Revenue ${currentYear} - International Payments`,
    description: `Complete cross-border analysis for ${symbol} (${companyName}) with international payment trends and regional revenue.`,
    url: pageUrl,
    keywords: [
      `${symbol} cross-border`,
      `${symbol} international payments`,
      `${symbol} global expansion`,
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

  const faqSchema = getFAQSchema(crossBorderFaqs)

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
            <span>{symbol} Cross-Border</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Cross-Border Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            International payment processing and global expansion metrics for {companyName}
          </p>

          {/* Latest Metrics Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
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
                <p className="text-sm text-muted-foreground mt-1">global expansion</p>
              </div>
            </div>
          </div>

          {/* Geographic Revenue Breakdown */}
          {geographicSegments && geographicSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Revenue by Region</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {geographicSegments.slice(0, 8).map((segment: { region: string; revenue: number }, index: number) => {
                    const percentage = latestRevenue > 0 ? (segment.revenue / latestRevenue * 100) : 0
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{segment.region}</span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
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
            <h2 className="text-2xl font-bold mb-4">Annual Global Revenue</h2>
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
              <h2 className="text-2xl font-bold mb-4">Quarterly International Revenue</h2>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete geographic metrics, financial statements, and AI-powered insights
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
              {crossBorderFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Cross-border data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="cross-border" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
