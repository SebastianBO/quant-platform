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
    title: `${symbol} Customer Repeat Rate - Retention Metrics ${currentYear}`,
    description: `${symbol} customer repeat rate data: retention metrics, repeat customer rates, customer lifetime value, loyalty trends. Analyze ${symbol}'s customer retention performance.`,
    keywords: [
      `${symbol} repeat rate`,
      `${symbol} customer retention`,
      `${symbol} repeat customers`,
      `${symbol} customer loyalty`,
      `${symbol} lifetime value`,
    ],
    openGraph: {
      title: `${symbol} Customer Repeat Rate ${currentYear} | Retention Analysis`,
      description: `Complete ${symbol} customer repeat rate analysis with retention metrics and lifetime value trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/repeat-rate/${ticker.toLowerCase()}`,
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

export default async function RepeatRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/repeat-rate/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s customer repeat rate?`,
      answer: `${companyName}'s customer repeat rate measures the percentage of homeowners who return to the platform for additional home improvement projects. Higher repeat rates indicate strong customer satisfaction and platform stickiness.`
    },
    {
      question: `Why is repeat rate important for ${symbol}?`,
      answer: `Repeat rate is crucial for ${symbol} as returning customers have lower acquisition costs and higher lifetime value. Strong repeat rates reduce marketing spend and improve overall marketplace economics.`
    },
    {
      question: `How does ${symbol} encourage repeat customers?`,
      answer: `${companyName} likely encourages repeat usage through quality experiences, professional reviews, email marketing, saved preferences, and ongoing home maintenance reminders to drive additional projects.`
    },
    {
      question: `What is a good repeat rate for ${symbol}?`,
      answer: `Repeat rates vary by industry, but for home services marketplaces, rates of 20-40% are generally healthy, considering that major home improvements are infrequent. Higher rates indicate strong satisfaction and brand loyalty.`
    },
    {
      question: `How does repeat rate affect ${symbol}'s profitability?`,
      answer: `Higher repeat rates improve ${symbol}'s unit economics by spreading customer acquisition costs across multiple transactions, leading to better customer lifetime value (LTV) and higher returns on marketing investment.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Repeat Rate`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Customer Repeat Rate ${currentYear} - Retention Analysis`,
    description: `Complete customer repeat rate analysis for ${symbol} (${companyName}) with retention metrics and LTV trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} repeat rate`,
      `${symbol} customer retention`,
      `${symbol} repeat customers`,
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
            <span>{symbol} Repeat Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Customer Repeat Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer retention and repeat rate metrics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-pink-600/20 to-red-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Repeat Rate</p>
                <p className="text-sm text-muted-foreground mt-1">Customer retention driver</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Economic Impact</p>
                <p className="text-2xl font-bold">Lifetime Value</p>
                <p className="text-sm text-muted-foreground mt-1">Higher LTV from repeats</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profitability</p>
                <p className="text-2xl font-bold">Lower CAC</p>
                <p className="text-sm text-muted-foreground mt-1">Reduced acquisition costs</p>
              </div>
            </div>
          </div>

          {/* Retention Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Repeat Rate Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Quality</h3>
                <p className="text-muted-foreground">Positive experiences with professionals drive repeat usage and referrals</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Platform Experience</h3>
                <p className="text-muted-foreground">Easy-to-use platform and streamlined matching process encourage returns</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Brand Trust</h3>
                <p className="text-muted-foreground">Established trust and reliability make the platform top-of-mind for future projects</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Ongoing Communication</h3>
                <p className="text-muted-foreground">Email marketing and reminders keep the platform relevant for new home needs</p>
              </div>
            </div>
          </section>

          {/* Retention Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Customer Retention Strategies</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span><strong>Quality Control:</strong> Vetting professionals and monitoring reviews to ensure satisfaction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span><strong>Account Management:</strong> Saved preferences and project history for easier repeat usage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span><strong>Email Campaigns:</strong> Targeted marketing for seasonal projects and home maintenance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span><strong>Loyalty Programs:</strong> Incentives or benefits for returning customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span><strong>Follow-Up Services:</strong> Reminders for maintenance and related home improvement needs</span>
                </li>
              </ul>
            </div>
          </section>

          {/* LTV Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Lifetime Value Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Customer Lifetime Value (LTV)</h3>
                  <p className="text-muted-foreground">Total revenue generated from a customer across all projects over their lifetime</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">LTV to CAC Ratio</h3>
                  <p className="text-muted-foreground">Relationship between customer lifetime value and acquisition cost determines profitability</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Cohort Analysis</h3>
                  <p className="text-muted-foreground">Tracking repeat rates by customer cohort reveals retention trends over time</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Payback Period</h3>
                  <p className="text-muted-foreground">Time to recover customer acquisition costs through repeat transactions</p>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Home Services Repeat Rate Context</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Project Frequency</h3>
                <p className="text-muted-foreground">Major home improvements are infrequent (every few years), but smaller projects and maintenance create repeat opportunities</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Category Diversity</h3>
                <p className="text-muted-foreground">Broad service categories increase chances of repeat usage across different project types</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Dynamics</h3>
                <p className="text-muted-foreground">Strong brand and positive experiences help defend against competitors for future projects</p>
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
            <p><strong>Disclaimer:</strong> Customer repeat rate metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="repeat-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
