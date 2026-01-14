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
    title: `${symbol} Precision Agriculture Revenue - AgTech & Digital Farming`,
    description: `${symbol} precision agriculture analysis. View revenue from GPS guidance, data analytics, autonomous equipment, and digital farming technology.`,
    keywords: [
      `${symbol} precision ag`,
      `${symbol} precision agriculture`,
      `${symbol} agtech`,
      `${symbol} digital farming`,
      `${symbol} GPS agriculture`,
      `${symbol} farm data`,
    ],
    openGraph: {
      title: `${symbol} Precision Agriculture Revenue | AgTech Analysis`,
      description: `Comprehensive ${symbol} analysis of precision agriculture technology revenue, market position, and digital farming growth.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/precision-ag/${ticker.toLowerCase()}`,
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

export default async function PrecisionAgPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/precision-ag/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has precision ag business exposure
  const isPrecisionAgCompany = ['DE', 'AGCO', 'CNH', 'TTC', 'TRMB'].includes(symbol) ||
                               industry?.toLowerCase().includes('agricultural') ||
                               sector?.toLowerCase().includes('technology')

  const exposureLevel = isPrecisionAgCompany ? 'Medium to High' : 'Low to None'

  const precisionAgFaqs = [
    {
      question: `Does ${symbol} have precision agriculture revenue?`,
      answer: `${symbol} (${companyName}) has ${exposureLevel.toLowerCase()} exposure to precision agriculture technology. ${isPrecisionAgCompany ? 'The company offers GPS guidance, automated steering, variable rate application, data analytics, and digital farming platforms. This is a high-growth, high-margin segment within agricultural technology.' : 'This company does not have significant precision agriculture operations.'}`
    },
    {
      question: `What precision ag technologies does ${symbol} offer?`,
      answer: `${isPrecisionAgCompany ? `${symbol} typically offers a range of precision agriculture solutions including: GPS auto-steering and guidance systems, yield monitoring and mapping, variable rate input application, field data analytics, agronomic decision support, fleet management, and connectivity platforms. These technologies help farmers optimize inputs and maximize yields.` : `${symbol} does not offer material precision agriculture technology solutions.`}`
    },
    {
      question: `How fast is ${symbol}'s precision ag business growing?`,
      answer: `${isPrecisionAgCompany ? `Precision agriculture is one of the fastest-growing segments in agricultural technology, often growing 10-20%+ annually as farmer adoption increases. For ${symbol}, this segment typically has higher margins than traditional equipment or inputs, making it strategically important despite being a smaller revenue portion.` : `Precision agriculture growth is not applicable to ${symbol}'s business model.`}`
    },
    {
      question: `What drives precision ag adoption for ${symbol}?`,
      answer: `${isPrecisionAgCompany ? `Key adoption drivers include: rising input costs (making precision valuable), generational farm transitions to tech-savvy farmers, data-driven decision making trends, regulatory compliance needs, environmental sustainability goals, and ROI demonstration through yield optimization and cost savings.` : `${symbol} does not participate in the precision agriculture market.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'AgTech Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Precision Ag`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Precision Agriculture Revenue - AgTech & Digital Farming`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) precision agriculture technology revenue and digital farming growth.`,
      url: pageUrl,
      keywords: [`${symbol} precision ag`, `${symbol} agtech`, `${symbol} digital farming`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(precisionAgFaqs),
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
            <span>{symbol} Precision Ag</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Precision Agriculture</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Digital farming and AgTech revenue analysis</p>

          {/* Precision Ag Business Overview Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Precision Ag Exposure</p>
                <p className={`text-2xl font-bold ${isPrecisionAgCompany ? 'text-green-500' : 'text-gray-500'}`}>
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

          {/* Precision Ag Technology Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Precision Agriculture Technologies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'GPS & Auto-Steering', desc: 'Automated guidance, sub-inch accuracy', exposure: isPrecisionAgCompany ? 'High' : 'None' },
                { name: 'Data Analytics', desc: 'Yield maps, field insights, prescriptions', exposure: isPrecisionAgCompany ? 'High' : 'None' },
                { name: 'Variable Rate Tech', desc: 'Optimized input application', exposure: isPrecisionAgCompany ? 'Medium' : 'None' },
                { name: 'Connectivity Platforms', desc: 'IoT, telemetry, farm management software', exposure: isPrecisionAgCompany ? 'High' : 'None' },
              ].map((tech, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{tech.name}</p>
                      <p className="text-sm text-muted-foreground">{tech.desc}</p>
                    </div>
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      tech.exposure === 'High' ? 'bg-green-500/20 text-green-500' :
                      tech.exposure === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {tech.exposure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Precision Ag Business Dynamics for {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isPrecisionAgCompany ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">High-Growth, High-Margin Segment</h3>
                    <p className="text-muted-foreground">
                      Precision agriculture represents a strategic growth opportunity for {symbol}. Software, subscriptions, and data services typically carry 60-80% margins compared to 20-30% for traditional equipment, making this a priority investment area.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Recurring Revenue Model</h3>
                    <p className="text-muted-foreground">
                      Unlike one-time equipment sales, precision ag generates recurring revenue through software subscriptions, data services, connectivity fees, and technology upgrades. This creates more predictable cash flows and higher valuations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Adoption Curve & Market Penetration</h3>
                    <p className="text-muted-foreground">
                      Precision ag adoption is still in early-to-mid stages globally. Large commercial farms adopt first, followed by mid-size operations. {symbol}'s growth depends on expanding the addressable market and moving farmers up the technology adoption curve.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Data as Competitive Moat</h3>
                    <p className="text-muted-foreground">
                      Field data and agronomic insights create network effects. As more farmers use {symbol}'s platform, data quality improves, recommendations get better, and switching costs increase—building a defensible competitive position.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Precision Ag Business</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not operate a significant precision agriculture technology business. The company's revenue model is based on other products or services in its industry.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Potential Indirect Exposure</h3>
                    <p className="text-muted-foreground">
                      While not offering precision ag directly, {symbol} may benefit indirectly from agricultural technology trends through supply chain relationships, customer base evolution, or technology partnerships.
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
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Technology Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and technology segment breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {precisionAgFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Precision agriculture analysis is based on publicly available information and industry classifications. Actual business segment performance may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="precision-ag" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
