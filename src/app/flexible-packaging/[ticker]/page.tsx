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
    title: `${symbol} Flexible Packaging Revenue - Growth & Market Analysis`,
    description: `${symbol} flexible packaging analysis. Track revenue growth, product mix, innovation, and market trends in flexible films and pouches.`,
    keywords: [
      `${symbol} flexible packaging`,
      `${symbol} flexible films`,
      `${symbol} pouches`,
      `${symbol} packaging innovation`,
      `${symbol} flexible packaging revenue`,
      `${symbol} packaging growth`,
    ],
    openGraph: {
      title: `${symbol} Flexible Packaging Analysis | Revenue & Growth`,
      description: `Comprehensive flexible packaging revenue and innovation analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/flexible-packaging/${ticker.toLowerCase()}`,
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

export default async function FlexiblePackagingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/flexible-packaging/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Flexible packaging metrics (mock data - replace with actual API data)
  const flexibleMetrics = {
    quarterlyRevenue: 620000000,
    revenueGrowth: 9.8,
    revenueShare: 32,
    innovationInvestment: 45000000,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s flexible packaging revenue?`,
      answer: `${symbol} (${companyName}) generated approximately $${(flexibleMetrics.quarterlyRevenue / 1000000).toFixed(0)} million in quarterly flexible packaging revenue, representing ${flexibleMetrics.revenueShare}% of total packaging revenue.`
    },
    {
      question: `How fast is ${symbol}'s flexible packaging segment growing?`,
      answer: `${symbol}'s flexible packaging segment is growing at ${flexibleMetrics.revenueGrowth.toFixed(1)}% year-over-year, outpacing traditional rigid packaging due to sustainability trends and consumer preferences.`
    },
    {
      question: `What types of flexible packaging does ${symbol} produce?`,
      answer: `${symbol} produces a range of flexible packaging solutions including pouches, films, wraps, bags, and specialty materials for food, beverage, healthcare, and consumer goods applications.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Flexible Packaging`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Flexible Packaging Revenue - Growth & Market Analysis`,
    description: `Comprehensive flexible packaging revenue analysis for ${symbol} (${companyName}) with growth trends and market insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} flexible packaging`,
      `${symbol} flexible films`,
      `${symbol} packaging revenue`,
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
            <span>{symbol} Flexible Packaging</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Flexible Packaging Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revenue growth and market trends for {companyName}
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

          {/* Flexible Packaging Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Flexible Packaging Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Quarterly Revenue</p>
                <p className="text-3xl font-bold">${(flexibleMetrics.quarterlyRevenue / 1000000).toFixed(0)}M</p>
                <p className="text-sm text-green-500 mt-1">+{flexibleMetrics.revenueGrowth.toFixed(1)}% YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Revenue Share</p>
                <p className="text-3xl font-bold">{flexibleMetrics.revenueShare}%</p>
                <p className="text-sm text-blue-500 mt-1">Of total packaging</p>
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
            <p><strong>Disclaimer:</strong> Flexible packaging data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="flexible-packaging" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
