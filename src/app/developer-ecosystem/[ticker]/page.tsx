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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Developer Ecosystem - API Platform & Developer Community`,
    description: `${symbol} developer ecosystem analysis. Track API adoption, developer community growth, third-party apps, and platform extensibility.`,
    keywords: [
      `${symbol} developers`,
      `${symbol} API`,
      `${symbol} developer platform`,
      `${symbol} developer community`,
      `${symbol} SDK`,
      `${symbol} developer tools`,
    ],
    openGraph: {
      title: `${symbol} Developer Ecosystem | API & Developer Platform`,
      description: `Comprehensive analysis of ${symbol} developer ecosystem, API platform, and community growth.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/developer-ecosystem/${ticker.toLowerCase()}`,
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

export default async function DeveloperEcosystemPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/developer-ecosystem/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many developers use ${symbol}'s platform?`,
      answer: `${symbol} (${companyName}) tracks developer adoption through registered developers, API usage, and third-party applications built on its platform. Developer count is a key ecosystem health metric.`
    },
    {
      question: `What APIs does ${symbol} offer to developers?`,
      answer: `${companyName}'s API platform typically includes REST APIs, GraphQL endpoints, webhooks, SDKs, and developer tools for building integrations and applications.`
    },
    {
      question: `How does the developer ecosystem drive ${symbol} growth?`,
      answer: `Developers extend ${symbol}'s platform capabilities, create new use cases, drive customer adoption, and build network effects that strengthen competitive positioning.`
    },
    {
      question: `Does ${symbol} monetize its developer platform?`,
      answer: `Developer platforms can generate revenue through API usage tiers, marketplace commissions, partner programs, and increased core product adoption driven by third-party apps.`
    },
    {
      question: `What developer tools does ${symbol} provide?`,
      answer: `${companyName} typically offers SDKs, documentation, testing environments, developer portals, community forums, and technical support to enable ecosystem growth.`
    },
    {
      question: `How is ${symbol}'s developer community growing?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}developer community growth is measured by active developers, API calls, published integrations, and community engagement metrics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Developer Ecosystem`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Developer Ecosystem - API Platform & Developer Community`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) developer ecosystem and API platform.`,
    url: pageUrl,
    keywords: [
      `${symbol} developers`,
      `${symbol} API`,
      `${symbol} developer platform`,
      `${symbol} developer community`,
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
            <span>{symbol} Developer Ecosystem</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Developer Ecosystem
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            API platform and developer community for {companyName}
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

          {/* Developer Ecosystem Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Developer Ecosystem Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s developer ecosystem encompasses the community of developers building on its platform,
                creating integrations, applications, and extensions that expand product capabilities.
              </p>
              <p className="text-muted-foreground">
                A thriving developer ecosystem indicates platform strength, extensibility, and long-term competitive advantage.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Developer Metrics</h2>
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

          {/* Developer Platform Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Developer Platform Components</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>APIs & SDKs:</strong> RESTful APIs, GraphQL, language-specific SDKs for platform access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Developer Tools:</strong> Documentation, testing environments, debugging tools, and sandboxes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>App Marketplace:</strong> Distribution channel for third-party applications and integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Community:</strong> Forums, events, certification programs, and developer relations</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Platform Strategy</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed ecosystem metrics, developer analytics, and platform growth data
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
          <RelatedLinks ticker={symbol} currentPage="developer-ecosystem" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
