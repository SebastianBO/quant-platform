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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} PE Ratio ${currentYear} - Price to Earnings Analysis`,
    description: `${symbol} P/E ratio analysis: current PE ratio, forward vs trailing P/E, industry comparison, historical trends. Is ${symbol} overvalued or undervalued?`,
    keywords: [
      `${symbol} PE ratio`,
      `${symbol} price to earnings`,
      `${symbol} P/E ratio`,
      `${symbol} valuation`,
      `${symbol} forward PE`,
      `${symbol} trailing PE`,
      `is ${symbol} overvalued`,
    ],
    openGraph: {
      title: `${symbol} PE Ratio - Price to Earnings Analysis`,
      description: `Complete ${symbol} P/E ratio analysis with industry comparison and valuation insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/pe-ratio/${ticker.toLowerCase()}`,
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

export default async function PERatioPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/pe-ratio/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const peRatio = metrics?.price_to_earnings_ratio || companyFacts?.peRatio
  const forwardPE = metrics?.forward_pe
  const trailingPE = peRatio
  const eps = metrics?.earnings_per_share || companyFacts?.eps
  const earningsGrowth = metrics?.earnings_growth
  const industryPE = 20 // Placeholder - would be fetched from industry data
  const sector = companyFacts?.sector || 'Market'

  const hasPE = peRatio && peRatio > 0

  // Calculate PEG ratio if we have earnings growth
  const pegRatio = hasPE && earningsGrowth && earningsGrowth > 0
    ? peRatio / (earningsGrowth * 100)
    : null

  // Determine valuation assessment
  let valuationStatus = 'Fair Value'
  let valuationColor = 'text-[#ffa16c]'
  let valuationBg = 'bg-[#ffa16c]/20'
  let valuationBorder = 'border-[#ffa16c]/30'

  if (hasPE) {
    if (peRatio < industryPE * 0.8) {
      valuationStatus = 'Undervalued'
      valuationColor = 'text-[#4ebe96]'
      valuationBg = 'bg-[#4ebe96]/20'
      valuationBorder = 'border-[#4ebe96]/30'
    } else if (peRatio > industryPE * 1.2) {
      valuationStatus = 'Overvalued'
      valuationColor = 'text-[#ff5c5c]'
      valuationBg = 'bg-[#ff5c5c]/20'
      valuationBorder = 'border-[#ff5c5c]/30'
    }
  }

  const peFaqs = [
    {
      question: `What is ${symbol} PE ratio?`,
      answer: hasPE
        ? `${symbol} (${companyName}) has a price-to-earnings (P/E) ratio of ${peRatio.toFixed(2)}. This means investors are paying $${peRatio.toFixed(2)} for every $1 of ${symbol}'s annual earnings. The P/E ratio is a key valuation metric used to assess whether a stock is overvalued or undervalued relative to its earnings.`
        : `${symbol} (${companyName}) does not currently have a P/E ratio, likely because the company is not yet profitable or recently had negative earnings. For growth companies, other metrics like Price-to-Sales or Price-to-Book may be more relevant.`
    },
    {
      question: `What is a good PE ratio?`,
      answer: `A "good" P/E ratio depends on the industry and growth prospects. Generally, a P/E ratio between 15-25 is considered reasonable for mature companies. Growth stocks often trade at higher P/E ratios (30-50+) due to expected future earnings growth. Value stocks typically have lower P/E ratios (below 15). Compare ${symbol}'s P/E of ${hasPE ? peRatio.toFixed(2) : 'N/A'} to its industry average and historical range.`
    },
    {
      question: `Is ${symbol} overvalued based on PE ratio?`,
      answer: hasPE
        ? `${symbol}'s P/E ratio of ${peRatio.toFixed(2)} is ${peRatio > industryPE ? 'above' : peRatio < industryPE ? 'below' : 'in line with'} the ${sector} industry average of approximately ${industryPE}. ${valuationStatus === 'Overvalued' ? 'This suggests the stock may be trading at a premium, though high P/E ratios can be justified by strong growth prospects.' : valuationStatus === 'Undervalued' ? 'This could indicate the stock is undervalued relative to peers, though it\'s important to investigate why it trades at a discount.' : 'The stock appears fairly valued relative to industry peers.'}`
        : `Without a positive P/E ratio, use other valuation methods like DCF analysis, Price-to-Sales, or Price-to-Book to assess ${symbol}'s valuation.`
    },
    {
      question: `What is the difference between forward and trailing PE ratio?`,
      answer: `The trailing P/E ratio uses earnings from the past 12 months (historical data), while the forward P/E ratio uses projected earnings for the next 12 months (future estimates). ${symbol}'s trailing P/E is ${hasPE ? peRatio.toFixed(2) : 'N/A'}${forwardPE ? ` and forward P/E is ${forwardPE.toFixed(2)}` : ''}. Forward P/E is often more useful for growth companies as it reflects expected future performance.`
    },
    {
      question: `How do you calculate PE ratio?`,
      answer: `P/E ratio is calculated by dividing the stock price by earnings per share (EPS). Formula: P/E = Stock Price / EPS. For ${symbol}, with a current price of $${currentPrice.toFixed(2)}${eps ? ` and EPS of $${eps.toFixed(2)}, the P/E ratio is ${(currentPrice / eps).toFixed(2)}` : ', the P/E ratio can be calculated once EPS is available'}. A higher P/E means investors pay more per dollar of earnings.`
    },
    {
      question: `What is PEG ratio and how does it relate to PE?`,
      answer: pegRatio
        ? `The PEG (Price/Earnings to Growth) ratio adjusts the P/E ratio for earnings growth. It's calculated as P/E / Earnings Growth Rate. ${symbol}'s PEG ratio is approximately ${pegRatio.toFixed(2)}. A PEG below 1.0 suggests the stock may be undervalued relative to its growth rate, while above 2.0 may indicate overvaluation.`
        : `The PEG ratio adjusts P/E for growth. PEG = P/E / Earnings Growth Rate. A PEG below 1.0 typically indicates good value. Calculate ${symbol}'s PEG ratio when earnings growth data is available.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'PE Ratio', url: `${SITE_URL}/learn/pe-ratio` },
      { name: `${symbol} PE Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} PE Ratio ${currentYear} - Price to Earnings Analysis`,
      description: `Complete P/E ratio analysis for ${symbol} including valuation assessment and industry comparison.`,
      url: pageUrl,
      keywords: [`${symbol} PE ratio`, `${symbol} price to earnings`, `${symbol} valuation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(peFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Learn</Link>
            {' / '}
            <Link href="/learn/pe-ratio" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">PE Ratio</Link>
            {' / '}
            <span>{symbol} PE Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} PE Ratio {currentYear}</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} Price to Earnings Analysis</p>

          {/* PE Ratio Overview */}
          <div className={`p-8 rounded-xl border mb-8 ${valuationBg} ${valuationBorder}`}>
            {hasPE ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[#868f97] text-sm mb-1">Current P/E Ratio</p>
                  <p className="text-4xl font-bold tabular-nums">{peRatio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[#868f97] text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold tabular-nums">${currentPrice.toFixed(2)}</p>
                </div>
                {eps && (
                  <div>
                    <p className="text-[#868f97] text-sm mb-1">EPS (TTM)</p>
                    <p className="text-3xl font-bold tabular-nums">${eps.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#868f97] text-sm mb-1">Valuation</p>
                  <p className={`text-2xl font-bold ${valuationColor}`}>{valuationStatus}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} P/E Ratio Not Available</p>
                <p className="text-[#868f97]">This company may not be profitable yet or recently reported negative earnings.</p>
              </div>
            )}
          </div>

          {/* Key PE Metrics */}
          {hasPE && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-balance">PE Ratio Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97] mb-1">Trailing P/E (TTM)</p>
                  <p className="text-2xl font-bold mb-2 tabular-nums">{trailingPE.toFixed(2)}</p>
                  <p className="text-sm text-[#868f97]">Based on last 12 months earnings</p>
                </div>
                {forwardPE && (
                  <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                    <p className="text-sm text-[#868f97] mb-1">Forward P/E</p>
                    <p className="text-2xl font-bold mb-2 tabular-nums">{forwardPE.toFixed(2)}</p>
                    <p className="text-sm text-[#868f97]">Based on next 12 months estimates</p>
                  </div>
                )}
                <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="text-sm text-[#868f97] mb-1">{sector} Industry Avg</p>
                  <p className="text-2xl font-bold mb-2 tabular-nums">{industryPE.toFixed(2)}</p>
                  <p className="text-sm text-[#868f97]">
                    {symbol} is {peRatio > industryPE ? ((peRatio - industryPE) / industryPE * 100).toFixed(0) + '% above' : ((industryPE - peRatio) / industryPE * 100).toFixed(0) + '% below'} industry
                  </p>
                </div>
                {pegRatio && (
                  <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                    <p className="text-sm text-[#868f97] mb-1">PEG Ratio</p>
                    <p className="text-2xl font-bold mb-2 tabular-nums">{pegRatio.toFixed(2)}</p>
                    <p className="text-sm text-[#868f97]">
                      {pegRatio < 1 ? 'Potentially undervalued' : pegRatio < 2 ? 'Fairly valued' : 'Potentially overvalued'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Valuation Interpretation */}
          {hasPE && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-balance">What Does {symbol} P/E Ratio Mean?</h2>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Current Valuation</h3>
                  <p className="text-[#868f97]">
                    At a P/E ratio of <span className="tabular-nums">{peRatio.toFixed(2)}</span>, investors are paying $<span className="tabular-nums">{peRatio.toFixed(2)}</span> for every $1 of {symbol}'s annual earnings.
                    {peRatio < 15 && ' This relatively low P/E could indicate the stock is undervalued or that growth prospects are limited.'}
                    {peRatio >= 15 && peRatio <= 25 && ' This moderate P/E is typical for established companies with steady earnings.'}
                    {peRatio > 25 && ' This high P/E suggests investors expect strong future earnings growth or that the stock is trading at a premium.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Industry Comparison</h3>
                  <p className="text-[#868f97]">
                    Compared to the {sector} industry average P/E of <span className="tabular-nums">{industryPE}</span>, {symbol} is trading at a {peRatio > industryPE ? 'premium' : 'discount'}.
                    {peRatio > industryPE && ' This could be justified by superior growth, profitability, or competitive position.'}
                    {peRatio < industryPE && ' This discount may present a value opportunity or could reflect higher risk or slower growth.'}
                  </p>
                </div>
                {forwardPE && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Forward vs Trailing</h3>
                    <p className="text-[#868f97]">
                      The forward P/E of <span className="tabular-nums">{forwardPE.toFixed(2)}</span> is {forwardPE < trailingPE ? 'lower than' : 'higher than'} the trailing P/E of <span className="tabular-nums">{trailingPE.toFixed(2)}</span>,
                      {forwardPE < trailingPE && ' suggesting analysts expect earnings to grow in the coming year.'}
                      {forwardPE > trailingPE && ' suggesting analysts expect earnings to decline or grow slower in the coming year.'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* PE Calculator */}
          {hasPE && eps && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-balance">PE Ratio Calculator</h2>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <p className="text-[#868f97] mb-4">How P/E ratio changes with different stock prices:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0.8, 0.9, 1.1, 1.2].map(multiplier => {
                    const hypotheticalPrice = currentPrice * multiplier
                    const hypotheticalPE = hypotheticalPrice / eps
                    return (
                      <div key={multiplier} className="text-center p-3 bg-white/[0.05] rounded-lg">
                        <p className="text-sm text-[#868f97]">At $<span className="tabular-nums">{hypotheticalPrice.toFixed(2)}</span></p>
                        <p className="text-xl font-bold tabular-nums">P/E: {hypotheticalPE.toFixed(2)}</p>
                        <p className="text-xs text-[#868f97] tabular-nums">
                          {multiplier < 1 ? `${((1-multiplier)*100).toFixed(0)}% lower` : `${((multiplier-1)*100).toFixed(0)}% higher`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-[#479ffa]/20 to-[#4ebe96]/20 p-8 rounded-2xl border border-[#479ffa]/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Get Complete {symbol} Valuation Analysis</h2>
            <p className="text-[#868f97] mb-6">DCF model, comparable companies, and AI-powered insights</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                Full Stock Analysis
              </Link>
              <Link href={`/analysis/${symbol.toLowerCase()}/valuation`} className="inline-block bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                Valuation Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {peFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Compare P/E Ratios</h2>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'JNJ', 'WMT']
                .filter(s => s !== symbol)
                .slice(0, 8)
                .map(stock => (
                  <Link key={stock} href={`/pe-ratio/${stock.toLowerCase()}`} className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                    {stock} P/E Ratio
                  </Link>
                ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
