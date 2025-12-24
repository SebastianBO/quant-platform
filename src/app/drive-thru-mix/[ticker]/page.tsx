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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Drive-Thru Mix - Drive-Through Sales & Percentage ${currentYear}`,
    description: `${symbol} drive-thru mix analysis: drive-through sales percentage, trends, and impact on performance. Track ${symbol}'s drive-thru channel.`,
    keywords: [
      `${symbol} drive thru mix`,
      `${symbol} drive through sales`,
      `${symbol} drive thru percentage`,
      `${symbol} off-premise`,
      `${symbol} channel mix`,
      `${symbol} drive thru`,
    ],
    openGraph: {
      title: `${symbol} Drive-Thru Mix ${currentYear} | Drive-Through Sales`,
      description: `Complete ${symbol} drive-thru mix analysis with sales trends and channel performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/drive-thru-mix/${ticker.toLowerCase()}`,
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

export default async function DriveThruMixPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/drive-thru-mix/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s drive-thru mix?`,
      answer: `${symbol}'s drive-thru mix is the percentage of sales that come through the drive-through channel versus dine-in or other channels. This metric indicates customer convenience preferences and operational efficiency.`
    },
    {
      question: `Is ${symbol}'s drive-thru mix increasing?`,
      answer: `Drive-thru mix trends can be tracked through earnings calls and investor presentations. Many restaurant brands saw accelerated drive-thru adoption during COVID-19, and this shift has often persisted.`
    },
    {
      question: `Why does drive-thru mix matter for ${symbol}?`,
      answer: `Drive-thru operations typically offer faster service, higher throughput, and better unit economics than dine-in. A higher drive-thru mix can improve ${symbol}'s efficiency and profitability per location.`
    },
    {
      question: `What percentage of ${symbol}'s sales are drive-thru?`,
      answer: `Drive-thru percentages vary by brand and location type. Quick-service restaurants with drive-thrus often generate 60-75% of sales through this channel. Check ${symbol}'s investor presentations for specific data.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Drive-Thru Mix`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Drive-Thru Mix ${currentYear} - Drive-Through Sales Analysis`,
    description: `Complete drive-thru mix analysis for ${symbol} (${companyName}) with sales trends and channel performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} drive thru mix`,
      `${symbol} drive through sales`,
      `${symbol} drive thru percentage`,
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
            <span>{symbol} Drive-Thru Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Drive-Thru Mix {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Drive-through sales and channel analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, channel metrics, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Drive-thru mix data is based on publicly filed reports and company disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="drive-thru-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
