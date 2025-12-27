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
    title: `${symbol} Contraction Rate - Revenue Downgrades ${currentYear}`,
    description: `${symbol} contraction rate analysis: track revenue downgrades, account contractions, and subscription downsells for ${symbol}.`,
    keywords: [
      `${symbol} contraction rate`,
      `${symbol} revenue contraction`,
      `${symbol} downgrades`,
      `${symbol} downsells`,
      `${symbol} account contraction`,
      `${symbol} subscription downgrades`,
    ],
    openGraph: {
      title: `${symbol} Contraction Rate ${currentYear} | Revenue Downgrade Analysis`,
      description: `Complete ${symbol} contraction rate analysis with revenue downgrade trends, account contraction, and subscription metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/contraction-rate/${ticker.toLowerCase()}`,
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

export default async function ContractionRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/contraction-rate/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (inverse indicator of contraction)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Gross margin (quality of revenue indicator)
  const grossMargin = metrics?.gross_margin || latestAnnual?.gross_profit_margin || 0

  // Operating margin (profitability health)
  const operatingMargin = metrics?.operating_margin || latestAnnual?.operating_margin || 0

  // Calculate stability metrics
  const yearsDiff = incomeStatements?.length > 1 ? incomeStatements.length - 1 : 1
  const oldestAnnual = incomeStatements?.[incomeStatements.length - 1]
  const cagr = oldestAnnual?.revenue
    ? Math.pow(latestRevenue / oldestAnnual.revenue, 1 / yearsDiff) - 1
    : 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const contractionFaqs = [
    {
      question: `What is ${symbol}'s contraction rate?`,
      answer: `Contraction rate measures revenue lost from existing customers downgrading or reducing usage. For ${symbol} (${companyName}), low contraction is critical for healthy growth. ${revenueGrowth > 0 ? `With ${(revenueGrowth * 100).toFixed(1)}% revenue growth, the company demonstrates strong net expansion, suggesting contraction is more than offset by upgrades and new sales.` : 'Monitoring contraction helps assess customer satisfaction and product-market fit.'}`
    },
    {
      question: `How does contraction impact ${symbol}'s growth?`,
      answer: `Contraction directly reduces Net Revenue Retention (NRR). Best-in-class companies keep contraction under 5%, achieving NRR above 120%. ${symbol}'s ${(grossMargin * 100).toFixed(0)}% gross margins${revenueGrowth > 0 ? ` and ${(revenueGrowth * 100).toFixed(1)}% revenue growth indicate` : ' support'} healthy customer economics with minimal contraction drag.`
    },
    {
      question: `What causes customer contraction at ${symbol}?`,
      answer: `Common contraction drivers include: reduced usage or seat counts, downgrades to lower tiers, economic pressures on customers, competitive alternatives, or incomplete product-market fit. ${companyName} mitigates contraction through customer success programs, product innovation, and usage-based value delivery.`
    },
    {
      question: `How does ${symbol} minimize contraction?`,
      answer: `${companyName} likely minimizes contraction through: proactive customer success outreach, usage monitoring and optimization, flexible pricing tiers, product engagement initiatives, and value demonstration programs. ${revenueGrowth > 0 ? `Strong ${(revenueGrowth * 100).toFixed(1)}% growth suggests effective contraction management.` : 'These strategies help maintain revenue stability.'}`
    },
    {
      question: `Is ${symbol}'s contraction rate improving or worsening?`,
      answer: `While specific contraction rates are not always disclosed, ${revenueGrowth >= 0 ? `${symbol}'s positive ${(revenueGrowth * 100).toFixed(1)}% revenue growth and ${cagr > 0 ? `${(cagr * 100).toFixed(1)}% CAGR over ${yearsDiff} years` : 'stable performance'} suggest well-managed contraction levels` : 'revenue trends provide insights into contraction dynamics'}. ${grossMargin > 0.6 ? `High ${(grossMargin * 100).toFixed(0)}% margins enable investment in contraction prevention.` : ''}`
    },
    {
      question: `Why is contraction rate important for ${symbol} investors?`,
      answer: `Contraction rate is crucial because: it impacts Net Revenue Retention (key valuation driver), indicates customer satisfaction and product stickiness, affects growth efficiency and CAC payback, and signals competitive positioning. For ${companyName}, low contraction combined with ${(grossMargin * 100).toFixed(0)}% gross margins supports sustainable growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Contraction Rate`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Contraction Rate ${currentYear} - Revenue Downgrade Analysis`,
    description: `Complete contraction rate analysis for ${symbol} (${companyName}) with revenue downgrade trends, account contraction, and retention metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} contraction rate`,
      `${symbol} revenue contraction`,
      `${symbol} downgrades`,
      `${symbol} account contraction`,
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

  const faqSchema = getFAQSchema(contractionFaqs)

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
            <span>{symbol} Contraction Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Contraction Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revenue contraction, downgrades, and customer retention analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {revenueGrowth >= 0 ? 'expansion > contraction' : 'net contraction'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-blue-500">
                  {(grossMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">revenue quality</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating Margin</p>
                <p className={`text-3xl font-bold ${operatingMargin >= 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {(operatingMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">profitability health</p>
              </div>
            </div>
          </div>

          {/* Contraction Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contraction Management Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Prevention Tactics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Proactive customer success and health monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Early warning systems for usage decline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Value demonstration and ROI reporting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Feature adoption and engagement programs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Flexible pricing to match usage patterns</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Contraction Indicators</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>Declining usage or seat counts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>Feature adoption stagnation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>Customer health score deterioration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>Support ticket volume increase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>Executive sponsor disengagement</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Revenue Stability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Stability Trends</h2>
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
                          <p className="text-sm text-muted-foreground">Net Growth</p>
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

          {/* Quarterly Performance */}
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retention Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete contraction data, retention rates, and AI-powered customer insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {contractionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Contraction data is based on publicly available information. Specific contraction rates may not be disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="metrics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
