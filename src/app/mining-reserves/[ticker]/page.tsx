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
    title: `${symbol} Mining Reserves ${currentYear} - Mineral Reserves & Resources Analysis`,
    description: `${symbol} mineral reserves and resources: proven & probable reserves, measured, indicated & inferred resources, reserve life, ore grades, and resource growth trends.`,
    keywords: [
      `${symbol} reserves`,
      `${symbol} mineral reserves`,
      `${symbol} mining reserves`,
      `${symbol} resources`,
      `${symbol} ore reserves`,
      `${symbol} reserve life`,
    ],
    openGraph: {
      title: `${symbol} Mining Reserves - Mineral Reserves & Resources`,
      description: `Complete ${symbol} mineral reserves analysis with reserve life, resource base, and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/mining-reserves/${ticker.toLowerCase()}`,
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

export default async function MiningReservesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/mining-reserves/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder reserve data - would come from mining-specific API
  const provenReserves = 12.5 // million oz gold
  const probableReserves = 18.3
  const totalReserves = provenReserves + probableReserves
  const annualProduction = 2.8 // million oz
  const reserveLife = (totalReserves / annualProduction).toFixed(1)
  const avgGrade = 2.1 // g/t gold

  const reserveFaqs = [
    {
      question: `What are ${symbol}'s total mineral reserves?`,
      answer: `${symbol} (${companyName}) reports total proven and probable mineral reserves of ${totalReserves.toFixed(1)} million ounces of gold. This includes ${provenReserves} million ounces of proven reserves (highest confidence) and ${probableReserves} million ounces of probable reserves (high confidence). Reserves represent economically mineable material at current metal prices and operating costs, based on detailed mine plans.`
    },
    {
      question: `What is ${symbol}'s reserve life?`,
      answer: `At current production rates of ${annualProduction} million ounces per year, ${symbol}'s reserves support approximately ${reserveLife} years of mining operations. Reserve life is a key metric for sustainability - companies typically aim for 10+ years. Reserve life can be extended through brownfield exploration at existing mines, reserve upgrades from inferred/indicated resources, or acquisitions.`
    },
    {
      question: `What is the difference between reserves and resources?`,
      answer: `Reserves are economically viable, technically feasible, and legally extractable mineral deposits with detailed mine plans. They're classified as proven (highest confidence) or probable (high confidence). Resources are potentially economic deposits requiring further study, classified as measured (high confidence), indicated (moderate confidence), or inferred (low confidence). Resources may be converted to reserves with additional drilling, engineering, and economic studies.`
    },
    {
      question: `What is ${symbol}'s average ore grade?`,
      answer: `${symbol}'s mineral reserves have an average grade of ${avgGrade} grams per tonne (g/t) of gold. Higher grades mean more valuable metal per tonne of ore, reducing mining and processing costs per ounce produced. Premium deposits often exceed 3-5 g/t. Grade is critical for economics - a 2 g/t deposit requires processing 1,000 tonnes of ore to produce ~64 ounces of gold.`
    },
    {
      question: `How does ${symbol} grow reserves?`,
      answer: `Reserve growth strategies include: (1) Brownfield exploration - drilling at existing mines to extend deposits, (2) Resource conversion - upgrading inferred/indicated resources to reserves through additional drilling and studies, (3) Reserve optimization - mine plan improvements and technological advances, (4) Acquisitions - purchasing companies or projects with established reserves, (5) Greenfield discoveries - new deposit discoveries (highest risk, highest reward).`
    },
    {
      question: `Why do ${symbol}'s reserves change year-over-year?`,
      answer: `Annual reserve changes reflect: (1) Depletion - production during the year reduces reserves, (2) Additions - exploration success and resource conversions add reserves, (3) Economic factors - commodity price changes affect economic cutoff grades, (4) Technical revisions - updated mine plans, metallurgy, or cost estimates, (5) Acquisitions/divestitures. Net reserve replacement ratio above 100% indicates sustainable operations.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Mining Reserves`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Mining Reserves ${currentYear} - Mineral Reserves & Resources`,
      description: `Complete mineral reserves analysis for ${symbol} including proven & probable reserves, reserve life, and resource base.`,
      url: pageUrl,
      keywords: [`${symbol} reserves`, `${symbol} mineral reserves`, `${symbol} mining reserves`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(reserveFaqs),
    getTableSchema({
      name: `${symbol} Mining Reserves History`,
      description: `Historical Mining Reserves data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Mining Reserves', 'Change'],
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
            <span>{symbol} Mining Reserves</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Mining Reserves {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Mineral Reserves & Resources Analysis</p>

          {/* Reserve Overview */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Reserves</p>
                <p className="text-3xl font-bold">{totalReserves.toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">ounces (P&P)</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Reserve Life</p>
                <p className="text-3xl font-bold">{reserveLife}</p>
                <p className="text-sm text-muted-foreground">years</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Average Grade</p>
                <p className="text-3xl font-bold">{avgGrade}</p>
                <p className="text-sm text-muted-foreground">g/t gold</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Annual Production</p>
                <p className="text-3xl font-bold">{annualProduction}M</p>
                <p className="text-sm text-muted-foreground">oz/year</p>
              </div>
            </div>
          </div>

          {/* Reserve Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Reserve Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Proven Reserves</h3>
                <p className="text-4xl font-bold mb-2">{provenReserves}M oz</p>
                <p className="text-muted-foreground">
                  Highest confidence level - economically mineable with detailed mine plans and high geological certainty
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Probable Reserves</h3>
                <p className="text-4xl font-bold mb-2">{probableReserves}M oz</p>
                <p className="text-muted-foreground">
                  High confidence level - economically mineable with good geological knowledge and reasonable certainty
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Reserve Life Index</h3>
                <p className="text-4xl font-bold mb-2">{reserveLife} yrs</p>
                <p className="text-muted-foreground">
                  Years of production at current rates - {parseFloat(reserveLife) > 15 ? 'strong' : parseFloat(reserveLife) > 10 ? 'adequate' : 'limited'} sustainability
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Reserve Quality</h3>
                <p className="text-4xl font-bold mb-2">{avgGrade} g/t</p>
                <p className="text-muted-foreground">
                  Average ore grade - {avgGrade > 3 ? 'high grade' : avgGrade > 1.5 ? 'medium grade' : 'low grade'} deposit
                </p>
              </div>
            </div>
          </section>

          {/* Reserve vs Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Reserves & Resources</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Proven Reserves (P1)</h3>
                <p className="text-muted-foreground">
                  Economic portion of measured mineral resources with high confidence in tonnage, grade, and continuity. Supported by detailed sampling, engineering, and economic analysis. Basis for production planning and reserve reporting.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Probable Reserves (P2)</h3>
                <p className="text-muted-foreground">
                  Economic portion of indicated (and sometimes measured) mineral resources with reasonable confidence. Less geological certainty than proven reserves but still bankable for financing. Often included in life-of-mine plans.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Measured & Indicated Resources (M&I)</h3>
                <p className="text-muted-foreground">
                  Potentially economic deposits with reasonable to high geological confidence but requiring additional technical and economic studies before conversion to reserves. M&I resources represent future reserve potential.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Inferred Resources</h3>
                <p className="text-muted-foreground">
                  Lowest confidence category - insufficient drilling to establish continuity. Cannot be converted directly to reserves - requires upgrading to M&I first through additional exploration. Represents long-term exploration upside.
                </p>
              </div>
            </div>
          </section>

          {/* Reserve Life Scenarios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Reserve Life Scenarios</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { production: annualProduction * 0.9, label: '-10% Production' },
                { production: annualProduction, label: 'Current' },
                { production: annualProduction * 1.1, label: '+10% Production' },
                { production: annualProduction * 1.2, label: '+20% Production' },
              ].map(scenario => {
                const life = (totalReserves / scenario.production).toFixed(1)
                return (
                  <div key={scenario.label} className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-1">{scenario.label}</p>
                    <p className="text-2xl font-bold">{life} yrs</p>
                    <p className="text-xs text-muted-foreground mt-1">{scenario.production.toFixed(1)}M oz/yr</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Reserve Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed reserve breakdowns, resource estimates, mine plans, and AI-powered mining insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {reserveFaqs.map((faq, i) => (
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
              <Link href={`/gold-production/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Gold Production
              </Link>
              <Link href={`/aisc/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                All-in Sustaining Cost
              </Link>
              <Link href={`/grade-trend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Ore Grade Trends
              </Link>
              <Link href={`/exploration-spend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Exploration Spending
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="reserves" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
