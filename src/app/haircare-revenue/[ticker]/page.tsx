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
    title: `${symbol} Haircare Revenue ${currentYear} - Hair Products Segment Analysis`,
    description: `${symbol} haircare revenue breakdown for ${currentYear}. Analysis of hair products segment performance, shampoo, conditioner, and styling trends.`,
    keywords: [
      `${symbol} haircare revenue`,
      `${symbol} hair products`,
      `${symbol} shampoo revenue`,
      `${symbol} haircare segment`,
      `${symbol} hair styling`,
      `${symbol} haircare analysis`,
    ],
    openGraph: {
      title: `${symbol} Haircare Revenue ${currentYear} | Hair Products Analysis`,
      description: `Deep dive into ${symbol}'s haircare revenue, product portfolio, and growth in the global hair products market.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/haircare-revenue/${ticker.toLowerCase()}`,
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

export default async function HaircareRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/haircare-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Haircare-specific FAQs
  const haircareFaqs = [
    {
      question: `What is ${symbol}'s haircare revenue?`,
      answer: `${companyName} (${symbol}) generates revenue from its haircare segment through shampoos, conditioners, hair treatments, styling products, and professional salon brands. The haircare category includes both mass-market and prestige products.`
    },
    {
      question: `How is ${symbol}'s haircare segment performing?`,
      answer: `The haircare category for ${symbol} is driven by innovation in clean formulations, specialized treatments for different hair types, professional-grade products, and the growing men's grooming market. Performance varies by subcategory and geographic region.`
    },
    {
      question: `What haircare brands does ${symbol} own?`,
      answer: `${companyName} operates a portfolio of haircare brands spanning drugstore, salon professional, and prestige segments. The company typically owns both heritage brands and newer digitally-native haircare lines.`
    },
    {
      question: `What are ${symbol}'s key haircare growth drivers?`,
      answer: `Major growth drivers for ${symbol}'s haircare business include: clean and sulfate-free formulations, curly and textured hair products, bond-building treatments, scalp care innovation, men's haircare expansion, and professional salon partnerships.`
    },
    {
      question: `How does ${symbol} compete in the haircare market?`,
      answer: `${companyName} competes through scientific innovation and clinical testing, salon professional partnerships and endorsements, targeted solutions for different hair types and concerns, clean beauty reformulations, and strong retail presence across mass and prestige channels.`
    },
    {
      question: `What trends are affecting ${symbol}'s haircare revenue?`,
      answer: `Key trends impacting ${symbol}'s haircare business: clean and sustainable formulations, textured hair and curl care specialization, scalp health and microbiome focus, bond repair and strengthening treatments, personalized hair diagnostics, and social media-driven hair care routines.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Haircare Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Haircare Revenue ${currentYear} - Hair Products Analysis`,
    description: `Comprehensive analysis of ${companyName}'s haircare revenue, product innovation, and segment performance trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} haircare revenue`,
      `${symbol} hair products analysis`,
      `${symbol} shampoo revenue`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} haircare revenue analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(haircareFaqs)

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
            <span>{symbol} Haircare Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Haircare Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} hair products segment performance and innovation trends
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

          {/* Haircare Segment Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Haircare Segment Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The haircare category is a steady revenue contributor for {companyName}, encompassing shampoos, conditioners, treatments, styling products, and professional salon brands. This segment benefits from repeat purchase behavior and brand loyalty.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Product Mix</p>
                  <p className="text-lg font-bold mt-1">Care & Styling</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Key Channels</p>
                  <p className="text-lg font-bold mt-1">Retail & Salon</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Purchase Cycle</p>
                  <p className="text-lg font-bold mt-1 text-blue-500">Repeat</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Haircare Revenue Drivers</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Clean Beauty Formulations</h3>
                <p className="text-muted-foreground">Sulfate-free, paraben-free, and clean ingredient formulations meeting consumer demand for safer hair products.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Textured Hair Specialization</h3>
                <p className="text-muted-foreground">Dedicated product lines for curly, coily, and textured hair addressing an underserved market with specific needs.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Bond Repair Technology</h3>
                <p className="text-muted-foreground">Innovative bond-building and strengthening treatments protecting hair from damage and driving premium pricing.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Scalp Care Focus</h3>
                <p className="text-muted-foreground">Growing emphasis on scalp health with specialized treatments, exfoliants, and microbiome-friendly products.</p>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Haircare Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-6 rounded-lg border border-teal-500/30">
                <h3 className="font-bold mb-2">Professional At-Home</h3>
                <p className="text-sm text-muted-foreground">Salon-quality treatments and professional-grade products for at-home use driving premiumization.</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-lg border border-indigo-500/30">
                <h3 className="font-bold mb-2">Personalization</h3>
                <p className="text-sm text-muted-foreground">Customized haircare solutions based on hair type, concerns, and environmental factors.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="font-bold mb-2">Sustainability</h3>
                <p className="text-sm text-muted-foreground">Refillable packaging, waterless formulations, and biodegradable ingredients gaining traction.</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 rounded-lg border border-orange-500/30">
                <h3 className="font-bold mb-2">Men's Grooming</h3>
                <p className="text-sm text-muted-foreground">Expanding men's haircare category with styling, thickening, and anti-aging products.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 p-8 rounded-xl border border-teal-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Haircare Business</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive haircare revenue analysis and beauty industry insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {haircareFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="haircare-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
