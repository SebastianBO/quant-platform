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
    title: `${symbol} Transaction Count - Customer Traffic Data ${currentYear}`,
    description: `${symbol} transaction count analysis: customer traffic trends, transaction volume growth, and retail traffic metrics for ${symbol}.`,
    keywords: [
      `${symbol} transaction count`,
      `${symbol} customer traffic`,
      `${symbol} store traffic`,
      `${symbol} transactions`,
      `${symbol} retail traffic`,
      `${symbol} foot traffic`,
    ],
    openGraph: {
      title: `${symbol} Transaction Count ${currentYear} | Customer Traffic Analysis`,
      description: `Complete ${symbol} transaction count analysis with traffic trends and customer engagement metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/transaction-count/${ticker.toLowerCase()}`,
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

export default async function TransactionCountPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/transaction-count/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate transaction count FAQs
  const transactionFaqs = [
    {
      question: `What is ${symbol}'s transaction count?`,
      answer: `${symbol} (${companyName}) transaction count refers to the total number of customer transactions completed across its retail locations and digital channels. This metric tracks how many individual purchases are made, regardless of transaction size, providing insight into customer engagement and traffic trends.`
    },
    {
      question: `How does ${symbol} measure transaction count?`,
      answer: `Transaction count for ${companyName} is measured by tallying every completed purchase transaction across all sales channels. This includes in-store point-of-sale transactions, e-commerce orders, and mobile app purchases. Growth in transaction count indicates expanding customer base or increased shopping frequency.`
    },
    {
      question: `Is ${symbol}'s transaction count growing?`,
      answer: `${symbol}'s transaction count growth reflects customer acquisition success, brand loyalty, and market penetration${sector ? ` in the ${sector} sector` : ''}. Rising transaction counts typically signal strong demand, effective marketing, and improved customer retention.`
    },
    {
      question: `Why is transaction count important for ${symbol}?`,
      answer: `For ${companyName}, transaction count is a critical leading indicator of revenue health. Higher transaction volume demonstrates customer engagement strength and provides opportunities for upselling, cross-selling, and building long-term customer relationships that drive sustainable growth.`
    },
    {
      question: `What drives ${symbol}'s transaction count?`,
      answer: `${symbol}'s transaction count is influenced by store traffic, digital engagement, marketing effectiveness, product assortment, pricing strategies, and seasonal shopping patterns${industry ? ` within the ${industry} industry` : ''}. Economic conditions and competitive dynamics also impact transaction volumes.`
    },
    {
      question: `How does ${symbol}'s transaction count affect revenue?`,
      answer: `Transaction count combined with average transaction value determines ${companyName}'s total revenue. Even with stable transaction values, growing transaction counts drive revenue expansion by reaching more customers${sector ? ` in the ${sector} market` : ''}. Declining transactions may signal market share loss or reduced customer engagement.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Transaction Count`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Transaction Count ${currentYear} - Customer Traffic Analysis`,
    description: `Complete transaction count analysis for ${symbol} (${companyName}) with traffic trends and customer engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} transaction count`,
      `${symbol} customer traffic`,
      `${symbol} store traffic`,
      `${symbol} retail traffic`,
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

  const faqSchema = getFAQSchema(transactionFaqs)

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
            <span>{symbol} Transaction Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Transaction Count {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer traffic and transaction volume analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Transaction Count</h2>
            <p className="text-muted-foreground leading-relaxed">
              Transaction count measures the total number of customer purchases at {companyName} across all channels. This metric tracks customer engagement, store traffic effectiveness, and shopping frequency, providing crucial insights into demand trends and market penetration.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Transaction Count Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Engagement</h3>
                <p className="text-muted-foreground text-sm">
                  Rising transaction counts indicate {symbol} is successfully attracting customers and encouraging repeat purchases through effective merchandising.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Foundation</h3>
                <p className="text-muted-foreground text-sm">
                  Transaction volume combined with average ticket size determines total sales, making this a fundamental driver of {companyName}'s revenue growth.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Penetration</h3>
                <p className="text-muted-foreground text-sm">
                  Growing transactions suggest {symbol} is expanding its customer base{sector ? ` within the ${sector} sector` : ''} and gaining market share.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Operational Health</h3>
                <p className="text-muted-foreground text-sm">
                  Transaction trends reveal the effectiveness of {companyName}'s marketing, store operations, and digital commerce strategies.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-purple-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete transaction data, customer metrics, and AI-powered retail insights
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
              {transactionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Transaction count data is derived from company disclosures and public filings. Reporting methodologies may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
