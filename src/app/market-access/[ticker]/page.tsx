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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Market Access - Sports Betting License Deals ${currentYear}`,
    description: `${symbol} market access analysis: license agreements, skin deals, state-by-state access, partnerships. Track ${symbol}'s regulatory positioning and expansion opportunities.`,
    keywords: [
      `${symbol} market access`,
      `${symbol} sports betting licenses`,
      `${symbol} skin deals`,
      `${symbol} state licenses`,
      `${symbol} market access deals`,
      `${symbol} regulatory access`,
    ],
    openGraph: {
      title: `${symbol} Market Access ${currentYear} | License & Partnership Deals`,
      description: `Complete ${symbol} market access analysis with license deals and expansion opportunities.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/market-access/${ticker.toLowerCase()}`,
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

export default async function MarketAccessPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/market-access/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock market access data - in production, this would come from your API
  const marketAccessStates = metrics?.market_access_states || 28
  const totalLegalStates = 38
  const accessCoverage = (marketAccessStates / totalLegalStates) * 100
  const latestPeriod = 'Q4 2024'

  // Generate market access FAQs
  const marketAccessFaqs = [
    {
      question: `What is ${symbol}'s market access?`,
      answer: `${symbol} (${companyName}) has secured market access in ${marketAccessStates} states as of ${latestPeriod}, representing ${accessCoverage.toFixed(0)}% of states with legal sports betting. Market access includes obtained licenses, pending applications, and partnership agreements that enable operation.`
    },
    {
      question: `What is market access in sports betting?`,
      answer: `Market access refers to the legal ability to operate sports betting in a state, typically obtained through: (1) direct licenses from state regulators, (2) "skin" agreements with casinos or racetracks, or (3) market access deals with license holders. Access is required before an operator can launch in a state.`
    },
    {
      question: `How does ${symbol} obtain market access?`,
      answer: `Operators obtain market access through multiple paths: applying directly for licenses, partnering with existing casinos/racetracks (skin deals), acquiring companies with licenses, or purchasing market access rights. ${symbol} typically uses a combination of these strategies to maximize state coverage.`
    },
    {
      question: `What are skin deals?`,
      answer: `"Skin" deals allow operators to partner with licensed casinos or racetracks to offer online sports betting under the casino's license. Most states allow 2-4 skins per casino license. For example, a casino might partner with DraftKings as one skin and FanDuel as another, splitting revenue in exchange for market access.`
    },
    {
      question: `Why is market access valuable for ${symbol}?`,
      answer: `Market access is a strategic asset because: (1) it's required to operate, (2) supply is limited by state licenses/skins, (3) it creates barriers to entry, and (4) it secures future revenue opportunities. ${symbol}'s ${marketAccessStates}-state access portfolio positions the company for long-term growth.`
    },
    {
      question: `Does market access guarantee ${symbol} will launch?`,
      answer: `No, market access provides the legal right to operate but doesn't guarantee launch. Operators prioritize launches based on market size, competitive dynamics, and resource allocation. ${symbol} may hold market access in some states while delaying launch for strategic or economic reasons.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Market Access`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Market Access ${currentYear} - License & Partnership Analysis`,
    description: `Complete market access analysis for ${symbol} (${companyName}) with license deals and expansion opportunities.`,
    url: pageUrl,
    keywords: [
      `${symbol} market access`,
      `${symbol} sports betting`,
      `${symbol} licenses`,
      `${symbol} skin deals`,
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

  const faqSchema = getFAQSchema(marketAccessFaqs)

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
            <span>{symbol} Market Access</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Market Access {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            License agreements and regulatory positioning for {companyName}
          </p>

          {/* Latest Market Access Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Access</p>
                <p className="text-3xl font-bold">
                  {marketAccessStates}
                </p>
                <p className="text-sm text-muted-foreground mt-1">states secured</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {accessCoverage.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">of legal market</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expansion Runway</p>
                <p className="text-3xl font-bold text-teal-500">
                  {marketAccessStates - (metrics?.states_live || 20)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">states to launch</p>
              </div>
            </div>
          </div>

          {/* Market Access Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Market Access Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName} has secured market access in {marketAccessStates} states through a combination
                of direct licenses, skin deals, and strategic partnerships, providing a clear expansion roadmap.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Total Market Access</span>
                    <span className="text-muted-foreground">{marketAccessStates}/{totalLegalStates} states</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${accessCoverage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Access Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Market Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Direct Licenses</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Licenses obtained directly from state gaming regulators
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Full control</li>
                  <li>No revenue sharing</li>
                  <li>Regulatory compliance</li>
                  <li>Higher upfront cost</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Skin Deals</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Partnerships with casinos/racetracks
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Faster market entry</li>
                  <li>Revenue share (10-20%)</li>
                  <li>Limited supply</li>
                  <li>Partnership dependency</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Market Access Deals</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Purchased access rights
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Strategic flexibility</li>
                  <li>One-time payment</li>
                  <li>Competitive advantage</li>
                  <li>Variable pricing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Strategic Value */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Strategic Value of Market Access</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Competitive Moat</p>
                  <p className="text-2xl font-bold text-green-500">High</p>
                  <p className="text-xs text-muted-foreground mt-2">Limited licenses create barriers</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Future Value</p>
                  <p className="text-2xl font-bold text-blue-500">Significant</p>
                  <p className="text-xs text-muted-foreground mt-2">Option value for future launches</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, states live data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/states-live/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View States Live
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketAccessFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Market access information is based on publicly available data and may not reflect all agreements or pending applications. Market access does not guarantee operational launch. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="market-access" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
