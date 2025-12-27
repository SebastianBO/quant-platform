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
    title: `${symbol} Trial Conversion Rate - Free Trial to Paid ${currentYear}`,
    description: `${symbol} trial conversion rate analysis: track free trial to paid conversion, trial effectiveness, and customer onboarding success for ${symbol}.`,
    keywords: [
      `${symbol} trial conversion`,
      `${symbol} conversion rate`,
      `${symbol} free trial`,
      `${symbol} trial to paid`,
      `${symbol} customer conversion`,
      `${symbol} onboarding metrics`,
    ],
    openGraph: {
      title: `${symbol} Trial Conversion Rate ${currentYear} | Trial to Paid Analysis`,
      description: `Complete ${symbol} trial conversion analysis with conversion rates, trial effectiveness, and customer onboarding metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/trial-conversion/${ticker.toLowerCase()}`,
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

export default async function TrialConversionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/trial-conversion/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue and growth data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate growth metrics (indicator of conversion effectiveness)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Calculate customer acquisition efficiency
  const grossMargin = metrics?.gross_margin || latestAnnual?.gross_profit_margin || 0
  const operatingMargin = metrics?.operating_margin || latestAnnual?.operating_margin || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const conversionFaqs = [
    {
      question: `What is ${symbol}'s trial conversion rate?`,
      answer: `${symbol} (${companyName}) operates a subscription-based business model${sector ? ` in the ${sector} sector` : ''}. While specific trial conversion rates are not always publicly disclosed, the company's ${revenueGrowth > 0 ? `strong ${(revenueGrowth * 100).toFixed(1)}% revenue growth` : 'business performance'} indicates effective customer acquisition and trial-to-paid conversion strategies.`
    },
    {
      question: `What is a good trial conversion rate?`,
      answer: `For SaaS and subscription businesses, trial conversion rates typically range from 15-40%, with top-performing companies achieving 25-30% or higher. Conversion rates depend on product complexity, trial length, onboarding quality, and target market. ${companyName} optimizes these factors to maximize paid conversions.`
    },
    {
      question: `How does ${symbol} optimize trial conversion?`,
      answer: `${companyName} likely uses strategies including: personalized onboarding experiences, in-product activation prompts, customer success outreach during trials, feature education, and strategic trial length optimization. ${revenueGrowth > 0 ? `The ${(revenueGrowth * 100).toFixed(1)}% revenue growth suggests effective conversion optimization.` : ''}`
    },
    {
      question: `What factors impact ${symbol}'s trial conversion rate?`,
      answer: `Key factors affecting trial conversion for ${companyName} include: product-market fit, user onboarding experience, feature accessibility during trials, customer support quality, pricing strategy, competitive landscape, and the value users realize during their trial period.`
    },
    {
      question: `How long is ${symbol}'s free trial period?`,
      answer: `Trial periods for subscription businesses typically range from 7-30 days, with most SaaS companies offering 14-day trials. ${companyName} likely optimizes trial length based on time-to-value metrics and conversion data. Longer, more complex products may offer extended trial periods.`
    },
    {
      question: `Why is trial conversion important for ${symbol}?`,
      answer: `Trial conversion is critical for ${companyName} because it: reduces customer acquisition costs by maximizing trial efficiency, increases LTV through quality customer selection, validates product-market fit, and drives predictable revenue growth. ${grossMargin > 0.6 ? `Strong ${(grossMargin * 100).toFixed(0)}% gross margins provide room for customer acquisition investment.` : ''}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Trial Conversion`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Trial Conversion Rate ${currentYear} - Trial to Paid Analysis`,
    description: `Complete trial conversion analysis for ${symbol} (${companyName}) with conversion metrics, onboarding effectiveness, and customer acquisition insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} trial conversion`,
      `${symbol} conversion rate`,
      `${symbol} free trial`,
      `${symbol} trial to paid`,
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

  const faqSchema = getFAQSchema(conversionFaqs)

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
            <span>{symbol} Trial Conversion</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Trial Conversion Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Free trial to paid conversion analysis and onboarding effectiveness for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">year-over-year</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-blue-500">
                  {(grossMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">unit economics</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating Margin</p>
                <p className={`text-3xl font-bold ${operatingMargin >= 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {(operatingMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">profitability</p>
              </div>
            </div>
          </div>

          {/* Conversion Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Trial Conversion Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Customer Acquisition</h3>
                <p className="text-muted-foreground mb-3">
                  {companyName}'s trial-to-paid conversion is a critical growth driver. Strong {(revenueGrowth * 100).toFixed(1)}% revenue growth indicates effective onboarding and value demonstration during trial periods.
                </p>
                <div className="bg-secondary/30 p-3 rounded">
                  <p className="text-sm font-medium">Latest Revenue: {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}</p>
                  <p className="text-xs text-muted-foreground mt-1">{latestPeriod}</p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Conversion Economics</h3>
                <p className="text-muted-foreground mb-3">
                  With {(grossMargin * 100).toFixed(0)}% gross margins, {companyName} can invest in trial optimization, customer success, and onboarding improvements to maximize conversion rates.
                </p>
                <div className="bg-secondary/30 p-3 rounded">
                  <p className="text-sm font-medium">Margin Profile</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span>Gross: {(grossMargin * 100).toFixed(0)}%</span>
                    <span>Operating: {(operatingMargin * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Performance Trends</h2>
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
              <h2 className="text-2xl font-bold mb-4">Quarterly Performance</h2>
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
          <section className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Conversion Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete customer acquisition data, conversion funnels, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {conversionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Conversion data is based on publicly available information. Specific trial conversion rates may not be disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="metrics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
