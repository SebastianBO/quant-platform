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
    title: `${symbol} IRA Tax Credits - Clean Energy Incentives`,
    description: `${symbol} IRA tax credits analysis. View Inflation Reduction Act incentives, clean energy tax benefits, renewable energy credits, investment tax credits, and production tax credits for ${symbol}.`,
    keywords: [
      `${symbol} IRA tax credits`,
      `${symbol} clean energy incentives`,
      `${symbol} renewable tax credits`,
      `${symbol} ITC`,
      `${symbol} PTC`,
      `${symbol} inflation reduction act`,
    ],
    openGraph: {
      title: `${symbol} IRA Tax Credits | Clean Energy Incentives`,
      description: `Comprehensive ${symbol} IRA tax credits analysis with clean energy incentives and renewable tax benefits.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/clean-energy-tax/${ticker.toLowerCase()}`,
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

export default async function CleanEnergyTaxPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/clean-energy-tax/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const taxCreditsFaqs = [
    {
      question: `What IRA tax credits does ${symbol} qualify for?`,
      answer: `The Inflation Reduction Act (IRA) provides substantial tax credits for clean energy projects. ${symbol} may benefit from: Investment Tax Credits (ITC) up to 30-50% for solar/wind/storage, Production Tax Credits (PTC) for renewable generation, Advanced Manufacturing Credits for clean tech production, and Clean Hydrogen Credits up to $3/kg. Eligibility depends on project type, location, and labor requirements.`
    },
    {
      question: `How much value do IRA tax credits provide ${symbol}?`,
      answer: `IRA tax credits can reduce clean energy project costs by 30-50%, significantly improving project economics. For ${symbol}, this could mean hundreds of millions to billions in value depending on their renewable energy pipeline. Credits are typically monetized through direct pay (government refund) or transfer to third parties. Check investor disclosures for quantified IRA benefits.`
    },
    {
      question: `What are bonus adders for IRA tax credits?`,
      answer: `${symbol} can increase base IRA tax credits through "adders": +10% for domestic content requirements, +10% for energy communities (coal areas), +10% for low-income communities. These can boost a 30% ITC to 50-60%. Meeting prevailing wage and apprenticeship requirements is crucial - projects without these receive only 1/5 of the credit value.`
    },
    {
      question: `How long will ${symbol} benefit from IRA tax credits?`,
      answer: `IRA tax credits are generally available through 2032 for most provisions, with some extending longer. Credits phase down as emissions targets are met. ${symbol}'s ability to capitalize depends on their project pipeline, construction timelines, and credit monetization strategy. The 10-year window creates urgency for clean energy investments.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} IRA Tax Credits`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} IRA Tax Credits - Clean Energy Incentives`,
      description: `Comprehensive IRA tax credits analysis for ${symbol} (${companyName}) including clean energy incentives and renewable tax benefits.`,
      url: pageUrl,
      keywords: [`${symbol} IRA tax credits`, `${symbol} clean energy incentives`, `${symbol} renewable tax credits`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(taxCreditsFaqs),
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
            <span>{symbol} IRA Tax Credits</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} IRA Tax Credits</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Clean energy incentives & renewable tax benefits</p>

          {/* IRA Tax Credits Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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

          {/* Understanding IRA Tax Credits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} IRA Tax Credits</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What IRA Tax Credits Measure</h3>
                <p className="text-muted-foreground">
                  The Inflation Reduction Act provides unprecedented tax incentives for clean energy investments.
                  {symbol} can benefit from Investment Tax Credits (ITC), Production Tax Credits (PTC), manufacturing credits, and hydrogen credits, potentially reducing project costs by 30-50% and creating billions in shareholder value.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  IRA tax credits dramatically improve clean energy project economics, accelerating {symbol}'s renewable energy investments.
                  Companies effectively utilizing these credits gain competitive advantages, improved project returns, and enhanced ESG credentials. The ability to monetize credits through direct pay or transfer adds financial flexibility.
                </p>
              </div>
            </div>
          </section>

          {/* IRA Tax Credits Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Major IRA Tax Credit Programs</h2>
            <div className="grid gap-4">
              {[
                { credit: 'Investment Tax Credit (ITC)', desc: '30% base credit for solar, wind, storage; up to 50% with adders' },
                { credit: 'Production Tax Credit (PTC)', desc: 'Per-kWh credit for renewable electricity generation' },
                { credit: 'Clean Hydrogen Credit (45V)', desc: 'Up to $3/kg for green hydrogen production' },
                { credit: 'Advanced Manufacturing (45X)', desc: 'Credits for solar panels, wind turbines, batteries' },
                { credit: 'Direct Pay & Transferability', desc: 'Monetize credits through government refund or sale' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.credit}</p>
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
              {taxCreditsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="clean-energy-tax" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
