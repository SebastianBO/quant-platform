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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} DAU - Daily Active Users & User Metrics ${currentYear}`,
    description: `${symbol} daily active users (DAU): Current DAU, historical trends, user engagement metrics, and growth analysis. Track ${symbol}'s daily user base.`,
    keywords: [
      `${symbol} DAU`,
      `${symbol} daily active users`,
      `${symbol} user metrics`,
      `${symbol} engagement`,
      `${symbol} active users`,
      `${symbol} user growth`,
    ],
    openGraph: {
      title: `${symbol} DAU - Daily Active Users Analysis`,
      description: `${symbol} daily active users analysis with historical trends and engagement metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dau/${ticker.toLowerCase()}`,
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

export default async function DAUPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/dau/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const dauFaqs = [
    {
      question: `What is ${symbol}'s DAU (daily active users)?`,
      answer: `${symbol} (${companyName}) daily active users (DAU) represents the number of unique users who engage with the platform on a daily basis. DAU is a key metric for ${sector || 'technology'} companies to measure user engagement and platform health.`
    },
    {
      question: `How is DAU calculated for ${symbol}?`,
      answer: `Daily Active Users (DAU) for ${symbol} is calculated by counting unique users who perform at least one meaningful action on the platform within a 24-hour period. This typically includes logging in, posting content, viewing content, or engaging with features.`
    },
    {
      question: `Why is DAU important for ${symbol} investors?`,
      answer: `DAU is crucial for ${symbol} investors because it directly impacts advertising revenue, user monetization, and platform value. Growing DAU indicates strong user engagement and potential for revenue growth, while declining DAU may signal competitive pressures or product issues.`
    },
    {
      question: `How does ${symbol}'s DAU compare to MAU?`,
      answer: `The DAU/MAU ratio for ${symbol} shows how sticky the platform is. A higher ratio (closer to 1.0) means users engage daily rather than sporadically. For social media and app-based companies, a DAU/MAU ratio above 0.5 is typically considered strong engagement.`
    },
    {
      question: `What drives DAU growth for ${symbol}?`,
      answer: `${symbol}'s DAU growth is driven by product innovations, new feature launches, geographic expansion, marketing campaigns, and network effects. ${sector ? `In the ${sector} sector, ` : ''}user acquisition and retention strategies are key to sustainable DAU growth.`
    },
    {
      question: `How can I track ${symbol} DAU over time?`,
      answer: `${symbol} typically reports DAU metrics in quarterly earnings reports and investor presentations. Historical DAU trends help investors assess user growth momentum and platform health. Compare DAU growth to revenue growth to understand monetization efficiency.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} DAU`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} DAU - Daily Active Users Analysis ${currentYear}`,
    description: `Complete ${symbol} daily active users analysis with trends and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} DAU`,
      `${symbol} daily active users`,
      `${symbol} user metrics`,
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

  const faqSchema = getFAQSchema(dauFaqs)

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
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} DAU</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} DAU - Daily Active Users
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} daily active users and engagement metrics
          </p>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Daily Active Users</p>
              <p className="text-4xl font-bold mb-4">DAU Metrics</p>
              <p className="text-muted-foreground">
                Track daily user engagement for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding DAU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">What DAU Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Daily user engagement levels</li>
                  <li>Platform stickiness and retention</li>
                  <li>User base growth momentum</li>
                  <li>Revenue potential from active users</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Why DAU Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Indicates product-market fit</li>
                  <li>Drives advertising revenue</li>
                  <li>Shows competitive positioning</li>
                  <li>Predicts long-term value</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete user metrics, financials, and AI-powered insights
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
                Financial Reports
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {dauFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> User metrics are based on company disclosures and public filings. DAU definitions may vary by company. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
