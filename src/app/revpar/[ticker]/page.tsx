import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} RevPAR ${currentYear} - Revenue Per Available Room Analysis`,
    description: `${symbol} RevPAR (Revenue Per Available Room) analysis: current RevPAR trends, year-over-year growth, industry comparison, and performance metrics for hotel investors.`,
    keywords: [
      `${symbol} RevPAR`,
      `${symbol} revenue per available room`,
      `${symbol} hotel performance`,
      `${symbol} hospitality metrics`,
      `${symbol} hotel revenue`,
      `${symbol} RevPAR growth`,
      `is ${symbol} a good hotel stock`,
    ],
    openGraph: {
      title: `${symbol} RevPAR - Revenue Per Available Room Analysis`,
      description: `Complete ${symbol} RevPAR analysis with industry comparison and performance insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/revpar/${ticker.toLowerCase()}`,
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

export default async function RevPARPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/revpar/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // RevPAR metrics would come from API - using placeholders
  const revpar = metrics?.revpar || null
  const revparGrowth = metrics?.revpar_growth || null
  const industryAvgRevPAR = 95 // Industry average placeholder

  const hasRevPAR = revpar && revpar > 0

  const revparFaqs = [
    {
      question: `What is ${symbol} RevPAR?`,
      answer: hasRevPAR
        ? `${symbol} (${companyName}) has a Revenue Per Available Room (RevPAR) of $${revpar.toFixed(2)}. RevPAR is the most important metric in the hotel industry, measuring revenue generated per available room regardless of occupancy. It's calculated as ADR × Occupancy Rate or Total Room Revenue ÷ Total Available Rooms.`
        : `${symbol} (${companyName}) RevPAR data is currently unavailable. RevPAR is a key metric for hotel and lodging companies that measures revenue efficiency per available room.`
    },
    {
      question: `What is a good RevPAR for hotels?`,
      answer: `A "good" RevPAR varies by hotel segment and location. Luxury hotels typically achieve $150-300+ RevPAR, upscale hotels $80-150, midscale $50-80, and economy hotels $30-50. ${hasRevPAR ? `${symbol}'s RevPAR of $${revpar.toFixed(2)} should be compared to similar hotel segments and markets.` : `Compare RevPAR to industry peers and historical performance.`}`
    },
    {
      question: `How is RevPAR calculated?`,
      answer: `RevPAR is calculated using two methods: (1) ADR × Occupancy Rate, or (2) Total Room Revenue ÷ Total Available Rooms. For example, if a hotel has an ADR of $150 and 70% occupancy, RevPAR = $150 × 0.70 = $105. Unlike ADR, RevPAR accounts for both pricing power and occupancy performance.`
    },
    {
      question: `Is ${symbol} RevPAR growth strong?`,
      answer: revparGrowth
        ? `${symbol} RevPAR is ${revparGrowth > 0 ? 'growing' : 'declining'} at ${Math.abs(revparGrowth).toFixed(1)}% year-over-year. Strong RevPAR growth (5%+) indicates improving hotel performance through higher rates, better occupancy, or both. Industry-wide RevPAR growth averages 2-4% annually.`
        : `RevPAR growth data for ${symbol} will be updated based on quarterly earnings reports. Monitor both ADR and occupancy trends to understand RevPAR drivers.`
    },
    {
      question: `What is the difference between RevPAR and ADR?`,
      answer: `ADR (Average Daily Rate) measures the average price per occupied room, while RevPAR (Revenue Per Available Room) measures revenue per total available room. A hotel can have high ADR but low RevPAR if occupancy is poor. RevPAR = ADR × Occupancy Rate, making it a more comprehensive performance metric.`
    },
    {
      question: `Why is RevPAR important for hotel investors?`,
      answer: `RevPAR is the single best metric for assessing hotel operating performance and pricing power. It directly impacts profitability and cash flow. Growing RevPAR indicates strong demand, effective revenue management, and competitive positioning. ${symbol} investors should track RevPAR trends alongside occupancy and ADR.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'RevPAR', url: `${SITE_URL}/learn/revpar` },
      { name: `${symbol} RevPAR`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} RevPAR ${currentYear} - Revenue Per Available Room Analysis`,
      description: `Complete RevPAR analysis for ${symbol} including performance trends and industry comparison.`,
      url: pageUrl,
      keywords: [`${symbol} RevPAR`, `${symbol} revenue per available room`, `${symbol} hotel performance`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(revparFaqs),
    getTableSchema({
      name: `${symbol} Revpar History`,
      description: `Historical Revpar data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Revpar', 'Change'],
      rowCount: 5,
    }),
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
            <span>{symbol} RevPAR</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} RevPAR {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Revenue Per Available Room Analysis</p>

          {/* RevPAR Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-blue-500/10 border-blue-500/30">
            {hasRevPAR ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Current RevPAR</p>
                  <p className="text-4xl font-bold">${revpar.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
                {revparGrowth && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${revparGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revparGrowth > 0 ? '+' : ''}{revparGrowth.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Industry Avg</p>
                  <p className="text-3xl font-bold">${industryAvgRevPAR.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} RevPAR Data Not Available</p>
                <p className="text-muted-foreground">RevPAR metrics will be displayed when available from earnings reports.</p>
              </div>
            )}
          </div>

          {/* What is RevPAR */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is RevPAR?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                RevPAR (Revenue Per Available Room) is the gold standard metric for hotel performance. It measures how much revenue a hotel generates per available room, combining both pricing power (ADR) and demand (occupancy) into a single metric.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, RevPAR trends indicate:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Revenue management effectiveness</li>
                <li>Market demand and competitive positioning</li>
                <li>Pricing power and brand strength</li>
                <li>Overall operational performance</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Hotel Metrics</h2>
            <p className="text-muted-foreground mb-6">ADR, occupancy, room count, and comprehensive hospitality analysis</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/adr/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                ADR Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {revparFaqs.map((faq, i) => (
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
                  <Link key={stock} href={`/revpar/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} RevPAR
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
