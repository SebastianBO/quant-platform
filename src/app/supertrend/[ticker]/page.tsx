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
    title: `${symbol} Supertrend Indicator Analysis - Trend Following Signals`,
    description: `${symbol} Supertrend indicator analysis with ATR-based trend signals. Track ${symbol} buy/sell signals, trend direction, and stop-loss levels.`,
    keywords: [
      `${symbol} supertrend`,
      `${symbol} supertrend indicator`,
      `${symbol} trend signals`,
      `${symbol} ATR trend`,
      `${symbol} buy sell signals`,
      `${symbol} trend following`,
    ],
    openGraph: {
      title: `${symbol} Supertrend Indicator Analysis | Trend Following Signals`,
      description: `Comprehensive ${symbol} Supertrend analysis with buy/sell signals and trend direction.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/supertrend/${ticker.toLowerCase()}`,
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

export default async function SupertrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/supertrend/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const supertrendFaqs = [
    {
      question: `What is ${symbol} Supertrend indicator?`,
      answer: `${symbol} Supertrend is a trend-following indicator that uses ATR (Average True Range) to plot buy and sell signals. Currently trading at $${price.toFixed(2)}, the indicator shows green (buy signal) when price is above the Supertrend line and red (sell signal) when below.`
    },
    {
      question: `How do you read ${symbol} Supertrend signals?`,
      answer: `Read ${symbol} Supertrend signals by watching the indicator line color: green indicates an uptrend (stay long), red indicates a downtrend (stay short or exit). Signals trigger when the line flips color and price crosses the Supertrend level.`
    },
    {
      question: `What are the best Supertrend settings for ${symbol}?`,
      answer: `For ${symbol}, common Supertrend settings are ATR period of 10 and multiplier of 3. Shorter periods (7, 2) give more signals for active trading, while longer periods (14, 3) reduce noise for swing trading. Adjust based on volatility.`
    },
    {
      question: `Is ${symbol} showing a Supertrend buy signal?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Supertrend analysis below for detailed buy/sell signals and trend direction.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Supertrend`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Supertrend Indicator Analysis - Trend Following Signals`,
      description: `Comprehensive Supertrend analysis for ${symbol} (${companyName}) with buy/sell signals and trend direction.`,
      url: pageUrl,
      keywords: [`${symbol} supertrend`, `${symbol} trend signals`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(supertrendFaqs),
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
            <span>{symbol} Supertrend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Supertrend Indicator Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - ATR-based trend following signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
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

          {/* Supertrend Concepts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Supertrend Key Concepts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'ATR Period', desc: 'Average True Range length', value: 'Typically 10 periods' },
                { name: 'Multiplier', desc: 'ATR multiplier factor', value: 'Usually 2 to 3' },
                { name: 'Green Line', desc: 'Bullish trend signal', value: 'Price above Supertrend' },
                { name: 'Red Line', desc: 'Bearish trend signal', value: 'Price below Supertrend' },
                { name: 'Buy Signal', desc: 'Line turns green', value: 'Enter long position' },
                { name: 'Sell Signal', desc: 'Line turns red', value: 'Exit or go short' },
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
            <h2 className="text-2xl font-bold mb-4">Supertrend Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Supertrend line turns green (buy signal)</li>
                  <li>• Price closes above the Supertrend line</li>
                  <li>• Green line trending upward with price</li>
                  <li>• Use Supertrend line as trailing stop-loss</li>
                  <li>• Strong uptrend: price consistently above line</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Supertrend line turns red (sell signal)</li>
                  <li>• Price closes below the Supertrend line</li>
                  <li>• Red line trending downward with price</li>
                  <li>• Use Supertrend line as stop-loss for shorts</li>
                  <li>• Strong downtrend: price consistently below line</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Supertrend Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time Supertrend signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {supertrendFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="supertrend" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
