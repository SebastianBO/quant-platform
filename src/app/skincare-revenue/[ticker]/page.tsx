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
    title: `${symbol} Skincare Revenue ${currentYear} - Beauty Segment Analysis & Growth`,
    description: `${symbol} skincare revenue breakdown for ${currentYear}. Analysis of skincare segment performance, market share, product innovation, and revenue growth trends.`,
    keywords: [
      `${symbol} skincare revenue`,
      `${symbol} beauty revenue`,
      `${symbol} skincare segment`,
      `${symbol} skincare products`,
      `${symbol} skincare growth`,
      `${symbol} beauty analysis`,
    ],
    openGraph: {
      title: `${symbol} Skincare Revenue ${currentYear} | Beauty Segment Analysis`,
      description: `Deep dive into ${symbol}'s skincare revenue, segment performance, and market positioning in the global beauty industry.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/skincare-revenue/${ticker.toLowerCase()}`,
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

export default async function SkincareRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/skincare-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Skincare-specific FAQs
  const skincareFaqs = [
    {
      question: `What is ${symbol}'s skincare revenue?`,
      answer: `${companyName} (${symbol}) generates revenue from its skincare segment through anti-aging products, moisturizers, serums, cleansers, and specialty treatments. The skincare category typically represents a significant portion of beauty company revenues due to high margins and consumer demand for premium products.`
    },
    {
      question: `How is ${symbol}'s skincare segment performing?`,
      answer: `Skincare is often the fastest-growing segment in the beauty industry. For ${symbol}, key performance indicators include premium product launches, market share gains in key categories like anti-aging and clean beauty, and geographic expansion particularly in Asia-Pacific markets.`
    },
    {
      question: `What skincare brands does ${symbol} own?`,
      answer: `${companyName} operates various skincare brands across different price points and market segments. The company's skincare portfolio typically includes prestige dermatological brands, mass-market products, and specialty treatments targeting specific skin concerns.`
    },
    {
      question: `What are ${symbol}'s key skincare growth drivers?`,
      answer: `Major growth drivers for ${symbol}'s skincare business include: premium product innovation, expansion into emerging markets (especially Asia), clean/sustainable beauty trends, dermatologist partnerships, digital commerce growth, and personalized skincare solutions powered by technology.`
    },
    {
      question: `How does ${symbol} compete in the skincare market?`,
      answer: `${companyName} competes through brand portfolio diversity, R&D innovation, clinical testing and dermatologist endorsements, marketing through influencers and dermatologists, retail partnerships, and direct-to-consumer channels.`
    },
    {
      question: `What trends are affecting ${symbol}'s skincare revenue?`,
      answer: `Key trends impacting ${symbol}'s skincare business: rising demand for clean/sustainable products, K-beauty and J-beauty influence, personalization through AI and skin diagnostics, men's skincare growth, and the shift to online purchasing accelerated by social commerce.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Skincare Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Skincare Revenue ${currentYear} - Beauty Segment Analysis`,
    description: `Comprehensive analysis of ${companyName}'s skincare revenue, segment performance, and growth trends in the global beauty market.`,
    url: pageUrl,
    keywords: [
      `${symbol} skincare revenue`,
      `${symbol} beauty analysis`,
      `${symbol} skincare segment`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} skincare revenue analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(skincareFaqs)

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
            <span>{symbol} Skincare Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Skincare Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} skincare segment performance, market share, and growth trends
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

          {/* Skincare Segment Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Skincare Segment Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The skincare category is a critical revenue driver for {companyName}, encompassing facial care, body care, anti-aging treatments, and specialty products. This segment typically commands premium margins and benefits from strong consumer loyalty.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Segment Focus</p>
                  <p className="text-lg font-bold mt-1">Premium Skincare</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Markets</p>
                  <p className="text-lg font-bold mt-1">North America, Asia</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Growth Trend</p>
                  <p className="text-lg font-bold mt-1 text-green-500">Expanding</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Skincare Revenue Drivers</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Anti-Aging & Premium Products</h3>
                <p className="text-muted-foreground">High-margin anti-aging serums, retinol products, and clinically-proven treatments drive significant revenue growth.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Clean & Sustainable Beauty</h3>
                <p className="text-muted-foreground">Growing consumer demand for clean, eco-friendly, and sustainable skincare formulations with transparent ingredients.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Asia-Pacific Expansion</h3>
                <p className="text-muted-foreground">Strong growth in China, South Korea, and Japan markets with localized product offerings and digital-first strategies.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Personalization & Technology</h3>
                <p className="text-muted-foreground">AI-powered skin diagnostics, personalized regimens, and direct-to-consumer customization platforms.</p>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Skincare Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/30">
                <h3 className="font-bold mb-2">K-Beauty & Innovation</h3>
                <p className="text-sm text-muted-foreground">Korean and Japanese beauty trends continue to influence global product development and consumer expectations.</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-lg border border-green-500/30">
                <h3 className="font-bold mb-2">Clinical Validation</h3>
                <p className="text-sm text-muted-foreground">Increasing consumer demand for dermatologist-tested, clinically-proven products with visible results.</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-lg border border-orange-500/30">
                <h3 className="font-bold mb-2">Men's Skincare Growth</h3>
                <p className="text-sm text-muted-foreground">Rapid expansion of men's skincare category as grooming becomes mainstream across demographics.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="font-bold mb-2">Social Commerce</h3>
                <p className="text-sm text-muted-foreground">TikTok, Instagram, and influencer-driven purchasing accelerating direct-to-consumer sales.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Beauty Business</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive revenue breakdowns, segment analysis, and investment insights
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

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {skincareFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="skincare-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
