import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  getFinancialProductSchema,
  SITE_URL,
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Stock Price Today - Real-Time Price & Changes`,
    description: `Get the latest ${symbol} stock price with real-time updates. View today's price, daily changes, 52-week range, historical prices, and live market data for ${symbol}.`,
    keywords: [
      `${symbol} stock price`,
      `${symbol} price today`,
      `${symbol} share price`,
      `${symbol} stock price today`,
      `${symbol} current price`,
      `${symbol} real time price`,
      `${symbol} stock quote`,
      `${symbol} live price`,
    ],
    openGraph: {
      title: `${symbol} Stock Price Today | Real-Time Quote & Analysis`,
      description: `Live ${symbol} stock price with real-time updates, daily changes, and price history.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 60 } } // Revalidate every minute for fresh price data
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function PricePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const dayChange = snapshot.day_change || 0
  const dayChangePercent = snapshot.day_change_percent || 0
  const open = snapshot.open_price || 0
  const high = snapshot.high_price || 0
  const low = snapshot.low_price || 0
  const previousClose = snapshot.previous_close || 0
  const volume = snapshot.volume || 0
  const week52High = snapshot.week_52_high || 0
  const week52Low = snapshot.week_52_low || 0

  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Calculate price statistics
  const week52Range = week52High && week52Low ?
    ((price - week52Low) / (week52High - week52Low) * 100).toFixed(1) : 0

  // Generate price-focused FAQs
  const priceFaqs = [
    {
      question: `What is the ${symbol} stock price today?`,
      answer: `The current ${symbol} stock price is $${price.toFixed(2)}. ${companyName} shares are ${dayChangePercent >= 0 ? 'up' : 'down'} ${Math.abs(dayChangePercent).toFixed(2)}% today, with a change of ${dayChangePercent >= 0 ? '+' : ''}$${dayChange.toFixed(2)} from the previous close of $${previousClose.toFixed(2)}.`
    },
    {
      question: `What is ${symbol}'s 52-week high and low?`,
      answer: week52High && week52Low ?
        `${symbol} has a 52-week high of $${week52High.toFixed(2)} and a 52-week low of $${week52Low.toFixed(2)}. The current price of $${price.toFixed(2)} is ${week52Range}% within this range, trading ${((price - week52Low) / week52Low * 100).toFixed(1)}% above the 52-week low.` :
        `The 52-week range for ${symbol} is available on our dashboard along with historical price charts and analysis.`
    },
    {
      question: `Is ${symbol} stock price going up or down?`,
      answer: `${symbol} stock is currently ${dayChangePercent >= 0 ? 'up' : 'down'} ${Math.abs(dayChangePercent).toFixed(2)}% for the day. Stock prices fluctuate based on market conditions, company news, earnings reports, and investor sentiment. Check our real-time dashboard for live price updates throughout the trading day.`
    },
    {
      question: `What was ${symbol}'s opening price today?`,
      answer: open ?
        `${symbol} opened at $${open.toFixed(2)} today. The intraday high is $${high.toFixed(2)} and the low is $${low.toFixed(2)}. The stock has moved ${((price - open) / open * 100).toFixed(2)}% from the opening price.` :
        `Real-time opening prices and intraday statistics for ${symbol} are available on our live dashboard during market hours (9:30 AM - 4:00 PM ET).`
    },
    {
      question: `How do I track ${symbol} stock price in real-time?`,
      answer: `Track ${symbol} stock price in real-time on our dashboard with live updates during market hours. View current price, intraday charts, volume, bid/ask spreads, and set price alerts to get notified of significant price movements.`
    },
    {
      question: `What affects ${symbol} stock price?`,
      answer: `${symbol} stock price is influenced by multiple factors including: quarterly earnings reports, revenue growth, profit margins, analyst ratings and price targets, institutional buying/selling, market sentiment, ${sector ? `${sector} sector trends, ` : ''}macroeconomic conditions, interest rates, and company-specific news and developments.`
    },
    {
      question: `What is the average price target for ${symbol}?`,
      answer: `Analyst price targets for ${symbol} vary based on different valuation models and growth assumptions. Our AI analysis aggregates price targets from multiple Wall Street analysts to provide consensus estimates. Visit our forecast page for detailed price target analysis.`
    },
    {
      question: `Is ${symbol} stock price fair value?`,
      answer: metrics?.price_to_earnings_ratio ?
        `${symbol} currently trades at a P/E ratio of ${metrics.price_to_earnings_ratio.toFixed(2)}. Our DCF calculator provides intrinsic value estimates based on future cash flows to determine if ${symbol} is trading above or below fair value. Compare ${symbol}'s valuation to industry peers for additional context.` :
        `Use our DCF valuation calculator and AI analysis to determine if ${symbol} is trading at fair value based on fundamental metrics and growth projections.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Price`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Price Today - Real-Time Quote & Daily Changes`,
    description: `Live stock price for ${symbol} (${companyName}) with real-time updates, daily price changes, and historical data.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock price`,
      `${symbol} price today`,
      `${symbol} live price`,
      `${symbol} stock quote`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    url: pageUrl,
    price,
  })

  const faqSchema = getFAQSchema(priceFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, financialProductSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Price</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Price Today
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time price and market data for {companyName}
          </p>

          {/* Current Price Card - Featured */}
          <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 p-8 rounded-xl border border-green-500/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Price</p>
                <p className="text-5xl font-bold mb-4">${price.toFixed(2)}</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  dayChangePercent >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  <span className="text-2xl font-bold">
                    {dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
                  </span>
                  <span className="text-lg">
                    ({dayChangePercent >= 0 ? '+' : ''}${dayChange.toFixed(2)})
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Close</span>
                  <span className="font-bold">${previousClose.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open</span>
                  <span className="font-bold">${open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Day Range</span>
                  <span className="font-bold">${low.toFixed(2)} - ${high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-bold">{volume.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 52-Week Range */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">52-Week Range</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">52-Week Low</p>
                    <p className="text-2xl font-bold">${week52Low.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">52-Week High</p>
                    <p className="text-2xl font-bold">${week52High.toFixed(2)}</p>
                  </div>
                </div>
                {week52High && week52Low && (
                  <>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: '100%' }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-foreground"
                        style={{ left: `${week52Range}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {((price - week52Low) / week52Low * 100).toFixed(1)}% above low
                      </span>
                      <span className="text-muted-foreground">
                        {((week52High - price) / week52High * 100).toFixed(1)}% below high
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Market Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {snapshot.market_cap && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-bold">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
              {metrics?.price_to_earnings_ratio && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-xl font-bold">{metrics.price_to_earnings_ratio.toFixed(2)}</p>
                </div>
              )}
              {metrics?.dividend_yield && metrics.dividend_yield > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Dividend Yield</p>
                  <p className="text-xl font-bold">{(metrics.dividend_yield * 100).toFixed(2)}%</p>
                </div>
              )}
              {metrics?.earnings_per_share && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">EPS (TTM)</p>
                  <p className="text-xl font-bold">${metrics.earnings_per_share.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Price History Highlights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Price History Highlights</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {companyName} ({symbol}) has shown significant price movements over the past year:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  {week52High && week52Low && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>52-week high of <strong className="text-foreground">${week52High.toFixed(2)}</strong> represents the peak price in the last year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>52-week low of <strong className="text-foreground">${week52Low.toFixed(2)}</strong> marks the bottom of the trading range</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Current price is positioned at <strong className="text-foreground">{week52Range}%</strong> within the 52-week range</span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Today's change of <strong className={dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>{dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%</strong> reflects current market sentiment</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Understanding Stock Prices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Stock Price</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The stock price of {symbol} reflects the market's collective valuation of {companyName}. Several factors influence daily price movements:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Company Fundamentals</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Earnings reports and revenue growth</li>
                    <li>• Profit margins and cash flow</li>
                    <li>• New product launches and innovations</li>
                    <li>• Management changes and strategy</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Market Factors</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Analyst ratings and price targets</li>
                    <li>• Institutional buying and selling</li>
                    <li>• Sector trends and competition</li>
                    <li>• Economic indicators and interest rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Go beyond the price - access AI-powered insights, DCF valuations, and comprehensive financial analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/chart/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Price Chart
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {priceFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Stock prices are delayed and should not be considered as financial advice. Real-time quotes are available during market hours. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="price" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
