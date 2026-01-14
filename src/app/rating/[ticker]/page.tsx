import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Stock Rating - Buy, Hold or Sell?`,
    description: `${symbol} stock rating based on Wall Street analyst consensus. See if ${symbol} is a buy, hold, or sell with latest price targets, upgrades, downgrades and expert recommendations.`,
    keywords: [
      `${symbol} stock rating`,
      `${symbol} rating`,
      `is ${symbol} a buy`,
      `${symbol} buy or sell`,
      `${symbol} stock recommendation`,
      `${symbol} analyst consensus`,
    ],
    openGraph: {
      title: `${symbol} Stock Rating | Buy, Hold or Sell?`,
      description: `Expert consensus rating for ${symbol} stock. Get Wall Street's verdict on whether to buy, hold, or sell.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/rating/${ticker.toLowerCase()}`,
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

async function getAnalystRatings(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/analyst-ratings?ticker=${ticker}&limit=20`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return { analyst_ratings: [] }
    return response.json()
  } catch {
    return { analyst_ratings: [] }
  }
}

export default async function RatingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, ratingsData] = await Promise.all([
    getStockData(symbol),
    getAnalystRatings(symbol)
  ])

  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const ratings = ratingsData.analyst_ratings || []
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/rating/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Calculate consensus from ratings
  const ratingCounts = { buy: 0, hold: 0, sell: 0 }
  let totalTarget = 0
  let targetCount = 0
  const recentChanges: any[] = []

  ratings.forEach((r: any) => {
    const rating = r.rating?.toLowerCase() || ''
    if (rating.includes('buy') || rating.includes('outperform') || rating.includes('overweight')) {
      ratingCounts.buy++
    } else if (rating.includes('sell') || rating.includes('underperform') || rating.includes('underweight')) {
      ratingCounts.sell++
    } else {
      ratingCounts.hold++
    }

    if (r.priceTarget) {
      totalTarget += r.priceTarget
      targetCount++
    }

    // Track rating changes (upgrades/downgrades)
    if (r.action && r.action !== 'maintains') {
      recentChanges.push(r)
    }
  })

  const avgTarget = targetCount > 0 ? totalTarget / targetCount : null
  const upside = avgTarget ? ((avgTarget - price) / price * 100) : null
  const totalRatings = ratingCounts.buy + ratingCounts.hold + ratingCounts.sell

  // Determine consensus
  let consensus = 'Hold'
  let consensusColor = 'text-yellow-500'
  let confidenceLevel = 'Moderate'

  if (totalRatings > 0) {
    const buyPercent = (ratingCounts.buy / totalRatings) * 100
    const sellPercent = (ratingCounts.sell / totalRatings) * 100

    if (buyPercent >= 60) {
      consensus = 'Strong Buy'
      consensusColor = 'text-green-600'
      confidenceLevel = 'High'
    } else if (buyPercent >= 40) {
      consensus = 'Buy'
      consensusColor = 'text-green-500'
      confidenceLevel = 'Moderate'
    } else if (sellPercent >= 60) {
      consensus = 'Strong Sell'
      consensusColor = 'text-red-600'
      confidenceLevel = 'High'
    } else if (sellPercent >= 40) {
      consensus = 'Sell'
      consensusColor = 'text-red-500'
      confidenceLevel = 'Moderate'
    } else {
      consensus = 'Hold'
      consensusColor = 'text-yellow-500'
      confidenceLevel = 'Moderate'
    }
  }

  const ratingFaqs = [
    {
      question: `What is the ${symbol} stock rating?`,
      answer: totalRatings > 0
        ? `${symbol} currently has a ${consensus} rating based on analysis from ${totalRatings} Wall Street analysts. ${ratingCounts.buy} analysts rate it Buy, ${ratingCounts.hold} rate it Hold, and ${ratingCounts.sell} rate it Sell. This represents a consensus that ${consensus === 'Strong Buy' || consensus === 'Buy' ? 'the stock is attractive at current levels' : consensus === 'Hold' ? 'investors should maintain their current position' : 'the stock may be overvalued'}.`
        : `Rating data for ${symbol} is currently being updated. Wall Street analyst ratings help investors understand the expert consensus on whether to buy, hold, or sell a stock.`
    },
    {
      question: `Is ${symbol} a buy right now?`,
      answer: totalRatings > 0
        ? `${(ratingCounts.buy / totalRatings * 100).toFixed(0)}% of analysts covering ${symbol} rate it as a Buy. ${consensus === 'Strong Buy' || consensus === 'Buy' ? `With a ${consensus} consensus rating, most analysts believe ${symbol} is a good investment opportunity.` : consensus === 'Hold' ? `However, the overall consensus is Hold, suggesting a more cautious approach.` : `The consensus rating is ${consensus}, suggesting analysts are bearish on the stock.`} ${avgTarget ? `The average price target of $${avgTarget.toFixed(2)} suggests ${upside && upside > 0 ? `${upside.toFixed(1)}% upside potential` : `${Math.abs(upside || 0).toFixed(1)}% downside risk`}.` : ''}`
        : `Analyst ratings are being updated. Consider reviewing ${symbol}'s fundamentals, recent earnings, and market conditions before making investment decisions.`
    },
    {
      question: `Should I buy, hold, or sell ${symbol} stock?`,
      answer: totalRatings > 0
        ? `Based on ${totalRatings} analyst ratings, the consensus recommendation is to ${consensus === 'Strong Buy' || consensus === 'Buy' ? 'BUY' : consensus === 'Hold' ? 'HOLD' : 'SELL'} ${symbol} stock. ${consensus === 'Strong Buy' || consensus === 'Buy' ? 'This suggests analysts believe the stock is undervalued or has strong growth potential.' : consensus === 'Hold' ? 'This indicates the stock is fairly valued and analysts recommend waiting for a better entry point.' : 'This indicates concerns about valuation or fundamentals.'} Remember that analyst ratings are opinions and should be combined with your own research and risk tolerance.`
        : `Investment decisions should be based on thorough research. Consider ${symbol}'s financial health, growth prospects, competitive position, and your personal investment goals.`
    },
    {
      question: `What do stock ratings mean?`,
      answer: `Stock ratings are professional opinions from Wall Street analysts about whether a stock is a good investment. A "Buy" rating means analysts believe the stock will outperform, "Hold" means it's fairly valued, and "Sell" means it may underperform. Ratings like "Strong Buy" or "Strong Sell" indicate higher conviction. These ratings are based on detailed analysis of financials, competitive position, and market conditions.`
    },
    {
      question: `How often do ${symbol} analyst ratings change?`,
      answer: `Analyst ratings for ${symbol} are updated continuously as firms publish new research, typically after earnings reports, major news events, or significant market changes. Most analysts review their ratings quarterly. ${recentChanges.length > 0 ? `Recently, there have been ${recentChanges.length} rating changes for ${symbol}.` : ''} It's important to check for updated ratings regularly, especially around earnings dates.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Ratings', url: `${SITE_URL}/analyst-ratings` },
      { name: `${symbol} Rating`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock Rating - Buy, Hold or Sell?`,
      description: `Wall Street analyst consensus rating for ${symbol} (${companyName}). Find out if ${symbol} is a buy, hold, or sell.`,
      url: pageUrl,
      keywords: [`${symbol} stock rating`, `${symbol} buy or sell`, `is ${symbol} a buy`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ratingFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/analyst-ratings" className="hover:text-foreground">Stock Ratings</Link>
            {' / '}
            <span>{symbol} Rating</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stock Rating</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Buy, Hold or Sell?</p>

          {/* Rating Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm mb-2">Analyst Consensus Rating</p>
              <p className={`text-6xl font-bold ${consensusColor} mb-2`}>
                {consensus}
              </p>
              <p className="text-sm text-muted-foreground">Confidence: {confidenceLevel}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-2xl font-bold">${price.toFixed(2)}</p>
              </div>
              {avgTarget && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Price Target</p>
                  <p className="text-2xl font-bold">${avgTarget.toFixed(2)}</p>
                </div>
              )}
              {upside !== null && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Potential</p>
                  <p className={`text-2xl font-bold ${upside >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Analysts</p>
                <p className="text-2xl font-bold">{totalRatings}</p>
              </div>
            </div>
          </div>

          {/* What Does This Mean */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Does This Rating Mean?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-lg mb-4">
                {consensus === 'Strong Buy' || consensus === 'Buy' ? (
                  <>The <span className={`font-bold ${consensusColor}`}>{consensus}</span> rating indicates that Wall Street analysts are bullish on {symbol}. This suggests they believe the stock is undervalued or has strong growth potential ahead.</>
                ) : consensus === 'Hold' ? (
                  <>The <span className={`font-bold ${consensusColor}`}>{consensus}</span> rating suggests that {symbol} is fairly valued at current levels. Analysts recommend maintaining your position if you own the stock, but waiting for a better entry point if you're looking to buy.</>
                ) : (
                  <>The <span className={`font-bold ${consensusColor}`}>{consensus}</span> rating indicates analysts are bearish on {symbol}. This suggests concerns about valuation, fundamentals, or market conditions.</>
                )}
              </p>
              {totalRatings > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">{ratingCounts.buy}</div>
                    <div className="text-sm text-muted-foreground">Buy Ratings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">{ratingCounts.hold}</div>
                    <div className="text-sm text-muted-foreground">Hold Ratings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">{ratingCounts.sell}</div>
                    <div className="text-sm text-muted-foreground">Sell Ratings</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Rating Breakdown Visualization */}
          {totalRatings > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Rating Breakdown</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-500 font-medium">Buy ({ratingCounts.buy})</span>
                      <span className="text-muted-foreground">{((ratingCounts.buy / totalRatings) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${(ratingCounts.buy / totalRatings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-yellow-500 font-medium">Hold ({ratingCounts.hold})</span>
                      <span className="text-muted-foreground">{((ratingCounts.hold / totalRatings) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${(ratingCounts.hold / totalRatings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-500 font-medium">Sell ({ratingCounts.sell})</span>
                      <span className="text-muted-foreground">{((ratingCounts.sell / totalRatings) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${(ratingCounts.sell / totalRatings) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-6">
                  Based on {totalRatings} Wall Street analyst{totalRatings !== 1 ? 's' : ''}
                </p>
              </div>
            </section>
          )}

          {/* Recent Rating Changes */}
          {recentChanges.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent Rating Changes</h2>
              <div className="space-y-3">
                {recentChanges.slice(0, 5).map((change: any, i: number) => (
                  <div key={i} className="bg-card p-5 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{change.firm?.name || 'Wall Street Firm'}</p>
                          {change.action === 'upgrade' && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Upgrade</span>
                          )}
                          {change.action === 'downgrade' && (
                            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded">Downgrade</span>
                          )}
                        </div>
                        {change.analyst?.name && (
                          <p className="text-sm text-muted-foreground mb-2">Analyst: {change.analyst.name}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          {change.ratingPrior && (
                            <div>
                              <span className="text-muted-foreground">From: </span>
                              <span className="font-medium">{change.ratingPrior}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span className={`font-bold ${change.rating?.toLowerCase().includes('buy') ? 'text-green-500' : change.rating?.toLowerCase().includes('sell') ? 'text-red-500' : 'text-yellow-500'}`}>
                              {change.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {change.priceTarget && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Price Target</p>
                            <p className="text-lg font-bold">${change.priceTarget.toFixed(2)}</p>
                          </div>
                        )}
                        {change.ratingDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(change.ratingDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* How to Use This Rating */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Use This Rating</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">For Buyers</h3>
                <p className="text-sm text-muted-foreground">
                  {consensus === 'Strong Buy' || consensus === 'Buy' ? (
                    <>A {consensus} rating suggests this may be a good time to consider building a position. Review the price target and your risk tolerance.</>
                  ) : consensus === 'Hold' ? (
                    <>A Hold rating suggests waiting for a pullback or better entry point before initiating a new position.</>
                  ) : (
                    <>A {consensus} rating suggests caution. Consider waiting for analyst sentiment to improve before buying.</>
                  )}
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">For Current Holders</h3>
                <p className="text-sm text-muted-foreground">
                  {consensus === 'Strong Buy' || consensus === 'Buy' ? (
                    <>A {consensus} rating suggests holding or potentially adding to your position if it aligns with your strategy.</>
                  ) : consensus === 'Hold' ? (
                    <>A Hold rating suggests maintaining your current position and monitoring for any rating changes.</>
                  ) : (
                    <>A {consensus} rating may warrant reviewing your position and considering whether to reduce exposure.</>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">Deep dive into financials, AI insights, and advanced metrics</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium">
                Full Analysis
              </Link>
              <Link href={`/should-i-buy/${symbol.toLowerCase()}`} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                Should I Buy {symbol}?
              </Link>
              <Link href={`/analyst/${symbol.toLowerCase()}`} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium">
                Detailed Ratings
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ratingFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
