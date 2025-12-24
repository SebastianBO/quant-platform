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
    title: `${symbol} Donchian Channels Analysis - Price Channel Breakouts`,
    description: `${symbol} Donchian Channels analysis with 20-period high/low bands. Track ${symbol} breakout signals, trend direction, and volatility with price channels.`,
    keywords: [
      `${symbol} donchian channels`,
      `${symbol} donchian indicator`,
      `${symbol} price channels`,
      `${symbol} breakout trading`,
      `${symbol} turtle trading`,
      `${symbol} channel breakout`,
    ],
    openGraph: {
      title: `${symbol} Donchian Channels Analysis | Price Channel Breakouts`,
      description: `Comprehensive ${symbol} Donchian Channels analysis with breakout signals and trend indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/donchian-channels/${ticker.toLowerCase()}`,
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

export default async function DonchianChannelsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/donchian-channels/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const donchianFaqs = [
    {
      question: `What are ${symbol} Donchian Channels?`,
      answer: `${symbol} Donchian Channels plot the highest high and lowest low over a set period (typically 20), creating a price channel. Currently trading at $${price.toFixed(2)}, these channels help identify breakouts and trend strength based on price extremes.`
    },
    {
      question: `How do you trade ${symbol} with Donchian Channels?`,
      answer: `Trade ${symbol} with Donchian Channels by buying on breakouts above the upper band and selling on breakouts below the lower band. This is the foundation of the famous Turtle Trading strategy. The middle line serves as a trend indicator.`
    },
    {
      question: `What is the Turtle Trading system for ${symbol}?`,
      answer: `The Turtle Trading system for ${symbol} uses Donchian Channels to enter long when price breaks above the 20-day high and exit when it breaks below the 10-day low. This trend-following system was used by the legendary Turtle Traders.`
    },
    {
      question: `Is ${symbol} showing Donchian Channel breakout signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Donchian Channels analysis below for detailed breakout signals and channel positions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Donchian Channels`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Donchian Channels Analysis - Price Channel Breakouts`,
      description: `Comprehensive Donchian Channels analysis for ${symbol} (${companyName}) with breakout signals and trend indicators.`,
      url: pageUrl,
      keywords: [`${symbol} donchian channels`, `${symbol} breakout trading`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(donchianFaqs),
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
            <span>{symbol} Donchian Channels</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Donchian Channels Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price channel breakout signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 rounded-xl border border-teal-500/30 mb-8">
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

          {/* Channel Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Donchian Channel Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Upper Band', desc: 'Highest high (20-period)', value: 'Maximum price over lookback' },
                { name: 'Lower Band', desc: 'Lowest low (20-period)', value: 'Minimum price over lookback' },
                { name: 'Middle Line', desc: 'Average of upper and lower', value: 'Median price channel' },
                { name: 'Channel Width', desc: 'Upper minus lower band', value: 'Measures volatility' },
                { name: 'Breakout Signal', desc: 'Price exceeds channel', value: 'New high/low achieved' },
                { name: 'Turtle System', desc: '20/10 day configuration', value: 'Entry/exit strategy' },
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
            <h2 className="text-2xl font-bold mb-4">Donchian Channel Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price breaking above upper band (new 20-day high)</li>
                  <li>• Strong breakout with increased volume</li>
                  <li>• Price staying above middle line</li>
                  <li>• Widening channels in uptrend (increasing volatility)</li>
                  <li>• Consecutive higher highs forming new upper bands</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price breaking below lower band (new 20-day low)</li>
                  <li>• Strong breakdown with increased volume</li>
                  <li>• Price staying below middle line</li>
                  <li>• Widening channels in downtrend (increasing volatility)</li>
                  <li>• Consecutive lower lows forming new lower bands</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Donchian Channel Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time breakout signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {donchianFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="donchian-channels" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
