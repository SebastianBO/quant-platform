import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Price Target ${currentYear} - Analyst Target Prices & Forecast`,
    description: `${symbol} price target and analyst target prices. See average, high, low price targets, consensus estimates, and upside potential from Wall Street analysts.`,
    keywords: [
      `${symbol} price target`,
      `${symbol} target price`,
      `${symbol} analyst target`,
      `${symbol} price target ${currentYear}`,
      `${symbol} stock price target`,
      `${symbol} analyst price target`,
    ],
    openGraph: {
      title: `${symbol} Price Target ${currentYear} - Analyst Estimates`,
      description: `Wall Street analyst price targets and consensus estimates for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/target-price/${ticker.toLowerCase()}`,
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

export default async function TargetPricePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, analystRatings } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/target-price/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Calculate price target statistics from analyst ratings
  const ratings = analystRatings || []
  const priceTargets = ratings
    .map((r: any) => r.price_target)
    .filter((pt: number) => pt && pt > 0)

  const avgTarget = priceTargets.length > 0
    ? priceTargets.reduce((sum: number, pt: number) => sum + pt, 0) / priceTargets.length
    : null

  const highTarget = priceTargets.length > 0 ? Math.max(...priceTargets) : null
  const lowTarget = priceTargets.length > 0 ? Math.min(...priceTargets) : null

  // Calculate median
  const medianTarget = priceTargets.length > 0
    ? (() => {
        const sorted = [...priceTargets].sort((a: number, b: number) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid]
      })()
    : null

  // Calculate upside/downside
  const avgUpside = avgTarget && price > 0 ? ((avgTarget - price) / price * 100) : null
  const highUpside = highTarget && price > 0 ? ((highTarget - price) / price * 100) : null
  const lowUpside = lowTarget && price > 0 ? ((lowTarget - price) / price * 100) : null

  // Count ratings by type
  const ratingCounts = { buy: 0, hold: 0, sell: 0 }
  ratings.forEach((r: any) => {
    const rating = r.rating?.toLowerCase() || ''
    if (rating.includes('buy') || rating.includes('outperform')) ratingCounts.buy++
    else if (rating.includes('sell') || rating.includes('underperform')) ratingCounts.sell++
    else ratingCounts.hold++
  })

  const totalRatings = ratingCounts.buy + ratingCounts.hold + ratingCounts.sell
  const consensus = totalRatings > 0
    ? ratingCounts.buy > ratingCounts.hold + ratingCounts.sell ? 'Buy'
    : ratingCounts.sell > ratingCounts.buy + ratingCounts.hold ? 'Sell'
    : 'Hold'
    : 'N/A'

  const targetFaqs = [
    {
      question: `What is the ${symbol} price target?`,
      answer: avgTarget
        ? `The average analyst price target for ${symbol} is $${avgTarget.toFixed(2)}, based on ${priceTargets.length} analyst estimates. This represents ${avgUpside && avgUpside > 0 ? `${avgUpside.toFixed(1)}% upside` : `${Math.abs(avgUpside || 0).toFixed(1)}% downside`} from the current price of $${price.toFixed(2)}.`
        : `Price target data for ${symbol} is being updated. Wall Street analysts regularly publish price targets based on fundamental analysis and valuation models.`
    },
    {
      question: `What is the highest ${symbol} price target?`,
      answer: highTarget
        ? `The highest analyst price target for ${symbol} is $${highTarget.toFixed(2)}, representing ${highUpside && highUpside > 0 ? `${highUpside.toFixed(1)}% upside` : `${Math.abs(highUpside || 0).toFixed(1)}% downside`} potential. This reflects the most bullish view among Wall Street analysts.`
        : `High price target estimates for ${symbol} are available from analyst reports and research notes.`
    },
    {
      question: `What is the lowest ${symbol} price target?`,
      answer: lowTarget
        ? `The lowest analyst price target for ${symbol} is $${lowTarget.toFixed(2)}, representing ${lowUpside && lowUpside > 0 ? `${lowUpside.toFixed(1)}% upside` : `${Math.abs(lowUpside || 0).toFixed(1)}% downside`} potential. This reflects the most bearish view among covering analysts.`
        : `Low price target estimates for ${symbol} are published by Wall Street analysts covering the stock.`
    },
    {
      question: `How accurate are ${symbol} price targets?`,
      answer: `Analyst price targets for ${symbol} are estimates based on financial models and assumptions. While analysts have access to management and conduct thorough research, price targets should be one of many factors in your investment decision. Market conditions, company execution, and unforeseen events can impact actual stock performance.`
    },
    {
      question: `How often are ${symbol} price targets updated?`,
      answer: `Analysts update ${symbol} price targets throughout the year, typically after earnings reports, major company announcements, or significant market events. Some analysts may revise targets quarterly while others update as needed based on new information.`
    },
    {
      question: `What is the ${symbol} median price target?`,
      answer: medianTarget
        ? `The median analyst price target for ${symbol} is $${medianTarget.toFixed(2)}. The median is often considered more reliable than the average as it's less affected by extreme outliers in analyst estimates.`
        : `Median price target for ${symbol} is calculated from all analyst estimates and available on our dashboard.`
    },
    {
      question: `Should I buy ${symbol} based on price targets?`,
      answer: totalRatings > 0
        ? `${symbol} has a consensus ${consensus} rating from ${totalRatings} analysts${avgTarget ? ` with an average price target of $${avgTarget.toFixed(2)}` : ''}. However, price targets should be considered alongside your own research, risk tolerance, time horizon, and investment goals. Use our AI analysis and DCF calculator for additional insights.`
        : `Review analyst price targets for ${symbol} along with other fundamental and technical factors before making investment decisions.`
    },
    {
      question: `What factors influence ${symbol} price targets?`,
      answer: `Analysts set ${symbol} price targets based on factors including revenue growth projections, profit margins, competitive position, market share, management execution, industry trends, macroeconomic conditions, and valuation multiples relative to peers. Changes in these factors can lead to price target revisions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analyst Ratings', url: `${SITE_URL}/analyst-ratings` },
      { name: `${symbol} Price Target`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price Target ${currentYear} - Analyst Target Prices & Forecast`,
      description: `Wall Street analyst price targets and estimates for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} price target`, `${symbol} target price`, `${symbol} analyst target`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(targetFaqs),
    getTableSchema({
      name: `${symbol} Target Price History`,
      description: `Historical Target Price data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Target Price', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/analyst-ratings" className="hover:text-foreground">Analyst Ratings</Link>
            {' / '}
            <span>{symbol} Price Target</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price Target {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Analyst target prices & consensus estimates</p>

          {/* Price Target Summary Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
              {avgTarget && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Average Target</p>
                  <p className="text-3xl font-bold text-blue-400">${avgTarget.toFixed(2)}</p>
                </div>
              )}
              {avgUpside !== null && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Upside/Downside</p>
                  <p className={`text-3xl font-bold ${avgUpside >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {avgUpside >= 0 ? '+' : ''}{avgUpside.toFixed(1)}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Analysts</p>
                <p className="text-3xl font-bold">{priceTargets.length}</p>
              </div>
            </div>
          </div>

          {/* Target Range */}
          {highTarget && lowTarget && avgTarget && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Price Target Range</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Low Target</p>
                    <p className="text-2xl font-bold text-red-400">${lowTarget.toFixed(2)}</p>
                    {lowUpside !== null && (
                      <p className={`text-sm ${lowUpside >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {lowUpside >= 0 ? '+' : ''}{lowUpside.toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Median Target</p>
                    <p className="text-2xl font-bold text-yellow-400">${medianTarget?.toFixed(2)}</p>
                    {medianTarget && (
                      <p className={`text-sm ${((medianTarget - price) / price * 100) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {((medianTarget - price) / price * 100) >= 0 ? '+' : ''}{((medianTarget - price) / price * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">High Target</p>
                    <p className="text-2xl font-bold text-green-400">${highTarget.toFixed(2)}</p>
                    {highUpside !== null && (
                      <p className={`text-sm ${highUpside >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {highUpside >= 0 ? '+' : ''}{highUpside.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Visual Range Bar */}
                <div className="relative h-8 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-white"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((price - lowTarget) / (highTarget - lowTarget)) * 100))}%`
                    }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">Current</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Bear</span>
                  <span>Bull</span>
                </div>
              </div>
            </section>
          )}

          {/* Consensus Rating */}
          {totalRatings > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Analyst Consensus</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Consensus Rating</p>
                    <p className={`text-3xl font-bold ${consensus === 'Buy' ? 'text-green-500' : consensus === 'Sell' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {consensus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Based On</p>
                    <p className="text-3xl font-bold">{totalRatings} Analysts</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-green-500 font-medium">Buy</span>
                      <span>{ratingCounts.buy} ({((ratingCounts.buy / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(ratingCounts.buy / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-yellow-500 font-medium">Hold</span>
                      <span>{ratingCounts.hold} ({((ratingCounts.hold / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(ratingCounts.hold / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-red-500 font-medium">Sell</span>
                      <span>{ratingCounts.sell} ({((ratingCounts.sell / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(ratingCounts.sell / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recent Analyst Actions */}
          {ratings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent Analyst Actions</h2>
              <div className="space-y-3">
                {ratings.slice(0, 10).map((rating: any, i: number) => (
                  <div key={i} className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{rating.analyst_name || 'Analyst'}</p>
                        <p className="text-sm text-muted-foreground">{rating.date || 'Recent'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Rating</p>
                          <p className={`font-bold ${rating.rating?.toLowerCase().includes('buy') ? 'text-green-500' : rating.rating?.toLowerCase().includes('sell') ? 'text-red-500' : 'text-yellow-500'}`}>
                            {rating.rating || 'N/A'}
                          </p>
                        </div>
                        {rating.price_target && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Price Target</p>
                            <p className="font-bold text-blue-400">${rating.price_target.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">AI insights, DCF valuation, financials, and real-time data</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {targetFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="target-price" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
