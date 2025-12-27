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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Loyalty Members ${currentYear} - Rewards Program Analysis`,
    description: `${symbol} loyalty program analysis: member count, growth trends, engagement metrics, customer lifetime value, and competitive moat for hotel investors.`,
    keywords: [
      `${symbol} loyalty program`,
      `${symbol} rewards members`,
      `${symbol} loyalty members`,
      `${symbol} member count`,
      `${symbol} customer loyalty`,
      `${symbol} rewards program`,
      `${symbol} member growth`,
    ],
    openGraph: {
      title: `${symbol} Loyalty Members - Rewards Program Analysis`,
      description: `Complete ${symbol} loyalty program analysis with member trends and engagement insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/loyalty-members/${ticker.toLowerCase()}`,
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

export default async function LoyaltyMembersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/loyalty-members/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // Loyalty metrics would come from API - using placeholders
  const loyaltyMembers = metrics?.loyalty_members || null
  const memberGrowth = metrics?.member_growth || null
  const activeMembers = metrics?.active_members || null
  const loyaltyRevenue = metrics?.loyalty_revenue_percentage || null

  const hasLoyalty = loyaltyMembers && loyaltyMembers > 0

  const loyaltyFaqs = [
    {
      question: `How many loyalty members does ${symbol} have?`,
      answer: hasLoyalty
        ? `${symbol} (${companyName}) has ${loyaltyMembers.toLocaleString()} loyalty program members${activeMembers ? ` with ${activeMembers.toLocaleString()} active members` : ''}. Loyalty programs drive direct bookings, reduce distribution costs, increase customer lifetime value, and create competitive moats through switching costs.`
        : `${symbol} (${companyName}) loyalty member data is currently unavailable. Loyalty programs are critical for customer retention and reducing dependence on OTAs (online travel agencies).`
    },
    {
      question: `Is ${symbol} loyalty program growing?`,
      answer: memberGrowth
        ? `${symbol} loyalty membership is ${memberGrowth > 0 ? 'growing' : 'declining'} at ${Math.abs(memberGrowth).toFixed(1)}% year-over-year. Strong member growth (10-20%+ for emerging programs, 5-10% for mature programs) indicates brand strength and successful customer acquisition. Growing membership expands direct booking channels and reduces OTA dependence.`
        : `Loyalty member growth for ${symbol} will be updated from company reports. Consistent member growth drives direct bookings and reduces distribution costs.`
    },
    {
      question: `Why are loyalty programs important for hotels?`,
      answer: `Loyalty programs provide: (1) Direct bookings that avoid 15-25% OTA commissions, (2) Higher customer lifetime value and repeat business, (3) Valuable customer data for personalization and marketing, (4) Competitive moat through switching costs, (5) Premium pricing power for loyal customers. ${symbol}'s loyalty program is a key strategic asset.`
    },
    {
      question: `What percentage of ${symbol} revenue comes from loyalty members?`,
      answer: loyaltyRevenue
        ? `Approximately ${loyaltyRevenue.toFixed(0)}% of ${symbol} revenue comes from loyalty program members. Leading hotel companies generate 50-70% of revenue from loyalty members, with these guests typically booking direct and spending 20-30% more than non-members. Higher loyalty revenue indicates strong customer relationships and reduced OTA dependence.`
        : `Leading hotel companies generate 50-70% of revenue from loyalty members. Loyalty member data for ${symbol} will be available from investor presentations and earnings calls.`
    },
    {
      question: `How do hotel loyalty programs create value?`,
      answer: `Loyalty programs create value through: (1) Lower customer acquisition costs (CAC), (2) Higher customer lifetime value (CLTV), (3) Reduced OTA commissions (15-25% savings), (4) Better demand forecasting and revenue management, (5) Cross-selling opportunities across brands, (6) First-party data for personalization. ${symbol} loyalty members are more profitable and predictable.`
    },
    {
      question: `Why should investors care about loyalty member count?`,
      answer: `Loyalty members drive: (1) Recurring revenue and customer retention, (2) Higher margins through direct bookings, (3) Competitive moat and switching costs, (4) Valuable customer data and relationships, (5) Premium valuations (network effects). ${symbol} investors should track member count, growth rate, active engagement, and contribution to revenue.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'Loyalty Programs', url: `${SITE_URL}/learn/loyalty-programs` },
      { name: `${symbol} Loyalty`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Loyalty Members ${currentYear} - Rewards Program Analysis`,
      description: `Complete loyalty program analysis for ${symbol} including member trends and strategic value.`,
      url: pageUrl,
      keywords: [`${symbol} loyalty members`, `${symbol} rewards program`, `${symbol} customer loyalty`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(loyaltyFaqs),
    getTableSchema({
      name: `${symbol} Loyalty Members History`,
      description: `Historical Loyalty Members data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Loyalty Members', 'Change'],
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
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>{symbol} Loyalty</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Loyalty Members {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Rewards Program Analysis</p>

          {/* Loyalty Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-indigo-500/10 border-indigo-500/30">
            {hasLoyalty ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Members</p>
                  <p className="text-4xl font-bold">{loyaltyMembers.toLocaleString()}</p>
                </div>
                {activeMembers && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Active Members</p>
                    <p className="text-3xl font-bold">{activeMembers.toLocaleString()}</p>
                  </div>
                )}
                {memberGrowth !== null && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${memberGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {memberGrowth > 0 ? '+' : ''}{memberGrowth.toFixed(1)}%
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
                <p className="text-2xl font-bold mb-2">{symbol} Loyalty Data Not Available</p>
                <p className="text-muted-foreground">Loyalty program metrics will be displayed when available from company reports.</p>
              </div>
            )}
          </div>

          {/* What are Loyalty Programs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Loyalty Programs Matter</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Hotel loyalty programs are strategic assets that drive direct bookings, reduce distribution costs, increase customer lifetime value, and create competitive moats. Members book more frequently, spend more, and cost less to acquire.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, loyalty metrics reveal:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Customer retention and lifetime value</li>
                <li>Direct booking strength and OTA independence</li>
                <li>Brand strength and competitive moat</li>
                <li>Margin improvement potential (lower distribution costs)</li>
              </ul>
            </div>
          </section>

          {/* Loyalty Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Loyalty Program Value Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Direct Bookings</h3>
                <p className="text-muted-foreground text-sm">Avoid 15-25% OTA commissions, improving margins and profitability</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Higher Spend</h3>
                <p className="text-muted-foreground text-sm">Members spend 20-30% more and book more frequently than non-members</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Customer Data</h3>
                <p className="text-muted-foreground text-sm">First-party data enables personalization and targeted marketing</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Moat</h3>
                <p className="text-muted-foreground text-sm">Switching costs and accumulated benefits create customer stickiness</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Strategic Analysis</h2>
            <p className="text-muted-foreground mb-6">Competitive positioning, brand value, customer metrics, and growth strategy</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/competitors/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                Competitor Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {loyaltyFaqs.map((faq, i) => (
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
                  <Link key={stock} href={`/loyalty-members/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} Loyalty
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
