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
    title: `${symbol} Talent Revenue - Talent Management & Recruiting Revenue`,
    description: `${symbol} talent solutions revenue analysis. View talent management, recruiting, applicant tracking, and talent acquisition software revenue trends.`,
    keywords: [
      `${symbol} talent revenue`,
      `${symbol} talent management revenue`,
      `${symbol} recruiting revenue`,
      `${symbol} ATS revenue`,
      `${symbol} talent acquisition`,
      `${symbol} recruitment software`,
    ],
    openGraph: {
      title: `${symbol} Talent Revenue | Talent Management Earnings`,
      description: `Complete ${symbol} talent solutions revenue data including recruiting, ATS, onboarding, and talent management software earnings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/talent-revenue/${ticker.toLowerCase()}`,
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

export default async function TalentRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/talent-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedTalentRevenue = revenue * 0.15 // Estimate 15% from talent solutions

  const talentFaqs = [
    {
      question: `What is ${symbol}'s talent revenue?`,
      answer: `${companyName}'s talent revenue includes earnings from applicant tracking systems (ATS), recruiting software, onboarding tools, performance management, and succession planning solutions. We estimate talent revenue at approximately $${(estimatedTalentRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate talent management revenue?`,
      answer: `${companyName} generates talent revenue through subscription fees for ATS and recruiting tools, per-requisition pricing, job posting fees, candidate sourcing services, onboarding automation, performance review software, and talent marketplace fees.`
    },
    {
      question: `What is the growth rate of ${symbol}'s talent business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s talent segment grows through new customer acquisition, increased hiring volumes at existing clients, expanded ATS functionality, and cross-selling from core HCM to talent modules.`
    },
    {
      question: `Why is talent revenue important for ${symbol}?`,
      answer: `Talent revenue is important because recruiting and talent management are critical business functions with high ROI, create strong platform stickiness, generate additional revenue during high-growth periods, and serve as entry points for full HCM suite adoption.`
    },
    {
      question: `What talent solutions does ${symbol} offer?`,
      answer: `${companyName} typically offers applicant tracking (ATS), job posting and distribution, candidate relationship management (CRM), interview scheduling, onboarding workflows, performance management, succession planning, and internal mobility tools.`
    },
    {
      question: `How does ${symbol}'s talent revenue compare to competitors?`,
      answer: `${companyName}'s talent revenue can be compared to competitors like iCIMS, Greenhouse, Lever, and integrated talent suites from Workday and Oracle. Key metrics include ATS market share, time-to-fill reduction, candidate quality, and hiring workflow automation.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Talent Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Talent Revenue - Talent Management & Recruiting Revenue`,
    description: `Complete talent solutions revenue analysis for ${symbol} (${companyName}) including ATS, recruiting, and talent management software earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} talent revenue`,
      `${symbol} recruiting revenue`,
      `${symbol} ATS revenue`,
      `${symbol} talent management`,
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

  const faqSchema = getFAQSchema(talentFaqs)

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
            <span>{symbol} Talent Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Talent Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Talent management and recruiting revenue trends for {companyName}
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

          {/* Talent Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Talent Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Talent Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedTalentRevenue / 1e9).toFixed(2)}B
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

          {/* Understanding Talent Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Talent Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Talent revenue represents {companyName}'s earnings from recruiting, hiring, and talent management solutions. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>ATS Subscriptions:</strong> Applicant tracking system licensing and usage fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Job Posting Fees:</strong> Distribution to job boards and advertising platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Sourcing Services:</strong> Candidate search, screening, and recruiting automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Talent Management:</strong> Performance reviews, succession planning, and career development</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Talent Solutions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Talent Solutions Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Recruiting & ATS</h3>
                <p className="text-sm text-muted-foreground">Job requisitions, applicant tracking, interview scheduling, and offer management</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Onboarding</h3>
                <p className="text-sm text-muted-foreground">New hire workflows, document collection, training assignments, and first-day readiness</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Performance Management</h3>
                <p className="text-sm text-muted-foreground">Goal setting, continuous feedback, reviews, calibration, and compensation planning</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Succession Planning</h3>
                <p className="text-sm text-muted-foreground">High-potential identification, career pathing, skills development, and internal mobility</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live talent revenue data, HCM metrics, and detailed financial analysis
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
              {talentFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="talent-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
