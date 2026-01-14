import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Breakout Analysis - Price Breakouts & Chart Patterns`,
    description: `${symbol} breakout analysis with resistance levels, volume confirmation, and chart patterns. Identify ${symbol} bullish and bearish breakout opportunities.`,
    keywords: [
      `${symbol} breakout`,
      `${symbol} breakout analysis`,
      `${symbol} price breakout`,
      `${symbol} resistance breakout`,
      `${symbol} chart patterns`,
      `${symbol} breakout trading`,
    ],
    openGraph: {
      title: `${symbol} Breakout Analysis | Price Breakouts & Patterns`,
      description: `Comprehensive ${symbol} breakout analysis with resistance levels and volume confirmation.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/breakout/${ticker.toLowerCase()}`,
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

export default async function BreakoutPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/breakout/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const volume = snapshot.volume || 0
  const isPositive = changePercent >= 0

  const breakoutFaqs = [
    {
      question: `What is a ${symbol} breakout?`,
      answer: `A ${symbol} breakout occurs when the stock price moves above a resistance level or below a support level with increased volume. Currently at $${price.toFixed(2)}, breakouts signal potential new trends and trading opportunities when confirmed by volume and momentum.`
    },
    {
      question: `How do you identify ${symbol} breakout levels?`,
      answer: `${symbol} breakout levels are identified using: 52-week high/low levels ($${snapshot.yearHigh?.toFixed(2) || 'N/A'}/$${snapshot.yearLow?.toFixed(2) || 'N/A'}), previous resistance/support zones, chart pattern boundaries (triangles, rectangles), and round number psychological levels.`
    },
    {
      question: `Is ${symbol} breaking out?`,
      answer: `${symbol} is ${isPositive ? 'showing bullish momentum' : 'showing bearish pressure'} with ${Math.abs(changePercent).toFixed(2)}% change on ${(volume / 1000000).toFixed(1)}M volume. A valid breakout requires price movement above resistance with volume at least 50% above average.`
    },
    {
      question: `What confirms a ${symbol} breakout?`,
      answer: `A valid ${symbol} breakout is confirmed by: (1) Price closing above resistance (or below support), (2) Volume significantly above average (50%+ increase), (3) Follow-through in the breakout direction for 2-3 days, (4) No immediate return below the breakout level.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Breakout`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Breakout Analysis - Price Breakouts & Chart Patterns`,
      description: `Comprehensive breakout analysis for ${symbol} (${companyName}) with resistance levels and volume confirmation.`,
      url: pageUrl,
      keywords: [`${symbol} breakout`, `${symbol} breakout analysis`, `${symbol} price breakout`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(breakoutFaqs),
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
            <span>{symbol} Breakout</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Breakout Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price breakouts & chart patterns</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
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
              <div>
                <p className="text-muted-foreground text-sm mb-1">Volume</p>
                <p className="text-2xl font-bold">{(volume / 1000000).toFixed(1)}M</p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Breakout Patterns */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Breakout Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Resistance Breakout', desc: 'Price breaks above key level', signal: 'Bullish continuation' },
                { name: 'Support Breakdown', desc: 'Price breaks below support', signal: 'Bearish continuation' },
                { name: 'Triangle Breakout', desc: 'Ascending/Descending triangle', signal: 'Direction of breakout' },
                { name: 'Channel Breakout', desc: 'Price exits trend channel', signal: 'Trend acceleration' },
                { name: 'Flag/Pennant', desc: 'Consolidation breakout', signal: 'Continuation pattern' },
                { name: '52-Week High', desc: 'New high breakout', signal: 'Strong bullish signal' },
              ].map((pattern, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{pattern.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{pattern.desc}</p>
                  <p className="text-xs text-green-500">{pattern.signal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Breakout Confirmation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Breakout Confirmation Checklist</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-bold">Volume Confirmation</p>
                    <p className="text-sm text-muted-foreground">Volume should be at least 50% above the 20-day average</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-bold">Price Close</p>
                    <p className="text-sm text-muted-foreground">Price must close above resistance (or below support)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-bold">Follow-Through</p>
                    <p className="text-sm text-muted-foreground">Continued movement in breakout direction for 2-3 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="font-bold">No Immediate Reversal</p>
                    <p className="text-sm text-muted-foreground">Price should not return below breakout level quickly</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Breakout Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Breakout Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Entry: Buy on close above resistance with high volume</li>
                  <li>• Stop Loss: Place below the breakout level or recent support</li>
                  <li>• Target: Measure pattern height and project from breakout</li>
                  <li>• Volume: Confirm with 50%+ above average volume</li>
                  <li>• Risk Management: Risk 1-2% of portfolio per trade</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Breakdown Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Entry: Short on close below support with high volume</li>
                  <li>• Stop Loss: Place above the breakdown level or recent resistance</li>
                  <li>• Target: Measure pattern height and project downward</li>
                  <li>• Volume: Confirm with increased selling pressure</li>
                  <li>• Risk Management: Use tight stops on breakdown trades</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Breakout Alerts</h2>
            <p className="text-muted-foreground mb-6">AI-powered breakout detection with volume analysis</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {breakoutFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="breakout" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
