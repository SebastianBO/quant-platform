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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Pet Pharmacy Revenue - Pet Medication Sales ${currentYear}`,
    description: `${symbol} pet pharmacy revenue: prescription medications, over-the-counter drugs, pharmacy services. Analyze ${symbol}'s pharmacy segment.`,
    keywords: [
      `${symbol} pet pharmacy`,
      `${symbol} pharmacy revenue`,
      `${symbol} pet medications`,
      `${symbol} pharmacy sales`,
    ],
    openGraph: {
      title: `${symbol} Pet Pharmacy ${currentYear} | Pharmacy Revenue`,
      description: `Complete ${symbol} pet pharmacy analysis with medication sales and pharmacy revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/pet-pharmacy/${ticker.toLowerCase()}`,
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

export default async function PetPharmacyPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/pet-pharmacy/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Find pharmacy segment data
  const pharmacySegment = productSegments?.find((s: any) =>
    s.name?.toLowerCase().includes('pharmacy') ||
    s.name?.toLowerCase().includes('medication') ||
    s.name?.toLowerCase().includes('prescription')
  )
  const pharmacyRevenue = pharmacySegment?.revenue || 0

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate pharmacy as % of total revenue
  const pharmacyPercentage = latestRevenue > 0 ? (pharmacyRevenue / latestRevenue * 100) : 0

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate pharmacy FAQs
  const pharmacyFaqs = [
    {
      question: `Does ${symbol} have a pet pharmacy?`,
      answer: pharmacyRevenue
        ? `Yes, ${symbol} (${companyName}) generates approximately ${pharmacyRevenue >= 1e9 ? `$${(pharmacyRevenue / 1e9).toFixed(2)} billion` : `$${(pharmacyRevenue / 1e6).toFixed(0)} million`} from pet pharmacy services, representing ${pharmacyPercentage.toFixed(1)}% of total revenue.`
        : `${companyName} offers pet pharmacy services including prescription medications and over-the-counter treatments. Pharmacy revenue is typically included in consumables or services revenue.`
    },
    {
      question: `What pharmacy services does ${symbol} offer?`,
      answer: `${companyName} typically provides comprehensive pet pharmacy services including prescription medications, flea and tick preventatives, heartworm medications, pain relievers, antibiotics, and specialty medications for chronic conditions.`
    },
    {
      question: `Can I get prescriptions filled at ${symbol}?`,
      answer: `Yes, ${companyName} fills veterinary prescriptions at competitive prices. The company offers both in-store and online pharmacy services, with convenient autoship options for recurring medications.`
    },
    {
      question: `Is ${symbol}'s pharmacy business growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year. Pet pharmacy is a high-growth, high-margin segment as pet owners increasingly invest in their pets' health.`
        : `The pet pharmacy industry continues to grow rapidly, driven by increasing pet ownership and healthcare spending, even as ${companyName}'s overall revenue has been ${revenueGrowth < 0 ? 'declining' : 'stable'}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Pet Pharmacy`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Pet Pharmacy ${currentYear} - Pharmacy Revenue Analysis`,
    description: `Complete pet pharmacy analysis for ${symbol} (${companyName}) with medication sales trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} pet pharmacy`,
      `${symbol} pharmacy revenue`,
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

  const faqSchema = getFAQSchema(pharmacyFaqs)

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
            <span>{symbol} Pet Pharmacy</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Pet Pharmacy Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pet pharmacy and medication sales analysis for {companyName}
          </p>

          {/* Latest Revenue Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pharmacy Revenue</p>
                <p className="text-3xl font-bold">
                  {pharmacyRevenue >= 1e9
                    ? `$${(pharmacyRevenue / 1e9).toFixed(2)}B`
                    : pharmacyRevenue > 0
                    ? `$${(pharmacyRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {pharmacyPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">revenue contribution</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">all segments</p>
              </div>
            </div>
          </div>

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue History</h2>
            <div className="space-y-3">
              {incomeStatements?.slice(0, 5).map((statement: any, index: number) => {
                const prevStatement = incomeStatements[index + 1]
                const growth = prevStatement?.revenue
                  ? ((statement.revenue - prevStatement.revenue) / prevStatement.revenue)
                  : null

                return (
                  <div key={statement.report_period} className="bg-card p-5 rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{statement.report_period}</p>
                        <p className="text-2xl font-bold">
                          {statement.revenue >= 1e9
                            ? `$${(statement.revenue / 1e9).toFixed(2)}B`
                            : `$${(statement.revenue / 1e6).toFixed(0)}M`}
                        </p>
                      </div>
                      {growth !== null && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">YoY Growth</p>
                          <p className={`text-xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{(growth * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Quarterly Revenue */}
          {quarters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Quarterly Revenue Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarters.slice(0, 8).map((quarter: any) => (
                  <div key={quarter.report_period} className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{quarter.report_period}</p>
                    <p className="text-lg font-bold">
                      {quarter.revenue >= 1e9
                        ? `$${(quarter.revenue / 1e9).toFixed(2)}B`
                        : `$${(quarter.revenue / 1e6).toFixed(0)}M`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Revenue by Segment */}
          {productSegments && productSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {productSegments.slice(0, 8).map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = latestRevenue > 0 ? (segment.revenue / latestRevenue * 100) : 0
                    const isPharmacy = segment.name?.toLowerCase().includes('pharmacy') ||
                                      segment.name?.toLowerCase().includes('medication') ||
                                      segment.name?.toLowerCase().includes('prescription')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isPharmacy ? 'text-emerald-500' : ''}`}>
                            {segment.name}
                            {isPharmacy && ' (Pharmacy)'}
                          </span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`${isPharmacy ? 'bg-emerald-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, financials, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pharmacyFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly filed financial statements. Segment data may not be available for all companies. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="pet-pharmacy" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
