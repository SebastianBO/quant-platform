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
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Borrow Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Borrow Rate</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Short selling cost & fee analysis</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Borrow Rate</p>
                <p className="text-3xl font-bold">Check Broker</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Availability</p>
                <p className="text-3xl font-bold">Check Broker</p>
              </div>
            </div>
          </div>

          {/* Borrow Rate Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Borrow Rates</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                The borrow rate is the annual interest rate short sellers pay to borrow {symbol} shares. When you short a stock,
                you're borrowing shares from someone else (typically through your broker), selling them, and hoping to buy them
                back later at a lower price. The borrow rate is your cost for this privilege.
              </p>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="font-mono text-sm mb-2">Daily Borrow Cost = (Annual Rate ÷ 365) × Share Price × Quantity</p>
                <p className="text-sm text-muted-foreground">
                  This cost is charged daily for as long as you hold the short position.
                </p>
              </div>
            </div>
          </section>

          {/* Borrow Rate Ranges */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Borrow Rate Categories</h2>
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
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{item.range}</h3>
                      <p className={`text-sm ${
                        item.color === 'green' ? 'text-green-400' :
                        item.color === 'yellow' ? 'text-yellow-400' :
                        item.color === 'orange' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>{item.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Calculation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Borrow Cost Calculator</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-4">Example: Shorting 100 shares of {symbol} at ${price.toFixed(2)}</p>
              <div className="space-y-3">
                {[
                  { rate: '5%', days: 30, cost: (0.05 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '20%', days: 30, cost: (0.20 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '50%', days: 30, cost: (0.50 * price * 100 * 30 / 365).toFixed(2) },
                  { rate: '100%', days: 30, cost: (1.00 * price * 100 * 30 / 365).toFixed(2) },
                ].map((calc, i) => (
                  <div key={i} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{calc.rate} annual rate × {calc.days} days</p>
                      <p className="text-sm text-muted-foreground">100 shares at ${price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">${calc.cost}</p>
                      <p className="text-xs text-muted-foreground">Borrow cost</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: This excludes trading commissions, margin interest, and potential losses from price increases.
              </p>
            </div>
          </section>

          {/* What Affects Rates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting Borrow Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { factor: 'Share Availability', impact: 'Less available shares = higher rates' },
                { factor: 'Short Demand', impact: 'More shorts wanting to borrow = higher rates' },
                { factor: 'Float Size', impact: 'Smaller float = higher rates' },
                { factor: 'Institutional Holdings', impact: 'Large holders restricting lending = higher rates' },
                { factor: 'Volatility', impact: 'Higher volatility often increases rates' },
                { factor: 'Recent Performance', impact: 'Strong gains may increase short demand and rates' },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-2">{item.factor}</p>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Squeeze Implications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Squeeze Implications</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                High borrow rates are a key short squeeze indicator. When rates exceed 30-50%, it signals:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Very limited share availability for new short positions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Existing shorts paying expensive daily fees, increasing pressure to cover</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Brokers may force close short positions due to hard-to-borrow status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Rising rates often precede short squeezes as supply tightens</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Check Short Interest Data</h2>
            <p className="text-muted-foreground mb-6">View comprehensive short interest metrics and squeeze indicators</p>
            <Link href={`/short-interest/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Short Interest
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
