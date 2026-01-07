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
    title: `${symbol} PaaS Revenue - Platform as a Service Revenue ${currentYear}`,
    description: `${symbol} PaaS revenue breakdown: platform-as-a-service sales, PaaS growth, developer platform revenue. Analyze ${symbol}'s platform cloud revenue.`,
    keywords: [
      `${symbol} PaaS revenue`,
      `${symbol} platform as a service`,
      `${symbol} PaaS sales`,
      `${symbol} developer platform`,
      `${symbol} cloud platform`,
      `${symbol} PaaS growth`,
    ],
    openGraph: {
      title: `${symbol} PaaS Revenue ${currentYear} | Platform Cloud Revenue`,
      description: `Complete ${symbol} PaaS revenue analysis with platform-as-a-service trends and growth rates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/paas-revenue/${ticker.toLowerCase()}`,
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

export default async function PaaSRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/paas-revenue/${ticker.toLowerCase()}`
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

  // Filter PaaS-related segments
  const paasSegments = productSegments?.filter((seg: any) =>
    seg.name?.toLowerCase().includes('paas') ||
    seg.name?.toLowerCase().includes('platform') ||
    seg.name?.toLowerCase().includes('app engine') ||
    seg.name?.toLowerCase().includes('cloud foundry') ||
    seg.name?.toLowerCase().includes('heroku')
  ) || []

  const totalPaaSRevenue = paasSegments.reduce((sum: number, seg: any) => sum + (seg.revenue || 0), 0)
  const paasRevenuePercentage = latestRevenue > 0 ? (totalPaaSRevenue / latestRevenue * 100) : 0

  // Generate PaaS revenue FAQs
  const paasFaqs = [
    {
      question: `What is ${symbol}'s PaaS revenue?`,
      answer: totalPaaSRevenue > 0
        ? `${symbol} (${companyName}) reported ${totalPaaSRevenue >= 1e9 ? `$${(totalPaaSRevenue / 1e9).toFixed(2)} billion` : `$${(totalPaaSRevenue / 1e6).toFixed(0)} million`} in PaaS (Platform-as-a-Service) revenue for ${latestPeriod}, representing ${paasRevenuePercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not currently break out PaaS revenue as a separate segment. Platform services may be included in broader cloud revenue reporting.`
    },
    {
      question: `What is Platform as a Service (PaaS)?`,
      answer: `PaaS provides a complete development and deployment environment in the cloud. Companies like ${companyName} offer PaaS solutions that allow developers to build, test, and deploy applications without managing underlying infrastructure.`
    },
    {
      question: `How fast is ${symbol}'s PaaS business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s PaaS revenue is growing ${(revenueGrowth * 100).toFixed(1)}% year-over-year, driven by increasing developer adoption and cloud-native application development.`
        : `PaaS growth data will be available after the next earnings report. Platform services continue to gain traction among enterprise developers.`
    },
    {
      question: `What PaaS services does ${symbol} offer?`,
      answer: paasSegments.length > 0
        ? `${symbol}'s PaaS services include: ${paasSegments.slice(0, 3).map((s: any) => s.name).join(', ')}. These platforms provide development tools, databases, and middleware.`
        : `${companyName} may offer PaaS services as part of their ${sector || 'technology'} portfolio. Check the cloud revenue breakdown for platform-related offerings.`
    },
    {
      question: `Who are ${symbol}'s PaaS competitors?`,
      answer: `In the PaaS market, ${symbol} competes with Heroku, Google App Engine, Microsoft Azure App Service, AWS Elastic Beanstalk, and other cloud platform providers. The PaaS market is growing rapidly as companies adopt cloud-native development.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} PaaS Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} PaaS Revenue ${currentYear} - Platform as a Service Analysis`,
    description: `Complete PaaS revenue analysis for ${symbol} (${companyName}) with platform cloud trends and growth rates.`,
    url: pageUrl,
    keywords: [
      `${symbol} PaaS revenue`,
      `${symbol} platform as a service`,
      `${symbol} cloud platform`,
      `${symbol} PaaS growth`,
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

  const faqSchema = getFAQSchema(paasFaqs)

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
            <span>{symbol} PaaS Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} PaaS Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Platform-as-a-Service revenue data for {companyName}
          </p>

          {/* Latest PaaS Revenue Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total PaaS Revenue</p>
                <p className="text-3xl font-bold">
                  {totalPaaSRevenue > 0
                    ? totalPaaSRevenue >= 1e9
                      ? `$${(totalPaaSRevenue / 1e9).toFixed(2)}B`
                      : `$${(totalPaaSRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-purple-500">
                  {paasRevenuePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">PaaS contribution</p>
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

          {/* PaaS Revenue by Segment */}
          {paasSegments && paasSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">PaaS Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {paasSegments.map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = totalPaaSRevenue > 0 ? (segment.revenue / totalPaaSRevenue * 100) : 0
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
                            className="bg-purple-500 h-2 rounded-full transition-all"
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

          {/* PaaS Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is PaaS?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Platform as a Service (PaaS) provides a complete development and deployment environment in the cloud. Developers can build applications without managing servers, storage, networking, and databases.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Development Tools</h3>
                  <p className="text-sm text-muted-foreground">IDEs, version control, build automation</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Middleware</h3>
                  <p className="text-sm text-muted-foreground">Databases, messaging, caching services</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Deployment</h3>
                  <p className="text-sm text-muted-foreground">CI/CD, scaling, monitoring</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete cloud revenue breakdown and AI-powered insights
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
              {paasFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> PaaS revenue data is based on publicly filed financial statements and segment reporting. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="paas-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
