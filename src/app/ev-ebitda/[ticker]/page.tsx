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
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Stocks</Link>
            {' / '}
            <span>{symbol} EV/EBITDA</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} EV/EBITDA Ratio</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Enterprise value to EBITDA multiple analysis</p>

          {/* EV/EBITDA Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">EV/EBITDA</p>
                <p className="text-4xl font-bold tabular-nums">{evEbitda.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Enterprise Value</p>
                <p className="text-3xl font-bold tabular-nums">${(enterpriseValue / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is EV/EBITDA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">What is EV/EBITDA?</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-[#868f97] mb-4">
                EV/EBITDA (Enterprise Value to Earnings Before Interest, Taxes, Depreciation, and Amortization) is a valuation
                multiple that compares a company's total value to its operating earnings.
              </p>
              <p className="text-[#868f97]">
                This ratio is preferred by many analysts because it's capital-structure neutral (accounts for debt),
                eliminates accounting differences from depreciation, and provides a clearer view of operating performance.
              </p>
            </div>
          </section>

          {/* EV/EBITDA Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">EV/EBITDA Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-[#4ebe96] text-2xl font-bold mb-2 tabular-nums">&lt; 10x</div>
                <p className="font-bold mb-1">Attractive Valuation</p>
                <p className="text-sm text-[#868f97]">May indicate value opportunity or distress</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-[#ffa16c] text-2xl font-bold mb-2 tabular-nums">10x - 15x</div>
                <p className="font-bold mb-1">Fair Valuation</p>
                <p className="text-sm text-[#868f97]">Typical range for established companies</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="text-[#ffa16c] text-2xl font-bold mb-2 tabular-nums">&gt; 15x</div>
                <p className="font-bold mb-1">Premium Valuation</p>
                <p className="text-sm text-[#868f97]">High growth expectations or sector premium</p>
              </div>
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Why EV/EBITDA is Powerful</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Capital Structure Neutral', desc: 'Accounts for both equity and debt financing' },
                { title: 'Cross-Border Comparisons', desc: 'Eliminates tax rate differences between countries' },
                { title: 'Operating Focus', desc: 'Excludes non-operating items like D&A' },
                { title: 'M&A Standard', desc: 'Industry standard for acquisition valuations' },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-[#868f97]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Full EBITDA Analysis for {symbol}</h2>
            <p className="text-[#868f97] mb-6">View detailed EBITDA trends, margins, and comprehensive valuation metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none">
              View EBITDA Details
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evEbitdaFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
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
