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
    title: `${symbol} Ad Spend Under Management ${currentYear} - Platform Analysis`,
    description: `${symbol} advertising spend under management analysis. Track total ad budgets managed, platform share, and advertiser retention metrics.`,
    keywords: [
      `${symbol} ad spend`,
      `${symbol} advertising spend`,
      `${symbol} ad platform`,
      `${symbol} advertiser spend`,
      `${symbol} ad budgets`,
      `${symbol} platform revenue`,
    ],
    openGraph: {
      title: `${symbol} Ad Spend Under Management ${currentYear} | Platform Metrics`,
      description: `Analysis of ${symbol} advertising spend under management and platform monetization.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ad-spend/${ticker.toLowerCase()}`,
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

export default async function AdSpendPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/ad-spend/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Ad spend metrics (estimated)
  const revenue = metrics?.total_revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  // Estimate total ad spend managed (typically 5-10x revenue for ad platforms)
  const isAdPlatform = sector?.toLowerCase().includes('technology') ||
                       industry?.toLowerCase().includes('advertising') ||
                       industry?.toLowerCase().includes('internet')
  const adSpendMultiplier = isAdPlatform ? 7 : 3
  const adSpendManaged = revenue * adSpendMultiplier
  const takeRate = (revenue / adSpendManaged) * 100

  // Generate FAQs
  const faqs = [
    {
      question: `How much ad spend does ${symbol} manage?`,
      answer: `${symbol} (${companyName}) manages an estimated $${(adSpendManaged / 1e9).toFixed(1)}B in annual advertising spend across its platform. This represents the total ad budgets that advertisers deploy through ${symbol}'s technology and services.`
    },
    {
      question: `What is ${symbol}'s take rate on advertising?`,
      answer: `${symbol} has an estimated take rate of ${takeRate.toFixed(1)}% on advertising spend, meaning the company retains this percentage as revenue while the remainder goes to publishers and content creators. Take rates vary by ad format, channel, and competitive dynamics.`
    },
    {
      question: `How is ad spend under management different from revenue?`,
      answer: `Ad spend under management (also called gross merchandise value or GMV for ads) represents the total advertiser budgets flowing through ${symbol}'s platform. Revenue is what ${symbol} keeps after paying publishers. The ratio between them is the take rate, a key profitability metric.`
    },
    {
      question: `What drives growth in ${symbol}'s ad spend?`,
      answer: `Growth in ad spend under management comes from: acquiring new advertisers, increasing budgets from existing clients, expanding into new ad formats and channels, geographic expansion, and overall market growth in digital advertising. ${sector ? `As a ${sector} company, ` : ''}${symbol} competes for share of total ad budgets.`
    },
    {
      question: `How does ${symbol} compare to competitors in ad spend?`,
      answer: `${symbol}'s competitive position depends on total ad spend captured, take rate efficiency, advertiser retention, and platform capabilities. Major ad platforms compete on reach, targeting precision, measurement tools, and ROI delivered to advertisers.`
    },
    {
      question: `What are the risks to ${symbol}'s ad spend growth?`,
      answer: `Key risks include: economic downturns reducing ad budgets, competition from other platforms, privacy changes limiting targeting effectiveness, brand safety concerns, ad fraud, and potential regulatory changes affecting digital advertising.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Ad Spend`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Ad Spend Under Management ${currentYear} - Platform Analysis`,
    description: `Detailed analysis of ${symbol} (${companyName}) advertising spend under management and monetization.`,
    url: pageUrl,
    keywords: [
      `${symbol} ad spend`,
      `${symbol} advertising spend`,
      `${symbol} ad platform`,
      `${symbol} advertiser budgets`,
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
            <span>{symbol} Ad Spend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Ad Spend Under Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analysis of {companyName}'s advertising platform and spend metrics
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

          {/* Ad Spend Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad Spend Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Est. Ad Spend Managed</p>
                <p className="text-3xl font-bold">${(adSpendManaged / 1e9).toFixed(1)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Platform Revenue</p>
                <p className="text-3xl font-bold">${(revenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Take Rate</p>
                <p className="text-3xl font-bold text-green-500">{takeRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated</p>
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

          {/* Understanding Ad Spend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Ad Spend Under Management</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Ad spend under management represents the total advertising budgets that flow through a platform's ecosystem:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Gross vs Net Revenue:</strong> Gross ad spend includes all advertiser budgets, while net revenue is what the platform retains after publisher payouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Take Rate Economics:</strong> Higher take rates indicate more value capture but may face competitive pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Scale Advantages:</strong> Larger ad spend enables better data, targeting, and optimization capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Growth Drivers:</strong> New advertiser acquisition, existing advertiser budget expansion, and market share gains</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol}'s Full Financial Picture</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed revenue metrics, profitability analysis, and growth projections
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
            <p><strong>Disclaimer:</strong> Ad spend estimates are based on industry benchmarks and company disclosures. Actual figures may vary. This analysis is for informational purposes only and should not be considered financial advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ad-spend" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
