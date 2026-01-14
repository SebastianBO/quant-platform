import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Cash Flow - Operating, Investing & Free Cash Flow`,
    description: `${symbol} cash flow statement analysis. View operating cash flow, investing activities, financing cash flows, free cash flow (FCF), and FCF per share trends.`,
    keywords: [
      `${symbol} cash flow`,
      `${symbol} free cash flow`,
      `${symbol} FCF`,
      `${symbol} operating cash flow`,
      `${symbol} cash flow statement`,
      `${symbol} FCF per share`,
      `${symbol} investing activities`,
      `${symbol} financing activities`,
    ],
    openGraph: {
      title: `${symbol} Cash Flow Analysis | Operating & Free Cash Flow`,
      description: `Complete cash flow analysis for ${symbol} including operating, investing, and financing activities.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cash-flow/${ticker.toLowerCase()}`,
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
  const absValue = Math.abs(value)
  const formatted =
    absValue >= 1e12 ? `$${(value / 1e12).toFixed(2)}T` :
    absValue >= 1e9 ? `$${(value / 1e9).toFixed(2)}B` :
    absValue >= 1e6 ? `$${(value / 1e6).toFixed(2)}M` :
    `$${value.toLocaleString()}`

  return value < 0 ? `(${formatted.replace('-', '')})` : formatted
}

function formatPerShare(value: number | null | undefined): string {
  if (!value) return '-'
  return `$${value.toFixed(2)}`
}

function formatPercent(value: number | null | undefined): string {
  if (!value) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function calculateFCFPerShare(fcf: number | null | undefined, shares: number | null | undefined): number | null {
  if (!fcf || !shares || shares === 0) return null
  return fcf / shares
}

function calculateYoYGrowth(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (!current || !previous || previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

function getTrendIcon(value: number | null | undefined) {
  if (!value || Math.abs(value) < 0.5) return <Minus className="w-4 h-4 text-muted-foreground" />
  if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
  return <TrendingDown className="w-4 h-4 text-red-500" />
}

function getTrendColor(value: number | null | undefined, inverse: boolean = false) {
  if (!value || Math.abs(value) < 0.5) return 'text-foreground'
  const positive = inverse ? value < 0 : value > 0
  return positive ? 'text-green-500' : 'text-red-500'
}

export default async function CashFlowPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics, cashFlows, quarterlyCashFlows, incomeStatements, balanceSheets } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cash-flow/${ticker.toLowerCase()}`

  const latestCashFlow = cashFlows?.[0]
  const previousCashFlow = cashFlows?.[1]
  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]

  // Calculate metrics
  const fcfPerShare = calculateFCFPerShare(latestCashFlow?.free_cash_flow, latestIncome?.weighted_average_shares_outstanding_diluted)
  const fcfYield = snapshot.market_cap && latestCashFlow?.free_cash_flow
    ? (latestCashFlow.free_cash_flow / snapshot.market_cap) * 100
    : null

  const operatingCFGrowth = calculateYoYGrowth(
    latestCashFlow?.net_cash_flow_from_operations,
    previousCashFlow?.net_cash_flow_from_operations
  )
  const fcfGrowth = calculateYoYGrowth(
    latestCashFlow?.free_cash_flow,
    previousCashFlow?.free_cash_flow
  )

  const cashFlowFaqs = [
    {
      question: `What is ${symbol} free cash flow?`,
      answer: latestCashFlow?.free_cash_flow
        ? `${symbol}'s most recent free cash flow (FCF) is ${formatValue(latestCashFlow.free_cash_flow)}. Free cash flow represents the cash a company generates after accounting for capital expenditures, and is available for dividends, buybacks, or debt reduction.`
        : `Free cash flow data for ${symbol} is available in the full cash flow statement.`
    },
    {
      question: `What is ${symbol} operating cash flow?`,
      answer: latestCashFlow?.net_cash_flow_from_operations
        ? `${symbol} generated ${formatValue(latestCashFlow.net_cash_flow_from_operations)} in operating cash flow in the most recent period. Operating cash flow shows the cash generated from core business operations.`
        : `Operating cash flow data for ${symbol} is available above.`
    },
    {
      question: `What is ${symbol} FCF per share?`,
      answer: fcfPerShare
        ? `${symbol} has a free cash flow per share of ${formatPerShare(fcfPerShare)}, calculated by dividing total free cash flow by diluted shares outstanding.`
        : `FCF per share can be calculated by dividing free cash flow by shares outstanding.`
    },
    {
      question: `Is ${symbol} cash flow growing?`,
      answer: operatingCFGrowth
        ? `${symbol}'s operating cash flow ${operatingCFGrowth > 0 ? 'grew' : 'declined'} by ${Math.abs(operatingCFGrowth).toFixed(1)}% year-over-year.${fcfGrowth ? ` Free cash flow ${fcfGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(fcfGrowth).toFixed(1)}%.` : ''}`
        : `View the cash flow trends section for historical growth data.`
    },
    {
      question: `What is ${symbol} FCF yield?`,
      answer: fcfYield
        ? `${symbol} has a free cash flow yield of ${fcfYield.toFixed(2)}%, calculated as free cash flow divided by market capitalization. A higher FCF yield may indicate better value.`
        : `FCF yield is calculated by dividing free cash flow by market capitalization.`
    },
    {
      question: `What is ${symbol} capital expenditure?`,
      answer: latestCashFlow?.capital_expenditure
        ? `${symbol} spent ${formatValue(Math.abs(latestCashFlow.capital_expenditure))} on capital expenditures (CapEx) in the most recent period. CapEx represents investments in property, plant, and equipment.`
        : `Capital expenditure data is available in the investing activities section.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Cash Flow`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Cash Flow - Operating, Investing & Free Cash Flow`,
      description: `Complete cash flow analysis for ${symbol} (${companyName}) including operating activities, investing activities, and free cash flow.`,
      url: pageUrl,
      keywords: [`${symbol} cash flow`, `${symbol} free cash flow`, `${symbol} FCF`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(cashFlowFaqs),
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
            <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-foreground">{symbol}</Link>
            {' / '}
            <span>Cash Flow</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Cash Flow Statement</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} - Operating, Investing & Free Cash Flow Analysis
          </p>

          {/* Key Cash Flow Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
              <p className="text-2xl font-bold text-green-500">
                {formatValue(latestCashFlow?.net_cash_flow_from_operations)}
              </p>
              {operatingCFGrowth !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(operatingCFGrowth)}
                  <span className={`text-xs ${getTrendColor(operatingCFGrowth)}`}>
                    {operatingCFGrowth > 0 ? '+' : ''}{operatingCFGrowth.toFixed(1)}% YoY
                  </span>
                </div>
              )}
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Free Cash Flow</p>
              <p className={`text-2xl font-bold ${(latestCashFlow?.free_cash_flow || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatValue(latestCashFlow?.free_cash_flow)}
              </p>
              {fcfGrowth !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(fcfGrowth)}
                  <span className={`text-xs ${getTrendColor(fcfGrowth)}`}>
                    {fcfGrowth > 0 ? '+' : ''}{fcfGrowth.toFixed(1)}% YoY
                  </span>
                </div>
              )}
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">FCF per Share</p>
              <p className="text-2xl font-bold">{formatPerShare(fcfPerShare)}</p>
              {fcfYield !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {fcfYield.toFixed(2)}% yield
                </p>
              )}
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">CapEx</p>
              <p className="text-2xl font-bold">
                {formatValue(latestCashFlow?.capital_expenditure)}
              </p>
            </div>
          </div>

          {/* Operating Activities */}
          {latestCashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
                Operating Activities
              </h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Cash generated from core business operations
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <span className="font-medium">Net Cash from Operations</span>
                      <p className="text-xs text-muted-foreground">Primary cash generation</p>
                    </div>
                    <span className={`text-xl font-bold ${(latestCashFlow.net_cash_flow_from_operations || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestCashFlow.net_cash_flow_from_operations)}
                    </span>
                  </div>

                  {latestIncome?.net_income && (
                    <>
                      <div className="flex justify-between items-center pl-6 text-muted-foreground">
                        <span className="text-sm">Net Income (Starting Point)</span>
                        <span>{formatValue(latestIncome.net_income)}</span>
                      </div>
                      {latestCashFlow.depreciation_and_amortization && (
                        <div className="flex justify-between items-center pl-6 text-muted-foreground">
                          <span className="text-sm">+ Depreciation & Amortization</span>
                          <span>{formatValue(latestCashFlow.depreciation_and_amortization)}</span>
                        </div>
                      )}
                      {latestCashFlow.stock_based_compensation && (
                        <div className="flex justify-between items-center pl-6 text-muted-foreground">
                          <span className="text-sm">+ Stock-Based Compensation</span>
                          <span>{formatValue(latestCashFlow.stock_based_compensation)}</span>
                        </div>
                      )}
                      {latestCashFlow.deferred_income_tax && (
                        <div className="flex justify-between items-center pl-6 text-muted-foreground">
                          <span className="text-sm">Deferred Income Tax</span>
                          <span>{formatValue(latestCashFlow.deferred_income_tax)}</span>
                        </div>
                      )}
                      {latestCashFlow.change_in_working_capital && (
                        <div className="flex justify-between items-center pl-6 text-muted-foreground">
                          <span className="text-sm">Changes in Working Capital</span>
                          <span>{formatValue(latestCashFlow.change_in_working_capital)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Investing Activities */}
          {latestCashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ArrowDownRight className="w-6 h-6 text-blue-500" />
                Investing Activities
              </h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Cash used for investments and capital expenditures
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <span className="font-medium">Net Cash from Investing</span>
                      <p className="text-xs text-muted-foreground">Total investing activities</p>
                    </div>
                    <span className={`text-xl font-bold ${(latestCashFlow.net_cash_flow_from_investing || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestCashFlow.net_cash_flow_from_investing)}
                    </span>
                  </div>

                  {latestCashFlow.capital_expenditure && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Capital Expenditures (CapEx)</span>
                      <span>{formatValue(latestCashFlow.capital_expenditure)}</span>
                    </div>
                  )}
                  {latestCashFlow.purchase_of_investments && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Purchase of Investments</span>
                      <span>{formatValue(latestCashFlow.purchase_of_investments)}</span>
                    </div>
                  )}
                  {latestCashFlow.sale_of_investments && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Sale of Investments</span>
                      <span>{formatValue(latestCashFlow.sale_of_investments)}</span>
                    </div>
                  )}
                  {latestCashFlow.acquisitions && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Acquisitions</span>
                      <span>{formatValue(latestCashFlow.acquisitions)}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Financing Activities */}
          {latestCashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ArrowDownRight className="w-6 h-6 text-purple-500" />
                Financing Activities
              </h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Cash from financing activities including debt, equity, and dividends
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <span className="font-medium">Net Cash from Financing</span>
                      <p className="text-xs text-muted-foreground">Total financing activities</p>
                    </div>
                    <span className={`text-xl font-bold ${(latestCashFlow.net_cash_flow_from_financing || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestCashFlow.net_cash_flow_from_financing)}
                    </span>
                  </div>

                  {latestCashFlow.repurchase_of_common_stock && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Share Buybacks</span>
                      <span>{formatValue(latestCashFlow.repurchase_of_common_stock)}</span>
                    </div>
                  )}
                  {latestCashFlow.payment_of_dividends && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Dividend Payments</span>
                      <span>{formatValue(latestCashFlow.payment_of_dividends)}</span>
                    </div>
                  )}
                  {latestCashFlow.proceeds_from_issuance_of_debt && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Debt Issuance</span>
                      <span>{formatValue(latestCashFlow.proceeds_from_issuance_of_debt)}</span>
                    </div>
                  )}
                  {latestCashFlow.repayment_of_debt && (
                    <div className="flex justify-between items-center pl-6 text-muted-foreground">
                      <span className="text-sm">Debt Repayment</span>
                      <span>{formatValue(latestCashFlow.repayment_of_debt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Free Cash Flow Calculation */}
          {latestCashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Free Cash Flow (FCF) Calculation</h2>
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 rounded-xl border border-green-500/30">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Operating Cash Flow</span>
                    <span className="text-lg font-bold">
                      {formatValue(latestCashFlow.net_cash_flow_from_operations)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">- Capital Expenditures</span>
                    <span className="text-lg font-bold">
                      {formatValue(latestCashFlow.capital_expenditure)}
                    </span>
                  </div>
                  <div className="border-t border-green-500/30 pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg">= Free Cash Flow</span>
                    <span className={`text-2xl font-bold ${(latestCashFlow.free_cash_flow || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(latestCashFlow.free_cash_flow)}
                    </span>
                  </div>
                  {fcfPerShare !== null && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>FCF per Share</span>
                      <span className="font-medium">{formatPerShare(fcfPerShare)}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Cash Flow Trends */}
          {cashFlows && cashFlows.length > 1 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cash Flow Trends (Annual)</h2>
              <div className="bg-card p-6 rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Period</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Operating CF</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Investing CF</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Financing CF</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Free CF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlows.slice(0, 5).map((cf: { fiscal_year?: string; report_period?: string; net_cash_flow_from_operations?: number; net_cash_flow_from_investing?: number; net_cash_flow_from_financing?: number; free_cash_flow?: number }, idx: number) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 font-medium">
                          {cf.fiscal_year || cf.report_period}
                        </td>
                        <td className="py-3 text-right">
                          {formatValue(cf.net_cash_flow_from_operations)}
                        </td>
                        <td className="py-3 text-right">
                          {formatValue(cf.net_cash_flow_from_investing)}
                        </td>
                        <td className="py-3 text-right">
                          {formatValue(cf.net_cash_flow_from_financing)}
                        </td>
                        <td className={`py-3 text-right font-medium ${(cf.free_cash_flow || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatValue(cf.free_cash_flow)}
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
            <p className="text-muted-foreground mb-6">
              Full income statements, balance sheets, and detailed cash flow analysis
            </p>
            <Link
              href={`/dashboard?ticker=${symbol}&tab=financials`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              Open Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cashFlowFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
