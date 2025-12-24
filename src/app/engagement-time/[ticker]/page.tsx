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
    title: `${symbol} Engagement Time - User Session & Time Spent Metrics ${currentYear}`,
    description: `${symbol} engagement time: Average session duration, time spent per user, engagement trends, and usage metrics. Analyze ${symbol}'s user engagement.`,
    keywords: [
      `${symbol} engagement time`,
      `${symbol} time spent`,
      `${symbol} session duration`,
      `${symbol} user engagement`,
      `${symbol} usage metrics`,
      `${symbol} engagement`,
    ],
    openGraph: {
      title: `${symbol} Engagement Time - User Session Metrics`,
      description: `${symbol} engagement time analysis with session duration and usage trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/engagement-time/${ticker.toLowerCase()}`,
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

export default async function EngagementTimePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/engagement-time/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const engagementFaqs = [
    {
      question: `What is ${symbol}'s engagement time?`,
      answer: `${symbol} (${companyName}) engagement time measures how long users spend on the platform. This includes average session duration, daily time spent, and total monthly engagement hours. For ${sector || 'technology'} companies, engagement time is a critical indicator of product stickiness and user value.`
    },
    {
      question: `How is engagement time measured for ${symbol}?`,
      answer: `Engagement time for ${symbol} is typically measured as: (1) Average session duration - time per visit, (2) Daily time spent per user - total minutes per day, (3) Monthly time spent - aggregate hours per user. These metrics help assess platform stickiness and competitive moat.`
    },
    {
      question: `Why is engagement time important for ${symbol} investors?`,
      answer: `Engagement time is crucial for ${symbol} because it directly impacts advertising impressions, content consumption, and monetization opportunities. Higher engagement typically leads to more ad revenue, better user retention, and stronger network effects. It's a leading indicator of platform health.`
    },
    {
      question: `What drives engagement time growth for ${symbol}?`,
      answer: `${symbol}'s engagement time is driven by compelling content, personalized recommendations, new features, video content, social interactions, and algorithmic improvements. ${sector ? `In the ${sector} sector, ` : ''}successful platforms continuously innovate to increase time spent while maintaining user satisfaction.`
    },
    {
      question: `How does ${symbol}'s engagement time compare to competitors?`,
      answer: `Comparing ${symbol}'s engagement time to competitors reveals relative product strength and user preference. Platforms with higher engagement time often command higher valuations and better advertising rates. Industry benchmarks vary significantly between social media, gaming, streaming, and other digital platforms.`
    },
    {
      question: `What is the relationship between engagement time and revenue for ${symbol}?`,
      answer: `For ${symbol}, engagement time directly correlates with revenue through: (1) More ad impressions - longer sessions mean more ads viewed, (2) Higher CPM - engaged users are more valuable to advertisers, (3) Subscription conversion - engaged users more likely to pay. This makes engagement time a key revenue driver.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Engagement Time`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Engagement Time - User Session Metrics ${currentYear}`,
    description: `Complete ${symbol} engagement time analysis with session duration and usage trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} engagement time`,
      `${symbol} time spent`,
      `${symbol} session duration`,
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

  const faqSchema = getFAQSchema(engagementFaqs)

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
            <span>{symbol} Engagement Time</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Engagement Time
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} user session duration and time spent metrics
          </p>

          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">User Engagement Time</p>
              <p className="text-4xl font-bold mb-4">Session Metrics</p>
              <p className="text-muted-foreground">
                Track time spent and engagement for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Engagement Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-violet-500 mb-2">What Engagement Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Session duration per visit</li>
                  <li>Daily time spent per user</li>
                  <li>Monthly engagement hours</li>
                  <li>Platform stickiness</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-purple-500 mb-2">Why Engagement Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Drives ad impressions</li>
                  <li>Increases monetization</li>
                  <li>Shows product strength</li>
                  <li>Predicts retention</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Engagement Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Session Duration</h3>
                <p className="text-sm text-muted-foreground">
                  Average time per session - measures how long users stay during each visit
                </p>
                <div className="mt-3 p-2 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">5-30 minutes</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Daily Time Spent</h3>
                <p className="text-sm text-muted-foreground">
                  Total minutes per day across all sessions - shows daily engagement intensity
                </p>
                <div className="mt-3 p-2 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">30-60 minutes</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Sessions per Day</h3>
                <p className="text-sm text-muted-foreground">
                  Number of times users return daily - indicates habit formation
                </p>
                <div className="mt-3 p-2 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">2-8 sessions</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Engagement Time Impact</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Revenue Impact</p>
                  <p className="text-sm text-muted-foreground">
                    Higher engagement time leads to more ad impressions and revenue opportunities. A 10% increase in time spent can translate to 10%+ increase in ad revenue per user.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Retention Impact</p>
                  <p className="text-sm text-muted-foreground">
                    Users who spend more time are significantly more likely to return. Strong engagement time correlates with lower churn and higher lifetime value.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Network Effects</p>
                  <p className="text-sm text-muted-foreground">
                    More time spent often indicates stronger network effects and platform stickiness, creating competitive moats and pricing power.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
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
                DAU Metrics
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {engagementFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Engagement metrics are based on company disclosures and third-party estimates. Measurement methodologies vary by company. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
