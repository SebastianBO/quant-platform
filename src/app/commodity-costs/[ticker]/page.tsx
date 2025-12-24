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
    title: `${symbol} Commodity Costs - Input Cost Exposure Analysis`,
    description: `${symbol} commodity cost exposure and input price risk analysis. Track raw material costs, hedging strategies, and margin impact for ${symbol}.`,
    keywords: [
      `${symbol} commodity costs`,
      `${symbol} input costs`,
      `${symbol} raw materials`,
      `${symbol} cost inflation`,
      `${symbol} commodity exposure`,
      `${symbol} margin pressure`,
    ],
    openGraph: {
      title: `${symbol} Commodity Costs | Input Cost Exposure`,
      description: `Track ${symbol} commodity cost exposure and input price risk analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/commodity-costs/${ticker.toLowerCase()}`,
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

export default async function CommodityCostsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/commodity-costs/${ticker.toLowerCase()}`

  const commodityCostsFaqs = [
    {
      question: `What are commodity costs for ${symbol}?`,
      answer: `Commodity costs for ${symbol} represent the expenses for raw materials like grain, coffee, cocoa, sugar, packaging materials, and other inputs used in production. These costs are subject to market price volatility and directly impact gross margins and profitability.`
    },
    {
      question: `Why are commodity costs important for ${symbol} investors?`,
      answer: `Commodity costs are crucial for ${symbol} because they represent a significant portion of cost of goods sold. Inflation in key input costs can compress margins if not offset by pricing actions, while deflation can expand margins and boost profitability.`
    },
    {
      question: `How does ${symbol} manage commodity cost risk?`,
      answer: `${symbol} manages commodity risk through hedging strategies using futures contracts, long-term supplier contracts, strategic sourcing, inventory management, product reformulation, and pricing actions to pass through costs to consumers.`
    },
    {
      question: `What commodities affect ${symbol} the most?`,
      answer: `The key commodities impacting ${symbol} depend on its product portfolio but commonly include agricultural inputs (grain, dairy, meat), packaging materials (plastic, aluminum, paper), energy costs, and category-specific ingredients that make up the largest cost components.`
    },
    {
      question: `How do investors track commodity cost impact on ${symbol}?`,
      answer: `Investors monitor ${symbol}'s gross margin trends, management commentary on input costs, hedging disclosures, pricing actions, and compare cost inflation to pricing realization to understand the net margin impact of commodity movements.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Commodity Costs', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Commodity Costs`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Commodity Costs - Input Cost Exposure Analysis`,
      description: `Comprehensive commodity cost analysis for ${symbol} (${companyName}) including raw material exposure and margin impact.`,
      url: pageUrl,
      keywords: [`${symbol} commodity costs`, `${symbol} input costs`, `${symbol} raw materials`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(commodityCostsFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Commodity Costs</Link>
            {' / '}
            <span>{symbol} Commodity Costs</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Commodity Cost Exposure</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Input cost analysis and margin impact</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Commodity Costs</h2>
            <p className="text-muted-foreground mb-4">
              Commodity costs represent a major input expense for {companyName}, subject to market volatility that can significantly impact margins. Effective management of commodity exposure through hedging, sourcing, and pricing is crucial for profitability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Risk Factor</p>
                <p className="text-lg font-bold">Cost Volatility</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Impact</p>
                <p className="text-lg font-bold">Margin Pressure</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Management</p>
                <p className="text-lg font-bold">Hedging & Pricing</p>
              </div>
            </div>
          </div>

          {/* Key Commodity Exposures Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Common Commodity Exposures</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌾</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Agricultural Inputs</h3>
                    <p className="text-muted-foreground">
                      Grain, wheat, corn, soybeans, dairy, meat, coffee, cocoa, sugar, and other agricultural commodities subject to weather, crop yields, and global supply-demand dynamics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Packaging Materials</h3>
                    <p className="text-muted-foreground">
                      Plastic resin, aluminum, steel, paper, cardboard, and glass used in product packaging. Prices influenced by oil costs, metals markets, and recycled material availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Energy & Transportation</h3>
                    <p className="text-muted-foreground">
                      Natural gas, electricity, and diesel fuel for manufacturing, distribution, and transportation. Volatile energy prices directly impact operating costs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🧪</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Specialty Ingredients</h3>
                    <p className="text-muted-foreground">
                      Flavors, additives, preservatives, and specialty ingredients sourced globally. Limited suppliers can create pricing power and supply risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cost Management Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Commodity Cost Management</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">🛡️ Hedging Programs</h3>
                  <p className="text-muted-foreground">Using futures contracts and derivatives to lock in prices and reduce exposure to near-term volatility.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📋 Long-term Contracts</h3>
                  <p className="text-muted-foreground">Negotiating fixed-price or structured contracts with suppliers to provide cost certainty and budget predictability.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🌍 Strategic Sourcing</h3>
                  <p className="text-muted-foreground">Diversifying suppliers geographically and by volume to reduce dependency and negotiate better terms.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💰 Pricing Actions</h3>
                  <p className="text-muted-foreground">Passing through cost inflation to consumers via price increases while maintaining volume.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Margin Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyzing Margin Impact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Margin Expansion Drivers</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Commodity cost deflation</li>
                  <li>Successful hedging programs</li>
                  <li>Effective price realization</li>
                  <li>Product reformulation savings</li>
                  <li>Favorable mix to premium</li>
                  <li>Operational efficiency</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Margin Pressure Sources</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Commodity cost inflation</li>
                  <li>Inability to take pricing</li>
                  <li>Hedging losses or gaps</li>
                  <li>Supply chain disruptions</li>
                  <li>Mix shift to value brands</li>
                  <li>Competitive pricing pressure</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Implications */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Implications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-green-500 mb-2">Positive Signals</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Stable commodity environment</li>
                  <li>Effective hedging execution</li>
                  <li>Successful price increases</li>
                  <li>Margin expansion despite inflation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Accelerating cost inflation</li>
                  <li>Margin compression</li>
                  <li>Pricing resistance</li>
                  <li>Supply disruptions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Margins</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive margin analysis and cost structure for {symbol}</p>
            <Link href={`/margins/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Margin Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {commodityCostsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
