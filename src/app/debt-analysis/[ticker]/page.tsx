import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'
import { ArrowLeft, DollarSign, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Building2, PiggyBank, Percent, Activity } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Debt Analysis - Total Debt & Leverage Ratios`,
    description: `${symbol} debt analysis and leverage metrics. View total debt, debt-to-equity ratio, interest coverage, and comprehensive debt breakdown.`,
    keywords: [
      `${symbol} debt`,
      `${symbol} debt analysis`,
      `${symbol} debt to equity`,
      `${symbol} leverage ratio`,
      `${symbol} interest coverage`,
      `${symbol} total debt`,
      `${symbol} financial health`,
    ],
    openGraph: {
      title: `${symbol} Debt Analysis | Total Debt & Leverage Ratios`,
      description: `Complete debt analysis for ${symbol} including leverage ratios and interest coverage.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/debt-analysis/${ticker.toLowerCase()}`,
    },
  }
}

async function getDebtData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/company-debt?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

function formatCurrency(value: number | null | undefined): string {
  if (!value) return '-'
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals) + 'x'
}

const healthRatingConfig: Record<string, { label: string; color: string; description: string }> = {
  EXCELLENT: { label: 'Excellent', color: 'text-green-500', description: 'Very low debt levels with strong coverage' },
  GOOD: { label: 'Good', color: 'text-emerald-500', description: 'Healthy debt levels with adequate coverage' },
  MODERATE: { label: 'Moderate', color: 'text-yellow-500', description: 'Manageable debt with some risk' },
  CONCERN: { label: 'Concern', color: 'text-orange-500', description: 'Elevated debt levels requiring monitoring' },
  HIGH_RISK: { label: 'High Risk', color: 'text-red-500', description: 'High leverage with limited coverage' },
}

export default async function DebtAnalysisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const debtData = await getDebtData(symbol)
  if (!debtData?.debt) notFound()

  const { debt, ratios, cashFlow, balanceSheet, companyName, asOfDate } = debtData
  const pageUrl = `${SITE_URL}/debt-analysis/${ticker.toLowerCase()}`
  const rating = ratios?.debtHealthRating || 'MODERATE'
  const ratingConfig = healthRatingConfig[rating]

  const debtFaqs = [
    {
      question: `What is ${symbol} total debt?`,
      answer: debt?.totalDebt
        ? `${symbol} has total debt of ${formatCurrency(debt.totalDebt)}, consisting of ${formatCurrency(debt.longTermDebt)} in long-term debt and ${formatCurrency(debt.shortTermDebt)} in short-term debt.`
        : `Total debt data for ${symbol} is not currently available.`
    },
    {
      question: `What is ${symbol} debt-to-equity ratio?`,
      answer: ratios?.debtToEquity
        ? `${symbol}'s debt-to-equity ratio is ${ratios.debtToEquity.toFixed(2)}x. ${ratios.debtToEquity > 2 ? 'This is considered high leverage.' : ratios.debtToEquity > 1 ? 'This is a moderate level of leverage.' : 'This indicates conservative leverage.'}`
        : `Debt-to-equity ratio for ${symbol} is not currently available.`
    },
    {
      question: `What is ${symbol} interest coverage ratio?`,
      answer: ratios?.interestCoverage
        ? `${symbol} has an interest coverage ratio of ${ratios.interestCoverage.toFixed(2)}x, meaning it generates ${ratios.interestCoverage.toFixed(1)} times its annual interest expense in operating income. ${ratios.interestCoverage > 5 ? 'This indicates strong ability to service debt.' : ratios.interestCoverage > 2 ? 'This shows adequate coverage.' : 'This suggests limited buffer for interest payments.'}`
        : `Interest coverage data for ${symbol} is not currently available.`
    },
    {
      question: `Is ${symbol} debt level healthy?`,
      answer: `${symbol} has a debt health rating of "${ratingConfig.label}". ${ratingConfig.description}. ${cashFlow?.isPayingDownDebt ? 'The company is actively reducing its debt levels.' : 'The company has been adding to its debt.'}`
    },
    {
      question: `How much is ${symbol} net debt?`,
      answer: ratios?.netDebt
        ? `${symbol}'s net debt (total debt minus cash) is ${formatCurrency(ratios.netDebt)}. ${ratios.netDebt < 0 ? 'The negative value means the company has more cash than debt.' : 'This represents the actual debt burden after accounting for cash reserves.'}`
        : `Net debt calculation for ${symbol} is not currently available.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Debt Analysis`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Debt Analysis - Total Debt & Leverage Ratios`,
      description: `Comprehensive debt analysis for ${symbol} (${companyName}) including total debt, leverage ratios, and interest coverage.`,
      url: pageUrl,
      keywords: [`${symbol} debt`, `${symbol} debt to equity`, `${symbol} leverage`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: `${companyName} debt analysis and financial leverage metrics`,
      url: pageUrl,
    }),
    getFAQSchema(debtFaqs),
    getTableSchema({
      name: `${symbol} Debt Analysis History`,
      description: `Historical Debt Analysis data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Debt Analysis', 'Change'],
      rowCount: 5,
    }),
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
            <span>Debt Analysis</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{symbol} Debt Analysis</h1>
            <p className="text-xl text-muted-foreground">{companyName} - Total Debt & Leverage Ratios</p>
            {asOfDate && (
              <p className="text-sm text-muted-foreground mt-2">
                Data as of {new Date(asOfDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Debt Health Rating */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-500/30 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Debt Health Rating</p>
                <p className={`text-3xl font-bold ${ratingConfig.color}`}>{ratingConfig.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{ratingConfig.description}</p>
              </div>
              <Building2 className="w-16 h-16 opacity-30" />
            </div>
          </div>

          {/* Key Debt Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Debt Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Debt</span>
                </div>
                <p className="text-3xl font-bold mb-1">{formatCurrency(debt.totalDebt)}</p>
                <p className="text-sm text-muted-foreground">Combined long & short-term</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Percent className="w-4 h-4" />
                  <span className="text-sm font-medium">Debt-to-Equity</span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${
                  ratios?.debtToEquity && ratios.debtToEquity > 2 ? 'text-red-500' :
                  ratios?.debtToEquity && ratios.debtToEquity > 1 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {formatRatio(ratios?.debtToEquity)}
                </p>
                <p className="text-sm text-muted-foreground">Leverage ratio</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Interest Coverage</span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${
                  ratios?.interestCoverage && ratios.interestCoverage < 2 ? 'text-red-500' :
                  ratios?.interestCoverage && ratios.interestCoverage < 5 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {formatRatio(ratios?.interestCoverage)}
                </p>
                <p className="text-sm text-muted-foreground">Op. income / interest</p>
              </div>
            </div>
          </section>

          {/* Debt Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Debt Structure</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <p className="font-medium">Long-term Debt</p>
                    <p className="text-sm text-muted-foreground">Due after 1 year</p>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(debt.longTermDebt)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <p className="font-medium">Short-term Debt</p>
                    <p className="text-sm text-muted-foreground">Due within 1 year</p>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(debt.shortTermDebt)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <p className="font-medium">Annual Interest Expense</p>
                    <p className="text-sm text-muted-foreground">Cost of debt per year</p>
                  </div>
                  <span className="text-xl font-bold text-red-500">{formatCurrency(debt.interestExpense)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 bg-secondary/30 p-4 rounded-lg">
                  <div>
                    <p className="font-bold">Net Debt</p>
                    <p className="text-sm text-muted-foreground">Total debt minus cash</p>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(ratios?.netDebt)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Ratios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Leverage Ratios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-medium">Debt-to-Assets</p>
                    <p className="text-sm text-muted-foreground">Total debt / Total assets</p>
                  </div>
                  <span className="text-2xl font-bold">
                    {ratios?.debtToAssets ? `${(ratios.debtToAssets * 100).toFixed(1)}%` : '-'}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: ratios?.debtToAssets ? `${Math.min(ratios.debtToAssets * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Debt Service Coverage</p>
                    <p className="text-sm text-muted-foreground">Cash flow / Interest</p>
                  </div>
                  <span className="text-2xl font-bold">{formatRatio(ratios?.debtServiceCoverage)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Debt Activity */}
          {cashFlow && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Debt Activity (Annual)</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      New Debt Issued
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(cashFlow.debtIssuances)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      Debt Repaid
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(cashFlow.debtRepayments)}</p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    cashFlow.isPayingDownDebt
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <p className="text-sm mb-1 flex items-center gap-2">
                      {cashFlow.isPayingDownDebt ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      Net Change
                    </p>
                    <p className={`text-xl font-bold ${cashFlow.isPayingDownDebt ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(cashFlow.netDebtChange)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cashFlow.isPayingDownDebt ? 'Reducing debt' : 'Adding debt'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Balance Sheet Context */}
          {balanceSheet && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Balance Sheet Context</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cash & Equivalents</p>
                    <p className="text-lg font-bold">{formatCurrency(balanceSheet.cash)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-lg font-bold">{formatCurrency(balanceSheet.totalAssets)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stockholders Equity</p>
                    <p className="text-lg font-bold">{formatCurrency(balanceSheet.stockholdersEquity)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating Income</p>
                    <p className="text-lg font-bold">{formatCurrency(balanceSheet.operatingIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
                    <p className="text-lg font-bold">{formatCurrency(balanceSheet.operatingCashFlow)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Detailed Debt Analysis</h2>
            <p className="text-muted-foreground mb-6">Explore maturity schedules, corporate bonds, and risk analysis</p>
            <Link href={`/debt/${ticker.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Debt Report
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {debtFaqs.map((faq, i) => (
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
