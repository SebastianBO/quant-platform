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
    title: `${symbol} Ultimate Oscillator - Multi-Timeframe Momentum Analysis`,
    description: `${symbol} Ultimate Oscillator analysis. Track ${symbol} momentum across multiple timeframes with Ultimate Oscillator signals, divergences, and overbought/oversold conditions.`,
    keywords: [
      `${symbol} Ultimate Oscillator`,
      `${symbol} UO indicator`,
      `${symbol} multi-timeframe momentum`,
      `${symbol} momentum oscillator`,
      `${symbol} overbought oversold`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} Ultimate Oscillator | Multi-Timeframe Momentum`,
      description: `Comprehensive ${symbol} Ultimate Oscillator analysis with multi-timeframe momentum signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ultimate-oscillator/${ticker.toLowerCase()}`,
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

export default async function UltimateOscillatorPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ultimate-oscillator/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const uoFaqs = [
    {
      question: `What is ${symbol} Ultimate Oscillator?`,
      answer: `${symbol} Ultimate Oscillator (UO) is a momentum indicator that combines short, medium, and long-term price momentum (7, 14, and 28 periods). Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, UO ranges from 0-100 with readings above 70 indicating overbought and below 30 indicating oversold.`
    },
    {
      question: `How does ${symbol} Ultimate Oscillator work?`,
      answer: `${symbol} Ultimate Oscillator works by calculating buying pressure (BP = Close - True Low) relative to true range across three timeframes, then weighting them (4:2:1 ratio for 7, 14, 28 periods). This multi-timeframe approach reduces false signals common in single-timeframe oscillators.`
    },
    {
      question: `What are ${symbol} Ultimate Oscillator trading signals?`,
      answer: `For ${symbol}, Ultimate Oscillator signals include: readings above 70 suggest overbought conditions (potential sell), readings below 30 suggest oversold conditions (potential buy), and divergences between price and UO are particularly reliable for spotting reversals across multiple timeframes.`
    },
    {
      question: `Why use ${symbol} Ultimate Oscillator over RSI?`,
      answer: `${symbol} Ultimate Oscillator offers advantages over RSI by incorporating three timeframes instead of one, reducing false signals and providing more reliable overbought/oversold readings. The current ${Math.abs(changePercent).toFixed(2)}% change can be better contextualized across short, medium, and long-term momentum.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Ultimate Oscillator`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Ultimate Oscillator - Multi-Timeframe Momentum Analysis`,
      description: `Comprehensive Ultimate Oscillator analysis for ${symbol} (${companyName}) with multi-timeframe momentum signals.`,
      url: pageUrl,
      keywords: [`${symbol} Ultimate Oscillator`, `${symbol} UO indicator`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(uoFaqs),
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
            <span>{symbol} Ultimate Oscillator</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Ultimate Oscillator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Multi-timeframe momentum signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
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

          {/* UO Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ultimate Oscillator Signal Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Overbought (Above 70)</p>
                <p className="text-sm text-muted-foreground mb-2">Potential sell signal</p>
                <p className="text-xs text-muted-foreground">Strong buying pressure across all three timeframes, watch for bearish divergences</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Neutral (30 to 70)</p>
                <p className="text-sm text-muted-foreground mb-2">Balanced momentum</p>
                <p className="text-xs text-muted-foreground">No extreme conditions across timeframes, wait for clear signals from extreme zones</p>
              </div>
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Oversold (Below 30)</p>
                <p className="text-sm text-muted-foreground mb-2">Potential buy signal</p>
                <p className="text-xs text-muted-foreground">Strong selling pressure across all three timeframes, watch for bullish divergences</p>
              </div>
            </div>
          </section>

          {/* Timeframe Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Multi-Timeframe Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="font-bold text-lg mb-2">Short-Term (7 periods)</p>
                <p className="text-sm text-muted-foreground mb-1">Weight: 4x</p>
                <p className="text-xs text-muted-foreground">Captures recent price momentum and quick reversals</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="font-bold text-lg mb-2">Medium-Term (14 periods)</p>
                <p className="text-sm text-muted-foreground mb-1">Weight: 2x</p>
                <p className="text-xs text-muted-foreground">Balances short and long-term momentum trends</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="font-bold text-lg mb-2">Long-Term (28 periods)</p>
                <p className="text-sm text-muted-foreground mb-1">Weight: 1x</p>
                <p className="text-xs text-muted-foreground">Confirms overall trend direction and strength</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ultimate Oscillator Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• UO rises from below 30 (oversold bounce across timeframes)</li>
                  <li>• Bullish divergence: price makes lower low, UO makes higher low</li>
                  <li>• UO crosses above 50 after oversold reading</li>
                  <li>• All three timeframe components showing positive momentum</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• UO falls from above 70 (overbought reversal across timeframes)</li>
                  <li>• Bearish divergence: price makes higher high, UO makes lower high</li>
                  <li>• UO crosses below 50 after overbought reading</li>
                  <li>• All three timeframe components showing negative momentum</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered Ultimate Oscillator analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {uoFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="ultimate-oscillator" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
