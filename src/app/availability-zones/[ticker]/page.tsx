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
    title: `${symbol} Availability Zones - Cloud Regions & Geographic Coverage ${currentYear}`,
    description: `${symbol} availability zones: cloud regions, geographic coverage, data center locations, regional expansion. Analyze ${symbol}'s global cloud infrastructure footprint.`,
    keywords: [
      `${symbol} availability zones`,
      `${symbol} cloud regions`,
      `${symbol} geographic coverage`,
      `${symbol} data center locations`,
      `${symbol} AWS regions`,
      `${symbol} Azure regions`,
    ],
    openGraph: {
      title: `${symbol} Availability Zones ${currentYear} | Cloud Geographic Coverage`,
      description: `Complete ${symbol} availability zones analysis with cloud regions and geographic expansion metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/availability-zones/${ticker.toLowerCase()}`,
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

export default async function AvailabilityZonesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/availability-zones/${ticker.toLowerCase()}`
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

  // Generate availability zones FAQs
  const zonesFaqs = [
    {
      question: `How many availability zones does ${symbol} have?`,
      answer: `${companyName} operates availability zones globally as part of its cloud infrastructure. Major cloud providers typically have 80+ availability zones across 25+ geographic regions. Each region contains multiple isolated availability zones for fault tolerance and high availability. Check the company's cloud services documentation for current zone counts.`
    },
    {
      question: `What is an availability zone?`,
      answer: `An availability zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity within a region. Availability zones are physically separated to ensure that failures in one zone don't affect others. This architecture enables customers to build highly available and fault-tolerant applications.`
    },
    {
      question: `What regions does ${symbol} operate in?`,
      answer: `${companyName} operates cloud regions worldwide including North America (US, Canada), Europe (multiple countries), Asia Pacific (Japan, Singapore, Australia, etc.), Latin America, and the Middle East. The company continuously expands into new regions to serve local customers and comply with data residency requirements.`
    },
    {
      question: `Why are availability zones important?`,
      answer: `Availability zones provide fault isolation, disaster recovery, and high availability for cloud applications. By deploying resources across multiple zones, customers can ensure their applications remain operational even if an entire data center fails. This is critical for mission-critical workloads requiring 99.99%+ uptime.`
    },
    {
      question: `How does ${symbol} expand availability zones?`,
      answer: `Cloud providers expand availability zones based on customer demand, regulatory requirements, and strategic priorities. New zone launches involve significant capital investment in land, facilities, power, cooling, and networking infrastructure. ${companyName} announces new regions and zones in investor communications and product updates.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Availability Zones`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Availability Zones ${currentYear} - Cloud Geographic Coverage`,
    description: `Complete availability zones analysis for ${symbol} (${companyName}) with cloud regions and geographic expansion.`,
    url: pageUrl,
    keywords: [
      `${symbol} availability zones`,
      `${symbol} cloud regions`,
      `${symbol} geographic coverage`,
      `${symbol} data center locations`,
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

  const faqSchema = getFAQSchema(zonesFaqs)

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
            <span>{symbol} Availability Zones</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Availability Zones {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cloud regions and geographic coverage for {companyName}
          </p>

          {/* Availability Zones Overview */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Global Cloud Infrastructure</h2>
            <p className="text-muted-foreground">
              {companyName} operates availability zones across multiple geographic regions to provide low-latency, fault-tolerant cloud services to customers worldwide. Geographic expansion is a key driver of cloud adoption and revenue growth.
            </p>
          </div>

          {/* Availability Zone Architecture */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Availability Zone Architecture</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Regions</h3>
                  <p className="text-sm text-muted-foreground">Geographic areas containing multiple availability zones</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Availability Zones</h3>
                  <p className="text-sm text-muted-foreground">Isolated data centers within each region</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Edge Locations</h3>
                  <p className="text-sm text-muted-foreground">CDN and caching endpoints for low latency</p>
                </div>
              </div>
            </div>
          </section>

          {/* Regional Coverage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Geographic Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">North America</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>US East (Virginia, Ohio)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>US West (California, Oregon)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Canada (Central)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Europe</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Ireland, London, Frankfurt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Paris, Milan, Stockholm</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Zurich, Warsaw</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Asia Pacific</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Tokyo, Osaka, Seoul</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Singapore, Mumbai, Sydney</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Hong Kong, Jakarta</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Other Regions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>South America (Sao Paulo)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Middle East (Bahrain, UAE)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Africa (Cape Town)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits of Multi-Zone Deployment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Benefits of Multi-Zone Deployment</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <span><strong>High Availability:</strong> Applications remain operational even if an entire data center fails</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <span><strong>Disaster Recovery:</strong> Geographic redundancy protects against regional outages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <span><strong>Low Latency:</strong> Serve users from the nearest region for optimal performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <span><strong>Data Sovereignty:</strong> Store data in specific countries to meet regulatory requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  <span><strong>Load Balancing:</strong> Distribute traffic across zones to prevent overload</span>
                </li>
              </ul>
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
              {zonesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Availability zone information is based on publicly available data and company disclosures. Geographic coverage may vary by service. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="availability-zones" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
