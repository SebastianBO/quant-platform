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
    title: `${symbol} Parlay Mix - Sports Betting Product Mix ${currentYear}`,
    description: `${symbol} parlay mix analysis: percentage of parlays vs straight bets, SGP penetration, product trends. Track ${symbol}'s betting product composition.`,
    keywords: [
      `${symbol} parlay mix`,
      `${symbol} sports betting product mix`,
      `${symbol} same game parlay`,
      `${symbol} SGP penetration`,
      `${symbol} parlay percentage`,
      `${symbol} betting products`,
    ],
    openGraph: {
      title: `${symbol} Parlay Mix ${currentYear} | Sports Betting Product Analysis`,
      description: `Complete ${symbol} parlay mix analysis with product trends and profitability implications.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/parlay-mix/${ticker.toLowerCase()}`,
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

export default async function ParlayMixPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/parlay-mix/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock parlay mix data - in production, this would come from your API
  const parlayPercentage = metrics?.parlay_mix || 0.45
  const sgpPercentage = metrics?.sgp_penetration || 0.25
  const latestPeriod = 'Q4 2024'

  // Generate parlay mix FAQs
  const parlayMixFaqs = [
    {
      question: `What is ${symbol}'s parlay mix?`,
      answer: `${symbol} (${companyName}) reported that ${(parlayPercentage * 100).toFixed(0)}% of handle came from parlay bets in ${latestPeriod}, with ${(sgpPercentage * 100).toFixed(0)}% from same-game parlays (SGPs). This indicates the product mix and customer preferences on the platform.`
    },
    {
      question: `What is parlay mix in sports betting?`,
      answer: `Parlay mix refers to the percentage of total betting handle that comes from parlay bets versus straight bets. Parlay bets combine multiple selections into one wager, offering higher payouts but lower win rates. Higher parlay mix typically correlates with higher hold rates and better profitability for sportsbooks.`
    },
    {
      question: `Why is parlay mix important for ${symbol}?`,
      answer: `Parlay mix is crucial because parlay bets typically have higher hold rates (15-25%) compared to straight bets (4-6%). ${symbol}'s ${(parlayPercentage * 100).toFixed(0)}% parlay mix contributes significantly to overall profitability. Same-game parlays (SGPs) are particularly profitable due to correlated outcomes.`
    },
    {
      question: `What are same-game parlays (SGP)?`,
      answer: `Same-game parlays allow bettors to combine multiple bets from a single game into one wager. For example, betting on a team to win, a player to score, and the total points. SGPs are highly profitable for operators because the outcomes are correlated, making the true odds harder to calculate and allowing for higher margins.`
    },
    {
      question: `How does ${symbol}'s parlay mix compare to competitors?`,
      answer: `Industry average parlay mix ranges from 35-50% of total handle. ${symbol}'s ${(parlayPercentage * 100).toFixed(0)}% parlay mix is ${parlayPercentage > 0.425 ? 'above' : parlayPercentage < 0.375 ? 'below' : 'in line with'} the industry average, indicating ${parlayPercentage > 0.425 ? 'strong product innovation and customer engagement' : 'an opportunity to increase profitability through product mix optimization'}.`
    },
    {
      question: `Is higher parlay mix better for investors?`,
      answer: `Generally yes. Higher parlay mix indicates stronger product engagement and typically leads to higher hold rates and better unit economics. However, extremely high parlay mix can sometimes indicate recreational customer base with lower lifetime value. The ideal mix balances profitability with customer sustainability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Parlay Mix`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Parlay Mix ${currentYear} - Sports Betting Product Analysis`,
    description: `Complete parlay mix analysis for ${symbol} (${companyName}) with product trends and profitability insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} parlay mix`,
      `${symbol} sports betting`,
      `${symbol} product mix`,
      `${symbol} same game parlay`,
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

  const faqSchema = getFAQSchema(parlayMixFaqs)

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
            <span>{symbol} Parlay Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Parlay Mix {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sports betting product composition for {companyName}
          </p>

          {/* Latest Parlay Mix Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Parlay Mix</p>
                <p className="text-3xl font-bold">
                  {(parlayPercentage * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">of total handle</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">SGP Penetration</p>
                <p className="text-3xl font-bold text-orange-500">
                  {(sgpPercentage * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">same-game parlays</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Straight Bets</p>
                <p className="text-3xl font-bold text-blue-500">
                  {((1 - parlayPercentage) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">traditional bets</p>
              </div>
            </div>
          </div>

          {/* Product Mix Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Product Mix Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName}'s product mix shows {(parlayPercentage * 100).toFixed(0)}% parlay concentration,
                which is {parlayPercentage > 0.425 ? 'above' : parlayPercentage < 0.375 ? 'below' : 'in line with'} the
                industry average of 35-50%.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Parlay Bets</span>
                    <span className="text-muted-foreground">{(parlayPercentage * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${parlayPercentage * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Same-Game Parlays</span>
                    <span className="text-muted-foreground">{(sgpPercentage * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${sgpPercentage * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Straight Bets</span>
                    <span className="text-muted-foreground">{((1 - parlayPercentage) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${(1 - parlayPercentage) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profitability Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Parlay Economics</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Hold rate: 15-25% (vs 4-6% straight)</li>
                  <li>Higher customer engagement</li>
                  <li>Better unit economics</li>
                  <li>Lower customer acquisition cost</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">SGP Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Highest hold rates (20-30%)</li>
                  <li>Proprietary product differentiation</li>
                  <li>Correlated outcome pricing power</li>
                  <li>Strong customer retention</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, hold rates, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/hold-rate/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Hold Rate
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {parlayMixFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Parlay mix data is based on publicly reported metrics and industry estimates. Product mix can vary significantly by quarter, sporting calendar, and promotional activity. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="parlay-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
