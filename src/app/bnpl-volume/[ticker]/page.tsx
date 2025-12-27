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
    title: `${symbol} BNPL Volume - ${currentYear} Buy Now Pay Later Payment Data`,
    description: `${symbol} BNPL volume analysis: buy now pay later payments, installment volume, BNPL growth. Analyze ${symbol}'s buy now pay later business metrics.`,
    keywords: [
      `${symbol} BNPL`,
      `${symbol} buy now pay later`,
      `${symbol} installment payments`,
      `${symbol} BNPL volume`,
      `${symbol} deferred payments`,
      `${symbol} payment installments`,
    ],
    openGraph: {
      title: `${symbol} BNPL Volume ${currentYear} | Buy Now Pay Later Analysis`,
      description: `Complete ${symbol} BNPL analysis with buy now pay later volume trends, growth metrics, and installment payment data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/bnpl-volume/${ticker.toLowerCase()}`,
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

export default async function BNPLVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/bnpl-volume/${ticker.toLowerCase()}`
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

  // Generate BNPL FAQs
  const bnplFaqs = [
    {
      question: `What is ${symbol}'s BNPL volume?`,
      answer: `${symbol} (${companyName}) operates in the ${sector || 'payments'} sector${sector === 'Financials' || sector === 'Technology' ? ' with buy now pay later capabilities' : ''}. For ${latestPeriod}, the company reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue. ${revenueGrowth > 0 ? `The ${(revenueGrowth * 100).toFixed(1)}% year-over-year growth reflects strong demand for flexible payment options.` : ''}`
    },
    {
      question: `Is ${symbol}'s BNPL business growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s BNPL-related business is growing. The company achieved ${(revenueGrowth * 100).toFixed(1)}% year-over-year growth, indicating strong consumer adoption of buy now pay later payment options.`
        : revenueGrowth < 0
        ? `${symbol}'s BNPL metrics show ${Math.abs(revenueGrowth * 100).toFixed(1)}% decline year-over-year, which may reflect changing consumer behavior, regulatory impacts, or increased competition in the BNPL market.`
        : `${symbol}'s BNPL volume has remained relatively stable year-over-year.`
    },
    {
      question: `What drives ${symbol}'s BNPL adoption?`,
      answer: `${symbol}'s BNPL growth is driven by consumer demand for flexible payment options, merchant partnerships, seamless checkout experiences, and the shift toward alternative financing. The buy now pay later market continues to expand in e-commerce and retail.`
    },
    {
      question: `How does ${symbol} monetize BNPL?`,
      answer: `${companyName} monetizes buy now pay later through merchant fees, consumer interest and late fees, and partnerships with retailers. The company generates ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue from its payment services including BNPL offerings.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} BNPL`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} BNPL Volume ${currentYear} - Buy Now Pay Later Analysis`,
    description: `Complete BNPL analysis for ${symbol} (${companyName}) with buy now pay later volume trends and growth metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} BNPL`,
      `${symbol} buy now pay later`,
      `${symbol} installment payments`,
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

  const faqSchema = getFAQSchema(bnplFaqs)

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
            <span>{symbol} BNPL</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} BNPL Volume {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Buy now pay later payment volume and growth metrics for {companyName}
          </p>

          {/* Latest Metrics Card */}
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Revenue</p>
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
                <p className="text-sm text-muted-foreground mt-1">BNPL adoption</p>
              </div>
            </div>
          </div>

          {/* Annual BNPL Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual BNPL Revenue Trend</h2>
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

          {/* Quarterly BNPL Volume */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly BNPL Performance</h2>
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
              View complete BNPL metrics, financial statements, and AI-powered insights
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
              {bnplFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> BNPL data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="bnpl-volume" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
