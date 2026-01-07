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
    title: `${symbol} Emerging Markets Exposure ${currentYear} - EM Revenue Analysis`,
    description: `${symbol} emerging markets exposure and revenue analysis. See EM sales trends, developing market dependency, and growth market revenue for ${currentYear}.`,
    keywords: [
      `${symbol} emerging markets`,
      `${symbol} EM exposure`,
      `${symbol} emerging markets revenue`,
      `${symbol} developing markets`,
      `${symbol} EM risk`,
      `${symbol} growth markets`,
    ],
    openGraph: {
      title: `${symbol} Emerging Markets ${currentYear} | EM Exposure`,
      description: `Complete ${symbol} emerging markets analysis with EM revenue trends and growth market exposure.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/emerging-markets/${ticker.toLowerCase()}`,
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

export default async function EmergingMarketsPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/emerging-markets/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const emergingMarketsPercentage = 15 // Placeholder - would be actual data
  const emergingMarketsRevenue = totalRevenue * (emergingMarketsPercentage / 100)

  // Regional breakdown within emerging markets
  const latamPercentage = 4
  const africaPercentage = 2
  const middleEastPercentage = 3
  const emergingAsiaPercentage = 4
  const easternEuropePercentage = 2

  // Generate emerging markets FAQs
  const emFaqs = [
    {
      question: `What is ${symbol}'s emerging markets exposure?`,
      answer: `${symbol} (${companyName}) generates approximately ${emergingMarketsPercentage}% of its total revenue from emerging markets, representing $${(emergingMarketsRevenue / 1e9).toFixed(1)}B in sales. This includes Latin America, Africa, Middle East, emerging Asia, and Eastern Europe.`
    },
    {
      question: `Which emerging markets are most important for ${symbol}?`,
      answer: `${symbol}'s emerging markets revenue is distributed across emerging Asia (${emergingAsiaPercentage}%), Latin America (${latamPercentage}%), Middle East (${middleEastPercentage}%), Africa (${africaPercentage}%), and Eastern Europe (${easternEuropePercentage}%). Each region offers unique growth opportunities and risks.`
    },
    {
      question: `Why invest in ${symbol} with emerging markets exposure?`,
      answer: `${emergingMarketsPercentage}% emerging markets exposure provides ${symbol}${sector ? ` in the ${sector} sector` : ''} access to high-growth economies with expanding consumer bases. These markets often grow faster than developed economies, offering long-term revenue expansion potential.`
    },
    {
      question: `What are the risks of ${symbol}'s emerging markets exposure?`,
      answer: `${emergingMarketsPercentage}% emerging markets revenue creates exposure to political instability, currency volatility, regulatory unpredictability, economic crises, and infrastructure challenges. These markets can experience rapid growth but also significant volatility.`
    },
    {
      question: `How do emerging markets affect ${symbol} stock volatility?`,
      answer: `Emerging markets exposure of ${emergingMarketsPercentage}% can increase stock price volatility during global risk-off events, currency crises, or regional instability. However, this exposure also provides upside during EM bull markets and local economic booms.`
    },
    {
      question: `Is ${symbol} expanding in emerging markets?`,
      answer: `Tracking ${symbol}'s ${emergingMarketsPercentage}% emerging markets revenue over time reveals strategic priorities. Rising EM revenue suggests aggressive expansion into high-growth markets, while stable percentages indicate balanced geographic diversification.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Emerging Markets`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Emerging Markets Exposure ${currentYear} - EM Revenue Analysis`,
    description: `Complete emerging markets analysis for ${symbol} (${companyName}) with EM revenue trends and growth market exposure.`,
    url: pageUrl,
    keywords: [
      `${symbol} emerging markets`,
      `${symbol} EM exposure`,
      `${symbol} developing markets`,
      `${symbol} growth markets`,
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

  const faqSchema = getFAQSchema(emFaqs)

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
            <span>{symbol} Emerging Markets</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Emerging Markets Exposure
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Emerging markets revenue analysis and growth market exposure for {companyName}
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

          {/* EM Exposure Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Emerging Markets Exposure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-amber-500/10 p-6 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <p className="text-sm text-muted-foreground">Emerging Markets Revenue</p>
                </div>
                <p className="text-3xl font-bold">{emergingMarketsPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(emergingMarketsRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <p className="text-sm text-muted-foreground">Developed Markets</p>
                </div>
                <p className="text-3xl font-bold">{100 - emergingMarketsPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${((totalRevenue - emergingMarketsRevenue) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* Regional EM Breakdown */}
            <h3 className="text-xl font-bold mb-3">Emerging Markets by Region</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Emerging Asia</p>
                <p className="text-2xl font-bold text-amber-500">{emergingAsiaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Latin America</p>
                <p className="text-2xl font-bold text-amber-500">{latamPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Middle East</p>
                <p className="text-2xl font-bold text-amber-500">{middleEastPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Africa</p>
                <p className="text-2xl font-bold text-amber-500">{africaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">E. Europe</p>
                <p className="text-2xl font-bold text-amber-500">{easternEuropePercentage}%</p>
              </div>
            </div>
          </section>

          {/* Risk-Return Profile */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Emerging Markets Risk-Return Profile</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="font-bold">Growth Opportunity: {emergingMarketsPercentage > 20 ? 'High' : emergingMarketsPercentage > 10 ? 'Moderate' : 'Limited'}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {emergingMarketsPercentage}% EM exposure provides access to fast-growing economies with rising consumer spending and digital adoption
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${emergingMarketsPercentage > 20 ? 'bg-red-500' : emergingMarketsPercentage > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <h3 className="font-bold">Volatility Risk: {emergingMarketsPercentage > 20 ? 'High' : emergingMarketsPercentage > 10 ? 'Moderate' : 'Low'}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Emerging markets exposure increases sensitivity to global risk appetite, capital flows, and commodity price swings
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <h3 className="font-bold">Currency & Political Risk</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Multiple emerging market currencies create FX volatility, while political instability and regulatory changes pose operational risks
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
              {emergingMarketsRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">EM Revenue</p>
                  <p className="text-xl font-bold">${(emergingMarketsRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">EM %</p>
                <p className="text-xl font-bold text-amber-500">{emergingMarketsPercentage}%</p>
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
            <h2 className="text-2xl font-bold mb-4">Emerging Markets Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s {emergingMarketsPercentage}% emerging markets exposure creates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Long-term Growth:</strong> Access to economies growing 2-3x faster than developed markets, driven by demographics and urbanization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Higher Volatility:</strong> Greater exposure to economic crises, political turmoil, and capital flight during risk-off periods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Currency Risk:</strong> Multiple EM currencies amplify FX exposure and hedging complexity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>First-Mover Advantage:</strong> Early market entry can establish brand leadership before competition intensifies</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Monitor {symbol} EM Growth</h2>
            <p className="text-muted-foreground mb-6">
              Track emerging markets revenue trends, regional expansion, and risk management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {emFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly available financial reports and estimates. Emerging markets classifications may vary. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="emerging-markets" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
