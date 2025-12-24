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

  return {
    title: `Is ${symbol} Stock Worth Buying? - Complete Investment Analysis`,
    description: `Is ${symbol} worth buying in 2025? Complete investment analysis covering fundamentals, growth potential, risks, valuation, and expert recommendation to help you decide.`,
    keywords: [
      `is ${symbol} worth buying`,
      `${symbol} worth buying`,
      `should I invest in ${symbol}`,
      `is ${symbol} a good investment`,
      `${symbol} investment analysis`,
      `${symbol} worth it`,
    ],
    openGraph: {
      title: `Is ${symbol} Stock Worth Buying? | Investment Analysis`,
      description: `Complete investment analysis for ${symbol} with fundamentals, risks, growth potential, and expert recommendation.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/worth-buying/${ticker.toLowerCase()}`,
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

export default async function WorthBuyingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/worth-buying/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Investment criteria scoring
  const pe = metrics?.price_to_earnings_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const marketCap = snapshot.market_cap || 0
  const priceChange = snapshot.day_change_percent || 0
  const yearChange = snapshot.week_52_change_percent || 0

  // Scoring system (0-10 scale)
  const valuationScore = pe > 0 ? (pe < 20 ? 3 : pe < 30 ? 2 : pe < 40 ? 1 : 0) : 0
  const growthScore = revenueGrowth > 0.2 ? 3 : revenueGrowth > 0.1 ? 2 : revenueGrowth > 0 ? 1 : 0
  const sizeScore = marketCap > 100e9 ? 2 : marketCap > 10e9 ? 1.5 : marketCap > 1e9 ? 1 : 0.5
  const momentumScore = yearChange > 20 ? 2 : yearChange > 0 ? 1 : 0

  const totalScore = valuationScore + growthScore + sizeScore + momentumScore
  const maxScore = 10
  const scorePercentage = (totalScore / maxScore) * 100

  const rating = scorePercentage >= 75 ? 'Highly Worth Buying' :
                 scorePercentage >= 60 ? 'Worth Buying' :
                 scorePercentage >= 40 ? 'Consider Carefully' : 'Not Recommended'

  const ratingColor = scorePercentage >= 75 ? 'green' :
                     scorePercentage >= 60 ? 'blue' :
                     scorePercentage >= 40 ? 'yellow' : 'red'

  // Generate FAQs
  const faqs = [
    {
      question: `Is ${symbol} stock worth buying right now?`,
      answer: `${symbol} is rated as "${rating}" based on our comprehensive analysis. At $${price.toFixed(2)}, the stock scores ${scorePercentage.toFixed(0)}/100 on our investment quality scale, considering valuation (${pe > 0 ? `P/E: ${pe.toFixed(1)}` : 'N/A'}), growth (${(revenueGrowth * 100).toFixed(1)}%), market position, and momentum.`
    },
    {
      question: `What are the pros of buying ${symbol}?`,
      answer: `Key advantages of investing in ${symbol} include: ${revenueGrowth > 0.1 ? `strong ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}${pe > 0 && pe < 25 ? 'attractive valuation, ' : ''}${marketCap > 10e9 ? 'established market position, ' : ''}${sector ? `exposure to the ${sector} sector, ` : ''}and ${yearChange > 0 ? 'positive long-term momentum' : 'potential for recovery'}.`
    },
    {
      question: `What are the risks of buying ${symbol}?`,
      answer: `Investment risks include: ${pe > 40 ? 'high valuation concerns, ' : ''}${revenueGrowth < 0 ? 'revenue headwinds, ' : ''}${yearChange < -20 ? 'significant price decline, ' : ''}market volatility, ${sector ? `${sector} sector risks, ` : ''}competition, and macroeconomic factors. Always assess risks against your investment goals.`
    },
    {
      question: `Is ${symbol} a good long-term investment?`,
      answer: `${symbol}'s long-term potential depends on ${revenueGrowth > 0.1 ? 'sustained growth trajectory, ' : ''}competitive positioning, industry trends, and execution. ${scorePercentage > 60 ? 'Current fundamentals suggest solid long-term prospects.' : 'Consider whether the investment aligns with your time horizon and risk tolerance.'}`
    },
    {
      question: `How much should I invest in ${symbol}?`,
      answer: `Investment amount depends on your portfolio size, diversification strategy, and risk tolerance. Consider starting with a position that represents no more than 5-10% of your portfolio, especially if ${symbol} is in a sector you're already exposed to. Dollar-cost averaging can reduce timing risk.`
    },
    {
      question: `What is ${symbol}'s growth potential?`,
      answer: `${symbol} is growing revenue at ${(revenueGrowth * 100).toFixed(1)}% annually. ${revenueGrowth > 0.15 ? 'This strong growth rate, combined with market position, suggests significant upside potential' : revenueGrowth > 0 ? 'Moderate growth provides steady returns potential' : 'Growth challenges may limit near-term upside'}. Future performance depends on market conditions and company execution.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Is ${symbol} Worth Buying`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Is ${symbol} Stock Worth Buying? Complete Investment Analysis`,
    description: `Comprehensive investment analysis for ${symbol} (${companyName}) covering fundamentals, risks, growth potential, and recommendation.`,
    url: pageUrl,
    keywords: [
      `is ${symbol} worth buying`,
      `${symbol} investment analysis`,
      `should I buy ${symbol}`,
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
            <span>Is {symbol} Worth Buying</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            Is {symbol} Stock Worth Buying?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete investment analysis for {companyName}
          </p>

          {/* Rating Card */}
          <div className={`bg-${ratingColor}-500/10 border-${ratingColor}-500/30 p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Investment Rating</p>
                <p className={`text-5xl font-bold text-${ratingColor}-500`}>
                  {rating}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Quality Score: {scorePercentage.toFixed(0)}/100
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                <p className={`text-xl mt-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valuation</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${ratingColor}-500`}
                        style={{ width: `${(valuationScore / 3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{valuationScore}/3</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Growth</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${ratingColor}-500`}
                        style={{ width: `${(growthScore / 3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{growthScore}/3</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Size</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${ratingColor}-500`}
                        style={{ width: `${(sizeScore / 2) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{sizeScore.toFixed(1)}/2</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Momentum</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${ratingColor}-500`}
                        style={{ width: `${(momentumScore / 2) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{momentumScore}/2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Case */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Case</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reasons to Buy */}
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-4 text-green-500">Reasons to Buy</h3>
                <ul className="space-y-3">
                  {revenueGrowth > 0.1 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">
                        Strong revenue growth of {(revenueGrowth * 100).toFixed(1)}%
                      </span>
                    </li>
                  )}
                  {pe > 0 && pe < 25 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">
                        Attractive P/E ratio of {pe.toFixed(1)}
                      </span>
                    </li>
                  )}
                  {marketCap > 10e9 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">
                        Established ${(marketCap / 1e9).toFixed(1)}B market cap
                      </span>
                    </li>
                  )}
                  {yearChange > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">
                        Positive {yearChange.toFixed(1)}% year-over-year performance
                      </span>
                    </li>
                  )}
                  {sector && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">
                        Positioned in {sector} sector
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Risks to Consider */}
              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-4 text-red-500">Risks to Consider</h3>
                <ul className="space-y-3">
                  {pe > 40 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span className="text-sm text-muted-foreground">
                        High P/E ratio of {pe.toFixed(1)} suggests premium valuation
                      </span>
                    </li>
                  )}
                  {revenueGrowth < 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span className="text-sm text-muted-foreground">
                        Negative revenue growth of {(revenueGrowth * 100).toFixed(1)}%
                      </span>
                    </li>
                  )}
                  {yearChange < -10 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span className="text-sm text-muted-foreground">
                        Down {Math.abs(yearChange).toFixed(1)}% over the past year
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚠</span>
                    <span className="text-sm text-muted-foreground">
                      Market volatility and economic uncertainty
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚠</span>
                    <span className="text-sm text-muted-foreground">
                      {sector ? `${sector} sector` : 'Industry'} competitive pressures
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Investment Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pe > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                  <p className="text-2xl font-bold">{pe.toFixed(1)}</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                <p className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
              </div>
              {marketCap > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">${(marketCap / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">52-Week Change</p>
                <p className={`text-2xl font-bold ${yearChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {yearChange >= 0 ? '+' : ''}{yearChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Final Recommendation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bottom Line</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground leading-relaxed">
                {scorePercentage >= 75 ? (
                  `${symbol} appears to be a strong investment opportunity with excellent fundamentals, attractive valuation, and solid growth prospects. The stock scores ${scorePercentage.toFixed(0)}/100 on our quality scale, suggesting it's worth buying for investors seeking ${sector ? `${sector} sector exposure` : 'growth'}.`
                ) : scorePercentage >= 60 ? (
                  `${symbol} is worth considering for your portfolio. With a ${scorePercentage.toFixed(0)}/100 quality score, it offers a balanced risk-reward profile. The stock shows ${revenueGrowth > 0.1 ? 'strong growth' : 'reasonable fundamentals'} and may fit well in a diversified portfolio.`
                ) : scorePercentage >= 40 ? (
                  `${symbol} presents a mixed picture. With a ${scorePercentage.toFixed(0)}/100 quality score, careful consideration is warranted. While there are ${revenueGrowth > 0 ? 'some positive aspects' : 'opportunities'}, investors should thoroughly research risks and ensure it aligns with their investment strategy.`
                ) : (
                  `${symbol} currently scores ${scorePercentage.toFixed(0)}/100 on our quality scale, suggesting caution. ${revenueGrowth < 0 ? 'Revenue headwinds and ' : ''}Valuation concerns may make this a challenging investment at current levels. Consider waiting for improved fundamentals or better entry points.`
                )}
              </p>
              <p className="text-muted-foreground mt-4">
                Remember: This analysis is based on current data and market conditions. Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Deep Dive into {symbol}</h2>
            <p className="text-muted-foreground mb-6">
              Access comprehensive financial analysis, quant models, and real-time data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
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
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Investment decisions should be based on your own research, financial situation, risk tolerance, and investment objectives. Consult a qualified financial advisor before making any investment decisions. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="worth-buying" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
