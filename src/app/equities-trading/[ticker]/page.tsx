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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Equities Trading Revenue - Cash Equities & Derivatives ${currentYear}`,
    description: `${symbol} equities trading revenue analysis: cash equities, equity derivatives, electronic trading, program trading, and prime brokerage income.`,
    keywords: [
      `${symbol} equities trading`,
      `${symbol} equity trading revenue`,
      `${symbol} cash equities`,
      `${symbol} equity derivatives`,
      `${symbol} prime brokerage`,
      `${symbol} electronic trading`,
    ],
    openGraph: {
      title: `${symbol} Equities Trading Revenue ${currentYear} | Cash Equities & Derivatives`,
      description: `Complete ${symbol} equities trading revenue analysis with cash equities, derivatives, and prime brokerage breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/equities-trading/${ticker.toLowerCase()}`,
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

export default async function EquitiesTradingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/equities-trading/${ticker.toLowerCase()}`
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

  const equitiesFaqs = [
    {
      question: `What is ${symbol}'s equities trading revenue?`,
      answer: `${symbol} (${companyName}) generates equities trading revenue through cash equities trading, equity derivatives, electronic trading, program trading, and prime brokerage services. Revenue comes from market making spreads, commissions, facilitation fees, and financing charges. Equities trading is typically smaller than FICC but offers strong client relationships and recurring revenue streams.`
    },
    {
      question: `What products are in ${symbol}'s equities trading business?`,
      answer: `${symbol}'s equities trading includes: (1) Cash Equities - agency trading and market making in stocks, (2) Equity Derivatives - options, futures, swaps, and structured products, (3) Electronic Trading - algorithmic trading and execution services, (4) Program Trading - basket trades and index rebalancing, and (5) Prime Brokerage - financing, securities lending, and custody services for hedge funds.`
    },
    {
      question: `How does ${symbol} make money from equities trading?`,
      answer: `${symbol} earns equities revenue through: market making (earning bid-ask spreads), commissions (charging for trade execution), derivatives structuring (creating custom equity derivatives), financing fees (prime brokerage margin lending), securities lending (borrowing fees), and technology services (providing execution platforms and algorithms).`
    },
    {
      question: `Is ${symbol}'s equities trading revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Equities trading revenue benefits from higher market volumes, increased volatility, and growth in electronic trading and derivatives. The shift to electronic trading has compressed commissions but increased volumes.`
        : `Equities trading revenue faces headwinds from commission compression and electronic trading, but benefits from derivatives growth and prime brokerage services. Revenue can fluctuate with market volumes and volatility.`
    },
    {
      question: `What is prime brokerage and how does it generate revenue?`,
      answer: `Prime brokerage provides comprehensive services to hedge funds and institutional clients including: margin lending (charging interest on borrowed capital), securities lending (earning fees on stock loans for short selling), trade clearing and settlement, custody services, and capital introduction. Prime brokerage generates stable recurring revenue but carries credit risk if hedge fund clients default.`
    },
    {
      question: `How has electronic trading impacted ${symbol}'s equities business?`,
      answer: `Electronic trading has transformed the equities business by: compressing commission rates through automation, increasing trade volumes via algorithmic trading, reducing manual intervention, enabling high-frequency trading strategies, and requiring significant technology investment. Banks have responded by offering sophisticated execution algorithms, dark pools, and analytics tools to maintain market share.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Equities Trading`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Equities Trading Revenue ${currentYear} - Cash Equities & Derivatives`,
    description: `Complete equities trading revenue analysis for ${symbol} (${companyName}) with cash equities, derivatives, and prime brokerage breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} equities trading`,
      `${symbol} equity derivatives`,
      `${symbol} cash equities`,
      `${symbol} prime brokerage`,
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

  const faqSchema = getFAQSchema(equitiesFaqs)
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
            <span>{symbol} Equities Trading</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Equities Trading Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cash equities, derivatives, and prime brokerage revenue for {companyName}
          </p>

          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
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
            <h2 className="text-2xl font-bold mb-4">Equities Trading Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-violet-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Cash Equities</h3>
                <p className="text-sm text-muted-foreground">
                  Market making and agency trading in listed stocks across global exchanges, earning spreads and commissions
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-purple-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Equity Derivatives</h3>
                <p className="text-sm text-muted-foreground">
                  Options, futures, swaps, variance swaps, and exotic derivatives for hedging and speculation
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-blue-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Electronic Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Algorithmic execution, VWAP/TWAP strategies, dark pools, and high-frequency trading technology
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-pink-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Prime Brokerage</h3>
                <p className="text-sm text-muted-foreground">
                  Margin lending, securities lending, clearing, custody, and comprehensive services for hedge funds
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-green-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Program Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Basket trades, index arbitrage, portfolio transitions, and large-scale rebalancing execution
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-indigo-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Structured Products</h3>
                <p className="text-sm text-muted-foreground">
                  Equity-linked notes, autocallables, reverse convertibles, and customized derivative solutions
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

          <section className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, equities trading breakdown, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {equitiesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Equities trading revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="equities-trading" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
