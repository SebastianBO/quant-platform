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
    title: `${symbol} Fibonacci Retracement - Fib Levels & Retracement Calculator`,
    description: `${symbol} Fibonacci retracement levels with 23.6%, 38.2%, 50%, 61.8% support/resistance. Calculate ${symbol} Fibonacci levels for trading and technical analysis.`,
    keywords: [
      `${symbol} fibonacci`,
      `${symbol} fibonacci retracement`,
      `${symbol} fib levels`,
      `${symbol} fibonacci calculator`,
      `${symbol} 61.8 fibonacci`,
      `${symbol} golden ratio`,
    ],
    openGraph: {
      title: `${symbol} Fibonacci Retracement | Fib Levels Calculator`,
      description: `Calculate ${symbol} Fibonacci retracement levels for support and resistance trading.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fibonacci/${ticker.toLowerCase()}`,
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

export default async function FibonacciPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fibonacci/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  // Calculate Fibonacci levels using 52-week high/low as swing points
  const swingHigh = snapshot.yearHigh || price * 1.3
  const swingLow = snapshot.yearLow || price * 0.7
  const range = swingHigh - swingLow

  const fibLevels = {
    '0%': swingLow,
    '23.6%': swingLow + (range * 0.236),
    '38.2%': swingLow + (range * 0.382),
    '50%': swingLow + (range * 0.5),
    '61.8%': swingLow + (range * 0.618),
    '78.6%': swingLow + (range * 0.786),
    '100%': swingHigh,
  }

  const fibonacciFaqs = [
    {
      question: `What are ${symbol} Fibonacci levels?`,
      answer: `${symbol} Fibonacci retracement levels are horizontal lines that indicate potential support and resistance at key Fibonacci ratios: 23.6%, 38.2%, 50%, 61.8%, and 78.6%. Based on the 52-week range ($${swingLow.toFixed(2)} - $${swingHigh.toFixed(2)}), these levels help identify potential reversal zones.`
    },
    {
      question: `How do you calculate ${symbol} Fibonacci retracement?`,
      answer: `${symbol} Fibonacci retracement is calculated by taking the vertical distance between a swing high ($${swingHigh.toFixed(2)}) and swing low ($${swingLow.toFixed(2)}), then multiplying by key Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%) to find potential support/resistance levels.`
    },
    {
      question: `What is the 61.8% Fibonacci level for ${symbol}?`,
      answer: `The 61.8% Fibonacci retracement level for ${symbol} is $${fibLevels['61.8%'].toFixed(2)}. This is the "golden ratio" and often the most important Fibonacci level, where price frequently finds support during pullbacks in an uptrend or resistance in a downtrend.`
    },
    {
      question: `How to use ${symbol} Fibonacci for trading?`,
      answer: `Use ${symbol} Fibonacci levels by: (1) Identifying the trend, (2) Drawing from swing low to swing high in uptrends, (3) Looking for price reactions at key levels (38.2%, 50%, 61.8%), (4) Entering trades on bounces at support levels, (5) Placing stop losses below the next Fibonacci level.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Fibonacci`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Fibonacci Retracement - Fib Levels Calculator`,
      description: `Calculate ${symbol} (${companyName}) Fibonacci retracement levels for support and resistance.`,
      url: pageUrl,
      keywords: [`${symbol} fibonacci`, `${symbol} fibonacci retracement`, `${symbol} fib levels`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fibonacciFaqs),
    getTableSchema({
      name: `${symbol} Fibonacci History`,
      description: `Historical Fibonacci data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Fibonacci', 'Change'],
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
            <span>{symbol} Fibonacci</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Fibonacci Retracement</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Fibonacci levels & retracement calculator</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Swing High</p>
                <p className="text-3xl font-bold text-green-500">${swingHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Swing Low</p>
                <p className="text-2xl font-bold text-red-500">${swingLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Change</p>
                <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Fibonacci Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fibonacci Retracement Levels</h2>
            <div className="space-y-3">
              {Object.entries(fibLevels).reverse().map(([level, value], i) => {
                const isKeyLevel = ['61.8%', '50%', '38.2%'].includes(level)
                const isCurrentLevel = Math.abs(price - value) < range * 0.05

                return (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border ${
                      isCurrentLevel
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : isKeyLevel
                          ? 'bg-amber-600/10 border-amber-500/30'
                          : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`font-bold text-lg ${isKeyLevel ? 'text-amber-400' : ''}`}>
                          {level} Fibonacci Level
                        </span>
                        {isKeyLevel && <span className="ml-2 text-xs text-amber-500">Key Level</span>}
                        {isCurrentLevel && <span className="ml-2 text-xs text-blue-500">Near Current Price</span>}
                      </div>
                      <span className="text-xl font-bold">${value.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Key Fibonacci Ratios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Fibonacci Ratios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { level: '23.6%', desc: 'Shallow retracement', importance: 'Minor support/resistance' },
                { level: '38.2%', desc: 'Moderate retracement', importance: 'Strong support level' },
                { level: '50%', desc: 'Psychological level', importance: 'Not true Fibonacci but key level' },
                { level: '61.8%', desc: 'Golden ratio', importance: 'Most important Fib level' },
                { level: '78.6%', desc: 'Deep retracement', importance: 'Last chance support' },
                { level: '100%', desc: 'Full retracement', importance: 'Trend reversal zone' },
              ].map((fib, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-amber-400">{fib.level}</p>
                    <p className="text-xl font-bold">${fibLevels[fib.level as keyof typeof fibLevels]?.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{fib.desc}</p>
                  <p className="text-xs text-green-500">{fib.importance}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fibonacci Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Uptrend Retracement Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Identify strong uptrend with clear swing low to swing high</li>
                  <li>• Wait for price to retrace to 38.2%, 50%, or 61.8% level</li>
                  <li>• Look for bullish reversal patterns at Fibonacci levels</li>
                  <li>• Enter long when price bounces off support level</li>
                  <li>• Stop loss below the next Fibonacci level</li>
                  <li>• Target previous swing high or Fibonacci extensions</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Downtrend Retracement Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Identify strong downtrend with swing high to swing low</li>
                  <li>• Wait for price to retrace to 38.2%, 50%, or 61.8% level</li>
                  <li>• Look for bearish reversal patterns at Fibonacci resistance</li>
                  <li>• Enter short when price rejects resistance level</li>
                  <li>• Stop loss above the next Fibonacci level</li>
                  <li>• Target previous swing low or Fibonacci extensions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fibonacci Extensions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fibonacci Extensions (Price Targets)</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Fibonacci extensions project potential price targets beyond the initial move:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['127.2%', '161.8%', '200%', '261.8%'].map(ext => (
                  <div key={ext} className="text-center p-3 bg-amber-600/10 rounded-lg border border-amber-500/30">
                    <p className="text-sm text-muted-foreground">Extension</p>
                    <p className="font-bold text-lg text-amber-400">{ext}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Live Fibonacci Analysis</h2>
            <p className="text-muted-foreground mb-6">Automatic Fibonacci level calculations with real-time updates</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fibonacciFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="fibonacci" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
