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
    title: `${symbol} User Growth Rate - User Base Expansion Analysis ${currentYear}`,
    description: `${symbol} user growth rate: YoY user growth, growth trends, acquisition metrics, and expansion analysis. Track ${symbol}'s user base growth.`,
    keywords: [
      `${symbol} user growth`,
      `${symbol} growth rate`,
      `${symbol} user acquisition`,
      `${symbol} YoY growth`,
      `${symbol} user expansion`,
      `${symbol} growth metrics`,
    ],
    openGraph: {
      title: `${symbol} User Growth Rate - Growth Analysis`,
      description: `${symbol} user growth rate analysis with YoY trends and acquisition metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/user-growth/${ticker.toLowerCase()}`,
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

export default async function UserGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/user-growth/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const userGrowthFaqs = [
    {
      question: `What is ${symbol}'s user growth rate?`,
      answer: `${symbol} (${companyName}) user growth rate measures how quickly the platform's user base is expanding. Typically reported as year-over-year (YoY) or quarter-over-quarter (QoQ) percentage growth in MAU or DAU. User growth is a critical indicator for ${sector || 'technology'} companies' market penetration and future revenue potential.`
    },
    {
      question: `How is user growth calculated for ${symbol}?`,
      answer: `User growth for ${symbol} is calculated as: ((Current Period Users - Previous Period Users) / Previous Period Users) × 100. For example, if MAU grew from 100M to 120M, the YoY growth rate is ((120M - 100M) / 100M) × 100 = 20%. Companies report both absolute user additions and percentage growth rates.`
    },
    {
      question: `What is a good user growth rate for ${symbol}?`,
      answer: `Good user growth rates vary by company maturity and market. High-growth startups may target 50-100%+ annual growth, while mature platforms like ${symbol} often see 5-20% YoY growth. Sustained user growth above market expansion indicates competitive strength. Decelerating growth or negative growth raises concerns about market saturation or competitive pressure.`
    },
    {
      question: `What drives user growth for ${symbol}?`,
      answer: `${symbol}'s user growth is driven by product innovation, marketing spend, viral/network effects, geographic expansion, new use cases, competitive advantages, and market trends. ${sector ? `In the ${sector} sector, ` : ''}successful platforms balance organic growth from existing users with paid acquisition and international expansion.`
    },
    {
      question: `How does user growth affect ${symbol}'s valuation?`,
      answer: `User growth significantly impacts ${symbol}'s valuation through revenue potential and market expectations. Strong user growth suggests large addressable market and future monetization opportunities. Investors often value growth-stage companies on user metrics rather than profitability. Decelerating growth can lead to multiple compression even with strong financials.`
    },
    {
      question: `What is the difference between user growth and revenue growth for ${symbol}?`,
      answer: `User growth measures user base expansion while revenue growth tracks monetization. ${symbol} can have high user growth but low revenue growth (monetization challenge) or vice versa (ARPU expansion). The ideal scenario is user growth accompanied by stable or growing ARPU, driving compounding revenue growth.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} User Growth`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} User Growth Rate - Growth Analysis ${currentYear}`,
    description: `Complete ${symbol} user growth rate analysis with YoY trends and acquisition metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} user growth`,
      `${symbol} growth rate`,
      `${symbol} user acquisition`,
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

  const faqSchema = getFAQSchema(userGrowthFaqs)

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
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} User Growth</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} User Growth Rate
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} user base expansion and growth analysis
          </p>

          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">User Growth Rate</p>
              <p className="text-4xl font-bold mb-4">Growth Metrics</p>
              <p className="text-muted-foreground">
                Track user base expansion for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding User Growth</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-cyan-500 mb-2">What Growth Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>User base expansion rate</li>
                  <li>Market penetration speed</li>
                  <li>Acquisition effectiveness</li>
                  <li>Platform momentum</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Why Growth Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Indicates market demand</li>
                  <li>Drives future revenue</li>
                  <li>Shows competitive strength</li>
                  <li>Impacts valuation multiples</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Rate Calculation</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Year-over-Year (YoY) Growth</p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm mb-2">
                    YoY Growth = ((Current Year Users - Previous Year Users) / Previous Year Users) × 100
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: If {symbol} grew from 100M to 120M MAU: ((120M - 100M) / 100M) × 100 = 20% YoY growth
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Quarter-over-Quarter (QoQ) Growth</p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm mb-2">
                    QoQ Growth = ((Current Quarter - Previous Quarter) / Previous Quarter) × 100
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QoQ growth shows sequential momentum and is less affected by seasonality than YoY comparisons
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Stage Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Early Stage</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  High-growth phase with rapid user acquisition
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Target Range</p>
                  <p className="font-bold text-green-500">50-100%+ YoY</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Growth Stage</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Sustained expansion with maturing user base
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Target Range</p>
                  <p className="font-bold text-blue-500">20-50% YoY</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Mature Stage</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Steady growth with focus on engagement and ARPU
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Target Range</p>
                  <p className="font-bold text-cyan-500">5-20% YoY</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Drivers & Strategies</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Organic Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Viral mechanisms, word-of-mouth, network effects, and product quality drive natural user acquisition
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Paid Acquisition</h3>
                <p className="text-sm text-muted-foreground">
                  Marketing spend, advertising campaigns, and partnerships accelerate user growth through paid channels
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Geographic Expansion</h3>
                <p className="text-sm text-muted-foreground">
                  Launching in new countries and regions unlocks additional user pools and market opportunities
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Product Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  New features, use cases, and platform improvements attract new users and reactivate dormant accounts
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Quality Indicators</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Retention Rate</p>
                    <p className="text-sm text-muted-foreground">
                      High retention (70%+ monthly) indicates sustainable growth with quality users who stick around
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Engagement Trends</p>
                    <p className="text-sm text-muted-foreground">
                      Growing DAU/MAU ratio or time spent shows new users are actively engaging, not just signing up
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Monetization Efficiency</p>
                    <p className="text-sm text-muted-foreground">
                      Revenue growth matching or exceeding user growth demonstrates ability to monetize at scale
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Acquisition Costs</p>
                    <p className="text-sm text-muted-foreground">
                      Declining or stable CAC (customer acquisition cost) while growing indicates efficient scaling
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete user metrics, financials, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/mau/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                MAU Metrics
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {userGrowthFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> User growth data is based on company disclosures and may be subject to revisions. Growth rates can fluctuate based on seasonality and market conditions. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
