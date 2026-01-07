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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Sustainable Packaging - ESG Initiatives & Environmental Impact`,
    description: `${symbol} sustainable packaging analysis. Track recycled content, carbon footprint reduction, circular economy initiatives, and ESG performance.`,
    keywords: [
      `${symbol} sustainable packaging`,
      `${symbol} recycled packaging`,
      `${symbol} ESG packaging`,
      `${symbol} circular economy`,
      `${symbol} carbon footprint`,
      `${symbol} environmental impact`,
    ],
    openGraph: {
      title: `${symbol} Sustainable Packaging | ESG & Environmental Initiatives`,
      description: `Comprehensive sustainable packaging and ESG analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sustainable-packaging/${ticker.toLowerCase()}`,
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

export default async function SustainablePackagingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/sustainable-packaging/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Sustainability metrics (mock data - replace with actual API data)
  const sustainabilityMetrics = {
    recycledContent: 42,
    carbonReduction: 28,
    renewableEnergy: 55,
    sustainableRevenue: 38,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What are ${symbol}'s sustainable packaging goals?`,
      answer: `${symbol} (${companyName}) is committed to increasing recycled content to ${sustainabilityMetrics.recycledContent}%+ across its product portfolio, reducing carbon emissions by ${sustainabilityMetrics.carbonReduction}%, and transitioning to ${sustainabilityMetrics.renewableEnergy}% renewable energy.`
    },
    {
      question: `How much of ${symbol}'s revenue comes from sustainable packaging?`,
      answer: `Approximately ${sustainabilityMetrics.sustainableRevenue}% of ${symbol}'s revenue comes from sustainable packaging solutions, including products made with recycled materials, lightweight designs, and circular economy initiatives.`
    },
    {
      question: `What sustainable packaging innovations is ${symbol} developing?`,
      answer: `${symbol} is investing in biodegradable materials, plant-based packaging, advanced recycling technologies, and design-for-recycling initiatives to reduce environmental impact and meet customer sustainability demands.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Sustainable Packaging`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Sustainable Packaging - ESG Initiatives & Environmental Impact`,
    description: `Comprehensive sustainable packaging and ESG analysis for ${symbol} (${companyName}) with environmental impact data.`,
    url: pageUrl,
    keywords: [
      `${symbol} sustainable packaging`,
      `${symbol} ESG`,
      `${symbol} circular economy`,
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
            <span>{symbol} Sustainable Packaging</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Sustainable Packaging Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            ESG initiatives and environmental impact for {companyName}
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

          {/* Sustainability Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Sustainability Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Recycled Content</p>
                <p className="text-3xl font-bold">{sustainabilityMetrics.recycledContent}%</p>
                <p className="text-sm text-green-500 mt-1">Increasing annually</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Carbon Reduction</p>
                <p className="text-3xl font-bold">{sustainabilityMetrics.carbonReduction}%</p>
                <p className="text-sm text-blue-500 mt-1">Since baseline</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Renewable Energy</p>
                <p className="text-3xl font-bold">{sustainabilityMetrics.renewableEnergy}%</p>
                <p className="text-sm text-green-500 mt-1">Of operations</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Sustainable Revenue</p>
                <p className="text-3xl font-bold">{sustainabilityMetrics.sustainableRevenue}%</p>
                <p className="text-sm text-blue-500 mt-1">And growing</p>
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
            <p><strong>Disclaimer:</strong> Sustainability data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="sustainable-packaging" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
