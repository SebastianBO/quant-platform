import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Equipment Sales - Agricultural Machinery Revenue Analysis`,
    description: `${symbol} agricultural equipment sales analysis. View tractor, combine, and farm machinery revenue trends, market share, and dealer network strength.`,
    keywords: [
      `${symbol} equipment sales`,
      `${symbol} tractor sales`,
      `${symbol} farm machinery`,
      `${symbol} agricultural equipment`,
      `${symbol} combine sales`,
      `${symbol} dealer network`,
    ],
    openGraph: {
      title: `${symbol} Equipment Sales | Agricultural Machinery Revenue`,
      description: `Comprehensive ${symbol} analysis of agricultural equipment sales, market position, and machinery business trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/equipment-sales/${ticker.toLowerCase()}`,
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

export default async function EquipmentSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/equipment-sales/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has agricultural equipment business exposure
  const isEquipmentCompany = ['DE', 'CNH', 'AGCO', 'CAT'].includes(symbol) ||
                             industry?.toLowerCase().includes('farm machinery') ||
                             industry?.toLowerCase().includes('agricultural equipment')

  const exposureLevel = isEquipmentCompany ? 'High' : 'Low to None'

  const equipmentFaqs = [
    {
      question: `Does ${symbol} sell agricultural equipment?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to agricultural equipment sales. ${isEquipmentCompany ? 'The company manufactures and distributes tractors, combines, planters, and other farm machinery. Sales are cyclical and depend on farm profitability, crop prices, and equipment replacement cycles.' : 'This company does not have significant agricultural equipment operations.'}`
    },
    {
      question: `What drives ${symbol} equipment sales?`,
      answer: `${isEquipmentCompany ? `Key drivers for ${symbol} equipment sales include: farm income levels, crop prices (especially corn and soybeans), interest rates and financing availability, equipment age and replacement cycles, technological upgrades, and government farm support programs.` : `Agricultural equipment sales are not a material factor for ${symbol}'s business performance.`}`
    },
    {
      question: `How cyclical are ${symbol} equipment sales?`,
      answer: `${isEquipmentCompany ? `Agricultural equipment is highly cyclical. During periods of high crop prices and strong farm profitability, ${symbol} sees robust sales as farmers invest in new machinery. Conversely, when commodity prices fall or farm income declines, equipment purchases are often deferred, creating multi-year sales cycles.` : `${symbol} does not operate in the cyclical agricultural equipment market.`}`
    },
    {
      question: `What is ${symbol}'s competitive position in farm equipment?`,
      answer: `${isEquipmentCompany ? `${symbol} competes in the agricultural equipment market on product quality, dealer network strength, financing programs, parts availability, and technology integration. Market share battles focus on tractor and combine segments, with brand loyalty playing a significant role.` : `${symbol} does not compete in the agricultural equipment market.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Equipment Sales`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Equipment Sales - Agricultural Machinery Revenue Analysis`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) agricultural equipment sales, market share, and machinery business trends.`,
      url: pageUrl,
      keywords: [`${symbol} equipment sales`, `${symbol} farm machinery`, `${symbol} tractors`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(equipmentFaqs),
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
            <span>{symbol} Equipment Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Equipment Sales</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Agricultural machinery revenue and market analysis</p>

          {/* Equipment Business Overview Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Equipment Exposure</p>
                <p className={`text-2xl font-bold ${isEquipmentCompany ? 'text-green-500' : 'text-gray-500'}`}>
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

          {/* Equipment Product Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Agricultural Equipment Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Tractors', desc: 'Row crop, utility, compact tractors', exposure: isEquipmentCompany ? 'High' : 'None' },
                { name: 'Combines', desc: 'Harvesting equipment', exposure: isEquipmentCompany ? 'High' : 'None' },
                { name: 'Planters/Sprayers', desc: 'Precision planting, application', exposure: isEquipmentCompany ? 'Medium' : 'None' },
                { name: 'Parts & Service', desc: 'Aftermarket support, high-margin', exposure: isEquipmentCompany ? 'High' : 'None' },
              ].map((product, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.desc}</p>
                    </div>
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      product.exposure === 'High' ? 'bg-green-500/20 text-green-500' :
                      product.exposure === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {product.exposure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Equipment Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isEquipmentCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Highly Cyclical Revenue</h3>
                    <p className="text-muted-foreground">
                      Agricultural equipment sales follow farm income cycles. When crop prices are strong and farmers are profitable, {symbol} sees increased equipment demand. During downturns, farmers defer purchases, creating multi-year replacement cycles.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Dealer Network Strength</h3>
                    <p className="text-muted-foreground">
                      Strong dealer networks provide competitive advantages through parts availability, service quality, customer relationships, and financing programs. {symbol}'s dealer infrastructure is critical to maintaining market share.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Financing & Used Equipment</h3>
                    <p className="text-muted-foreground">
                      Equipment financing is a key profit center and sales enabler. Used equipment values also impact new sales—when used prices are strong, trade-ins facilitate new purchases. Weak used markets can suppress new equipment demand.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Technology Integration</h3>
                    <p className="text-muted-foreground">
                      Precision agriculture technology, autonomous features, and data analytics are becoming key differentiators. {symbol} invests in R&D to offer advanced technology that justifies premium pricing and drives replacement cycles.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Equipment Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant agricultural equipment manufacturing or distribution business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Indirect Agricultural Exposure</h3>
                    <p className="text-muted-foreground">
                      While not selling agricultural equipment, {symbol} may have indirect exposure to farming markets through customer base, supply chain relationships, or commodity price correlations.
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
          <section className="bg-gradient-to-r from-orange-600/20 to-blue-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Industrial Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and business segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {equipmentFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Equipment sales analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="equipment-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
