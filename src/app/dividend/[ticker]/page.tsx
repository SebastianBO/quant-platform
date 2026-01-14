import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { DividendCalculator } from '@/components/calculators'
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
    title: `${symbol} Dividend ${currentYear} - Yield, History & Ex-Dividend Date`,
    description: `${symbol} dividend information: current yield, dividend history, ex-dividend dates, payout ratio, and dividend growth. Is ${symbol} a good dividend stock?`,
    keywords: [
      `${symbol} dividend`,
      `${symbol} dividend yield`,
      `${symbol} dividend history`,
      `${symbol} ex dividend date`,
      `${symbol} dividend payout`,
      `does ${symbol} pay dividends`,
    ],
    openGraph: {
      title: `${symbol} Dividend Yield & History | Ex-Dividend Date`,
      description: `Complete ${symbol} dividend analysis with yield, payment history, and upcoming ex-dividend dates.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dividend/${ticker.toLowerCase()}`,
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

export default async function DividendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/dividend/${ticker.toLowerCase()}`

  const dividendYield = metrics?.dividend_yield || companyFacts?.dividend_yield
  const payoutRatio = metrics?.payout_ratio
  const dividendPerShare = metrics?.dividends_per_common_share || companyFacts?.dividendShare
  const exDividendDate = companyFacts?.exDividendDate
  const dividendGrowthRate = metrics?.dividend_growth_rate || 0.05

  const paysDividend = dividendYield && dividendYield > 0

  const dividendFaqs = [
    {
      question: `Does ${symbol} pay a dividend?`,
      answer: paysDividend
        ? `Yes, ${symbol} (${companyName}) pays a dividend. The current dividend yield is ${(dividendYield * 100).toFixed(2)}%${dividendPerShare ? `, with an annual dividend of $${dividendPerShare.toFixed(2)} per share` : ''}.`
        : `${symbol} (${companyName}) does not currently pay a regular dividend. The company may be reinvesting profits into growth or may not have established a dividend policy.`
    },
    {
      question: `What is ${symbol} dividend yield?`,
      answer: paysDividend
        ? `${symbol}'s current dividend yield is ${(dividendYield * 100).toFixed(2)}%. This means for every $100 invested in ${symbol} stock, you would receive approximately $${(dividendYield * 100).toFixed(2)} in annual dividend income at current prices.`
        : `${symbol} does not currently have a dividend yield as the company does not pay dividends.`
    },
    {
      question: `When is ${symbol} ex-dividend date?`,
      answer: exDividendDate
        ? `${symbol}'s most recent ex-dividend date was ${exDividendDate}. To receive the dividend, you must own shares before the ex-dividend date.`
        : `Check ${symbol}'s investor relations page for the latest ex-dividend date information.`
    },
    {
      question: `Is ${symbol} dividend safe?`,
      answer: paysDividend && payoutRatio
        ? `${symbol}'s payout ratio is ${(payoutRatio * 100).toFixed(1)}%. ${payoutRatio < 0.6 ? 'A payout ratio under 60% suggests the dividend is well-covered by earnings.' : payoutRatio < 0.8 ? 'The payout ratio is moderate, suggesting reasonable dividend coverage.' : 'A high payout ratio may indicate limited room for dividend growth.'}`
        : `Analyze ${symbol}'s earnings, cash flow, and payout ratio to assess dividend safety.`
    },
    {
      question: `How often does ${symbol} pay dividends?`,
      answer: paysDividend
        ? `Most US companies like ${symbol} pay dividends quarterly (4 times per year). Check the company's dividend history for the exact payment schedule.`
        : `${symbol} does not currently pay dividends.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dividends', url: `${SITE_URL}/dividends` },
      { name: `${symbol} Dividend`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Dividend ${currentYear} - Yield, History & Payment Schedule`,
      description: `Complete dividend analysis for ${symbol} including yield, payout ratio, and ex-dividend dates.`,
      url: pageUrl,
      keywords: [`${symbol} dividend`, `${symbol} dividend yield`, `${symbol} ex dividend`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(dividendFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dividends" className="hover:text-foreground">Dividends</Link>
            {' / '}
            <span>{symbol} Dividend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Dividend {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} dividend yield, history & ex-dividend date</p>

          {/* Dividend Overview */}
          <div className={`p-8 rounded-xl border mb-8 ${paysDividend ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30' : 'bg-card border-border'}`}>
            {paysDividend ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Dividend Yield</p>
                  <p className="text-3xl font-bold text-green-500">{(dividendYield * 100).toFixed(2)}%</p>
                </div>
                {dividendPerShare && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Annual Dividend</p>
                    <p className="text-3xl font-bold">${dividendPerShare.toFixed(2)}</p>
                  </div>
                )}
                {payoutRatio && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Payout Ratio</p>
                    <p className="text-3xl font-bold">{(payoutRatio * 100).toFixed(1)}%</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} Does Not Pay Dividends</p>
                <p className="text-muted-foreground">This company currently reinvests profits rather than distributing them as dividends.</p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          {paysDividend && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Dividend Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exDividendDate && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Ex-Dividend Date</p>
                    <p className="text-lg font-bold">{exDividendDate}</p>
                  </div>
                )}
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Payment Frequency</p>
                  <p className="text-lg font-bold">Quarterly</p>
                </div>
                {dividendPerShare && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Quarterly Payment</p>
                    <p className="text-lg font-bold">${(dividendPerShare / 4).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Interactive Dividend Income Calculator */}
          <section className="mb-12">
            <Suspense fallback={
              <div className="bg-card p-8 rounded-lg border border-border animate-pulse">
                <div className="h-8 bg-secondary/50 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-secondary/30 rounded"></div>
              </div>
            }>
              <DividendCalculator
                ticker={symbol}
                companyName={companyName}
                currentPrice={snapshot.price || 0}
                dividendYield={dividendYield || 0}
                annualDividend={dividendPerShare}
                payoutFrequency="quarterly"
                dividendGrowthRate={dividendGrowthRate}
              />
            </Suspense>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">View financials, valuation, and AI-powered insights</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/analysis/${symbol.toLowerCase()}/dividend`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Dividend Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {dividendFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Top Dividend Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['JNJ', 'PG', 'KO', 'PEP', 'VZ', 'T', 'XOM', 'CVX', 'ABBV', 'MO']
                .filter(s => s !== symbol)
                .map(stock => (
                  <Link key={stock} href={`/dividend/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Dividend
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
