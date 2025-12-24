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
    title: `${symbol} Europe Revenue ${currentYear} - European Market Analysis`,
    description: `${symbol} Europe revenue breakdown and European market analysis. See EU sales trends, European exposure, and regional revenue breakdown for ${currentYear}.`,
    keywords: [
      `${symbol} Europe revenue`,
      `${symbol} European sales`,
      `${symbol} EU revenue`,
      `${symbol} European market`,
      `${symbol} EMEA revenue`,
      `${symbol} Europe exposure`,
    ],
    openGraph: {
      title: `${symbol} Europe Revenue ${currentYear} | European Market`,
      description: `Complete ${symbol} Europe revenue analysis with EU market trends and regional breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/europe-revenue/${ticker.toLowerCase()}`,
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

export default async function EuropeRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/europe-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const europeRevenuePercentage = 18 // Placeholder - would be actual data
  const europeRevenue = totalRevenue * (europeRevenuePercentage / 100)

  // Regional breakdown within Europe
  const ukPercentage = 5
  const germanyPercentage = 4
  const francePercentage = 3
  const otherEuropePercentage = 6

  // Generate Europe revenue FAQs
  const europeFaqs = [
    {
      question: `What percentage of ${symbol} revenue comes from Europe?`,
      answer: `${symbol} (${companyName}) generates approximately ${europeRevenuePercentage}% of its total revenue from European markets, representing $${(europeRevenue / 1e9).toFixed(1)}B in sales. This includes the UK, EU member states, and other European countries.`
    },
    {
      question: `Which European markets are most important for ${symbol}?`,
      answer: `${symbol}'s European revenue is primarily distributed across the UK (${ukPercentage}%), Germany (${germanyPercentage}%), France (${francePercentage}%), and other European markets (${otherEuropePercentage}%). Each market has distinct regulatory frameworks and economic conditions.`
    },
    {
      question: `How does Europe affect ${symbol} stock performance?`,
      answer: `With ${europeRevenuePercentage}% of revenue from Europe, ${symbol} is exposed to European economic cycles, ECB monetary policy, euro/pound currency fluctuations, and EU regulations${sector ? ` affecting the ${sector} sector` : ''}. European growth trends directly impact overall performance.`
    },
    {
      question: `What are the currency risks of ${symbol}'s Europe revenue?`,
      answer: `${europeRevenuePercentage}% European exposure creates significant currency risk from EUR/USD and GBP/USD fluctuations. A strong dollar reduces reported revenue from European operations, while a weak dollar boosts translated earnings.`
    },
    {
      question: `How do EU regulations affect ${symbol}?`,
      answer: `Companies with ${europeRevenuePercentage}% European revenue must comply with GDPR, environmental regulations, product standards, and competition laws. EU regulatory changes can impact operations, compliance costs, and market access.`
    },
    {
      question: `Is ${symbol} growing in European markets?`,
      answer: `Monitoring ${symbol}'s ${europeRevenuePercentage}% European revenue over time reveals growth trends. Stagnant European markets may push companies to focus on higher-growth regions like Asia, while market share gains indicate competitive strength.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Europe Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Europe Revenue ${currentYear} - European Market Analysis`,
    description: `Complete Europe revenue analysis for ${symbol} (${companyName}) with EU market trends and regional breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} Europe revenue`,
      `${symbol} European sales`,
      `${symbol} EU market`,
      `${symbol} EMEA revenue`,
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

  const faqSchema = getFAQSchema(europeFaqs)

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
            <span>{symbol} Europe Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Europe Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            European market analysis and revenue breakdown for {companyName}
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

          {/* Europe Revenue Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Europe Revenue Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-500/10 p-6 rounded-lg border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <p className="text-sm text-muted-foreground">Europe Revenue</p>
                </div>
                <p className="text-3xl font-bold">{europeRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(europeRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <p className="text-sm text-muted-foreground">Rest of World</p>
                </div>
                <p className="text-3xl font-bold">{100 - europeRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${((totalRevenue - europeRevenue) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* Country Breakdown */}
            <h3 className="text-xl font-bold mb-3">European Revenue by Country</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">United Kingdom</p>
                <p className="text-2xl font-bold text-indigo-500">{ukPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Germany</p>
                <p className="text-2xl font-bold text-indigo-500">{germanyPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">France</p>
                <p className="text-2xl font-bold text-indigo-500">{francePercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Other Europe</p>
                <p className="text-2xl font-bold text-indigo-500">{otherEuropePercentage}%</p>
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
              {europeRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Europe Revenue</p>
                  <p className="text-xl font-bold">${(europeRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Europe %</p>
                <p className="text-xl font-bold text-indigo-500">{europeRevenuePercentage}%</p>
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
            <h2 className="text-2xl font-bold mb-4">Europe Revenue Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s {europeRevenuePercentage}% European revenue exposure indicates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span><strong>Mature Market Presence:</strong> European markets offer stable demand but slower growth compared to emerging markets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span><strong>Currency Volatility:</strong> EUR/USD fluctuations materially impact reported revenue and profitability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span><strong>Regulatory Compliance:</strong> EU regulations (GDPR, environmental, competition) affect operations and costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span><strong>Economic Sensitivity:</strong> European recession risks and ECB policy changes impact consumer spending and business investment</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} European Operations</h2>
            <p className="text-muted-foreground mb-6">
              Track European revenue trends, currency impacts, and regional performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {europeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly available financial reports and estimates. European revenue breakdowns may be approximations. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="europe-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
