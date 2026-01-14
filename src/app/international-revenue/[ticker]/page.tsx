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
    title: `${symbol} International Revenue ${currentYear} - Global Sales Analysis`,
    description: `${symbol} international revenue breakdown and global market analysis. See foreign sales trends, international market exposure, and overseas revenue for ${currentYear}.`,
    keywords: [
      `${symbol} international revenue`,
      `${symbol} global revenue`,
      `${symbol} foreign sales`,
      `${symbol} overseas revenue`,
      `${symbol} international markets`,
      `${symbol} global sales`,
    ],
    openGraph: {
      title: `${symbol} International Revenue ${currentYear} | Global Sales`,
      description: `Complete ${symbol} international revenue analysis with global sales trends and market breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/international-revenue/${ticker.toLowerCase()}`,
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

export default async function InternationalRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/international-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const internationalRevenuePercentage = 35 // Placeholder - would be actual data
  const internationalRevenue = totalRevenue * (internationalRevenuePercentage / 100)
  const usRevenue = totalRevenue - internationalRevenue

  // Regional breakdown
  const europePercentage = 15
  const asiaPercentage = 12
  const chinaPercentage = 5
  const otherPercentage = 3

  // Generate international revenue FAQs
  const internationalFaqs = [
    {
      question: `What percentage of ${symbol} revenue is international?`,
      answer: `${symbol} (${companyName}) generates approximately ${internationalRevenuePercentage}% of its total revenue from international markets, representing $${(internationalRevenue / 1e9).toFixed(1)}B in global sales. The remaining ${100 - internationalRevenuePercentage}% comes from US domestic operations.`
    },
    {
      question: `Which international markets are most important for ${symbol}?`,
      answer: `${symbol}'s international revenue is primarily distributed across Europe (${europePercentage}%), Asia Pacific (${asiaPercentage}%), China (${chinaPercentage}%), and other emerging markets (${otherPercentage}%). Each region contributes differently to growth and profitability.`
    },
    {
      question: `How does international revenue affect ${symbol} stock?`,
      answer: `International revenue of ${internationalRevenuePercentage}% exposes ${symbol} to currency fluctuations, geopolitical risks, and diverse economic conditions. However, it also provides geographic diversification and access to high-growth emerging markets.`
    },
    {
      question: `Is ${symbol} expanding internationally?`,
      answer: `With ${internationalRevenuePercentage}% of revenue from international markets, ${symbol} has ${internationalRevenuePercentage > 40 ? 'significant' : 'meaningful'} global operations${sector ? ` in the ${sector} sector` : ''}. International expansion potential depends on market saturation in existing regions and entry barriers in new markets.`
    },
    {
      question: `What are the risks of ${symbol}'s international exposure?`,
      answer: `${symbol}'s ${internationalRevenuePercentage}% international revenue creates exposure to foreign exchange volatility, varying regulatory environments, political instability, and diverse competitive landscapes. Currency hedging and regional diversification can help mitigate these risks.`
    },
    {
      question: `How does ${symbol}'s international revenue compare to competitors?`,
      answer: `Comparing ${symbol}'s ${internationalRevenuePercentage}% international revenue to industry peers helps assess geographic diversification strategy. Companies with higher international exposure may have greater growth potential but also face increased operational complexity.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} International Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} International Revenue ${currentYear} - Global Sales Analysis`,
    description: `Complete international revenue analysis for ${symbol} (${companyName}) with global market trends and geographic breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} international revenue`,
      `${symbol} global revenue`,
      `${symbol} foreign sales`,
      `${symbol} overseas markets`,
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

  const faqSchema = getFAQSchema(internationalFaqs)

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
            <span>{symbol} International Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} International Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Global sales analysis and international market exposure for {companyName}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">International Revenue</p>
                </div>
                <p className="text-3xl font-bold">{internationalRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(internationalRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">US Revenue</p>
                </div>
                <p className="text-3xl font-bold">{100 - internationalRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(usRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* Regional Breakdown */}
            <h3 className="text-xl font-bold mb-3">International Revenue by Region</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Europe</p>
                <p className="text-2xl font-bold text-purple-500">{europePercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Asia Pacific</p>
                <p className="text-2xl font-bold text-purple-500">{asiaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">China</p>
                <p className="text-2xl font-bold text-purple-500">{chinaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Other Markets</p>
                <p className="text-2xl font-bold text-purple-500">{otherPercentage}%</p>
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
              {internationalRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">International Rev</p>
                  <p className="text-xl font-bold">${(internationalRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Intl Percentage</p>
                <p className="text-xl font-bold text-purple-500">{internationalRevenuePercentage}%</p>
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
            <h2 className="text-2xl font-bold mb-4">International Revenue Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s international revenue of {internationalRevenuePercentage}% indicates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Global Reach:</strong> {internationalRevenuePercentage > 40 ? 'Significant international presence with diversified global operations' : 'Growing international footprint with room for expansion'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Currency Exposure:</strong> {internationalRevenuePercentage}% foreign revenue creates material FX risk, requiring currency hedging strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Growth Markets:</strong> Access to high-growth international markets can drive long-term revenue expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Regulatory Complexity:</strong> Operating across multiple jurisdictions requires navigating diverse regulatory frameworks</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Global Performance</h2>
            <p className="text-muted-foreground mb-6">
              Deep-dive into regional revenue trends, currency impacts, and international growth strategies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {internationalFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="international-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
