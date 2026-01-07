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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `Is ${symbol} Stock Overvalued? - Valuation Analysis & Metrics`,
    description: `Is ${symbol} overvalued? Comprehensive valuation analysis using P/E ratio, PEG ratio, price-to-sales, and other key metrics to determine if ${symbol} stock is trading above fair value.`,
    keywords: [
      `is ${symbol} overvalued`,
      `${symbol} overvalued`,
      `${symbol} valuation analysis`,
      `${symbol} fair value`,
      `${symbol} expensive`,
      `${symbol} stock price high`,
    ],
    openGraph: {
      title: `Is ${symbol} Stock Overvalued? | Valuation Analysis`,
      description: `Complete valuation analysis to determine if ${symbol} is overvalued using P/E, PEG, and other key metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/is-overvalued/${ticker.toLowerCase()}`,
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

export default async function IsOvervaluedPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/is-overvalued/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Valuation metrics
  const pe = metrics?.price_to_earnings_ratio || 0
  const pb = metrics?.price_to_book_ratio || 0
  const ps = metrics?.price_to_sales_ratio || 0
  const pegRatio = pe && metrics?.revenue_growth ? pe / (metrics.revenue_growth * 100) : 0

  // Industry averages (approximate benchmarks)
  const avgPE = 25
  const avgPB = 3
  const avgPS = 2.5

  // Overvaluation scoring
  const peScore = pe > 0 ? (pe > avgPE * 1.5 ? 2 : pe > avgPE ? 1 : 0) : 0
  const pbScore = pb > 0 ? (pb > avgPB * 1.5 ? 2 : pb > avgPB ? 1 : 0) : 0
  const psScore = ps > 0 ? (ps > avgPS * 1.5 ? 2 : ps > avgPS ? 1 : 0) : 0
  const pegScore = pegRatio > 0 ? (pegRatio > 2 ? 2 : pegRatio > 1.5 ? 1 : 0) : 0

  const totalScore = peScore + pbScore + psScore + pegScore
  const maxScore = 8

  const overvaluedPercentage = (totalScore / maxScore) * 100
  const verdict = overvaluedPercentage > 60 ? 'Likely Overvalued' :
                  overvaluedPercentage > 40 ? 'Moderately Overvalued' :
                  overvaluedPercentage > 20 ? 'Fairly Valued' : 'Not Overvalued'

  // Generate FAQs
  const faqs = [
    {
      question: `Is ${symbol} stock overvalued?`,
      answer: `Based on current valuation metrics, ${symbol} appears to be ${verdict.toLowerCase()}. At $${price.toFixed(2)}, the stock trades at ${pe > 0 ? `a P/E ratio of ${pe.toFixed(1)}` : 'N/A P/E'}${pb > 0 ? ` and P/B ratio of ${pb.toFixed(1)}` : ''}. This represents a ${overvaluedPercentage.toFixed(0)}% overvaluation score on our analysis scale.`
    },
    {
      question: `What is ${symbol}'s P/E ratio?`,
      answer: `${symbol} currently has a P/E ratio of ${pe > 0 ? pe.toFixed(1) : 'N/A'}${pe > avgPE ? `, which is above the market average of ${avgPE}, suggesting potential overvaluation` : pe > 0 ? `, which is below the market average of ${avgPE}` : ''}. The P/E ratio compares the stock price to earnings per share.`
    },
    {
      question: `How does ${symbol}'s valuation compare to the market?`,
      answer: `${symbol}'s valuation metrics compared to market averages: P/E ratio ${pe > 0 ? `${pe.toFixed(1)} vs ${avgPE}` : 'N/A'}, P/B ratio ${pb > 0 ? `${pb.toFixed(1)} vs ${avgPB}` : 'N/A'}, and P/S ratio ${ps > 0 ? `${ps.toFixed(1)} vs ${avgPS}` : 'N/A'}. ${peScore + pbScore + psScore > 3 ? 'Multiple metrics suggest elevated valuation levels.' : 'Overall metrics appear reasonable relative to the market.'}`
    },
    {
      question: `What is a fair price for ${symbol} stock?`,
      answer: `Based on current fundamentals and average industry multiples, a fair value estimate for ${symbol} would be ${pe > avgPE ? `approximately $${(price * (avgPE / pe)).toFixed(2)}` : `around current levels of $${price.toFixed(2)}`}. However, growth prospects and competitive advantages may justify premium valuations.`
    },
    {
      question: `Should I wait to buy ${symbol} if it's overvalued?`,
      answer: `If ${symbol} is overvalued, waiting for a price correction could provide a better entry point. However, high-quality companies can remain overvalued for extended periods. Consider dollar-cost averaging or waiting for pullbacks if you believe in the long-term investment thesis.`
    },
    {
      question: `What makes a stock overvalued?`,
      answer: `A stock is considered overvalued when its price exceeds its intrinsic value based on fundamentals. Key indicators include: high P/E ratios, elevated price-to-book ratios, rich price-to-sales multiples, and PEG ratios above 2. For ${symbol}, ${totalScore > 4 ? 'multiple metrics suggest overvaluation' : 'valuations appear reasonable'}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Is ${symbol} Overvalued`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Is ${symbol} Stock Overvalued? Valuation Analysis`,
    description: `Comprehensive valuation analysis for ${symbol} (${companyName}) using P/E, P/B, P/S, and PEG ratios.`,
    url: pageUrl,
    keywords: [
      `is ${symbol} overvalued`,
      `${symbol} valuation`,
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
            <span>Is {symbol} Overvalued</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            Is {symbol} Stock Overvalued?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive valuation analysis for {companyName}
          </p>

          {/* Verdict Card */}
          <div className={`${
            overvaluedPercentage > 60 ? 'bg-red-500/10 border-red-500/30' :
            overvaluedPercentage > 40 ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-green-500/10 border-green-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Valuation Assessment</p>
                <p className={`text-5xl font-bold ${
                  overvaluedPercentage > 60 ? 'text-red-500' :
                  overvaluedPercentage > 40 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>{verdict}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Overvaluation Score: {overvaluedPercentage.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
                {pe > avgPE && pe > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Fair Value: ~${(price * (avgPE / pe)).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Valuation Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Valuation Metrics Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pe > 0 && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                      <p className="text-3xl font-bold">{pe.toFixed(1)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pe > avgPE * 1.5 ? 'bg-red-500/20 text-red-500' :
                      pe > avgPE ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {pe > avgPE * 1.5 ? 'High' : pe > avgPE ? 'Above Avg' : 'Below Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pe > avgPE * 1.5 ? 'bg-red-500' :
                          pe > avgPE ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((pe / (avgPE * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span>Avg: {avgPE}</span>
                  </div>
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
                      pb > avgPB * 1.5 ? 'bg-red-500/20 text-red-500' :
                      pb > avgPB ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {pb > avgPB * 1.5 ? 'High' : pb > avgPB ? 'Above Avg' : 'Below Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pb > avgPB * 1.5 ? 'bg-red-500' :
                          pb > avgPB ? 'bg-yellow-500' : 'bg-green-500'
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
                      ps > avgPS * 1.5 ? 'bg-red-500/20 text-red-500' :
                      ps > avgPS ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {ps > avgPS * 1.5 ? 'High' : ps > avgPS ? 'Above Avg' : 'Below Avg'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ps > avgPS * 1.5 ? 'bg-red-500' :
                          ps > avgPS ? 'bg-yellow-500' : 'bg-green-500'
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
                      pegRatio > 2 ? 'bg-red-500/20 text-red-500' :
                      pegRatio > 1.5 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {pegRatio > 2 ? 'High' : pegRatio > 1.5 ? 'Fair' : 'Attractive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PEG below 1.0 is generally considered undervalued
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Valuation Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Based on comprehensive analysis of multiple valuation metrics:
              </p>
              <ul className="space-y-3">
                {pe > 0 && (
                  <li className="flex items-start gap-3">
                    <span className={`${pe > avgPE * 1.5 ? 'text-red-500' : pe > avgPE ? 'text-yellow-500' : 'text-green-500'}`}>
                      {pe > avgPE ? '⚠' : '✓'}
                    </span>
                    <span className="text-muted-foreground">
                      <strong>P/E Ratio:</strong> At {pe.toFixed(1)}, {symbol} trades at {
                        pe > avgPE * 1.5 ? `a premium ${((pe / avgPE - 1) * 100).toFixed(0)}% above market average` :
                        pe > avgPE ? `${((pe / avgPE - 1) * 100).toFixed(0)}% above market average` :
                        `${((1 - pe / avgPE) * 100).toFixed(0)}% below market average`
                      }.
                    </span>
                  </li>
                )}
                {pb > 0 && (
                  <li className="flex items-start gap-3">
                    <span className={`${pb > avgPB * 1.5 ? 'text-red-500' : pb > avgPB ? 'text-yellow-500' : 'text-green-500'}`}>
                      {pb > avgPB ? '⚠' : '✓'}
                    </span>
                    <span className="text-muted-foreground">
                      <strong>P/B Ratio:</strong> The price-to-book ratio of {pb.toFixed(1)} is {
                        pb > avgPB ? 'above' : 'below'
                      } the typical market multiple of {avgPB}.
                    </span>
                  </li>
                )}
                {pegRatio > 0 && (
                  <li className="flex items-start gap-3">
                    <span className={`${pegRatio > 2 ? 'text-red-500' : pegRatio > 1.5 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {pegRatio > 1.5 ? '⚠' : '✓'}
                    </span>
                    <span className="text-muted-foreground">
                      <strong>PEG Ratio:</strong> At {pegRatio.toFixed(2)}, the stock is {
                        pegRatio > 2 ? 'expensive relative to growth' :
                        pegRatio > 1 ? 'fairly valued for its growth rate' :
                        'attractively priced for its growth potential'
                      }.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Valuation Report for {symbol}</h2>
            <p className="text-muted-foreground mb-6">
              Get detailed DCF analysis, peer comparisons, and AI-powered valuation insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/valuation/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Valuation Report
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
            <p><strong>Disclaimer:</strong> This valuation analysis is for informational purposes only. Valuation metrics should be considered alongside growth prospects, competitive advantages, and market conditions. This is not financial advice. Consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="is-overvalued" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
