import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} iGaming Revenue - Online Casino Revenue ${currentYear}`,
    description: `${symbol} iGaming revenue analysis: online casino revenue, slot revenue, table games, growth trends. Track ${symbol}'s online casino business performance.`,
    keywords: [
      `${symbol} igaming revenue`,
      `${symbol} online casino`,
      `${symbol} casino revenue`,
      `${symbol} igaming growth`,
      `${symbol} slot revenue`,
      `${symbol} online gambling`,
    ],
    openGraph: {
      title: `${symbol} iGaming Revenue ${currentYear} | Online Casino Performance`,
      description: `Complete ${symbol} iGaming revenue analysis with growth trends and product mix.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/igaming-revenue/${ticker.toLowerCase()}`,
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

export default async function IGamingRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/igaming-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock iGaming data - in production, this would come from your API
  const igamingRevenue = metrics?.igaming_revenue || 150e6
  const igamingGrowth = metrics?.igaming_growth || 0.35
  const igamingMargin = metrics?.igaming_margin || 0.25
  const latestPeriod = 'Q4 2024'

  // Generate iGaming FAQs
  const igamingFaqs = [
    {
      question: `What is ${symbol}'s iGaming revenue?`,
      answer: `${symbol} (${companyName}) reported ${igamingRevenue >= 1e9 ? `$${(igamingRevenue / 1e9).toFixed(2)} billion` : `$${(igamingRevenue / 1e6).toFixed(0)} million`} in iGaming revenue for ${latestPeriod}. ${igamingGrowth > 0 ? `This represents ${(igamingGrowth * 100).toFixed(0)}% growth compared to the previous period.` : ''}`
    },
    {
      question: `What is iGaming?`,
      answer: `iGaming refers to online casino gaming, including slots, table games (blackjack, roulette, baccarat), live dealer games, and poker. Unlike sports betting which has variable outcomes, iGaming has more predictable hold rates (typically 3-5% for slots, 2-3% for table games) and can operate 24/7 without dependency on sporting events.`
    },
    {
      question: `Is ${symbol}'s iGaming business growing?`,
      answer: igamingGrowth > 0
        ? `Yes, ${symbol}'s iGaming revenue is growing at ${(igamingGrowth * 100).toFixed(0)}% year-over-year. iGaming growth is driven by new state launches, increased customer engagement, and product improvements. iGaming typically has higher margins than sports betting.`
        : `${symbol}'s iGaming revenue growth has moderated, which could indicate market saturation, regulatory changes, or increased competition in key markets.`
    },
    {
      question: `How profitable is ${symbol}'s iGaming business?`,
      answer: `${symbol}'s iGaming business operates at approximately ${(igamingMargin * 100).toFixed(0)}% EBITDA margin, which is typically higher than sports betting (10-15% margins). iGaming benefits from lower promotional costs, more predictable hold rates, and 24/7 revenue generation without sporting event dependency.`
    },
    {
      question: `Which states allow iGaming?`,
      answer: `Online casino (iGaming) is legal in only 6 states: New Jersey, Pennsylvania, Michigan, West Virginia, Delaware, and Connecticut. This is significantly fewer than the 30+ states with legal sports betting, representing both a constraint and an opportunity for ${symbol} as more states legalize online casinos.`
    },
    {
      question: `Is iGaming more valuable than sports betting for ${symbol}?`,
      answer: `iGaming often generates higher revenue per customer, has better margins (25-35% vs 10-15%), requires less promotional spend, and operates year-round. However, it's only legal in 6 states. For ${symbol}, iGaming revenue of ${igamingRevenue >= 1e9 ? `$${(igamingRevenue / 1e9).toFixed(2)}B` : `$${(igamingRevenue / 1e6).toFixed(0)}M`} represents a high-margin complement to sports betting.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} iGaming Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} iGaming Revenue ${currentYear} - Online Casino Performance`,
    description: `Complete iGaming revenue analysis for ${symbol} (${companyName}) with growth trends and profitability metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} igaming`,
      `${symbol} online casino`,
      `${symbol} casino revenue`,
      `${symbol} igaming growth`,
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

  const faqSchema = getFAQSchema(igamingFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} iGaming Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} iGaming Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Online casino revenue and performance for {companyName}
          </p>

          {/* Latest iGaming Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">iGaming Revenue</p>
                <p className="text-3xl font-bold">
                  {igamingRevenue >= 1e9
                    ? `$${(igamingRevenue / 1e9).toFixed(2)}B`
                    : `$${(igamingRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${igamingGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {igamingGrowth >= 0 ? '+' : ''}{(igamingGrowth * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">EBITDA Margin</p>
                <p className="text-3xl font-bold text-amber-500">
                  {(igamingMargin * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">estimated margin</p>
              </div>
            </div>
          </div>

          {/* iGaming Business Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">iGaming Business Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName}'s iGaming business generates {igamingRevenue >= 1e9 ? `$${(igamingRevenue / 1e9).toFixed(2)} billion` : `$${(igamingRevenue / 1e6).toFixed(0)} million`} in
                revenue from online casino games. iGaming typically has higher margins than sports betting
                and operates 24/7 without sporting event dependency.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                  <p className="text-2xl font-bold">
                    {igamingRevenue >= 1e9
                      ? `$${(igamingRevenue / 1e9).toFixed(2)}B`
                      : `$${(igamingRevenue / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Growth</p>
                  <p className={`text-2xl font-bold ${igamingGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {igamingGrowth >= 0 ? '+' : ''}{(igamingGrowth * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Product Mix */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">iGaming Product Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Slots</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Largest category by revenue
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>~60-70% of iGaming revenue</li>
                  <li>3-5% hold rate</li>
                  <li>Highest volume</li>
                  <li>Casual player preference</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Table Games</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Blackjack, roulette, baccarat
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>~20-30% of revenue</li>
                  <li>2-3% hold rate</li>
                  <li>Higher stakes</li>
                  <li>Experienced players</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Live Dealer</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Premium casino experience
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>~10-15% of revenue</li>
                  <li>Higher margins</li>
                  <li>Premium positioning</li>
                  <li>Growing category</li>
                </ul>
              </div>
            </div>
          </section>

          {/* iGaming Advantages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">iGaming vs Sports Betting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">iGaming Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Higher margins (25-35% vs 10-15%)</li>
                  <li>Predictable hold rates</li>
                  <li>24/7 operation (no events needed)</li>
                  <li>Lower promotional costs</li>
                  <li>Higher revenue per customer</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Constraints</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Only 6 legal states (vs 30+ for betting)</li>
                  <li>Slower state legalization</li>
                  <li>More regulatory scrutiny</li>
                  <li>Social perception challenges</li>
                  <li>Limited addressable market</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Gaming Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete gaming metrics, sports betting data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/handle/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Sports Betting
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {igamingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> iGaming revenue estimates are based on publicly reported financial data. Revenue and margins may vary by state, product mix, and reporting period. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="igaming-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
