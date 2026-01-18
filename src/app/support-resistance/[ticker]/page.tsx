import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
// Increase timeout to prevent 5xx errors
export const maxDuration = 60

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
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Technical Analysis</Link>
            {' / '}
            <span>{symbol} Support & Resistance</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Support & Resistance</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Key price levels & trading zones</p>

          {/* Price Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8 motion-safe:transition-all motion-safe:duration-150 ease-out">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">52W High (Resistance)</p>
                <p className="text-3xl font-bold text-[#ff5c5c] tabular-nums">${yearHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">52W Low (Support)</p>
                <p className="text-3xl font-bold text-[#4ebe96] tabular-nums">${yearLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Distance to High</p>
                <p className="text-2xl font-bold tabular-nums">
                  {((yearHigh - price) / price * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Understanding Support & Resistance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding Support & Resistance</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="font-bold text-lg mb-3 text-[#4ebe96]">Support Levels</h3>
                <p className="text-sm text-[#868f97] mb-3">
                  Support is a price level where buying interest is strong enough to prevent {symbol} from declining further.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li>• Previous lows and swing bottoms</li>
                  <li>• Moving averages (50-day, 200-day)</li>
                  <li>• Round psychological numbers</li>
                  <li>• High-volume price zones</li>
                  <li>• Fibonacci retracement levels</li>
                </ul>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="font-bold text-lg mb-3 text-[#ff5c5c]">Resistance Levels</h3>
                <p className="text-sm text-[#868f97] mb-3">
                  Resistance is a price level where selling pressure is strong enough to prevent {symbol} from rising further.
                </p>
                <ul className="space-y-2 text-sm text-[#868f97]">
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
            <h2 className="text-2xl font-bold mb-4 text-balance">Types of Support & Resistance</h2>
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
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{item.type}</h3>
                  <p className="text-sm text-[#868f97] mb-1">{item.desc}</p>
                  <p className="text-sm text-white">Example: {item.example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Support & Resistance Trading Strategies</h2>
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
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{item.strategy}</h3>
                  <p className="text-sm text-[#868f97] mb-1">{item.desc}</p>
                  <p className="text-sm text-[#ffa16c]">Note: {item.risk}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 motion-safe:transition-all motion-safe:duration-150 ease-out">
            <h2 className="text-2xl font-bold mb-4 text-balance">Identify Key Levels for {symbol}</h2>
            <p className="text-[#868f97] mb-6">View interactive charts with support and resistance zones</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-[#479ffa] hover:bg-[#479ffa]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              View Chart Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {srFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
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
