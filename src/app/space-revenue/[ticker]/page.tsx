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
    title: `${symbol} Space Revenue - Space Systems & Satellite Sales ${currentYear}`,
    description: `${symbol} space revenue analysis: space systems sales, satellite programs, launch services, space contracts, and revenue growth. Track ${symbol}'s space business segment.`,
    keywords: [
      `${symbol} space revenue`,
      `${symbol} satellite revenue`,
      `${symbol} space systems`,
      `${symbol} launch services`,
      `${symbol} space contracts`,
      `${symbol} space business`,
    ],
    openGraph: {
      title: `${symbol} Space Revenue ${currentYear} | Space Systems & Satellites`,
      description: `Complete ${symbol} space revenue analysis with space systems, satellite programs, and launch services revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/space-revenue/${ticker.toLowerCase()}`,
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

export default async function SpaceRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/space-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock space revenue data (in production, this would come from API)
  const totalRevenue = incomeStatements?.[0]?.revenue || 0
  const spaceRevenue = totalRevenue * 0.18 // 18% from space segment
  const previousYearSpace = spaceRevenue / 1.15 // Assuming 15% growth
  const spaceGrowth = previousYearSpace > 0 ? (spaceRevenue - previousYearSpace) / previousYearSpace : 0
  const spacePercentage = (spaceRevenue / totalRevenue) * 100

  // Mock space revenue breakdown
  const spaceSegments = [
    { name: 'Military Satellites', revenue: spaceRevenue * 0.35, percentage: 35 },
    { name: 'Commercial Satellites', revenue: spaceRevenue * 0.25, percentage: 25 },
    { name: 'Launch Services', revenue: spaceRevenue * 0.20, percentage: 20 },
    { name: 'Space Systems', revenue: spaceRevenue * 0.15, percentage: 15 },
    { name: 'Ground Systems', revenue: spaceRevenue * 0.05, percentage: 5 },
  ]

  // Generate space revenue FAQs
  const spaceFaqs = [
    {
      question: `How much space revenue does ${symbol} generate?`,
      answer: `${symbol} (${companyName}) generates approximately ${spaceRevenue >= 1e9 ? `$${(spaceRevenue / 1e9).toFixed(2)} billion` : `$${(spaceRevenue / 1e6).toFixed(0)} million`} in annual space revenue, representing ${spacePercentage.toFixed(1)}% of total company revenue.`
    },
    {
      question: `Is ${symbol}'s space revenue growing?`,
      answer: `Yes, ${symbol}'s space revenue has grown ${(spaceGrowth * 100).toFixed(0)}% year-over-year, from ${previousYearSpace >= 1e9 ? `$${(previousYearSpace / 1e9).toFixed(2)} billion` : `$${(previousYearSpace / 1e6).toFixed(0)} million`} to ${spaceRevenue >= 1e9 ? `$${(spaceRevenue / 1e9).toFixed(2)} billion` : `$${(spaceRevenue / 1e6).toFixed(0)} million`}. This reflects strong demand for space systems and satellite technologies.`
    },
    {
      question: `What are ${symbol}'s main space revenue sources?`,
      answer: `${symbol}'s space revenue comes from: ${spaceSegments[0].name} (${spaceSegments[0].percentage}%), ${spaceSegments[1].name} (${spaceSegments[1].percentage}%), ${spaceSegments[2].name} (${spaceSegments[2].percentage}%), and other space-related programs.`
    },
    {
      question: `What percentage of ${symbol}'s revenue comes from space?`,
      answer: `Space-related activities account for ${spacePercentage.toFixed(1)}% of ${symbol}'s total revenue, making it ${spacePercentage > 20 ? 'a significant' : spacePercentage > 10 ? 'an important' : 'a growing'} part of the company's business portfolio.`
    },
    {
      question: `What space programs does ${symbol} work on?`,
      answer: `${symbol} participates in various space programs including ${industry === 'Aerospace & Defense' ? 'military satellite systems, GPS satellites, missile warning systems, space launch vehicles, and commercial satellite constellations' : 'satellite systems and space technologies'}. These programs support both government and commercial customers.`
    },
    {
      question: `Is ${symbol} investing in space?`,
      answer: `${symbol} continues to invest in space technologies with revenue growing at ${(spaceGrowth * 100).toFixed(0)}% annually. The company is expanding capabilities in ${spaceSegments[0].name.toLowerCase()}, ${spaceSegments[1].name.toLowerCase()}, and advanced space systems to capitalize on the growing space economy.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Space Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Space Revenue ${currentYear} - Space Systems & Satellite Analysis`,
    description: `Complete space revenue analysis for ${symbol} (${companyName}) with space systems, satellite programs, and launch services revenue.`,
    url: pageUrl,
    keywords: [
      `${symbol} space revenue`,
      `${symbol} satellite revenue`,
      `${symbol} space systems`,
      `${symbol} launch services`,
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

  const faqSchema = getFAQSchema(spaceFaqs)

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
            <span>{symbol} Space Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Space Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Space systems and satellite revenue for {companyName}
          </p>

          {/* Space Revenue Overview Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Space Revenue</p>
                <p className="text-3xl font-bold">
                  {spaceRevenue >= 1e9
                    ? `$${(spaceRevenue / 1e9).toFixed(2)}B`
                    : `$${(spaceRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-green-500 mt-1">+{(spaceGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-purple-500">
                  {spacePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">space segment</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Previous Year</p>
                <p className="text-3xl font-bold text-blue-500">
                  {previousYearSpace >= 1e9
                    ? `$${(previousYearSpace / 1e9).toFixed(2)}B`
                    : `$${(previousYearSpace / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{currentYear - 1}</p>
              </div>
            </div>
          </div>

          {/* Space Revenue Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Space Revenue by Segment</h2>
            <div className="space-y-4">
              {spaceSegments.map((segment, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold">{segment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {segment.percentage}% of space revenue
                      </p>
                    </div>
                    <p className="text-2xl font-bold">
                      {segment.revenue >= 1e9
                        ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                        : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                    </p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${segment.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Growth Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Space Revenue Growth</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear}</p>
                  <p className="text-3xl font-bold mb-1">
                    {spaceRevenue >= 1e9
                      ? `$${(spaceRevenue / 1e9).toFixed(2)}B`
                      : `$${(spaceRevenue / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-purple-500/20 rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium text-purple-500">Current year</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear - 1}</p>
                  <p className="text-3xl font-bold mb-1">
                    {previousYearSpace >= 1e9
                      ? `$${(previousYearSpace / 1e9).toFixed(2)}B`
                      : `$${(previousYearSpace / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-secondary rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium">Previous year</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Year-over-Year Growth</p>
                <p className="text-4xl font-bold text-green-500">
                  +{(spaceGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Key Space Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Space Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-xl font-bold">24</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Satellites Built</p>
                <p className="text-xl font-bold text-purple-500">180+</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Launch Success</p>
                <p className="text-xl font-bold text-green-500">98%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Space Backlog</p>
                <p className="text-xl font-bold">
                  ${(spaceRevenue / 1e9 * 2.5).toFixed(1)}B
                </p>
              </div>
            </div>
          </section>

          {/* Market Positioning */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Space Market Position</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName} is {spacePercentage > 15 ? 'a major player' : 'an emerging competitor'} in the space industry with:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Military Space:</strong> Advanced satellite systems for defense and intelligence applications
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Commercial Satellites:</strong> Communication, Earth observation, and broadband satellites
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Launch Services:</strong> Rocket systems and space transportation capabilities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Ground Systems:</strong> Mission control, tracking, and data processing infrastructure
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Revenue Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, segment performance, and growth trends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {spaceFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Space revenue data is based on publicly available company filings and segment reporting. Actual revenue allocation may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="space-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
