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
    title: `${symbol} Average Ticket Size - Customer Spend Data ${currentYear}`,
    description: `${symbol} average ticket size analysis: average transaction value, basket size trends, and customer spending metrics for ${symbol}.`,
    keywords: [
      `${symbol} average ticket`,
      `${symbol} average transaction value`,
      `${symbol} basket size`,
      `${symbol} customer spend`,
      `${symbol} ATV`,
      `${symbol} average purchase`,
    ],
    openGraph: {
      title: `${symbol} Average Ticket Size ${currentYear} | Customer Spend Analysis`,
      description: `Complete ${symbol} average ticket analysis with spending trends and transaction value metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/average-ticket/${ticker.toLowerCase()}`,
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

export default async function AverageTicketPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/average-ticket/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate average ticket FAQs
  const ticketFaqs = [
    {
      question: `What is ${symbol}'s average ticket size?`,
      answer: `${symbol} (${companyName}) average ticket size, also known as average transaction value (ATV), measures the average dollar amount spent per customer transaction. This metric is calculated by dividing total sales revenue by the number of transactions, revealing how much customers typically spend per visit or purchase.`
    },
    {
      question: `How does ${symbol} calculate average ticket?`,
      answer: `Average ticket for ${companyName} is determined by dividing total sales revenue by total transaction count over a specific period. This metric reflects the combined impact of product pricing, mix of items purchased, and upselling effectiveness across ${symbol}'s retail operations.`
    },
    {
      question: `Is ${symbol}'s average ticket growing?`,
      answer: `${symbol}'s average ticket growth indicates pricing power, successful product mix strategies, and effective cross-selling${sector ? ` in the ${sector} sector` : ''}. Rising average tickets often signal premium brand positioning, improved merchandising, or customers buying more items per transaction.`
    },
    {
      question: `Why is average ticket important for ${symbol}?`,
      answer: `For ${companyName}, average ticket is crucial because it directly impacts revenue efficiency. Higher average tickets mean ${symbol} generates more revenue per customer interaction, improving profitability without necessarily increasing traffic or transaction volume.`
    },
    {
      question: `What drives ${symbol}'s average ticket size?`,
      answer: `${symbol}'s average ticket is influenced by product pricing strategies, merchandise mix, promotional effectiveness, bundling tactics, and customer demographics${industry ? ` within the ${industry} industry` : ''}. Premium product adoption and successful upselling drive ticket growth.`
    },
    {
      question: `How can ${symbol} increase average ticket?`,
      answer: `${companyName} can grow average ticket through strategic pricing, product bundling, loyalty program incentives, personalized recommendations, and training staff for effective upselling${sector ? ` in the ${sector} market` : ''}. Digital tools and data analytics also help optimize basket sizes.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Average Ticket`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Average Ticket Size ${currentYear} - Customer Spend Analysis`,
    description: `Complete average ticket analysis for ${symbol} (${companyName}) with spending trends and transaction value metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} average ticket`,
      `${symbol} average transaction value`,
      `${symbol} basket size`,
      `${symbol} customer spend`,
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

  const faqSchema = getFAQSchema(ticketFaqs)

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
            <span>{symbol} Average Ticket</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Average Ticket Size {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Average transaction value and customer spending analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Average Ticket Size</h2>
            <p className="text-muted-foreground leading-relaxed">
              Average ticket size (average transaction value) for {companyName} measures how much customers spend per purchase on average. Calculated as total revenue divided by transaction count, this metric reveals pricing power, product mix effectiveness, and customer purchasing behavior.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Average Ticket Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Efficiency</h3>
                <p className="text-muted-foreground text-sm">
                  Higher average tickets enable {symbol} to generate more revenue from each customer interaction, improving sales efficiency and profitability.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Pricing Power</h3>
                <p className="text-muted-foreground text-sm">
                  Growing average tickets often indicate {companyName} can command premium pricing{sector ? ` in the ${sector} sector` : ''} and maintain strong brand value.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Upselling Success</h3>
                <p className="text-muted-foreground text-sm">
                  Rising ticket sizes demonstrate {symbol}'s effectiveness at cross-selling, bundling products, and encouraging customers to purchase more items.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Value</h3>
                <p className="text-muted-foreground text-sm">
                  Average ticket reflects the economic value of {companyName}'s customer base and their willingness to spend{industry ? ` on ${industry} products` : ''}.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete transaction metrics, revenue data, and AI-powered retail insights
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
              {ticketFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Average ticket data is derived from company disclosures and public filings. Calculation methodologies may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
