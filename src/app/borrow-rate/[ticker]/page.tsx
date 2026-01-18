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
    title: `${symbol} Borrow Rate - Short Selling Cost & Fee Analysis`,
    description: `${symbol} stock borrow rate and short selling fees. Analyze ${symbol} borrow costs, availability to short, and implications for short interest and squeeze potential.`,
    keywords: [
      `${symbol} borrow rate`,
      `${symbol} short selling cost`,
      `${symbol} borrow fee`,
      `${symbol} short fee`,
      `${symbol} hard to borrow`,
      `${symbol} borrow cost`,
    ],
    openGraph: {
      title: `${symbol} Borrow Rate | Short Selling Cost & Fees`,
      description: `Comprehensive ${symbol} borrow rate analysis with short selling costs and availability.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/borrow-rate/${ticker.toLowerCase()}`,
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

export default async function BorrowRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/borrow-rate/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqs = [
    {
      question: `What is ${symbol} borrow rate?`,
      answer: `${symbol} borrow rate (also called borrow fee or short interest fee) is the annual percentage cost to borrow shares for short selling. This fee is paid by short sellers to the lender (usually a broker or institutional holder) and is typically charged daily.`
    },
    {
      question: `What is a high borrow rate for ${symbol}?`,
      answer: `For ${symbol}, borrow rate interpretations: <1% = easy to borrow, 1-5% = moderate, 5-10% = somewhat difficult, 10-30% = hard to borrow, 30-100% = very hard to borrow, >100% = extremely hard to borrow with high squeeze potential.`
    },
    {
      question: `Why would ${symbol} have a high borrow rate?`,
      answer: `High ${symbol} borrow rates indicate: limited share availability for lending, high demand from short sellers, low float with most shares locked up, or anticipation of price decline. High rates deter new shorts and can force existing shorts to cover, potentially triggering squeezes.`
    },
    {
      question: `How much does it cost to short ${symbol}?`,
      answer: `Short selling ${symbol} costs = (Borrow Rate × Stock Price × Shares Shorted × Days Held) ÷ 365. For example, shorting 100 shares at $50 with 20% borrow rate for 30 days costs: (0.20 × $50 × 100 × 30) ÷ 365 = $82.19 in borrow fees, plus trading commissions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Borrow Rate`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Borrow Rate - Short Selling Cost Analysis`,
      description: `Comprehensive borrow rate analysis for ${symbol} (${companyName}) with short selling costs.`,
      url: pageUrl,
      keywords: [`${symbol} borrow rate`, `${symbol} short selling cost`, `${symbol} borrow fee`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Borrow Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Borrow Rate</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Short selling cost & fee analysis</p>

          {/* Key Metrics Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Borrow Rate</p>
                <p className="text-3xl font-bold">Check Broker</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Availability</p>
                <p className="text-3xl font-bold">Check Broker</p>
              </div>
            </div>
          </div>

          {/* Borrow Rate Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding Borrow Rates</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
              <p className="text-[#868f97] mb-4">
                The borrow rate is the annual interest rate short sellers pay to borrow {symbol} shares. When you short a stock,
                you're borrowing shares from someone else (typically through your broker), selling them, and hoping to buy them
                back later at a lower price. The borrow rate is your cost for this privilege.
              </p>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4">
                <p className="font-mono text-sm mb-2 tabular-nums">Daily Borrow Cost = (Annual Rate ÷ 365) × Share Price × Quantity</p>
                <p className="text-sm text-[#868f97]">
                  This cost is charged daily for as long as you hold the short position.
                </p>
              </div>
            </div>
          </section>

          {/* Borrow Rate Ranges */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Borrow Rate Categories</h2>
            <div className="space-y-4">
              {[
                {
                  range: 'Under 1%',
                  status: 'Easy to Borrow',
                  desc: 'Abundant share availability. Most large-cap stocks fall here. Low short demand or high supply.',
                  color: 'green'
                },
                {
                  range: '1% - 5%',
                  status: 'Moderate',
                  desc: 'Normal borrowing costs for most stocks. Indicates moderate short interest or average availability.',
                  color: 'green'
                },
                {
                  range: '5% - 10%',
                  status: 'Elevated',
                  desc: 'Somewhat difficult to borrow. Increased short demand or limited share availability.',
                  color: 'yellow'
                },
                {
                  range: '10% - 30%',
                  status: 'Hard to Borrow',
                  desc: 'Significant borrowing costs. High short demand relative to available shares. Squeeze potential building.',
                  color: 'orange'
                },
                {
                  range: '30% - 100%',
                  status: 'Very Hard to Borrow',
                  desc: 'Extreme borrowing costs. Very limited availability. Strong squeeze indicators. Many shorts may exit.',
                  color: 'red'
                },
                {
                  range: 'Over 100%',
                  status: 'Extremely Hard to Borrow',
                  desc: 'Rare and exceptional. Nearly impossible to establish new short positions. High squeeze probability.',
                  color: 'red'
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg tabular-nums">{item.range}</h3>
                      <p className={`text-sm ${
                        item.color === 'green' ? 'text-[#4ebe96]' :
                        item.color === 'yellow' ? 'text-[#ffa16c]' :
                        item.color === 'orange' ? 'text-[#ffa16c]' :
                        'text-[#ff5c5c]'
                      }`}>{item.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.color === 'green' ? 'bg-[#4ebe96]/20 text-[#4ebe96]' :
                      item.color === 'yellow' ? 'bg-[#ffa16c]/20 text-[#ffa16c]' :
                      item.color === 'orange' ? 'bg-[#ffa16c]/20 text-[#ffa16c]' :
                      'bg-[#ff5c5c]/20 text-[#ff5c5c]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[#868f97] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Calculation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Borrow Cost Calculator</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
              <p className="text-sm text-[#868f97] mb-4">Example: Shorting 100 shares of {symbol} at ${price.toFixed(2)}</p>
              <div className="space-y-3">
                {[
                  { rate: '5%', days: 30, cost: (0.05 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '20%', days: 30, cost: (0.20 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '50%', days: 30, cost: (0.50 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '100%', days: 30, cost: (1.00 * price * 100 * 30 / 365).toFixed(2) },
                ].map((calc, i) => (
                  <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 flex justify-between items-center motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                    <div>
                      <p className="font-bold tabular-nums">{calc.rate} annual rate × {calc.days} days</p>
                      <p className="text-sm text-[#868f97] tabular-nums">100 shares at ${price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#ff5c5c] tabular-nums">${calc.cost}</p>
                      <p className="text-xs text-[#868f97]">Borrow cost</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#868f97] mt-4">
                Note: This excludes trading commissions, margin interest, and potential losses from price increases.
              </p>
            </div>
          </section>

          {/* What Affects Rates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Factors Affecting Borrow Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { factor: 'Share Availability', impact: 'Less available shares = higher rates' },
                { factor: 'Short Demand', impact: 'More shorts wanting to borrow = higher rates' },
                { factor: 'Float Size', impact: 'Smaller float = higher rates' },
                { factor: 'Institutional Holdings', impact: 'Large holders restricting lending = higher rates' },
                { factor: 'Volatility', impact: 'Higher volatility often increases rates' },
                { factor: 'Recent Performance', impact: 'Strong gains may increase short demand and rates' },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <p className="font-bold mb-2">{item.factor}</p>
                  <p className="text-sm text-[#868f97]">{item.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Squeeze Implications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Short Squeeze Implications</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
              <p className="text-[#868f97] mb-4">
                High borrow rates are a key short squeeze indicator. When rates exceed 30-50%, it signals:
              </p>
              <ul className="space-y-2 text-sm text-[#868f97]">
                <li className="flex items-start gap-2">
                  <span className="text-[#ffa16c] mt-1">•</span>
                  <span>Very limited share availability for new short positions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ffa16c] mt-1">•</span>
                  <span>Existing shorts paying expensive daily fees, increasing pressure to cover</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ffa16c] mt-1">•</span>
                  <span>Brokers may force close short positions due to hard-to-borrow status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ffa16c] mt-1">•</span>
                  <span>Rising rates often precede short squeezes as supply tightens</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <h2 className="text-2xl font-bold mb-4 text-balance">Check Short Interest Data</h2>
            <p className="text-[#868f97] mb-6">View comprehensive short interest metrics and squeeze indicators</p>
            <Link href={`/short-interest/${symbol.toLowerCase()}`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              View Short Interest
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="borrow-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
