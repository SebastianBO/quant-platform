import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Income Statement - Revenue, Expenses & Profit`,
    description: `${symbol} income statement analysis. View quarterly and annual revenue, gross profit, operating income, net income, earnings per share, and profit margins.`,
    keywords: [
      `${symbol} income statement`,
      `${symbol} revenue`,
      `${symbol} profit`,
      `${symbol} earnings`,
      `${symbol} operating income`,
      `${symbol} net income`,
      `${symbol} gross profit`,
      `${symbol} EPS`,
    ],
    openGraph: {
      title: `${symbol} Income Statement | Revenue & Profit Analysis`,
      description: `Complete income statement for ${symbol} including revenue, operating income, net income, and earnings per share.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/income-statement/${ticker.toLowerCase()}`,
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

function formatValue(value: number | null | undefined): string {
  if (!value) return '-'
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function formatPercent(value: number | null | undefined): string {
  if (!value) return '-'
  return `${(value * 100).toFixed(1)}%`
}

export default async function IncomeStatementPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/income-statement/${ticker.toLowerCase()}`

  const latestIncome = incomeStatements?.[0]
  const previousIncome = incomeStatements?.[1]

  // Calculate revenue growth if we have previous period
  let revenueGrowth: number | null = null
  if (latestIncome?.revenue && previousIncome?.revenue) {
    revenueGrowth = ((latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue) * 100
  }

  const incomeFaqs = [
    {
      question: `What is ${symbol}'s revenue?`,
      answer: latestIncome?.revenue
        ? `${symbol}'s most recent quarterly revenue was ${formatValue(latestIncome.revenue)}${revenueGrowth !== null ? `, representing a ${revenueGrowth >= 0 ? 'growth' : 'decline'} of ${Math.abs(revenueGrowth).toFixed(1)}% year-over-year` : ''}.`
        : `View ${symbol}'s income statement for detailed revenue data.`
    },
    {
      question: `Is ${symbol} profitable?`,
      answer: latestIncome?.net_income
        ? `${symbol} reported ${latestIncome.net_income > 0 ? 'a profit' : 'a loss'} of ${formatValue(Math.abs(latestIncome.net_income))} in the most recent quarter.${metrics?.net_margin ? ` The net profit margin is ${(metrics.net_margin * 100).toFixed(1)}%.` : ''}`
        : `Check ${symbol}'s income statement for profitability data.`
    },
    {
      question: `What is ${symbol}'s operating income?`,
      answer: latestIncome?.operating_income
        ? `${symbol}'s operating income was ${formatValue(latestIncome.operating_income)} in the most recent quarter.${metrics?.operating_margin ? ` The operating margin is ${(metrics.operating_margin * 100).toFixed(1)}%.` : ''}`
        : `Operating income data is available in the income statement.`
    },
    {
      question: `What is ${symbol}'s earnings per share (EPS)?`,
      answer: latestIncome?.earnings_per_share_diluted
        ? `${symbol} reported diluted earnings per share of $${latestIncome.earnings_per_share_diluted.toFixed(2)} in the most recent quarter.`
        : `EPS data is available in the income statement.`
    },
    {
      question: `What is ${symbol}'s gross profit margin?`,
      answer: metrics?.gross_margin
        ? `${symbol} has a gross profit margin of ${(metrics.gross_margin * 100).toFixed(1)}%, indicating the profitability of core operations before operating expenses.`
        : `Gross margin data is available in the profitability metrics section.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Income Statement`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Income Statement - Revenue, Expenses & Profit`,
      description: `Complete income statement analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} income statement`, `${symbol} revenue`, `${symbol} profit`, `${symbol} earnings`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(incomeFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Income Statement</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Income Statement</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Revenue, Expenses & Profit Analysis</p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Stock Price</p>
              <p className="text-2xl font-bold">${snapshot.price?.toFixed(2)}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-2xl font-bold">{formatValue(snapshot.market_cap)}</p>
            </div>
            {metrics?.price_to_earnings_ratio && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-2xl font-bold">{metrics.price_to_earnings_ratio.toFixed(1)}</p>
              </div>
            )}
            {metrics?.earnings_per_share && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">EPS (TTM)</p>
                <p className="text-2xl font-bold">${metrics.earnings_per_share.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Latest Quarter Income Statement */}
          {latestIncome && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Most Recent Quarter</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-6">
                  Period: {latestIncome.fiscal_period || latestIncome.report_period}
                  {latestIncome.report_period && <span className="ml-2">({latestIncome.report_period})</span>}
                </p>

                <div className="space-y-4">
                  {/* Revenue */}
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div>
                      <p className="font-semibold text-lg">Revenue</p>
                      <p className="text-sm text-muted-foreground">Total sales from operations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-500">{formatValue(latestIncome.revenue)}</p>
                      {revenueGrowth !== null && (
                        <p className={`text-sm ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% YoY
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cost of Revenue */}
                  {latestIncome.cost_of_revenue && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Cost of Revenue</p>
                        <p className="text-sm text-muted-foreground">Direct costs of sales</p>
                      </div>
                      <p className="text-lg font-semibold text-red-500">{formatValue(latestIncome.cost_of_revenue)}</p>
                    </div>
                  )}

                  {/* Gross Profit */}
                  {latestIncome.gross_profit && (
                    <div className="flex justify-between items-center py-3 border-b border-border bg-muted/30 px-3 rounded">
                      <div>
                        <p className="font-semibold text-lg">Gross Profit</p>
                        <p className="text-sm text-muted-foreground">Revenue - Cost of Revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatValue(latestIncome.gross_profit)}</p>
                        {metrics?.gross_margin && (
                          <p className="text-sm text-muted-foreground">Margin: {formatPercent(metrics.gross_margin)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operating Expenses */}
                  {latestIncome.operating_expenses && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Operating Expenses</p>
                        <p className="text-sm text-muted-foreground">R&D, SG&A, and other expenses</p>
                      </div>
                      <p className="text-lg font-semibold text-red-500">{formatValue(latestIncome.operating_expenses)}</p>
                    </div>
                  )}

                  {/* Operating Income */}
                  {latestIncome.operating_income && (
                    <div className="flex justify-between items-center py-3 border-b border-border bg-muted/30 px-3 rounded">
                      <div>
                        <p className="font-semibold text-lg">Operating Income</p>
                        <p className="text-sm text-muted-foreground">Gross Profit - Operating Expenses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatValue(latestIncome.operating_income)}</p>
                        {metrics?.operating_margin && (
                          <p className="text-sm text-muted-foreground">Margin: {formatPercent(metrics.operating_margin)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interest Expense */}
                  {latestIncome.interest_expense && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Interest Expense</p>
                        <p className="text-sm text-muted-foreground">Cost of debt</p>
                      </div>
                      <p className="text-lg font-semibold text-red-500">{formatValue(latestIncome.interest_expense)}</p>
                    </div>
                  )}

                  {/* Income Tax */}
                  {latestIncome.income_tax && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Income Tax</p>
                        <p className="text-sm text-muted-foreground">Tax expense</p>
                      </div>
                      <p className="text-lg font-semibold text-red-500">{formatValue(latestIncome.income_tax)}</p>
                    </div>
                  )}

                  {/* Net Income */}
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 rounded-lg border border-blue-500/30 mt-4">
                    <div>
                      <p className="font-bold text-xl">Net Income</p>
                      <p className="text-sm text-muted-foreground">Bottom line profit</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${(latestIncome.net_income || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatValue(latestIncome.net_income)}
                      </p>
                      {metrics?.net_margin && (
                        <p className="text-sm text-muted-foreground">Margin: {formatPercent(metrics.net_margin)}</p>
                      )}
                    </div>
                  </div>

                  {/* Earnings Per Share */}
                  {latestIncome.earnings_per_share_diluted && (
                    <div className="flex justify-between items-center py-3 mt-4">
                      <div>
                        <p className="font-semibold">Earnings Per Share (Diluted)</p>
                        <p className="text-sm text-muted-foreground">Net income per share</p>
                      </div>
                      <p className="text-xl font-bold">${latestIncome.earnings_per_share_diluted.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Profitability Metrics */}
          {metrics && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Profitability Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.gross_margin && (
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Gross Margin</p>
                    <p className="text-xl font-bold">{(metrics.gross_margin * 100).toFixed(1)}%</p>
                  </div>
                )}
                {metrics.operating_margin && (
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Operating Margin</p>
                    <p className="text-xl font-bold">{(metrics.operating_margin * 100).toFixed(1)}%</p>
                  </div>
                )}
                {metrics.net_margin && (
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Net Margin</p>
                    <p className="text-xl font-bold">{(metrics.net_margin * 100).toFixed(1)}%</p>
                  </div>
                )}
                {metrics.return_on_equity && (
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Return on Equity</p>
                    <p className="text-xl font-bold">{(metrics.return_on_equity * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Historical Income Statements */}
          {incomeStatements && incomeStatements.length > 1 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Historical Income Statements</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 border-b border-border">Period</th>
                      <th className="text-right p-3 border-b border-border">Revenue</th>
                      <th className="text-right p-3 border-b border-border">Gross Profit</th>
                      <th className="text-right p-3 border-b border-border">Operating Income</th>
                      <th className="text-right p-3 border-b border-border">Net Income</th>
                      <th className="text-right p-3 border-b border-border">EPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeStatements.slice(0, 8).map((income: { fiscal_period?: string; report_period?: string; revenue?: number; gross_profit?: number; operating_income?: number; net_income?: number; earnings_per_share_diluted?: number }, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-card' : ''}>
                        <td className="p-3 border-b border-border">
                          {income.fiscal_period || income.report_period}
                        </td>
                        <td className="text-right p-3 border-b border-border font-medium">
                          {formatValue(income.revenue)}
                        </td>
                        <td className="text-right p-3 border-b border-border">
                          {formatValue(income.gross_profit)}
                        </td>
                        <td className="text-right p-3 border-b border-border">
                          {formatValue(income.operating_income)}
                        </td>
                        <td className={`text-right p-3 border-b border-border font-semibold ${(income.net_income || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatValue(income.net_income)}
                        </td>
                        <td className="text-right p-3 border-b border-border">
                          ${income.earnings_per_share_diluted?.toFixed(2) || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Full income statements, balance sheets, cash flows, and AI-powered insights</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Open Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {incomeFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
