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
    title: `${symbol} Stock Volatility - Historical Volatility & Price Swings`,
    description: `${symbol} volatility analysis. View historical volatility, implied volatility, price swings, and risk metrics for ${symbol} stock trading and options.`,
    keywords: [
      `${symbol} volatility`,
      `${symbol} historical volatility`,
      `${symbol} implied volatility`,
      `${symbol} price swings`,
      `${symbol} stock risk`,
      `${symbol} IV`,
    ],
    openGraph: {
      title: `${symbol} Stock Volatility | Historical & Implied Volatility`,
      description: `Comprehensive volatility analysis for ${symbol} with historical and implied volatility metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/volatility/${ticker.toLowerCase()}`,
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

export default async function VolatilityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/volatility/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const beta = snapshot.beta || 1.0

  const volatilityFaqs = [
    {
      question: `What is ${symbol} stock volatility?`,
      answer: `${symbol} volatility measures how much the stock's price fluctuates over time. Higher volatility means larger price swings, indicating higher risk but also potentially higher rewards. ${symbol}'s volatility is influenced by market conditions, company news, earnings reports, and sector trends.`
    },
    {
      question: `Is ${symbol} a volatile stock?`,
      answer: `With a beta of ${beta.toFixed(2)}, ${symbol} is ${beta > 1.5 ? 'highly volatile' : beta > 1 ? 'moderately volatile' : beta < 0.5 ? 'low volatility' : 'average volatility'} compared to the broader market. ${beta > 1 ? `${symbol} tends to experience larger price swings than the S&P 500.` : `${symbol} experiences smaller price movements than the overall market.`}`
    },
    {
      question: `What is the difference between historical and implied volatility for ${symbol}?`,
      answer: `Historical volatility for ${symbol} measures actual past price movements, while implied volatility reflects the market's expectation of future volatility based on options prices. High implied volatility suggests traders expect significant price movements ahead (often before earnings or major events).`
    },
    {
      question: `How does volatility affect ${symbol} options trading?`,
      answer: `Higher volatility increases option premiums for ${symbol}. When implied volatility is high, options are more expensive because there's greater uncertainty about future price movements. Options traders often buy options when IV is low and sell when IV is high (volatility selling strategies).`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Volatility`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock Volatility - Historical Volatility & Price Swings`,
      description: `Complete volatility analysis for ${symbol} (${companyName}) with historical and implied volatility metrics.`,
      url: pageUrl,
      keywords: [`${symbol} volatility`, `${symbol} historical volatility`, `${symbol} implied volatility`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(volatilityFaqs),
    getTableSchema({
      name: `${symbol} Volatility History`,
      description: `Historical Volatility data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Volatility', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Volatility</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stock Volatility</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Historical volatility & price swing analysis</p>

          {/* Volatility Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Beta (Volatility)</p>
                <p className={`text-4xl font-bold ${beta > 1.5 ? 'text-red-500' : beta > 1 ? 'text-orange-500' : 'text-green-500'}`}>
                  {beta.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Volatility Level</p>
                <p className="text-2xl font-bold">
                  {beta > 1.5 ? 'High' : beta > 1 ? 'Moderate' : beta < 0.5 ? 'Low' : 'Average'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Understanding Volatility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Volatility</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What is Volatility?</h3>
                <p className="text-muted-foreground">
                  Volatility measures the degree of variation in {symbol}'s price over time. High volatility means the price
                  can change dramatically in either direction over short periods, while low volatility means the price remains
                  relatively stable.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Why Volatility Matters</h3>
                <p className="text-muted-foreground">
                  For {symbol} traders, volatility represents opportunity and risk. High volatility creates more trading
                  opportunities but also increases risk. Options traders particularly focus on volatility since it directly
                  impacts option premiums.
                </p>
              </div>
            </div>
          </section>

          {/* Types of Volatility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Volatility</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Historical Volatility (HV)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Measures {symbol}'s actual past price movements
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Based on historical price data</li>
                  <li>• Calculated using standard deviation</li>
                  <li>• Shows realized price fluctuations</li>
                  <li>• Useful for risk assessment</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Implied Volatility (IV)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Reflects market's expectation of {symbol}'s future volatility
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Derived from options prices</li>
                  <li>• Forward-looking measure</li>
                  <li>• Increases before major events</li>
                  <li>• Drives option premium prices</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Volatility Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Volatility Level Guide</h2>
            <div className="space-y-4">
              {[
                { level: 'Very High', beta: '> 2.0', desc: 'Extreme price swings, highest risk/reward', examples: 'Small caps, biotech, meme stocks' },
                { level: 'High', beta: '1.5 - 2.0', desc: 'Large price swings, high risk/reward', examples: 'Growth stocks, tech stocks' },
                { level: 'Moderate', beta: '1.0 - 1.5', desc: 'Above-average volatility', examples: 'Many large-cap tech stocks' },
                { level: 'Average', beta: '0.5 - 1.0', desc: 'Market-like or below-average volatility', examples: 'Blue chips, dividend stocks' },
                { level: 'Low', beta: '< 0.5', desc: 'Minimal price swings, lower risk/reward', examples: 'Utilities, consumer staples' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.level} Volatility</h3>
                    <span className="text-sm font-mono bg-secondary px-3 py-1 rounded">β {item.beta}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-foreground">Common in: {item.examples}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Volatility Trading Strategies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Buy Low IV, Sell High IV', desc: 'Buy options when IV is low, sell when IV spikes (IV rank < 25% vs > 75%)' },
                { title: 'Volatility Breakout', desc: 'Trade breakouts during low volatility periods (Bollinger Band squeezes)' },
                { title: 'Earnings Volatility', desc: 'IV typically spikes before earnings, then crashes after announcement (IV crush)' },
                { title: 'VIX Correlation', desc: 'Monitor VIX for market-wide volatility trends affecting individual stocks' },
              ].map((strategy, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold mb-2">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Live Volatility Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View real-time volatility metrics and historical patterns</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {volatilityFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="volatility" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
