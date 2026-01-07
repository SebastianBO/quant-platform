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
    title: `${symbol} Connection Revenue - Match Fees & Connection Metrics ${currentYear}`,
    description: `${symbol} connection revenue data: match fees, connection rates, revenue per match, connection growth. Analyze ${symbol}'s connection-based revenue performance.`,
    keywords: [
      `${symbol} connection revenue`,
      `${symbol} match fees`,
      `${symbol} connection rates`,
      `${symbol} revenue per match`,
      `${symbol} marketplace revenue`,
    ],
    openGraph: {
      title: `${symbol} Connection Revenue ${currentYear} | Match Fee Analysis`,
      description: `Complete ${symbol} connection revenue analysis with match metrics and revenue per connection trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/connection-revenue/${ticker.toLowerCase()}`,
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

export default async function ConnectionRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/connection-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s connection revenue?`,
      answer: `${companyName} generates connection revenue by charging fees when homeowners are matched with service professionals. This represents a core monetization stream for the marketplace platform.`
    },
    {
      question: `How does ${symbol} charge for connections?`,
      answer: `${symbol} typically charges service professionals for each qualified lead or connection made with homeowners seeking services. The fee structure may vary by service category, market, and lead quality.`
    },
    {
      question: `What is ${symbol}'s revenue per connection?`,
      answer: `Revenue per connection is a key unit economic metric for ${symbol}, representing the average fee charged for each homeowner-professional match. This metric reflects pricing power and value delivered.`
    },
    {
      question: `Is ${symbol}'s connection revenue growing?`,
      answer: `Connection revenue growth at ${symbol} is driven by both volume (more connections) and price (higher revenue per connection). Both factors contribute to overall marketplace revenue expansion.`
    },
    {
      question: `How many connections does ${symbol} generate?`,
      answer: `The number of connections or matches is a key volume metric for ${symbol}'s marketplace. More connections drive higher revenue, while connection quality affects professional satisfaction and retention.`
    },
    {
      question: `What determines connection pricing at ${symbol}?`,
      answer: `Connection pricing typically varies based on factors like service category, project value, market competitiveness, and lead exclusivity. Premium categories and higher-value projects generally command higher connection fees.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Connection Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Connection Revenue ${currentYear} - Match Fee Analysis`,
    description: `Complete connection revenue analysis for ${symbol} (${companyName}) with match metrics and pricing trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} connection revenue`,
      `${symbol} match fees`,
      `${symbol} connection rates`,
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
            <span>{symbol} Connection Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Connection Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Match fees and connection-based revenue metrics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Core Revenue</p>
                <p className="text-2xl font-bold">Connection Fees</p>
                <p className="text-sm text-muted-foreground mt-1">Pay-per-match model</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Revenue per Match</p>
                <p className="text-sm text-muted-foreground mt-1">Unit economics</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Growth Lever</p>
                <p className="text-2xl font-bold">Match Volume</p>
                <p className="text-sm text-muted-foreground mt-1">Network effects</p>
              </div>
            </div>
          </div>

          {/* Connection Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Connection Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Match Volume</h3>
                <p className="text-muted-foreground">Total number of homeowner-professional connections generated</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue per Match</h3>
                <p className="text-muted-foreground">Average fee charged per successful connection or lead delivery</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Connection Rate</h3>
                <p className="text-muted-foreground">Percentage of leads that convert to paid connections</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Match Quality</h3>
                <p className="text-muted-foreground">Quality of connections measured by professional acceptance and project completion</p>
              </div>
            </div>
          </section>

          {/* Revenue Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Connection Revenue Growth Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span><strong>Volume Growth:</strong> More homeowner leads and professional connections drive revenue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span><strong>Price Optimization:</strong> Strategic pricing adjustments to maximize revenue per connection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span><strong>Category Mix:</strong> Shift towards higher-value service categories with premium pricing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span><strong>Geographic Expansion:</strong> Entering new markets increases total addressable connections</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span><strong>Exclusive Leads:</strong> Premium pricing for exclusive or higher-quality leads</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Pricing Model */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Connection Pricing Dynamics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Category-Based Pricing</h3>
                  <p className="text-muted-foreground">Different service categories command varying connection fees based on project value and competitiveness</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Lead Quality Tiers</h3>
                  <p className="text-muted-foreground">Premium pricing for exclusive or highly qualified leads versus shared standard leads</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Market-Based Pricing</h3>
                  <p className="text-muted-foreground">Geographic pricing variations reflect local market dynamics and competitive intensity</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Value-Based Fees</h3>
                  <p className="text-muted-foreground">Connection fees may correlate with estimated project value or revenue potential</p>
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
            <p><strong>Disclaimer:</strong> Connection revenue metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="connection-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
