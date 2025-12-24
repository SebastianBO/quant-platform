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
    title: `${symbol} Average Project Value - Transaction Size Metrics ${currentYear}`,
    description: `${symbol} average project value data: transaction size, project value trends, category mix, revenue per project. Analyze ${symbol}'s project value economics.`,
    keywords: [
      `${symbol} average project value`,
      `${symbol} transaction size`,
      `${symbol} project value`,
      `${symbol} ticket size`,
      `${symbol} revenue per project`,
    ],
    openGraph: {
      title: `${symbol} Average Project Value ${currentYear} | Transaction Analysis`,
      description: `Complete ${symbol} average project value analysis with transaction size trends and economics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/average-project-value/${ticker.toLowerCase()}`,
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

export default async function AverageProjectValuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/average-project-value/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s average project value?`,
      answer: `${companyName}'s average project value represents the typical transaction size for home improvement projects facilitated through the platform. This metric varies by service category, market, and project complexity.`
    },
    {
      question: `Why is average project value important for ${symbol}?`,
      answer: `Average project value is a key metric for ${symbol} as it directly impacts revenue potential, monetization rates, and overall marketplace economics. Higher-value projects generally support higher platform fees and better unit economics.`
    },
    {
      question: `How does project value vary by category?`,
      answer: `Project values vary significantly across service categories. Major remodeling projects (kitchens, bathrooms) typically have higher values than maintenance services (cleaning, basic repairs), affecting overall average project value.`
    },
    {
      question: `Is ${symbol}'s average project value increasing?`,
      answer: `Trends in average project value reflect factors including inflation, category mix shifts, and the platform's ability to attract larger projects. Growth in this metric can drive higher revenue per transaction.`
    },
    {
      question: `How does project value affect ${symbol}'s revenue?`,
      answer: `Higher average project values typically allow ${symbol} to charge higher connection fees or take larger commissions, improving revenue per transaction and overall marketplace profitability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Average Project Value`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Average Project Value ${currentYear} - Transaction Analysis`,
    description: `Complete average project value analysis for ${symbol} (${companyName}) with transaction size trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} average project value`,
      `${symbol} transaction size`,
      `${symbol} project value`,
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
            <span>{symbol} Average Project Value</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Average Project Value {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transaction size and project value economics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Average Project Value</p>
                <p className="text-sm text-muted-foreground mt-1">Transaction size economics</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Impact</p>
                <p className="text-2xl font-bold">Monetization Leverage</p>
                <p className="text-sm text-muted-foreground mt-1">Higher values drive fees</p>
              </div>
            </div>
          </div>

          {/* Value Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Project Value Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Category Mix</h3>
                <p className="text-muted-foreground">Major remodeling vs. maintenance affects average transaction size</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Geographic Variation</h3>
                <p className="text-muted-foreground">Home values and cost of living drive regional project value differences</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Project Complexity</h3>
                <p className="text-muted-foreground">Complex renovations command higher values than simple repairs</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Economic Conditions</h3>
                <p className="text-muted-foreground">Consumer confidence and home equity influence project scope</p>
              </div>
            </div>
          </section>

          {/* Value Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Project Value by Category</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span><strong>Major Remodeling:</strong> Kitchen, bathroom, and basement renovations typically $15,000-$50,000+</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span><strong>Exterior Projects:</strong> Roofing, siding, and major exterior work $10,000-$30,000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span><strong>Landscaping:</strong> Major landscaping and hardscaping $5,000-$20,000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span><strong>HVAC Systems:</strong> System replacements and upgrades $5,000-$15,000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span><strong>Smaller Projects:</strong> Repairs, painting, and minor improvements $500-$5,000</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Economic Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impact on Platform Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Revenue per Transaction</h3>
                  <p className="text-muted-foreground">Higher project values support larger connection fees and percentage-based commissions</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Professional Engagement</h3>
                  <p className="text-muted-foreground">Higher-value projects attract more professional interest and competitive bidding</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Platform Value Proposition</h3>
                  <p className="text-muted-foreground">Larger projects justify higher platform fees relative to overall project cost</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Mix Optimization</h3>
                  <p className="text-muted-foreground">Balancing high-value and smaller projects for optimal marketplace dynamics</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Project Value Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Inflation Impact</h3>
                <p className="text-muted-foreground">Rising material and labor costs drive higher project values over time</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Category Evolution</h3>
                <p className="text-muted-foreground">Platform expansion into higher-value categories can lift average project value</p>
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
            <p><strong>Disclaimer:</strong> Project value metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="average-project-value" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
