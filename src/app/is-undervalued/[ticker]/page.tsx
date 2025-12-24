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
    title: `Is ${symbol} Stock Undervalued? - Value Analysis & Investment Opportunity`,
    description: `Is ${symbol} undervalued? Comprehensive value analysis using P/E, P/B, DCF, and other metrics to identify if ${symbol} stock is trading below fair value and represents a buying opportunity.`,
    keywords: [
      `is ${symbol} undervalued`,
      `${symbol} undervalued`,
      `${symbol} value analysis`,
      `${symbol} fair value`,
      `${symbol} cheap stock`,
      `${symbol} buying opportunity`,
    ],
    openGraph: {
      title: `Is ${symbol} Stock Undervalued? | Value Investment Analysis`,
      description: `Complete value analysis to determine if ${symbol} is undervalued and represents a buying opportunity.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/is-undervalued/${ticker.toLowerCase()}`,
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

export default async function IsUndervaluedPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/is-undervalued/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Valuation metrics
  const pe = metrics?.price_to_earnings_ratio || 0
  const pb = metrics?.price_to_book_ratio || 0
  const ps = metrics?.price_to_sales_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const pegRatio = pe && revenueGrowth ? pe / (revenueGrowth * 100) : 0

  // Industry averages (approximate benchmarks)
  const avgPE = 25
  const avgPB = 3
  const avgPS = 2.5

  // Undervaluation scoring (opposite of overvaluation)
  const peScore = pe > 0 ? (pe < avgPE * 0.7 ? 2 : pe < avgPE ? 1 : 0) : 0
  const pbScore = pb > 0 ? (pb < avgPB * 0.7 ? 2 : pb < avgPB ? 1 : 0) : 0
  const psScore = ps > 0 ? (ps < avgPS * 0.7 ? 2 : ps < avgPS ? 1 : 0) : 0
  const pegScore = pegRatio > 0 ? (pegRatio < 1 ? 2 : pegRatio < 1.5 ? 1 : 0) : 0

  const totalScore = peScore + pbScore + psScore + pegScore
  const maxScore = 8

  const undervaluedPercentage = (totalScore / maxScore) * 100
  const verdict = undervaluedPercentage > 60 ? 'Significantly Undervalued' :
                  undervaluedPercentage > 40 ? 'Moderately Undervalued' :
                  undervaluedPercentage > 20 ? 'Fairly Valued' : 'Not Undervalued'

  const potentialUpside = pe > 0 && pe < avgPE ? (((avgPE / pe) - 1) * 100) : 0

  // Generate FAQs
  const faqs = [
    {
      question: `Is ${symbol} stock undervalued?`,
      answer: `Based on current valuation metrics, ${symbol} appears to be ${verdict.toLowerCase()}. At $${price.toFixed(2)}, the stock trades at ${pe > 0 ? `a P/E ratio of ${pe.toFixed(1)}` : 'N/A P/E'}${pb > 0 ? ` and P/B ratio of ${pb.toFixed(1)}` : ''}. This represents a ${undervaluedPercentage.toFixed(0)}% value opportunity score on our analysis scale${potentialUpside > 0 ? `, with potential upside of ${potentialUpside.toFixed(0)}% to fair value` : ''}.`
    },
    {
      question: `What is ${symbol}'s fair value?`,
      answer: `Based on industry-average multiples, a fair value estimate for ${symbol} would be ${pe > 0 && pe < avgPE ? `approximately $${(price * (avgPE / pe)).toFixed(2)}` : `around current levels of $${price.toFixed(2)}`}. This assumes ${pe > 0 ? `a P/E ratio of ${avgPE}` : 'normalized earnings'} and current fundamental metrics.`
    },
    {
      question: `Why is ${symbol} stock cheap?`,
      answer: `${symbol} may appear cheap due to: ${pe < avgPE * 0.8 ? 'below-market P/E ratio, ' : ''}${revenueGrowth < 0 ? 'recent revenue challenges, ' : ''}market sentiment, sector rotation, or temporary business headwinds. ${undervaluedPercentage > 40 ? 'However, low valuations can sometimes indicate fundamental concerns that warrant investigation.' : 'The valuation appears reasonable given current fundamentals.'}`
    },
    {
      question: `Is ${symbol} a good value investment?`,
      answer: `${symbol} ${undervaluedPercentage > 40 ? 'shows characteristics of a potential value investment' : 'appears fairly valued'} with ${pe > 0 ? `a P/E of ${pe.toFixed(1)}` : 'current metrics'}. Value investors should also consider ${revenueGrowth > 0 ? `the ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}competitive moat, management quality, and industry dynamics before investing.`
    },
    {
      question: `What is ${symbol}'s upside potential?`,
      answer: `If ${symbol} were to trade at market-average multiples, the potential upside would be approximately ${potentialUpside > 0 ? `${potentialUpside.toFixed(0)}%` : 'limited from current levels'}. However, actual returns depend on execution, market conditions, and whether the company can grow into or exceed current valuations.`
    },
    {
      question: `Should I buy undervalued stocks like ${symbol}?`,
      answer: `Undervalued stocks can offer attractive returns if the market recognizes their true value. For ${symbol}, consider: the reason for undervaluation, financial health, growth prospects, and your risk tolerance. ${undervaluedPercentage > 50 ? 'The significant discount may warrant further investigation.' : 'Current valuations appear reasonable relative to fundamentals.'}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Is ${symbol} Undervalued`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Is ${symbol} Stock Undervalued? Value Investment Analysis`,
    description: `Comprehensive value analysis for ${symbol} (${companyName}) using P/E, P/B, P/S, and PEG ratios to identify investment opportunities.`,
    url: pageUrl,
    keywords: [
      `is ${symbol} undervalued`,
      `${symbol} value analysis`,
      `${symbol} fair value`,
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
            <span>Is {symbol} Undervalued</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            Is {symbol} Stock Undervalued?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Value investment analysis for {companyName}
          </p>

          {/* Verdict Card */}
          <div className={`${
            undervaluedPercentage > 60 ? 'bg-green-500/10 border-green-500/30' :
            undervaluedPercentage > 40 ? 'bg-blue-500/10 border-blue-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Value Assessment</p>
                <p className={`text-5xl font-bold ${
                  undervaluedPercentage > 60 ? 'text-green-500' :
                  undervaluedPercentage > 40 ? 'text-blue-500' :
                  'text-yellow-500'
                }`}>{verdict}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Value Opportunity Score: {undervaluedPercentage.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                {potentialUpside > 0 && (
                  <p className="text-sm text-green-500 mt-2">
                    Upside: +{potentialUpside.toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Valuation Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Value Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pe > 0 && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                      <p className="text-3xl font-bold">{pe.toFixed(1)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pe < avgPE * 0.7 ? 'bg-green-500/20 text-green-500' :
                      pe < avgPE ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {pe < avgPE * 0.7 ? 'Very Low' : pe < avgPE ? 'Below Avg' : 'Above Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pe < avgPE * 0.7 ? 'bg-green-500' :
                          pe < avgPE ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((pe / (avgPE * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span>Avg: {avgPE}</span>
                  </div>
                  {pe < avgPE && (
                    <p className="text-xs text-green-500 mt-2">
                      {((1 - pe / avgPE) * 100).toFixed(0)}% below market average
                    </p>
                  )}
                </div>
              )}

              {pb > 0 && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">P/B Ratio</p>
                      <p className="text-3xl font-bold">{pb.toFixed(1)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pb < avgPB * 0.7 ? 'bg-green-500/20 text-green-500' :
                      pb < avgPB ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {pb < avgPB * 0.7 ? 'Very Low' : pb < avgPB ? 'Below Avg' : 'Above Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pb < avgPB * 0.7 ? 'bg-green-500' :
                          pb < avgPB ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((pb / (avgPB * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span>Avg: {avgPB}</span>
                  </div>
                </div>
              )}

              {ps > 0 && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">P/S Ratio</p>
                      <p className="text-3xl font-bold">{ps.toFixed(1)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ps < avgPS * 0.7 ? 'bg-green-500/20 text-green-500' :
                      ps < avgPS ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {ps < avgPS * 0.7 ? 'Very Low' : ps < avgPS ? 'Below Avg' : 'Above Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ps < avgPS * 0.7 ? 'bg-green-500' :
                          ps < avgPS ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((ps / (avgPS * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span>Avg: {avgPS}</span>
                  </div>
                </div>
              )}

              {pegRatio > 0 && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">PEG Ratio</p>
                      <p className="text-3xl font-bold">{pegRatio.toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pegRatio < 1 ? 'bg-green-500/20 text-green-500' :
                      pegRatio < 1.5 ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {pegRatio < 1 ? 'Undervalued' : pegRatio < 1.5 ? 'Fair' : 'Expensive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pegRatio < 1 ? 'Attractive growth-adjusted valuation' : 'PEG below 1.0 typically indicates undervaluation'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Value Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Value Investment Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Based on comprehensive value screening metrics:
              </p>
              <ul className="space-y-3">
                {pe > 0 && pe < avgPE && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-muted-foreground">
                      <strong>Discounted P/E:</strong> Trading at {pe.toFixed(1)} vs market average of {avgPE}, representing a {((1 - pe / avgPE) * 100).toFixed(0)}% discount.
                    </span>
                  </li>
                )}
                {pb > 0 && pb < avgPB && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-muted-foreground">
                      <strong>Below-Market P/B:</strong> Price-to-book ratio of {pb.toFixed(1)} is below the typical market multiple.
                    </span>
                  </li>
                )}
                {pegRatio > 0 && pegRatio < 1 && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-muted-foreground">
                      <strong>Attractive PEG:</strong> At {pegRatio.toFixed(2)}, the stock appears undervalued relative to its growth rate.
                    </span>
                  </li>
                )}
                {revenueGrowth > 0.1 && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-muted-foreground">
                      <strong>Strong Growth:</strong> Revenue growing at {(revenueGrowth * 100).toFixed(1)}% adds to the value proposition.
                    </span>
                  </li>
                )}
                {undervaluedPercentage < 30 && (
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500">⚠</span>
                    <span className="text-muted-foreground">
                      <strong>Fair Valuation:</strong> Current metrics suggest the stock is reasonably priced rather than significantly undervalued.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Deep Dive Value Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">
              Access DCF models, Graham value formula, and comprehensive fundamental analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/valuation/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                DCF Valuation
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
            <p><strong>Disclaimer:</strong> This value analysis is for informational purposes only. Low valuations may reflect fundamental business challenges. Always conduct thorough due diligence and consider consulting a financial advisor before making investment decisions. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="is-undervalued" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
