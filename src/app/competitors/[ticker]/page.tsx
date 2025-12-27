import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getRelatedStocks,
  getCorporationSchema,
  SITE_URL,
, getTableSchema } from '@/lib/seo'
import { ArrowRight, TrendingUp, Users, Scale, Target } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

// Allow dynamic rendering
export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Get industry from known stocks (simplified)
  const industryMap: Record<string, string> = {
    AAPL: 'Technology',
    MSFT: 'Technology',
    GOOGL: 'Technology',
    AMZN: 'E-commerce',
    META: 'Social Media',
    NVDA: 'Semiconductors',
    AMD: 'Semiconductors',
    INTC: 'Semiconductors',
    TSLA: 'Electric Vehicles',
    JPM: 'Banking',
    BAC: 'Banking',
  }

  const industry = industryMap[symbol] || 'Industry'

  return {
    title: `${symbol} Competitors - Top ${industry} Rivals & Comparison ${currentYear}`,
    description: `Discover ${symbol}'s main competitors and rivals. Compare ${symbol} vs competing stocks with detailed metrics, financial analysis, and expert insights. Find the best alternative investments to ${symbol}.`,
    keywords: [
      `${symbol} competitors`,
      `${symbol} rivals`,
      `${symbol} vs competitors`,
      `${symbol} competition`,
      `${symbol} alternatives`,
      `companies like ${symbol}`,
      `${symbol} comparison`,
      `best ${symbol} alternative`,
    ],
    openGraph: {
      title: `${symbol} Competitors - Top ${industry} Rivals`,
      description: `Compare ${symbol} with its main competitors. See how ${symbol} stacks up against rival companies in the ${industry.toLowerCase()} sector.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/competitors/${ticker.toLowerCase()}`,
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

async function getCompetitorData(ticker: string) {
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

export default async function CompetitorsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const sector = companyFacts?.sector || 'Technology'
  const industry = companyFacts?.industry || 'Software'

  // Get competitors
  const competitorTickers = getRelatedStocks(symbol)

  // Fetch competitor data in parallel
  const competitorDataPromises = competitorTickers.map(async (competitorTicker) => {
    const data = await getCompetitorData(competitorTicker)
    return {
      ticker: competitorTicker,
      data,
    }
  })

  const competitorResults = await Promise.all(competitorDataPromises)
  const competitors = competitorResults.filter(c => c.data?.snapshot)

  const pageUrl = `${SITE_URL}/competitors/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: symbol, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Competitors', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Competitors - Top ${industry} Rivals`,
    description: `Compare ${symbol} (${companyName}) with its main competitors in the ${industry} industry.`,
    url: pageUrl,
    keywords: [
      `${symbol} competitors`,
      `${symbol} rivals`,
      `${symbol} vs competitors`,
      `${symbol} competition`,
    ],
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description || `${companyName} (${symbol}) common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  // FAQ Schema for competitors page
  const competitorFAQs = [
    {
      question: `Who are ${symbol}'s main competitors?`,
      answer: `${symbol}'s main competitors include ${competitorTickers.slice(0, 3).join(', ')}, and other companies in the ${industry} industry. These companies compete directly with ${companyName} for market share and customers.`,
    },
    {
      question: `How does ${symbol} compare to its competitors?`,
      answer: `${symbol} can be compared to competitors using metrics like market capitalization, P/E ratio, revenue growth, profit margins, and market share. Each competitor has different strengths - some may have better valuations while others have higher growth rates.`,
    },
    {
      question: `What are the best alternatives to ${symbol} stock?`,
      answer: `The best alternatives to ${symbol} depend on your investment goals. For similar market exposure, consider ${competitorTickers.slice(0, 2).join(' or ')}. For different risk profiles, research companies with varying market caps and growth trajectories in the ${industry} sector.`,
    },
    {
      question: `Which is better: ${symbol} or ${competitorTickers[0]}?`,
      answer: `Comparing ${symbol} vs ${competitorTickers[0]} requires analyzing valuation metrics, growth prospects, competitive advantages, and risk factors. Neither is universally "better" - the right choice depends on your investment strategy, risk tolerance, and market outlook.`,
    },
    {
      question: `What makes ${symbol} different from its competitors?`,
      answer: `${companyName} differentiates itself through its unique business model, product offerings, market positioning, and competitive advantages. Factors like brand strength, innovation, operational efficiency, and financial health distinguish ${symbol} from rivals.`,
    },
    {
      question: `Should I diversify across ${symbol} and its competitors?`,
      answer: `Diversifying across multiple companies in the same industry can reduce company-specific risk while maintaining sector exposure. However, this doesn't eliminate sector risk. Consider diversifying across different industries and sectors for better risk-adjusted returns.`,
    },
  ]

  const faqSchema = getFAQSchema(competitorFAQs)

  // Combine schemas
  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <Link href={`/stock/${ticker.toLowerCase()}`} className="hover:text-foreground">{symbol}</Link>
            {' / '}
            <span>Competitors</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-green-500" />
              <h1 className="text-4xl font-bold">
                {symbol} Competitors & Rivals
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Compare {companyName} with top {industry} companies
            </p>
          </div>

          {/* Main Stock Card */}
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30 p-6 rounded-xl mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{companyName}</h2>
                <p className="text-muted-foreground mb-4">{symbol} - {sector}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-lg font-bold">
                      {snapshot.market_cap
                        ? `$${(snapshot.market_cap / 1e9).toFixed(1)}B`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-lg font-bold">
                      ${snapshot.price?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P/E Ratio</p>
                    <p className="text-lg font-bold">
                      {metrics?.price_to_earnings_ratio > 0
                        ? metrics.price_to_earnings_ratio.toFixed(2)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className="text-lg font-bold">
                      {metrics?.revenue_growth
                        ? `${(metrics.revenue_growth * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href={`/stock/${ticker.toLowerCase()}`}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Competitors Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-500" />
              Top Competitors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitors.map(({ ticker: competitorTicker, data }) => {
                const competitorSnapshot = data.snapshot
                const competitorMetrics = data.metrics
                const competitorFacts = data.companyFacts
                const competitorName = competitorFacts?.name || competitorTicker

                return (
                  <div
                    key={competitorTicker}
                    className="bg-card border border-border p-5 rounded-xl hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{competitorName}</h3>
                        <p className="text-sm text-muted-foreground">{competitorTicker}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${competitorSnapshot.price?.toFixed(2) || 'N/A'}
                        </p>
                        {competitorSnapshot.change_percent && (
                          <p
                            className={`text-sm ${
                              competitorSnapshot.change_percent >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {competitorSnapshot.change_percent >= 0 ? '+' : ''}
                            {competitorSnapshot.change_percent.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Market Cap</p>
                        <p className="font-semibold">
                          {competitorSnapshot.market_cap
                            ? `$${(competitorSnapshot.market_cap / 1e9).toFixed(1)}B`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">P/E Ratio</p>
                        <p className="font-semibold">
                          {competitorMetrics?.price_to_earnings_ratio > 0
                            ? competitorMetrics.price_to_earnings_ratio.toFixed(2)
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rev Growth</p>
                        <p className="font-semibold">
                          {competitorMetrics?.revenue_growth
                            ? `${(competitorMetrics.revenue_growth * 100).toFixed(1)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/compare/${ticker.toLowerCase()}-vs-${competitorTicker.toLowerCase()}`}
                        className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        Compare
                      </Link>
                      <Link
                        href={`/stock/${competitorTicker.toLowerCase()}`}
                        className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              Side-by-Side Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-card border border-border rounded-lg">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">Metric</th>
                    <th className="text-right p-4 font-semibold bg-green-500/10">
                      {symbol}
                    </th>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker }) => (
                      <th key={competitorTicker} className="text-right p-4 font-semibold">
                        {competitorTicker}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-4 text-muted-foreground">Price</td>
                    <td className="p-4 text-right font-semibold bg-green-500/5">
                      ${snapshot.price?.toFixed(2) || 'N/A'}
                    </td>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker, data }) => (
                      <td key={competitorTicker} className="p-4 text-right font-semibold">
                        ${data.snapshot.price?.toFixed(2) || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 text-muted-foreground">Market Cap</td>
                    <td className="p-4 text-right font-semibold bg-green-500/5">
                      {snapshot.market_cap
                        ? `$${(snapshot.market_cap / 1e9).toFixed(1)}B`
                        : 'N/A'}
                    </td>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker, data }) => (
                      <td key={competitorTicker} className="p-4 text-right font-semibold">
                        {data.snapshot.market_cap
                          ? `$${(data.snapshot.market_cap / 1e9).toFixed(1)}B`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 text-muted-foreground">P/E Ratio</td>
                    <td className="p-4 text-right font-semibold bg-green-500/5">
                      {metrics?.price_to_earnings_ratio > 0
                        ? metrics.price_to_earnings_ratio.toFixed(2)
                        : 'N/A'}
                    </td>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker, data }) => (
                      <td key={competitorTicker} className="p-4 text-right font-semibold">
                        {data.metrics?.price_to_earnings_ratio > 0
                          ? data.metrics.price_to_earnings_ratio.toFixed(2)
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 text-muted-foreground">Revenue Growth</td>
                    <td className="p-4 text-right font-semibold bg-green-500/5">
                      {metrics?.revenue_growth
                        ? `${(metrics.revenue_growth * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker, data }) => (
                      <td key={competitorTicker} className="p-4 text-right font-semibold">
                        {data.metrics?.revenue_growth
                          ? `${(data.metrics.revenue_growth * 100).toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-muted-foreground">Profit Margin</td>
                    <td className="p-4 text-right font-semibold bg-green-500/5">
                      {metrics?.profit_margin
                        ? `${(metrics.profit_margin * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    {competitors.slice(0, 3).map(({ ticker: competitorTicker, data }) => (
                      <td key={competitorTicker} className="p-4 text-right font-semibold">
                        {data.metrics?.profit_margin
                          ? `${(data.metrics.profit_margin * 100).toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Detailed Comparisons CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detailed Head-to-Head Comparisons
              </h2>
              <p className="text-muted-foreground mb-6">
                Get in-depth analysis comparing {symbol} with each competitor
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {competitorTickers.map((competitorTicker) => (
                  <Link
                    key={competitorTicker}
                    href={`/compare/${ticker.toLowerCase()}-vs-${competitorTicker.toLowerCase()}`}
                    className="flex items-center justify-between p-4 bg-card hover:bg-secondary/50 border border-border hover:border-green-500/50 rounded-lg transition-all group"
                  >
                    <span className="font-medium">
                      {symbol} vs {competitorTicker}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {competitorFAQs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Analysis */}
          <section className="bg-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-bold mb-4">Continue Your Research</h2>
            <p className="text-muted-foreground mb-6">
              Explore more analysis tools for {symbol}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href={`/should-i-buy/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Should I Buy?</p>
                <p className="text-xs text-muted-foreground">Investment advice</p>
              </Link>
              <Link
                href={`/prediction/${ticker.toLowerCase()}`}
                className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Price Prediction</p>
                <p className="text-xs text-muted-foreground">AI forecast</p>
              </Link>
              <Link
                href={`/analysis/${ticker.toLowerCase()}/valuation`}
                className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Valuation</p>
                <p className="text-xs text-muted-foreground">DCF analysis</p>
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=ai`}
                className="p-4 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Full insights</p>
              </Link>
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
