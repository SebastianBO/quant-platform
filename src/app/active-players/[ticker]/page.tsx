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
    title: `${symbol} Active Players - MAU, DAU & Player Engagement ${currentYear}`,
    description: `${symbol} active player analysis: MAU, DAU, player engagement metrics, retention rates, and user growth. Track ${symbol}'s gaming community size and activity.`,
    keywords: [
      `${symbol} active players`,
      `${symbol} MAU`,
      `${symbol} DAU`,
      `${symbol} player count`,
      `${symbol} user engagement`,
      `${symbol} retention rate`,
    ],
    openGraph: {
      title: `${symbol} Active Players ${currentYear} | MAU, DAU & Engagement`,
      description: `Complete ${symbol} active player analysis with MAU, DAU, engagement metrics, and user growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/active-players/${ticker.toLowerCase()}`,
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

export default async function ActivePlayersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/active-players/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate latest revenue
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate active players FAQs
  const activePlayersFaqs = [
    {
      question: `How many active players does ${symbol} have?`,
      answer: `${companyName} reports active player metrics in quarterly earnings, including Monthly Active Users (MAU) and Daily Active Users (DAU). These metrics measure the size and engagement of the gaming community across all platforms and titles.`
    },
    {
      question: `What is ${symbol}'s MAU (Monthly Active Users)?`,
      answer: `${companyName} tracks Monthly Active Users (MAU) as a key engagement metric. MAU represents the number of unique users who engage with the platform or games within a 30-day period. Check quarterly reports for the latest MAU figures.`
    },
    {
      question: `What is ${symbol}'s DAU (Daily Active Users)?`,
      answer: `Daily Active Users (DAU) measures the number of unique users engaging daily. ${companyName} may report DAU for specific titles or platforms. The DAU/MAU ratio indicates player stickiness and engagement frequency.`
    },
    {
      question: `Is ${symbol}'s player base growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s overall business is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, typically correlated with user base expansion and increased engagement across gaming platforms.`
        : `${symbol}'s player growth trends are disclosed in quarterly earnings. User acquisition, retention, and re-engagement campaigns drive player base expansion.`
    },
    {
      question: `How does ${symbol} measure player engagement?`,
      answer: `${companyName} tracks multiple engagement metrics including MAU, DAU, session length, session frequency, retention cohorts, and player lifetime value (LTV). These metrics help optimize game design and monetization.`
    },
    {
      question: `What is ${symbol}'s player retention rate?`,
      answer: `${companyName} monitors retention rates including Day 1, Day 7, and Day 30 retention. Strong retention indicates engaging gameplay and effective live operations. Retention data may be disclosed in investor presentations or earnings calls.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Active Players`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Active Players ${currentYear} - MAU, DAU & Engagement Analysis`,
    description: `Complete active player analysis for ${symbol} (${companyName}) with MAU, DAU, engagement metrics, and user growth data.`,
    url: pageUrl,
    keywords: [
      `${symbol} active players`,
      `${symbol} MAU`,
      `${symbol} DAU`,
      `${symbol} player engagement`,
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

  const faqSchema = getFAQSchema(activePlayersFaqs)

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
            <span>{symbol} Active Players</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Active Players {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            MAU, DAU, and player engagement data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
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

          {/* Active Players Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Player Engagement Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} measures gaming community health through active player metrics including Monthly Active
                Users (MAU), Daily Active Users (DAU), and engagement rates. These KPIs drive revenue opportunities
                through increased monetization and longer player lifetime value.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Key Metrics</p>
                  <p className="font-bold">MAU / DAU</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Importance</p>
                  <p className="font-bold">Revenue Driver</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                  <p className="font-bold">Quarterly Reporting</p>
                </div>
              </div>
            </div>
          </section>

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue Performance</h2>
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Player Analytics</h2>
            <p className="text-muted-foreground mb-6">
              View complete engagement metrics, user growth trends, and retention analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/arpu/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                ARPU Metrics
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {activePlayersFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Active player data is based on publicly filed financial reports and company disclosures. MAU and DAU definitions may vary by company. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="active-players" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
