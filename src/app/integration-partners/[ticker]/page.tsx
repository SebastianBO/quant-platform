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

  return {
    title: `${symbol} Integration Partners - Ecosystem & Partnership Strategy`,
    description: `${symbol} integration partners analysis. Track strategic partnerships, integration ecosystem, platform connectivity, and partner-driven revenue.`,
    keywords: [
      `${symbol} integrations`,
      `${symbol} partners`,
      `${symbol} ecosystem`,
      `${symbol} API integrations`,
      `${symbol} partnerships`,
      `${symbol} platform integrations`,
    ],
    openGraph: {
      title: `${symbol} Integration Partners | Ecosystem Analysis`,
      description: `Comprehensive analysis of ${symbol} integration partnerships and ecosystem strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/integration-partners/${ticker.toLowerCase()}`,
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

export default async function IntegrationPartnersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/integration-partners/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many integration partners does ${symbol} have?`,
      answer: `${symbol} (${companyName}) reports integration partnerships as a key component of its platform strategy. The number of integrations reflects ecosystem breadth and product connectivity.`
    },
    {
      question: `What types of integrations does ${symbol} offer?`,
      answer: `${companyName}'s integration ecosystem typically includes CRM systems, productivity tools, communication platforms, data sources, and industry-specific applications.`
    },
    {
      question: `How do integrations drive ${symbol}'s growth?`,
      answer: `Integrations increase product stickiness, reduce switching costs, enable new use cases, and expand addressable market for ${companyName}.`
    },
    {
      question: `Does ${symbol} have strategic technology partners?`,
      answer: `${companyName} often announces strategic partnerships with major technology platforms, cloud providers, and enterprise software vendors to expand distribution and capabilities.`
    },
    {
      question: `What is ${symbol}'s partner program like?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}partner programs provide API access, technical support, co-marketing opportunities, and revenue sharing arrangements.`
    },
    {
      question: `How does the integration ecosystem affect ${symbol} valuation?`,
      answer: `A strong integration ecosystem creates network effects, competitive moats, and platform lock-in, which investors value highly in ${symbol}'s assessment.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Integration Partners`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Integration Partners - Ecosystem & Partnership Strategy`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) integration partnerships and ecosystem.`,
    url: pageUrl,
    keywords: [
      `${symbol} integrations`,
      `${symbol} partners`,
      `${symbol} ecosystem`,
      `${symbol} partnerships`,
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
            <span>{symbol} Integration Partners</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Integration Partners
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ecosystem and partnership strategy for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Integration Partners Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Integration Partners Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Integration partnerships enable {companyName}'s platform to connect with complementary tools and systems.
                These integrations expand product capabilities, improve user workflows, and create ecosystem lock-in.
              </p>
              <p className="text-muted-foreground">
                A robust integration ecosystem is a key competitive advantage and growth driver for platform companies.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Partnership Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(snapshot.market_cap / 1e9).toFixed(1)}B
                </p>
              </div>
              {metrics?.revenue_growth && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(metrics.revenue_growth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {metrics?.gross_margin && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-xl font-bold">{(metrics.gross_margin * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </section>

          {/* Integration Strategy Value */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Integration Partnerships Matter</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Network Effects:</strong> More integrations attract more users, creating a virtuous cycle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Switching Costs:</strong> Deep integrations make it harder for customers to leave</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Distribution:</strong> Partners provide new customer acquisition channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Product Enhancement:</strong> Integrations extend capabilities without internal development</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Ecosystem Growth</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed partnership metrics, ecosystem analysis, and competitive positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
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
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="integration-partners" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
