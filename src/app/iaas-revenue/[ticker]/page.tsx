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
    title: `${symbol} IaaS Revenue - Infrastructure as a Service Revenue ${currentYear}`,
    description: `${symbol} IaaS revenue breakdown: infrastructure-as-a-service sales, IaaS growth, compute revenue, storage revenue. Analyze ${symbol}'s infrastructure cloud revenue.`,
    keywords: [
      `${symbol} IaaS revenue`,
      `${symbol} infrastructure as a service`,
      `${symbol} IaaS sales`,
      `${symbol} cloud infrastructure`,
      `${symbol} compute revenue`,
      `${symbol} storage revenue`,
    ],
    openGraph: {
      title: `${symbol} IaaS Revenue ${currentYear} | Infrastructure Cloud Revenue`,
      description: `Complete ${symbol} IaaS revenue analysis with infrastructure-as-a-service trends and growth rates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/iaas-revenue/${ticker.toLowerCase()}`,
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

export default async function IaaSRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/iaas-revenue/${ticker.toLowerCase()}`
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

  // Filter IaaS-related segments
  const iaasSegments = productSegments?.filter((seg: any) =>
    seg.name?.toLowerCase().includes('iaas') ||
    seg.name?.toLowerCase().includes('infrastructure') ||
    seg.name?.toLowerCase().includes('compute') ||
    seg.name?.toLowerCase().includes('ec2') ||
    seg.name?.toLowerCase().includes('virtual machine')
  ) || []

  const totalIaaSRevenue = iaasSegments.reduce((sum: number, seg: any) => sum + (seg.revenue || 0), 0)
  const iaasRevenuePercentage = latestRevenue > 0 ? (totalIaaSRevenue / latestRevenue * 100) : 0

  // Generate IaaS revenue FAQs
  const iaasFaqs = [
    {
      question: `What is ${symbol}'s IaaS revenue?`,
      answer: totalIaaSRevenue > 0
        ? `${symbol} (${companyName}) reported ${totalIaaSRevenue >= 1e9 ? `$${(totalIaaSRevenue / 1e9).toFixed(2)} billion` : `$${(totalIaaSRevenue / 1e6).toFixed(0)} million`} in IaaS (Infrastructure-as-a-Service) revenue for ${latestPeriod}, representing ${iaasRevenuePercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not currently break out IaaS revenue as a separate segment. Infrastructure services may be included in broader cloud revenue reporting.`
    },
    {
      question: `What is Infrastructure as a Service (IaaS)?`,
      answer: `IaaS provides virtualized computing resources over the internet, including compute, storage, and networking. Companies like ${companyName} offer IaaS solutions that allow businesses to rent infrastructure instead of maintaining physical data centers.`
    },
    {
      question: `How fast is ${symbol}'s IaaS business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s IaaS revenue is growing ${(revenueGrowth * 100).toFixed(1)}% year-over-year, driven by enterprise cloud migrations and increased demand for scalable infrastructure.`
        : `IaaS growth data will be available after the next earnings report. Infrastructure cloud services remain a key growth driver for major cloud providers.`
    },
    {
      question: `What IaaS services does ${symbol} offer?`,
      answer: iaasSegments.length > 0
        ? `${symbol}'s IaaS services include: ${iaasSegments.slice(0, 3).map((s: any) => s.name).join(', ')}. These infrastructure services provide compute, storage, and networking capabilities.`
        : `${companyName} may offer IaaS services as part of their ${sector || 'technology'} portfolio. Check the cloud revenue breakdown for infrastructure-related offerings.`
    },
    {
      question: `Who are ${symbol}'s IaaS competitors?`,
      answer: `In the IaaS market, ${symbol} competes with Amazon Web Services (AWS EC2), Microsoft Azure Virtual Machines, Google Cloud Platform (GCP), and other cloud infrastructure providers. Market share varies by region and industry vertical.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} IaaS Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} IaaS Revenue ${currentYear} - Infrastructure as a Service Analysis`,
    description: `Complete IaaS revenue analysis for ${symbol} (${companyName}) with infrastructure cloud trends and growth rates.`,
    url: pageUrl,
    keywords: [
      `${symbol} IaaS revenue`,
      `${symbol} infrastructure as a service`,
      `${symbol} cloud infrastructure`,
      `${symbol} IaaS growth`,
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

  const faqSchema = getFAQSchema(iaasFaqs)

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
            <span>{symbol} IaaS Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} IaaS Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Infrastructure-as-a-Service revenue data for {companyName}
          </p>

          {/* Latest IaaS Revenue Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total IaaS Revenue</p>
                <p className="text-3xl font-bold">
                  {totalIaaSRevenue > 0
                    ? totalIaaSRevenue >= 1e9
                      ? `$${(totalIaaSRevenue / 1e9).toFixed(2)}B`
                      : `$${(totalIaaSRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-cyan-500">
                  {iaasRevenuePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">IaaS contribution</p>
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

          {/* IaaS Revenue by Segment */}
          {iaasSegments && iaasSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">IaaS Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {iaasSegments.map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = totalIaaSRevenue > 0 ? (segment.revenue / totalIaaSRevenue * 100) : 0
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
                            className="bg-cyan-500 h-2 rounded-full transition-all"
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

          {/* IaaS Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is IaaS?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Infrastructure as a Service (IaaS) provides virtualized computing resources over the internet. Companies can rent servers, storage, and networking instead of purchasing and maintaining physical hardware.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Compute</h3>
                  <p className="text-sm text-muted-foreground">Virtual machines, containers, serverless computing</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Storage</h3>
                  <p className="text-sm text-muted-foreground">Object storage, block storage, file systems</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Networking</h3>
                  <p className="text-sm text-muted-foreground">Virtual networks, load balancers, CDN</p>
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
              {iaasFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> IaaS revenue data is based on publicly filed financial statements and segment reporting. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="iaas-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
