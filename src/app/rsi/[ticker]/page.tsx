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
    title: `${symbol} RSI Indicator - Relative Strength Index Analysis`,
    description: `${symbol} RSI (Relative Strength Index) analysis. Check if ${symbol} is overbought or oversold with real-time RSI indicator readings and momentum signals.`,
    keywords: [
      `${symbol} RSI`,
      `${symbol} relative strength index`,
      `${symbol} overbought`,
      `${symbol} oversold`,
      `${symbol} momentum indicator`,
      `${symbol} technical analysis`,
    ],
    openGraph: {
      title: `${symbol} RSI Indicator | Overbought/Oversold Analysis`,
      description: `Real-time RSI analysis for ${symbol} with overbought and oversold signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/rsi/${ticker.toLowerCase()}`,
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

export default async function RSIPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/rsi/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const rsiFaqs = [
    {
      question: `What is the RSI for ${symbol} stock?`,
      answer: `The RSI (Relative Strength Index) is a momentum oscillator that measures the speed and magnitude of ${symbol}'s price changes. RSI values range from 0 to 100, with readings above 70 indicating overbought conditions and below 30 indicating oversold conditions.`
    },
    {
      question: `Is ${symbol} overbought or oversold?`,
      answer: `An RSI above 70 suggests ${symbol} may be overbought and due for a pullback, while an RSI below 30 suggests it may be oversold and due for a bounce. Check the current RSI reading and historical trends to identify potential entry and exit points.`
    },
    {
      question: `How do you use RSI for ${symbol} trading?`,
      answer: `Traders use ${symbol} RSI to identify potential reversal points. When RSI crosses above 30 from oversold territory, it may signal a buying opportunity. When RSI crosses below 70 from overbought territory, it may signal a selling opportunity. Divergences between price and RSI can also indicate trend reversals.`
    },
    {
      question: `What is a good RSI value for ${symbol}?`,
      answer: `For ${symbol}, an RSI between 40-60 suggests neutral momentum. RSI above 60 indicates bullish momentum, while below 40 suggests bearish momentum. Extreme readings (above 80 or below 20) often precede significant price reversals.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} RSI`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} RSI Indicator - Relative Strength Index Analysis`,
      description: `Real-time RSI analysis for ${symbol} (${companyName}) with overbought and oversold signals.`,
      url: pageUrl,
      keywords: [`${symbol} RSI`, `${symbol} relative strength index`, `${symbol} momentum`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(rsiFaqs),
    getTableSchema({
      name: `${symbol} RSI History`,
      description: `Historical RSI data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'RSI', 'Change'],
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
            <span>{symbol} RSI</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} RSI Indicator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Relative Strength Index & momentum analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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

          {/* RSI Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding RSI for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What is RSI?</h3>
                <p className="text-muted-foreground">
                  The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and magnitude of {symbol}'s
                  recent price changes to evaluate overbought or oversold conditions. It ranges from 0 to 100.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">How to Interpret RSI</h3>
                <p className="text-muted-foreground">
                  RSI above 70 indicates {symbol} may be overbought (potentially overvalued). RSI below 30 indicates {symbol}
                  may be oversold (potentially undervalued). These levels can signal potential reversal points.
                </p>
              </div>
            </div>
          </section>

          {/* RSI Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">RSI Interpretation Levels</h2>
            <div className="space-y-4">
              {[
                { range: '70-100', signal: 'Overbought', desc: 'Strong momentum, potential pullback', color: 'red' },
                { range: '60-70', signal: 'Bullish', desc: 'Positive momentum, uptrend likely', color: 'green' },
                { range: '40-60', signal: 'Neutral', desc: 'Balanced momentum, no clear signal', color: 'gray' },
                { range: '30-40', signal: 'Bearish', desc: 'Negative momentum, downtrend likely', color: 'orange' },
                { range: '0-30', signal: 'Oversold', desc: 'Weak momentum, potential bounce', color: 'blue' },
              ].map((level, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{level.range}</p>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-medium text-${level.color}-500 bg-${level.color}-500/10`}>
                      {level.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">RSI Trading Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Overbought/Oversold', desc: 'Buy when RSI < 30, sell when RSI > 70' },
                { title: 'Divergence', desc: 'Look for price/RSI divergences for reversals' },
                { title: 'Centerline Crossover', desc: 'RSI above 50 = bullish, below 50 = bearish' },
                { title: 'Swing Rejections', desc: 'RSI failure swings signal strong reversals' },
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
            <h2 className="text-2xl font-bold mb-4">Live RSI Indicator for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time RSI and other technical indicators</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Chart
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {rsiFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="rsi" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
