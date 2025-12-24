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
    title: `${symbol} CCI - Commodity Channel Index Analysis`,
    description: `${symbol} CCI (Commodity Channel Index) analysis. Track ${symbol} trend strength, overbought/oversold conditions, and divergences with CCI indicator signals.`,
    keywords: [
      `${symbol} CCI`,
      `${symbol} Commodity Channel Index`,
      `${symbol} CCI indicator`,
      `${symbol} overbought oversold`,
      `${symbol} trend analysis`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} CCI | Commodity Channel Index Indicator`,
      description: `Comprehensive ${symbol} CCI analysis with trend signals and overbought/oversold conditions.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cci/${ticker.toLowerCase()}`,
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

export default async function CCIPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cci/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const cciFaqs = [
    {
      question: `What is ${symbol} CCI?`,
      answer: `${symbol} CCI (Commodity Channel Index) measures the deviation of price from its statistical average. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, CCI values above +100 indicate overbought conditions while values below -100 indicate oversold conditions.`
    },
    {
      question: `How do you interpret ${symbol} CCI readings?`,
      answer: `${symbol} CCI readings are interpreted as: values above +100 suggest strong uptrend and potential overbought conditions, values below -100 suggest strong downtrend and potential oversold conditions, and values between -100 and +100 indicate normal price fluctuations within the trading range.`
    },
    {
      question: `What are good CCI entry points for ${symbol}?`,
      answer: `For ${symbol}, consider buying when CCI crosses above -100 from oversold territory, or selling when CCI crosses below +100 from overbought territory. The current ${Math.abs(changePercent).toFixed(2)}% change suggests ${isPositive ? 'positive' : 'negative'} momentum that should be confirmed with CCI readings.`
    },
    {
      question: `How is ${symbol} CCI calculated?`,
      answer: `${symbol} CCI is calculated by taking the difference between the typical price (H+L+C)/3 and its moving average, then dividing by 0.015 times the mean deviation. The standard period is 20 days, measuring how far the current price has deviated from its average.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} CCI`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} CCI - Commodity Channel Index Analysis`,
      description: `Comprehensive CCI analysis for ${symbol} (${companyName}) with trend signals and overbought/oversold conditions.`,
      url: pageUrl,
      keywords: [`${symbol} CCI`, `${symbol} Commodity Channel Index`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(cciFaqs),
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
            <span>{symbol} CCI</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} CCI Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Commodity Channel Index signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
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

          {/* CCI Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">CCI Signal Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Overbought (Above +100)</p>
                <p className="text-sm text-muted-foreground mb-2">Strong uptrend</p>
                <p className="text-xs text-muted-foreground">Price significantly above average, potential reversal or continuation of strong trend</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Neutral (-100 to +100)</p>
                <p className="text-sm text-muted-foreground mb-2">Normal trading range</p>
                <p className="text-xs text-muted-foreground">Price fluctuating within normal bounds, no extreme conditions</p>
              </div>
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Oversold (Below -100)</p>
                <p className="text-sm text-muted-foreground mb-2">Strong downtrend</p>
                <p className="text-xs text-muted-foreground">Price significantly below average, potential reversal or continuation of strong decline</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">CCI Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CCI crosses above -100 from oversold territory</li>
                  <li>• Bullish divergence: price makes lower low, CCI makes higher low</li>
                  <li>• CCI breaking above +100 indicates strong uptrend continuation</li>
                  <li>• CCI moving from negative to positive territory</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CCI crosses below +100 from overbought territory</li>
                  <li>• Bearish divergence: price makes higher high, CCI makes lower high</li>
                  <li>• CCI breaking below -100 indicates strong downtrend continuation</li>
                  <li>• CCI moving from positive to negative territory</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered CCI analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cciFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="cci" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
