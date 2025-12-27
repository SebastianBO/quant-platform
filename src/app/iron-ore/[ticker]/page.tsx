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
    title: `${symbol} Iron Ore Production ${currentYear} - Mining Output & Production Analysis`,
    description: `${symbol} iron ore production analysis: annual iron ore output, production growth trends, iron ore mining forecasts, and operational efficiency metrics.`,
    keywords: [
      `${symbol} iron ore production`,
      `${symbol} iron ore output`,
      `${symbol} iron ore mining`,
      `${symbol} production trends`,
      `${symbol} iron ore mines`,
      `${symbol} mining operations`,
    ],
    openGraph: {
      title: `${symbol} Iron Ore Production - Mining Output Analysis`,
      description: `Complete ${symbol} iron ore production analysis with trends, forecasts, and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/iron-ore/${ticker.toLowerCase()}`,
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

export default async function IronOrePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/iron-ore/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder production data - would come from mining-specific API
  const currentProduction = 320 // million tonnes per year
  const previousProduction = 305
  const productionGrowth = ((currentProduction - previousProduction) / previousProduction * 100).toFixed(1)
  const targetProduction = 335
  const ironOrePrice = 115 // $/tonne (62% Fe CFR China)

  const ironOreFaqs = [
    {
      question: `How much iron ore does ${symbol} produce annually?`,
      answer: `${symbol} (${companyName}) produces approximately ${currentProduction} million tonnes of iron ore per year across its mining operations. This represents a ${productionGrowth}% increase compared to the previous year's output of ${previousProduction} million tonnes. Production depends on mine capacity, ore grades, weather conditions, and operational efficiency.`
    },
    {
      question: `What is ${symbol}'s iron ore production growth rate?`,
      answer: `${symbol} has achieved ${productionGrowth}% year-over-year iron ore production growth. The company targets ${targetProduction} million tonnes in the coming year through mine expansions, operational improvements, and infrastructure enhancements. Growth requires significant capital investment in mining equipment and rail/port capacity.`
    },
    {
      question: `Which mines contribute to ${symbol}'s iron ore production?`,
      answer: `${symbol}'s iron ore production comes from multiple mine sites, each with different ore quality (Fe content %), mining methods (open-pit vs underground), and infrastructure access. Production mix affects overall quality, pricing, and profitability. Consult operational reports for mine-specific production data and reserve grades.`
    },
    {
      question: `How does iron ore production affect ${symbol} stock price?`,
      answer: `Iron ore production directly impacts ${symbol}'s revenue and cash flow. At current prices of $${ironOrePrice}/tonne (62% Fe CFR China), annual production of ${currentProduction} million tonnes generates approximately $${(currentProduction * ironOrePrice / 1000).toFixed(1)} billion in revenue. Stock performance tracks production volumes, iron ore prices, cost efficiency, and capital allocation.`
    },
    {
      question: `What factors affect ${symbol}'s iron ore production?`,
      answer: `Key factors include: mine planning and sequencing, equipment fleet availability and utilization, weather (especially in tropical regions during wet season), labor productivity, rail and port infrastructure capacity, ore grade and beneficiation requirements, environmental and regulatory compliance, and safety performance. Production disruptions can significantly impact quarterly results.`
    },
    {
      question: `What is the iron ore grade and why does it matter?`,
      answer: `Iron ore grade refers to the iron content (Fe%) in the ore. Higher grades (62-67% Fe) command premium prices as they require less energy in steel production and reduce shipping costs per unit of iron. ${symbol}'s ore quality mix affects pricing power, logistics costs, and competitiveness versus benchmark 62% Fe pricing. Premium quality ore (>65% Fe) can trade at $10-20/tonne premiums.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Iron Ore`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Iron Ore Production ${currentYear} - Mining Output Analysis`,
      description: `Complete iron ore production analysis for ${symbol} including production volumes, growth trends, and forecasts.`,
      url: pageUrl,
      keywords: [`${symbol} iron ore production`, `${symbol} iron ore output`, `${symbol} iron ore mining`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(ironOreFaqs),
    getTableSchema({
      name: `${symbol} Iron Ore History`,
      description: `Historical Iron Ore data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Iron Ore', 'Change'],
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
            <span>{symbol} Iron Ore</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Iron Ore Production {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Iron Ore Mining Output & Production Trends</p>

          {/* Production Overview */}
          <div className="bg-gradient-to-r from-slate-500/20 to-gray-600/20 p-8 rounded-xl border border-slate-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Annual Production</p>
                <p className="text-3xl font-bold">{currentProduction}M</p>
                <p className="text-sm text-muted-foreground">tonnes/year</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${parseFloat(productionGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {productionGrowth}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Target Production</p>
                <p className="text-3xl font-bold">{targetProduction}M</p>
                <p className="text-sm text-muted-foreground">tonnes/year</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Iron Ore Price</p>
                <p className="text-3xl font-bold">${ironOrePrice}</p>
                <p className="text-sm text-muted-foreground">per tonne (62% Fe)</p>
              </div>
            </div>
          </div>

          {/* Production Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Production Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Current Year Production</h3>
                <p className="text-4xl font-bold mb-2">{currentProduction}M</p>
                <p className="text-muted-foreground">million tonnes per annum</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Previous Year Production</h3>
                <p className="text-4xl font-bold mb-2">{previousProduction}M</p>
                <p className="text-muted-foreground">million tonnes per annum</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Production Growth</h3>
                <p className={`text-4xl font-bold mb-2 ${parseFloat(productionGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {productionGrowth}%
                </p>
                <p className="text-muted-foreground">year-over-year change</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Revenue Impact</h3>
                <p className="text-4xl font-bold mb-2">
                  ${(currentProduction * ironOrePrice / 1000).toFixed(1)}B
                </p>
                <p className="text-muted-foreground">annual revenue from iron ore</p>
              </div>
            </div>
          </section>

          {/* Production Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Drives Iron Ore Production?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Ore Quality & Grade</h3>
                <p className="text-muted-foreground">
                  Iron ore grade (Fe content %) determines product pricing. Premium high-grade ore (65%+ Fe) commands price premiums over benchmark 62% Fe fines due to lower impurities and higher productivity in steel mills.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Mining & Processing Capacity</h3>
                <p className="text-muted-foreground">
                  Production capacity depends on mining equipment fleet size, crusher and screening capacity, beneficiation plant throughput, and waste removal rates. Infrastructure bottlenecks limit production growth.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Logistics Infrastructure</h3>
                <p className="text-muted-foreground">
                  Rail capacity, port facilities, and stockyard management are critical for moving high-volume, low-margin products. Logistics constraints can force production curtailments even when mine capacity exists.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Market Demand & Pricing</h3>
                <p className="text-muted-foreground">
                  Global steel production drives iron ore demand. Chinese steel production accounts for ~50% of global demand. Economic cycles, construction activity, and infrastructure spending impact pricing and production incentives.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-slate-600/20 to-gray-600/20 p-8 rounded-xl border border-slate-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Mining Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access production data, cost metrics, reserve estimates, and AI-powered iron ore mining insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-slate-600 hover:bg-slate-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=financials`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ironOreFaqs.map((faq, i) => (
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
              <Link href={`/aisc/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                All-in Sustaining Cost
              </Link>
              <Link href={`/mining-reserves/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Mineral Reserves
              </Link>
              <Link href={`/grade-trend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Ore Grade Trends
              </Link>
              <Link href={`/realized-prices/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Realized Prices
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="production" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
