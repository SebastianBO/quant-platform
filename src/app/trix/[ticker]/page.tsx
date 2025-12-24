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
    title: `${symbol} TRIX - Triple Exponential Average Indicator Analysis`,
    description: `${symbol} TRIX indicator analysis. Track ${symbol} trend direction, momentum, and divergences with TRIX oscillator signals and zero-line crossovers.`,
    keywords: [
      `${symbol} TRIX`,
      `${symbol} TRIX indicator`,
      `${symbol} Triple Exponential Average`,
      `${symbol} momentum oscillator`,
      `${symbol} trend analysis`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} TRIX | Triple Exponential Average Indicator`,
      description: `Comprehensive ${symbol} TRIX analysis with trend signals and momentum divergences.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/trix/${ticker.toLowerCase()}`,
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

export default async function TRIXPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/trix/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const trixFaqs = [
    {
      question: `What is ${symbol} TRIX?`,
      answer: `${symbol} TRIX (Triple Exponential Average) is a momentum oscillator that shows the percentage rate of change of a triple exponentially smoothed moving average. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, TRIX filters out market noise and identifies significant trend changes.`
    },
    {
      question: `How do you read ${symbol} TRIX signals?`,
      answer: `${symbol} TRIX signals are read by: TRIX crossing above zero indicates a buy signal, TRIX crossing below zero indicates a sell signal, divergences between price and TRIX warn of potential reversals, and the slope of TRIX shows trend strength and momentum direction.`
    },
    {
      question: `What's the advantage of using ${symbol} TRIX?`,
      answer: `For ${symbol}, TRIX's main advantage is filtering out short-term market noise through triple smoothing, providing clearer trend signals with fewer false positives compared to single moving averages. This makes it particularly useful for identifying significant trend changes and avoiding whipsaws in choppy markets.`
    },
    {
      question: `What period is best for ${symbol} TRIX?`,
      answer: `The standard TRIX period for ${symbol} is 15 days, which balances signal responsiveness with noise filtering. Shorter periods (9-12 days) provide faster signals with more noise, while longer periods (18-21 days) give smoother, more reliable signals with slower reaction time.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} TRIX`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} TRIX - Triple Exponential Average Indicator Analysis`,
      description: `Comprehensive TRIX analysis for ${symbol} (${companyName}) with trend signals and momentum divergences.`,
      url: pageUrl,
      keywords: [`${symbol} TRIX`, `${symbol} Triple Exponential Average`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(trixFaqs),
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
            <span>{symbol} TRIX</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} TRIX Indicator</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Triple Exponential Average signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
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

          {/* TRIX Zones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">TRIX Signal Zones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Positive TRIX (Above 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bullish momentum</p>
                <p className="text-xs text-muted-foreground">Triple smoothed EMA trending upward, indicating sustained bullish trend with filtered signals</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Zero Line (0)</p>
                <p className="text-sm text-muted-foreground mb-2">Critical crossover zone</p>
                <p className="text-xs text-muted-foreground">Crossovers of zero line generate primary buy/sell signals with high reliability</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Negative TRIX (Below 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bearish momentum</p>
                <p className="text-xs text-muted-foreground">Triple smoothed EMA trending downward, indicating sustained bearish trend with filtered signals</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">TRIX Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• TRIX crosses above zero line (primary buy signal)</li>
                  <li>• Bullish divergence: price makes lower low, TRIX makes higher low</li>
                  <li>• TRIX line crosses above its signal line (9-period EMA of TRIX)</li>
                  <li>• TRIX slope turning positive and accelerating upward</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• TRIX crosses below zero line (primary sell signal)</li>
                  <li>• Bearish divergence: price makes higher high, TRIX makes lower high</li>
                  <li>• TRIX line crosses below its signal line (9-period EMA of TRIX)</li>
                  <li>• TRIX slope turning negative and accelerating downward</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered TRIX analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {trixFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="trix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
