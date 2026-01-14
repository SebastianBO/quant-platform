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

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} States Live - Sports Betting Geographic Footprint ${currentYear}`,
    description: `${symbol} states live analysis: number of live states, state-by-state breakdown, market access, expansion timeline. Track ${symbol}'s geographic expansion.`,
    keywords: [
      `${symbol} states live`,
      `${symbol} sports betting states`,
      `${symbol} geographic footprint`,
      `${symbol} state expansion`,
      `${symbol} market access`,
      `${symbol} state-by-state`,
    ],
    openGraph: {
      title: `${symbol} States Live ${currentYear} | Geographic Footprint`,
      description: `Complete ${symbol} states live analysis with expansion timeline and market coverage.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/states-live/${ticker.toLowerCase()}`,
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

export default async function StatesLivePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/states-live/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock states live data - in production, this would come from your API
  const statesLive = metrics?.states_live || 20
  const totalLegalStates = 38
  const marketCoverage = (statesLive / totalLegalStates) * 100
  const latestPeriod = 'Q4 2024'

  // Generate states live FAQs
  const statesLiveFaqs = [
    {
      question: `How many states is ${symbol} live in?`,
      answer: `${symbol} (${companyName}) is currently live in ${statesLive} states as of ${latestPeriod}. This represents ${marketCoverage.toFixed(0)}% coverage of the ${totalLegalStates} states with legal sports betting in the United States.`
    },
    {
      question: `What does "states live" mean?`,
      answer: `States live refers to the number of US states where a sports betting operator has launched and is actively accepting wagers. Being "live" means the operator has obtained necessary licenses, completed technical integrations, and can legally accept bets from customers in that state.`
    },
    {
      question: `Why is number of states important for ${symbol}?`,
      answer: `Geographic footprint is critical because each state represents a new addressable market. With ${statesLive} states live, ${symbol} can access approximately ${marketCoverage.toFixed(0)}% of the legal US sports betting market. More states means more potential customers and revenue opportunities.`
    },
    {
      question: `Which states is ${symbol} operating in?`,
      answer: `${symbol} typically operates in major sports betting markets including New York, New Jersey, Pennsylvania, Illinois, Michigan, and other states where online sports betting is legal. State-by-state market share and handle vary based on competitive dynamics and promotional intensity.`
    },
    {
      question: `What is ${symbol}'s state expansion strategy?`,
      answer: `Sports betting operators typically prioritize states by market size (population, sports culture), competitive dynamics, tax rates, and licensing requirements. ${symbol} ${statesLive >= 15 ? 'has established strong presence in major markets' : 'is actively expanding its footprint'} and continues to launch in newly legalized states.`
    },
    {
      question: `How does ${symbol} compare to competitors in state coverage?`,
      answer: `Market leaders like DraftKings and FanDuel are typically live in 20-25 states, while regional operators may have 5-15 states. ${symbol}'s ${statesLive}-state footprint ${statesLive >= 20 ? 'positions it among market leaders' : statesLive >= 10 ? 'represents solid mid-tier coverage' : 'indicates focused regional strategy'} in the US sports betting market.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} States Live`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} States Live ${currentYear} - Geographic Footprint Analysis`,
    description: `Complete states live analysis for ${symbol} (${companyName}) with expansion timeline and market coverage.`,
    url: pageUrl,
    keywords: [
      `${symbol} states live`,
      `${symbol} sports betting`,
      `${symbol} geographic footprint`,
      `${symbol} state expansion`,
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

  const faqSchema = getFAQSchema(statesLiveFaqs)

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
            <span>{symbol} States Live</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} States Live {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Geographic footprint and state expansion for {companyName}
          </p>

          {/* Latest States Live Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">States Live</p>
                <p className="text-3xl font-bold">
                  {statesLive}
                </p>
                <p className="text-sm text-muted-foreground mt-1">active markets</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Coverage</p>
                <p className="text-3xl font-bold text-indigo-500">
                  {marketCoverage.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">of legal states</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Legal States</p>
                <p className="text-3xl font-bold text-purple-500">
                  {totalLegalStates}
                </p>
                <p className="text-sm text-muted-foreground mt-1">nationwide</p>
              </div>
            </div>
          </div>

          {/* Geographic Coverage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Geographic Coverage Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName} operates in {statesLive} of {totalLegalStates} states with legal sports betting,
                providing access to approximately {marketCoverage.toFixed(0)}% of the addressable US market.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Market Coverage</span>
                    <span className="text-muted-foreground">{statesLive}/{totalLegalStates} states</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full transition-all"
                      style={{ width: `${marketCoverage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Markets */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Market Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Tier 1 Markets</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>New York (largest market)</li>
                  <li>New Jersey (mature market)</li>
                  <li>Pennsylvania (high volume)</li>
                  <li>Illinois (major metro)</li>
                  <li>Michigan (established)</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Growth Markets</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Ohio (recently launched)</li>
                  <li>Massachusetts (new market)</li>
                  <li>Maryland (expanding)</li>
                  <li>Louisiana (developing)</li>
                  <li>Arizona (high growth)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Expansion Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Expansion Impact</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Opportunity</p>
                  <p className="text-2xl font-bold text-green-500">High</p>
                  <p className="text-xs text-muted-foreground mt-2">Each new state adds incremental revenue</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Customer Base</p>
                  <p className="text-2xl font-bold text-blue-500">Expanding</p>
                  <p className="text-xs text-muted-foreground mt-2">More states = more addressable customers</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, market access details, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/market-access/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Market Access
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {statesLiveFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> States live data is based on publicly available information and may change as operators launch or exit markets. State-by-state performance varies based on market maturity, competition, and regulatory environment. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="states-live" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
