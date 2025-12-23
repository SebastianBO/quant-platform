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
    title: `${symbol} Institutional Ownership - Hedge Fund & Mutual Fund Holdings`,
    description: `${symbol} institutional ownership data. See which hedge funds, mutual funds, and institutions own ${symbol} stock. Track 13F filings and ownership changes.`,
    keywords: [
      `${symbol} institutional ownership`,
      `${symbol} hedge fund ownership`,
      `${symbol} mutual fund holdings`,
      `who owns ${symbol}`,
      `${symbol} 13f filings`,
      `${symbol} institutional holders`,
    ],
    openGraph: {
      title: `${symbol} Institutional Ownership | Hedge Fund Holdings`,
      description: `Track institutional ownership of ${symbol} stock. See hedge fund and mutual fund positions.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/institutional/${ticker.toLowerCase()}`,
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

function formatValue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

export default async function InstitutionalPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, institutionalData] = await Promise.all([
    getStockData(symbol),
    getInstitutionalData(symbol)
  ])

  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/institutional/${ticker.toLowerCase()}`

  const holders = institutionalData?.holders || institutionalData?.institutional_holders || []
  const totalInstitutionalOwnership = companyFacts?.institutionalOwnershipPercent ||
    holders.reduce((sum: number, h: any) => sum + (h.ownership_percent || 0), 0)

  const topHolders = holders.slice(0, 15)
  const totalValue = holders.reduce((sum: number, h: any) => sum + (h.market_value || h.value || 0), 0)

  const institutionalFaqs = [
    {
      question: `What is ${symbol} institutional ownership?`,
      answer: totalInstitutionalOwnership
        ? `Approximately ${(totalInstitutionalOwnership * 100).toFixed(1)}% of ${symbol} (${companyName}) shares are held by institutional investors including hedge funds, mutual funds, pension funds, and other large investment firms.`
        : `${symbol} is owned by various institutional investors. Check the holdings table above for detailed ownership data.`
    },
    {
      question: `Which hedge funds own ${symbol}?`,
      answer: topHolders.length > 0
        ? `Top institutional holders of ${symbol} include ${topHolders.slice(0, 3).map((h: any) => h.investor_name || h.holder_name || h.name).join(', ')}. These positions are disclosed in quarterly 13F filings.`
        : `Hedge fund holdings are disclosed in quarterly 13F filings with the SEC.`
    },
    {
      question: `Is ${symbol} owned by mutual funds?`,
      answer: `Yes, ${symbol} is held by numerous mutual funds and ETFs. Large asset managers like Vanguard, BlackRock, and Fidelity typically hold significant positions in major stocks like ${symbol}.`
    },
    {
      question: `How do I track ${symbol} institutional ownership?`,
      answer: `Institutional ownership is disclosed quarterly through SEC 13F filings. This page tracks the latest available data on ${symbol} institutional holders and ownership changes.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Institutional', url: `${SITE_URL}/institutional` },
      { name: `${symbol} Ownership`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Institutional Ownership - Hedge Fund & Mutual Fund Holdings`,
      description: `Institutional ownership data for ${symbol} (${companyName}). Track hedge fund and mutual fund positions.`,
      url: pageUrl,
      keywords: [`${symbol} institutional ownership`, `${symbol} hedge funds`, `who owns ${symbol}`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(institutionalFaqs),
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
            <span>{symbol}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Institutional Ownership</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Hedge fund & mutual fund holdings</p>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {totalInstitutionalOwnership > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Institutional Ownership</p>
                  <p className="text-3xl font-bold">{(totalInstitutionalOwnership * 100).toFixed(1)}%</p>
                </div>
              )}
              {holders.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Institutional Holders</p>
                  <p className="text-3xl font-bold">{holders.length}+</p>
                </div>
              )}
              {totalValue > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Value Held</p>
                  <p className="text-3xl font-bold">{formatValue(totalValue)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Top Holders Table */}
          {topHolders.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Top Institutional Holders</h2>
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
                        <td className="p-3 font-medium">{holder.investor_name || holder.holder_name || holder.name}</td>
                        <td className="p-3 text-right">{(holder.shares || holder.shares_held || 0).toLocaleString()}</td>
                        <td className="p-3 text-right">{formatValue(holder.market_value || holder.value || 0)}</td>
                        <td className="p-3 text-right">{((holder.ownership_percent || 0) * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {holders.length === 0 && (
            <div className="bg-card p-8 rounded-lg border border-border text-center mb-12">
              <p className="text-muted-foreground">Institutional ownership data for {symbol} is being updated.</p>
              <p className="text-sm text-muted-foreground mt-2">13F filings are released quarterly.</p>
            </div>
          )}

          {/* Ownership Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Institutional Ownership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Why It Matters</h3>
                <p className="text-sm text-muted-foreground">High institutional ownership often indicates strong fundamentals and liquidity. Institutions conduct deep research before investing.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Data Source</h3>
                <p className="text-sm text-muted-foreground">Institutional holdings are from SEC 13F filings, required quarterly for institutions managing $100M+.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">AI insights, financials, and insider trading data</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {institutionalFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
