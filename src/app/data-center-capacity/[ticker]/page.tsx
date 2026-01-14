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
    title: `${symbol} Data Center Capacity - Cloud Infrastructure & Servers ${currentYear}`,
    description: `${symbol} data center capacity: server count, rack space, power capacity, cooling capacity, data center locations. Analyze ${symbol}'s cloud infrastructure scale.`,
    keywords: [
      `${symbol} data center capacity`,
      `${symbol} server count`,
      `${symbol} data centers`,
      `${symbol} cloud infrastructure`,
      `${symbol} rack space`,
      `${symbol} data center locations`,
    ],
    openGraph: {
      title: `${symbol} Data Center Capacity ${currentYear} | Cloud Infrastructure`,
      description: `Complete ${symbol} data center capacity analysis with infrastructure scale and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/data-center-capacity/${ticker.toLowerCase()}`,
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

export default async function DataCenterCapacityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/data-center-capacity/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate data center capacity FAQs
  const capacityFaqs = [
    {
      question: `How many data centers does ${symbol} have?`,
      answer: `${companyName} operates data centers globally to support its cloud infrastructure. Major cloud providers typically have hundreds of data centers across multiple continents. Check the company's investor presentations and annual reports for specific data center counts and locations.`
    },
    {
      question: `What is ${symbol}'s data center capacity?`,
      answer: `Data center capacity is measured in several ways: server count, rack space (measured in square feet or megawatts), power capacity, and cooling capacity. ${companyName} continuously expands data center capacity to meet growing cloud demand. Capacity investments are a significant capital expenditure for cloud companies.`
    },
    {
      question: `Where are ${symbol}'s data centers located?`,
      answer: `${companyName} strategically locates data centers in regions worldwide to minimize latency and comply with data sovereignty requirements. Major cloud providers operate in North America, Europe, Asia-Pacific, Latin America, and the Middle East. Geographic distribution is critical for global service delivery.`
    },
    {
      question: `How much does ${symbol} spend on data center expansion?`,
      answer: `Capital expenditures (CapEx) for data center infrastructure represent a significant portion of cloud companies' budgets. ${companyName} reports CapEx in quarterly and annual filings. Check the cash flow statement for capital expenditure details and management commentary on infrastructure investments.`
    },
    {
      question: `What is data center power usage effectiveness (PUE)?`,
      answer: `PUE measures data center energy efficiency - the ratio of total facility energy to IT equipment energy. Leading cloud providers achieve PUE ratios of 1.1-1.2, meaning only 10-20% overhead. ${companyName} may disclose sustainability metrics including PUE in environmental reports.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Data Center Capacity`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Data Center Capacity ${currentYear} - Cloud Infrastructure Analysis`,
    description: `Complete data center capacity analysis for ${symbol} (${companyName}) with infrastructure scale and expansion metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} data center capacity`,
      `${symbol} cloud infrastructure`,
      `${symbol} data centers`,
      `${symbol} server capacity`,
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

  const faqSchema = getFAQSchema(capacityFaqs)

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
            <span>{symbol} Data Center Capacity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Data Center Capacity {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cloud infrastructure and data center capacity for {companyName}
          </p>

          {/* Data Center Overview */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Data Center Infrastructure</h2>
            <p className="text-muted-foreground">
              {companyName} operates global data center infrastructure to power its cloud services. Data center capacity directly impacts the company's ability to serve customers and scale cloud operations.
            </p>
          </div>

          {/* Capacity Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Capacity Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Geographic Reach</h3>
                <p className="text-sm text-muted-foreground">
                  Data centers distributed globally across multiple continents and regions to minimize latency and ensure compliance with local data regulations.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Power Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  Measured in megawatts (MW), power capacity determines maximum compute and storage resources available for customer workloads.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Server Density</h3>
                <p className="text-sm text-muted-foreground">
                  Number of servers per rack and total server count across all data centers. Higher density improves efficiency and reduces costs.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Network Bandwidth</h3>
                <p className="text-sm text-muted-foreground">
                  Total network throughput capacity measured in terabits per second (Tbps). Critical for data transfer and application performance.
                </p>
              </div>
            </div>
          </section>

          {/* Capacity Investment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Infrastructure Investment</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Cloud infrastructure companies invest billions annually in data center capacity. Key investment areas include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Land acquisition and facility construction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Server hardware and networking equipment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Power and cooling systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Redundancy and disaster recovery infrastructure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Security systems and physical access controls</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Sustainability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Sustainability & Efficiency</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Renewable Energy</h3>
                  <p className="text-sm text-muted-foreground">Solar, wind, and hydroelectric power to reduce carbon footprint</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Water Cooling</h3>
                  <p className="text-sm text-muted-foreground">Advanced cooling systems to minimize water usage</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Waste Heat Reuse</h3>
                  <p className="text-sm text-muted-foreground">Capturing waste heat for heating nearby buildings</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete cloud infrastructure metrics and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cloud-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Cloud Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {capacityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Data center capacity information is based on publicly available data, company disclosures, and industry reports. Actual capacity may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="data-center-capacity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
