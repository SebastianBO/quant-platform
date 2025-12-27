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
    title: `${symbol} Services Revenue - Professional Services & Fees ${currentYear}`,
    description: `${symbol} services revenue data: professional service fees, service revenue growth, revenue mix, service offerings. Analyze ${symbol}'s services revenue performance.`,
    keywords: [
      `${symbol} services revenue`,
      `${symbol} service fees`,
      `${symbol} professional services`,
      `${symbol} service revenue growth`,
      `${symbol} revenue mix`,
    ],
    openGraph: {
      title: `${symbol} Services Revenue ${currentYear} | Service Fee Analysis`,
      description: `Complete ${symbol} services revenue analysis with growth trends and service revenue breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/services-revenue/${ticker.toLowerCase()}`,
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

export default async function ServicesRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/services-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s services revenue?`,
      answer: `${companyName} generates services revenue through professional service fees, subscription services, and other service-related offerings to both homeowners and service professionals on the platform.`
    },
    {
      question: `How does ${symbol} monetize services?`,
      answer: `${symbol} typically monetizes services through various mechanisms including lead fees, subscription plans for professionals, premium features, advertising services, and other value-added offerings.`
    },
    {
      question: `Is ${symbol}'s services revenue growing?`,
      answer: `Services revenue growth is a key indicator of ${symbol}'s ability to monetize its marketplace. Growth comes from expanding the professional network, increasing penetration of paid services, and introducing new revenue streams.`
    },
    {
      question: `What percentage of revenue comes from services?`,
      answer: `The services revenue mix for ${symbol} reflects the balance between different monetization streams. Understanding this mix helps evaluate business model diversification and revenue stability.`
    },
    {
      question: `What services does ${symbol} offer to professionals?`,
      answer: `${companyName} typically offers professionals various services including lead generation, marketing tools, business management software, customer relationship tools, and premium placement options.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Services Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Services Revenue ${currentYear} - Service Fee Analysis`,
    description: `Complete services revenue analysis for ${symbol} (${companyName}) with growth trends and revenue mix breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} services revenue`,
      `${symbol} service fees`,
      `${symbol} professional services`,
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
            <span>{symbol} Services Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Services Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional services revenue and fee structure for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Stream</p>
                <p className="text-2xl font-bold">Services Revenue</p>
                <p className="text-sm text-muted-foreground mt-1">Professional service fees and subscriptions</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monetization Model</p>
                <p className="text-2xl font-bold">Multi-Stream Revenue</p>
                <p className="text-sm text-muted-foreground mt-1">Diversified service offerings</p>
              </div>
            </div>
          </div>

          {/* Revenue Streams */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Service Revenue Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Lead Fees</h3>
                <p className="text-muted-foreground">Revenue from connecting professionals with qualified homeowner leads</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Subscription Services</h3>
                <p className="text-muted-foreground">Recurring revenue from professional subscription plans and premium features</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Advertising Revenue</h3>
                <p className="text-muted-foreground">Revenue from promoted listings and advertising placements</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Value-Added Services</h3>
                <p className="text-muted-foreground">Additional services like CRM tools, marketing services, and analytics</p>
              </div>
            </div>
          </section>

          {/* Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Services Revenue Growth Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Professional Network Expansion:</strong> More professionals drive higher service revenue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Pricing Optimization:</strong> Improved pricing and packaging of service offerings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>New Service Launches:</strong> Introduction of new monetizable services and features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Penetration Increase:</strong> Higher adoption of paid services among existing professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span><strong>Premium Tier Migration:</strong> Moving professionals to higher-value subscription tiers</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Unit Economics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Service Revenue Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Revenue per Professional</h3>
                  <p className="text-muted-foreground">Average annual revenue generated from each service professional on the platform</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Service Attachment Rate</h3>
                  <p className="text-muted-foreground">Percentage of professionals purchasing additional services beyond basic offerings</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Revenue Mix Evolution</h3>
                  <p className="text-muted-foreground">Shift in revenue composition between different service categories over time</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, growth trends, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> Services revenue breakdown may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="services-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
