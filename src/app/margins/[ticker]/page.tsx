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
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Profit Margins - Gross, Operating & Net Margin Analysis`,
    description: `Comprehensive ${symbol} profit margin analysis including gross margin, operating margin, and net profit margin trends. Compare margins vs peers and understand profitability drivers.`,
    keywords: [
      `${symbol} profit margin`,
      `${symbol} gross margin`,
      `${symbol} operating margin`,
      `${symbol} net margin`,
      `${symbol} margins`,
      `${symbol} profitability`,
      `${symbol} profit margin analysis`,
    ],
    openGraph: {
      title: `${symbol} Profit Margins | Gross, Operating & Net Margin`,
      description: `Complete ${symbol} profit margin breakdown with historical trends and peer comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/margins/${ticker.toLowerCase()}`,
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

async function getFinancials(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/financials?ticker=${ticker}&period=annual&limit=5`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

function calculateMargins(incomeStatements: any[]) {
  return incomeStatements.map((statement) => {
    const revenue = statement.revenue || 0
    const grossProfit = statement.gross_profit || 0
    const operatingIncome = statement.operating_income || 0
    const netIncome = statement.net_income || 0

    return {
      period: statement.report_period,
      fiscalPeriod: statement.fiscal_period,
      revenue,
      grossMargin: revenue ? (grossProfit / revenue) * 100 : null,
      operatingMargin: revenue ? (operatingIncome / revenue) * 100 : null,
      netMargin: revenue ? (netIncome / revenue) * 100 : null,
      grossProfit,
      operatingIncome,
      netIncome,
    }
  })
}

export default async function MarginsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, financialsData] = await Promise.all([
    getStockData(symbol),
    getFinancials(symbol),
  ])

  if (!stockData?.snapshot || !financialsData?.income_statements?.length) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const pageUrl = `${SITE_URL}/margins/${ticker.toLowerCase()}`

  // Calculate margins from income statements
  const margins = calculateMargins(financialsData.income_statements)
  const latestMargins = margins[0]
  const previousMargins = margins[1] || null

  // Calculate trends
  const grossMarginTrend = previousMargins
    ? latestMargins.grossMargin - previousMargins.grossMargin
    : null
  const operatingMarginTrend = previousMargins
    ? latestMargins.operatingMargin - previousMargins.operatingMargin
    : null
  const netMarginTrend = previousMargins
    ? latestMargins.netMargin - previousMargins.netMargin
    : null

  // Determine margin quality
  const getMarginQuality = (grossMargin: number | null, operatingMargin: number | null, netMargin: number | null) => {
    if (!grossMargin || !operatingMargin || !netMargin) return 'Unknown'

    if (grossMargin > 50 && operatingMargin > 20 && netMargin > 15) return 'Excellent'
    if (grossMargin > 40 && operatingMargin > 15 && netMargin > 10) return 'Strong'
    if (grossMargin > 30 && operatingMargin > 10 && netMargin > 5) return 'Good'
    if (grossMargin > 20 && operatingMargin > 5 && netMargin > 0) return 'Moderate'
    return 'Weak'
  }

  const marginQuality = getMarginQuality(
    latestMargins.grossMargin,
    latestMargins.operatingMargin,
    latestMargins.netMargin
  )

  // Generate FAQs
  const marginFaqs = [
    {
      question: `What is ${symbol}'s profit margin?`,
      answer: `${symbol} (${companyName}) has a net profit margin of ${latestMargins.netMargin?.toFixed(1)}%, meaning the company keeps $${(latestMargins.netMargin || 0) / 100} in profit for every dollar of revenue. This represents ${netMarginTrend && netMarginTrend > 0 ? 'an improvement' : 'a change'} from the previous year's net margin of ${previousMargins?.netMargin?.toFixed(1)}%.`
    },
    {
      question: `What is ${symbol}'s gross margin?`,
      answer: `${symbol}'s gross margin is ${latestMargins.grossMargin?.toFixed(1)}%. Gross margin measures the percentage of revenue remaining after subtracting the cost of goods sold. A ${latestMargins.grossMargin && latestMargins.grossMargin > 50 ? 'high' : latestMargins.grossMargin && latestMargins.grossMargin > 30 ? 'moderate' : 'lower'} gross margin like this ${latestMargins.grossMargin && latestMargins.grossMargin > 50 ? 'indicates strong pricing power and efficient production' : 'reflects the competitive dynamics of the ' + (sector || 'industry')}.`
    },
    {
      question: `What is ${symbol}'s operating margin?`,
      answer: `${symbol} has an operating margin of ${latestMargins.operatingMargin?.toFixed(1)}%. Operating margin shows profitability after operating expenses but before interest and taxes. ${operatingMarginTrend && operatingMarginTrend > 0 ? `The ${operatingMarginTrend.toFixed(1)}% year-over-year improvement suggests better operational efficiency.` : `This metric helps investors understand how efficiently ${companyName} manages its operations.`}`
    },
    {
      question: `Are ${symbol}'s profit margins good?`,
      answer: `${symbol}'s margins are considered ${marginQuality.toLowerCase()}. ${marginQuality === 'Excellent' || marginQuality === 'Strong' ? `With a gross margin of ${latestMargins.grossMargin?.toFixed(1)}% and net margin of ${latestMargins.netMargin?.toFixed(1)}%, ${companyName} demonstrates strong pricing power and operational efficiency.` : `When evaluating margins, it's important to compare against ${industry || sector || 'industry'} peers, as different sectors have structurally different margin profiles.`}`
    },
    {
      question: `How do profit margins affect ${symbol} stock?`,
      answer: `Profit margins are a key indicator of ${symbol}'s business quality and competitive position. ${latestMargins.netMargin && latestMargins.netMargin > 15 ? 'High' : 'The current'} margins ${latestMargins.netMargin && latestMargins.netMargin > 15 ? 'suggest strong competitive advantages and pricing power, which typically support premium valuations.' : 'should be evaluated alongside growth rates and return on capital to assess overall business quality.'} Expanding margins often lead to stock price appreciation, while contracting margins can signal competitive pressures.`
    },
    {
      question: `What drives ${symbol}'s profit margins?`,
      answer: `${symbol}'s profit margins are influenced by several factors: pricing power vs competitors, operational efficiency, scale advantages, input costs (materials, labor), ${industry ? `${industry}-specific dynamics, ` : ''}and management execution. ${grossMarginTrend && Math.abs(grossMarginTrend) > 2 ? `The significant ${grossMarginTrend > 0 ? 'expansion' : 'contraction'} in gross margin suggests changes in these underlying drivers.` : 'Monitoring margin trends helps identify improving or deteriorating business fundamentals.'}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Margins`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Profit Margins - Gross, Operating & Net Margin Analysis`,
    description: `Comprehensive margin analysis for ${symbol} (${companyName}) including historical trends and profitability metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} profit margin`,
      `${symbol} gross margin`,
      `${symbol} operating margin`,
      `${symbol} margins analysis`,
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

  const faqSchema = getFAQSchema(marginFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toFixed(2)}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <Link href={`/stock/${symbol.toLowerCase()}`} className="hover:text-foreground">{symbol}</Link>
            {' / '}
            <span>Profit Margins</span>
          </nav>

          <h1 className="text-4xl font-bold mb-2">
            {symbol} Profit Margins
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gross, Operating & Net Margin Analysis for {companyName}
          </p>

          {/* Margin Quality Badge */}
          <div className="mb-8 inline-block">
            <div className={`px-6 py-3 rounded-xl border-2 ${
              marginQuality === 'Excellent' ? 'bg-green-500/10 border-green-500/30' :
              marginQuality === 'Strong' ? 'bg-emerald-500/10 border-emerald-500/30' :
              marginQuality === 'Good' ? 'bg-blue-500/10 border-blue-500/30' :
              marginQuality === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-orange-500/10 border-orange-500/30'
            }`}>
              <p className="text-xs text-muted-foreground mb-1">Margin Quality</p>
              <p className={`text-2xl font-bold ${
                marginQuality === 'Excellent' ? 'text-green-500' :
                marginQuality === 'Strong' ? 'text-emerald-500' :
                marginQuality === 'Good' ? 'text-blue-500' :
                marginQuality === 'Moderate' ? 'text-yellow-500' :
                'text-orange-500'
              }`}>
                {marginQuality}
              </p>
            </div>
          </div>

          {/* Current Margins Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Current Profit Margins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gross Margin */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                </div>
                <p className="text-4xl font-bold mb-2">
                  {latestMargins.grossMargin?.toFixed(1)}%
                </p>
                {grossMarginTrend !== null && (
                  <div className="flex items-center gap-1">
                    {grossMarginTrend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${grossMarginTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(grossMarginTrend).toFixed(1)}% YoY
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {formatCurrency(latestMargins.grossProfit)} gross profit
                </p>
              </div>

              {/* Operating Margin */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                </div>
                <p className="text-4xl font-bold mb-2">
                  {latestMargins.operatingMargin?.toFixed(1)}%
                </p>
                {operatingMarginTrend !== null && (
                  <div className="flex items-center gap-1">
                    {operatingMarginTrend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${operatingMarginTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(operatingMarginTrend).toFixed(1)}% YoY
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {formatCurrency(latestMargins.operatingIncome)} operating income
                </p>
              </div>

              {/* Net Margin */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border-2 border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                </div>
                <p className="text-4xl font-bold text-green-500 mb-2">
                  {latestMargins.netMargin?.toFixed(1)}%
                </p>
                {netMarginTrend !== null && (
                  <div className="flex items-center gap-1">
                    {netMarginTrend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${netMarginTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(netMarginTrend).toFixed(1)}% YoY
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {formatCurrency(latestMargins.netIncome)} net income
                </p>
              </div>
            </div>
          </section>

          {/* Margin Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5-Year Margin Trends</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                {margins.reverse().map((margin, index) => (
                  <div key={margin.period} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{margin.fiscalPeriod || new Date(margin.period).getFullYear()}</span>
                      <span className="text-sm text-muted-foreground">
                        Revenue: {formatCurrency(margin.revenue)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Gross</span>
                          <span className="font-medium">{margin.grossMargin?.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((margin.grossMargin || 0), 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Operating</span>
                          <span className="font-medium">{margin.operatingMargin?.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min((margin.operatingMargin || 0) * 2, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Net</span>
                          <span className="font-medium">{margin.netMargin?.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min((margin.netMargin || 0) * 2.5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What Margins Tell Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Margins Indicate About {symbol}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <h3 className="font-bold">Business Quality</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {latestMargins.grossMargin && latestMargins.grossMargin > 50
                    ? `High gross margins above 50% suggest ${companyName} has strong pricing power and competitive advantages that allow premium pricing.`
                    : latestMargins.grossMargin && latestMargins.grossMargin > 30
                    ? `Moderate gross margins indicate ${companyName} operates in a competitive market with balanced pricing dynamics.`
                    : `Lower gross margins may reflect commodity-like products or intense price competition in the ${sector || 'industry'}.`
                  }
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <h3 className="font-bold">Operational Efficiency</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {operatingMarginTrend && operatingMarginTrend > 1
                    ? `Expanding operating margins show ${companyName} is improving operational leverage and cost management.`
                    : operatingMarginTrend && operatingMarginTrend < -1
                    ? `Declining operating margins may indicate rising costs, competitive pressures, or investments in growth.`
                    : `Stable operating margins suggest consistent execution and predictable business operations.`
                  }
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-purple-500 mt-0.5" />
                  <h3 className="font-bold">Profitability</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {latestMargins.netMargin && latestMargins.netMargin > 15
                    ? `Net margins above 15% demonstrate excellent profitability and suggest strong competitive positioning.`
                    : latestMargins.netMargin && latestMargins.netMargin > 5
                    ? `Net margins in the 5-15% range are solid and typical for many profitable businesses.`
                    : latestMargins.netMargin && latestMargins.netMargin > 0
                    ? `Modest net margins indicate the business is profitable but may face margin pressures or be in a capital-intensive industry.`
                    : `Negative net margins indicate the company is currently unprofitable and burning cash.`
                  }
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-500 mt-0.5" />
                  <h3 className="font-bold">Investment Implications</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {grossMarginTrend && netMarginTrend && grossMarginTrend > 0 && netMarginTrend > 0
                    ? `Expanding margins across the board suggest improving business fundamentals, which often supports stock price appreciation.`
                    : grossMarginTrend && netMarginTrend && grossMarginTrend < 0 && netMarginTrend < 0
                    ? `Contracting margins may signal deteriorating competitive position or industry headwinds to monitor.`
                    : `Mixed margin trends require deeper analysis to understand underlying business dynamics and sustainability.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Understanding Profit Margins */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Profit Margins</h2>
            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Gross Margin
                  </h3>
                  <p className="text-muted-foreground text-sm ml-5">
                    (Revenue - Cost of Goods Sold) / Revenue. Measures pricing power and production efficiency before operating expenses.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    Operating Margin
                  </h3>
                  <p className="text-muted-foreground text-sm ml-5">
                    Operating Income / Revenue. Shows profitability from core operations after all operating expenses but before interest and taxes.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Net Profit Margin
                  </h3>
                  <p className="text-muted-foreground text-sm ml-5">
                    Net Income / Revenue. The bottom line - shows how much profit the company keeps from each dollar of revenue after all expenses.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Profitability</h2>
            <p className="text-muted-foreground mb-6">
              Get complete financial analysis with profitability trends, ROE, ROIC, and more
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
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Margin analysis is based on reported financial statements and should be compared to industry peers for context. Different sectors have structurally different margin profiles. This information is for educational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
