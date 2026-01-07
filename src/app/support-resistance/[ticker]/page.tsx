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
    title: `${symbol} Support and Resistance Levels - Key Price Zones`,
    description: `${symbol} support and resistance levels. Identify key price zones, breakout levels, and trading ranges for ${symbol} stock with technical analysis.`,
    keywords: [
      `${symbol} support levels`,
      `${symbol} resistance levels`,
      `${symbol} support and resistance`,
      `${symbol} price levels`,
      `${symbol} breakout levels`,
      `${symbol} trading range`,
    ],
    openGraph: {
      title: `${symbol} Support & Resistance Levels | Key Price Zones`,
      description: `Comprehensive support and resistance analysis for ${symbol} with key price levels.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/support-resistance/${ticker.toLowerCase()}`,
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

export default async function SupportResistancePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/support-resistance/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const yearHigh = snapshot.yearHigh || 0
  const yearLow = snapshot.yearLow || 0

  const srFaqs = [
    {
      question: `What are the key support levels for ${symbol}?`,
      answer: `Support levels for ${symbol} are price zones where buying pressure historically prevents the price from falling further. Key support levels include previous lows, moving averages, round numbers, and areas of high volume. The 52-week low of $${yearLow.toFixed(2)} represents a major support level.`
    },
    {
      question: `What are the key resistance levels for ${symbol}?`,
      answer: `Resistance levels for ${symbol} are price zones where selling pressure historically prevents the price from rising further. Key resistance levels include previous highs, moving averages, round numbers, and areas where ${symbol} previously failed to break through. The 52-week high of $${yearHigh.toFixed(2)} represents a major resistance level.`
    },
    {
      question: `How do you identify support and resistance for ${symbol}?`,
      answer: `For ${symbol}, support and resistance levels are identified by looking at historical price action: areas where price repeatedly bounced (support) or reversed (resistance). Also watch for round numbers (psychological levels), moving averages, pivot points, Fibonacci retracements, and high-volume price zones.`
    },
    {
      question: `What happens when ${symbol} breaks support or resistance?`,
      answer: `When ${symbol} breaks above resistance, it often becomes new support and signals a bullish breakout. When ${symbol} breaks below support, it often becomes new resistance and signals a bearish breakdown. These breakouts can lead to significant price movements, especially when accompanied by high volume.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Support & Resistance`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Support and Resistance Levels - Key Price Zones`,
      description: `Detailed support and resistance analysis for ${symbol} (${companyName}) with key trading levels.`,
      url: pageUrl,
      keywords: [`${symbol} support`, `${symbol} resistance`, `${symbol} price levels`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(srFaqs),
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
            <span>{symbol} Support & Resistance</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Support & Resistance</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Key price levels & trading zones</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">52W High (Resistance)</p>
                <p className="text-3xl font-bold text-red-500">${yearHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">52W Low (Support)</p>
                <p className="text-3xl font-bold text-green-500">${yearLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Distance to High</p>
                <p className="text-2xl font-bold">
                  {((yearHigh - price) / price * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Understanding Support & Resistance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Support & Resistance</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-green-500">Support Levels</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Support is a price level where buying interest is strong enough to prevent {symbol} from declining further.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Previous lows and swing bottoms</li>
                  <li>• Moving averages (50-day, 200-day)</li>
                  <li>• Round psychological numbers</li>
                  <li>• High-volume price zones</li>
                  <li>• Fibonacci retracement levels</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-red-500">Resistance Levels</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Resistance is a price level where selling pressure is strong enough to prevent {symbol} from rising further.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Previous highs and swing tops</li>
                  <li>• Moving averages in downtrends</li>
                  <li>• Round psychological numbers</li>
                  <li>• High-volume rejection zones</li>
                  <li>• Fibonacci extension levels</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Types of Support/Resistance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Support & Resistance</h2>
            <div className="grid gap-4">
              {[
                {
                  type: 'Horizontal S/R',
                  desc: 'Clear price levels where reversals repeatedly occur',
                  example: `${symbol}'s 52-week high and low`
                },
                {
                  type: 'Trendline S/R',
                  desc: 'Diagonal lines connecting swing highs or lows',
                  example: 'Uptrend support or downtrend resistance'
                },
                {
                  type: 'Moving Average S/R',
                  desc: 'Dynamic levels that adjust with price',
                  example: '50-day and 200-day moving averages'
                },
                {
                  type: 'Psychological S/R',
                  desc: 'Round numbers where traders place orders',
                  example: '$50, $100, $150 price levels'
                },
                {
                  type: 'Volume Profile S/R',
                  desc: 'Price levels with highest trading volume',
                  example: 'High volume nodes and value areas'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.type}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-foreground">Example: {item.example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Support & Resistance Trading Strategies</h2>
            <div className="space-y-4">
              {[
                {
                  strategy: 'Bounce Trading',
                  desc: 'Buy near support, sell near resistance',
                  risk: 'Works best in ranging markets'
                },
                {
                  strategy: 'Breakout Trading',
                  desc: 'Buy when price breaks above resistance with volume',
                  risk: 'Watch for false breakouts'
                },
                {
                  strategy: 'Breakdown Trading',
                  desc: 'Sell/short when price breaks below support with volume',
                  risk: 'Confirm with additional indicators'
                },
                {
                  strategy: 'Role Reversal',
                  desc: 'Old resistance becomes new support after breakout',
                  risk: 'Wait for retest confirmation'
                },
                {
                  strategy: 'Multiple Timeframe',
                  desc: 'Identify S/R on daily, weekly, and monthly charts',
                  risk: 'Weekly/monthly levels are stronger'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.strategy}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm text-orange-500">Note: {item.risk}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Identify Key Levels for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View interactive charts with support and resistance zones</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Chart Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {srFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="support-resistance" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
