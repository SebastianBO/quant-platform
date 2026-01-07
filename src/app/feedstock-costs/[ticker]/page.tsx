import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Feedstock Costs - Raw Material & Input Cost Analysis ${currentYear}`,
    description: `${symbol} feedstock costs analysis: raw material expenses, input cost trends, commodity exposure, and margin impact. Track ${symbol}'s cost structure and pricing power.`,
    keywords: [
      `${symbol} feedstock costs`,
      `${symbol} raw materials`,
      `${symbol} input costs`,
      `${symbol} cost of goods sold`,
      `${symbol} commodity exposure`,
      `${symbol} margin pressure`,
    ],
    openGraph: {
      title: `${symbol} Feedstock Costs ${currentYear} | Raw Material Analysis`,
      description: `Complete ${symbol} feedstock costs breakdown with commodity exposure, cost trends, and margin implications.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/feedstock-costs/${ticker.toLowerCase()}`,
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

export default async function FeedstockCostsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/feedstock-costs/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate COGS if available
  const latestIncome = incomeStatements?.[0]
  const cogs = latestIncome?.cost_of_revenue || 0
  const revenue = latestIncome?.revenue || 0
  const cogsPercentage = revenue > 0 ? (cogs / revenue) * 100 : 0

  // Generate feedstock costs FAQs
  const feedstockFaqs = [
    {
      question: `What are ${symbol}'s feedstock costs?`,
      answer: `Feedstock costs represent ${companyName}'s expenses for raw materials and inputs used in production. These costs are a major component of cost of goods sold (COGS) and directly impact gross margins${cogsPercentage > 0 ? `, currently representing approximately ${cogsPercentage.toFixed(1)}% of revenue` : ''}.`
    },
    {
      question: `How do feedstock costs affect ${symbol}'s margins?`,
      answer: `Rising feedstock costs compress ${symbol}'s gross margins unless the company can pass through price increases to customers. Companies with strong pricing power and specialty products typically manage input cost inflation better than commodity producers.`
    },
    {
      question: `What commodities affect ${symbol}'s feedstock costs?`,
      answer: `${sector === 'Materials' || sector === 'Energy' ? 'As a materials/energy company, ' : ''}${companyName}'s feedstock costs may include crude oil, natural gas, ethylene, propylene, benzene, and other petrochemical derivatives. Exposure varies by product portfolio and vertical integration.`
    },
    {
      question: `Can ${symbol} pass through feedstock cost increases?`,
      answer: `Pricing power depends on ${symbol}'s market position, contract structures, and product differentiation. Specialty chemical producers typically achieve better pass-through than commodity manufacturers. Monitor gross margin trends to assess pricing power effectiveness.`
    },
    {
      question: `How does ${symbol} hedge feedstock costs?`,
      answer: `Companies may use commodity hedges, long-term supply contracts, or vertical integration to mitigate feedstock cost volatility. Review ${symbol}'s 10-K risk factors and MD&A sections for details on hedging strategies and raw material exposure.`
    },
    {
      question: `Why are ${symbol}'s feedstock costs volatile?`,
      answer: `Feedstock costs fluctuate with global commodity prices, supply-demand dynamics, geopolitical events, and energy markets${sector ? ` in the ${sector} sector` : ''}. This volatility can significantly impact quarterly earnings and margin performance.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Feedstock Costs`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Feedstock Costs ${currentYear} - Raw Material Analysis`,
    description: `Complete feedstock costs analysis for ${symbol} (${companyName}) with commodity exposure and margin impacts.`,
    url: pageUrl,
    keywords: [
      `${symbol} feedstock costs`,
      `${symbol} raw materials`,
      `${symbol} input costs`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(feedstockFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

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
            <span>{symbol} Feedstock Costs</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Feedstock Costs {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Raw material and input cost analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Cost Structure Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cost Focus</p>
                <p className="text-xl font-bold">Raw Materials</p>
                <p className="text-sm text-muted-foreground mt-1">Primary input costs</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">COGS % of Revenue</p>
                <p className="text-xl font-bold">
                  {cogsPercentage > 0 ? `${cogsPercentage.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Cost intensity</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Risk</p>
                <p className="text-xl font-bold">Commodity Volatility</p>
                <p className="text-sm text-muted-foreground mt-1">Margin pressure</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Feedstock Cost Analysis</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Primary Cost Drivers</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Petrochemical Feedstocks</h4>
                    <p>Crude oil, natural gas, ethylene, propylene, and other hydrocarbon derivatives form the foundation
                    of chemical manufacturing. Prices fluctuate based on energy markets and refinery operations.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Specialty Inputs</h4>
                    <p>Catalysts, solvents, and specialty intermediates used in differentiated products may have more stable
                    pricing but limited supplier options, creating different risk profiles.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Energy Costs</h4>
                    <p>Manufacturing processes are energy-intensive. Electricity, natural gas, and steam costs significantly
                    impact production economics and overall cost competitiveness.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Margin Impact Assessment</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    <span><strong>Rising Feedstocks:</strong> Compress margins unless offset by price increases or productivity gains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    <span><strong>Falling Feedstocks:</strong> Expand margins if selling prices remain stable (margin tailwind)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    <span><strong>Volatility:</strong> Creates quarterly earnings unpredictability and challenges guidance accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    <span><strong>Pass-Through:</strong> Lag effects between cost increases and price adjustments impact near-term margins</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Considerations</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Monitoring Feedstock Trends</h3>
                <p className="text-muted-foreground">
                  Track crude oil prices (WTI, Brent), natural gas (Henry Hub), and key chemical indices (ethylene, propylene)
                  to anticipate margin pressures on {symbol}. Leading commodity indicators often signal earnings trends 1-2 quarters ahead.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Pricing Power Analysis</h3>
                <p className="text-muted-foreground">
                  Evaluate {companyName}'s ability to implement price increases through gross margin stability during
                  feedstock inflation. Companies with specialty products and strong customer relationships typically maintain margins better.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Vertical Integration</h3>
                <p className="text-muted-foreground">
                  Companies with captive feedstock production (backward integration) may have cost advantages versus
                  merchant buyers. Review {symbol}'s supply chain structure and strategic sourcing arrangements.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Margin Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete cost structure, profitability metrics, and financial health indicators
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Margin Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {feedstockFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Cost structure analysis is based on publicly available financial data. Commodity prices and input costs are subject to significant volatility. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="feedstock-costs" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
