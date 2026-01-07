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
    title: `${symbol} Payment Volume Growth - ${currentYear} Growth Rate & Trends`,
    description: `${symbol} payment volume growth analysis: YoY growth rates, volume trends, expansion metrics. Analyze ${symbol}'s payment processing growth and momentum.`,
    keywords: [
      `${symbol} payment growth`,
      `${symbol} volume growth`,
      `${symbol} growth rate`,
      `${symbol} payment trends`,
      `${symbol} expansion`,
      `${symbol} momentum`,
    ],
    openGraph: {
      title: `${symbol} Payment Volume Growth ${currentYear} | Growth Rate Analysis`,
      description: `Complete ${symbol} payment volume growth analysis with YoY trends, growth rates, and momentum indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/payment-volume-growth/${ticker.toLowerCase()}`,
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

export default async function PaymentVolumeGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/payment-volume-growth/${ticker.toLowerCase()}`
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

  // Generate Growth FAQs
  const growthFaqs = [
    {
      question: `What is ${symbol}'s payment volume growth rate?`,
      answer: `${symbol} (${companyName}) achieved ${(revenueGrowth * 100).toFixed(1)}% year-over-year growth in ${latestPeriod}. ${revenueGrowth > 0 ? `This positive growth indicates strong momentum in payment processing volume and business expansion.` : `This reflects current market conditions and competitive dynamics in the ${sector || 'payments'} sector.`} ${cagr > 0 ? `Over the past ${yearsDiff} years, the company has achieved a ${(cagr * 100).toFixed(1)}% compound annual growth rate (CAGR).` : ''}`
    },
    {
      question: `Is ${symbol}'s payment volume accelerating or decelerating?`,
      answer: quarterlyGrowth > revenueGrowth
        ? `${symbol}'s payment volume is accelerating. The most recent quarter showed ${(quarterlyGrowth * 100).toFixed(1)}% sequential growth, outpacing the annual growth rate of ${(revenueGrowth * 100).toFixed(1)}%, suggesting positive momentum.`
        : `${symbol}'s quarterly growth rate of ${(quarterlyGrowth * 100).toFixed(1)}% indicates ${quarterlyGrowth > 0 ? 'continued expansion' : 'current challenges'} in the payment processing market.`
    },
    {
      question: `What drives ${symbol}'s payment volume growth?`,
      answer: `${symbol}'s payment volume growth is driven by user acquisition, increased transaction frequency, market expansion, new product launches, and partnerships. The company operates in the ${sector || 'payments'} sector where growth depends on network effects and platform adoption.`
    },
    {
      question: `How does ${symbol}'s growth compare to competitors?`,
      answer: `${symbol} is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year${cagr > 0 ? ` with a ${yearsDiff}-year CAGR of ${(cagr * 100).toFixed(1)}%` : ''}. Use our comparison tool to analyze ${symbol} against competitors in payment volume growth and market share gains.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Growth`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Payment Volume Growth ${currentYear} - Growth Rate Analysis`,
    description: `Complete growth analysis for ${symbol} (${companyName}) with YoY trends, CAGR, and momentum indicators.`,
    url: pageUrl,
    keywords: [
      `${symbol} payment growth`,
      `${symbol} volume growth`,
      `${symbol} growth rate`,
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
            <span>{symbol} Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Payment Volume Growth {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Payment volume growth rates and trends for {companyName}
          </p>

          {/* Latest Growth Metrics Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
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
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">annual run rate</p>
              </div>
            </div>
          </div>

          {/* Annual Growth Trend */}
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

          {/* Quarterly Growth Trends */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Growth Trends</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarters.slice(0, 8).map((quarter: any, index: number) => {
                  const prevQuarter = quarters[index + 1]
                  const qoqGrowth = prevQuarter?.revenue
                    ? ((quarter.revenue - prevQuarter.revenue) / prevQuarter.revenue)
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
                        <p className={`text-xs mt-1 ${qoqGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {qoqGrowth >= 0 ? '+' : ''}{(qoqGrowth * 100).toFixed(1)}% QoQ
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete growth metrics, financial statements, and AI-powered insights
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
          <RelatedLinks ticker={symbol} currentPage="payment-volume-growth" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
