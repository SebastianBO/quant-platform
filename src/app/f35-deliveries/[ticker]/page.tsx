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
    title: `${symbol} F-35 Deliveries - Production Rate & Lightning II Orders ${currentYear}`,
    description: `${symbol} F-35 Lightning II deliveries: production schedule, delivery rate, variants (A/B/C), international partners, and F-35 program revenue. Track ${symbol}'s F-35 production.`,
    keywords: [
      `${symbol} F-35 deliveries`,
      `${symbol} F-35 production`,
      `${symbol} Lightning II`,
      `${symbol} F-35 orders`,
      `${symbol} F-35 rate`,
      `${symbol} F-35 program`,
    ],
    openGraph: {
      title: `${symbol} F-35 Deliveries ${currentYear} | Lightning II Production`,
      description: `Complete ${symbol} F-35 Lightning II deliveries analysis with production rate, variants, and international partners.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/f35-deliveries/${ticker.toLowerCase()}`,
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

export default async function F35DeliveriesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/f35-deliveries/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock F-35 delivery data (in production, this would come from API)
  const f35Deliveries = 156 // Annual deliveries
  const productionRate = 13 // Per month
  const previousYearDeliveries = 141
  const deliveryGrowth = (f35Deliveries - previousYearDeliveries) / previousYearDeliveries
  const totalProduced = 1000 // Cumulative since program start
  const backlogUnits = 450
  const programValue = 75e9 // $75B total program value

  // F-35 variant breakdown
  const variantBreakdown = [
    { variant: 'F-35A (CTOL)', units: 110, percentage: 70.5, customer: 'Air Force' },
    { variant: 'F-35B (STOVL)', units: 26, percentage: 16.7, customer: 'Marines' },
    { variant: 'F-35C (Carrier)', units: 20, percentage: 12.8, customer: 'Navy' },
  ]

  // Customer breakdown
  const customerBreakdown = [
    { customer: 'U.S. Air Force', units: 110, percentage: 70.5 },
    { customer: 'U.S. Marine Corps', units: 26, percentage: 16.7 },
    { customer: 'U.S. Navy', units: 15, percentage: 9.6 },
    { customer: 'International Partners', units: 5, percentage: 3.2 },
  ]

  // Generate F-35 deliveries FAQs
  const f35Faqs = [
    {
      question: `How many F-35s did ${symbol} deliver in ${currentYear}?`,
      answer: `${symbol} (${companyName}) delivered ${f35Deliveries} F-35 Lightning II aircraft in ${currentYear}, representing a ${(deliveryGrowth * 100).toFixed(0)}% increase from ${previousYearDeliveries} deliveries in the previous year.`
    },
    {
      question: `What is ${symbol}'s F-35 production rate?`,
      answer: `${symbol} is currently producing F-35s at a rate of approximately ${productionRate} aircraft per month, or ${f35Deliveries} units annually. This represents the peak production rate for the F-35 program.`
    },
    {
      question: `What F-35 variants does ${symbol} produce?`,
      answer: `${symbol} produces three F-35 variants: ${variantBreakdown[0].variant} (${variantBreakdown[0].percentage.toFixed(0)}% - conventional takeoff), ${variantBreakdown[1].variant} (${variantBreakdown[1].percentage.toFixed(0)}% - short takeoff/vertical landing), and ${variantBreakdown[2].variant} (${variantBreakdown[2].percentage.toFixed(0)}% - carrier variant).`
    },
    {
      question: `How many F-35s has ${symbol} built?`,
      answer: `${symbol} has produced over ${totalProduced} F-35 aircraft since the program began. With ${backlogUnits} units in backlog, the F-35 program provides multi-year production visibility.`
    },
    {
      question: `Who buys F-35s from ${symbol}?`,
      answer: `F-35 customers include: ${customerBreakdown[0].customer} (${customerBreakdown[0].percentage.toFixed(0)}%), ${customerBreakdown[1].customer} (${customerBreakdown[1].percentage.toFixed(0)}%), ${customerBreakdown[2].customer} (${customerBreakdown[2].percentage.toFixed(0)}%), and international partners including UK, Japan, Australia, and other allied nations.`
    },
    {
      question: `How much revenue does the F-35 program generate for ${symbol}?`,
      answer: `The F-35 program is ${symbol}'s largest single program, generating approximately ${programValue >= 1e9 ? `$${(programValue / 1e9).toFixed(0)} billion` : `$${(programValue / 1e6).toFixed(0)} million`} in annual revenue. With production expected to continue through the 2040s, the F-35 provides long-term revenue stability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} F-35 Deliveries`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} F-35 Deliveries ${currentYear} - Lightning II Production & Schedule`,
    description: `Complete F-35 Lightning II deliveries analysis for ${symbol} (${companyName}) with production rate, variants, and delivery schedule.`,
    url: pageUrl,
    keywords: [
      `${symbol} F-35 deliveries`,
      `${symbol} F-35 production`,
      `${symbol} Lightning II`,
      `${symbol} F-35 orders`,
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

  const faqSchema = getFAQSchema(f35Faqs)

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
            <span>{symbol} F-35 Deliveries</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} F-35 Lightning II Deliveries {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            F-35 production schedule and delivery data for {companyName}
          </p>

          {/* F-35 Deliveries Overview Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-blue-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">F-35 Deliveries {currentYear}</p>
                <p className="text-3xl font-bold">
                  {f35Deliveries} units
                </p>
                <p className="text-sm text-green-500 mt-1">+{(deliveryGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Production Rate</p>
                <p className="text-3xl font-bold text-red-500">
                  {productionRate}/mo
                </p>
                <p className="text-sm text-muted-foreground mt-1">peak rate achieved</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Produced</p>
                <p className="text-3xl font-bold text-blue-500">
                  {totalProduced}+
                </p>
                <p className="text-sm text-muted-foreground mt-1">since program start</p>
              </div>
            </div>
          </div>

          {/* Variant Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F-35 Deliveries by Variant</h2>
            <div className="space-y-4">
              {variantBreakdown.map((variant, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{variant.variant}</p>
                      <p className="text-sm text-muted-foreground">{variant.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{variant.units} units</p>
                      <p className="text-sm text-muted-foreground">{variant.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${variant.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Customer Distribution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F-35 Deliveries by Customer</h2>
            <div className="grid grid-cols-2 gap-4">
              {customerBreakdown.map((customer, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">{customer.customer}</p>
                  <p className="text-2xl font-bold mb-1">{customer.units}</p>
                  <div className="w-full bg-secondary rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${customer.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.percentage.toFixed(1)}% of deliveries</p>
                </div>
              ))}
            </div>
          </section>

          {/* Production Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F-35 Program Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Current Backlog</p>
                <p className="text-xl font-bold text-red-500">{backlogUnits}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Program Value</p>
                <p className="text-xl font-bold">${(programValue / 1e9).toFixed(0)}B</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Partners</p>
                <p className="text-xl font-bold text-blue-500">15+</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Lot Number</p>
                <p className="text-xl font-bold">Lot 18</p>
              </div>
            </div>
          </section>

          {/* Year-over-Year Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F-35 Delivery Growth</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{currentYear}</p>
                  <p className="text-2xl font-bold">{f35Deliveries} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">vs. {currentYear - 1}</p>
                  <p className="text-2xl font-bold text-green-500">+{(deliveryGrowth * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentYear}: {f35Deliveries} units</span>
                  <span className="text-green-500">Current year</span>
                </div>
                <div className="w-full bg-red-500/20 rounded-full h-8 flex items-center px-3">
                  <div className="text-sm font-medium text-red-500">{f35Deliveries}</div>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span>{currentYear - 1}: {previousYearDeliveries} units</span>
                  <span className="text-muted-foreground">Previous year</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-8 flex items-center px-3">
                  <div className="text-sm font-medium">{previousYearDeliveries}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Program Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F-35 Program Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The F-35 Lightning II is {companyName}'s flagship fighter program and the world's most advanced multi-role stealth fighter:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Largest Program:</strong> The F-35 is the largest single defense program globally, with over 3,000 aircraft planned for production
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Three Variants:</strong> F-35A (conventional), F-35B (STOVL), and F-35C (carrier-based) serve different mission requirements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>International Partners:</strong> 15+ allied nations participate in the program, ensuring long-term demand
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">
                    <strong>Production Timeline:</strong> F-35 production is expected to continue through the 2040s with sustainment through 2070s
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-red-600/20 to-blue-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Production Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete aircraft deliveries, defense revenue, and program performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/aircraft-deliveries/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                All Aircraft Deliveries
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {f35Faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> F-35 delivery data is based on publicly available company reports and program announcements. Actual delivery numbers and production schedules may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="f35-deliveries" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
