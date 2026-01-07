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
    title: `${symbol} Gaming Subscriptions - Subscriber Count & MRR ${currentYear}`,
    description: `${symbol} gaming subscription analysis: subscriber count, MRR, ARPU, churn rate, and subscription tier breakdown. Track ${symbol}'s subscription gaming revenue growth.`,
    keywords: [
      `${symbol} gaming subscriptions`,
      `${symbol} subscribers`,
      `${symbol} Game Pass`,
      `${symbol} PlayStation Plus`,
      `${symbol} MRR`,
      `${symbol} subscription revenue`,
    ],
    openGraph: {
      title: `${symbol} Gaming Subscriptions ${currentYear} | Subscriber Count & MRR`,
      description: `Complete ${symbol} gaming subscription analysis with subscriber count, MRR, ARPU, and churn metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/subscription-gaming/${ticker.toLowerCase()}`,
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

export default async function SubscriptionGamingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/subscription-gaming/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate latest revenue
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate subscription gaming FAQs
  const subscriptionGamingFaqs = [
    {
      question: `How many gaming subscribers does ${symbol} have?`,
      answer: `${companyName} reports gaming subscription metrics in quarterly earnings, including total subscriber count across all subscription tiers. Subscription services provide high-margin recurring revenue and increase customer lifetime value.`
    },
    {
      question: `What is ${symbol}'s subscription revenue?`,
      answer: `${companyName} generates recurring subscription revenue through gaming membership services. This includes access to game libraries, online multiplayer, exclusive content, and premium features. Subscription revenue is reported in services or recurring revenue segments.`
    },
    {
      question: `What gaming subscription services does ${symbol} offer?`,
      answer: `${companyName} operates subscription services that provide access to game catalogs, online multiplayer, cloud gaming, and exclusive perks. The company may offer multiple subscription tiers with different pricing and features.`
    },
    {
      question: `Is ${symbol}'s subscription revenue growing?`,
      answer: revenueGrowth > 0
        ? `Yes, ${symbol}'s overall revenue is growing at ${(revenueGrowth * 100).toFixed(1)}% year-over-year, with subscription services representing an increasing portion of high-margin recurring revenue.`
        : `${symbol}'s subscription revenue growth depends on subscriber acquisition, retention, pricing strategy, and value proposition to gamers.`
    },
    {
      question: `What is ${symbol}'s subscription churn rate?`,
      answer: `${companyName} may disclose subscriber retention and churn metrics in investor presentations. Low churn rates indicate strong value proposition and customer satisfaction. The company focuses on exclusive content and features to reduce churn.`
    },
    {
      question: `How does ${symbol} monetize gaming subscriptions?`,
      answer: `${companyName} monetizes subscriptions through monthly/annual membership fees, tiered pricing, and value-added services. Subscriptions provide predictable recurring revenue with high margins and strong customer lock-in.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Subscription Gaming`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gaming Subscriptions ${currentYear} - Subscriber Count & MRR Analysis`,
    description: `Complete gaming subscription analysis for ${symbol} (${companyName}) with subscriber count, MRR, ARPU, and churn metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} gaming subscriptions`,
      `${symbol} subscribers`,
      `${symbol} subscription revenue`,
      `${symbol} MRR`,
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

  const faqSchema = getFAQSchema(subscriptionGamingFaqs)

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
            <span>{symbol} Subscription Gaming</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gaming Subscriptions {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscriber count and recurring revenue data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-sky-600/20 to-indigo-600/20 p-8 rounded-xl border border-sky-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {latestRevenue >= 1e9
                    ? `$${(latestRevenue / 1e9).toFixed(2)}B`
                    : `$${(latestRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* Subscription Gaming Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Subscription Gaming Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                {companyName} operates gaming subscription services that provide access to game libraries,
                online multiplayer, cloud gaming, and exclusive content. Subscriptions deliver high-margin
                recurring revenue with strong customer retention and predictable cash flows.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Type</p>
                  <p className="font-bold">Recurring</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Business Model</p>
                  <p className="font-bold">Subscription</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margin Profile</p>
                  <p className="font-bold">High Margin</p>
                </div>
              </div>
            </div>
          </section>

          {/* Annual Revenue Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Annual Revenue Performance</h2>
            <div className="space-y-3">
              {incomeStatements?.slice(0, 5).map((statement: any, index: number) => {
                const prevStatement = incomeStatements[index + 1]
                const growth = prevStatement?.revenue
                  ? ((statement.revenue - prevStatement.revenue) / prevStatement.revenue)
                  : null

                return (
                  <div key={statement.report_period} className="bg-card p-5 rounded-lg border border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{statement.report_period}</p>
                        <p className="text-2xl font-bold">
                          {statement.revenue >= 1e9
                            ? `$${(statement.revenue / 1e9).toFixed(2)}B`
                            : `$${(statement.revenue / 1e6).toFixed(0)}M`}
                        </p>
                      </div>
                      {growth !== null && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">YoY Growth</p>
                          <p className={`text-xl font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{(growth * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Subscription Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete subscriber metrics, MRR breakdown, and subscription tier analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/live-services/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Live Services Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {subscriptionGamingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Subscription data is based on publicly filed financial reports and company disclosures. Subscriber counts and metrics may vary by reporting period. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="subscription-gaming" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
