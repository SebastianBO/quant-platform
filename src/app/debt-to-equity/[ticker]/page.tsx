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
    title: `${symbol} Debt-to-Equity Ratio (D/E) - Leverage Analysis`,
    description: `${symbol} debt-to-equity ratio analysis. Assess financial leverage and solvency risk. View D/E trends, industry comparison, and debt management for ${symbol} stock.`,
    keywords: [
      `${symbol} debt to equity`,
      `${symbol} D/E ratio`,
      `${symbol} leverage ratio`,
      `${symbol} debt ratio`,
      `${symbol} financial leverage`,
      `${symbol} solvency`,
    ],
    openGraph: {
      title: `${symbol} Debt-to-Equity Ratio | Financial Leverage Analysis`,
      description: `Comprehensive ${symbol} D/E ratio analysis with debt metrics and leverage assessment.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/debt-to-equity/${ticker.toLowerCase()}`,
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

export default async function DebtToEquityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/debt-to-equity/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const deRatio = snapshot.debtToEquity || 0

  const deFaqs = [
    {
      question: `What is ${symbol} debt-to-equity ratio?`,
      answer: `${symbol} has a D/E ratio of ${deRatio.toFixed(2)}. This means the company has $${deRatio.toFixed(2)} of debt for every $1 of shareholder equity, indicating its financial leverage.`
    },
    {
      question: `Is ${symbol} D/E ratio good?`,
      answer: `A D/E ratio below 2.0 is generally considered healthy, though ideal ratios vary by industry. ${symbol}'s D/E of ${deRatio.toFixed(2)} should be compared to sector peers to assess relative leverage.`
    },
    {
      question: `How is debt-to-equity ratio calculated?`,
      answer: `D/E ratio = Total Liabilities / Shareholder Equity. It measures how much debt a company uses to finance its assets relative to equity. Higher ratios indicate greater financial risk but can amplify returns.`
    },
    {
      question: `What does high D/E ratio mean?`,
      answer: `A high D/E ratio indicates aggressive financing with debt, which increases financial risk but can boost returns if the company grows. Low D/E suggests conservative financing with more equity and less leverage.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} D/E Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Debt-to-Equity Ratio - Leverage Analysis`,
      description: `D/E ratio analysis for ${symbol} (${companyName}) with debt metrics and leverage assessment.`,
      url: pageUrl,
      keywords: [`${symbol} debt to equity`, `${symbol} D/E ratio`, `${symbol} leverage`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(deFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} D/E Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Debt-to-Equity Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Financial leverage and solvency analysis</p>

          {/* D/E Ratio Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">D/E Ratio</p>
                <p className="text-4xl font-bold">{deRatio.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Risk Level</p>
                <p className={`text-3xl font-bold ${deRatio < 1 ? 'text-green-500' : deRatio < 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {deRatio < 1 ? 'Low' : deRatio < 2 ? 'Moderate' : 'High'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is D/E Ratio */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Debt-to-Equity Ratio?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The debt-to-equity (D/E) ratio measures a company's financial leverage by comparing total liabilities to
                shareholder equity. It shows how much debt a company uses to finance its operations relative to equity.
              </p>
              <p className="text-muted-foreground">
                This metric helps investors assess financial risk. Higher ratios indicate more debt financing and greater risk,
                but can also amplify returns. Lower ratios suggest conservative financing with less leverage.
              </p>
            </div>
          </section>

          {/* D/E Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Interpreting {symbol} D/E Ratio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 1.0</div>
                <p className="font-bold mb-1">Conservative</p>
                <p className="text-sm text-muted-foreground">More equity than debt, lower financial risk</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">1.0 - 2.0</div>
                <p className="font-bold mb-1">Moderate</p>
                <p className="text-sm text-muted-foreground">Balanced leverage, typical for most companies</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-red-500 text-2xl font-bold mb-2">&gt; 2.0</div>
                <p className="font-bold mb-1">Aggressive</p>
                <p className="text-sm text-muted-foreground">High leverage, increased financial risk</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Debt Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">View detailed debt breakdown, interest coverage, and financial health metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Debt Details
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {deFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="debt-to-equity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
