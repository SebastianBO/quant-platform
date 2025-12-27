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
    title: `${symbol} Cash Position - Cash & Equivalents Analysis`,
    description: `${symbol} cash and cash equivalents analysis with liquidity metrics, cash reserves, and financial flexibility assessment. Understand ${symbol}'s cash position and ability to weather downturns.`,
    keywords: [
      `${symbol} cash position`,
      `${symbol} cash and equivalents`,
      `${symbol} cash reserves`,
      `${symbol} liquidity`,
      `${symbol} cash on hand`,
      `${symbol} financial flexibility`,
    ],
    openGraph: {
      title: `${symbol} Cash Position | Cash Reserves & Liquidity Analysis`,
      description: `Comprehensive cash position analysis for ${symbol} with cash reserves and liquidity metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cash-position/${ticker.toLowerCase()}`,
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

export default async function CashPositionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cash-position/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const cashFaqs = [
    {
      question: `What is ${symbol} cash position?`,
      answer: `${symbol} cash position refers to the total cash and cash equivalents held by ${companyName}. This includes physical currency, bank deposits, money market funds, and highly liquid short-term investments that can be quickly converted to cash. It represents the company's most liquid assets.`
    },
    {
      question: `How much cash does ${symbol} have?`,
      answer: `To see ${symbol}'s current cash and cash equivalents, view the balance sheet in the financial statements. The cash position fluctuates based on operating performance, capital expenditures, debt payments, dividends, and other financial activities. Check the latest quarterly or annual report.`
    },
    {
      question: `Why is cash important for ${symbol}?`,
      answer: `Cash is crucial for ${companyName} because it provides financial flexibility, enables strategic investments, supports operations during downturns, funds growth initiatives, and allows the company to meet short-term obligations. Strong cash reserves indicate financial stability and resilience.`
    },
    {
      question: `What is a good cash position for ${symbol}?`,
      answer: `A good cash position for ${symbol} depends on the industry, business model, and growth stage. Generally, enough cash to cover 3-6 months of operating expenses is healthy. Tech companies often maintain larger cash reserves, while capital-intensive industries may have lower cash as a percentage of assets.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Cash Position`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Cash Position - Cash & Equivalents Analysis`,
      description: `Comprehensive cash position analysis for ${symbol} (${companyName}) with cash reserves and liquidity metrics.`,
      url: pageUrl,
      keywords: [`${symbol} cash position`, `${symbol} cash reserves`, `${symbol} liquidity`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(cashFaqs),
    getTableSchema({
      name: `${symbol} Cash Position History`,
      description: `Historical Cash Position data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Cash Position', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} Cash Position</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Cash Position</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Cash reserves & liquidity analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cash Position Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💎</div>
              <h2 className="text-2xl font-bold mb-2">Cash Position Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed cash reserves, liquidity metrics, and financial flexibility for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Balance Sheet
              </Link>
            </div>
          </section>

          {/* Cash Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Cash Position Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Cash & Equivalents', desc: 'Total liquid assets' },
                { name: 'Cash per Share', desc: 'Cash divided by shares' },
                { name: 'Cash to Assets', desc: 'Liquidity percentage' },
                { name: 'Cash to Market Cap', desc: 'Cash vs valuation' },
                { name: 'Days Cash on Hand', desc: 'Operating runway' },
                { name: 'Net Cash Position', desc: 'Cash minus total debt' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Cash Position Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Cash Position Tells You</h2>
            <div className="space-y-3">
              {[
                'Strong cash position provides financial flexibility for investments, acquisitions, and weathering downturns',
                'High cash reserves can fund R&D, expansion, and strategic initiatives without external financing',
                'Excess cash may indicate lack of investment opportunities or conservative management',
                'Cash trends show whether the company is building reserves or burning through liquidity',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-green-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} cash position and financial strength</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cashFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="cash-position" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
