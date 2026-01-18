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
    title: `${symbol} GMV - Gross Merchandise Value Analysis & Trends`,
    description: `${symbol} gross merchandise value (GMV) analysis with trends, growth rates, and marketplace volume metrics. Understand ${symbol}'s total transaction volume.`,
    keywords: [
      `${symbol} GMV`,
      `${symbol} gross merchandise value`,
      `${symbol} marketplace volume`,
      `${symbol} transaction volume`,
      `${symbol} GMV growth`,
      `${symbol} marketplace metrics`,
    ],
    openGraph: {
      title: `${symbol} GMV | Gross Merchandise Value & Marketplace Metrics`,
      description: `Comprehensive GMV analysis for ${symbol} with marketplace volume trends and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gmv/${ticker.toLowerCase()}`,
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

export default async function GMVPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gmv/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const gmvFaqs = [
    {
      question: `What is ${symbol} GMV?`,
      answer: `${symbol} GMV (Gross Merchandise Value) represents the total value of all transactions processed through ${companyName}'s marketplace platform over a specific period. It measures the total dollar value of goods sold, regardless of ${symbol}'s revenue take rate.`
    },
    {
      question: `How is GMV different from revenue for ${symbol}?`,
      answer: `GMV for ${symbol} measures the total value of all marketplace transactions, while revenue represents only the portion ${companyName} keeps (commission, fees, etc.). For example, if a $100 item sells and ${symbol} takes a 15% commission, GMV is $100 but revenue is $15.`
    },
    {
      question: `Why is GMV important for ${symbol}?`,
      answer: `GMV is a key metric for ${companyName} because it shows the total marketplace activity and scale. Growing GMV indicates increasing platform usage and can lead to higher revenue. Investors track GMV growth to understand ${symbol}'s marketplace health and competitive position.`
    },
    {
      question: `What drives ${symbol} GMV growth?`,
      answer: `${symbol} GMV growth is driven by: more active buyers and sellers on the platform, higher average order values, increased transaction frequency, geographic expansion, and new product categories. Platform improvements and marketing can also boost GMV.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} GMV`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} GMV - Gross Merchandise Value Analysis & Trends`,
      description: `Comprehensive GMV analysis for ${symbol} (${companyName}) with marketplace volume trends and growth metrics.`,
      url: pageUrl,
      keywords: [`${symbol} GMV`, `${symbol} gross merchandise value`, `${symbol} marketplace volume`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(gmvFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:rounded">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:rounded">Marketplace Metrics</Link>
            {' / '}
            <span>{symbol} GMV</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Gross Merchandise Value (GMV)</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Total marketplace transaction volume & trends</p>

          {/* Price Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-[#868f97] text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold tabular-nums">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-[#868f97] text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold tabular-nums">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* GMV Overview */}
          <section className="mb-12">
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2 text-balance">GMV Analysis</h2>
              <p className="text-[#868f97] mb-6">Track {symbol}'s gross merchandise value, marketplace volume trends, and transaction growth metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                View Full Marketplace Metrics
              </Link>
            </div>
          </section>

          {/* GMV Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key GMV Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total GMV', desc: 'Gross merchandise value' },
                { name: 'GMV Growth Rate', desc: 'YoY GMV change' },
                { name: 'GMV per Active User', desc: 'Average transaction value' },
                { name: 'Take Rate', desc: 'Revenue as % of GMV' },
                { name: 'GMV by Category', desc: 'Transaction volume breakdown' },
                { name: 'GMV by Geography', desc: 'Regional marketplace activity' },
              ].map((metric, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-[#868f97]">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What GMV Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">What GMV Tells You</h2>
            <div className="space-y-3">
              {[
                'Growing GMV indicates increasing marketplace scale and user engagement',
                'GMV growth faster than revenue growth may signal declining take rates or competitive pressure',
                'GMV is a leading indicator of future revenue potential for marketplace businesses',
                'Investors compare GMV across marketplace competitors to assess market share and growth',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[#4ebe96] text-lg">✓</span>
                  <p className="text-[#868f97]">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <h2 className="text-2xl font-bold mb-4 text-balance">Complete Marketplace Analysis</h2>
            <p className="text-[#868f97] mb-6">Get AI-powered analysis of {symbol} GMV trends and marketplace performance</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              Analyze {symbol} Marketplace
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {gmvFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="gmv" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
