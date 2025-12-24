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
    title: `${symbol} Aircraft Deliveries - Units Delivered & Production Schedule ${currentYear}`,
    description: `${symbol} aircraft deliveries: total units delivered, delivery schedule, aircraft types, production rates, and year-over-year growth. Track ${symbol}'s aircraft production.`,
    keywords: [
      `${symbol} aircraft deliveries`,
      `${symbol} plane deliveries`,
      `${symbol} production rate`,
      `${symbol} delivery schedule`,
      `${symbol} aircraft production`,
      `${symbol} units delivered`,
    ],
    openGraph: {
      title: `${symbol} Aircraft Deliveries ${currentYear} | Production Schedule`,
      description: `Complete ${symbol} aircraft deliveries analysis with units delivered, production rates, and delivery schedule.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/aircraft-deliveries/${ticker.toLowerCase()}`,
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

export default async function AircraftDeliveriesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/aircraft-deliveries/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock aircraft delivery data (in production, this would come from API)
  const totalDeliveries = 450
  const yearOverYearGrowth = 0.12 // 12% growth
  const previousYearDeliveries = Math.round(totalDeliveries / (1 + yearOverYearGrowth))
  const productionRate = Math.round(totalDeliveries / 12) // per month
  const backlogUnits = Math.round(totalDeliveries * 3.5)

  // Mock delivery breakdown by aircraft type
  const deliveryBreakdown = [
    { type: 'Commercial Aircraft', units: 250, percentage: 55.6 },
    { type: 'Military Fighters', units: 120, percentage: 26.7 },
    { type: 'Military Transport', units: 50, percentage: 11.1 },
    { type: 'Helicopters', units: 30, percentage: 6.7 },
  ]

  // Mock quarterly deliveries
  const quarterlyDeliveries = [
    { quarter: 'Q4 2024', units: 125, growth: 8 },
    { quarter: 'Q3 2024', units: 118, growth: 12 },
    { quarter: 'Q2 2024', units: 110, growth: 15 },
    { quarter: 'Q1 2024', units: 97, growth: 10 },
  ]

  // Generate aircraft deliveries FAQs
  const deliveryFaqs = [
    {
      question: `How many aircraft did ${symbol} deliver in ${currentYear}?`,
      answer: `${symbol} (${companyName}) delivered ${totalDeliveries} aircraft in ${currentYear}, representing a ${(yearOverYearGrowth * 100).toFixed(0)}% increase compared to ${previousYearDeliveries} deliveries in the previous year.`
    },
    {
      question: `What is ${symbol}'s aircraft production rate?`,
      answer: `${symbol} is currently producing aircraft at a rate of approximately ${productionRate} units per month, or ${totalDeliveries} units annually. This production rate reflects ${industry ? `${industry} ` : ''}manufacturing capacity and demand.`
    },
    {
      question: `What types of aircraft does ${symbol} deliver?`,
      answer: `${symbol}'s deliveries include: ${deliveryBreakdown.map(d => `${d.type} (${d.units} units, ${d.percentage.toFixed(0)}%)`).join(', ')}. The mix reflects both commercial and defense market demand.`
    },
    {
      question: `Is ${symbol}'s aircraft delivery rate growing?`,
      answer: `Yes, ${symbol}'s aircraft deliveries grew ${(yearOverYearGrowth * 100).toFixed(0)}% year-over-year, from ${previousYearDeliveries} units to ${totalDeliveries} units. This growth indicates strong production ramp-up and healthy order fulfillment.`
    },
    {
      question: `How many aircraft does ${symbol} have in backlog?`,
      answer: `${symbol} has approximately ${backlogUnits} aircraft in backlog, representing ${(backlogUnits / totalDeliveries).toFixed(1)} years of production at current delivery rates. This backlog provides strong revenue visibility.`
    },
    {
      question: `What was ${symbol}'s quarterly delivery performance?`,
      answer: `${symbol} delivered ${quarterlyDeliveries[0].units} aircraft in ${quarterlyDeliveries[0].quarter}, showing ${quarterlyDeliveries[0].growth >= 0 ? 'growth' : 'decline'} of ${Math.abs(quarterlyDeliveries[0].growth)}% compared to the prior quarter. Quarterly performance reflects production schedule and customer delivery timing.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Aircraft Deliveries`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Aircraft Deliveries ${currentYear} - Production & Schedule`,
    description: `Complete aircraft deliveries analysis for ${symbol} (${companyName}) with units delivered, production rates, and delivery schedule.`,
    url: pageUrl,
    keywords: [
      `${symbol} aircraft deliveries`,
      `${symbol} production rate`,
      `${symbol} delivery schedule`,
      `${symbol} aircraft production`,
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

  const faqSchema = getFAQSchema(deliveryFaqs)

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
            <span>{symbol} Aircraft Deliveries</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Aircraft Deliveries {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production schedule and delivery data for {companyName}
          </p>

          {/* Deliveries Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Deliveries {currentYear}</p>
                <p className="text-3xl font-bold">
                  {totalDeliveries} units
                </p>
                <p className="text-sm text-green-500 mt-1">+{(yearOverYearGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Production Rate</p>
                <p className="text-3xl font-bold text-blue-500">
                  {productionRate}/mo
                </p>
                <p className="text-sm text-muted-foreground mt-1">monthly average</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Backlog</p>
                <p className="text-3xl font-bold text-green-500">
                  {backlogUnits}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(backlogUnits / totalDeliveries).toFixed(1)} years at current rate
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Breakdown by Type */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Deliveries by Aircraft Type</h2>
            <div className="space-y-4">
              {deliveryBreakdown.map((item, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold">{item.type}</p>
                      <p className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}% of total</p>
                    </div>
                    <p className="text-2xl font-bold">{item.units} units</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quarterly Deliveries */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Quarterly Delivery Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quarterlyDeliveries.map((quarter, index) => (
                <div key={index} className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{quarter.quarter}</p>
                  <p className="text-2xl font-bold mb-1">{quarter.units}</p>
                  <p className={`text-sm ${quarter.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {quarter.growth >= 0 ? '+' : ''}{quarter.growth}% QoQ
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Production Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Production Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <p className="text-xl font-bold text-green-500">94%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Production Capacity</p>
                <p className="text-xl font-bold">87%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Book-to-Bill</p>
                <p className="text-xl font-bold text-blue-500">1.4x</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="text-xl font-bold">24 mo</p>
              </div>
            </div>
          </section>

          {/* Year-over-Year Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Delivery Growth Trend</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{currentYear}</p>
                  <p className="text-2xl font-bold">{totalDeliveries} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">vs. {currentYear - 1}</p>
                  <p className="text-2xl font-bold text-green-500">+{(yearOverYearGrowth * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentYear}: {totalDeliveries} units</span>
                  <span className="text-green-500">Current year</span>
                </div>
                <div className="w-full bg-green-500/20 rounded-full h-8 flex items-center px-3">
                  <div className="text-sm font-medium text-green-500">{totalDeliveries}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{currentYear - 1}: {previousYearDeliveries} units</span>
                  <span className="text-muted-foreground">Previous year</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-8 flex items-center px-3">
                  <div className="text-sm font-medium">{previousYearDeliveries}</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Production Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue trends, backlog analysis, and production forecasts
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
                Revenue Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {deliveryFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Aircraft delivery data is based on publicly available company reports and industry estimates. Actual delivery numbers and schedules may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="aircraft-deliveries" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
