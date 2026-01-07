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
    title: `${symbol} Fragrance Revenue ${currentYear} - Perfume Segment Analysis & Growth`,
    description: `${symbol} fragrance revenue breakdown for ${currentYear}. Analysis of perfume segment performance, luxury fragrance trends, and market positioning.`,
    keywords: [
      `${symbol} fragrance revenue`,
      `${symbol} perfume revenue`,
      `${symbol} fragrance segment`,
      `${symbol} luxury fragrance`,
      `${symbol} perfume sales`,
      `${symbol} fragrance analysis`,
    ],
    openGraph: {
      title: `${symbol} Fragrance Revenue ${currentYear} | Perfume Segment Analysis`,
      description: `Deep dive into ${symbol}'s fragrance and perfume revenue, luxury positioning, and growth in global markets.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fragrance-revenue/${ticker.toLowerCase()}`,
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

export default async function FragranceRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/fragrance-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Fragrance-specific FAQs
  const fragranceFaqs = [
    {
      question: `What is ${symbol}'s fragrance revenue?`,
      answer: `${companyName} (${symbol}) generates revenue from its fragrance segment through luxury perfumes, eau de toilettes, body mists, and scented products. The fragrance category typically includes both prestige designer brands and niche luxury fragrances.`
    },
    {
      question: `How is ${symbol}'s fragrance segment performing?`,
      answer: `The fragrance category for ${symbol} is characterized by high margins, strong brand loyalty, and resilience across economic cycles. Performance is driven by iconic fragrances, limited editions, celebrity collaborations, and expansion into emerging luxury markets.`
    },
    {
      question: `What fragrance brands does ${symbol} own?`,
      answer: `${companyName} operates a portfolio of fragrance brands spanning luxury designer fragrances, niche perfumery, and celebrity scents. The company typically owns both heritage fragrance houses and modern lifestyle brands.`
    },
    {
      question: `What are ${symbol}'s key fragrance growth drivers?`,
      answer: `Major growth drivers for ${symbol}'s fragrance business include: luxury travel retail expansion, personalization and customization services, niche and artisanal fragrances, men's fragrance growth, sustainable and natural perfumery, and digital fragrance discovery experiences.`
    },
    {
      question: `How does ${symbol} compete in the fragrance market?`,
      answer: `${companyName} competes through brand heritage and luxury positioning, exclusive distribution in prestige retail, master perfumer partnerships, limited edition launches, celebrity and designer collaborations, and strong presence in duty-free and travel retail channels.`
    },
    {
      question: `What trends are affecting ${symbol}'s fragrance revenue?`,
      answer: `Key trends impacting ${symbol}'s fragrance business: niche and artisanal fragrances gaining market share, personalization and bespoke perfumery, clean and sustainable ingredients, gender-neutral fragrances, travel retail recovery post-pandemic, and digital scent profiling technologies.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Fragrance Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Fragrance Revenue ${currentYear} - Perfume Segment Analysis`,
    description: `Comprehensive analysis of ${companyName}'s fragrance and perfume revenue, luxury positioning, and global market trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} fragrance revenue`,
      `${symbol} perfume analysis`,
      `${symbol} luxury fragrance`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} fragrance revenue analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(fragranceFaqs)

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
            <span>{symbol} Fragrance Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Fragrance Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} perfume segment performance and luxury market positioning
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

          {/* Fragrance Segment Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fragrance Segment Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The fragrance category is a high-margin, resilient revenue stream for {companyName}, encompassing luxury perfumes, eau de parfums, and body fragrances. This segment benefits from strong brand equity, consumer loyalty, and gifting occasions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Segment Type</p>
                  <p className="text-lg font-bold mt-1">Luxury & Prestige</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Channel</p>
                  <p className="text-lg font-bold mt-1">Travel Retail</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Margin Profile</p>
                  <p className="text-lg font-bold mt-1 text-green-500">High</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fragrance Revenue Drivers</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Travel Retail Expansion</h3>
                <p className="text-muted-foreground">Duty-free and travel retail channels generate significant fragrance sales, particularly in Asia-Pacific airports and cruise lines.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Niche & Artisanal Fragrances</h3>
                <p className="text-muted-foreground">Growing consumer demand for unique, small-batch perfumery and niche fragrance houses commanding premium prices.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Personalization Services</h3>
                <p className="text-muted-foreground">Bespoke fragrance creation, scent profiling, and customization services enhancing luxury positioning and margins.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Men's Fragrance Growth</h3>
                <p className="text-muted-foreground">Expanding men's fragrance category with grooming integration and younger consumer adoption driving incremental revenue.</p>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fragrance Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-6 rounded-lg border border-violet-500/30">
                <h3 className="font-bold mb-2">Clean Perfumery</h3>
                <p className="text-sm text-muted-foreground">Natural ingredients, sustainable sourcing, and transparent formulations appealing to conscious luxury consumers.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 rounded-lg border border-amber-500/30">
                <h3 className="font-bold mb-2">Gender-Neutral Scents</h3>
                <p className="text-sm text-muted-foreground">Unisex fragrances gaining popularity, particularly among younger luxury consumers seeking versatility.</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-6 rounded-lg border border-rose-500/30">
                <h3 className="font-bold mb-2">Digital Discovery</h3>
                <p className="text-sm text-muted-foreground">AI-powered scent profiling and virtual try-on technologies enhancing online fragrance purchasing.</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-lg border border-cyan-500/30">
                <h3 className="font-bold mb-2">Refillable Packaging</h3>
                <p className="text-sm text-muted-foreground">Sustainability-driven refillable fragrance bottles reducing waste and encouraging repeat purchases.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Luxury Business</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive fragrance revenue analysis and luxury market insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {fragranceFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Revenue estimates are based on publicly available data and industry research. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="fragrance-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
