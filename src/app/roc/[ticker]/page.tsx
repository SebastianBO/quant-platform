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
    title: `${symbol} ROC - Rate of Change Indicator Analysis`,
    description: `${symbol} ROC (Rate of Change) analysis. Track ${symbol} price velocity, momentum shifts, and trend strength with ROC indicator signals and divergences.`,
    keywords: [
      `${symbol} ROC`,
      `${symbol} Rate of Change`,
      `${symbol} ROC indicator`,
      `${symbol} price velocity`,
      `${symbol} momentum analysis`,
      `${symbol} technical indicators`,
    ],
    openGraph: {
      title: `${symbol} ROC | Rate of Change Indicator`,
      description: `Comprehensive ${symbol} ROC analysis with price velocity and momentum signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/roc/${ticker.toLowerCase()}`,
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

export default async function ROCPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/roc/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const rocFaqs = [
    {
      question: `What is ${symbol} ROC?`,
      answer: `${symbol} ROC (Rate of Change) measures the percentage change in price over a specified period. Currently trading at $${price.toFixed(2)} with ${isPositive ? 'positive' : 'negative'} ${Math.abs(changePercent).toFixed(2)}% change, ROC shows price momentum by comparing current price to price N periods ago.`
    },
    {
      question: `How do you calculate ${symbol} ROC?`,
      answer: `${symbol} ROC is calculated as: [(Current Price - Price N periods ago) / Price N periods ago] × 100. Positive values indicate upward momentum, negative values indicate downward momentum. The standard period is 12 days, but can be adjusted for different timeframes.`
    },
    {
      question: `What do ${symbol} ROC signals mean?`,
      answer: `For ${symbol}, ROC signals are interpreted as: positive ROC values indicate bullish momentum, negative values indicate bearish momentum, ROC crossing above zero is a buy signal, and ROC crossing below zero is a sell signal. Divergences between price and ROC often precede trend reversals.`
    },
    {
      question: `What's a good ROC value for ${symbol}?`,
      answer: `There's no universal "good" ROC value for ${symbol}. Instead, compare current ROC to historical values. Extremely high ROC (>10-15%) may indicate overbought conditions, while extremely low ROC (<-10-15%) may indicate oversold conditions. The current ${Math.abs(changePercent).toFixed(2)}% change provides context for momentum strength.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} ROC`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} ROC - Rate of Change Indicator Analysis`,
      description: `Comprehensive ROC analysis for ${symbol} (${companyName}) with price velocity and momentum signals.`,
      url: pageUrl,
      keywords: [`${symbol} ROC`, `${symbol} Rate of Change`, `${symbol} technical indicators`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(rocFaqs),
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
            <span>{symbol} ROC</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} ROC Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Rate of Change indicator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Rate of Change</p>
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

          {/* ROC Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ROC Signal Interpretation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <p className="font-bold text-lg mb-2 text-green-500">Positive ROC (Above 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bullish momentum</p>
                <p className="text-xs text-muted-foreground">Price is higher than N periods ago, indicating upward momentum and potential trend continuation</p>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <p className="font-bold text-lg mb-2 text-blue-500">Zero Line (0)</p>
                <p className="text-sm text-muted-foreground mb-2">Neutral / Transition</p>
                <p className="text-xs text-muted-foreground">Price unchanged from N periods ago, watch for crossovers as potential entry/exit signals</p>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <p className="font-bold text-lg mb-2 text-red-500">Negative ROC (Below 0)</p>
                <p className="text-sm text-muted-foreground mb-2">Bearish momentum</p>
                <p className="text-xs text-muted-foreground">Price is lower than N periods ago, indicating downward momentum and potential trend continuation</p>
              </div>
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ROC Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ROC crosses above zero line (momentum turning positive)</li>
                  <li>• Bullish divergence: price makes lower low, ROC makes higher low</li>
                  <li>• ROC rising from oversold levels (below -10%)</li>
                  <li>• ROC staying positive and trending higher</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ROC crosses below zero line (momentum turning negative)</li>
                  <li>• Bearish divergence: price makes higher high, ROC makes lower high</li>
                  <li>• ROC falling from overbought levels (above +10%)</li>
                  <li>• ROC staying negative and trending lower</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered ROC analysis with real-time signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {rocFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="roc" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
