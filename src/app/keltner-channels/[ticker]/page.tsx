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
    title: `${symbol} Keltner Channels Analysis - Volatility & Trend Indicator`,
    description: `${symbol} Keltner Channels analysis with ATR-based bands. Track ${symbol} volatility, breakout signals, and overbought/oversold conditions.`,
    keywords: [
      `${symbol} keltner channels`,
      `${symbol} keltner indicator`,
      `${symbol} ATR bands`,
      `${symbol} volatility channels`,
      `${symbol} breakout signals`,
      `${symbol} channel trading`,
    ],
    openGraph: {
      title: `${symbol} Keltner Channels Analysis | Volatility & Trend Indicator`,
      description: `Comprehensive ${symbol} Keltner Channels analysis with volatility bands and breakout signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/keltner-channels/${ticker.toLowerCase()}`,
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

export default async function KeltnerChannelsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/keltner-channels/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const keltnerFaqs = [
    {
      question: `What are ${symbol} Keltner Channels?`,
      answer: `${symbol} Keltner Channels are volatility-based bands consisting of an EMA center line with upper and lower bands based on ATR (Average True Range). Currently trading at $${price.toFixed(2)}, these channels help identify trend direction and potential breakouts.`
    },
    {
      question: `How do you trade ${symbol} with Keltner Channels?`,
      answer: `Trade ${symbol} with Keltner Channels by watching for price touching the bands (overbought/oversold), breakouts above/below bands (strong trends), and channel squeezes (low volatility before breakouts). The middle line serves as dynamic support/resistance.`
    },
    {
      question: `What's the difference between Keltner Channels and Bollinger Bands for ${symbol}?`,
      answer: `For ${symbol}, Keltner Channels use ATR (average true range) for band width, making them smoother and less reactive than Bollinger Bands which use standard deviation. Keltner Channels are better for identifying true breakouts versus false signals.`
    },
    {
      question: `Is ${symbol} showing Keltner Channel breakout signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Keltner Channels analysis below for detailed volatility bands and breakout signals.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Keltner Channels`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Keltner Channels Analysis - Volatility & Trend Indicator`,
      description: `Comprehensive Keltner Channels analysis for ${symbol} (${companyName}) with volatility bands and breakout signals.`,
      url: pageUrl,
      keywords: [`${symbol} keltner channels`, `${symbol} volatility`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(keltnerFaqs),
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
            <span>{symbol} Keltner Channels</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Keltner Channels Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - ATR-based volatility bands & signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
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

          {/* Channel Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Keltner Channel Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Middle Line', desc: '20-period EMA', value: 'Center trend line' },
                { name: 'Upper Band', desc: 'EMA + (2 × ATR)', value: 'Upper volatility boundary' },
                { name: 'Lower Band', desc: 'EMA - (2 × ATR)', value: 'Lower volatility boundary' },
                { name: 'ATR Period', desc: 'Average True Range', value: 'Typically 10 or 20 periods' },
                { name: 'Band Width', desc: 'Distance between bands', value: 'Indicates volatility level' },
                { name: 'Channel Squeeze', desc: 'Narrow bands', value: 'Low volatility, potential breakout' },
              ].map((component, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{component.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{component.desc}</p>
                  <p className="text-xs text-muted-foreground">{component.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Keltner Channel Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price breaking above upper band with volume</li>
                  <li>• Price bouncing off lower band in uptrend</li>
                  <li>• Consistent trading above middle line (EMA)</li>
                  <li>• Channel squeeze followed by upward breakout</li>
                  <li>• Price riding along upper band (strong uptrend)</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price breaking below lower band with volume</li>
                  <li>• Price rejecting at upper band in downtrend</li>
                  <li>• Consistent trading below middle line (EMA)</li>
                  <li>• Channel squeeze followed by downward breakout</li>
                  <li>• Price riding along lower band (strong downtrend)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Keltner Channel Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time volatility bands</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {keltnerFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="keltner-channels" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
