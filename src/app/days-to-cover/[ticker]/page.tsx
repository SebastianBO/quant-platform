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
    title: `${symbol} Days to Cover - Short Interest Ratio & Coverage Analysis`,
    description: `${symbol} days to cover ratio showing how long it would take short sellers to cover positions. Analyze ${symbol} short interest coverage and squeeze potential.`,
    keywords: [
      `${symbol} days to cover`,
      `${symbol} short ratio`,
      `${symbol} coverage ratio`,
      `${symbol} short interest ratio`,
      `${symbol} days to cover ratio`,
      `${symbol} short coverage`,
    ],
    openGraph: {
      title: `${symbol} Days to Cover | Short Interest Coverage Ratio`,
      description: `Comprehensive ${symbol} days to cover analysis with short coverage metrics and squeeze indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/days-to-cover/${ticker.toLowerCase()}`,
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

export default async function DaysToCoverPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/days-to-cover/${ticker.toLowerCase()}`
  const volume = snapshot.volume || 0

  const faqs = [
    {
      question: `What is ${symbol} days to cover?`,
      answer: `${symbol} days to cover (also called short ratio) is calculated by dividing total shares sold short by average daily trading volume. It represents how many trading days it would theoretically take for all short sellers to buy back (cover) their positions.`
    },
    {
      question: `Is high days to cover good or bad for ${symbol}?`,
      answer: `High days to cover (above 5-10 days) for ${symbol} suggests short squeeze potential but also indicates bearish sentiment. It means short positions are large relative to trading volume, making it harder for shorts to exit quickly if the stock rises.`
    },
    {
      question: `How is ${symbol} days to cover calculated?`,
      answer: `${symbol} days to cover = Total Short Interest ÷ Average Daily Volume. For example, if 10 million shares are shorted and average daily volume is 2 million shares, days to cover is 5 days. This assumes shorts could cover without affecting price, which is unrealistic.`
    },
    {
      question: `What is a good days to cover ratio for ${symbol}?`,
      answer: `For ${symbol}, days to cover interpretations: <1 day = very low short interest, 1-3 days = moderate, 3-5 days = elevated, 5-10 days = high squeeze potential, >10 days = extreme short interest. Context matters - compare to historical levels and peer companies.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Days to Cover`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Days to Cover - Short Interest Coverage Ratio`,
      description: `Comprehensive days to cover analysis for ${symbol} (${companyName}) with coverage metrics.`,
      url: pageUrl,
      keywords: [`${symbol} days to cover`, `${symbol} short ratio`, `${symbol} coverage ratio`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Days to Cover</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Days to Cover</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Short interest coverage ratio & analysis</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Daily Volume</p>
                <p className="text-3xl font-bold">{(volume / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Days to Cover</p>
                <p className="text-3xl font-bold">Check Data</p>
              </div>
            </div>
          </div>

          {/* Days to Cover Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Days to Cover</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                Days to cover measures how many trading days it would take for all short sellers to close their {symbol} positions
                at average daily volume. This metric helps assess short squeeze risk and the difficulty shorts face when covering.
              </p>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="font-mono text-lg mb-2">Days to Cover = Short Interest ÷ Average Daily Volume</p>
                <p className="text-sm text-muted-foreground">
                  This calculation assumes shorts could cover without driving the price higher, which rarely happens in practice.
                </p>
              </div>
            </div>
          </section>

          {/* Interpretation Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Days to Cover Interpretation</h2>
            <div className="space-y-4">
              {[
                {
                  range: 'Less than 1 Day',
                  interpretation: 'Minimal Short Interest',
                  desc: 'Very low short positions relative to volume. Limited squeeze potential.',
                  risk: 'Low'
                },
                {
                  range: '1-3 Days',
                  interpretation: 'Moderate Short Interest',
                  desc: 'Normal short interest levels. Shorts can cover relatively easily.',
                  risk: 'Low'
                },
                {
                  range: '3-5 Days',
                  interpretation: 'Elevated Short Interest',
                  desc: 'Significant short positions. Some squeeze potential if catalysts emerge.',
                  risk: 'Medium'
                },
                {
                  range: '5-10 Days',
                  interpretation: 'High Short Interest',
                  desc: 'Heavy short positions. Strong squeeze potential with limited float.',
                  risk: 'High'
                },
                {
                  range: 'Above 10 Days',
                  interpretation: 'Extreme Short Interest',
                  desc: 'Massive short positions. Very high squeeze potential but also high bearish conviction.',
                  risk: 'Very High'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{item.range}</h3>
                      <p className="text-sm text-green-400">{item.interpretation}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.risk === 'Very High' || item.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                      item.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.risk} Risk
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Calculation Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Calculation Example</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Short Interest</p>
                    <p className="text-2xl font-bold">15,000,000 shares</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Average Daily Volume</p>
                    <p className="text-2xl font-bold">2,500,000 shares</p>
                  </div>
                </div>
                <div className="bg-green-600/20 border border-green-500/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Days to Cover</p>
                  <p className="text-3xl font-bold text-green-400">6.0 days</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    15,000,000 ÷ 2,500,000 = 6.0 days (High squeeze potential)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting Days to Cover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { factor: 'Volume Spikes', impact: 'Lower days to cover during high volume periods' },
                { factor: 'Float Size', impact: 'Smaller float amplifies the impact of days to cover' },
                { factor: 'Short Interest Changes', impact: 'Rising short interest increases days to cover' },
                { factor: 'Market Conditions', impact: 'Volatile markets can reduce or increase coverage time' },
                { factor: 'Borrow Availability', impact: 'Limited shares to borrow prevents new shorts' },
                { factor: 'Price Movement', impact: 'Rising prices force faster covering, lowering theoretical days' },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-2">{item.factor}</p>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Metric Limitations</h2>
            <div className="bg-yellow-600/20 border border-yellow-500/30 p-6 rounded-xl">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Assumes shorts can cover at average volume without price impact (unrealistic)</li>
                <li>• Doesn't account for reduced float due to insider and institutional holdings</li>
                <li>• Short interest data is reported bi-monthly, so it may be outdated</li>
                <li>• Volume can change dramatically during squeeze events</li>
                <li>• Doesn't indicate direction - high days to cover can persist for months</li>
                <li>• Some shorts may be hedged with options or other positions</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Complete Short Data</h2>
            <p className="text-muted-foreground mb-6">Access current short interest, borrow rates, and historical trends</p>
            <Link href={`/short-interest/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Short Interest
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="days-to-cover" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
