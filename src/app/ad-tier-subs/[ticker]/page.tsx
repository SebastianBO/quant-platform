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
    title: `${symbol} Ad-Tier Subscribers ${currentYear} - Ad-Supported Growth Analysis`,
    description: `${symbol} ad-supported tier subscriber analysis including ad-tier growth, monetization, and ${currentYear} forecasts.`,
    keywords: [
      `${symbol} ad tier`,
      `${symbol} ad-supported subscribers`,
      `${symbol} advertising revenue`,
      `${symbol} ad tier growth`,
      `${symbol} ad-supported ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Ad-Tier Subscribers ${currentYear} | Ad-Supported Analysis`,
      description: `Complete ${symbol} ad-tier analysis with subscriber growth and advertising monetization insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ad-tier-subs/${ticker.toLowerCase()}`,
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

export default async function AdTierSubsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ad-tier-subs/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Ad-Tier FAQs
  const adTierFaqs = [
    {
      question: `Does ${symbol} have an ad-supported tier?`,
      answer: `Many ${industry || 'streaming'} platforms including major players have launched ad-supported tiers to expand addressable market and capture price-sensitive consumers. Ad tiers offer lower subscription prices in exchange for viewing advertisements. Check ${symbol}'s latest earnings reports for ad-tier availability and subscriber counts.`
    },
    {
      question: `How many ${symbol} subscribers are on the ad-supported tier?`,
      answer: `${symbol} (${companyName}) may disclose ad-tier subscriber counts and penetration rates in earnings reports and investor presentations. Ad-tier adoption varies by market, pricing differential vs premium tiers, and advertising load. Strong ad-tier growth can expand total addressable market while maintaining revenue through advertising.`
    },
    {
      question: `How does ${symbol} monetize ad-tier subscribers?`,
      answer: `Ad-tier subscribers generate revenue through lower subscription fees plus advertising income. Total ARPU (subscription + ads) can approach or exceed premium tier ARPU depending on ad load, CPM rates, and advertiser demand. Successful ad-tier monetization requires balancing user experience with advertising inventory.`
    },
    {
      question: `Is ${symbol}'s ad-tier cannibalizing premium subscribers?`,
      answer: `Ad-tier cannibalization occurs when existing premium subscribers downgrade to ad-supported plans. Some cannibalization is expected, but net impact depends on whether ad tiers attract new subscribers who wouldn't pay premium prices. For ${symbol}, ad tiers can expand total addressable market if incremental subscribers exceed downgrades.`
    },
    {
      question: `What is the advertising opportunity for ${symbol}?`,
      answer: `Streaming advertising provides targeting capabilities, measurement, and engagement that traditional TV struggles to match. ${symbol}'s advertising opportunity depends on ad-tier penetration, inventory availability, advertiser demand, and competitive pricing. Growing ad revenue can offset lower subscription fees and improve overall monetization.`
    },
    {
      question: `How does ${symbol}'s ad-tier compare to competitors?`,
      answer: `Ad-tier comparison factors include pricing differential vs premium, advertising load (minutes per hour), ad targeting capabilities, subscriber growth, and total ARPU. Platforms with strong user engagement and targeting data command higher ad rates. ${symbol}'s ad-tier competitiveness impacts market share and revenue growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Ad-Tier Subscribers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Ad-Tier Subscribers ${currentYear} - Ad-Supported Growth Analysis`,
    description: `Comprehensive ad-tier analysis for ${symbol} (${companyName}) with subscriber trends and advertising monetization.`,
    url: pageUrl,
    keywords: [
      `${symbol} ad tier`,
      `${symbol} ad-supported subscribers`,
      `${symbol} advertising revenue`,
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

  const faqSchema = getFAQSchema(adTierFaqs)

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
            <span>{symbol} Ad-Tier Subscribers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Ad-Tier Subscribers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ad-supported tier growth and monetization for {companyName}
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

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad-Tier Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Ad-Tier Benefits</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Expands total addressable market</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Attracts price-sensitive consumers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Additional advertising revenue stream</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Competitive with free ad-supported platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Data collection for targeting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Reduces password sharing incentive</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Ad-Tier Challenges</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Premium subscriber cannibalization risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Lower subscription revenue per user</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Degraded user experience with ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Ad sales infrastructure costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Dependency on advertising market cycles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Brand safety and content restrictions</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ad-Tier Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">The Ad-Tier Monetization Equation</h3>
                <p className="text-muted-foreground">
                  Ad-tier profitability depends on whether (subscription revenue + ad revenue) exceeds premium tier
                  ARPU after accounting for cannibalization. If an ad-tier subscriber generates $8/month in subscription
                  fees plus $7/month in ad revenue ($15 total), while premium tier ARPU is $16, the ad tier can be
                  accretive if it attracts new subscribers rather than converting premium users. For {symbol}, ad-tier
                  success requires careful price positioning and advertising monetization.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Advertising vs Subscription Trade-offs</h3>
                <p className="text-muted-foreground">
                  Streaming advertising offers higher CPMs than traditional TV due to targeting and measurement
                  capabilities. However, excessive ad load damages user experience and increases churn. The optimal
                  strategy balances ad minutes per hour with user tolerance. {symbol}'s ad-tier design must carefully
                  calibrate advertising inventory to maximize revenue without driving cancellations.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Market Expansion Opportunity</h3>
                <p className="text-muted-foreground">
                  Ad tiers expand addressable market by capturing consumers unwilling to pay premium prices. This is
                  especially valuable in price-sensitive international markets and during economic downturns. If
                  {symbol}'s ad tier primarily attracts new subscribers rather than converting premium users, it
                  represents pure incremental revenue and a pathway to higher total subscriber counts.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, ad-tier metrics, and detailed valuations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {adTierFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Ad-tier metrics are subject to change and may vary by region and reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ad-tier-subs" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
