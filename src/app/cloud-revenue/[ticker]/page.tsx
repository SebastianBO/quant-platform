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
    title: `${symbol} Cloud Revenue - Annual & Quarterly Cloud Sales Data ${currentYear}`,
    description: `${symbol} cloud revenue breakdown: total cloud sales, cloud revenue growth, quarterly cloud trends, cloud revenue by segment. Analyze ${symbol}'s cloud computing revenue performance.`,
    keywords: [
      `${symbol} cloud revenue`,
      `${symbol} cloud sales`,
      `${symbol} cloud computing revenue`,
      `${symbol} cloud growth`,
      `${symbol} AWS revenue`,
      `${symbol} Azure revenue`,
    ],
    openGraph: {
      title: `${symbol} Cloud Revenue ${currentYear} | Cloud Computing Sales`,
      description: `Complete ${symbol} cloud revenue analysis with annual/quarterly trends, growth rates, and cloud segment breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cloud-revenue/${ticker.toLowerCase()}`,
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

export default async function CloudRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cloud-revenue/${ticker.toLowerCase()}`
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

  // Filter cloud-related segments
  const cloudSegments = productSegments?.filter((seg: any) =>
    seg.name?.toLowerCase().includes('cloud') ||
    seg.name?.toLowerCase().includes('aws') ||
    seg.name?.toLowerCase().includes('azure') ||
    seg.name?.toLowerCase().includes('gcp') ||
    seg.name?.toLowerCase().includes('google cloud')
  ) || []

  const totalCloudRevenue = cloudSegments.reduce((sum: number, seg: any) => sum + (seg.revenue || 0), 0)
  const cloudRevenuePercentage = latestRevenue > 0 ? (totalCloudRevenue / latestRevenue * 100) : 0

  // Quarterly data
  const quarters = quarterlyIncome?.slice(0, 8) || []

  // Generate cloud revenue FAQs
  const cloudFaqs = [
    {
      question: `What is ${symbol}'s cloud revenue?`,
      answer: totalCloudRevenue > 0
        ? `${symbol} (${companyName}) reported ${totalCloudRevenue >= 1e9 ? `$${(totalCloudRevenue / 1e9).toFixed(2)} billion` : `$${(totalCloudRevenue / 1e6).toFixed(0)} million`} in cloud revenue for ${latestPeriod}, representing ${cloudRevenuePercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not currently break out cloud revenue as a separate segment in their financial reporting. Check the revenue breakdown for cloud-related business lines.`
    },
    {
      question: `How fast is ${symbol}'s cloud business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s cloud revenue is growing ${(revenueGrowth * 100).toFixed(1)}% year-over-year, driven by increasing enterprise cloud adoption and digital transformation initiatives.`
        : `Cloud revenue growth data will be available after the next earnings report. Cloud computing remains a key growth driver in the ${sector || 'technology'} sector.`
    },
    {
      question: `What cloud services does ${symbol} offer?`,
      answer: cloudSegments.length > 0
        ? `${symbol}'s cloud services include: ${cloudSegments.slice(0, 3).map((s: any) => s.name).join(', ')}${cloudSegments.length > 3 ? ', and other cloud solutions' : ''}. See detailed breakdown below.`
        : `${companyName} operates in the ${sector || 'technology'} sector${industry ? ` focusing on ${industry}` : ''}. Cloud services may be part of their broader product offerings.`
    },
    {
      question: `How does ${symbol} compare to cloud competitors?`,
      answer: `${symbol} competes in the cloud computing market with major players like AWS (Amazon), Azure (Microsoft), and Google Cloud. Compare ${symbol} to competitors to see relative cloud market share and growth rates.`
    },
    {
      question: `What drives ${symbol}'s cloud revenue?`,
      answer: `Cloud revenue is typically driven by: enterprise cloud migrations, new customer acquisitions, infrastructure-as-a-service (IaaS) usage, platform-as-a-service (PaaS) subscriptions, and software-as-a-service (SaaS) recurring revenue. ${companyName}'s cloud strategy focuses on scaling these revenue streams.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Cloud Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Cloud Revenue ${currentYear} - Cloud Computing Sales Analysis`,
    description: `Complete cloud revenue analysis for ${symbol} (${companyName}) with cloud trends, growth rates, and segment breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} cloud revenue`,
      `${symbol} cloud sales`,
      `${symbol} cloud computing`,
      `${symbol} cloud growth`,
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

  const faqSchema = getFAQSchema(cloudFaqs)

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
            <span>{symbol} Cloud Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Cloud Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cloud computing revenue and sales data for {companyName}
          </p>

          {/* Latest Cloud Revenue Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cloud Revenue</p>
                <p className="text-3xl font-bold">
                  {totalCloudRevenue > 0
                    ? totalCloudRevenue >= 1e9
                      ? `$${(totalCloudRevenue / 1e9).toFixed(2)}B`
                      : `$${(totalCloudRevenue / 1e6).toFixed(0)}M`
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-blue-500">
                  {cloudRevenuePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">cloud contribution</p>
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

          {/* Cloud Revenue by Segment */}
          {cloudSegments && cloudSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cloud Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {cloudSegments.map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = totalCloudRevenue > 0 ? (segment.revenue / totalCloudRevenue * 100) : 0
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
                            className="bg-blue-500 h-2 rounded-full transition-all"
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

          {/* Total Revenue Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Total Revenue Context</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {latestRevenue >= 1e9
                      ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                      : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cloud Revenue</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {totalCloudRevenue > 0
                      ? totalCloudRevenue >= 1e9
                        ? `$${(totalCloudRevenue / 1e9).toFixed(2)}B`
                        : `$${(totalCloudRevenue / 1e6).toFixed(0)}M`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete income statements, balance sheets, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cloudFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Cloud revenue data is based on publicly filed financial statements and segment reporting. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="cloud-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
