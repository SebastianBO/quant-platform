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
    title: `${symbol} Live Services Revenue - Recurring Gaming Revenue ${currentYear}`,
    description: `${symbol} live services analysis: recurring revenue, live ops performance, content cadence, and GaaS metrics. Track ${symbol}'s games-as-a-service revenue growth.`,
    keywords: [
      `${symbol} live services`,
      `${symbol} recurring revenue`,
      `${symbol} GaaS`,
      `${symbol} live ops`,
      `${symbol} games as a service`,
      `${symbol} content updates`,
    ],
    openGraph: {
      title: `${symbol} Live Services Revenue ${currentYear} | Recurring Gaming Revenue`,
      description: `Complete ${symbol} live services analysis with recurring revenue, GaaS metrics, and live operations performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/live-services/${ticker.toLowerCase()}`,
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

export default async function LiveServicesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/live-services/${ticker.toLowerCase()}`
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

  // Generate live services FAQs
  const liveServicesFaqs = [
    {
      question: `What is ${symbol}'s live services revenue?`,
      answer: `${companyName} generates recurring revenue through live services, also known as Games-as-a-Service (GaaS). This includes ongoing content updates, seasonal events, battle passes, and live operations that keep players engaged long after initial game purchase.`
    },
    {
      question: `How much of ${symbol}'s revenue is recurring?`,
      answer: `${companyName} reports recurring revenue as a percentage of total gaming revenue. Live services provide high-margin, predictable revenue streams that are more valuable than one-time game sales. Check quarterly segment reporting for recurring revenue breakdowns.`
    },
    {
      question: `What games does ${symbol} operate as live services?`,
      answer: `${companyName} operates multiple live service titles with ongoing content updates, seasonal events, and community engagement. These games feature regular content drops, limited-time events, and evolving gameplay to maintain player interest.`
    },
    {
      question: `Is ${symbol}'s live services revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, with live services representing an increasing portion of high-margin recurring revenue.`
        : `${symbol}'s live services revenue trends depend on content cadence, player engagement, and successful live operations execution.`
    },
    {
      question: `What is ${symbol}'s live operations strategy?`,
      answer: `${companyName} employs live operations teams to manage ongoing game updates, seasonal content, community events, and player engagement initiatives. Successful live ops drive daily active users, session time, and recurring monetization.`
    },
    {
      question: `How does ${symbol} monetize live services?`,
      answer: `${companyName} monetizes live services through multiple channels: battle passes, seasonal content, cosmetic items, character unlocks, and limited-time events. This creates ongoing revenue opportunities beyond the initial game sale.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Live Services`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Live Services Revenue ${currentYear} - Recurring Gaming Revenue Analysis`,
    description: `Complete live services analysis for ${symbol} (${companyName}) with recurring revenue, GaaS metrics, and live ops performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} live services`,
      `${symbol} recurring revenue`,
      `${symbol} GaaS`,
      `${symbol} games as a service`,
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

  const faqSchema = getFAQSchema(liveServicesFaqs)

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
            <span>{symbol} Live Services</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Live Services Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Recurring gaming revenue and GaaS performance for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
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

          {/* Live Services Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Games-as-a-Service Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} operates live service games with ongoing content updates, seasonal events, and
                community engagement. This Games-as-a-Service (GaaS) model drives high-margin recurring revenue
                through battle passes, cosmetics, and live operations that extend game lifecycles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Type</p>
                  <p className="font-bold">Recurring</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Business Model</p>
                  <p className="font-bold">Games-as-a-Service</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margin Profile</p>
                  <p className="font-bold">High Margin</p>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Live Services Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete recurring revenue breakdown, live ops metrics, and GaaS performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/in-game-purchases/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                In-Game Purchases
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {liveServicesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Live services data is based on publicly filed financial reports and management disclosures. Recurring revenue may be reported under various segment names. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="live-services" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
