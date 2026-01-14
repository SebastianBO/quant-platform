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
    title: `${symbol} Working Capital - Analysis, Trends & Efficiency Ratios`,
    description: `${symbol} working capital analysis with trends, efficiency metrics, and liquidity assessment. Understand ${symbol}'s short-term financial health and operational efficiency.`,
    keywords: [
      `${symbol} working capital`,
      `${symbol} working capital ratio`,
      `${symbol} current assets`,
      `${symbol} current liabilities`,
      `${symbol} liquidity analysis`,
      `${symbol} operating cycle`,
    ],
    openGraph: {
      title: `${symbol} Working Capital | Liquidity & Efficiency Analysis`,
      description: `Comprehensive working capital analysis for ${symbol} with liquidity metrics and operational efficiency trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/working-capital/${ticker.toLowerCase()}`,
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

export default async function WorkingCapitalPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/working-capital/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const wcFaqs = [
    {
      question: `What is ${symbol} working capital?`,
      answer: `${symbol} working capital is the difference between current assets and current liabilities. It represents the short-term liquidity available to ${companyName} for day-to-day operations and measures the company's ability to meet short-term obligations.`
    },
    {
      question: `How is working capital calculated for ${symbol}?`,
      answer: `Working capital for ${symbol} is calculated as: Current Assets (cash, receivables, inventory) minus Current Liabilities (payables, short-term debt). Positive working capital indicates the company can cover short-term obligations.`
    },
    {
      question: `Is positive or negative working capital better for ${symbol}?`,
      answer: `Generally, positive working capital is better for ${symbol} as it shows adequate liquidity. However, some efficient businesses operate with negative working capital by quickly converting inventory and collecting receivables faster than paying suppliers.`
    },
    {
      question: `What is a good working capital ratio for ${symbol}?`,
      answer: `A working capital ratio (current ratio) between 1.5 and 3.0 is typically considered healthy for ${companyName}. Below 1.0 may indicate liquidity issues, while significantly above 3.0 might suggest inefficient use of assets. Industry norms vary significantly.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Working Capital`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Working Capital - Analysis, Trends & Efficiency Ratios`,
      description: `Comprehensive working capital analysis for ${symbol} (${companyName}) with liquidity metrics and efficiency trends.`,
      url: pageUrl,
      keywords: [`${symbol} working capital`, `${symbol} liquidity`, `${symbol} current ratio`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(wcFaqs),
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
            <span>{symbol} Working Capital</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Working Capital</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Liquidity analysis & operational efficiency metrics</p>

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

          {/* Working Capital Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold mb-2">Working Capital Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed liquidity metrics, efficiency ratios, and short-term financial health for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Balance Sheet
              </Link>
            </div>
          </section>

          {/* Working Capital Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Working Capital Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Working Capital', desc: 'Current assets - liabilities' },
                { name: 'Current Ratio', desc: 'Liquidity measure' },
                { name: 'Quick Ratio', desc: 'Acid-test ratio' },
                { name: 'Cash Ratio', desc: 'Most conservative liquidity' },
                { name: 'Days Working Capital', desc: 'Operating cycle days' },
                { name: 'WC Turnover Ratio', desc: 'Efficiency metric' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Working Capital Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Working Capital Tells You</h2>
            <div className="space-y-3">
              {[
                'Positive working capital shows the company has sufficient short-term assets to cover liabilities',
                'Growing working capital may indicate business expansion but could signal inefficient asset use',
                'Declining working capital might show improved efficiency or potential liquidity concerns',
                'Working capital trends reveal how effectively management handles day-to-day operations',
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
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} working capital and liquidity metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {wcFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="working-capital" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
