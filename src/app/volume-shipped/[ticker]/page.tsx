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
    title: `${symbol} Volume Shipped - Production & Shipment Data ${currentYear}`,
    description: `${symbol} volume shipped analysis: production volumes, shipment trends, capacity utilization, and volume growth. Track ${symbol}'s operational throughput metrics.`,
    keywords: [
      `${symbol} volume shipped`,
      `${symbol} production volume`,
      `${symbol} shipment data`,
      `${symbol} capacity utilization`,
      `${symbol} throughput`,
      `${symbol} unit volume`,
    ],
    openGraph: {
      title: `${symbol} Volume Shipped ${currentYear} | Production & Shipment Analysis`,
      description: `Complete ${symbol} volume shipped data with production trends, capacity metrics, and shipment growth rates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/volume-shipped/${ticker.toLowerCase()}`,
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

export default async function VolumeShippedPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/volume-shipped/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate volume shipped FAQs
  const volumeFaqs = [
    {
      question: `What is ${symbol}'s volume shipped?`,
      answer: `${companyName} tracks production and shipment volumes across its operations. Volume shipped is a key operational metric that indicates the company's manufacturing throughput and market demand for its products.`
    },
    {
      question: `How does ${symbol}'s volume shipped affect the stock?`,
      answer: `Volume shipped directly impacts ${symbol}'s revenue generation and operational efficiency. Higher shipment volumes typically indicate strong demand, while declining volumes may signal market challenges or capacity constraints.`
    },
    {
      question: `Is ${symbol}'s volume shipped growing?`,
      answer: `Volume shipped trends vary based on market conditions, production capacity, and demand cycles${sector ? ` in the ${sector} sector` : ''}. Investors should monitor quarterly shipment data alongside revenue figures to assess operational health.`
    },
    {
      question: `What affects ${symbol}'s volume shipped?`,
      answer: `Key factors include production capacity, supply chain efficiency, customer demand, market competition, raw material availability, and seasonal patterns${industry ? ` in the ${industry} industry` : ''}.`
    },
    {
      question: `How does ${symbol} compare to competitors in volume?`,
      answer: `${companyName}'s market position${sector ? ` in the ${sector} sector` : ''} can be evaluated by comparing shipment volumes, market share, and capacity utilization against industry peers.`
    },
    {
      question: `Where can I find ${symbol}'s volume data?`,
      answer: `Volume shipped data is typically disclosed in quarterly earnings reports, investor presentations, and SEC filings. Check ${symbol}'s earnings transcripts for detailed operational metrics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Volume Shipped`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Volume Shipped ${currentYear} - Production & Shipment Analysis`,
    description: `Complete volume shipped analysis for ${symbol} (${companyName}) with production trends and capacity metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} volume shipped`,
      `${symbol} production volume`,
      `${symbol} shipment data`,
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

  const faqSchema = getFAQSchema(volumeFaqs)

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
            <span>{symbol} Volume Shipped</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Volume Shipped {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production volumes and shipment data for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Volume Metrics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operational Focus</p>
                <p className="text-xl font-bold">Production Volume</p>
                <p className="text-sm text-muted-foreground mt-1">Manufacturing throughput</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Various'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Indicator</p>
                <p className="text-xl font-bold">Capacity Utilization</p>
                <p className="text-sm text-muted-foreground mt-1">Efficiency metric</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Volume Shipped Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What is Volume Shipped?</h3>
                <p className="text-muted-foreground">
                  Volume shipped represents the quantity of products manufactured and delivered by {companyName}.
                  This operational metric provides insights into production capacity, market demand, and the company's
                  ability to fulfill customer orders.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Why It Matters</h3>
                <p className="text-muted-foreground">
                  For {symbol} investors, volume shipped data helps assess operational efficiency, market share growth,
                  and revenue potential. Strong volume growth typically indicates healthy demand, while declining volumes
                  may signal competitive pressures or market challenges.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Industry Context</h3>
                <p className="text-muted-foreground">
                  {sector ? `In the ${sector} sector, ` : ''}Volume shipped metrics are particularly important for
                  capital-intensive businesses where capacity utilization drives profitability. Investors should compare
                  {symbol}'s volume trends against industry peers and overall market conditions.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Operational Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, revenue breakdowns, and AI-powered insights
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
                Revenue Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {volumeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Operational data is based on publicly disclosed information and earnings reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="volume-shipped" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
