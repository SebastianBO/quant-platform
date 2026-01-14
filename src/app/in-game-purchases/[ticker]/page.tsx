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
    title: `${symbol} In-Game Purchases - Microtransaction Revenue & Monetization ${currentYear}`,
    description: `${symbol} in-game purchases analysis: microtransaction revenue, ARPU, payer conversion rate, and monetization strategy. Track ${symbol}'s gaming monetization performance.`,
    keywords: [
      `${symbol} in-game purchases`,
      `${symbol} microtransactions`,
      `${symbol} MTX revenue`,
      `${symbol} ARPU`,
      `${symbol} payer conversion`,
      `${symbol} monetization`,
    ],
    openGraph: {
      title: `${symbol} In-Game Purchases ${currentYear} | Microtransaction Revenue`,
      description: `Complete ${symbol} in-game purchase analysis with microtransaction revenue, ARPU, and monetization metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/in-game-purchases/${ticker.toLowerCase()}`,
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

export default async function InGamePurchasesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/in-game-purchases/${ticker.toLowerCase()}`
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

  // Generate in-game purchases FAQs
  const inGamePurchasesFaqs = [
    {
      question: `How much revenue does ${symbol} make from in-game purchases?`,
      answer: `${companyName} generates significant revenue from in-game purchases, including cosmetic items, battle passes, loot boxes, and virtual currency. Microtransaction revenue is reported as part of digital content or recurring revenue segments.`
    },
    {
      question: `What is ${symbol}'s average revenue per user (ARPU)?`,
      answer: `${companyName} tracks ARPU metrics to measure monetization efficiency. ARPU varies by game, platform, and region, with free-to-play titles typically reporting ARPU alongside DAU and MAU metrics.`
    },
    {
      question: `What percentage of ${symbol}'s players make in-game purchases?`,
      answer: `${companyName} may disclose payer conversion rates in investor presentations. Industry benchmarks suggest 2-5% of free-to-play users typically make purchases, with conversion varying by game genre and monetization model.`
    },
    {
      question: `Is ${symbol}'s microtransaction revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, with recurring microtransaction revenue representing an increasing portion of total gaming revenue.`
        : `${symbol}'s microtransaction revenue trends reflect player engagement, content cadence, and monetization strategy effectiveness.`
    },
    {
      question: `What types of in-game purchases does ${symbol} offer?`,
      answer: `${companyName} offers various monetization options including cosmetic skins, character unlocks, battle passes, season passes, loot boxes, virtual currency, and premium content. The mix varies by title and platform.`
    },
    {
      question: `How does ${symbol} balance monetization with player experience?`,
      answer: `${companyName} designs monetization systems to balance revenue generation with player satisfaction. The company avoids pay-to-win mechanics in favor of cosmetic and convenience items to maintain competitive integrity.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} In-Game Purchases`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} In-Game Purchases ${currentYear} - Microtransaction Revenue Analysis`,
    description: `Complete in-game purchase analysis for ${symbol} (${companyName}) with microtransaction revenue, ARPU, and monetization data.`,
    url: pageUrl,
    keywords: [
      `${symbol} in-game purchases`,
      `${symbol} microtransactions`,
      `${symbol} MTX revenue`,
      `${symbol} monetization`,
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

  const faqSchema = getFAQSchema(inGamePurchasesFaqs)

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
            <span>{symbol} In-Game Purchases</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} In-Game Purchases {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Microtransaction revenue and monetization data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
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

          {/* In-Game Purchases Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monetization Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} generates recurring revenue through in-game purchases, including cosmetic items,
                battle passes, virtual currency, and premium content. This high-margin revenue stream provides
                ongoing monetization beyond initial game sales and drives long-term player engagement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Type</p>
                  <p className="font-bold">Recurring</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margin Profile</p>
                  <p className="font-bold">High Margin</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Model</p>
                  <p className="font-bold">Live Services</p>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Monetization Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, ARPU metrics, and monetization strategy insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/live-services/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Live Services Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {inGamePurchasesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> In-game purchase data is based on publicly filed financial reports and management disclosures. Microtransaction revenue may be reported under various segment names. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="in-game-purchases" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
