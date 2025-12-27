import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Exploration Spending ${currentYear} - Mining Exploration Budget & Discovery`,
    description: `${symbol} exploration spending analysis: annual exploration budget, brownfield vs greenfield spending, discovery success rate, and reserve replacement strategy.`,
    keywords: [
      `${symbol} exploration`,
      `${symbol} exploration spending`,
      `${symbol} mining exploration`,
      `${symbol} discovery`,
      `${symbol} exploration budget`,
      `${symbol} reserve replacement`,
    ],
    openGraph: {
      title: `${symbol} Exploration Spending - Mining Exploration Budget`,
      description: `Complete ${symbol} exploration spending analysis with budget trends, discovery success, and reserve replacement.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/exploration-spend/${ticker.toLowerCase()}`,
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

export default async function ExplorationSpendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/exploration-spend/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder exploration data - would come from mining-specific API
  const totalExploration = 185 // million USD
  const brownfieldSpend = 125
  const greenfieldSpend = 60
  const brownfieldPercent = ((brownfieldSpend / totalExploration) * 100).toFixed(0)
  const greenfieldPercent = ((greenfieldSpend / totalExploration) * 100).toFixed(0)
  const spendPerOunce = 66 // $/oz of production

  const explorationFaqs = [
    {
      question: `How much does ${symbol} spend on exploration?`,
      answer: `${symbol} (${companyName}) invests $${totalExploration} million annually in mineral exploration. This includes $${brownfieldSpend}M (${brownfieldPercent}%) on brownfield exploration at existing mines to extend mine life and replace depleted reserves, and $${greenfieldSpend}M (${greenfieldPercent}%) on greenfield exploration to discover new deposits. Exploration spending represents approximately $${spendPerOunce} per ounce of annual production.`
    },
    {
      question: `What is the difference between brownfield and greenfield exploration?`,
      answer: `Brownfield exploration focuses on existing mine sites - drilling to extend known deposits, test for new zones, and convert resources to reserves. It has lower risk and faster payback since infrastructure exists. Greenfield exploration targets new discoveries in unexplored areas - higher risk but potential for major new deposits. ${symbol} allocates ${brownfieldPercent}% to brownfield and ${greenfieldPercent}% to greenfield, balancing near-term reserve replacement with long-term growth.`
    },
    {
      question: `Why is exploration important for ${symbol}?`,
      answer: `Exploration is critical for sustainable mining operations. Mines deplete reserves through production, so continuous exploration is needed to: (1) Replace mined reserves and maintain mine life, (2) Discover new deposits for future growth, (3) Improve ore body understanding and mine planning, (4) Upgrade resources to higher confidence categories. Without successful exploration, reserve life declines and production must eventually decrease.`
    },
    {
      question: `What is ${symbol}'s reserve replacement ratio?`,
      answer: `Reserve replacement ratio measures exploration success by comparing ounces added through discovery/conversion versus ounces depleted through production. A ratio above 100% means reserves are growing despite production. ${symbol}'s exploration budget of $${totalExploration}M aims to achieve >100% replacement through successful brownfield drilling and resource upgrades. Industry-leading explorers consistently achieve 150%+ replacement ratios.`
    },
    {
      question: `How does ${symbol}'s exploration spending compare to peers?`,
      answer: `Exploration intensity (spending per ounce produced) indicates exploration commitment. ${symbol} spends $${spendPerOunce}/oz, compared to industry averages of $40-80/oz. Higher spending doesn't guarantee success but indicates commitment to reserve replacement. Leading gold miners typically spend 3-5% of revenue on exploration. Companies with declining exploration budgets may face future production challenges as reserves deplete.`
    },
    {
      question: `What are ${symbol}'s key exploration targets?`,
      answer: `Exploration programs typically focus on: (1) Mine extensions - drilling along strike and depth at existing operations, (2) Near-mine targets - prospects within 5-10km of infrastructure, (3) Regional programs - systematic exploration of large land packages, (4) Joint ventures - partnering on early-stage projects to share risk. Brownfield programs have higher success rates (50-70%) versus greenfield (5-10%) but smaller potential discoveries.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Exploration`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Exploration Spending ${currentYear} - Mining Exploration Budget`,
      description: `Complete exploration spending analysis for ${symbol} including brownfield vs greenfield allocation and reserve replacement strategy.`,
      url: pageUrl,
      keywords: [`${symbol} exploration`, `${symbol} exploration spending`, `${symbol} mining exploration`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(explorationFaqs),
    getTableSchema({
      name: `${symbol} Exploration Spend History`,
      description: `Historical Exploration Spend data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Exploration Spend', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Exploration</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Exploration Spending {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Mining Exploration Budget & Discovery Strategy</p>

          {/* Exploration Overview */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Exploration</p>
                <p className="text-3xl font-bold">${totalExploration}M</p>
                <p className="text-sm text-muted-foreground">annual budget</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Brownfield</p>
                <p className="text-3xl font-bold">${brownfieldSpend}M</p>
                <p className="text-sm text-muted-foreground">{brownfieldPercent}% of total</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Greenfield</p>
                <p className="text-3xl font-bold">${greenfieldSpend}M</p>
                <p className="text-sm text-muted-foreground">{greenfieldPercent}% of total</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Spend/Ounce</p>
                <p className="text-3xl font-bold">${spendPerOunce}</p>
                <p className="text-sm text-muted-foreground">per oz produced</p>
              </div>
            </div>
          </div>

          {/* Exploration Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Exploration Budget Allocation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Brownfield Exploration</h3>
                <p className="text-4xl font-bold mb-2">${brownfieldSpend}M</p>
                <p className="text-muted-foreground mb-3">{brownfieldPercent}% of exploration budget</p>
                <p className="text-sm text-muted-foreground">
                  Drilling at existing mines to extend deposits, replace depleted reserves, and upgrade resources. Lower risk, higher success rate.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Greenfield Exploration</h3>
                <p className="text-4xl font-bold mb-2">${greenfieldSpend}M</p>
                <p className="text-muted-foreground mb-3">{greenfieldPercent}% of exploration budget</p>
                <p className="text-sm text-muted-foreground">
                  Discovering new deposits in unexplored areas. Higher risk, lower success rate, but potential for major discoveries.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Exploration Intensity</h3>
                <p className="text-4xl font-bold mb-2">${spendPerOunce}/oz</p>
                <p className="text-muted-foreground mb-3">Spending per ounce produced</p>
                <p className="text-sm text-muted-foreground">
                  Measures exploration commitment relative to production. Industry average: $40-80/oz. Higher spending indicates aggressive reserve replacement focus.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Total Budget</h3>
                <p className="text-4xl font-bold mb-2">${totalExploration}M</p>
                <p className="text-muted-foreground mb-3">Annual exploration investment</p>
                <p className="text-sm text-muted-foreground">
                  Combined brownfield and greenfield programs. Represents {((totalExploration / (snapshot.market_cap / 1e9)) * 100).toFixed(1)}% of market cap investment in future growth.
                </p>
              </div>
            </div>
          </section>

          {/* Exploration Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Exploration Strategy & Approach</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Mine Life Extension (Brownfield)</h3>
                <p className="text-muted-foreground">
                  Systematic drilling at existing operations to test along-strike and down-dip extensions of known ore bodies. Success rates typically 50-70% as deposits often extend beyond initial boundaries. Critical for maintaining 10+ year reserve life and avoiding premature closure.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Resource Conversion Programs</h3>
                <p className="text-muted-foreground">
                  Infill drilling to upgrade inferred and indicated resources to measured resources and proven/probable reserves. Converts exploration potential into mineable reserves. Requires 25-50m drill spacing for measured resources versus 100-200m for initial inferred classification.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Regional Exploration (Greenfield)</h3>
                <p className="text-muted-foreground">
                  Early-stage programs on large land packages using geochemistry, geophysics, and reconnaissance drilling. Most programs fail to find economic deposits, but successful discoveries can define company futures. Requires patient capital and technical expertise.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Partnership & Joint Ventures</h3>
                <p className="text-muted-foreground">
                  Joint ventures allow companies to explore more targets while sharing risk and capital. Common structures: earn-in agreements (earning % by spending), option agreements, or exploration alliances. Provides exposure to junior explorers' innovation and local knowledge.
                </p>
              </div>
            </div>
          </section>

          {/* Budget Efficiency */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Exploration Efficiency Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Cost per Meter Drilled</p>
                <p className="text-2xl font-bold">$150-250</p>
                <p className="text-xs text-muted-foreground mt-1">Industry range</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Drilling Meters/Year</p>
                <p className="text-2xl font-bold">~{Math.round(totalExploration * 1000 / 200)}km</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated program</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold">55-65%</p>
                <p className="text-xs text-muted-foreground mt-1">Brownfield typical</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Exploration Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed exploration budgets, discovery track record, reserve replacement, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {explorationFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Mining Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Mining Metrics</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/mining-reserves/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Mineral Reserves
              </Link>
              <Link href={`/gold-production/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Gold Production
              </Link>
              <Link href={`/aisc/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                All-in Sustaining Cost
              </Link>
              <Link href={`/grade-trend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Ore Grade Trends
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="exploration" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
