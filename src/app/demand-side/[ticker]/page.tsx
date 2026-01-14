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
    title: `${symbol} Demand-Side Platform (DSP) Revenue ${currentYear} - Advertiser Analysis`,
    description: `${symbol} DSP revenue and advertiser platform analysis. Track demand-side platform performance, advertiser spend, and programmatic buying technology.`,
    keywords: [
      `${symbol} DSP revenue`,
      `${symbol} demand side platform`,
      `${symbol} advertiser platform`,
      `${symbol} programmatic buying`,
      `${symbol} DSP business`,
      `${symbol} ad buying platform`,
    ],
    openGraph: {
      title: `${symbol} Demand-Side Platform Revenue ${currentYear} | DSP Analysis`,
      description: `Comprehensive analysis of ${symbol} demand-side platform revenue and advertiser relationships.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/demand-side/${ticker.toLowerCase()}`,
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

export default async function DemandSidePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/demand-side/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // DSP revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate DSP revenue as percentage of total for ad tech companies
  const isAdTech = sector?.toLowerCase().includes('technology') ||
                   industry?.toLowerCase().includes('advertising') ||
                   industry?.toLowerCase().includes('internet')
  const dspPercent = isAdTech ? 0.35 : 0.12 // Estimated
  const dspRevenue = revenue * dspPercent
  const dspGrowth = revenueGrowth * 1.15 // DSP typically grows faster with programmatic adoption

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s demand-side platform (DSP) revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(dspRevenue / 1e9).toFixed(2)}B in DSP revenue, representing approximately ${(dspPercent * 100).toFixed(0)}% of total revenue. DSP technology enables advertisers to programmatically purchase ad inventory across multiple publishers and exchanges through automated bidding.`
    },
    {
      question: `What is a demand-side platform?`,
      answer: `A demand-side platform (DSP) is advertising technology that allows advertisers and agencies to buy ad inventory programmatically. DSPs aggregate inventory from multiple sources, use data for targeting, execute real-time bidding, and optimize campaigns across channels. ${symbol}'s DSP helps advertisers efficiently reach their target audiences at scale.`
    },
    {
      question: `How does ${symbol} monetize DSP services?`,
      answer: `${symbol} typically monetizes DSP services through a percentage of media spend (platform fee), often 10-20% of advertiser budgets. The company provides value through: audience targeting capabilities, cross-channel campaign management, optimization algorithms, creative management, measurement tools, and fraud prevention.`
    },
    {
      question: `Who are ${symbol}'s DSP competitors?`,
      answer: `The DSP market includes Google DV360, The Trade Desk, Amazon AAP, Adobe Advertising Cloud, and others. Competition is based on: inventory access, data partnerships, targeting precision, optimization technology, transparency, and pricing. ${symbol} differentiates through its technology stack and advertiser relationships.`
    },
    {
      question: `What is the outlook for ${symbol}'s DSP business?`,
      answer: `The DSP market benefits from increasing programmatic adoption, CTV growth, and omnichannel advertising needs. Challenges include privacy regulations, signal loss post-cookies, walled garden competition, and fee pressure. ${symbol}'s success depends on adapting to privacy changes and demonstrating ROI for advertisers.`
    },
    {
      question: `What trends are affecting ${symbol}'s DSP revenue?`,
      answer: `Key trends include: cookieless targeting solutions, contextual advertising resurgence, first-party data strategies, retail media integration, CTV/OTT expansion, attention-based buying, AI-powered optimization, and consolidation among both advertisers and DSP vendors.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} DSP Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Demand-Side Platform Revenue ${currentYear} - Advertiser Analysis`,
    description: `Detailed analysis of ${symbol} (${companyName}) DSP revenue and advertiser platform performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} DSP revenue`,
      `${symbol} demand side platform`,
      `${symbol} advertiser platform`,
      `${symbol} programmatic buying`,
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
            <span>{symbol} DSP Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Demand-Side Platform Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s DSP business and advertiser platform
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

          {/* DSP Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DSP Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. DSP Revenue</p>
                <p className="text-3xl font-bold">${(dspRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(dspPercent * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">DSP Growth Rate</p>
                <p className={`text-3xl font-bold ${dspGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dspGrowth >= 0 ? '+' : ''}{(dspGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">YoY</p>
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

          {/* Understanding DSP */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Demand-Side Platforms</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Demand-side platforms (DSPs) are essential infrastructure for programmatic advertising buyers:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Media Buying Automation:</strong> DSPs enable advertisers to purchase inventory programmatically across multiple exchanges and publishers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Audience Targeting:</strong> Integration with data providers and first-party data for precise audience segmentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Real-Time Optimization:</strong> AI-powered algorithms adjust bids and targeting in real-time to maximize campaign performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Cross-Channel Management:</strong> Unified platform for display, video, mobile, CTV, audio, and native advertising</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol}'s Ad Tech Platform</h2>
            <p className="text-muted-foreground mb-6">
              Access complete revenue analysis, competitive insights, and growth forecasts
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
            <p><strong>Disclaimer:</strong> DSP revenue estimates are based on industry analysis and may not reflect actual company figures. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="demand-side" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
