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
    title: `${symbol} Learning Revenue - Learning Management & Training Revenue`,
    description: `${symbol} learning revenue analysis. View learning management system (LMS) revenue, employee training revenue, and corporate learning software earnings.`,
    keywords: [
      `${symbol} learning revenue`,
      `${symbol} LMS revenue`,
      `${symbol} training revenue`,
      `${symbol} learning management`,
      `${symbol} employee training`,
      `${symbol} learning platform`,
    ],
    openGraph: {
      title: `${symbol} Learning Revenue | Learning Management Earnings`,
      description: `Complete ${symbol} learning revenue data including LMS subscriptions, training content, and corporate learning software earnings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/learning-revenue/${ticker.toLowerCase()}`,
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

export default async function LearningRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/learning-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedLearningRevenue = revenue * 0.10 // Estimate 10% from learning

  const learningFaqs = [
    {
      question: `What is ${symbol}'s learning revenue?`,
      answer: `${companyName}'s learning revenue includes earnings from learning management systems (LMS), training content libraries, compliance training, skills development, and corporate learning platforms. We estimate learning revenue at approximately $${(estimatedLearningRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate learning management revenue?`,
      answer: `${companyName} generates learning revenue through LMS subscription fees, per-learner pricing, content licensing, custom course development, compliance training packages, learning analytics, and integration with HR systems for skills tracking.`
    },
    {
      question: `What is the growth rate of ${symbol}'s learning business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s learning segment benefits from increased focus on upskilling, compliance requirements, remote work training needs, and digital transformation initiatives driving corporate learning investments.`
    },
    {
      question: `Why is learning revenue important for ${symbol}?`,
      answer: `Learning revenue is important because it addresses critical business needs (compliance, skills development), has high engagement and renewal rates, creates data insights for talent development, and strengthens the overall HCM platform value proposition.`
    },
    {
      question: `What types of learning does ${symbol} support?`,
      answer: `${companyName} typically supports compliance training (safety, harassment, security), technical skills development, leadership training, onboarding programs, certification courses, soft skills development, and continuous learning paths integrated with career development.`
    },
    {
      question: `How does ${symbol}'s learning revenue compare to competitors?`,
      answer: `${companyName}'s learning revenue can be compared to competitors like Cornerstone OnDemand, Docebo, LinkedIn Learning, and integrated learning suites from Workday and SAP SuccessFactors. Key metrics include learner engagement, course completion rates, and content library breadth.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Learning Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Learning Revenue - Learning Management & Training Revenue`,
    description: `Complete learning revenue analysis for ${symbol} (${companyName}) including LMS subscriptions, training content, and corporate learning earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} learning revenue`,
      `${symbol} LMS revenue`,
      `${symbol} training revenue`,
      `${symbol} learning management`,
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

  const faqSchema = getFAQSchema(learningFaqs)

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
            <span>{symbol} Learning Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Learning Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Learning management and training revenue trends for {companyName}
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

          {/* Learning Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Learning Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Learning Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedLearningRevenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ${(revenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Understanding Learning Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Learning Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Learning revenue represents {companyName}'s earnings from corporate training and development solutions. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>LMS Subscriptions:</strong> Learning management system platform fees and per-learner pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Content Licensing:</strong> Access to pre-built training libraries and course catalogs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Custom Development:</strong> Tailored training content and company-specific courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Compliance Training:</strong> Mandatory training programs for regulatory requirements</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Learning Solutions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Learning Solutions Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Compliance Training</h3>
                <p className="text-sm text-muted-foreground">Safety, harassment prevention, data security, and regulatory compliance courses</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Skills Development</h3>
                <p className="text-sm text-muted-foreground">Technical skills, software training, certifications, and professional development</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Leadership Training</h3>
                <p className="text-sm text-muted-foreground">Management development, executive coaching, and leadership competencies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Onboarding Programs</h3>
                <p className="text-sm text-muted-foreground">New hire training, company culture, role-specific learning paths, and orientation</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live learning revenue data, HCM metrics, and detailed financial analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {learningFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue metrics are estimates based on publicly available data and should not be considered financial advice. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="learning-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
