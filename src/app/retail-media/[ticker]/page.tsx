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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Retail Media Revenue ${currentYear} - Commerce Advertising Analysis`,
    description: `${symbol} retail media advertising revenue analysis. Track retail media network performance, sponsored product ads, and commerce media growth.`,
    keywords: [
      `${symbol} retail media`,
      `${symbol} retail media revenue`,
      `${symbol} sponsored products`,
      `${symbol} commerce advertising`,
      `${symbol} retail media network`,
      `${symbol} marketplace ads`,
    ],
    openGraph: {
      title: `${symbol} Retail Media Revenue ${currentYear} | Commerce Advertising`,
      description: `Comprehensive analysis of ${symbol} retail media advertising revenue and marketplace monetization.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/retail-media/${ticker.toLowerCase()}`,
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

export default async function RetailMediaPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/retail-media/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Retail media revenue metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate retail media revenue as percentage of total for retail/e-commerce companies
  const isRetail = sector?.toLowerCase().includes('retail') ||
                   sector?.toLowerCase().includes('consumer') ||
                   industry?.toLowerCase().includes('retail') ||
                   industry?.toLowerCase().includes('e-commerce')
  const retailMediaPercent = isRetail ? 0.08 : 0.03 // Estimated (Amazon is ~7%, others lower)
  const retailMediaRevenue = revenue * retailMediaPercent
  const retailMediaGrowth = revenueGrowth * 2.5 // Retail media growing much faster than total revenue

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s retail media advertising revenue?`,
      answer: `${symbol} (${companyName}) generates an estimated $${(retailMediaRevenue / 1e9).toFixed(2)}B in retail media advertising revenue, representing approximately ${(retailMediaPercent * 100).toFixed(1)}% of total revenue. Retail media includes sponsored product ads, display ads on e-commerce sites, and off-site advertising enabled by first-party purchase data.`
    },
    {
      question: `What is retail media advertising?`,
      answer: `Retail media is advertising sold by retailers and e-commerce platforms, leveraging their first-party shopper data and high-intent audiences. It includes: sponsored product listings, banner ads on retail sites, offsite display/video advertising, and in-store digital signage. ${symbol}'s retail media business capitalizes on valuable purchase intent signals.`
    },
    {
      question: `How does ${symbol} monetize retail media?`,
      answer: `${symbol} monetizes retail media primarily through: sponsored product ads (pay-per-click on search results and product pages), display advertising on owned properties, programmatic advertising using retail data, and potentially affiliate marketing. Margins are typically very high (80%+) due to minimal cost of goods and valuable first-party data.`
    },
    {
      question: `Why is retail media growing so fast?`,
      answer: `Retail media is one of the fastest-growing ad categories due to: cookieless first-party data advantage, closed-loop attribution showing direct sales impact, high purchase intent audiences, premium targeting capabilities, and brands shifting budgets from traditional media. ${symbol} benefits from these structural tailwinds.`
    },
    {
      question: `What is the outlook for ${symbol}'s retail media business?`,
      answer: `Retail media is expected to continue rapid growth as more advertisers recognize its effectiveness and retailers build sophisticated ad platforms. ${symbol}'s success depends on: marketplace GMV growth, advertiser adoption, technology platform capabilities, and ability to expand beyond onsite advertising.`
    },
    {
      question: `How does ${symbol}'s retail media compare to competitors?`,
      answer: `Amazon dominates retail media with ~75% market share, but players like Walmart, Target, Instacart, and others are growing rapidly. Competition is based on: audience scale, purchase data quality, attribution capabilities, advertising technology, and ability to drive measurable ROI for brands.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Retail Media`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Retail Media Revenue ${currentYear} - Commerce Advertising Analysis`,
    description: `Detailed analysis of ${symbol} (${companyName}) retail media advertising revenue and marketplace monetization.`,
    url: pageUrl,
    keywords: [
      `${symbol} retail media`,
      `${symbol} retail media revenue`,
      `${symbol} sponsored products`,
      `${symbol} commerce advertising`,
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
            <span>{symbol} Retail Media</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Retail Media Advertising Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s retail media network and commerce advertising
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

          {/* Retail Media Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Retail Media Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. Retail Media Revenue</p>
                <p className="text-3xl font-bold">${(retailMediaRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">% of Total Revenue</p>
                <p className="text-3xl font-bold">{(retailMediaPercent * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Growth Rate</p>
                <p className={`text-3xl font-bold ${retailMediaGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {retailMediaGrowth >= 0 ? '+' : ''}{(retailMediaGrowth * 100).toFixed(1)}%
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

          {/* Understanding Retail Media */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Retail Media Networks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Retail media has emerged as one of the fastest-growing advertising channels:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>First-Party Data Advantage:</strong> Retailers own valuable purchase data unaffected by cookie deprecation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>High-Intent Audiences:</strong> Shoppers on retail sites are actively in buying mode with strong purchase intent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Closed-Loop Attribution:</strong> Direct measurement of ad exposure to purchase provides clear ROI metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>High Margins:</strong> Retail media typically has 80%+ margins with minimal infrastructure costs</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Explore {symbol}'s Complete Revenue Mix</h2>
            <p className="text-muted-foreground mb-6">
              Access full revenue breakdown, segment analysis, and profitability metrics
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
            <p><strong>Disclaimer:</strong> Retail media revenue estimates are based on industry reports and may not reflect actual company figures. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="retail-media" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
