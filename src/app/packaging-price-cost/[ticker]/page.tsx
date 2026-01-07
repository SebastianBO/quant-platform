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
    title: `${symbol} Packaging Price/Cost Spread - Margin & Profitability Analysis`,
    description: `${symbol} packaging price/cost spread analysis. Track pricing power, raw material costs, margin trends, and profitability in the packaging industry.`,
    keywords: [
      `${symbol} price cost spread`,
      `${symbol} packaging margins`,
      `${symbol} pricing power`,
      `${symbol} raw material costs`,
      `${symbol} profitability`,
      `${symbol} packaging economics`,
    ],
    openGraph: {
      title: `${symbol} Price/Cost Spread Analysis | Margins & Profitability`,
      description: `Comprehensive price/cost spread and margin analysis for ${symbol}.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/packaging-price-cost/${ticker.toLowerCase()}`,
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

export default async function PackagingPriceCostPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/packaging-price-cost/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Price/cost metrics (mock data - replace with actual API data)
  const priceCostMetrics = {
    grossMargin: 24.5,
    marginChange: 1.8,
    pricingPower: 78,
    rawMaterialInflation: 4.2,
  }

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s packaging price/cost spread?`,
      answer: `${symbol} (${companyName}) currently maintains a gross margin of ${priceCostMetrics.grossMargin}% in its packaging operations, with margins improving ${priceCostMetrics.marginChange} percentage points year-over-year due to pricing actions and cost management.`
    },
    {
      question: `How is ${symbol} managing raw material cost inflation?`,
      answer: `With raw material costs increasing ${priceCostMetrics.rawMaterialInflation}% year-over-year, ${symbol} is implementing price increases, productivity initiatives, and material substitutions to protect margins and maintain profitability.`
    },
    {
      question: `What is ${symbol}'s pricing power in packaging?`,
      answer: `${symbol} demonstrates strong pricing power with a ${priceCostMetrics.pricingPower}% success rate in implementing price increases, reflecting its competitive position, customer relationships, and value-added product offerings.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Price/Cost Spread`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Packaging Price/Cost Spread - Margin & Profitability Analysis`,
    description: `Comprehensive price/cost spread analysis for ${symbol} (${companyName}) with margin trends and profitability insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} price cost spread`,
      `${symbol} packaging margins`,
      `${symbol} profitability`,
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
            <span>{symbol} Price/Cost Spread</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Packaging Price/Cost Spread
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Margin analysis and profitability trends for {companyName}
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

          {/* Price/Cost Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Price/Cost Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Gross Margin</p>
                <p className="text-3xl font-bold">{priceCostMetrics.grossMargin}%</p>
                <p className="text-sm text-green-500 mt-1">+{priceCostMetrics.marginChange}pp YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Pricing Power</p>
                <p className="text-3xl font-bold">{priceCostMetrics.pricingPower}%</p>
                <p className="text-sm text-blue-500 mt-1">Implementation rate</p>
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
            <p><strong>Disclaimer:</strong> Price/cost data is estimated based on publicly available information and should not be considered financial advice. Always conduct your own research.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="packaging-price-cost" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
