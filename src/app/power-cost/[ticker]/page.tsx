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
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Power Costs - Data Center Electricity Pricing`,
    description: `Analyze ${symbol}'s power costs and electricity pricing strategy. View power cost per kWh, market comparisons, renewable energy mix, and impact on margins and competitiveness.`,
    keywords: [
      `${symbol} power costs`,
      `${symbol} electricity costs`,
      `${symbol} power pricing`,
      `${symbol} energy costs`,
      `${symbol} kWh pricing`,
      `${symbol} renewable energy`,
      `${symbol} power efficiency`,
      `${symbol} utility costs`,
    ],
    openGraph: {
      title: `${symbol} Power Costs | Data Center Energy Pricing Analysis`,
      description: `Comprehensive analysis of ${symbol}'s power costs, electricity pricing, and energy strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/power-cost/${ticker.toLowerCase()}`,
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

export default async function PowerCostPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/power-cost/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate power cost FAQs
  const powerCostFaqs = [
    {
      question: `What are ${symbol}'s average power costs?`,
      answer: `Power costs for ${companyName} vary by market location and utility provider. U.S. data center power costs typically range from $0.03-$0.12 per kWh, with significant regional variation. Low-cost markets (Pacific Northwest, Texas) offer $0.03-$0.05/kWh, while high-cost markets (California, Northeast) may exceed $0.10/kWh. Power represents 20-40% of total operating costs.`
    },
    {
      question: `How does ${symbol} pass power costs to customers?`,
      answer: `${companyName} typically recovers power costs through one of three models: (1) Power included in base colocation pricing with markup, (2) Metered usage billed at cost-plus markup (e.g., $0.08-$0.15/kWh), or (3) Pass-through at cost plus administrative fee. Wholesale customers often receive power at or near cost, while retail customers pay marked-up rates.`
    },
    {
      question: `What markets does ${symbol} operate in for power cost advantage?`,
      answer: `Leading data center operators strategically locate facilities in markets with low power costs and high reliability. ${companyName} may operate in favorable markets like: Pacific Northwest (hydroelectric), Texas (deregulated market), Quebec (hydro), and Scandinavia (renewable energy). Lower power costs improve margins and enable competitive pricing.`
    },
    {
      question: `How do power costs affect ${symbol}'s profitability?`,
      answer: `Power costs directly impact ${companyName}'s gross margins. For retail colocation with power included, every $0.01/kWh reduction in power cost improves margins. For pass-through models, power cost affects competitive positioning and customer satisfaction. Operators with power cost advantages can offer better pricing or expand margins by 5-10%.`
    },
    {
      question: `What is ${symbol}'s renewable energy strategy?`,
      answer: `Many data center operators, including ${companyName}, are pursuing 100% renewable energy targets to meet customer ESG requirements and reduce carbon emissions. Renewable procurement strategies include: (1) Power Purchase Agreements (PPAs) with solar/wind projects, (2) Renewable Energy Credits (RECs), and (3) On-site solar generation. Hyperscale customers often require renewable energy commitments.`
    },
    {
      question: `How do power cost trends affect ${symbol}?`,
      answer: `Rising electricity costs due to demand growth, grid infrastructure investment, and renewable transition can pressure ${companyName}'s margins if not passed through to customers. Contracts with fixed power pricing expose operators to cost inflation risk. Leading operators secure long-term fixed-rate power contracts or implement escalation clauses to protect margins.`
    },
    {
      question: `What is ${symbol}'s power redundancy and reliability strategy?`,
      answer: `${companyName} provides high-availability power through redundant utility feeds, backup generators, and uninterruptible power supply (UPS) systems. Redundancy levels (N+1, N+2, 2N) impact both capital costs and operating costs. Higher redundancy provides better uptime guarantees (99.99%+) but increases infrastructure investment and operating expense.`
    },
    {
      question: `How does ${symbol} hedge against power cost volatility?`,
      answer: `Data center operators manage power cost risk through: (1) Fixed-rate contracts with utilities (3-10 years), (2) Power purchase agreements with renewable projects, (3) Customer contracts with power escalation clauses, and (4) Strategic market diversification. For ${companyName}, effective power procurement is critical to margin stability and competitiveness.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Power Costs`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Power Costs - Data Center Electricity Pricing and Energy Strategy`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) power costs, electricity pricing, and renewable energy strategy.`,
    url: pageUrl,
    keywords: [
      `${symbol} power costs`,
      `${symbol} electricity`,
      `${symbol} energy costs`,
      `${symbol} renewable energy`,
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

  const faqSchema = getFAQSchema(powerCostFaqs)

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
            <span>{symbol} Power Costs</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Power Cost Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Electricity pricing and energy strategy for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-yellow-600/10 to-amber-600/10 p-8 rounded-xl border border-yellow-500/20">
              <h2 className="text-2xl font-bold mb-4">Power Cost Overview</h2>
              <p className="text-muted-foreground mb-6">
                Power costs represent one of the largest operating expenses for {companyName}, typically
                accounting for 20-40% of total costs. Strategic power procurement and market selection
                directly impact profitability, competitive positioning, and customer pricing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Power Cost</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Per kWh</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Renewable Energy %</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Portfolio Mix</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Power as % OpEx</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Operating Costs</p>
                </div>
              </div>
            </div>
          </section>

          {/* Regional Power Costs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Regional Power Cost Dynamics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Low-Cost Markets ($0.03-$0.05/kWh)</h3>
                  <p className="text-muted-foreground">
                    Pacific Northwest (hydroelectric), Quebec (hydro), Texas (deregulated), and emerging markets offer
                    the lowest power costs. These markets attract hyperscale deployments and provide significant margin
                    advantages. However, market selection must also consider network connectivity, disaster risk, and
                    labor availability.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Mid-Cost Markets ($0.06-$0.08/kWh)</h3>
                  <p className="text-muted-foreground">
                    Most major U.S. data center markets fall into this range, including Northern Virginia, Phoenix,
                    Chicago, and Atlanta. These markets balance power costs with network density, customer proximity,
                    and infrastructure availability. Power costs are competitive but not necessarily advantaged.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">High-Cost Markets ($0.09-$0.12+/kWh)</h3>
                  <p className="text-muted-foreground">
                    California, New York/New Jersey, and parts of Europe face higher power costs due to regulatory
                    requirements, limited supply, or renewable mandates. These markets justify higher costs through
                    rich network ecosystems, customer density, and strategic importance. Power cost disadvantages
                    must be offset by premium pricing or interconnection revenue.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Power Pricing Models */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Customer Power Pricing Models</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName} may employ different power pricing strategies based on customer type and market:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Retail Colocation Models</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• All-inclusive pricing (power bundled)</li>
                    <li>• Metered usage at markup ($0.10-$0.20/kWh)</li>
                    <li>• Tiered pricing based on power density</li>
                    <li>• Fixed allocation with overage charges</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Wholesale/Hyperscale Models</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Pass-through at cost plus admin fee</li>
                    <li>• Fixed pricing with escalation clauses</li>
                    <li>• Renewable energy premiums</li>
                    <li>• Direct utility contracts (in some cases)</li>
                  </ul>
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
                  <span className="font-medium">Low-Cost Markets</span>
                  <span className="text-muted-foreground">$0.03-$0.05/kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Mid-Cost Markets</span>
                  <span className="text-muted-foreground">$0.06-$0.08/kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">High-Cost Markets</span>
                  <span className="text-muted-foreground">$0.09-$0.12+/kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Power as % of OpEx</span>
                  <span className="text-muted-foreground">20-40%</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 p-8 rounded-xl border border-yellow-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed cost structure analysis, margin breakdowns, and competitive benchmarking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {powerCostFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Power cost metrics are estimates based on publicly available information and industry research. Actual power costs vary by location, utility provider, and contract terms. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="power-cost" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
