import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  getFinancialProductSchema,
  SITE_URL,
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} PUE - Power Usage Effectiveness Analysis`,
    description: `Analyze ${symbol}'s Power Usage Effectiveness (PUE) metrics and data center efficiency. View PUE ratios, cooling efficiency, energy optimization, and sustainability performance.`,
    keywords: [
      `${symbol} PUE`,
      `${symbol} power usage effectiveness`,
      `${symbol} data center efficiency`,
      `${symbol} energy efficiency`,
      `${symbol} cooling efficiency`,
      `${symbol} sustainability`,
      `${symbol} green data center`,
      `${symbol} carbon footprint`,
    ],
    openGraph: {
      title: `${symbol} PUE | Power Usage Effectiveness Analysis`,
      description: `Comprehensive analysis of ${symbol}'s power usage effectiveness and data center energy efficiency.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/pue/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 60 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function PUEPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/pue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate PUE FAQs
  const pueFaqs = [
    {
      question: `What is ${symbol}'s Power Usage Effectiveness (PUE)?`,
      answer: `PUE measures total facility power divided by IT equipment power. For ${companyName}, a PUE of 1.5 means that for every 1 kW of IT power, an additional 0.5 kW is consumed by cooling, lighting, and infrastructure. Industry-leading data centers achieve PUE ratios of 1.1-1.3, while older facilities may have PUE of 1.8-2.0. Lower PUE indicates better efficiency and lower operating costs.`
    },
    {
      question: `How does ${symbol}'s PUE compare to industry benchmarks?`,
      answer: `Industry benchmarks for PUE vary by facility type and vintage: Hyperscale facilities (1.1-1.2), modern retail colocation (1.3-1.5), and older facilities (1.6-2.0). ${companyName}'s portfolio PUE depends on facility age, cooling technology, and climate. Leading operators like Google and Microsoft report PUE below 1.15 for new facilities. Improving PUE by 0.1 can reduce power costs by 5-7%.`
    },
    {
      question: `What cooling technologies does ${symbol} use to improve PUE?`,
      answer: `${companyName} may employ various cooling strategies: (1) Free cooling/economization (using outside air), (2) Evaporative cooling, (3) Hot/cold aisle containment, (4) Liquid cooling for high-density deployments, (5) AI-driven cooling optimization. Free cooling in temperate climates (Pacific Northwest, Northern Europe) enables PUE below 1.2. Warmer climates require more mechanical cooling, increasing PUE.`
    },
    {
      question: `How does PUE impact ${symbol}'s operating costs and margins?`,
      answer: `Better PUE directly reduces power consumption and costs. For ${companyName}, reducing PUE from 1.5 to 1.3 decreases total power usage by 13%, significantly improving margins. With power representing 20-40% of operating costs, a 0.2 PUE improvement can boost gross margins by 2-5%. Lower PUE also enables competitive pricing and reduces carbon emissions.`
    },
    {
      question: `What is ${symbol}'s PUE improvement roadmap?`,
      answer: `Leading data center operators target continuous PUE improvement through: (1) New facility design optimization, (2) Retrofitting existing facilities with efficient cooling, (3) Increasing operating temperatures (ASHRAE guidelines), (4) Hot aisle containment implementation, and (5) AI/ML-driven optimization. ${companyName}'s PUE trajectory indicates commitment to efficiency and sustainability.`
    },
    {
      question: `How does climate affect ${symbol}'s PUE performance?`,
      answer: `Climate significantly impacts achievable PUE. ${companyName}'s facilities in cool, temperate regions can leverage free cooling 8-12 months annually, achieving PUE of 1.1-1.3. Hot, humid climates require year-round mechanical cooling, resulting in PUE of 1.4-1.6. Strategic market selection balancing power costs, PUE potential, and customer proximity optimizes total cost structure.`
    },
    {
      question: `What is the relationship between PUE and ${symbol}'s sustainability goals?`,
      answer: `Lower PUE reduces total energy consumption and carbon emissions, supporting ${companyName}'s ESG objectives. Many operators target carbon neutrality through renewable energy procurement and PUE optimization. Hyperscale customers (AWS, Microsoft, Google) increasingly require low-PUE facilities to meet their own climate commitments. Strong PUE performance enhances competitive positioning for sustainability-focused customers.`
    },
    {
      question: `How does ${symbol} measure and report PUE?`,
      answer: `PUE should be measured according to The Green Grid standards, calculated as Total Facility Power / IT Equipment Power. ${companyName} may report annual average PUE or use continuous monitoring. Best practices include: (1) 12-month trailing average to account for seasonality, (2) Facility-level reporting for transparency, (3) PUE during different operating conditions, and (4) Year-over-year improvement trends.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} PUE`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} PUE - Power Usage Effectiveness and Energy Efficiency Analysis`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) power usage effectiveness, energy efficiency, and sustainability performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} PUE`,
      `${symbol} power usage effectiveness`,
      `${symbol} efficiency`,
      `${symbol} sustainability`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    url: pageUrl,
    price: snapshot.price,
  })

  const faqSchema = getFAQSchema(pueFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, financialProductSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} PUE</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Power Usage Effectiveness (PUE)
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Energy efficiency and sustainability metrics for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-emerald-600/10 to-green-600/10 p-8 rounded-xl border border-emerald-500/20">
              <h2 className="text-2xl font-bold mb-4">PUE Overview</h2>
              <p className="text-muted-foreground mb-6">
                Power Usage Effectiveness (PUE) is the industry standard metric for data center energy efficiency.
                For {companyName}, maintaining low PUE demonstrates operational excellence, reduces costs, and
                supports sustainability commitments. Lower PUE directly translates to competitive advantages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Portfolio PUE</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual Average</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Best-in-Class Facility</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Lowest PUE</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">YoY Improvement</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">PUE Reduction</p>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding PUE */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding PUE</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="mb-6">
                <p className="text-muted-foreground mb-4">
                  PUE is calculated as: <strong>Total Facility Power / IT Equipment Power</strong>
                </p>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="font-mono text-sm">
                    PUE = 1.5 means:<br/>
                    - For every 1 kW of IT power, total facility uses 1.5 kW<br/>
                    - 0.5 kW (33%) is overhead (cooling, lighting, UPS losses)<br/>
                    - Lower PUE = Better efficiency
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded">
                  <span className="font-medium">World-Class PUE</span>
                  <span className="text-emerald-500">1.1 - 1.2</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded">
                  <span className="font-medium">Excellent PUE</span>
                  <span className="text-green-500">1.2 - 1.4</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded">
                  <span className="font-medium">Average PUE</span>
                  <span className="text-yellow-500">1.4 - 1.6</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded">
                  <span className="font-medium">Below Average PUE</span>
                  <span className="text-orange-500">1.6 - 2.0</span>
                </div>
              </div>
            </div>
          </section>

          {/* PUE Optimization Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">PUE Optimization Strategies</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName} can optimize PUE through multiple technical and operational strategies:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Cooling Optimization</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Free cooling / air-side economization</li>
                    <li>• Hot/cold aisle containment</li>
                    <li>• Raising server inlet temperatures</li>
                    <li>• Evaporative cooling systems</li>
                    <li>• AI-driven cooling management</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Infrastructure Efficiency</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• High-efficiency UPS systems (96%+ efficiency)</li>
                    <li>• LED lighting with occupancy sensors</li>
                    <li>• Variable frequency drive (VFD) fans/pumps</li>
                    <li>• Modular power distribution</li>
                    <li>• Waste heat recovery</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Impact on Business */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">PUE Impact on Business Performance</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Cost Savings</h3>
                  <p className="text-muted-foreground">
                    Reducing PUE from 1.6 to 1.3 decreases total power consumption by ~19%. For a 10 MW facility,
                    this saves approximately 2.3 MW of power constantly. At $0.07/kWh, this equals $1.4 million
                    annual savings, significantly improving profitability.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Competitive Advantage</h3>
                  <p className="text-muted-foreground">
                    Lower PUE enables {companyName} to offer more competitive pricing or expand margins. Sustainability-focused
                    customers prioritize low-PUE facilities. Hyperscale cloud providers often require PUE commitments
                    below 1.3 for new deployments.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">ESG & Sustainability</h3>
                  <p className="text-muted-foreground">
                    Lower PUE reduces carbon emissions and energy consumption, supporting ESG goals and corporate
                    sustainability commitments. Combined with renewable energy procurement, excellent PUE performance
                    positions {companyName} as an environmentally responsible operator.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Benchmarks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Google Fleet Average</span>
                  <span className="text-muted-foreground">~1.10</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Modern Hyperscale Facility</span>
                  <span className="text-muted-foreground">1.15 - 1.25</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Retail Colocation (New Build)</span>
                  <span className="text-muted-foreground">1.30 - 1.50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Global Average (Uptime Institute)</span>
                  <span className="text-muted-foreground">~1.58</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed sustainability metrics, operational efficiency analysis, and ESG performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pueFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> PUE metrics are estimates based on publicly available information and industry benchmarks. Actual PUE values should be verified through company sustainability reports and disclosures. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="pue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
