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
    title: `${symbol} Momentum Indicator - Price Momentum Technical Analysis`,
    description: `${symbol} Momentum Indicator analysis. Track ${symbol} price momentum, trend strength, and momentum oscillator signals for trading opportunities.`,
    keywords: [
      `${symbol} momentum indicator`,
      `${symbol} momentum oscillator`,
      `${symbol} price momentum`,
      `${symbol} momentum signals`,
      `${symbol} trend strength`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} Momentum Indicator | Price Momentum Analysis`,
      description: `Comprehensive ${symbol} Momentum Indicator analysis with trend strength and oscillator signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/momentum-indicator/${ticker.toLowerCase()}`,
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

export default async function MomentumIndicatorPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/momentum-indicator/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const momentumFaqs = [
    {
      question: `What is the ${symbol} Momentum Indicator?`,
      answer: `The ${symbol} Momentum Indicator measures the velocity of price changes by comparing current price to price N periods ago. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, it oscillates around a zero line to show trend strength and potential reversals.`
    },
    {
      question: `How is the ${symbol} Momentum Indicator calculated?`,
      answer: `The ${symbol} Momentum Indicator is calculated by subtracting the price N periods ago from the current price (Current Price - Price N periods ago). Positive values indicate upward momentum, negative values indicate downward momentum, and the magnitude shows strength of the trend.`
    },
    {
      question: `What do ${symbol} Momentum Indicator signals mean?`,
      answer: `For ${symbol}, Momentum Indicator signals include: crossing above zero indicates bullish momentum, crossing below zero indicates bearish momentum, divergences between price and momentum suggest potential reversals, and extreme readings may indicate overbought or oversold conditions.`
    },
    {
      question: `What's the best period for ${symbol} Momentum Indicator?`,
      answer: `For ${symbol}, the standard period is 10 or 14 days for short to medium-term trading. Use shorter periods (5-7 days) for more sensitive signals with more noise, or longer periods (20-25 days) for smoother, more reliable signals with less sensitivity to short-term fluctuations.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Momentum Indicator`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Momentum Indicator - Price Momentum Technical Analysis`,
      description: `Comprehensive Momentum Indicator analysis for ${symbol} (${companyName}) with trend strength and oscillator signals.`,
      url: pageUrl,
      keywords: [`${symbol} momentum indicator`, `${symbol} momentum oscillator`, `${symbol} technical indicators`],
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
            <span>{symbol} Momentum Indicator</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Momentum Indicator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price momentum oscillator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
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

          {/* Momentum Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Momentum Indicator Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Positive Momentum (Above 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bullish trend</p>
                <p className="text-xs text-muted-foreground">Price rising faster than N periods ago, indicating upward momentum and potential trend continuation</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Zero Line (0)</p>
                <p className="text-sm text-muted-foreground mb-2">Trend change zone</p>
                <p className="text-xs text-muted-foreground">Critical level where momentum shifts from positive to negative or vice versa</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Negative Momentum (Below 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bearish trend</p>
                <p className="text-xs text-muted-foreground">Price falling faster than N periods ago, indicating downward momentum and potential trend continuation</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Momentum Indicator Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Momentum crosses above zero line (trend turning bullish)</li>
                  <li>• Bullish divergence: price makes lower low, momentum makes higher low</li>
                  <li>• Momentum accelerating upward (increasing positive values)</li>
                  <li>• Momentum rising from extreme negative levels</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Momentum crosses below zero line (trend turning bearish)</li>
                  <li>• Bearish divergence: price makes higher high, momentum makes lower high</li>
                  <li>• Momentum decelerating downward (increasing negative values)</li>
                  <li>• Momentum falling from extreme positive levels</li>
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

          <RelatedLinks ticker={symbol} currentPage="momentum-indicator" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
