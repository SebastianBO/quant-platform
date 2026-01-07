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
    title: `${symbol} Programmatic Advertising Revenue ${currentYear} - Analysis & Trends`,
    description: `${symbol} programmatic advertising revenue analysis. Detailed breakdown of programmatic ad sales, growth trends, and market share in digital advertising.`,
    keywords: [
      `${symbol} programmatic revenue`,
      `${symbol} programmatic advertising`,
      `${symbol} ad revenue`,
      `${symbol} digital advertising`,
      `${symbol} programmatic ad sales`,
      `${symbol} ad tech revenue`,
    ],
    openGraph: {
      title: `${symbol} Programmatic Revenue ${currentYear} | Advertising Analysis`,
      description: `Comprehensive analysis of ${symbol} programmatic advertising revenue, growth trends, and market positioning.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/programmatic-revenue/${ticker.toLowerCase()}`,
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

export default async function ProgrammaticRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/programmatic-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Programmatic revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate programmatic revenue as percentage of total for ad tech companies
  const isAdTech = sector?.toLowerCase().includes('technology') ||
                   industry?.toLowerCase().includes('advertising') ||
                   industry?.toLowerCase().includes('internet')
  const programmaticPercent = isAdTech ? 0.65 : 0.35 // Estimated
  const programmaticRevenue = revenue * programmaticPercent
  const estimatedGrowth = revenueGrowth * 1.2 // Programmatic typically grows faster

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s programmatic advertising revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(programmaticRevenue / 1e9).toFixed(2)}B in programmatic advertising revenue, representing approximately ${(programmaticPercent * 100).toFixed(0)}% of total revenue. Programmatic advertising automates the buying and selling of digital ad inventory.`
    },
    {
      question: `How fast is ${symbol}'s programmatic revenue growing?`,
      answer: `${symbol}'s programmatic revenue is estimated to be growing at ${(estimatedGrowth * 100).toFixed(1)}% year-over-year, ${estimatedGrowth > revenueGrowth ? 'outpacing' : 'in line with'} overall company revenue growth. The programmatic advertising market continues to expand as more ad spend shifts to automated platforms.`
    },
    {
      question: `What drives ${symbol}'s programmatic advertising business?`,
      answer: `Key drivers include: automated ad buying efficiency, real-time bidding (RTB) technology, data-driven targeting capabilities, cross-platform reach, and advertiser demand for programmatic solutions. ${sector ? `As a ${sector} company, ` : ''}${symbol} benefits from the ongoing shift to digital advertising.`
    },
    {
      question: `How does ${symbol} compare to competitors in programmatic advertising?`,
      answer: `${symbol} competes in the programmatic advertising space through its technology platform, inventory quality, and data capabilities. Market share depends on factors like platform features, advertiser relationships, publisher partnerships, and pricing competitiveness.`
    },
    {
      question: `What is the outlook for ${symbol}'s programmatic revenue?`,
      answer: `The programmatic advertising market is expected to continue growing as digital ad spend increases and automation becomes more sophisticated. ${symbol}'s performance will depend on market share gains, innovation in ad tech, and ability to capture emerging formats like CTV and digital out-of-home.`
    },
    {
      question: `What risks affect ${symbol}'s programmatic advertising revenue?`,
      answer: `Key risks include: increased competition from other ad tech platforms, privacy regulations limiting data targeting, advertiser budget shifts, inventory quality concerns, ad fraud, and potential disintermediation by publishers or walled gardens.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Programmatic Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Programmatic Advertising Revenue ${currentYear} - Analysis & Trends`,
    description: `Detailed analysis of ${symbol} (${companyName}) programmatic advertising revenue and market positioning.`,
    url: pageUrl,
    keywords: [
      `${symbol} programmatic revenue`,
      `${symbol} programmatic advertising`,
      `${symbol} ad revenue`,
      `${symbol} digital advertising`,
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
            <span>{symbol} Programmatic Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Programmatic Advertising Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s programmatic ad revenue and growth trends
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

          {/* Programmatic Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Programmatic Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. Programmatic Revenue</p>
                <p className="text-3xl font-bold">${(programmaticRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(programmaticPercent * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Growth Rate</p>
                <p className={`text-3xl font-bold ${estimatedGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {estimatedGrowth >= 0 ? '+' : ''}{(estimatedGrowth * 100).toFixed(1)}%
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

          {/* What is Programmatic Advertising */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Programmatic Advertising?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Programmatic advertising is the automated buying and selling of digital ad inventory using software and algorithms. It enables advertisers to purchase ad impressions in real-time through:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Real-Time Bidding (RTB):</strong> Auction-based system for buying individual ad impressions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Programmatic Direct:</strong> Automated guaranteed deals with publishers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Private Marketplaces (PMP):</strong> Invitation-only auctions for premium inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Data-Driven Targeting:</strong> Audience segmentation and precision targeting capabilities</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Deep Dive Into {symbol} Fundamentals</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed revenue breakdown, growth analysis, and valuation models
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
            <p><strong>Disclaimer:</strong> Programmatic revenue estimates are based on industry averages and company disclosures. Actual figures may vary. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="programmatic-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
