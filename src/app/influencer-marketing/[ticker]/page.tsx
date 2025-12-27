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
    title: `${symbol} Influencer Marketing ${currentYear} - Social Media & Beauty Strategy`,
    description: `${symbol} influencer marketing strategy for ${currentYear}. TikTok, Instagram, and social commerce analysis for beauty brands.`,
    keywords: [
      `${symbol} influencer marketing`,
      `${symbol} social media`,
      `${symbol} TikTok strategy`,
      `${symbol} beauty influencers`,
      `${symbol} social commerce`,
      `${symbol} Instagram marketing`,
    ],
    openGraph: {
      title: `${symbol} Influencer Marketing ${currentYear} | Social Media Strategy`,
      description: `Analysis of ${symbol}'s influencer marketing strategy and social commerce initiatives in beauty.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/influencer-marketing/${ticker.toLowerCase()}`,
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

export default async function InfluencerMarketingPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/influencer-marketing/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Influencer marketing FAQs
  const influencerFaqs = [
    {
      question: `What is ${symbol}'s influencer marketing strategy?`,
      answer: `${companyName} (${symbol}) leverages influencer marketing across TikTok, Instagram, and YouTube to drive brand awareness, product launches, and sales. The strategy includes partnerships with mega-influencers, micro-influencers, and user-generated content campaigns that create viral moments for beauty products.`
    },
    {
      question: `How does ${symbol} use TikTok for beauty marketing?`,
      answer: `${companyName} uses TikTok for viral product launches, beauty tutorials, and hashtag challenges that drive massive organic reach. TikTok's algorithm can make products go viral overnight, creating sold-out moments and driving significant e-commerce traffic for ${symbol}'s brands.`
    },
    {
      question: `What role do beauty influencers play in ${symbol}'s sales?`,
      answer: `Beauty influencers drive significant sales for ${symbol} through authentic product reviews, tutorials, and get-ready-with-me content. Influencer endorsements create trust and social proof, particularly important for Gen Z and Millennial consumers who research products on social media before purchasing.`
    },
    {
      question: `How does ${symbol} measure influencer marketing ROI?`,
      answer: `${companyName} tracks influencer marketing effectiveness through engagement rates, affiliate link performance, promo code usage, social commerce conversions, and brand sentiment analysis. Many campaigns include unique discount codes to directly attribute sales to specific influencers.`
    },
    {
      question: `What is ${symbol}'s approach to micro vs mega influencers?`,
      answer: `${symbol} balances partnerships between mega-influencers for massive reach and brand awareness, and micro-influencers for authentic engagement and niche audience targeting. Micro-influencers often deliver higher engagement rates and stronger conversion for specific product categories.`
    },
    {
      question: `How is social commerce impacting ${symbol}'s business?`,
      answer: `Social commerce allows ${symbol} to sell directly through TikTok Shop, Instagram Shopping, and YouTube Shopping, reducing friction between discovery and purchase. This trend is accelerating direct-to-consumer sales and providing valuable first-party data on consumer preferences and behavior.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Influencer Marketing`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Influencer Marketing ${currentYear} - Social Media Strategy`,
    description: `Comprehensive analysis of ${companyName}'s influencer marketing strategy and social commerce initiatives.`,
    url: pageUrl,
    keywords: [
      `${symbol} influencer marketing`,
      `${symbol} social media`,
      `${symbol} TikTok strategy`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} influencer marketing analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(influencerFaqs)

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
            <span>{symbol} Influencer Marketing</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Influencer Marketing Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} social media strategy and influencer partnerships in beauty
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Stock Price</p>
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

          {/* Influencer Marketing Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Social Media Marketing Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Influencer marketing has become critical for {companyName}'s beauty brands, driving product discovery, viral moments, and direct sales through social commerce. The company invests heavily in partnerships across TikTok, Instagram, and YouTube to reach Gen Z and Millennial consumers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Platforms</p>
                  <p className="text-lg font-bold mt-1">TikTok, Instagram, YouTube</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Target Audience</p>
                  <p className="text-lg font-bold mt-1">Gen Z, Millennials</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Strategy Type</p>
                  <p className="text-lg font-bold mt-1 text-purple-500">Multi-Channel</p>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Platform-Specific Strategies</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. TikTok Viral Marketing</h3>
                <p className="text-muted-foreground">TikTok's algorithm enables products to go viral through hashtag challenges, beauty tutorials, and user-generated content. {companyName} partners with creators for authentic product demonstrations that drive immediate e-commerce conversions.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Instagram Shopping Integration</h3>
                <p className="text-muted-foreground">Instagram Shopping allows seamless product discovery and purchase through posts, stories, and reels. {companyName} leverages influencer content, shoppable posts, and Instagram Live events to drive social commerce sales.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. YouTube Long-Form Content</h3>
                <p className="text-muted-foreground">YouTube provides depth with detailed product reviews, tutorials, and get-ready-with-me videos. Beauty YouTubers create comprehensive content that builds trust and drives considered purchases for {symbol}'s prestige brands.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Micro-Influencer Networks</h3>
                <p className="text-muted-foreground">Partnerships with micro-influencers (10K-100K followers) deliver authentic engagement and niche audience targeting, often outperforming mega-influencers in conversion rates for specific product categories.</p>
              </div>
            </div>
          </section>

          {/* Marketing Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Influencer Marketing Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 rounded-lg border border-pink-500/30">
                <h3 className="font-bold mb-2">UGC Dominance</h3>
                <p className="text-sm text-muted-foreground">User-generated content outperforming branded content, with authentic reviews and tutorials driving higher engagement and trust.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="font-bold mb-2">Live Shopping Events</h3>
                <p className="text-sm text-muted-foreground">TikTok Live and Instagram Live shopping events creating QVC-style urgency with limited-time offers and influencer demonstrations.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-lg border border-blue-500/30">
                <h3 className="font-bold mb-2">Affiliate Programs</h3>
                <p className="text-sm text-muted-foreground">Performance-based influencer partnerships using affiliate links and promo codes to directly track ROI and sales attribution.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="font-bold mb-2">Authenticity Focus</h3>
                <p className="text-sm text-muted-foreground">Shift toward authentic, unfiltered content with real results and honest reviews resonating more than highly produced ads.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 p-8 rounded-xl border border-pink-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Marketing Strategy</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis of digital marketing and brand positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {influencerFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Marketing data is based on publicly available information and industry research. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="influencer-marketing" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
