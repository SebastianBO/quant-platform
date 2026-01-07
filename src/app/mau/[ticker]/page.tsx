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
    title: `${symbol} MAU - Monthly Active Users & Growth Trends ${currentYear}`,
    description: `${symbol} monthly active users (MAU): Current MAU, historical growth, user trends, and engagement metrics. Analyze ${symbol}'s monthly user base evolution.`,
    keywords: [
      `${symbol} MAU`,
      `${symbol} monthly active users`,
      `${symbol} user count`,
      `${symbol} user growth`,
      `${symbol} active users`,
      `${symbol} user base`,
    ],
    openGraph: {
      title: `${symbol} MAU - Monthly Active Users Analysis`,
      description: `${symbol} monthly active users analysis with historical trends and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/mau/${ticker.toLowerCase()}`,
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

export default async function MAUPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/mau/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const mauFaqs = [
    {
      question: `What is ${symbol}'s MAU (monthly active users)?`,
      answer: `${symbol} (${companyName}) monthly active users (MAU) represents the total number of unique users who engage with the platform at least once during a 30-day period. MAU is a key metric for measuring overall user base size and platform reach.`
    },
    {
      question: `How does ${symbol} calculate MAU?`,
      answer: `Monthly Active Users (MAU) for ${symbol} is calculated by counting unique users who perform at least one meaningful action on the platform within a rolling 30-day window. This metric provides a broader view of the total user base compared to DAU.`
    },
    {
      question: `What is a good MAU growth rate for ${symbol}?`,
      answer: `For ${sector || 'technology'} companies like ${symbol}, MAU growth rates vary by maturity stage. Early-stage companies often target 20-50% annual MAU growth, while mature platforms may see 5-15% growth. Consistent MAU growth indicates healthy user acquisition and retention.`
    },
    {
      question: `How does MAU relate to revenue for ${symbol}?`,
      answer: `${symbol}'s MAU is a leading indicator of revenue potential. Combined with ARPU (average revenue per user), MAU helps predict total revenue. Growing MAU with stable or increasing ARPU typically drives strong revenue growth.`
    },
    {
      question: `What is the DAU/MAU ratio for ${symbol}?`,
      answer: `The DAU/MAU ratio measures how frequently monthly users engage daily. A higher ratio indicates better engagement. For ${symbol}, this metric shows platform stickiness - how often users return within a month. Social platforms typically aim for ratios above 0.5.`
    },
    {
      question: `Where can I find ${symbol}'s MAU data?`,
      answer: `${symbol} reports MAU metrics in quarterly earnings releases, 10-Q/10-K filings, and investor presentations. Historical MAU trends are available in the company's investor relations section and financial databases.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} MAU`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} MAU - Monthly Active Users Analysis ${currentYear}`,
    description: `Complete ${symbol} monthly active users analysis with growth trends and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} MAU`,
      `${symbol} monthly active users`,
      `${symbol} user growth`,
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

  const faqSchema = getFAQSchema(mauFaqs)

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
            <span>{symbol} MAU</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} MAU - Monthly Active Users
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} monthly active users and growth trends
          </p>

          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly Active Users</p>
              <p className="text-4xl font-bold mb-4">MAU Metrics</p>
              <p className="text-muted-foreground">
                Track monthly user base for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding MAU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-purple-500 mb-2">What MAU Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Total monthly user reach</li>
                  <li>User base growth trajectory</li>
                  <li>Market penetration levels</li>
                  <li>Acquisition effectiveness</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Why MAU Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Predicts revenue potential</li>
                  <li>Shows network effects</li>
                  <li>Indicates brand strength</li>
                  <li>Guides valuation models</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">MAU vs DAU Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">DAU/MAU Ratio</p>
                  <p className="text-sm text-muted-foreground">
                    The ratio of daily to monthly active users shows engagement frequency. Higher ratios indicate users engage with the platform more frequently within the month.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Engagement Interpretation</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>0.6+ ratio: Exceptional daily engagement</li>
                    <li>0.4-0.6 ratio: Strong engagement</li>
                    <li>0.2-0.4 ratio: Moderate engagement</li>
                    <li>Below 0.2: Lower frequency use case</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-purple-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
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
                href={`/dau/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View DAU Metrics
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {mauFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> User metrics are based on company disclosures and public filings. MAU definitions may vary by company. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
