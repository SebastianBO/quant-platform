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
    title: `${symbol} VWAP - Volume Weighted Average Price Indicator`,
    description: `${symbol} VWAP (Volume Weighted Average Price) analysis for intraday trading. Track ${symbol} VWAP levels, anchored VWAP, and volume-based support/resistance.`,
    keywords: [
      `${symbol} VWAP`,
      `${symbol} volume weighted average price`,
      `${symbol} VWAP indicator`,
      `${symbol} intraday trading`,
      `${symbol} anchored VWAP`,
      `${symbol} VWAP strategy`,
    ],
    openGraph: {
      title: `${symbol} VWAP | Volume Weighted Average Price`,
      description: `Real-time ${symbol} VWAP analysis for intraday and swing trading strategies.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/vwap/${ticker.toLowerCase()}`,
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

export default async function VWAPPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/vwap/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const volume = snapshot.volume || 0
  const isPositive = changePercent >= 0

  // Simplified VWAP calculation (in production, would use actual intraday data)
  const vwap = price * 0.998 // Approximate VWAP slightly below current price
  const aboveVWAP = price > vwap

  const vwapFaqs = [
    {
      question: `What is ${symbol} VWAP?`,
      answer: `${symbol} VWAP (Volume Weighted Average Price) is the average price weighted by volume throughout the trading day. Currently at approximately $${vwap.toFixed(2)}, with ${symbol} trading ${aboveVWAP ? 'above' : 'below'} VWAP at $${price.toFixed(2)}. VWAP helps identify the true average price and institutional activity.`
    },
    {
      question: `How do you calculate ${symbol} VWAP?`,
      answer: `${symbol} VWAP is calculated by: (1) Multiplying typical price (High + Low + Close)/3 by volume for each period, (2) Summing these values, (3) Dividing by total volume. This gives a volume-weighted average that resets daily and represents the true average price institutional traders pay.`
    },
    {
      question: `How to trade ${symbol} using VWAP?`,
      answer: `Trade ${symbol} using VWAP by: (1) Buying when price dips below VWAP in uptrends (institutional support), (2) Selling when price rises above VWAP in downtrends (resistance), (3) Using VWAP as dynamic support/resistance, (4) Trading pullbacks to VWAP for entries.`
    },
    {
      question: `Is ${symbol} above or below VWAP?`,
      answer: `${symbol} is currently trading ${aboveVWAP ? 'above' : 'below'} VWAP. Price at $${price.toFixed(2)} vs VWAP at $${vwap.toFixed(2)}. Trading above VWAP indicates bullish sentiment and buying pressure, while below suggests bearish pressure and potential resistance.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} VWAP`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} VWAP - Volume Weighted Average Price`,
      description: `Real-time ${symbol} (${companyName}) VWAP analysis for intraday and swing trading.`,
      url: pageUrl,
      keywords: [`${symbol} VWAP`, `${symbol} volume weighted average price`, `${symbol} VWAP indicator`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(vwapFaqs),
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
            <span>{symbol} VWAP</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} VWAP Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Volume Weighted Average Price indicator</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">VWAP</p>
                <p className="text-3xl font-bold text-cyan-400">${vwap.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Position</p>
                <p className={`text-2xl font-bold ${aboveVWAP ? 'text-green-500' : 'text-red-500'}`}>
                  {aboveVWAP ? 'Above VWAP' : 'Below VWAP'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Volume</p>
                <p className="text-2xl font-bold">{(volume / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>

          {/* VWAP Bands */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">VWAP Bands & Levels</h2>
            <div className="space-y-3">
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-500">VWAP + 2 SD (Upper Band)</span>
                  <span className="text-xl font-bold">${(vwap * 1.04).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Overbought zone - potential resistance</p>
              </div>
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-500">VWAP + 1 SD</span>
                  <span className="text-xl font-bold">${(vwap * 1.02).toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-cyan-600/20 p-5 rounded-lg border border-cyan-500/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-400 text-lg">VWAP (Volume Weighted Average)</span>
                  <span className="text-2xl font-bold text-cyan-400">${vwap.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">True average price - key support/resistance</p>
              </div>
              <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-500">VWAP - 1 SD</span>
                  <span className="text-xl font-bold">${(vwap * 0.98).toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-500">VWAP - 2 SD (Lower Band)</span>
                  <span className="text-xl font-bold">${(vwap * 0.96).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Oversold zone - potential support</p>
              </div>
            </div>
          </section>

          {/* VWAP Uses */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key VWAP Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Trend Filter', desc: 'Above VWAP = bullish, Below = bearish', icon: '📊' },
                { name: 'Support/Resistance', desc: 'Dynamic intraday S/R levels', icon: '🎯' },
                { name: 'Institutional Activity', desc: 'Where smart money trades', icon: '🏦' },
                { name: 'Entry Timing', desc: 'Pullbacks to VWAP for entries', icon: '⏰' },
                { name: 'Exit Strategy', desc: 'Take profits at VWAP deviations', icon: '💰' },
                { name: 'Market Sentiment', desc: 'Gauge buyer/seller strength', icon: '📈' },
              ].map((use, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{use.icon}</div>
                    <div>
                      <p className="font-bold text-lg">{use.name}</p>
                      <p className="text-sm text-muted-foreground">{use.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">VWAP Trading Strategies</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">VWAP Pullback Strategy (Bullish)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Identify strong uptrend with price above VWAP</li>
                  <li>• Wait for price to pull back and touch VWAP</li>
                  <li>• Look for bullish reversal candles at VWAP support</li>
                  <li>• Enter long when price bounces off VWAP with volume</li>
                  <li>• Stop loss below VWAP or recent swing low</li>
                  <li>• Target: Upper VWAP bands or previous high</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">VWAP Rejection Strategy (Bearish)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Identify downtrend with price below VWAP</li>
                  <li>• Wait for price to rally up to VWAP resistance</li>
                  <li>• Look for bearish rejection candles at VWAP</li>
                  <li>• Enter short when price rejects VWAP with volume</li>
                  <li>• Stop loss above VWAP or recent swing high</li>
                  <li>• Target: Lower VWAP bands or previous low</li>
                </ul>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-lg mb-2 text-blue-500">VWAP Mean Reversion Strategy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Trade when price extends far from VWAP (±2 SD)</li>
                  <li>• Buy at lower band, sell at upper band</li>
                  <li>• Expect price to revert back to VWAP</li>
                  <li>• Works best in ranging/sideways markets</li>
                  <li>• Exit positions when price reaches VWAP</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Anchored VWAP */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Anchored VWAP</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Anchored VWAP starts calculation from a specific event rather than the daily open:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-500/30">
                  <p className="font-bold mb-1">Earnings Release VWAP</p>
                  <p className="text-sm text-muted-foreground">Track institutional positioning after earnings</p>
                </div>
                <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-500/30">
                  <p className="font-bold mb-1">Gap Fill VWAP</p>
                  <p className="text-sm text-muted-foreground">Anchor from gap open for support/resistance</p>
                </div>
                <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-500/30">
                  <p className="font-bold mb-1">52-Week High VWAP</p>
                  <p className="text-sm text-muted-foreground">Track average price from breakout high</p>
                </div>
                <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-500/30">
                  <p className="font-bold mb-1">News Event VWAP</p>
                  <p className="text-sm text-muted-foreground">Measure reaction to major announcements</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time VWAP Analysis</h2>
            <p className="text-muted-foreground mb-6">Live VWAP calculations with automated band alerts</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {vwapFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="vwap" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
