import { Metadata } from 'next'
import Link from 'next/link'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// Dynamic rendering - valuation data needs to be fresh
export const dynamic = 'force-dynamic'

// Fetch stock data
async function getStockData(ticker: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const response = await fetch(
      `${baseUrl}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch (err) {
    console.error('Error fetching stock data:', err)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  let companyName = symbol
  let price: number | undefined
  let pe: number | undefined

  try {
    const data = await getStockData(symbol)
    if (data) {
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      pe = data.metrics?.price_to_earnings_ratio
    }
  } catch {
    // Use fallback metadata
  }

  const title = `${symbol} Valuation - Is ${companyName} Over or Undervalued? ${currentYear}`
  const description = `${symbol} (${companyName}) valuation analysis ${currentYear}. ${price ? `Current price $${price.toFixed(2)}.` : ''} ${pe ? `P/E ratio ${pe.toFixed(2)}.` : ''} Comprehensive analysis of P/E, P/B, P/S, and EV/EBITDA ratios to determine if the stock is overvalued or undervalued.`

  return {
    title,
    description,
    keywords: [
      `${symbol} valuation`,
      `${symbol} overvalued`,
      `${symbol} undervalued`,
      `is ${symbol} overvalued`,
      `is ${symbol} undervalued`,
      `${symbol} P/E ratio`,
      `${symbol} price to earnings`,
      `${symbol} price to book`,
      `${symbol} price to sales`,
      `${symbol} EV/EBITDA`,
      `${companyName} valuation ${currentYear}`,
      `${symbol} fair value`,
      `${symbol} intrinsic value`,
    ],
    openGraph: {
      title: `${symbol} Valuation - Is ${companyName} Over or Undervalued?`,
      description,
      type: 'article',
      url: `${SITE_URL}/valuation/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Valuation Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Valuation - Over or Undervalued?`,
      description,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/valuation/${ticker.toLowerCase()}`,
    },
  }
}

// Valuation verdict component
function ValuationVerdict({ verdict, reason }: { verdict: 'undervalued' | 'fairly-valued' | 'overvalued', reason: string }) {
  const verdictConfig = {
    undervalued: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-500',
      label: 'Potentially Undervalued',
      icon: '↑',
      emoji: '🟢',
    },
    'fairly-valued': {
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-500',
      label: 'Fairly Valued',
      icon: '→',
      emoji: '🟡',
    },
    overvalued: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-500',
      label: 'Potentially Overvalued',
      icon: '↓',
      emoji: '🔴',
    },
  }

  const config = verdictConfig[verdict]

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-6 md:p-8`}>
      <div className="flex items-start gap-4">
        <span className="text-5xl">{config.emoji}</span>
        <div>
          <h3 className={`text-3xl font-bold ${config.color} mb-2`}>{config.label}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg">{reason}</p>
        </div>
      </div>
    </div>
  )
}

// Metric card component
function MetricCard({
  label,
  value,
  context,
  isGood,
  tooltip
}: {
  label: string
  value: string | number
  context?: string
  isGood?: boolean
  tooltip?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
        {isGood !== undefined && (
          <span className={`text-xs font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
            {isGood ? 'Good' : 'High'}
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold mb-1 ${
        isGood === true
          ? 'text-green-600 dark:text-green-400'
          : isGood === false
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-900 dark:text-white'
      }`}>
        {value}
      </div>
      {context && (
        <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">{context}</div>
      )}
      {tooltip && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {tooltip}
        </div>
      )}
    </div>
  )
}

export default async function ValuationPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const publishDate = new Date().toISOString()

  // Fetch stock data
  const stockData = await getStockData(symbol)

  if (!stockData) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Stock Data Not Available</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load valuation data for {symbol}. Please check the ticker symbol and try again.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            Browse All Stocks
          </Link>
        </div>
      </main>
    )
  }

  const companyName = stockData.companyFacts?.name || symbol
  const price = stockData.snapshot?.price || 0
  const metrics = stockData.metrics || {}
  const pageUrl = `${SITE_URL}/valuation/${ticker.toLowerCase()}`

  // Get valuation metrics
  const pe = metrics.price_to_earnings_ratio || 0
  const pb = metrics.price_to_book_ratio || 0
  const ps = metrics.price_to_sales_ratio || 0
  const evToEbitda = metrics.enterprise_value_to_ebitda || 0
  const marketCap = stockData.snapshot?.market_cap || 0

  // Determine valuation verdict
  let verdict: 'undervalued' | 'fairly-valued' | 'overvalued' = 'fairly-valued'
  let verdictReason = ''
  let overvaluedCount = 0
  let undervaluedCount = 0

  // Analyze each metric
  if (pe > 0) {
    if (pe > 30) overvaluedCount++
    else if (pe < 15) undervaluedCount++
  }
  if (pb > 0) {
    if (pb > 3) overvaluedCount++
    else if (pb < 1) undervaluedCount++
  }
  if (ps > 0) {
    if (ps > 5) overvaluedCount++
    else if (ps < 2) undervaluedCount++
  }
  if (evToEbitda > 0) {
    if (evToEbitda > 15) overvaluedCount++
    else if (evToEbitda < 10) undervaluedCount++
  }

  if (overvaluedCount > undervaluedCount) {
    verdict = 'overvalued'
    verdictReason = `Based on valuation multiples, ${symbol} appears expensive relative to fundamentals. ${overvaluedCount} key metrics suggest premium pricing.`
  } else if (undervaluedCount > overvaluedCount) {
    verdict = 'undervalued'
    verdictReason = `Based on valuation multiples, ${symbol} appears attractively priced. ${undervaluedCount} key metrics suggest potential value opportunity.`
  } else {
    verdict = 'fairly-valued'
    verdictReason = `Based on valuation multiples, ${symbol} appears reasonably priced relative to fundamentals. Metrics show balanced valuation.`
  }

  // FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s P/E ratio and what does it mean?`,
      answer: `${symbol} has a P/E (Price-to-Earnings) ratio of ${pe > 0 ? pe.toFixed(2) : 'N/A'}. This means investors are paying $${pe > 0 ? pe.toFixed(2) : 'N/A'} for every $1 of annual earnings. A lower P/E generally suggests better value, but it's important to compare against industry peers and growth prospects. The market average P/E is typically 15-20x.`,
    },
    {
      question: `Is ${symbol} stock overvalued or undervalued?`,
      answer: `Based on our analysis of key valuation metrics (P/E, P/B, P/S, EV/EBITDA), ${symbol} appears ${verdict === 'overvalued' ? 'potentially overvalued' : verdict === 'undervalued' ? 'potentially undervalued' : 'fairly valued'}. ${verdictReason} However, valuation is just one factor to consider alongside growth prospects, competitive position, and market conditions.`,
    },
    {
      question: `What is a good P/E ratio for ${symbol}?`,
      answer: `There's no single "good" P/E ratio as it varies by industry and growth stage. For ${companyName}, compare the current P/E of ${pe > 0 ? pe.toFixed(2) : 'N/A'} against: (1) Industry peers, (2) Historical average P/E for ${symbol}, (3) Expected earnings growth rate. High-growth companies often justify higher P/E ratios, while mature companies typically trade at lower multiples.`,
    },
    {
      question: `How do I use valuation ratios to make investment decisions?`,
      answer: `Valuation ratios are screening tools, not buy/sell signals. Use them to: (1) Compare ${symbol} against competitors, (2) Identify potential over/undervaluation, (3) Understand what you're paying for earnings, assets, or sales. Combine valuation analysis with fundamental research, growth prospects, and technical analysis for comprehensive decision-making.`,
    },
    {
      question: `What is EV/EBITDA and why does it matter?`,
      answer: `EV/EBITDA (Enterprise Value to EBITDA) is ${evToEbitda > 0 ? evToEbitda.toFixed(2) : 'N/A'} for ${symbol}. This ratio is useful because it accounts for debt and excludes non-cash expenses, making it better for comparing companies with different capital structures. Lower EV/EBITDA generally indicates better value. It's particularly useful for comparing companies in capital-intensive industries.`,
    },
  ]

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Valuation`, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Valuation - Is ${companyName} Over or Undervalued?`,
    description: `Comprehensive valuation analysis of ${companyName} (${symbol}) examining P/E ratio, P/B ratio, P/S ratio, and EV/EBITDA to determine if the stock is overvalued or undervalued.`,
    url: pageUrl,
    datePublished: publishDate,
    dateModified: publishDate,
    keywords: [`${symbol} valuation`, `is ${symbol} overvalued`, `${symbol} P/E ratio`, `${companyName} intrinsic value`],
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white">Stocks</Link>
              <span className="mx-2">/</span>
              <span>{symbol} Valuation</span>
            </nav>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {symbol} Valuation - Is {companyName} Over or Undervalued?
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Comprehensive analysis of {companyName} valuation metrics including P/E, P/B, P/S, and EV/EBITDA ratios
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <time dateTime={publishDate}>
                Updated {new Date(publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span>•</span>
              <span>6 min read</span>
              <span>•</span>
              <Link href={`/stock/${ticker.toLowerCase()}`} className="text-green-600 dark:text-green-400 hover:underline">
                View Full Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Current Price */}
          <div className="bg-gradient-to-r from-green-600/10 to-green-500/10 border border-green-500/30 rounded-xl p-6 mb-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Stock Price</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {marketCap > 0 ? `$${(marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valuation Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Verdict Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Valuation Verdict
            </h2>
            <ValuationVerdict verdict={verdict} reason={verdictReason} />
          </section>

          {/* Key Valuation Metrics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Key Valuation Metrics
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              These four fundamental valuation ratios help determine if {symbol} is trading at a fair price
              relative to its earnings, assets, revenue, and cash flow generation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <MetricCard
                label="P/E Ratio (Price-to-Earnings)"
                value={pe > 0 ? pe.toFixed(2) + 'x' : 'N/A'}
                context={pe > 0 ? (pe < 15 ? 'Below market average' : pe > 30 ? 'Above market average' : 'Near market average') : 'Not profitable or data unavailable'}
                isGood={pe > 0 ? pe < 25 : undefined}
                tooltip={pe > 0 ? `Investors pay $${pe.toFixed(2)} for every $1 of annual earnings` : undefined}
              />
              <MetricCard
                label="P/B Ratio (Price-to-Book)"
                value={pb > 0 ? pb.toFixed(2) + 'x' : 'N/A'}
                context={pb > 0 ? (pb < 1 ? 'Trading below book value' : pb > 3 ? 'Premium to book value' : 'Moderate premium') : 'Book value data unavailable'}
                isGood={pb > 0 ? pb < 2.5 : undefined}
                tooltip={pb > 0 ? `Stock trades at ${pb.toFixed(2)}x its book value per share` : undefined}
              />
              <MetricCard
                label="P/S Ratio (Price-to-Sales)"
                value={ps > 0 ? ps.toFixed(2) + 'x' : 'N/A'}
                context={ps > 0 ? (ps < 2 ? 'Low relative to sales' : ps > 5 ? 'High relative to sales' : 'Moderate') : 'Revenue data unavailable'}
                isGood={ps > 0 ? ps < 3 : undefined}
                tooltip={ps > 0 ? `Market values each $1 of revenue at $${ps.toFixed(2)}` : undefined}
              />
              <MetricCard
                label="EV/EBITDA"
                value={evToEbitda > 0 ? evToEbitda.toFixed(2) + 'x' : 'N/A'}
                context={evToEbitda > 0 ? (evToEbitda < 10 ? 'Attractive valuation' : evToEbitda > 15 ? 'Premium valuation' : 'Fair valuation') : 'EBITDA data unavailable'}
                isGood={evToEbitda > 0 ? evToEbitda < 12 : undefined}
                tooltip={evToEbitda > 0 ? `Enterprise value is ${evToEbitda.toFixed(2)}x EBITDA` : undefined}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">How to Interpret These Metrics</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div>
                  <strong className="text-gray-900 dark:text-white">P/E Ratio:</strong> Lower P/E often indicates better value, but compare against industry peers.
                  High-growth companies typically have higher P/E ratios. Market average is 15-20x.
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">P/B Ratio:</strong> Values below 1.0 suggest the stock trades below its net asset value,
                  which could indicate undervaluation or fundamental problems. Technology companies often trade at higher P/B ratios.
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">P/S Ratio:</strong> Useful for unprofitable companies or comparing revenue efficiency.
                  Lower is generally better, but high-margin businesses can justify higher P/S ratios.
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">EV/EBITDA:</strong> Accounts for debt and excludes non-cash expenses, making it ideal for
                  comparing companies with different capital structures. Values under 10x often indicate good value.
                </div>
              </div>
            </div>
          </section>

          {/* What This Means Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              What This Means for Investors
            </h2>

            <div className="prose prose-lg max-w-none">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {verdict === 'undervalued' ? 'Potential Value Opportunity' : verdict === 'overvalued' ? 'Premium Valuation Alert' : 'Balanced Valuation'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {verdict === 'undervalued' ? (
                    `${companyName} (${symbol}) currently trades at valuation multiples that appear attractive relative to historical averages
                    and peer comparisons. This could represent a buying opportunity for long-term investors who believe in the company's fundamentals.
                    However, always investigate why the market is pricing the stock this way - there may be legitimate concerns about future growth or profitability.`
                  ) : verdict === 'overvalued' ? (
                    `${companyName} (${symbol}) is trading at premium valuation multiples, suggesting the market has high expectations for future growth.
                    While this doesn't automatically mean the stock will decline, it does indicate limited margin of safety. Investors should carefully
                    evaluate whether the company's growth prospects justify the current valuation or if they're paying too much for the stock.`
                  ) : (
                    `${companyName} (${symbol}) appears fairly valued based on current multiples. This balanced valuation suggests the stock is priced
                    appropriately relative to its fundamentals. For investors, this means the stock may be suitable for those seeking exposure to
                    ${stockData.companyFacts?.sector || 'this sector'} without taking on significant valuation risk in either direction.`
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
                  <h4 className="font-bold text-green-900 dark:text-green-400 mb-2">Bullish Considerations</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {pe > 0 && pe < 20 && <li>P/E ratio below market average</li>}
                    {pb > 0 && pb < 2 && <li>Reasonable price relative to book value</li>}
                    {ps > 0 && ps < 3 && <li>Attractive price-to-sales multiple</li>}
                    {evToEbitda > 0 && evToEbitda < 12 && <li>Favorable EV/EBITDA valuation</li>}
                    {verdict === 'undervalued' && <li>Multiple metrics suggest undervaluation</li>}
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                  <h4 className="font-bold text-red-900 dark:text-red-400 mb-2">Bearish Considerations</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {pe > 30 && <li>P/E ratio significantly above average</li>}
                    {pb > 3 && <li>High premium to book value</li>}
                    {ps > 5 && <li>Elevated price-to-sales ratio</li>}
                    {evToEbitda > 15 && <li>High EV/EBITDA suggests premium valuation</li>}
                    {verdict === 'overvalued' && <li>Multiple metrics indicate overvaluation</li>}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Your Analysis
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
              Valuation is just one piece of the puzzle. Get the complete picture of {symbol} with our comprehensive analysis tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={`/stock/${ticker.toLowerCase()}`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Full Stock Analysis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete financials, charts, and metrics</p>
              </Link>
              <Link
                href={`/should-i-buy/${ticker.toLowerCase()}`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Should I Buy {symbol}?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered investment recommendation</p>
              </Link>
              <Link
                href={`/forecast/${ticker.toLowerCase()}`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Price Forecast</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Future price targets and predictions</p>
              </Link>
              <Link
                href={`/analyst/${ticker.toLowerCase()}`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Analyst Ratings</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wall Street consensus and targets</p>
              </Link>
              <Link
                href={`/analysis/${ticker.toLowerCase()}/valuation`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Deep Valuation Analysis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">DCF model and intrinsic value</p>
              </Link>
              <Link
                href={`/news/${ticker.toLowerCase()}`}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Latest News</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Breaking news and market sentiment</p>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              <strong>Disclaimer:</strong> This valuation analysis is for informational and educational purposes only and should not be
              considered investment advice. Valuation metrics are just one factor in investment decisions. Always conduct comprehensive
              research and consult with a qualified financial advisor before making investment decisions. Past performance and current
              valuations do not guarantee future results.
            </p>
          </div>

          {/* Related Links */}
          <RelatedLinks ticker={symbol} currentPage="valuation" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
