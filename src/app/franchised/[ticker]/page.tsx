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
    title: `${symbol} Franchised Locations - Franchise Store Count ${currentYear}`,
    description: `${symbol} franchised location analysis: franchise store count, growth trends, and system expansion. Track ${symbol}'s franchise network.`,
    keywords: [
      `${symbol} franchised locations`,
      `${symbol} franchise stores`,
      `${symbol} franchise count`,
      `${symbol} franchisee network`,
      `${symbol} franchise system`,
      `${symbol} franchise growth`,
    ],
    openGraph: {
      title: `${symbol} Franchised Locations ${currentYear} | Franchise Network`,
      description: `Complete ${symbol} franchised location analysis with growth trends and system expansion.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/franchised/${ticker.toLowerCase()}`,
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

export default async function FranchisedPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/franchised/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many franchised locations does ${symbol} have?`,
      answer: `${symbol}'s franchised location count is disclosed in quarterly and annual reports. Franchised stores are owned and operated by independent franchisees, not by ${symbol} directly.`
    },
    {
      question: `Is ${symbol} growing its franchise system?`,
      answer: `Franchise growth for ${symbol} depends on franchisee demand, market opportunity, and brand strength. Strong franchise systems can expand rapidly with lower capital requirements than company-owned growth.`
    },
    {
      question: `What percentage of ${symbol}'s stores are franchised?`,
      answer: `The franchise mix varies by company. Highly franchised brands may have 90%+ franchised locations, while others maintain more company ownership for control. Check ${symbol}'s investor presentations for the current mix.`
    },
    {
      question: `Why does ${symbol} use franchising?`,
      answer: `Franchising allows ${symbol} to expand rapidly with lower capital investment. Franchisees invest their own capital and assume operational risk, while ${symbol} earns royalties and fees with higher margins.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Franchised Locations`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Franchised Locations ${currentYear} - Franchise Network Analysis`,
    description: `Complete franchised location analysis for ${symbol} (${companyName}) with growth trends and system expansion.`,
    url: pageUrl,
    keywords: [
      `${symbol} franchised locations`,
      `${symbol} franchise stores`,
      `${symbol} franchise count`,
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
            <span>{symbol} Franchised Locations</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Franchised Locations {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Franchise store count and network analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, franchise metrics, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Franchised location data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="franchised" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
