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
    title: `${symbol} Sales Cloud Revenue - Sales Automation & CRM Sales ${currentYear}`,
    description: `${symbol} Sales Cloud revenue breakdown: sales automation revenue, growth trends, customer adoption. Analyze ${symbol}'s Sales Cloud performance.`,
    keywords: [
      `${symbol} Sales Cloud revenue`,
      `${symbol} sales automation`,
      `${symbol} Sales Cloud sales`,
      `${symbol} Sales Cloud growth`,
    ],
    openGraph: {
      title: `${symbol} Sales Cloud Revenue ${currentYear} | Sales Automation Analytics`,
      description: `Complete ${symbol} Sales Cloud revenue analysis with growth trends and market data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sales-cloud/${ticker.toLowerCase()}`,
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

export default async function SalesCloudPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/sales-cloud/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Find Sales Cloud revenue segment (if available)
  const salesCloudSegment = productSegments?.find((seg: any) =>
    seg.name?.toLowerCase().includes('sales cloud') ||
    seg.name?.toLowerCase().includes('sales') ||
    seg.name?.toLowerCase().includes('automation')
  )
  const salesCloudRevenue = salesCloudSegment?.revenue || 0
  const salesCloudPercentage = latestRevenue > 0 ? (salesCloudRevenue / latestRevenue * 100) : 0

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate Sales Cloud FAQs
  const salesCloudFaqs = [
    {
      question: `What is ${symbol}'s Sales Cloud revenue?`,
      answer: salesCloudRevenue > 0
        ? `${symbol} (${companyName}) reported ${salesCloudRevenue >= 1e9 ? `$${(salesCloudRevenue / 1e9).toFixed(2)} billion` : `$${(salesCloudRevenue / 1e6).toFixed(0)} million`} in Sales Cloud revenue for ${latestPeriod}, representing ${salesCloudPercentage.toFixed(1)}% of total revenue.`
        : `${symbol} does not separately report Sales Cloud revenue in its financial statements. The company's total revenue for ${latestPeriod} was ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`}.`
    },
    {
      question: `How is ${symbol}'s Sales Cloud business growing?`,
      answer: revenueGrowth > 0
        ? `${symbol}'s overall business achieved ${(revenueGrowth * 100).toFixed(1)}% revenue growth year-over-year. ${salesCloudRevenue > 0 ? 'Sales Cloud is a key driver of this growth as companies invest in sales automation and CRM capabilities.' : 'Sales automation and CRM contribute to the company\'s overall growth trajectory.'}`
        : `${symbol}'s revenue growth has been ${Math.abs(revenueGrowth * 100).toFixed(1)}% year-over-year. Competitive dynamics in the sales automation market may be affecting growth rates.`
    },
    {
      question: `What features does ${symbol}'s Sales Cloud include?`,
      answer: `${companyName} operates in the ${sector || 'technology'} sector and typically offers sales automation features including lead management, opportunity tracking, sales forecasting, pipeline management, and mobile CRM capabilities. For specific product details, visit the company's website.`
    },
    {
      question: `How does ${symbol} Sales Cloud compare to Salesforce?`,
      answer: `${symbol} competes in the sales automation market with total revenue of ${latestRevenue >= 1e9 ? `$${(latestRevenue / 1e9).toFixed(2)} billion` : `$${(latestRevenue / 1e6).toFixed(0)} million`}. Compare ${symbol} to Salesforce (CRM), Microsoft Dynamics (MSFT), and HubSpot (HUBS) to evaluate competitive positioning in the sales cloud market.`
    },
    {
      question: `What is the sales automation market opportunity?`,
      answer: `The global sales automation and CRM market continues to expand as businesses seek to improve sales productivity, customer engagement, and revenue forecasting. ${symbol}'s market opportunity depends on product innovation, customer adoption rates, and competitive differentiation.`
    },
    {
      question: `Where can I find ${symbol}'s Sales Cloud customer metrics?`,
      answer: `For detailed Sales Cloud metrics, customer counts, average contract values, and retention rates, review ${symbol}'s quarterly earnings calls, investor presentations, and annual 10-K filings available on their investor relations website.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Sales Cloud`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Sales Cloud Revenue ${currentYear} - Sales Automation Analytics`,
    description: `Complete Sales Cloud revenue analysis for ${symbol} (${companyName}) with growth trends and market insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} Sales Cloud revenue`,
      `${symbol} sales automation`,
      `${symbol} CRM sales`,
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

  const faqSchema = getFAQSchema(salesCloudFaqs)

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
            <span>{symbol} Sales Cloud</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Sales Cloud Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sales automation and CRM revenue data for {companyName}
          </p>

          {/* Latest Revenue Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              {salesCloudRevenue > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sales Cloud Revenue</p>
                  <p className="text-3xl font-bold text-green-500">
                    {salesCloudRevenue >= 1e9
                      ? `$${(salesCloudRevenue / 1e9).toFixed(2)}B`
                      : `$${(salesCloudRevenue / 1e6).toFixed(0)}M`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{salesCloudPercentage.toFixed(1)}% of total</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          {productSegments && productSegments.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Revenue by Segment</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="space-y-4">
                  {productSegments.slice(0, 8).map((segment: { name: string; revenue: number }, index: number) => {
                    const percentage = latestRevenue > 0 ? (segment.revenue / latestRevenue * 100) : 0
                    const isSalesCloud = segment.name?.toLowerCase().includes('sales cloud') ||
                                         segment.name?.toLowerCase().includes('sales')
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isSalesCloud ? 'text-green-500' : ''}`}>
                            {segment.name}
                            {isSalesCloud && ' (Sales)'}
                          </span>
                          <span className="text-muted-foreground">
                            {segment.revenue >= 1e9
                              ? `$${(segment.revenue / 1e9).toFixed(2)}B`
                              : `$${(segment.revenue / 1e6).toFixed(0)}M`}
                            {percentage > 0 && ` (${percentage.toFixed(1)}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`${isSalesCloud ? 'bg-green-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
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

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue History</h2>
            <div className="space-y-3">
              {incomeStatements?.slice(0, 5).map((statement: any, index: number) => {
                const prevStatement = incomeStatements[index + 1]
                const growth = prevStatement?.revenue
                  ? ((statement.revenue - prevStatement.revenue) / prevStatement.revenue)
                  : null

                return (
                  <div key={statement.report_period} className="bg-card p-5 rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{statement.report_period}</p>
                        <p className="text-2xl font-bold">
                          {statement.revenue >= 1e9
                            ? `$${(statement.revenue / 1e9).toFixed(2)}B`
                            : `$${(statement.revenue / 1e6).toFixed(0)}M`}
                        </p>
                      </div>
                      {growth !== null && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">YoY Growth</p>
                          <p className={`text-xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{(growth * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete income statements, revenue segments, and AI-powered insights
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
                Full Revenue Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {salesCloudFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="sales-cloud" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
