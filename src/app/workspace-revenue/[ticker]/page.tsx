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

  return {
    title: `${symbol} Workspace Revenue - Team & Collaboration Monetization`,
    description: `${symbol} workspace revenue analysis. Track team-based monetization, collaboration revenue, workspace expansion, and multi-user growth.`,
    keywords: [
      `${symbol} workspace revenue`,
      `${symbol} team revenue`,
      `${symbol} collaboration revenue`,
      `${symbol} workspace growth`,
      `${symbol} team expansion`,
      `${symbol} multi-user`,
    ],
    openGraph: {
      title: `${symbol} Workspace Revenue | Team Monetization Analysis`,
      description: `Comprehensive analysis of ${symbol} workspace revenue and team-based monetization strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/workspace-revenue/${ticker.toLowerCase()}`,
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

export default async function WorkspaceRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/workspace-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `What is ${symbol}'s workspace revenue?`,
      answer: `${symbol} (${companyName}) generates workspace revenue from team-based subscriptions where multiple users collaborate. This revenue model benefits from seat expansion and team growth.`
    },
    {
      question: `How does workspace revenue grow for ${symbol}?`,
      answer: `Workspace revenue grows through new workspace creation, seat expansion within workspaces, team upgrades, and collaboration feature adoption within ${companyName}'s platform.`
    },
    {
      question: `What is average revenue per workspace for ${symbol}?`,
      answer: `Average revenue per workspace (ARPW) shows ${companyName}'s monetization effectiveness. It's calculated by dividing total workspace revenue by the number of active workspaces.`
    },
    {
      question: `Why is workspace revenue important for ${symbol} stock?`,
      answer: `Workspace revenue provides higher lifetime value, better retention, and stronger network effects compared to individual users. It's a key driver of ${symbol}'s growth and valuation.`
    },
    {
      question: `How does ${symbol} encourage workspace expansion?`,
      answer: `${companyName} drives workspace growth through collaboration features, team permissions, shared resources, integrations, and pricing incentives for multi-user adoption.`
    },
    {
      question: `What is ${symbol}'s workspace retention rate?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}workspace retention rates are typically higher than individual user retention due to switching costs, collaboration dependencies, and team workflows.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Workspace Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Workspace Revenue - Team & Collaboration Monetization`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) workspace revenue and team-based monetization.`,
    url: pageUrl,
    keywords: [
      `${symbol} workspace revenue`,
      `${symbol} team revenue`,
      `${symbol} collaboration revenue`,
      `${symbol} workspace growth`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Workspace Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Workspace Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Team and collaboration monetization for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Workspace Revenue Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Workspace Revenue Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Workspace revenue represents the monetization of team-based collaboration on {companyName}'s platform.
                Each workspace typically contains multiple users working together, driving higher ARPU and retention.
              </p>
              <p className="text-muted-foreground">
                Workspace-based models benefit from network effects, collaboration lock-in, and natural expansion
                as teams grow and adopt more features.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Workspace Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(snapshot.market_cap / 1e9).toFixed(1)}B
                </p>
              </div>
              {metrics?.revenue_growth && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(metrics.revenue_growth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {metrics?.gross_margin && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-xl font-bold">{(metrics.gross_margin * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </section>

          {/* Workspace Revenue Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Workspace Revenue Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Workspace Creation:</strong> New teams and organizations adopting the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Seat Expansion:</strong> Teams adding more members to existing workspaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Feature Upgrades:</strong> Workspaces upgrading to higher-tier plans for advanced features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Collaboration Tools:</strong> Increased usage of team features driving consumption revenue</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Team Growth</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed workspace analytics, team expansion metrics, and revenue projections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="workspace-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
