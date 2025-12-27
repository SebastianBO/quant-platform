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

  return {
    title: `${symbol} Shares Outstanding - Current Share Count & Dilution Analysis`,
    description: `${symbol} shares outstanding data with historical trends. View current share count, dilution rates, float percentage, and institutional ownership impact.`,
    keywords: [
      `${symbol} shares outstanding`,
      `${symbol} share count`,
      `${symbol} dilution`,
      `${symbol} float`,
      `${symbol} shares issued`,
      `${symbol} outstanding stock`,
    ],
    openGraph: {
      title: `${symbol} Shares Outstanding | Current Share Count Analysis`,
      description: `Detailed ${symbol} shares outstanding analysis with historical trends and dilution metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/shares-outstanding/${ticker.toLowerCase()}`,
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

export default async function SharesOutstandingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/shares-outstanding/${ticker.toLowerCase()}`
  const sharesOutstanding = snapshot.shares_outstanding || 0
  const marketCap = snapshot.market_cap || 0

  const faqs = [
    {
      question: `How many shares of ${symbol} are outstanding?`,
      answer: `${symbol} currently has ${(sharesOutstanding / 1000000).toFixed(2)} million shares outstanding. This represents the total number of shares currently held by all shareholders, including institutional investors, insiders, and retail investors.`
    },
    {
      question: `What is the difference between shares outstanding and float?`,
      answer: `Shares outstanding represents all issued shares, while float is the portion available for public trading. Float excludes shares held by insiders and restricted shares. For ${symbol}, this distinction is important for understanding trading liquidity.`
    },
    {
      question: `How does share dilution affect ${symbol} stock price?`,
      answer: `Share dilution occurs when ${symbol} issues new shares, increasing the total outstanding. This typically decreases earnings per share (EPS) and can put downward pressure on the stock price if not accompanied by proportional earnings growth.`
    },
    {
      question: `Does ${symbol} have a share buyback program?`,
      answer: `Share buyback programs reduce shares outstanding by repurchasing stock from the market. Check ${symbol}'s recent filings and investor relations announcements for current buyback authorization and activity.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Shares Outstanding`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Shares Outstanding - Current Share Count Analysis`,
      description: `Comprehensive shares outstanding analysis for ${symbol} (${companyName}) with dilution trends.`,
      url: pageUrl,
      keywords: [`${symbol} shares outstanding`, `${symbol} share count`, `${symbol} dilution`],
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
    getTableSchema({
      name: `${symbol} Shares Outstanding History`,
      description: `Historical Shares Outstanding data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Shares Outstanding', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Shares Outstanding</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Shares Outstanding</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Current share count & dilution analysis</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Shares Outstanding</p>
                <p className="text-3xl font-bold">{(sharesOutstanding / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold">${(marketCap / 1000000000).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Price per Share</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Share Count Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Share Count Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                {symbol} has {(sharesOutstanding / 1000000).toFixed(2)} million shares outstanding, representing the total equity
                ownership of the company. This metric is crucial for calculating per-share metrics like EPS and book value.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-1">Total Shares</p>
                  <p className="text-2xl">{(sharesOutstanding / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-muted-foreground mt-2">All issued shares including restricted</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-1">Market Value</p>
                  <p className="text-2xl">${(marketCap / 1000000000).toFixed(2)}B</p>
                  <p className="text-sm text-muted-foreground mt-2">Total market capitalization</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dilution Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Share Dilution</h2>
            <div className="space-y-4">
              {[
                { title: 'New Share Issuance', desc: 'Companies issue new shares for capital raising, employee compensation, or acquisitions' },
                { title: 'EPS Impact', desc: 'More shares divide earnings across a larger base, potentially reducing EPS' },
                { title: 'Ownership Percentage', desc: 'Existing shareholders own a smaller percentage of the company after dilution' },
                { title: 'Stock Options', desc: 'Employee stock options increase dilution when exercised' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">View complete ownership structure and institutional holdings</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=ownership`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Ownership Details
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

          <RelatedLinks ticker={symbol} currentPage="shares-outstanding" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
