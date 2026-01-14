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
    title: `${symbol} Gross Retention Rate - Customer Retention ${currentYear}`,
    description: `${symbol} gross retention rate (GRR) analysis: track customer retention, subscription renewals, and churn metrics for ${symbol}.`,
    keywords: [
      `${symbol} gross retention`,
      `${symbol} GRR`,
      `${symbol} retention rate`,
      `${symbol} customer retention`,
      `${symbol} churn rate`,
      `${symbol} renewal rate`,
    ],
    openGraph: {
      title: `${symbol} Gross Retention Rate ${currentYear} | Customer Retention Analysis`,
      description: `Complete ${symbol} GRR analysis with customer retention rates, churn metrics, and subscription renewal performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gross-retention/${ticker.toLowerCase()}`,
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

export default async function GrossRetentionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gross-retention/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth (indicator of retention health)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Calculate multi-year CAGR (long-term retention indicator)
  const oldestAnnual = incomeStatements?.[incomeStatements.length - 1]
  const yearsDiff = incomeStatements?.length > 1 ? incomeStatements.length - 1 : 1
  const cagr = oldestAnnual?.revenue
    ? Math.pow(latestRevenue / oldestAnnual.revenue, 1 / yearsDiff) - 1
    : 0

  // Gross margin (quality metric)
  const grossMargin = metrics?.gross_margin || latestAnnual?.gross_profit_margin || 0

  // Operating cash flow (retention health indicator)
  const cashFromOps = latestAnnual?.operating_cash_flow || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const retentionFaqs = [
    {
      question: `What is ${symbol}'s gross retention rate (GRR)?`,
      answer: `Gross Retention Rate measures the percentage of recurring revenue retained from existing customers, excluding expansions. For ${symbol} (${companyName}), high GRR (typically 85-95%+) indicates strong product-market fit and customer satisfaction. ${revenueGrowth > 0 ? `The company's ${(revenueGrowth * 100).toFixed(1)}% revenue growth suggests healthy retention dynamics.` : 'While specific GRR is not always disclosed, revenue trends provide retention insights.'}`
    },
    {
      question: `How is gross retention different from net retention?`,
      answer: `Gross Retention (GRR) measures revenue retained excluding upsells and expansions, while Net Revenue Retention (NRR) includes expansion revenue. GRR shows pure retention strength, while NRR shows total customer value growth. ${companyName} likely focuses on both metrics to measure customer success and growth efficiency.`
    },
    {
      question: `What is a good gross retention rate for ${symbol}?`,
      answer: `Best-in-class SaaS companies achieve 90-95%+ GRR (5-10% annual churn). Enterprise software typically has higher retention than SMB-focused products. ${sector ? `In the ${sector} sector, ` : ''}${companyName} aims for industry-leading retention through product excellence and customer success. ${cagr > 0 ? `${yearsDiff}-year CAGR of ${(cagr * 100).toFixed(1)}% demonstrates sustained retention.` : ''}`
    },
    {
      question: `How does ${symbol} improve gross retention?`,
      answer: `${companyName} likely improves GRR through: exceptional product quality and reliability, proactive customer success programs, continuous feature innovation, strong onboarding experiences, regular engagement and training, and data-driven health monitoring. ${grossMargin > 0.6 ? `High ${(grossMargin * 100).toFixed(0)}% gross margins support retention investments.` : ''}`
    },
    {
      question: `Why is gross retention critical for ${symbol}?`,
      answer: `High GRR is critical for ${symbol} because: it validates product-market fit, reduces dependency on new customer acquisition, improves CAC payback economics, enables predictable revenue forecasting, and supports higher valuations. ${revenueGrowth > 0 ? `Current ${(revenueGrowth * 100).toFixed(1)}% growth reflects strong retention fundamentals.` : 'Retention is the foundation of sustainable growth.'}`
    },
    {
      question: `How does ${symbol}'s retention compare to competitors?`,
      answer: `While specific GRR benchmarks vary by sector, top-performing subscription companies achieve 90-95%+ gross retention. ${symbol} competes on retention through: superior product capabilities, customer success excellence, and continuous innovation. ${industry ? `Compare ${symbol} to ${industry} peers` : 'Use our comparison tools'} to benchmark retention performance.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gross Retention`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gross Retention Rate ${currentYear} - Customer Retention Analysis`,
    description: `Complete gross retention analysis for ${symbol} (${companyName}) with retention rates, churn metrics, and customer renewal performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} gross retention`,
      `${symbol} GRR`,
      `${symbol} retention rate`,
      `${symbol} customer retention`,
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

  const faqSchema = getFAQSchema(retentionFaqs)

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
            <span>{symbol} Gross Retention</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gross Retention Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer retention, churn analysis, and subscription renewal metrics for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">retention signal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating Cash Flow</p>
                <p className="text-3xl font-bold text-green-500">
                  {cashFromOps >= 1e9
                    ? `$${(cashFromOps / 1e9).toFixed(2)}B`
                    : `$${(cashFromOps / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">retention quality</p>
              </div>
              {cagr > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{yearsDiff}-Year CAGR</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {(cagr * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">sustained retention</p>
                </div>
              )}
            </div>
          </div>

          {/* Retention Excellence Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Retention Excellence Framework</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Product Excellence</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Core product reliability and uptime</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Continuous feature innovation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Performance optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Security and compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Intuitive user experience</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Customer Success</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">✓</span>
                    <span>Proactive health monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">✓</span>
                    <span>Personalized onboarding programs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">✓</span>
                    <span>Regular business reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">✓</span>
                    <span>Training and enablement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">✓</span>
                    <span>24/7 support availability</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Retention Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Retention Benchmarks</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Best-in-Class (95%+ GRR)</p>
                    <p className="text-sm text-muted-foreground">Enterprise SaaS, mission-critical platforms</p>
                  </div>
                  <div className="text-green-500 font-bold text-2xl">95%+</div>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Strong Performance (90-95% GRR)</p>
                    <p className="text-sm text-muted-foreground">Mid-market SaaS, strong product-market fit</p>
                  </div>
                  <div className="text-blue-500 font-bold text-2xl">90-95%</div>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Good Performance (85-90% GRR)</p>
                    <p className="text-sm text-muted-foreground">SMB-focused, growing companies</p>
                  </div>
                  <div className="text-yellow-500 font-bold text-2xl">85-90%</div>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Needs Improvement (&lt;85% GRR)</p>
                    <p className="text-sm text-muted-foreground">High churn, product-market fit challenges</p>
                  </div>
                  <div className="text-red-500 font-bold text-2xl">&lt;85%</div>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Performance */}
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
          <section className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retention Analytics</h2>
            <p className="text-muted-foreground mb-6">
              View complete retention data, churn analysis, and AI-powered customer insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {retentionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Retention data is based on publicly available information. Specific gross retention rates may not be disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="metrics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
