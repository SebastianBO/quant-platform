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
    title: `${symbol} Livestock Exposure - Animal Agriculture Revenue Analysis`,
    description: `${symbol} livestock business analysis. View exposure to cattle, hog, poultry markets, animal protein revenue, and meat processing operations.`,
    keywords: [
      `${symbol} livestock`,
      `${symbol} cattle`,
      `${symbol} hogs`,
      `${symbol} poultry`,
      `${symbol} meat processing`,
      `${symbol} animal agriculture`,
    ],
    openGraph: {
      title: `${symbol} Livestock Exposure | Animal Agriculture Revenue`,
      description: `Comprehensive ${symbol} analysis of livestock business, animal agriculture exposure, and meat processing revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/livestock-exposure/${ticker.toLowerCase()}`,
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

export default async function LivestockExposurePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/livestock-exposure/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has livestock/meat business exposure
  const isLivestockCompany = ['TSN', 'HRL', 'PPC', 'CAG', 'SFM'].includes(symbol) ||
                            industry?.toLowerCase().includes('meat') ||
                            industry?.toLowerCase().includes('poultry') ||
                            industry?.toLowerCase().includes('food')

  const exposureLevel = isLivestockCompany ? 'Medium to High' : 'Low to None'

  const livestockFaqs = [
    {
      question: `Does ${symbol} have livestock business exposure?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to livestock and animal agriculture. ${isLivestockCompany ? 'The company processes and markets beef, pork, poultry, or other animal proteins. Revenue and margins are affected by livestock prices, feed costs, consumer demand, and processing capacity utilization.' : 'This company does not have significant livestock or meat processing operations.'}`
    },
    {
      question: `Which livestock segments affect ${symbol} the most?`,
      answer: `${isLivestockCompany ? `${symbol}'s livestock exposure typically spans multiple protein categories: chicken (broilers), beef cattle, hogs (pork), turkey, and potentially other species. The specific mix varies by company, with some specializing in one protein while others operate across multiple segments.` : `Livestock market dynamics do not materially affect ${symbol}'s business.`}`
    },
    {
      question: `How do livestock prices affect ${symbol} margins?`,
      answer: `${isLivestockCompany ? `For ${symbol}, margins depend on the spread between livestock costs and meat prices. When live cattle/hog prices rise faster than consumer meat prices, margins compress. Conversely, when retailers can't fully pass through costs, processors get squeezed. Feed costs (corn, soybean meal) also impact integrated producers.` : `${symbol} does not operate in livestock markets, so livestock prices don't directly impact margins.`}`
    },
    {
      question: `Is ${symbol} affected by consumer protein demand trends?`,
      answer: `${isLivestockCompany ? `Yes, ${symbol} is influenced by consumer protein preferences and demand cycles. Shifts toward chicken over beef, foodservice vs. retail mix changes, export demand strength, and protein prices relative to substitutes all affect volumes and pricing power.` : `Consumer protein demand is not a significant factor for ${symbol}'s business model.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Livestock`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Livestock Exposure - Animal Agriculture Revenue Analysis`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) livestock business exposure and animal agriculture revenue streams.`,
      url: pageUrl,
      keywords: [`${symbol} livestock`, `${symbol} meat processing`, `${symbol} animal agriculture`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(livestockFaqs),
    getTableSchema({
      name: `${symbol} Livestock Exposure History`,
      description: `Historical Livestock Exposure data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Livestock Exposure', 'Change'],
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
            <span>{symbol} Livestock</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Livestock Exposure</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Animal agriculture and meat processing analysis</p>

          {/* Livestock Business Overview Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Livestock Exposure</p>
                <p className={`text-2xl font-bold ${isLivestockCompany ? 'text-green-500' : 'text-gray-500'}`}>
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

          {/* Livestock Protein Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Animal Protein Segments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Chicken (Broilers)', desc: 'Integrated poultry production', exposure: isLivestockCompany ? 'High' : 'None' },
                { name: 'Beef Cattle', desc: 'Processing and packing', exposure: isLivestockCompany ? 'Medium' : 'None' },
                { name: 'Hogs (Pork)', desc: 'Pork processing and products', exposure: isLivestockCompany ? 'Medium' : 'None' },
                { name: 'Value-Added Products', desc: 'Branded meats, prepared foods', exposure: isLivestockCompany ? 'High' : 'None' },
              ].map((segment, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{segment.name}</p>
                      <p className="text-sm text-muted-foreground">{segment.desc}</p>
                    </div>
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      segment.exposure === 'High' ? 'bg-green-500/20 text-green-500' :
                      segment.exposure === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {segment.exposure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Livestock Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isLivestockCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Margin-Driven Commodity Business</h3>
                    <p className="text-muted-foreground">
                      Livestock processing operates on thin margins, typically 3-8% depending on the protein segment. For {symbol}, profitability depends on the spread between livestock input costs and wholesale/retail meat prices, as well as operational efficiency and capacity utilization.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Feed Cost Sensitivity</h3>
                    <p className="text-muted-foreground">
                      For integrated producers like poultry companies, feed costs (corn and soybean meal) represent 60-70% of live production costs. Rising grain prices squeeze margins unless meat prices increase proportionally. Beef and pork processors buy animals from farmers and are less directly exposed to feed costs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Demand Cycles & Channel Mix</h3>
                    <p className="text-muted-foreground">
                      {symbol}'s performance varies with foodservice vs. retail mix, export demand strength, and consumer protein preferences. Chicken tends to be recession-resistant as consumers trade down from beef. Export markets (especially for beef and pork) add volume but can be volatile due to trade policies.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Value-Added & Brand Strategy</h3>
                    <p className="text-muted-foreground">
                      To escape commodity margin pressure, companies like {symbol} invest in branded products, prepared foods, and value-added items that command higher prices and more stable margins than commodity meat.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Livestock Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant livestock or meat processing business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Potential Indirect Exposure</h3>
                    <p className="text-muted-foreground">
                      While not in the livestock business, {symbol} may have indirect exposure to animal agriculture through supplier relationships, customer base, or commodity price correlations.
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
          <section className="bg-gradient-to-r from-red-600/20 to-blue-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Food & Agriculture Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and business segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {livestockFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Livestock exposure analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="livestock-exposure" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
