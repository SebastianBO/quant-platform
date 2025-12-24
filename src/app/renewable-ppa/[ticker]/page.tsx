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
    title: `${symbol} Renewable PPA Contracts - Power Purchase Agreements`,
    description: `${symbol} renewable energy PPA analysis. View power purchase agreements, long-term renewable energy contracts, clean energy commitments, and corporate sustainability for ${symbol}.`,
    keywords: [
      `${symbol} PPA`,
      `${symbol} power purchase agreements`,
      `${symbol} renewable energy contracts`,
      `${symbol} clean energy`,
      `${symbol} corporate sustainability`,
      `${symbol} green energy`,
    ],
    openGraph: {
      title: `${symbol} Renewable PPA Contracts | Clean Energy Analysis`,
      description: `Comprehensive ${symbol} PPA analysis with power purchase agreements and renewable energy commitments.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/renewable-ppa/${ticker.toLowerCase()}`,
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

export default async function RenewablePPAPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/renewable-ppa/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const ppaFaqs = [
    {
      question: `What are ${symbol}'s renewable PPA contracts?`,
      answer: `Power Purchase Agreements (PPAs) are long-term contracts where ${symbol} agrees to purchase renewable energy from solar, wind, or other clean energy projects. These agreements lock in predictable energy costs while supporting renewable energy development.`
    },
    {
      question: `Why does ${symbol} use renewable PPAs?`,
      answer: `${symbol} may use renewable PPAs to secure stable long-term energy pricing, reduce carbon emissions, meet corporate sustainability goals, and demonstrate environmental leadership. PPAs can provide cost certainty and hedge against energy price volatility.`
    },
    {
      question: `How do PPAs impact ${symbol}'s financials?`,
      answer: `Renewable PPAs can provide predictable energy costs over 10-25 year terms, potentially reducing operational expenses and protecting against fossil fuel price fluctuations. They also contribute to ESG ratings and can attract sustainability-focused investors.`
    },
    {
      question: `What types of renewable energy do ${symbol}'s PPAs cover?`,
      answer: `Corporate PPAs typically cover solar, wind, hydroelectric, or other renewable energy sources. ${symbol}'s specific PPA portfolio depends on their energy needs, geographic locations, and sustainability strategy. Check their sustainability reports for detailed breakdowns.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Renewable PPA`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Renewable PPA Contracts - Power Purchase Agreements`,
      description: `Comprehensive PPA analysis for ${symbol} (${companyName}) including renewable energy contracts and sustainability commitments.`,
      url: pageUrl,
      keywords: [`${symbol} PPA`, `${symbol} renewable energy`, `${symbol} power purchase agreements`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ppaFaqs),
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
            <span>{symbol} Renewable PPA</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Renewable PPA Contracts</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Power purchase agreements & clean energy</p>

          {/* PPA Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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

          {/* Understanding PPAs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Renewable PPAs</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What PPAs Measure</h3>
                <p className="text-muted-foreground">
                  Power Purchase Agreements represent {symbol}'s commitment to purchasing renewable energy over extended periods (typically 10-25 years).
                  These contracts specify the volume of energy, pricing terms, and renewable sources, providing both price certainty and environmental benefits.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with substantial PPA commitments demonstrate strong ESG credentials and long-term sustainability planning.
                  PPAs can reduce energy cost volatility, improve carbon footprint, and signal management's commitment to environmental responsibility.
                </p>
              </div>
            </div>
          </section>

          {/* PPA Metrics Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">PPA Contract Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Total Contracted Capacity', desc: 'MW or GW of renewable energy under contract' },
                { metric: 'Contract Duration', desc: 'Length of PPA agreements (typically 10-25 years)' },
                { metric: 'Energy Source Mix', desc: 'Solar, wind, hydro, or other renewable sources' },
                { metric: 'Cost Savings', desc: 'Estimated savings vs. traditional energy sources' },
                { metric: 'Carbon Reduction', desc: 'Tons of CO2 emissions avoided annually' },
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
              {ppaFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="renewable-ppa" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
