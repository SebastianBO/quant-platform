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
    title: `${symbol} Earnings Date ${currentYear} - Next Earnings Report & History`,
    description: `When is ${symbol} earnings? View ${symbol} next earnings date, earnings history, EPS estimates, and quarterly results. Get earnings call schedule and analyst expectations.`,
    keywords: [
      `${symbol} earnings`,
      `${symbol} earnings date`,
      `${symbol} next earnings`,
      `${symbol} earnings date ${currentYear}`,
      `when is ${symbol} earnings`,
      `${symbol} earnings report`,
      `${symbol} earnings call`,
      `${symbol} quarterly earnings`,
    ],
    openGraph: {
      title: `${symbol} Earnings Date & History | Next Earnings Report`,
      description: `${symbol} earnings schedule, EPS estimates, and quarterly results. Track upcoming earnings dates and historical performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/earnings/${ticker.toLowerCase()}`,
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

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'TBD'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

function formatQuarter(dateString: string): string {
  const date = new Date(dateString)
  const month = date.getMonth()
  const year = date.getFullYear()
  const quarter = Math.floor(month / 3) + 1
  return `Q${quarter} ${year}`
}

export default async function EarningsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements, analystEstimates } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/earnings/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get earnings date
  const earningsDate = companyFacts?.earningsDate
  const nextEarningsDate = formatDate(earningsDate)

  // Calculate days until earnings
  let daysUntilEarnings: number | null = null
  if (earningsDate) {
    const earningsTime = new Date(earningsDate).getTime()
    const now = Date.now()
    daysUntilEarnings = Math.ceil((earningsTime - now) / (1000 * 60 * 60 * 24))
  }

  // Get EPS data from income statements
  const recentEarnings = (incomeStatements || []).slice(0, 8).map((statement: any) => ({
    period: statement.fiscal_period || formatQuarter(statement.report_period),
    reportDate: statement.report_period,
    eps: statement.earnings_per_share,
    epsDiluted: statement.earnings_per_share_diluted,
    revenue: statement.revenue,
    netIncome: statement.net_income,
  }))

  // Current metrics
  const currentEPS = metrics?.earnings_per_share
  const peRatio = metrics?.price_to_earnings_ratio
  const revenueGrowth = metrics?.revenue_growth

  // Generate earnings FAQs
  const earningsFaqs = [
    {
      question: `When is ${symbol} next earnings date?`,
      answer: earningsDate
        ? `${symbol} (${companyName}) is scheduled to report earnings on ${nextEarningsDate}${daysUntilEarnings !== null && daysUntilEarnings > 0 ? `, which is ${daysUntilEarnings} days from now` : ''}.`
        : `${symbol} (${companyName}) has not yet announced its next earnings date. Check back for updates on the upcoming earnings schedule.`
    },
    {
      question: `What is ${symbol} earnings per share (EPS)?`,
      answer: currentEPS
        ? `${symbol}'s current earnings per share (EPS) is $${currentEPS.toFixed(2)}.${peRatio ? ` With a P/E ratio of ${peRatio.toFixed(1)}, the market values each dollar of earnings at $${peRatio.toFixed(1)}.` : ''}`
        : `${symbol}'s earnings per share data is available in the historical earnings section above.`
    },
    {
      question: `How often does ${symbol} report earnings?`,
      answer: `Like most publicly traded US companies, ${symbol} (${companyName}) reports earnings quarterly, typically within 4-6 weeks after each fiscal quarter ends. The company holds an earnings call to discuss results with analysts.`
    },
    {
      question: `What time does ${symbol} report earnings?`,
      answer: `${symbol} typically reports earnings either before market open (BMO) or after market close (AMC). The exact time is usually announced a few days before the earnings date. Check the investor relations page for specific timing.`
    },
    {
      question: `How has ${symbol} performed in recent earnings?`,
      answer: recentEarnings.length > 0
        ? `In the most recent quarter (${recentEarnings[0].period}), ${symbol} reported EPS of $${recentEarnings[0].eps?.toFixed(2) || 'N/A'}${recentEarnings[0].revenue ? ` on revenue of $${(recentEarnings[0].revenue / 1e9).toFixed(2)}B` : ''}.`
        : `Historical earnings data for ${symbol} is available above.`
    },
    {
      question: `What do analysts expect for ${symbol} earnings?`,
      answer: `Analyst expectations for ${symbol} earnings can vary. ${revenueGrowth ? `The company has shown ${revenueGrowth > 0 ? 'positive' : 'negative'} revenue growth of ${(revenueGrowth * 100).toFixed(1)}%.` : ''} View the full analyst ratings page for detailed expectations.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Earnings', url: `${SITE_URL}/earnings` },
    { name: `${symbol} Earnings`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Earnings Date ${currentYear} - When is ${companyName} Next Earnings?`,
    description: `Complete ${symbol} earnings schedule with next earnings date, historical EPS, and quarterly results.`,
    url: pageUrl,
    keywords: [
      `${symbol} earnings date`,
      `${symbol} earnings`,
      `when is ${symbol} earnings`,
      `${symbol} earnings ${currentYear}`,
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

  const faqSchema = getFAQSchema(earningsFaqs)

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
            <Link href="/earnings" className="hover:text-foreground">Earnings</Link>
            {' / '}
            <span>{symbol} Earnings</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Earnings Date {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} earnings schedule and quarterly results
          </p>

          {/* Next Earnings Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-muted-foreground mb-1">Next Earnings Date</p>
                <p className="text-3xl font-bold">{nextEarningsDate}</p>
                {daysUntilEarnings !== null && daysUntilEarnings > 0 && (
                  <p className="text-blue-400 mt-1">{daysUntilEarnings} days from now</p>
                )}
                {daysUntilEarnings !== null && daysUntilEarnings <= 0 && daysUntilEarnings > -30 && (
                  <p className="text-yellow-400 mt-1">Recently reported</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Stock Price</p>
                <p className="text-2xl font-bold">${snapshot.price?.toFixed(2)}</p>
                <p className={`text-sm ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Earnings Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentEPS && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">EPS (TTM)</p>
                  <p className="text-xl font-bold">${currentEPS.toFixed(2)}</p>
                </div>
              )}
              {peRatio && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-xl font-bold">{peRatio.toFixed(1)}</p>
                </div>
              )}
              {revenueGrowth !== undefined && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(revenueGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {snapshot.market_cap && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-bold">${(snapshot.market_cap / 1e9).toFixed(1)}B</p>
                </div>
              )}
            </div>
          </section>

          {/* Earnings History */}
          {recentEarnings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Earnings History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground">Quarter</th>
                      <th className="text-right p-3 text-muted-foreground">EPS</th>
                      <th className="text-right p-3 text-muted-foreground">Revenue</th>
                      <th className="text-right p-3 text-muted-foreground">Net Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEarnings.map((earnings: any, index: number) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 font-medium">{earnings.period}</td>
                        <td className="p-3 text-right">
                          {earnings.eps ? `$${earnings.eps.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 text-right">
                          {earnings.revenue ? `$${(earnings.revenue / 1e9).toFixed(2)}B` : '-'}
                        </td>
                        <td className="p-3 text-right">
                          {earnings.netIncome ? `$${(earnings.netIncome / 1e9).toFixed(2)}B` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* How to Trade Earnings */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Trading Around {symbol} Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Before Earnings</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Review analyst expectations and consensus estimates</li>
                  <li>Check options implied volatility for expected move</li>
                  <li>Consider historical earnings surprises</li>
                  <li>Monitor pre-announcement guidance</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">After Earnings</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Compare actual results to estimates</li>
                  <li>Listen to the earnings call for guidance</li>
                  <li>Watch for analyst rating changes</li>
                  <li>Monitor institutional buying/selling</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              DCF valuation, AI insights, and institutional ownership data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/forecast/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Price Forecast
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {earningsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Earnings */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Earnings Reports</h2>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/earnings/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Earnings
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
