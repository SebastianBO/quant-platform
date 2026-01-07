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
    title: `${symbol} Franchise Fees ${currentYear} - Fee Revenue & Margins`,
    description: `${symbol} franchise fee analysis: fee revenue, margins, royalty rates, asset-light strategy, and recurring income for hotel investors.`,
    keywords: [
      `${symbol} franchise fees`,
      `${symbol} fee revenue`,
      `${symbol} royalty rates`,
      `${symbol} asset-light`,
      `${symbol} recurring revenue`,
      `${symbol} franchise income`,
      `${symbol} fee margins`,
    ],
    openGraph: {
      title: `${symbol} Franchise Fees - Fee Revenue & Margins Analysis`,
      description: `Complete ${symbol} franchise fee analysis with revenue trends and margin insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/franchise-fees/${ticker.toLowerCase()}`,
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

export default async function FranchiseFeesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/franchise-fees/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Franchise fee metrics would come from API - using placeholders
  const franchiseFees = metrics?.franchise_fees || null
  const feeGrowth = metrics?.fee_growth || null
  const feeMargin = metrics?.fee_margin || null
  const totalRevenue = metrics?.revenue || null
  const feePercentage = franchiseFees && totalRevenue ? (franchiseFees / totalRevenue) * 100 : null

  const hasFees = franchiseFees && franchiseFees > 0

  const feeFaqs = [
    {
      question: `How much does ${symbol} earn from franchise fees?`,
      answer: hasFees
        ? `${symbol} (${companyName}) generates $${(franchiseFees / 1000000).toFixed(0)}M in franchise and management fees${feePercentage ? `, representing ${feePercentage.toFixed(1)}% of total revenue` : ''}. Fee revenue is highly profitable, recurring income from royalties, management fees, and licensing. This asset-light model delivers superior returns with minimal capital investment.`
        : `${symbol} (${companyName}) franchise fee data is currently unavailable. Fee revenue is a key metric for asset-light hotel companies and reflects brand value.`
    },
    {
      question: `What is ${symbol} fee margin?`,
      answer: feeMargin
        ? `${symbol} franchise and management fee margins are approximately ${feeMargin.toFixed(1)}%. Fee businesses typically generate 60-80% margins compared to 20-30% for owned hotels, making them highly profitable and capital-efficient. Higher fee margins indicate strong brand value and operating leverage.`
        : `Hotel franchise fees typically generate 60-80% margins. Fee margin data for ${symbol} will be updated from financial reports. High margins make fee revenue extremely valuable.`
    },
    {
      question: `How are hotel franchise fees calculated?`,
      answer: `Hotel franchise fees typically include: (1) Royalty fees: 4-6% of room revenue, (2) Marketing/reservation fees: 2-4% of room revenue, (3) Initial franchise fees: $30K-$100K per property, (4) Management fees: 2-4% of revenue for managed properties. ${symbol}'s fee structure reflects brand strength and services provided.`
    },
    {
      question: `Is ${symbol} franchise fee revenue growing?`,
      answer: feeGrowth
        ? `${symbol} franchise and management fees are ${feeGrowth > 0 ? 'growing' : 'declining'} at ${Math.abs(feeGrowth).toFixed(1)}% year-over-year. Strong fee growth (5-10%+) comes from unit growth and RevPAR gains. Fee growth exceeding room count growth indicates strong same-store performance and pricing power.`
        : `Fee revenue growth for ${symbol} will be updated from quarterly earnings. Fee growth is driven by new openings (unit growth) and RevPAR performance (same-store sales).`
    },
    {
      question: `Why do investors prefer fee revenue over owned hotels?`,
      answer: `Fee revenue offers: (1) 60-80% margins vs. 20-30% for owned hotels, (2) Minimal capital requirements and asset risk, (3) Highly scalable and recurring revenue, (4) Less cyclical with no property operating costs, (5) Better returns on invested capital (ROIC). Asset-light models like ${symbol} deliver superior valuation multiples.`
    },
    {
      question: `How important are franchise fees for ${symbol} investors?`,
      answer: feePercentage
        ? `Franchise fees represent ${feePercentage.toFixed(1)}% of ${symbol} revenue and are critical to valuation. Fee revenue drives: (1) High-margin earnings and cash flow, (2) Predictable, recurring income streams, (3) Capital-light growth and high returns, (4) Premium valuation multiples. Investors should track fee revenue growth, margins, and mix.`
        : `Franchise fees are critical for asset-light hotel companies. Fee revenue drives high-margin earnings, capital efficiency, and premium valuations compared to hotel owners.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Franchise Fees', url: `${SITE_URL}/learn/franchise-fees` },
      { name: `${symbol} Franchise Fees`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Franchise Fees ${currentYear} - Fee Revenue & Margins`,
      description: `Complete franchise fee analysis for ${symbol} including revenue trends and margin performance.`,
      url: pageUrl,
      keywords: [`${symbol} franchise fees`, `${symbol} fee revenue`, `${symbol} margins`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(feeFaqs),
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
            <span>{symbol} Franchise Fees</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Franchise Fees {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Fee Revenue & Margins Analysis</p>

          {/* Franchise Fees Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-emerald-500/10 border-emerald-500/30">
            {hasFees ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Fee Revenue</p>
                  <p className="text-4xl font-bold">${(franchiseFees / 1000000).toFixed(0)}M</p>
                </div>
                {feeMargin && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Fee Margin</p>
                    <p className="text-3xl font-bold text-green-500">{feeMargin.toFixed(1)}%</p>
                  </div>
                )}
                {feeGrowth !== null && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${feeGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {feeGrowth > 0 ? '+' : ''}{feeGrowth.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} Fee Data Not Available</p>
                <p className="text-muted-foreground">Franchise fee metrics will be displayed when available from financial reports.</p>
              </div>
            )}
          </div>

          {/* What are Franchise Fees */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Franchise Fees</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Franchise and management fees are recurring revenue streams that hotel companies earn from licensing their brands and managing properties owned by third parties. This asset-light model generates high-margin, predictable income.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, fee revenue indicates:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Brand value and market demand</li>
                <li>High-margin, recurring earnings quality</li>
                <li>Capital efficiency and scalability</li>
                <li>Asset-light strategy and risk profile</li>
              </ul>
            </div>
          </section>

          {/* Fee Structure */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Typical Fee Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Royalty Fees</p>
                <p className="text-2xl font-bold mb-2">4-6%</p>
                <p className="text-sm text-muted-foreground">Of room revenue</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Marketing Fees</p>
                <p className="text-2xl font-bold mb-2">2-4%</p>
                <p className="text-sm text-muted-foreground">Of room revenue</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Initial Fee</p>
                <p className="text-2xl font-bold mb-2">$30K-100K</p>
                <p className="text-sm text-muted-foreground">Per property</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Management Fees</p>
                <p className="text-2xl font-bold mb-2">2-4%</p>
                <p className="text-sm text-muted-foreground">Of total revenue</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Revenue breakdown, margins, profitability, and comprehensive financial metrics</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/revenue/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Revenue Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {feeFaqs.map((faq, i) => (
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
                  <Link key={stock} href={`/franchise-fees/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Fees
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
