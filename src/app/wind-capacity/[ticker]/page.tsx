import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Wind Capacity - Wind Power Generation`,
    description: `${symbol} wind capacity analysis. View wind power generation capacity, wind farm installations, turbine count, renewable energy projects, and clean energy expansion for ${symbol}.`,
    keywords: [
      `${symbol} wind capacity`,
      `${symbol} wind power`,
      `${symbol} renewable energy`,
      `${symbol} wind farms`,
      `${symbol} wind turbines`,
      `${symbol} clean energy`,
    ],
    openGraph: {
      title: `${symbol} Wind Capacity | Renewable Energy Analysis`,
      description: `Comprehensive ${symbol} wind capacity analysis with wind power generation and renewable energy metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/wind-capacity/${ticker.toLowerCase()}`,
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

export default async function WindCapacityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/wind-capacity/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const windFaqs = [
    {
      question: `What is ${symbol}'s wind capacity?`,
      answer: `${symbol} is actively involved in wind energy generation and development. Wind capacity represents the total megawatt (MW) or gigawatt (GW) capacity of wind installations that ${symbol} owns, operates, or has under development, including both onshore and offshore wind farms.`
    },
    {
      question: `Does ${symbol} invest in wind energy?`,
      answer: `${symbol} may have investments in wind power generation through direct ownership of wind farms, offshore wind projects, power purchase agreements (PPAs), or renewable energy development. Check their latest sustainability reports and investor presentations for specific wind capacity data.`
    },
    {
      question: `What is the difference between onshore and offshore wind capacity?`,
      answer: `Onshore wind farms are located on land and are typically less expensive to build and maintain. Offshore wind farms are located in bodies of water and generally have higher capacity factors due to stronger, more consistent winds, but require higher capital investment. ${symbol}'s portfolio may include both types.`
    },
    {
      question: `Why is wind capacity important for ${symbol}?`,
      answer: `Wind capacity is a key metric for evaluating ${symbol}'s renewable energy strategy, environmental commitments, and long-term sustainability. Increasing wind capacity can significantly reduce carbon emissions, provide stable long-term energy costs, and align with ESG (Environmental, Social, Governance) goals.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Wind Capacity`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Wind Capacity - Wind Power Generation`,
      description: `Comprehensive wind capacity analysis for ${symbol} (${companyName}) including wind power generation and renewable energy projects.`,
      url: pageUrl,
      keywords: [`${symbol} wind capacity`, `${symbol} wind power`, `${symbol} renewable energy`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(windFaqs),
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
            <span>{symbol} Wind Capacity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Wind Capacity</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Wind power generation & renewable energy</p>

          {/* Wind Capacity Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
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

          {/* Understanding Wind Capacity */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Wind Capacity</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Wind Capacity Measures</h3>
                <p className="text-muted-foreground">
                  Wind capacity represents the maximum power output that {symbol}'s wind installations can generate under optimal wind conditions.
                  This is typically measured in megawatts (MW) or gigawatts (GW) and includes both onshore and offshore wind projects, operational and planned.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with significant wind capacity are leading the renewable energy transition.
                  Wind energy investments demonstrate long-term strategic thinking, commitment to carbon reduction, and potential for stable energy costs through clean power generation.
                </p>
              </div>
            </div>
          </section>

          {/* Wind Metrics Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Wind Capacity Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Installed Capacity (MW/GW)', desc: 'Total operational wind generation capacity' },
                { metric: 'Onshore vs. Offshore', desc: 'Distribution between land-based and ocean wind farms' },
                { metric: 'Turbine Count', desc: 'Number of wind turbines in operation' },
                { metric: 'Capacity Factor', desc: 'Actual vs. theoretical maximum generation' },
                { metric: 'Geographic Distribution', desc: 'Location and diversity of wind assets' },
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
              {windFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="wind-capacity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
