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
    title: `${symbol} Makeup Revenue ${currentYear} - Cosmetics Segment Analysis & Trends`,
    description: `${symbol} makeup revenue breakdown for ${currentYear}. Analysis of cosmetics segment performance, color cosmetics trends, market share, and category growth.`,
    keywords: [
      `${symbol} makeup revenue`,
      `${symbol} cosmetics revenue`,
      `${symbol} color cosmetics`,
      `${symbol} makeup segment`,
      `${symbol} beauty revenue`,
      `${symbol} cosmetics analysis`,
    ],
    openGraph: {
      title: `${symbol} Makeup Revenue ${currentYear} | Cosmetics Segment Analysis`,
      description: `Deep dive into ${symbol}'s makeup and color cosmetics revenue, market positioning, and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/makeup-revenue/${ticker.toLowerCase()}`,
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

export default async function MakeupRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/makeup-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Makeup-specific FAQs
  const makeupFaqs = [
    {
      question: `What is ${symbol}'s makeup revenue?`,
      answer: `${companyName} (${symbol}) generates revenue from its makeup/color cosmetics segment through foundations, lipsticks, eye makeup, mascaras, and multi-use products. The makeup category includes both prestige and mass-market brands across multiple price points.`
    },
    {
      question: `How is ${symbol}'s makeup segment performing?`,
      answer: `The makeup category performance for ${symbol} is driven by innovation in long-wear formulas, clean beauty reformulations, shade inclusivity, and viral product launches. Growth varies by subcategory, with lip and face products often leading performance.`
    },
    {
      question: `What makeup brands does ${symbol} own?`,
      answer: `${companyName} operates a portfolio of makeup brands spanning prestige, masstige, and mass-market segments. The company typically owns both heritage brands and newer, digitally-native makeup lines.`
    },
    {
      question: `What are ${symbol}'s key makeup growth drivers?`,
      answer: `Major growth drivers for ${symbol}'s makeup business include: viral product launches on social media, inclusivity and shade expansion, clean/vegan formulations, hybrid makeup-skincare products, influencer collaborations, and expansion into emerging markets.`
    },
    {
      question: `How does ${symbol} compete in the makeup market?`,
      answer: `${companyName} competes through brand portfolio diversity, innovation in formulas and shades, partnerships with beauty influencers and makeup artists, retail presence (Sephora, Ulta, department stores), and strong e-commerce and social commerce capabilities.`
    },
    {
      question: `What trends are affecting ${symbol}'s makeup revenue?`,
      answer: `Key trends impacting ${symbol}'s makeup business: no-makeup makeup and natural looks, multi-use hybrid products, clean beauty and vegan cosmetics, inclusivity and diverse shade ranges, TikTok-driven viral launches, and the resurgence of lip products post-pandemic.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Makeup Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Makeup Revenue ${currentYear} - Color Cosmetics Analysis`,
    description: `Comprehensive analysis of ${companyName}'s makeup and color cosmetics revenue, market trends, and segment performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} makeup revenue`,
      `${symbol} cosmetics analysis`,
      `${symbol} color cosmetics`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} makeup revenue analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(makeupFaqs)

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
            <span>{symbol} Makeup Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Makeup Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} color cosmetics segment performance and market trends
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

          {/* Makeup Segment Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Makeup Segment Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The makeup category is a core revenue pillar for {companyName}, encompassing face, lip, eye, and nail products. This segment is characterized by trend-driven purchasing, social media influence, and rapid product innovation cycles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Top Categories</p>
                  <p className="text-lg font-bold mt-1">Face, Lip, Eye</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Channels</p>
                  <p className="text-lg font-bold mt-1">Retail & E-commerce</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Trend Cycle</p>
                  <p className="text-lg font-bold mt-1 text-purple-500">Fast-Moving</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Makeup Revenue Drivers</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Viral Product Launches</h3>
                <p className="text-muted-foreground">TikTok and Instagram-driven viral products create immediate demand spikes and drive significant revenue growth.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Inclusivity & Shade Expansion</h3>
                <p className="text-muted-foreground">Expanded shade ranges for foundations and concealers capturing diverse consumer segments and driving market share gains.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Clean Beauty Movement</h3>
                <p className="text-muted-foreground">Reformulation of bestsellers with clean, vegan, and cruelty-free ingredients meeting consumer demand for conscious cosmetics.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Hybrid Products</h3>
                <p className="text-muted-foreground">Makeup-skincare hybrids like tinted moisturizers with SPF and serums blurring category lines and attracting new consumers.</p>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Makeup Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 rounded-lg border border-pink-500/30">
                <h3 className="font-bold mb-2">Social Commerce</h3>
                <p className="text-sm text-muted-foreground">Makeup purchases driven by TikTok tutorials, Instagram reels, and influencer recommendations.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="font-bold mb-2">Multi-Use Products</h3>
                <p className="text-sm text-muted-foreground">Growing demand for versatile products that work on lips, cheeks, and eyes for simplified routines.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-lg border border-amber-500/30">
                <h3 className="font-bold mb-2">Gen Z Preferences</h3>
                <p className="text-sm text-muted-foreground">Younger consumers driving trends toward bold colors, experimental looks, and values-driven brands.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="font-bold mb-2">Long-Wear Innovation</h3>
                <p className="text-sm text-muted-foreground">Continued demand for transfer-proof, long-lasting formulas that withstand masks and active lifestyles.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 p-8 rounded-xl border border-pink-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Cosmetics Business</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive makeup revenue breakdowns and beauty industry insights
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
              {makeupFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="makeup-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
