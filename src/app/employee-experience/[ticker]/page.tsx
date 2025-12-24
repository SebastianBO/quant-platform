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
    title: `${symbol} Employee Experience Revenue - EX Platform & Engagement Software`,
    description: `${symbol} employee experience revenue analysis. View employee engagement platform revenue, EX software earnings, and workplace experience technology trends.`,
    keywords: [
      `${symbol} employee experience revenue`,
      `${symbol} employee engagement`,
      `${symbol} EX platform`,
      `${symbol} workplace experience`,
      `${symbol} engagement software`,
      `${symbol} employee satisfaction`,
    ],
    openGraph: {
      title: `${symbol} Employee Experience Revenue | EX Platform Earnings`,
      description: `Complete ${symbol} employee experience revenue data including engagement platforms, workplace technology, and EX software earnings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/employee-experience/${ticker.toLowerCase()}`,
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

export default async function EmployeeExperiencePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/employee-experience/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedEXRevenue = revenue * 0.12 // Estimate 12% from employee experience

  const exFaqs = [
    {
      question: `What is ${symbol}'s employee experience revenue?`,
      answer: `${companyName}'s employee experience (EX) revenue includes earnings from engagement platforms, pulse surveys, recognition programs, internal communications tools, and workplace experience software. We estimate EX revenue at approximately $${(estimatedEXRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate employee experience revenue?`,
      answer: `${companyName} generates EX revenue through engagement platform subscriptions, survey tools, recognition and rewards programs, internal social networks, employee feedback systems, and workplace experience management solutions with premium features for culture building.`
    },
    {
      question: `What is the growth rate of ${symbol}'s employee experience business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s employee experience segment benefits from increased focus on retention, remote work engagement, company culture, and the shift from employee satisfaction to comprehensive employee experience.`
    },
    {
      question: `Why is employee experience revenue important for ${symbol}?`,
      answer: `Employee experience is important because it addresses critical business challenges (retention, engagement, culture), has high executive visibility, drives measurable ROI through reduced turnover, and creates platform differentiation in a competitive HCM market.`
    },
    {
      question: `What employee experience solutions does ${symbol} offer?`,
      answer: `${companyName} typically offers engagement surveys and pulse checks, recognition and rewards platforms, internal communications and social collaboration, employee feedback channels, workplace experience apps, and culture analytics dashboards.`
    },
    {
      question: `How does ${symbol}'s employee experience revenue compare to competitors?`,
      answer: `${companyName}'s employee experience offerings can be compared to specialists like Qualtrics, Culture Amp, Glint (Microsoft), and 15Five. Key metrics include engagement scores, survey participation rates, recognition adoption, and correlation with turnover reduction.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Employee Experience`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Employee Experience Revenue - EX Platform & Engagement Software`,
    description: `Complete employee experience revenue analysis for ${symbol} (${companyName}) including engagement platforms, workplace technology, and EX software earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} employee experience`,
      `${symbol} employee engagement`,
      `${symbol} EX platform`,
      `${symbol} workplace experience`,
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

  const faqSchema = getFAQSchema(exFaqs)

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
            <span>{symbol} Employee Experience</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Employee Experience
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Employee experience and engagement platform revenue for {companyName}
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

          {/* Employee Experience Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Employee Experience Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated EX Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedEXRevenue / 1e9).toFixed(2)}B
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

          {/* Understanding Employee Experience Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Employee Experience Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Employee experience revenue represents {companyName}'s earnings from engagement and workplace experience solutions. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Engagement Platforms:</strong> Survey tools, pulse checks, and continuous feedback systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Recognition Programs:</strong> Peer recognition, rewards, and appreciation platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Communications Tools:</strong> Internal social networks, company news, and collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Workplace Experience:</strong> Desk booking, space management, and hybrid work tools</span>
                </li>
              </ul>
            </div>
          </section>

          {/* EX Solutions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Employee Experience Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Engagement & Surveys</h3>
                <p className="text-sm text-muted-foreground">Annual surveys, pulse checks, exit interviews, and real-time feedback collection</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Recognition & Rewards</h3>
                <p className="text-sm text-muted-foreground">Peer-to-peer recognition, manager awards, points systems, and culture reinforcement</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Internal Communications</h3>
                <p className="text-sm text-muted-foreground">Company announcements, social collaboration, employee directories, and knowledge sharing</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Workplace Management</h3>
                <p className="text-sm text-muted-foreground">Desk booking, room reservations, visitor management, and hybrid work coordination</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live employee experience data, HCM metrics, and detailed financial analysis
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
              {exFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="employee-experience" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
