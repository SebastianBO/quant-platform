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
    getTableSchema({
      name: `${symbol} Buybacks History`,
      description: `Historical Buybacks data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Buybacks', 'Change'],
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
            <span>{symbol} Buybacks</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Share Buybacks</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Repurchase program & shareholder value analysis</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold">${(marketCap / 1000000000).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Buyback Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Share Buybacks</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
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
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <p className="font-bold mb-2">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Buyback Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Buyback Metrics to Monitor</h2>
            <div className="space-y-4">
              {[
                { metric: 'Authorization Amount', desc: 'Total dollar amount or share count approved by board of directors for repurchase' },
                { metric: 'Actual Spend', desc: 'Cash deployed for buybacks each quarter shown in cash flow statements' },
                { metric: 'Average Price Paid', desc: 'Indicates whether management is buying at favorable prices' },
                { metric: 'Completion Rate', desc: 'Percentage of authorization actually executed over time' },
                { metric: 'Share Count Reduction', desc: 'Net decrease in outstanding shares after buybacks' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{item.metric}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Cash Flow Analysis</h2>
            <p className="text-muted-foreground mb-6">See detailed share repurchase activity in financial statements</p>
            <Link href={`/cash-flow/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Cash Flow Statement
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

          <RelatedLinks ticker={symbol} currentPage="buybacks" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
