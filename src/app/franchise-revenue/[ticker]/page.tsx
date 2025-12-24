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
    title: `${symbol} Franchise Revenue - Royalty & Fee Income ${currentYear}`,
    description: `${symbol} franchise revenue analysis: royalty income, franchise fees, and licensing revenue. Track ${symbol}'s franchise business performance.`,
    keywords: [
      `${symbol} franchise revenue`,
      `${symbol} royalty income`,
      `${symbol} franchise fees`,
      `${symbol} licensing revenue`,
      `${symbol} franchise business`,
      `${symbol} royalties`,
    ],
    openGraph: {
      title: `${symbol} Franchise Revenue ${currentYear} | Royalty Income`,
      description: `Complete ${symbol} franchise revenue analysis with royalty income and fee trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/franchise-revenue/${ticker.toLowerCase()}`,
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

export default async function FranchiseRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/franchise-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s franchise revenue?`,
      answer: `${symbol}'s franchise revenue includes royalty payments (typically a percentage of franchisee sales), franchise fees for new locations, and other licensing income. This is a high-margin business segment.`
    },
    {
      question: `How does ${symbol} make money from franchises?`,
      answer: `${symbol} earns franchise revenue through: (1) Ongoing royalties (% of sales), (2) Initial franchise fees for new stores, (3) Marketing/advertising fund contributions, and (4) Real estate income in some cases.`
    },
    {
      question: `Is ${symbol}'s franchise revenue growing?`,
      answer: `Franchise revenue growth for ${symbol} depends on franchisee sales performance (which drives royalties) and new franchise unit development. Check quarterly reports for segment revenue breakdowns.`
    },
    {
      question: `What percentage of ${symbol}'s revenue comes from franchises?`,
      answer: `The franchise mix varies by company. Highly franchised concepts may generate 60-90% of revenue from franchise operations, which typically carry higher profit margins than company-operated stores.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Franchise Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Franchise Revenue ${currentYear} - Royalty Income Analysis`,
    description: `Complete franchise revenue analysis for ${symbol} (${companyName}) with royalty income and fee trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} franchise revenue`,
      `${symbol} royalty income`,
      `${symbol} franchise fees`,
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
            <span>{symbol} Franchise Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Franchise Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Royalty income and franchise fee analysis for {companyName}
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
            <p><strong>Disclaimer:</strong> Franchise revenue data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="franchise-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
