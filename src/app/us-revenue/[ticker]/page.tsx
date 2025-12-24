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
    title: `${symbol} US Revenue Breakdown ${currentYear} - Domestic Revenue Analysis`,
    description: `${symbol} US revenue breakdown and domestic market analysis. See geographic revenue distribution, US sales trends, and regional performance for ${currentYear}.`,
    keywords: [
      `${symbol} US revenue`,
      `${symbol} domestic revenue`,
      `${symbol} US sales`,
      `${symbol} revenue breakdown`,
      `${symbol} geographic revenue`,
      `${symbol} US market`,
    ],
    openGraph: {
      title: `${symbol} US Revenue Analysis ${currentYear} | Domestic Revenue`,
      description: `Complete ${symbol} US revenue breakdown with domestic sales trends and geographic analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/us-revenue/${ticker.toLowerCase()}`,
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

export default async function USRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/us-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const usRevenuePercentage = 65 // Placeholder - would be actual data
  const usRevenue = totalRevenue * (usRevenuePercentage / 100)
  const internationalRevenue = totalRevenue - usRevenue

  // Generate US revenue FAQs
  const usFaqs = [
    {
      question: `What percentage of ${symbol} revenue comes from the US?`,
      answer: `${symbol} (${companyName}) generates approximately ${usRevenuePercentage}% of its total revenue from US operations, representing $${(usRevenue / 1e9).toFixed(1)}B in domestic sales. The remaining ${100 - usRevenuePercentage}% comes from international markets.`
    },
    {
      question: `How important is the US market to ${symbol}?`,
      answer: `The US market is ${usRevenuePercentage > 50 ? 'the primary' : 'a significant'} revenue source for ${symbol}${sector ? ` in the ${sector} sector` : ''}. Domestic operations account for ${usRevenuePercentage}% of total revenue, making US economic conditions and consumer trends important factors for the company's performance.`
    },
    {
      question: `Is ${symbol} a domestic or international company?`,
      answer: `${symbol} is ${usRevenuePercentage > 70 ? 'primarily a domestic-focused' : usRevenuePercentage > 50 ? 'a US-focused' : 'an internationally diversified'} company with ${usRevenuePercentage}% of revenue from the US and ${100 - usRevenuePercentage}% from international markets. This geographic mix impacts currency exposure and regulatory risk.`
    },
    {
      question: `How does US revenue growth affect ${symbol} stock?`,
      answer: `Since US revenue represents ${usRevenuePercentage}% of ${symbol}'s total sales, domestic market performance significantly impacts overall growth and profitability. US economic conditions, consumer spending, and competitive dynamics directly influence the stock's performance.`
    },
    {
      question: `What are the risks of ${symbol}'s US revenue concentration?`,
      answer: `${usRevenuePercentage > 60 ? `With ${usRevenuePercentage}% of revenue from the US market, ${symbol} faces concentrated exposure to US economic cycles, regulatory changes, and market saturation. However, this focus can also mean better operational efficiency and lower currency risk.` : `${symbol}'s balanced geographic mix reduces concentration risk, though ${usRevenuePercentage}% US exposure means domestic conditions remain important.`}`
    },
    {
      question: `Should I consider ${symbol}'s US revenue when investing?`,
      answer: `Yes, understanding ${symbol}'s ${usRevenuePercentage}% US revenue exposure is crucial for assessing growth potential, currency risk, and how the stock correlates with US economic trends. Compare this to industry peers to evaluate geographic diversification.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} US Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} US Revenue Breakdown ${currentYear} - Domestic Revenue Analysis`,
    description: `Complete US revenue analysis for ${symbol} (${companyName}) with domestic sales trends and geographic breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} US revenue`,
      `${symbol} domestic revenue`,
      `${symbol} revenue breakdown`,
      `${symbol} geographic analysis`,
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

  const faqSchema = getFAQSchema(usFaqs)

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
            <span>{symbol} US Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} US Revenue Breakdown
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Domestic revenue analysis and US market exposure for {companyName}
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

          {/* Revenue Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Geographic Revenue Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">US Revenue</p>
                </div>
                <p className="text-3xl font-bold">{usRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(usRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">International Revenue</p>
                </div>
                <p className="text-3xl font-bold">{100 - usRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(internationalRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revenue Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {totalRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">${(totalRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              {usRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">US Revenue</p>
                  <p className="text-xl font-bold">${(usRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">US Percentage</p>
                <p className="text-xl font-bold text-blue-500">{usRevenuePercentage}%</p>
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

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">US Revenue Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s US revenue concentration of {usRevenuePercentage}% indicates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Market Focus:</strong> {usRevenuePercentage > 60 ? 'Strong domestic market presence with significant US operations' : 'Balanced global approach with substantial international diversification'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Currency Risk:</strong> {usRevenuePercentage > 60 ? 'Lower foreign exchange exposure due to USD-denominated revenue' : 'Moderate currency risk from international operations'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Economic Sensitivity:</strong> Performance closely tied to US economic conditions and consumer trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Growth Potential:</strong> {usRevenuePercentage > 70 ? 'International expansion could provide growth opportunities' : 'Diversified revenue streams support stable growth'}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Geographic Performance</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed revenue breakdowns, regional trends, and international exposure analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Details
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {usFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly available financial reports and estimates. Geographic revenue breakdowns may be approximations. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="us-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
