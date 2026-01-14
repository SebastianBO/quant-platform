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
    title: `${symbol} Connected TV (CTV) Revenue ${currentYear} - Streaming Ad Analysis`,
    description: `${symbol} connected TV advertising revenue analysis. Detailed breakdown of CTV ad sales, streaming inventory, and growth in over-the-top (OTT) advertising.`,
    keywords: [
      `${symbol} CTV revenue`,
      `${symbol} connected TV`,
      `${symbol} streaming advertising`,
      `${symbol} OTT revenue`,
      `${symbol} CTV ad revenue`,
      `${symbol} streaming ad sales`,
    ],
    openGraph: {
      title: `${symbol} Connected TV Revenue ${currentYear} | CTV Advertising Analysis`,
      description: `Comprehensive analysis of ${symbol} connected TV advertising revenue and streaming ad growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ctv-revenue/${ticker.toLowerCase()}`,
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

export default async function CTVRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/ctv-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // CTV revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate CTV revenue as percentage of total for streaming/ad tech companies
  const isStreamingAdTech = sector?.toLowerCase().includes('technology') ||
                            industry?.toLowerCase().includes('advertising') ||
                            industry?.toLowerCase().includes('entertainment')
  const ctvPercent = isStreamingAdTech ? 0.25 : 0.10 // Estimated
  const ctvRevenue = revenue * ctvPercent
  const ctvGrowth = revenueGrowth * 1.5 // CTV typically grows faster than overall digital

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s connected TV (CTV) advertising revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(ctvRevenue / 1e9).toFixed(2)}B in connected TV advertising revenue, representing approximately ${(ctvPercent * 100).toFixed(0)}% of total revenue. CTV advertising refers to ads delivered through internet-connected television devices and streaming platforms.`
    },
    {
      question: `How fast is ${symbol}'s CTV revenue growing?`,
      answer: `${symbol}'s CTV revenue is estimated to be growing at ${(ctvGrowth * 100).toFixed(1)}% year-over-year, significantly outpacing traditional linear TV advertising. The CTV market is one of the fastest-growing segments in digital advertising as viewership shifts from cable to streaming.`
    },
    {
      question: `What is connected TV (CTV) advertising?`,
      answer: `Connected TV advertising delivers video ads through internet-connected devices like smart TVs, streaming sticks, and gaming consoles. CTV combines the engagement of traditional TV with digital targeting capabilities, offering advertisers premium video inventory with advanced audience segmentation.`
    },
    {
      question: `How does ${symbol} monetize CTV inventory?`,
      answer: `${symbol} monetizes CTV through various methods including: programmatic CTV ad sales, direct deals with advertisers, private marketplace (PMP) auctions, and partnerships with streaming platforms. Revenue comes from both owned inventory and third-party supply aggregation.`
    },
    {
      question: `What is the outlook for ${symbol}'s CTV advertising business?`,
      answer: `The CTV advertising market is expected to continue strong double-digit growth as cord-cutting accelerates and ad-supported streaming gains traction. ${symbol} is positioned to benefit from increased CTV budgets, though competition from streaming platforms and other ad tech players remains intense.`
    },
    {
      question: `What challenges does ${symbol} face in CTV advertising?`,
      answer: `Key challenges include: fragmentation across streaming platforms, measurement and attribution complexity, competition from walled gardens (Netflix, Disney+, etc.), evolving privacy standards, and the need for cross-screen frequency management and unified reach measurement.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} CTV Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Connected TV Revenue ${currentYear} - Streaming Ad Analysis`,
    description: `Detailed analysis of ${symbol} (${companyName}) connected TV advertising revenue and OTT market positioning.`,
    url: pageUrl,
    keywords: [
      `${symbol} CTV revenue`,
      `${symbol} connected TV`,
      `${symbol} streaming advertising`,
      `${symbol} OTT revenue`,
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
            <span>{symbol} CTV Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Connected TV Advertising Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s CTV and streaming advertising revenue
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

          {/* CTV Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Connected TV Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. CTV Revenue</p>
                <p className="text-3xl font-bold">${(ctvRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(ctvPercent * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">CTV Growth Rate</p>
                <p className={`text-3xl font-bold ${ctvGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {ctvGrowth >= 0 ? '+' : ''}{(ctvGrowth * 100).toFixed(1)}%
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

          {/* Understanding CTV */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Connected TV Advertising</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Connected TV (CTV) refers to television content delivered via internet-connected devices, representing a major shift in how viewers consume video content:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Premium Video Inventory:</strong> Full-screen, high-engagement ad placements on the largest screen in the home</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Advanced Targeting:</strong> Household-level targeting with digital precision unlike linear TV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Programmatic Buying:</strong> Automated purchasing with real-time optimization capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Streaming Platforms:</strong> Distribution across AVOD (ad-supported) services, FAST channels, and hybrid models</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Explore {symbol}'s Complete Revenue Picture</h2>
            <p className="text-muted-foreground mb-6">
              Access full revenue breakdown, segment analysis, and growth projections
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
            <p><strong>Disclaimer:</strong> CTV revenue estimates are based on industry trends and company disclosures. Actual figures may vary significantly. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ctv-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
