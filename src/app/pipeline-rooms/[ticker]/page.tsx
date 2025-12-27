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
    title: `${symbol} Pipeline Rooms ${currentYear} - Development Pipeline Analysis`,
    description: `${symbol} pipeline rooms analysis: under construction, approved projects, future growth, geographic expansion, and development strategy for hotel investors.`,
    keywords: [
      `${symbol} pipeline rooms`,
      `${symbol} development pipeline`,
      `${symbol} future growth`,
      `${symbol} under construction`,
      `${symbol} new hotels`,
      `${symbol} expansion plans`,
      `${symbol} pipeline growth`,
    ],
    openGraph: {
      title: `${symbol} Pipeline Rooms - Development Pipeline Analysis`,
      description: `Complete ${symbol} pipeline analysis with future growth and expansion insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/pipeline-rooms/${ticker.toLowerCase()}`,
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

export default async function PipelineRoomsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/pipeline-rooms/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Pipeline metrics would come from API - using placeholders
  const pipelineRooms = metrics?.pipeline_rooms || null
  const pipelineGrowth = metrics?.pipeline_growth || null
  const underConstruction = metrics?.under_construction || null
  const currentRooms = metrics?.room_count || null

  const hasPipeline = pipelineRooms && pipelineRooms > 0
  const pipelineRatio = hasPipeline && currentRooms ? (pipelineRooms / currentRooms) * 100 : null

  const pipelineFaqs = [
    {
      question: `How many rooms does ${symbol} have in its pipeline?`,
      answer: hasPipeline
        ? `${symbol} (${companyName}) has ${pipelineRooms.toLocaleString()} rooms in its development pipeline${currentRooms ? `, representing ${pipelineRatio?.toFixed(1)}% of its current room count` : ''}. Pipeline rooms include properties under construction, approved for development, and signed but not yet started. This forward-looking metric indicates future growth potential.`
        : `${symbol} (${companyName}) pipeline data is currently unavailable. Pipeline rooms are a critical leading indicator of future revenue growth and market expansion.`
    },
    {
      question: `What is a strong pipeline-to-rooms ratio?`,
      answer: `A healthy pipeline ratio varies by growth stage and business model. Fast-growing franchisors target 15-25%+ pipeline-to-rooms ratios, established players 8-15%, mature companies 5-8%. ${pipelineRatio ? `${symbol}'s pipeline ratio of ${pipelineRatio.toFixed(1)}% indicates ${pipelineRatio > 15 ? 'aggressive' : pipelineRatio > 8 ? 'healthy' : 'moderate'} growth momentum.` : `Higher ratios signal stronger future growth but require execution.`}`
    },
    {
      question: `How long does it take pipeline rooms to open?`,
      answer: `Hotel development timelines vary: under construction properties open in 12-24 months, approved projects in 24-36 months, signed agreements in 36-48+ months. Conversions are faster (6-12 months), ground-up construction slower (24-36 months). ${symbol}'s pipeline mix and execution track record determine revenue timing.`
    },
    {
      question: `Is ${symbol} pipeline growing?`,
      answer: pipelineGrowth
        ? `${symbol} pipeline is ${pipelineGrowth > 0 ? 'growing' : 'shrinking'} at ${Math.abs(pipelineGrowth).toFixed(1)}% year-over-year. Strong pipeline growth (10%+ for franchisors, 5%+ for owners) indicates robust demand for brands and successful development activity. Pipeline growth often leads room count growth by 2-3 years.`
        : `Pipeline growth data for ${symbol} will be updated from quarterly reports. Consistent pipeline expansion signals sustained future growth and brand demand.`
    },
    {
      question: `What drives hotel development pipelines?`,
      answer: `Pipeline growth depends on: (1) Brand strength and recognition, (2) Developer economics and returns, (3) Franchise/management terms and support, (4) Market demand and supply dynamics, (5) Financing availability, (6) Economic conditions and travel trends. ${symbol}'s pipeline reflects brand appeal and developer confidence.`
    },
    {
      question: `Why is pipeline important for investors?`,
      answer: `Pipeline rooms are a leading indicator of: (1) Future revenue and earnings growth (2-4 years forward), (2) Brand strength and market demand, (3) Competitive positioning and market share gains, (4) Management's growth strategy execution. ${symbol} investors should track pipeline size, growth rate, geographic mix, and conversion timing.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Pipeline Rooms', url: `${SITE_URL}/learn/pipeline-rooms` },
      { name: `${symbol} Pipeline`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Pipeline Rooms ${currentYear} - Development Pipeline Analysis`,
      description: `Complete pipeline analysis for ${symbol} including future growth and development insights.`,
      url: pageUrl,
      keywords: [`${symbol} pipeline rooms`, `${symbol} development pipeline`, `${symbol} future growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(pipelineFaqs),
    getTableSchema({
      name: `${symbol} Pipeline Rooms History`,
      description: `Historical Pipeline Rooms data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Pipeline Rooms', 'Change'],
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
            <span>{symbol} Pipeline</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Pipeline Rooms {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Development Pipeline Analysis</p>

          {/* Pipeline Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-cyan-500/10 border-cyan-500/30">
            {hasPipeline ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Pipeline Rooms</p>
                  <p className="text-4xl font-bold">{pipelineRooms.toLocaleString()}</p>
                </div>
                {pipelineRatio && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Pipeline Ratio</p>
                    <p className="text-3xl font-bold">{pipelineRatio.toFixed(1)}%</p>
                  </div>
                )}
                {pipelineGrowth !== null && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${pipelineGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pipelineGrowth > 0 ? '+' : ''}{pipelineGrowth.toFixed(1)}%
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
                <p className="text-2xl font-bold mb-2">{symbol} Pipeline Data Not Available</p>
                <p className="text-muted-foreground">Pipeline metrics will be displayed when available from company reports.</p>
              </div>
            )}
          </div>

          {/* What is Pipeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Development Pipeline</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                The development pipeline represents future room inventory signed, approved, or under construction. It's the most important leading indicator of future revenue growth in the hotel industry.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, pipeline metrics reveal:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Future growth potential (2-4 years forward)</li>
                <li>Brand strength and developer demand</li>
                <li>Geographic expansion and market penetration</li>
                <li>Execution capability and conversion rates</li>
              </ul>
            </div>
          </section>

          {/* Pipeline Stages */}
          {hasPipeline && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Pipeline Stages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {underConstruction && (
                  <div className="bg-card p-5 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Under Construction</p>
                    <p className="text-2xl font-bold mb-2">{underConstruction.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Opens in 12-24 months</p>
                  </div>
                )}
                <div className="bg-card p-5 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Approved Projects</p>
                  <p className="text-2xl font-bold mb-2">-</p>
                  <p className="text-sm text-muted-foreground">Opens in 24-36 months</p>
                </div>
                <div className="bg-card p-5 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Signed Agreements</p>
                  <p className="text-2xl font-bold mb-2">-</p>
                  <p className="text-sm text-muted-foreground">Opens in 36-48+ months</p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Hotel Metrics</h2>
            <p className="text-muted-foreground mb-6">Room count, RevPAR, ADR, franchise fees, and comprehensive analysis</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/room-count/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Room Count Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pipelineFaqs.map((faq, i) => (
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
                  <Link key={stock} href={`/pipeline-rooms/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Pipeline
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
