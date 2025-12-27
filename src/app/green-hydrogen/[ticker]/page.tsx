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

  return {
    title: `${symbol} Green Hydrogen - Clean Hydrogen Production`,
    description: `${symbol} green hydrogen analysis. View clean hydrogen production capacity, electrolyzer investments, hydrogen projects, renewable hydrogen, and clean fuel initiatives for ${symbol}.`,
    keywords: [
      `${symbol} green hydrogen`,
      `${symbol} hydrogen production`,
      `${symbol} clean hydrogen`,
      `${symbol} electrolyzer`,
      `${symbol} renewable fuel`,
      `${symbol} hydrogen energy`,
    ],
    openGraph: {
      title: `${symbol} Green Hydrogen | Clean Fuel Analysis`,
      description: `Comprehensive ${symbol} green hydrogen analysis with clean hydrogen production and renewable fuel metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/green-hydrogen/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function GreenHydrogenPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/green-hydrogen/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const hydrogenFaqs = [
    {
      question: `What is ${symbol}'s green hydrogen strategy?`,
      answer: `Green hydrogen is hydrogen produced using renewable energy through electrolysis, creating zero-carbon fuel. ${symbol} may be investing in green hydrogen production facilities, electrolyzer technology, hydrogen fuel cells, or hydrogen infrastructure as part of their clean energy transition.`
    },
    {
      question: `How is green hydrogen different from other hydrogen?`,
      answer: `Green hydrogen is produced using renewable electricity (solar, wind) via electrolysis, emitting no carbon. This differs from "grey hydrogen" (from natural gas) or "blue hydrogen" (from natural gas with carbon capture). ${symbol}'s focus on green hydrogen demonstrates commitment to truly clean energy.`
    },
    {
      question: `Why is ${symbol} investing in green hydrogen?`,
      answer: `Green hydrogen is considered critical for decarbonizing heavy industry, shipping, aviation, and long-haul transport where batteries are impractical. ${symbol}'s investments in green hydrogen position them for the emerging hydrogen economy and support ambitious net-zero targets.`
    },
    {
      question: `What are the key metrics for ${symbol}'s hydrogen business?`,
      answer: `Key metrics include electrolyzer capacity (MW), hydrogen production volume (tons per year), production cost ($/kg), project pipeline, partnerships, and government support (IRA tax credits). These indicate the scale and viability of ${symbol}'s green hydrogen initiatives.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Green Hydrogen`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Green Hydrogen - Clean Hydrogen Production`,
      description: `Comprehensive green hydrogen analysis for ${symbol} (${companyName}) including clean hydrogen production and renewable fuel initiatives.`,
      url: pageUrl,
      keywords: [`${symbol} green hydrogen`, `${symbol} hydrogen production`, `${symbol} clean fuel`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(hydrogenFaqs),
    getTableSchema({
      name: `${symbol} Green Hydrogen History`,
      description: `Historical Green Hydrogen data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Green Hydrogen', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Green Hydrogen</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Green Hydrogen</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Clean hydrogen production & renewable fuel</p>

          {/* Green Hydrogen Card */}
          <div className="bg-gradient-to-r from-teal-600/20 to-green-600/20 p-8 rounded-xl border border-teal-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-2xl font-bold">
                  ${marketCap >= 1e12 ? `${(marketCap / 1e12).toFixed(2)}T` : marketCap >= 1e9 ? `${(marketCap / 1e9).toFixed(2)}B` : `${(marketCap / 1e6).toFixed(2)}M`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Sector</p>
                <p className="text-xl font-bold">{companyFacts?.sector || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Understanding Green Hydrogen */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Green Hydrogen</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Green Hydrogen Measures</h3>
                <p className="text-muted-foreground">
                  Green hydrogen production capacity represents {symbol}'s ability to produce zero-carbon hydrogen fuel using renewable electricity.
                  This is typically measured in electrolyzer capacity (MW), annual production volume (tons), and cost efficiency ($/kg of hydrogen).
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies investing in green hydrogen are positioning for the future energy economy.
                  Green hydrogen is essential for decarbonizing heavy industry, shipping, and aviation, representing a multi-trillion dollar opportunity with strong government support through initiatives like the U.S. Inflation Reduction Act.
                </p>
              </div>
            </div>
          </section>

          {/* Green Hydrogen Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Green Hydrogen Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Electrolyzer Capacity (MW)', desc: 'Total capacity for hydrogen production' },
                { metric: 'Production Volume', desc: 'Annual hydrogen output in tons' },
                { metric: 'Cost Per Kilogram', desc: 'Production cost competitiveness' },
                { metric: 'Project Pipeline', desc: 'Planned hydrogen facilities and partnerships' },
                { metric: 'IRA Tax Credits', desc: 'Government incentives for clean hydrogen' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.metric}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete ESG & Renewable Energy Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sustainability metrics and energy analysis for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {hydrogenFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="green-hydrogen" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
