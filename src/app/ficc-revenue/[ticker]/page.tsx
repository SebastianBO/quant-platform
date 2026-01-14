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
    title: `${symbol} FICC Revenue - Fixed Income, Currencies & Commodities ${currentYear}`,
    description: `${symbol} FICC revenue analysis: fixed income trading, currencies (FX), commodities revenue, rates trading, and credit trading income.`,
    keywords: [
      `${symbol} FICC revenue`,
      `${symbol} fixed income trading`,
      `${symbol} FX revenue`,
      `${symbol} currencies trading`,
      `${symbol} commodities revenue`,
      `${symbol} rates trading`,
    ],
    openGraph: {
      title: `${symbol} FICC Revenue ${currentYear} | Fixed Income, Currencies & Commodities`,
      description: `Complete ${symbol} FICC revenue analysis with fixed income, currencies, commodities, and rates trading breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ficc-revenue/${ticker.toLowerCase()}`,
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

export default async function FICCRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ficc-revenue/${ticker.toLowerCase()}`
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

  const ficcFaqs = [
    {
      question: `What is ${symbol}'s FICC revenue?`,
      answer: `${symbol} (${companyName}) generates FICC (Fixed Income, Currencies & Commodities) revenue through trading and market making in bonds, interest rate products, foreign exchange, credit derivatives, and commodities. FICC is typically the largest trading division at major banks, generating revenue from client facilitation, market making spreads, and position-taking.`
    },
    {
      question: `What products are included in ${symbol}'s FICC business?`,
      answer: `${symbol}'s FICC business includes: (1) Rates - government bonds, interest rate swaps, and derivatives, (2) Credit - corporate bonds, credit default swaps, and structured credit, (3) Currencies (FX) - spot FX, forwards, options, and exotic derivatives, (4) Commodities - energy, metals, and agricultural products, and (5) Securitized Products - mortgage-backed securities and asset-backed securities.`
    },
    {
      question: `How does ${symbol} make money in FICC trading?`,
      answer: `${symbol} earns FICC revenue through: market making (earning bid-ask spreads on client trades), client facilitation (helping institutional clients execute large trades), proprietary positioning (taking calculated market risk), derivatives structuring (creating custom hedging solutions), and providing liquidity during stressed market conditions.`
    },
    {
      question: `Is ${symbol}'s FICC revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. FICC revenue tends to be higher during periods of market volatility, interest rate changes, and economic uncertainty when clients need to adjust their portfolios and hedge risks.`
        : `FICC revenue can fluctuate based on market conditions. Low volatility and stable markets typically result in lower FICC revenue, while market disruptions and volatility spikes boost trading activity.`
    },
    {
      question: `How do interest rates affect ${symbol}'s FICC revenue?`,
      answer: `Interest rate movements significantly impact FICC revenue. Rate volatility increases client hedging activity and widens trading spreads. Central bank policy changes drive repositioning in rates and credit markets. Rising rates can benefit certain FICC products while challenging others, creating both opportunities and risks for the trading desk.`
    },
    {
      question: `What are the risks in ${symbol}'s FICC business?`,
      answer: `FICC risks include: interest rate risk (losses from rate movements), credit risk (counterparty and issuer defaults), FX risk (currency fluctuations), commodity price risk, liquidity risk (inability to exit large positions), and model risk (pricing errors in complex derivatives). Banks use sophisticated risk management systems and Value-at-Risk (VaR) limits to control these exposures.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} FICC Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} FICC Revenue ${currentYear} - Fixed Income, Currencies & Commodities`,
    description: `Complete FICC revenue analysis for ${symbol} (${companyName}) with fixed income, currencies, commodities, and rates trading breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} FICC revenue`,
      `${symbol} fixed income trading`,
      `${symbol} FX revenue`,
      `${symbol} commodities trading`,
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

  const faqSchema = getFAQSchema(ficcFaqs)
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
            <span>{symbol} FICC Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} FICC Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Fixed income, currencies, and commodities trading revenue for {companyName}
          </p>

          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
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
            <h2 className="text-2xl font-bold mb-4">FICC Product Lines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-cyan-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Rates Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Government bonds (Treasuries, Gilts, Bunds), interest rate swaps, swaptions, and rates derivatives
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-blue-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Credit Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate bonds (IG and HY), credit default swaps (CDS), CDX/iTraxx indices, and structured credit
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-green-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Currencies (FX)</h3>
                <p className="text-sm text-muted-foreground">
                  Spot FX, FX forwards, FX options, cross-currency swaps, and emerging markets currencies
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Commodities</h3>
                <p className="text-sm text-muted-foreground">
                  Energy (oil, gas), precious metals (gold, silver), base metals (copper), and agricultural products
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-purple-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Securitized Products</h3>
                <p className="text-sm text-muted-foreground">
                  Mortgage-backed securities (MBS), asset-backed securities (ABS), and commercial mortgage-backed securities (CMBS)
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-red-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Municipal Bonds</h3>
                <p className="text-sm text-muted-foreground">
                  Tax-exempt municipal bonds, municipal credit, and public finance trading for state and local governments
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

          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, FICC revenue breakdown, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {ficcFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> FICC revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="ficc-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
