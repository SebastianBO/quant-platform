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
    title: `${symbol} Approval Rate - Conversion & Underwriting Analysis`,
    description: `${symbol} approval rate analysis with conversion metrics, underwriting standards, and application trends. Track ${symbol}'s lending selectivity and credit discipline.`,
    keywords: [
      `${symbol} approval rate`,
      `${symbol} loan approval`,
      `${symbol} conversion rate`,
      `${symbol} acceptance rate`,
      `${symbol} underwriting`,
      `${symbol} credit standards`,
    ],
    openGraph: {
      title: `${symbol} Approval Rate | Conversion & Underwriting Analysis`,
      description: `Comprehensive approval rate analysis for ${symbol} with conversion metrics and underwriting trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/approval-rate/${ticker.toLowerCase()}`,
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

export default async function ApprovalRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/approval-rate/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What is ${symbol} approval rate?`,
      answer: `${symbol} approval rate is the percentage of loan applications that receive approval for funding. For ${companyName}, this metric reflects underwriting standards, credit discipline, and the balance between growth and credit quality.`
    },
    {
      question: `Why is approval rate important for ${symbol}?`,
      answer: `Approval rate is important for ${symbol} as it indicates credit standards and risk appetite. Very high approval rates may signal loose underwriting and future credit problems, while very low rates may indicate overly conservative lending and missed growth opportunities.`
    },
    {
      question: `What is a good approval rate for ${symbol}?`,
      answer: `Healthy approval rates for ${symbol} typically range from 15-40% depending on target market and product type. The optimal rate balances volume growth with maintaining credit quality and acceptable loss rates.`
    },
    {
      question: `How does approval rate affect ${symbol} growth?`,
      answer: `${symbol}'s approval rate directly impacts origination volume and growth. Higher rates increase volume but may compromise credit quality. The key is maintaining disciplined underwriting while optimizing conversion of quality applicants.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Approval Rate`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Approval Rate - Conversion & Underwriting Analysis`,
      description: `Comprehensive approval rate analysis for ${symbol} (${companyName}) with conversion metrics and credit standards.`,
      url: pageUrl,
      keywords: [`${symbol} approval rate`, `${symbol} loan approval`, `${symbol} conversion rate`],
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
            <span>{symbol} Approval Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Approval Rate</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Conversion & underwriting standards</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
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
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Approval Rate Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol} loan approval rates, conversion metrics, and underwriting discipline</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Approval Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Approval Rate', desc: 'Approved / total applications' },
                { name: 'Approval Trend', desc: 'Quarterly rate changes' },
                { name: 'Funded Rate', desc: 'Approved loans actually funded' },
                { name: 'Application Volume', desc: 'Total loan applications' },
                { name: 'Avg Approved Amount', desc: 'Average approved loan size' },
                { name: 'Decline Reasons', desc: 'Why applications rejected' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Approval Rates</h2>
            <div className="space-y-3">
              {[
                'Approval rates indicate credit standards and risk tolerance',
                'Declining rates may signal tightening credit amid risk concerns',
                'Rising rates could indicate loosening standards or improving applicant quality',
                'The optimal rate balances growth objectives with credit discipline',
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
            <h2 className="text-2xl font-bold mb-4">Complete Underwriting Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} approval rates and credit standards</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Metrics
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

          <RelatedLinks ticker={symbol} currentPage="approval-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
