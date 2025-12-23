import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TrendingUp, TrendingDown, Activity, Calendar, DollarSign } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} 52-Week High & Low - Price Range Analysis`,
    description: `${symbol} 52-week high and low price analysis. See current position in trading range, distance from highs/lows, historical breakout patterns, and price momentum indicators.`,
    keywords: [
      `${symbol} 52 week high`,
      `${symbol} 52 week low`,
      `${symbol} all time high`,
      `${symbol} price range`,
      `${symbol} 52 week range`,
      `${symbol} year high`,
      `${symbol} trading range`,
    ],
    openGraph: {
      title: `${symbol} 52-Week High & Low | Price Range Analysis`,
      description: `Track ${symbol}'s 52-week price range and current position. See distance from highs/lows and momentum signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/52-week-high/${ticker.toLowerCase()}`,
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

export default async function FiftyTwoWeekHighPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const week52High = snapshot.week_52_high || price
  const week52Low = snapshot.week_52_low || price
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/52-week-high/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate position in range (0-100%)
  const range = week52High - week52Low
  const positionInRange = range > 0 ? ((price - week52Low) / range) * 100 : 50

  // Calculate distance from highs/lows
  const distanceFromHigh = ((week52High - price) / price) * 100
  const distanceFromLow = ((price - week52Low) / price) * 100
  const isNearHigh = distanceFromHigh < 5
  const isNearLow = distanceFromLow < 5

  // Determine momentum status
  let momentumStatus = 'neutral'
  let momentumColor = 'text-yellow-500'
  let momentumBg = 'bg-yellow-500/10'
  let momentumBorder = 'border-yellow-500/30'

  if (positionInRange >= 90) {
    momentumStatus = 'Strong Upward Momentum'
    momentumColor = 'text-green-500'
    momentumBg = 'bg-green-500/10'
    momentumBorder = 'border-green-500/30'
  } else if (positionInRange >= 70) {
    momentumStatus = 'Upward Momentum'
    momentumColor = 'text-emerald-500'
    momentumBg = 'bg-emerald-500/10'
    momentumBorder = 'border-emerald-500/30'
  } else if (positionInRange <= 10) {
    momentumStatus = 'Oversold Territory'
    momentumColor = 'text-red-500'
    momentumBg = 'bg-red-500/10'
    momentumBorder = 'border-red-500/30'
  } else if (positionInRange <= 30) {
    momentumStatus = 'Downward Pressure'
    momentumColor = 'text-orange-500'
    momentumBg = 'bg-orange-500/10'
    momentumBorder = 'border-orange-500/30'
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s 52-week high?`,
      answer: `${symbol} (${companyName}) has a 52-week high of $${week52High.toFixed(2)}. The current price is $${price.toFixed(2)}, which is ${distanceFromHigh.toFixed(1)}% below the 52-week high. ${isNearHigh ? `The stock is trading near its 52-week high, indicating strong momentum.` : distanceFromHigh > 50 ? `The stock has significant upside to reach its 52-week high.` : `The stock is moderately below its peak.`}`,
    },
    {
      question: `What is ${symbol}'s 52-week low?`,
      answer: `${symbol}'s 52-week low is $${week52Low.toFixed(2)}. The current price is ${distanceFromLow.toFixed(1)}% above the 52-week low. ${isNearLow ? `The stock is trading near 52-week lows, which could represent a buying opportunity if fundamentals are strong.` : `The stock has gained significantly from its 52-week low.`}`,
    },
    {
      question: `Where is ${symbol} trading in its 52-week range?`,
      answer: `${symbol} is currently trading at ${positionInRange.toFixed(0)}% of its 52-week range. A position above 70% indicates the stock is in the upper end of its range with positive momentum, while below 30% suggests it's in the lower end. ${symbol}'s position suggests ${momentumStatus.toLowerCase()}.`,
    },
    {
      question: `Should I buy ${symbol} near its 52-week high?`,
      answer: `${isNearHigh ? `While ${symbol} is near its 52-week high, this can actually be a bullish signal. Stocks making new highs often continue higher due to momentum and lack of overhead resistance. However, confirm with strong volume and fundamental catalysts.` : `${symbol} is not currently near its 52-week high. Evaluate whether the current price offers value based on fundamentals, growth prospects, and technical setup.`} Always consider your risk tolerance and investment timeline.`,
    },
    {
      question: `What does it mean when ${symbol} hits a new 52-week high?`,
      answer: `When ${symbol} hits a new 52-week high, it means the stock is trading at its highest price in the past year. This typically signals: (1) Strong momentum and investor confidence, (2) No overhead resistance from prior sellers, (3) Potential institutional buying interest, (4) Positive fundamental developments. However, also consider valuation metrics.`,
    },
    {
      question: `Is ${symbol} overvalued at current levels?`,
      answer: `${symbol} is trading at ${positionInRange.toFixed(0)}% of its 52-week range. ${metrics?.price_to_earnings_ratio ? `With a P/E ratio of ${metrics.price_to_earnings_ratio.toFixed(1)}, ` : ''}valuation should be assessed relative to growth prospects, sector peers, and historical averages. Use our DCF calculator for intrinsic value analysis.`,
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Markets', url: `${SITE_URL}/markets` },
    { name: '52-Week Highs', url: `${SITE_URL}/markets/52-week-high` },
    { name: `${symbol}`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} 52-Week High & Low - Price Range Analysis`,
    description: `Detailed 52-week high and low analysis for ${symbol} (${companyName}) with current position in trading range and momentum indicators.`,
    url: pageUrl,
    keywords: [
      `${symbol} 52 week high`,
      `${symbol} 52 week low`,
      `${symbol} price range`,
      `${symbol} trading range`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(faqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/markets" className="hover:text-foreground">Markets</Link>
            {' / '}
            <Link href="/markets/52-week-high" className="hover:text-foreground">52-Week Highs</Link>
            {' / '}
            <span>{symbol}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {symbol} 52-Week High & Low Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Price range analysis for {companyName}
            </p>
          </div>

          {/* Current Price & Status Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                {snapshot.day_change_percent !== undefined && (
                  <p className={`text-lg font-medium mt-1 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent.toFixed(2)}% today
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">52-Week High</p>
                <p className="text-3xl font-bold text-green-500">${week52High.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {distanceFromHigh.toFixed(1)}% away
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">52-Week Low</p>
                <p className="text-3xl font-bold text-red-500">${week52Low.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  +{distanceFromLow.toFixed(1)}% above
                </p>
              </div>
            </div>
          </div>

          {/* Price Range Visual */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Position in 52-Week Range</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              {/* Status Badge */}
              <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${momentumBg} border ${momentumBorder}`}>
                <p className={`font-bold ${momentumColor}`}>{momentumStatus}</p>
              </div>

              {/* Visual Range Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>52W Low: ${week52Low.toFixed(2)}</span>
                  <span>Current: ${price.toFixed(2)}</span>
                  <span>52W High: ${week52High.toFixed(2)}</span>
                </div>
                <div className="relative h-8 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-lg overflow-hidden border border-border">
                  {/* Current price indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg"
                    style={{ left: `${positionInRange}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-foreground text-background px-2 py-1 rounded text-xs font-bold">
                        {positionInRange.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Oversold</span>
                  <span>Mid-Range</span>
                  <span>Overbought</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Range Width</p>
                  <p className="text-lg font-bold">${range.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">From High</p>
                  <p className="text-lg font-bold text-orange-500">-{distanceFromHigh.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">From Low</p>
                  <p className="text-lg font-bold text-green-500">+{distanceFromLow.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Range Position</p>
                  <p className={`text-lg font-bold ${momentumColor}`}>{positionInRange.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Trading Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positionInRange >= 80 && (
                <div className="bg-green-500/10 p-5 rounded-lg border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-500 mb-2">Strong Momentum Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        {symbol} is trading in the upper 20% of its 52-week range. Stocks in this zone often
                        continue higher due to positive momentum, but watch for potential resistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {positionInRange <= 20 && (
                <div className="bg-red-500/10 p-5 rounded-lg border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-500 mb-2">Potential Value Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        {symbol} is trading near 52-week lows. This could represent a buying opportunity
                        if fundamentals are strong, but confirm the reason for weakness first.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isNearHigh && (
                <div className="bg-blue-500/10 p-5 rounded-lg border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Activity className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-500 mb-2">Near 52-Week High</h3>
                      <p className="text-sm text-muted-foreground">
                        Trading within 5% of 52-week highs. Breakouts above this level with high volume
                        often lead to continued upside. Set alerts for new all-time highs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isNearHigh && !isNearLow && positionInRange > 40 && positionInRange < 60 && (
                <div className="bg-yellow-500/10 p-5 rounded-lg border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-500 mb-2">Mid-Range Trading</h3>
                      <p className="text-sm text-muted-foreground">
                        {symbol} is trading in the middle of its 52-week range. Wait for a clearer
                        directional signal or catalyst before making investment decisions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Historical Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Historical Price Context</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">52-Week High: ${week52High.toFixed(2)}</h3>
                    <p className="text-sm text-muted-foreground">
                      The highest price {symbol} has traded at in the past 52 weeks (approximately 252 trading days).
                      {isNearHigh ? ` Currently trading near this level, indicating strong momentum.` :
                       ` Current price is ${distanceFromHigh.toFixed(1)}% below this peak.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">52-Week Low: ${week52Low.toFixed(2)}</h3>
                    <p className="text-sm text-muted-foreground">
                      The lowest price {symbol} has traded at in the past year.
                      {isNearLow ? ` Currently near this level, which could represent value if fundamentals are intact.` :
                       ` Stock has recovered ${distanceFromLow.toFixed(1)}% from this low point.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">Volatility Range: ${range.toFixed(2)}</h3>
                    <p className="text-sm text-muted-foreground">
                      The difference between the 52-week high and low shows {symbol}'s price volatility.
                      A {range / week52Low > 0.5 ? 'wide range indicates higher volatility' : 'narrow range suggests relative stability'}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What to Do Next</h2>
            <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 p-6 rounded-xl border border-green-500/30">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-1">1.</span>
                  <span>
                    <strong>Verify the Catalyst:</strong> Understand why {symbol} is at its current price level.
                    Check recent news, earnings reports, and sector trends.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-1">2.</span>
                  <span>
                    <strong>Check Fundamentals:</strong> Use our AI analysis to evaluate if {symbol}'s fundamentals
                    support the current valuation and price momentum.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-1">3.</span>
                  <span>
                    <strong>Review Technical Setup:</strong> Look at volume, support/resistance levels,
                    and moving averages to confirm the trend direction.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-1">4.</span>
                  <span>
                    <strong>Set Price Alerts:</strong> Monitor for breakouts above 52-week highs or
                    bounces from 52-week lows as potential entry points.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access real-time charts, AI-powered insights, DCF valuation, and institutional data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Open Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p>
              <strong>Disclaimer:</strong> 52-week high and low data is for informational purposes only.
              Past price movements do not guarantee future results. Always conduct thorough research and
              consider your risk tolerance before making investment decisions.
            </p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
      <Footer />
    </>
  )
}
