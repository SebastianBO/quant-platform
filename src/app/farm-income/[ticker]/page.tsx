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
    title: `${symbol} Farm Income Correlation - Agricultural Economy Exposure`,
    description: `${symbol} farm income correlation analysis. View revenue sensitivity to farmer profitability, agricultural economy trends, and rural market conditions.`,
    keywords: [
      `${symbol} farm income`,
      `${symbol} agricultural economy`,
      `${symbol} farmer profitability`,
      `${symbol} rural economy`,
      `${symbol} farm revenue`,
      `${symbol} agricultural trends`,
    ],
    openGraph: {
      title: `${symbol} Farm Income Correlation | Agricultural Economy Exposure`,
      description: `Comprehensive ${symbol} analysis of farm income correlation and exposure to agricultural economy cycles.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/farm-income/${ticker.toLowerCase()}`,
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

export default async function FarmIncomePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/farm-income/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Determine if company has farm income correlation
  const isFarmIncomeDependent = ['DE', 'AGCO', 'CNH', 'TSC', 'CF', 'MOS', 'CTVA', 'ADM', 'BG'].includes(symbol) ||
                                industry?.toLowerCase().includes('agricultural') ||
                                industry?.toLowerCase().includes('farm')

  const correlationLevel = isFarmIncomeDependent ? 'High' : 'Low to None'

  const farmIncomeFaqs = [
    {
      question: `How correlated is ${symbol} to farm income?`,
      answer: `${symbol} (${companyName}) has ${correlationLevel.toLowerCase()} correlation to farm income levels. ${isFarmIncomeDependent ? 'The company\'s revenue is significantly affected by farmer profitability. When crop prices are strong and farm incomes rise, farmers invest in equipment, inputs, and technology—driving ${symbol} sales. Conversely, weak farm economics suppress demand.' : 'This company does not have significant exposure to agricultural farm income cycles.'}`
    },
    {
      question: `What farm income factors affect ${symbol} the most?`,
      answer: `${isFarmIncomeDependent ? `Key farm income drivers that impact ${symbol} include: crop prices (especially corn and soybeans), planted acreage, yield trends, input costs (seed, fertilizer, fuel), government support programs, export demand, and weather conditions. These combine to determine net farm income and farmer purchasing power.` : `Farm income trends do not materially affect ${symbol}'s business performance.`}`
    },
    {
      question: `How does ${symbol} perform during weak farm income periods?`,
      answer: `${isFarmIncomeDependent ? `During periods of declining farm income, ${symbol} typically experiences headwinds as farmers reduce capital expenditures, defer equipment purchases, cut input usage, and minimize technology investments. This creates multi-year down cycles that can significantly impact revenue and margins.` : `${symbol}'s performance is not significantly influenced by farm income cycles.`}`
    },
    {
      question: `Should I monitor USDA farm income forecasts for ${symbol}?`,
      answer: `${isFarmIncomeDependent ? `Yes, USDA farm income projections are highly relevant for ${symbol}. The USDA releases quarterly Farm Income and Wealth Statistics, including net farm income forecasts. These reports provide early indicators of farmer purchasing power and can help predict ${symbol} demand trends.` : `USDA farm income data is not particularly relevant for analyzing ${symbol}.`}`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Agricultural Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Farm Income`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Farm Income Correlation - Agricultural Economy Exposure`,
      description: `Comprehensive analysis of ${symbol} (${companyName}) correlation to farm income levels and agricultural economy cycles.`,
      url: pageUrl,
      keywords: [`${symbol} farm income`, `${symbol} agricultural economy`, `${symbol} farmer profitability`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(farmIncomeFaqs),
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
            <span>{symbol} Farm Income</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Farm Income Correlation</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Agricultural economy and farmer profitability exposure</p>

          {/* Farm Income Correlation Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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
                <p className="text-muted-foreground text-sm mb-1">Farm Income Correlation</p>
                <p className={`text-2xl font-bold ${isFarmIncomeDependent ? 'text-green-500' : 'text-gray-500'}`}>
                  {correlationLevel}
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

          {/* Farm Income Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Farm Income Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Crop Prices', desc: 'Corn, soybean, wheat prices', impact: isFarmIncomeDependent ? 'High' : 'Low' },
                { name: 'Planted Acreage', desc: 'Total farmland under cultivation', impact: isFarmIncomeDependent ? 'High' : 'Low' },
                { name: 'Input Costs', desc: 'Fertilizer, fuel, seed expenses', impact: isFarmIncomeDependent ? 'High' : 'Low' },
                { name: 'Government Programs', desc: 'Subsidies and support payments', impact: isFarmIncomeDependent ? 'Medium' : 'Low' },
              ].map((driver, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.desc}</p>
                    </div>
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      driver.impact === 'High' ? 'bg-red-500/20 text-red-500' :
                      driver.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {driver.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Farm Income Impact on {symbol}</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              {isFarmIncomeDependent ? (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Direct Revenue Correlation</h3>
                    <p className="text-muted-foreground">
                      {symbol}'s revenue is closely tied to farmer purchasing power. When farm incomes are strong (driven by high commodity prices and good yields), farmers invest aggressively in equipment, technology, inputs, and services—directly boosting {symbol} sales.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Multi-Year Cycles</h3>
                    <p className="text-muted-foreground">
                      Agricultural economies operate in multi-year cycles. A period of strong commodity prices (like 2010-2014) drives sustained farm income growth and capital investment. When prices fall (2015-2019), farm incomes decline and purchasing slows, creating extended headwinds for {symbol}.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Regional Variations</h3>
                    <p className="text-muted-foreground">
                      Farm income varies by region, crop mix, and farm size. {symbol}'s exposure depends on geographic footprint and customer base. For example, Corn Belt (Iowa, Illinois) farm income is heavily driven by corn/soybean prices, while other regions depend on different crops or livestock.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Timing & Leading Indicators</h3>
                    <p className="text-muted-foreground">
                      Farm income impacts {symbol} with varying lag times. Equipment purchases may lag income by 6-12 months as farmers assess sustainability. Input purchases are more immediate. Monitoring crop price trends, USDA forecasts, and futures markets provides early signals for {symbol} demand.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Material Farm Income Correlation</h3>
                    <p className="text-muted-foreground">
                      {symbol} does not have significant exposure to agricultural farm income cycles. The company's revenue model is based on other economic drivers and customer segments.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Broader Economic Context</h3>
                    <p className="text-muted-foreground">
                      While not directly tied to farm income, {symbol} may be influenced by broader macroeconomic trends that also affect agricultural markets, such as inflation, interest rates, consumer spending, or commodity price movements.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Farm Economy Indicators */}
          {isFarmIncomeDependent && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Key Farm Economy Indicators to Monitor</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">1.</span>
                    <span><strong>USDA Farm Income Forecasts:</strong> Quarterly projections of net farm income and cash receipts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">2.</span>
                    <span><strong>Corn & Soybean Futures:</strong> December corn and November soybeans indicate farmer revenue expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">3.</span>
                    <span><strong>Planted Acreage Reports:</strong> USDA Prospective Plantings (March) and Acreage reports (June)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">4.</span>
                    <span><strong>Crop Condition Ratings:</strong> Weekly USDA crop progress reports during growing season</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">5.</span>
                    <span><strong>Farm Loan Delinquencies:</strong> Federal Reserve Bank agricultural credit conditions surveys</span>
                  </li>
                </ul>
              </div>
            </section>
          )}

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
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Agricultural Analysis</h2>
            <p className="text-muted-foreground mb-6">View full sector analysis and economic exposure breakdown for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=fundamentals`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {farmIncomeFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Farm income correlation analysis is based on publicly available information and industry classifications. Actual economic sensitivity may vary. This is not financial advice.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="farm-income" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
