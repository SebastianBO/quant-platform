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
    title: `${symbol} Battery Capacity - EV Battery Production & Energy Storage ${currentYear}`,
    description: `${symbol} battery capacity analysis: production capacity (GWh), battery technology, energy density, and manufacturing scale. Track ${symbol}'s battery production capabilities.`,
    keywords: [
      `${symbol} battery capacity`,
      `${symbol} battery production`,
      `${symbol} GWh capacity`,
      `${symbol} battery technology`,
      `${symbol} energy storage`,
      `${symbol} battery manufacturing`,
    ],
    openGraph: {
      title: `${symbol} Battery Capacity ${currentYear} | EV Battery Production`,
      description: `Complete ${symbol} battery capacity analysis with production scale, technology, and expansion plans.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/battery-capacity/${ticker.toLowerCase()}`,
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

export default async function BatteryCapacityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/battery-capacity/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate battery capacity FAQs
  const batteryCapacityFaqs = [
    {
      question: `What is ${symbol}'s battery production capacity?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'manufactures or sources batteries for electric vehicles' : 'is involved in battery production or energy storage'}. Battery capacity is typically measured in gigawatt-hours (GWh) of annual production capability.`
    },
    {
      question: `How much battery capacity does ${symbol} have?`,
      answer: `${companyName} reports battery production capacity in earnings calls and investor presentations. This includes both current capacity and planned expansions through new manufacturing facilities.`
    },
    {
      question: `What battery technology does ${symbol} use?`,
      answer: `${symbol} may utilize various battery technologies including lithium-ion, LFP (lithium iron phosphate), NMC (nickel manganese cobalt), or next-generation battery chemistry. Check company announcements for specific technology details.`
    },
    {
      question: `Is ${symbol} expanding battery production capacity?`,
      answer: `Battery capacity expansion is crucial for meeting EV production targets. ${companyName} announces capacity expansion plans, new battery factories, and partnerships during earnings calls and strategic updates.`
    },
    {
      question: `How does ${symbol}'s battery capacity compare to competitors?`,
      answer: `Compare ${symbol} to other battery manufacturers and automotive companies to assess production scale and competitive positioning in the battery market.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Battery Capacity`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Battery Capacity ${currentYear} - Production & Technology Analysis`,
    description: `Complete battery capacity analysis for ${symbol} (${companyName}) with production scale and expansion plans.`,
    url: pageUrl,
    keywords: [
      `${symbol} battery capacity`,
      `${symbol} battery production`,
      `${symbol} GWh capacity`,
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

  const faqSchema = getFAQSchema(batteryCapacityFaqs)

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
            <span>{symbol} Battery Capacity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Battery Capacity {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Battery production capacity and technology for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">Battery Capacity</p>
                <p className="text-sm text-muted-foreground mt-1">Production & Technology</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Battery Capacity Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Battery capacity refers to the total production capability of battery cells and packs, typically
                measured in gigawatt-hours (GWh) per year. This metric is critical for understanding a company's
                ability to meet EV production targets and energy storage demand.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, battery capacity determines production scaling, cost reduction through economies
                of scale, and competitive positioning in the electric vehicle and energy storage markets.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Battery Capacity Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Production Scale</h3>
                <p className="text-sm text-muted-foreground">
                  Higher battery capacity enables increased EV production and market growth.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Cost Reduction</h3>
                <p className="text-sm text-muted-foreground">
                  Scale manufacturing reduces per-unit battery costs and improves margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Energy Density</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced battery technology improves vehicle range and performance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Supply Chain Control</h3>
                <p className="text-sm text-muted-foreground">
                  In-house battery production reduces dependency on external suppliers.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, production data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {batteryCapacityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Battery capacity data is based on company announcements and public filings. Technology specifications may change. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="battery-capacity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
