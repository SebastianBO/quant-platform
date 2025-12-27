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
    title: `${symbol} Bollinger Bands - Volatility & Price Channel Analysis`,
    description: `${symbol} Bollinger Bands analysis. View upper band, lower band, bandwidth, squeeze signals, and volatility indicators for ${symbol} stock trading.`,
    keywords: [
      `${symbol} bollinger bands`,
      `${symbol} BB indicator`,
      `${symbol} volatility bands`,
      `${symbol} squeeze`,
      `${symbol} bandwidth`,
      `${symbol} price channels`,
    ],
    openGraph: {
      title: `${symbol} Bollinger Bands | Volatility Channel Analysis`,
      description: `Real-time Bollinger Bands analysis for ${symbol} with squeeze and breakout signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/bollinger-bands/${ticker.toLowerCase()}`,
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

export default async function BollingerBandsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/bollinger-bands/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const bbFaqs = [
    {
      question: `What are Bollinger Bands for ${symbol}?`,
      answer: `Bollinger Bands for ${symbol} are volatility bands placed above and below a moving average. The bands widen during volatile periods and contract during quiet periods. They consist of three lines: middle band (20-day SMA), upper band (middle + 2 standard deviations), and lower band (middle - 2 standard deviations).`
    },
    {
      question: `How do you trade ${symbol} with Bollinger Bands?`,
      answer: `For ${symbol}, when price touches the upper band, it may be overbought (potential sell signal). When price touches the lower band, it may be oversold (potential buy signal). Bollinger Band squeezes (narrow bands) often precede significant breakouts. Look for price to bounce off bands or break through them with volume.`
    },
    {
      question: `What is a Bollinger Band squeeze for ${symbol}?`,
      answer: `A Bollinger Band squeeze occurs when ${symbol}'s bands contract to narrow levels, indicating very low volatility. This typically precedes a period of high volatility and a significant price movement. Traders watch for the squeeze to identify potential breakout opportunities, though the direction isn't predetermined.`
    },
    {
      question: `What does it mean when ${symbol} breaks the Bollinger Bands?`,
      answer: `When ${symbol} price moves outside the Bollinger Bands, it indicates extreme price action. A break above the upper band suggests strong bullish momentum (potentially overbought). A break below the lower band suggests strong bearish momentum (potentially oversold). These "walking the bands" moves often signal strong trends.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Bollinger Bands`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Bollinger Bands - Volatility & Price Channel Analysis`,
      description: `Comprehensive Bollinger Bands analysis for ${symbol} (${companyName}) with squeeze and breakout signals.`,
      url: pageUrl,
      keywords: [`${symbol} bollinger bands`, `${symbol} volatility`, `${symbol} squeeze`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(bbFaqs),
    getTableSchema({
      name: `${symbol} Bollinger Bands History`,
      description: `Historical Bollinger Bands data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Bollinger Bands', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Technical Analysis</Link>
            {' / '}
            <span>{symbol} Bollinger Bands</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Bollinger Bands</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Volatility bands & price channel analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
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

          {/* Bollinger Bands Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bollinger Bands Components</h2>
            <div className="grid gap-4">
              {[
                {
                  name: 'Upper Band',
                  formula: 'Middle Band + (2 × Standard Deviation)',
                  meaning: 'Represents overbought area - resistance level'
                },
                {
                  name: 'Middle Band',
                  formula: '20-period Simple Moving Average',
                  meaning: 'Acts as dynamic support/resistance and trend indicator'
                },
                {
                  name: 'Lower Band',
                  formula: 'Middle Band - (2 × Standard Deviation)',
                  meaning: 'Represents oversold area - support level'
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

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bollinger Bands Trading Signals</h2>
            <div className="space-y-4">
              {[
                {
                  signal: 'Bollinger Bounce',
                  desc: 'Price bounces off upper or lower band',
                  action: 'Buy at lower band, sell at upper band (range-bound markets)'
                },
                {
                  signal: 'Bollinger Squeeze',
                  desc: 'Bands contract to historically narrow levels',
                  action: 'Prepare for volatility expansion and breakout'
                },
                {
                  signal: 'Walking the Bands',
                  desc: 'Price consistently touches or exceeds upper/lower band',
                  action: 'Indicates strong trend - upper band = bullish, lower = bearish'
                },
                {
                  signal: 'Double Bottom at Lower Band',
                  desc: 'Two bottoms, second holds above first',
                  action: 'Strong buy signal - W-bottom pattern'
                },
                {
                  signal: 'Double Top at Upper Band',
                  desc: 'Two tops, second holds below first',
                  action: 'Strong sell signal - M-top pattern'
                },
                {
                  signal: 'Bandwidth Expansion',
                  desc: 'Bands rapidly widen after squeeze',
                  action: 'Confirms breakout direction with increased volatility'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.signal}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-cyan-500">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bollinger Band Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bollinger Band Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Mean Reversion',
                  desc: 'Buy when price touches lower band, sell when it reaches middle or upper band',
                  best: 'Ranging markets'
                },
                {
                  title: 'Squeeze Breakout',
                  desc: 'Wait for bands to squeeze, then trade the breakout direction with volume',
                  best: 'Low volatility before events'
                },
                {
                  title: 'Trend Following',
                  desc: 'When price walks the bands, trade in direction of trend until reversal',
                  best: 'Strong trending markets'
                },
                {
                  title: 'BB + RSI Combo',
                  desc: 'Combine with RSI - oversold at lower band + RSI < 30 = strong buy',
                  best: 'Confirmation strategies'
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

          {/* Understanding Bandwidth */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Bollinger Bandwidth</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What is Bandwidth?</h3>
                <p className="text-muted-foreground">
                  Bandwidth measures the distance between the upper and lower Bollinger Bands. It's calculated as
                  (Upper Band - Lower Band) / Middle Band. Narrow bandwidth indicates low volatility, while wide
                  bandwidth indicates high volatility.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">How to Use Bandwidth</h3>
                <p className="text-muted-foreground">
                  When bandwidth reaches historical lows (squeeze), expect a volatility expansion. When bandwidth
                  reaches historical highs, volatility may contract. The "Squeeze" indicator identifies when bandwidth
                  is at multi-month lows, signaling potential major moves ahead.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Live Bollinger Bands for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time Bollinger Bands with squeeze and breakout signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Chart
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {bbFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="bollinger-bands" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
