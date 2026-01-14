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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Monetization per Match - Revenue Economics ${currentYear}`,
    description: `${symbol} monetization per match data: revenue per connection, take rate, monetization efficiency, pricing power. Analyze ${symbol}'s monetization economics.`,
    keywords: [
      `${symbol} monetization`,
      `${symbol} revenue per match`,
      `${symbol} take rate`,
      `${symbol} monetization rate`,
      `${symbol} pricing power`,
    ],
    openGraph: {
      title: `${symbol} Monetization per Match ${currentYear} | Revenue Economics`,
      description: `Complete ${symbol} monetization analysis with revenue per match and take rate metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/monetization/${ticker.toLowerCase()}`,
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

export default async function MonetizationPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/monetization/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How does ${symbol} monetize each match?`,
      answer: `${companyName} monetizes matches through various mechanisms including lead fees charged to professionals, subscription plans, advertising revenue, and value-added services. Revenue per match is a key unit economic metric.`
    },
    {
      question: `What is ${symbol}'s take rate?`,
      answer: `Take rate represents the percentage of total project value that ${symbol} captures as revenue. Higher take rates indicate stronger pricing power and value delivered to marketplace participants.`
    },
    {
      question: `Is ${symbol}'s monetization per match increasing?`,
      answer: `Monetization per match can grow through price increases, product mix improvements, additional service attachment, and platform enhancements that justify higher fees. Growth in this metric drives revenue expansion.`
    },
    {
      question: `How does ${symbol}'s monetization compare to competitors?`,
      answer: `Monetization levels vary across home services marketplaces based on value proposition, service quality, lead exclusivity, and competitive dynamics. ${symbol}'s rates reflect its market position and differentiation.`
    },
    {
      question: `What drives monetization improvement at ${symbol}?`,
      answer: `Key drivers include pricing optimization, shift to higher-value categories, improved lead quality, enhanced services, and network effects that increase platform value for professionals.`
    },
    {
      question: `What is ${symbol}'s revenue per lead?`,
      answer: `Revenue per lead measures the average amount ${symbol} earns from each homeowner connection delivered to professionals. This metric combines connection fees, subscriptions, and other revenue streams.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Monetization`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Monetization per Match ${currentYear} - Revenue Economics`,
    description: `Complete monetization analysis for ${symbol} (${companyName}) with revenue per match and take rate metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} monetization`,
      `${symbol} revenue per match`,
      `${symbol} take rate`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Monetization</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Monetization per Match {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revenue economics and monetization metrics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Revenue per Match</p>
                <p className="text-sm text-muted-foreground mt-1">Unit economic driver</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pricing Power</p>
                <p className="text-2xl font-bold">Take Rate</p>
                <p className="text-sm text-muted-foreground mt-1">Value capture ability</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Growth Strategy</p>
                <p className="text-2xl font-bold">Monetization Expansion</p>
                <p className="text-sm text-muted-foreground mt-1">Revenue optimization</p>
              </div>
            </div>
          </div>

          {/* Monetization Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monetization Revenue Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Connection Fees</h3>
                <p className="text-muted-foreground">Per-lead charges to professionals for homeowner connections</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Subscription Revenue</h3>
                <p className="text-muted-foreground">Monthly recurring fees from professional subscription plans</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Advertising Services</h3>
                <p className="text-muted-foreground">Revenue from promoted listings and premium placements</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Value-Added Services</h3>
                <p className="text-muted-foreground">Additional revenue from CRM tools, analytics, and other services</p>
              </div>
            </div>
          </section>

          {/* Economics Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Unit Economics Framework</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Revenue per Match</h3>
                  <p className="text-muted-foreground">Total revenue generated divided by number of successful connections made</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Gross Margin</h3>
                  <p className="text-muted-foreground">Revenue minus direct costs of lead generation and platform operations</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Contribution Margin</h3>
                  <p className="text-muted-foreground">Gross margin minus variable marketing and customer acquisition costs</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Payback Period</h3>
                  <p className="text-muted-foreground">Time to recover customer and professional acquisition costs from monetization</p>
                </div>
              </div>
            </div>
          </section>

          {/* Monetization Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monetization Growth Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Pricing Optimization:</strong> Strategic price increases based on value delivered and competitive positioning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Premium Features:</strong> Introducing higher-tier services and exclusive lead options</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Category Mix:</strong> Shifting toward higher-value service categories with premium pricing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Lead Quality:</strong> Improving lead quality to justify higher fees and better conversion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Service Attachment:</strong> Cross-selling additional services to increase revenue per professional</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Network Effects:</strong> Stronger network increases platform value and pricing power</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Take Rate Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Take Rate Dynamics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">What is Take Rate?</h3>
                  <p className="text-muted-foreground">Take rate is the percentage of gross transaction value (project cost) that the platform captures as revenue</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Factors Affecting Take Rate</h3>
                  <p className="text-muted-foreground">Lead exclusivity, professional competition, service category, market dynamics, and value-added services influence sustainable take rates</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Balancing Act</h3>
                  <p className="text-muted-foreground">Higher take rates improve revenue but must balance against professional ROI and market competitiveness</p>
                </div>
              </div>
            </div>
          </section>

          {/* Monetization Optimization */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monetization Optimization Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Tiered Pricing</h3>
                <p className="text-muted-foreground">Multiple pricing tiers based on lead quality, exclusivity, and service level</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Dynamic Pricing</h3>
                <p className="text-muted-foreground">Adjust pricing based on demand, category, geography, and market conditions</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product Bundling</h3>
                <p className="text-muted-foreground">Combine leads with tools and services for higher overall monetization</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Performance-Based Fees</h3>
                <p className="text-muted-foreground">Align pricing with professional outcomes and project completion</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, growth trends, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Monetization metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="monetization" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
