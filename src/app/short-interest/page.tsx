import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

// Dynamic rendering - Supabase needs env vars at runtime
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Short Interest Data - Most Shorted Stocks & Short Squeeze Candidates',
  description: 'Track stocks with high short interest and short squeeze potential. Live data on most shorted stocks, days to cover, borrow rates, and short volume trends. Find short squeeze opportunities.',
  keywords: [
    'short interest',
    'most shorted stocks',
    'short squeeze stocks',
    'high short interest',
    'short interest ratio',
    'days to cover',
    'short volume',
    'borrow rate',
    'hard to borrow stocks',
    'short squeeze candidates',
    'heavily shorted stocks',
    'short selling data',
    'FINRA short data',
    'short interest percentage',
  ],
  openGraph: {
    title: 'Short Interest Data - Most Shorted Stocks & Short Squeeze Tracker',
    description: 'Real-time short interest data, most shorted stocks, and short squeeze candidates. Track days to cover, borrow rates, and short volume.',
    type: 'website',
    url: 'https://lician.com/short-interest',
  },
  alternates: {
    canonical: 'https://lician.com/short-interest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Short Interest Tracker - Most Shorted Stocks',
    description: 'Find high short interest stocks and short squeeze candidates with live FINRA data.',
  },
}

interface ShortInterestStock {
  symbol: string
  trade_date: string
  short_volume: number
  total_volume: number
  short_percent: number
}

// Fetch most shorted stocks from Supabase
async function getMostShortedStocks(): Promise<ShortInterestStock[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .rpc('get_most_shorted_stocks', {
        p_limit: 100
      })

    if (error) {
      console.error('Short interest query error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching short interest:', error)
    return []
  }
}

// Format large numbers
function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}

// Determine short interest level
function getShortLevel(shortPercent: number): {
  level: string
  color: string
  description: string
} {
  if (shortPercent >= 40) {
    return {
      level: 'Extreme',
      color: 'text-red-500',
      description: 'Very high short interest - potential squeeze candidate'
    }
  } else if (shortPercent >= 30) {
    return {
      level: 'Very High',
      color: 'text-orange-500',
      description: 'Heavily shorted - high squeeze potential'
    }
  } else if (shortPercent >= 20) {
    return {
      level: 'High',
      color: 'text-yellow-500',
      description: 'Significant short interest - monitor closely'
    }
  } else if (shortPercent >= 10) {
    return {
      level: 'Moderate',
      color: 'text-blue-500',
      description: 'Above average short interest'
    }
  } else {
    return {
      level: 'Low',
      color: 'text-green-500',
      description: 'Low short interest'
    }
  }
}

const faqs = [
  {
    question: 'What is short interest?',
    answer: 'Short interest is the total number of shares that have been sold short but not yet covered or closed out. It represents the percentage of a stock\'s float that has been borrowed and sold by investors betting the price will decline. High short interest indicates significant bearish sentiment.',
  },
  {
    question: 'What is a short squeeze?',
    answer: 'A short squeeze occurs when a heavily shorted stock\'s price rises sharply, forcing short sellers to buy shares to close their positions and cut losses. This buying pressure drives the price even higher, creating a feedback loop. Stocks with high short interest and positive catalysts are prime candidates for short squeezes.',
  },
  {
    question: 'What is considered high short interest?',
    answer: 'Short interest above 10% of float is generally considered elevated. Above 20% is very high and suggests strong bearish sentiment. Above 30-40% is extreme and indicates potential short squeeze risk. However, context matters - some stocks trade with persistently high short interest for fundamental reasons.',
  },
  {
    question: 'What is days to cover?',
    answer: 'Days to cover (short interest ratio) measures how many days it would take for all short sellers to cover their positions based on average daily trading volume. A ratio above 10 days indicates it would take significant time to unwind short positions, increasing squeeze potential. Higher ratios mean greater difficulty for shorts to exit.',
  },
  {
    question: 'How do I find short squeeze candidates?',
    answer: 'Look for stocks with: (1) High short interest (>20% of float), (2) High days to cover ratio (>7-10 days), (3) Positive catalysts (earnings beat, new product, partnership), (4) Increasing price momentum, (5) High retail interest and social media buzz. Combine these factors to identify potential squeeze opportunities.',
  },
  {
    question: 'Where does short interest data come from?',
    answer: 'Short interest data comes from two main sources: (1) FINRA daily short sale volume reports, which show daily short selling activity, and (2) Exchange-reported short interest data, published twice monthly showing total shares sold short. Our data combines both sources for comprehensive short interest tracking.',
  },
  {
    question: 'What is short volume vs short interest?',
    answer: 'Short volume is the number of shares sold short on a specific day as a percentage of total volume. Short interest is the total cumulative number of shares currently sold short and not yet covered. Short volume shows daily activity, while short interest shows the total outstanding short position.',
  },
  {
    question: 'What is a borrow rate?',
    answer: 'Borrow rate (fee) is the annual interest rate short sellers must pay to borrow shares. Rates above 10% indicate a stock is "hard to borrow." Rates above 100% are extreme and suggest very limited share availability. High borrow rates increase the cost of maintaining short positions and can force shorts to cover.',
  },
  {
    question: 'Why do stocks have high short interest?',
    answer: 'Stocks develop high short interest when investors believe the price will decline due to: overvaluation, deteriorating fundamentals, competitive threats, regulatory issues, or industry disruption. Some heavily shorted stocks decline as shorts predicted, while others squeeze higher if bears are wrong.',
  },
  {
    question: 'Can I profit from short squeezes?',
    answer: 'Short squeezes can provide significant profit opportunities but carry high risk. Successful squeeze trading requires: identifying heavily shorted stocks before the squeeze, recognizing catalysts that could trigger covering, proper position sizing, and disciplined profit-taking. Never chase a squeeze that has already moved significantly.',
  },
]

export default async function ShortInterestPage() {
  const mostShorted = await getMostShortedStocks()
  const pageUrl = `${SITE_URL}/short-interest`

  // Filter and categorize stocks
  const extremeShorts = mostShorted.filter(s => s.short_percent >= 40).slice(0, 20)
  const highShorts = mostShorted.filter(s => s.short_percent >= 20 && s.short_percent < 40).slice(0, 30)
  const squeezeCandidates = mostShorted.filter(s => s.short_percent >= 25 && s.total_volume > 1000000).slice(0, 25)

  // Calculate statistics
  const avgShortPercent = mostShorted.length > 0
    ? mostShorted.reduce((sum, s) => sum + s.short_percent, 0) / mostShorted.length
    : 0

  const highShortCount = mostShorted.filter(s => s.short_percent >= 20).length
  const extremeShortCount = mostShorted.filter(s => s.short_percent >= 40).length

  // SEO Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Short Interest', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Short Interest Data - Most Shorted Stocks & Short Squeeze Tracker',
    description: 'Comprehensive short interest data including most shorted stocks, short squeeze candidates, days to cover, and borrow rates from FINRA.',
    url: pageUrl,
    keywords: ['short interest', 'most shorted stocks', 'short squeeze', 'days to cover'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Most Shorted Stocks',
    description: 'Stocks with the highest short interest as percentage of float',
    url: pageUrl,
    items: mostShorted.slice(0, 30).map((stock, index) => ({
      name: `${stock.symbol} - ${stock.short_percent.toFixed(1)}% Short Interest`,
      url: `${SITE_URL}/stock/${stock.symbol}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            articleSchema,
            itemListSchema,
            faqSchema,
          ]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Short Interest</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Short Interest Tracker
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mb-4">
              Track the most shorted stocks and identify short squeeze candidates with real-time
              FINRA data. Monitor short interest percentages, days to cover, and borrow rates.
            </p>
            <p className="text-base text-muted-foreground max-w-3xl">
              High short interest indicates bearish sentiment but also creates potential for
              explosive short squeezes when shorts are forced to cover their positions.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Stocks Tracked</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">
                {mostShorted.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With short data
              </p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">High Short Interest</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-500">
                {highShortCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Above 20% shorted
              </p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Extreme Shorts</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">
                {extremeShortCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Above 40% shorted
              </p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Average Short %</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {avgShortPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Market average
              </p>
            </div>
          </div>

          {/* Extreme Short Interest Section */}
          {extremeShorts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Extreme Short Interest</h2>
                  <p className="text-muted-foreground mt-1">
                    Stocks with 40%+ short interest - highest squeeze potential
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-red-500/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-500/10 border-b border-border">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Rank</th>
                        <th className="text-left p-3 text-sm font-medium">Symbol</th>
                        <th className="text-right p-3 text-sm font-medium">Short %</th>
                        <th className="text-right p-3 text-sm font-medium hidden sm:table-cell">Short Volume</th>
                        <th className="text-right p-3 text-sm font-medium hidden md:table-cell">Total Volume</th>
                        <th className="text-right p-3 text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extremeShorts.map((stock, index) => {
                        const shortInfo = getShortLevel(stock.short_percent)
                        return (
                          <tr
                            key={`extreme-${stock.symbol}`}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3 text-muted-foreground">#{index + 1}</td>
                            <td className="p-3">
                              <Link
                                href={`/stock/${stock.symbol}`}
                                className="font-bold text-red-500 hover:text-red-400 transition-colors"
                              >
                                {stock.symbol}
                              </Link>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-lg font-bold text-red-500">
                                {stock.short_percent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-3 text-right text-sm text-muted-foreground hidden sm:table-cell">
                              {formatNumber(stock.short_volume)}
                            </td>
                            <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                              {formatNumber(stock.total_volume)}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`text-xs px-2 py-1 rounded ${shortInfo.color} bg-current/10`}>
                                {shortInfo.level}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Short Squeeze Candidates */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Short Squeeze Candidates</h2>
                <p className="text-muted-foreground mt-1">
                  High short interest combined with strong volume
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {squeezeCandidates.slice(0, 12).map((stock) => {
                const shortInfo = getShortLevel(stock.short_percent)
                return (
                  <Link
                    key={`squeeze-${stock.symbol}`}
                    href={`/stock/${stock.symbol}`}
                    className="bg-card p-5 rounded-xl border border-border hover:border-orange-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                        {stock.symbol}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${shortInfo.color} bg-current/10`}>
                        {shortInfo.level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Short Interest</span>
                        <span className="font-bold text-orange-500 text-lg">
                          {stock.short_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Short Volume</span>
                        <span className="font-medium">{formatNumber(stock.short_volume)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Volume</span>
                        <span className="font-medium">{formatNumber(stock.total_volume)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{shortInfo.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Most Shorted Stocks - Comprehensive Table */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Most Shorted Stocks</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Rank</th>
                      <th className="text-left p-3 text-sm font-medium">Symbol</th>
                      <th className="text-right p-3 text-sm font-medium">Short %</th>
                      <th className="text-right p-3 text-sm font-medium hidden md:table-cell">Short Volume</th>
                      <th className="text-right p-3 text-sm font-medium hidden lg:table-cell">Total Volume</th>
                      <th className="text-right p-3 text-sm font-medium hidden sm:table-cell">Date</th>
                      <th className="text-right p-3 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostShorted.slice(0, 50).map((stock, index) => {
                      const shortInfo = getShortLevel(stock.short_percent)
                      return (
                        <tr
                          key={stock.symbol}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 text-muted-foreground">#{index + 1}</td>
                          <td className="p-3">
                            <Link
                              href={`/stock/${stock.symbol}`}
                              className={`font-bold hover:underline transition-colors ${shortInfo.color}`}
                            >
                              {stock.symbol}
                            </Link>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`font-bold ${shortInfo.color}`}>
                              {stock.short_percent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                            {formatNumber(stock.short_volume)}
                          </td>
                          <td className="p-3 text-right text-sm text-muted-foreground hidden lg:table-cell">
                            {formatNumber(stock.total_volume)}
                          </td>
                          <td className="p-3 text-right text-sm text-muted-foreground hidden sm:table-cell">
                            {new Date(stock.trade_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/stock/${stock.symbol}`}
                              className="text-sm text-green-500 hover:underline"
                            >
                              Analyze
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Understanding Short Interest */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding Short Interest
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What is Short Selling?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Short selling is when investors borrow shares and sell them, hoping to buy them
                  back later at a lower price. Short interest measures how many shares have been
                  borrowed and sold but not yet repurchased.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Indicates bearish sentiment on a stock</li>
                  <li>Can predict future price declines</li>
                  <li>Creates potential for short squeezes</li>
                  <li>Requires paying borrow fees</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Short Squeeze Mechanics
                </h3>
                <p className="text-muted-foreground mb-4">
                  A short squeeze occurs when a heavily shorted stock rises, forcing shorts to buy
                  shares to limit losses. This buying creates more upward pressure, potentially
                  causing exponential price increases.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Rising prices force short sellers to cover</li>
                  <li>Covering creates buying pressure</li>
                  <li>Can lead to rapid price acceleration</li>
                  <li>High risk but potentially high reward</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Key Metrics to Monitor
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>
                    <strong>Short Interest %:</strong> Percentage of float sold short
                  </li>
                  <li>
                    <strong>Days to Cover:</strong> Time needed to cover all short positions
                  </li>
                  <li>
                    <strong>Short Volume:</strong> Daily short selling activity
                  </li>
                  <li>
                    <strong>Borrow Rate:</strong> Cost to maintain short positions
                  </li>
                  <li>
                    <strong>Change in SI:</strong> Trend of short interest over time
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Trading Short Interest
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>
                    <strong>Contrarian:</strong> Buy heavily shorted stocks expecting squeeze
                  </li>
                  <li>
                    <strong>Confirmation:</strong> Avoid high short interest as warning sign
                  </li>
                  <li>
                    <strong>Catalyst:</strong> Look for news that could trigger covering
                  </li>
                  <li>
                    <strong>Risk Management:</strong> Use stops on squeeze plays
                  </li>
                  <li>
                    <strong>Timing:</strong> Monitor volume and price action for entry
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Short Interest Levels Guide */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Short Interest Level Guide
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="text-2xl font-bold text-red-500">40%+</div>
                  <div className="text-xs text-muted-foreground">Extreme</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-red-500">Extreme Short Interest</h3>
                  <p className="text-muted-foreground">
                    Very high bearish sentiment. Prime short squeeze candidates if positive catalyst
                    emerges. Shorts may have difficulty exiting positions. Exercise extreme caution -
                    either significant downside or explosive upside potential.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="text-2xl font-bold text-orange-500">30-40%</div>
                  <div className="text-xs text-muted-foreground">Very High</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-orange-500">Very High Short Interest</h3>
                  <p className="text-muted-foreground">
                    Heavily shorted with strong bearish conviction. Moderate squeeze potential if
                    momentum shifts. Monitor for changes in sentiment or fundamental improvements
                    that could trigger covering.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="text-2xl font-bold text-yellow-500">20-30%</div>
                  <div className="text-xs text-muted-foreground">High</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-yellow-500">High Short Interest</h3>
                  <p className="text-muted-foreground">
                    Significant bearish bets but still manageable. Common for value traps or
                    companies with known issues. Watch for catalysts that could shift sentiment
                    and trigger short covering.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="text-2xl font-bold text-blue-500">10-20%</div>
                  <div className="text-xs text-muted-foreground">Moderate</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-blue-500">Moderate Short Interest</h3>
                  <p className="text-muted-foreground">
                    Above average but not extreme. Normal for stocks with mixed sentiment or
                    transition stories. Shorts present but not overwhelming. Limited squeeze
                    potential unless strong catalyst emerges.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="text-2xl font-bold text-green-500">&lt;10%</div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-green-500">Low Short Interest</h3>
                  <p className="text-muted-foreground">
                    Normal levels of short selling. Limited bearish sentiment. Minimal squeeze
                    potential. Stock price movements driven primarily by fundamentals and market
                    conditions rather than short covering dynamics.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border group"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Market Data
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/insider-trading"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Insider Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track insider buys and sells
                </p>
              </Link>

              <Link
                href="/institutional"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Institutional Ownership
                </h3>
                <p className="text-sm text-muted-foreground">
                  13F filings and holdings
                </p>
              </Link>

              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔥</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Most Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  High volume stocks
                </p>
              </Link>

              <Link
                href="/screener"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Screener
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find stocks by criteria
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Find Your Next Short Squeeze
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Use our AI-powered analysis to identify heavily shorted stocks with squeeze potential.
              Get real-time data on short interest, borrow rates, and technical indicators.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Stocks Free
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
