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
    title: `${symbol} Room Count ${currentYear} - Total Rooms & Portfolio Size`,
    description: `${symbol} room count analysis: total rooms, portfolio growth, distribution by brand, expansion strategy, and unit economics for hotel investors.`,
    keywords: [
      `${symbol} room count`,
      `${symbol} total rooms`,
      `${symbol} hotel portfolio`,
      `${symbol} property count`,
      `${symbol} rooms growth`,
      `${symbol} hotel expansion`,
      `${symbol} portfolio size`,
    ],
    openGraph: {
      title: `${symbol} Room Count - Total Rooms & Portfolio Analysis`,
      description: `Complete ${symbol} room count analysis with growth trends and portfolio insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/room-count/${ticker.toLowerCase()}`,
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

export default async function RoomCountPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/room-count/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Room count metrics would come from API - using placeholders
  const roomCount = metrics?.room_count || null
  const roomGrowth = metrics?.room_growth || null
  const propertyCount = metrics?.property_count || null

  const hasRoomCount = roomCount && roomCount > 0

  const roomFaqs = [
    {
      question: `How many rooms does ${symbol} have?`,
      answer: hasRoomCount
        ? `${symbol} (${companyName}) operates ${roomCount.toLocaleString()} total rooms${propertyCount ? ` across ${propertyCount.toLocaleString()} properties` : ''}. Total room count is a key scale metric that impacts revenue potential, market share, and competitive positioning in the hospitality industry.`
        : `${symbol} (${companyName}) room count data is currently unavailable. Room count is a fundamental metric for assessing hotel company scale and growth.`
    },
    {
      question: `Is ${symbol} growing its room count?`,
      answer: roomGrowth
        ? `${symbol} room count is ${roomGrowth > 0 ? 'growing' : 'shrinking'} at ${Math.abs(roomGrowth).toFixed(1)}% year-over-year. Strong room growth (5-10%+ for asset-light models, 2-5% for asset-heavy) indicates successful expansion and market share gains. Growth comes from new openings, conversions, and acquisitions.`
        : `Room count growth data for ${symbol} will be updated from quarterly earnings. Track both gross openings and closures to understand net unit growth and portfolio quality.`
    },
    {
      question: `What is a good room count for hotel companies?`,
      answer: `Room count scale varies widely: global leaders operate 1M+ rooms, major players 100K-1M rooms, regional chains 10K-100K rooms, boutique operators under 10K rooms. ${hasRoomCount ? `${symbol}'s ${roomCount.toLocaleString()} rooms positions it as a ${roomCount > 500000 ? 'major global' : roomCount > 100000 ? 'significant' : 'focused'} hospitality player.` : `Scale enables operating leverage and brand recognition.`}`
    },
    {
      question: `How does ${symbol} grow room count?`,
      answer: `Hotel companies grow rooms through: (1) New construction (capital-intensive), (2) Franchise agreements (asset-light), (3) Management contracts (fee-based), (4) Conversions from independent hotels, (5) Acquisitions of competitors or portfolios. ${symbol}'s growth strategy impacts capital requirements, returns, and risk profile.`
    },
    {
      question: `What is the difference between owned and managed rooms?`,
      answer: `Owned rooms require capital investment and carry property risk but offer full revenue. Managed/franchised rooms are asset-light, generate fee income, and enable faster growth with less capital. Most modern hotel companies favor asset-light models with high franchise/managed ratios for better returns and lower risk.`
    },
    {
      question: `Why is room count important for investors?`,
      answer: `Room count determines: (1) Revenue potential (more rooms = more revenue capacity), (2) Market share and competitive scale, (3) Brand reach and recognition, (4) Operating leverage and efficiency, (5) Growth trajectory and expansion potential. ${symbol} investors should analyze room count growth, composition (owned vs. managed), and quality (ADR/RevPAR per room).`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Room Count', url: `${SITE_URL}/learn/room-count` },
      { name: `${symbol} Room Count`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Room Count ${currentYear} - Total Rooms & Portfolio Size`,
      description: `Complete room count analysis for ${symbol} including growth trends and portfolio composition.`,
      url: pageUrl,
      keywords: [`${symbol} room count`, `${symbol} total rooms`, `${symbol} hotel portfolio`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(roomFaqs),
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
            <span>{symbol} Room Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Room Count {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Total Rooms & Portfolio Analysis</p>

          {/* Room Count Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-orange-500/10 border-orange-500/30">
            {hasRoomCount ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Rooms</p>
                  <p className="text-4xl font-bold">{roomCount.toLocaleString()}</p>
                </div>
                {propertyCount && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Properties</p>
                    <p className="text-3xl font-bold">{propertyCount.toLocaleString()}</p>
                  </div>
                )}
                {roomGrowth !== null && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${roomGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {roomGrowth > 0 ? '+' : ''}{roomGrowth.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} Room Count Data Not Available</p>
                <p className="text-muted-foreground">Room count metrics will be displayed when available from company reports.</p>
              </div>
            )}
          </div>

          {/* What is Room Count */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Room Count Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Room count measures total room capacity across a hotel company's portfolio. It's the fundamental unit of scale in the hospitality industry, directly impacting revenue potential and market position.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, room count indicates:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Total revenue capacity and market scale</li>
                <li>Growth trajectory and expansion success</li>
                <li>Market share and competitive positioning</li>
                <li>Operating leverage and efficiency potential</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Hotel Metrics</h2>
            <p className="text-muted-foreground mb-6">RevPAR, ADR, occupancy, pipeline, and full hospitality analysis</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/pipeline-rooms/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Pipeline Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {roomFaqs.map((faq, i) => (
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
                  <Link key={stock} href={`/room-count/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Room Count
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
