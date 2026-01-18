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
    title: `${symbol} Bull Case - Why ${symbol} Stock Could Soar`,
    description: `Complete bull case for ${symbol} stock. Explore growth catalysts, competitive advantages, market opportunities, and upside scenarios that could drive significant appreciation.`,
    keywords: [
      `${symbol} bull case`,
      `${symbol} upside`,
      `${symbol} growth potential`,
      `${symbol} catalysts`,
      `why ${symbol} will go up`,
      `${symbol} bullish case`,
    ],
    openGraph: {
      title: `${symbol} Bull Case | Why ${symbol} Stock Could Soar`,
      description: `Comprehensive bull case for ${symbol} covering growth catalysts, competitive advantages, and upside potential.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/bull-case/${ticker.toLowerCase()}`,
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

export default async function BullCasePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/bull-case/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Bull case metrics
  const revenueGrowth = metrics?.revenue_growth || 0
  const pe = metrics?.price_to_earnings_ratio || 0
  const marketCap = snapshot.market_cap || 0
  const yearChange = snapshot.week_52_change_percent || 0

  // Calculate upside scenarios
  const currentYear = new Date().getFullYear()
  const conservativeUpside = price * 1.25 // 25% upside
  const moderateUpside = price * 1.5 // 50% upside
  const aggressiveUpside = price * 2.0 // 100% upside

  // Bull case strength
  const bullStrength =
    (revenueGrowth > 0.15 ? 2 : revenueGrowth > 0.05 ? 1 : 0) +
    (pe > 0 && pe < 25 ? 2 : pe >= 25 && pe < 35 ? 1 : 0) +
    (marketCap > 10e9 ? 1 : 0.5) +
    (yearChange > 20 ? 1 : yearChange > 0 ? 0.5 : 0)

  const bullRating = bullStrength >= 5 ? 'Very Strong' :
                     bullStrength >= 3.5 ? 'Strong' :
                     bullStrength >= 2 ? 'Moderate' : 'Developing'

  // Generate FAQs
  const faqs = [
    {
      question: `What is the bull case for ${symbol}?`,
      answer: `The bull case for ${symbol} centers on ${revenueGrowth > 0.1 ? `exceptional ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}${sector ? `favorable ${sector} sector trends, ` : ''}market expansion opportunities, ${pe > 0 && pe < 25 ? 'attractive valuation, ' : ''}and potential for multiple expansion. If the company executes on its growth strategy, the stock could appreciate significantly from $${price.toFixed(2)}.`
    },
    {
      question: `What could make ${symbol} stock go up?`,
      answer: `Key catalysts that could drive ${symbol} higher: (1) ${revenueGrowth > 0.1 ? 'Acceleration of current growth trends' : 'Return to revenue growth'}, (2) Market share gains and competitive wins, (3) New product launches or innovations, (4) Margin expansion, (5) Multiple re-rating as growth is recognized, (6) Favorable ${sector ? `${sector} sector` : 'industry'} dynamics, and (7) Positive earnings surprises.`
    },
    {
      question: `What is ${symbol}'s upside potential?`,
      answer: `Under various scenarios, ${symbol} could reach: Conservative case ($${conservativeUpside.toFixed(2)}, +25%), Moderate case ($${moderateUpside.toFixed(2)}, +50%), or Aggressive case ($${aggressiveUpside.toFixed(2)}, +100%). The upside depends on growth execution, market conditions, and ${pe > 0 ? 'valuation multiple expansion' : 'market recognition'}.`
    },
    {
      question: `Why is ${symbol} undervalued?`,
      answer: `${pe > 0 && pe < 20 ? `${symbol} trades at a P/E of ${pe.toFixed(1)}, below historical and sector averages, ` : ''}${revenueGrowth > 0.15 ? `despite impressive ${(revenueGrowth * 100).toFixed(1)}% growth. ` : ''}The market may be underappreciating: growth potential, ${sector ? `${sector} sector exposure, ` : ''}competitive advantages, and long-term value creation. Re-rating could drive significant appreciation.`
    },
    {
      question: `What are ${symbol}'s competitive advantages?`,
      answer: `${symbol}'s key competitive advantages include: ${marketCap > 50e9 ? 'market leadership and scale, ' : ''}${revenueGrowth > 0.15 ? 'proven growth execution, ' : ''}${sector === 'Technology' ? 'technological innovation, ' : ''}${industry ? `${industry} industry expertise, ` : ''}brand strength, ${marketCap > 10e9 ? 'financial resources, ' : ''}and ${sector ? `strategic positioning in the ${sector} sector` : 'operational capabilities'}. These create sustainable moats.`
    },
    {
      question: `Will ${symbol} stock double?`,
      answer: `${symbol} could potentially double from $${price.toFixed(2)} to $${aggressiveUpside.toFixed(2)} if: ${revenueGrowth > 0.1 ? 'growth accelerates further, ' : 'the company returns to strong growth, '}market sentiment improves, ${pe < 20 ? 'valuation multiples expand to sector averages, ' : ''}execution exceeds expectations, and favorable ${sector ? `${sector} sector` : 'market'} conditions persist. This represents the aggressive bull scenario.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Bull Case`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Bull Case - Why ${symbol} Stock Could Soar`,
    description: `Complete bull case for ${symbol} (${companyName}) covering growth catalysts, competitive advantages, and upside scenarios.`,
    url: pageUrl,
    keywords: [
      `${symbol} bull case`,
      `${symbol} upside potential`,
      `${symbol} growth catalysts`,
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
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Stocks</Link>
            {' / '}
            <span>{symbol} Bull Case</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            {symbol} Bull Case
          </h1>
          <p className="text-xl text-[#868f97] mb-8">
            Why {companyName} stock could soar
          </p>

          {/* Bull Case Strength */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 p-8 rounded-2xl mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#868f97] mb-2">Bull Case Strength</p>
                <p className="text-5xl font-bold text-[#4ebe96]">{bullRating}</p>
                <p className="text-sm text-[#868f97] mt-2 tabular-nums">
                  Conviction Score: {bullStrength.toFixed(1)}/6.5
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#868f97] mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
                <p className="text-sm text-[#4ebe96] mt-2">
                  Potential: +25% to +100%
                </p>
              </div>
            </div>
          </div>

          {/* Upside Scenarios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Upside Price Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ebe96]"></div>
                  <p className="text-sm text-[#868f97]">Conservative</p>
                </div>
                <p className="text-3xl font-bold text-[#4ebe96] tabular-nums">${conservativeUpside.toFixed(2)}</p>
                <p className="text-sm text-[#4ebe96] mt-1">+25% upside</p>
                <p className="text-xs text-[#868f97] mt-2">Modest growth continuation</p>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 p-6 rounded-2xl hover:bg-white/[0.05] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ebe96]"></div>
                  <p className="text-sm text-[#868f97]">Moderate (Base)</p>
                </div>
                <p className="text-3xl font-bold text-[#4ebe96] tabular-nums">${moderateUpside.toFixed(2)}</p>
                <p className="text-sm text-[#4ebe96] mt-1">+50% upside</p>
                <p className="text-xs text-[#868f97] mt-2">Strong execution & market recognition</p>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ebe96]"></div>
                  <p className="text-sm text-[#868f97]">Aggressive</p>
                </div>
                <p className="text-3xl font-bold text-[#4ebe96] tabular-nums">${aggressiveUpside.toFixed(2)}</p>
                <p className="text-sm text-[#4ebe96] mt-1">+100% upside</p>
                <p className="text-xs text-[#868f97] mt-2">All cylinders firing, multiple expansion</p>
              </div>
            </div>
          </section>

          {/* Growth Catalysts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key Growth Catalysts</h2>
            <div className="space-y-4">
              {revenueGrowth > 0.1 && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#4ebe96]">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Revenue Momentum</h3>
                      <p className="text-[#868f97]">
                        Exceptional {(revenueGrowth * 100).toFixed(1)}% revenue growth demonstrates strong market demand.
                        If this accelerates or sustains, it could drive significant multiple expansion and stock appreciation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#4ebe96]">{revenueGrowth > 0.1 ? '2' : '1'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Market Expansion</h3>
                    <p className="text-[#868f97]">
                      {sector ? `The ${sector} sector is experiencing secular growth trends. ` : ''}
                      {companyName} is well-positioned to capture market share through innovation, geographic expansion,
                      and new product launches. Total addressable market expansion could drive years of growth.
                    </p>
                  </div>
                </div>
              </div>

              {pe > 0 && pe < 25 && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#4ebe96]">{revenueGrowth > 0.1 ? '3' : '2'}</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Valuation Re-rating</h3>
                      <p className="text-[#868f97]">
                        At a P/E of {pe.toFixed(1)}, {symbol} trades below market averages. As the market recognizes
                        the quality of earnings and growth trajectory, the stock could re-rate higher. Even modest
                        multiple expansion to 30-35x earnings would drive substantial appreciation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#4ebe96]">{(revenueGrowth > 0.1 ? 1 : 0) + (pe < 25 ? 1 : 0) + 3}</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Margin Expansion</h3>
                    <p className="text-[#868f97]">
                      Operating leverage, economies of scale, and efficiency improvements could drive margin expansion.
                      Even 200-300 basis points of margin improvement would significantly boost earnings and
                      justify higher valuations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#4ebe96]">{(revenueGrowth > 0.1 ? 1 : 0) + (pe < 25 ? 1 : 0) + 4}</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Competitive Advantages</h3>
                    <p className="text-[#868f97]">
                      {marketCap > 50e9 ? 'Market leadership, ' : ''}{sector === 'Technology' ? 'technological innovation, ' : ''}
                      {industry ? `${industry} expertise, ` : ''}and brand strength create sustainable competitive moats.
                      These advantages compound over time, driving long-term outperformance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bull Case Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Potential Timeline to Upside</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-[#4ebe96] font-bold tabular-nums">6-12M</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Near-Term Catalysts</h4>
                    <p className="text-sm text-[#868f97]">
                      Earnings beats, positive guidance, new product announcements, analyst upgrades
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-[#4ebe96] font-bold tabular-nums">1-2Y</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Medium-Term Growth</h4>
                    <p className="text-sm text-[#868f97]">
                      Market share gains, margin expansion, multiple re-rating, sustained growth demonstration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-[#4ebe96] font-bold tabular-nums">3-5Y</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Long-Term Value Creation</h4>
                    <p className="text-sm text-[#868f97]">
                      Market leadership solidified, compounding returns, potential inclusion in major indices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What Could Go Right */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Best Case Scenario</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#4ebe96]/30 p-6 rounded-2xl">
              <p className="text-[#868f97] leading-relaxed mb-4">
                In the best case scenario, {symbol} could reach <span className="tabular-nums">${aggressiveUpside.toFixed(2)}</span> (100% upside) through:
              </p>
              <ul className="space-y-2 text-[#868f97]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">✓</span>
                  <span>Revenue growth accelerates to {(Math.max(revenueGrowth * 1.5, 0.25) * 100).toFixed(0)}%+ annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">✓</span>
                  <span>Profit margins expand by 300-500 basis points</span>
                </li>
                {pe > 0 && pe < 30 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>P/E multiple expands from {pe.toFixed(1)} to 35-40x on growth recognition</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">✓</span>
                  <span>New products/services exceed expectations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">✓</span>
                  <span>Strategic partnerships or M&A create value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">✓</span>
                  <span>{sector ? `${sector} sector` : 'Market'} tailwinds strengthen</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-8 rounded-2xl text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Balance Risk & Reward for {symbol}</h2>
            <p className="text-[#868f97] mb-6">
              Every bull case has risks. See the full picture with our complete analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/bear-case/${symbol.toLowerCase()}`}
                className="inline-block bg-[#ff5c5c] hover:bg-[#ff5c5c]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#ff5c5c]"
              >
                View Bear Case
              </Link>
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Full Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-5 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-[#868f97] bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl mb-8">
            <p><strong>Disclaimer:</strong> This bull case presents an optimistic scenario and should not be considered financial advice. Actual results may differ significantly. The upside potential described assumes favorable outcomes that may not materialize. Always consider both bull and bear cases, conduct your own research, and consult a financial advisor before making investment decisions. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="bull-case" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
