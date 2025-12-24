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
    title: `${symbol} Williams %R - Williams Percent Range Indicator Analysis`,
    description: `${symbol} Williams %R indicator analysis. Track ${symbol} overbought and oversold conditions with Williams Percent Range oscillator signals and trading opportunities.`,
    keywords: [
      `${symbol} Williams R`,
      `${symbol} Williams %R`,
      `${symbol} Williams Percent Range`,
      `${symbol} oscillator`,
      `${symbol} overbought oversold`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} Williams %R | Williams Percent Range Indicator`,
      description: `Comprehensive ${symbol} Williams %R analysis with overbought/oversold signals and trading opportunities.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/williams-r/${ticker.toLowerCase()}`,
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

export default async function WilliamsRPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/williams-r/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const williamsFaqs = [
    {
      question: `What is ${symbol} Williams %R?`,
      answer: `${symbol} Williams %R is a momentum indicator that measures overbought and oversold levels. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, Williams %R ranges from -100 to 0, with readings above -20 indicating overbought and below -80 indicating oversold conditions.`
    },
    {
      question: `How do you read ${symbol} Williams %R signals?`,
      answer: `${symbol} Williams %R signals are interpreted as: readings above -20 suggest overbought conditions (potential sell signal), readings below -80 suggest oversold conditions (potential buy signal), and readings between -20 and -80 indicate neutral market conditions. Look for divergences between price and Williams %R for stronger signals.`
    },
    {
      question: `Is ${symbol} overbought or oversold according to Williams %R?`,
      answer: `Based on ${symbol}'s current ${isPositive ? 'positive' : 'negative'} momentum of ${Math.abs(changePercent).toFixed(2)}%, check the Williams %R indicator below to determine if the stock is in overbought (>-20), oversold (<-80), or neutral territory. Extreme readings often precede reversals.`
    },
    {
      question: `What's the best timeframe for ${symbol} Williams %R?`,
      answer: `The standard Williams %R period is 14 days, which balances sensitivity and reliability. For ${symbol}, traders may use 10 days for more sensitive signals or 20 days for smoother, longer-term readings. Shorter periods generate more signals but may have more false positives.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Williams %R`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Williams %R - Williams Percent Range Indicator Analysis`,
      description: `Comprehensive Williams %R analysis for ${symbol} (${companyName}) with overbought/oversold signals.`,
      url: pageUrl,
      keywords: [`${symbol} Williams R`, `${symbol} Williams %R`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(williamsFaqs),
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
            <span>{symbol} Williams %R</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Williams %R Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Williams Percent Range indicator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
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

          {/* Williams %R Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Williams %R Signal Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Overbought (0 to -20)</p>
                <p className="text-sm text-muted-foreground mb-2">Potential sell signal</p>
                <p className="text-xs text-muted-foreground">Stock may be overextended, consider taking profits or waiting for pullback</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Neutral (-20 to -80)</p>
                <p className="text-sm text-muted-foreground mb-2">Balanced market</p>
                <p className="text-xs text-muted-foreground">No extreme conditions, wait for clear signals from overbought or oversold zones</p>
              </div>
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Oversold (-80 to -100)</p>
                <p className="text-sm text-muted-foreground mb-2">Potential buy signal</p>
                <p className="text-xs text-muted-foreground">Stock may be undervalued, consider buying or adding to position</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Williams %R Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Williams %R rising from below -80 (oversold bounce)</li>
                  <li>• Bullish divergence: price makes lower low, Williams %R makes higher low</li>
                  <li>• Multiple consecutive readings below -80 followed by reversal</li>
                  <li>• Williams %R crossing above -80 after extended oversold period</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Williams %R falling from above -20 (overbought reversal)</li>
                  <li>• Bearish divergence: price makes higher high, Williams %R makes lower high</li>
                  <li>• Multiple consecutive readings above -20 followed by reversal</li>
                  <li>• Williams %R crossing below -20 after extended overbought period</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered Williams %R analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {williamsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="williams-r" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
