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
    title: `${symbol} Trend Analysis - Stock Price Trend & Direction`,
    description: `${symbol} trend analysis with moving averages, trendlines, support/resistance levels. Identify ${symbol} uptrend, downtrend, and sideways patterns.`,
    keywords: [
      `${symbol} trend`,
      `${symbol} trend analysis`,
      `${symbol} uptrend`,
      `${symbol} downtrend`,
      `${symbol} price trend`,
      `${symbol} moving averages`,
    ],
    openGraph: {
      title: `${symbol} Trend Analysis | Price Trend & Direction`,
      description: `Comprehensive ${symbol} trend analysis with moving averages and trend direction indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/trend/${ticker.toLowerCase()}`,
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

export default async function TrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/trend/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const trendFaqs = [
    {
      question: `What is ${symbol} stock trend?`,
      answer: `${symbol} stock trend indicates the general direction of price movement over time. Currently at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change. Trends are classified as uptrend (higher highs), downtrend (lower lows), or sideways (range-bound).`
    },
    {
      question: `How do you identify ${symbol} trend direction?`,
      answer: `${symbol} trend direction is identified using moving averages (50-day, 200-day), trendlines connecting highs/lows, ADX (Average Directional Index), and price action patterns. When price is above moving averages and making higher highs, it indicates an uptrend.`
    },
    {
      question: `Is ${symbol} in an uptrend or downtrend?`,
      answer: `${symbol} is currently showing ${isPositive ? 'upward' : 'downward'} momentum based on recent price action. For comprehensive trend analysis including moving average positions, trendline support, and trend strength indicators, view the full analysis below.`
    },
    {
      question: `What are the best trend indicators for ${symbol}?`,
      answer: `The most reliable trend indicators for ${symbol} include: 50-day and 200-day moving averages for long-term trends, ADX for trend strength measurement, MACD for trend changes, and trendlines for visual trend identification and support/resistance levels.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Trend`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Trend Analysis - Stock Price Trend & Direction`,
      description: `Comprehensive trend analysis for ${symbol} (${companyName}) with moving averages and trend indicators.`,
      url: pageUrl,
      keywords: [`${symbol} trend`, `${symbol} trend analysis`, `${symbol} price direction`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(trendFaqs),
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
            <span>{symbol} Trend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Trend Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price trend direction & strength</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Trend Direction</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '↗ Up' : '↘ Down'}
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

          {/* Trend Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Trend Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: '50-Day MA', desc: 'Short-term trend direction', signal: 'Price above = bullish' },
                { name: '200-Day MA', desc: 'Long-term trend direction', signal: 'Golden/Death cross signals' },
                { name: 'ADX', desc: 'Average Directional Index', signal: 'Above 25 = strong trend' },
                { name: 'Trendlines', desc: 'Support/Resistance levels', signal: 'Connect swing highs/lows' },
                { name: 'Moving Average Ribbon', desc: 'Multiple MA overlay', signal: 'Convergence/Divergence' },
                { name: 'Parabolic SAR', desc: 'Stop and Reverse', signal: 'Dots above/below price' },
              ].map((ind, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{ind.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{ind.desc}</p>
                  <p className="text-xs text-muted-foreground">{ind.signal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trend Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Trend Patterns</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Uptrend Characteristics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price consistently making higher highs and higher lows</li>
                  <li>• Trading above 50-day and 200-day moving averages</li>
                  <li>• Moving averages sloping upward</li>
                  <li>• ADX above 25 with +DI above -DI</li>
                  <li>• Trendline connecting higher lows acts as support</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Downtrend Characteristics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price consistently making lower highs and lower lows</li>
                  <li>• Trading below 50-day and 200-day moving averages</li>
                  <li>• Moving averages sloping downward</li>
                  <li>• ADX above 25 with -DI above +DI</li>
                  <li>• Trendline connecting lower highs acts as resistance</li>
                </ul>
              </div>
              <div className="bg-yellow-600/10 p-5 rounded-lg border border-yellow-500/30">
                <h3 className="font-bold text-lg mb-2 text-yellow-500">Sideways/Ranging Market</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price oscillating between support and resistance</li>
                  <li>• Moving averages flat or intertwined</li>
                  <li>• ADX below 25 indicating weak trend</li>
                  <li>• No clear higher highs or lower lows pattern</li>
                  <li>• Horizontal support and resistance lines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Trend Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered trend identification with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {trendFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="trend" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
