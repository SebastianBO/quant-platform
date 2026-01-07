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

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Leased Capacity - Data Center Utilization Analysis`,
    description: `Analyze ${symbol}'s leased capacity vs available capacity metrics. View utilization rates, occupancy trends, lease-up velocity, and capacity efficiency for data center operations.`,
    keywords: [
      `${symbol} leased capacity`,
      `${symbol} utilization rate`,
      `${symbol} occupancy`,
      `${symbol} capacity utilization`,
      `${symbol} lease-up`,
      `${symbol} data center occupancy`,
      `${symbol} available capacity`,
      `${symbol} leasing velocity`,
    ],
    openGraph: {
      title: `${symbol} Leased Capacity | Data Center Utilization Analysis`,
      description: `Comprehensive analysis of ${symbol}'s capacity utilization, occupancy rates, and leasing trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/leased-capacity/${ticker.toLowerCase()}`,
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

export default async function LeasedCapacityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/leased-capacity/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate leased capacity FAQs
  const leasedCapacityFaqs = [
    {
      question: `What is ${symbol}'s capacity utilization rate?`,
      answer: `Capacity utilization for ${companyName} measures the percentage of total operational megawatts that are leased and generating revenue. Leading data center operators maintain utilization rates of 85-95%. Higher utilization indicates strong demand and efficient capital deployment. Utilization rates are reported quarterly and vary by market and facility vintage.`
    },
    {
      question: `How does ${symbol}'s occupancy compare to industry standards?`,
      answer: `Industry-leading data center operators typically maintain occupancy rates above 90% for mature facilities. ${companyName}'s occupancy metrics should be evaluated in context of portfolio composition - newly delivered facilities naturally have lower occupancy during lease-up periods. Stabilized occupancy rates of 85-95% are considered healthy.`
    },
    {
      question: `What is ${symbol}'s lease-up velocity?`,
      answer: `Lease-up velocity measures how quickly new capacity is absorbed by customers after delivery. For ${companyName}, faster lease-up improves returns on invested capital and validates market selection. Retail colocation typically leases up in 12-24 months, while wholesale projects may lease up in 6-18 months if pre-sold or 18-36 months if speculative.`
    },
    {
      question: `What is the difference between leased and occupied capacity?`,
      answer: `Leased capacity represents space under contract, while occupied capacity is actively deployed with customer equipment. For ${companyName}, there may be a lag between lease signing and customer deployment. Leading operators track both metrics to understand revenue recognition timing and customer deployment velocity.`
    },
    {
      question: `How does ${symbol} report capacity metrics?`,
      answer: `${companyName} reports capacity in megawatts (MW) of critical IT load. Key metrics include: total operational capacity, leased capacity, utilization percentage, and available capacity for lease. Some operators also report billable capacity (actually consuming power) vs. contracted capacity. Transparency in reporting drives investor confidence.`
    },
    {
      question: `What drives changes in ${symbol}'s utilization rate?`,
      answer: `Utilization changes result from new capacity deliveries (dilutive), customer expansions (positive), customer contractions or churn (negative), and contract expirations. For ${companyName}, consistent utilization above 90% indicates balanced supply and demand management. Declining utilization may signal overbuilding or weakening demand.`
    },
    {
      question: `How does capacity utilization affect ${symbol}'s valuation?`,
      answer: `High utilization rates demonstrate efficient capital deployment and strong customer demand, supporting premium valuations for ${companyName}. Operators maintaining 90%+ utilization typically trade at higher price-to-FFO multiples. Utilization trends provide insight into supply-demand balance and pricing power.`
    },
    {
      question: `What is ${symbol}'s strategy for balancing utilization and growth?`,
      answer: `${companyName} must balance maintaining high utilization (maximizing current revenue) with building new capacity for growth (temporarily dilutive to utilization). Best-in-class operators time development to maintain 85-95% utilization while capturing market share in high-growth markets. Pre-leasing reduces utilization risk during expansion.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Leased Capacity`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Leased Capacity - Data Center Utilization and Occupancy Analysis`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) capacity utilization, occupancy rates, and leasing efficiency.`,
    url: pageUrl,
    keywords: [
      `${symbol} leased capacity`,
      `${symbol} utilization`,
      `${symbol} occupancy`,
      `${symbol} lease-up`,
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

  const faqSchema = getFAQSchema(leasedCapacityFaqs)

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
            <span>{symbol} Leased Capacity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Leased Capacity Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Data center utilization and occupancy metrics for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-teal-600/10 to-cyan-600/10 p-8 rounded-xl border border-teal-500/20">
              <h2 className="text-2xl font-bold mb-4">Capacity Utilization Overview</h2>
              <p className="text-muted-foreground mb-6">
                Capacity utilization is a critical operational metric for {companyName}, measuring how effectively
                the company monetizes its data center infrastructure. High utilization (85-95%) indicates strong
                demand and efficient capital allocation, while low utilization may signal overbuilding or market challenges.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Utilization Rate</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Leased / Total Capacity</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Available Capacity</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Megawatts</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Lease-Up Velocity</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">MW per Quarter</p>
                </div>
              </div>
            </div>
          </section>

          {/* Utilization Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Utilization Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Operational Capacity</h3>
                  <p className="text-muted-foreground">
                    Total megawatts of critical IT capacity available across all operational facilities. Excludes
                    capacity under construction or in development. Operational capacity represents the denominator
                    for utilization calculations and the revenue-generating asset base.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Leased Capacity</h3>
                  <p className="text-muted-foreground">
                    Megawatts under customer contract and generating recurring revenue. Leased capacity includes both
                    deployed (customer equipment installed) and committed (contracted but not yet deployed) capacity.
                    Strong leasing activity demonstrates market demand validation.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Available Capacity</h3>
                  <p className="text-muted-foreground">
                    Operational capacity not yet leased and available for new customer deployments. Lower available
                    capacity indicates healthy utilization but may limit near-term growth. Higher available capacity
                    provides flexibility to capture new demand but may pressure margins if lease-up is slow.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Lease-Up Dynamics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Lease-Up Dynamics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Understanding lease-up patterns is critical for evaluating {companyName}'s operational efficiency:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Drivers of Fast Lease-Up</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Pre-leasing before delivery</li>
                    <li>• Strong market demand fundamentals</li>
                    <li>• Existing customer base expansion</li>
                    <li>• Competitive pricing and service quality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Challenges to Utilization</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Speculative development in weak markets</li>
                    <li>• Customer churn or bankruptcy</li>
                    <li>• Competitive market dynamics</li>
                    <li>• Economic downturn reducing demand</li>
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
                  <span className="font-medium">Target Utilization Rate</span>
                  <span className="text-muted-foreground">85-95%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Retail Lease-Up Period</span>
                  <span className="text-muted-foreground">12-24 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Wholesale Lease-Up (Pre-Sold)</span>
                  <span className="text-muted-foreground">6-18 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Stabilized Occupancy</span>
                  <span className="text-muted-foreground">90%+ for mature assets</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 p-8 rounded-xl border border-teal-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed operational metrics, capacity trends, and competitive benchmarking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {leasedCapacityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Capacity utilization metrics are estimates based on publicly available information. Actual utilization rates and occupancy figures should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="leased-capacity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
