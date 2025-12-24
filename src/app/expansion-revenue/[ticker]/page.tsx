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
    title: `${symbol} Expansion Revenue - Upsell & Cross-Sell ${currentYear}`,
    description: `${symbol} expansion revenue analysis: track upsell revenue, cross-sell performance, and existing customer expansion for ${symbol}.`,
    keywords: [
      `${symbol} expansion revenue`,
      `${symbol} upsell revenue`,
      `${symbol} cross-sell`,
      `${symbol} net revenue retention`,
      `${symbol} customer expansion`,
      `${symbol} account growth`,
    ],
    openGraph: {
      title: `${symbol} Expansion Revenue ${currentYear} | Upsell & Cross-Sell Analysis`,
      description: `Complete ${symbol} expansion revenue analysis with upsell trends, cross-sell performance, and customer growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/expansion-revenue/${ticker.toLowerCase()}`,
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

export default async function ExpansionRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/expansion-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (includes expansion)
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

  // Gross margin (indicator of expansion efficiency)
  const grossMargin = metrics?.gross_margin || latestAnnual?.gross_profit_margin || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const expansionFaqs = [
    {
      question: `What is ${symbol}'s expansion revenue?`,
      answer: `Expansion revenue represents additional revenue from existing customers through upsells, cross-sells, and feature upgrades. For ${symbol} (${companyName}), expansion revenue is a key growth driver${sector ? ` in the ${sector} sector` : ''}. ${revenueGrowth > 0 ? `The company's ${(revenueGrowth * 100).toFixed(1)}% total revenue growth includes both new customer acquisition and existing customer expansion.` : ''}`
    },
    {
      question: `How much of ${symbol}'s growth comes from expansion?`,
      answer: `While specific expansion vs. new customer breakdown is not always disclosed, top SaaS companies derive 40-60% of growth from existing customers. ${companyName}'s ${(grossMargin * 100).toFixed(0)}% gross margins support investment in customer success and expansion strategies. ${revenueGrowth > 0.2 ? 'Strong growth suggests effective expansion programs.' : ''}`
    },
    {
      question: `What is Net Revenue Retention (NRR) for ${symbol}?`,
      answer: `Net Revenue Retention measures revenue from existing customers (including expansions minus churn). Best-in-class SaaS companies achieve 120%+ NRR, meaning existing customers generate 20%+ more revenue each year. ${revenueGrowth > 0 ? `${symbol}'s ${(revenueGrowth * 100).toFixed(1)}% revenue growth indicates strong retention and expansion dynamics.` : ''}`
    },
    {
      question: `How does ${symbol} drive expansion revenue?`,
      answer: `${companyName} likely drives expansion through: feature-based upsells (premium tiers), usage-based pricing (grow with customer), multi-product cross-sells, professional services, and enterprise plan upgrades. ${grossMargin > 0.6 ? `High ${(grossMargin * 100).toFixed(0)}% margins provide room for customer success investment.` : ''}`
    },
    {
      question: `Why is expansion revenue important for ${symbol}?`,
      answer: `Expansion revenue is critical for ${symbol} because: it's cheaper than new customer acquisition (no CAC), validates product-market fit, increases customer lifetime value, demonstrates product stickiness, and enables efficient growth scaling. ${revenueGrowth > 0 ? `Current ${(revenueGrowth * 100).toFixed(1)}% growth reflects expansion success.` : ''}`
    },
    {
      question: `What metrics indicate ${symbol}'s expansion success?`,
      answer: `Key expansion indicators for ${companyName} include: Net Revenue Retention (NRR) above 100%, increasing ARPU over time, product attach rates, expansion sales efficiency, and ${(grossMargin * 100).toFixed(0)}% gross margins supporting growth investment. ${cagr > 0 ? `${yearsDiff}-year CAGR of ${(cagr * 100).toFixed(1)}% shows sustained expansion.` : ''}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Expansion Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Expansion Revenue ${currentYear} - Upsell & Cross-Sell Analysis`,
    description: `Complete expansion revenue analysis for ${symbol} (${companyName}) with upsell trends, cross-sell metrics, and customer growth performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} expansion revenue`,
      `${symbol} upsell revenue`,
      `${symbol} cross-sell`,
      `${symbol} net revenue retention`,
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

  const faqSchema = getFAQSchema(expansionFaqs)

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
            <span>{symbol} Expansion Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Expansion Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upsell, cross-sell, and existing customer revenue growth for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">includes expansion</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-green-500">
                  {(grossMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">expansion efficiency</p>
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

          {/* Expansion Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Expansion Revenue Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Upsell Opportunities</h3>
                <p className="text-muted-foreground mb-4">
                  Moving customers to higher tiers through:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    <span>Feature unlocks and premium capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    <span>Increased usage limits and capacity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    <span>Enterprise-grade support and SLAs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    <span>Advanced security and compliance features</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Cross-Sell Expansion</h3>
                <p className="text-muted-foreground mb-4">
                  Increasing wallet share with:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    <span>Additional product modules and add-ons</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    <span>Complementary service offerings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    <span>Professional services and training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    <span>Platform ecosystem integrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Annual Revenue Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue Performance</h2>
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
                          <p className="text-sm text-muted-foreground">Growth</p>
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
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue Trends</h2>
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
          <section className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 rounded-xl border border-teal-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Customer Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete expansion data, NRR metrics, and AI-powered growth insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {expansionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Expansion revenue data is based on publicly available information. Specific expansion vs. new customer breakdowns may not be disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
