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
    title: `${symbol} Mass Index Analysis - Trend Reversal Indicator`,
    description: `${symbol} Mass Index analysis for detecting trend reversals. Track ${symbol} volatility expansion and reversal bulges with the Mass Index indicator.`,
    keywords: [
      `${symbol} mass index`,
      `${symbol} mass index indicator`,
      `${symbol} reversal bulge`,
      `${symbol} trend reversal`,
      `${symbol} volatility expansion`,
      `${symbol} mass index signals`,
    ],
    openGraph: {
      title: `${symbol} Mass Index Analysis | Trend Reversal Indicator`,
      description: `Comprehensive ${symbol} Mass Index analysis with reversal bulge signals and volatility tracking.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/mass-index/${ticker.toLowerCase()}`,
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

export default async function MassIndexPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/mass-index/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const massIndexFaqs = [
    {
      question: `What is ${symbol} Mass Index?`,
      answer: `${symbol} Mass Index is a volatility indicator that identifies potential trend reversals by measuring the narrowing and widening of the trading range. Currently trading at $${price.toFixed(2)}, readings above 27 signal a reversal bulge.`
    },
    {
      question: `How do you read ${symbol} Mass Index signals?`,
      answer: `Read ${symbol} Mass Index by watching for "reversal bulges" - when the index rises above 27 and then falls below 26.5. This signals potential trend reversal. The Mass Index doesn't indicate direction, only that a reversal is likely.`
    },
    {
      question: `What is a reversal bulge for ${symbol}?`,
      answer: `A reversal bulge for ${symbol} occurs when the Mass Index rises above 27 and then drops back below 26.5. This pattern indicates expanding volatility followed by contraction, often preceding a trend reversal regardless of direction.`
    },
    {
      question: `Is ${symbol} showing Mass Index reversal signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Mass Index analysis below for detailed reversal bulge signals and volatility patterns.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Mass Index`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Mass Index Analysis - Trend Reversal Indicator`,
      description: `Comprehensive Mass Index analysis for ${symbol} (${companyName}) with reversal bulge signals and volatility tracking.`,
      url: pageUrl,
      keywords: [`${symbol} mass index`, `${symbol} trend reversal`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(massIndexFaqs),
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
            <span>{symbol} Mass Index</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Mass Index Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Trend reversal & volatility signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 p-8 rounded-xl border border-fuchsia-500/30 mb-8">
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

          {/* Mass Index Concepts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Mass Index Key Concepts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'EMA Ratio', desc: 'Single EMA / Double EMA', value: 'Measures range compression' },
                { name: 'Period', desc: '9-period range high-low', value: 'Standard lookback window' },
                { name: 'Summation', desc: '25-period sum of ratios', value: 'Creates Mass Index value' },
                { name: 'Reversal Bulge', desc: 'Above 27, then below 26.5', value: 'Primary reversal signal' },
                { name: 'Setup Line', desc: '26.5 threshold', value: 'Confirmation level' },
                { name: 'Trigger Line', desc: '27.0 threshold', value: 'Initial alert level' },
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
            <h2 className="text-2xl font-bold mb-4">Mass Index Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-amber-600/10 p-5 rounded-lg border border-amber-500/30">
                <h3 className="font-bold text-lg mb-2 text-amber-500">Reversal Bulge Pattern</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mass Index rises above 27 (reversal setup)</li>
                  <li>• Mass Index then falls below 26.5 (reversal confirmation)</li>
                  <li>• Combine with trend indicator to determine reversal direction</li>
                  <li>• Use 9-period EMA: price above = bullish reversal, below = bearish</li>
                  <li>• Wait for price action confirmation before entering</li>
                </ul>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-lg mb-2 text-blue-500">Important Notes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mass Index does NOT indicate reversal direction</li>
                  <li>• Always combine with directional indicators (EMA, trend lines)</li>
                  <li>• Works best in volatile, trending markets</li>
                  <li>• False signals possible in low volatility environments</li>
                  <li>• Measure volatility expansion/contraction cycles</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Mass Index Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time reversal signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {massIndexFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="mass-index" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
