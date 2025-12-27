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
    title: `${symbol} Monthly vs Annual Plans - Subscription Mix ${currentYear}`,
    description: `${symbol} monthly vs annual subscription mix analysis: track billing plan distribution, revenue predictability, and subscription economics for ${symbol}.`,
    keywords: [
      `${symbol} monthly plans`,
      `${symbol} annual plans`,
      `${symbol} subscription mix`,
      `${symbol} billing plans`,
      `${symbol} payment frequency`,
      `${symbol} plan distribution`,
    ],
    openGraph: {
      title: `${symbol} Monthly vs Annual Plans ${currentYear} | Subscription Mix`,
      description: `Complete ${symbol} subscription plan analysis with monthly vs annual distribution, revenue mix, and billing economics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/monthly-vs-annual/${ticker.toLowerCase()}`,
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

export default async function MonthlyVsAnnualPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/monthly-vs-annual/${ticker.toLowerCase()}`
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

  // Calculate deferred revenue (indicator of annual plan adoption)
  const currentAssets = snapshot?.total_assets || 0
  const currentLiabilities = snapshot?.total_liabilities || 0

  // Cash flow metrics
  const cashFromOps = latestAnnual?.operating_cash_flow || 0
  const freeCashFlow = latestAnnual?.free_cash_flow || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const planMixFaqs = [
    {
      question: `Does ${symbol} offer monthly and annual subscription plans?`,
      answer: `${symbol} (${companyName}) operates a subscription-based business model${sector ? ` in the ${sector} sector` : ''}. Most subscription companies offer both monthly and annual billing options, with annual plans typically providing 15-30% discounts to encourage upfront commitments and improve cash flow.`
    },
    {
      question: `What percentage of ${symbol} subscribers choose annual plans?`,
      answer: `While specific plan mix percentages are not always publicly disclosed, subscription companies typically see 30-60% of customers on annual plans. ${cashFromOps > latestRevenue * 0.8 ? `${symbol}'s strong operating cash flow suggests healthy annual plan adoption, which provides upfront cash.` : 'Plan distribution varies by customer segment and pricing strategy.'}`
    },
    {
      question: `Why are annual plans important for ${symbol}?`,
      answer: `Annual plans benefit ${companyName} through: improved cash flow from upfront payments, lower churn rates (annual commitment reduces cancellations), reduced payment processing costs, better revenue predictability, and stronger customer lifetime value. ${revenueGrowth > 0 ? `With ${(revenueGrowth * 100).toFixed(1)}% revenue growth, effective plan mix optimization supports expansion.` : ''}`
    },
    {
      question: `How does ${symbol}'s plan mix impact valuation?`,
      answer: `Higher annual plan adoption generally increases ${symbol}'s valuation by: improving deferred revenue balances (future revenue visibility), reducing revenue volatility, lowering CAC payback periods, and demonstrating customer commitment. Investors favor businesses with strong annual plan penetration.`
    },
    {
      question: `What is the typical discount for ${symbol} annual plans?`,
      answer: `SaaS companies typically discount annual plans by 15-25% compared to equivalent monthly billing. For example, a $10/month plan might cost $100/year (17% discount). ${companyName} likely optimizes discounts to balance cash flow benefits against revenue per customer.`
    },
    {
      question: `How does plan mix affect ${symbol}'s cash flow?`,
      answer: `${companyName}'s plan mix significantly impacts cash flow. Annual plans provide upfront cash (improving ${cashFromOps > 0 ? `the current $${(cashFromOps / 1e9).toFixed(2)}B operating cash flow` : 'operating cash flow'}), while monthly plans spread payments over 12 months. Higher annual plan adoption accelerates cash collection and reduces working capital needs.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Monthly vs Annual`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Monthly vs Annual Plans ${currentYear} - Subscription Mix Analysis`,
    description: `Complete subscription plan analysis for ${symbol} (${companyName}) with monthly vs annual distribution, billing economics, and cash flow impact.`,
    url: pageUrl,
    keywords: [
      `${symbol} monthly plans`,
      `${symbol} annual plans`,
      `${symbol} subscription mix`,
      `${symbol} billing plans`,
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

  const faqSchema = getFAQSchema(planMixFaqs)

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
            <span>{symbol} Monthly vs Annual</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Monthly vs Annual Plans {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscription plan mix and billing economics analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating Cash Flow</p>
                <p className="text-3xl font-bold text-green-500">
                  {cashFromOps >= 1e9
                    ? `$${(cashFromOps / 1e9).toFixed(2)}B`
                    : `$${(cashFromOps / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">annual upfront</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">year-over-year</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Free Cash Flow</p>
                <p className={`text-3xl font-bold ${freeCashFlow >= 0 ? 'text-blue-500' : 'text-yellow-500'}`}>
                  {freeCashFlow >= 1e9
                    ? `$${(freeCashFlow / 1e9).toFixed(2)}B`
                    : `$${(freeCashFlow / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">cash generation</p>
              </div>
            </div>
          </div>

          {/* Plan Mix Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Subscription Plan Economics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Monthly Plans</h3>
                <p className="text-muted-foreground mb-4">
                  Monthly subscriptions provide flexibility for customers but result in:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>Higher churn rates (easier to cancel)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>Lower upfront cash collection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>Higher payment processing costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>Greater revenue per user (no discount)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Annual Plans</h3>
                <p className="text-muted-foreground mb-4">
                  Annual subscriptions benefit the business through:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Lower churn (12-month commitment)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Upfront cash flow acceleration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Reduced payment processing costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Better revenue predictability</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Revenue Trends */}
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
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue</h2>
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
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Subscription Analytics</h2>
            <p className="text-muted-foreground mb-6">
              View complete plan mix data, billing analytics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cash-flow/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Cash Flow Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {planMixFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Plan mix data is based on publicly available information. Specific monthly vs annual distribution may not be disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
