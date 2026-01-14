import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} EV/EBITDA Ratio - Enterprise Value Multiple Analysis`,
    description: `${symbol} EV/EBITDA ratio analysis. Compare enterprise value to EBITDA earnings. View EV/EBITDA trends, industry benchmarks, and valuation multiples for ${symbol} stock.`,
    keywords: [
      `${symbol} EV/EBITDA`,
      `${symbol} EV to EBITDA`,
      `${symbol} enterprise multiple`,
      `${symbol} EBITDA multiple`,
      `${symbol} EV/EBITDA ratio`,
      `${symbol} valuation multiple`,
    ],
    openGraph: {
      title: `${symbol} EV/EBITDA Ratio | Enterprise Value Multiple Analysis`,
      description: `Comprehensive ${symbol} EV/EBITDA analysis with earnings multiples and industry comparison.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ev-ebitda/${ticker.toLowerCase()}`,
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

export default async function EVEBITDAPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ev-ebitda/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const evEbitda = snapshot.evToEbitda || 0
  const enterpriseValue = snapshot.enterpriseValue || 0

  const evEbitdaFaqs = [
    {
      question: `What is ${symbol} EV/EBITDA ratio?`,
      answer: `${symbol} has an EV/EBITDA ratio of ${evEbitda.toFixed(2)}x. This metric divides enterprise value by EBITDA to show how many years of EBITDA it would take to pay off the company's total value.`
    },
    {
      question: `Is ${symbol} EV/EBITDA good?`,
      answer: `Generally, an EV/EBITDA below 10 suggests reasonable valuation, though this varies by industry. ${symbol}'s ratio of ${evEbitda.toFixed(2)}x should be compared to industry peers and historical averages.`
    },
    {
      question: `Why use EV/EBITDA instead of P/E?`,
      answer: `EV/EBITDA is capital-structure neutral (accounts for debt), excludes non-cash expenses (D&A), and works for companies with different tax rates. It's superior for comparing firms with varying leverage and depreciation.`
    },
    {
      question: `What is a good EV/EBITDA ratio?`,
      answer: `Ratios of 8-12x are typical for mature companies, while high-growth sectors may trade at 15-25x. Lower ratios generally indicate better value, but growth prospects and industry dynamics matter significantly.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} EV/EBITDA`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} EV/EBITDA Ratio - Enterprise Value Multiple Analysis`,
      description: `EV/EBITDA analysis for ${symbol} (${companyName}) with earnings multiples and valuation.`,
      url: pageUrl,
      keywords: [`${symbol} EV/EBITDA`, `${symbol} enterprise multiple`, `${symbol} EBITDA multiple`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(evEbitdaFaqs),
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
            <span>{symbol} EV/EBITDA</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} EV/EBITDA Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Enterprise value to EBITDA multiple analysis</p>

          {/* EV/EBITDA Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">EV/EBITDA</p>
                <p className="text-4xl font-bold">{evEbitda.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Enterprise Value</p>
                <p className="text-3xl font-bold">${(enterpriseValue / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is EV/EBITDA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is EV/EBITDA?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                EV/EBITDA (Enterprise Value to Earnings Before Interest, Taxes, Depreciation, and Amortization) is a valuation
                multiple that compares a company's total value to its operating earnings.
              </p>
              <p className="text-muted-foreground">
                This ratio is preferred by many analysts because it's capital-structure neutral (accounts for debt),
                eliminates accounting differences from depreciation, and provides a clearer view of operating performance.
              </p>
            </div>
          </section>

          {/* EV/EBITDA Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EV/EBITDA Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 10x</div>
                <p className="font-bold mb-1">Attractive Valuation</p>
                <p className="text-sm text-muted-foreground">May indicate value opportunity or distress</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">10x - 15x</div>
                <p className="font-bold mb-1">Fair Valuation</p>
                <p className="text-sm text-muted-foreground">Typical range for established companies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-orange-500 text-2xl font-bold mb-2">&gt; 15x</div>
                <p className="font-bold mb-1">Premium Valuation</p>
                <p className="text-sm text-muted-foreground">High growth expectations or sector premium</p>
              </div>
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why EV/EBITDA is Powerful</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Capital Structure Neutral', desc: 'Accounts for both equity and debt financing' },
                { title: 'Cross-Border Comparisons', desc: 'Eliminates tax rate differences between countries' },
                { title: 'Operating Focus', desc: 'Excludes non-operating items like D&A' },
                { title: 'M&A Standard', desc: 'Industry standard for acquisition valuations' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full EBITDA Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View detailed EBITDA trends, margins, and comprehensive valuation metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View EBITDA Details
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evEbitdaFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="ev-ebitda" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
