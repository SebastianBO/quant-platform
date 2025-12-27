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
    title: `${symbol} Membership Attrition - Churn Rate & Retention ${currentYear}`,
    description: `${symbol} membership attrition analysis: churn rate, retention rate, cancellation trends, and member lifetime value. Analyze ${symbol}'s member retention performance.`,
    keywords: [
      `${symbol} attrition`,
      `${symbol} churn rate`,
      `${symbol} retention`,
      `${symbol} member retention`,
      `${symbol} cancellations`,
      `${symbol} membership churn`,
    ],
    openGraph: {
      title: `${symbol} Membership Attrition ${currentYear} | Churn Rate & Retention`,
      description: `Complete ${symbol} attrition analysis with churn rate, retention metrics, and member lifetime value.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/membership-attrition/${ticker.toLowerCase()}`,
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

export default async function MembershipAttritionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/membership-attrition/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate attrition FAQs
  const attritionFaqs = [
    {
      question: `What is ${symbol}'s membership attrition rate?`,
      answer: `Attrition (or churn) rate measures the percentage of members who cancel their memberships. ${companyName} reports this metric in earnings calls or investor presentations. Lower attrition indicates better member satisfaction and retention.`
    },
    {
      question: `What is a good attrition rate for a gym company?`,
      answer: `Typical gym attrition rates range from 30-50% annually. Premium gyms and successful fitness platforms may achieve lower rates (20-30%), while budget gyms often see higher churn. Compare ${symbol}'s rate to industry benchmarks.`
    },
    {
      question: `Why do ${symbol} members cancel their memberships?`,
      answer: `Common reasons for cancellation include relocation, financial constraints, lack of engagement, competitor offerings, or dissatisfaction with facilities/services. ${symbol} may address these through improved amenities, pricing, or member experience.`
    },
    {
      question: `How does ${symbol} reduce membership attrition?`,
      answer: `Retention strategies include onboarding programs, personalized training, community building, facility improvements, flexible pricing, and consistent communication. Lower attrition directly improves profitability and member lifetime value.`
    },
    {
      question: `What is ${symbol}'s member retention rate?`,
      answer: `Retention rate is the inverse of attrition (100% minus churn rate). If ${symbol} has 30% annual attrition, retention is 70%. Higher retention rates indicate sticky memberships and sustainable revenue.`
    },
    {
      question: `How does ${symbol}'s attrition compare to competitors?`,
      answer: `Compare ${symbol} to other gym chains and fitness platforms. Companies with better facilities, stronger brand loyalty, and more engaging experiences typically achieve lower attrition and higher member lifetime value.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Membership Attrition`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Membership Attrition ${currentYear} - Churn Rate & Retention Analysis`,
    description: `Complete attrition analysis for ${symbol} (${companyName}) with churn rate, retention metrics, and member lifetime value.`,
    url: pageUrl,
    keywords: [
      `${symbol} attrition`,
      `${symbol} churn rate`,
      `${symbol} retention`,
      `${symbol} membership churn`,
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

  const faqSchema = getFAQSchema(attritionFaqs)

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
            <span>{symbol} Membership Attrition</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Membership Attrition {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Churn rate and retention analysis for {companyName}
          </p>

          {/* Attrition Overview */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Membership Attrition Overview</h2>
            <p className="text-muted-foreground">
              Membership attrition (churn) is one of the most critical metrics for {companyName}.
              Lower churn rates indicate better member satisfaction, stronger retention, and higher
              lifetime value. Attrition directly impacts revenue stability and profitability.
              Check quarterly reports for detailed retention metrics.
            </p>
          </div>

          {/* Key Attrition Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Attrition & Retention Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Monthly Churn Rate</h3>
                <p className="text-muted-foreground">
                  Percentage of members who cancel each month, a leading indicator of business health.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Annual Attrition Rate</h3>
                <p className="text-muted-foreground">
                  Cumulative percentage of members lost over a year, showing long-term retention trends.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Member Retention Rate</h3>
                <p className="text-muted-foreground">
                  Percentage of members who maintain active memberships, the inverse of attrition.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Lifetime Value (LTV)</h3>
                <p className="text-muted-foreground">
                  Total revenue expected from a member over their entire relationship with the company.
                </p>
              </div>
            </div>
          </section>

          {/* Retention Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Common Retention Strategies</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Member Onboarding</h3>
                <p className="text-muted-foreground">
                  Strong onboarding programs help new members build habits and see early results, reducing early-stage churn.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Community Building</h3>
                <p className="text-muted-foreground">
                  Creating social connections and community makes members more likely to maintain their memberships long-term.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Personalized Engagement</h3>
                <p className="text-muted-foreground">
                  Personal training, customized workouts, and regular check-ins increase member engagement and satisfaction.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retention Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, retention trends, and AI-powered insights
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
              {attritionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Attrition data is based on publicly filed reports and company disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="membership-attrition" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
