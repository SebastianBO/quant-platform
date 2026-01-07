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
import { TrendingUp, TrendingDown, Calendar, Target, Award } from 'lucide-react'
import StockLogo from '@/components/StockLogo'

// Dynamic rendering - Supabase needs env vars at runtime
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Earnings Surprises 2025 - Stocks That Beat & Miss Earnings Estimates',
  description: 'Track earnings surprises with real-time data on stocks that beat or miss earnings estimates. View the biggest earnings beats, earnings misses, and historical earnings surprise trends.',
  keywords: [
    'earnings surprises',
    'earnings beat',
    'earnings miss',
    'stocks that beat earnings',
    'stocks that missed earnings',
    'earnings beat estimates',
    'earnings surprise percentage',
    'biggest earnings beats',
    'quarterly earnings surprises',
    'positive earnings surprise',
    'negative earnings surprise',
    'earnings surprise trend',
  ],
  openGraph: {
    title: 'Earnings Surprises - Stocks That Beat & Miss Earnings',
    description: 'Track real-time earnings surprises. See which stocks beat or missed earnings estimates with detailed surprise percentages and trends.',
    type: 'website',
    url: 'https://lician.com/earnings/surprises',
  },
  alternates: {
    canonical: 'https://lician.com/earnings/surprises',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnings Surprises - Beat & Miss Tracker',
    description: 'Track stocks that beat or missed earnings estimates with real-time surprise data.',
  },
}

interface EarningsSurprise {
  ticker: string
  fiscal_period: string
  period: string
  eps_estimate: number | null
  eps_actual: number | null
  eps_surprise: number | null
  eps_surprise_percent: number | null
  revenue_estimate: number | null
  revenue_actual: number | null
  revenue_surprise: number | null
  revenue_surprise_percent: number | null
  num_analysts: number | null
}

// Fetch earnings surprises from Supabase
async function getEarningsSurprises(): Promise<EarningsSurprise[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get recent earnings with actual results (last 90 days of fiscal periods)
    const { data, error } = await supabase
      .from('analyst_estimates')
      .select('*')
      .not('eps_actual', 'is', null)
      .eq('period', 'quarterly')
      .order('fiscal_period', { ascending: false })
      .limit(500)

    if (error) {
      console.error('Earnings surprises query error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching earnings surprises:', error)
    return []
  }
}

// Format large numbers
function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return 'N/A'
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(2)
}

// Format percentage
function formatPercent(num: number | null): string {
  if (num === null || num === undefined) return 'N/A'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(1)}%`
}

const faqs = [
  {
    question: 'What is an earnings surprise?',
    answer: 'An earnings surprise occurs when a company\'s reported earnings per share (EPS) differs from the consensus analyst estimate. A positive surprise (beat) means the company exceeded expectations, while a negative surprise (miss) means it fell short. The surprise percentage shows how much actual earnings differed from estimates, calculated as (Actual EPS - Estimated EPS) / |Estimated EPS| × 100.',
  },
  {
    question: 'Why do earnings surprises matter for investors?',
    answer: 'Earnings surprises significantly impact stock prices because they reveal whether companies are performing better or worse than expected. Positive surprises often drive stock prices higher as they signal stronger business performance and can lead to raised future guidance. Negative surprises typically cause price declines. Historical surprise patterns also help investors gauge a company\'s reliability and management\'s guidance accuracy.',
  },
  {
    question: 'What is considered a significant earnings beat?',
    answer: 'A significant earnings beat is typically considered to be 5% or more above analyst estimates. Beats of 10% or higher are considered very strong and often trigger substantial price movements. However, the market reaction also depends on revenue performance, guidance, and overall market conditions. Small beats of 1-2% may not generate much excitement, especially if accompanied by weak guidance.',
  },
  {
    question: 'How do stocks typically react to earnings beats?',
    answer: 'Stocks that beat earnings estimates often rally, especially if accompanied by strong revenue growth and raised guidance. However, the reaction isn\'t guaranteed - stocks can still fall if the beat was smaller than expected, if guidance disappointed, or if the overall market is weak. On average, stocks beating earnings by 5%+ tend to outperform the market in the following weeks.',
  },
  {
    question: 'What happens when a stock misses earnings estimates?',
    answer: 'When a stock misses earnings estimates, it typically experiences selling pressure and price declines, especially if the miss is significant (5%+) or unexpected. However, sometimes stocks can still rise despite a miss if the company provides strong forward guidance, if revenue exceeded expectations, or if investors view the miss as temporary. The market focuses more on future prospects than past performance.',
  },
  {
    question: 'Should I buy stocks after they beat earnings?',
    answer: 'Buying immediately after an earnings beat can be risky due to potential price spikes and volatility. Consider waiting for the initial reaction to settle and evaluate: 1) The quality of the beat (revenue growth, margin expansion), 2) Management guidance for future quarters, 3) Valuation after the price move, 4) Overall trend of beats vs. misses. Use earnings beats as one factor in your analysis, not the sole trigger.',
  },
  {
    question: 'What is a consistent earnings beater?',
    answer: 'A consistent earnings beater is a company that regularly exceeds analyst estimates quarter after quarter. These companies often have strong competitive advantages, conservative guidance practices, or better-than-expected execution. Consistent beaters tend to receive premium valuations as investors gain confidence in management and business predictability. Look for companies beating estimates at least 75% of the time.',
  },
  {
    question: 'How accurate are analyst earnings estimates?',
    answer: 'Analyst estimates vary in accuracy depending on the company, industry, and market conditions. On average, about 60-70% of S&P 500 companies beat earnings estimates each quarter, suggesting analysts tend to be slightly conservative. Estimates become more accurate closer to the earnings date as analysts update their models. Always check the number of analysts covering a stock and the range of estimates.',
  },
  {
    question: 'What is the difference between EPS surprise and revenue surprise?',
    answer: 'EPS (earnings per share) surprise measures how much profit per share exceeded or missed estimates, while revenue surprise measures how much total sales differed from forecasts. Both matter, but quality beats show both EPS and revenue exceeding estimates. A company can beat on EPS through cost cuts while missing on revenue, which is often less bullish than beating on both metrics.',
  },
  {
    question: 'How can I use earnings surprise data in my investing strategy?',
    answer: 'Use earnings surprise data to: 1) Identify companies with consistent beat patterns for potential long-term holdings, 2) Spot potential turnarounds when chronic missers start beating, 3) Avoid companies with frequent misses that may indicate structural problems, 4) Gauge analyst reliability by comparing estimates to actuals, 5) Find post-earnings opportunities when good companies sell off despite beats or rally excessively on small beats.',
  },
]

export default async function EarningsSurprisesPage() {
  const allSurprises = await getEarningsSurprises()
  const pageUrl = `${SITE_URL}/earnings/surprises`

  // Filter for valid surprises with both estimate and actual
  const validSurprises = allSurprises.filter(
    s => s.eps_estimate !== null && s.eps_actual !== null && s.eps_surprise_percent !== null
  )

  // Separate beats and misses
  const earningsBeats = validSurprises
    .filter(s => (s.eps_surprise_percent || 0) > 0)
    .sort((a, b) => (b.eps_surprise_percent || 0) - (a.eps_surprise_percent || 0))

  const earningsMisses = validSurprises
    .filter(s => (s.eps_surprise_percent || 0) < 0)
    .sort((a, b) => (a.eps_surprise_percent || 0) - (b.eps_surprise_percent || 0))

  // Get recent surprises (any direction)
  const recentSurprises = validSurprises.slice(0, 50)

  // Calculate statistics
  const totalReported = validSurprises.length
  const totalBeats = earningsBeats.length
  const totalMisses = earningsMisses.length
  const beatRate = totalReported > 0 ? (totalBeats / totalReported) * 100 : 0
  const avgBeatPercent = earningsBeats.length > 0
    ? earningsBeats.reduce((sum, s) => sum + (s.eps_surprise_percent || 0), 0) / earningsBeats.length
    : 0
  const avgMissPercent = earningsMisses.length > 0
    ? earningsMisses.reduce((sum, s) => sum + (s.eps_surprise_percent || 0), 0) / earningsMisses.length
    : 0

  // Top 20 beats and misses for display
  const topBeats = earningsBeats.slice(0, 20)
  const topMisses = earningsMisses.slice(0, 20)

  // SEO Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Earnings Calendar', url: `${SITE_URL}/earnings` },
    { name: 'Earnings Surprises', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Earnings Surprises - Stocks That Beat & Miss Earnings Estimates',
    description: 'Track earnings surprises with real-time data on stocks that beat or miss earnings estimates. View biggest beats, misses, and historical trends.',
    url: pageUrl,
    keywords: ['earnings surprises', 'earnings beat', 'earnings miss', 'stocks that beat earnings'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Recent Earnings Surprises',
    description: 'Latest earnings surprises showing stocks that beat or missed analyst estimates',
    url: pageUrl,
    items: recentSurprises.slice(0, 30).map((surprise, index) => ({
      name: `${surprise.ticker} - ${(surprise.eps_surprise_percent || 0) > 0 ? 'Beat' : 'Miss'} by ${formatPercent(surprise.eps_surprise_percent)}`,
      url: `${SITE_URL}/stock/${surprise.ticker}`,
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
            <Link href="/earnings" className="hover:text-foreground transition-colors">
              Earnings Calendar
            </Link>
            {' / '}
            <span className="text-foreground">Earnings Surprises</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Earnings Surprises 2025
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track stocks that beat or miss earnings estimates. View real-time earnings surprises,
              historical trends, and the biggest beats and misses by percentage.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <TrendingUp className="w-6 h-6 mb-2 text-green-500" />
              <p className="text-2xl sm:text-3xl font-bold text-green-500">{totalBeats}</p>
              <p className="text-sm text-muted-foreground">Earnings Beats</p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <TrendingDown className="w-6 h-6 mb-2 text-red-500" />
              <p className="text-2xl sm:text-3xl font-bold text-red-500">{totalMisses}</p>
              <p className="text-sm text-muted-foreground">Earnings Misses</p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <Target className="w-6 h-6 mb-2 text-green-500" />
              <p className="text-2xl sm:text-3xl font-bold">{beatRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Beat Rate</p>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              <Calendar className="w-6 h-6 mb-2 text-amber-500" />
              <p className="text-2xl sm:text-3xl font-bold text-amber-500">{totalReported}</p>
              <p className="text-sm text-muted-foreground">Total Reported</p>
            </div>
          </div>

          {/* Average Surprise Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-r from-green-600/10 to-green-600/5 p-6 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 rounded-full p-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Average Earnings Beat</h3>
                  <p className="text-sm text-muted-foreground">Among companies that exceeded estimates</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-500">{formatPercent(avgBeatPercent)}</p>
            </div>

            <div className="bg-gradient-to-r from-red-600/10 to-red-600/5 p-6 rounded-xl border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 rounded-full p-3">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Average Earnings Miss</h3>
                  <p className="text-sm text-muted-foreground">Among companies that fell short</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-red-500">{formatPercent(avgMissPercent)}</p>
            </div>
          </div>

          {/* Link to Main Earnings Calendar */}
          <div className="mb-12 bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">View Upcoming Earnings</h3>
                <p className="opacity-90">
                  See the next 2 weeks of earnings reports with dates and estimates
                </p>
              </div>
              <Link
                href="/earnings"
                className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap"
              >
                Earnings Calendar
              </Link>
            </div>
          </div>

          {/* Biggest Earnings Beats */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-green-500" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Biggest Earnings Beats</h2>
                <p className="text-muted-foreground">
                  Stocks that exceeded earnings estimates by the highest percentage
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Ticker</th>
                      <th className="text-right p-3 text-sm font-medium">Quarter</th>
                      <th className="text-right p-3 text-sm font-medium">Estimate</th>
                      <th className="text-right p-3 text-sm font-medium">Actual</th>
                      <th className="text-right p-3 text-sm font-medium">Surprise</th>
                      <th className="text-right p-3 text-sm font-medium hidden md:table-cell">Analysts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBeats.map((surprise, index) => (
                      <tr
                        key={`beat-${surprise.ticker}-${surprise.fiscal_period}-${index}`}
                        className="border-b border-border hover:bg-green-500/5 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            href={`/stock/${surprise.ticker}`}
                            className="flex items-center gap-2 font-bold text-green-500 hover:text-green-400"
                          >
                            <StockLogo symbol={surprise.ticker} size="sm" />
                            {surprise.ticker}
                          </Link>
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {surprise.fiscal_period}
                        </td>
                        <td className="p-3 text-right font-medium">
                          ${surprise.eps_estimate?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-green-500">
                          ${surprise.eps_actual?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-green-500 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            {formatPercent(surprise.eps_surprise_percent)}
                          </span>
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                          {surprise.num_analysts || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Biggest Earnings Misses */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-red-500" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Biggest Earnings Misses</h2>
                <p className="text-muted-foreground">
                  Stocks that fell short of earnings estimates by the highest percentage
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Ticker</th>
                      <th className="text-right p-3 text-sm font-medium">Quarter</th>
                      <th className="text-right p-3 text-sm font-medium">Estimate</th>
                      <th className="text-right p-3 text-sm font-medium">Actual</th>
                      <th className="text-right p-3 text-sm font-medium">Surprise</th>
                      <th className="text-right p-3 text-sm font-medium hidden md:table-cell">Analysts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMisses.map((surprise, index) => (
                      <tr
                        key={`miss-${surprise.ticker}-${surprise.fiscal_period}-${index}`}
                        className="border-b border-border hover:bg-red-500/5 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            href={`/stock/${surprise.ticker}`}
                            className="flex items-center gap-2 font-bold text-red-500 hover:text-red-400"
                          >
                            <StockLogo symbol={surprise.ticker} size="sm" />
                            {surprise.ticker}
                          </Link>
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {surprise.fiscal_period}
                        </td>
                        <td className="p-3 text-right font-medium">
                          ${surprise.eps_estimate?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-red-500">
                          ${surprise.eps_actual?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                            <TrendingDown className="w-4 h-4" />
                            {formatPercent(surprise.eps_surprise_percent)}
                          </span>
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                          {surprise.num_analysts || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Understanding Earnings Surprises */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding Earnings Surprises
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What is an Earnings Beat?
                </h3>
                <p className="text-muted-foreground mb-4">
                  An earnings beat occurs when a company reports earnings per share (EPS) that
                  exceeds analyst consensus estimates. This positive surprise typically indicates
                  stronger-than-expected business performance.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Often drives stock price higher</li>
                  <li>Signals business strength and execution</li>
                  <li>Beats of 5%+ are considered significant</li>
                  <li>Quality beats include revenue growth too</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What is an Earnings Miss?
                </h3>
                <p className="text-muted-foreground mb-4">
                  An earnings miss happens when reported EPS falls short of analyst estimates.
                  This negative surprise usually indicates weaker performance or unexpected
                  challenges.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Typically causes stock price decline</li>
                  <li>May signal business headwinds</li>
                  <li>Misses of 5%+ are considered significant</li>
                  <li>Impact depends on guidance and outlook</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Use This Data */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to Use Earnings Surprise Data
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Identify Consistent Performers</h3>
                  <p className="text-muted-foreground">
                    Look for companies that consistently beat earnings estimates quarter after quarter.
                    These stocks often have strong business models and conservative guidance.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Spot Turnaround Candidates</h3>
                  <p className="text-muted-foreground">
                    Watch for companies that start beating estimates after a period of misses.
                    This can signal operational improvements or a business turnaround.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Gauge Market Sentiment</h3>
                  <p className="text-muted-foreground">
                    The overall beat rate shows market health. Beat rates above 70% indicate strong
                    corporate earnings season, while below 50% may signal economic weakness.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Combine with Other Analysis</h3>
                  <p className="text-muted-foreground">
                    Use earnings surprises alongside fundamental analysis, valuation metrics, and
                    technical indicators. A single beat or miss doesn't tell the whole story.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Earnings Surprise Trends */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Key Trends in Earnings Surprises
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Beat Rate Trends</h3>
                <p className="text-muted-foreground text-sm">
                  Track the percentage of companies beating estimates over time. Higher beat rates
                  typically correlate with bull markets and economic strength.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2">Estimate Accuracy</h3>
                <p className="text-muted-foreground text-sm">
                  Analysts tend to be conservative, leading to a historical beat rate around 60-70%.
                  Monitor whether estimates are becoming more or less accurate.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-bold mb-2">Magnitude Matters</h3>
                <p className="text-muted-foreground text-sm">
                  The size of beats and misses matters more than frequency. Large surprises (10%+)
                  tend to drive more significant stock price movements.
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
              Related Earnings Data
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upcoming earnings reports
                </p>
              </Link>

              <Link
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Top Gainers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Biggest price movers
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Sectors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse by industry
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
              Get Detailed Earnings Analysis
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Access comprehensive earnings analysis with AI-powered insights, historical trends,
              and valuation metrics for any stock in the market.
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
