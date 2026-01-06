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
    title: `${symbol} Shares Short - Short Interest & Shares Shorted Data`,
    description: `${symbol} shares shorted data showing total short positions. Track ${symbol} short interest, short ratio, and changes in shares sold short for squeeze analysis.`,
    keywords: [
      `${symbol} shares short`,
      `${symbol} shares shorted`,
      `${symbol} short interest`,
      `${symbol} short positions`,
      `${symbol} shares sold short`,
      `${symbol} short data`,
    ],
    openGraph: {
      title: `${symbol} Shares Short | Short Interest & Positions`,
      description: `Comprehensive ${symbol} shares shorted analysis with short position tracking and trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/shares-short/${ticker.toLowerCase()}`,
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

export default async function SharesShortPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/shares-short/${ticker.toLowerCase()}`
  const sharesOutstanding = snapshot.shares_outstanding || 0
  const price = snapshot.price || 0

  const faqs = [
    {
      question: `How many shares of ${symbol} are shorted?`,
      answer: `The number of ${symbol} shares shorted (short interest) is reported bi-monthly by exchanges. Check FINRA or your broker for the latest data. Short interest represents total shares currently sold short and not yet covered by all market participants.`
    },
    {
      question: `What percentage of ${symbol} float is shorted?`,
      answer: `Short interest as a percentage of float (short interest ratio) shows what portion of available shares are sold short. For ${symbol}, calculate: (Shares Short ÷ Public Float) × 100. Percentages above 20% typically indicate heavy short interest and potential squeeze conditions.`
    },
    {
      question: `Is high short interest bullish or bearish for ${symbol}?`,
      answer: `High short interest in ${symbol} is mixed. It's bearish because many investors bet against the stock, but also creates squeeze potential if the stock rises. Short sellers must eventually buy shares to cover, providing future demand and potential upward pressure.`
    },
    {
      question: `How often is ${symbol} short interest updated?`,
      answer: `${symbol} short interest data is published twice monthly by FINRA and exchanges, typically around the 15th and end of each month for data from two weeks prior. This means reported data is 2-4 weeks delayed. Real-time short data is not publicly available.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Shares Short`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Shares Short - Short Interest & Position Tracking`,
      description: `Comprehensive shares shorted analysis for ${symbol} (${companyName}) with position trends.`,
      url: pageUrl,
      keywords: [`${symbol} shares short`, `${symbol} short interest`, `${symbol} short positions`],
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
            <span>{symbol} Shares Short</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Shares Shorted</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Short interest & position tracking</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Shares Outstanding</p>
                <p className="text-3xl font-bold">{(sharesOutstanding / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Shares Short</p>
                <p className="text-3xl font-bold">Check FINRA</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Shares Short Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Shares Shorted</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                Shares shorted (short interest) represents the total number of {symbol} shares that have been sold short by all
                market participants but not yet repurchased. This metric indicates bearish sentiment and potential squeeze risk
                if the stock price rises.
              </p>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="font-mono text-sm mb-2">Short Interest % = (Shares Short ÷ Float) × 100</p>
                <p className="text-sm text-muted-foreground">
                  This percentage shows what portion of available shares are sold short.
                </p>
              </div>
            </div>
          </section>

          {/* Short Interest Levels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Interest Interpretation</h2>
            <div className="space-y-4">
              {[
                {
                  range: 'Under 5% of Float',
                  sentiment: 'Low Short Interest',
                  desc: 'Minimal bearish sentiment. Short covering unlikely to significantly impact price.',
                  implication: 'Neutral'
                },
                {
                  range: '5% - 10% of Float',
                  sentiment: 'Moderate Short Interest',
                  desc: 'Normal levels for most stocks. Some bearish sentiment but not extreme.',
                  implication: 'Slightly Bearish'
                },
                {
                  range: '10% - 20% of Float',
                  sentiment: 'Elevated Short Interest',
                  desc: 'Significant bearish bets. Beginning to show squeeze potential with catalysts.',
                  implication: 'Bearish'
                },
                {
                  range: '20% - 30% of Float',
                  sentiment: 'High Short Interest',
                  desc: 'Heavy short positions. Strong squeeze potential if positive catalysts emerge.',
                  implication: 'Very Bearish / Squeeze Risk'
                },
                {
                  range: 'Over 30% of Float',
                  sentiment: 'Extreme Short Interest',
                  desc: 'Exceptional bearish conviction. Very high squeeze risk. Rare and unstable.',
                  implication: 'Extreme / High Squeeze Risk'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{item.range}</h3>
                      <p className="text-sm text-red-400">{item.sentiment}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {item.implication}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tracking Short Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tracking Short Interest Changes</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Monitor how {symbol} short interest changes over time to identify trends:
              </p>
              <div className="space-y-4">
                <div className="bg-green-600/20 border border-green-500/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold">Declining Short Interest</p>
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Bullish Signal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shorts are covering positions. May indicate improving sentiment or shorts admitting defeat. Can accelerate price gains.
                  </p>
                </div>
                <div className="bg-red-600/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold">Rising Short Interest</p>
                    <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">Bearish Signal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    More traders betting against the stock. Indicates growing bearish conviction. Also increases future squeeze potential.
                  </p>
                </div>
                <div className="bg-yellow-600/20 border border-yellow-500/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold">Stable Short Interest</p>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Neutral</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consistent short levels suggest steady bearish sentiment. No new developments changing short thesis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Where to Find Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Where to Find Short Interest Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  source: 'FINRA',
                  desc: 'Official bi-monthly short interest reports for all US securities',
                  frequency: 'Twice monthly'
                },
                {
                  source: 'Your Broker',
                  desc: 'Most brokers display short interest data in stock research sections',
                  frequency: 'Varies'
                },
                {
                  source: 'Financial Websites',
                  desc: 'Yahoo Finance, MarketWatch, and others aggregate FINRA data',
                  frequency: 'Updated with FINRA'
                },
                {
                  source: 'Nasdaq Website',
                  desc: 'Nasdaq provides short interest calendar and historical data',
                  frequency: 'Twice monthly'
                },
                {
                  source: 'SEC EDGAR',
                  desc: 'Institutional short positions over $10M in 13F filings',
                  frequency: 'Quarterly'
                },
                {
                  source: 'Premium Data Services',
                  desc: 'Services like S3 Partners, Ortex provide more frequent estimates',
                  frequency: 'Daily estimates'
                },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold">{item.source}</p>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {item.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Important Dates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Interest Reporting Schedule</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                FINRA requires short interest reporting twice monthly:
              </p>
              <div className="space-y-3">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-1">Settlement Date: Mid-Month (15th)</p>
                  <p className="text-sm text-muted-foreground">Data captured as of this date, published ~4-5 business days later</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-1">Settlement Date: End of Month (Last Day)</p>
                  <p className="text-sm text-muted-foreground">Data captured as of this date, published ~4-5 business days later</p>
                </div>
              </div>
              <p className="text-sm text-yellow-400 mt-4">
                Note: Published data is 2-4 weeks old by the time you see it. Actual current short interest may differ significantly.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Short Analysis</h2>
            <p className="text-muted-foreground mb-6">View comprehensive short metrics including days to cover and squeeze indicators</p>
            <Link href={`/short-interest/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Short Interest
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

          <RelatedLinks ticker={symbol} currentPage="shares-short" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
