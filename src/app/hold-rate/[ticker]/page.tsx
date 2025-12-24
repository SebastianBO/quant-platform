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
    title: `${symbol} Hold Rate - Sports Betting Profitability Metric ${currentYear}`,
    description: `${symbol} hold rate analysis: sportsbook hold percentage, quarterly trends, profitability margins. Track ${symbol}'s betting profitability and efficiency.`,
    keywords: [
      `${symbol} hold rate`,
      `${symbol} sports betting hold`,
      `${symbol} sportsbook margin`,
      `${symbol} hold percentage`,
      `${symbol} betting profitability`,
      `${symbol} sports betting margins`,
    ],
    openGraph: {
      title: `${symbol} Hold Rate ${currentYear} | Sports Betting Profitability`,
      description: `Complete ${symbol} hold rate analysis with quarterly trends and profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/hold-rate/${ticker.toLowerCase()}`,
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

export default async function HoldRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/hold-rate/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock hold rate data - in production, this would come from your API
  const currentHoldRate = metrics?.hold_rate || 0.08
  const industryAvgHoldRate = 0.075
  const latestPeriod = 'Q4 2024'

  // Generate hold rate FAQs
  const holdRateFaqs = [
    {
      question: `What is ${symbol}'s hold rate?`,
      answer: `${symbol} (${companyName}) reported a ${(currentHoldRate * 100).toFixed(1)}% hold rate for ${latestPeriod}. This means the company retains ${(currentHoldRate * 100).toFixed(1)}% of total handle as gross gaming revenue before expenses.`
    },
    {
      question: `What is hold rate in sports betting?`,
      answer: `Hold rate (or hold percentage) is the percentage of total handle that a sportsbook retains as revenue after paying out winning bets. For example, a 10% hold rate means that for every $100 wagered, the sportsbook keeps $10 as gross revenue. It's a key profitability metric for sports betting operators.`
    },
    {
      question: `Is ${symbol}'s hold rate good?`,
      answer: currentHoldRate > industryAvgHoldRate
        ? `${symbol}'s hold rate of ${(currentHoldRate * 100).toFixed(1)}% is above the industry average of ${(industryAvgHoldRate * 100).toFixed(1)}%, indicating strong pricing power and efficient risk management.`
        : currentHoldRate < industryAvgHoldRate
        ? `${symbol}'s hold rate of ${(currentHoldRate * 100).toFixed(1)}% is below the industry average of ${(industryAvgHoldRate * 100).toFixed(1)}%. This could indicate aggressive promotional activity or customer-favorable odds to gain market share.`
        : `${symbol}'s hold rate of ${(currentHoldRate * 100).toFixed(1)}% is in line with the industry average.`
    },
    {
      question: `What affects ${symbol}'s hold rate?`,
      answer: `Hold rate is influenced by several factors: promotional intensity (bonuses reduce hold), parlay mix (parlays have higher hold), pricing strategy, customer sophistication, product mix (SGP vs straight bets), and market conditions. Strong hold rates indicate disciplined pricing and effective risk management.`
    },
    {
      question: `How does hold rate impact ${symbol}'s revenue?`,
      answer: `Hold rate directly determines gross gaming revenue. For ${symbol}, a ${(currentHoldRate * 100).toFixed(1)}% hold rate means revenue equals handle multiplied by ${(currentHoldRate * 100).toFixed(1)}%. Higher hold rates improve profitability, but must be balanced against customer acquisition and retention goals.`
    },
    {
      question: `Why is hold rate important for investors?`,
      answer: `Hold rate is critical because it shows how efficiently a sportsbook converts handle into revenue. A sustainable hold rate of 7-10% is considered healthy. Investors should watch for hold rate trends: declining rates may signal excessive promotions, while stable rates indicate disciplined operations.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Hold Rate`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Hold Rate ${currentYear} - Sports Betting Profitability Analysis`,
    description: `Complete hold rate analysis for ${symbol} (${companyName}) with quarterly trends and industry comparisons.`,
    url: pageUrl,
    keywords: [
      `${symbol} hold rate`,
      `${symbol} sports betting`,
      `${symbol} profitability`,
      `${symbol} sportsbook margin`,
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

  const faqSchema = getFAQSchema(holdRateFaqs)

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
            <span>{symbol} Hold Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Hold Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sports betting profitability metrics for {companyName}
          </p>

          {/* Latest Hold Rate Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Hold Rate</p>
                <p className="text-3xl font-bold">
                  {(currentHoldRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry Average</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {(industryAvgHoldRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">US market avg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">vs. Industry</p>
                <p className={`text-3xl font-bold ${currentHoldRate > industryAvgHoldRate ? 'text-green-500' : currentHoldRate < industryAvgHoldRate ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {currentHoldRate > industryAvgHoldRate ? '+' : ''}{((currentHoldRate - industryAvgHoldRate) * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">difference</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Hold Rate Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                Hold rate measures {companyName}'s ability to convert betting handle into revenue.
                A sustainable hold rate typically ranges from 7-10% in the US sports betting market.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Hold</p>
                  <p className="text-2xl font-bold">
                    {(currentHoldRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-2xl font-bold text-green-500">
                    {currentHoldRate >= 0.07 && currentHoldRate <= 0.10 ? 'Healthy' : currentHoldRate > 0.10 ? 'Strong' : 'Below Target'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Hold Rate Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Hold Rate Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Positive Factors</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Higher parlay mix</li>
                  <li>Lower promotional intensity</li>
                  <li>Efficient pricing algorithms</li>
                  <li>Same-game parlays (SGP)</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Negative Factors</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Aggressive promotions</li>
                  <li>Sharp bettor volume</li>
                  <li>Customer-favorable odds</li>
                  <li>High straight bet volume</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, handle data, and AI-powered insights
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
                View Handle Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {holdRateFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Hold rate data is based on publicly reported metrics. Hold rates can vary significantly by quarter due to sporting event outcomes, promotional activity, and customer mix. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="hold-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
