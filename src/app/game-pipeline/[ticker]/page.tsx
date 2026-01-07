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
    title: `${symbol} Game Pipeline - Upcoming Releases & Development Roadmap ${currentYear}`,
    description: `${symbol} game pipeline analysis: upcoming releases, development slate, franchise roadmap, and release dates. Track ${symbol}'s future gaming portfolio and revenue potential.`,
    keywords: [
      `${symbol} game pipeline`,
      `${symbol} upcoming games`,
      `${symbol} release schedule`,
      `${symbol} game roadmap`,
      `${symbol} development slate`,
      `${symbol} new releases`,
    ],
    openGraph: {
      title: `${symbol} Game Pipeline ${currentYear} | Upcoming Releases & Roadmap`,
      description: `Complete ${symbol} game pipeline analysis with upcoming releases, development roadmap, and franchise slate.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/game-pipeline/${ticker.toLowerCase()}`,
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

export default async function GamePipelinePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/game-pipeline/${ticker.toLowerCase()}`
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

  // Generate game pipeline FAQs
  const gamePipelineFaqs = [
    {
      question: `What games does ${symbol} have in development?`,
      answer: `${companyName} maintains a development pipeline with multiple titles across various platforms and genres. The company discloses upcoming releases in earnings calls, investor presentations, and industry events like E3 and Gamescom.`
    },
    {
      question: `When is ${symbol}'s next game release?`,
      answer: `${companyName} announces release dates for major titles through press releases, earnings calls, and gaming showcases. Release schedules are subject to change based on development progress and market conditions. Check quarterly earnings for the latest release calendar.`
    },
    {
      question: `What franchises is ${symbol} developing?`,
      answer: `${companyName} develops multiple franchises across different genres and platforms. The company balances new IP development with established franchise releases to diversify revenue and maintain market share.`
    },
    {
      question: `How strong is ${symbol}'s game pipeline?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s business is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, supported by a strong development pipeline and successful releases. A robust pipeline drives future revenue visibility.`
        : `${symbol}'s pipeline strength is evaluated based on franchise quality, development progress, market positioning, and historical release performance.`
    },
    {
      question: `How much does ${symbol} invest in game development?`,
      answer: `${companyName} reports R&D spending and development costs in financial statements. Major AAA titles can require $100M+ in development budgets, while live service games have ongoing content development costs.`
    },
    {
      question: `What is ${symbol}'s release strategy?`,
      answer: `${companyName} strategically times releases to maximize commercial success, avoiding competitive clashes and targeting optimal sales windows. The company balances fiscal year revenue needs with development readiness and market conditions.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Game Pipeline`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Game Pipeline ${currentYear} - Upcoming Releases & Development Roadmap`,
    description: `Complete game pipeline analysis for ${symbol} (${companyName}) with upcoming releases, development slate, and franchise roadmap.`,
    url: pageUrl,
    keywords: [
      `${symbol} game pipeline`,
      `${symbol} upcoming games`,
      `${symbol} release schedule`,
      `${symbol} development roadmap`,
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

  const faqSchema = getFAQSchema(gamePipelineFaqs)

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
            <span>{symbol} Game Pipeline</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Game Pipeline {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upcoming releases and development roadmap for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
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

          {/* Game Pipeline Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Development Pipeline Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} maintains a robust development pipeline with multiple titles in production across
                various platforms and genres. The pipeline represents future revenue potential, with major releases
                driving significant quarterly revenue spikes and catalog sales providing ongoing baseline revenue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Portfolio</p>
                  <p className="font-bold">Multi-Platform</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Strategy</p>
                  <p className="font-bold">Franchise + New IP</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Disclosure</p>
                  <p className="font-bold">Earnings & Events</p>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Pipeline Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete development roadmap, release calendar, and franchise analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/game-sales/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Game Sales Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {gamePipelineFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Game pipeline information is based on publicly disclosed announcements and company presentations. Release dates are subject to change. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="game-pipeline" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
