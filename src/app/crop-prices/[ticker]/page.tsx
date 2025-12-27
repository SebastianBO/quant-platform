import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Crop Price Exposure - Agricultural Revenue Analysis`,
    description: `${symbol} crop price exposure analysis. View revenue sensitivity to corn, wheat, soybean prices and agricultural commodity market correlations.`,
    keywords: [
      `${symbol} crop prices`,
      `${symbol} agricultural exposure`,
      `${symbol} commodity prices`,
      `${symbol} farming revenue`,
      `${symbol} crop sensitivity`,
      `${symbol} agricultural business`,
    ],
    openGraph: {
      title: `${symbol} Crop Price Exposure | Agricultural Revenue Analysis`,
      description: `Comprehensive ${symbol} analysis of revenue exposure to agricultural commodity prices and farming markets.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/crop-prices/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function CropPricesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/crop-prices/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has agricultural exposure
  const isAgBusiness = sector?.toLowerCase().includes('consumer') ||
                       industry?.toLowerCase().includes('food') ||
                       industry?.toLowerCase().includes('agricultural') ||
                       ['DE', 'ADM', 'BG', 'TSN', 'CAG', 'GIS', 'K', 'CPB'].includes(symbol)

  const exposureLevel = isAgBusiness ? 'High' : 'Low to Moderate'

  const cropFaqs = [
    {
      question: `How exposed is ${symbol} to crop prices?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to agricultural commodity prices. ${isAgBusiness ? 'As a company in the agricultural or food sector, revenue and margins can be significantly impacted by fluctuations in corn, wheat, soybean, and other crop prices.' : 'While not primarily an agricultural business, the company may have indirect exposure through input costs or consumer demand patterns.'}`
    },
    {
      question: `Which crops affect ${symbol} revenue the most?`,
      answer: `${isAgBusiness ? `For ${symbol}, key crop price drivers typically include corn (feed and ingredients), soybeans (protein and oil), wheat (flour and grains), and other agricultural commodities. The specific impact depends on the company's business model and product mix.` : `${symbol}'s exposure to crop prices is primarily indirect, potentially affecting raw material costs or consumer purchasing power in agricultural markets.`}`
    },
    {
      question: `How do rising crop prices affect ${symbol} stock?`,
      answer: `${isAgBusiness ? `For agricultural businesses like ${symbol}, rising crop prices can have mixed effects: higher input costs may pressure margins, but if the company is a producer or trader, higher prices could boost revenue. The net impact depends on the company's position in the value chain.` : `${symbol} may experience limited direct impact from crop price movements, though indirect effects through cost structures or end-market demand could occur.`}`
    },
    {
      question: `Should I monitor crop prices when investing in ${symbol}?`,
      answer: `${isAgBusiness ? `Yes, agricultural commodity prices are a key factor for ${symbol}. Monitoring corn, wheat, and soybean futures can provide insights into potential revenue and margin trends. Consider following USDA reports and seasonal planting/harvest cycles.` : `While crop prices are less critical for ${symbol}, understanding broader agricultural trends can still provide context for overall market conditions affecting the company.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Crop Prices`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Crop Price Exposure - Agricultural Revenue Analysis`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) revenue exposure to agricultural commodity and crop prices.`,
      url: pageUrl,
      keywords: [`${symbol} crop prices`, `${symbol} agricultural exposure`, `${symbol} commodity sensitivity`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(cropFaqs),
    getTableSchema({
      name: `${symbol} Crop Prices History`,
      description: `Historical Crop Prices data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Crop Prices', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Crop Prices</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Crop Price Exposure</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Agricultural commodity revenue sensitivity</p>

          {/* Exposure Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-yellow-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Sector</p>
                <p className="text-2xl font-bold">{sector || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Crop Exposure</p>
                <p className={`text-2xl font-bold ${isAgBusiness ? 'text-green-500' : 'text-yellow-500'}`}>
                  {exposureLevel}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Key Crop Commodities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Agricultural Commodities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Corn', impact: isAgBusiness ? 'High' : 'Low', color: 'yellow' },
                { name: 'Soybeans', impact: isAgBusiness ? 'High' : 'Low', color: 'green' },
                { name: 'Wheat', impact: isAgBusiness ? 'Medium' : 'Low', color: 'orange' },
                { name: 'Other Grains', impact: isAgBusiness ? 'Medium' : 'Low', color: 'blue' },
              ].map((crop, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{crop.name}</p>
                      <p className="text-sm text-muted-foreground">Revenue Impact</p>
                    </div>
                    <p className={`text-xl font-bold ${
                      crop.impact === 'High' ? 'text-red-500' :
                      crop.impact === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {crop.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How Crop Prices Affect {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isAgBusiness ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Direct Revenue Impact</h3>
                    <p className="text-muted-foreground">
                      As an agricultural or food-related company, {symbol} revenue is directly tied to commodity prices. Higher crop prices can increase costs for processors or boost revenue for producers and traders.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Margin Pressure</h3>
                    <p className="text-muted-foreground">
                      Fluctuating crop prices create margin volatility. Companies with strong pricing power can pass costs to consumers, while those in competitive markets may face compressed margins during price spikes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Hedging Strategies</h3>
                    <p className="text-muted-foreground">
                      Many agricultural companies use futures contracts and derivatives to hedge commodity price risk, reducing earnings volatility from crop price fluctuations.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Indirect Exposure</h3>
                    <p className="text-muted-foreground">
                      While {symbol} is not primarily an agricultural business, the company may have indirect exposure through supply chain costs, consumer demand patterns, or market correlation.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Market Context</h3>
                    <p className="text-muted-foreground">
                      Understanding agricultural commodity trends can provide broader economic context for {symbol}'s business environment, particularly regarding inflation and consumer spending.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Key Metrics */}
          {metrics && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Financial Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.revenue_growth !== undefined && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(metrics.revenue_growth * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {metrics.profit_margin !== undefined && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-xl font-bold">{(metrics.profit_margin * 100).toFixed(1)}%</p>
                  </div>
                )}
                {snapshot.market_cap && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-xl font-bold">${(snapshot.market_cap / 1e9).toFixed(1)}B</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Agricultural Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and commodity exposure for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cropFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Crop price exposure analysis is based on publicly available information and industry classifications. Actual commodity price sensitivity may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="crop-prices" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
