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
    title: `${symbol} Buybacks - Share Repurchase Program & Analysis`,
    description: `${symbol} stock buyback data and share repurchase program analysis. View historical buyback activity, authorization amounts, and impact on shareholder value.`,
    keywords: [
      `${symbol} buybacks`,
      `${symbol} share repurchase`,
      `${symbol} buyback program`,
      `${symbol} stock repurchase`,
      `${symbol} share buyback`,
      `${symbol} buyback analysis`,
    ],
    openGraph: {
      title: `${symbol} Buybacks | Share Repurchase Program Analysis`,
      description: `Comprehensive ${symbol} buyback analysis with historical repurchase data and shareholder value impact.`,
      type: 'article',
      url: `https://lician.com/buybacks/${ticker.toLowerCase()}`,
      images: [{
        url: `https://lician.com/api/og/stock/${ticker.toLowerCase()}`,
        width: 1200,
        height: 630,
        alt: `${symbol} Buyback Analysis`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Buybacks`,
      description: `Comprehensive ${symbol} buyback analysis with historical repurchase data and shareholder value impact.`,
      images: [`https://lician.com/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `https://lician.com/buybacks/${ticker.toLowerCase()}`,
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

export default async function BuybacksPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/buybacks/${ticker.toLowerCase()}`
  const marketCap = snapshot.market_cap || 0

  const faqs = [
    {
      question: `Does ${symbol} have a share buyback program?`,
      answer: `Check ${symbol}'s recent earnings reports and 8-K filings for announcements of share repurchase authorizations. Companies typically announce buyback programs during earnings calls or special press releases. The authorization amount and timeframe are usually disclosed.`
    },
    {
      question: `How do buybacks benefit ${symbol} shareholders?`,
      answer: `Share buybacks reduce ${symbol}'s outstanding share count, potentially increasing earnings per share (EPS) and book value per share. Buybacks can also signal management confidence in the company's value and return excess cash to shareholders in a tax-efficient manner.`
    },
    {
      question: `Are ${symbol} buybacks better than dividends?`,
      answer: `Buybacks offer tax advantages over dividends for shareholders. With ${symbol} buybacks, shareholders only pay taxes when they sell shares (capital gains), while dividends are taxed immediately. However, dividends provide consistent income, while buybacks are discretionary.`
    },
    {
      question: `How much has ${symbol} spent on buybacks?`,
      answer: `Review ${symbol}'s cash flow statements under "Financing Activities" to see actual share repurchase expenditures. This shows how much capital the company has deployed for buybacks each quarter. Authorization amounts may differ from actual spend.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Buybacks`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Buybacks - Share Repurchase Program Analysis`,
      description: `Comprehensive buyback analysis for ${symbol} (${companyName}) with repurchase program details.`,
      url: pageUrl,
      keywords: [`${symbol} buybacks`, `${symbol} share repurchase`, `${symbol} buyback program`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-[#868f97] mb-6 flex items-center gap-2">
            <Link
              href="/"
              className="text-[#479ffa] hover:text-[#479ffa]/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#479ffa]/50 focus:ring-offset-2 focus:ring-offset-black rounded px-1"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/dashboard"
              className="text-[#479ffa] hover:text-[#479ffa]/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#479ffa]/50 focus:ring-offset-2 focus:ring-offset-black rounded px-1"
            >
              Stock Analysis
            </Link>
            <span>/</span>
            <span className="text-white">{symbol} Buybacks</span>
          </nav>

          {/* Page Header */}
          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Share Buybacks</h1>
          <p className="text-xl text-[#868f97] mb-8 text-balance">
            {companyName} - Repurchase program & shareholder value analysis
          </p>

          {/* Key Metrics Card - Glassmorphism */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8 hover:bg-white/[0.07] transition-all duration-300">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold tabular-nums">
                  ${(marketCap / 1000000000).toFixed(2)}B
                </p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold tabular-nums">
                  ${snapshot.price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold tabular-nums ${
                  snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'
                }`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Buyback Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding Share Buybacks</h2>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 mb-6 hover:bg-white/[0.07] transition-all duration-300">
              <p className="text-[#868f97] leading-relaxed">
                Share buybacks, also called share repurchases, occur when {symbol} uses cash to buy back its own stock from
                the market. This reduces the number of outstanding shares and can increase the value of remaining shares.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Reduced Share Count', desc: 'Fewer shares outstanding increases ownership percentage for remaining shareholders' },
                { title: 'EPS Boost', desc: 'Same earnings divided by fewer shares results in higher earnings per share' },
                { title: 'Capital Allocation', desc: 'Signals confidence when management buys back stock at current prices' },
                { title: 'Tax Efficiency', desc: 'More tax-efficient than dividends for many shareholders' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 group"
                >
                  <p className="font-bold mb-2 text-balance group-hover:text-white transition-colors duration-200">
                    {item.title}
                  </p>
                  <p className="text-sm text-[#868f97] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Buyback Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key Buyback Metrics to Monitor</h2>
            <div className="space-y-4">
              {[
                { metric: 'Authorization Amount', desc: 'Total dollar amount or share count approved by board of directors for repurchase' },
                { metric: 'Actual Spend', desc: 'Cash deployed for buybacks each quarter shown in cash flow statements' },
                { metric: 'Average Price Paid', desc: 'Indicates whether management is buying at favorable prices' },
                { metric: 'Completion Rate', desc: 'Percentage of authorization actually executed over time' },
                { metric: 'Share Count Reduction', desc: 'Net decrease in outstanding shares after buybacks' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 group"
                >
                  <h3 className="font-bold text-lg mb-2 text-balance group-hover:text-white transition-colors duration-200">
                    {item.metric}
                  </h3>
                  <p className="text-[#868f97] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA - Success Color Theme */}
          <section className="bg-[#4ebe96]/10 backdrop-blur-sm p-8 rounded-xl border border-[#4ebe96]/30 text-center mb-12 hover:bg-[#4ebe96]/[0.15] hover:border-[#4ebe96]/40 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-balance">View Cash Flow Analysis</h2>
            <p className="text-[#868f97] mb-6 text-balance">
              See detailed share repurchase activity in financial statements
            </p>
            <Link
              href={`/cash-flow/${symbol.toLowerCase()}`}
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 active:bg-[#4ebe96]/80 text-black px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ebe96] focus:ring-offset-2 focus:ring-offset-black shadow-lg shadow-[#4ebe96]/20 hover:shadow-xl hover:shadow-[#4ebe96]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              View Cash Flow Statement
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 group"
                >
                  <h3 className="font-bold text-lg mb-2 text-balance group-hover:text-white transition-colors duration-200">
                    {faq.question}
                  </h3>
                  <p className="text-[#868f97] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="buybacks" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
