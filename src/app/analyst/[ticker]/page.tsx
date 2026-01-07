import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Analyst Ratings ${currentYear} - Price Targets & Recommendations`,
    description: `${symbol} analyst ratings and price targets. See Wall Street recommendations, consensus rating, average price target, and analyst upgrades/downgrades.`,
    keywords: [
      `${symbol} analyst ratings`,
      `${symbol} price target`,
      `${symbol} analyst recommendations`,
      `${symbol} buy or sell`,
      `${symbol} wall street rating`,
      `${symbol} stock rating`,
    ],
    openGraph: {
      title: `${symbol} Analyst Ratings & Price Targets ${currentYear}`,
      description: `Wall Street analyst ratings, price targets, and recommendations for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/analyst/${ticker.toLowerCase()}`,
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

export default async function AnalystPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, analystRatings } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/analyst/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Calculate consensus from ratings
  const ratings = analystRatings || []
  const ratingCounts = { buy: 0, hold: 0, sell: 0 }
  let totalTarget = 0
  let targetCount = 0

  ratings.forEach((r: any) => {
    const rating = r.rating?.toLowerCase() || ''
    if (rating.includes('buy') || rating.includes('outperform')) ratingCounts.buy++
    else if (rating.includes('sell') || rating.includes('underperform')) ratingCounts.sell++
    else ratingCounts.hold++

    if (r.price_target) {
      totalTarget += r.price_target
      targetCount++
    }
  })

  const avgTarget = targetCount > 0 ? totalTarget / targetCount : null
  const upside = avgTarget ? ((avgTarget - price) / price * 100) : null
  const totalRatings = ratingCounts.buy + ratingCounts.hold + ratingCounts.sell

  const consensus = totalRatings > 0
    ? ratingCounts.buy > ratingCounts.hold + ratingCounts.sell ? 'Buy'
    : ratingCounts.sell > ratingCounts.buy + ratingCounts.hold ? 'Sell'
    : 'Hold'
    : 'N/A'

  const analystFaqs = [
    {
      question: `What is the analyst rating for ${symbol}?`,
      answer: totalRatings > 0
        ? `${symbol} has a consensus ${consensus} rating from ${totalRatings} analysts. ${ratingCounts.buy} rate it Buy, ${ratingCounts.hold} rate it Hold, and ${ratingCounts.sell} rate it Sell.`
        : `Analyst rating data for ${symbol} is being updated. Check back for the latest Wall Street recommendations.`
    },
    {
      question: `What is the ${symbol} price target?`,
      answer: avgTarget
        ? `The average analyst price target for ${symbol} is $${avgTarget.toFixed(2)}, representing ${upside && upside > 0 ? `${upside.toFixed(1)}% upside` : `${Math.abs(upside || 0).toFixed(1)}% downside`} from the current price of $${price.toFixed(2)}.`
        : `Price target data for ${symbol} is being updated.`
    },
    {
      question: `Is ${symbol} a buy according to analysts?`,
      answer: totalRatings > 0
        ? `${ratingCounts.buy} out of ${totalRatings} analysts (${((ratingCounts.buy / totalRatings) * 100).toFixed(0)}%) rate ${symbol} as a Buy. ${consensus === 'Buy' ? 'The consensus rating is Buy.' : `The consensus rating is ${consensus}.`}`
        : `Check the latest analyst recommendations for ${symbol}.`
    },
    {
      question: `How many analysts cover ${symbol}?`,
      answer: totalRatings > 0
        ? `${symbol} is covered by ${totalRatings} Wall Street analysts who provide ratings and price targets.`
        : `Analyst coverage information for ${symbol} is being updated.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analyst Ratings', url: `${SITE_URL}/analyst-ratings` },
      { name: `${symbol} Analyst Ratings`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Analyst Ratings ${currentYear} - Price Targets & Recommendations`,
      description: `Wall Street analyst ratings and price targets for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} analyst ratings`, `${symbol} price target`, `${symbol} recommendation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(analystFaqs),
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
            <span>{symbol}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Analyst Ratings {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Wall Street recommendations & price targets</p>

          {/* Consensus Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Consensus Rating</p>
                <p className={`text-3xl font-bold ${consensus === 'Buy' ? 'text-green-500' : consensus === 'Sell' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {consensus}
                </p>
              </div>
              {avgTarget && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Avg Price Target</p>
                  <p className="text-3xl font-bold">${avgTarget.toFixed(2)}</p>
                </div>
              )}
              {upside !== null && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Upside/Downside</p>
                  <p className={`text-3xl font-bold ${upside >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          {totalRatings > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Rating Breakdown</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-green-500 font-medium">Buy</span>
                      <span>{ratingCounts.buy} ({((ratingCounts.buy / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(ratingCounts.buy / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-yellow-500 font-medium">Hold</span>
                      <span>{ratingCounts.hold} ({((ratingCounts.hold / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(ratingCounts.hold / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-red-500 font-medium">Sell</span>
                      <span>{ratingCounts.sell} ({((ratingCounts.sell / totalRatings) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(ratingCounts.sell / totalRatings) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-4">Based on {totalRatings} analyst ratings</p>
              </div>
            </section>
          )}

          {/* Recent Ratings */}
          {ratings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent Analyst Actions</h2>
              <div className="space-y-3">
                {ratings.slice(0, 8).map((rating: any, i: number) => (
                  <div key={i} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                    <div>
                      <p className="font-medium">{rating.analyst_name || 'Analyst'}</p>
                      <p className="text-sm text-muted-foreground">{rating.date || 'Recent'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${rating.rating?.toLowerCase().includes('buy') ? 'text-green-500' : rating.rating?.toLowerCase().includes('sell') ? 'text-red-500' : 'text-yellow-500'}`}>
                        {rating.rating}
                      </p>
                      {rating.price_target && <p className="text-sm">PT: ${rating.price_target.toFixed(2)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">AI insights, DCF valuation, and institutional ownership</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {analystFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
