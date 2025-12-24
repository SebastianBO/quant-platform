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
    title: `${symbol} Travel Retail Revenue ${currentYear} - Duty-Free Beauty Sales`,
    description: `${symbol} travel retail revenue analysis for ${currentYear}. Duty-free beauty sales, airport retail performance, and international travel trends.`,
    keywords: [
      `${symbol} travel retail`,
      `${symbol} duty free`,
      `${symbol} airport sales`,
      `${symbol} travel revenue`,
      `${symbol} international retail`,
      `${symbol} duty-free beauty`,
    ],
    openGraph: {
      title: `${symbol} Travel Retail Revenue ${currentYear} | Duty-Free Analysis`,
      description: `Analysis of ${symbol}'s travel retail and duty-free channel performance in global markets.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/travel-retail/${ticker.toLowerCase()}`,
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

export default async function TravelRetailPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/travel-retail/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Travel retail FAQs
  const travelRetailFaqs = [
    {
      question: `What is ${symbol}'s travel retail revenue?`,
      answer: `${companyName} (${symbol}) generates revenue from travel retail through duty-free stores in airports, cruise ships, border shops, and downtown duty-free locations. This channel is particularly important for luxury beauty, fragrances, and skincare with Chinese tourists being a key consumer segment.`
    },
    {
      question: `How important is travel retail to ${symbol}?`,
      answer: `Travel retail is a strategic high-margin channel for ${symbol}, representing a significant portion of international beauty sales. The channel offers exclusive products, gift sets, and limited editions while reaching affluent travelers willing to spend on prestige beauty.`
    },
    {
      question: `What products perform best in ${symbol}'s travel retail?`,
      answer: `Fragrances, prestige skincare, and limited edition gift sets typically drive travel retail sales for ${companyName}. These categories benefit from gifting occasions, exclusive travel editions, and the luxury shopping experience at airports.`
    },
    {
      question: `How has COVID-19 affected ${symbol}'s travel retail?`,
      answer: `The pandemic significantly impacted ${symbol}'s travel retail revenue due to reduced international travel. However, the channel is recovering as travel resumes, particularly in Asia-Pacific routes. Some companies are pivoting to downtown duty-free and Hainan island stores targeting domestic Chinese shoppers.`
    },
    {
      question: `Which markets drive ${symbol}'s travel retail growth?`,
      answer: `Asia-Pacific airports (Hong Kong, Singapore, Seoul, Tokyo) and Middle East hubs (Dubai, Doha) are key travel retail markets for ${companyName}. Chinese tourists traveling internationally have historically been the largest consumer segment for duty-free beauty.`
    },
    {
      question: `What trends are affecting ${symbol}'s travel retail strategy?`,
      answer: `Key trends include: recovery of international travel post-pandemic, shift to experiential retail in airports, exclusive launches for travel retail, digital pre-order and collect services, and growth of downtown duty-free stores in China compensating for reduced outbound travel.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Travel Retail`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Travel Retail Revenue ${currentYear} - Duty-Free Analysis`,
    description: `Comprehensive analysis of ${companyName}'s travel retail and duty-free channel performance in global markets.`,
    url: pageUrl,
    keywords: [
      `${symbol} travel retail`,
      `${symbol} duty free`,
      `${symbol} airport sales`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} travel retail analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(travelRetailFaqs)

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
            <span>{symbol} Travel Retail</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Travel Retail Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} duty-free and airport retail channel performance
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

          {/* Travel Retail Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Travel Retail Channel Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Travel retail is a strategic high-margin channel for {companyName}, capturing affluent international travelers in airports, cruise ships, and duty-free locations. This channel is particularly important for prestige beauty, fragrances, and exclusive product launches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Top Categories</p>
                  <p className="text-lg font-bold mt-1">Fragrance, Skincare</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Markets</p>
                  <p className="text-lg font-bold mt-1">Asia-Pacific, Middle East</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Margin Profile</p>
                  <p className="text-lg font-bold mt-1 text-green-500">High</p>
                </div>
              </div>
            </div>
          </section>

          {/* Channel Strengths */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Travel Retail Advantages</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. High-Value Consumers</h3>
                <p className="text-muted-foreground">Travel retail attracts affluent international travelers with high disposable income and willingness to spend on luxury beauty products.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Exclusive Launches</h3>
                <p className="text-muted-foreground">Travel retail offers exclusive products, limited editions, and unique gift sets not available in domestic markets, driving purchase urgency.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Tax-Free Pricing</h3>
                <p className="text-muted-foreground">Duty-free pricing creates value perception for travelers while maintaining strong margins for beauty brands.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Gifting Occasions</h3>
                <p className="text-muted-foreground">Travelers purchase beauty products as gifts, driving larger basket sizes and premium product mix in travel retail.</p>
              </div>
            </div>
          </section>

          {/* Key Markets & Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Regional Performance & Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 rounded-lg border border-red-500/30">
                <h3 className="font-bold mb-2">Asia-Pacific Recovery</h3>
                <p className="text-sm text-muted-foreground">Hong Kong, Singapore, Seoul, and Tokyo airports recovering as international travel resumes post-pandemic.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-lg border border-blue-500/30">
                <h3 className="font-bold mb-2">Middle East Hubs</h3>
                <p className="text-sm text-muted-foreground">Dubai, Doha, and Abu Dhabi serving as key transit points with strong duty-free beauty sales.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="font-bold mb-2">Hainan Island</h3>
                <p className="text-sm text-muted-foreground">China's duty-free island becoming a major destination for domestic shoppers, offsetting reduced outbound travel.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="font-bold mb-2">Experiential Retail</h3>
                <p className="text-sm text-muted-foreground">Airports investing in luxury experiences, digital integration, and personalized shopping to enhance duty-free appeal.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-sky-600/20 to-blue-600/20 p-8 rounded-xl border border-sky-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Channel Strategy</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis of distribution channels and international performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {travelRetailFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Travel retail data is based on publicly available information and industry research. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="travel-retail" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
