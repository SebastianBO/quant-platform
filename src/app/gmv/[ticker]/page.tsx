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
    title: `${symbol} GMV - Gross Merchandise Value Analysis & Trends`,
    description: `${symbol} gross merchandise value (GMV) analysis with trends, growth rates, and marketplace volume metrics. Understand ${symbol}'s total transaction volume.`,
    keywords: [
      `${symbol} GMV`,
      `${symbol} gross merchandise value`,
      `${symbol} marketplace volume`,
      `${symbol} transaction volume`,
      `${symbol} GMV growth`,
      `${symbol} marketplace metrics`,
    ],
    openGraph: {
      title: `${symbol} GMV | Gross Merchandise Value & Marketplace Metrics`,
      description: `Comprehensive GMV analysis for ${symbol} with marketplace volume trends and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gmv/${ticker.toLowerCase()}`,
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

export default async function GMVPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gmv/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const gmvFaqs = [
    {
      question: `What is ${symbol} GMV?`,
      answer: `${symbol} GMV (Gross Merchandise Value) represents the total value of all transactions processed through ${companyName}'s marketplace platform over a specific period. It measures the total dollar value of goods sold, regardless of ${symbol}'s revenue take rate.`
    },
    {
      question: `How is GMV different from revenue for ${symbol}?`,
      answer: `GMV for ${symbol} measures the total value of all marketplace transactions, while revenue represents only the portion ${companyName} keeps (commission, fees, etc.). For example, if a $100 item sells and ${symbol} takes a 15% commission, GMV is $100 but revenue is $15.`
    },
    {
      question: `Why is GMV important for ${symbol}?`,
      answer: `GMV is a key metric for ${companyName} because it shows the total marketplace activity and scale. Growing GMV indicates increasing platform usage and can lead to higher revenue. Investors track GMV growth to understand ${symbol}'s marketplace health and competitive position.`
    },
    {
      question: `What drives ${symbol} GMV growth?`,
      answer: `${symbol} GMV growth is driven by: more active buyers and sellers on the platform, higher average order values, increased transaction frequency, geographic expansion, and new product categories. Platform improvements and marketing can also boost GMV.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} GMV`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} GMV - Gross Merchandise Value Analysis & Trends`,
      description: `Comprehensive GMV analysis for ${symbol} (${companyName}) with marketplace volume trends and growth metrics.`,
      url: pageUrl,
      keywords: [`${symbol} GMV`, `${symbol} gross merchandise value`, `${symbol} marketplace volume`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(gmvFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Marketplace Metrics</Link>
            {' / '}
            <span>{symbol} GMV</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Gross Merchandise Value (GMV)</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Total marketplace transaction volume & trends</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
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

          {/* GMV Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">GMV Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol}'s gross merchandise value, marketplace volume trends, and transaction growth metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Marketplace Metrics
              </Link>
            </div>
          </section>

          {/* GMV Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key GMV Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total GMV', desc: 'Gross merchandise value' },
                { name: 'GMV Growth Rate', desc: 'YoY GMV change' },
                { name: 'GMV per Active User', desc: 'Average transaction value' },
                { name: 'Take Rate', desc: 'Revenue as % of GMV' },
                { name: 'GMV by Category', desc: 'Transaction volume breakdown' },
                { name: 'GMV by Geography', desc: 'Regional marketplace activity' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What GMV Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What GMV Tells You</h2>
            <div className="space-y-3">
              {[
                'Growing GMV indicates increasing marketplace scale and user engagement',
                'GMV growth faster than revenue growth may signal declining take rates or competitive pressure',
                'GMV is a leading indicator of future revenue potential for marketplace businesses',
                'Investors compare GMV across marketplace competitors to assess market share and growth',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-purple-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Marketplace Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} GMV trends and marketplace performance</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Marketplace
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {gmvFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="gmv" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
