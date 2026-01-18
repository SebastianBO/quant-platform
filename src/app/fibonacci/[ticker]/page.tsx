import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
// Increase timeout to prevent 5xx errors
export const maxDuration = 60

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
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Technical Analysis</Link>
            {' / '}
            <span>{symbol} Fibonacci</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Fibonacci Retracement</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Fibonacci levels & retracement calculator</p>

          {/* Price Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Swing High</p>
                <p className="text-3xl font-bold tabular-nums text-[#4ebe96]">${swingHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Swing Low</p>
                <p className="text-2xl font-bold tabular-nums text-[#ff5c5c]">${swingLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Change</p>
                <p className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Fibonacci Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Fibonacci Retracement Levels</h2>
            <div className="space-y-3">
              {Object.entries(fibLevels).reverse().map(([level, value], i) => {
                const isKeyLevel = ['61.8%', '50%', '38.2%'].includes(level)
                const isCurrentLevel = Math.abs(price - value) < range * 0.05

                return (
                  <div
                    key={level}
                    className={`p-4 rounded-2xl border motion-safe:transition-all motion-safe:duration-150 ease-out ${
                      isCurrentLevel
                        ? 'bg-[#479ffa]/10 border-[#479ffa]/30'
                        : isKeyLevel
                          ? 'bg-[#ffa16c]/10 border-[#ffa16c]/30'
                          : 'bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`font-bold text-lg ${isKeyLevel ? 'text-[#ffa16c]' : ''}`}>
                          {level} Fibonacci Level
                        </span>
                        {isKeyLevel && <span className="ml-2 text-xs text-[#ffa16c]">Key Level</span>}
                        {isCurrentLevel && <span className="ml-2 text-xs text-[#479ffa]">Near Current Price</span>}
                      </div>
                      <span className="text-xl font-bold tabular-nums">${value.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Key Fibonacci Ratios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding Fibonacci Ratios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { level: '23.6%', desc: 'Shallow retracement', importance: 'Minor support/resistance' },
                { level: '38.2%', desc: 'Moderate retracement', importance: 'Strong support level' },
                { level: '50%', desc: 'Psychological level', importance: 'Not true Fibonacci but key level' },
                { level: '61.8%', desc: 'Golden ratio', importance: 'Most important Fib level' },
                { level: '78.6%', desc: 'Deep retracement', importance: 'Last chance support' },
                { level: '100%', desc: 'Full retracement', importance: 'Trend reversal zone' },
              ].map((fib, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-[#ffa16c]">{fib.level}</p>
                    <p className="text-xl font-bold tabular-nums">${fibLevels[fib.level as keyof typeof fibLevels]?.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-[#868f97] mb-1">{fib.desc}</p>
                  <p className="text-xs text-[#4ebe96]">{fib.importance}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Fibonacci Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-2 text-[#4ebe96]">Uptrend Retracement Strategy</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li>• Identify strong uptrend with clear swing low to swing high</li>
                  <li>• Wait for price to retrace to 38.2%, 50%, or 61.8% level</li>
                  <li>• Look for bullish reversal patterns at Fibonacci levels</li>
                  <li>• Enter long when price bounces off support level</li>
                  <li>• Stop loss below the next Fibonacci level</li>
                  <li>• Target previous swing high or Fibonacci extensions</li>
                </ul>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#ff5c5c]/30 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-2 text-[#ff5c5c]">Downtrend Retracement Strategy</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
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
            <h2 className="text-2xl font-bold mb-4 text-balance">Fibonacci Extensions (Price Targets)</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-[#868f97] mb-4">
                Fibonacci extensions project potential price targets beyond the initial move:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['127.2%', '161.8%', '200%', '261.8%'].map(ext => (
                  <div key={ext} className="text-center p-3 bg-[#ffa16c]/10 rounded-2xl border border-[#ffa16c]/30 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-[#ffa16c]/20 hover:border-[#ffa16c]/40">
                    <p className="text-sm text-[#868f97]">Extension</p>
                    <p className="font-bold text-lg text-[#ffa16c]">{ext}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Get Live Fibonacci Analysis</h2>
            <p className="text-[#868f97] mb-6">Automatic Fibonacci level calculations with real-time updates</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fibonacciFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
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
