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
    title: `${symbol} Grain Storage Revenue - Grain Elevator & Handling`,
    description: `${symbol} grain storage and handling analysis. View elevator capacity, storage revenue, grain merchandising, and agricultural logistics exposure.`,
    keywords: [
      `${symbol} grain storage`,
      `${symbol} grain elevators`,
      `${symbol} grain handling`,
      `${symbol} grain merchandising`,
      `${symbol} agricultural logistics`,
      `${symbol} grain marketing`,
    ],
    openGraph: {
      title: `${symbol} Grain Storage Revenue | Elevator & Handling Analysis`,
      description: `Comprehensive ${symbol} analysis of grain storage, elevator operations, and agricultural logistics business.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/grain-storage/${ticker.toLowerCase()}`,
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

export default async function GrainStoragePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/grain-storage/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has grain storage/handling business exposure
  const isGrainStorageCompany = ['ADM', 'BG', 'ANDERSONS', 'AGI'].includes(symbol) ||
                                industry?.toLowerCase().includes('agricultural') ||
                                industry?.toLowerCase().includes('grain')

  const exposureLevel = isGrainStorageCompany ? 'Medium to High' : 'Low to None'

  const grainStorageFaqs = [
    {
      question: `Does ${symbol} operate grain storage facilities?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to grain storage and handling. ${isGrainStorageCompany ? 'The company operates grain elevators and storage facilities, providing handling, drying, storage, and merchandising services to farmers. Revenue comes from storage fees, basis appreciation, and grain marketing margins.' : 'This company does not have significant grain storage operations.'}`
    },
    {
      question: `How does ${symbol} make money from grain storage?`,
      answer: `${isGrainStorageCompany ? `${symbol} generates revenue from grain storage through multiple streams: storage fees per bushel over time, grain handling and drying charges, basis appreciation when local prices strengthen, merchandising margins from buying farmer grain and selling to end users, and logistics services. Profitability depends on utilization rates and crop sizes.` : `${symbol} does not operate a material grain storage business.`}`
    },
    {
      question: `What drives ${symbol} grain storage volumes?`,
      answer: `${isGrainStorageCompany ? `Key volume drivers include: crop production levels in serviced regions, farmer selling patterns (affected by basis and cash flow needs), export demand, processing demand from food/fuel sectors, and competitive position versus other elevators. Large crops increase volumes but can compress margins.` : `Grain storage volumes are not applicable to ${symbol}'s business model.`}`
    },
    {
      question: `Is grain storage a good business for ${symbol}?`,
      answer: `${isGrainStorageCompany ? `Grain storage can be a stable, moderate-margin business for ${symbol}. It provides essential infrastructure, generates recurring revenue through storage fees, and creates opportunities for merchandising profits. However, it's capital-intensive and margins can be volatile based on crop sizes and basis movements.` : `${symbol} does not participate in the grain storage market.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Grain Storage`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Grain Storage Revenue - Grain Elevator & Handling`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) grain storage operations, elevator capacity, and merchandising business.`,
      url: pageUrl,
      keywords: [`${symbol} grain storage`, `${symbol} grain elevators`, `${symbol} grain handling`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(grainStorageFaqs),
    getTableSchema({
      name: `${symbol} Grain Storage History`,
      description: `Historical Grain Storage data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Grain Storage', 'Change'],
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
            <span>{symbol} Grain Storage</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Grain Storage</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Grain elevator, handling, and merchandising analysis</p>

          {/* Grain Storage Business Overview Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Storage Exposure</p>
                <p className={`text-2xl font-bold ${isGrainStorageCompany ? 'text-green-500' : 'text-gray-500'}`}>
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

          {/* Grain Storage Service Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Grain Storage Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Storage & Handling', desc: 'Bushel storage fees, drying services', exposure: isGrainStorageCompany ? 'High' : 'None' },
                { name: 'Grain Merchandising', desc: 'Buy from farmers, sell to processors/exporters', exposure: isGrainStorageCompany ? 'High' : 'None' },
                { name: 'Basis Trading', desc: 'Local price premium management', exposure: isGrainStorageCompany ? 'Medium' : 'None' },
                { name: 'Logistics Services', desc: 'Rail, truck, barge coordination', exposure: isGrainStorageCompany ? 'Medium' : 'None' },
              ].map((service, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.desc}</p>
                    </div>
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      service.exposure === 'High' ? 'bg-green-500/20 text-green-500' :
                      service.exposure === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {service.exposure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Grain Storage Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isGrainStorageCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Infrastructure Asset Business</h3>
                    <p className="text-muted-foreground">
                      Grain storage requires significant capital investment in elevators, bins, and drying equipment. For {symbol}, this creates barriers to entry and recurring revenue from storage fees, but also requires ongoing maintenance and capacity optimization.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Seasonal Cash Flow Patterns</h3>
                    <p className="text-muted-foreground">
                      Grain volumes peak at harvest (September-November for corn/soybeans), creating Q4 working capital needs and storage revenue. Farmer selling decisions throughout the year affect utilization rates and merchandising opportunities.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Basis & Merchandising Margins</h3>
                    <p className="text-muted-foreground">
                      Beyond storage fees, {symbol} profits from basis appreciation (when local prices strengthen vs. futures) and merchandising spreads. Tight local supply, strong export demand, or processing plant bottlenecks can widen margins.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Crop Size Impact</h3>
                    <p className="text-muted-foreground">
                      Large crops increase volumes and storage fees but can compress basis and merchandising margins due to oversupply. Small crops reduce volumes but may strengthen basis. {symbol} must balance volume vs. margin dynamics.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Grain Storage Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant grain storage or handling business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Potential Indirect Exposure</h3>
                    <p className="text-muted-foreground">
                      While not operating grain elevators directly, {symbol} may have indirect exposure to agricultural markets through customer relationships, supply chains, or commodity price correlations.
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
          <section className="bg-gradient-to-r from-yellow-600/20 to-blue-600/20 p-8 rounded-xl border border-yellow-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Agricultural Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and business segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {grainStorageFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Grain storage analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="grain-storage" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
