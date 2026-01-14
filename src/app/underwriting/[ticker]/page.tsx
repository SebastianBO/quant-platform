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
    title: `${symbol} Underwriting Revenue - Equity & Debt Underwriting Fees ${currentYear}`,
    description: `${symbol} underwriting revenue analysis: total underwriting fees, equity underwriting, debt underwriting, and capital markets revenue trends.`,
    keywords: [
      `${symbol} underwriting revenue`,
      `${symbol} underwriting fees`,
      `${symbol} equity underwriting`,
      `${symbol} debt underwriting`,
      `${symbol} capital markets revenue`,
      `${symbol} IPO fees`,
    ],
    openGraph: {
      title: `${symbol} Underwriting Revenue ${currentYear} | Equity & Debt Fees`,
      description: `Complete ${symbol} underwriting revenue analysis with equity and debt underwriting fee breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/underwriting/${ticker.toLowerCase()}`,
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

export default async function UnderwritingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/underwriting/${ticker.toLowerCase()}`
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

  const underwritingFaqs = [
    {
      question: `What is ${symbol}'s underwriting revenue?`,
      answer: `${symbol} (${companyName}) generates underwriting revenue by facilitating securities issuances for corporate clients. This includes equity underwriting (IPOs and follow-on offerings) and debt underwriting (corporate bonds and structured products).`
    },
    {
      question: `How does ${symbol} make money from underwriting?`,
      answer: `${symbol} earns underwriting fees by assuming risk and helping companies issue securities. The bank purchases securities from the issuer and resells them to investors, earning a spread or fixed fee. Fees typically range from 3-7% for equity offerings and 0.5-2% for debt offerings.`
    },
    {
      question: `What is the difference between equity and debt underwriting?`,
      answer: `Equity underwriting involves helping companies raise capital by issuing stocks (IPOs or secondary offerings). Debt underwriting involves facilitating bond issuances and credit facilities. Equity underwriting typically generates higher fees but is more volatile based on market conditions.`
    },
    {
      question: `Is ${symbol}'s underwriting revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Underwriting revenue depends on IPO market activity, corporate financing needs, and overall capital markets conditions.`
        : `${symbol}'s underwriting revenue can fluctuate based on market volatility, IPO activity, and client financing needs.`
    },
    {
      question: `What drives ${symbol}'s underwriting performance?`,
      answer: `${symbol}'s underwriting revenue is driven by: IPO market volumes, equity market conditions, corporate debt issuance, interest rate environment, the bank's league table rankings, and relationships with corporate clients.`
    },
    {
      question: `How does ${symbol} rank in underwriting league tables?`,
      answer: `Underwriting league tables rank banks by total deal volume and market share. ${symbol} competes for top positions in equity and debt underwriting across various industries and geographies. Check industry reports for current league table rankings.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Underwriting`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Underwriting Revenue ${currentYear} - Equity & Debt Underwriting Fees`,
    description: `Complete underwriting revenue analysis for ${symbol} (${companyName}) with equity and debt underwriting fee breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} underwriting revenue`,
      `${symbol} equity underwriting`,
      `${symbol} debt underwriting`,
      `${symbol} IPO fees`,
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

  const faqSchema = getFAQSchema(underwritingFaqs)
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
            <span>{symbol} Underwriting Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Underwriting Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Equity and debt underwriting fees for {companyName}
          </p>

          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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
            <h2 className="text-2xl font-bold mb-4">Underwriting Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-green-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Equity Underwriting</h3>
                <p className="text-sm text-muted-foreground">
                  IPOs, follow-on offerings, secondary offerings, SPAC transactions, and equity-linked securities
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-blue-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Debt Underwriting</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate bonds, municipal bonds, asset-backed securities, structured products, and syndicated loans
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

          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, investment banking revenue, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {underwritingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Underwriting revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="underwriting" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
