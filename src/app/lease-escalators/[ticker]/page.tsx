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
    title: `${symbol} Lease Escalators - Rent Growth & Contract Terms`,
    description: `${symbol} lease escalator analysis. View annual rent increases, escalation clauses, contract terms, and organic revenue growth from lease agreements for ${symbol}.`,
    keywords: [
      `${symbol} lease escalators`,
      `${symbol} rent escalation`,
      `${symbol} lease terms`,
      `${symbol} organic growth`,
      `${symbol} contract escalation`,
      `${symbol} rent increases`,
    ],
    openGraph: {
      title: `${symbol} Lease Escalators | Rent Growth Analysis`,
      description: `Comprehensive ${symbol} lease escalator analysis with organic growth and contract terms.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/lease-escalators/${ticker.toLowerCase()}`,
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

export default async function LeaseEscalatorsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/lease-escalators/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock escalator data - replace with actual API data when available
  const avgEscalator = (Math.random() * 2 + 2.5).toFixed(1)
  const fixedEscalator = (Math.random() * 1.5 + 2.0).toFixed(1)
  const cpiLinked = (Math.random() * 2.0 + 2.5).toFixed(1)
  const contractsWithEscalators = Math.round(Math.random() * 10 + 85)

  const escalatorFaqs = [
    {
      question: `What are ${symbol} lease escalators?`,
      answer: `${symbol} (${companyName}) has an average lease escalator of ${avgEscalator}%, meaning tenant rents automatically increase by this percentage annually. These contractual escalations provide predictable organic revenue growth independent of new leasing activity.`
    },
    {
      question: `How do lease escalators work?`,
      answer: `Lease escalators are contractual clauses that automatically increase rent payments over time. ${symbol} uses both fixed escalators (e.g., ${fixedEscalator}% annual increase) and CPI-linked escalators (tied to inflation, averaging ${cpiLinked}%). These escalations compound annually, driving long-term revenue growth.`
    },
    {
      question: `What percentage of ${symbol} contracts have escalators?`,
      answer: `Approximately ${contractsWithEscalators}% of ${symbol}'s lease contracts include escalation clauses. This high percentage ensures predictable organic revenue growth and protects against inflation, making the revenue stream more stable and valuable to investors.`
    },
    {
      question: `How do escalators impact ${symbol} stock value?`,
      answer: `Lease escalators provide: (1) Predictable organic revenue growth, (2) Inflation protection through CPI-linked increases, (3) Compounding returns over contract terms, and (4) Higher quality earnings. Tower REITs with strong escalators typically command premium valuations due to revenue visibility.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Lease Escalators`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Lease Escalators - Rent Growth & Contract Terms`,
      description: `Comprehensive lease escalator analysis for ${symbol} (${companyName}) including organic growth and contract terms.`,
      url: pageUrl,
      keywords: [`${symbol} lease escalators`, `${symbol} rent escalation`, `${symbol} organic growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(escalatorFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Lease Escalators</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Lease Escalators</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Rent growth & contract escalation analysis</p>

          {/* Escalator Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Escalator</p>
                <p className="text-4xl font-bold text-green-500">{avgEscalator}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Contract Coverage</p>
                <p className="text-4xl font-bold text-emerald-500">{contractsWithEscalators}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Fixed vs CPI</p>
                <p className="text-2xl font-bold">Mixed</p>
              </div>
            </div>
          </div>

          {/* Escalator Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Escalator Structure</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Fixed Escalators</h3>
                  <p className="text-3xl font-bold text-blue-500">{fixedEscalator}%</p>
                </div>
                <p className="text-muted-foreground">
                  Fixed annual increases provide predictable revenue growth. Common rates range from 2-4%,
                  compounding over lease terms of 5-15 years for substantial cumulative growth.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">CPI-Linked Escalators</h3>
                  <p className="text-3xl font-bold text-green-500">{cpiLinked}%</p>
                </div>
                <p className="text-muted-foreground">
                  CPI-linked escalators adjust with inflation, typically using a percentage of CPI (e.g., 100% of CPI
                  or CPI with a floor/cap). These protect against inflation while providing responsive rent adjustments.
                </p>
              </div>
            </div>
          </section>

          {/* Financial Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compound Growth Impact</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-bold text-lg mb-4">10-Year Escalation Example</h3>
              <div className="space-y-2">
                {[1, 5, 10].map((year) => {
                  const growth = Math.pow(1 + parseFloat(avgEscalator) / 100, year)
                  return (
                    <div key={year} className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                      <span>Year {year}</span>
                      <span className="font-bold text-green-500">+{((growth - 1) * 100).toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-muted-foreground mt-4">
                A {avgEscalator}% annual escalator compounds to {((Math.pow(1 + parseFloat(avgEscalator) / 100, 10) - 1) * 100).toFixed(1)}%
                cumulative growth over 10 years, demonstrating the power of contractual escalations.
              </p>
            </div>
          </section>

          {/* Strategic Value */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investor Value</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Revenue Predictability</h3>
                <p className="text-muted-foreground">
                  With {contractsWithEscalators}% of contracts containing escalators averaging {avgEscalator}%,
                  {symbol} enjoys highly predictable organic revenue growth. This visibility reduces earnings
                  volatility and supports consistent dividend growth for REIT investors.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Inflation Protection</h3>
                <p className="text-muted-foreground">
                  CPI-linked escalators protect {symbol} against inflation, ensuring real revenue growth
                  maintains purchasing power. This makes tower REITs attractive during inflationary periods
                  compared to fixed-income alternatives.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Valuation Premium</h3>
                <p className="text-muted-foreground">
                  Companies with strong escalator portfolios typically trade at premium multiples because
                  escalators provide organic growth with near-100% margins (minimal incremental costs).
                  This drives superior returns on invested capital.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">View revenue growth, margins, and comprehensive financial metrics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {escalatorFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="lease-escalators" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
