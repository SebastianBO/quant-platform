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
    title: `${symbol} Comparable Store Sales - Comp Sales Data ${currentYear}`,
    description: `${symbol} comparable store sales (comp sales) analysis: same-store sales growth, comp sales trends, and retail performance metrics for ${symbol}.`,
    keywords: [
      `${symbol} comp sales`,
      `${symbol} comparable store sales`,
      `${symbol} same store sales`,
      `${symbol} SSS`,
      `${symbol} retail performance`,
      `${symbol} comp sales growth`,
    ],
    openGraph: {
      title: `${symbol} Comparable Store Sales ${currentYear} | Comp Sales Analysis`,
      description: `Complete ${symbol} comparable store sales analysis with growth trends and retail performance metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/comparable-sales/${ticker.toLowerCase()}`,
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

export default async function ComparableSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/comparable-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate comparable sales FAQs
  const compSalesFaqs = [
    {
      question: `What are ${symbol}'s comparable store sales?`,
      answer: `${symbol} (${companyName}) comparable store sales, also known as comp sales or same-store sales, measure revenue growth from existing locations operating for at least 12 months. This metric excludes revenue from newly opened or recently closed stores, providing a clearer picture of ${sector ? `${sector} sector ` : ''}retail performance.`
    },
    {
      question: `How does ${symbol} calculate comp sales?`,
      answer: `Comp sales for ${companyName} are calculated by comparing sales from stores that have been open for at least one year, eliminating the impact of new store openings or closures. This allows investors to assess the underlying health of ${symbol}'s existing store base and operational efficiency.`
    },
    {
      question: `Are ${symbol}'s comp sales growing?`,
      answer: `${symbol}'s comparable store sales performance reflects consumer demand trends, pricing power, and competitive positioning${sector ? ` in the ${sector} sector` : ''}. Positive comp sales growth typically indicates strong brand momentum and effective merchandising strategies.`
    },
    {
      question: `Why are comp sales important for ${symbol}?`,
      answer: `For ${companyName}, comp sales are a critical metric because they reveal organic growth separate from expansion. Strong comp sales growth suggests ${symbol} is gaining market share, improving customer engagement, and optimizing its existing footprint rather than relying solely on new store openings.`
    },
    {
      question: `What drives ${symbol}'s comp sales performance?`,
      answer: `${symbol}'s comp sales are influenced by factors including foot traffic, average transaction value, product mix, promotional strategies, e-commerce integration, and broader economic conditions${industry ? ` within the ${industry} industry` : ''}. Seasonal trends and competitive dynamics also play significant roles.`
    },
    {
      question: `How do ${symbol}'s comp sales compare to competitors?`,
      answer: `Comparing ${symbol}'s comp sales growth to industry peers provides insights into relative market performance. Higher comp sales growth than competitors typically signals stronger operational execution${sector ? ` in the ${sector} sector` : ''}, better customer loyalty, and more effective merchandising.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Comparable Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Comparable Store Sales ${currentYear} - Comp Sales Analysis`,
    description: `Complete comparable store sales analysis for ${symbol} (${companyName}) with growth trends and retail performance metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} comp sales`,
      `${symbol} comparable store sales`,
      `${symbol} same store sales`,
      `${symbol} retail performance`,
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

  const faqSchema = getFAQSchema(compSalesFaqs)

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
            <span>{symbol} Comparable Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Comparable Store Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comp sales performance and same-store sales analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Comparable Store Sales</h2>
            <p className="text-muted-foreground leading-relaxed">
              Comparable store sales (comp sales or same-store sales) measure revenue growth from {companyName} locations operating for at least 12 months. This metric excludes new store openings and closures, providing insight into organic growth and the health of existing operations.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Comp Sales Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Organic Growth Indicator</h3>
                <p className="text-muted-foreground text-sm">
                  Comp sales reveal {symbol}'s ability to grow revenue from existing locations, independent of expansion strategies or store count changes.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Operational Efficiency</h3>
                <p className="text-muted-foreground text-sm">
                  Strong comp sales growth indicates effective merchandising, pricing power, and customer engagement at {companyName}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Share Trends</h3>
                <p className="text-muted-foreground text-sm">
                  Positive comp sales often signal {symbol} is gaining market share and outperforming competitors{sector ? ` in the ${sector} sector` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Investment Quality Signal</h3>
                <p className="text-muted-foreground text-sm">
                  Consistent comp sales growth demonstrates sustainable business momentum and reduces reliance on new store expansion.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete comparable sales data, traffic metrics, and AI-powered retail insights
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
                Revenue Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {compSalesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Comparable store sales data is derived from company disclosures and public filings. Methodologies may vary by company. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
