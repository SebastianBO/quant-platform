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

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Bear Case - Risks & Why ${symbol} Stock Could Fall`,
    description: `Complete bear case for ${symbol} stock. Detailed analysis of risks, headwinds, competitive threats, and downside scenarios that could impact ${symbol} negatively.`,
    keywords: [
      `${symbol} bear case`,
      `${symbol} risks`,
      `${symbol} downside`,
      `why ${symbol} will go down`,
      `${symbol} bearish case`,
      `${symbol} problems`,
    ],
    openGraph: {
      title: `${symbol} Bear Case | Risks & Downside Analysis`,
      description: `Comprehensive bear case for ${symbol} covering key risks, competitive threats, and downside scenarios.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/bear-case/${ticker.toLowerCase()}`,
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

export default async function BearCasePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/bear-case/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Bear case metrics
  const revenueGrowth = metrics?.revenue_growth || 0
  const pe = metrics?.price_to_earnings_ratio || 0
  const marketCap = snapshot.market_cap || 0
  const yearChange = snapshot.week_52_change_percent || 0

  // Calculate downside scenarios
  const conservativeDownside = price * 0.85 // -15% downside
  const moderateDownside = price * 0.65 // -35% downside
  const severeDownside = price * 0.45 // -55% downside

  // Bear case risk factors
  const hasHighValuation = pe > 35
  const hasNegativeGrowth = revenueGrowth < 0
  const hasNegativeMomentum = yearChange < -10
  const isHighRisk = hasHighValuation || hasNegativeGrowth || hasNegativeMomentum

  const bearStrength =
    (hasHighValuation ? 2 : pe > 25 ? 1 : 0) +
    (hasNegativeGrowth ? 2 : revenueGrowth < 0.05 ? 1 : 0) +
    (hasNegativeMomentum ? 1.5 : yearChange < 0 ? 0.5 : 0)

  const bearRating = bearStrength >= 4 ? 'Severe' :
                     bearStrength >= 2.5 ? 'Significant' :
                     bearStrength >= 1 ? 'Moderate' : 'Low'

  // Generate FAQs
  const faqs = [
    {
      question: `What is the bear case for ${symbol}?`,
      answer: `The bear case for ${symbol} centers on ${hasHighValuation ? `stretched valuation (P/E: ${pe.toFixed(1)}), ` : ''}${hasNegativeGrowth ? `negative revenue growth (${(revenueGrowth * 100).toFixed(1)}%), ` : ''}competitive pressure${sector ? ` in the ${sector} sector` : ''}, potential margin compression, and execution risks. The bear case strength is rated as ${bearRating.toLowerCase()}.`
    },
    {
      question: `What could make ${symbol} stock go down?`,
      answer: `Key risks that could drive ${symbol} lower: (1) ${hasNegativeGrowth ? 'Continued revenue decline' : 'Growth slowdown'}, (2) Margin compression from competition, (3) ${hasHighValuation ? 'Valuation multiple contraction' : 'Earnings disappointments'}, (4) Market share losses, (5) ${sector ? `${sector} sector` : 'Industry'} headwinds, (6) Regulatory challenges, (7) Macroeconomic weakness, and (8) Execution failures.`
    },
    {
      question: `What is ${symbol}'s downside risk?`,
      answer: `Under various bear scenarios, ${symbol} could fall to: Conservative ($${conservativeDownside.toFixed(2)}, -15%), Moderate ($${moderateDownside.toFixed(2)}, -35%), or Severe ($${severeDownside.toFixed(2)}, -55%). Downside risk depends on ${hasHighValuation ? 'multiple contraction, ' : ''}${hasNegativeGrowth ? 'revenue trends, ' : ''}competitive dynamics, and market conditions.`
    },
    {
      question: `Is ${symbol} overvalued?`,
      answer: `${hasHighValuation ? `Yes, at a P/E of ${pe.toFixed(1)}, ${symbol} trades well above market averages. ` : pe > 25 ? `At a P/E of ${pe.toFixed(1)}, valuation is elevated and leaves limited margin for error. ` : ''}${hasNegativeGrowth ? `Negative revenue growth of ${(revenueGrowth * 100).toFixed(1)}% raises concerns about valuation sustainability. ` : ''}Any disappointment could trigger multiple compression and significant downside.`
    },
    {
      question: `What are the biggest risks to ${symbol}?`,
      answer: `Top risks for ${symbol}: ${hasHighValuation ? '(1) Valuation multiple collapse if growth disappoints, ' : '(1) Execution risk and competitive pressure, '}(2) ${sector ? `${sector} sector` : 'Industry'} disruption, (3) ${hasNegativeGrowth ? 'Inability to return to growth, ' : 'Growth deceleration, '}(4) Margin compression, (5) Market share erosion, (6) Regulatory headwinds, and (7) Macroeconomic downturn.`
    },
    {
      question: `Should I sell ${symbol} stock?`,
      answer: `Consider selling ${symbol} if: you're uncomfortable with ${bearRating.toLowerCase()} bear case risk, ${hasHighValuation ? 'valuation concerns you, ' : ''}${hasNegativeGrowth ? 'revenue trends deteriorate further, ' : ''}you need to rebalance your portfolio, better opportunities exist, or your investment thesis has changed. ${isHighRisk ? 'The current risk profile warrants careful evaluation.' : 'Monitor key metrics closely.'}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Bear Case`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Bear Case - Risks & Why ${symbol} Could Fall`,
    description: `Complete bear case for ${symbol} (${companyName}) covering risks, competitive threats, and downside scenarios.`,
    url: pageUrl,
    keywords: [
      `${symbol} bear case`,
      `${symbol} risks`,
      `${symbol} downside`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Bear Case</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Bear Case
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Risks and potential downside for {companyName}
          </p>

          {/* Bear Case Severity */}
          <div className={`${
            bearRating === 'Severe' ? 'bg-red-500/10 border-red-500/30' :
            bearRating === 'Significant' ? 'bg-orange-500/10 border-orange-500/30' :
            bearRating === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Bear Case Severity</p>
                <p className={`text-5xl font-bold ${
                  bearRating === 'Severe' ? 'text-red-500' :
                  bearRating === 'Significant' ? 'text-orange-500' :
                  bearRating === 'Moderate' ? 'text-yellow-500' :
                  'text-blue-500'
                }`}>{bearRating}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Risk Score: {bearStrength.toFixed(1)}/5.5
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                <p className="text-sm text-red-500 mt-2">
                  Risk: -15% to -55%
                </p>
              </div>
            </div>
          </div>

          {/* Downside Scenarios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Downside Price Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <p className="text-sm text-muted-foreground">Conservative</p>
                </div>
                <p className="text-3xl font-bold text-orange-500">${conservativeDownside.toFixed(2)}</p>
                <p className="text-sm text-orange-400 mt-1">-15% downside</p>
                <p className="text-xs text-muted-foreground mt-2">Modest multiple contraction</p>
              </div>

              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p className="text-sm text-muted-foreground">Moderate (Base)</p>
                </div>
                <p className="text-3xl font-bold text-red-500">${moderateDownside.toFixed(2)}</p>
                <p className="text-sm text-red-400 mt-1">-35% downside</p>
                <p className="text-xs text-muted-foreground mt-2">Earnings miss & re-rating</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p className="text-sm text-muted-foreground">Severe</p>
                </div>
                <p className="text-3xl font-bold text-red-500">${severeDownside.toFixed(2)}</p>
                <p className="text-sm text-red-400 mt-1">-55% downside</p>
                <p className="text-xs text-muted-foreground mt-2">Major thesis breakdown</p>
              </div>
            </div>
          </section>

          {/* Key Risk Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Major Risk Factors</h2>
            <div className="space-y-4">
              {hasHighValuation && (
                <div className="bg-card p-6 rounded-lg border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-500">!</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-red-500">Valuation Risk (Critical)</h3>
                      <p className="text-muted-foreground">
                        At a P/E ratio of {pe.toFixed(1)}, {symbol} trades at a significant premium to market averages.
                        This stretched valuation leaves no room for error. Any earnings disappointment, growth deceleration,
                        or market re-rating could trigger severe multiple compression. The stock could easily fall 30-50%
                        to reach normalized valuations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hasNegativeGrowth && (
                <div className="bg-card p-6 rounded-lg border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-500">!</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-red-500">Revenue Decline (Critical)</h3>
                      <p className="text-muted-foreground">
                        Revenue is declining at {Math.abs(revenueGrowth * 100).toFixed(1)}% annually, indicating serious
                        business headwinds. If this trend continues or accelerates, it would undermine the entire
                        investment thesis. Negative growth compounds over time and could lead to margin compression,
                        market share losses, and eventual value destruction.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-500">!</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Competitive Pressure</h3>
                    <p className="text-muted-foreground">
                      {sector ? `The ${sector} sector` : 'The industry'} is highly competitive with new entrants
                      and technological disruption. Competitors are innovating rapidly, potentially eroding {symbol}'s
                      market position. Loss of competitive advantage could lead to pricing pressure, margin compression,
                      and market share losses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-500">!</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Execution Risk</h3>
                    <p className="text-muted-foreground">
                      {hasHighValuation ? 'High expectations are priced in, requiring flawless execution. ' : ''}
                      Any strategic missteps, operational challenges, product delays, or management changes could
                      disappoint investors. {hasNegativeGrowth ? 'The turnaround plan faces significant execution risk.' :
                      'Maintaining growth momentum is extremely difficult.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-500">!</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Macroeconomic Headwinds</h3>
                    <p className="text-muted-foreground">
                      Economic slowdown, rising interest rates, inflation, or recession could significantly impact
                      {symbol}. {sector === 'Technology' || sector === 'Consumer Discretionary' ?
                       'Consumer discretionary spending would likely decline. ' : ''}
                      {hasHighValuation ? 'High-multiple stocks are particularly vulnerable in risk-off environments.' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {sector && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-500">!</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Sector-Specific Risks</h3>
                      <p className="text-muted-foreground">
                        {sector} sector faces unique challenges including regulatory changes, technological disruption,
                        and cyclical headwinds. Adverse sector trends could drag down {symbol} regardless of company-specific
                        performance. Sector rotation could also reduce valuations across the board.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Worst Case Scenario */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Worst Case Scenario</h2>
            <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
              <p className="text-muted-foreground leading-relaxed mb-4">
                In the worst case scenario, {symbol} could fall to ${severeDownside.toFixed(2)} (-55% downside) through:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{hasNegativeGrowth ? 'Revenue decline accelerates' : 'Growth stalls or turns negative'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Multiple earnings misses and guidance cuts</span>
                </li>
                {hasHighValuation && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>P/E multiple compresses from {pe.toFixed(1)} to 15-20x</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Major competitive losses or market share erosion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Margin compression from competitive pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Sector rotation or broader market selloff</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Economic recession reduces demand significantly</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Warning Signs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Warning Signs to Monitor</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">Watch for these red flags that could trigger downside:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Decelerating revenue growth</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Margin compression trends</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Increasing competition</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Customer churn or concentration</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Management turnover</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Analyst downgrades</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Regulatory headwinds</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">•</span>
                  <span>Deteriorating cash flow</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">See the Complete Picture for {symbol}</h2>
            <p className="text-muted-foreground mb-6">
              Balance bear case risks with bull case opportunities for informed decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/bull-case/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Bull Case
              </Link>
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This bear case presents risk scenarios and should not be considered financial advice. While we highlight potential downside, actual results may vary. The bear case assumes negative outcomes that may not materialize. Always consider both bull and bear perspectives, conduct your own research, and consult a financial advisor before making investment decisions. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="bear-case" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
