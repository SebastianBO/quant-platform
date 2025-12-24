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
    title: `${symbol} Module Adoption - Product Adoption Trends ${currentYear}`,
    description: `${symbol} module adoption and product expansion metrics: track feature adoption, module usage, and product engagement for ${symbol}.`,
    keywords: [
      `${symbol} module adoption`,
      `${symbol} product adoption`,
      `${symbol} feature usage`,
      `${symbol} product expansion`,
      `${symbol} module engagement`,
      `${symbol} product metrics`,
    ],
    openGraph: {
      title: `${symbol} Module Adoption ${currentYear} | Product Expansion`,
      description: `Complete ${symbol} module adoption analysis with product expansion trends, feature usage, and engagement metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/module-adoption/${ticker.toLowerCase()}`,
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

export default async function ModuleAdoptionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/module-adoption/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate Module Adoption FAQs
  const moduleFaqs = [
    {
      question: `What is ${symbol}'s module adoption rate?`,
      answer: `Module adoption for ${companyName} measures how customers expand usage across different product features and modules. Higher adoption rates indicate strong product-market fit and customer engagement. Check quarterly earnings for specific module adoption metrics.`
    },
    {
      question: `Why is module adoption important for ${symbol}?`,
      answer: `Module adoption drives expansion revenue and increases customer stickiness for ${companyName}. Customers who adopt more modules have higher retention rates, lower churn, and greater lifetime value, making this a critical growth metric.`
    },
    {
      question: `How does ${symbol} track module adoption?`,
      answer: `${companyName} typically tracks module adoption through metrics like modules per customer, adoption rate of new features, time to first value for new modules, and percentage of customers using advanced features. These appear in investor presentations.`
    },
    {
      question: `What drives module adoption at ${symbol}?`,
      answer: `Module adoption for ${companyName} is driven by product innovation, customer success programs, onboarding effectiveness, in-app guidance, and demonstrated ROI from additional modules. Integration between modules also encourages adoption.`
    },
    {
      question: `How does module adoption impact ${symbol}'s revenue?`,
      answer: `Module adoption directly impacts ${companyName}'s expansion revenue and net revenue retention (NRR). Each additional module typically increases average revenue per customer (ARPC) and contributes to predictable recurring revenue growth.`
    },
    {
      question: `What is a good module adoption benchmark?`,
      answer: `Leading SaaS companies often see 40-60% of customers adopting additional modules within the first year. ${companyName}'s module adoption rate can be compared to peers in the ${sector || 'industry'} sector using our comparison tools.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Module Adoption`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Module Adoption ${currentYear} - Product Expansion Analysis`,
    description: `Complete module adoption analysis for ${symbol} (${companyName}) with product expansion trends, feature usage, and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} module adoption`,
      `${symbol} product adoption`,
      `${symbol} feature usage`,
      `${symbol} product expansion`,
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

  const faqSchema = getFAQSchema(moduleFaqs)

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
            <span>{symbol} Module Adoption</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Module Adoption {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Product expansion and feature adoption metrics for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Module Adoption Metrics</h2>
            <p className="text-muted-foreground">
              {companyName} tracks module adoption to measure product expansion and customer engagement.
              Module adoption drives expansion revenue, increases customer stickiness, and improves
              overall unit economics through higher ARPC and lower churn.
            </p>
          </div>

          {/* Why Module Adoption Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Module Adoption Matters</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Expansion Revenue</h3>
                <p className="text-muted-foreground">
                  Module adoption is the primary driver of expansion revenue within the existing customer base.
                  Each additional module increases ARPC and contributes to net revenue retention above 100%.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Stickiness</h3>
                <p className="text-muted-foreground">
                  Customers using more modules have deeper product integration and higher switching costs.
                  Module adoption correlates strongly with retention rates and reduces churn risk.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product-Market Fit</h3>
                <p className="text-muted-foreground">
                  Strong module adoption validates product strategy and indicates customers find value
                  in expanding their usage. Low adoption may signal product gaps or poor onboarding.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Efficient Growth</h3>
                <p className="text-muted-foreground">
                  Module expansion from existing customers costs less than new customer acquisition.
                  High module adoption improves CAC payback and overall profitability.
                </p>
              </div>
            </div>
          </section>

          {/* Key Module Adoption Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Module Adoption Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Modules Per Customer</h3>
                    <p className="text-sm text-muted-foreground">
                      Average number of modules or products used per customer
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Module Adoption Rate</h3>
                    <p className="text-sm text-muted-foreground">
                      Percentage of customers adopting new modules over time
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Time to Module Adoption</h3>
                    <p className="text-sm text-muted-foreground">
                      Days from onboarding to adopting additional modules
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Feature Usage Depth</h3>
                    <p className="text-sm text-muted-foreground">
                      Percentage of advanced features actively used
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Module Expansion Revenue</h3>
                    <p className="text-sm text-muted-foreground">
                      Revenue from module expansion as % of total revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Product Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete product adoption data, SaaS metrics, and AI-powered insights
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
              {moduleFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Module adoption data is based on publicly disclosed information in earnings reports and investor presentations. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
