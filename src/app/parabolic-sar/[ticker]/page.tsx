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
    title: `${symbol} Parabolic SAR Analysis - Stop and Reverse Indicator`,
    description: `${symbol} Parabolic SAR analysis with stop and reverse signals. Track ${symbol} trend direction and potential reversal points with SAR dots.`,
    keywords: [
      `${symbol} parabolic sar`,
      `${symbol} SAR indicator`,
      `${symbol} stop and reverse`,
      `${symbol} parabolic SAR signals`,
      `${symbol} trend reversal`,
      `${symbol} SAR dots`,
    ],
    openGraph: {
      title: `${symbol} Parabolic SAR Analysis | Stop and Reverse Indicator`,
      description: `Comprehensive ${symbol} Parabolic SAR analysis with trend signals and reversal points.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/parabolic-sar/${ticker.toLowerCase()}`,
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

export default async function ParabolicSARPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/parabolic-sar/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const sarFaqs = [
    {
      question: `What is ${symbol} Parabolic SAR?`,
      answer: `${symbol} Parabolic SAR (Stop and Reverse) is a trend-following indicator that provides entry and exit points. Currently trading at $${price.toFixed(2)}, SAR dots appear above or below price to indicate trend direction and potential reversal points.`
    },
    {
      question: `How do you read ${symbol} Parabolic SAR signals?`,
      answer: `${symbol} Parabolic SAR signals are read by the position of the dots relative to price. When dots are below the price, it signals an uptrend. When dots are above the price, it signals a downtrend. A dot flip indicates a potential trend reversal.`
    },
    {
      question: `What does Parabolic SAR tell you about ${symbol}?`,
      answer: `Parabolic SAR tells you ${symbol}'s current trend direction and provides trailing stop-loss levels. The dots accelerate as the trend strengthens, helping identify when to enter or exit positions based on trend momentum.`
    },
    {
      question: `Is ${symbol} showing SAR reversal signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Parabolic SAR analysis below for detailed trend signals and potential reversal points.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Parabolic SAR`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Parabolic SAR Analysis - Stop and Reverse Indicator`,
      description: `Comprehensive Parabolic SAR analysis for ${symbol} (${companyName}) with trend signals and reversal points.`,
      url: pageUrl,
      keywords: [`${symbol} parabolic sar`, `${symbol} SAR indicator`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(sarFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Technical Analysis</Link>
            {' / '}
            <span>{symbol} Parabolic SAR</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Parabolic SAR Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Stop and Reverse indicator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Change</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
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

          {/* SAR Concepts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Parabolic SAR Key Concepts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'SAR Dots', desc: 'Position indicates trend', value: 'Below price = uptrend, Above = downtrend' },
                { name: 'Acceleration Factor', desc: 'Controls SAR sensitivity', value: 'Starts at 0.02, max 0.20' },
                { name: 'Reversal Points', desc: 'When dots flip sides', value: 'Potential trend change signal' },
                { name: 'Trailing Stops', desc: 'Dynamic stop-loss levels', value: 'SAR dots serve as stop points' },
                { name: 'Trend Following', desc: 'Works best in trending markets', value: 'Less effective in ranges' },
                { name: 'Exit Signals', desc: 'Clear exit points', value: 'When price crosses SAR dot' },
              ].map((concept, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{concept.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{concept.desc}</p>
                  <p className="text-xs text-muted-foreground">{concept.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Parabolic SAR Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• SAR dots positioned below price candles</li>
                  <li>• Dots flipping from above to below price (reversal)</li>
                  <li>• Dots accelerating lower as uptrend strengthens</li>
                  <li>• Price consistently staying above SAR dots</li>
                  <li>• Use dots as trailing stop-loss for long positions</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• SAR dots positioned above price candles</li>
                  <li>• Dots flipping from below to above price (reversal)</li>
                  <li>• Dots accelerating higher as downtrend strengthens</li>
                  <li>• Price consistently staying below SAR dots</li>
                  <li>• Use dots as trailing stop-loss for short positions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Parabolic SAR Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time SAR signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {sarFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="parabolic-sar" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
