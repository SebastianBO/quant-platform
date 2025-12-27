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
    title: `${symbol} EPS - Earnings Per Share History & Growth Trend ${currentYear}`,
    description: `${symbol} earnings per share (EPS): Current EPS, historical EPS data, growth trends, and analyst estimates. View ${symbol} basic and diluted EPS over time.`,
    keywords: [
      `${symbol} EPS`,
      `${symbol} earnings per share`,
      `${symbol} earnings`,
      `${symbol} EPS history`,
      `${symbol} EPS growth`,
      `${symbol} diluted EPS`,
      `${symbol} basic EPS`,
      `what is ${symbol} EPS`,
    ],
    openGraph: {
      title: `${symbol} EPS - Earnings Per Share History & Growth`,
      description: `${symbol} earnings per share analysis with historical data, growth trends, and analyst estimates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/eps/${ticker.toLowerCase()}`,
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

function formatQuarter(dateString: string): string {
  const date = new Date(dateString)
  const month = date.getMonth()
  const year = date.getFullYear()
  const quarter = Math.floor(month / 3) + 1
  return `Q${quarter} ${year}`
}

function calculateEPSGrowth(currentEPS: number | null, previousEPS: number | null): number | null {
  if (!currentEPS || !previousEPS || previousEPS === 0) return null
  return ((currentEPS - previousEPS) / Math.abs(previousEPS)) * 100
}

export default async function EPSPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements, analystEstimates } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/eps/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get current EPS from metrics
  const currentEPS = metrics?.earnings_per_share
  const currentEPSDiluted = metrics?.earnings_per_share_diluted
  const peRatio = metrics?.price_to_earnings_ratio
  const revenueGrowth = metrics?.revenue_growth

  // Get EPS history from income statements
  const epsHistory = (incomeStatements || []).slice(0, 8).map((statement: any) => ({
    period: statement.fiscal_period || formatQuarter(statement.report_period),
    reportDate: statement.report_period,
    fiscalYear: statement.fiscal_year,
    epsBasic: statement.earnings_per_share,
    epsDiluted: statement.earnings_per_share_diluted,
    revenue: statement.revenue,
    netIncome: statement.net_income,
    sharesOutstanding: statement.weighted_average_shares_outstanding,
  }))

  // Calculate EPS growth
  let epsGrowth1Year: number | null = null
  let epsGrowthYoY: number | null = null
  if (epsHistory.length >= 2) {
    epsGrowthYoY = calculateEPSGrowth(epsHistory[0]?.epsBasic, epsHistory[1]?.epsBasic)
  }
  if (epsHistory.length >= 5) {
    const currentEPSValue = epsHistory[0]?.epsBasic
    const oneYearAgoEPS = epsHistory[4]?.epsBasic
    epsGrowth1Year = calculateEPSGrowth(currentEPSValue, oneYearAgoEPS)
  }

  // Get analyst EPS estimates
  const nextQuarterEstimate = analystEstimates?.analyst_estimates?.[0]
  const estimatedEPS = nextQuarterEstimate?.estimated_eps

  // Average EPS over history
  const avgEPS = epsHistory.length > 0
    ? epsHistory.reduce((sum, item) => sum + (item.epsBasic || 0), 0) / epsHistory.filter(h => h.epsBasic).length
    : null

  // Generate EPS FAQs
  const epsFaqs = [
    {
      question: `What is ${symbol} EPS (earnings per share)?`,
      answer: currentEPS
        ? `${symbol} (${companyName}) has a current earnings per share (EPS) of $${currentEPS.toFixed(2)}. ${currentEPSDiluted ? `The diluted EPS is $${currentEPSDiluted.toFixed(2)}.` : ''} EPS represents the portion of the company's profit allocated to each outstanding share of common stock.`
        : `${symbol} (${companyName}) EPS data is shown in the historical earnings table above. EPS represents how much profit the company generates per share.`
    },
    {
      question: `What is the difference between basic and diluted EPS for ${symbol}?`,
      answer: `Basic EPS is calculated using only outstanding common shares, while diluted EPS accounts for all potential shares that could be created through stock options, warrants, and convertible securities. ${currentEPS && currentEPSDiluted ? `For ${symbol}, basic EPS is $${currentEPS.toFixed(2)} and diluted EPS is $${currentEPSDiluted.toFixed(2)}.` : ''} Diluted EPS is typically lower and provides a more conservative measure of earnings per share.`
    },
    {
      question: `How has ${symbol} EPS grown over time?`,
      answer: epsGrowthYoY !== null
        ? `${symbol}'s most recent year-over-year EPS growth is ${epsGrowthYoY > 0 ? '+' : ''}${epsGrowthYoY.toFixed(1)}%. ${epsGrowth1Year !== null ? `Over the past year, EPS has grown ${epsGrowth1Year > 0 ? '+' : ''}${epsGrowth1Year.toFixed(1)}%.` : ''} ${epsGrowthYoY > 15 ? 'This shows strong earnings growth.' : epsGrowthYoY > 0 ? 'This indicates positive earnings momentum.' : 'EPS has declined, which may signal challenges in profitability.'}`
        : `View the EPS history table above to see how ${symbol}'s earnings per share has changed over time. Consistent EPS growth is a sign of a healthy, growing company.`
    },
    {
      question: `What do analysts expect for ${symbol} EPS?`,
      answer: estimatedEPS
        ? `Analysts estimate ${symbol} will report EPS of $${estimatedEPS.toFixed(2)} for the next quarter. ${currentEPS ? `This compares to the current TTM EPS of $${currentEPS.toFixed(2)}.` : ''} Analyst estimates help investors set expectations for upcoming earnings reports.`
        : `Analyst EPS estimates for ${symbol} can be found on the full stock analysis page. These estimates represent the consensus view of Wall Street analysts covering the stock.`
    },
    {
      question: `Why is EPS important for ${symbol} investors?`,
      answer: `EPS is one of the most important metrics for evaluating ${symbol}'s profitability. ${peRatio ? `With a P/E ratio of ${peRatio.toFixed(1)}, investors are paying $${peRatio.toFixed(1)} for every dollar of ${symbol}'s earnings.` : ''} Growing EPS typically leads to stock price appreciation, while declining EPS can indicate business challenges. EPS is also used to calculate other key metrics like the P/E ratio.`
    },
    {
      question: `How is ${symbol} EPS calculated?`,
      answer: `EPS is calculated by dividing net income by the weighted average shares outstanding. For ${symbol}, ${epsHistory[0]?.netIncome && epsHistory[0]?.sharesOutstanding ? `the most recent calculation was $${(epsHistory[0].netIncome / 1e9).toFixed(2)}B in net income divided by ${(epsHistory[0].sharesOutstanding / 1e9).toFixed(2)}B shares = $${epsHistory[0].epsBasic?.toFixed(2)} per share.` : 'this calculation is performed each quarter when the company reports earnings.'} Basic EPS uses actual shares outstanding, while diluted EPS includes potential dilution from stock options and convertible securities.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} EPS`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EPS - Earnings Per Share History & Growth ${currentYear}`,
    description: `Complete ${symbol} earnings per share analysis with historical EPS data and growth trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} EPS`,
      `${symbol} earnings per share`,
      `${symbol} EPS history`,
      `${symbol} earnings`,
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

  const faqSchema = getFAQSchema(epsFaqs)

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
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} EPS</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EPS - Earnings Per Share
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} earnings per share history and growth analysis
          </p>

          {/* Current EPS Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Current EPS (Basic)</p>
                <p className="text-3xl font-bold">
                  {currentEPS ? `$${currentEPS.toFixed(2)}` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Trailing Twelve Months</p>
              </div>
              {currentEPSDiluted && (
                <div>
                  <p className="text-muted-foreground mb-1">Diluted EPS</p>
                  <p className="text-3xl font-bold">${currentEPSDiluted.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Including all dilution</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
                {peRatio && (
                  <p className="text-xs text-muted-foreground mt-1">P/E Ratio: {peRatio.toFixed(1)}x</p>
                )}
              </div>
            </div>
          </div>

          {/* EPS Growth Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EPS Growth</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {epsGrowthYoY !== null && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">YoY Growth</p>
                  <p className={`text-xl font-bold ${epsGrowthYoY >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {epsGrowthYoY > 0 ? '+' : ''}{epsGrowthYoY.toFixed(1)}%
                  </p>
                </div>
              )}
              {epsGrowth1Year !== null && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">1-Year Growth</p>
                  <p className={`text-xl font-bold ${epsGrowth1Year >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {epsGrowth1Year > 0 ? '+' : ''}{epsGrowth1Year.toFixed(1)}%
                  </p>
                </div>
              )}
              {avgEPS && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Average EPS</p>
                  <p className="text-xl font-bold">${avgEPS.toFixed(2)}</p>
                </div>
              )}
              {peRatio && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-xl font-bold">{peRatio.toFixed(1)}</p>
                </div>
              )}
            </div>
          </section>

          {/* EPS History */}
          {epsHistory.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">EPS History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground">Period</th>
                      <th className="text-right p-3 text-muted-foreground">Basic EPS</th>
                      <th className="text-right p-3 text-muted-foreground">Diluted EPS</th>
                      <th className="text-right p-3 text-muted-foreground">Revenue</th>
                      <th className="text-right p-3 text-muted-foreground">Net Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {epsHistory.map((item: any, index: number) => {
                      const prevEPS = epsHistory[index + 1]?.epsBasic
                      const growth = calculateEPSGrowth(item.epsBasic, prevEPS)

                      return (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="p-3 font-medium">
                            {item.period}
                            {growth !== null && (
                              <span className={`ml-2 text-xs ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({growth > 0 ? '+' : ''}{growth.toFixed(1)}%)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {item.epsBasic ? `$${item.epsBasic.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3 text-right">
                            {item.epsDiluted ? `$${item.epsDiluted.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3 text-right">
                            {item.revenue ? `$${(item.revenue / 1e9).toFixed(2)}B` : '-'}
                          </td>
                          <td className="p-3 text-right">
                            {item.netIncome ? `$${(item.netIncome / 1e9).toFixed(2)}B` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Analyst Estimates */}
          {estimatedEPS && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Analyst EPS Estimates</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground mb-1">Next Quarter Estimate</p>
                    <p className="text-3xl font-bold">${estimatedEPS.toFixed(2)}</p>
                  </div>
                  {currentEPS && (
                    <div className="text-right">
                      <p className="text-muted-foreground mb-1">vs. Current EPS</p>
                      <p className={`text-xl font-bold ${estimatedEPS >= currentEPS ? 'text-green-500' : 'text-red-500'}`}>
                        {((estimatedEPS - currentEPS) / currentEPS * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Understanding EPS */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} EPS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What EPS Tells You</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Measures profitability on a per-share basis</li>
                  <li>Higher EPS generally means better performance</li>
                  <li>Used to calculate P/E ratio and PEG ratio</li>
                  <li>Growing EPS often drives stock prices higher</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">How to Use EPS</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Compare EPS growth to industry peers</li>
                  <li>Look for consistent EPS growth over time</li>
                  <li>Check if EPS beats analyst estimates</li>
                  <li>Compare basic vs diluted for dilution impact</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Deep dive into financials, ratios, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {epsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare EPS with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/eps/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} EPS
                  </Link>
                ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
