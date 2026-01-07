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
    title: `${symbol} Elder Ray Index Analysis - Bull & Bear Power`,
    description: `${symbol} Elder Ray Index analysis with Bull Power and Bear Power indicators. Track ${symbol} buying and selling pressure with Dr. Alexander Elder's indicator.`,
    keywords: [
      `${symbol} elder ray`,
      `${symbol} bull power`,
      `${symbol} bear power`,
      `${symbol} elder ray index`,
      `${symbol} buying pressure`,
      `${symbol} selling pressure`,
    ],
    openGraph: {
      title: `${symbol} Elder Ray Index Analysis | Bull & Bear Power`,
      description: `Comprehensive ${symbol} Elder Ray analysis with Bull Power and Bear Power indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/elder-ray/${ticker.toLowerCase()}`,
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

export default async function ElderRayPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/elder-ray/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const elderRayFaqs = [
    {
      question: `What is ${symbol} Elder Ray Index?`,
      answer: `${symbol} Elder Ray Index measures the buying and selling pressure through Bull Power and Bear Power. Currently trading at $${price.toFixed(2)}, this indicator shows the strength of bulls (buyers) and bears (sellers) relative to the 13-period EMA.`
    },
    {
      question: `How do you calculate ${symbol} Bull and Bear Power?`,
      answer: `For ${symbol}, Bull Power = High - 13 EMA (measures buyer strength), and Bear Power = Low - 13 EMA (measures seller strength). Positive Bull Power shows buyers pushing above average, while negative Bear Power shows sellers pushing below.`
    },
    {
      question: `How do you trade ${symbol} with Elder Ray?`,
      answer: `Trade ${symbol} using Elder Ray by combining 13-EMA trend with Bull/Bear Power. Buy when EMA rises, Bear Power is negative but increasing (bears weakening), and Bull Power turns positive. Sell when opposite conditions occur.`
    },
    {
      question: `What do ${symbol} Elder Ray signals indicate?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Elder Ray analysis below for detailed Bull Power and Bear Power readings.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Elder Ray`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Elder Ray Index Analysis - Bull & Bear Power`,
      description: `Comprehensive Elder Ray analysis for ${symbol} (${companyName}) with Bull Power and Bear Power indicators.`,
      url: pageUrl,
      keywords: [`${symbol} elder ray`, `${symbol} bull power`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(elderRayFaqs),
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
            <span>{symbol} Elder Ray</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Elder Ray Index Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Bull Power & Bear Power indicators</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 p-8 rounded-xl border border-rose-500/30 mb-8">
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

          {/* Elder Ray Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Elder Ray Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Bull Power', desc: 'High - 13 EMA', value: 'Buyer strength indicator' },
                { name: 'Bear Power', desc: 'Low - 13 EMA', value: 'Seller strength indicator' },
                { name: '13-Day EMA', desc: 'Exponential Moving Average', value: 'Trend direction baseline' },
                { name: 'Power Balance', desc: 'Bulls vs Bears', value: 'Relative strength comparison' },
                { name: 'Divergences', desc: 'Price vs Power', value: 'Early reversal warnings' },
                { name: 'Triple Screen', desc: 'Elder\'s trading system', value: 'Combines trend, oscillator, power' },
              ].map((component, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{component.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{component.desc}</p>
                  <p className="text-xs text-muted-foreground">{component.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Elder Ray Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 13-EMA trending upward</li>
                  <li>• Bear Power negative but rising (bears weakening)</li>
                  <li>• Bull Power positive and increasing (bulls strengthening)</li>
                  <li>• Bullish divergence: price makes lower low, Bear Power makes higher low</li>
                  <li>• Bull Power crossing above zero line</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 13-EMA trending downward</li>
                  <li>• Bull Power positive but declining (bulls weakening)</li>
                  <li>• Bear Power negative and decreasing (bears strengthening)</li>
                  <li>• Bearish divergence: price makes higher high, Bull Power makes lower high</li>
                  <li>• Bear Power crossing below zero line</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Elder Ray Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time Bull and Bear Power</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {elderRayFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="elder-ray" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
