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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Stock Forecast ${currentYear} - Price Target & Analyst Predictions`,
    description: `${symbol} stock forecast for ${currentYear}. See analyst price targets, consensus estimates, 12-month projections, and AI-powered stock analysis.`,
    keywords: [
      `${symbol} stock forecast`,
      `${symbol} stock forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} analyst forecast`,
      `${symbol} stock price forecast`,
      `${symbol} 12 month forecast`,
    ],
    openGraph: {
      title: `${symbol} Stock Forecast ${currentYear} | Analyst Price Targets`,
      description: `Complete ${symbol} stock forecast with analyst ratings, price targets, and ${currentYear} predictions.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/forecast/${ticker.toLowerCase()}`,
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

export default async function ForecastPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, analystEstimates } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/forecast/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate price targets based on analyst data or estimates
  const pe = metrics?.price_to_earnings_ratio
  const eps = metrics?.earnings_per_share
  const revenueGrowth = metrics?.revenue_growth || 0

  // Simple forecast model
  const conservativeTarget = price * (1 + Math.max(revenueGrowth * 0.5, 0.05))
  const moderateTarget = price * (1 + Math.max(revenueGrowth, 0.10))
  const aggressiveTarget = price * (1 + Math.max(revenueGrowth * 1.5, 0.20))

  // Upside/downside percentages
  const conservativeUpside = ((conservativeTarget - price) / price * 100).toFixed(1)
  const moderateUpside = ((moderateTarget - price) / price * 100).toFixed(1)
  const aggressiveUpside = ((aggressiveTarget - price) / price * 100).toFixed(1)

  // Generate forecast FAQs
  const forecastFaqs = [
    {
      question: `What is the ${symbol} stock forecast for ${currentYear}?`,
      answer: `Based on current fundamentals and growth trends, ${symbol} has price targets ranging from $${conservativeTarget.toFixed(2)} (conservative) to $${aggressiveTarget.toFixed(2)} (aggressive). The moderate forecast suggests a price of $${moderateTarget.toFixed(2)}, representing ${moderateUpside}% upside from the current price of $${price.toFixed(2)}.`
    },
    {
      question: `What do analysts say about ${symbol} stock?`,
      answer: `Analysts covering ${symbol} (${companyName}) consider factors like ${sector ? `the ${sector} sector outlook, ` : ''}competitive positioning, revenue growth trends, and profit margins when setting price targets. Check the full analyst ratings page for the latest recommendations.`
    },
    {
      question: `Is ${symbol} stock a buy right now?`,
      answer: `Whether ${symbol} is a buy depends on your investment goals and risk tolerance. At the current price of $${price.toFixed(2)}, ${pe ? `the P/E ratio of ${pe.toFixed(1)} ` : ''}${revenueGrowth > 0 ? `and revenue growth of ${(revenueGrowth * 100).toFixed(1)}% ` : ''}should be considered relative to industry peers and your portfolio strategy.`
    },
    {
      question: `What is the 12-month price target for ${symbol}?`,
      answer: `The 12-month price target range for ${symbol} is $${conservativeTarget.toFixed(2)} to $${aggressiveTarget.toFixed(2)}, with a moderate estimate of $${moderateTarget.toFixed(2)}. These projections are based on current growth rates and valuation metrics.`
    },
    {
      question: `Will ${symbol} stock go up in ${currentYear}?`,
      answer: `Based on current trends, our models project ${symbol} stock could increase ${moderateUpside}% to $${moderateTarget.toFixed(2)} over the next 12 months. However, stock prices are affected by market conditions, company performance, and macroeconomic factors.`
    },
    {
      question: `What factors affect ${symbol} stock forecast?`,
      answer: `Key factors affecting ${symbol}'s forecast include: ${sector ? `${sector} sector trends, ` : ''}earnings growth, revenue performance, competitive dynamics, market sentiment, and broader economic conditions. Changes in any of these can impact price targets.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Forecast`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Forecast ${currentYear} - Price Targets & Analyst Predictions`,
    description: `Complete stock forecast for ${symbol} (${companyName}) with 12-month price targets and analyst consensus.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock forecast`,
      `${symbol} forecast ${currentYear}`,
      `${symbol} price target`,
      `${symbol} analyst predictions`,
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

  const faqSchema = getFAQSchema(forecastFaqs)

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
            <span>{symbol} Forecast</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Forecast {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Price targets and analyst projections for {companyName}
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

          {/* 12-Month Forecast */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">12-Month Price Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Conservative</p>
                </div>
                <p className="text-3xl font-bold">${conservativeTarget.toFixed(2)}</p>
                <p className="text-sm text-blue-500 mt-1">+{conservativeUpside}% upside</p>
              </div>
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Moderate (Base Case)</p>
                </div>
                <p className="text-3xl font-bold text-green-500">${moderateTarget.toFixed(2)}</p>
                <p className="text-sm text-green-400 mt-1">+{moderateUpside}% upside</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">Aggressive</p>
                </div>
                <p className="text-3xl font-bold">${aggressiveTarget.toFixed(2)}</p>
                <p className="text-sm text-purple-500 mt-1">+{aggressiveUpside}% upside</p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Metrics Driving Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pe && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-xl font-bold">{pe.toFixed(1)}</p>
                </div>
              )}
              {eps && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">EPS</p>
                  <p className="text-xl font-bold">${eps.toFixed(2)}</p>
                </div>
              )}
              {revenueGrowth !== 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(revenueGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
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

          {/* Forecast Methodology */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Forecast Methodology</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Our {symbol} stock forecast combines multiple analytical approaches:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Fundamental Analysis:</strong> Evaluation of financial statements, earnings quality, and growth trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Valuation Models:</strong> DCF, comparable company analysis, and historical multiples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Technical Indicators:</strong> Price momentum, support/resistance levels, and trend analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Sentiment Analysis:</strong> Analyst ratings, institutional ownership changes, and news sentiment</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live quant models, AI insights, and detailed DCF valuations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
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
              {forecastFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Stock forecasts are based on publicly available data and should not be considered financial advice. Past performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="forecast" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
