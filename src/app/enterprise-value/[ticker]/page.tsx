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

  return {
    title: `${symbol} Enterprise Value (EV) - Total Company Valuation`,
    description: `${symbol} enterprise value analysis. View total company valuation including debt and cash. Compare EV to market cap and analyze ${symbol} acquisition value.`,
    keywords: [
      `${symbol} enterprise value`,
      `${symbol} EV`,
      `${symbol} total valuation`,
      `${symbol} acquisition value`,
      `${symbol} EV analysis`,
      `${symbol} firm value`,
    ],
    openGraph: {
      title: `${symbol} Enterprise Value | Total Company Valuation`,
      description: `Comprehensive ${symbol} enterprise value analysis with debt-adjusted valuation metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/enterprise-value/${ticker.toLowerCase()}`,
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

export default async function EnterpriseValuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/enterprise-value/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const marketCap = snapshot.market_cap || 0
  const enterpriseValue = snapshot.enterpriseValue || marketCap

  const evFaqs = [
    {
      question: `What is ${symbol} enterprise value?`,
      answer: `${symbol} has an enterprise value of $${(enterpriseValue / 1e9).toFixed(2)}B. EV represents the total value of the company including debt and excluding cash, providing a more complete valuation than market cap alone.`
    },
    {
      question: `How does EV differ from market cap?`,
      answer: `Market cap is $${(marketCap / 1e9).toFixed(2)}B (shares × price), while EV is $${(enterpriseValue / 1e9).toFixed(2)}B. EV adds debt and subtracts cash because an acquirer would assume debt and receive cash.`
    },
    {
      question: `How is enterprise value calculated?`,
      answer: `EV = Market Cap + Total Debt - Cash and Cash Equivalents. This represents the theoretical takeover price for ${symbol}, as an acquirer would pay market cap plus assume debt minus available cash.`
    },
    {
      question: `Why is enterprise value important?`,
      answer: `EV provides a capital-structure neutral valuation, making it better for comparing companies with different debt levels. It's essential for calculating metrics like EV/EBITDA and EV/Sales.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Enterprise Value`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Enterprise Value - Total Company Valuation`,
      description: `Enterprise value analysis for ${symbol} (${companyName}) with debt-adjusted valuation.`,
      url: pageUrl,
      keywords: [`${symbol} enterprise value`, `${symbol} EV`, `${symbol} total valuation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(evFaqs),
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
            <span>{symbol} Enterprise Value</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Enterprise Value</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Total company valuation including debt</p>

          {/* EV Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Enterprise Value</p>
                <p className="text-4xl font-bold">${(enterpriseValue / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                <p className="text-3xl font-bold">${(marketCap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is EV */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Enterprise Value?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Enterprise value (EV) represents the total value of a company, including both equity and debt.
                It's the theoretical takeover price an acquirer would pay to purchase the entire company.
              </p>
              <p className="text-muted-foreground">
                Unlike market capitalization, which only values equity, EV accounts for the company's capital structure
                by including debt and subtracting cash. This makes it more comprehensive for valuation comparisons.
              </p>
            </div>
          </section>

          {/* EV Calculation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Enterprise Value Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-blue-500 text-3xl mb-3">+</div>
                <p className="font-bold mb-1">Market Capitalization</p>
                <p className="text-sm text-muted-foreground">Share price × outstanding shares = ${(marketCap / 1e9).toFixed(2)}B</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-red-500 text-3xl mb-3">+</div>
                <p className="font-bold mb-1">Total Debt</p>
                <p className="text-sm text-muted-foreground">Acquirer assumes all company debt obligations</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-3xl mb-3">-</div>
                <p className="font-bold mb-1">Cash & Equivalents</p>
                <p className="text-sm text-muted-foreground">Acquirer receives cash on balance sheet</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-purple-500 text-3xl mb-3">=</div>
                <p className="font-bold mb-1">Enterprise Value</p>
                <p className="text-sm text-muted-foreground">Total acquisition price = ${(enterpriseValue / 1e9).toFixed(2)}B</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Enterprise Value Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'M&A Valuation', desc: 'Essential for pricing acquisitions and mergers' },
                { title: 'EV/EBITDA', desc: 'Used to calculate the popular valuation multiple' },
                { title: 'Cross-Company Comparison', desc: 'Compare firms with different capital structures' },
                { title: 'Debt-Neutral Metric', desc: 'Accounts for leverage differences between companies' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Valuation Metrics for {symbol}</h2>
            <p className="text-muted-foreground mb-6">Explore EV/EBITDA, EV/Sales, and other enterprise value multiples</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=valuation`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View EV Multiples
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="enterprise-value" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
