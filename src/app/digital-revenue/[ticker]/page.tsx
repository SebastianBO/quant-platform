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
    title: `${symbol} Digital Revenue - Digital vs Physical Sales Mix ${currentYear}`,
    description: `${symbol} digital revenue analysis: digital vs physical sales ratio, download revenue, digital margins, and transition trends. Track ${symbol}'s digital transformation.`,
    keywords: [
      `${symbol} digital revenue`,
      `${symbol} digital sales`,
      `${symbol} download revenue`,
      `${symbol} physical vs digital`,
      `${symbol} digital ratio`,
      `${symbol} digital margin`,
    ],
    openGraph: {
      title: `${symbol} Digital Revenue ${currentYear} | Digital vs Physical Mix`,
      description: `Complete ${symbol} digital revenue analysis with digital/physical split, margin analysis, and transformation trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/digital-revenue/${ticker.toLowerCase()}`,
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

export default async function DigitalRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/digital-revenue/${ticker.toLowerCase()}`
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

  // Generate digital revenue FAQs
  const digitalRevenueFaqs = [
    {
      question: `What is ${symbol}'s digital revenue?`,
      answer: `${companyName} generates significant revenue from digital sales, including full game downloads, DLC, and digital content. The digital revenue mix has been growing as consumer preferences shift toward digital distribution.`
    },
    {
      question: `What percentage of ${symbol}'s sales are digital?`,
      answer: `${companyName} reports digital sales ratios in earnings disclosures. Digital sales typically offer higher margins than physical distribution due to lower manufacturing and logistics costs.`
    },
    {
      question: `Is ${symbol}'s digital revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, with digital sales representing an increasing portion of the revenue mix.`
        : `${symbol}'s digital revenue trends reflect industry-wide shifts toward digital distribution and changing consumer preferences.`
    },
    {
      question: `Why are digital sales more profitable for ${symbol}?`,
      answer: `Digital sales eliminate physical manufacturing, packaging, shipping, and retail distribution costs. ${companyName} retains a higher percentage of digital sales revenue, improving gross margins and profitability.`
    },
    {
      question: `How does ${symbol} distribute digital content?`,
      answer: `${companyName} distributes digital content through proprietary platforms, third-party digital stores (Steam, Epic, PlayStation Store, Xbox Store), and direct-to-consumer channels.`
    },
    {
      question: `What drives ${symbol}'s digital revenue growth?`,
      answer: `Digital revenue growth is driven by increasing digital adoption rates, day-one digital releases, convenience of downloads, digital-only promotions, and the shift away from physical retail channels.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Digital Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Digital Revenue ${currentYear} - Digital vs Physical Sales Analysis`,
    description: `Complete digital revenue analysis for ${symbol} (${companyName}) with digital/physical mix, margins, and trend data.`,
    url: pageUrl,
    keywords: [
      `${symbol} digital revenue`,
      `${symbol} digital sales`,
      `${symbol} physical vs digital`,
      `${symbol} download revenue`,
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

  const faqSchema = getFAQSchema(digitalRevenueFaqs)

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
            <span>{symbol} Digital Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Digital Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Digital vs physical sales mix for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
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

          {/* Digital Revenue Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Digital Transformation Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} is experiencing a digital transformation in its revenue model. Digital sales
                eliminate physical distribution costs, improve margins, and provide direct customer relationships.
                The company tracks digital ratios, download revenue, and digital-first strategies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Distribution</p>
                  <p className="font-bold">Digital + Physical</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margin Profile</p>
                  <p className="font-bold">Higher on Digital</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <p className="font-bold">Growing Digital Mix</p>
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
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Digital Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, margin analysis, and digital transformation insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Margin Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {digitalRevenueFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Digital revenue data is based on publicly filed financial reports and management disclosures. Digital/physical ratios may vary by platform and region. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="digital-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
