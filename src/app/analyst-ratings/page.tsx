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
import SEOSidebar from '@/components/SEOSidebar'

// Dynamic rendering - Supabase needs env vars at runtime
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Analyst Ratings - Stock Upgrades, Downgrades & Price Targets 2025',
  description: 'Track Wall Street analyst ratings, stock upgrades, downgrades, and price targets. See what top analyst firms like Goldman Sachs, Morgan Stanley, and JPMorgan are recommending.',
  keywords: [
    'analyst ratings',
    'stock upgrades',
    'stock downgrades',
    'analyst price targets',
    'wall street ratings',
    'analyst recommendations',
    'stock ratings',
    'buy sell hold ratings',
    'analyst upgrades',
    'analyst downgrades',
    'analyst calls',
    'analyst estimates',
    'stock analyst ratings',
    'wall street analyst ratings',
  ],
  openGraph: {
    title: 'Analyst Ratings - Stock Upgrades & Downgrades',
    description: 'Track Wall Street analyst ratings, upgrades, downgrades, and price targets from top firms.',
    type: 'website',
    url: 'https://lician.com/analyst-ratings',
  },
  alternates: {
    canonical: 'https://lician.com/analyst-ratings',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analyst Ratings - Wall Street Stock Upgrades & Downgrades',
    description: 'Track analyst ratings, price targets, and recommendations from top Wall Street firms.',
  },
}

interface AnalystRating {
  id: number
  ticker: string
  rating: string
  rating_prior: string | null
  action: string
  price_target: number | null
  price_target_prior: number | null
  rating_date: string
  confidence: number
  source_url: string
  source_name: string
  analyst_id: number | null
  firm_id: number | null
  analysts: {
    id: number
    name: string
    success_rate: number | null
    average_return: number | null
    rank_score: number | null
  } | null
  analyst_firms: {
    id: number
    name: string
    tier: string
  } | null
}

// Fetch analyst ratings with related data
async function getAnalystRatings(limit = 200): Promise<AnalystRating[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('analyst_ratings')
      .select(`
        *,
        analysts (
          id,
          name,
          success_rate,
          average_return,
          rank_score
        ),
        analyst_firms (
          id,
          name,
          tier
        )
      `)
      .order('rating_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Analyst ratings query error:', error)
      return []
    }

    return (data || []) as AnalystRating[]
  } catch (error) {
    console.error('Error fetching analyst ratings:', error)
    return []
  }
}

// Get top analyst firms by rating count
async function getTopFirms(): Promise<{ name: string; tier: string; count: number }[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('analyst_firms')
      .select('id, name, tier')
      .in('tier', ['tier1', 'tier2'])
      .order('name', { ascending: true })

    if (error || !data) return []

    // Get rating counts for each firm
    const firmsWithCounts = await Promise.all(
      data.map(async (firm) => {
        const { count } = await supabase
          .from('analyst_ratings')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', firm.id)
          .gte('rating_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

        return {
          name: firm.name,
          tier: firm.tier,
          count: count || 0,
        }
      })
    )

    return firmsWithCounts
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  } catch (error) {
    console.error('Error fetching top firms:', error)
    return []
  }
}

// Format number
function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}

// Determine if rating is bullish
function isBullishRating(rating: string): boolean {
  const bullishRatings = ['buy', 'strong buy', 'outperform', 'overweight']
  return bullishRatings.some(r => rating.toLowerCase().includes(r))
}

// Determine if rating is bearish
function isBearishRating(rating: string): boolean {
  const bearishRatings = ['sell', 'underperform', 'underweight']
  return bearishRatings.some(r => rating.toLowerCase().includes(r))
}

// Get rating display color
function getRatingColor(rating: string): string {
  if (isBullishRating(rating)) return 'text-green-500'
  if (isBearishRating(rating)) return 'text-red-500'
  return 'text-yellow-500'
}

// Get action display color
function getActionColor(action: string): string {
  if (action === 'upgrade') return 'bg-green-500/20 text-green-500'
  if (action === 'downgrade') return 'bg-red-500/20 text-red-500'
  if (action === 'initiate') return 'bg-blue-500/20 text-blue-500'
  return 'bg-muted text-muted-foreground'
}

const faqs = [
  {
    question: 'What are analyst ratings and why do they matter?',
    answer: 'Analyst ratings are professional opinions from Wall Street research analysts about whether to buy, hold, or sell a stock. These ratings matter because analysts have deep expertise, access to company management, and sophisticated financial models. When multiple analysts upgrade a stock or a prestigious firm like Goldman Sachs initiates coverage with a Buy rating, it can significantly impact investor sentiment and stock price.',
  },
  {
    question: 'What is the difference between a stock upgrade and downgrade?',
    answer: 'A stock upgrade occurs when an analyst raises their rating (e.g., from Hold to Buy), signaling improved confidence in the stock. A downgrade is the opposite - when an analyst lowers their rating (e.g., from Buy to Hold), indicating concerns about the stock\'s prospects. Upgrades typically drive stock prices higher, while downgrades often lead to selling pressure.',
  },
  {
    question: 'What do analyst price targets mean?',
    answer: 'An analyst price target is a projected stock price that the analyst expects the stock to reach within 12 months. For example, if a stock trades at $100 and an analyst sets a $125 price target, they expect 25% upside. Price targets are based on valuation models like DCF analysis, comparable company multiples, and growth projections.',
  },
  {
    question: 'How accurate are Wall Street analyst ratings?',
    answer: 'Analyst accuracy varies significantly. Studies show that consensus ratings (aggregating multiple analysts) are more reliable than individual predictions. Top-tier firms like Goldman Sachs and Morgan Stanley tend to have better track records. However, analysts can be wrong, especially during market disruptions. It\'s best to use analyst ratings as one factor among many in your investment research.',
  },
  {
    question: 'What is a Buy rating vs Hold rating vs Sell rating?',
    answer: 'A Buy rating (also called Outperform or Overweight) means the analyst expects the stock to outperform the market and recommends purchasing it. A Hold rating (Neutral, Equal Weight) suggests the stock will perform in line with the market - neither compelling nor concerning. A Sell rating (Underperform, Underweight) indicates the analyst expects underperformance and recommends selling or avoiding the stock.',
  },
  {
    question: 'Which analyst firms are most credible?',
    answer: 'The most credible analyst firms are typically Tier 1 investment banks: Goldman Sachs, Morgan Stanley, JPMorgan, Bank of America, Citigroup, Wells Fargo, Barclays, and UBS. These firms have extensive research teams, access to company management, and strong track records. Independent research firms like Bernstein and Evercore ISI are also highly respected.',
  },
  {
    question: 'Should I buy a stock when analysts upgrade it?',
    answer: 'An analyst upgrade is a positive signal but shouldn\'t be your only reason to buy. Many upgrades are already priced in by the time they\'re published. The best approach is to: 1) Understand why the analyst upgraded (new product, improving fundamentals, valuation), 2) Check if multiple analysts are upgrading, 3) Do your own fundamental analysis, and 4) Consider your investment timeframe and risk tolerance.',
  },
  {
    question: 'What happens when a stock gets downgraded?',
    answer: 'When a stock gets downgraded, it often experiences selling pressure as institutional investors reduce positions and retail investors lose confidence. The impact depends on the analyst firm\'s credibility, the severity of the downgrade (Buy to Hold is less severe than Buy to Sell), and whether the downgrade surprises the market. Sometimes stocks are already declining before a downgrade, making it a lagging indicator.',
  },
  {
    question: 'How often do analysts update their ratings?',
    answer: 'Analysts typically update ratings quarterly around earnings reports, but they can issue updates anytime based on material news, management meetings, industry developments, or changing market conditions. Some stocks receive dozens of rating updates per year from different firms, while others may only get updates when they report earnings.',
  },
  {
    question: 'What is analyst consensus and how is it calculated?',
    answer: 'Analyst consensus is the average or most common rating across all analysts covering a stock. If 10 analysts cover a stock with 6 Buy ratings, 3 Hold ratings, and 1 Sell rating, the consensus is bullish. Consensus ratings and average price targets help investors understand the overall Wall Street sentiment toward a stock.',
  },
  {
    question: 'Do analyst ratings work for all stocks?',
    answer: 'Analyst ratings are most reliable for large-cap stocks with extensive coverage from multiple firms. They\'re less reliable for small-cap stocks with limited coverage, highly speculative stocks, or during market extremes. Analyst ratings also lag during rapid market changes - they\'re generally better for fundamental analysis than short-term trading.',
  },
  {
    question: 'How can I track analyst ratings in real-time?',
    answer: 'Our analyst ratings page tracks the latest upgrades, downgrades, and price target changes from major Wall Street firms. We aggregate data from press releases and research reports to give you real-time visibility into analyst actions. You can filter by rating action (upgrade/downgrade), rating type (buy/hold/sell), and view top analyst firms\' recent calls.',
  },
]

export default async function AnalystRatingsPage() {
  const allRatings = await getAnalystRatings()
  const topFirms = await getTopFirms()
  const pageUrl = `${SITE_URL}/analyst-ratings`

  // Separate by action type
  const upgrades = allRatings.filter(r => r.action === 'upgrade').slice(0, 30)
  const downgrades = allRatings.filter(r => r.action === 'downgrade').slice(0, 30)
  const initiations = allRatings.filter(r => r.action === 'initiate').slice(0, 20)

  // Group by ticker for most covered stocks
  const tickerCounts = allRatings.reduce((acc, r) => {
    acc[r.ticker] = (acc[r.ticker] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCoveredStocks = Object.entries(tickerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([ticker, count]) => ({ ticker, count }))

  // Most bullish stocks (multiple buy ratings)
  const bullishStocks = allRatings
    .filter(r => isBullishRating(r.rating))
    .reduce((acc, r) => {
      if (!acc[r.ticker]) acc[r.ticker] = []
      acc[r.ticker].push(r)
      return acc
    }, {} as Record<string, AnalystRating[]>)

  const topBullishStocks = Object.entries(bullishStocks)
    .map(([ticker, ratings]) => ({
      ticker,
      buyRatings: ratings.length,
      avgPriceTarget: ratings
        .filter(r => r.price_target)
        .reduce((sum, r) => sum + (r.price_target || 0), 0) /
        ratings.filter(r => r.price_target).length,
      latestRating: ratings[0],
    }))
    .filter(s => s.buyRatings >= 2)
    .sort((a, b) => b.buyRatings - a.buyRatings)
    .slice(0, 15)

  // Most bearish stocks
  const bearishStocks = allRatings
    .filter(r => isBearishRating(r.rating))
    .reduce((acc, r) => {
      if (!acc[r.ticker]) acc[r.ticker] = []
      acc[r.ticker].push(r)
      return acc
    }, {} as Record<string, AnalystRating[]>)

  const topBearishStocks = Object.entries(bearishStocks)
    .map(([ticker, ratings]) => ({
      ticker,
      sellRatings: ratings.length,
      avgPriceTarget: ratings
        .filter(r => r.price_target)
        .reduce((sum, r) => sum + (r.price_target || 0), 0) /
        ratings.filter(r => r.price_target).length,
      latestRating: ratings[0],
    }))
    .filter(s => s.sellRatings >= 2)
    .sort((a, b) => b.sellRatings - a.sellRatings)
    .slice(0, 15)

  // Statistics
  const totalUpgrades = upgrades.length
  const totalDowngrades = downgrades.length
  const totalBuyRatings = allRatings.filter(r => isBullishRating(r.rating)).length
  const totalSellRatings = allRatings.filter(r => isBearishRating(r.rating)).length

  // SEO Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Analyst Ratings', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Analyst Ratings - Stock Upgrades, Downgrades & Wall Street Price Targets',
    description: 'Comprehensive analyst ratings tracker showing stock upgrades, downgrades, and price targets from top Wall Street firms.',
    url: pageUrl,
    keywords: ['analyst ratings', 'stock upgrades', 'stock downgrades', 'analyst price targets'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Recent Analyst Ratings',
    description: 'Latest analyst ratings, upgrades, and downgrades from Wall Street firms',
    url: pageUrl,
    items: allRatings.slice(0, 50).map((rating, index) => ({
      name: `${rating.ticker} - ${rating.action} to ${rating.rating} by ${rating.analyst_firms?.name || 'Analyst'}`,
      url: `${SITE_URL}/stock/${rating.ticker}`,
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
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Analyst Ratings</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Analyst Ratings & Stock Upgrades
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track Wall Street analyst ratings, stock upgrades, downgrades, and price targets from top firms like Goldman Sachs, Morgan Stanley, and JPMorgan.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Recent Upgrades</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">{totalUpgrades}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Recent Downgrades</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">{totalDowngrades}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Buy Ratings</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">{totalBuyRatings}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalSellRatings > 0 ? `${(totalBuyRatings / totalSellRatings).toFixed(1)}x vs Sell` : 'Active'}
              </p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Analyst Firms</p>
              <p className="text-2xl sm:text-3xl font-bold">{topFirms.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Tracking coverage</p>
            </div>
          </div>

          {/* Recent Upgrades Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Recent Stock Upgrades</h2>
                <p className="text-muted-foreground mt-1">
                  Latest analyst upgrades from Wall Street firms
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {upgrades.slice(0, 15).map((rating, index) => (
                <div
                  key={`upgrade-${rating.id}-${index}`}
                  className="bg-card p-4 sm:p-5 rounded-xl border border-border hover:border-green-500/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Link
                          href={`/stock/${rating.ticker}`}
                          className="text-lg sm:text-xl font-bold hover:text-green-500 transition-colors"
                        >
                          {rating.ticker}
                        </Link>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(rating.action)}`}>
                          Upgrade
                        </span>
                        {rating.analyst_firms?.tier === 'tier1' && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                            Tier 1 Firm
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-2">
                        <span className="font-medium">{rating.analyst_firms?.name || 'Analyst'}</span>
                        {rating.analysts && (
                          <span className="text-muted-foreground">{rating.analysts.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {rating.rating_prior && (
                          <>
                            <span className="text-muted-foreground">{rating.rating_prior}</span>
                            <span className="text-green-500">→</span>
                          </>
                        )}
                        <span className={`font-bold ${getRatingColor(rating.rating)}`}>
                          {rating.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-4 sm:gap-1 text-right">
                      {rating.price_target && (
                        <div className="flex-1 sm:flex-none">
                          <p className="text-lg sm:text-xl font-bold text-green-500">
                            ${rating.price_target.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Price Target</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(rating.rating_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Downgrades Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Recent Stock Downgrades</h2>
                <p className="text-muted-foreground mt-1">
                  Latest analyst downgrades and rating cuts
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {downgrades.slice(0, 15).map((rating, index) => (
                <div
                  key={`downgrade-${rating.id}-${index}`}
                  className="bg-card p-4 sm:p-5 rounded-xl border border-border hover:border-red-500/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Link
                          href={`/stock/${rating.ticker}`}
                          className="text-lg sm:text-xl font-bold hover:text-red-500 transition-colors"
                        >
                          {rating.ticker}
                        </Link>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(rating.action)}`}>
                          Downgrade
                        </span>
                        {rating.analyst_firms?.tier === 'tier1' && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                            Tier 1 Firm
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-2">
                        <span className="font-medium">{rating.analyst_firms?.name || 'Analyst'}</span>
                        {rating.analysts && (
                          <span className="text-muted-foreground">{rating.analysts.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {rating.rating_prior && (
                          <>
                            <span className="text-muted-foreground">{rating.rating_prior}</span>
                            <span className="text-red-500">→</span>
                          </>
                        )}
                        <span className={`font-bold ${getRatingColor(rating.rating)}`}>
                          {rating.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-4 sm:gap-1 text-right">
                      {rating.price_target && (
                        <div className="flex-1 sm:flex-none">
                          <p className="text-lg sm:text-xl font-bold text-red-500">
                            ${rating.price_target.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Price Target</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(rating.rating_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Most Bullish Stocks Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Most Bullish Stocks</h2>
                <p className="text-muted-foreground mt-1">
                  Stocks with multiple Buy ratings from analysts
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topBullishStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-5 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                      {stock.ticker}
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-500">
                      {stock.buyRatings} Buy{stock.buyRatings > 1 ? 's' : ''}
                    </span>
                  </div>
                  {stock.avgPriceTarget && !isNaN(stock.avgPriceTarget) && (
                    <div className="mb-2">
                      <p className="text-2xl font-bold text-green-500">
                        ${stock.avgPriceTarget.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg. Price Target</p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Latest: {stock.latestRating.rating} by {stock.latestRating.analyst_firms?.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Most Bearish Stocks Section */}
          {topBearishStocks.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Most Bearish Stocks</h2>
                  <p className="text-muted-foreground mt-1">
                    Stocks with multiple Sell/Underperform ratings
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topBearishStocks.map((stock) => (
                  <Link
                    key={stock.ticker}
                    href={`/stock/${stock.ticker}`}
                    className="bg-card p-5 rounded-xl border border-border hover:border-red-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">
                        {stock.ticker}
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-500">
                        {stock.sellRatings} Sell{stock.sellRatings > 1 ? 's' : ''}
                      </span>
                    </div>
                    {stock.avgPriceTarget && !isNaN(stock.avgPriceTarget) && (
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-red-500">
                          ${stock.avgPriceTarget.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg. Price Target</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Latest: {stock.latestRating.rating} by {stock.latestRating.analyst_firms?.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top Analyst Firms Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Top Analyst Firms</h2>
                <p className="text-muted-foreground mt-1">
                  Most active Wall Street research firms
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topFirms.map((firm) => (
                <div
                  key={firm.name}
                  className="bg-card p-4 rounded-xl border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{firm.name}</h3>
                    {firm.tier === 'tier1' && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                        Tier 1
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-500">{firm.count}</p>
                  <p className="text-xs text-muted-foreground">Recent ratings</p>
                </div>
              ))}
            </div>
          </section>

          {/* Understanding Analyst Ratings */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding Analyst Ratings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  How Analyst Ratings Work
                </h3>
                <p className="text-muted-foreground mb-4">
                  Wall Street analysts research companies and publish ratings based on fundamental analysis, valuation models, and industry expertise. Their recommendations influence institutional and retail investors.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Buy/Outperform: Expected to beat the market</li>
                  <li>Hold/Neutral: Expected to match market returns</li>
                  <li>Sell/Underperform: Expected to lag the market</li>
                  <li>Price targets project 12-month stock prices</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Using Analyst Ratings Effectively
                </h3>
                <p className="text-muted-foreground mb-4">
                  Analyst ratings are valuable inputs but shouldn\'t be your only decision factor. Use them alongside your own research and risk assessment.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Look for consensus across multiple analysts</li>
                  <li>Pay more attention to Tier 1 firms</li>
                  <li>Watch for upgrade/downgrade patterns</li>
                  <li>Compare price targets to current prices</li>
                  <li>Read the research report, not just the rating</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Rating Actions Explained */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Analyst Rating Actions Explained
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-green-500 mb-3 flex items-center gap-2">
                  <span className="text-xl">📈</span>
                  Upgrades
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  An upgrade occurs when an analyst raises their rating (Hold to Buy). This signals improved confidence and often drives buying.
                </p>
                <p className="text-xs text-muted-foreground">
                  Example: Goldman Sachs upgrades NVDA from Neutral to Buy
                </p>
              </div>

              <div>
                <h3 className="font-bold text-red-500 mb-3 flex items-center gap-2">
                  <span className="text-xl">📉</span>
                  Downgrades
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  A downgrade lowers the rating (Buy to Hold), indicating concerns. Can trigger selling pressure and negative sentiment.
                </p>
                <p className="text-xs text-muted-foreground">
                  Example: Morgan Stanley downgrades TSLA from Overweight to Equal Weight
                </p>
              </div>

              <div>
                <h3 className="font-bold text-blue-500 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Initiations
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Initiation is when an analyst begins coverage of a stock for the first time, establishing a rating and price target.
                </p>
                <p className="text-xs text-muted-foreground">
                  Example: JPMorgan initiates coverage on PLTR with Overweight rating
                </p>
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
                <div className="text-2xl mb-2">💼</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Insider Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  Corporate insider buys & sells
                </p>
              </Link>

              <Link
                href="/institutional"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏛</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Institutional Ownership
                </h3>
                <p className="text-sm text-muted-foreground">
                  13F holdings & changes
                </p>
              </Link>

              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upcoming earnings reports
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Combine analyst ratings with our AI-powered fundamental analysis, DCF valuations, and technical indicators for smarter investment decisions.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Stocks Free
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
