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
    title: `${symbol} Carbon Credits - Carbon Offset & Trading`,
    description: `${symbol} carbon credits analysis. View carbon offset programs, emissions trading, voluntary carbon markets, carbon neutrality goals, and environmental credits for ${symbol}.`,
    keywords: [
      `${symbol} carbon credits`,
      `${symbol} carbon offset`,
      `${symbol} emissions trading`,
      `${symbol} carbon neutral`,
      `${symbol} voluntary carbon`,
      `${symbol} carbon market`,
    ],
    openGraph: {
      title: `${symbol} Carbon Credits | Carbon Offset Analysis`,
      description: `Comprehensive ${symbol} carbon credits analysis with emissions trading and carbon offset programs.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/carbon-credits/${ticker.toLowerCase()}`,
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

export default async function CarbonCreditsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/carbon-credits/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.marketCap || 0

  const carbonCreditsFaqs = [
    {
      question: `What are ${symbol}'s carbon credits?`,
      answer: `Carbon credits represent certificates that ${symbol} can purchase to offset one ton of CO2 emissions. Companies buy credits from verified carbon offset projects (reforestation, renewable energy, carbon capture) to compensate for emissions they cannot eliminate, working toward carbon neutrality goals.`
    },
    {
      question: `Does ${symbol} buy or sell carbon credits?`,
      answer: `${symbol} may participate in carbon markets as a buyer (purchasing offsets for emissions reduction) or seller (generating credits from renewable projects). Some companies also trade carbon credits in compliance markets (EU ETS, California Cap-and-Trade) or voluntary carbon markets (VCM).`
    },
    {
      question: `How do carbon credits impact ${symbol}'s financials?`,
      answer: `Carbon credits can represent both costs (purchasing offsets) and revenue opportunities (selling credits from renewable projects). As carbon pricing expands globally, credits become increasingly material to financial performance, with potential impacts on operating expenses, revenue, and ESG ratings.`
    },
    {
      question: `What is ${symbol}'s carbon neutrality strategy?`,
      answer: `Carbon neutrality involves reducing direct emissions and offsetting remaining emissions with carbon credits. ${symbol}'s strategy typically includes: 1) Emissions reduction (renewable energy, efficiency), 2) Carbon credit purchases for residual emissions, and 3) Long-term net-zero commitments. Check sustainability reports for specific targets and timelines.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Carbon Credits`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Carbon Credits - Carbon Offset & Trading`,
      description: `Comprehensive carbon credits analysis for ${symbol} (${companyName}) including carbon offset programs and emissions trading.`,
      url: pageUrl,
      keywords: [`${symbol} carbon credits`, `${symbol} carbon offset`, `${symbol} emissions trading`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(carbonCreditsFaqs),
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
            <span>{symbol} Carbon Credits</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Carbon Credits</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Carbon offset programs & emissions trading</p>

          {/* Carbon Credits Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
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

          {/* Understanding Carbon Credits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Carbon Credits</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What Carbon Credits Measure</h3>
                <p className="text-muted-foreground">
                  Carbon credits represent verified emission reductions or removals, where one credit equals one ton of CO2 equivalent.
                  {symbol} may purchase credits to offset emissions or generate credits through renewable energy projects, reforestation, or carbon capture initiatives.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-muted-foreground">
                  Companies with active carbon credit strategies demonstrate climate leadership and regulatory preparedness.
                  As carbon pricing expands globally, effective carbon management through credits can reduce compliance costs, create revenue opportunities, and strengthen ESG profiles.
                </p>
              </div>
            </div>
          </section>

          {/* Carbon Credits Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Carbon Credits Metrics</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Credits Purchased', desc: 'Annual volume of carbon offsets purchased (tons CO2e)' },
                { metric: 'Credits Generated', desc: 'Carbon credits created from company projects' },
                { metric: 'Market Participation', desc: 'Compliance vs. voluntary carbon market activity' },
                { metric: 'Credit Quality', desc: 'Verification standards (Gold Standard, VCS, etc.)' },
                { metric: 'Neutrality Timeline', desc: 'Target dates for carbon neutrality or net-zero' },
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
              {carbonCreditsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="carbon-credits" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
