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
    title: `${symbol} SaaS Revenue - Software as a Service Revenue ${currentYear}`,
    description: `${symbol} SaaS revenue breakdown: software-as-a-service sales, SaaS growth, subscription revenue, ARR, MRR. Analyze ${symbol}'s SaaS business performance.`,
    keywords: [
      `${symbol} SaaS revenue`,
      `${symbol} software as a service`,
      `${symbol} subscription revenue`,
      `${symbol} ARR`,
      `${symbol} MRR`,
      `${symbol} SaaS growth`,
    ],
    openGraph: {
      title: `${symbol} SaaS Revenue ${currentYear} | Software Subscription Revenue`,
      description: `Complete ${symbol} SaaS revenue analysis with subscription trends and growth rates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/saas-revenue/${ticker.toLowerCase()}`,
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

export default async function SaaSRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/saas-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Filter SaaS-related segments
  const saasSegments = productSegments?.filter((seg: any) =>
    seg.name?.toLowerCase().includes('saas') ||
    seg.name?.toLowerCase().includes('subscription') ||
    seg.name?.toLowerCase().includes('software') ||
    seg.name?.toLowerCase().includes('license') ||
    seg.name?.toLowerCase().includes('365') ||
    seg.name?.toLowerCase().includes('creative cloud')
  ) || []

  const totalSaaSRevenue = saasSegments.reduce((sum: number, seg: any) => sum + (seg.revenue || 0), 0)
  const saasRevenuePercentage = latestRevenue > 0 ? (totalSaaSRevenue / latestRevenue * 100) : 0

  // Generate SaaS revenue FAQs
  const saasFaqs = [
    {
      question: `What is ${symbol}'s SaaS revenue?`,
      answer: totalSaaSRevenue > 0
        ? `${symbol} (${companyName}) reported ${totalSaaSRevenue >= 1e9 ? `$${(totalSaaSRevenue / 1e9).toFixed(2)} billion` : `$${(totalSaaSRevenue / 1e6).toFixed(0)} million`} in SaaS (Software-as-a-Service) revenue for ${latestPeriod}, representing ${saasRevenuePercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not currently break out SaaS revenue as a separate segment. Subscription software revenue may be included in broader revenue categories.`
    },
    {
      question: `What is Software as a Service (SaaS)?`,
      answer: `SaaS delivers software applications over the internet on a subscription basis. Companies like ${companyName} host and maintain the software, eliminating the need for customers to install and run applications on their own computers or data centers.`
    },
    {
      question: `How fast is ${symbol}'s SaaS business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s SaaS revenue is growing ${(revenueGrowth * 100).toFixed(1)}% year-over-year, driven by increasing subscription adoption and recurring revenue growth.`
        : `SaaS growth data will be available after the next earnings report. Subscription software continues to dominate the enterprise software market.`
    },
    {
      question: `What SaaS products does ${symbol} offer?`,
      answer: saasSegments.length > 0
        ? `${symbol}'s SaaS products include: ${saasSegments.slice(0, 3).map((s: any) => s.name).join(', ')}. These subscription services provide recurring revenue streams.`
        : `${companyName} may offer SaaS products as part of their ${sector || 'technology'} portfolio. Check the revenue breakdown for subscription-based offerings.`
    },
    {
      question: `What is ${symbol}'s ARR and MRR?`,
      answer: `Annual Recurring Revenue (ARR) and Monthly Recurring Revenue (MRR) are key SaaS metrics. ${companyName} may disclose these metrics in earnings calls or investor presentations. High-quality SaaS businesses typically have 90%+ revenue retention rates.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} SaaS Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} SaaS Revenue ${currentYear} - Software Subscription Analysis`,
    description: `Complete SaaS revenue analysis for ${symbol} (${companyName}) with subscription software trends and growth rates.`,
    url: pageUrl,
    keywords: [
      `${symbol} SaaS revenue`,
      `${symbol} software as a service`,
      `${symbol} subscription revenue`,
      `${symbol} SaaS growth`,
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

  const faqSchema = getFAQSchema(saasFaqs)

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
            <span>{symbol} SaaS Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} SaaS Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Software-as-a-Service subscription revenue data for {companyName}
          </p>

          {/* Latest SaaS Revenue Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total SaaS Revenue</p>
                <p className="text-3xl font-bold">
                  {totalSaaSRevenue > 0
                    ? totalSaaSRevenue >= 1e9
                      ? `$${(totalSaaSRevenue / 1e9).toFixed(2)}B`
                      : `$${(totalSaaSRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  {saasRevenuePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">SaaS contribution</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* SaaS Revenue by Segment */}
          {saasSegments && saasSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">SaaS Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {saasSegments.map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = totalSaaSRevenue > 0 ? (segment.revenue / totalSaaSRevenue * 100) : 0
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{segment.name}</span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SaaS Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is SaaS?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Software as a Service (SaaS) delivers applications over the internet on a subscription basis. Customers access software through a web browser without installing or maintaining it locally.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Subscription Model</h3>
                  <p className="text-sm text-muted-foreground">Monthly or annual recurring revenue</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Cloud-Based</h3>
                  <p className="text-sm text-muted-foreground">Access from anywhere, automatic updates</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Scalability</h3>
                  <p className="text-sm text-muted-foreground">Easy to add users and features</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete subscription revenue breakdown and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cloud-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Cloud Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {saasFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> SaaS revenue data is based on publicly filed financial statements and segment reporting. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="saas-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
