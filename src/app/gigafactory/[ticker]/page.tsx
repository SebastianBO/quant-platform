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
    title: `${symbol} Gigafactory - Manufacturing Capacity & Production Scale ${currentYear}`,
    description: `${symbol} gigafactory analysis: factory locations, production capacity, manufacturing expansion, annual vehicle output, and facility investment plans.`,
    keywords: [
      `${symbol} gigafactory`,
      `${symbol} factory capacity`,
      `${symbol} manufacturing`,
      `${symbol} production capacity`,
      `${symbol} factory locations`,
      `${symbol} expansion plans`,
    ],
    openGraph: {
      title: `${symbol} Gigafactory ${currentYear} | Manufacturing Capacity`,
      description: `Complete ${symbol} gigafactory analysis with production capacity and expansion plans.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gigafactory/${ticker.toLowerCase()}`,
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

export default async function GigafactoryPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gigafactory/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate gigafactory FAQs
  const gigafactoryFaqs = [
    {
      question: `How many gigafactories does ${symbol} have?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'operates manufacturing facilities for vehicle and battery production' : 'is involved in large-scale manufacturing'}. The number and location of factories are disclosed in annual reports and investor presentations.`
    },
    {
      question: `What is ${symbol}'s production capacity?`,
      answer: `${companyName}'s total production capacity is measured in annual vehicle units across all manufacturing facilities. Capacity utilization rates and expansion plans are typically discussed during earnings calls and factory opening events.`
    },
    {
      question: `Where are ${symbol}'s gigafactories located?`,
      answer: `${symbol} operates or is building factories in strategic locations worldwide to serve regional markets. Factory locations are chosen based on market access, supply chain proximity, labor availability, and government incentives.`
    },
    {
      question: `Is ${symbol} building new gigafactories?`,
      answer: `Manufacturing expansion is critical for meeting production targets. ${companyName} announces new factory plans, construction timelines, and capacity targets during investor events and press releases. New facilities typically require 1-2 years to reach full production.`
    },
    {
      question: `How much does ${symbol} invest in gigafactories?`,
      answer: `Gigafactory construction requires billions in capital investment. ${symbol} reports capital expenditures (CapEx) in financial statements, with significant portions allocated to factory construction, equipment, and tooling.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gigafactory`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gigafactory ${currentYear} - Manufacturing Capacity Analysis`,
    description: `Complete gigafactory analysis for ${symbol} (${companyName}) with capacity and expansion details.`,
    url: pageUrl,
    keywords: [
      `${symbol} gigafactory`,
      `${symbol} factory capacity`,
      `${symbol} manufacturing`,
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

  const faqSchema = getFAQSchema(gigafactoryFaqs)

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
            <span>{symbol} Gigafactory</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gigafactory {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Manufacturing capacity and factory expansion for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">Gigafactory</p>
                <p className="text-sm text-muted-foreground mt-1">Production Capacity</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Gigafactory Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                A gigafactory is a large-scale manufacturing facility designed for high-volume production of
                electric vehicles and batteries. These facilities integrate vehicle assembly, battery production,
                and component manufacturing under one roof to achieve economies of scale.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, gigafactory capacity determines maximum production output, market supply
                capability, and long-term growth potential. Expanding manufacturing capacity is essential for
                meeting demand and achieving profitability through scale.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Gigafactories Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Production Scale</h3>
                <p className="text-sm text-muted-foreground">
                  Gigafactories enable mass production necessary to meet growing EV demand.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Cost Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  Large-scale manufacturing reduces per-unit costs through economies of scale.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Regional Presence</h3>
                <p className="text-sm text-muted-foreground">
                  Local factories reduce shipping costs and tariffs while serving regional markets.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Supply Chain Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Vertical integration in gigafactories improves efficiency and reduces dependencies.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, production data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {gigafactoryFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Factory capacity data is based on company announcements and public filings. Production timelines may change. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="gigafactory" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
