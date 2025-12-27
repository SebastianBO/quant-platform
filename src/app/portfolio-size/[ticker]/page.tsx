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
    title: `${symbol} Portfolio Size - Loan Book & Asset Growth`,
    description: `${symbol} portfolio size analysis with loan book growth, total assets, and portfolio composition. Track ${symbol}'s lending portfolio scale and diversification.`,
    keywords: [
      `${symbol} portfolio size`,
      `${symbol} loan book`,
      `${symbol} total loans`,
      `${symbol} portfolio growth`,
      `${symbol} loan portfolio`,
      `${symbol} asset size`,
    ],
    openGraph: {
      title: `${symbol} Portfolio Size | Loan Book & Growth Analysis`,
      description: `Comprehensive portfolio size analysis for ${symbol} with loan book metrics and asset growth.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/portfolio-size/${ticker.toLowerCase()}`,
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

export default async function PortfolioSizePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/portfolio-size/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What is ${symbol} portfolio size?`,
      answer: `${symbol} portfolio size refers to the total outstanding loan balance across all active loans. For ${companyName}, this represents the scale of lending operations and total capital deployed in the loan book.`
    },
    {
      question: `Why is portfolio size important for ${symbol}?`,
      answer: `Portfolio size for ${symbol} indicates the scale of operations, revenue potential, and market position. A larger, well-managed portfolio generates more interest income and demonstrates the company's lending capacity and market penetration.`
    },
    {
      question: `How fast should ${symbol} portfolio grow?`,
      answer: `Healthy portfolio growth for ${symbol} typically ranges from 20-40% annually for growth-stage fintech lenders, though this should be balanced with credit quality. Rapid growth without proper risk management can be problematic.`
    },
    {
      question: `What affects ${symbol} portfolio size?`,
      answer: `${symbol}'s portfolio size is influenced by new loan originations, loan repayments, charge-offs, portfolio sales, and loan term structures. Net portfolio growth equals originations minus payoffs and losses.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Portfolio Size`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Portfolio Size - Loan Book & Asset Growth`,
      description: `Comprehensive portfolio size analysis for ${symbol} (${companyName}) with loan book metrics and growth trends.`,
      url: pageUrl,
      keywords: [`${symbol} portfolio size`, `${symbol} loan book`, `${symbol} portfolio growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqItems),
    getTableSchema({
      name: `${symbol} Portfolio Size History`,
      description: `Historical Portfolio Size data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Portfolio Size', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Lending Metrics</Link>
            {' / '}
            <span>{symbol} Portfolio Size</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Portfolio Size</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Loan book scale & asset growth</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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

          {/* Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-bold mb-2">Portfolio Size Analysis</h2>
              <p className="text-muted-foreground mb-6">Comprehensive analysis of {symbol} loan book size, growth trajectory, and portfolio composition</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Portfolio Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Portfolio', desc: 'Outstanding loan balance' },
                { name: 'Portfolio Growth', desc: 'YoY growth rate' },
                { name: 'Portfolio Composition', desc: 'Product mix breakdown' },
                { name: 'Average Loan Balance', desc: 'Per-loan exposure' },
                { name: 'Portfolio Turnover', desc: 'Velocity of portfolio' },
                { name: 'Portfolio Concentration', desc: 'Diversification metrics' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What It Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Portfolio Size</h2>
            <div className="space-y-3">
              {[
                'Larger portfolios generate more interest income but require more capital',
                'Portfolio growth indicates business expansion and market demand',
                'Portfolio composition affects risk profile and return characteristics',
                'Portfolio quality matters more than size - focus on credit performance',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-blue-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Portfolio Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} portfolio metrics and growth trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Portfolio
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="portfolio-size" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
