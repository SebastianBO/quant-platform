import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Renewable Energy Mix - Clean Energy Percentage`,
    description: `${symbol} renewable energy percentage analysis. View renewable vs fossil fuel mix, clean energy transition, sustainability goals, and green power portfolio for ${symbol}.`,
    keywords: [
      `${symbol} renewable percentage`,
      `${symbol} energy mix`,
      `${symbol} clean energy`,
      `${symbol} renewable portfolio`,
      `${symbol} fossil fuel`,
      `${symbol} sustainability`,
    ],
    openGraph: {
      title: `${symbol} Renewable Energy Mix | Clean Energy Analysis`,
      description: `Comprehensive ${symbol} renewable energy mix analysis with clean energy percentage and sustainability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/renewable-percentage/${ticker.toLowerCase()}`,
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

export default async function RenewablePercentagePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/renewable-percentage/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const renewableMixFaqs = [
    {
      question: `What is ${symbol}'s renewable energy percentage?`,
      answer: `Renewable energy percentage represents the proportion of ${symbol}'s total energy consumption or generation that comes from renewable sources (solar, wind, hydro, geothermal) versus fossil fuels (coal, natural gas, oil). A higher percentage indicates stronger commitment to clean energy transition.`
    },
    {
      question: `How does ${symbol}'s renewable mix compare to industry peers?`,
      answer: `Renewable energy mix varies significantly by industry and geography. Utilities typically disclose generation mix, while corporations report energy consumption mix. Compare ${symbol}'s renewable percentage to sector peers and track year-over-year progress toward sustainability targets.`
    },
    {
      question: `What is ${symbol}'s renewable energy target?`,
      answer: `Many companies set targets like "100% renewable by 2030" or "carbon neutral by 2050". ${symbol}'s renewable energy goals, timeline, and progress should be disclosed in annual sustainability reports, investor presentations, or ESG disclosures.`
    },
    {
      question: `Why does renewable percentage matter for investors?`,
      answer: `Renewable energy percentage indicates ${symbol}'s exposure to carbon pricing risk, energy cost stability, regulatory compliance, and ESG rating quality. Companies with higher renewable percentages often attract sustainable investment funds and may have lower long-term energy costs.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Renewable Mix`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Renewable Energy Mix - Clean Energy Percentage`,
      description: `Comprehensive renewable energy mix analysis for ${symbol} (${companyName}) including clean energy percentage and sustainability transition.`,
      url: pageUrl,
      keywords: [`${symbol} renewable percentage`, `${symbol} energy mix`, `${symbol} clean energy`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(renewableMixFaqs),
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
            <span>{symbol} Renewable Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Renewable Energy Mix</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Clean energy percentage & sustainability</p>

          {/* Renewable Mix Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-lime-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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

          {/* Understanding Renewable Mix */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Renewable Energy Mix</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Renewable Percentage Measures</h3>
                <p className="text-muted-foreground">
                  Renewable energy percentage represents the share of {symbol}'s total energy that comes from clean, renewable sources.
                  This metric tracks the company's transition away from fossil fuels toward solar, wind, hydroelectric, and other renewable energy sources.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with higher renewable percentages demonstrate environmental leadership and reduced exposure to carbon pricing and regulatory risk.
                  Increasing renewable mix often correlates with lower long-term energy costs, improved ESG ratings, and alignment with global climate commitments.
                </p>
              </div>
            </div>
          </section>

          {/* Energy Mix Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Energy Mix Components</h2>
            <div className="grid gap-4">
              {[
                { source: 'Solar Energy', desc: 'Percentage from solar power generation' },
                { source: 'Wind Energy', desc: 'Percentage from wind power generation' },
                { source: 'Hydroelectric', desc: 'Percentage from hydropower' },
                { source: 'Other Renewables', desc: 'Geothermal, biomass, and emerging sources' },
                { source: 'Fossil Fuels', desc: 'Remaining coal, natural gas, and oil percentage' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.source}</p>
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
              {renewableMixFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="renewable-percentage" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
