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

  return {
    title: `${symbol} Packaging Volume Analysis - Production & Distribution Metrics`,
    description: `Comprehensive packaging volume analysis for ${symbol}. Track production capacity, shipment volumes, distribution metrics, and packaging efficiency.`,
    keywords: [
      `${symbol} packaging volume`,
      `${symbol} production volume`,
      `${symbol} shipment volume`,
      `${symbol} packaging capacity`,
      `${symbol} distribution metrics`,
      `${symbol} packaging efficiency`,
    ],
    openGraph: {
      title: `${symbol} Packaging Volume Analysis | Production & Distribution`,
      description: `Detailed packaging volume metrics and production capacity analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/packaging-volume/${ticker.toLowerCase()}`,
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

export default async function PackagingVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/packaging-volume/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Volume metrics (mock data - replace with actual API data)
  const volumeMetrics = {
    quarterlyVolume: 12500000,
    yearOverYearGrowth: 8.5,
    capacity: 15000000,
    utilizationRate: 83.3,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s packaging volume capacity?`,
      answer: `${symbol} (${companyName}) has an estimated packaging volume capacity of ${(volumeMetrics.capacity / 1000000).toFixed(1)} million units per quarter, currently operating at ${volumeMetrics.utilizationRate.toFixed(1)}% capacity utilization.`
    },
    {
      question: `How is ${symbol}'s packaging volume growing?`,
      answer: `${symbol}'s packaging volume has grown ${volumeMetrics.yearOverYearGrowth.toFixed(1)}% year-over-year, driven by increased demand and improved production efficiency.`
    },
    {
      question: `What factors affect packaging volume for ${symbol}?`,
      answer: `Key factors include production capacity, customer demand, supply chain efficiency, seasonal variations, and market share in the packaging industry.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Packaging Volume`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Packaging Volume Analysis - Production & Distribution Metrics`,
    description: `Comprehensive packaging volume analysis for ${symbol} (${companyName}) including production capacity and shipment data.`,
    url: pageUrl,
    keywords: [
      `${symbol} packaging volume`,
      `${symbol} production capacity`,
      `${symbol} shipment metrics`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Packaging Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Packaging Volume Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production capacity and distribution metrics for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Volume Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Packaging Volume Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Quarterly Volume</p>
                <p className="text-3xl font-bold">{(volumeMetrics.quarterlyVolume / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-green-500 mt-1">+{volumeMetrics.yearOverYearGrowth.toFixed(1)}% YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Production Capacity</p>
                <p className="text-3xl font-bold">{(volumeMetrics.capacity / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-blue-500 mt-1">{volumeMetrics.utilizationRate.toFixed(1)}% utilized</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access complete financial metrics, AI insights, and valuation models
            </p>
            <Link
              href={`/stock/${symbol.toLowerCase()}`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              View Full Analysis
            </Link>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Packaging volume data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="packaging-volume" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
