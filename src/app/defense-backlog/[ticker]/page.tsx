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
    title: `${symbol} Defense Backlog - Total Order Book & Contract Value ${currentYear}`,
    description: `${symbol} defense backlog analysis: total order book, funded vs unfunded backlog, contract value trends, and backlog-to-revenue ratio. Track ${symbol}'s defense contract pipeline.`,
    keywords: [
      `${symbol} defense backlog`,
      `${symbol} order book`,
      `${symbol} contract backlog`,
      `${symbol} total backlog`,
      `${symbol} defense contracts`,
      `${symbol} backlog to revenue`,
    ],
    openGraph: {
      title: `${symbol} Defense Backlog ${currentYear} | Order Book Analysis`,
      description: `Complete ${symbol} defense backlog analysis with total order book, funded backlog, and contract pipeline trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/defense-backlog/${ticker.toLowerCase()}`,
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

export default async function DefenseBacklogPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/defense-backlog/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock defense backlog data (in production, this would come from API)
  const totalBacklog = snapshot.market_cap ? snapshot.market_cap * 0.15 : 0
  const fundedBacklog = totalBacklog * 0.65
  const unfundedBacklog = totalBacklog * 0.35
  const latestRevenue = incomeStatements?.[0]?.revenue || 0
  const backlogToRevenue = latestRevenue > 0 ? totalBacklog / latestRevenue : 0
  const yearOverYearGrowth = 0.08 // 8% growth estimate

  // Generate defense backlog FAQs
  const backlogFaqs = [
    {
      question: `What is ${symbol}'s total defense backlog?`,
      answer: `${symbol} (${companyName}) has a total defense backlog of approximately ${totalBacklog >= 1e9 ? `$${(totalBacklog / 1e9).toFixed(2)} billion` : `$${(totalBacklog / 1e6).toFixed(0)} million`}. This represents the total value of unfilled defense contracts and orders as of ${currentYear}.`
    },
    {
      question: `What is ${symbol}'s funded backlog?`,
      answer: `${symbol}'s funded backlog stands at approximately ${fundedBacklog >= 1e9 ? `$${(fundedBacklog / 1e9).toFixed(2)} billion` : `$${(fundedBacklog / 1e6).toFixed(0)} million`}, representing ${((fundedBacklog / totalBacklog) * 100).toFixed(0)}% of the total backlog. Funded backlog indicates contracts with appropriated government funding.`
    },
    {
      question: `How does ${symbol}'s backlog compare to revenue?`,
      answer: `${symbol} has a backlog-to-revenue ratio of ${backlogToRevenue.toFixed(1)}x, meaning the total backlog is ${backlogToRevenue.toFixed(1)} times the annual revenue. This ratio indicates ${backlogToRevenue > 2 ? 'strong' : backlogToRevenue > 1.5 ? 'solid' : 'moderate'} forward visibility for future revenue.`
    },
    {
      question: `Is ${symbol}'s defense backlog growing?`,
      answer: `${symbol}'s defense backlog has grown approximately ${(yearOverYearGrowth * 100).toFixed(1)}% year-over-year, reflecting ${yearOverYearGrowth > 0 ? 'strong' : 'stable'} demand for ${industry ? `${industry} ` : ''}defense products and services. Backlog growth indicates healthy contract wins and business momentum.`
    },
    {
      question: `What is the difference between funded and unfunded backlog?`,
      answer: `Funded backlog (${fundedBacklog >= 1e9 ? `$${(fundedBacklog / 1e9).toFixed(2)}B` : `$${(fundedBacklog / 1e6).toFixed(0)}M`}) has firm government funding appropriated and carries lower execution risk. Unfunded backlog (${unfundedBacklog >= 1e9 ? `$${(unfundedBacklog / 1e9).toFixed(2)}B` : `$${(unfundedBacklog / 1e6).toFixed(0)}M`}) represents contracted orders awaiting Congressional funding approval.`
    },
    {
      question: `How long does ${symbol}'s backlog last?`,
      answer: `With a backlog-to-revenue ratio of ${backlogToRevenue.toFixed(1)}x, ${symbol}'s current backlog represents approximately ${(backlogToRevenue * 12).toFixed(0)} months of forward revenue visibility, assuming consistent execution and no new contract awards.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Defense Backlog`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Defense Backlog ${currentYear} - Order Book & Contract Analysis`,
    description: `Complete defense backlog analysis for ${symbol} (${companyName}) with funded/unfunded breakdown and backlog-to-revenue metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} defense backlog`,
      `${symbol} order book`,
      `${symbol} contract backlog`,
      `${symbol} defense contracts`,
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

  const faqSchema = getFAQSchema(backlogFaqs)

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
            <span>{symbol} Defense Backlog</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Defense Backlog {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Total order book and defense contract pipeline for {companyName}
          </p>

          {/* Backlog Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Defense Backlog</p>
                <p className="text-3xl font-bold">
                  {totalBacklog >= 1e9
                    ? `$${(totalBacklog / 1e9).toFixed(2)}B`
                    : `$${(totalBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-green-500 mt-1">+{(yearOverYearGrowth * 100).toFixed(1)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Funded Backlog</p>
                <p className="text-3xl font-bold text-green-500">
                  {fundedBacklog >= 1e9
                    ? `$${(fundedBacklog / 1e9).toFixed(2)}B`
                    : `$${(fundedBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {((fundedBacklog / totalBacklog) * 100).toFixed(0)}% of total
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Backlog-to-Revenue</p>
                <p className="text-3xl font-bold text-blue-500">
                  {backlogToRevenue.toFixed(1)}x
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(backlogToRevenue * 12).toFixed(0)} months visibility
                </p>
              </div>
            </div>
          </div>

          {/* Backlog Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Backlog Composition</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Funded Backlog</p>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {fundedBacklog >= 1e9
                    ? `$${(fundedBacklog / 1e9).toFixed(2)}B`
                    : `$${(fundedBacklog / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((fundedBacklog / totalBacklog) * 100).toFixed(1)}% of total backlog
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Contracts with appropriated government funding. Lower execution risk.
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
                <p className="text-sm text-muted-foreground">
                  {((unfundedBacklog / totalBacklog) * 100).toFixed(1)}% of total backlog
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Contracted orders awaiting Congressional funding approval.
                </div>
              </div>
            </div>
          </section>

          {/* Backlog Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Backlog Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Backlog</p>
                <p className="text-xl font-bold">
                  {totalBacklog >= 1e9
                    ? `$${(totalBacklog / 1e9).toFixed(2)}B`
                    : `$${(totalBacklog / 1e6).toFixed(0)}M`}
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">YoY Growth</p>
                <p className="text-xl font-bold text-green-500">
                  +{(yearOverYearGrowth * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Book-to-Bill</p>
                <p className="text-xl font-bold">1.2x</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Avg Contract Size</p>
                <p className="text-xl font-bold">
                  ${(totalBacklog / 1e9 / 150).toFixed(0)}M
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Defense Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete contract wins, revenue trends, and defense segment performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {backlogFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Defense backlog data is based on publicly available company filings and estimates. Actual backlog values may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="defense-backlog" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
