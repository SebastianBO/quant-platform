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
    title: `${symbol} Bed Count - Hospital Capacity Metrics ${currentYear}`,
    description: `${symbol} bed count analysis: total beds, licensed capacity, bed utilization, occupancy rates. Analyze ${symbol}'s facility capacity and expansion.`,
    keywords: [
      `${symbol} bed count`,
      `${symbol} hospital beds`,
      `${symbol} capacity`,
      `${symbol} occupancy rate`,
      `${symbol} bed utilization`,
      `${symbol} licensed beds`,
    ],
    openGraph: {
      title: `${symbol} Bed Count ${currentYear} | Hospital Capacity Metrics`,
      description: `Complete ${symbol} bed count analysis with capacity metrics, utilization rates, and expansion trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/bed-count/${ticker.toLowerCase()}`,
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

export default async function BedCountPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/bed-count/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate bed count FAQs
  const bedCountFaqs = [
    {
      question: `What is ${symbol}'s bed count?`,
      answer: `${symbol} (${companyName}) bed count represents the total number of licensed hospital beds${sector === 'Healthcare' ? ' across their healthcare facilities' : ''}. Bed count is a key capacity indicator reflecting facility size and patient volume potential.`
    },
    {
      question: `How many hospital beds does ${symbol} operate?`,
      answer: `${companyName} operates licensed beds across ${industry || 'their healthcare network'}, including general medical-surgical beds, ICU beds, specialty care beds, and observation units. Total bed count reflects current operational capacity.`
    },
    {
      question: `What is ${symbol}'s bed utilization rate?`,
      answer: `Bed utilization (occupancy rate) for ${symbol} measures the percentage of beds actively occupied by patients. Higher utilization indicates efficient capacity use, while very high rates (95%+) may limit flexibility and growth${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `Is ${symbol} expanding bed capacity?`,
      answer: `${companyName} bed capacity expansion through new construction, acquisitions, or facility additions signals growth strategy and market demand. License applications and capital expenditure announcements indicate planned capacity increases.`
    },
    {
      question: `What types of beds does ${symbol} have?`,
      answer: `${symbol} bed mix includes general acute care beds, intensive care unit (ICU) beds, surgical beds, maternity beds, pediatric beds, and specialty service beds${industry ? ` across ${industry} facilities` : ''}. Bed type composition reflects service offerings.`
    },
    {
      question: `How does ${symbol}'s bed count compare to competitors?`,
      answer: `Compare ${symbol} total beds, beds per facility, and bed utilization rates to industry peers to evaluate scale, market presence, and operational efficiency. Larger bed counts generally indicate greater market share and volume capacity.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Bed Count`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Bed Count ${currentYear} - Hospital Capacity Analysis`,
    description: `Complete bed count analysis for ${symbol} (${companyName}) with capacity metrics, utilization rates, and expansion insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} bed count`,
      `${symbol} hospital capacity`,
      `${symbol} beds`,
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

  const faqSchema = getFAQSchema(bedCountFaqs)

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
            <span>{symbol} Bed Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Bed Count {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Hospital capacity and bed utilization metrics for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Capacity Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Licensed Beds</p>
                <p className="text-3xl font-bold">Facility Capacity</p>
                <p className="text-sm text-muted-foreground mt-1">System-wide</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold">Bed Utilization</p>
                <p className="text-sm text-muted-foreground mt-1">Average daily census</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Beds Per Facility</p>
                <p className="text-3xl font-bold">Average Size</p>
                <p className="text-sm text-muted-foreground mt-1">Facility scale</p>
              </div>
            </div>
          </div>

          {/* Bed Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bed Types and Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medical-Surgical Beds</h3>
                <p className="text-muted-foreground mb-2">General acute care beds for medical and surgical patients requiring hospitalization.</p>
                <p className="text-sm text-blue-500 font-medium">Largest bed category</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Intensive Care Unit (ICU)</h3>
                <p className="text-muted-foreground mb-2">Critical care beds with advanced monitoring and life support capabilities.</p>
                <p className="text-sm text-red-500 font-medium">Highest cost per bed</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Specialty Care Beds</h3>
                <p className="text-muted-foreground mb-2">Cardiac care, neonatal ICU, burn units, and other specialized treatment beds.</p>
                <p className="text-sm text-purple-500 font-medium">Specialty services</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Observation Beds</h3>
                <p className="text-muted-foreground mb-2">Short-stay beds for patients requiring extended observation before discharge or admission.</p>
                <p className="text-sm text-green-500 font-medium">Outpatient status</p>
              </div>
            </div>
          </section>

          {/* Bed Utilization */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bed Utilization Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Bed occupancy rate measures the percentage of available beds actively in use. Optimal occupancy balances operational efficiency (85-90%) with flexibility for volume surges and emergency capacity.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Optimal Utilization</p>
                    <p className="text-sm text-muted-foreground">Efficient capacity use with flexibility</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">85-90%</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">High Utilization</p>
                    <p className="text-sm text-muted-foreground">Limited flexibility, potential constraints</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">90-95%</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Very High Utilization</p>
                    <p className="text-sm text-muted-foreground">Capacity constrained, growth limited</p>
                  </div>
                  <p className="text-2xl font-bold text-red-500">95%+</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Low Utilization</p>
                    <p className="text-sm text-muted-foreground">Underutilized capacity, inefficiency</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">&lt;75%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Capacity Expansion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Capacity Expansion Strategies</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Organic Growth</h3>
                <p className="text-muted-foreground">New facility construction, hospital expansions, and bed license additions in existing markets.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Acquisitions</h3>
                <p className="text-muted-foreground">Purchasing existing hospitals and healthcare facilities to rapidly expand bed capacity and market presence.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Line Conversion</h3>
                <p className="text-muted-foreground">Converting general beds to specialty care beds (e.g., ICU, cardiac) based on demand and reimbursement optimization.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Partnership Models</h3>
                <p className="text-muted-foreground">Joint ventures, management agreements, and strategic partnerships adding effective capacity without full ownership.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Capacity Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete operational metrics, utilization trends, and expansion strategies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/patient-volume/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Patient Volume
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {bedCountFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Bed count and capacity data is based on publicly available regulatory filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="bed-count" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
