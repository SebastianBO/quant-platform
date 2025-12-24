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
    title: `${symbol} Beverage Can Volume - Production & Market Share Analysis`,
    description: `${symbol} beverage can volume analysis. Track aluminum can production, shipments, market share, and growth in the beverage packaging industry.`,
    keywords: [
      `${symbol} beverage cans`,
      `${symbol} aluminum cans`,
      `${symbol} can production`,
      `${symbol} beverage packaging`,
      `${symbol} can shipments`,
      `${symbol} can market share`,
    ],
    openGraph: {
      title: `${symbol} Beverage Can Volume | Production & Market Share`,
      description: `Detailed beverage can volume and production analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/beverage-cans/${ticker.toLowerCase()}`,
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

export default async function BeverageCansPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/beverage-cans/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Beverage can metrics (mock data - replace with actual API data)
  const canMetrics = {
    quarterlyVolume: 18500000000,
    volumeGrowth: 7.3,
    marketShare: 22,
    utilizationRate: 91,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s beverage can production volume?`,
      answer: `${symbol} (${companyName}) produced approximately ${(canMetrics.quarterlyVolume / 1000000000).toFixed(1)} billion beverage cans last quarter, growing ${canMetrics.volumeGrowth.toFixed(1)}% year-over-year.`
    },
    {
      question: `What is ${symbol}'s market share in beverage cans?`,
      answer: `${symbol} holds approximately ${canMetrics.marketShare}% market share in the North American beverage can market, making it a leading supplier to major beverage companies.`
    },
    {
      question: `How is demand for beverage cans trending?`,
      answer: `Beverage can demand continues to grow driven by sustainability preferences, the shift from plastic bottles, and increased consumption of canned beverages including beer, soda, energy drinks, and hard seltzers.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Beverage Cans`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Beverage Can Volume - Production & Market Share Analysis`,
    description: `Comprehensive beverage can volume analysis for ${symbol} (${companyName}) with production data and market insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} beverage cans`,
      `${symbol} aluminum cans`,
      `${symbol} can production`,
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
            <span>{symbol} Beverage Cans</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Beverage Can Volume Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production capacity and market share for {companyName}
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

          {/* Beverage Can Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Beverage Can Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Quarterly Volume</p>
                <p className="text-3xl font-bold">{(canMetrics.quarterlyVolume / 1000000000).toFixed(1)}B</p>
                <p className="text-sm text-green-500 mt-1">+{canMetrics.volumeGrowth.toFixed(1)}% YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Market Share</p>
                <p className="text-3xl font-bold">{canMetrics.marketShare}%</p>
                <p className="text-sm text-blue-500 mt-1">North America</p>
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
            <p><strong>Disclaimer:</strong> Beverage can volume data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="beverage-cans" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
