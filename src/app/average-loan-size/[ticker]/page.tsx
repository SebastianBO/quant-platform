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
    title: `${symbol} Average Loan Size - Ticket Size & Portfolio Mix`,
    description: `${symbol} average loan size analysis with ticket size trends, portfolio composition, and unit economics. Track ${symbol}'s lending strategy and customer segments.`,
    keywords: [
      `${symbol} average loan size`,
      `${symbol} ticket size`,
      `${symbol} loan amount`,
      `${symbol} average balance`,
      `${symbol} portfolio mix`,
      `${symbol} loan composition`,
    ],
    openGraph: {
      title: `${symbol} Average Loan Size | Ticket Size & Mix Analysis`,
      description: `Comprehensive average loan size analysis for ${symbol} with ticket trends and portfolio composition.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/average-loan-size/${ticker.toLowerCase()}`,
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

export default async function AverageLoanSizePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/average-loan-size/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What is ${symbol} average loan size?`,
      answer: `${symbol} average loan size is the mean dollar amount of loans in the active portfolio. For ${companyName}, this metric indicates target customer segments, product positioning, and capital deployment strategy.`
    },
    {
      question: `Why is average loan size important for ${symbol}?`,
      answer: `Average loan size is important for ${symbol} because it affects unit economics, servicing costs, portfolio concentration, and revenue per customer. Larger loans typically have better economics but higher risk concentration.`
    },
    {
      question: `What does changing loan size mean for ${symbol}?`,
      answer: `Changes in ${symbol}'s average loan size may indicate: shift in target market, new product introduction, changing customer needs, or strategic repositioning. Rising sizes may reflect move upmarket, while declining sizes suggest broader market targeting.`
    },
    {
      question: `How does loan size affect ${symbol} profitability?`,
      answer: `For ${symbol}, larger loan sizes typically improve unit economics through lower servicing costs per dollar lent and higher revenue per account. However, they may also increase credit risk per loan and require more capital per customer.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Average Loan Size`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Average Loan Size - Ticket Size & Portfolio Mix`,
      description: `Comprehensive average loan size analysis for ${symbol} (${companyName}) with ticket trends and portfolio metrics.`,
      url: pageUrl,
      keywords: [`${symbol} average loan size`, `${symbol} ticket size`, `${symbol} loan amount`],
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
            <span>{symbol} Average Loan Size</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Average Loan Size</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Ticket size & portfolio composition</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
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
              <div className="text-6xl mb-4">📏</div>
              <h2 className="text-2xl font-bold mb-2">Average Loan Size Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol} average ticket size, loan distribution, and portfolio composition trends</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Loan Size Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Average Loan Size', desc: 'Mean loan amount' },
                { name: 'Median Loan Size', desc: 'Middle loan amount' },
                { name: 'Size Distribution', desc: 'Loan amount breakdown' },
                { name: 'Size Trend', desc: 'Quarterly movement' },
                { name: 'Product Mix Impact', desc: 'Effect of product composition' },
                { name: 'Revenue per Loan', desc: 'Average revenue per account' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Average Loan Size</h2>
            <div className="space-y-3">
              {[
                'Larger loan sizes generally improve unit economics and reduce servicing costs',
                'Loan size reflects target market positioning and customer segment strategy',
                'Changes in average size may indicate product evolution or market shift',
                'Balance loan size with portfolio diversification and concentration risk',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-violet-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Portfolio Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} loan sizes and portfolio composition</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium">
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

          <RelatedLinks ticker={symbol} currentPage="average-loan-size" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
