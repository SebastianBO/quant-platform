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
    title: `${symbol} Dilution - Share Dilution Analysis & Impact on Stock Price`,
    description: `${symbol} stock dilution analysis with share count trends. Understand dilution impact from stock options, secondary offerings, and equity compensation on ${symbol} shareholders.`,
    keywords: [
      `${symbol} dilution`,
      `${symbol} share dilution`,
      `${symbol} stock dilution`,
      `${symbol} dilution rate`,
      `${symbol} share count increase`,
      `${symbol} equity dilution`,
    ],
    openGraph: {
      title: `${symbol} Dilution | Share Dilution Impact Analysis`,
      description: `Comprehensive ${symbol} dilution analysis with share count trends and shareholder impact.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dilution/${ticker.toLowerCase()}`,
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

export default async function DilutionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/dilution/${ticker.toLowerCase()}`
  const sharesOutstanding = snapshot.shares_outstanding || 0

  const faqs = [
    {
      question: `What is share dilution for ${symbol}?`,
      answer: `Share dilution occurs when ${symbol} issues new shares, increasing the total outstanding share count. This reduces existing shareholders' ownership percentage and can decrease earnings per share (EPS) if earnings don't grow proportionally.`
    },
    {
      question: `How does dilution affect ${symbol} stock price?`,
      answer: `Dilution can pressure ${symbol} stock price by spreading earnings across more shares, reducing EPS. However, if new shares fund growth initiatives that increase total earnings faster than share count, dilution may be beneficial long-term.`
    },
    {
      question: `What causes dilution in ${symbol} stock?`,
      answer: `Common dilution sources for ${symbol} include: employee stock options and RSUs, convertible debt converting to equity, secondary public offerings for capital raising, and acquisition payments using stock instead of cash.`
    },
    {
      question: `How can I track ${symbol} dilution over time?`,
      answer: `Monitor ${symbol}'s quarterly share count in 10-Q/10-K filings. Compare shares outstanding year-over-year to calculate dilution rate. Also review the equity compensation section in cash flow statements and proxy statements for option grants.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Dilution`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Dilution - Share Dilution Analysis & Impact`,
      description: `Comprehensive dilution analysis for ${symbol} (${companyName}) with share count trends.`,
      url: pageUrl,
      keywords: [`${symbol} dilution`, `${symbol} share dilution`, `${symbol} stock dilution`],
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
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Dilution</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Share Dilution</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Dilution analysis & shareholder impact</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Shares</p>
                <p className="text-3xl font-bold">{(sharesOutstanding / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold">${(snapshot.market_cap / 1000000000).toFixed(2)}B</p>
              </div>
            </div>
          </div>

          {/* Dilution Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Share Dilution</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                Share dilution reduces your ownership percentage in {symbol}. When new shares are issued, the total share
                count increases, meaning each share represents a smaller piece of the company. This can impact earnings per
                share and voting rights.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Ownership Reduction', desc: 'Your percentage stake decreases as more shares exist', impact: 'Negative' },
                { title: 'EPS Decline', desc: 'Earnings spread across more shares lowers per-share profit', impact: 'Negative' },
                { title: 'Growth Funding', desc: 'New capital can fuel expansion and revenue growth', impact: 'Positive' },
                { title: 'Voting Power', desc: 'Each share has proportionally less voting influence', impact: 'Negative' },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold">{item.title}</p>
                    <span className={`text-xs px-2 py-1 rounded ${item.impact === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Dilution Sources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Common Sources of Dilution</h2>
            <div className="space-y-4">
              {[
                {
                  source: 'Employee Stock Options',
                  desc: 'Stock options granted to employees dilute shares when exercised. Tech companies often have significant option-based compensation.',
                  severity: 'Moderate'
                },
                {
                  source: 'Secondary Offerings',
                  desc: 'Companies issue new shares to public markets to raise capital for expansion, debt reduction, or acquisitions.',
                  severity: 'High'
                },
                {
                  source: 'Convertible Debt',
                  desc: 'Convertible bonds can be exchanged for stock, increasing share count when bondholders convert.',
                  severity: 'Moderate'
                },
                {
                  source: 'Restricted Stock Units (RSUs)',
                  desc: 'RSUs granted to executives and employees vest over time and add to outstanding shares.',
                  severity: 'Moderate'
                },
                {
                  source: 'Stock-Based Acquisitions',
                  desc: 'Acquiring companies using stock instead of cash dilutes existing shareholders.',
                  severity: 'High'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.source}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.severity} Impact
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Monitoring Dilution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Monitor Dilution</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">1. Quarterly Share Count</p>
                  <p className="text-sm text-muted-foreground">Compare outstanding shares quarter-over-quarter in 10-Q filings</p>
                </div>
                <div>
                  <p className="font-bold mb-2">2. Equity Compensation</p>
                  <p className="text-sm text-muted-foreground">Review stock-based compensation in cash flow statements</p>
                </div>
                <div>
                  <p className="font-bold mb-2">3. Proxy Statements</p>
                  <p className="text-sm text-muted-foreground">Check DEF 14A for executive option grants and equity plans</p>
                </div>
                <div>
                  <p className="font-bold mb-2">4. Diluted EPS</p>
                  <p className="text-sm text-muted-foreground">Compare basic vs diluted EPS to see potential option impact</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Share Count Trends</h2>
            <p className="text-muted-foreground mb-6">Track historical share count changes and ownership structure</p>
            <Link href={`/shares-outstanding/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Shares Outstanding
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="dilution" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
