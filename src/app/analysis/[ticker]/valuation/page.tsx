import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  SITE_URL,
} from '@/lib/seo'
import { AnalysisNavigation } from '@/components/analysis/AnalysisNavigation'
import { AnalysisRelatedLinks } from '@/components/analysis/AnalysisRelatedLinks'

interface Props {
  params: Promise<{ ticker: string }>
}

// Fetch stock data
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

// Calculate fair value using simple DCF
function calculateFairValue(metrics: any, incomeStatements: any[]): number | null {
  if (!metrics || !incomeStatements || incomeStatements.length === 0) return null

  // Use free cash flow or net income as base
  const latestIncome = incomeStatements[0]
  const fcf = latestIncome?.free_cash_flow || latestIncome?.net_income
  if (!fcf || fcf <= 0) return null

  // Simple growth rate from revenue growth or 5% default
  const growthRate = metrics.revenue_growth || 0.05
  const cappedGrowth = Math.min(Math.max(growthRate, 0), 0.3) // Cap between 0% and 30%

  // Terminal growth rate
  const terminalGrowth = 0.025

  // Discount rate (WACC estimate)
  const discountRate = 0.10

  // 5-year DCF projection
  let presentValue = 0
  let projectedFCF = fcf

  for (let year = 1; year <= 5; year++) {
    projectedFCF = projectedFCF * (1 + cappedGrowth)
    const discount = Math.pow(1 + discountRate, year)
    presentValue += projectedFCF / discount
  }

  // Terminal value
  const terminalValue = (projectedFCF * (1 + terminalGrowth)) / (discountRate - terminalGrowth)
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, 5)

  const enterpriseValue = presentValue + discountedTerminalValue

  // Convert to equity value (rough estimate)
  const totalDebt = latestIncome?.total_debt || 0
  const cash = latestIncome?.cash_and_equivalents || 0
  const equityValue = enterpriseValue - totalDebt + cash

  // Calculate per share
  const sharesOutstanding = metrics.shares_outstanding || metrics.weighted_average_shares_outstanding || 1
  const fairValuePerShare = equityValue / sharesOutstanding

  return fairValuePerShare > 0 ? fairValuePerShare : null
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  let companyName = symbol
  let price: number | undefined
  let fairValue: number | null = null

  try {
    const data = await getStockData(symbol)
    if (data) {
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      fairValue = calculateFairValue(data.metrics, data.incomeStatements)
    }
  } catch {
    // Use fallback metadata
  }

  const isUndervalued = fairValue && price ? price < fairValue : false
  const valuationVerdict = isUndervalued ? 'Undervalued' : 'Fair to Overvalued'

  const title = `Is ${symbol} Stock Undervalued? ${companyName} Valuation Analysis ${currentYear}`
  const description = `${symbol} (${companyName}) valuation analysis: ${price ? `Current price $${price.toFixed(2)}.` : ''} ${fairValue ? `Fair value estimate $${fairValue.toFixed(2)}.` : ''} In-depth analysis of P/E, P/B, P/S, EV/EBITDA ratios, DCF valuation, and analyst price targets. ${valuationVerdict} verdict.`

  return {
    title,
    description,
    keywords: [
      `${symbol} fair value`,
      `is ${symbol} undervalued`,
      `${symbol} valuation`,
      `${symbol} intrinsic value`,
      `${companyName} valuation analysis`,
      `${symbol} DCF`,
      `${symbol} P/E ratio`,
      `${symbol} price to earnings`,
      `${symbol} price to book`,
      `${symbol} stock valuation ${currentYear}`,
      `${symbol} overvalued or undervalued`,
      `${companyName} intrinsic value`,
      `${symbol} worth buying`,
      `${symbol} fair price`,
    ],
    openGraph: {
      title: `Is ${symbol} Undervalued? Complete Valuation Analysis`,
      description,
      type: 'article',
      url: `${SITE_URL}/analysis/${ticker.toLowerCase()}/valuation`,
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
      title: `Is ${symbol} Undervalued? Valuation Analysis`,
      description,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/analysis/${ticker.toLowerCase()}/valuation`,
    },
  }
}

// Valuation verdict component
function ValuationVerdict({ verdict, upside }: { verdict: 'undervalued' | 'fairly-valued' | 'overvalued', upside: number }) {
  const verdictConfig = {
    undervalued: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      label: 'Potentially Undervalued',
      icon: '↑',
    },
    'fairly-valued': {
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      label: 'Fairly Valued',
      icon: '→',
    },
    overvalued: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      label: 'Potentially Overvalued',
      icon: '↓',
    },
  }

  const config = verdictConfig[verdict]

  return (
    <div className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{config.icon}</span>
        <div>
          <h3 className={`text-2xl font-bold ${config.color}`}>{config.label}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {upside > 0 ? `${upside.toFixed(1)}% upside potential` : `${Math.abs(upside).toFixed(1)}% downside risk`}
          </p>
        </div>
      </div>
    </div>
  )
}

// Metric card component
function MetricCard({ label, value, context, isGood }: { label: string, value: string | number, context?: string, isGood?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${isGood === true ? 'text-green-600 dark:text-green-400' : isGood === false ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </div>
      {context && <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{context}</div>}
    </div>
  )
}

export default async function ValuationAnalysisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const publishDate = new Date().toISOString()

  // Fetch stock data
  const stockData = await getStockData(symbol)

  if (!stockData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stock data not available</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load valuation data for {symbol}
          </p>
        </div>
      </div>
    )
  }

  const companyName = stockData.companyFacts?.name || symbol
  const price = stockData.snapshot?.price || 0
  const metrics = stockData.metrics || {}
  const incomeStatements = stockData.incomeStatements || []
  const pageUrl = `${SITE_URL}/analysis/${ticker.toLowerCase()}/valuation`

  // Calculate valuation metrics
  const pe = metrics.price_to_earnings_ratio || 0
  const pb = metrics.price_to_book_ratio || 0
  const ps = metrics.price_to_sales_ratio || 0
  const evToEbitda = metrics.enterprise_value_to_ebitda || 0
  const marketCap = stockData.snapshot?.market_cap || 0
  const priceTarget = stockData.snapshot?.priceTarget || 0

  // Calculate fair value
  const fairValue = calculateFairValue(metrics, incomeStatements)
  const upside = fairValue && price > 0 ? ((fairValue - price) / price) * 100 : 0

  // Determine verdict
  let verdict: 'undervalued' | 'fairly-valued' | 'overvalued' = 'fairly-valued'
  if (upside > 15) verdict = 'undervalued'
  else if (upside < -15) verdict = 'overvalued'

  // Get historical metrics for trends
  const metricsHistory = stockData.metricsHistory || []
  const historicalPE = metricsHistory.map((m: any) => m.price_to_earnings_ratio).filter(Boolean)
  const avgHistoricalPE = historicalPE.length > 0
    ? historicalPE.reduce((a: number, b: number) => a + b, 0) / historicalPE.length
    : 0

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Analysis', url: `${SITE_URL}/analysis` },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Valuation Analysis', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `Is ${symbol} Stock Undervalued? ${companyName} Valuation Analysis`,
    description: `Comprehensive valuation analysis of ${companyName} (${symbol}) including P/E ratio, DCF valuation, fair value estimate, and comparison to analyst price targets.`,
    url: pageUrl,
    datePublished: publishDate,
    dateModified: publishDate,
    keywords: [
      `${symbol} fair value`,
      `is ${symbol} undervalued`,
      `${symbol} valuation`,
      `${companyName} intrinsic value`,
    ],
  })

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema]),
        }}
      />

      {/* Article Content */}
      <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Analysis Navigation */}
        <AnalysisNavigation ticker={ticker} />

        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/analysis" className="hover:text-gray-900 dark:hover:text-white">Analysis</Link>
              <span className="mx-2">/</span>
              <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-gray-900 dark:hover:text-white">{symbol}</Link>
              <span className="mx-2">/</span>
              <span>Valuation</span>
            </nav>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Is {symbol} Stock Undervalued?
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              A comprehensive valuation analysis of {companyName} ({symbol}) examining current multiples,
              intrinsic value, and comparing to analyst expectations.
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
              <span>8 min read</span>
              <span>•</span>
              <Link href={`/stock/${ticker.toLowerCase()}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                View Full Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Verdict Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Valuation Verdict
            </h2>
            <ValuationVerdict verdict={verdict} upside={upside} />

            <p className="text-gray-700 dark:text-gray-300 mt-6 leading-relaxed">
              Based on our analysis, {companyName} appears to be <strong>{verdict === 'undervalued' ? 'potentially undervalued' : verdict === 'overvalued' ? 'potentially overvalued' : 'fairly valued'}</strong> at
              the current price of <strong>${price.toFixed(2)}</strong>.
              {fairValue && ` Our fair value estimate of $${fairValue.toFixed(2)} suggests ${upside > 0 ? 'upside potential' : 'downside risk'} of approximately ${Math.abs(upside).toFixed(1)}%.`}
            </p>
          </section>

          {/* Current Valuation Metrics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Current Valuation Metrics
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Valuation ratios help us understand how the market is pricing {symbol} relative to its fundamentals.
              Let's examine the key multiples investors are paying today.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="P/E Ratio"
                value={pe > 0 ? pe.toFixed(2) : 'N/A'}
                context={pe > 0 ? (pe < 15 ? 'Low' : pe > 25 ? 'High' : 'Moderate') : undefined}
                isGood={pe > 0 ? pe < 20 : undefined}
              />
              <MetricCard
                label="P/B Ratio"
                value={pb > 0 ? pb.toFixed(2) : 'N/A'}
                context={pb > 0 ? (pb < 1 ? 'Low' : pb > 3 ? 'High' : 'Moderate') : undefined}
                isGood={pb > 0 ? pb < 2 : undefined}
              />
              <MetricCard
                label="P/S Ratio"
                value={ps > 0 ? ps.toFixed(2) : 'N/A'}
                context={ps > 0 ? (ps < 2 ? 'Low' : ps > 5 ? 'High' : 'Moderate') : undefined}
                isGood={ps > 0 ? ps < 3 : undefined}
              />
              <MetricCard
                label="EV/EBITDA"
                value={evToEbitda > 0 ? evToEbitda.toFixed(2) : 'N/A'}
                context={evToEbitda > 0 ? (evToEbitda < 10 ? 'Low' : evToEbitda > 15 ? 'High' : 'Moderate') : undefined}
                isGood={evToEbitda > 0 ? evToEbitda < 12 : undefined}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Understanding the Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>P/E Ratio:</strong> {pe > 0 ? `At ${pe.toFixed(2)}x earnings, ${symbol} is trading ${pe < 15 ? 'below' : pe > 25 ? 'above' : 'near'} the typical market average of 15-20x.` : 'Not currently profitable or data unavailable.'}</li>
                <li><strong>P/B Ratio:</strong> {pb > 0 ? `A P/B of ${pb.toFixed(2)} means investors pay $${pb.toFixed(2)} for every $1 of book value.` : 'Book value data not available.'}</li>
                <li><strong>P/S Ratio:</strong> {ps > 0 ? `The price-to-sales ratio of ${ps.toFixed(2)} indicates how much investors value each dollar of revenue.` : 'Revenue data not available.'}</li>
                <li><strong>EV/EBITDA:</strong> {evToEbitda > 0 ? `This ratio of ${evToEbitda.toFixed(2)} helps compare ${symbol} to peers while accounting for debt.` : 'EBITDA data not available.'}</li>
              </ul>
            </div>
          </section>

          {/* Fair Value Estimate */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Fair Value Estimate
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Using a discounted cash flow (DCF) model, we estimate the intrinsic value of {companyName} stock.
              This fundamental analysis looks at the company's ability to generate future cash flows and discounts
              them back to today's value.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</div>
                </div>
                <div className="text-4xl text-gray-400">vs</div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fair Value Estimate</div>
                  <div className={`text-3xl font-bold ${fairValue ? (fairValue > price ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-900 dark:text-white'}`}>
                    {fairValue ? `$${fairValue.toFixed(2)}` : 'N/A'}
                  </div>
                </div>
              </div>

              {fairValue && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Implied Return</span>
                    <span className={`text-lg font-bold ${upside > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {fairValue ? (
                upside > 15 ?
                  `Our DCF model suggests ${symbol} may be undervalued by approximately ${upside.toFixed(1)}%. This implies the market may be pricing in more pessimistic growth expectations than our base case scenario.` :
                upside < -15 ?
                  `The current market price appears to be ${Math.abs(upside).toFixed(1)}% above our fair value estimate, suggesting the stock may be overvalued. Investors seem to be pricing in more optimistic growth than our model assumes.` :
                  `${symbol} appears fairly valued, trading within 15% of our intrinsic value estimate. The market price closely reflects the fundamental value we calculate.`
              ) : (
                `Unable to calculate a reliable fair value estimate due to insufficient financial data or negative cash flows. This is common for early-stage growth companies or those undergoing restructuring.`
              )}
            </p>
          </section>

          {/* Historical Valuation Trends */}
          {historicalPE.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Historical Valuation Trends
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Looking at {symbol}'s valuation history helps us understand whether the current multiples are
                typical or unusual for this company.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <MetricCard
                  label="Current P/E Ratio"
                  value={pe.toFixed(2)}
                />
                <MetricCard
                  label="5-Year Average P/E"
                  value={avgHistoricalPE.toFixed(2)}
                  context={pe > avgHistoricalPE * 1.2 ? 'Currently above average' : pe < avgHistoricalPE * 0.8 ? 'Currently below average' : 'Near historical average'}
                />
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {pe > avgHistoricalPE * 1.2 ? (
                  `${symbol} is currently trading at a P/E ratio ${((pe / avgHistoricalPE - 1) * 100).toFixed(1)}% above its 5-year average. This premium valuation could reflect improved growth prospects, but it may also indicate the stock is expensive relative to its historical norms.`
                ) : pe < avgHistoricalPE * 0.8 ? (
                  `The current P/E ratio is ${((1 - pe / avgHistoricalPE) * 100).toFixed(1)}% below the 5-year average, suggesting ${symbol} may be trading at a discount to its historical valuation. This could present a buying opportunity if fundamentals remain strong.`
                ) : (
                  `${symbol}'s P/E ratio is near its historical average, indicating the market is valuing the company consistently with past trends.`
                )}
              </p>
            </section>
          )}

          {/* Analyst Price Targets */}
          {priceTarget > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Analyst Price Targets
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Wall Street analysts provide price targets based on their fundamental research and models.
                Let's see how the consensus view compares to the current price.
              </p>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</div>
                  </div>
                  <div className="text-4xl text-gray-400">→</div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Analyst Target</div>
                    <div className={`text-3xl font-bold ${priceTarget > price ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${priceTarget.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Implied Upside</span>
                    <span className={`text-lg font-bold ${priceTarget > price ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {((priceTarget - price) / price * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The consensus analyst price target of ${priceTarget.toFixed(2)} suggests
                {priceTarget > price ? ` ${((priceTarget - price) / price * 100).toFixed(1)}% upside potential` : ` ${Math.abs((priceTarget - price) / price * 100).toFixed(1)}% downside risk`} from
                current levels. {priceTarget > price ? 'Analysts appear optimistic about the stock\'s prospects.' : 'Analysts appear cautious on the stock at current levels.'}
              </p>
            </section>
          )}

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Investment Conclusion
            </h2>

            <div className={`rounded-lg border-l-4 ${verdict === 'undervalued' ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : verdict === 'overvalued' ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'} p-6 mb-6`}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Bottom Line</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {verdict === 'undervalued' ? (
                  `Based on our comprehensive valuation analysis, ${companyName} (${symbol}) appears to be undervalued at $${price.toFixed(2)}. With a fair value estimate ${fairValue ? `of $${fairValue.toFixed(2)}` : 'above current levels'}, the stock offers potential upside for long-term investors willing to wait for the market to recognize its intrinsic value.`
                ) : verdict === 'overvalued' ? (
                  `Our analysis suggests ${companyName} (${symbol}) may be overvalued at the current price of $${price.toFixed(2)}. While the company may have strong fundamentals, investors are paying a premium that may not be justified by near-term growth prospects. Consider waiting for a better entry point.`
                ) : (
                  `${companyName} (${symbol}) appears fairly valued at $${price.toFixed(2)}, trading in line with our fundamental analysis. The stock may be appropriate for investors seeking exposure to ${stockData.companyFacts?.sector || 'this sector'} without significant valuation risk.`
                )}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered
              investment advice. Always conduct your own research and consult with a financial advisor before making
              investment decisions. Past performance does not guarantee future results.
            </p>
          </section>

          {/* Related Links */}
          <AnalysisRelatedLinks
            ticker={ticker}
            currentAnalysisType="valuation"
            companyName={companyName}
          />
        </div>
      </article>
    </>
  )
}
