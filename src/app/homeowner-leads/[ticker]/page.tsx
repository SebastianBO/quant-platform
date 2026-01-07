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
    title: `${symbol} Homeowner Leads - Lead Volume & Quality Metrics ${currentYear}`,
    description: `${symbol} homeowner leads data: total leads generated, lead quality, conversion rates, lead categories. Analyze ${symbol}'s homeowner lead generation performance.`,
    keywords: [
      `${symbol} homeowner leads`,
      `${symbol} lead generation`,
      `${symbol} lead volume`,
      `${symbol} lead quality`,
      `${symbol} conversion rate`,
    ],
    openGraph: {
      title: `${symbol} Homeowner Leads ${currentYear} | Lead Generation Analysis`,
      description: `Complete ${symbol} homeowner leads analysis with volume trends, quality metrics, and conversion performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/homeowner-leads/${ticker.toLowerCase()}`,
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

export default async function HomeownerLeadsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/homeowner-leads/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many homeowner leads does ${symbol} generate?`,
      answer: `${companyName} generates homeowner leads through various channels including online advertising, SEO, and direct marketing. Lead volume is a key driver of marketplace activity and revenue.`
    },
    {
      question: `What is ${symbol}'s lead quality?`,
      answer: `Lead quality at ${symbol} is measured through metrics like lead conversion rates, professional acceptance rates, and completed project rates. High-quality leads drive better outcomes for both homeowners and professionals.`
    },
    {
      question: `How does ${symbol} generate homeowner leads?`,
      answer: `${companyName} generates leads through multiple acquisition channels including search engine marketing, organic search, content marketing, partnerships, and brand awareness campaigns.`
    },
    {
      question: `What is ${symbol}'s lead conversion rate?`,
      answer: `Lead conversion is a critical metric for ${symbol}, measuring how many leads result in professional connections and completed projects. Higher conversion rates indicate better lead quality and matching capabilities.`
    },
    {
      question: `Is ${symbol}'s lead volume growing?`,
      answer: `Lead volume growth is essential for ${symbol}'s marketplace expansion. Growth is driven by marketing investments, market expansion, and brand recognition in the home services category.`
    },
    {
      question: `What types of leads does ${symbol} generate?`,
      answer: `${symbol} generates leads across various home improvement categories including remodeling, landscaping, HVAC, plumbing, electrical work, and other home service needs.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Homeowner Leads`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Homeowner Leads ${currentYear} - Lead Generation Analysis`,
    description: `Complete homeowner lead generation analysis for ${symbol} (${companyName}) with volume trends and quality metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} homeowner leads`,
      `${symbol} lead generation`,
      `${symbol} lead volume`,
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
            <span>{symbol} Homeowner Leads</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Homeowner Leads {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Homeowner lead generation volume and quality metrics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Homeowner Leads</p>
                <p className="text-sm text-muted-foreground mt-1">Volume drives marketplace activity</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quality Focus</p>
                <p className="text-2xl font-bold">Conversion Rate</p>
                <p className="text-sm text-muted-foreground mt-1">Leads to completed projects</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Growth Driver</p>
                <p className="text-2xl font-bold">Marketing Investment</p>
                <p className="text-sm text-muted-foreground mt-1">Customer acquisition costs</p>
              </div>
            </div>
          </div>

          {/* Lead Quality Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Lead Quality Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Conversion Rate</h3>
                <p className="text-muted-foreground">Percentage of leads that convert to professional connections and completed projects</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Professional Acceptance</h3>
                <p className="text-muted-foreground">Rate at which service professionals respond to and accept leads</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Project Completion</h3>
                <p className="text-muted-foreground">Leads that result in completed home improvement projects</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Lead Intent</h3>
                <p className="text-muted-foreground">Quality of homeowner intent and project readiness</p>
              </div>
            </div>
          </section>

          {/* Lead Generation Channels */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Lead Generation Channels</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Paid Search:</strong> Search engine marketing targeting homeowners seeking services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Organic Search:</strong> SEO-driven traffic from homeowners researching projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Display Advertising:</strong> Brand awareness and retargeting campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Partnerships:</strong> Strategic partnerships with complementary services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Direct Marketing:</strong> Email and content marketing to existing users</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Economics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Lead Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Customer Acquisition Cost (CAC)</h3>
                  <p className="text-muted-foreground">Marketing spend per acquired homeowner lead impacts profitability and scalability</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Monetization per Lead</h3>
                  <p className="text-muted-foreground">Revenue generated from each lead through professional connections and platform fees</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Payback Period</h3>
                  <p className="text-muted-foreground">Time required to recover customer acquisition costs through monetization</p>
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
            <p><strong>Disclaimer:</strong> Lead generation metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="homeowner-leads" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
