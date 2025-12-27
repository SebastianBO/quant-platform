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
    title: `${symbol} Momentum Analysis - Stock Price Momentum Indicators`,
    description: `${symbol} momentum analysis with RSI, MACD, moving averages, and price momentum indicators. Track ${symbol} stock momentum signals and trading opportunities.`,
    keywords: [
      `${symbol} momentum`,
      `${symbol} momentum analysis`,
      `${symbol} price momentum`,
      `${symbol} momentum indicators`,
      `${symbol} RSI`,
      `${symbol} MACD`,
    ],
    openGraph: {
      title: `${symbol} Momentum Analysis | Price Momentum Indicators`,
      description: `Comprehensive ${symbol} momentum analysis with technical indicators and momentum signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/momentum/${ticker.toLowerCase()}`,
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

export default async function MomentumPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/momentum/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const momentumFaqs = [
    {
      question: `What is ${symbol} momentum?`,
      answer: `${symbol} momentum measures the rate of price change and strength of the trend. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, momentum indicators help identify trend strength and potential reversals.`
    },
    {
      question: `How do you measure ${symbol} momentum?`,
      answer: `${symbol} momentum is measured using indicators like RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Rate of Change (ROC), and moving average crossovers. These indicators help identify overbought/oversold conditions and trend strength.`
    },
    {
      question: `Is ${symbol} showing strong momentum?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} momentum with a ${Math.abs(changePercent).toFixed(2)}% change. Check the momentum indicators below for detailed analysis of trend strength, RSI levels, and MACD signals.`
    },
    {
      question: `What are the best momentum indicators for ${symbol}?`,
      answer: `The most effective momentum indicators for ${symbol} include RSI for overbought/oversold levels, MACD for trend direction and momentum, Stochastic Oscillator for entry/exit timing, and Rate of Change (ROC) for measuring price velocity.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Momentum`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Momentum Analysis - Price Momentum Indicators`,
      description: `Comprehensive momentum analysis for ${symbol} (${companyName}) with RSI, MACD, and momentum signals.`,
      url: pageUrl,
      keywords: [`${symbol} momentum`, `${symbol} momentum analysis`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(momentumFaqs),
    getTableSchema({
      name: `${symbol} Momentum History`,
      description: `Historical Momentum data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Momentum', 'Change'],
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
            <span>{symbol} Momentum</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Momentum Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price momentum indicators & signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Momentum</p>
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

          {/* Momentum Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Momentum Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'RSI (14)', desc: 'Relative Strength Index', value: 'Overbought > 70, Oversold < 30' },
                { name: 'MACD', desc: 'Trend & Momentum', value: 'Signal line crossovers' },
                { name: 'Stochastic', desc: 'Momentum Oscillator', value: 'Fast %K and %D lines' },
                { name: 'Rate of Change', desc: 'Price Velocity', value: 'Percentage change momentum' },
                { name: 'Moving Averages', desc: 'Trend Direction', value: '50-day vs 200-day crossover' },
                { name: 'ADX', desc: 'Trend Strength', value: 'Above 25 = strong trend' },
              ].map((ind, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{ind.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{ind.desc}</p>
                  <p className="text-xs text-muted-foreground">{ind.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Momentum Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Momentum Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Momentum Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• RSI rising from oversold territory (below 30)</li>
                  <li>• MACD line crossing above signal line</li>
                  <li>• Price breaking above 50-day moving average</li>
                  <li>• Stochastic %K crossing above %D</li>
                  <li>• Positive Rate of Change increasing</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Momentum Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• RSI falling from overbought territory (above 70)</li>
                  <li>• MACD line crossing below signal line</li>
                  <li>• Price breaking below 50-day moving average</li>
                  <li>• Stochastic %K crossing below %D</li>
                  <li>• Negative Rate of Change decreasing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered momentum analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {momentumFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="momentum" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
