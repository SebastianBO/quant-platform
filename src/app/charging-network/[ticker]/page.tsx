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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Charging Network - EV Charging Stations & Infrastructure ${currentYear}`,
    description: `${symbol} charging network analysis: number of charging stations, Supercharger locations, charging speed, network expansion, and infrastructure investments.`,
    keywords: [
      `${symbol} charging network`,
      `${symbol} charging stations`,
      `${symbol} Supercharger`,
      `${symbol} charging infrastructure`,
      `${symbol} fast charging`,
      `${symbol} charging locations`,
    ],
    openGraph: {
      title: `${symbol} Charging Network ${currentYear} | EV Infrastructure`,
      description: `Complete ${symbol} charging network analysis with station count, locations, and expansion plans.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/charging-network/${ticker.toLowerCase()}`,
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

export default async function ChargingNetworkPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/charging-network/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate charging network FAQs
  const chargingNetworkFaqs = [
    {
      question: `How many charging stations does ${symbol} have?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'operates or partners with charging networks' : 'is involved in EV charging infrastructure'}. The total number of charging stations and connectors is reported in company updates and investor presentations.`
    },
    {
      question: `Where are ${symbol}'s charging stations located?`,
      answer: `${companyName}'s charging network spans multiple regions and countries. Station locations are typically disclosed on the company website and in strategic announcements about network expansion.`
    },
    {
      question: `What is ${symbol}'s charging speed?`,
      answer: `Charging speeds vary by station type and technology. ${symbol} may offer different charging tiers including Level 2 (AC) and DC fast charging with various power outputs (kW). Check technical specifications for specific charging speeds.`
    },
    {
      question: `Is ${symbol} expanding its charging network?`,
      answer: `Charging network expansion is crucial for supporting EV adoption. ${companyName} announces network growth plans, new station openings, and partnerships during earnings calls and press releases.`
    },
    {
      question: `Can other EV brands use ${symbol}'s charging network?`,
      answer: `Some charging networks are proprietary while others are open to multiple EV brands. ${symbol} may have partnerships or agreements allowing third-party access to charging infrastructure.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Charging Network`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Charging Network ${currentYear} - EV Infrastructure Analysis`,
    description: `Complete charging network analysis for ${symbol} (${companyName}) with station count and expansion plans.`,
    url: pageUrl,
    keywords: [
      `${symbol} charging network`,
      `${symbol} charging stations`,
      `${symbol} infrastructure`,
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

  const faqSchema = getFAQSchema(chargingNetworkFaqs)

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
            <span>{symbol} Charging Network</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Charging Network {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            EV charging infrastructure and network data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">Charging Network</p>
                <p className="text-sm text-muted-foreground mt-1">Infrastructure & Growth</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Charging Network Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                A charging network consists of physical charging stations and the supporting infrastructure that
                enables electric vehicle owners to recharge their vehicles. This includes station locations,
                charging speeds, payment systems, and network accessibility.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, charging infrastructure is essential for supporting EV adoption, improving
                customer experience, and creating competitive advantages in the electric vehicle market.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Charging Networks Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Customer Convenience</h3>
                <p className="text-sm text-muted-foreground">
                  Widespread charging access reduces range anxiety and improves EV ownership experience.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Advantage</h3>
                <p className="text-sm text-muted-foreground">
                  A robust charging network differentiates EV brands and attracts customers.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Revenue Stream</h3>
                <p className="text-sm text-muted-foreground">
                  Charging services can generate recurring revenue from energy sales.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Market Enabler</h3>
                <p className="text-sm text-muted-foreground">
                  Infrastructure expansion supports broader EV market growth.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, production data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {chargingNetworkFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Charging network data is based on company announcements and public information. Network specifications may change. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="charging-network" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
