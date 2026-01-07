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
    title: `${symbol} Subscriber LTV - Customer Lifetime Value ${currentYear}`,
    description: `${symbol} subscriber lifetime value (LTV) analysis: track customer LTV, LTV/CAC ratios, and long-term subscriber economics for ${symbol}.`,
    keywords: [
      `${symbol} LTV`,
      `${symbol} lifetime value`,
      `${symbol} customer lifetime value`,
      `${symbol} LTV/CAC`,
      `${symbol} subscriber value`,
      `${symbol} customer economics`,
    ],
    openGraph: {
      title: `${symbol} Subscriber LTV ${currentYear} | Customer Lifetime Value`,
      description: `Complete ${symbol} LTV analysis with customer lifetime value, LTV/CAC ratios, and subscriber economics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/subscriber-ltv/${ticker.toLowerCase()}`,
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

export default async function SubscriberLTVPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/subscriber-ltv/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest financial data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate key LTV metrics
  const grossMargin = metrics?.gross_margin || latestAnnual?.gross_profit_margin || 0
  const grossProfit = latestAnnual?.gross_profit || latestRevenue * grossMargin

  // Revenue growth (indicator of customer value expansion)
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Marketing & sales efficiency
  const salesMarketingExpense = latestAnnual?.selling_general_administrative || 0
  const operatingIncome = latestAnnual?.operating_income || 0

  // Customer acquisition cost proxy
  const estimatedCAC = salesMarketingExpense > 0 && latestRevenue > 0
    ? salesMarketingExpense / (latestRevenue * 0.3) // Assuming 30% new customer growth
    : 0

  // LTV estimate (simplified)
  const estimatedARPU = latestRevenue / 1000000 // Rough ARPU estimate
  const estimatedLTV = estimatedARPU * (1 / 0.05) * grossMargin // Assuming 5% monthly churn

  // LTV/CAC ratio
  const ltvCacRatio = estimatedCAC > 0 ? estimatedLTV / estimatedCAC : 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate FAQs
  const ltvFaqs = [
    {
      question: `What is ${symbol}'s customer lifetime value (LTV)?`,
      answer: `${symbol} (${companyName}) operates a subscription business${sector ? ` in the ${sector} sector` : ''} where customer lifetime value is a critical metric. While specific LTV figures are not always disclosed, the company's ${(grossMargin * 100).toFixed(0)}% gross margins and ${revenueGrowth > 0 ? `${(revenueGrowth * 100).toFixed(1)}% revenue growth` : 'business performance'} indicate strong customer economics and value generation.`
    },
    {
      question: `How is subscriber LTV calculated for ${symbol}?`,
      answer: `Subscriber LTV is calculated as: (Average Revenue Per User) × (Customer Lifetime) × (Gross Margin). For ${companyName}, this depends on monthly ARPU, retention rates, and ${(grossMargin * 100).toFixed(0)}% gross margins. Higher retention and ARPU directly increase LTV.`
    },
    {
      question: `What is ${symbol}'s LTV/CAC ratio?`,
      answer: `LTV/CAC ratio measures customer value relative to acquisition cost. Healthy SaaS businesses target 3:1 or higher (meaning each customer generates 3x their acquisition cost over their lifetime). ${grossMargin > 0.6 ? `${symbol}'s strong ${(grossMargin * 100).toFixed(0)}% gross margins support healthy LTV/CAC economics.` : 'This ratio is critical for sustainable growth.'}`
    },
    {
      question: `How does ${symbol} maximize customer lifetime value?`,
      answer: `${companyName} likely maximizes LTV through: reducing churn with product improvements, increasing ARPU via upsells and expansions, extending customer lifetime through engagement, and optimizing customer success programs. ${revenueGrowth > 0 ? `Strong ${(revenueGrowth * 100).toFixed(1)}% growth suggests effective LTV optimization.` : ''}`
    },
    {
      question: `Why is LTV important for ${symbol} investors?`,
      answer: `LTV is crucial for ${symbol} investors because it: determines maximum sustainable CAC (customer acquisition cost), indicates business model scalability, shows customer satisfaction and product-market fit, and directly impacts long-term profitability. Higher LTV enables more aggressive growth investment.`
    },
    {
      question: `How does LTV relate to ${symbol}'s valuation?`,
      answer: `Higher customer LTV typically drives higher valuations for ${companyName} by: improving unit economics, enabling faster profitable growth, reducing capital intensity, and demonstrating sustainable competitive advantages. Investors pay premium multiples for businesses with expanding LTV metrics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Subscriber LTV`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Subscriber LTV ${currentYear} - Customer Lifetime Value Analysis`,
    description: `Complete LTV analysis for ${symbol} (${companyName}) with customer lifetime value, LTV/CAC ratios, and subscriber economics.`,
    url: pageUrl,
    keywords: [
      `${symbol} LTV`,
      `${symbol} lifetime value`,
      `${symbol} customer lifetime value`,
      `${symbol} LTV/CAC`,
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

  const faqSchema = getFAQSchema(ltvFaqs)

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
            <span>{symbol} Subscriber LTV</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Subscriber LTV {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer lifetime value and subscriber economics analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-green-500">
                  {(grossMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">LTV multiplier</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">expansion signal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Revenue</p>
                <p className="text-3xl font-bold text-blue-500">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
            </div>
          </div>

          {/* LTV Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">LTV Components & Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Revenue Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Revenue</span>
                    <span className="font-bold">
                      {latestRevenue >= 1e9
                        ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                        : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gross Profit</span>
                    <span className="font-bold">
                      {grossProfit >= 1e9
                        ? `$${(grossProfit / 1e9).toFixed(2)}B`
                        : `$${(grossProfit / 1e6).toFixed(0)}M`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gross Margin</span>
                    <span className="font-bold text-green-500">{(grossMargin * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Growth Indicators</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenue Growth</span>
                    <span className={`font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Operating Income</span>
                    <span className="font-bold">
                      {operatingIncome >= 1e9
                        ? `$${(operatingIncome / 1e9).toFixed(2)}B`
                        : `$${(operatingIncome / 1e6).toFixed(0)}M`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sector</span>
                    <span className="font-bold text-blue-500">{sector || 'Technology'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LTV Maximization Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">LTV Maximization Strategies</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Reduce Churn</h3>
                <p className="text-sm text-muted-foreground">
                  Improving retention from 95% to 97% monthly can double customer lifetime. {companyName} focuses on product excellence, customer success, and continuous innovation.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Increase ARPU</h3>
                <p className="text-sm text-muted-foreground">
                  Expanding revenue per user through upsells, cross-sells, and feature adoption directly increases LTV. {(grossMargin * 100).toFixed(0)}% margins support upsell investments.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Optimize Gross Margins</h3>
                <p className="text-sm text-muted-foreground">
                  Higher margins amplify LTV. ${companyName}'s {(grossMargin * 100).toFixed(0)}% gross margin means more customer revenue flows to LTV calculation.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Improve Customer Success</h3>
                <p className="text-sm text-muted-foreground">
                  Proactive customer success extends lifetime and expands accounts. {revenueGrowth > 0 ? `${(revenueGrowth * 100).toFixed(1)}% growth signals effective customer success strategies.` : 'Investment in customer outcomes drives retention.'}
                </p>
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Unit Economics</h2>
            <p className="text-muted-foreground mb-6">
              View complete LTV analysis, CAC metrics, and AI-powered customer insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {ltvFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> LTV estimates are based on publicly available financial data. Actual customer lifetime value may vary. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="metrics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
