import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Occupancy Rate ${currentYear} - Hotel Occupancy Analysis`,
    description: `${symbol} occupancy rate analysis: current occupancy trends, demand patterns, seasonal variations, and market share performance for hotel investors.`,
    keywords: [
      `${symbol} occupancy rate`,
      `${symbol} hotel occupancy`,
      `${symbol} room occupancy`,
      `${symbol} demand trends`,
      `${symbol} occupancy growth`,
      `${symbol} hotel demand`,
      `${symbol} booking rates`,
    ],
    openGraph: {
      title: `${symbol} Occupancy Rate - Hotel Occupancy Analysis`,
      description: `Complete ${symbol} occupancy analysis with demand trends and market insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/occupancy/${ticker.toLowerCase()}`,
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

export default async function OccupancyPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/occupancy/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Occupancy metrics would come from API - using placeholders
  const occupancy = metrics?.occupancy || null
  const occupancyChange = metrics?.occupancy_change || null
  const industryAvgOccupancy = 66 // Industry average placeholder (%)

  const hasOccupancy = occupancy && occupancy > 0

  const occupancyFaqs = [
    {
      question: `What is ${symbol} occupancy rate?`,
      answer: hasOccupancy
        ? `${symbol} (${companyName}) has an occupancy rate of ${occupancy.toFixed(1)}%. Occupancy rate measures the percentage of available rooms that are occupied. It's calculated as: (Rooms Sold ÷ Rooms Available) × 100. This is a key indicator of demand and market share in the hospitality industry.`
        : `${symbol} (${companyName}) occupancy data is currently unavailable. Occupancy rate is a critical demand metric for hotel and lodging companies.`
    },
    {
      question: `What is a good occupancy rate for hotels?`,
      answer: `Hotel occupancy varies by segment and market. Industry averages: luxury hotels 65-75%, upscale hotels 70-80%, midscale 65-75%, economy 60-70%. Seasonal variations are significant. ${hasOccupancy ? `${symbol}'s occupancy of ${occupancy.toFixed(1)}% should be evaluated within its market context and seasonal patterns.` : `Compare occupancy to segment benchmarks and historical trends.`}`
    },
    {
      question: `How is occupancy rate calculated?`,
      answer: `Occupancy rate = (Number of Rooms Sold ÷ Total Available Rooms) × 100. For example, if a hotel sells 280 rooms out of 400 available, occupancy = (280 ÷ 400) × 100 = 70%. Unlike ADR, occupancy can be increased by lowering prices, so it must be analyzed alongside ADR and RevPAR.`
    },
    {
      question: `Is ${symbol} occupancy trending up or down?`,
      answer: occupancyChange
        ? `${symbol} occupancy is ${occupancyChange > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(occupancyChange).toFixed(1)} percentage points year-over-year. Rising occupancy indicates growing demand and market share gains, while declining occupancy may signal increased competition or market weakness.`
        : `Occupancy trends for ${symbol} will be updated from quarterly earnings. Monitor occupancy changes alongside ADR to understand revenue strategy (volume vs. pricing).`
    },
    {
      question: `What drives hotel occupancy rates?`,
      answer: `Occupancy is influenced by: (1) Economic conditions and business/leisure travel demand, (2) Competitive supply in the market, (3) Location and accessibility, (4) Seasonality and events, (5) Brand reputation and distribution channels, (6) Pricing strategy and revenue management. ${symbol}'s occupancy reflects these market dynamics.`
    },
    {
      question: `Why is occupancy important for investors?`,
      answer: `Occupancy measures demand strength and market share. While high occupancy is positive, it must be balanced with ADR—hotels can achieve high occupancy by discounting rates. The optimal strategy maximizes RevPAR (ADR × Occupancy). ${symbol} investors should analyze occupancy trends with ADR to assess revenue management effectiveness.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Occupancy Rate', url: `${SITE_URL}/learn/occupancy` },
      { name: `${symbol} Occupancy`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Occupancy Rate ${currentYear} - Hotel Occupancy Analysis`,
      description: `Complete occupancy analysis for ${symbol} including demand trends and market comparison.`,
      url: pageUrl,
      keywords: [`${symbol} occupancy rate`, `${symbol} hotel occupancy`, `${symbol} demand`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(occupancyFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>{symbol} Occupancy</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Occupancy Rate {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Hotel Occupancy Analysis</p>

          {/* Occupancy Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-purple-500/10 border-purple-500/30">
            {hasOccupancy ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Occupancy Rate</p>
                  <p className="text-4xl font-bold">{occupancy.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
                {occupancyChange !== null && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Change</p>
                    <p className={`text-3xl font-bold ${occupancyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {occupancyChange > 0 ? '+' : ''}{occupancyChange.toFixed(1)}pp
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Industry Avg</p>
                  <p className="text-3xl font-bold">{industryAvgOccupancy.toFixed(1)}%</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} Occupancy Data Not Available</p>
                <p className="text-muted-foreground">Occupancy metrics will be displayed when available from earnings reports.</p>
              </div>
            )}
          </div>

          {/* What is Occupancy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Occupancy Rate?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Occupancy rate measures the percentage of available rooms that are occupied. It's a fundamental demand metric that indicates market strength and competitive positioning.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, occupancy reveals:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Demand strength and market share</li>
                <li>Competitive positioning in key markets</li>
                <li>Effectiveness of distribution and marketing</li>
                <li>Balance between volume and pricing strategy</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Hotel Metrics</h2>
            <p className="text-muted-foreground mb-6">RevPAR, ADR, room count, and comprehensive hospitality analysis</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/revpar/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                RevPAR Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {occupancyFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Hotel Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['MAR', 'HLT', 'H', 'IHG', 'WYNN', 'LVS', 'MGM', 'HST']
                .filter(s => s !== symbol)
                .slice(0, 8)
                .map(stock => (
                  <Link key={stock} href={`/occupancy/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Occupancy
                  </Link>
                ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
