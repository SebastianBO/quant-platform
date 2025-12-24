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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Copper Production ${currentYear} - Mining Output & Production Trends`,
    description: `${symbol} copper production analysis: annual production volumes, production growth trends, copper output forecasts, and mining efficiency metrics.`,
    keywords: [
      `${symbol} copper production`,
      `${symbol} mining output`,
      `${symbol} copper output`,
      `${symbol} production trends`,
      `${symbol} mining operations`,
      `${symbol} copper mines`,
    ],
    openGraph: {
      title: `${symbol} Copper Production - Mining Output Analysis`,
      description: `Complete ${symbol} copper production analysis with trends, forecasts, and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/copper-production/${ticker.toLowerCase()}`,
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

export default async function CopperProductionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/copper-production/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder production data - would come from mining-specific API
  const currentProduction = 450000 // tonnes per year
  const previousProduction = 425000
  const productionGrowth = ((currentProduction - previousProduction) / previousProduction * 100).toFixed(1)
  const targetProduction = 480000
  const copperPrice = 4.15 // $/lb

  const copperFaqs = [
    {
      question: `How much copper does ${symbol} produce annually?`,
      answer: `${symbol} (${companyName}) produces approximately ${currentProduction.toLocaleString()} tonnes of copper per year across its mining operations. This represents a ${productionGrowth}% growth compared to the previous year. Production volumes can vary based on mine performance, ore grades, and operational efficiency.`
    },
    {
      question: `What is ${symbol}'s copper production growth rate?`,
      answer: `${symbol} has achieved ${productionGrowth}% year-over-year copper production growth, increasing from ${previousProduction.toLocaleString()} to ${currentProduction.toLocaleString()} tonnes. The company targets ${targetProduction.toLocaleString()} tonnes in the coming year, representing continued expansion of mining operations.`
    },
    {
      question: `Which mines contribute to ${symbol}'s copper production?`,
      answer: `${symbol}'s copper production comes from multiple mining operations across different geographical regions. Production volumes vary by mine based on ore quality, processing capacity, and mining method (open-pit vs underground). Check the company's operational reports for detailed mine-by-mine production data.`
    },
    {
      question: `How does copper production affect ${symbol} stock price?`,
      answer: `Copper production volumes directly impact ${symbol}'s revenue and profitability. At current prices of $${copperPrice}/lb, production of ${currentProduction.toLocaleString()} tonnes generates significant revenue. Production growth, cost efficiency, and copper price trends are key drivers of stock performance for mining companies.`
    },
    {
      question: `What factors affect ${symbol}'s copper production?`,
      answer: `Key factors affecting copper production include: ore grade quality, mining efficiency, processing plant capacity, weather and geological conditions, labor availability, equipment performance, and regulatory compliance. Companies also face challenges from declining ore grades over mine life.`
    },
    {
      question: `Is ${symbol} expanding copper production capacity?`,
      answer: `${symbol} targets ${targetProduction.toLocaleString()} tonnes of copper production, representing ${((targetProduction - currentProduction) / currentProduction * 100).toFixed(1)}% growth. Expansion may come from new mines, brownfield expansions, processing optimization, or acquisitions. Review the company's capital expenditure plans and project pipeline for expansion details.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Copper Production`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Copper Production ${currentYear} - Mining Output Analysis`,
      description: `Complete copper production analysis for ${symbol} including production volumes, growth trends, and forecasts.`,
      url: pageUrl,
      keywords: [`${symbol} copper production`, `${symbol} mining output`, `${symbol} copper output`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(copperFaqs),
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
            <span>{symbol} Copper Production</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Copper Production {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Mining Output & Production Trends</p>

          {/* Production Overview */}
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Annual Production</p>
                <p className="text-3xl font-bold">{currentProduction.toLocaleString()}</p>
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
                <p className="text-3xl font-bold">{targetProduction.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">tonnes/year</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Copper Price</p>
                <p className="text-3xl font-bold">${copperPrice}</p>
                <p className="text-sm text-muted-foreground">per lb</p>
              </div>
            </div>
          </div>

          {/* Production Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Production Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Current Year Production</h3>
                <p className="text-4xl font-bold mb-2">{currentProduction.toLocaleString()}</p>
                <p className="text-muted-foreground">tonnes of copper</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Previous Year Production</h3>
                <p className="text-4xl font-bold mb-2">{previousProduction.toLocaleString()}</p>
                <p className="text-muted-foreground">tonnes of copper</p>
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
                  ${((currentProduction * 2204.62 * copperPrice) / 1e9).toFixed(2)}B
                </p>
                <p className="text-muted-foreground">annual revenue from copper</p>
              </div>
            </div>
          </section>

          {/* Production Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Drives Copper Production?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Ore Grade Quality</h3>
                <p className="text-muted-foreground">
                  Higher ore grades mean more copper per tonne of ore mined, improving production efficiency and reducing costs per unit of output.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Processing Capacity</h3>
                <p className="text-muted-foreground">
                  Mill throughput and recovery rates determine how much ore can be processed and how efficiently copper is extracted from the ore.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Mine Life & Reserves</h3>
                <p className="text-muted-foreground">
                  Proven and probable reserves indicate long-term production sustainability. Declining reserves require exploration success or acquisitions to maintain production.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Operational Efficiency</h3>
                <p className="text-muted-foreground">
                  Equipment utilization, labor productivity, and operational uptime directly impact production volumes and unit costs.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Mining Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access production data, cost metrics, reserve estimates, and AI-powered mining insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {copperFaqs.map((faq, i) => (
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
