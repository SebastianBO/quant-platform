import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { LastUpdatedStatic } from '@/components/seo/LastUpdated'
import PredictionAccuracy from '@/components/PredictionAccuracy'
import { UpcomingCatalysts, generateEventSchemas, CatalystEvent } from '@/components/UpcomingCatalysts'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getStockFAQsExtended,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'


interface Props {
  params: Promise<{ ticker: string }>
}

// ISR with 5 minute revalidation - balances freshness with crawl reliability
// This prevents Google crawl failures from API timeouts
export const revalidate = 300

// Fetch stock data for rich metadata
async function getStockDataForMeta(ticker: string) {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
  const currentDay = new Date().getDate()

  // Fetch real data for compelling meta description
  const stockData = await getStockDataForMeta(symbol)
  const price = stockData?.snapshot?.price
  const pe = stockData?.metrics?.price_to_earnings_ratio
  const dayChangePercent = stockData?.snapshot?.day_change_percent
  const companyName = stockData?.companyFacts?.name || symbol

  // Calculate prediction targets (same logic as page)
  const bullCase = price ? price * 1.30 : null
  const baseCase = price ? price * 1.15 : null

  // Build dynamic title (under 60 chars)
  // Format: "AAPL Prediction 2026 | Target: $312"
  let title = `${symbol} Stock Prediction ${currentYear} | AI Forecast`
  if (baseCase) {
    const shortTitle = `${symbol} Prediction ${currentYear} | Target: $${baseCase.toFixed(0)}`
    if (shortTitle.length <= 60) {
      title = shortTitle
    }
  }

  // Build dynamic description (155-160 chars max)
  // Formula: Price + Key metric + Prediction range + CTA + Freshness
  let description = `${symbol} stock price prediction for ${currentYear}-${currentYear + 1}. AI-powered forecast with bull, base & bear case targets. Updated ${currentMonth} ${currentDay}.`

  if (price && baseCase && bullCase) {
    const priceStr = `${symbol} at $${price.toFixed(0)}`
    const peStr = pe && pe > 0 ? ` (PE ${pe.toFixed(0)})` : ''
    const changeStr = dayChangePercent !== undefined ? `, ${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(1)}% today` : ''
    const targetStr = `. ${currentYear} target: $${baseCase.toFixed(0)}-$${bullCase.toFixed(0)}`
    const ctaStr = `. See AI analysis.`

    // Build description within limit
    description = `${priceStr}${peStr}${changeStr}${targetStr}${ctaStr}`
    if (description.length > 160) {
      description = `${priceStr}${peStr}${targetStr}${ctaStr}`
    }
    if (description.length > 160) {
      description = `${priceStr}${targetStr}. AI bull, base & bear cases. Updated daily.`
    }
  }

  return {
    title,
    description,
    keywords: [
      `${symbol} stock prediction`,
      `${symbol} price forecast`,
      `${symbol} stock price prediction ${currentYear}`,
      `${symbol} price target`,
      `${symbol} stock forecast`,
      `${symbol} earnings date`,
    ],
    openGraph: {
      title: `${symbol} Stock Prediction ${currentYear} | ${companyName}`,
      description,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/prediction/${ticker.toLowerCase()}`,
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

// Fetch real analyst ratings with price targets
async function getAnalystRatings(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/analyst-ratings?ticker=${ticker}&limit=50&days=365`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.analyst_ratings || []
  } catch {
    return []
  }
}

// Define rating type
interface AnalystRating {
  id: number
  ticker: string
  rating: string
  ratingPrior?: string
  action?: string
  priceTarget?: number
  priceTargetPrior?: number
  priceAtRating?: number
  ratingDate: string
  analyst?: {
    id: number
    name: string
    successRate?: number
    averageReturn?: number
    rankScore?: number
  } | null
  firm?: {
    id: number
    name: string
    tier?: string
  } | null
  confidence?: number
}

// Calculate smart prediction targets from analyst data and fundamentals
function calculatePredictionTargets(
  price: number,
  analystRatings: AnalystRating[],
  wallStreetTarget: number | null,
  metrics: Record<string, number | null | undefined>
) {
  // Extract valid price targets from analyst ratings
  const priceTargets = analystRatings
    .map(r => r.priceTarget)
    .filter((pt): pt is number => typeof pt === 'number' && pt > 0)

  // If we have analyst data, use it
  if (priceTargets.length >= 2) {
    const avgTarget = priceTargets.reduce((a, b) => a + b, 0) / priceTargets.length
    const highTarget = Math.max(...priceTargets)
    const lowTarget = Math.min(...priceTargets)

    // Sort for median
    const sorted = [...priceTargets].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const medianTarget = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

    return {
      bullCase: highTarget,
      baseCase: medianTarget,
      bearCase: lowTarget,
      avgTarget,
      source: 'analyst' as const,
      analystCount: priceTargets.length,
      confidence: 'high' as const,
    }
  }

  // Fallback: Use Wall Street consensus target if available
  if (wallStreetTarget && wallStreetTarget > 0) {
    // Calculate bull/bear from consensus with reasonable spread
    const upside = (wallStreetTarget - price) / price
    const spread = Math.min(Math.abs(upside) * 0.5, 0.15) // Cap spread at 15%

    return {
      bullCase: wallStreetTarget * (1 + spread),
      baseCase: wallStreetTarget,
      bearCase: wallStreetTarget * (1 - spread),
      avgTarget: wallStreetTarget,
      source: 'consensus' as const,
      analystCount: 0,
      confidence: 'medium' as const,
    }
  }

  // Smart fallback based on fundamentals
  const peRatio = metrics.price_to_earnings_ratio
  const revenueGrowth = metrics.revenue_growth
  const profitMargin = metrics.profit_margin
  const roe = metrics.return_on_equity

  // Calculate expected return based on fundamentals
  let expectedReturn = 0.08 // Default 8% market return

  // Adjust for growth
  if (typeof revenueGrowth === 'number' && revenueGrowth > 0) {
    expectedReturn += Math.min(revenueGrowth * 0.5, 0.15) // Growth premium, capped
  }

  // Adjust for profitability
  if (typeof profitMargin === 'number' && profitMargin > 0.15) {
    expectedReturn += 0.03 // Quality premium
  }

  // Adjust for ROE
  if (typeof roe === 'number' && roe > 0.15) {
    expectedReturn += 0.02 // Capital efficiency premium
  }

  // Adjust for valuation (high P/E = lower expected return)
  if (typeof peRatio === 'number') {
    if (peRatio > 40) expectedReturn -= 0.05
    else if (peRatio < 15) expectedReturn += 0.03
  }

  // Calculate scenarios
  const baseCase = price * (1 + expectedReturn)
  const bullCase = price * (1 + expectedReturn + 0.15)
  const bearCase = price * (1 + expectedReturn - 0.20)

  return {
    bullCase: Math.max(bullCase, price * 0.8), // Floor at -20%
    baseCase,
    bearCase: Math.max(bearCase, price * 0.6), // Floor at -40%
    avgTarget: baseCase,
    source: 'fundamental' as const,
    analystCount: 0,
    confidence: 'low' as const,
  }
}

// Get rating distribution
function getRatingDistribution(ratings: AnalystRating[]) {
  const counts = { buy: 0, hold: 0, sell: 0 }

  ratings.forEach(r => {
    const rating = (r.rating || '').toLowerCase()
    if (rating.includes('buy') || rating.includes('outperform') || rating.includes('overweight')) {
      counts.buy++
    } else if (rating.includes('sell') || rating.includes('underperform') || rating.includes('underweight')) {
      counts.sell++
    } else {
      counts.hold++
    }
  })

  const total = counts.buy + counts.hold + counts.sell
  const consensus = total > 0
    ? counts.buy > counts.hold + counts.sell ? 'Buy'
    : counts.sell > counts.buy + counts.hold ? 'Sell'
    : 'Hold'
    : null

  return { counts, total, consensus }
}

// Get most recent rating action
function getMostRecentAction(ratings: AnalystRating[]) {
  const withActions = ratings.filter(r => r.action && r.firm?.name)
  if (withActions.length === 0) return null

  const recent = withActions[0]
  return {
    firm: recent.firm?.name || 'Unknown',
    action: recent.action,
    rating: recent.rating,
    priceTarget: recent.priceTarget,
    date: recent.ratingDate,
    analyst: recent.analyst?.name,
  }
}

// Build initial catalyst events from stock data
function buildInitialEvents(ticker: string, companyName: string, snapshot: Record<string, unknown>): CatalystEvent[] {
  const events: CatalystEvent[] = []

  if (snapshot?.earningsDate) {
    const earningsDate = new Date(snapshot.earningsDate as string)
    if (earningsDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `earnings-${snapshot.earningsDate}-${ticker}`,
        type: 'earnings',
        title: `${ticker} Quarterly Earnings Report`,
        description: `${companyName} is scheduled to report quarterly financial results. Earnings can significantly impact stock predictions.`,
        date: snapshot.earningsDate as string,
        isConfirmed: true,
        importance: 'high',
      })
    }
  }

  if (snapshot?.exDividendDate) {
    const exDivDate = new Date(snapshot.exDividendDate as string)
    if (exDivDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `ex-dividend-${snapshot.exDividendDate}-${ticker}`,
        type: 'ex_dividend',
        title: `${ticker} Ex-Dividend Date`,
        description: snapshot.dividendShare
          ? `$${(snapshot.dividendShare as number).toFixed(2)} dividend - own shares before this date to receive payment.`
          : `Shareholders must own shares before this date to receive the upcoming dividend.`,
        date: snapshot.exDividendDate as string,
        isConfirmed: true,
        importance: 'medium',
      })
    }
  }

  return events
}

export default async function PredictionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Capture the data fetch time for freshness signal
  const dataFetchTime = new Date()

  // Fetch stock data and analyst ratings in parallel
  const [stockData, analystRatings] = await Promise.all([
    getStockData(symbol),
    getAnalystRatings(symbol),
  ])

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const wallStreetTarget = snapshot.priceTarget || null

  // Calculate prediction targets from real data
  const predictions = calculatePredictionTargets(
    price,
    analystRatings,
    wallStreetTarget,
    metrics || {}
  )

  const { bullCase, baseCase, bearCase, source, analystCount, confidence } = predictions

  // Calculate percentage changes
  const bullPct = ((bullCase - price) / price * 100)
  const basePct = ((baseCase - price) / price * 100)
  const bearPct = ((bearCase - price) / price * 100)

  // Get rating distribution
  const ratingDist = getRatingDistribution(analystRatings)

  // Get most recent action
  const recentAction = getMostRecentAction(analystRatings)

  // Get top analyst ratings (sorted by analyst rank if available)
  const topRatings = [...analystRatings]
    .sort((a, b) => (b.analyst?.rankScore || 0) - (a.analyst?.rankScore || 0))
    .slice(0, 5)

  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/prediction/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} (${symbol}) common stock`

  // Build initial catalyst events
  const initialEvents = buildInitialEvents(symbol, companyName, snapshot)

  // Prepare metrics for extended FAQ
  const metricsData = {
    price_to_earnings_ratio: metrics?.price_to_earnings_ratio,
    price_to_book_ratio: metrics?.price_to_book_ratio,
    market_cap: snapshot?.market_cap,
    earnings_per_share: metrics?.earnings_per_share,
    dividend_yield: metrics?.dividend_yield,
    revenue_growth: metrics?.revenue_growth,
    profit_margin: metrics?.profit_margin,
  }

  // Source description for content
  const sourceDescription = source === 'analyst'
    ? `Based on ${analystCount} Wall Street analyst price targets`
    : source === 'consensus'
    ? 'Based on Wall Street consensus estimate'
    : 'Based on fundamental analysis and historical trends'

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Prediction`, url: pageUrl },
  ])

  // Article Schema with dateModified
  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Price Prediction ${currentYear}-${currentYear + 1}`,
    description: `AI-powered price forecast and analysis for ${symbol} (${companyName}) with bull, base, and bear case price targets.`,
    url: pageUrl,
    dateModified: dataFetchTime.toISOString(),
    keywords: [
      `${symbol} stock prediction`,
      `${symbol} price forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} stock forecast`,
    ],
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  // Extended FAQ Schema with 18 questions
  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metricsData)
  const faqSchema = getFAQSchema(extendedFaqs)

  // Event Schema for upcoming catalysts
  const eventSchemas = generateEventSchemas(symbol, companyName, initialEvents, SITE_URL)

  // Combine all schemas
  const schemas: object[] = [
    breadcrumbSchema,
    articleSchema,
    corporationSchema,
    faqSchema,
    ...eventSchemas,
  ]

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
            <span>{symbol} Prediction</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Price Prediction {currentYear}-{currentYear + 1}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            AI-powered forecast for {companyFacts?.name || symbol}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {sourceDescription}
            {confidence === 'high' && ' - High Confidence'}
            {confidence === 'medium' && ' - Medium Confidence'}
          </p>

          {/* Last Updated Timestamp */}
          <LastUpdatedStatic
            timestamp={dataFetchTime}
            className="mb-8"
            prefix="Data Updated"
          />

          {/* Current Price */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-muted-foreground mb-2">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              {ratingDist.consensus && ratingDist.total > 0 && (
                <div className="text-right">
                  <p className="text-muted-foreground mb-2">Analyst Consensus</p>
                  <p className={`text-2xl font-bold ${
                    ratingDist.consensus === 'Buy' ? 'text-green-500' :
                    ratingDist.consensus === 'Sell' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {ratingDist.consensus}
                  </p>
                  <p className="text-sm text-muted-foreground">{ratingDist.total} analysts</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Targets */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Price Targets for {currentYear + 1}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Bear Case</p>
                <p className="text-3xl font-bold text-red-500">${bearCase.toFixed(2)}</p>
                <p className={`text-sm ${bearPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {bearPct >= 0 ? '+' : ''}{bearPct.toFixed(1)}%
                </p>
                {source === 'analyst' && (
                  <p className="text-xs text-muted-foreground mt-2">Lowest analyst target</p>
                )}
              </div>
              <div className="bg-yellow-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Base Case</p>
                <p className="text-3xl font-bold text-yellow-500">${baseCase.toFixed(2)}</p>
                <p className={`text-sm ${basePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {basePct >= 0 ? '+' : ''}{basePct.toFixed(1)}%
                </p>
                {source === 'analyst' && (
                  <p className="text-xs text-muted-foreground mt-2">Median analyst target</p>
                )}
              </div>
              <div className="bg-green-500/20 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Bull Case</p>
                <p className="text-3xl font-bold text-green-500">${bullCase.toFixed(2)}</p>
                <p className={`text-sm ${bullPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {bullPct >= 0 ? '+' : ''}{bullPct.toFixed(1)}%
                </p>
                {source === 'analyst' && (
                  <p className="text-xs text-muted-foreground mt-2">Highest analyst target</p>
                )}
              </div>
            </div>
          </section>

          {/* Visual Price Target Range */}
          {source === 'analyst' && analystCount >= 3 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Price Target Range</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="relative h-8 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-white"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((price - bearCase) / (bullCase - bearCase)) * 100))}%`
                    }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">Current</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>${bearCase.toFixed(0)}</span>
                  <span>${baseCase.toFixed(0)}</span>
                  <span>${bullCase.toFixed(0)}</span>
                </div>
              </div>
            </section>
          )}

          {/* PREDICTION ACCURACY TRACKER - Shows our historical track record */}
          <section className="mb-12">
            <PredictionAccuracy
              ticker={symbol}
              companyName={companyName}
              currentPrice={price}
            />
          </section>

          {/* Rating Distribution */}
          {ratingDist.total > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Analyst Rating Distribution</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-green-500 font-medium">Buy / Outperform</span>
                      <span>{ratingDist.counts.buy} ({((ratingDist.counts.buy / ratingDist.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${(ratingDist.counts.buy / ratingDist.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-yellow-500 font-medium">Hold / Neutral</span>
                      <span>{ratingDist.counts.hold} ({((ratingDist.counts.hold / ratingDist.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${(ratingDist.counts.hold / ratingDist.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-red-500 font-medium">Sell / Underperform</span>
                      <span>{ratingDist.counts.sell} ({((ratingDist.counts.sell / ratingDist.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${(ratingDist.counts.sell / ratingDist.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Most Recent Analyst Action */}
          {recentAction && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Latest Analyst Action</h2>
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-bold text-lg">{recentAction.firm}</p>
                    {recentAction.analyst && (
                      <p className="text-sm text-muted-foreground">{recentAction.analyst}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(recentAction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Action</p>
                      <p className={`font-bold ${
                        recentAction.action?.toLowerCase().includes('upgrade') ? 'text-green-500' :
                        recentAction.action?.toLowerCase().includes('downgrade') ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {recentAction.action || 'Reiterate'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Rating</p>
                      <p className={`font-bold ${
                        recentAction.rating?.toLowerCase().includes('buy') ? 'text-green-500' :
                        recentAction.rating?.toLowerCase().includes('sell') ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {recentAction.rating}
                      </p>
                    </div>
                    {recentAction.priceTarget && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Target</p>
                        <p className="font-bold text-blue-400">${recentAction.priceTarget.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Individual Analyst Ratings */}
          {topRatings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent Analyst Price Targets</h2>
              <div className="space-y-3">
                {topRatings.map((rating, i) => (
                  <div key={rating.id || i} className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rating.firm?.name || 'Unknown Firm'}</p>
                          {rating.firm?.tier && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              rating.firm.tier === 'tier_1' ? 'bg-blue-500/20 text-blue-400' :
                              rating.firm.tier === 'tier_2' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {rating.firm.tier === 'tier_1' ? 'Top Tier' : rating.firm.tier === 'tier_2' ? 'Major' : 'Analyst'}
                            </span>
                          )}
                        </div>
                        {rating.analyst?.name && (
                          <p className="text-sm text-muted-foreground">{rating.analyst.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(rating.ratingDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Rating</p>
                          <p className={`font-bold ${
                            rating.rating?.toLowerCase().includes('buy') ? 'text-green-500' :
                            rating.rating?.toLowerCase().includes('sell') ? 'text-red-500' :
                            'text-yellow-500'
                          }`}>
                            {rating.rating || 'N/A'}
                          </p>
                        </div>
                        {rating.priceTarget && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Price Target</p>
                            <p className="font-bold text-blue-400">${rating.priceTarget.toFixed(2)}</p>
                            {price > 0 && (
                              <p className={`text-xs ${
                                rating.priceTarget > price ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {rating.priceTarget > price ? '+' : ''}
                                {(((rating.priceTarget - price) / price) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        )}
                        {rating.analyst?.successRate && (
                          <div className="text-center hidden md:block">
                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                            <p className="font-bold text-purple-400">
                              {(rating.analyst.successRate * 100).toFixed(0)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {analystRatings.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    href={`/target-price/${ticker.toLowerCase()}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View all {analystRatings.length} analyst ratings
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Upcoming Catalysts - Events that could impact price predictions */}
          <section className="mb-12">
            <UpcomingCatalysts
              ticker={symbol}
              companyName={companyName}
              earningsDate={snapshot?.earningsDate}
              exDividendDate={snapshot?.exDividendDate}
              dividendAmount={snapshot?.dividendShare}
              initialEvents={initialEvents}
            />
          </section>

          {/* Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Factors Influencing {symbol} Stock</h2>
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Bullish Factors</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {metrics?.revenue_growth > 0 && (
                    <li>Revenue growth of {(metrics.revenue_growth * 100).toFixed(1)}% year-over-year</li>
                  )}
                  {metrics?.return_on_equity > 0.15 && (
                    <li>Strong return on equity of {(metrics.return_on_equity * 100).toFixed(1)}%</li>
                  )}
                  {metrics?.profit_margin > 0.10 && (
                    <li>Healthy profit margin of {(metrics.profit_margin * 100).toFixed(1)}%</li>
                  )}
                  {ratingDist.counts.buy > ratingDist.counts.sell && (
                    <li>{ratingDist.counts.buy} analysts rate {symbol} as Buy/Outperform</li>
                  )}
                  {bullPct > 20 && (
                    <li>Significant upside potential to bull case target</li>
                  )}
                  <li>Market position and competitive advantages</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold text-red-500 mb-2">Risk Factors</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {metrics?.price_to_earnings_ratio > 30 && (
                    <li>High P/E ratio of {metrics.price_to_earnings_ratio.toFixed(1)}x may limit upside</li>
                  )}
                  {metrics?.revenue_growth < 0 && (
                    <li>Declining revenue growth of {(metrics.revenue_growth * 100).toFixed(1)}%</li>
                  )}
                  {ratingDist.counts.sell > 0 && (
                    <li>{ratingDist.counts.sell} analysts rate {symbol} as Sell/Underperform</li>
                  )}
                  {bearPct < -15 && (
                    <li>Bear case implies {Math.abs(bearPct).toFixed(0)}% downside risk</li>
                  )}
                  <li>Market volatility and macroeconomic factors</li>
                  <li>Competitive pressures in {industry || 'the industry'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prediction Methodology */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Prediction Methodology</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              {source === 'analyst' ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    These price predictions are derived from <span className="text-foreground font-medium">{analystCount} Wall Street analyst price targets</span> collected over the past 12 months.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><span className="text-green-500">Bull Case:</span> Highest analyst price target</li>
                    <li><span className="text-yellow-500">Base Case:</span> Median of all analyst targets</li>
                    <li><span className="text-red-500">Bear Case:</span> Lowest analyst price target</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: Analyst price targets are forward-looking estimates and not guarantees of future performance.
                  </p>
                </div>
              ) : source === 'consensus' ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    These predictions are based on the <span className="text-foreground font-medium">Wall Street consensus price target</span> of ${wallStreetTarget?.toFixed(2)}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bull and bear cases are calculated with a reasonable spread around the consensus based on historical volatility.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    These predictions are generated using <span className="text-foreground font-medium">fundamental analysis</span> including:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {metrics?.price_to_earnings_ratio && <li>P/E Ratio: {metrics.price_to_earnings_ratio.toFixed(1)}x</li>}
                    {metrics?.revenue_growth && <li>Revenue Growth: {(metrics.revenue_growth * 100).toFixed(1)}%</li>}
                    {metrics?.profit_margin && <li>Profit Margin: {(metrics.profit_margin * 100).toFixed(1)}%</li>}
                    {metrics?.return_on_equity && <li>Return on Equity: {(metrics.return_on_equity * 100).toFixed(1)}%</li>}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    Limited analyst coverage available. Consider viewing more research before making investment decisions.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live data, AI insights, and detailed valuations for {symbol}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Quant Analysis
              </Link>
              <Link
                href={`/target-price/${ticker.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Price Target Details
              </Link>
            </div>
          </section>

          {/* FAQ Section - using extended FAQs */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {extendedFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="prediction" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
