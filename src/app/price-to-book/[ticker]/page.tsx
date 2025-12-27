import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Price-to-Book Ratio (P/B) - Book Value Analysis`,
    description: `${symbol} price-to-book (P/B) ratio analysis. Compare market price to book value. View P/B trends, asset valuation, and value investment metrics for ${symbol} stock.`,
    keywords: [
      `${symbol} price to book`,
      `${symbol} P/B ratio`,
      `${symbol} book value`,
      `${symbol} P/B analysis`,
      `${symbol} asset value`,
      `${symbol} price to book ratio`,
    ],
    openGraph: {
      title: `${symbol} Price-to-Book Ratio | Book Value Analysis`,
      description: `Comprehensive ${symbol} P/B ratio analysis with book value metrics and asset valuation.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price-to-book/${ticker.toLowerCase()}`,
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

export default async function PriceToBookPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price-to-book/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const pbRatio = snapshot.priceToBook || 0

  const pbFaqs = [
    {
      question: `What is ${symbol} price-to-book ratio?`,
      answer: `${symbol} has a P/B ratio of ${pbRatio.toFixed(2)}. The price-to-book ratio compares a stock's market price to its book value per share, indicating how much investors pay for each dollar of net assets.`
    },
    {
      question: `Is ${symbol} P/B ratio good?`,
      answer: `A P/B ratio below 1.0 may indicate undervaluation, as the stock trades below its book value. ${symbol}'s P/B of ${pbRatio.toFixed(2)} should be compared to industry peers and the company's historical average.`
    },
    {
      question: `How is price-to-book ratio calculated?`,
      answer: `P/B ratio = Market Price per Share / Book Value per Share. Book value is calculated as (Total Assets - Total Liabilities) / Shares Outstanding.`
    },
    {
      question: `What does P/B ratio tell investors?`,
      answer: `P/B ratio helps value investors identify potentially undervalued stocks. It's particularly useful for asset-heavy companies like banks, manufacturers, and real estate firms where book value closely reflects market value.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} P/B Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price-to-Book Ratio - Book Value Analysis`,
      description: `P/B ratio analysis for ${symbol} (${companyName}) with book value metrics and asset valuation.`,
      url: pageUrl,
      keywords: [`${symbol} price to book`, `${symbol} P/B ratio`, `${symbol} book value`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(pbFaqs),
    getTableSchema({
      name: `${symbol} Price to Book History`,
      description: `Historical Price to Book data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Price to Book', 'Change'],
      rowCount: 5,
    }),
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
            <span>{symbol} P/B Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price-to-Book Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Book value and asset valuation analysis</p>

          {/* P/B Ratio Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">P/B Ratio</p>
                <p className="text-4xl font-bold">{pbRatio.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Book Value/Share</p>
                <p className="text-3xl font-bold">${(price / pbRatio).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is P/B Ratio */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Price-to-Book Ratio?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The price-to-book (P/B) ratio compares a company's market capitalization to its book value (net assets).
                It shows how much investors are paying for each dollar of the company's net assets.
              </p>
              <p className="text-muted-foreground">
                Book value represents the accounting value of a company's assets minus liabilities. A low P/B ratio may indicate
                the stock is undervalued, while a high P/B suggests investors expect strong future growth or intangible value.
              </p>
            </div>
          </section>

          {/* P/B Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Interpreting {symbol} P/B Ratio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 1.0</div>
                <p className="font-bold mb-1">Potential Undervaluation</p>
                <p className="text-sm text-muted-foreground">Trading below book value may indicate bargain</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">1.0 - 3.0</div>
                <p className="font-bold mb-1">Fair Valuation</p>
                <p className="text-sm text-muted-foreground">Typical range for most companies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-orange-500 text-2xl font-bold mb-2">&gt; 3.0</div>
                <p className="font-bold mb-1">Premium Valuation</p>
                <p className="text-sm text-muted-foreground">Common for growth stocks with intangible assets</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Balance Sheet Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View detailed asset breakdown, liability analysis, and shareholder equity</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Balance Sheet
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pbFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="price-to-book" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
