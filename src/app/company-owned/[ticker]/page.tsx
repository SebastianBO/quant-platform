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
    title: `${symbol} Company-Owned Stores - Corporate Location Count ${currentYear}`,
    description: `${symbol} company-owned store analysis: corporate location count, growth trends, and performance. Track ${symbol}'s company-operated restaurants.`,
    keywords: [
      `${symbol} company owned stores`,
      `${symbol} corporate stores`,
      `${symbol} company operated`,
      `${symbol} corporate locations`,
      `${symbol} owned vs franchised`,
      `${symbol} store ownership`,
    ],
    openGraph: {
      title: `${symbol} Company-Owned Stores ${currentYear} | Corporate Locations`,
      description: `Complete ${symbol} company-owned store analysis with growth trends and performance metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/company-owned/${ticker.toLowerCase()}`,
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

export default async function CompanyOwnedPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/company-owned/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many company-owned stores does ${symbol} have?`,
      answer: `${symbol}'s company-owned (corporate) store count is disclosed in quarterly and annual reports. These are locations operated directly by the company, not by franchisees.`
    },
    {
      question: `What's the difference between company-owned and franchised stores?`,
      answer: `Company-owned stores are operated directly by ${symbol}, with the company bearing all costs and retaining all revenue. Franchised stores are owned/operated by independent franchisees who pay ${symbol} royalties and fees.`
    },
    {
      question: `Is ${symbol} growing company-owned locations?`,
      answer: `Company-owned store growth varies by strategy. Some companies focus on franchising (lower capital, higher margins) while others maintain more corporate control through company ownership. Check ${symbol}'s quarterly reports for unit development plans.`
    },
    {
      question: `Which is more profitable for ${symbol}: company-owned or franchised?`,
      answer: `Company-owned stores generate higher revenue but require capital investment and carry operational risk. Franchised operations provide royalty income with higher margins and less capital. The optimal mix depends on ${symbol}'s strategy.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Company-Owned Stores`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Company-Owned Stores ${currentYear} - Corporate Location Analysis`,
    description: `Complete company-owned store analysis for ${symbol} (${companyName}) with growth trends and performance metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} company owned stores`,
      `${symbol} corporate stores`,
      `${symbol} company operated`,
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
            <span>{symbol} Company-Owned Stores</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Company-Owned Stores {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Corporate location count and performance analysis for {companyName}
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
            <p><strong>Disclaimer:</strong> Company-owned store data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="company-owned" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
