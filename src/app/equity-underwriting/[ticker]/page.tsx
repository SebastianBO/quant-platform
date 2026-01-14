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
    title: `${symbol} Equity Underwriting Revenue - IPO & Follow-on Offering Fees ${currentYear}`,
    description: `${symbol} equity underwriting revenue analysis: IPO fees, follow-on offering revenue, secondary offering fees, and equity capital markets income.`,
    keywords: [
      `${symbol} equity underwriting`,
      `${symbol} IPO revenue`,
      `${symbol} equity capital markets`,
      `${symbol} follow-on offering fees`,
      `${symbol} secondary offering revenue`,
      `${symbol} ECM fees`,
    ],
    openGraph: {
      title: `${symbol} Equity Underwriting Revenue ${currentYear} | IPO & ECM Fees`,
      description: `Complete ${symbol} equity underwriting revenue analysis with IPO, follow-on offering, and secondary offering fee breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/equity-underwriting/${ticker.toLowerCase()}`,
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

export default async function EquityUnderwritingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/equity-underwriting/${ticker.toLowerCase()}`
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

  const equityFaqs = [
    {
      question: `What is ${symbol}'s equity underwriting revenue?`,
      answer: `${symbol} (${companyName}) generates equity underwriting revenue by facilitating stock offerings for corporate clients. This includes initial public offerings (IPOs), follow-on offerings, secondary offerings, SPAC transactions, and convertible securities. The bank earns fees typically ranging from 3% to 7% of the offering size.`
    },
    {
      question: `How does ${symbol} make money from IPOs?`,
      answer: `${symbol} earns IPO underwriting fees by helping companies go public. The bank provides services including valuation, roadshow coordination, investor marketing, price discovery, and share allocation. For a typical IPO, the underwriting syndicate charges 5-7% of the total offering, with the lead underwriter receiving the largest share of fees.`
    },
    {
      question: `What is the difference between IPOs and follow-on offerings?`,
      answer: `IPOs are when a private company first sells stock to the public. Follow-on offerings (also called secondary offerings) occur when an already-public company issues additional shares to raise capital. Follow-on offerings typically have lower fees (3-5%) than IPOs because the company is already public and there's established market interest.`
    },
    {
      question: `Is ${symbol}'s equity underwriting revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Equity underwriting revenue is highly cyclical and depends on IPO market conditions, stock market valuations, and investor appetite for new equity offerings.`
        : `Equity underwriting revenue can be volatile based on IPO market activity. The IPO market tends to slow during periods of market uncertainty or when valuations are compressed.`
    },
    {
      question: `What drives ${symbol}'s equity underwriting performance?`,
      answer: `${symbol}'s equity underwriting revenue is driven by: IPO market volumes, stock market performance and valuations, venture capital exit activity, SPAC market trends, investor appetite for new issues, the bank's ECM league table position, and relationships with corporate clients and sponsors.`
    },
    {
      question: `How does ${symbol} rank in equity underwriting league tables?`,
      answer: `Equity capital markets (ECM) league tables rank banks by total equity underwriting volume and number of deals. ${symbol} competes for top positions in IPO and follow-on offering league tables. Rankings are published by Dealogic, Bloomberg, and other data providers, typically segmented by region and industry.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Equity Underwriting`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Equity Underwriting Revenue ${currentYear} - IPO & Follow-on Offering Fees`,
    description: `Complete equity underwriting revenue analysis for ${symbol} (${companyName}) with IPO, follow-on, and secondary offering fee breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} equity underwriting`,
      `${symbol} IPO revenue`,
      `${symbol} ECM fees`,
      `${symbol} follow-on offerings`,
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

  const faqSchema = getFAQSchema(equityFaqs)
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
            <span>{symbol} Equity Underwriting</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Equity Underwriting Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            IPO, follow-on, and secondary offering fees for {companyName}
          </p>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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
            <h2 className="text-2xl font-bold mb-4">Equity Underwriting Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-green-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">IPO Underwriting</h3>
                <p className="text-sm text-muted-foreground">
                  Initial public offerings for companies going public, including traditional IPOs, direct listings, and SPAC mergers
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-emerald-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Follow-on Offerings</h3>
                <p className="text-sm text-muted-foreground">
                  Secondary offerings for already-public companies raising additional capital through new share issuances
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-blue-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Convertible Offerings</h3>
                <p className="text-sm text-muted-foreground">
                  Convertible bonds and equity-linked securities that can be converted into company stock
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-purple-500 text-2xl mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Block Trades</h3>
                <p className="text-sm text-muted-foreground">
                  Large block sales of stock by institutional investors or corporate insiders
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

          <section className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, underwriting revenue, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {equityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Equity underwriting revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="equity-underwriting" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
