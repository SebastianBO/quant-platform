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
    title: `Should I Buy or Sell ${symbol} Stock? - Expert Analysis & Recommendation`,
    description: `Buy or sell ${symbol}? Get data-driven analysis, technical signals, valuation metrics, and expert recommendations to help decide if you should buy or sell ${symbol} stock.`,
    keywords: [
      `should I buy or sell ${symbol}`,
      `${symbol} buy or sell`,
      `${symbol} stock recommendation`,
      `is ${symbol} a buy or sell`,
      `${symbol} stock decision`,
      `${symbol} investment decision`,
    ],
    openGraph: {
      title: `Should I Buy or Sell ${symbol} Stock? | Expert Analysis`,
      description: `Data-driven buy or sell recommendation for ${symbol} with technical analysis, valuation metrics, and market signals.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/buy-or-sell/${ticker.toLowerCase()}`,
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

export default async function BuyOrSellPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/buy-or-sell/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Decision signals
  const pe = metrics?.price_to_earnings_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const priceChange = snapshot.day_change_percent || 0
  const weekChange = snapshot.week_52_change_percent || 0

  // Simple scoring system
  const valuationScore = pe > 0 && pe < 25 ? 1 : pe >= 25 && pe < 40 ? 0 : -1
  const growthScore = revenueGrowth > 0.15 ? 1 : revenueGrowth > 0.05 ? 0 : -1
  const momentumScore = priceChange > 2 ? 1 : priceChange > -2 ? 0 : -1
  const totalScore = valuationScore + growthScore + momentumScore

  const recommendation = totalScore > 1 ? 'BUY' : totalScore < 0 ? 'SELL' : 'HOLD'
  const confidence = Math.abs(totalScore) === 3 ? 'High' : Math.abs(totalScore) >= 1 ? 'Medium' : 'Low'

  // Generate FAQs
  const faqs = [
    {
      question: `Should I buy or sell ${symbol} stock right now?`,
      answer: `Based on current analysis, ${symbol} is rated as a ${recommendation} with ${confidence.toLowerCase()} confidence. The current price is $${price.toFixed(2)}, with ${pe > 0 ? `a P/E ratio of ${pe.toFixed(1)} and ` : ''}revenue growth of ${(revenueGrowth * 100).toFixed(1)}%. Consider your investment goals and risk tolerance before making a decision.`
    },
    {
      question: `What are the buy signals for ${symbol}?`,
      answer: `Key buy signals for ${symbol} include: ${revenueGrowth > 0.1 ? 'strong revenue growth, ' : ''}${pe > 0 && pe < 25 ? 'attractive valuation, ' : ''}${priceChange > 0 ? 'positive price momentum, ' : ''}and ${sector ? `favorable ${sector} sector trends` : 'industry positioning'}. Always verify with your own research.`
    },
    {
      question: `What are the sell signals for ${symbol}?`,
      answer: `Potential sell signals include: ${pe > 40 ? 'high valuation concerns, ' : ''}${revenueGrowth < 0 ? 'negative revenue growth, ' : ''}${priceChange < -5 ? 'significant price decline, ' : ''}and market conditions. Monitor these factors closely for changes.`
    },
    {
      question: `Is ${symbol} stock overvalued or undervalued?`,
      answer: `At a current price of $${price.toFixed(2)}${pe > 0 ? ` and P/E ratio of ${pe.toFixed(1)}` : ''}, ${symbol} appears ${valuationScore > 0 ? 'reasonably valued' : valuationScore < 0 ? 'potentially overvalued' : 'fairly valued'} compared to historical metrics and industry peers.`
    },
    {
      question: `What is the best time to buy ${symbol} stock?`,
      answer: `The best time to buy ${symbol} depends on your investment strategy. Value investors may look for pullbacks, while growth investors focus on momentum. Current technical indicators and valuation metrics should be considered alongside your personal financial goals.`
    },
    {
      question: `How do I know when to sell ${symbol}?`,
      answer: `Consider selling ${symbol} when: your target price is reached, fundamentals deteriorate significantly, better opportunities arise, or your investment thesis changes. Set clear criteria before investing to avoid emotional decisions.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Buy or Sell`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Should I Buy or Sell ${symbol} Stock? Expert Analysis`,
    description: `Data-driven buy or sell recommendation for ${symbol} (${companyName}) with technical analysis and valuation metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} buy or sell`,
      `${symbol} recommendation`,
      `${symbol} stock decision`,
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
            <span>{symbol} Buy or Sell</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            Should I Buy or Sell {symbol}?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Data-driven recommendation for {companyName}
          </p>

          {/* Recommendation Card */}
          <div className={`${
            recommendation === 'BUY' ? 'bg-green-500/10 border-green-500/30' :
            recommendation === 'SELL' ? 'bg-red-500/10 border-red-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Current Recommendation</p>
                <p className={`text-5xl font-bold ${
                  recommendation === 'BUY' ? 'text-green-500' :
                  recommendation === 'SELL' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>{recommendation}</p>
                <p className="text-sm text-muted-foreground mt-2">Confidence: {confidence}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                <p className={`text-xl mt-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Decision Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Decision Factors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Valuation</p>
                  <span className={`w-3 h-3 rounded-full ${
                    valuationScore > 0 ? 'bg-green-500' :
                    valuationScore < 0 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                </div>
                {pe > 0 ? (
                  <>
                    <p className="text-2xl font-bold">{pe.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-1">P/E Ratio</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Growth</p>
                  <span className={`w-3 h-3 rounded-full ${
                    growthScore > 0 ? 'bg-green-500' :
                    growthScore < 0 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                </div>
                <p className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Revenue Growth</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Momentum</p>
                  <span className={`w-3 h-3 rounded-full ${
                    momentumScore > 0 ? 'bg-green-500' :
                    momentumScore < 0 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                </div>
                <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Day Change</p>
              </div>
            </div>
          </section>

          {/* Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Detailed Analysis</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Reasons to Buy</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {revenueGrowth > 0.1 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Strong revenue growth of {(revenueGrowth * 100).toFixed(1)}% indicates business expansion</span>
                    </li>
                  )}
                  {pe > 0 && pe < 25 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Attractive P/E ratio of {pe.toFixed(1)} suggests reasonable valuation</span>
                    </li>
                  )}
                  {priceChange > 2 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Positive price momentum with {priceChange.toFixed(2)}% gain today</span>
                    </li>
                  )}
                  {sector && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Positioned in the {sector} sector</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Reasons to Sell/Avoid</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {pe > 40 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>High P/E ratio of {pe.toFixed(1)} may indicate overvaluation</span>
                    </li>
                  )}
                  {revenueGrowth < 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Negative revenue growth of {(revenueGrowth * 100).toFixed(1)}% raises concerns</span>
                    </li>
                  )}
                  {priceChange < -5 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Significant price decline of {priceChange.toFixed(2)}% today</span>
                    </li>
                  )}
                  {weekChange < -20 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Down {Math.abs(weekChange).toFixed(1)}% over 52 weeks shows weakness</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed financial metrics, quant models, and AI-powered insights
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
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Investment decisions should be based on your own research, financial situation, and consultation with a qualified financial advisor. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="buy-or-sell" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
