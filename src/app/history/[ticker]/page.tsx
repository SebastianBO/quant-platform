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
    title: `${symbol} Stock History - Historical Prices & Performance`,
    description: `${symbol} stock price history and historical performance. View past prices, returns, splits, dividends, and long-term performance data.`,
    keywords: [
      `${symbol} stock history`,
      `${symbol} historical prices`,
      `${symbol} price history`,
      `${symbol} past performance`,
      `${symbol} historical data`,
    ],
    openGraph: {
      title: `${symbol} Stock History | Historical Prices`,
      description: `Historical price data and performance for ${symbol} stock.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/history/${ticker.toLowerCase()}`,
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

export default async function HistoryPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/history/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const listingDate = companyFacts?.listing_date

  // Calculate 52-week performance
  const yearHigh = snapshot.yearHigh || price
  const yearLow = snapshot.yearLow || price
  const fromYearHigh = ((price - yearHigh) / yearHigh * 100).toFixed(1)
  const fromYearLow = ((price - yearLow) / yearLow * 100).toFixed(1)

  const historyFaqs = [
    {
      question: `What is ${symbol} stock price history?`,
      answer: `${symbol} has traded between $${yearLow.toFixed(2)} and $${yearHigh.toFixed(2)} over the past 52 weeks. Current price is $${price.toFixed(2)}, which is ${fromYearHigh}% from the 52-week high and +${fromYearLow}% from the 52-week low.`
    },
    {
      question: `When did ${symbol} go public?`,
      answer: listingDate
        ? `${symbol} (${companyName}) went public on ${listingDate} and has been trading on major exchanges since then.`
        : `${symbol} is a publicly traded company listed on major stock exchanges.`
    },
    {
      question: `How has ${symbol} performed historically?`,
      answer: `${symbol} performance varies by time period. View the chart and historical data above for returns over 1-day, 1-month, YTD, 1-year, and longer timeframes.`
    },
    {
      question: `Has ${symbol} ever split?`,
      answer: `Stock splits increase the number of shares while proportionally decreasing the share price. Check ${symbol}'s corporate actions history for split information.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} History`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock History - Historical Prices & Performance`,
      description: `Historical price data and performance analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} stock history`, `${symbol} historical prices`, `${symbol} performance`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(historyFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} History</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stock History</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Historical prices & performance</p>

          {/* Current vs Historical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              <p className={`text-sm ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
              <p className="text-sm text-muted-foreground mb-1">52-Week High</p>
              <p className="text-3xl font-bold">${yearHigh.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{fromYearHigh}% from high</p>
            </div>
            <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
              <p className="text-sm text-muted-foreground mb-1">52-Week Low</p>
              <p className="text-3xl font-bold">${yearLow.toFixed(2)}</p>
              <p className="text-sm text-green-500">+{fromYearLow}% from low</p>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">52-Week Trading Range</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="relative h-4 bg-secondary rounded-full mb-2">
                <div
                  className="absolute h-4 w-4 bg-green-500 rounded-full top-0 transform -translate-x-1/2"
                  style={{ left: `${((price - yearLow) / (yearHigh - yearLow)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${yearLow.toFixed(2)}</span>
                <span className="font-bold text-foreground">${price.toFixed(2)}</span>
                <span>${yearHigh.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Company Timeline */}
          {listingDate && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Company Timeline</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-bold">IPO / Listing Date</p>
                    <p className="text-muted-foreground">{listingDate}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Trading Stats */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Trading Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-xl font-bold">{(snapshot.volume / 1e6).toFixed(1)}M</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground">Avg Volume</p>
                <p className="text-xl font-bold">{((snapshot.avgVolume || snapshot.volume) / 1e6).toFixed(1)}M</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">${(snapshot.market_cap / 1e9).toFixed(1)}B</p>
              </div>
              {snapshot.beta && (
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">Beta</p>
                  <p className="text-xl font-bold">{snapshot.beta.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Full Historical Data</h2>
            <p className="text-muted-foreground mb-6">Interactive charts with historical prices and returns</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {historyFaqs.map((faq, i) => (
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
