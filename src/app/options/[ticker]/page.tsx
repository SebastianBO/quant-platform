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
    title: `${symbol} Options Chain - Calls, Puts & Options Trading`,
    description: `${symbol} options chain with calls and puts. View strike prices, expiration dates, implied volatility, and options flow for ${symbol} stock options.`,
    keywords: [
      `${symbol} options`,
      `${symbol} options chain`,
      `${symbol} calls`,
      `${symbol} puts`,
      `${symbol} options trading`,
      `${symbol} implied volatility`,
    ],
    openGraph: {
      title: `${symbol} Options Chain | Calls & Puts`,
      description: `${symbol} options chain with strike prices, expiration dates, and implied volatility.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/options/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function OptionsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/options/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Generate some example strike prices around current price
  const strikes = [
    Math.floor(price * 0.85),
    Math.floor(price * 0.90),
    Math.floor(price * 0.95),
    Math.floor(price),
    Math.ceil(price * 1.05),
    Math.ceil(price * 1.10),
    Math.ceil(price * 1.15),
  ]

  const optionsFaqs = [
    {
      question: `How do I trade ${symbol} options?`,
      answer: `To trade ${symbol} options, you need an options-approved brokerage account. ${symbol} options trade on major exchanges and include calls (bullish bets) and puts (bearish bets) with various strike prices and expiration dates.`
    },
    {
      question: `What is ${symbol} implied volatility?`,
      answer: `Implied volatility (IV) represents the market's expectation of ${symbol}'s future price movement. Higher IV means options are more expensive. IV typically increases before earnings announcements and major events.`
    },
    {
      question: `When do ${symbol} options expire?`,
      answer: `${symbol} options have various expiration dates: weekly options expire every Friday, monthly options expire the third Friday of each month, and LEAPS can extend up to 2+ years.`
    },
    {
      question: `What are the most popular ${symbol} options strikes?`,
      answer: `Popular ${symbol} options strikes are typically near the current stock price of $${price.toFixed(2)}. At-the-money and slightly out-of-the-money options tend to have the highest trading volume.`
    },
    {
      question: `Should I buy calls or puts on ${symbol}?`,
      answer: `Buy ${symbol} calls if you're bullish (expect price to rise) and puts if bearish (expect price to fall). Consider your risk tolerance, time horizon, and the premium cost before trading options.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Options', url: `${SITE_URL}/options` },
      { name: `${symbol} Options`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Options Chain - Calls, Puts & Options Trading`,
      description: `Options chain and trading information for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} options`, `${symbol} calls`, `${symbol} puts`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(optionsFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-dvh bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Home</Link>
            {' / '}
            <Link href="/options" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Options</Link>
            {' / '}
            <span>{symbol} Options</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Options Chain</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Calls, puts & options trading</p>

          {/* Price Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#ffa16c]/30 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Day Change</p>
                <p className={`text-3xl font-bold tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Volume</p>
                <p className="text-3xl font-bold tabular-nums">{(snapshot.volume / 1e6).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Avg Volume</p>
                <p className="text-3xl font-bold tabular-nums">{((snapshot.avgVolume || snapshot.volume) / 1e6).toFixed(1)}M</p>
              </div>
            </div>
          </div>

          {/* Popular Strikes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Popular Strike Prices</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-sm text-[#868f97] mb-4 tabular-nums">Based on current stock price of ${price.toFixed(2)}</p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {strikes.map((strike, i) => (
                  <div key={i} className={`p-3 rounded-lg text-center motion-safe:transition-all motion-safe:duration-150 ease-out ${strike === Math.floor(price) ? 'bg-[#4ebe96]/20 border border-[#4ebe96]/50' : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]'}`}>
                    <p className="font-bold tabular-nums">${strike}</p>
                    <p className="text-xs text-[#868f97]">
                      {strike < price ? 'ITM' : strike > price ? 'OTM' : 'ATM'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Options Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Popular {symbol} Options Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-[#4ebe96]/50">
                <h3 className="font-bold text-[#4ebe96] mb-2 text-balance">Bullish Strategies</h3>
                <ul className="text-sm text-[#868f97] space-y-2">
                  <li><strong className="text-white">Long Call:</strong> Buy calls to profit from price increase</li>
                  <li><strong className="text-white">Bull Call Spread:</strong> Limited risk bullish play</li>
                  <li><strong className="text-white">Cash-Secured Put:</strong> Get paid to wait to buy</li>
                </ul>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#ff5c5c]/30 rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-[#ff5c5c]/50">
                <h3 className="font-bold text-[#ff5c5c] mb-2 text-balance">Bearish Strategies</h3>
                <ul className="text-sm text-[#868f97] space-y-2">
                  <li><strong className="text-white">Long Put:</strong> Buy puts to profit from price decline</li>
                  <li><strong className="text-white">Bear Put Spread:</strong> Limited risk bearish play</li>
                  <li><strong className="text-white">Covered Call:</strong> Generate income on shares owned</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Options Basics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Options Trading Basics</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-[#4ebe96] mb-2 text-balance">Calls</h3>
                  <p className="text-sm text-[#868f97]">Give you the right to BUY {symbol} at a set price. Profit when stock goes UP.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#ff5c5c] mb-2 text-balance">Puts</h3>
                  <p className="text-sm text-[#868f97]">Give you the right to SELL {symbol} at a set price. Profit when stock goes DOWN.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-[#479ffa]/30 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">View Full Options Chain</h2>
            <p className="text-[#868f97] mb-6">Real-time options data with Greeks and IV</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=options`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none">
              Open Options Chain
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {optionsFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Popular Options</h2>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'TSLA', 'NVDA', 'AMD', 'SPY', 'QQQ', 'META', 'AMZN']
                .filter(s => s !== symbol)
                .map(stock => (
                  <Link key={stock} href={`/options/${stock.toLowerCase()}`} className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none">
                    {stock} Options
                  </Link>
                ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
