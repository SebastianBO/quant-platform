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
    title: `${symbol} Sustainable Beauty ${currentYear} - Clean & Eco-Friendly Products`,
    description: `${symbol} sustainable beauty initiatives for ${currentYear}. Clean beauty products, eco-friendly packaging, and environmental commitments analysis.`,
    keywords: [
      `${symbol} sustainable beauty`,
      `${symbol} clean beauty`,
      `${symbol} eco-friendly`,
      `${symbol} green beauty`,
      `${symbol} sustainability`,
      `${symbol} natural beauty`,
    ],
    openGraph: {
      title: `${symbol} Sustainable Beauty ${currentYear} | Clean Beauty Analysis`,
      description: `Analysis of ${symbol}'s sustainable beauty initiatives, clean products, and environmental commitments.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sustainability-beauty/${ticker.toLowerCase()}`,
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

export default async function SustainabilityBeautyPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/sustainability-beauty/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Sustainability FAQs
  const sustainabilityFaqs = [
    {
      question: `What are ${symbol}'s sustainable beauty initiatives?`,
      answer: `${companyName} (${symbol}) has committed to sustainable beauty through clean formulations, eco-friendly packaging, carbon reduction targets, sustainable ingredient sourcing, and transparency in supply chains. The company is reformulating products to meet clean beauty standards and investing in renewable packaging solutions.`
    },
    {
      question: `What is clean beauty and how does ${symbol} define it?`,
      answer: `Clean beauty focuses on products made without controversial or potentially harmful ingredients like parabens, sulfates, phthalates, and synthetic fragrances. ${companyName} defines clean beauty through ingredient exclusion lists, third-party certifications, and transparent labeling across its brand portfolio.`
    },
    {
      question: `What are ${symbol}'s packaging sustainability goals?`,
      answer: `${companyName} has set targets for recyclable, refillable, and reusable packaging across its beauty brands. Initiatives include eliminating virgin plastic, introducing refillable containers, using post-consumer recycled materials, and reducing overall packaging weight to minimize environmental impact.`
    },
    {
      question: `How does ${symbol} source sustainable ingredients?`,
      answer: `${symbol} focuses on responsibly sourced natural and organic ingredients, fair trade partnerships, biodiversity protection, and elimination of environmentally harmful ingredients. The company works with suppliers to ensure sustainable harvesting practices and support for local communities.`
    },
    {
      question: `What certifications do ${symbol}'s sustainable products have?`,
      answer: `${companyName}'s sustainable beauty products may carry certifications like USDA Organic, Ecocert, Leaping Bunny (cruelty-free), B Corp, Fair Trade, and various clean beauty seals. Specific certifications vary by brand and product within ${symbol}'s portfolio.`
    },
    {
      question: `How does sustainability impact ${symbol}'s financial performance?`,
      answer: `Sustainable beauty products often command premium pricing and attract conscious consumers willing to pay more for clean, eco-friendly products. While sustainability initiatives require upfront investment, they drive long-term brand loyalty, attract ESG-focused investors, and reduce regulatory risks for ${companyName}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Sustainable Beauty`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Sustainable Beauty ${currentYear} - Clean & Eco-Friendly Initiatives`,
    description: `Comprehensive analysis of ${companyName}'s sustainable beauty initiatives, clean products, and environmental commitments.`,
    url: pageUrl,
    keywords: [
      `${symbol} sustainable beauty`,
      `${symbol} clean beauty`,
      `${symbol} eco-friendly`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} sustainability analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(sustainabilityFaqs)

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
            <span>{symbol} Sustainable Beauty</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Sustainable Beauty Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} clean beauty initiatives and environmental commitments
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

          {/* Sustainability Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Sustainable Beauty Commitment</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Sustainable and clean beauty has become a strategic priority for {companyName}, responding to consumer demand for eco-friendly, transparent, and responsibly-made products. The company is investing in clean formulations, sustainable packaging, and carbon reduction across its beauty portfolio.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Focus Areas</p>
                  <p className="text-lg font-bold mt-1">Clean, Sustainable, Ethical</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Consumer Demand</p>
                  <p className="text-lg font-bold mt-1">Growing</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Market Position</p>
                  <p className="text-lg font-bold mt-1 text-green-500">Premium</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sustainability Pillars */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Sustainability Strategy Pillars</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Clean Formulations</h3>
                <p className="text-muted-foreground">Reformulating products to eliminate controversial ingredients, using natural and organic alternatives, and maintaining transparency through full ingredient disclosure and clean beauty certifications.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Sustainable Packaging</h3>
                <p className="text-muted-foreground">Transitioning to recyclable, refillable, and biodegradable packaging using post-consumer recycled materials, eliminating single-use plastics, and reducing overall packaging weight and complexity.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Carbon Reduction</h3>
                <p className="text-muted-foreground">Setting science-based carbon reduction targets, investing in renewable energy, optimizing supply chains, and working toward carbon-neutral or carbon-negative operations across {companyName}'s facilities.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Ethical Sourcing</h3>
                <p className="text-muted-foreground">Ensuring fair trade ingredient sourcing, protecting biodiversity, supporting local farming communities, and maintaining cruelty-free practices across all product development and testing.</p>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Clean Beauty Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-lg border border-green-500/30">
                <h3 className="font-bold mb-2">Transparency Demand</h3>
                <p className="text-sm text-muted-foreground">Consumers demanding full ingredient disclosure, supply chain transparency, and third-party certifications to validate clean beauty claims.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-lg border border-blue-500/30">
                <h3 className="font-bold mb-2">Waterless Beauty</h3>
                <p className="text-sm text-muted-foreground">Innovation in waterless formulations reducing water consumption in manufacturing and extending product shelf life without preservatives.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 rounded-lg border border-amber-500/30">
                <h3 className="font-bold mb-2">Refillable Revolution</h3>
                <p className="text-sm text-muted-foreground">Refillable packaging becoming mainstream across beauty categories, reducing waste and creating recurring revenue streams.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="font-bold mb-2">Biodegradable Innovation</h3>
                <p className="text-sm text-muted-foreground">Development of biodegradable formulations and packaging that naturally break down without harming ecosystems.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} ESG Performance</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis of sustainability initiatives and ESG metrics
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
              {sustainabilityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Sustainability data is based on publicly available information and company disclosures. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="sustainability-beauty" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
