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
    title: `${symbol} Solar Capacity - Renewable Energy Generation`,
    description: `${symbol} solar capacity analysis. View solar power generation capacity, solar farm installations, renewable energy projects, and clean energy expansion for ${symbol}.`,
    keywords: [
      `${symbol} solar capacity`,
      `${symbol} solar power`,
      `${symbol} renewable energy`,
      `${symbol} solar farms`,
      `${symbol} clean energy`,
      `${symbol} solar generation`,
    ],
    openGraph: {
      title: `${symbol} Solar Capacity | Renewable Energy Analysis`,
      description: `Comprehensive ${symbol} solar capacity analysis with solar power generation and renewable energy metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/solar-capacity/${ticker.toLowerCase()}`,
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

export default async function SolarCapacityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/solar-capacity/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const solarFaqs = [
    {
      question: `What is ${symbol}'s solar capacity?`,
      answer: `${symbol} is actively involved in solar energy generation and development. Solar capacity represents the total megawatt (MW) or gigawatt (GW) capacity of solar installations that ${symbol} owns, operates, or has under development.`
    },
    {
      question: `Does ${symbol} invest in solar energy?`,
      answer: `${symbol} may have investments in solar power generation through direct ownership of solar farms, power purchase agreements (PPAs), or renewable energy development projects. Check their latest sustainability reports and investor presentations for specific solar capacity data.`
    },
    {
      question: `How does ${symbol}'s solar capacity compare to competitors?`,
      answer: `Solar capacity varies significantly across companies. Utilities and energy companies typically report solar capacity in MW or GW. Compare ${symbol}'s renewable energy portfolio to industry peers to assess their commitment to clean energy transition.`
    },
    {
      question: `Why is solar capacity important for ${symbol}?`,
      answer: `Solar capacity is a key metric for evaluating ${symbol}'s renewable energy strategy, environmental commitments, and long-term sustainability. Increasing solar capacity can reduce carbon emissions, lower energy costs, and align with ESG (Environmental, Social, Governance) goals.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Solar Capacity`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Solar Capacity - Renewable Energy Generation`,
      description: `Comprehensive solar capacity analysis for ${symbol} (${companyName}) including solar power generation and renewable energy projects.`,
      url: pageUrl,
      keywords: [`${symbol} solar capacity`, `${symbol} solar power`, `${symbol} renewable energy`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(solarFaqs),
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
            <span>{symbol} Solar Capacity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Solar Capacity</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Solar power generation & renewable energy</p>

          {/* Solar Capacity Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
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

          {/* Understanding Solar Capacity */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Solar Capacity</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Solar Capacity Measures</h3>
                <p className="text-muted-foreground">
                  Solar capacity represents the maximum power output that {symbol}'s solar installations can generate under optimal conditions.
                  This is typically measured in megawatts (MW) or gigawatts (GW) and includes both operational and planned solar projects.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with significant solar capacity are positioning themselves for the clean energy transition.
                  Increasing solar investments can indicate forward-thinking management, ESG commitment, and potential for long-term cost savings through renewable energy generation.
                </p>
              </div>
            </div>
          </section>

          {/* Solar Metrics Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Solar Capacity Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Installed Capacity (MW/GW)', desc: 'Total operational solar generation capacity' },
                { metric: 'Under Development', desc: 'Solar projects in construction or planning phase' },
                { metric: 'Capacity Factor', desc: 'Actual vs. theoretical maximum generation' },
                { metric: 'PPA Agreements', desc: 'Long-term solar power purchase contracts' },
                { metric: 'Geographic Distribution', desc: 'Location and diversity of solar assets' },
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
              {solarFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="solar-capacity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
