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
    title: `${symbol} Gym Locations - Location Count & Expansion ${currentYear}`,
    description: `${symbol} gym locations analysis: total location count, new openings, market expansion, and geographic footprint. Analyze ${symbol}'s physical presence and growth strategy.`,
    keywords: [
      `${symbol} gym locations`,
      `${symbol} locations`,
      `${symbol} gym count`,
      `${symbol} store count`,
      `${symbol} expansion`,
      `${symbol} new gyms`,
    ],
    openGraph: {
      title: `${symbol} Gym Locations ${currentYear} | Location Count & Expansion`,
      description: `Complete ${symbol} gym location analysis with total count, expansion trends, and geographic distribution.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gym-locations/${ticker.toLowerCase()}`,
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

export default async function GymLocationsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gym-locations/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate gym locations FAQs
  const gymLocationsFaqs = [
    {
      question: `How many gym locations does ${symbol} have?`,
      answer: `${companyName} operates gym facilities across multiple markets. The total location count is reported in quarterly and annual filings, showing the company's physical footprint and market presence.`
    },
    {
      question: `Is ${symbol} opening new gym locations?`,
      answer: `Location expansion indicates growth strategy and market opportunity. ${symbol}'s new location openings, closures, and net growth are tracked in earnings reports and investor presentations.`
    },
    {
      question: `Where are ${symbol}'s gym locations?`,
      answer: `Geographic distribution affects market penetration and growth potential. ${symbol} may operate in specific regions, states, or countries. Check company disclosures for geographic breakdown of locations.`
    },
    {
      question: `What is ${symbol}'s location expansion strategy?`,
      answer: `Companies may pursue organic growth (opening new owned locations), franchising, or acquisitions. ${symbol}'s expansion strategy impacts capital requirements and revenue recognition.`
    },
    {
      question: `What is the average revenue per ${symbol} gym location?`,
      answer: `Revenue per location (or unit economics) indicates profitability and operational efficiency. Higher revenue per location suggests strong local market positioning and member density.`
    },
    {
      question: `How does ${symbol}'s location count compare to competitors?`,
      answer: `Compare ${symbol} to other gym chains and fitness centers to evaluate market share, expansion pace, and geographic coverage. Location count correlates with brand awareness and accessibility.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gym Locations`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gym Locations ${currentYear} - Location Count & Expansion Analysis`,
    description: `Complete gym location analysis for ${symbol} (${companyName}) with total count, expansion trends, and geographic distribution.`,
    url: pageUrl,
    keywords: [
      `${symbol} gym locations`,
      `${symbol} locations`,
      `${symbol} gym count`,
      `${symbol} expansion`,
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

  const faqSchema = getFAQSchema(gymLocationsFaqs)

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
            <span>{symbol} Gym Locations</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gym Locations {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Location count and expansion analysis for {companyName}
          </p>

          {/* Gym Locations Overview */}
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Gym Location Overview</h2>
            <p className="text-muted-foreground">
              {companyName}'s physical locations represent its market presence and accessibility to members.
              Location count, geographic distribution, and expansion pace indicate growth strategy and
              market penetration. Review quarterly reports for location updates and expansion plans.
            </p>
          </div>

          {/* Key Location Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Location Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Total Location Count</h3>
                <p className="text-muted-foreground">
                  Number of active gym facilities operated by the company, showing overall market presence.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">New Location Openings</h3>
                <p className="text-muted-foreground">
                  New gyms opened during the period, indicating expansion pace and growth investment.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Location Closures</h3>
                <p className="text-muted-foreground">
                  Gyms closed or consolidated, which may indicate market optimization or underperformance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average Members Per Location</h3>
                <p className="text-muted-foreground">
                  Member count divided by location count, showing location density and capacity utilization.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Location Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, expansion trends, and AI-powered insights
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
              {gymLocationsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Location data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="gym-locations" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
