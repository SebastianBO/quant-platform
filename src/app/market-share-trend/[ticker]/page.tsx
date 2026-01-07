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
    title: `${symbol} Market Share Trend - Competitive Position & Share Analysis`,
    description: `${symbol} market share analysis with competitive positioning, share trends, and industry leadership metrics. Understand how ${symbol} gains or loses market share over time.`,
    keywords: [
      `${symbol} market share`,
      `${symbol} market position`,
      `${symbol} competitive analysis`,
      `${symbol} share trends`,
      `${symbol} industry position`,
      `${symbol} market leadership`,
    ],
    openGraph: {
      title: `${symbol} Market Share Trend | Competitive Position Analysis`,
      description: `Comprehensive market share analysis for ${symbol} with competitive positioning and share trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/market-share-trend/${ticker.toLowerCase()}`,
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

export default async function MarketShareTrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/market-share-trend/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const marketShareFaqs = [
    {
      question: `What is ${symbol} market share?`,
      answer: `${symbol} market share represents ${companyName}'s sales as a percentage of total industry or category sales. It measures the company's competitive position and relative size within its market, indicating whether it's gaining or losing ground against competitors.`
    },
    {
      question: `How is market share calculated for ${symbol}?`,
      answer: `Market share for ${symbol} is calculated by dividing the company's revenue in a specific market or category by the total market revenue, expressed as a percentage. Companies and research firms track this across different geographies, product categories, and time periods.`
    },
    {
      question: `Why is market share important for ${symbol}?`,
      answer: `Market share is crucial for ${symbol} because it reflects competitive strength, pricing power, brand equity, and long-term sustainability. Gaining market share indicates successful strategies and strong execution, while losing share may signal competitive challenges.`
    },
    {
      question: `What drives ${symbol} market share changes?`,
      answer: `${companyName}'s market share changes are driven by innovation, pricing strategy, distribution expansion, marketing effectiveness, product quality, customer service, brand strength, competitive actions, and category growth or decline dynamics.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Market Share`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Market Share Trend - Competitive Position & Share Analysis`,
      description: `Comprehensive market share analysis for ${symbol} (${companyName}) with competitive positioning and trend insights.`,
      url: pageUrl,
      keywords: [`${symbol} market share`, `${symbol} competitive analysis`, `${symbol} market position`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(marketShareFaqs),
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
            <span>{symbol} Market Share</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Market Share Trend</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Competitive position & market share analysis</p>

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

          {/* Market Share Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Market Share Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed competitive positioning, market share trends, and industry analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Competitive Analysis
              </Link>
            </div>
          </section>

          {/* Market Share Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Market Share Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Market Share %', desc: 'Share of total market' },
                { name: 'Share Trend', desc: 'Gaining or losing position' },
                { name: 'Competitive Position', desc: 'Rank vs competitors' },
                { name: 'Category Leadership', desc: 'Market dominance level' },
                { name: 'Share Momentum', desc: 'Rate of share change' },
                { name: 'Relative Position', desc: 'Gap to market leader' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Market Share Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Market Share Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Gaining market share indicates competitive advantages and superior value proposition',
                'Market leadership position provides economies of scale and pricing power',
                'Share trends reveal the effectiveness of strategic initiatives and execution',
                'Stable or growing share demonstrates resilience against competitive pressures',
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
            <h2 className="text-2xl font-bold mb-4">Complete Competitive Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} market share and competitive positioning</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Position
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketShareFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="market-share-trend" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
