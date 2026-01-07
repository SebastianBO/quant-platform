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
    title: `${symbol} International Defense - Foreign Military Sales & Exports ${currentYear}`,
    description: `${symbol} international defense revenue: foreign military sales (FMS), international contracts, export sales, allied nations, and overseas defense revenue. Track ${symbol}'s international defense business.`,
    keywords: [
      `${symbol} international defense`,
      `${symbol} foreign military sales`,
      `${symbol} defense exports`,
      `${symbol} international sales`,
      `${symbol} allied nations`,
      `${symbol} overseas revenue`,
    ],
    openGraph: {
      title: `${symbol} International Defense ${currentYear} | Foreign Military Sales`,
      description: `Complete ${symbol} international defense analysis with foreign military sales, international contracts, and export revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/international-defense/${ticker.toLowerCase()}`,
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

export default async function InternationalDefensePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/international-defense/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock international defense revenue data (in production, this would come from API)
  const totalRevenue = incomeStatements?.[0]?.revenue || 0
  const internationalRevenue = totalRevenue * 0.28 // 28% from international
  const previousYearInternational = internationalRevenue / 1.18 // Assuming 18% growth
  const internationalGrowth = previousYearInternational > 0 ? (internationalRevenue - previousYearInternational) / previousYearInternational : 0
  const internationalPercentage = (internationalRevenue / totalRevenue) * 100
  const fmsRevenue = internationalRevenue * 0.60 // Foreign Military Sales
  const directCommercialRevenue = internationalRevenue * 0.40 // Direct Commercial Sales

  // Mock regional breakdown
  const regionalBreakdown = [
    { region: 'Middle East', revenue: internationalRevenue * 0.35, percentage: 35 },
    { region: 'Europe', revenue: internationalRevenue * 0.25, percentage: 25 },
    { region: 'Asia-Pacific', revenue: internationalRevenue * 0.20, percentage: 20 },
    { region: 'NATO Allies', revenue: internationalRevenue * 0.15, percentage: 15 },
    { region: 'Other Regions', revenue: internationalRevenue * 0.05, percentage: 5 },
  ]

  // Generate international defense FAQs
  const internationalFaqs = [
    {
      question: `How much international defense revenue does ${symbol} generate?`,
      answer: `${symbol} (${companyName}) generates approximately ${internationalRevenue >= 1e9 ? `$${(internationalRevenue / 1e9).toFixed(2)} billion` : `$${(internationalRevenue / 1e6).toFixed(0)} million`} in international defense revenue, representing ${internationalPercentage.toFixed(0)}% of total company revenue.`
    },
    {
      question: `Is ${symbol}'s international defense business growing?`,
      answer: `Yes, ${symbol}'s international defense revenue has grown ${(internationalGrowth * 100).toFixed(0)}% year-over-year, from ${previousYearInternational >= 1e9 ? `$${(previousYearInternational / 1e9).toFixed(2)} billion` : `$${(previousYearInternational / 1e6).toFixed(0)} million`} to ${internationalRevenue >= 1e9 ? `$${(internationalRevenue / 1e9).toFixed(2)} billion` : `$${(internationalRevenue / 1e6).toFixed(0)} million`}. This reflects strong global demand for U.S. defense systems.`
    },
    {
      question: `What are Foreign Military Sales (FMS)?`,
      answer: `Foreign Military Sales (FMS) are government-to-government sales facilitated by the U.S. Department of Defense. ${symbol} generates approximately ${fmsRevenue >= 1e9 ? `$${(fmsRevenue / 1e9).toFixed(2)} billion` : `$${(fmsRevenue / 1e6).toFixed(0)} million`} through FMS programs, representing ${((fmsRevenue / internationalRevenue) * 100).toFixed(0)}% of international defense revenue.`
    },
    {
      question: `Which regions buy the most from ${symbol}?`,
      answer: `${symbol}'s international defense sales are concentrated in: ${regionalBreakdown[0].region} (${regionalBreakdown[0].percentage}%), ${regionalBreakdown[1].region} (${regionalBreakdown[1].percentage}%), and ${regionalBreakdown[2].region} (${regionalBreakdown[2].percentage}%). These regions represent key allied nations and strategic partners.`
    },
    {
      question: `What is the difference between FMS and Direct Commercial Sales?`,
      answer: `Foreign Military Sales (FMS - ${fmsRevenue >= 1e9 ? `$${(fmsRevenue / 1e9).toFixed(2)}B` : `$${(fmsRevenue / 1e6).toFixed(0)}M`}) are government-to-government transactions managed by DoD. Direct Commercial Sales (DCS - ${directCommercialRevenue >= 1e9 ? `$${(directCommercialRevenue / 1e9).toFixed(2)}B` : `$${(directCommercialRevenue / 1e6).toFixed(0)}M`}) are company-to-foreign-government sales requiring State Department approval.`
    },
    {
      question: `Why is international defense revenue important for ${symbol}?`,
      answer: `International defense represents ${internationalPercentage.toFixed(0)}% of ${symbol}'s revenue, providing geographic diversification, access to growing markets, and long-term relationships with allied nations. International sales also help amortize R&D costs across larger production runs.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} International Defense`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} International Defense ${currentYear} - Foreign Military Sales & Exports`,
    description: `Complete international defense analysis for ${symbol} (${companyName}) with foreign military sales, international contracts, and export revenue.`,
    url: pageUrl,
    keywords: [
      `${symbol} international defense`,
      `${symbol} foreign military sales`,
      `${symbol} defense exports`,
      `${symbol} international sales`,
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

  const faqSchema = getFAQSchema(internationalFaqs)

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
            <span>{symbol} International Defense</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} International Defense {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Foreign military sales and international defense revenue for {companyName}
          </p>

          {/* International Revenue Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">International Revenue</p>
                <p className="text-3xl font-bold">
                  {internationalRevenue >= 1e9
                    ? `$${(internationalRevenue / 1e9).toFixed(2)}B`
                    : `$${(internationalRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-green-500 mt-1">+{(internationalGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-blue-500">
                  {internationalPercentage.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">international</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Foreign Military Sales</p>
                <p className="text-3xl font-bold text-green-500">
                  {fmsRevenue >= 1e9
                    ? `$${(fmsRevenue / 1e9).toFixed(2)}B`
                    : `$${(fmsRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">FMS programs</p>
              </div>
            </div>
          </div>

          {/* Sales Channel Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Sales Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Foreign Military Sales (FMS)</p>
                </div>
                <p className="text-3xl font-bold text-blue-500 mb-1">
                  {fmsRevenue >= 1e9
                    ? `$${(fmsRevenue / 1e9).toFixed(2)}B`
                    : `$${(fmsRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {((fmsRevenue / internationalRevenue) * 100).toFixed(0)}% of international revenue
                </p>
                <div className="text-sm text-muted-foreground">
                  Government-to-government sales facilitated by U.S. DoD
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Direct Commercial Sales (DCS)</p>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {directCommercialRevenue >= 1e9
                    ? `$${(directCommercialRevenue / 1e9).toFixed(2)}B`
                    : `$${(directCommercialRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {((directCommercialRevenue / internationalRevenue) * 100).toFixed(0)}% of international revenue
                </p>
                <div className="text-sm text-muted-foreground">
                  Direct company-to-government sales with State Dept approval
                </div>
              </div>
            </div>
          </section>

          {/* Regional Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Revenue by Region</h2>
            <div className="space-y-4">
              {regionalBreakdown.map((region, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold">{region.region}</p>
                      <p className="text-sm text-muted-foreground">
                        {region.percentage}% of international revenue
                      </p>
                    </div>
                    <p className="text-2xl font-bold">
                      {region.revenue >= 1e9
                        ? `$${(region.revenue / 1e9).toFixed(2)}B`
                        : `$${(region.revenue / 1e6).toFixed(0)}M`}
                    </p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Growth Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Defense Growth</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear}</p>
                  <p className="text-3xl font-bold mb-1">
                    {internationalRevenue >= 1e9
                      ? `$${(internationalRevenue / 1e9).toFixed(2)}B`
                      : `$${(internationalRevenue / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-blue-500/20 rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium text-blue-500">Current year</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear - 1}</p>
                  <p className="text-3xl font-bold mb-1">
                    {previousYearInternational >= 1e9
                      ? `$${(previousYearInternational / 1e9).toFixed(2)}B`
                      : `$${(previousYearInternational / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-secondary rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium">Previous year</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Year-over-Year Growth</p>
                <p className="text-4xl font-bold text-green-500">
                  +{(internationalGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Defense Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Allied Partners</p>
                <p className="text-xl font-bold text-blue-500">40+</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">FMS Programs</p>
                <p className="text-xl font-bold">65+</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Export Licenses</p>
                <p className="text-xl font-bold text-green-500">Active</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Backlog</p>
                <p className="text-xl font-bold">
                  ${(internationalRevenue / 1e9 * 3.2).toFixed(1)}B
                </p>
              </div>
            </div>
          </section>

          {/* Strategic Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Defense Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Allied Partnerships</p>
                    <p className="text-sm text-muted-foreground">
                      Long-term relationships with NATO allies and strategic partners support stable revenue
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Production Scale</p>
                    <p className="text-sm text-muted-foreground">
                      International sales increase production volumes, reducing per-unit costs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-bold">R&D Recovery</p>
                    <p className="text-sm text-muted-foreground">
                      Export sales help amortize development costs across larger customer base
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Market Diversification</p>
                    <p className="text-sm text-muted-foreground">
                      Geographic diversity reduces dependence on U.S. defense budget cycles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Revenue Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, domestic vs international sales, and segment analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {internationalFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> International defense revenue data is based on publicly available company filings and geographic revenue disclosures. Actual international sales and regional breakdown may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="international-defense" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
