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
    title: `${symbol} Take Rate - ${currentYear} Payment Monetization & Fee Analysis`,
    description: `${symbol} take rate analysis: revenue per transaction, payment fees, monetization metrics. Analyze ${symbol}'s payment processing economics and profitability.`,
    keywords: [
      `${symbol} take rate`,
      `${symbol} payment fees`,
      `${symbol} revenue per transaction`,
      `${symbol} monetization`,
      `${symbol} payment economics`,
      `${symbol} transaction fees`,
    ],
    openGraph: {
      title: `${symbol} Take Rate ${currentYear} | Payment Monetization Analysis`,
      description: `Complete ${symbol} take rate analysis with fee trends, monetization metrics, and revenue per transaction.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/take-rate/${ticker.toLowerCase()}`,
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

export default async function TakeRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/take-rate/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest financial data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''
  const grossProfit = latestAnnual?.gross_profit || 0
  const grossMargin = latestRevenue > 0 ? (grossProfit / latestRevenue) : 0

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []
  const latestQuarter = quarters[0]

  // Generate Take Rate FAQs
  const takeRateFaqs = [
    {
      question: `What is ${symbol}'s take rate?`,
      answer: `${symbol} (${companyName}) operates in the ${sector || 'payments'} sector. The company's gross margin of ${(grossMargin * 100).toFixed(2)}% provides insight into its monetization efficiency. For ${latestPeriod}, ${symbol} reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in revenue with a gross profit of ${grossProfit >= 1e9 ? `$${(grossProfit / 1e9).toFixed(2)} billion` : `$${(grossProfit / 1e6).toFixed(0)} million`}.`
    },
    {
      question: `How does ${symbol} monetize payments?`,
      answer: `${companyName} monetizes payments through transaction fees and processing charges. The company's gross margin of ${(grossMargin * 100).toFixed(2)}% indicates how efficiently it converts payment volume into revenue after direct costs.`
    },
    {
      question: `Is ${symbol}'s take rate improving?`,
      answer: revenueGrowth > 0
        ? `${symbol} achieved ${(revenueGrowth * 100).toFixed(1)}% revenue growth year-over-year, suggesting strong monetization and potentially improving take rates through increased volume or pricing optimization.`
        : `${symbol}'s revenue growth has been ${revenueGrowth < 0 ? 'negative' : 'flat'}, which may indicate pressure on take rates or payment volume.`
    },
    {
      question: `What factors affect ${symbol}'s take rate?`,
      answer: `${symbol}'s take rate is influenced by payment mix (card types, payment methods), merchant mix, competitive pricing, and value-added services. Companies with higher gross margins (${symbol}: ${(grossMargin * 100).toFixed(2)}%) typically have better pricing power or lower processing costs.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Take Rate`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Take Rate ${currentYear} - Payment Monetization Analysis`,
    description: `Complete take rate analysis for ${symbol} (${companyName}) with fee trends and monetization metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} take rate`,
      `${symbol} payment fees`,
      `${symbol} monetization`,
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

  const faqSchema = getFAQSchema(takeRateFaqs)

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
            <span>{symbol} Take Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Take Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Payment monetization and fee analysis for {companyName}
          </p>

          {/* Latest Metrics Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {(grossMargin * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">monetization efficiency</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">revenue growth</p>
              </div>
            </div>
          </div>

          {/* Annual Margin Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Gross Margin History</h2>
            <div className="space-y-3">
              {incomeStatements?.slice(0, 5).map((statement: any) => {
                const margin = statement.revenue > 0 ? (statement.gross_profit / statement.revenue) : 0

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
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Gross Margin</p>
                        <p className="text-xl font-bold text-emerald-500">
                          {(margin * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Quarterly Data */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Monetization Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarters.slice(0, 8).map((quarter: any) => {
                  const qMargin = quarter.revenue > 0 ? (quarter.gross_profit / quarter.revenue) : 0
                  return (
                    <div key={quarter.report_period} className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{quarter.report_period}</p>
                      <p className="text-lg font-bold">
                        {quarter.revenue >= 1e9
                          ? `$${(quarter.revenue / 1e9).toFixed(2)}B`
                          : `$${(quarter.revenue / 1e6).toFixed(0)}M`}
                      </p>
                      <p className="text-xs text-emerald-500 mt-1">{(qMargin * 100).toFixed(2)}% margin</p>
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
              View complete payment metrics, financial statements, and AI-powered insights
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
              {takeRateFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Take rate and monetization data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="take-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
