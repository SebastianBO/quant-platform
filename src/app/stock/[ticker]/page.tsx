import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardContent from '@/components/DashboardContent'
import StockSSRContent from '@/components/StockSSRContent'
import { LastUpdatedStatic } from '@/components/seo/LastUpdated'
import { UpcomingCatalysts, generateEventSchemas, CatalystEvent } from '@/components/UpcomingCatalysts'
import LicianScoreSSR from '@/components/scoring/LicianScoreSSR'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFinancialProductSchema,
  getFAQSchema,
  getStockFAQsExtended,
  getCorporationSchema,
  getAggregateRatingSchema,
  SITE_URL,
} from '@/lib/seo'
import { STOCK_CATEGORIES } from '@/lib/stocks'

interface Props {
  params: Promise<{ ticker: string }>
}

// ISR with 60 second revalidation - balances freshness with crawl reliability
// This prevents Google crawl failures from API timeouts while keeping data fresh
export const revalidate = 60

// Industry to peer mapping for smart peer selection
const INDUSTRY_PEERS: Record<string, string[]> = {
  'Software': ['MSFT', 'CRM', 'ADBE', 'NOW', 'INTU', 'ORCL'],
  'Software - Application': ['CRM', 'ADBE', 'INTU', 'WDAY', 'DDOG', 'NOW'],
  'Software - Infrastructure': ['MSFT', 'ORCL', 'NOW', 'SNOW', 'DDOG', 'MDB'],
  'Semiconductors': ['NVDA', 'AMD', 'INTC', 'AVGO', 'QCOM', 'TXN'],
  'Consumer Electronics': ['AAPL', 'SONY', 'DELL', 'HPQ', 'LOGI'],
  'Internet Content & Information': ['GOOGL', 'META', 'SNAP', 'PINS', 'NFLX'],
  'Internet Retail': ['AMZN', 'SHOP', 'MELI', 'EBAY', 'ETSY'],
  'Banks - Diversified': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS'],
  'Credit Services': ['V', 'MA', 'AXP', 'COF', 'DFS'],
  'Drug Manufacturers': ['LLY', 'JNJ', 'PFE', 'MRK', 'ABBV', 'BMY'],
  'Biotechnology': ['AMGN', 'GILD', 'VRTX', 'REGN', 'BIIB', 'MRNA'],
  'Medical Devices': ['ABT', 'MDT', 'SYK', 'BSX', 'ISRG'],
  'Auto Manufacturers': ['TSLA', 'F', 'GM', 'TM', 'RIVN'],
  'Oil & Gas Integrated': ['XOM', 'CVX', 'SHEL', 'BP', 'COP'],
  'Aerospace & Defense': ['BA', 'LMT', 'RTX', 'NOC', 'GD'],
  'Restaurants': ['MCD', 'SBUX', 'CMG', 'YUM', 'DPZ'],
  'Retail': ['WMT', 'COST', 'TGT', 'HD', 'LOW'],
}

const SECTOR_FALLBACKS: Record<string, string[]> = {
  'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
  'Financial Services': ['JPM', 'BAC', 'WFC', 'GS', 'V'],
  'Healthcare': ['UNH', 'JNJ', 'LLY', 'PFE', 'ABBV'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE'],
  'Consumer Defensive': ['PG', 'KO', 'PEP', 'WMT', 'COST'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  'Industrials': ['CAT', 'BA', 'UNP', 'HON', 'GE'],
  'Communication Services': ['GOOGL', 'META', 'NFLX', 'DIS', 'VZ'],
}

// Get peer tickers based on industry/sector
function getPeerTickers(ticker: string, industry?: string, sector?: string): string[] {
  const upperTicker = ticker.toUpperCase()

  // Try industry first
  if (industry) {
    for (const [key, peers] of Object.entries(INDUSTRY_PEERS)) {
      if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
        return peers.filter(p => p !== upperTicker).slice(0, 5)
      }
    }
  }

  // Fallback to sector
  if (sector && SECTOR_FALLBACKS[sector]) {
    return SECTOR_FALLBACKS[sector].filter(p => p !== upperTicker).slice(0, 5)
  }

  // Default peers
  return STOCK_CATEGORIES.MEGA_CAP.filter(p => p !== upperTicker).slice(0, 5)
}

// Generate metadata for SEO with dynamic data for maximum CTR
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
  const currentDay = new Date().getDate()

  // Fetch stock data for rich metadata
  let companyName = symbol
  let price: number | undefined
  let dayChangePercent: number | undefined
  let pe: number | undefined
  let marketCap: number | undefined
  let description = `${symbol} stock analysis`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      dayChangePercent = data.snapshot?.day_change_percent
      pe = data.metrics?.price_to_earnings_ratio
      marketCap = data.snapshot?.market_cap
      description = data.companyFacts?.description?.slice(0, 160) ||
        `${companyName} (${symbol}) stock analysis, price charts, financial statements, and AI-powered investment insights.`
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  // Build dynamic title (under 60 chars)
  // Format: "AAPL Stock: $243 Today | Full Analysis"
  let title = `${symbol} Stock Price & Analysis | ${companyName}`
  if (price) {
    const shortTitle = `${symbol} Stock: $${price.toFixed(0)} Today | Analysis`
    if (shortTitle.length <= 60) {
      title = shortTitle
    }
  }

  // Build dynamic description (155-160 chars max)
  // Formula: Price + Day change + Key metric + Market cap + CTA + Freshness
  let fullDescription = `${symbol} (${companyName}) stock: Real-time quotes, financials, DCF valuation & AI insights. Updated ${currentMonth} ${currentDay}.`

  if (price) {
    const priceStr = `${symbol} at $${price.toFixed(2)}`
    const changeStr = dayChangePercent !== undefined ? ` (${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(1)}% today)` : ''
    const peStr = pe && pe > 0 ? `, PE ${pe.toFixed(0)}` : ''
    const capStr = marketCap ? `, $${(marketCap / 1e9).toFixed(0)}B cap` : ''
    const ctaStr = `. Charts, financials & AI analysis.`

    // Build description within limit
    fullDescription = `${priceStr}${changeStr}${peStr}${capStr}${ctaStr}`
    if (fullDescription.length > 160) {
      fullDescription = `${priceStr}${changeStr}${peStr}${ctaStr}`
    }
    if (fullDescription.length > 160) {
      fullDescription = `${priceStr}${changeStr}. Real-time charts, financials & AI analysis. Updated daily.`
    }
  }

  return {
    title,
    description: fullDescription,
    keywords: [
      `${symbol} stock`,
      `${symbol} stock price`,
      `${symbol} analysis`,
      `${companyName} stock`,
      `${symbol} financials`,
      `${symbol} earnings`,
      `${symbol} earnings date`,
      `${symbol} dividend date`,
      `${symbol} valuation`,
      `${symbol} institutional ownership`,
      `buy ${symbol} stock`,
      `${symbol} forecast ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Stock Analysis | Lician`,
      description: fullDescription,
      type: 'article',
      url: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Stock Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Analysis`,
      description: fullDescription,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
    },
  }
}

// Fetch stock data for structured data
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

// Fetch peer data for comparison
async function getPeerData(peerTickers: string[]) {
  try {
    const peerPromises = peerTickers.map(async (peerTicker) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${peerTicker}`,
          { next: { revalidate: 3600 } }
        )
        if (!response.ok) return null
        const data = await response.json()

        return {
          ticker: peerTicker,
          name: data.companyFacts?.name || peerTicker,
          marketCap: data.snapshot?.market_cap || 0,
          pe: data.metrics?.price_to_earnings_ratio || 0,
          revenueGrowth: data.metrics?.revenue_growth || 0,
          profitMargin: data.metrics?.profit_margin || 0,
        }
      } catch {
        return null
      }
    })

    const results = await Promise.all(peerPromises)
    return results.filter((p): p is NonNullable<typeof p> => p !== null && p.marketCap > 0)
  } catch {
    return []
  }
}

// Fetch Lician Score for a stock
interface LicianScoreData {
  licianScore: number
  confidence: number
  summary: string
  dimensions: {
    value: { score: number }
    growth: { score: number }
    quality: { score: number }
    momentum: { score: number }
    safety: { score: number }
  }
}

async function getLicianScore(ticker: string): Promise<LicianScoreData | null> {
  try {
    // Use VERCEL_URL for production, fall back to localhost for dev
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(
      `${baseUrl}/api/score/${ticker}?includeFactors=false`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    // Silently fail - score is optional enhancement
    return null
  }
}

// Generate initial catalyst events from stock data
function buildInitialEvents(ticker: string, companyName: string, snapshot: any): CatalystEvent[] {
  const events: CatalystEvent[] = []

  // Add earnings event if available
  if (snapshot?.earningsDate) {
    const earningsDate = new Date(snapshot.earningsDate)
    // Only include if in the future or within past 7 days
    if (earningsDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `earnings-${snapshot.earningsDate}-${ticker}`,
        type: 'earnings',
        title: `${ticker} Quarterly Earnings Report`,
        description: `${companyName} is scheduled to report quarterly financial results. Watch for EPS and revenue surprises.`,
        date: snapshot.earningsDate,
        isConfirmed: true,
        importance: 'high',
      })
    }
  }

  // Add ex-dividend event if available
  if (snapshot?.exDividendDate) {
    const exDivDate = new Date(snapshot.exDividendDate)
    if (exDivDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `ex-dividend-${snapshot.exDividendDate}-${ticker}`,
        type: 'ex_dividend',
        title: `${ticker} Ex-Dividend Date`,
        description: snapshot.dividendShare
          ? `Shareholders must own ${ticker} before this date to receive the $${snapshot.dividendShare.toFixed(2)} dividend.`
          : `Shareholders must own ${ticker} before this date to receive the upcoming dividend.`,
        date: snapshot.exDividendDate,
        isConfirmed: true,
        importance: 'medium',
      })
    }
  }

  return events
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

export default async function StockPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Capture the data fetch time for freshness signal
  const dataFetchTime = new Date()

  // Fetch data for structured schema
  const stockData = await getStockData(symbol)
  const companyName = stockData?.companyFacts?.name || symbol
  const price = stockData?.snapshot?.price
  const exchange = stockData?.snapshot?.exchange || 'NYSE'
  const sector = stockData?.companyFacts?.sector
  const industry = stockData?.companyFacts?.industry
  const description = stockData?.companyFacts?.description || `${companyName} (${symbol}) common stock`
  const pageUrl = `${SITE_URL}/stock/${ticker.toLowerCase()}`

  // Get peer data for comparison section (creates unique content per stock)
  const peerTickers = getPeerTickers(symbol, industry, sector)
  const peers = await getPeerData(peerTickers)
  // TODO: Re-enable after fixing API call issue
  // const licianScore = await getLicianScore(symbol)
  const licianScore: LicianScoreData | null = null

  // Build initial catalyst events from stock data
  const initialEvents = buildInitialEvents(symbol, companyName, stockData?.snapshot)

  // Prepare metrics for extended FAQ
  const metrics = {
    price_to_earnings_ratio: stockData?.metrics?.price_to_earnings_ratio,
    price_to_book_ratio: stockData?.metrics?.price_to_book_ratio,
    market_cap: stockData?.snapshot?.market_cap,
    earnings_per_share: stockData?.metrics?.earnings_per_share,
    dividend_yield: stockData?.metrics?.dividend_yield,
    revenue_growth: stockData?.metrics?.revenue_growth,
    profit_margin: stockData?.metrics?.profit_margin,
  }

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock`, url: pageUrl },
  ])

  // Article Schema for the analysis content with dateModified
  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Analysis - ${companyName}`,
    description: `Comprehensive stock analysis for ${companyName} (${symbol}) including financials, valuation, and AI insights.`,
    url: pageUrl,
    image: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
    dateModified: dataFetchTime.toISOString(),
    keywords: [
      `${symbol} stock`,
      `${symbol} analysis`,
      `${companyName} stock`,
      `${symbol} price`,
    ],
  })

  // Financial Product Schema for rich results
  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: `${companyName} (${symbol}) common stock traded on ${exchange}`,
    url: pageUrl,
    price,
    currency: 'USD',
    exchange,
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    exchange,
    url: pageUrl,
  })

  // Aggregate Rating Schema - Use analyst ratings when available
  // TODO: Re-enable Lician Score after fixing API call issue
  let aggregateRatingSchema = null
  if (stockData?.analystRatings?.length > 0) {
    // Fallback to analyst ratings (1-5 scale)
    const ratings = stockData.analystRatings
    const ratingMap = { 'Strong Buy': 5, 'Buy': 4, 'Hold': 3, 'Sell': 2, 'Strong Sell': 1 }
    const avgRating = ratings.reduce((sum: number, r: any) => {
      return sum + (ratingMap[r.rating as keyof typeof ratingMap] || 3)
    }, 0) / ratings.length

    aggregateRatingSchema = getAggregateRatingSchema({
      ticker: symbol,
      ratingValue: avgRating,
      ratingCount: ratings.length,
      url: pageUrl,
    })
  }

  // Extended FAQ Schema with 18 questions
  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metrics)
  const faqSchema = getFAQSchema(extendedFaqs)

  // Event Schema for upcoming catalysts (for Google rich results)
  const eventSchemas = generateEventSchemas(symbol, companyName, initialEvents, SITE_URL)

  // Combine all schemas
  const schemas: object[] = [
    breadcrumbSchema,
    articleSchema,
    financialProductSchema,
    corporationSchema,
    faqSchema,
    ...eventSchemas,
  ]

  if (aggregateRatingSchema) {
    schemas.push(aggregateRatingSchema)
  }

  // Prepare SSR content props
  const ssrMetrics = {
    price_to_earnings_ratio: stockData?.metrics?.price_to_earnings_ratio,
    price_to_book_ratio: stockData?.metrics?.price_to_book_ratio,
    dividend_yield: stockData?.metrics?.dividend_yield,
    revenue_growth: stockData?.metrics?.revenue_growth,
    profit_margin: stockData?.metrics?.profit_margin,
    debt_to_equity: stockData?.metrics?.debt_to_equity,
    return_on_equity: stockData?.metrics?.return_on_equity,
    earnings_per_share: stockData?.metrics?.earnings_per_share,
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      {/* SSR Content - Visible immediately for crawlers and initial paint */}
      {/* This content is server-rendered and provides unique, indexable content */}
      <div className="ssr-content">
        <StockSSRContent
          ticker={symbol}
          companyName={companyName}
          price={price}
          dayChange={stockData?.snapshot?.day_change}
          dayChangePercent={stockData?.snapshot?.day_change_percent}
          marketCap={stockData?.snapshot?.market_cap}
          peRatio={stockData?.metrics?.price_to_earnings_ratio}
          sector={sector}
          industry={industry}
          description={description}
          exchange={exchange}
          employees={stockData?.companyFacts?.employees}
          website={stockData?.companyFacts?.website}
          headquarters={stockData?.companyFacts?.headquarters}
          metrics={ssrMetrics}
          peers={peers}
        />
        {/* Last Updated Timestamp - positioned after SSR content header */}
        <div className="max-w-7xl mx-auto px-4 -mt-4 mb-6">
          <LastUpdatedStatic
            timestamp={dataFetchTime}
            prefix="Data Updated"
          />
        </div>

        {/* Lician Score Section - Temporarily disabled
        TODO: Re-enable after fixing API call issue
        {licianScore && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
            <LicianScoreSSR
              score={licianScore.licianScore}
              confidence={licianScore.confidence}
              summary={licianScore.summary}
              dimensions={{
                value: licianScore.dimensions.value.score,
                growth: licianScore.dimensions.growth.score,
                quality: licianScore.dimensions.quality.score,
                momentum: licianScore.dimensions.momentum.score,
                safety: licianScore.dimensions.safety.score,
              }}
              ticker={symbol}
            />
          </div>
        )}
        */}

        {/* Upcoming Catalysts Section - SSR for SEO, timely content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <UpcomingCatalysts
            ticker={symbol}
            companyName={companyName}
            earningsDate={stockData?.snapshot?.earningsDate}
            exDividendDate={stockData?.snapshot?.exDividendDate}
            dividendAmount={stockData?.snapshot?.dividendShare}
            initialEvents={initialEvents}
          />
        </div>
      </div>

      {/* Interactive Dashboard - Loads after JS hydration */}
      <Suspense fallback={<LoadingState />}>
        <DashboardContent initialTicker={symbol} initialTab="overview" />
      </Suspense>
    </>
  )
}
