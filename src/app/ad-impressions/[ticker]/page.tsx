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
    title: `${symbol} Ad Impressions - Advertising Metrics & Growth ${currentYear}`,
    description: `${symbol} ad impressions: Total impressions, growth trends, CPM rates, and advertising revenue metrics. Analyze ${symbol}'s advertising performance.`,
    keywords: [
      `${symbol} ad impressions`,
      `${symbol} advertising`,
      `${symbol} impressions`,
      `${symbol} ad revenue`,
      `${symbol} CPM`,
      `${symbol} advertising metrics`,
    ],
    openGraph: {
      title: `${symbol} Ad Impressions - Advertising Metrics`,
      description: `${symbol} ad impressions analysis with growth trends and monetization metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ad-impressions/${ticker.toLowerCase()}`,
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

export default async function AdImpressionsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ad-impressions/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const adImpressionsFaqs = [
    {
      question: `What are ${symbol}'s ad impressions?`,
      answer: `${symbol} (${companyName}) ad impressions represent the total number of times advertisements are displayed to users on the platform. Each time an ad is shown counts as one impression, making it a fundamental metric for advertising-supported ${sector || 'technology'} companies.`
    },
    {
      question: `How does ${symbol} generate ad impressions?`,
      answer: `${symbol} generates ad impressions through various placements including feeds, stories, videos, search results, and other content areas. The number of impressions depends on user engagement, time spent on platform, and the number of ad slots shown per session.`
    },
    {
      question: `What is CPM for ${symbol} ads?`,
      answer: `CPM (Cost Per Mille or cost per thousand impressions) is what advertisers pay ${symbol} for 1,000 ad impressions. Higher CPM indicates better monetization and advertiser demand. ${symbol}'s CPM varies by ad format, placement, audience quality, and market conditions.`
    },
    {
      question: `How do ad impressions drive revenue for ${symbol}?`,
      answer: `${symbol}'s advertising revenue is calculated as: Ad Revenue = (Total Impressions / 1,000) × Average CPM. Growing impressions combined with stable or rising CPM drives advertising revenue growth. This makes impression growth a key revenue driver.`
    },
    {
      question: `What factors affect ${symbol}'s ad impression growth?`,
      answer: `${symbol}'s ad impression growth is influenced by user base growth (MAU/DAU), time spent per user, ad load (impressions per user), new ad formats and placements, and seasonal patterns. Balancing user experience with ad load is critical for sustainable growth.`
    },
    {
      question: `How can I track ${symbol}'s ad impressions over time?`,
      answer: `${symbol} may report ad impression metrics in quarterly earnings calls, investor presentations, or annual reports. Some companies provide total impressions, impressions per user, or year-over-year growth rates. Ad revenue growth can also serve as a proxy for impression trends.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Ad Impressions`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Ad Impressions - Advertising Metrics Analysis ${currentYear}`,
    description: `Complete ${symbol} ad impressions analysis with growth trends and monetization metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ad impressions`,
      `${symbol} advertising`,
      `${symbol} impressions`,
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

  const faqSchema = getFAQSchema(adImpressionsFaqs)

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
            <span>{symbol} Ad Impressions</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Ad Impressions
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} advertising metrics and impression analytics
          </p>

          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Advertising Impressions</p>
              <p className="text-4xl font-bold mb-4">Ad Metrics</p>
              <p className="text-muted-foreground">
                Track advertising performance for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Ad Impressions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-orange-500 mb-2">What Impressions Measure</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Total ad exposure volume</li>
                  <li>Advertising inventory scale</li>
                  <li>User engagement potential</li>
                  <li>Revenue generation capacity</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-red-500 mb-2">Why Impressions Matter</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Drive advertising revenue</li>
                  <li>Show platform reach</li>
                  <li>Indicate user engagement</li>
                  <li>Support valuation models</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad Revenue Calculation</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Formula</p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm">
                    Ad Revenue = (Total Impressions / 1,000) × Average CPM
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Example Calculation</p>
                  <p className="text-sm text-muted-foreground">
                    If {symbol} delivers 10 billion impressions at $5 CPM:
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ad Revenue = (10,000,000,000 / 1,000) × $5 = $50 million
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Key Metrics</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>Total Impressions: Overall ad delivery volume</li>
                    <li>Impressions per User: Ad load intensity</li>
                    <li>CPM: Price per 1,000 impressions</li>
                    <li>Fill Rate: Percentage of inventory sold</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impression Growth Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">User Growth</h3>
                <p className="text-sm text-muted-foreground">
                  More users (MAU/DAU) directly increases total impression inventory
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Engagement</h3>
                <p className="text-sm text-muted-foreground">
                  Longer session times and higher frequency create more impression opportunities
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad Load</h3>
                <p className="text-sm text-muted-foreground">
                  More ads per session increases impressions per user while balancing UX
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600/20 to-orange-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, advertising metrics, and AI-powered insights
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {adImpressionsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Ad impression data is based on company disclosures. Metrics definitions and measurement methodologies may vary. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
