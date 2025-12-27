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
    title: `${symbol} MACD Indicator - Moving Average Convergence Divergence`,
    description: `${symbol} MACD (Moving Average Convergence Divergence) analysis. View MACD line, signal line, histogram, and momentum trend signals for ${symbol} stock.`,
    keywords: [
      `${symbol} MACD`,
      `${symbol} moving average convergence divergence`,
      `${symbol} MACD indicator`,
      `${symbol} trend analysis`,
      `${symbol} momentum`,
      `${symbol} technical signals`,
    ],
    openGraph: {
      title: `${symbol} MACD Indicator | Trend & Momentum Analysis`,
      description: `Real-time MACD analysis for ${symbol} with trend signals and momentum indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/macd/${ticker.toLowerCase()}`,
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

export default async function MACDPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/macd/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const macdFaqs = [
    {
      question: `What is the MACD for ${symbol} stock?`,
      answer: `MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator for ${symbol}. It shows the relationship between two moving averages of ${symbol}'s price, helping identify trend direction, strength, and potential reversals.`
    },
    {
      question: `How do you read the MACD indicator for ${symbol}?`,
      answer: `The MACD for ${symbol} consists of three components: the MACD line (12-period EMA minus 26-period EMA), the signal line (9-period EMA of MACD), and the histogram (difference between MACD and signal line). When MACD crosses above the signal line, it's a bullish signal. When it crosses below, it's bearish.`
    },
    {
      question: `Is ${symbol} showing a bullish or bearish MACD signal?`,
      answer: `A bullish MACD signal for ${symbol} occurs when the MACD line crosses above the signal line, suggesting upward momentum. A bearish signal occurs when the MACD line crosses below the signal line, suggesting downward momentum. Check the current MACD position and histogram for real-time signals.`
    },
    {
      question: `What does MACD divergence mean for ${symbol}?`,
      answer: `MACD divergence for ${symbol} occurs when the price moves in one direction but MACD moves in another. Bullish divergence (price makes lower lows but MACD makes higher lows) can signal an upward reversal. Bearish divergence (price makes higher highs but MACD makes lower highs) can signal a downward reversal.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} MACD`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} MACD Indicator - Moving Average Convergence Divergence`,
      description: `Comprehensive MACD analysis for ${symbol} (${companyName}) with trend and momentum signals.`,
      url: pageUrl,
      keywords: [`${symbol} MACD`, `${symbol} trend analysis`, `${symbol} momentum`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(macdFaqs),
    getTableSchema({
      name: `${symbol} MACD History`,
      description: `Historical MACD data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'MACD', 'Change'],
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
            <span>{symbol} MACD</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} MACD Indicator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Moving Average Convergence Divergence analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
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

          {/* MACD Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">MACD Components for {symbol}</h2>
            <div className="grid gap-4">
              {[
                {
                  name: 'MACD Line',
                  desc: '12-period EMA minus 26-period EMA',
                  interpretation: 'Shows short-term momentum vs long-term momentum'
                },
                {
                  name: 'Signal Line',
                  desc: '9-period EMA of the MACD line',
                  interpretation: 'Acts as a trigger for buy/sell signals'
                },
                {
                  name: 'Histogram',
                  desc: 'Difference between MACD and Signal line',
                  interpretation: 'Visualizes the distance between the two lines'
                },
              ].map((component, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{component.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{component.desc}</p>
                  <p className="text-sm text-foreground">{component.interpretation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MACD Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">MACD Trading Signals</h2>
            <div className="space-y-4">
              {[
                {
                  signal: 'Bullish Crossover',
                  desc: 'MACD line crosses above signal line',
                  action: 'Potential buy signal - upward momentum'
                },
                {
                  signal: 'Bearish Crossover',
                  desc: 'MACD line crosses below signal line',
                  action: 'Potential sell signal - downward momentum'
                },
                {
                  signal: 'Bullish Divergence',
                  desc: 'Price makes lower lows, MACD makes higher lows',
                  action: 'Potential trend reversal to upside'
                },
                {
                  signal: 'Bearish Divergence',
                  desc: 'Price makes higher highs, MACD makes lower highs',
                  action: 'Potential trend reversal to downside'
                },
                {
                  signal: 'Zero Line Cross',
                  desc: 'MACD crosses above or below zero',
                  action: 'Confirms trend direction change'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.signal}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-green-500">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">MACD Trading Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Signal Line Crossover', desc: 'Most common strategy - buy on bullish cross, sell on bearish cross' },
                { title: 'Zero Line Cross', desc: 'Buy when MACD crosses above zero, sell when below' },
                { title: 'Divergence Trading', desc: 'Look for price/MACD divergences for reversal opportunities' },
                { title: 'Histogram Reversals', desc: 'Watch for histogram peak reversals to anticipate crossovers' },
              ].map((strategy, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold mb-2">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Live MACD for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time MACD indicator with signal line and histogram</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Chart
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {macdFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="macd" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
