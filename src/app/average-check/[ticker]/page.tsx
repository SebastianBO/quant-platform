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
    title: `${symbol} Average Check - Customer Spending & Pricing ${currentYear}`,
    description: `${symbol} average check analysis: customer spending trends, pricing power, and ticket growth. Track ${symbol}'s revenue per transaction.`,
    keywords: [
      `${symbol} average check`,
      `${symbol} average ticket`,
      `${symbol} customer spending`,
      `${symbol} pricing`,
      `${symbol} revenue per transaction`,
      `${symbol} ticket size`,
    ],
    openGraph: {
      title: `${symbol} Average Check ${currentYear} | Customer Spending`,
      description: `Complete ${symbol} average check analysis with pricing trends and customer spending patterns.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/average-check/${ticker.toLowerCase()}`,
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

export default async function AverageCheckPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/average-check/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s average check?`,
      answer: `${symbol}'s average check (or average ticket) measures the average amount spent per customer transaction. This metric indicates pricing power and customer spending behavior.`
    },
    {
      question: `Is ${symbol}'s average check increasing?`,
      answer: `Average check growth for ${symbol} can be tracked through quarterly earnings reports. Rising average checks typically result from menu price increases, premium offerings, or upselling strategies.`
    },
    {
      question: `What drives ${symbol}'s average check growth?`,
      answer: `Average check growth is driven by pricing changes, product mix (premium vs. value items), add-on purchases, promotional activity, and overall consumer spending patterns. ${symbol}'s strategy balances pricing with traffic to optimize revenue.`
    },
    {
      question: `How does ${symbol}'s average check compare to competitors?`,
      answer: `Compare ${symbol}'s average ticket to industry peers to assess pricing positioning and brand strength. Higher average checks may indicate premium positioning or successful upselling.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Average Check`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Average Check ${currentYear} - Customer Spending Analysis`,
    description: `Complete average check analysis for ${symbol} (${companyName}) with pricing trends and customer spending patterns.`,
    url: pageUrl,
    keywords: [
      `${symbol} average check`,
      `${symbol} average ticket`,
      `${symbol} customer spending`,
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
            <span>{symbol} Average Check</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Average Check {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer spending and pricing analysis for {companyName}
          </p>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, pricing trends, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Average check data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="average-check" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
