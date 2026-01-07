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
    title: `${symbol} Price-to-Sales Ratio (P/S) - Revenue Valuation Analysis`,
    description: `${symbol} price-to-sales (P/S) ratio analysis. Compare market cap to revenue. View P/S trends, industry benchmarks, and revenue multiple analysis for ${symbol} stock.`,
    keywords: [
      `${symbol} price to sales`,
      `${symbol} P/S ratio`,
      `${symbol} revenue multiple`,
      `${symbol} sales multiple`,
      `${symbol} P/S analysis`,
      `${symbol} price to sales ratio`,
    ],
    openGraph: {
      title: `${symbol} Price-to-Sales Ratio | Revenue Valuation Analysis`,
      description: `Comprehensive ${symbol} P/S ratio analysis with revenue metrics and industry comparison.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price-to-sales/${ticker.toLowerCase()}`,
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

export default async function PriceToSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price-to-sales/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const psRatio = snapshot.priceToSales || 0
  const marketCap = snapshot.market_cap || 0

  const psFaqs = [
    {
      question: `What is ${symbol} price-to-sales ratio?`,
      answer: `${symbol} has a P/S ratio of ${psRatio.toFixed(2)}. The price-to-sales ratio divides market capitalization by total revenue to show how much investors pay per dollar of sales.`
    },
    {
      question: `Is ${symbol} P/S ratio good?`,
      answer: `A lower P/S ratio generally indicates better value, but the ideal ratio varies by industry. ${symbol}'s P/S of ${psRatio.toFixed(2)} should be compared to industry peers for proper assessment.`
    },
    {
      question: `How is price-to-sales ratio calculated?`,
      answer: `P/S ratio = Market Capitalization / Total Revenue. It can also be calculated as Stock Price / Revenue Per Share. This metric is especially useful for evaluating companies with no earnings.`
    },
    {
      question: `What is a good P/S ratio?`,
      answer: `Generally, a P/S ratio below 2.0 is considered attractive, though this varies by industry. High-growth tech companies often have higher P/S ratios (5-10+), while mature industries trade at lower multiples.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} P/S Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price-to-Sales Ratio - Revenue Valuation Analysis`,
      description: `P/S ratio analysis for ${symbol} (${companyName}) with revenue metrics and valuation.`,
      url: pageUrl,
      keywords: [`${symbol} price to sales`, `${symbol} P/S ratio`, `${symbol} revenue multiple`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(psFaqs),
  ]

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
            <span>{symbol} P/S Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price-to-Sales Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Revenue multiple valuation analysis</p>

          {/* P/S Ratio Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">P/S Ratio</p>
                <p className="text-4xl font-bold">{psRatio.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold">${(marketCap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is P/S Ratio */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Price-to-Sales Ratio?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The price-to-sales (P/S) ratio measures a company's stock price relative to its revenue. It shows how many dollars
                investors are willing to pay for each dollar of sales, making it useful for valuing unprofitable companies.
              </p>
              <p className="text-muted-foreground">
                Unlike P/E ratio, P/S ratio can be used even when a company has no earnings, making it valuable for growth stocks
                and companies in turnaround situations.
              </p>
            </div>
          </section>

          {/* P/S Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">P/S Ratio Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 2.0</div>
                <p className="font-bold mb-1">Attractive Value</p>
                <p className="text-sm text-muted-foreground">Generally indicates good value relative to sales</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">2.0 - 5.0</div>
                <p className="font-bold mb-1">Moderate Valuation</p>
                <p className="text-sm text-muted-foreground">Common for established companies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-orange-500 text-2xl font-bold mb-2">&gt; 5.0</div>
                <p className="font-bold mb-1">Premium Valuation</p>
                <p className="text-sm text-muted-foreground">Often seen in high-growth sectors like tech</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Revenue Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">Get detailed revenue metrics, growth trends, and comprehensive valuation analysis</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Revenue Details
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {psFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="price-to-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
