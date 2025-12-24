import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} RPO - Remaining Performance Obligations ${currentYear}`,
    description: `${symbol} remaining performance obligations (RPO) and cRPO analysis: track contracted revenue backlog and future revenue visibility for ${symbol}.`,
    keywords: [
      `${symbol} RPO`,
      `${symbol} remaining performance obligations`,
      `${symbol} cRPO`,
      `${symbol} current RPO`,
      `${symbol} backlog`,
      `${symbol} contracted revenue`,
    ],
    openGraph: {
      title: `${symbol} RPO ${currentYear} | Remaining Performance Obligations`,
      description: `Complete ${symbol} RPO analysis with contracted backlog, future revenue visibility, and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/rpo/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function RPOPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/rpo/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate RPO FAQs
  const rpoFaqs = [
    {
      question: `What is ${symbol}'s RPO?`,
      answer: `Remaining Performance Obligations (RPO) for ${companyName} represents the total contracted revenue that has not yet been recognized. This includes deferred revenue on the balance sheet plus committed but unbilled future revenue from multi-year contracts. RPO provides visibility into future revenue.`
    },
    {
      question: `What is the difference between RPO and cRPO?`,
      answer: `For ${companyName}, total RPO includes all contracted revenue regardless of timing, while current RPO (cRPO) represents revenue expected to be recognized in the next 12 months. cRPO is a more actionable near-term revenue visibility metric.`
    },
    {
      question: `Why is RPO important for ${symbol}?`,
      answer: `RPO is critical for ${companyName} because it shows committed future revenue from signed contracts. Growing RPO indicates strong sales execution and provides predictable revenue visibility. RPO growth faster than revenue growth suggests accelerating bookings momentum.`
    },
    {
      question: `How does ${symbol} report RPO?`,
      answer: `${companyName} discloses RPO in quarterly earnings reports and SEC filings, typically breaking it down into current RPO (next 12 months) and total RPO. Some companies also report calculated RPO or contract value metrics.`
    },
    {
      question: `What drives ${symbol}'s RPO growth?`,
      answer: `RPO growth for ${companyName} is driven by new customer bookings, expansion from existing customers, multi-year contract renewals, and average contract duration. Strong RPO growth relative to revenue indicates building sales momentum.`
    },
    {
      question: `How does RPO relate to deferred revenue?`,
      answer: `Deferred revenue is the portion of ${companyName}'s RPO that has been invoiced but not yet recognized. Total RPO = Deferred Revenue + Future committed (but not yet invoiced) revenue. RPO provides a more complete view of the contracted backlog.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} RPO`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} RPO ${currentYear} - Remaining Performance Obligations Analysis`,
    description: `Complete RPO analysis for ${symbol} (${companyName}) with contracted backlog, future revenue visibility, and growth trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} RPO`,
      `${symbol} remaining performance obligations`,
      `${symbol} cRPO`,
      `${symbol} contracted revenue`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(rpoFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} RPO</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Remaining Performance Obligations {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Contracted revenue backlog and future revenue visibility for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">RPO Metrics</h2>
            <p className="text-muted-foreground">
              {companyName} reports Remaining Performance Obligations (RPO) in quarterly filings.
              RPO represents total contracted revenue not yet recognized, providing clear visibility
              into future revenue from signed customer contracts.
            </p>
          </div>

          {/* Why RPO Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why RPO Matters</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Visibility</h3>
                <p className="text-muted-foreground">
                  RPO provides concrete visibility into future revenue from signed contracts.
                  This is especially valuable for subscription businesses where revenue is
                  recognized over time but contracts are signed upfront.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Sales Momentum Indicator</h3>
                <p className="text-muted-foreground">
                  Growing RPO, especially when growing faster than revenue, indicates strong
                  bookings and sales execution. This is a leading indicator of accelerating
                  business momentum.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Contract Duration Signal</h3>
                <p className="text-muted-foreground">
                  The ratio of RPO to quarterly revenue reveals average contract length.
                  Higher ratios indicate longer commitments, greater predictability, and
                  stronger customer confidence.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Business Quality</h3>
                <p className="text-muted-foreground">
                  Consistent RPO growth demonstrates the ability to win and retain customers
                  with multi-year commitments, indicating strong product-market fit and
                  competitive positioning.
                </p>
              </div>
            </div>
          </section>

          {/* RPO Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding RPO</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">RPO Components</h3>
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-blue-500">Current RPO (cRPO)</h4>
                      <p className="text-sm text-muted-foreground">
                        Revenue expected to be recognized in the next 12 months from existing contracts.
                        This is the most actionable near-term revenue visibility metric.
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-purple-500">Non-Current RPO</h4>
                      <p className="text-sm text-muted-foreground">
                        Revenue from contracts expected to be recognized beyond 12 months.
                        Indicates long-term committed revenue from multi-year deals.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold mb-3">Total RPO Formula</h3>
                  <div className="bg-secondary/30 p-4 rounded-lg font-mono text-sm mb-3">
                    Total RPO = Current RPO + Non-Current RPO
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-lg font-mono text-sm">
                    Total RPO = Deferred Revenue + Committed Future Revenue
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key RPO Metrics to Track */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key RPO Metrics to Track</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Total RPO</h3>
                <p className="text-sm text-muted-foreground">
                  All contracted revenue not yet recognized
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">Current RPO (cRPO)</h3>
                <p className="text-sm text-muted-foreground">
                  Revenue to be recognized in next 12 months
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">RPO Growth Rate</h3>
                <p className="text-sm text-muted-foreground">
                  Year-over-year RPO growth vs revenue growth
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">RPO to Revenue Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  Indicates average contract duration and visibility
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-1">cRPO to Quarterly Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Coverage ratio for next year's revenue
                </p>
              </div>
            </div>
          </section>

          {/* RPO Growth Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What RPO Growth Tells You</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-green-500 mb-1">RPO Growing Faster Than Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Accelerating bookings and sales momentum. Strong signal for future revenue growth.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-500 mb-1">RPO Growing In-Line With Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Stable bookings matching revenue recognition. Predictable, sustainable growth.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-yellow-500/30">
                <h3 className="font-bold text-yellow-500 mb-1">RPO Growing Slower Than Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Slowing bookings or shorter contract terms. Monitor for potential deceleration.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-red-500 mb-1">Declining RPO</h3>
                <p className="text-sm text-muted-foreground">
                  Negative bookings or high churn. Significant concern for future revenue.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Contract Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete RPO data, contract analysis, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {rpoFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> RPO data is based on disclosures in quarterly earnings reports and SEC filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
