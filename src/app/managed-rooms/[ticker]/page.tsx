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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Managed vs Owned Rooms ${currentYear} - Asset Strategy Analysis`,
    description: `${symbol} room ownership analysis: managed vs owned vs franchised breakdown, asset-light strategy, capital efficiency, and business model for hotel investors.`,
    keywords: [
      `${symbol} managed rooms`,
      `${symbol} owned rooms`,
      `${symbol} franchised rooms`,
      `${symbol} asset-light`,
      `${symbol} business model`,
      `${symbol} capital strategy`,
      `${symbol} room ownership`,
    ],
    openGraph: {
      title: `${symbol} Managed vs Owned Rooms - Asset Strategy Analysis`,
      description: `Complete ${symbol} asset strategy analysis with owned, managed, and franchised room breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/managed-rooms/${ticker.toLowerCase()}`,
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

export default async function ManagedRoomsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/managed-rooms/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Room ownership metrics would come from API - using placeholders
  const totalRooms = metrics?.room_count || null
  const ownedRooms = metrics?.owned_rooms || null
  const managedRooms = metrics?.managed_rooms || null
  const franchisedRooms = metrics?.franchised_rooms || null

  const ownedPercentage = ownedRooms && totalRooms ? (ownedRooms / totalRooms) * 100 : null
  const managedPercentage = managedRooms && totalRooms ? (managedRooms / totalRooms) * 100 : null
  const franchisedPercentage = franchisedRooms && totalRooms ? (franchisedRooms / totalRooms) * 100 : null

  const hasBreakdown = totalRooms && (ownedRooms || managedRooms || franchisedRooms)

  const assetFaqs = [
    {
      question: `What is ${symbol} room ownership breakdown?`,
      answer: hasBreakdown
        ? `${symbol} (${companyName}) operates ${totalRooms.toLocaleString()} total rooms${ownedPercentage ? ` with ${ownedPercentage.toFixed(1)}% owned` : ''}${managedPercentage ? `, ${managedPercentage.toFixed(1)}% managed` : ''}${franchisedPercentage ? `, and ${franchisedPercentage.toFixed(1)}% franchised` : ''}. The room ownership mix determines capital requirements, returns, risk profile, and valuation multiples.`
        : `${symbol} (${companyName}) room ownership data is currently unavailable. The mix of owned, managed, and franchised rooms is critical for understanding business model and returns.`
    },
    {
      question: `What is the difference between owned, managed, and franchised hotels?`,
      answer: `Owned hotels: Company owns the real estate and operates the hotel (capital-intensive, full revenue). Managed hotels: Third-party owns the asset, company manages operations for a fee (fee revenue, no capital). Franchised hotels: Third-party owns and operates, company licenses the brand for royalties (highest margins, minimal capital). ${symbol}'s mix determines capital allocation and returns.`
    },
    {
      question: `Why do hotel companies prefer asset-light models?`,
      answer: `Asset-light (managed/franchised) models offer: (1) 60-80% margins vs. 20-30% for owned hotels, (2) Minimal capital requirements and property risk, (3) Faster, scalable growth without capital constraints, (4) Higher returns on invested capital (ROIC), (5) Premium valuation multiples (20-30x vs. 10-15x for asset-heavy). ${symbol}'s shift to asset-light drives valuation.`
    },
    {
      question: `Is ${symbol} becoming more asset-light?`,
      answer: ownedPercentage
        ? `${symbol} owned rooms represent ${ownedPercentage.toFixed(1)}% of its portfolio. Leading hotel companies target 10-30% owned (primarily flagship properties) with 70-90% managed/franchised. Companies migrating to asset-light models typically sell owned hotels, use proceeds for buybacks/dividends, and focus on fee-based growth.`
        : `Track ${symbol}'s room mix over time. Decreasing owned percentage and increasing managed/franchised rooms indicates asset-light transformation, which typically drives multiple expansion and shareholder value.`
    },
    {
      question: `What are the risks of each business model?`,
      answer: `Owned hotels: Capital-intensive, cyclical, property risk, lower returns. Managed hotels: Moderate risk, vulnerable to contract terminations, moderate returns. Franchised hotels: Minimal capital risk, brand reputation risk, quality control challenges, highest margins. ${symbol}'s mix balances growth, returns, and risk.`
    },
    {
      question: `Why does room ownership mix matter for investors?`,
      answer: `Room ownership determines: (1) Capital allocation and balance sheet intensity, (2) ROIC and profit margins (asset-light = higher), (3) Growth potential and scalability, (4) Cyclicality and economic sensitivity, (5) Valuation multiples (asset-light earns premium multiples). ${symbol} investors should track the mix and strategic shift toward higher-return, fee-based models.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Hotel Business Models', url: `${SITE_URL}/learn/hotel-business-models` },
      { name: `${symbol} Asset Strategy`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Managed vs Owned Rooms ${currentYear} - Asset Strategy Analysis`,
      description: `Complete asset strategy analysis for ${symbol} including owned, managed, and franchised room breakdown.`,
      url: pageUrl,
      keywords: [`${symbol} managed rooms`, `${symbol} owned rooms`, `${symbol} asset-light`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(assetFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>{symbol} Asset Strategy</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Managed vs Owned Rooms {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Asset Strategy & Business Model Analysis</p>

          {/* Ownership Breakdown */}
          <div className="p-8 rounded-xl border mb-8 bg-violet-500/10 border-violet-500/30">
            {hasBreakdown ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Rooms</p>
                    <p className="text-4xl font-bold">{totalRooms.toLocaleString()}</p>
                  </div>
                  {ownedRooms && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Owned</p>
                      <p className="text-3xl font-bold">{ownedRooms.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{ownedPercentage?.toFixed(1)}%</p>
                    </div>
                  )}
                  {managedRooms && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Managed</p>
                      <p className="text-3xl font-bold">{managedRooms.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{managedPercentage?.toFixed(1)}%</p>
                    </div>
                  )}
                  {franchisedRooms && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Franchised</p>
                      <p className="text-3xl font-bold">{franchisedRooms.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{franchisedPercentage?.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
                {(ownedPercentage || managedPercentage || franchisedPercentage) && (
                  <div className="w-full h-8 bg-secondary rounded-lg overflow-hidden flex">
                    {ownedPercentage && ownedPercentage > 0 && (
                      <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${ownedPercentage}%` }}>
                        {ownedPercentage > 10 ? `${ownedPercentage.toFixed(0)}%` : ''}
                      </div>
                    )}
                    {managedPercentage && managedPercentage > 0 && (
                      <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${managedPercentage}%` }}>
                        {managedPercentage > 10 ? `${managedPercentage.toFixed(0)}%` : ''}
                      </div>
                    )}
                    {franchisedPercentage && franchisedPercentage > 0 && (
                      <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${franchisedPercentage}%` }}>
                        {franchisedPercentage > 10 ? `${franchisedPercentage.toFixed(0)}%` : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} Ownership Data Not Available</p>
                <p className="text-muted-foreground">Room ownership breakdown will be displayed when available from company reports.</p>
              </div>
            )}
          </div>

          {/* Business Model Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Business Model Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-3 text-red-500">Owned Hotels</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Full revenue and control</li>
                  <li>✓ Asset appreciation potential</li>
                  <li>✗ Capital-intensive</li>
                  <li>✗ Property risk and cyclicality</li>
                  <li>✗ 20-30% margins</li>
                  <li>✗ Slower growth</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-lg mb-3 text-blue-500">Managed Hotels</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Fee-based revenue</li>
                  <li>✓ Moderate capital needs</li>
                  <li>✓ 40-60% margins</li>
                  <li>✓ Operational control</li>
                  <li>✗ Contract termination risk</li>
                  <li>✗ Slower than franchise</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-3 text-green-500">Franchised Hotels</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Minimal capital required</li>
                  <li>✓ 60-80% margins</li>
                  <li>✓ Fastest scalability</li>
                  <li>✓ Highest ROIC</li>
                  <li>✗ Less operational control</li>
                  <li>✗ Brand reputation risk</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What is Asset-Light */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Asset-Light Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Asset-light strategies prioritize managed and franchised hotels over owned properties. This approach maximizes returns on invested capital, reduces cyclicality, and enables faster growth with premium valuation multiples.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, asset strategy determines:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Capital intensity and balance sheet requirements</li>
                <li>Profit margins and ROIC (asset-light = higher)</li>
                <li>Growth potential and scalability</li>
                <li>Valuation multiples (asset-light earns premium)</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Strategic Analysis</h2>
            <p className="text-muted-foreground mb-6">Business model, competitive positioning, financial metrics, and growth strategy</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/franchise-fees/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Franchise Fee Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {assetFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Hotel Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['MAR', 'HLT', 'H', 'IHG', 'WYNN', 'LVS', 'MGM', 'HST']
                .filter(s => s !== symbol)
                .slice(0, 8)
                .map(stock => (
                  <Link key={stock} href={`/managed-rooms/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Asset Mix
                  </Link>
                ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
