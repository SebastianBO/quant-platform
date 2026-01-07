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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Restaurant Count - Total Locations & Store Growth ${currentYear}`,
    description: `${symbol} restaurant count analysis: total locations, store openings, closures, and growth trends. Track ${symbol}'s restaurant expansion strategy.`,
    keywords: [
      `${symbol} restaurant count`,
      `${symbol} total locations`,
      `${symbol} store count`,
      `${symbol} restaurant growth`,
      `${symbol} store openings`,
      `${symbol} expansion`,
    ],
    openGraph: {
      title: `${symbol} Restaurant Count ${currentYear} | Total Locations`,
      description: `Complete ${symbol} restaurant count with store growth trends and expansion analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/restaurant-count/${ticker.toLowerCase()}`,
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

export default async function RestaurantCountPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/restaurant-count/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many restaurants does ${symbol} have?`,
      answer: `${companyName} operates a network of restaurants globally. Check the latest financial reports for exact store counts, including company-owned and franchised locations.`
    },
    {
      question: `Is ${symbol} opening more restaurants?`,
      answer: `${symbol}'s restaurant count growth depends on their expansion strategy, market conditions, and franchise development. Monitor quarterly reports for store opening and closure data.`
    },
    {
      question: `How fast is ${symbol} growing its restaurant count?`,
      answer: `Restaurant count growth for ${symbol} can be tracked through quarterly earnings reports, which detail new store openings, closures, and net location changes.`
    },
    {
      question: `Does ${symbol} have more franchised or company-owned restaurants?`,
      answer: `Most restaurant chains operate a mix of company-owned and franchised locations. ${symbol}'s specific breakdown is available in their SEC filings and investor presentations.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Restaurant Count`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Restaurant Count ${currentYear} - Total Locations Analysis`,
    description: `Complete restaurant count analysis for ${symbol} (${companyName}) with growth trends and expansion strategy.`,
    url: pageUrl,
    keywords: [
      `${symbol} restaurant count`,
      `${symbol} total locations`,
      `${symbol} store count`,
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
            <span>{symbol} Restaurant Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Restaurant Count {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Total locations and store growth analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, store metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
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

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Restaurant count data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="restaurant-count" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
