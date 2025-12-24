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
    title: `${symbol} DPO - Detrended Price Oscillator Analysis`,
    description: `${symbol} DPO (Detrended Price Oscillator) analysis. Track ${symbol} cyclical patterns, price cycles, and trend-removed price action with DPO indicator signals.`,
    keywords: [
      `${symbol} DPO`,
      `${symbol} Detrended Price Oscillator`,
      `${symbol} price cycles`,
      `${symbol} cyclical analysis`,
      `${symbol} trend removal`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} DPO | Detrended Price Oscillator`,
      description: `Comprehensive ${symbol} DPO analysis with cyclical patterns and trend-removed signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dpo/${ticker.toLowerCase()}`,
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

export default async function DPOPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/dpo/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const dpoFaqs = [
    {
      question: `What is ${symbol} DPO?`,
      answer: `${symbol} DPO (Detrended Price Oscillator) removes the trend from price to identify underlying cycles and overbought/oversold levels. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, DPO helps traders focus on short-term cycles by eliminating long-term trends.`
    },
    {
      question: `How is ${symbol} DPO calculated?`,
      answer: `${symbol} DPO is calculated by subtracting a displaced moving average from the price: DPO = Close - SMA(n/2 + 1 periods ago). For a 20-period DPO, you subtract the 20-period SMA from 11 periods ago. This displacement removes the trend component while preserving cyclical information.`
    },
    {
      question: `How do you trade ${symbol} DPO?`,
      answer: `Trade ${symbol} DPO by: buying when DPO crosses above zero (cycle turning up), selling when DPO crosses below zero (cycle turning down), identifying cycle peaks/troughs for entry/exit timing, and using positive/negative readings to gauge short-term overbought/oversold conditions independent of the main trend.`
    },
    {
      question: `What's the difference between ${symbol} DPO and momentum oscillators?`,
      answer: `Unlike momentum oscillators that track trend strength, ${symbol} DPO eliminates trends entirely to focus on cycles. While the current ${Math.abs(changePercent).toFixed(2)}% change includes trend direction, DPO shows where price sits relative to its cycle, making it ideal for identifying cycle-based trading opportunities.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} DPO`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} DPO - Detrended Price Oscillator Analysis`,
      description: `Comprehensive DPO analysis for ${symbol} (${companyName}) with cyclical patterns and trend-removed signals.`,
      url: pageUrl,
      keywords: [`${symbol} DPO`, `${symbol} Detrended Price Oscillator`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(dpoFaqs),
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
            <span>{symbol} DPO</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} DPO Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Detrended Price Oscillator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 p-8 rounded-xl border border-rose-500/30 mb-8">
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

          {/* DPO Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DPO Signal Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Positive DPO (Above 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Cycle peak phase</p>
                <p className="text-xs text-muted-foreground">Price above its displaced moving average, in upper portion of cycle</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Zero Line (0)</p>
                <p className="text-sm text-muted-foreground mb-2">Cycle midpoint</p>
                <p className="text-xs text-muted-foreground">Crossovers indicate cycle turning points, watch for directional changes</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Negative DPO (Below 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Cycle trough phase</p>
                <p className="text-xs text-muted-foreground">Price below its displaced moving average, in lower portion of cycle</p>
              </div>
            </div>
          </section>

          {/* Key Concepts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DPO Key Concepts</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Cycle Identification</h3>
                <p className="text-sm text-muted-foreground">DPO removes trends to reveal underlying price cycles. Measure peak-to-peak or trough-to-trough to identify cycle length for timing trades.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Not for Trend Following</h3>
                <p className="text-sm text-muted-foreground">DPO deliberately eliminates trends. Use it to identify cycles and overbought/oversold levels, not to determine overall trend direction.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Optimal Period Selection</h3>
                <p className="text-sm text-muted-foreground">Standard is 20 periods. Use longer periods (30-40) for longer cycles, shorter periods (14-20) for faster markets. Period should match dominant cycle length.</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DPO Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• DPO crosses above zero (cycle turning upward)</li>
                  <li>• DPO makes higher lows (strengthening cycle)</li>
                  <li>• DPO bottoming in negative territory (cycle trough forming)</li>
                  <li>• Regular cycle pattern suggests buy at trough</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• DPO crosses below zero (cycle turning downward)</li>
                  <li>• DPO makes lower highs (weakening cycle)</li>
                  <li>• DPO topping in positive territory (cycle peak forming)</li>
                  <li>• Regular cycle pattern suggests sell at peak</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered DPO analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {dpoFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="dpo" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
