import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Organic Revenue Growth - Sales Growth Analysis & Trends`,
    description: `${symbol} organic revenue growth analysis with sales trends, growth drivers, and market expansion metrics. Understand how ${symbol} grows revenue excluding acquisitions.`,
    keywords: [
      `${symbol} organic growth`,
      `${symbol} revenue growth`,
      `${symbol} sales growth`,
      `${symbol} organic revenue`,
      `${symbol} growth analysis`,
      `${symbol} top line growth`,
    ],
    openGraph: {
      title: `${symbol} Organic Revenue Growth | Sales Growth Analysis`,
      description: `Comprehensive organic revenue growth analysis for ${symbol} with sales trends and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/organic-growth/${ticker.toLowerCase()}`,
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

export default async function OrganicGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/organic-growth/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const organicGrowthFaqs = [
    {
      question: `What is ${symbol} organic revenue growth?`,
      answer: `${symbol} organic revenue growth represents sales increases from ${companyName}'s existing business operations, excluding contributions from acquisitions, divestitures, or currency fluctuations. It shows the company's ability to grow through core business activities.`
    },
    {
      question: `How is organic growth different from total revenue growth for ${symbol}?`,
      answer: `Organic growth for ${symbol} measures internal business expansion, while total revenue growth includes acquisitions and other external factors. Organic growth is considered a more reliable indicator of sustainable business performance and management execution.`
    },
    {
      question: `Why is organic growth important for ${symbol} investors?`,
      answer: `Organic growth is crucial for ${symbol} investors because it demonstrates the company's competitive strength, market share gains, pricing power, and ability to innovate. High organic growth typically signals strong customer demand and effective business strategies.`
    },
    {
      question: `What drives ${symbol} organic revenue growth?`,
      answer: `${companyName}'s organic growth is typically driven by factors including volume increases, pricing improvements, new product launches, market share gains, geographic expansion, customer base growth, and improved product mix.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Organic Growth`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Organic Revenue Growth - Sales Growth Analysis & Trends`,
      description: `Comprehensive organic revenue growth analysis for ${symbol} (${companyName}) with sales trends and growth drivers.`,
      url: pageUrl,
      keywords: [`${symbol} organic growth`, `${symbol} revenue growth`, `${symbol} sales growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(organicGrowthFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} Organic Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Organic Revenue Growth</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Organic sales growth analysis & revenue trends</p>

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

          {/* Organic Growth Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-bold mb-2">Organic Revenue Growth Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed organic growth metrics, sales trends, and revenue drivers for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Growth Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Organic Growth Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Organic Revenue Growth %', desc: 'YoY sales growth rate' },
                { name: 'Volume Growth', desc: 'Unit sales increase' },
                { name: 'Price/Mix Impact', desc: 'Pricing contribution' },
                { name: 'Market Share Trend', desc: 'Competitive position' },
                { name: 'Geographic Growth', desc: 'Regional expansion' },
                { name: 'Product Mix Shift', desc: 'Portfolio optimization' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Organic Growth Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Organic Growth Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Consistent organic growth indicates strong competitive positioning and customer demand',
                'Higher organic growth than peers suggests market share gains and superior execution',
                'Accelerating organic growth signals successful product innovation and market expansion',
                'Organic growth trends reveal the sustainability of the business model and growth strategy',
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
            <h2 className="text-2xl font-bold mb-4">Complete Growth Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} organic revenue growth and sales trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Revenue
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {organicGrowthFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="organic-growth" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
