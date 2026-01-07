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
    title: `${symbol} Book Value Per Share - Net Asset Value Analysis`,
    description: `${symbol} book value per share analysis. View net asset value, shareholder equity, and book value trends. Compare market price to book value for ${symbol} stock.`,
    keywords: [
      `${symbol} book value`,
      `${symbol} book value per share`,
      `${symbol} net asset value`,
      `${symbol} BVPS`,
      `${symbol} shareholder equity`,
      `${symbol} tangible book value`,
    ],
    openGraph: {
      title: `${symbol} Book Value Per Share | Net Asset Value Analysis`,
      description: `Comprehensive ${symbol} book value analysis with asset metrics and equity valuation.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/book-value/${ticker.toLowerCase()}`,
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

export default async function BookValuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/book-value/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const pbRatio = snapshot.priceToBook || 0
  const bookValue = pbRatio > 0 ? price / pbRatio : 0

  const bookValueFaqs = [
    {
      question: `What is ${symbol} book value per share?`,
      answer: `${symbol} has a book value per share of $${bookValue.toFixed(2)}. This represents the net asset value per share if the company were liquidated today, calculated as (Total Assets - Total Liabilities) / Outstanding Shares.`
    },
    {
      question: `How does ${symbol} price compare to book value?`,
      answer: `${symbol} is currently trading at $${price.toFixed(2)}, which is ${pbRatio.toFixed(2)}x its book value. A ratio above 1.0 means the stock trades at a premium to its net assets.`
    },
    {
      question: `What is tangible book value?`,
      answer: `Tangible book value excludes intangible assets like goodwill and patents, providing a more conservative measure of a company's net worth. It's calculated as (Total Assets - Intangible Assets - Total Liabilities) / Shares Outstanding.`
    },
    {
      question: `Why is book value important for investors?`,
      answer: `Book value provides a baseline valuation for a company based on its net assets. It's particularly useful for asset-heavy industries like banking, manufacturing, and real estate, where tangible assets represent significant value.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Book Value`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Book Value Per Share - Net Asset Value Analysis`,
      description: `Book value analysis for ${symbol} (${companyName}) with asset metrics and equity valuation.`,
      url: pageUrl,
      keywords: [`${symbol} book value`, `${symbol} BVPS`, `${symbol} net asset value`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(bookValueFaqs),
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
            <span>{symbol} Book Value</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Book Value Per Share</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Net asset value and shareholder equity analysis</p>

          {/* Book Value Card */}
          <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 p-8 rounded-xl border border-teal-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Book Value/Share</p>
                <p className="text-4xl font-bold">${bookValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Price/Book</p>
                <p className="text-3xl font-bold">{pbRatio.toFixed(2)}x</p>
              </div>
            </div>
          </div>

          {/* What is Book Value */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Book Value Per Share?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Book value per share (BVPS) represents the per-share value of a company's equity if all assets were liquidated
                and all debts paid. It's calculated by dividing shareholder equity by the number of outstanding shares.
              </p>
              <p className="text-muted-foreground">
                This metric provides a fundamental baseline for a stock's value based on the company's balance sheet,
                independent of market sentiment or earnings potential.
              </p>
            </div>
          </section>

          {/* Book Value Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Book Value</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-3xl mb-3">+</div>
                <p className="font-bold mb-1">Total Assets</p>
                <p className="text-sm text-muted-foreground">Cash, inventory, property, equipment, and other assets owned by the company</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-red-500 text-3xl mb-3">-</div>
                <p className="font-bold mb-1">Total Liabilities</p>
                <p className="text-sm text-muted-foreground">Debt, accounts payable, and other obligations owed by the company</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-blue-500 text-3xl mb-3">=</div>
                <p className="font-bold mb-1">Shareholder Equity</p>
                <p className="text-sm text-muted-foreground">Net worth of the company available to shareholders</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-purple-500 text-3xl mb-3">÷</div>
                <p className="font-bold mb-1">Outstanding Shares</p>
                <p className="text-sm text-muted-foreground">Divided by shares to get per-share book value</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Detailed Asset Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive balance sheet data, asset breakdown, and equity trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {bookValueFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="book-value" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
