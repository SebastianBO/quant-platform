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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Workforce Analytics Revenue - HR Analytics & People Analytics`,
    description: `${symbol} workforce analytics revenue analysis. View people analytics, HR metrics, workforce planning, and analytics software revenue trends.`,
    keywords: [
      `${symbol} workforce analytics revenue`,
      `${symbol} people analytics`,
      `${symbol} HR analytics`,
      `${symbol} workforce planning`,
      `${symbol} analytics software`,
      `${symbol} employee metrics`,
    ],
    openGraph: {
      title: `${symbol} Workforce Analytics Revenue | People Analytics Earnings`,
      description: `Complete ${symbol} workforce analytics revenue data including people analytics, predictive modeling, and HR insights software earnings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/workforce-analytics/${ticker.toLowerCase()}`,
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

export default async function WorkforceAnalyticsPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/workforce-analytics/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedAnalyticsRevenue = revenue * 0.08 // Estimate 8% from analytics

  const analyticsFaqs = [
    {
      question: `What is ${symbol}'s workforce analytics revenue?`,
      answer: `${companyName}'s workforce analytics revenue includes earnings from people analytics platforms, predictive workforce modeling, HR dashboards, benchmarking data, and advanced analytics tools. We estimate analytics revenue at approximately $${(estimatedAnalyticsRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate workforce analytics revenue?`,
      answer: `${companyName} generates analytics revenue through premium analytics modules, data visualization tools, predictive modeling subscriptions, benchmarking reports, custom analytics consulting, and API access for data integration and advanced reporting.`
    },
    {
      question: `What is the growth rate of ${symbol}'s analytics business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s analytics segment is positioned for strong growth as companies increasingly rely on data-driven HR decisions, predictive workforce planning, and DEI (diversity, equity, inclusion) metrics.`
    },
    {
      question: `Why is workforce analytics revenue important for ${symbol}?`,
      answer: `Workforce analytics is important because it represents a high-value, premium offering that drives strategic decisions, commands premium pricing, creates competitive differentiation, and provides deep insights that increase platform stickiness and customer retention.`
    },
    {
      question: `What types of workforce analytics does ${symbol} provide?`,
      answer: `${companyName} typically provides turnover prediction, hiring analytics, compensation benchmarking, diversity metrics, productivity analysis, workforce planning, skills gap analysis, retention modeling, and real-time HR dashboards.`
    },
    {
      question: `How does ${symbol}'s analytics revenue compare to competitors?`,
      answer: `${companyName}'s workforce analytics can be compared to competitors like Visier, Workday Prism, and Oracle Analytics. Key differentiators include predictive accuracy, data visualization quality, integration depth, and actionable insights for business leaders.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Workforce Analytics`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Workforce Analytics Revenue - HR Analytics & People Analytics`,
    description: `Complete workforce analytics revenue analysis for ${symbol} (${companyName}) including people analytics, predictive modeling, and HR insights earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} workforce analytics`,
      `${symbol} people analytics`,
      `${symbol} HR analytics`,
      `${symbol} workforce planning`,
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

  const faqSchema = getFAQSchema(analyticsFaqs)

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
            <span>{symbol} Workforce Analytics</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Workforce Analytics
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Workforce analytics and people analytics revenue trends for {companyName}
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

          {/* Analytics Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Workforce Analytics Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Analytics Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedAnalyticsRevenue / 1e9).toFixed(2)}B
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

          {/* Understanding Workforce Analytics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Workforce Analytics Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Workforce analytics revenue represents {companyName}'s earnings from people analytics and HR intelligence solutions. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Analytics Modules:</strong> Premium features for advanced reporting and predictive modeling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Benchmarking Data:</strong> Industry comparison data and market intelligence subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Custom Dashboards:</strong> Tailored analytics views and executive reporting tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Consulting Services:</strong> Analytics implementation and strategic workforce planning support</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Analytics Capabilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Analytics Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">Turnover prediction, flight risk modeling, hiring needs forecasting, and succession planning</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Descriptive Analytics</h3>
                <p className="text-sm text-muted-foreground">Headcount reporting, compensation analysis, demographic breakdowns, and trend visualization</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Diagnostic Analytics</h3>
                <p className="text-sm text-muted-foreground">Root cause analysis for turnover, performance drivers, and engagement correlation studies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Prescriptive Analytics</h3>
                <p className="text-sm text-muted-foreground">Workforce optimization recommendations, retention strategies, and hiring prioritization</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live analytics revenue data, HCM metrics, and detailed financial analysis
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
              {analyticsFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="workforce-analytics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
