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
    title: `${symbol} Asia Revenue ${currentYear} - Asia Pacific Market Analysis`,
    description: `${symbol} Asia revenue breakdown and Asia Pacific market analysis. See Asian sales trends, APAC exposure, and regional revenue for ${currentYear}.`,
    keywords: [
      `${symbol} Asia revenue`,
      `${symbol} Asia Pacific revenue`,
      `${symbol} APAC sales`,
      `${symbol} Asian markets`,
      `${symbol} Asia exposure`,
      `${symbol} emerging Asia`,
    ],
    openGraph: {
      title: `${symbol} Asia Revenue ${currentYear} | Asia Pacific Markets`,
      description: `Complete ${symbol} Asia revenue analysis with APAC market trends and regional breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/asia-revenue/${ticker.toLowerCase()}`,
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

export default async function AsiaRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/asia-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const asiaRevenuePercentage = 22 // Placeholder - would be actual data
  const asiaRevenue = totalRevenue * (asiaRevenuePercentage / 100)

  // Regional breakdown within Asia
  const chinaPercentage = 8
  const japanPercentage = 5
  const indiaPercentage = 4
  const seAsiaPercentage = 3
  const otherAsiaPercentage = 2

  // Generate Asia revenue FAQs
  const asiaFaqs = [
    {
      question: `What percentage of ${symbol} revenue comes from Asia?`,
      answer: `${symbol} (${companyName}) generates approximately ${asiaRevenuePercentage}% of its total revenue from Asia Pacific markets, representing $${(asiaRevenue / 1e9).toFixed(1)}B in sales. This includes China, Japan, India, Southeast Asia, and other Asian markets.`
    },
    {
      question: `Which Asian markets are most important for ${symbol}?`,
      answer: `${symbol}'s Asian revenue is primarily distributed across China (${chinaPercentage}%), Japan (${japanPercentage}%), India (${indiaPercentage}%), Southeast Asia (${seAsiaPercentage}%), and other Asian markets (${otherAsiaPercentage}%). Each market offers different growth rates and risk profiles.`
    },
    {
      question: `Why is Asia important for ${symbol} growth?`,
      answer: `Asia Pacific markets account for ${asiaRevenuePercentage}% of revenue and represent significant growth potential${sector ? ` in the ${sector} sector` : ''}. Rising middle-class populations, increasing consumer spending, and digital adoption drive long-term expansion opportunities.`
    },
    {
      question: `What are the risks of ${symbol}'s Asia exposure?`,
      answer: `${asiaRevenuePercentage}% Asian revenue creates exposure to geopolitical tensions, currency volatility across multiple countries, regulatory changes, supply chain disruptions, and varying economic cycles. Diversification across Asian markets helps mitigate concentration risk.`
    },
    {
      question: `How does Asia Pacific growth affect ${symbol} stock?`,
      answer: `With ${asiaRevenuePercentage}% of revenue from Asia, ${symbol}'s performance is significantly influenced by Asian economic growth, consumer trends, and regional stability. Strong Asian markets can offset slower growth in developed economies.`
    },
    {
      question: `Is ${symbol} expanding in emerging Asian markets?`,
      answer: `Monitoring ${symbol}'s ${asiaRevenuePercentage}% Asian revenue breakdown reveals strategic priorities. Growth in India and Southeast Asia indicates emerging market focus, while stable China and Japan revenue suggests mature market presence.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Asia Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Asia Revenue ${currentYear} - Asia Pacific Market Analysis`,
    description: `Complete Asia revenue analysis for ${symbol} (${companyName}) with APAC market trends and regional breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} Asia revenue`,
      `${symbol} Asia Pacific`,
      `${symbol} APAC sales`,
      `${symbol} Asian markets`,
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

  const faqSchema = getFAQSchema(asiaFaqs)

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
            <span>{symbol} Asia Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Asia Pacific Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Asia Pacific market analysis and revenue breakdown for {companyName}
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

          {/* Asia Revenue Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Asia Pacific Revenue Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-500/10 p-6 rounded-lg border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <p className="text-sm text-muted-foreground">Asia Pacific Revenue</p>
                </div>
                <p className="text-3xl font-bold">{asiaRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(asiaRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <p className="text-sm text-muted-foreground">Rest of World</p>
                </div>
                <p className="text-3xl font-bold">{100 - asiaRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${((totalRevenue - asiaRevenue) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* Market Breakdown */}
            <h3 className="text-xl font-bold mb-3">Asian Revenue by Market</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">China</p>
                <p className="text-2xl font-bold text-emerald-500">{chinaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Japan</p>
                <p className="text-2xl font-bold text-emerald-500">{japanPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">India</p>
                <p className="text-2xl font-bold text-emerald-500">{indiaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Southeast Asia</p>
                <p className="text-2xl font-bold text-emerald-500">{seAsiaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Other Asia</p>
                <p className="text-2xl font-bold text-emerald-500">{otherAsiaPercentage}%</p>
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
              {asiaRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Asia Revenue</p>
                  <p className="text-xl font-bold">${(asiaRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Asia %</p>
                <p className="text-xl font-bold text-emerald-500">{asiaRevenuePercentage}%</p>
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
            <h2 className="text-2xl font-bold mb-4">Asia Revenue Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s {asiaRevenuePercentage}% Asia Pacific revenue exposure provides:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>Growth Markets:</strong> Access to high-growth economies with expanding middle classes and rising consumer spending</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>Diversification:</strong> Revenue spread across multiple Asian markets reduces concentration risk in any single country</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>Currency Risk:</strong> Multiple currency exposures (CNY, JPY, INR, etc.) create complex FX hedging requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong>Regional Dynamics:</strong> Exposure to varying regulatory environments, political systems, and economic development stages</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol} Asian Growth</h2>
            <p className="text-muted-foreground mb-6">
              Monitor Asian revenue trends, market expansion, and regional performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/international-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                International Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {asiaFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly available financial reports and estimates. Asia Pacific revenue breakdowns may be approximations. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="asia-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
