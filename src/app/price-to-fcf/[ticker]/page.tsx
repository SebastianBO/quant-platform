import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Price-to-FCF Ratio - Free Cash Flow Valuation`,
    description: `${symbol} price-to-free cash flow ratio analysis. Compare market cap to FCF generation. View P/FCF trends, cash flow metrics, and value analysis for ${symbol} stock.`,
    keywords: [
      `${symbol} price to FCF`,
      `${symbol} P/FCF ratio`,
      `${symbol} free cash flow`,
      `${symbol} FCF yield`,
      `${symbol} cash flow valuation`,
      `${symbol} price to free cash flow`,
    ],
    openGraph: {
      title: `${symbol} Price-to-FCF Ratio | Free Cash Flow Valuation`,
      description: `Comprehensive ${symbol} P/FCF ratio analysis with cash flow metrics and valuation.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price-to-fcf/${ticker.toLowerCase()}`,
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

export default async function PriceToFCFPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price-to-fcf/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const priceToCashFlow = snapshot.priceToCashFlow || 0
  const marketCap = snapshot.market_cap || 0

  const fcfFaqs = [
    {
      question: `What is ${symbol} price-to-FCF ratio?`,
      answer: `${symbol} has a P/FCF ratio of ${priceToCashFlow.toFixed(2)}x. This metric compares the company's market capitalization to its free cash flow, showing how much investors pay for each dollar of cash generated.`
    },
    {
      question: `Is ${symbol} P/FCF ratio good?`,
      answer: `Lower P/FCF ratios generally indicate better value. ${symbol}'s ratio of ${priceToCashFlow.toFixed(2)}x should be compared to industry peers. Ratios below 15-20 are often considered attractive.`
    },
    {
      question: `What is free cash flow?`,
      answer: `Free cash flow (FCF) is the cash a company generates after capital expenditures. It's calculated as Operating Cash Flow - Capital Expenditures, representing cash available for dividends, buybacks, or debt reduction.`
    },
    {
      question: `Why is P/FCF better than P/E?`,
      answer: `P/FCF uses actual cash generation rather than accounting earnings, making it harder to manipulate. It shows real cash available to shareholders and is often preferred by value investors for identifying true cash-generating businesses.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} P/FCF Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price-to-FCF Ratio - Free Cash Flow Valuation`,
      description: `P/FCF analysis for ${symbol} (${companyName}) with free cash flow metrics and valuation.`,
      url: pageUrl,
      keywords: [`${symbol} price to FCF`, `${symbol} P/FCF ratio`, `${symbol} free cash flow`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fcfFaqs),
  ]

  const fcfYield = priceToCashFlow > 0 ? (1 / priceToCashFlow) * 100 : 0

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} P/FCF Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price-to-FCF Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Free cash flow valuation analysis</p>

          {/* P/FCF Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">P/FCF Ratio</p>
                <p className="text-4xl font-bold">{priceToCashFlow.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">FCF Yield</p>
                <p className="text-3xl font-bold">{fcfYield.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is P/FCF */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Price-to-FCF Ratio?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The price-to-free cash flow (P/FCF) ratio compares a company's market capitalization to its free cash flow.
                Free cash flow is the cash remaining after the company pays for operations and capital expenditures.
              </p>
              <p className="text-muted-foreground">
                This metric is highly valued by investors because it measures actual cash generation rather than accounting profits.
                Cash can't be manipulated like earnings, making P/FCF a more reliable valuation tool.
              </p>
            </div>
          </section>

          {/* P/FCF Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Interpreting {symbol} P/FCF Ratio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 15x</div>
                <p className="font-bold mb-1">Strong Value</p>
                <p className="text-sm text-muted-foreground">Potentially undervalued with high FCF yield</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">15x - 25x</div>
                <p className="font-bold mb-1">Fair Valuation</p>
                <p className="text-sm text-muted-foreground">Reasonable for quality businesses</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-orange-500 text-2xl font-bold mb-2">&gt; 25x</div>
                <p className="font-bold mb-1">Premium Price</p>
                <p className="text-sm text-muted-foreground">High expectations for growth or low FCF</p>
              </div>
            </div>
          </section>

          {/* FCF vs Earnings */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Free Cash Flow Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Cash is King', desc: 'FCF represents actual cash, not accounting profits' },
                { title: 'Hard to Manipulate', desc: 'Cash flow is more objective than earnings' },
                { title: 'Shareholder Returns', desc: 'FCF funds dividends, buybacks, and debt reduction' },
                { title: 'Quality Signal', desc: 'Strong FCF indicates a healthy, sustainable business' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Cash Flow Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View operating cash flow, capex, and detailed FCF trends over time</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Cash Flow Statement
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fcfFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="price-to-fcf" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
