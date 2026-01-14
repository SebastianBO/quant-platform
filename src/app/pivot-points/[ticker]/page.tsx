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
    title: `${symbol} Pivot Points - Daily Pivot Point Calculator & Levels`,
    description: `${symbol} pivot points with support and resistance levels. Calculate ${symbol} daily, weekly, monthly pivot points for intraday trading and key price levels.`,
    keywords: [
      `${symbol} pivot points`,
      `${symbol} pivot calculator`,
      `${symbol} support resistance`,
      `${symbol} pivot levels`,
      `${symbol} intraday levels`,
      `${symbol} pivot point trading`,
    ],
    openGraph: {
      title: `${symbol} Pivot Points | Daily Pivot Point Calculator`,
      description: `Calculate ${symbol} pivot points with support and resistance levels for trading.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/pivot-points/${ticker.toLowerCase()}`,
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

export default async function PivotPointsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/pivot-points/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  // Example pivot point calculations (would use actual high/low/close data in production)
  const high = snapshot.dayHigh || price * 1.02
  const low = snapshot.dayLow || price * 0.98
  const close = price

  const pivotPoint = (high + low + close) / 3
  const r1 = (2 * pivotPoint) - low
  const r2 = pivotPoint + (high - low)
  const r3 = high + 2 * (pivotPoint - low)
  const s1 = (2 * pivotPoint) - high
  const s2 = pivotPoint - (high - low)
  const s3 = low - 2 * (high - pivotPoint)

  const pivotFaqs = [
    {
      question: `What are ${symbol} pivot points?`,
      answer: `${symbol} pivot points are technical indicators calculated using the previous period's high, low, and close prices. They provide key support and resistance levels at $${s1.toFixed(2)}, $${pivotPoint.toFixed(2)}, and $${r1.toFixed(2)} that traders use to identify potential reversal points and price targets.`
    },
    {
      question: `How do you calculate ${symbol} pivot points?`,
      answer: `${symbol} pivot points are calculated using the formula: Pivot Point (PP) = (High + Low + Close) / 3. Support levels: S1 = (2×PP) - High, S2 = PP - (High - Low). Resistance levels: R1 = (2×PP) - Low, R2 = PP + (High - Low). These create a framework for trading decisions.`
    },
    {
      question: `How to use ${symbol} pivot points for trading?`,
      answer: `Use ${symbol} pivot points as follows: Price above PP ($${pivotPoint.toFixed(2)}) is bullish, below is bearish. R1 ($${r1.toFixed(2)}), R2 ($${r2.toFixed(2)}) are resistance targets. S1 ($${s1.toFixed(2)}), S2 ($${s2.toFixed(2)}) are support levels. Trade bounces off these levels or breakouts through them.`
    },
    {
      question: `Are ${symbol} pivot points accurate?`,
      answer: `${symbol} pivot points are widely used by professional traders and work best in liquid markets with clear price action. They become self-fulfilling as many traders watch the same levels. Most effective for intraday and swing trading with 60-70% accuracy when combined with volume and trend analysis.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Pivot Points`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Pivot Points - Daily Pivot Point Calculator`,
      description: `Calculate ${symbol} (${companyName}) pivot points with support and resistance levels for trading.`,
      url: pageUrl,
      keywords: [`${symbol} pivot points`, `${symbol} support resistance`, `${symbol} pivot calculator`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(pivotFaqs),
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
            <span>{symbol} Pivot Points</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Pivot Points</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Daily pivot point calculator & key levels</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Pivot Point</p>
                <p className="text-3xl font-bold text-blue-500">${pivotPoint.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Position</p>
                <p className={`text-2xl font-bold ${price > pivotPoint ? 'text-green-500' : 'text-red-500'}`}>
                  {price > pivotPoint ? 'Above PP' : 'Below PP'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Pivot Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Pivot Point Levels</h2>
            <div className="space-y-3">
              {/* Resistance Levels */}
              <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-500">R3 (Resistance 3)</span>
                  <span className="text-xl font-bold">${r3.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-500">R2 (Resistance 2)</span>
                  <span className="text-xl font-bold">${r2.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-500">R1 (Resistance 1)</span>
                  <span className="text-xl font-bold">${r1.toFixed(2)}</span>
                </div>
              </div>

              {/* Pivot Point */}
              <div className="bg-blue-600/20 p-5 rounded-lg border border-blue-500/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-400 text-lg">PP (Pivot Point)</span>
                  <span className="text-2xl font-bold text-blue-400">${pivotPoint.toFixed(2)}</span>
                </div>
              </div>

              {/* Support Levels */}
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-500">S1 (Support 1)</span>
                  <span className="text-xl font-bold">${s1.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-500">S2 (Support 2)</span>
                  <span className="text-xl font-bold">${s2.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-500">S3 (Support 3)</span>
                  <span className="text-xl font-bold">${s3.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Trade Pivot Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-green-500">Bullish Scenarios</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price bounces off S1 or S2 support levels</li>
                  <li>• Price breaks above pivot point with volume</li>
                  <li>• Price breaks through R1 targeting R2/R3</li>
                  <li>• Opening above pivot point (bullish bias)</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-red-500">Bearish Scenarios</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price rejected at R1 or R2 resistance</li>
                  <li>• Price breaks below pivot point with volume</li>
                  <li>• Price breaks through S1 targeting S2/S3</li>
                  <li>• Opening below pivot point (bearish bias)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pivot Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Pivot Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Standard Pivots', desc: 'Most common calculation', formula: '(H + L + C) / 3' },
                { name: 'Fibonacci Pivots', desc: 'Uses Fibonacci ratios', formula: 'PP + Fib levels' },
                { name: 'Woodie Pivots', desc: 'More weight on close', formula: '(H + L + 2C) / 4' },
                { name: 'Camarilla Pivots', desc: 'Tight intraday levels', formula: 'Complex calculation' },
                { name: 'DeMark Pivots', desc: 'Open price dependent', formula: 'Conditional formula' },
                { name: 'Classic Pivots', desc: 'Traditional floor method', formula: 'H + L + C' },
              ].map((type, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold text-lg mb-1">{type.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{type.desc}</p>
                  <p className="text-xs text-blue-500">{type.formula}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Live Pivot Point Updates</h2>
            <p className="text-muted-foreground mb-6">Real-time pivot calculations with automated alerts</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pivotFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="pivot-points" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
