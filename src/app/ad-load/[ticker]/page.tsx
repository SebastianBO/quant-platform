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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Ad Load - Advertising Density & Monetization ${currentYear}`,
    description: `${symbol} ad load: Ads per user, advertising density, monetization intensity, and user experience balance. Analyze ${symbol}'s ad load strategy.`,
    keywords: [
      `${symbol} ad load`,
      `${symbol} advertising density`,
      `${symbol} ads per user`,
      `${symbol} monetization`,
      `${symbol} ad frequency`,
      `${symbol} ad strategy`,
    ],
    openGraph: {
      title: `${symbol} Ad Load - Advertising Density Analysis`,
      description: `${symbol} ad load analysis with monetization strategy and user experience metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ad-load/${ticker.toLowerCase()}`,
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

export default async function AdLoadPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ad-load/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const adLoadFaqs = [
    {
      question: `What is ${symbol}'s ad load?`,
      answer: `${symbol} (${companyName}) ad load refers to the number and frequency of advertisements shown to users. This includes ads per user session, ads per page/feed, and overall advertising density. Ad load is a critical balance for ${sector || 'technology'} companies between maximizing revenue and maintaining user experience.`
    },
    {
      question: `How is ad load measured for ${symbol}?`,
      answer: `Ad load for ${symbol} is typically measured as: (1) Impressions per user - total ads shown per user over a time period, (2) Ad density - percentage of content that is advertising, (3) Frequency - how often ads appear in feeds or videos. These metrics help assess monetization intensity.`
    },
    {
      question: `Why is ad load important for ${symbol} investors?`,
      answer: `Ad load directly impacts ${symbol}'s revenue potential and user experience. Higher ad load increases short-term revenue but may reduce engagement and user satisfaction. Finding the optimal ad load maximizes long-term value by balancing monetization with user retention.`
    },
    {
      question: `What is an optimal ad load for ${symbol}?`,
      answer: `Optimal ad load for ${symbol} varies by platform type and user tolerance. Social media platforms typically show 3-5 ads per feed session, while video platforms might show 1-2 ads per video. The key is maximizing revenue without significantly impacting engagement metrics or user satisfaction scores.`
    },
    {
      question: `How does ${symbol}'s ad load affect user experience?`,
      answer: `${symbol}'s ad load affects user experience through ad frequency, placement, and relevance. Excessive ad load can lead to user fatigue, reduced engagement, and platform abandonment. ${sector ? `In the ${sector} sector, ` : ''}companies carefully test ad load changes to optimize the monetization-experience tradeoff.`
    },
    {
      question: `Can ${symbol} increase ad load to grow revenue?`,
      answer: `While ${symbol} can increase ad load to boost short-term revenue, this strategy has limits. User tolerance caps maximum ad load before engagement declines. Most platforms optimize ad load gradually, monitoring user metrics. Sustainable revenue growth often comes from ARPU increases via better targeting rather than just higher ad load.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Ad Load`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Ad Load - Advertising Density Analysis ${currentYear}`,
    description: `Complete ${symbol} ad load analysis with monetization strategy and user experience metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ad load`,
      `${symbol} advertising density`,
      `${symbol} ads per user`,
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

  const faqSchema = getFAQSchema(adLoadFaqs)

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
            <span>{symbol} Ad Load</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Ad Load
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} advertising density and monetization strategy
          </p>

          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Advertising Load</p>
              <p className="text-4xl font-bold mb-4">Ad Density Metrics</p>
              <p className="text-muted-foreground">
                Track ad load and monetization for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Ad Load</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-amber-500 mb-2">What Ad Load Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Ads per user session</li>
                  <li>Advertising density</li>
                  <li>Ad frequency and timing</li>
                  <li>Monetization intensity</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-orange-500 mb-2">Why Ad Load Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Drives impression volume</li>
                  <li>Impacts user experience</li>
                  <li>Affects engagement rates</li>
                  <li>Determines revenue ceiling</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad Load Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Impressions per DAU</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Average number of ad impressions shown to each daily active user
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">5-15 ads/day</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad Density</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Percentage of feed or content that consists of advertisements
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">5-20% of feed</p>
                </div>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad Frequency</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  How often ads appear during user sessions or content consumption
                </p>
                <div className="p-3 bg-secondary/50 rounded text-center">
                  <p className="text-xs text-muted-foreground">Typical Range</p>
                  <p className="font-bold">1 ad per 3-5 posts</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">The Ad Load Tradeoff</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-green-500 mb-2">Higher Ad Load Benefits</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>More impressions per user</li>
                      <li>Increased ad revenue</li>
                      <li>Higher ARPU</li>
                      <li>Better inventory monetization</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-red-500 mb-2">Higher Ad Load Risks</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>User experience degradation</li>
                      <li>Reduced engagement time</li>
                      <li>Lower user satisfaction</li>
                      <li>Increased churn risk</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Optimal Strategy:</strong> Platforms continuously test and optimize ad load to find the sweet spot that maximizes long-term revenue without harming user experience. This involves A/B testing, monitoring engagement metrics, and adjusting based on user feedback.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad Load Optimization Strategies</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Dynamic Ad Load</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust ad frequency based on user behavior, engagement level, and content consumption patterns
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Premium Ad Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Use higher-quality, better-targeted ads to maintain revenue with lower ad load
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Native Advertising</h3>
                <p className="text-sm text-muted-foreground">
                  Integrate ads seamlessly into content to reduce perceived ad load while maintaining impressions
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad-Free Subscriptions</h3>
                <p className="text-sm text-muted-foreground">
                  Offer premium tiers without ads to monetize users who prefer ad-free experience
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600/20 to-amber-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete advertising metrics, financials, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/ad-impressions/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Ad Impressions
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {adLoadFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Ad load metrics are based on company disclosures and industry estimates. Actual ad load varies by user, region, and platform version. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
