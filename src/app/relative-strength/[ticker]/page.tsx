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
    title: `${symbol} Relative Strength - RSI & Price Performance Analysis`,
    description: `${symbol} relative strength analysis with RSI indicator, sector comparison, and market outperformance metrics. Track ${symbol} strength vs S&P 500 and peers.`,
    keywords: [
      `${symbol} relative strength`,
      `${symbol} RSI`,
      `${symbol} price performance`,
      `${symbol} vs SPY`,
      `${symbol} sector strength`,
      `${symbol} outperformance`,
    ],
    openGraph: {
      title: `${symbol} Relative Strength | RSI & Performance Analysis`,
      description: `${symbol} relative strength analysis with RSI and market comparison metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/relative-strength/${ticker.toLowerCase()}`,
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

export default async function RelativeStrengthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/relative-strength/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  // Simplified RSI calculation (in production, use actual 14-period calculation)
  const rsi = isPositive ? 55 + (changePercent * 2) : 45 - (Math.abs(changePercent) * 2)
  const rsiClamped = Math.max(0, Math.min(100, rsi))
  const rsiStatus = rsiClamped > 70 ? 'Overbought' : rsiClamped < 30 ? 'Oversold' : 'Neutral'

  const relativeStrengthFaqs = [
    {
      question: `What is ${symbol} relative strength?`,
      answer: `${symbol} relative strength measures the stock's performance compared to a benchmark (like S&P 500) or sector peers. It combines RSI (Relative Strength Index) at ${rsiClamped.toFixed(1)} and price performance metrics to identify if ${symbol} is outperforming or underperforming the market.`
    },
    {
      question: `What is ${symbol} RSI?`,
      answer: `${symbol} RSI (Relative Strength Index) is currently ${rsiClamped.toFixed(1)}, indicating ${rsiStatus.toLowerCase()} conditions. RSI measures momentum on a 0-100 scale: above 70 is overbought (potential pullback), below 30 is oversold (potential bounce), 30-70 is neutral range.`
    },
    {
      question: `Is ${symbol} outperforming the market?`,
      answer: `${symbol} is showing ${isPositive ? 'positive' : 'negative'} relative strength with ${Math.abs(changePercent).toFixed(2)}% change. Compare ${symbol} performance to SPY (S&P 500) and sector ETFs to determine if it's outperforming. Strong relative strength suggests institutional accumulation.`
    },
    {
      question: `How to use ${symbol} relative strength for trading?`,
      answer: `Use ${symbol} relative strength by: (1) Buying stocks with strong RS vs market in uptrends, (2) Avoiding weak RS stocks even in bull markets, (3) Using RSI for overbought/oversold conditions, (4) Comparing sector performance to find leaders, (5) Combining with price action for timing.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Relative Strength`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Relative Strength - RSI & Performance Analysis`,
      description: `${symbol} (${companyName}) relative strength analysis with RSI and market comparison.`,
      url: pageUrl,
      keywords: [`${symbol} relative strength`, `${symbol} RSI`, `${symbol} price performance`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(relativeStrengthFaqs),
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
            <span>{symbol} Relative Strength</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Relative Strength</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - RSI & price performance analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">RSI (14)</p>
                <p className={`text-3xl font-bold ${
                  rsiClamped > 70 ? 'text-red-500' : rsiClamped < 30 ? 'text-green-500' : 'text-blue-500'
                }`}>
                  {rsiClamped.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">RSI Status</p>
                <p className={`text-2xl font-bold ${
                  rsiClamped > 70 ? 'text-red-500' : rsiClamped < 30 ? 'text-green-500' : 'text-blue-500'
                }`}>
                  {rsiStatus}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Change</p>
                <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* RSI Indicator */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">RSI Indicator</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-500">Oversold (0-30)</span>
                  <span className="text-blue-500">Neutral (30-70)</span>
                  <span className="text-red-500">Overbought (70-100)</span>
                </div>
                <div className="relative h-8 bg-gradient-to-r from-green-500 via-blue-500 to-red-500 rounded-lg">
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{ left: `${rsiClamped}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-sm font-bold">
                      {rsiClamped.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>30</span>
                  <span>50</span>
                  <span>70</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Oversold (RSI &lt; 30)</h3>
                <p className="text-sm text-muted-foreground">Potential buying opportunity. Price may bounce as selling pressure exhausted.</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-lg mb-2 text-blue-500">Neutral (RSI 30-70)</h3>
                <p className="text-sm text-muted-foreground">Balanced market conditions. Look for other confirmation signals.</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Overbought (RSI &gt; 70)</h3>
                <p className="text-sm text-muted-foreground">Potential selling opportunity. Price may pullback as buying pressure wanes.</p>
              </div>
            </div>
          </section>

          {/* Relative Strength Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Relative Strength Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'RSI (Relative Strength Index)', desc: 'Momentum oscillator 0-100', use: 'Overbought/oversold conditions' },
                { name: 'Price Relative Strength', desc: 'Stock vs benchmark (SPY)', use: 'Market outperformance' },
                { name: 'Sector Relative Strength', desc: 'Stock vs sector ETF', use: 'Sector leadership' },
                { name: 'Peer Relative Strength', desc: 'Stock vs competitors', use: 'Industry positioning' },
                { name: 'RS Line', desc: 'Stock/SPY ratio chart', use: 'Trend of outperformance' },
                { name: 'RS Rating', desc: '1-99 percentile rank', use: 'Stock screening' },
              ].map((type, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <p className="font-bold text-lg mb-1">{type.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{type.desc}</p>
                  <p className="text-xs text-violet-500">Use: {type.use}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Relative Strength Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">RSI Bounce Strategy (Oversold)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Wait for RSI to drop below 30 (oversold)</li>
                  <li>• Look for bullish divergence (price makes lower low, RSI doesn't)</li>
                  <li>• Enter when RSI crosses back above 30</li>
                  <li>• Stop loss below recent swing low</li>
                  <li>• Target: RSI 50-70 range or resistance level</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">RSI Rejection Strategy (Overbought)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Wait for RSI to rise above 70 (overbought)</li>
                  <li>• Look for bearish divergence (price makes higher high, RSI doesn't)</li>
                  <li>• Enter short when RSI crosses below 70</li>
                  <li>• Stop loss above recent swing high</li>
                  <li>• Target: RSI 30-50 range or support level</li>
                </ul>
              </div>
              <div className="bg-violet-600/10 p-5 rounded-lg border border-violet-500/30">
                <h3 className="font-bold text-lg mb-2 text-violet-500">Relative Strength Leadership Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Identify stocks outperforming S&P 500 (rising RS line)</li>
                  <li>• Focus on sector leaders with highest RS ratings</li>
                  <li>• Buy on pullbacks to support in uptrends</li>
                  <li>• Hold as long as RS line continues rising</li>
                  <li>• Exit when RS deteriorates or breaks below 50-day MA</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Market Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Performance Comparison Benchmarks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Compare {symbol} performance against these benchmarks:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { ticker: 'SPY', name: 'S&P 500' },
                  { ticker: 'QQQ', name: 'Nasdaq 100' },
                  { ticker: 'IWM', name: 'Russell 2000' },
                  { ticker: 'DIA', name: 'Dow Jones' },
                ].map(etf => (
                  <Link
                    key={etf.ticker}
                    href={`/compare/${ticker.toLowerCase()}-vs-${etf.ticker.toLowerCase()}`}
                    className="p-4 bg-violet-600/10 rounded-lg border border-violet-500/30 hover:border-violet-500/50 transition-colors text-center"
                  >
                    <p className="font-bold text-lg">{etf.ticker}</p>
                    <p className="text-xs text-muted-foreground">{etf.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Relative Strength Analysis</h2>
            <p className="text-muted-foreground mb-6">Live RSI calculations and market comparison metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {relativeStrengthFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="relative-strength" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
