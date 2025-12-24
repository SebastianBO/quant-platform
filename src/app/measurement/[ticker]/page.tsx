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
    title: `${symbol} Ad Measurement & Attribution Revenue ${currentYear} - Analytics Platform`,
    description: `${symbol} advertising measurement and attribution revenue analysis. Track ad analytics, attribution technology, and measurement platform performance.`,
    keywords: [
      `${symbol} measurement revenue`,
      `${symbol} ad measurement`,
      `${symbol} attribution`,
      `${symbol} analytics platform`,
      `${symbol} measurement technology`,
      `${symbol} ad verification`,
    ],
    openGraph: {
      title: `${symbol} Ad Measurement Revenue ${currentYear} | Attribution Analytics`,
      description: `Comprehensive analysis of ${symbol} advertising measurement and attribution revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/measurement/${ticker.toLowerCase()}`,
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

export default async function MeasurementPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/measurement/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Measurement revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate measurement revenue as percentage of total for ad tech/analytics companies
  const isMeasurement = sector?.toLowerCase().includes('technology') ||
                        industry?.toLowerCase().includes('advertising') ||
                        industry?.toLowerCase().includes('software')
  const measurementPercent = isMeasurement ? 0.18 : 0.08 // Estimated
  const measurementRevenue = revenue * measurementPercent
  const measurementGrowth = revenueGrowth * 1.3 // Measurement growing with digital ad complexity

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s ad measurement and attribution revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(measurementRevenue / 1e9).toFixed(2)}B in advertising measurement and attribution revenue, representing approximately ${(measurementPercent * 100).toFixed(0)}% of total revenue. This includes analytics platforms, attribution modeling, ad verification, brand safety, and performance measurement solutions.`
    },
    {
      question: `What is advertising measurement and attribution?`,
      answer: `Advertising measurement encompasses technologies that track, analyze, and attribute marketing performance across channels. This includes: multi-touch attribution (MTA), marketing mix modeling (MMM), ad verification, viewability measurement, brand lift studies, and incrementality testing. ${symbol} provides tools to help advertisers understand campaign effectiveness and optimize spend.`
    },
    {
      question: `How does ${symbol} monetize measurement services?`,
      answer: `${symbol} typically monetizes measurement through: SaaS subscription fees, CPM-based ad verification charges, percentage of measured media spend, enterprise platform licenses, and professional services. The business model emphasizes recurring revenue with strong customer retention as measurement becomes mission-critical.`
    },
    {
      question: `Why is ad measurement becoming more important?`,
      answer: `Measurement and attribution are increasingly critical due to: privacy regulations limiting data sharing, cookie deprecation requiring new approaches, multi-channel complexity, CFO scrutiny of marketing ROI, walled garden fragmentation, and advertiser demand for incrementality proof rather than last-click attribution.`
    },
    {
      question: `What is the outlook for ${symbol}'s measurement business?`,
      answer: `The measurement market is expected to grow as advertising becomes more complex and privacy-centric. Opportunities include: cookieless measurement solutions, clean room technologies, attention metrics, incrementality measurement, and retail media measurement. ${symbol} must innovate to address evolving privacy and attribution challenges.`
    },
    {
      question: `What trends are affecting ${symbol}'s measurement revenue?`,
      answer: `Key trends include: shift to privacy-preserving measurement (aggregated/anonymized), attention and quality metrics beyond viewability, unified measurement across walled gardens, AI-powered incrementality testing, first-party data strategies, and integration of online/offline attribution.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Measurement`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Ad Measurement Revenue ${currentYear} - Attribution Analytics`,
    description: `Detailed analysis of ${symbol} (${companyName}) advertising measurement and attribution revenue.`,
    url: pageUrl,
    keywords: [
      `${symbol} measurement revenue`,
      `${symbol} ad measurement`,
      `${symbol} attribution`,
      `${symbol} analytics platform`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Measurement</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Ad Measurement & Attribution Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s measurement platform and attribution technology
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

          {/* Measurement Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Measurement Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. Measurement Revenue</p>
                <p className="text-3xl font-bold">${(measurementRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(measurementPercent * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Growth Rate</p>
                <p className={`text-3xl font-bold ${measurementGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {measurementGrowth >= 0 ? '+' : ''}{(measurementGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">YoY (est.)</p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Company Financials</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">${(revenue / 1e9).toFixed(2)}B</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-bold">{(profitMargin * 100).toFixed(1)}%</p>
              </div>
              {snapshot.market_cap && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-bold">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Understanding Measurement */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Ad Measurement & Attribution</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Advertising measurement and attribution technologies are critical infrastructure for the digital advertising ecosystem:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Multi-Touch Attribution:</strong> Track customer journeys across touchpoints to understand campaign contribution to conversions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Ad Verification:</strong> Ensure ads are viewable, brand-safe, and free from fraud to protect advertiser investments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Incrementality Testing:</strong> Measure true lift from advertising versus organic conversions for ROI validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Cross-Platform Measurement:</strong> Unified analytics across walled gardens, open web, CTV, and offline channels</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol}'s Technology Platform</h2>
            <p className="text-muted-foreground mb-6">
              Access complete financial analysis, technology assessment, and growth forecasts
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
                Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Measurement revenue estimates are based on industry analysis and may not reflect actual company figures. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="measurement" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
