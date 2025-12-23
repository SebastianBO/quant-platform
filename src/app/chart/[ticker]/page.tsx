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
    title: `${symbol} Stock Chart - Live Price Chart & Technical Analysis`,
    description: `${symbol} stock chart with live price updates. View candlestick charts, technical indicators, moving averages, RSI, MACD, and support/resistance levels.`,
    keywords: [
      `${symbol} chart`,
      `${symbol} stock chart`,
      `${symbol} price chart`,
      `${symbol} technical analysis`,
      `${symbol} candlestick chart`,
      `${symbol} live chart`,
    ],
    openGraph: {
      title: `${symbol} Stock Chart | Live Price & Technical Analysis`,
      description: `Interactive ${symbol} stock chart with technical indicators and real-time prices.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/chart/${ticker.toLowerCase()}`,
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

export default async function ChartPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/chart/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const chartFaqs = [
    {
      question: `Where can I see ${symbol} stock chart?`,
      answer: `This page provides ${symbol} chart access. For interactive charting with technical indicators, candlesticks, and drawing tools, click the button below to open the full charting interface.`
    },
    {
      question: `What technical indicators work for ${symbol}?`,
      answer: `Popular technical indicators for ${symbol} include Moving Averages (50-day, 200-day), RSI (Relative Strength Index), MACD, Bollinger Bands, and Volume. These help identify trends and potential entry/exit points.`
    },
    {
      question: `Is ${symbol} in an uptrend or downtrend?`,
      answer: `${symbol} is currently trading at $${price.toFixed(2)} with a ${snapshot.day_change_percent >= 0 ? 'positive' : 'negative'} ${Math.abs(snapshot.day_change_percent).toFixed(2)}% change today. Check the chart for longer-term trend analysis using moving averages.`
    },
    {
      question: `What is ${symbol} support and resistance?`,
      answer: `Support and resistance levels for ${symbol} can be identified on the chart using previous price highs and lows. The 52-week range is $${snapshot.yearLow?.toFixed(2) || 'N/A'} - $${snapshot.yearHigh?.toFixed(2) || 'N/A'}.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Charts', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Chart`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock Chart - Live Price & Technical Analysis`,
      description: `Interactive stock chart for ${symbol} (${companyName}) with technical indicators.`,
      url: pageUrl,
      keywords: [`${symbol} chart`, `${symbol} stock chart`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(chartFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Charts</Link>
            {' / '}
            <span>{symbol} Chart</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stock Chart</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Live price chart & technical analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
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

          {/* Chart Placeholder */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-bold mb-2">Interactive {symbol} Chart</h2>
              <p className="text-muted-foreground mb-6">View full candlestick charts with technical indicators</p>
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Open Full Chart
              </Link>
            </div>
          </section>

          {/* Technical Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Popular Technical Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Moving Averages', desc: 'SMA/EMA 20, 50, 200' },
                { name: 'RSI', desc: 'Overbought/Oversold' },
                { name: 'MACD', desc: 'Momentum & Trend' },
                { name: 'Bollinger Bands', desc: 'Volatility' },
                { name: 'Volume', desc: 'Trading Activity' },
                { name: 'Stochastics', desc: 'Momentum Oscillator' },
              ].map((ind, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{ind.name}</p>
                  <p className="text-sm text-muted-foreground">{ind.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timeframes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Chart Timeframes</h2>
            <div className="flex flex-wrap gap-2">
              {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'].map(tf => (
                <div key={tf} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
                  {tf}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Technical Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with support/resistance levels</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Technical Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {chartFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
