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
    title: `${symbol} Stochastic Oscillator - Momentum & Overbought/Oversold`,
    description: `${symbol} Stochastic indicator analysis. View %K, %D lines, overbought/oversold signals, and momentum crossovers for ${symbol} stock trading.`,
    keywords: [
      `${symbol} stochastic`,
      `${symbol} stochastic oscillator`,
      `${symbol} momentum indicator`,
      `${symbol} %K %D`,
      `${symbol} overbought oversold`,
      `${symbol} stochastic crossover`,
    ],
    openGraph: {
      title: `${symbol} Stochastic Oscillator | Momentum Analysis`,
      description: `Real-time stochastic oscillator analysis for ${symbol} with momentum signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/stochastic/${ticker.toLowerCase()}`,
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

export default async function StochasticPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/stochastic/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const stochFaqs = [
    {
      question: `What is the Stochastic Oscillator for ${symbol}?`,
      answer: `The Stochastic Oscillator for ${symbol} is a momentum indicator that compares the current closing price to its price range over a specific period (typically 14 periods). It ranges from 0 to 100 and consists of two lines: %K (fast line) and %D (slow line, 3-period SMA of %K).`
    },
    {
      question: `How do you read Stochastic for ${symbol}?`,
      answer: `For ${symbol}, readings above 80 indicate overbought conditions (potential sell signal), while readings below 20 indicate oversold conditions (potential buy signal). The most reliable signals occur when %K crosses %D while in these extreme zones. Bullish crossover below 20 = buy, bearish crossover above 80 = sell.`
    },
    {
      question: `What is a Stochastic crossover for ${symbol}?`,
      answer: `A Stochastic crossover for ${symbol} occurs when the %K line crosses the %D line. A bullish crossover (when %K crosses above %D below the 20 level) suggests upward momentum and a potential buy opportunity. A bearish crossover (when %K crosses below %D above the 80 level) suggests downward momentum and a potential sell opportunity.`
    },
    {
      question: `Is ${symbol} overbought or oversold on the Stochastic?`,
      answer: `Check the current Stochastic reading for ${symbol}. Above 80 = overbought (may pull back), below 20 = oversold (may bounce). However, in strong trends, ${symbol} can remain overbought or oversold for extended periods. Always confirm with price action and other indicators.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Stochastic`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stochastic Oscillator - Momentum & Overbought/Oversold`,
      description: `Comprehensive Stochastic oscillator analysis for ${symbol} (${companyName}) with momentum crossover signals.`,
      url: pageUrl,
      keywords: [`${symbol} stochastic`, `${symbol} momentum`, `${symbol} oscillator`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(stochFaqs),
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
            <span>{symbol} Stochastic</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stochastic Oscillator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Momentum indicator & overbought/oversold analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Day Change</p>
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

          {/* Stochastic Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Stochastic Oscillator Components</h2>
            <div className="grid gap-4">
              {[
                {
                  name: '%K Line (Fast Stochastic)',
                  formula: '100 × (Current Close - Lowest Low) / (Highest High - Lowest Low)',
                  meaning: 'Raw stochastic value showing current momentum'
                },
                {
                  name: '%D Line (Slow Stochastic)',
                  formula: '3-period SMA of %K',
                  meaning: 'Signal line - smoothed %K for clearer signals'
                },
                {
                  name: 'Overbought/Oversold Levels',
                  formula: 'Overbought > 80, Oversold < 20',
                  meaning: 'Extreme zones indicating potential reversals'
                },
              ].map((component, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{component.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{component.formula}</p>
                  <p className="text-sm text-foreground">{component.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stochastic Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Stochastic Reading Zones</h2>
            <div className="space-y-4">
              {[
                { range: '80-100', zone: 'Overbought', signal: 'Potential sell signal, watch for bearish crossover', color: 'red' },
                { range: '50-80', zone: 'Bullish', signal: 'Positive momentum, upward trend likely', color: 'green' },
                { range: '20-50', zone: 'Bearish', signal: 'Negative momentum, downward trend likely', color: 'orange' },
                { range: '0-20', zone: 'Oversold', signal: 'Potential buy signal, watch for bullish crossover', color: 'blue' },
              ].map((level, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{level.range}</p>
                      <p className="text-sm text-muted-foreground">{level.signal}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-medium bg-${level.color}-500/20 text-${level.color}-500`}>
                      {level.zone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Stochastic Trading Signals</h2>
            <div className="space-y-4">
              {[
                {
                  signal: 'Bullish Crossover in Oversold',
                  desc: '%K crosses above %D when both are below 20',
                  action: 'Strong buy signal - oversold bounce expected'
                },
                {
                  signal: 'Bearish Crossover in Overbought',
                  desc: '%K crosses below %D when both are above 80',
                  action: 'Strong sell signal - overbought pullback expected'
                },
                {
                  signal: 'Bullish Divergence',
                  desc: 'Price makes lower lows, Stochastic makes higher lows',
                  action: 'Potential upward reversal - weakening downtrend'
                },
                {
                  signal: 'Bearish Divergence',
                  desc: 'Price makes higher highs, Stochastic makes lower highs',
                  action: 'Potential downward reversal - weakening uptrend'
                },
                {
                  signal: 'Failure Swing',
                  desc: 'Stochastic fails to reach overbought/oversold on rally/decline',
                  action: 'Indicates momentum loss and potential trend change'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.signal}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-violet-500">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stochastic vs RSI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Stochastic vs RSI</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Stochastic Oscillator</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Compares close to price range (high-low)</li>
                  <li>• More sensitive to price movements</li>
                  <li>• Can remain at extremes longer</li>
                  <li>• Better for ranging markets</li>
                  <li>• Uses two lines (%K and %D)</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">RSI (Relative Strength)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Measures speed and change of price movements</li>
                  <li>• Less volatile than Stochastic</li>
                  <li>• Reverses quicker from extremes</li>
                  <li>• Better for trending markets</li>
                  <li>• Single line indicator</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Stochastic Trading Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Classic Crossover',
                  desc: 'Buy when %K crosses above %D in oversold, sell when %K crosses below %D in overbought',
                  best: 'Ranging markets'
                },
                {
                  title: 'Trend Following',
                  desc: 'In uptrend, only take buy signals (oversold crossovers). In downtrend, only sell signals',
                  best: 'Trending markets'
                },
                {
                  title: 'Divergence Trading',
                  desc: 'Trade when price and Stochastic diverge, especially at extremes',
                  best: 'Reversal opportunities'
                },
                {
                  title: 'Multiple Timeframes',
                  desc: 'Use daily for trend, hourly for entry timing with Stochastic crossovers',
                  best: 'Precise entries/exits'
                },
              ].map((strategy, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold mb-2">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{strategy.desc}</p>
                  <p className="text-xs text-green-500">Best for: {strategy.best}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Live Stochastic for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time Stochastic oscillator with %K and %D lines</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Chart
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {stochFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stochastic" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
