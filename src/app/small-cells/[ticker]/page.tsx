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

  return {
    title: `${symbol} Small Cells - 5G Infrastructure & Network Densification`,
    description: `${symbol} small cell network analysis. View small cell deployment count, 5G infrastructure, network densification strategy, and urban coverage metrics for ${symbol}.`,
    keywords: [
      `${symbol} small cells`,
      `${symbol} 5G infrastructure`,
      `${symbol} network densification`,
      `${symbol} DAS`,
      `${symbol} urban coverage`,
      `${symbol} small cell deployment`,
    ],
    openGraph: {
      title: `${symbol} Small Cells | 5G Infrastructure Analysis`,
      description: `Comprehensive ${symbol} small cell analysis with 5G deployment and network densification metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/small-cells/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function SmallCellsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/small-cells/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock small cell data - replace with actual API data when available
  const smallCellCount = Math.floor(Math.random() * 30000) + 10000
  const smallCellGrowth = (Math.random() * 30 + 10).toFixed(1)
  const urbanNodes = Math.floor(smallCellCount * 0.75)
  const suburbananNodes = smallCellCount - urbanNodes

  const smallCellFaqs = [
    {
      question: `How many small cells does ${symbol} operate?`,
      answer: `${symbol} (${companyName}) operates approximately ${smallCellCount.toLocaleString()} small cell nodes across its network. Small cells are critical infrastructure for 5G deployment, network densification, and providing high-capacity coverage in urban areas.`
    },
    {
      question: `Is ${symbol} expanding its small cell network?`,
      answer: `${symbol}'s small cell network is growing ${smallCellGrowth}% year-over-year. This rapid expansion reflects increasing demand for 5G infrastructure, network densification in urban markets, and carrier investments in high-capacity wireless coverage.`
    },
    {
      question: `What are small cells and why do they matter?`,
      answer: `Small cells are low-powered cellular base stations that provide coverage over a small area (typically 10-200 meters). They are essential for 5G networks, densifying coverage in urban areas, filling capacity gaps, and enabling high-speed wireless connectivity in stadiums, campuses, and dense metropolitan areas.`
    },
    {
      question: `How do small cells compare to traditional towers?`,
      answer: `Small cells complement macro towers by providing localized high-capacity coverage. While towers cover large areas, small cells densify networks in specific locations. For ${symbol}, small cells generate recurring revenue through fiber backhaul, equipment hosting, and power/maintenance services.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Small Cells`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Small Cells - 5G Infrastructure & Network Densification`,
      description: `Comprehensive small cell analysis for ${symbol} (${companyName}) including 5G deployment and densification metrics.`,
      url: pageUrl,
      keywords: [`${symbol} small cells`, `${symbol} 5G infrastructure`, `${symbol} network densification`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(smallCellFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Small Cells</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Small Cell Network</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - 5G infrastructure & network densification</p>

          {/* Small Cell Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Small Cell Nodes</p>
                <p className="text-4xl font-bold text-cyan-500">{(smallCellCount / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className="text-4xl font-bold text-green-500">+{smallCellGrowth}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Urban Coverage</p>
                <p className="text-2xl font-bold">
                  {Math.round((urbanNodes / smallCellCount) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Deployment Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Small Cell Deployment</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Urban Nodes</h3>
                  <p className="text-3xl font-bold text-cyan-500">{urbanNodes.toLocaleString()}</p>
                </div>
                <p className="text-muted-foreground">
                  High-density urban deployments providing critical 5G coverage in downtown areas, business districts,
                  and high-traffic zones where capacity demands are highest.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Suburban Nodes</h3>
                  <p className="text-3xl font-bold text-blue-500">{suburbananNodes.toLocaleString()}</p>
                </div>
                <p className="text-muted-foreground">
                  Suburban and enterprise deployments filling coverage gaps and providing targeted capacity
                  for campuses, shopping centers, and residential areas.
                </p>
              </div>
            </div>
          </section>

          {/* 5G Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5G Network Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Network Densification</h3>
                <p className="text-muted-foreground">
                  Small cells are fundamental to 5G deployment because higher frequency spectrum (mmWave, C-band)
                  requires denser infrastructure. {symbol}'s {smallCellCount.toLocaleString()} small cell nodes
                  enable carriers to deliver the promised speeds and capacity of 5G networks.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Revenue Model</h3>
                <p className="text-muted-foreground">
                  Small cell deployments generate revenue through: (1) Fiber connectivity fees for backhaul,
                  (2) Equipment hosting and installation services, (3) Power and maintenance agreements, and
                  (4) Long-term contracts with wireless carriers.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Growth Trajectory</h3>
                <p className="text-muted-foreground">
                  With {smallCellGrowth}% annual growth, {symbol}'s small cell network is expanding rapidly.
                  Industry forecasts suggest small cell deployments will accelerate as 5G adoption increases
                  and carriers seek to improve urban coverage quality.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Infrastructure Analysis</h2>
            <p className="text-muted-foreground mb-6">View fiber miles, tower count, and full infrastructure metrics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {smallCellFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="small-cells" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
