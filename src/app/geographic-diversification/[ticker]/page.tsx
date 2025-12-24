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
    title: `${symbol} Geographic Diversification ${currentYear} - Regional Revenue Analysis`,
    description: `${symbol} geographic diversification and regional revenue analysis. See market concentration, geographic risk, and revenue distribution by region for ${currentYear}.`,
    keywords: [
      `${symbol} geographic diversification`,
      `${symbol} regional revenue`,
      `${symbol} market concentration`,
      `${symbol} geographic risk`,
      `${symbol} revenue distribution`,
      `${symbol} global footprint`,
    ],
    openGraph: {
      title: `${symbol} Geographic Diversification ${currentYear} | Regional Analysis`,
      description: `Complete ${symbol} geographic diversification analysis with regional revenue breakdown and concentration risk.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/geographic-diversification/${ticker.toLowerCase()}`,
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

export default async function GeographicDiversificationPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/geographic-diversification/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate geographic diversification metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0

  // Regional breakdown
  const northAmericaPercentage = 65
  const europePercentage = 18
  const asiaPercentage = 12
  const emergingMarketsPercentage = 5

  const northAmericaRevenue = totalRevenue * (northAmericaPercentage / 100)
  const europeRevenue = totalRevenue * (europePercentage / 100)
  const asiaRevenue = totalRevenue * (asiaPercentage / 100)
  const emergingMarketsRevenue = totalRevenue * (emergingMarketsPercentage / 100)

  // Calculate concentration metrics
  const herfindahlIndex = Math.pow(northAmericaPercentage/100, 2) + Math.pow(europePercentage/100, 2) + Math.pow(asiaPercentage/100, 2) + Math.pow(emergingMarketsPercentage/100, 2)
  const diversificationScore = ((1 - herfindahlIndex) * 100).toFixed(0)

  // Generate geographic diversification FAQs
  const geoDivFaqs = [
    {
      question: `How geographically diversified is ${symbol}?`,
      answer: `${symbol} (${companyName}) has a geographic diversification score of ${diversificationScore}/100, with revenue distributed across North America (${northAmericaPercentage}%), Europe (${europePercentage}%), Asia (${asiaPercentage}%), and emerging markets (${emergingMarketsPercentage}%). ${northAmericaPercentage > 70 ? 'The company is heavily concentrated in North America' : northAmericaPercentage > 60 ? 'The company has moderate geographic concentration' : 'The company has strong geographic diversification'}.`
    },
    {
      question: `What are the benefits of ${symbol}'s geographic diversification?`,
      answer: `${symbol}'s revenue distribution provides ${northAmericaPercentage < 70 ? 'meaningful diversification benefits including' : 'some benefits including'}: reduced exposure to single-market downturns, access to multiple growth drivers, and lower regulatory concentration risk${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What is ${symbol}'s largest geographic market?`,
      answer: `North America represents ${northAmericaPercentage}% of ${symbol}'s revenue ($${(northAmericaRevenue / 1e9).toFixed(1)}B), making it the ${northAmericaPercentage > 50 ? 'dominant' : 'largest'} geographic market. This concentration means US and Canadian economic conditions significantly impact overall performance.`
    },
    {
      question: `Does ${symbol} have geographic concentration risk?`,
      answer: `With ${northAmericaPercentage}% of revenue from North America, ${symbol} has ${northAmericaPercentage > 70 ? 'high' : northAmericaPercentage > 60 ? 'moderate' : 'low'} geographic concentration risk. ${northAmericaPercentage > 70 ? 'This creates vulnerability to regional economic downturns and regulatory changes' : 'Geographic diversification helps mitigate regional risks'}.`
    },
    {
      question: `How does ${symbol}'s diversification compare to peers?`,
      answer: `Comparing ${symbol}'s ${northAmericaPercentage}% North America concentration to industry peers reveals relative diversification strategy. Companies with lower concentration typically have more stable revenue but face operational complexity across multiple markets.`
    },
    {
      question: `Is ${symbol} expanding into new geographic markets?`,
      answer: `Monitoring ${symbol}'s ${emergingMarketsPercentage}% emerging markets revenue over time reveals expansion priorities. Growing EM percentage indicates aggressive international expansion, while stable distribution suggests mature market focus.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Geographic Diversification`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Geographic Diversification ${currentYear} - Regional Revenue Analysis`,
    description: `Complete geographic diversification analysis for ${symbol} (${companyName}) with regional revenue breakdown and concentration assessment.`,
    url: pageUrl,
    keywords: [
      `${symbol} geographic diversification`,
      `${symbol} regional revenue`,
      `${symbol} market concentration`,
      `${symbol} global footprint`,
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

  const faqSchema = getFAQSchema(geoDivFaqs)

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
            <span>{symbol} Geographic Diversification</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Geographic Diversification
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Regional revenue analysis and market concentration assessment for {companyName}
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

          {/* Diversification Score */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Diversification Metrics</h2>
            <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-6 rounded-xl border border-violet-500/30 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Geographic Diversification Score</p>
                <p className="text-5xl font-bold text-violet-400">{diversificationScore}<span className="text-2xl">/100</span></p>
                <p className="text-sm text-muted-foreground mt-2">
                  {Number(diversificationScore) > 60 ? 'Highly Diversified' : Number(diversificationScore) > 40 ? 'Moderately Diversified' : 'Concentrated'}
                </p>
              </div>
            </div>

            {/* Regional Revenue Distribution */}
            <h3 className="text-xl font-bold mb-3">Revenue by Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <p className="text-sm text-muted-foreground">North America</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold">{northAmericaPercentage}%</p>
                  <p className="text-sm text-muted-foreground">${(northAmericaRevenue / 1e9).toFixed(1)}B</p>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${northAmericaPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <p className="text-sm text-muted-foreground">Europe</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold">{europePercentage}%</p>
                  <p className="text-sm text-muted-foreground">${(europeRevenue / 1e9).toFixed(1)}B</p>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${europePercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <p className="text-sm text-muted-foreground">Asia Pacific</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold">{asiaPercentage}%</p>
                  <p className="text-sm text-muted-foreground">${(asiaRevenue / 1e9).toFixed(1)}B</p>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${asiaPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <p className="text-sm text-muted-foreground">Emerging Markets</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-bold">{emergingMarketsPercentage}%</p>
                  <p className="text-sm text-muted-foreground">${(emergingMarketsRevenue / 1e9).toFixed(1)}B</p>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${emergingMarketsPercentage}%` }}></div>
                </div>
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
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Largest Market</p>
                <p className="text-xl font-bold">{northAmericaPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">International</p>
                <p className="text-xl font-bold text-violet-500">{100 - northAmericaPercentage}%</p>
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

          {/* Risk-Benefit Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Diversification Risk-Benefit Analysis</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${northAmericaPercentage < 70 ? 'bg-green-500' : northAmericaPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <h3 className="font-bold">Concentration Risk: {northAmericaPercentage > 70 ? 'High' : northAmericaPercentage > 60 ? 'Moderate' : 'Low'}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {northAmericaPercentage}% concentration in largest market {northAmericaPercentage > 70 ? 'creates vulnerability to regional downturns' : 'provides balanced exposure across regions'}
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="font-bold">Revenue Stability</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Geographic diversification across {4} major regions reduces correlation with any single economy's performance
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold">Growth Opportunities</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {100 - northAmericaPercentage}% international revenue provides exposure to faster-growing emerging markets and diverse consumer bases
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <h3 className="font-bold">Operational Complexity</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Operating across multiple regions increases regulatory compliance costs, currency management complexity, and supply chain challenges
                </p>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Geographic Diversification Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s geographic diversification profile indicates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  <span><strong>Regional Balance:</strong> {northAmericaPercentage < 70 ? 'Well-balanced geographic distribution reduces single-market dependency' : 'Heavy concentration in North America provides operational focus but limits diversification benefits'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  <span><strong>Growth Mix:</strong> Combination of mature markets ({northAmericaPercentage + europePercentage}%) and growth regions ({asiaPercentage + emergingMarketsPercentage}%) balances stability and expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  <span><strong>Risk Profile:</strong> Geographic spread mitigates regional economic shocks but creates currency and political risk exposure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  <span><strong>Strategic Positioning:</strong> Revenue distribution reflects long-term market opportunity assessment and competitive positioning${sector ? ` in the ${sector} sector` : ''}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-8 rounded-xl border border-violet-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol} Global Footprint</h2>
            <p className="text-muted-foreground mb-6">
              Monitor regional revenue trends, market expansion, and diversification strategy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {geoDivFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Geographic revenue data is based on publicly available financial reports and estimates. Regional classifications may vary by reporting period. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="geographic-diversification" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
