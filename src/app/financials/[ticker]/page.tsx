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
    title: `${symbol} Financials - Income Statement, Balance Sheet & Cash Flow`,
    description: `${symbol} financial statements and key metrics. View income statement, balance sheet, cash flow statement, revenue, earnings, and profit margins.`,
    keywords: [
      `${symbol} financials`,
      `${symbol} income statement`,
      `${symbol} balance sheet`,
      `${symbol} cash flow`,
      `${symbol} revenue`,
      `${symbol} earnings`,
      `${symbol} financial statements`,
    ],
    openGraph: {
      title: `${symbol} Financials | Income Statement & Balance Sheet`,
      description: `Complete financial statements for ${symbol} including revenue, earnings, and cash flow.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/financials/${ticker.toLowerCase()}`,
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

export default async function FinancialsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics, incomeStatements, balanceSheets, cashFlows } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/financials/${ticker.toLowerCase()}`

  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]
  const latestCashFlow = cashFlows?.[0]

  const financialFaqs = [
    {
      question: `What is ${symbol} revenue?`,
      answer: latestIncome?.revenue
        ? `${symbol}'s most recent quarterly revenue was ${formatValue(latestIncome.revenue)}. Annual revenue can be calculated by summing the four most recent quarters.`
        : `View ${symbol}'s income statement for detailed revenue data.`
    },
    {
      question: `Is ${symbol} profitable?`,
      answer: latestIncome?.net_income
        ? `${symbol} reported ${latestIncome.net_income > 0 ? 'a profit' : 'a loss'} of ${formatValue(Math.abs(latestIncome.net_income))} in the most recent quarter.${metrics?.net_margin ? ` The net profit margin is ${(metrics.net_margin * 100).toFixed(1)}%.` : ''}`
        : `Check ${symbol}'s income statement for profitability data.`
    },
    {
      question: `What is ${symbol} market cap?`,
      answer: snapshot.market_cap
        ? `${symbol} has a market capitalization of ${formatValue(snapshot.market_cap)}, making it a ${snapshot.market_cap > 200e9 ? 'mega-cap' : snapshot.market_cap > 10e9 ? 'large-cap' : snapshot.market_cap > 2e9 ? 'mid-cap' : 'small-cap'} stock.`
        : `Market cap data for ${symbol} is available above.`
    },
    {
      question: `Does ${symbol} have debt?`,
      answer: latestBalance?.total_debt
        ? `${symbol} has total debt of ${formatValue(latestBalance.total_debt)}.${metrics?.debt_to_equity ? ` The debt-to-equity ratio is ${metrics.debt_to_equity.toFixed(2)}.` : ''}`
        : `View ${symbol}'s balance sheet for debt information.`
    },
    {
      question: `What is ${symbol} cash flow?`,
      answer: latestCashFlow?.free_cash_flow
        ? `${symbol}'s most recent quarterly free cash flow was ${formatValue(latestCashFlow.free_cash_flow)}.`
        : `Cash flow data is available in the full financial statements.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Financials`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Financials - Income Statement, Balance Sheet & Cash Flow`,
      description: `Complete financial statements for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} financials`, `${symbol} income statement`, `${symbol} balance sheet`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(financialFaqs),
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
            <span>{symbol} Financials</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Financials</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Financial statements & key metrics</p>

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
                <p className="text-sm text-muted-foreground">EPS</p>
                <p className="text-2xl font-bold">${metrics.earnings_per_share.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Income Statement Highlights */}
          {latestIncome && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Income Statement Highlights</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter: {latestIncome.fiscal_period || latestIncome.report_period}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold text-green-500">{formatValue(latestIncome.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gross Profit</p>
                    <p className="text-xl font-bold">{formatValue(latestIncome.gross_profit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating Income</p>
                    <p className="text-xl font-bold">{formatValue(latestIncome.operating_income)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className={`text-xl font-bold ${(latestIncome.net_income || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestIncome.net_income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EPS (Diluted)</p>
                    <p className="text-xl font-bold">${latestIncome.earnings_per_share_diluted?.toFixed(2) || '-'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Balance Sheet Highlights */}
          {latestBalance && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Balance Sheet Highlights</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-xl font-bold">{formatValue(latestBalance.total_assets)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Liabilities</p>
                    <p className="text-xl font-bold">{formatValue(latestBalance.total_liabilities)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shareholders Equity</p>
                    <p className="text-xl font-bold text-green-500">{formatValue(latestBalance.shareholders_equity)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cash & Equivalents</p>
                    <p className="text-xl font-bold">{formatValue(latestBalance.cash_and_equivalents)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Debt</p>
                    <p className="text-xl font-bold">{formatValue(latestBalance.total_debt)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cash Flow Highlights */}
          {latestCashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cash Flow Highlights</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
                    <p className="text-xl font-bold">{formatValue(latestCashFlow.net_cash_flow_from_operations)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CapEx</p>
                    <p className="text-xl font-bold">{formatValue(latestCashFlow.capital_expenditure)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Free Cash Flow</p>
                    <p className={`text-xl font-bold ${(latestCashFlow.free_cash_flow || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestCashFlow.free_cash_flow)}
                    </p>
                  </div>
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
                    <p className="text-sm text-muted-foreground">ROE</p>
                    <p className="text-xl font-bold">{(metrics.return_on_equity * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Complete Financial Statements</h2>
            <p className="text-muted-foreground mb-6">Full income statements, balance sheets, and cash flows for multiple periods</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Open Full Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {financialFaqs.map((faq, i) => (
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
