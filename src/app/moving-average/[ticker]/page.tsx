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
    title: `${symbol} Moving Averages - SMA, EMA & Trend Analysis`,
    description: `${symbol} moving average analysis. View 20-day, 50-day, 200-day SMA and EMA, golden cross, death cross, and trend signals for ${symbol} stock.`,
    keywords: [
      `${symbol} moving average`,
      `${symbol} SMA`,
      `${symbol} EMA`,
      `${symbol} 50-day moving average`,
      `${symbol} 200-day moving average`,
      `${symbol} golden cross`,
      `${symbol} death cross`,
    ],
    openGraph: {
      title: `${symbol} Moving Averages | SMA & EMA Analysis`,
      description: `Comprehensive moving average analysis for ${symbol} with trend signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/moving-average/${ticker.toLowerCase()}`,
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

export default async function MovingAveragePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/moving-average/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const maFaqs = [
    {
      question: `What are the key moving averages for ${symbol}?`,
      answer: `The most commonly watched moving averages for ${symbol} are the 20-day, 50-day, and 200-day. The 20-day SMA shows short-term trends, the 50-day indicates intermediate trends, and the 200-day represents long-term trends. When price is above these MAs, it's considered bullish.`
    },
    {
      question: `What is a golden cross for ${symbol}?`,
      answer: `A golden cross for ${symbol} occurs when the 50-day moving average crosses above the 200-day moving average, signaling a potential long-term bullish trend. This is considered one of the most reliable bullish signals in technical analysis.`
    },
    {
      question: `What is a death cross for ${symbol}?`,
      answer: `A death cross for ${symbol} occurs when the 50-day moving average crosses below the 200-day moving average, signaling a potential long-term bearish trend. This is considered a strong bearish signal and often precedes extended downtrends.`
    },
    {
      question: `Should I use SMA or EMA for ${symbol}?`,
      answer: `For ${symbol}, SMAs (Simple Moving Averages) are better for identifying long-term trends and support/resistance levels. EMAs (Exponential Moving Averages) are more responsive to recent price changes and better for short-term trading. Many traders use both to get a complete picture of ${symbol}'s trend.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Moving Averages`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Moving Averages - SMA, EMA & Trend Analysis`,
      description: `Complete moving average analysis for ${symbol} (${companyName}) with SMA, EMA, and crossover signals.`,
      url: pageUrl,
      keywords: [`${symbol} moving average`, `${symbol} SMA`, `${symbol} EMA`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(maFaqs),
    getTableSchema({
      name: `${symbol} Moving Average History`,
      description: `Historical Moving Average data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Moving Average', 'Change'],
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
            <span>{symbol} Moving Averages</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Moving Averages</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - SMA, EMA & trend analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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

          {/* Key Moving Averages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Moving Averages for {symbol}</h2>
            <div className="grid gap-4">
              {[
                { period: '20-Day MA', timeframe: 'Short-term', use: 'Day trading and swing trading' },
                { period: '50-Day MA', timeframe: 'Intermediate-term', use: 'Trend confirmation and support/resistance' },
                { period: '200-Day MA', timeframe: 'Long-term', use: 'Major trend direction and bull/bear markets' },
              ].map((ma, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{ma.period}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{ma.timeframe}</p>
                      <p className="text-sm text-foreground">Best for: {ma.use}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SMA vs EMA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">SMA vs EMA</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Simple Moving Average (SMA)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Equal weight to all prices in the period</li>
                  <li>• Smoother, less reactive to price changes</li>
                  <li>• Better for identifying long-term trends</li>
                  <li>• Popular for support/resistance levels</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Exponential Moving Average (EMA)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• More weight to recent prices</li>
                  <li>• More responsive to new price action</li>
                  <li>• Better for short-term trading signals</li>
                  <li>• Reduces lag compared to SMA</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Moving Average Trading Signals</h2>
            <div className="space-y-4">
              {[
                {
                  signal: 'Golden Cross',
                  desc: '50-day MA crosses above 200-day MA',
                  meaning: 'Strong bullish signal - long-term uptrend beginning'
                },
                {
                  signal: 'Death Cross',
                  desc: '50-day MA crosses below 200-day MA',
                  meaning: 'Strong bearish signal - long-term downtrend beginning'
                },
                {
                  signal: 'Price Above MA',
                  desc: 'Stock price trading above moving average',
                  meaning: 'Bullish - MA acts as support level'
                },
                {
                  signal: 'Price Below MA',
                  desc: 'Stock price trading below moving average',
                  meaning: 'Bearish - MA acts as resistance level'
                },
                {
                  signal: 'MA Convergence',
                  desc: 'Multiple MAs coming together',
                  meaning: 'Low volatility - potential breakout ahead'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.signal}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-green-500">{item.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Moving Average Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'MA Crossover', desc: 'Buy when fast MA crosses above slow MA, sell when it crosses below' },
                { title: 'Price Crossover', desc: 'Buy when price crosses above MA, sell when price crosses below' },
                { title: 'Dynamic Support/Resistance', desc: 'Use MAs as dynamic support in uptrends and resistance in downtrends' },
                { title: 'Multiple MA Confluence', desc: 'Look for areas where multiple MAs converge for strong support/resistance' },
              ].map((strategy, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold mb-2">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Live Moving Averages for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time moving averages on interactive charts</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Chart
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {maFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="moving-average" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
