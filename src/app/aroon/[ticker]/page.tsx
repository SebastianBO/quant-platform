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
    title: `${symbol} Aroon Indicator - Trend Strength & Direction Analysis`,
    description: `${symbol} Aroon Indicator analysis. Track ${symbol} trend strength, direction, and consolidation with Aroon-Up, Aroon-Down, and Aroon Oscillator signals.`,
    keywords: [
      `${symbol} Aroon`,
      `${symbol} Aroon Indicator`,
      `${symbol} trend strength`,
      `${symbol} Aroon oscillator`,
      `${symbol} trend direction`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} Aroon Indicator | Trend Strength & Direction`,
      description: `Comprehensive ${symbol} Aroon analysis with trend strength and directional signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/aroon/${ticker.toLowerCase()}`,
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

export default async function AroonPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/aroon/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const aroonFaqs = [
    {
      question: `What is ${symbol} Aroon Indicator?`,
      answer: `${symbol} Aroon Indicator measures trend strength and direction using two lines: Aroon-Up (time since 25-period high) and Aroon-Down (time since 25-period low). Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, Aroon values range from 0-100 for each line.`
    },
    {
      question: `How do you read ${symbol} Aroon signals?`,
      answer: `For ${symbol}, read Aroon signals as: Aroon-Up above 70 with Aroon-Down below 30 indicates strong uptrend, Aroon-Down above 70 with Aroon-Up below 30 indicates strong downtrend, and both lines below 50 suggests consolidation. When Aroon-Up crosses above Aroon-Down, it signals emerging uptrend.`
    },
    {
      question: `What is ${symbol} Aroon Oscillator?`,
      answer: `${symbol} Aroon Oscillator is calculated as Aroon-Up minus Aroon-Down, ranging from -100 to +100. Positive values indicate uptrend strength, negative values indicate downtrend strength, and values near zero suggest weak trend or consolidation. The current ${Math.abs(changePercent).toFixed(2)}% change reflects recent momentum.`
    },
    {
      question: `What's the best period for ${symbol} Aroon?`,
      answer: `The standard Aroon period for ${symbol} is 25 days, which balances responsiveness with reliability. Use 14 days for more sensitive, short-term signals with more noise, or 50 days for smoother, longer-term trend identification with less sensitivity to short-term fluctuations.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Aroon`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Aroon Indicator - Trend Strength & Direction Analysis`,
      description: `Comprehensive Aroon analysis for ${symbol} (${companyName}) with trend strength and directional signals.`,
      url: pageUrl,
      keywords: [`${symbol} Aroon`, `${symbol} Aroon Indicator`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(aroonFaqs),
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
            <span>{symbol} Aroon</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Aroon Indicator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Trend strength & direction signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
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

          {/* Aroon Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Aroon Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Aroon-Up (Bullish Line)</p>
                <p className="text-sm text-muted-foreground mb-2">Measures time since 25-period high</p>
                <p className="text-xs text-muted-foreground">
                  Formula: ((25 - Periods Since 25-Period High) / 25) × 100
                  <br />• 100 = New high today
                  <br />• 0 = No new high in 25 periods
                </p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Aroon-Down (Bearish Line)</p>
                <p className="text-sm text-muted-foreground mb-2">Measures time since 25-period low</p>
                <p className="text-xs text-muted-foreground">
                  Formula: ((25 - Periods Since 25-Period Low) / 25) × 100
                  <br />• 100 = New low today
                  <br />• 0 = No new low in 25 periods
                </p>
              </div>
            </div>
          </section>

          {/* Aroon Signal Patterns */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Aroon Signal Patterns</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Strong Uptrend</h3>
                <p className="text-sm text-muted-foreground mb-2">Aroon-Up: 70-100 | Aroon-Down: 0-30</p>
                <p className="text-xs text-muted-foreground">Stock making new highs recently, no new lows. Strong bullish momentum with high probability of trend continuation.</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Strong Downtrend</h3>
                <p className="text-sm text-muted-foreground mb-2">Aroon-Up: 0-30 | Aroon-Down: 70-100</p>
                <p className="text-xs text-muted-foreground">Stock making new lows recently, no new highs. Strong bearish momentum with high probability of trend continuation.</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-lg mb-2 text-blue-500">Consolidation</h3>
                <p className="text-sm text-muted-foreground mb-2">Both Aroon-Up and Aroon-Down: 0-50</p>
                <p className="text-xs text-muted-foreground">No new highs or lows recently. Weak trend or sideways movement. Wait for clear breakout signal.</p>
              </div>
              <div className="bg-purple-600/10 p-5 rounded-lg border border-purple-500/30">
                <h3 className="font-bold text-lg mb-2 text-purple-500">Trend Change</h3>
                <p className="text-sm text-muted-foreground mb-2">Aroon-Up crosses above/below Aroon-Down</p>
                <p className="text-xs text-muted-foreground">Crossover signals potential trend reversal. Confirm with price action and other indicators before trading.</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Aroon Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Aroon-Up crosses above Aroon-Down (bullish crossover)</li>
                  <li>• Aroon-Up above 70 with Aroon-Down below 30 (strong uptrend)</li>
                  <li>• Aroon Oscillator crosses above zero (momentum turning positive)</li>
                  <li>• Aroon-Up rising toward 100 (making new highs frequently)</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Aroon-Down crosses above Aroon-Up (bearish crossover)</li>
                  <li>• Aroon-Down above 70 with Aroon-Up below 30 (strong downtrend)</li>
                  <li>• Aroon Oscillator crosses below zero (momentum turning negative)</li>
                  <li>• Aroon-Down rising toward 100 (making new lows frequently)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered Aroon analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {aroonFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="aroon" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
