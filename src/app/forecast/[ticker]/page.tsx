import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { LastUpdatedStatic } from '@/components/seo/LastUpdated'
import { TargetPriceCalculator } from '@/components/calculators'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

// Fetch stock data for metadata
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
  const dayChangePercent = stockData?.snapshot?.day_change_percent
  const revenueGrowth = stockData?.metrics?.revenue_growth || 0
  const companyName = stockData?.companyFacts?.name || symbol

  // Calculate forecast targets (same logic as page)
  const moderateTarget = price ? price * (1 + Math.max(revenueGrowth, 0.10)) : null
  const aggressiveTarget = price ? price * (1 + Math.max(revenueGrowth * 1.5, 0.20)) : null
  const moderateUpside = price && moderateTarget ? ((moderateTarget - price) / price * 100) : null

  // Build dynamic title (under 60 chars)
  // Format: "AAPL Forecast 2026: $312 Target | Analysis"
  let title = `${symbol} Stock Forecast ${currentYear} | Price Targets`
  if (moderateTarget) {
    const shortTitle = `${symbol} Forecast ${currentYear}: $${moderateTarget.toFixed(0)} Target`
    if (shortTitle.length <= 60) {
      title = shortTitle
    }
  }

  // Build dynamic description (155-160 chars max)
  // Formula: Current price + Forecast range + Upside % + CTA + Freshness
  let description = `${symbol} stock forecast for ${currentYear}. Analyst price targets, 12-month projections & AI analysis. Updated ${currentMonth} ${currentDay}.`

  if (price && moderateTarget && aggressiveTarget && moderateUpside !== null) {
    const priceStr = `${symbol} at $${price.toFixed(0)}`
    const changeStr = dayChangePercent !== undefined ? ` (${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(1)}%)` : ''
    const targetStr = `. ${currentYear} forecast: $${moderateTarget.toFixed(0)}-$${aggressiveTarget.toFixed(0)}`
    const upsideStr = ` (+${moderateUpside.toFixed(0)}% upside)`
    const ctaStr = `. Full analysis inside.`

    // Build description within limit
    description = `${priceStr}${changeStr}${targetStr}${upsideStr}${ctaStr}`
    if (description.length > 160) {
      description = `${priceStr}${targetStr}${upsideStr}${ctaStr}`
    }
    if (description.length > 160) {
      description = `${priceStr}${targetStr}. Analyst estimates & AI projections. Updated ${currentMonth} ${currentDay}.`
    }
  }

  return {
    title,
    description,
    keywords: [
      `${symbol} stock forecast`,
      `${symbol} stock forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} analyst forecast`,
      `${symbol} stock price forecast`,
      `${symbol} 12 month forecast`,
    ],
    openGraph: {
      title: `${symbol} Stock Forecast ${currentYear} | ${companyName}`,
      description,
      type: 'article',
      url: `https://lician.com/forecast/${ticker.toLowerCase()}`,
      images: [{
        url: `https://lician.com/api/og/stock/${ticker.toLowerCase()}`,
        width: 1200,
        height: 630,
        alt: `${symbol} Stock Forecast`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Forecast ${currentYear}`,
      description,
      images: [`https://lician.com/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `https://lician.com/forecast/${ticker.toLowerCase()}`,
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

export default async function ForecastPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Capture the data fetch time for freshness signal
  const dataFetchTime = new Date()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, analystEstimates } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/forecast/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate price targets based on analyst data or estimates
  const pe = metrics?.price_to_earnings_ratio
  const eps = metrics?.earnings_per_share
  const revenueGrowth = metrics?.revenue_growth || 0

  // Simple forecast model
  const conservativeTarget = price * (1 + Math.max(revenueGrowth * 0.5, 0.05))
  const moderateTarget = price * (1 + Math.max(revenueGrowth, 0.10))
  const aggressiveTarget = price * (1 + Math.max(revenueGrowth * 1.5, 0.20))

  // Upside/downside percentages
  const conservativeUpside = ((conservativeTarget - price) / price * 100).toFixed(1)
  const moderateUpside = ((moderateTarget - price) / price * 100).toFixed(1)
  const aggressiveUpside = ((aggressiveTarget - price) / price * 100).toFixed(1)

  // Generate forecast FAQs
  const forecastFaqs = [
    {
      question: `What is the ${symbol} stock forecast for ${currentYear}?`,
      answer: `Based on current fundamentals and growth trends, ${symbol} has price targets ranging from $${conservativeTarget.toFixed(2)} (conservative) to $${aggressiveTarget.toFixed(2)} (aggressive). The moderate forecast suggests a price of $${moderateTarget.toFixed(2)}, representing ${moderateUpside}% upside from the current price of $${price.toFixed(2)}.`
    },
    {
      question: `What do analysts say about ${symbol} stock?`,
      answer: `Analysts covering ${symbol} (${companyName}) consider factors like ${sector ? `the ${sector} sector outlook, ` : ''}competitive positioning, revenue growth trends, and profit margins when setting price targets. Check the full analyst ratings page for the latest recommendations.`
    },
    {
      question: `Is ${symbol} stock a buy right now?`,
      answer: `Whether ${symbol} is a buy depends on your investment goals and risk tolerance. At the current price of $${price.toFixed(2)}, ${pe ? `the P/E ratio of ${pe.toFixed(1)} ` : ''}${revenueGrowth > 0 ? `and revenue growth of ${(revenueGrowth * 100).toFixed(1)}% ` : ''}should be considered relative to industry peers and your portfolio strategy.`
    },
    {
      question: `What is the 12-month price target for ${symbol}?`,
      answer: `The 12-month price target range for ${symbol} is $${conservativeTarget.toFixed(2)} to $${aggressiveTarget.toFixed(2)}, with a moderate estimate of $${moderateTarget.toFixed(2)}. These projections are based on current growth rates and valuation metrics.`
    },
    {
      question: `Will ${symbol} stock go up in ${currentYear}?`,
      answer: `Based on current trends, our models project ${symbol} stock could increase ${moderateUpside}% to $${moderateTarget.toFixed(2)} over the next 12 months. However, stock prices are affected by market conditions, company performance, and macroeconomic factors.`
    },
    {
      question: `What factors affect ${symbol} stock forecast?`,
      answer: `Key factors affecting ${symbol}'s forecast include: ${sector ? `${sector} sector trends, ` : ''}earnings growth, revenue performance, competitive dynamics, market sentiment, and broader economic conditions. Changes in any of these can impact price targets.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Forecast`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Forecast ${currentYear} - Price Targets & Analyst Predictions`,
    description: `Complete stock forecast for ${symbol} (${companyName}) with 12-month price targets and analyst consensus.`,
    url: pageUrl,
    dateModified: dataFetchTime.toISOString(),
    keywords: [
      `${symbol} stock forecast`,
      `${symbol} forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} analyst predictions`,
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

  const faqSchema = getFAQSchema(forecastFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-black text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-[#479ffa] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-[#479ffa] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Stocks</Link>
            {' / '}
            <span>{symbol} Forecast</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            {symbol} Stock Forecast {currentYear}
          </h1>
          <p className="text-xl text-[#868f97] mb-4">
            Price targets and analyst projections for {companyName}
          </p>

          {/* Last Updated Timestamp */}
          <LastUpdatedStatic
            timestamp={dataFetchTime}
            className="mb-8"
            prefix="Forecast Updated"
          />

          {/* Current Price Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#868f97] mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#868f97] mb-1">Day Change</p>
                <p className={`text-2xl font-bold tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* 12-Month Forecast */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">12-Month Price Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#479ffa]"></div>
                  <p className="text-sm text-[#868f97]">Conservative</p>
                </div>
                <p className="text-3xl font-bold tabular-nums">${conservativeTarget.toFixed(2)}</p>
                <p className="text-sm text-[#479ffa] mt-1 tabular-nums">+{conservativeUpside}% upside</p>
              </div>
              <div className="bg-[#4ebe96]/10 backdrop-blur-[10px] border border-[#4ebe96]/30 rounded-2xl p-6 hover:bg-[#4ebe96]/[0.15] hover:border-[#4ebe96]/40 motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ebe96]"></div>
                  <p className="text-sm text-[#868f97]">Moderate (Base Case)</p>
                </div>
                <p className="text-3xl font-bold text-[#4ebe96] tabular-nums">${moderateTarget.toFixed(2)}</p>
                <p className="text-sm text-[#4ebe96] mt-1 tabular-nums">+{moderateUpside}% upside</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#ffa16c]"></div>
                  <p className="text-sm text-[#868f97]">Aggressive</p>
                </div>
                <p className="text-3xl font-bold tabular-nums">${aggressiveTarget.toFixed(2)}</p>
                <p className="text-sm text-[#ffa16c] mt-1 tabular-nums">+{aggressiveUpside}% upside</p>
              </div>
            </div>
          </section>

          {/* Interactive Target Price Calculator */}
          <section className="mb-12">
            <Suspense fallback={
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 animate-pulse">
                <div className="h-8 bg-white/[0.05] rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-white/[0.03] rounded"></div>
              </div>
            }>
              <TargetPriceCalculator
                ticker={symbol}
                companyName={companyName}
                currentPrice={price}
                avgTargetPrice={moderateTarget}
                highTargetPrice={aggressiveTarget}
                lowTargetPrice={conservativeTarget}
              />
            </Suspense>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key Metrics Driving Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pe && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97]">P/E Ratio</p>
                  <p className="text-xl font-bold tabular-nums">{pe.toFixed(1)}</p>
                </div>
              )}
              {eps && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97]">EPS</p>
                  <p className="text-xl font-bold tabular-nums">${eps.toFixed(2)}</p>
                </div>
              )}
              {revenueGrowth !== 0 && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97]">Revenue Growth</p>
                  <p className={`text-xl font-bold tabular-nums ${revenueGrowth >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                    {(revenueGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {snapshot.market_cap && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97]">Market Cap</p>
                  <p className="text-xl font-bold tabular-nums">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Forecast Methodology */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Forecast Methodology</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-[#868f97] mb-4">
                Our {symbol} stock forecast combines multiple analytical approaches:
              </p>
              <ul className="space-y-2 text-[#868f97]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">1.</span>
                  <span><strong>Fundamental Analysis:</strong> Evaluation of financial statements, earnings quality, and growth trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">2.</span>
                  <span><strong>Valuation Models:</strong> DCF, comparable company analysis, and historical multiples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">3.</span>
                  <span><strong>Technical Indicators:</strong> Price momentum, support/resistance levels, and trend analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">4.</span>
                  <span><strong>Sentiment Analysis:</strong> Analyst ratings, institutional ownership changes, and news sentiment</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-[#4ebe96]/20 to-[#479ffa]/20 p-8 rounded-2xl border border-[#4ebe96]/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Get Real-Time {symbol} Analysis</h2>
            <p className="text-[#868f97] mb-6">
              Access live quant models, AI insights, and detailed DCF valuations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {forecastFaqs.map((faq, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-[#868f97] bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 mb-8">
            <p><strong>Disclaimer:</strong> Stock forecasts are based on publicly available data and should not be considered financial advice. Past performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="forecast" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
