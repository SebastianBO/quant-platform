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

  return {
    title: `${symbol} Volume Growth - Unit Sales & Volume Analysis`,
    description: `${symbol} volume growth analysis with unit sales trends, volume drivers, and demand metrics. Understand how ${symbol} grows through increased unit sales and market penetration.`,
    keywords: [
      `${symbol} volume growth`,
      `${symbol} unit sales`,
      `${symbol} sales volume`,
      `${symbol} volume analysis`,
      `${symbol} unit growth`,
      `${symbol} demand trends`,
    ],
    openGraph: {
      title: `${symbol} Volume Growth | Unit Sales Analysis`,
      description: `Comprehensive volume growth analysis for ${symbol} with unit sales trends and demand metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/volume-growth/${ticker.toLowerCase()}`,
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

export default async function VolumeGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/volume-growth/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const volumeGrowthFaqs = [
    {
      question: `What is ${symbol} volume growth?`,
      answer: `${symbol} volume growth measures the increase in physical units or services sold by ${companyName}, excluding the impact of price changes. It reflects actual demand growth and market penetration rather than revenue increases from pricing.`
    },
    {
      question: `How is volume growth calculated for ${symbol}?`,
      answer: `Volume growth for ${symbol} is calculated by measuring the change in total units sold year-over-year, adjusting for price/mix effects. Companies typically report volume growth as a percentage of organic revenue growth attributed to quantity increases.`
    },
    {
      question: `Why is volume growth important for ${symbol}?`,
      answer: `Volume growth is crucial for ${symbol} because it demonstrates genuine market demand expansion, customer acquisition success, and the ability to gain market share. Strong volume growth indicates healthy underlying business fundamentals beyond just pricing power.`
    },
    {
      question: `What drives ${symbol} volume growth?`,
      answer: `${companyName}'s volume growth is driven by factors including market expansion, new customer acquisition, increased consumption among existing customers, geographic penetration, new product adoption, competitive share gains, and category growth.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Volume Growth`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Volume Growth - Unit Sales & Volume Analysis`,
      description: `Comprehensive volume growth analysis for ${symbol} (${companyName}) with unit sales trends and demand drivers.`,
      url: pageUrl,
      keywords: [`${symbol} volume growth`, `${symbol} unit sales`, `${symbol} sales volume`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(volumeGrowthFaqs),
    getTableSchema({
      name: `${symbol} Volume Growth History`,
      description: `Historical Volume Growth data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Volume Growth', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} Volume Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Volume Growth</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Unit sales growth & volume analysis</p>

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

          {/* Volume Growth Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Volume Growth Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed volume metrics, unit sales trends, and demand analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Volume Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Volume Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Volume Growth %', desc: 'YoY unit sales change' },
                { name: 'Units Sold', desc: 'Total volume metrics' },
                { name: 'Volume Contribution', desc: 'Share of organic growth' },
                { name: 'Market Penetration', desc: 'Customer reach expansion' },
                { name: 'Category Volume', desc: 'Industry demand trends' },
                { name: 'Volume Momentum', desc: 'Growth acceleration' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Volume Growth Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Volume Growth Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Positive volume growth indicates genuine demand expansion and market share gains',
                'Volume trends reveal customer adoption rates and competitive positioning',
                'Consistent volume growth demonstrates pricing discipline and sustainable demand',
                'Volume growth patterns show the health of the underlying business and category',
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
            <h2 className="text-2xl font-bold mb-4">Complete Volume Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} volume growth and unit sales trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Volume
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {volumeGrowthFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="volume-growth" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
