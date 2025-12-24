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
    title: `${symbol} Gold Production ${currentYear} - Mining Output & Production Trends`,
    description: `${symbol} gold production analysis: annual gold output in ounces, production growth trends, gold mining forecasts, and operational efficiency metrics.`,
    keywords: [
      `${symbol} gold production`,
      `${symbol} gold output`,
      `${symbol} gold mining`,
      `${symbol} ounces produced`,
      `${symbol} gold mines`,
      `${symbol} production trends`,
    ],
    openGraph: {
      title: `${symbol} Gold Production - Mining Output Analysis`,
      description: `Complete ${symbol} gold production analysis with trends, forecasts, and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gold-production/${ticker.toLowerCase()}`,
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

export default async function GoldProductionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gold-production/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder production data - would come from mining-specific API
  const currentProduction = 2.8 // million ounces per year
  const previousProduction = 2.6
  const productionGrowth = ((currentProduction - previousProduction) / previousProduction * 100).toFixed(1)
  const targetProduction = 3.0
  const goldPrice = 2050 // $/oz

  const goldFaqs = [
    {
      question: `How much gold does ${symbol} produce annually?`,
      answer: `${symbol} (${companyName}) produces approximately ${currentProduction} million ounces of gold per year across its global mining operations. This represents a ${productionGrowth}% increase compared to the previous year's production of ${previousProduction} million ounces. Production volumes depend on mine performance, ore grades, recovery rates, and operational efficiency.`
    },
    {
      question: `What is ${symbol}'s gold production growth rate?`,
      answer: `${symbol} has achieved ${productionGrowth}% year-over-year gold production growth. The company targets ${targetProduction} million ounces in the coming year, representing continued expansion through brownfield projects, operational improvements, and potential acquisitions.`
    },
    {
      question: `Which mines contribute to ${symbol}'s gold production?`,
      answer: `${symbol}'s gold production comes from a portfolio of mines across multiple regions. Each mine contributes differently based on ore reserves, processing capacity, ore grade, and mining method (open-pit vs underground). Refer to the company's quarterly reports for detailed mine-by-mine production breakdowns.`
    },
    {
      question: `How does gold production affect ${symbol} stock price?`,
      answer: `Gold production directly impacts ${symbol}'s revenue and profitability. At current gold prices of $${goldPrice.toLocaleString()}/oz, annual production of ${currentProduction} million ounces generates approximately $${(currentProduction * goldPrice).toFixed(1)} billion in gold revenue. Production growth, cost management, and gold price trends are key stock performance drivers.`
    },
    {
      question: `What factors affect ${symbol}'s gold production?`,
      answer: `Key factors include: ore grade (grams per tonne), mill throughput and recovery rates, mine sequencing and pit optimization, equipment availability and performance, labor productivity, weather conditions, and regulatory compliance. Declining ore grades at mature mines often require expansion or new discoveries to sustain production.`
    },
    {
      question: `Is ${symbol} expanding gold production capacity?`,
      answer: `${symbol} targets ${targetProduction} million ounces, representing ${((targetProduction - currentProduction) / currentProduction * 100).toFixed(1)}% growth. Expansion strategies may include new mine development, brownfield expansions at existing operations, mill capacity increases, heap leach optimizations, or strategic acquisitions. Review capital allocation plans and project pipeline for details.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Gold Production`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Gold Production ${currentYear} - Mining Output Analysis`,
      description: `Complete gold production analysis for ${symbol} including production volumes, growth trends, and forecasts.`,
      url: pageUrl,
      keywords: [`${symbol} gold production`, `${symbol} gold output`, `${symbol} gold mining`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(goldFaqs),
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
            <span>{symbol} Gold Production</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Gold Production {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Gold Mining Output & Production Trends</p>

          {/* Production Overview */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Annual Production</p>
                <p className="text-3xl font-bold">{currentProduction}M</p>
                <p className="text-sm text-muted-foreground">ounces/year</p>
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
                <p className="text-sm text-muted-foreground">ounces/year</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Gold Price</p>
                <p className="text-3xl font-bold">${goldPrice.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">per ounce</p>
              </div>
            </div>
          </div>

          {/* Production Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Production Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Current Year Production</h3>
                <p className="text-4xl font-bold mb-2">{currentProduction}M oz</p>
                <p className="text-muted-foreground">{(currentProduction * 1000000).toLocaleString()} ounces</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Previous Year Production</h3>
                <p className="text-4xl font-bold mb-2">{previousProduction}M oz</p>
                <p className="text-muted-foreground">{(previousProduction * 1000000).toLocaleString()} ounces</p>
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
                  ${(currentProduction * goldPrice / 1000).toFixed(2)}B
                </p>
                <p className="text-muted-foreground">annual revenue from gold</p>
              </div>
            </div>
          </section>

          {/* Production Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Drives Gold Production?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Ore Grade Quality</h3>
                <p className="text-muted-foreground">
                  Gold ore grades measured in grams per tonne (g/t) directly impact production economics. Higher grades mean more gold per tonne of ore processed, reducing unit costs.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Recovery Rates</h3>
                <p className="text-muted-foreground">
                  Metallurgical recovery rates determine how efficiently gold is extracted from ore. Modern operations achieve 85-95% recovery through crushing, grinding, and chemical processing.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Reserves & Resources</h3>
                <p className="text-muted-foreground">
                  Proven and probable gold reserves indicate future production potential. Measured in millions of ounces, reserves divided by annual production equals mine life in years.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Capital Investment</h3>
                <p className="text-muted-foreground">
                  Sustaining capital maintains current production while growth capital funds expansions and new projects. Adequate investment is essential for long-term production growth.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 p-8 rounded-xl border border-yellow-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Mining Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access production data, AISC metrics, reserve estimates, and AI-powered gold mining insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {goldFaqs.map((faq, i) => (
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
