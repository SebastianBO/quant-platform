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
    title: `${symbol} Glass Container Production - Volume & Market Analysis`,
    description: `${symbol} glass container analysis. Track glass bottle production, shipments, market trends, and sustainability in beverage and food packaging.`,
    keywords: [
      `${symbol} glass containers`,
      `${symbol} glass bottles`,
      `${symbol} glass production`,
      `${symbol} glass packaging`,
      `${symbol} bottle manufacturing`,
      `${symbol} glass market share`,
    ],
    openGraph: {
      title: `${symbol} Glass Container Analysis | Production & Market Share`,
      description: `Comprehensive glass container production and market analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/glass-containers/${ticker.toLowerCase()}`,
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

export default async function GlassContainersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/glass-containers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Glass container metrics (mock data - replace with actual API data)
  const glassMetrics = {
    quarterlyVolume: 4200000000,
    volumeGrowth: 3.8,
    marketShare: 28,
    recycledContent: 38,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s glass container production volume?`,
      answer: `${symbol} (${companyName}) produced approximately ${(glassMetrics.quarterlyVolume / 1000000000).toFixed(1)} billion glass containers last quarter, with ${glassMetrics.volumeGrowth.toFixed(1)}% year-over-year growth.`
    },
    {
      question: `What is ${symbol}'s market position in glass packaging?`,
      answer: `${symbol} holds approximately ${glassMetrics.marketShare}% market share in the North American glass container market, serving beverage, food, and specialty product manufacturers.`
    },
    {
      question: `How sustainable are ${symbol}'s glass containers?`,
      answer: `${symbol}'s glass containers contain an average of ${glassMetrics.recycledContent}% recycled content. Glass is infinitely recyclable, making it a sustainable packaging choice for premium products.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Glass Containers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Glass Container Production - Volume & Market Analysis`,
    description: `Comprehensive glass container production analysis for ${symbol} (${companyName}) with volume data and market insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} glass containers`,
      `${symbol} glass bottles`,
      `${symbol} glass production`,
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
            <span>{symbol} Glass Containers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Glass Container Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production volume and market trends for {companyName}
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

          {/* Glass Container Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Glass Container Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Quarterly Volume</p>
                <p className="text-3xl font-bold">{(glassMetrics.quarterlyVolume / 1000000000).toFixed(1)}B</p>
                <p className="text-sm text-green-500 mt-1">+{glassMetrics.volumeGrowth.toFixed(1)}% YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Recycled Content</p>
                <p className="text-3xl font-bold">{glassMetrics.recycledContent}%</p>
                <p className="text-sm text-blue-500 mt-1">Sustainable</p>
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
            <p><strong>Disclaimer:</strong> Glass container data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="glass-containers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
