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
    title: `${symbol} Traffic - Customer Visit Trends & Foot Traffic ${currentYear}`,
    description: `${symbol} traffic analysis: customer visit trends, foot traffic patterns, and transaction counts. Track ${symbol}'s customer volume growth.`,
    keywords: [
      `${symbol} traffic`,
      `${symbol} customer traffic`,
      `${symbol} foot traffic`,
      `${symbol} customer visits`,
      `${symbol} transaction count`,
      `${symbol} visit trends`,
    ],
    openGraph: {
      title: `${symbol} Traffic ${currentYear} | Customer Visit Trends`,
      description: `Complete ${symbol} traffic analysis with customer visit trends and transaction patterns.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/traffic/${ticker.toLowerCase()}`,
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

export default async function TrafficPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/traffic/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What are ${symbol}'s traffic trends?`,
      answer: `${symbol}'s traffic (customer visit count) indicates store demand and brand strength. Traffic growth is a key driver of comp sales, alongside average check increases.`
    },
    {
      question: `Is ${symbol}'s customer traffic growing?`,
      answer: `${symbol}'s traffic trends can be tracked through quarterly earnings reports and management commentary. Many companies report traffic growth separately from ticket growth to explain comp sales performance.`
    },
    {
      question: `What drives ${symbol}'s traffic?`,
      answer: `Traffic is driven by marketing effectiveness, brand awareness, product innovation, convenience (location/delivery), competitive positioning, and overall consumer demand. ${symbol}'s traffic trends reflect its ability to attract customers.`
    },
    {
      question: `How do traffic and average check combine?`,
      answer: `Same-restaurant sales growth = Traffic growth + Average check growth. ${symbol} can grow comps through either increasing customer visits (traffic) or increasing spending per visit (average check), or both.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Traffic`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Traffic ${currentYear} - Customer Visit Trends`,
    description: `Complete traffic analysis for ${symbol} (${companyName}) with customer visit trends and transaction patterns.`,
    url: pageUrl,
    keywords: [
      `${symbol} traffic`,
      `${symbol} customer traffic`,
      `${symbol} foot traffic`,
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
            <span>{symbol} Traffic</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Traffic {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer visit trends and foot traffic analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, traffic trends, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Traffic data is based on publicly filed reports and company disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="traffic" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
