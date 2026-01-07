import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Fertilizer Volume - Agricultural Input Sales Analysis`,
    description: `${symbol} fertilizer volume and sales analysis. View nitrogen, phosphate, and potash distribution volumes, market share, and revenue trends.`,
    keywords: [
      `${symbol} fertilizer`,
      `${symbol} fertilizer sales`,
      `${symbol} nitrogen`,
      `${symbol} phosphate`,
      `${symbol} potash`,
      `${symbol} agricultural chemicals`,
    ],
    openGraph: {
      title: `${symbol} Fertilizer Volume | Agricultural Input Sales Analysis`,
      description: `Comprehensive ${symbol} analysis of fertilizer sales volumes, market position, and agricultural input business.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fertilizer-volume/${ticker.toLowerCase()}`,
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

export default async function FertilizerVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fertilizer-volume/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has fertilizer business exposure
  const isFertilizerCompany = ['CF', 'MOS', 'NTR', 'CTVA', 'ICL'].includes(symbol) ||
                              industry?.toLowerCase().includes('fertilizer') ||
                              industry?.toLowerCase().includes('agricultural chemical')

  const exposureLevel = isFertilizerCompany ? 'High' : 'Low to None'

  const fertilizerFaqs = [
    {
      question: `Does ${symbol} sell fertilizer?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to the fertilizer business. ${isFertilizerCompany ? 'The company produces and distributes nitrogen, phosphate, and/or potash fertilizers to agricultural markets. Volume trends are driven by crop planting decisions, farm economics, and seasonal application timing.' : 'This company does not have significant fertilizer sales operations.'}`
    },
    {
      question: `What drives ${symbol} fertilizer volumes?`,
      answer: `${isFertilizerCompany ? `Key volume drivers for ${symbol} include: planted acreage (affected by crop prices), application rates, weather conditions, farmer working capital, competitive pricing, and seasonal demand patterns. Spring planting creates peak demand in Q2, with fall application in Q4.` : `Fertilizer volumes are not a material factor for ${symbol}'s business performance.`}`
    },
    {
      question: `How do fertilizer prices affect ${symbol} margins?`,
      answer: `${isFertilizerCompany ? `For ${symbol}, fertilizer margins are highly sensitive to global supply-demand dynamics, natural gas costs (for nitrogen), and commodity prices. Tight supply conditions or strong crop prices typically support higher margins, while oversupply compresses pricing power.` : `${symbol} does not operate a fertilizer business, so fertilizer pricing does not directly impact margins.`}`
    },
    {
      question: `Is ${symbol} affected by global fertilizer markets?`,
      answer: `${isFertilizerCompany ? `Yes, ${symbol} operates in a global commodity market. International prices, production capacity utilization, trade policies, and import/export dynamics all affect domestic fertilizer volumes and pricing. Energy costs and environmental regulations also play a role.` : `Global fertilizer markets do not materially impact ${symbol}'s business model.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Fertilizer Volume`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Fertilizer Volume - Agricultural Input Sales Analysis`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) fertilizer sales volumes, market position, and agricultural input business.`,
      url: pageUrl,
      keywords: [`${symbol} fertilizer`, `${symbol} nitrogen`, `${symbol} agricultural chemicals`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(fertilizerFaqs),
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
            <span>{symbol} Fertilizer Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Fertilizer Volume</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Agricultural input sales and distribution</p>

          {/* Fertilizer Business Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Fertilizer Exposure</p>
                <p className={`text-2xl font-bold ${isFertilizerCompany ? 'text-green-500' : 'text-gray-500'}`}>
                  {exposureLevel}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Fertilizer Product Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fertilizer Product Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Nitrogen (N)', desc: 'Anhydrous ammonia, urea, UAN', exposure: isFertilizerCompany ? 'High' : 'None' },
                { name: 'Phosphate (P)', desc: 'DAP, MAP, phosphoric acid', exposure: isFertilizerCompany ? 'Medium' : 'None' },
                { name: 'Potash (K)', desc: 'Potassium chloride, sulfate', exposure: isFertilizerCompany ? 'Medium' : 'None' },
              ].map((product, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="mb-3">
                    <p className="font-bold text-lg">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.desc}</p>
                  </div>
                  <p className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${
                    product.exposure === 'High' ? 'bg-green-500/20 text-green-500' :
                    product.exposure === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {product.exposure}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fertilizer Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isFertilizerCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Volume-Driven Commodity Business</h3>
                    <p className="text-muted-foreground">
                      Fertilizer is a commodity business where volume and utilization rates drive profitability. {symbol}'s performance depends on production capacity utilization, distribution efficiency, and market share in key agricultural regions.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Seasonal Demand Patterns</h3>
                    <p className="text-muted-foreground">
                      Fertilizer demand follows planting cycles, with spring application (March-May) creating Q2 volume peaks. Fall application (September-November) provides Q4 demand. Weather delays or early planting can shift seasonal patterns.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Margin Volatility</h3>
                    <p className="text-muted-foreground">
                      Margins fluctuate based on crop prices (demand driver), energy costs (especially natural gas for nitrogen), global production capacity, and inventory levels. Tight supply conditions can drive margin expansion.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Working Capital Requirements</h3>
                    <p className="text-muted-foreground">
                      Seasonal demand creates significant working capital needs. {symbol} must maintain inventory ahead of spring rush, creating cash flow fluctuations throughout the year.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Fertilizer Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant fertilizer production or distribution business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Indirect Agricultural Exposure</h3>
                    <p className="text-muted-foreground">
                      While not selling fertilizer directly, {symbol} may still have indirect exposure to agricultural markets through customer relationships, supply chain dependencies, or commodity price correlations.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Key Financial Metrics */}
          {metrics && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Financial Performance</h2>
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
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Agricultural Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and business segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fertilizerFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Fertilizer volume analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="fertilizer-volume" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
