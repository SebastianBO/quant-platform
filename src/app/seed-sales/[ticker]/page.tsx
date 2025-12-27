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
    title: `${symbol} Seed Sales Revenue - Agricultural Input Analysis`,
    description: `${symbol} seed sales analysis. View revenue from corn, soybean, and specialty seeds, market share, and agricultural biotechnology exposure.`,
    keywords: [
      `${symbol} seed sales`,
      `${symbol} agricultural seeds`,
      `${symbol} seed revenue`,
      `${symbol} biotech seeds`,
      `${symbol} seed market share`,
      `${symbol} crop seeds`,
    ],
    openGraph: {
      title: `${symbol} Seed Sales Revenue | Agricultural Input Analysis`,
      description: `Comprehensive ${symbol} analysis of seed sales revenue, market position, and agricultural biotechnology business.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/seed-sales/${ticker.toLowerCase()}`,
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

export default async function SeedSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/seed-sales/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has seed business exposure
  const isSeedCompany = ['CTVA', 'BASFY', 'SMG', 'DE'].includes(symbol) ||
                        industry?.toLowerCase().includes('agricultural') ||
                        industry?.toLowerCase().includes('chemical')

  const exposureLevel = isSeedCompany ? 'High' : 'Low to None'

  const seedFaqs = [
    {
      question: `Does ${symbol} sell seeds?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to the seed business. ${isSeedCompany ? 'The company operates in the agricultural inputs market, selling corn, soybean, and other crop seeds to farmers. This business segment is typically high-margin and benefits from proprietary biotechnology traits.' : 'This company does not have significant seed sales operations.'}`
    },
    {
      question: `How important are seed sales to ${symbol} revenue?`,
      answer: `${isSeedCompany ? `For agricultural companies like ${symbol}, seed sales can represent a significant portion of total revenue, often 20-40% depending on the business mix. Seeds are typically sold seasonally before planting seasons, creating revenue concentration in Q1-Q2.` : `${symbol} does not have material seed sales revenue as part of its business model.`}`
    },
    {
      question: `What drives ${symbol} seed sales growth?`,
      answer: `${isSeedCompany ? `Key drivers for ${symbol} seed sales include: planted acreage (affected by crop prices and farm economics), market share gains, pricing power from proprietary traits, new product launches, and farmer adoption of biotech seeds. Weather and planting conditions also play a role.` : `Seed sales are not a material driver of ${symbol}'s business performance.`}`
    },
    {
      question: `How do seed sales margins compare to other businesses?`,
      answer: `${isSeedCompany ? `Seed businesses typically have higher margins than commodity chemicals or fertilizers due to intellectual property protection from patented biotech traits. Companies like ${symbol} can command premium pricing for seeds with superior genetics and herbicide tolerance.` : `${symbol} does not operate a seed business, so this comparison is not applicable.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Seed Sales`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Seed Sales Revenue - Agricultural Input Analysis`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) seed sales business, market position, and agricultural biotech exposure.`,
      url: pageUrl,
      keywords: [`${symbol} seed sales`, `${symbol} agricultural seeds`, `${symbol} biotech`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(seedFaqs),
    getTableSchema({
      name: `${symbol} Seed Sales History`,
      description: `Historical Seed Sales data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Seed Sales', 'Change'],
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
            <span>{symbol} Seed Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Seed Sales Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Agricultural input and seed business analysis</p>

          {/* Seed Business Overview Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-green-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Seed Exposure</p>
                <p className={`text-2xl font-bold ${isSeedCompany ? 'text-green-500' : 'text-gray-500'}`}>
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

          {/* Seed Product Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Seed Product Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Corn Seeds', desc: 'Hybrid and biotech corn varieties', exposure: isSeedCompany ? 'High' : 'None' },
                { name: 'Soybean Seeds', desc: 'Herbicide-tolerant soybeans', exposure: isSeedCompany ? 'High' : 'None' },
                { name: 'Specialty Seeds', desc: 'Vegetables, cotton, canola', exposure: isSeedCompany ? 'Medium' : 'None' },
                { name: 'Biotech Traits', desc: 'Proprietary genetic traits', exposure: isSeedCompany ? 'High' : 'None' },
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
            <h2 className="text-2xl font-bold mb-4">Seed Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isSeedCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">High-Margin Business</h3>
                    <p className="text-muted-foreground">
                      Seed sales typically generate higher margins than commodity agricultural products due to intellectual property protection from patented biotech traits and genetic improvements. {symbol} can command premium pricing for superior seed genetics.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Seasonal Revenue Pattern</h3>
                    <p className="text-muted-foreground">
                      Seed sales are highly seasonal, with most revenue concentrated in Q1-Q2 before spring planting. This creates working capital requirements and earnings volatility throughout the year.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Market Share Competition</h3>
                    <p className="text-muted-foreground">
                      The seed industry is competitive with major players competing for farmer loyalty through product performance, dealer relationships, and bundled offerings. Innovation in biotech traits drives market share gains.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Crop Price Correlation</h3>
                    <p className="text-muted-foreground">
                      Seed demand correlates with crop prices and farm profitability. When corn and soybean prices are high, farmers plant more acres and invest in premium seed technologies, boosting {symbol}'s sales.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Seed Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant seed sales business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Indirect Agricultural Exposure</h3>
                    <p className="text-muted-foreground">
                      While not selling seeds directly, {symbol} may still have indirect exposure to agricultural markets through supply chain relationships, customer base, or commodity price correlations.
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
          <section className="bg-gradient-to-r from-amber-600/20 to-blue-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Agricultural Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and business segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {seedFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Seed sales analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="seed-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
