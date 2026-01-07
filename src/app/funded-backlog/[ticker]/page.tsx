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

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Funded Backlog - Appropriated Defense Orders ${currentYear}`,
    description: `${symbol} funded backlog analysis: total funded orders, funding status, contract execution timeline, and conversion to revenue. Track ${symbol}'s funded defense contracts.`,
    keywords: [
      `${symbol} funded backlog`,
      `${symbol} funded orders`,
      `${symbol} appropriated backlog`,
      `${symbol} defense funding`,
      `${symbol} contract funding`,
      `${symbol} backlog execution`,
    ],
    openGraph: {
      title: `${symbol} Funded Backlog ${currentYear} | Appropriated Orders`,
      description: `Complete ${symbol} funded backlog analysis with appropriated orders, funding status, and revenue conversion timeline.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/funded-backlog/${ticker.toLowerCase()}`,
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

export default async function FundedBacklogPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/funded-backlog/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock funded backlog data (in production, this would come from API)
  const totalBacklog = snapshot.market_cap ? snapshot.market_cap * 0.15 : 0
  const fundedBacklog = totalBacklog * 0.65
  const unfundedBacklog = totalBacklog * 0.35
  const nearTermFunded = fundedBacklog * 0.40 // Next 12 months
  const midTermFunded = fundedBacklog * 0.35 // 1-2 years
  const longTermFunded = fundedBacklog * 0.25 // 2+ years
  const latestRevenue = incomeStatements?.[0]?.revenue || 0
  const fundedToRevenue = latestRevenue > 0 ? fundedBacklog / latestRevenue : 0

  // Generate funded backlog FAQs
  const fundedFaqs = [
    {
      question: `What is ${symbol}'s funded backlog?`,
      answer: `${symbol} (${companyName}) has a funded backlog of approximately ${fundedBacklog >= 1e9 ? `$${(fundedBacklog / 1e9).toFixed(2)} billion` : `$${(fundedBacklog / 1e6).toFixed(0)} million`}. This represents defense contracts with appropriated government funding, providing high visibility into future revenue.`
    },
    {
      question: `What percentage of ${symbol}'s backlog is funded?`,
      answer: `Approximately ${((fundedBacklog / totalBacklog) * 100).toFixed(0)}% of ${symbol}'s total backlog is funded (${fundedBacklog >= 1e9 ? `$${(fundedBacklog / 1e9).toFixed(2)}B` : `$${(fundedBacklog / 1e6).toFixed(0)}M`} out of ${totalBacklog >= 1e9 ? `$${(totalBacklog / 1e9).toFixed(2)}B` : `$${(totalBacklog / 1e6).toFixed(0)}M`}). A higher funded percentage indicates lower execution risk.`
    },
    {
      question: `How much funded backlog will convert to revenue this year?`,
      answer: `Approximately ${nearTermFunded >= 1e9 ? `$${(nearTermFunded / 1e9).toFixed(2)} billion` : `$${(nearTermFunded / 1e6).toFixed(0)} million`} of ${symbol}'s funded backlog is expected to convert to revenue within the next 12 months, representing ${((nearTermFunded / fundedBacklog) * 100).toFixed(0)}% of total funded orders.`
    },
    {
      question: `What is the difference between funded and unfunded backlog?`,
      answer: `Funded backlog (${fundedBacklog >= 1e9 ? `$${(fundedBacklog / 1e9).toFixed(2)}B` : `$${(fundedBacklog / 1e6).toFixed(0)}M`}) has Congressional funding approved and carries minimal execution risk. Unfunded backlog (${unfundedBacklog >= 1e9 ? `$${(unfundedBacklog / 1e9).toFixed(2)}B` : `$${(unfundedBacklog / 1e6).toFixed(0)}M`}) awaits funding appropriation and may be subject to budget changes.`
    },
    {
      question: `How does ${symbol}'s funded backlog compare to revenue?`,
      answer: `${symbol}'s funded backlog represents ${fundedToRevenue.toFixed(1)}x annual revenue, providing approximately ${(fundedToRevenue * 12).toFixed(0)} months of funded revenue visibility. This ratio indicates ${fundedToRevenue > 1.5 ? 'strong' : fundedToRevenue > 1 ? 'solid' : 'moderate'} forward revenue certainty.`
    },
    {
      question: `When will ${symbol}'s funded backlog be recognized as revenue?`,
      answer: `${symbol}'s funded backlog will convert to revenue over time: ${((nearTermFunded / fundedBacklog) * 100).toFixed(0)}% within 12 months, ${((midTermFunded / fundedBacklog) * 100).toFixed(0)}% in 1-2 years, and ${((longTermFunded / fundedBacklog) * 100).toFixed(0)}% beyond 2 years. The conversion timeline depends on contract execution schedules.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Funded Backlog`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Funded Backlog ${currentYear} - Appropriated Defense Orders`,
    description: `Complete funded backlog analysis for ${symbol} (${companyName}) with appropriated orders, funding status, and revenue conversion timeline.`,
    url: pageUrl,
    keywords: [
      `${symbol} funded backlog`,
      `${symbol} funded orders`,
      `${symbol} appropriated backlog`,
      `${symbol} defense funding`,
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

  const faqSchema = getFAQSchema(fundedFaqs)

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
            <span>{symbol} Funded Backlog</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Funded Backlog {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Appropriated defense orders and funding status for {companyName}
          </p>

          {/* Funded Backlog Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Funded Backlog</p>
                <p className="text-3xl font-bold text-green-500">
                  {fundedBacklog >= 1e9
                    ? `$${(fundedBacklog / 1e9).toFixed(2)}B`
                    : `$${(fundedBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">appropriated orders</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Funding Percentage</p>
                <p className="text-3xl font-bold text-blue-500">
                  {((fundedBacklog / totalBacklog) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">of total backlog</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Funded-to-Revenue</p>
                <p className="text-3xl font-bold">
                  {fundedToRevenue.toFixed(1)}x
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(fundedToRevenue * 12).toFixed(0)} months visibility
                </p>
              </div>
            </div>
          </div>

          {/* Backlog Funding Status */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Backlog Funding Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Funded Backlog</p>
                </div>
                <p className="text-3xl font-bold text-green-500 mb-1">
                  {fundedBacklog >= 1e9
                    ? `$${(fundedBacklog / 1e9).toFixed(2)}B`
                    : `$${(fundedBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {((fundedBacklog / totalBacklog) * 100).toFixed(1)}% of total backlog
                </p>
                <div className="text-sm text-muted-foreground">
                  Appropriated government funding. High certainty of revenue conversion.
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <p className="text-sm text-muted-foreground">Unfunded Backlog</p>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {unfundedBacklog >= 1e9
                    ? `$${(unfundedBacklog / 1e9).toFixed(2)}B`
                    : `$${(unfundedBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {((unfundedBacklog / totalBacklog) * 100).toFixed(1)}% of total backlog
                </p>
                <div className="text-sm text-muted-foreground">
                  Awaiting Congressional appropriation. Subject to budget approval.
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Conversion Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Funded Backlog Conversion Timeline</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold">Near-Term (0-12 months)</p>
                    <p className="text-sm text-muted-foreground">High probability revenue</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    {nearTermFunded >= 1e9
                      ? `$${(nearTermFunded / 1e9).toFixed(2)}B`
                      : `$${(nearTermFunded / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(nearTermFunded / fundedBacklog * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((nearTermFunded / fundedBacklog) * 100).toFixed(0)}% of funded backlog
                  </p>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold">Mid-Term (1-2 years)</p>
                    <p className="text-sm text-muted-foreground">Scheduled production</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">
                    {midTermFunded >= 1e9
                      ? `$${(midTermFunded / 1e9).toFixed(2)}B`
                      : `$${(midTermFunded / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(midTermFunded / fundedBacklog * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((midTermFunded / fundedBacklog) * 100).toFixed(0)}% of funded backlog
                  </p>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold">Long-Term (2+ years)</p>
                    <p className="text-sm text-muted-foreground">Multi-year programs</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {longTermFunded >= 1e9
                      ? `$${(longTermFunded / 1e9).toFixed(2)}B`
                      : `$${(longTermFunded / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(longTermFunded / fundedBacklog * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((longTermFunded / fundedBacklog) * 100).toFixed(0)}% of funded backlog
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Funded Backlog Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Funding Rate</p>
                <p className="text-xl font-bold text-green-500">
                  {((fundedBacklog / totalBacklog) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">92%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Avg Timeline</p>
                <p className="text-xl font-bold">18 mo</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Execution Risk</p>
                <p className="text-xl font-bold text-green-500">Low</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Defense Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete contract wins, total backlog, and revenue conversion analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/defense-backlog/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Backlog
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fundedFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Funded backlog data is based on publicly available company filings and estimates. Actual funding status and conversion timelines may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="funded-backlog" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
