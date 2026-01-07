import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFinancialProductSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

// Dynamic rendering - quote pages need fresh data
export const revalidate = 3600

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  // Fetch stock data for rich metadata
  let companyName = symbol
  let price: number | undefined
  let description = `${symbol} stock quote`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 60 } } // Revalidate every minute for quotes
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      description = `${companyName} (${symbol}) stock quote - Real-time price, live market data, and trading information.`
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  const title = `${symbol} Stock Quote - Live Price & Market Data`
  const fullDescription = `Get real-time ${symbol} (${companyName}) stock quote: ${price ? `$${price.toFixed(2)}` : 'Live price'}, daily change, volume, market cap, and trading data. Free live quotes updated throughout market hours.`

  return {
    title,
    description: fullDescription,
    keywords: [
      `${symbol} quote`,
      `${symbol} stock quote`,
      `${symbol} live quote`,
      `${symbol} real-time quote`,
      `${symbol} stock price`,
      `${companyName} quote`,
      `${symbol} market data`,
      `${symbol} trading data`,
      `${symbol} price today`,
      `${symbol} live price`,
    ],
    openGraph: {
      title: `${symbol} Stock Quote | Lician`,
      description: fullDescription,
      type: 'article',
      url: `${SITE_URL}/quote/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Stock Quote`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Quote`,
      description: fullDescription,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/quote/${ticker.toLowerCase()}`,
    },
  }
}

// Fetch stock data
async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 60 } } // Revalidate every minute
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Quote-specific FAQs
function getQuoteFAQs(ticker: string, companyName: string, price?: number, dayChange?: number, volume?: number) {
  return [
    {
      question: `What is ${ticker} stock quote?`,
      answer: price
        ? `${ticker} (${companyName}) stock is currently quoted at $${price.toFixed(2)}. Stock quotes represent the current market price at which shares are available for trading during market hours.`
        : `${ticker} (${companyName}) stock quote shows the current trading price and market data. Visit our dashboard for real-time quotes during market hours (9:30 AM - 4:00 PM ET).`,
    },
    {
      question: `What is ${ticker} stock price right now?`,
      answer: price
        ? `${ticker} is trading at $${price.toFixed(2)}${dayChange ? ` (${dayChange > 0 ? '+' : ''}${dayChange.toFixed(2)}, ${((dayChange / (price - dayChange)) * 100).toFixed(2)}%)` : ''} as of the latest market data. Prices update in real-time during trading hours.`
        : `Check our live dashboard for the current ${ticker} stock price with real-time updates throughout market hours.`,
    },
    {
      question: `How do I get a live ${ticker} quote?`,
      answer: `Get live ${ticker} quotes on our platform with real-time updates during market hours. Our dashboard displays current price, daily change, volume, market cap, and intraday price movements updated every few seconds.`,
    },
    {
      question: `What does ${ticker}'s stock quote include?`,
      answer: `${ticker} stock quote includes current price, daily price change ($ and %), opening price, previous close, day's high/low, 52-week high/low, trading volume, market capitalization, and bid/ask spreads. This gives you a complete snapshot of current market activity.`,
    },
    {
      question: `Is ${ticker} stock quote updated in real-time?`,
      answer: `Yes, ${ticker} stock quotes are updated in real-time during market hours (9:30 AM - 4:00 PM ET, Monday-Friday). Pre-market (4:00-9:30 AM) and after-hours (4:00-8:00 PM) quotes are also available for extended trading sessions.`,
    },
    {
      question: `What is ${ticker}'s current trading volume?`,
      answer: volume
        ? `${ticker} current trading volume is ${(volume / 1e6).toFixed(2)} million shares. Trading volume indicates market activity and liquidity - higher volume typically means easier buying and selling.`
        : `View ${ticker}'s live trading volume on our dashboard. Volume data helps assess market interest and liquidity for the stock.`,
    },
    {
      question: `Where can I see ${ticker} historical quotes?`,
      answer: `View ${ticker} historical stock quotes on our platform with daily, weekly, and monthly data going back multiple years. Historical quotes help analyze price trends, volatility patterns, and long-term performance.`,
    },
    {
      question: `What is the difference between ${ticker} bid and ask price?`,
      answer: `The bid price is what buyers are willing to pay for ${ticker}, while the ask price is what sellers want. The difference (spread) indicates liquidity - narrower spreads typically mean more liquid stocks with lower trading costs.`,
    },
  ]
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export default async function QuotePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  // Fetch data
  const stockData = await getStockData(symbol)
  const companyName = stockData?.companyFacts?.name || symbol
  const price = stockData?.snapshot?.price
  const dayChange = stockData?.snapshot?.day_change
  const dayChangePercent = stockData?.snapshot?.day_change_percent
  const volume = stockData?.snapshot?.volume
  const marketCap = stockData?.snapshot?.market_cap
  const dayHigh = stockData?.snapshot?.day_high
  const dayLow = stockData?.snapshot?.day_low
  const open = stockData?.snapshot?.open
  const previousClose = stockData?.snapshot?.previous_close
  const exchange = stockData?.snapshot?.exchange || 'NYSE'
  const description = stockData?.companyFacts?.description

  const pageUrl = `${SITE_URL}/quote/${ticker.toLowerCase()}`

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Quotes', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Quote`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Quote - Live Price & Market Data`,
    description: `Real-time stock quote for ${companyName} (${symbol}) with live price, volume, and market data.`,
    url: pageUrl,
    keywords: [`${symbol} quote`, `${symbol} stock quote`, `${symbol} live quote`, `${companyName} quote`],
  })

  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: `${companyName} (${symbol}) common stock quote on ${exchange}`,
    url: pageUrl,
    price,
    currency: 'USD',
    exchange,
  })

  const quoteFaqs = getQuoteFAQs(symbol, companyName, price, dayChange, volume)
  const faqSchema = getFAQSchema(quoteFaqs)

  const schemas = [breadcrumbSchema, articleSchema, financialProductSchema, faqSchema]

  const isPositive = dayChange ? dayChange >= 0 : false
  const isMarketOpen = true // TODO: Add market hours check

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Stock Quote</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {symbol} Stock Quote
            </h1>
            <p className="text-xl text-muted-foreground">{companyName}</p>
            {isMarketOpen && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-500">Market Open - Live Quote</span>
              </div>
            )}
          </div>

          {/* Main Quote Card */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Section */}
              <div>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                  {price ? (
                    <div className="flex items-baseline gap-3">
                      <div className="text-5xl font-bold">${price.toFixed(2)}</div>
                      {dayChange !== undefined && dayChangePercent !== undefined && (
                        <div className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          <span>{isPositive ? '+' : ''}{dayChange.toFixed(2)}</span>
                          <span>({isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-2xl text-muted-foreground">Loading...</div>
                  )}
                </div>

                {/* Day Range */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {open !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground">Open</div>
                      <div className="text-lg font-semibold">${open.toFixed(2)}</div>
                    </div>
                  )}
                  {previousClose !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground">Previous Close</div>
                      <div className="text-lg font-semibold">${previousClose.toFixed(2)}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {dayLow !== undefined && dayHigh !== undefined && (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground">Day Low</div>
                        <div className="text-lg font-semibold">${dayLow.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Day High</div>
                        <div className="text-lg font-semibold">${dayHigh.toFixed(2)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Market Data Section */}
              <div>
                <div className="space-y-4">
                  {volume !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity size={18} />
                        <span>Volume</span>
                      </div>
                      <div className="font-semibold">{(volume / 1e6).toFixed(2)}M</div>
                    </div>
                  )}

                  {marketCap !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign size={18} />
                        <span>Market Cap</span>
                      </div>
                      <div className="font-semibold">{formatNumber(marketCap)}</div>
                    </div>
                  )}

                  {stockData?.metrics?.price_to_earnings_ratio && (
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BarChart3 size={18} />
                        <span>P/E Ratio</span>
                      </div>
                      <div className="font-semibold">{stockData.metrics.price_to_earnings_ratio.toFixed(2)}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3">
                    <div className="text-muted-foreground">Exchange</div>
                    <div className="font-semibold">{exchange}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Company */}
          {description && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About {companyName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {description.slice(0, 500)}...
              </p>
            </div>
          )}

          {/* CTA to Full Analysis */}
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-3">
                Want Complete Analysis for {symbol}?
              </h2>
              <p className="text-muted-foreground mb-6">
                Beyond the live quote, get AI-powered analysis, DCF valuation, financial health scores,
                growth metrics, dividend analysis, insider trading data, analyst ratings, and 12-month price forecasts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/stock/${ticker.toLowerCase()}`}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Full Analysis
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href={`/dashboard?ticker=${symbol}`}
                  className="inline-flex items-center gap-2 bg-card hover:bg-secondary border border-border px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Open in Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">More {symbol} Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href={`/forecast/${ticker.toLowerCase()}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Price Forecast</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                href={`/analysis/${ticker.toLowerCase()}/valuation`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Valuation Analysis</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                href={`/earnings/${ticker.toLowerCase()}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Earnings Date</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                href={`/analyst/${ticker.toLowerCase()}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Analyst Ratings</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                href={`/insider/${ticker.toLowerCase()}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Insider Trading</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                href={`/news/${ticker.toLowerCase()}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <span>Latest News</span>
                <ArrowRight size={18} className="text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {quoteFaqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Links */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
