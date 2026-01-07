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
    title: `${symbol} Debt Underwriting Revenue - Bond & Credit Facility Fees ${currentYear}`,
    description: `${symbol} debt underwriting revenue analysis: corporate bond fees, municipal bond revenue, structured products, and debt capital markets income.`,
    keywords: [
      `${symbol} debt underwriting`,
      `${symbol} bond underwriting`,
      `${symbol} DCM revenue`,
      `${symbol} corporate bond fees`,
      `${symbol} debt capital markets`,
      `${symbol} syndicated loan fees`,
    ],
    openGraph: {
      title: `${symbol} Debt Underwriting Revenue ${currentYear} | Bond & DCM Fees`,
      description: `Complete ${symbol} debt underwriting revenue analysis with corporate bonds, municipal bonds, and structured products fee breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/debt-underwriting/${ticker.toLowerCase()}`,
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

export default async function DebtUnderwritingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/debt-underwriting/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  const quarters = quarterlyIncome?.slice(0, 8) || []

  const debtFaqs = [
    {
      question: `What is ${symbol}'s debt underwriting revenue?`,
      answer: `${symbol} (${companyName}) generates debt underwriting revenue by facilitating bond issuances and credit facilities for corporate, government, and institutional clients. This includes corporate bonds, municipal bonds, asset-backed securities, structured products, and syndicated loans. Fees typically range from 0.5% to 2% of issuance size depending on deal complexity and risk.`
    },
    {
      question: `How does ${symbol} make money from bond underwriting?`,
      answer: `${symbol} earns bond underwriting fees by helping issuers access debt capital markets. The bank provides structuring, pricing, marketing, and distribution services. For investment-grade corporate bonds, fees are typically 0.5-0.875%, while high-yield bonds command 1.5-2% fees due to higher complexity and risk.`
    },
    {
      question: `What types of debt instruments does ${symbol} underwrite?`,
      answer: `${symbol} underwrites various debt instruments including: investment-grade corporate bonds, high-yield (junk) bonds, municipal bonds, asset-backed securities (ABS), mortgage-backed securities (MBS), collateralized loan obligations (CLOs), syndicated loans, and convertible debt. Each product has different fee structures and risk profiles.`
    },
    {
      question: `Is ${symbol}'s debt underwriting revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Debt underwriting revenue depends on corporate financing needs, interest rate environment, credit spreads, and refinancing activity.`
        : `Debt underwriting revenue can fluctuate based on interest rate cycles, credit market conditions, and corporate financing activity.`
    },
    {
      question: `How do interest rates affect ${symbol}'s debt underwriting revenue?`,
      answer: `Interest rates significantly impact debt underwriting revenue. Rising rates can slow issuance as borrowing becomes more expensive, while falling rates often spur refinancing activity. The shape of the yield curve, credit spreads, and market volatility also influence corporate bond issuance volumes and underwriting fees.`
    },
    {
      question: `How does ${symbol} rank in debt capital markets league tables?`,
      answer: `Debt capital markets (DCM) league tables rank banks by total bond underwriting volume across different categories: investment-grade, high-yield, leveraged loans, and structured products. ${symbol} competes for top positions with other major banks. League table data is published by Bloomberg, Refinitiv, and Dealogic.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Debt Underwriting`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Debt Underwriting Revenue ${currentYear} - Bond & Credit Facility Fees`,
    description: `Complete debt underwriting revenue analysis for ${symbol} (${companyName}) with corporate bonds, municipal bonds, and structured products breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} debt underwriting`,
      `${symbol} bond underwriting`,
      `${symbol} DCM revenue`,
      `${symbol} corporate bonds`,
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

  const faqSchema = getFAQSchema(debtFaqs)
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
            <span>{symbol} Debt Underwriting</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Debt Underwriting Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Corporate bond, municipal bond, and structured product fees for {companyName}
          </p>

          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Annual Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Debt Underwriting Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-blue-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Corporate Bonds</h3>
                <p className="text-sm text-muted-foreground">
                  Investment-grade and high-yield corporate bond issuances for financing, M&A, and refinancing
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-indigo-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Municipal Bonds</h3>
                <p className="text-sm text-muted-foreground">
                  Tax-exempt and taxable municipal bonds for state and local government infrastructure projects
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-purple-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Structured Products</h3>
                <p className="text-sm text-muted-foreground">
                  Asset-backed securities, mortgage-backed securities, CLOs, and other complex structured debt
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-green-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Syndicated Loans</h3>
                <p className="text-sm text-muted-foreground">
                  Leveraged loans, investment-grade term loans, and revolving credit facilities syndicated to lenders
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue History</h2>
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
                          <p className="text-sm text-muted-foreground">YoY Growth</p>
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

          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue</h2>
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

          <section className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, underwriting revenue, and AI-powered insights
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {debtFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Debt underwriting revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="debt-underwriting" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
