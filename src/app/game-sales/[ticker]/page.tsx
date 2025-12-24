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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Game Sales - Unit Sales & Revenue Data ${currentYear}`,
    description: `${symbol} game sales analysis: unit sales by title, revenue breakdown, sell-through rates, and platform distribution. Track ${symbol}'s gaming portfolio performance.`,
    keywords: [
      `${symbol} game sales`,
      `${symbol} unit sales`,
      `${symbol} video game revenue`,
      `${symbol} game titles`,
      `${symbol} sell-through rate`,
      `${symbol} gaming revenue`,
    ],
    openGraph: {
      title: `${symbol} Game Sales ${currentYear} | Unit Sales & Revenue`,
      description: `Complete ${symbol} game sales analysis with unit sales, revenue breakdown, and platform distribution.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/game-sales/${ticker.toLowerCase()}`,
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

export default async function GameSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/game-sales/${ticker.toLowerCase()}`
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

  // Generate game sales FAQs
  const gameSalesFaqs = [
    {
      question: `What are ${symbol}'s game sales?`,
      answer: `${companyName} generates significant revenue from video game sales across multiple platforms. The company's gaming division reported ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`} in total revenue for ${latestPeriod}.`
    },
    {
      question: `How many games has ${symbol} sold?`,
      answer: `${companyName} regularly publishes game sales figures in their earnings reports. Major titles often sell millions of units across console, PC, and mobile platforms. Check the quarterly reports for specific title performance.`
    },
    {
      question: `What are ${symbol}'s best-selling games?`,
      answer: `${companyName}'s gaming portfolio includes several blockbuster franchises. The company tracks unit sales and revenue by title, with flagship releases often driving significant quarterly performance.`
    },
    {
      question: `Is ${symbol}'s game revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s gaming revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, driven by new releases and strong catalog sales.`
        : `${symbol}'s gaming revenue trends are visible in quarterly earnings reports, influenced by release schedules and market conditions.`
    },
    {
      question: `How does ${symbol} monetize games?`,
      answer: `${companyName} generates gaming revenue through multiple channels: full game sales, downloadable content, in-game purchases, and recurring subscriptions. The revenue mix varies by title and platform.`
    },
    {
      question: `What platforms does ${symbol} sell games on?`,
      answer: `${companyName} distributes games across major platforms including PlayStation, Xbox, Nintendo Switch, PC (Steam, Epic), and mobile platforms. Platform revenue breakdown is available in segment reporting.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Game Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Game Sales ${currentYear} - Unit Sales & Revenue Analysis`,
    description: `Complete game sales analysis for ${symbol} (${companyName}) with unit sales, revenue breakdown, and platform distribution.`,
    url: pageUrl,
    keywords: [
      `${symbol} game sales`,
      `${symbol} unit sales`,
      `${symbol} video game revenue`,
      `${symbol} gaming`,
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

  const faqSchema = getFAQSchema(gameSalesFaqs)

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
            <span>{symbol} Game Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Game Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unit sales and revenue data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gaming Revenue</p>
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

          {/* Game Sales Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Game Sales Performance</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} operates in the gaming industry with a diverse portfolio of titles across multiple platforms.
                Game sales data includes physical and digital units, with revenue generated from full game sales,
                DLC, season passes, and special editions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Model</p>
                  <p className="font-bold">Multi-Platform</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Distribution</p>
                  <p className="font-bold">Digital & Physical</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Monetization</p>
                  <p className="font-bold">Multi-Channel</p>
                </div>
              </div>
            </div>
          </section>

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Gaming Revenue</h2>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Gaming Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, unit sales data, and AI-powered gaming insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {gameSalesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Game sales data is based on publicly filed financial reports and company disclosures. Unit sales figures may vary by reporting period and platform. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="game-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
