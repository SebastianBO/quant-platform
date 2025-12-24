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
    title: `${symbol} Supply-Side Platform (SSP) Revenue ${currentYear} - Publisher Analysis`,
    description: `${symbol} SSP revenue and publisher monetization analysis. Track supply-side platform performance, publisher relationships, and inventory monetization.`,
    keywords: [
      `${symbol} SSP revenue`,
      `${symbol} supply side platform`,
      `${symbol} publisher revenue`,
      `${symbol} ad inventory`,
      `${symbol} publisher monetization`,
      `${symbol} SSP business`,
    ],
    openGraph: {
      title: `${symbol} Supply-Side Platform Revenue ${currentYear} | SSP Analysis`,
      description: `Comprehensive analysis of ${symbol} supply-side platform revenue and publisher partnerships.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/supply-side/${ticker.toLowerCase()}`,
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

export default async function SupplySidePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/supply-side/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // SSP revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate SSP revenue as percentage of total for ad tech companies
  const isAdTech = sector?.toLowerCase().includes('technology') ||
                   industry?.toLowerCase().includes('advertising') ||
                   industry?.toLowerCase().includes('internet')
  const sspPercent = isAdTech ? 0.40 : 0.15 // Estimated
  const sspRevenue = revenue * sspPercent
  const sspGrowth = revenueGrowth * 1.1 // SSP typically grows with programmatic

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s supply-side platform (SSP) revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(sspRevenue / 1e9).toFixed(2)}B in SSP revenue, representing approximately ${(sspPercent * 100).toFixed(0)}% of total revenue. SSP technology helps publishers monetize their ad inventory by connecting to multiple demand sources and maximizing yield.`
    },
    {
      question: `What is a supply-side platform?`,
      answer: `A supply-side platform (SSP) is ad tech software that enables publishers to sell ad inventory programmatically. SSPs connect publishers to ad exchanges, DSPs, and ad networks, using real-time bidding to maximize revenue from each impression. ${symbol}'s SSP technology helps publishers optimize yield across multiple demand channels.`
    },
    {
      question: `How does ${symbol} monetize SSP services?`,
      answer: `${symbol} typically monetizes SSP services through a revenue share model, taking a percentage (usually 10-20%) of publisher ad revenue. The company provides value through: header bidding technology, yield optimization, demand partner integrations, brand safety tools, and reporting/analytics.`
    },
    {
      question: `Who are ${symbol}'s SSP competitors?`,
      answer: `The SSP market includes players like Google Ad Manager, Magnite/Rubicon Project, PubMatic, OpenX, and others. Competition is based on: demand density, yield optimization algorithms, publisher tools, fill rates, and revenue share terms. ${symbol} competes by offering differentiated technology and publisher relationships.`
    },
    {
      question: `What is the outlook for ${symbol}'s SSP business?`,
      answer: `The SSP market faces both opportunities and challenges: growing programmatic adoption, CTV expansion, and retail media growth provide tailwinds, while header bidding commoditization, walled garden competition, and consolidation create headwinds. ${symbol}'s performance depends on its ability to innovate and provide unique value to publishers.`
    },
    {
      question: `What trends are affecting ${symbol}'s SSP revenue?`,
      answer: `Key trends include: shift to unified auction/header bidding, growth in CTV/OTT inventory, retail media networks, first-party data strategies, attention metrics, contextual targeting (post-cookies), and consolidation among both publishers and SSP vendors.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} SSP Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Supply-Side Platform Revenue ${currentYear} - Publisher Analysis`,
    description: `Detailed analysis of ${symbol} (${companyName}) SSP revenue and publisher monetization.`,
    url: pageUrl,
    keywords: [
      `${symbol} SSP revenue`,
      `${symbol} supply side platform`,
      `${symbol} publisher revenue`,
      `${symbol} ad inventory`,
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
            <span>{symbol} SSP Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Supply-Side Platform Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s SSP business and publisher monetization
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

          {/* SSP Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">SSP Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. SSP Revenue</p>
                <p className="text-3xl font-bold">${(sspRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(sspPercent * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">SSP Growth Rate</p>
                <p className={`text-3xl font-bold ${sspGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {sspGrowth >= 0 ? '+' : ''}{(sspGrowth * 100).toFixed(1)}%
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

          {/* Understanding SSP */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Supply-Side Platforms</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Supply-side platforms (SSPs) are crucial infrastructure in the programmatic advertising ecosystem:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Publisher Tools:</strong> SSPs provide publishers with technology to manage and optimize ad inventory across multiple demand sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Yield Optimization:</strong> Automated algorithms maximize revenue per impression through dynamic pricing and demand prioritization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Header Bidding:</strong> Technology that enables simultaneous bidding from multiple demand partners before ad server calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Quality Controls:</strong> Brand safety, ad quality filtering, and invalid traffic detection protect publisher reputation</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Explore {symbol}'s Ad Tech Business</h2>
            <p className="text-muted-foreground mb-6">
              Access full revenue analysis, competitive positioning, and growth forecasts
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
            <p><strong>Disclaimer:</strong> SSP revenue estimates are based on industry analysis and may not reflect actual company figures. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="supply-side" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
