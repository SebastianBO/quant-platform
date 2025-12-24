import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Battery Storage - Energy Storage Systems`,
    description: `${symbol} battery storage analysis. View energy storage capacity, battery installations, grid-scale storage, BESS projects, and renewable energy integration for ${symbol}.`,
    keywords: [
      `${symbol} battery storage`,
      `${symbol} energy storage`,
      `${symbol} BESS`,
      `${symbol} grid storage`,
      `${symbol} battery capacity`,
      `${symbol} renewable storage`,
    ],
    openGraph: {
      title: `${symbol} Battery Storage | Energy Storage Analysis`,
      description: `Comprehensive ${symbol} battery storage analysis with energy storage systems and grid-scale BESS metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/battery-storage/${ticker.toLowerCase()}`,
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

export default async function BatteryStoragePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/battery-storage/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const storageFaqs = [
    {
      question: `What is ${symbol}'s battery storage capacity?`,
      answer: `Battery energy storage systems (BESS) represent ${symbol}'s capacity to store renewable energy for later use. This is measured in megawatt-hours (MWh) or gigawatt-hours (GWh) and includes grid-scale batteries, commercial storage, and energy management systems.`
    },
    {
      question: `Why is battery storage important for ${symbol}?`,
      answer: `Battery storage is critical for integrating renewable energy into the grid. It stores excess solar and wind power for use when generation is low, provides grid stability, and can generate revenue through arbitrage and ancillary services. For ${symbol}, this represents both cost savings and revenue opportunities.`
    },
    {
      question: `How does ${symbol} use battery storage?`,
      answer: `${symbol} may deploy battery storage for peak shaving (reducing demand charges), renewable firming (ensuring consistent power output), frequency regulation, backup power, or energy arbitrage (storing cheap energy to sell during peak pricing). Applications vary by industry and strategy.`
    },
    {
      question: `What are the economics of ${symbol}'s battery storage?`,
      answer: `Battery storage economics depend on capacity (MWh), power rating (MW), round-trip efficiency, degradation rate, and revenue streams. With declining battery costs and IRA tax credits providing up to 30-50% cost reduction, storage projects are increasingly profitable. Check ${symbol}'s financial disclosures for project-level economics.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Battery Storage`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Battery Storage - Energy Storage Systems`,
      description: `Comprehensive battery storage analysis for ${symbol} (${companyName}) including BESS capacity and energy storage projects.`,
      url: pageUrl,
      keywords: [`${symbol} battery storage`, `${symbol} energy storage`, `${symbol} BESS`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(storageFaqs),
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
            <span>{symbol} Battery Storage</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Battery Storage</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Energy storage systems & grid-scale BESS</p>

          {/* Battery Storage Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
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

          {/* Understanding Battery Storage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Battery Storage</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Battery Storage Measures</h3>
                <p className="text-muted-foreground">
                  Battery storage capacity represents {symbol}'s ability to store electrical energy for later use.
                  This includes the total energy capacity (MWh/GWh), power output (MW/GW), duration (hours), and efficiency of battery systems deployed or under development.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with significant battery storage assets are positioned for the renewable energy transition.
                  Storage enables reliable renewable power, creates new revenue streams, and benefits from substantial government incentives including IRA investment tax credits.
                </p>
              </div>
            </div>
          </section>

          {/* Battery Storage Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Battery Storage Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Total Capacity (MWh/GWh)', desc: 'Energy storage capacity deployed or planned' },
                { metric: 'Power Rating (MW)', desc: 'Maximum instantaneous power output' },
                { metric: 'Duration (Hours)', desc: 'How long battery can discharge at full power' },
                { metric: 'Round-Trip Efficiency', desc: 'Energy retained through charge/discharge cycle' },
                { metric: 'Revenue Streams', desc: 'Arbitrage, ancillary services, capacity payments' },
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
              {storageFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="battery-storage" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
