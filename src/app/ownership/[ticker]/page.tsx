import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Ownership - Institutional & Insider Holdings`,
    description: `${symbol} ownership data. See who owns ${symbol} stock - institutional investors, hedge funds, insiders. Track ownership changes and insider trading activity.`,
    keywords: [
      `${symbol} ownership`,
      `who owns ${symbol}`,
      `${symbol} institutional ownership`,
      `${symbol} insider ownership`,
      `${symbol} major shareholders`,
      `${symbol} stock ownership`,
      `${symbol} ownership breakdown`,
    ],
    openGraph: {
      title: `${symbol} Ownership | Institutional & Insider Holdings`,
      description: `Complete ownership data for ${symbol} stock. Track institutional investors and insider holdings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ownership/${ticker.toLowerCase()}`,
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

async function getInstitutionalData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/institutional?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getInsiderData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/insider-trades?ticker=${ticker}&limit=20`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.insider_trades || []
  } catch {
    return []
  }
}

function formatValue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toLocaleString()}`
}

function formatShares(shares: number): string {
  if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}B`
  if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
  if (shares >= 1e3) return `${(shares / 1e3).toFixed(2)}K`
  return shares.toLocaleString()
}

export default async function OwnershipPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, institutionalData, insiderTrades] = await Promise.all([
    getStockData(symbol),
    getInstitutionalData(symbol),
    getInsiderData(symbol)
  ])

  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ownership/${ticker.toLowerCase()}`

  // Process institutional data
  const holders = institutionalData?.holders || []
  const institutionalSummary = institutionalData?.summary || {}
  const topHolders = holders.slice(0, 15)

  // Calculate ownership percentages
  const institutionalOwnershipPercent = companyFacts?.institutionalOwnershipPercent ||
    (institutionalSummary.totalShares && companyFacts?.sharesOutstanding
      ? (institutionalSummary.totalShares / companyFacts.sharesOutstanding) * 100
      : null)

  const insiderOwnershipPercent = companyFacts?.insiderOwnershipPercent || null

  // Process insider trades
  const recentInsiderBuys = insiderTrades.filter((t: any) => (t.transaction_shares || 0) > 0).slice(0, 5)
  const recentInsiderSells = insiderTrades.filter((t: any) => (t.transaction_shares || 0) < 0).slice(0, 5)

  // Calculate insider activity metrics
  const totalInsiderBuyValue = recentInsiderBuys.reduce((sum: number, t: any) => sum + Math.abs(t.transaction_value || 0), 0)
  const totalInsiderSellValue = recentInsiderSells.reduce((sum: number, t: any) => sum + Math.abs(t.transaction_value || 0), 0)

  const ownershipFaqs = [
    {
      question: `Who owns ${symbol}?`,
      answer: `${symbol} (${companyName}) is owned by institutional investors (${institutionalOwnershipPercent ? `${institutionalOwnershipPercent.toFixed(1)}%` : 'multiple'}), company insiders (${insiderOwnershipPercent ? `${insiderOwnershipPercent.toFixed(1)}%` : 'various holdings'}), and retail investors. The largest institutional holders are disclosed in quarterly SEC 13F filings.`
    },
    {
      question: `What is ${symbol} institutional ownership?`,
      answer: institutionalOwnershipPercent
        ? `Institutional investors own approximately ${institutionalOwnershipPercent.toFixed(1)}% of ${symbol}. This includes hedge funds, mutual funds, pension funds, and other large investment firms.`
        : `${symbol} has significant institutional ownership from hedge funds, mutual funds, and investment firms. Check the holdings table above for detailed data.`
    },
    {
      question: `What is ${symbol} insider ownership?`,
      answer: insiderOwnershipPercent
        ? `Company insiders (executives, directors, and major shareholders) own approximately ${insiderOwnershipPercent.toFixed(1)}% of ${symbol} stock. Higher insider ownership often indicates management confidence in the company.`
        : `Company insiders hold shares of ${symbol}. Insider trading activity is tracked through SEC Form 4 filings.`
    },
    {
      question: `Are ${symbol} insiders buying or selling?`,
      answer: recentInsiderBuys.length > 0 || recentInsiderSells.length > 0
        ? `Recent insider activity shows ${recentInsiderBuys.length} buy transactions (${formatValue(totalInsiderBuyValue)}) and ${recentInsiderSells.length} sell transactions (${formatValue(totalInsiderSellValue)}). ${totalInsiderBuyValue > totalInsiderSellValue ? 'Insider buying exceeds selling, which could be a positive signal.' : totalInsiderSellValue > totalInsiderBuyValue ? 'Insider selling exceeds buying.' : 'Insider buying and selling are balanced.'}`
        : `Check the insider trading activity section above for the latest ${symbol} insider transactions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Ownership', url: `${SITE_URL}/institutional` },
      { name: `${symbol} Ownership`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Ownership - Institutional & Insider Holdings`,
      description: `Complete ownership data for ${symbol} (${companyName}). Track institutional investors, hedge funds, and insider holdings.`,
      url: pageUrl,
      keywords: [`${symbol} ownership`, `who owns ${symbol}`, `${symbol} institutional ownership`, `${symbol} insider ownership`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ownershipFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/institutional" className="hover:text-foreground">Institutional</Link>
            {' / '}
            <span>{symbol} Ownership</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Ownership</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Institutional & insider holdings</p>

          {/* Ownership Summary Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Ownership Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {institutionalOwnershipPercent !== null && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Institutional</p>
                  <p className="text-3xl font-bold text-purple-400">{institutionalOwnershipPercent.toFixed(1)}%</p>
                </div>
              )}
              {insiderOwnershipPercent !== null && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Insiders</p>
                  <p className="text-3xl font-bold text-blue-400">{insiderOwnershipPercent.toFixed(1)}%</p>
                </div>
              )}
              {holders.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Institutions</p>
                  <p className="text-3xl font-bold">{holders.length}+</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Top Institutional Holders */}
          {topHolders.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Top Institutional Holders</h2>
                <Link
                  href={`/institutional/${ticker.toLowerCase()}`}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  View All Holders →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground">Holder</th>
                      <th className="text-right p-3 text-muted-foreground">Shares</th>
                      <th className="text-right p-3 text-muted-foreground">Value</th>
                      <th className="text-right p-3 text-muted-foreground">% Owned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHolders.map((holder: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 font-medium">{holder.investor || holder.investor_name || holder.name}</td>
                        <td className="p-3 text-right">{formatShares(holder.shares || holder.shares_held || 0)}</td>
                        <td className="p-3 text-right">{formatValue(holder.value || holder.market_value || 0)}</td>
                        <td className="p-3 text-right">{((holder.percentOwnership || holder.ownership_percent || 0) * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Insider Trading Activity */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Insider Trading</h2>
              <Link
                href={`/insider/${ticker.toLowerCase()}`}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                View All Insider Trades →
              </Link>
            </div>

            {insiderTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insider Buys */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-green-500 mb-4 flex items-center gap-2">
                    <span className="text-2xl">↑</span>
                    Recent Buys ({recentInsiderBuys.length})
                  </h3>
                  {recentInsiderBuys.length > 0 ? (
                    <div className="space-y-3">
                      {recentInsiderBuys.map((trade: any, i: number) => (
                        <div key={i} className="pb-3 border-b border-border/50 last:border-0">
                          <p className="font-medium text-sm">{trade.name}</p>
                          <p className="text-xs text-muted-foreground">{trade.title || 'Insider'}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-green-500 text-sm">{formatShares(Math.abs(trade.transaction_shares))} shares</span>
                            <span className="text-sm">{formatValue(Math.abs(trade.transaction_value))}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{trade.transaction_date || trade.filing_date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent insider purchases</p>
                  )}
                </div>

                {/* Insider Sells */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-red-500 mb-4 flex items-center gap-2">
                    <span className="text-2xl">↓</span>
                    Recent Sells ({recentInsiderSells.length})
                  </h3>
                  {recentInsiderSells.length > 0 ? (
                    <div className="space-y-3">
                      {recentInsiderSells.map((trade: any, i: number) => (
                        <div key={i} className="pb-3 border-b border-border/50 last:border-0">
                          <p className="font-medium text-sm">{trade.name}</p>
                          <p className="text-xs text-muted-foreground">{trade.title || 'Insider'}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-red-500 text-sm">{formatShares(Math.abs(trade.transaction_shares))} shares</span>
                            <span className="text-sm">{formatValue(Math.abs(trade.transaction_value))}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{trade.transaction_date || trade.filing_date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent insider sales</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">Insider trading data for {symbol} is being updated.</p>
                <p className="text-sm text-muted-foreground mt-2">Insider trades are reported via SEC Form 4.</p>
              </div>
            )}
          </section>

          {/* Understanding Ownership */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Stock Ownership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-purple-500 mb-2">Institutional Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Large investors like hedge funds and mutual funds that manage $100M+ must disclose their holdings quarterly via 13F filings. High institutional ownership often indicates strong fundamentals.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Insider Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Company executives and directors must report their trades via SEC Form 4. Insider buying can signal confidence, while selling may occur for various reasons including diversification.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Why It Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Ownership structure reveals who believes in the company. Institutional investors conduct deep research, while insider buying shows internal confidence. Track ownership changes for investment signals.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-orange-500 mb-2">Data Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Institutional data from SEC 13F filings (quarterly), insider trades from Form 4 filings (within 2 business days), and company proxy statements (annual ownership disclosures).
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">AI insights, financials, valuation, and complete ownership tracking</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Complete Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ownershipFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="ownership" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
