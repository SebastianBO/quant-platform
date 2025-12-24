import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Distribution Points - Distribution Network & Reach Analysis`,
    description: `${symbol} distribution analysis with distribution points, channel network, and market reach metrics. Understand how ${symbol} expands its distribution footprint and market access.`,
    keywords: [
      `${symbol} distribution`,
      `${symbol} distribution points`,
      `${symbol} distribution network`,
      `${symbol} channel expansion`,
      `${symbol} market reach`,
      `${symbol} retail presence`,
    ],
    openGraph: {
      title: `${symbol} Distribution Points | Distribution Network Analysis`,
      description: `Comprehensive distribution analysis for ${symbol} with distribution points and market reach.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/distribution-points/${ticker.toLowerCase()}`,
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

export default async function DistributionPointsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/distribution-points/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const distributionFaqs = [
    {
      question: `What are ${symbol} distribution points?`,
      answer: `${symbol} distribution points represent the physical and digital locations where ${companyName} products or services are available to customers. This includes retail stores, online channels, distributor locations, partner networks, and direct-to-consumer touchpoints.`
    },
    {
      question: `How does ${symbol} expand distribution?`,
      answer: `${companyName} expands distribution through new retail partnerships, e-commerce growth, international expansion, direct-to-consumer channels, distributor network development, store openings, and omnichannel strategies to increase product availability and market penetration.`
    },
    {
      question: `Why is distribution important for ${symbol}?`,
      answer: `Distribution is crucial for ${symbol} because it directly impacts market reach, sales volume, brand visibility, competitive positioning, and growth potential. Wider distribution enables revenue growth, market share gains, and stronger customer relationships.`
    },
    {
      question: `What drives ${symbol} distribution growth?`,
      answer: `${companyName}'s distribution growth is driven by retail partnerships, geographic expansion, e-commerce investment, channel diversification, direct distribution capabilities, emerging market entry, and strategic initiatives to improve product accessibility and availability.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Distribution`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Distribution Points - Distribution Network & Reach Analysis`,
      description: `Comprehensive distribution analysis for ${symbol} (${companyName}) with distribution points and network insights.`,
      url: pageUrl,
      keywords: [`${symbol} distribution`, `${symbol} distribution points`, `${symbol} market reach`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(distributionFaqs),
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
            <span>{symbol} Distribution</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Distribution Points</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Distribution network & market reach analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold mb-2">Distribution Network Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed distribution metrics, channel expansion, and market reach analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Company Analysis
              </Link>
            </div>
          </section>

          {/* Distribution Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Distribution Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Distribution Points', desc: 'Total access points' },
                { name: 'Geographic Coverage', desc: 'Market penetration' },
                { name: 'Channel Mix', desc: 'Distribution diversity' },
                { name: 'Distribution Growth', desc: 'Network expansion rate' },
                { name: 'Direct vs Indirect', desc: 'Channel split' },
                { name: 'E-commerce %', desc: 'Digital distribution share' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Distribution Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Distribution Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Expanding distribution points indicates market penetration and growth potential',
                'Diversified channel mix reduces dependency risk and improves resilience',
                'Strong e-commerce distribution reflects digital transformation and modern consumer reach',
                'Geographic distribution expansion enables new market entry and revenue diversification',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-green-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Distribution Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} distribution network and market reach</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Distribution
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {distributionFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="distribution-points" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
