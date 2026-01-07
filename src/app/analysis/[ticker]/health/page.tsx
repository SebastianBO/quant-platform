import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AnalysisNavigation } from '@/components/analysis/AnalysisNavigation'
import { AnalysisRelatedLinks } from '@/components/analysis/AnalysisRelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'
import {
  getBalanceSheets,
  getCashFlows,
  getFinancialMetrics,
  getStockSnapshot,
  getStockFundamentals,
} from '@/lib/api'
import {
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Activity,
  PiggyBank,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react'


interface Props {
  params: Promise<{ ticker: string }>
}

// Pre-render top 500+ stocks at build time

// Allow dynamic rendering for stocks not in the pre-rendered list
export const revalidate = 3600

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `Is ${symbol} Financially Healthy? Balance Sheet & Debt Analysis ${currentYear}`,
    description: `Comprehensive financial health analysis of ${symbol} stock. Review debt levels, cash position, liquidity ratios, interest coverage, and balance sheet strength. Is ${symbol} able to pay its debts?`,
    keywords: [
      `${symbol} debt`,
      `${symbol} balance sheet`,
      `is ${symbol} financially healthy`,
      `${symbol} cash flow`,
      `${symbol} debt to equity`,
      `${symbol} financial health`,
      `${symbol} liquidity`,
      `${symbol} current ratio`,
      `${symbol} interest coverage`,
      `can ${symbol} pay debts`,
    ],
    openGraph: {
      title: `Is ${symbol} Financially Healthy? - Balance Sheet Analysis`,
      description: `Deep dive into ${symbol}'s financial health: debt levels, cash position, and ability to meet obligations.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/analysis/${ticker.toLowerCase()}/health`,
    },
  }
}

// Health score calculator
function calculateHealthScore(metrics: any): {
  score: number
  rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'CONCERN' | 'HIGH_RISK'
  color: string
  bg: string
  border: string
} {
  let score = 100

  // Debt to Equity (25 points)
  const debtToEquity = metrics.debtToEquity || 0
  if (debtToEquity < 0.5) score -= 0
  else if (debtToEquity < 1.0) score -= 5
  else if (debtToEquity < 2.0) score -= 15
  else score -= 25

  // Current Ratio (25 points)
  const currentRatio = metrics.currentRatio || 0
  if (currentRatio >= 2.0) score -= 0
  else if (currentRatio >= 1.5) score -= 5
  else if (currentRatio >= 1.0) score -= 15
  else score -= 25

  // Interest Coverage (25 points)
  const interestCoverage = metrics.interestCoverage || 0
  if (interestCoverage >= 5.0) score -= 0
  else if (interestCoverage >= 3.0) score -= 5
  else if (interestCoverage >= 1.5) score -= 15
  else score -= 25

  // Cash to Debt (25 points)
  const cashToDebt = metrics.cashToDebt || 0
  if (cashToDebt >= 0.5) score -= 0
  else if (cashToDebt >= 0.3) score -= 5
  else if (cashToDebt >= 0.1) score -= 15
  else score -= 25

  let rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'CONCERN' | 'HIGH_RISK'
  let color: string
  let bg: string
  let border: string

  if (score >= 85) {
    rating = 'EXCELLENT'
    color = 'text-green-500'
    bg = 'bg-green-500/10'
    border = 'border-green-500/30'
  } else if (score >= 70) {
    rating = 'GOOD'
    color = 'text-emerald-500'
    bg = 'bg-emerald-500/10'
    border = 'border-emerald-500/30'
  } else if (score >= 50) {
    rating = 'MODERATE'
    color = 'text-yellow-500'
    bg = 'bg-yellow-500/10'
    border = 'border-yellow-500/30'
  } else if (score >= 30) {
    rating = 'CONCERN'
    color = 'text-orange-500'
    bg = 'bg-orange-500/10'
    border = 'border-orange-500/30'
  } else {
    rating = 'HIGH_RISK'
    color = 'text-red-500'
    bg = 'bg-red-500/10'
    border = 'border-red-500/30'
  }

  return { score, rating, color, bg, border }
}

function formatCurrency(value: number | null | undefined, billions = false): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'
  if (billions) {
    return `$${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

function formatRatio(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'
  return value.toFixed(decimals)
}

async function getHealthData(ticker: string) {
  try {
    const [balanceSheets, cashFlows, metrics, snapshot, fundamentals] = await Promise.all([
      getBalanceSheets(ticker, 1),
      getCashFlows(ticker, 1),
      getFinancialMetrics(ticker, 1),
      getStockSnapshot(ticker),
      getStockFundamentals(ticker).catch(() => null),
    ])

    if (!balanceSheets?.balance_sheets?.[0] || !metrics?.financial_metrics?.[0]) {
      return null
    }

    const bs = balanceSheets.balance_sheets[0]
    const cf = cashFlows?.cash_flows?.[0]
    const fm = metrics.financial_metrics[0]

    const totalDebt = (bs.long_term_debt || 0) + (bs.short_term_debt || 0)
    const totalAssets = bs.total_assets || 0
    const totalEquity = bs.stockholders_equity || 0
    const cash = bs.cash_and_equivalents || 0
    const currentAssets = bs.current_assets || 0
    const currentLiabilities = bs.current_liabilities || 0
    const operatingCashFlow = cf?.cash_from_operations || 0
    const freeCashFlow = cf?.free_cash_flow || 0

    const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : null
    const debtToAssets = totalAssets > 0 ? totalDebt / totalAssets : null
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : null
    const quickRatio =
      currentLiabilities > 0
        ? (currentAssets - (bs.inventory || 0)) / currentLiabilities
        : null
    const cashToDebt = totalDebt > 0 ? cash / totalDebt : null
    const interestCoverage = fm.interest_coverage_ratio || null

    return {
      ticker,
      companyName: fundamentals?.General?.Name || ticker,
      sector: fundamentals?.General?.Sector || '',
      asOfDate: bs.report_period,
      balanceSheet: {
        totalAssets,
        totalLiabilities: bs.total_liabilities || 0,
        totalEquity,
        cash,
        currentAssets,
        currentLiabilities,
        longTermDebt: bs.long_term_debt || 0,
        shortTermDebt: bs.short_term_debt || 0,
        totalDebt,
        inventory: bs.inventory || 0,
      },
      cashFlow: {
        operatingCashFlow,
        freeCashFlow,
        capitalExpenditures: cf?.capital_expenditures || 0,
      },
      ratios: {
        debtToEquity,
        debtToAssets,
        currentRatio,
        quickRatio,
        cashToDebt,
        interestCoverage,
      },
      metrics: {
        debtToEquity,
        currentRatio,
        interestCoverage,
        cashToDebt,
      },
      price: snapshot.price || 0,
      marketCap: snapshot.market_cap || 0,
      creditRating: fundamentals?.Highlights?.CreditRating || null,
    }
  } catch (error) {
    console.error('Error fetching health data:', error)
    return null
  }
}

export default async function FinancialHealthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const healthData = await getHealthData(symbol)

  if (!healthData) {
    notFound()
  }

  const health = calculateHealthScore(healthData.metrics)
  const { balanceSheet, cashFlow, ratios } = healthData
  const pageUrl = `${SITE_URL}/analysis/${ticker.toLowerCase()}/health`

  // Structured Data Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Analysis', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Financial Health`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Is ${symbol} Financially Healthy? Balance Sheet & Debt Analysis`,
    description: `Comprehensive analysis of ${healthData.companyName}'s financial health including debt levels, liquidity, and ability to meet obligations.`,
    url: pageUrl,
    keywords: [
      `${symbol} debt`,
      `${symbol} balance sheet`,
      `${symbol} financial health`,
      `${symbol} debt to equity`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: healthData.companyName,
    description: `Financial health analysis of ${healthData.companyName}`,
    sector: healthData.sector,
    url: pageUrl,
  })

  // FAQ for financial health
  const healthFAQs = [
    {
      question: `Is ${symbol} financially healthy?`,
      answer: `${healthData.companyName} has a financial health score of ${health.score}/100 (${health.rating}). ${
        health.score >= 70
          ? `The company demonstrates strong financial health with ${
              ratios.debtToEquity && ratios.debtToEquity < 1
                ? 'manageable debt levels, '
                : ''
            }${
              ratios.currentRatio && ratios.currentRatio >= 1.5
                ? 'strong liquidity, '
                : ''
            }and solid fundamentals.`
          : health.score >= 50
          ? `The company shows moderate financial health. While operational, there are areas requiring attention such as ${
              ratios.debtToEquity && ratios.debtToEquity > 2
                ? 'elevated debt levels, '
                : ''
            }${
              ratios.currentRatio && ratios.currentRatio < 1.5
                ? 'liquidity constraints, '
                : ''
            }that investors should monitor.`
          : `The company faces financial health challenges including ${
              ratios.debtToEquity && ratios.debtToEquity > 2
                ? 'high debt burden, '
                : ''
            }${
              ratios.currentRatio && ratios.currentRatio < 1
                ? 'liquidity concerns, '
                : ''
            }that warrant careful consideration.`
      }`,
    },
    {
      question: `What is ${symbol}'s debt to equity ratio?`,
      answer: `${symbol} has a debt-to-equity ratio of ${formatRatio(
        ratios.debtToEquity
      )}. ${
        ratios.debtToEquity && ratios.debtToEquity < 0.5
          ? 'This conservative leverage indicates the company relies minimally on debt financing.'
          : ratios.debtToEquity && ratios.debtToEquity < 1.0
          ? 'This moderate level suggests balanced use of debt and equity financing.'
          : ratios.debtToEquity && ratios.debtToEquity < 2.0
          ? 'This elevated ratio indicates significant debt relative to equity, which increases financial risk.'
          : 'This high ratio suggests heavy reliance on debt financing, which could pose financial risks.'
      } The ratio compares total debt (${formatCurrency(
        balanceSheet.totalDebt,
        true
      )}) to shareholder equity (${formatCurrency(balanceSheet.totalEquity, true)}).`,
    },
    {
      question: `Can ${symbol} pay its debts?`,
      answer: `${
        ratios.currentRatio && ratios.currentRatio >= 1.5
          ? `Yes, ${symbol} appears well-positioned to meet its short-term obligations with a current ratio of ${formatRatio(
              ratios.currentRatio
            )}, indicating ${formatCurrency(
              balanceSheet.currentAssets,
              true
            )} in current assets versus ${formatCurrency(
              balanceSheet.currentLiabilities,
              true
            )} in current liabilities.`
          : ratios.currentRatio && ratios.currentRatio >= 1.0
          ? `${symbol} can likely meet its obligations but with limited cushion. The current ratio of ${formatRatio(
              ratios.currentRatio
            )} suggests adequate but not abundant liquidity.`
          : `${symbol} may face challenges meeting short-term obligations with a current ratio of ${formatRatio(
              ratios.currentRatio
            )}, below the healthy threshold of 1.0.`
      } ${
        ratios.interestCoverage && ratios.interestCoverage >= 3
          ? `Additionally, strong interest coverage of ${formatRatio(
              ratios.interestCoverage
            )}x indicates earnings comfortably exceed interest expenses.`
          : ratios.interestCoverage && ratios.interestCoverage >= 1.5
          ? `Interest coverage of ${formatRatio(
              ratios.interestCoverage
            )}x suggests earnings cover interest payments with moderate cushion.`
          : ratios.interestCoverage && ratios.interestCoverage > 0
          ? `Low interest coverage of ${formatRatio(
              ratios.interestCoverage
            )}x indicates potential difficulty servicing debt from earnings.`
          : ''
      }`,
    },
    {
      question: `What is ${symbol}'s current ratio?`,
      answer: `${symbol} has a current ratio of ${formatRatio(
        ratios.currentRatio
      )}, calculated by dividing current assets (${formatCurrency(
        balanceSheet.currentAssets,
        true
      )}) by current liabilities (${formatCurrency(
        balanceSheet.currentLiabilities,
        true
      )}). ${
        ratios.currentRatio && ratios.currentRatio >= 2.0
          ? 'This strong ratio indicates excellent short-term liquidity with significant buffer to meet obligations.'
          : ratios.currentRatio && ratios.currentRatio >= 1.5
          ? 'This healthy ratio suggests good ability to cover short-term liabilities with liquid assets.'
          : ratios.currentRatio && ratios.currentRatio >= 1.0
          ? 'This ratio meets the minimum threshold but leaves limited margin for unexpected expenses.'
          : 'This concerning ratio below 1.0 indicates potential liquidity issues requiring attention.'
      }`,
    },
    {
      question: `Does ${symbol} have too much debt?`,
      answer: `${symbol} carries total debt of ${formatCurrency(
        balanceSheet.totalDebt,
        true
      )} (${formatCurrency(balanceSheet.longTermDebt, true)} long-term, ${formatCurrency(
        balanceSheet.shortTermDebt,
        true
      )} short-term). ${
        ratios.debtToEquity && ratios.debtToEquity < 0.5
          ? 'The debt load is conservative and well-managed relative to company equity.'
          : ratios.debtToEquity && ratios.debtToEquity < 1.0
          ? 'Debt levels appear reasonable and in line with industry standards for capital structure.'
          : ratios.debtToEquity && ratios.debtToEquity < 2.0
          ? 'Debt is elevated relative to equity, which may limit financial flexibility.'
          : 'The high debt burden relative to equity raises concerns about financial risk and flexibility.'
      } ${
        ratios.cashToDebt && ratios.cashToDebt >= 0.3
          ? `However, the company holds ${formatCurrency(
              balanceSheet.cash,
              true
            )} in cash, representing ${((ratios.cashToDebt || 0) * 100).toFixed(
              0
            )}% of total debt, providing a strong liquidity cushion.`
          : balanceSheet.cash > 0
          ? `Cash reserves of ${formatCurrency(
              balanceSheet.cash,
              true
            )} provide some buffer but represent only ${((ratios.cashToDebt || 0) * 100).toFixed(
              0
            )}% of total debt.`
          : ''
      }`,
    },
    {
      question: `What is ${symbol}'s cash position?`,
      answer: `${symbol} holds ${formatCurrency(
        balanceSheet.cash,
        true
      )} in cash and cash equivalents. ${
        cashFlow.operatingCashFlow > 0
          ? `The company generates ${formatCurrency(
              cashFlow.operatingCashFlow,
              true
            )} in annual operating cash flow${
              cashFlow.freeCashFlow > 0
                ? ` and ${formatCurrency(
                    cashFlow.freeCashFlow,
                    true
                  )} in free cash flow after capital expenditures`
                : ''
            }, demonstrating strong cash generation capability.`
          : cashFlow.operatingCashFlow < 0
          ? `However, the company is currently consuming cash from operations (${formatCurrency(
              cashFlow.operatingCashFlow,
              true
            )}), which may pressure liquidity over time.`
          : 'Cash flow data is limited for comprehensive analysis.'
      }`,
    },
  ]

  const faqSchema = getFAQSchema(healthFAQs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  // Calculate debt trend (simplified - would use historical data in production)
  const isPayingDownDebt = cashFlow.freeCashFlow > 0
  const debtTrend =
    ratios.debtToEquity && ratios.debtToEquity < 1 ? 'improving' : 'stable'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
        <AnalysisNavigation ticker={ticker} />
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">
              Analysis
            </Link>
            {' / '}
            <span>{symbol} Financial Health</span>
          </nav>

          {/* Main Title */}
          <h1 className="text-4xl font-bold mb-4">
            Is {symbol} Financially Healthy?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A comprehensive analysis of {healthData.companyName}'s balance sheet, debt levels,
            and ability to meet financial obligations
          </p>

          {/* Health Score Card */}
          <div
            className={`p-8 rounded-xl mb-8 border ${health.bg} ${health.border}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Financial Health Score
                </p>
                <div className="flex items-center gap-4">
                  <div className={`text-6xl font-bold ${health.color}`}>
                    {health.score}
                    <span className="text-2xl">/100</span>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${health.color}`}>
                      {health.rating}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      As of {new Date(healthData.asOfDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <Shield className={`w-24 h-24 ${health.color}`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs">Debt/Equity</span>
                </div>
                <p className="text-xl font-bold">{formatRatio(ratios.debtToEquity)}</p>
                <p className="text-xs text-muted-foreground">
                  {ratios.debtToEquity && ratios.debtToEquity < 1
                    ? 'Conservative'
                    : ratios.debtToEquity && ratios.debtToEquity < 2
                    ? 'Moderate'
                    : 'Elevated'}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <PiggyBank className="w-4 h-4" />
                  <span className="text-xs">Current Ratio</span>
                </div>
                <p className="text-xl font-bold">{formatRatio(ratios.currentRatio)}</p>
                <p className="text-xs text-muted-foreground">
                  {ratios.currentRatio && ratios.currentRatio >= 1.5
                    ? 'Strong'
                    : ratios.currentRatio && ratios.currentRatio >= 1
                    ? 'Adequate'
                    : 'Weak'}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Percent className="w-4 h-4" />
                  <span className="text-xs">Interest Coverage</span>
                </div>
                <p className="text-xl font-bold">
                  {formatRatio(ratios.interestCoverage)}x
                </p>
                <p className="text-xs text-muted-foreground">
                  {ratios.interestCoverage && ratios.interestCoverage >= 3
                    ? 'Comfortable'
                    : ratios.interestCoverage && ratios.interestCoverage >= 1.5
                    ? 'Moderate'
                    : 'Tight'}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Cash/Debt</span>
                </div>
                <p className="text-xl font-bold">
                  {ratios.cashToDebt
                    ? `${(ratios.cashToDebt * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ratios.cashToDebt && ratios.cashToDebt >= 0.5
                    ? 'Strong'
                    : ratios.cashToDebt && ratios.cashToDebt >= 0.2
                    ? 'Moderate'
                    : 'Limited'}
                </p>
              </div>
            </div>
          </div>

          {/* Article Sections */}
          <article className="prose prose-invert max-w-none">
            {/* Debt Levels Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-8 h-8" />
                Understanding {symbol}'s Debt Levels
              </h2>
              <div className="bg-card p-6 rounded-xl border border-border mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Debt Composition</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Long-term Debt</span>
                        <span className="font-bold">
                          {formatCurrency(balanceSheet.longTermDebt, true)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Short-term Debt</span>
                        <span className="font-bold">
                          {formatCurrency(balanceSheet.shortTermDebt, true)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <span className="font-bold">Total Debt</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(balanceSheet.totalDebt, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Debt Ratios</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Debt to Equity</span>
                        <span className="font-bold">
                          {formatRatio(ratios.debtToEquity)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Debt to Assets</span>
                        <span className="font-bold">
                          {formatRatio(ratios.debtToAssets)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <span className="font-bold">Assessment</span>
                        <span
                          className={`font-bold ${
                            ratios.debtToEquity && ratios.debtToEquity < 1
                              ? 'text-green-500'
                              : ratios.debtToEquity && ratios.debtToEquity < 2
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {ratios.debtToEquity && ratios.debtToEquity < 1
                            ? 'Conservative'
                            : ratios.debtToEquity && ratios.debtToEquity < 2
                            ? 'Moderate'
                            : 'Elevated'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-lg mb-4">
                {healthData.companyName} carries{' '}
                <strong>{formatCurrency(balanceSheet.totalDebt, true)}</strong> in total
                debt, with a debt-to-equity ratio of{' '}
                <strong>{formatRatio(ratios.debtToEquity)}</strong>.{' '}
                {ratios.debtToEquity && ratios.debtToEquity < 0.5
                  ? 'This conservative leverage profile suggests the company maintains a strong balance sheet with minimal reliance on borrowed capital. Such low debt levels provide significant financial flexibility and reduce risk during economic downturns.'
                  : ratios.debtToEquity && ratios.debtToEquity < 1.0
                  ? 'This moderate leverage indicates a balanced capital structure that uses debt strategically without overextending the company. The debt level is generally considered healthy and manageable.'
                  : ratios.debtToEquity && ratios.debtToEquity < 2.0
                  ? 'This elevated debt-to-equity ratio suggests the company relies more heavily on debt financing, which can amplify returns during good times but increases financial risk. Investors should monitor the company\'s ability to service this debt.'
                  : 'This high debt burden relative to equity raises concerns about financial leverage. While debt can fuel growth, excessive leverage limits financial flexibility and increases vulnerability to economic headwinds or rising interest rates.'}
              </p>
            </section>

            {/* Liquidity Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <PiggyBank className="w-8 h-8" />
                Cash Position and Liquidity
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Cash Reserves</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(balanceSheet.cash, true)}
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Current Assets</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(balanceSheet.currentAssets, true)}
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Liabilities
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(balanceSheet.currentLiabilities, true)}
                  </p>
                </div>
              </div>

              <p className="text-lg mb-4">
                With <strong>{formatCurrency(balanceSheet.cash, true)}</strong> in cash and
                cash equivalents, {symbol} maintains{' '}
                {ratios.cashToDebt && ratios.cashToDebt >= 0.5
                  ? 'a robust cash position'
                  : ratios.cashToDebt && ratios.cashToDebt >= 0.2
                  ? 'a moderate cash cushion'
                  : 'limited cash reserves'}{' '}
                representing{' '}
                <strong>
                  {ratios.cashToDebt
                    ? `${(ratios.cashToDebt * 100).toFixed(0)}%`
                    : 'a small portion'}
                </strong>{' '}
                of total debt.
              </p>

              <div className="bg-card p-6 rounded-xl border border-border mb-6">
                <h3 className="text-xl font-bold mb-4">Liquidity Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Current Ratio</span>
                      <span className="font-bold text-lg">
                        {formatRatio(ratios.currentRatio)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ratios.currentRatio && ratios.currentRatio >= 1.5
                            ? 'bg-green-500'
                            : ratios.currentRatio && ratios.currentRatio >= 1
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            ((ratios.currentRatio || 0) / 3) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ratios.currentRatio && ratios.currentRatio >= 1.5
                        ? 'Strong liquidity - company can easily meet short-term obligations'
                        : ratios.currentRatio && ratios.currentRatio >= 1
                        ? 'Adequate liquidity - company can meet obligations but with limited buffer'
                        : 'Weak liquidity - potential challenges meeting short-term obligations'}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Quick Ratio</span>
                      <span className="font-bold text-lg">
                        {formatRatio(ratios.quickRatio)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ratios.quickRatio && ratios.quickRatio >= 1.0
                            ? 'bg-green-500'
                            : ratios.quickRatio && ratios.quickRatio >= 0.5
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(((ratios.quickRatio || 0) / 2) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quick ratio excludes inventory - measures immediate liquidity
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interest Coverage Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Percent className="w-8 h-8" />
                Interest Coverage and Debt Servicing
              </h2>

              <div className="bg-card p-6 rounded-xl border border-border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Coverage Ratio</p>
                    <p className="text-4xl font-bold">
                      {formatRatio(ratios.interestCoverage)}x
                    </p>
                  </div>
                  {ratios.interestCoverage && ratios.interestCoverage >= 3 ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  ) : ratios.interestCoverage && ratios.interestCoverage >= 1.5 ? (
                    <Info className="w-12 h-12 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  )}
                </div>
                <p className="text-muted-foreground">
                  {ratios.interestCoverage && ratios.interestCoverage >= 3
                    ? `${symbol}'s earnings cover interest expenses ${formatRatio(
                        ratios.interestCoverage
                      )}x over, indicating comfortable debt servicing capability with significant cushion for economic volatility.`
                    : ratios.interestCoverage && ratios.interestCoverage >= 1.5
                    ? `${symbol} generates enough earnings to cover interest ${formatRatio(
                        ratios.interestCoverage
                      )}x, providing moderate coverage. While serviceable, there's limited room for earnings deterioration.`
                    : ratios.interestCoverage && ratios.interestCoverage > 0
                    ? `With interest coverage of only ${formatRatio(
                        ratios.interestCoverage
                      )}x, ${symbol} has tight margins for servicing debt. Any earnings pressure could strain the company's ability to meet interest obligations.`
                    : 'Interest coverage data is not available or the company may not have interest-bearing debt.'}
                </p>
              </div>

              <p className="text-lg mb-4">
                The interest coverage ratio measures how many times a company can pay its
                interest expenses with its operating income. A ratio above 3.0x is generally
                considered healthy, while ratios below 1.5x may indicate financial stress.
              </p>
            </section>

            {/* Free Cash Flow Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                Free Cash Flow Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Operating Cash Flow
                    </span>
                    {cashFlow.operatingCashFlow > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(cashFlow.operatingCashFlow, true)}
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Free Cash Flow</span>
                    {cashFlow.freeCashFlow > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(cashFlow.freeCashFlow, true)}
                  </p>
                </div>
              </div>

              <p className="text-lg mb-4">
                {cashFlow.operatingCashFlow > 0 ? (
                  <>
                    {symbol} generates{' '}
                    <strong>{formatCurrency(cashFlow.operatingCashFlow, true)}</strong> in
                    annual operating cash flow, demonstrating{' '}
                    {cashFlow.freeCashFlow > 0
                      ? 'strong operational efficiency and cash generation capability'
                      : 'positive cash from operations, though capital expenditures consume most of this cash'}
                    . {cashFlow.freeCashFlow > 0 && (
                      <>
                        After accounting for capital expenditures, the company produces{' '}
                        <strong>{formatCurrency(cashFlow.freeCashFlow, true)}</strong> in
                        free cash flow, which can be used for debt reduction, dividends, or
                        strategic investments.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {symbol} is currently consuming cash from operations (
                    <strong>{formatCurrency(cashFlow.operatingCashFlow, true)}</strong>),
                    which may indicate growth investments or operational challenges. This
                    cash burn rate warrants monitoring, especially given the company's debt
                    levels.
                  </>
                )}
              </p>
            </section>

            {/* Can They Pay Debts Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-8 h-8" />
                Can {symbol} Pay Its Debts?
              </h2>

              <div
                className={`p-6 rounded-xl border mb-6 ${
                  health.score >= 70
                    ? 'bg-green-500/10 border-green-500/30'
                    : health.score >= 50
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {health.score >= 70 ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  ) : health.score >= 50 ? (
                    <Info className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {health.score >= 70
                        ? 'Yes - Strong Debt Repayment Capacity'
                        : health.score >= 50
                        ? 'Likely - With Monitoring Required'
                        : 'Uncertain - Significant Concerns Exist'}
                    </h3>
                    <p className="text-muted-foreground">
                      {health.score >= 70
                        ? `${symbol} demonstrates strong financial health with multiple indicators suggesting comfortable debt servicing capacity. The combination of ${
                            ratios.currentRatio && ratios.currentRatio >= 1.5
                              ? 'strong liquidity, '
                              : ''
                          }${
                            ratios.debtToEquity && ratios.debtToEquity < 1
                              ? 'conservative leverage, '
                              : ''
                          }${
                            ratios.interestCoverage && ratios.interestCoverage >= 3
                              ? 'comfortable interest coverage, '
                              : ''
                          }and ${
                            cashFlow.freeCashFlow > 0
                              ? 'positive free cash flow '
                              : 'operational cash generation '
                          }provides multiple layers of protection for debt holders.`
                        : health.score >= 50
                        ? `${symbol} shows adequate ability to meet debt obligations under normal conditions, but investors should monitor key metrics. ${
                            ratios.currentRatio && ratios.currentRatio < 1.5
                              ? 'Limited liquidity buffers '
                              : ''
                          }${
                            ratios.debtToEquity && ratios.debtToEquity > 1
                              ? 'and elevated leverage '
                              : ''
                          }mean the company has less room for error if business conditions deteriorate.`
                        : `${symbol} faces meaningful financial health challenges that create uncertainty around debt repayment capacity. ${
                            ratios.currentRatio && ratios.currentRatio < 1
                              ? 'Weak liquidity, '
                              : ''
                          }${
                            ratios.debtToEquity && ratios.debtToEquity > 2
                              ? 'high leverage, '
                              : ''
                          }${
                            ratios.interestCoverage &&
                            ratios.interestCoverage < 1.5
                            ? 'tight interest coverage, '
                            : ''
                          }and ${
                            cashFlow.freeCashFlow < 0
                              ? 'negative free cash flow '
                              : 'limited cash generation '
                          }combine to create elevated risk for stakeholders.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4">Key Considerations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        ratios.currentRatio && ratios.currentRatio >= 1.5
                          ? 'bg-green-500/20 text-green-500'
                          : ratios.currentRatio && ratios.currentRatio >= 1
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {ratios.currentRatio && ratios.currentRatio >= 1.5 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Short-term Liquidity:</span>{' '}
                      <span className="text-muted-foreground">
                        Current ratio of {formatRatio(ratios.currentRatio)} indicates{' '}
                        {ratios.currentRatio && ratios.currentRatio >= 1.5
                          ? 'strong'
                          : ratios.currentRatio && ratios.currentRatio >= 1
                          ? 'adequate'
                          : 'weak'}{' '}
                        ability to meet obligations due within one year.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        ratios.debtToEquity && ratios.debtToEquity < 1
                          ? 'bg-green-500/20 text-green-500'
                          : ratios.debtToEquity && ratios.debtToEquity < 2
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {ratios.debtToEquity && ratios.debtToEquity < 1 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Leverage Level:</span>{' '}
                      <span className="text-muted-foreground">
                        Debt-to-equity of {formatRatio(ratios.debtToEquity)} represents{' '}
                        {ratios.debtToEquity && ratios.debtToEquity < 1
                          ? 'conservative'
                          : ratios.debtToEquity && ratios.debtToEquity < 2
                          ? 'moderate'
                          : 'high'}{' '}
                        financial leverage.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        cashFlow.freeCashFlow > 0
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {cashFlow.freeCashFlow > 0 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Cash Generation:</span>{' '}
                      <span className="text-muted-foreground">
                        {cashFlow.freeCashFlow > 0
                          ? `Positive free cash flow of ${formatCurrency(
                              cashFlow.freeCashFlow,
                              true
                            )} supports debt repayment and provides flexibility.`
                          : 'Negative free cash flow may require reliance on financing or asset sales.'}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Credit Rating Section */}
            {healthData.creditRating && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4">Credit Rating</h2>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        External Credit Rating
                      </p>
                      <p className="text-3xl font-bold">{healthData.creditRating}</p>
                    </div>
                    <Shield className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Credit ratings from agencies like Moody's and S&P assess the company's
                    creditworthiness and ability to repay debt obligations.
                  </p>
                </div>
              </section>
            )}

            {/* Conclusion Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Financial Stability Conclusion</h2>
              <div className="bg-card p-8 rounded-xl border border-border">
                <p className="text-lg mb-4">
                  <strong>
                    {health.score >= 85
                      ? `${symbol} demonstrates excellent financial health and stability.`
                      : health.score >= 70
                      ? `${symbol} shows good financial health with manageable risks.`
                      : health.score >= 50
                      ? `${symbol} exhibits moderate financial health requiring ongoing monitoring.`
                      : health.score >= 30
                      ? `${symbol} faces financial health concerns that warrant caution.`
                      : `${symbol} shows significant financial health challenges.`}
                  </strong>
                </p>
                <p className="text-muted-foreground mb-4">
                  {health.score >= 70
                    ? `The company's strong balance sheet, characterized by ${
                        ratios.debtToEquity && ratios.debtToEquity < 1
                          ? 'conservative debt levels, '
                          : ''
                      }${
                        ratios.currentRatio && ratios.currentRatio >= 1.5
                          ? 'robust liquidity, '
                          : ''
                      }and ${
                        cashFlow.freeCashFlow > 0
                          ? 'positive cash generation'
                          : 'solid fundamentals'
                      }, positions it well to weather economic uncertainties and pursue growth opportunities. This financial strength provides a solid foundation for long-term value creation.`
                    : health.score >= 50
                    ? `While the company maintains operational viability, several financial metrics suggest limited flexibility. Investors should monitor ${
                        ratios.debtToEquity && ratios.debtToEquity > 1
                          ? 'debt levels, '
                          : ''
                      }${
                        ratios.currentRatio && ratios.currentRatio < 1.5
                          ? 'liquidity position, '
                          : ''
                      }and ${
                        cashFlow.freeCashFlow < 0
                          ? 'cash flow trends '
                          : 'financial trends '
                      }closely for signs of improvement or deterioration.`
                    : `Significant financial health challenges create elevated risk for investors and creditors. The combination of ${
                        ratios.debtToEquity && ratios.debtToEquity > 2
                          ? 'high leverage, '
                          : ''
                      }${
                        ratios.currentRatio && ratios.currentRatio < 1
                          ? 'weak liquidity, '
                          : ''
                      }and ${
                        cashFlow.freeCashFlow < 0 ? 'cash consumption ' : 'limited cash generation '
                      }suggests the need for operational improvements or balance sheet restructuring.`}
                </p>
                <p className="text-sm text-muted-foreground">
                  This analysis is based on the most recent financial statements as of{' '}
                  {new Date(healthData.asOfDate).toLocaleDateString()}. Financial health can
                  change over time based on business performance, market conditions, and
                  management decisions.
                </p>
              </div>
            </section>
          </article>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Get Complete Financial Analysis for {symbol}
            </h2>
            <p className="text-muted-foreground mb-6">
              Access AI-powered insights, DCF valuations, real-time data, and comprehensive
              financial analysis
            </p>
            <Link
              href={`/dashboard?ticker=${symbol}`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View Full Dashboard
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions About {symbol}'s Financial Health
            </h2>
            <div className="space-y-4">
              {healthFAQs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <AnalysisRelatedLinks
            ticker={symbol}
            currentAnalysisType="health"
            companyName={healthData.companyName}
          />
        </div>
      </main>
    </>
  )
}
