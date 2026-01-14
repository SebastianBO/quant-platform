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
    title: `${symbol} Agricultural Chemicals - Ag Chem Revenue & Analysis ${currentYear}`,
    description: `${symbol} agricultural chemicals revenue: crop protection, fertilizers, seeds, ag biotech, and farming solutions. Analyze ${symbol}'s ag chem business segment.`,
    keywords: [
      `${symbol} agricultural chemicals`,
      `${symbol} ag chem`,
      `${symbol} crop protection`,
      `${symbol} pesticides`,
      `${symbol} fertilizers`,
      `${symbol} herbicides`,
    ],
    openGraph: {
      title: `${symbol} Agricultural Chemicals ${currentYear} | Ag Chem Revenue`,
      description: `Complete ${symbol} agricultural chemicals analysis with crop protection revenue, market trends, and segment performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/agricultural-chemicals/${ticker.toLowerCase()}`,
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

export default async function AgriculturalChemicalsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/agricultural-chemicals/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate agricultural chemicals FAQs
  const agChemFaqs = [
    {
      question: `Does ${symbol} produce agricultural chemicals?`,
      answer: `${companyName}${sector === 'Materials' || industry?.toLowerCase().includes('chemical') ? ' operates in the chemicals industry and' : ''} may have agricultural chemical operations producing crop protection products, fertilizers, seeds, and farming solutions for the global agriculture market.`
    },
    {
      question: `What is ${symbol}'s ag chem revenue?`,
      answer: `Agricultural chemical revenue depends on farming activity, commodity prices, weather patterns, and regulatory environments. Major product categories include herbicides, insecticides, fungicides, fertilizers, and biotechnology seed treatments.`
    },
    {
      question: `How seasonal are ${symbol}'s ag chem sales?`,
      answer: `Agricultural chemicals exhibit strong seasonality tied to planting and growing seasons in key markets (North America spring, South America fall). Revenue and earnings are typically concentrated in the first half of the calendar year for Northern Hemisphere-focused companies.`
    },
    {
      question: `What affects ${symbol}'s ag chem performance?`,
      answer: `Key drivers include crop commodity prices (corn, soybeans, wheat), planted acreage, farmer income, weather conditions, pest pressures, regulatory approvals, generic competition, and agricultural innovation cycles${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `How does ${symbol} compete in ag chemicals?`,
      answer: `Competitive advantages come from proprietary active ingredients, patent protection, product innovation, distribution networks, technical services, and bundled seed/chemistry offerings. Generic competition intensifies after patent expiration.`
    },
    {
      question: `What are the growth drivers for ${symbol}'s ag chem business?`,
      answer: `Long-term growth drivers include global population growth requiring increased food production, adoption of precision agriculture, biologicals and sustainable crop protection, emerging market expansion, and trait development in seeds and biotechnology.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Agricultural Chemicals`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Agricultural Chemicals ${currentYear} - Ag Chem Revenue Analysis`,
    description: `Complete agricultural chemicals analysis for ${symbol} (${companyName}) with crop protection revenue and market trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} agricultural chemicals`,
      `${symbol} ag chem`,
      `${symbol} crop protection`,
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

  const faqSchema = getFAQSchema(agChemFaqs)

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
            <span>{symbol} Agricultural Chemicals</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Agricultural Chemicals {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ag chem revenue and crop protection analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-green-600/20 to-yellow-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Ag Chem Segment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Focus</p>
                <p className="text-xl font-bold">Crop Protection</p>
                <p className="text-sm text-muted-foreground mt-1">Agricultural solutions</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Agriculture'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seasonality</p>
                <p className="text-xl font-bold">High</p>
                <p className="text-sm text-muted-foreground mt-1">Planting season driven</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Agricultural Chemicals Business</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Crop Protection Product Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Herbicides</h4>
                    <p className="text-sm">Weed control products including glyphosate, glufosinate, dicamba, and proprietary
                    selective herbicides. Largest crop protection category by revenue.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Insecticides</h4>
                    <p className="text-sm">Pest management solutions including neonicotinoids, pyrethroids, and biological
                    controls for protecting crops from insect damage.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Fungicides</h4>
                    <p className="text-sm">Disease control products protecting crops from fungal pathogens. Critical for
                    high-value crops and regions with disease pressure.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Seed Treatments</h4>
                    <p className="text-sm">Applied directly to seeds for early-season protection against pests and diseases,
                    often bundled with seed sales.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Market Dynamics & Trends</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Seasonal Revenue Patterns</h4>
                    <p>North American spring planting drives Q1-Q2 sales concentration. South American planting (Sept-Dec)
                    provides some balance. Weather delays or commodity price weakness can significantly impact quarterly results.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Generic Competition</h4>
                    <p>Patent expirations expose blockbuster molecules to generic competition, creating pricing pressure.
                    Companies must continuously innovate and launch new active ingredients to sustain margins.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Sustainability Shift</h4>
                    <p>Growing demand for biological crop protection, precision agriculture, and sustainable farming practices.
                    Companies investing in biologicals and digital farming solutions may capture long-term growth.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Considerations</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Commodity Price Linkage</h3>
                <p className="text-muted-foreground">
                  {companyName}'s ag chem performance correlates with crop commodity prices. When corn and soybean prices
                  are strong, farmers have more income to invest in crop protection, driving volume and pricing. Monitor
                  CBOT futures and farm income trends.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Patent Cliff Analysis</h3>
                <p className="text-muted-foreground">
                  Evaluate {symbol}'s product pipeline and patent expiration schedule. Companies with strong R&D pipelines
                  and new product launches can offset generic erosion. Innovation is critical for maintaining margins.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Regulatory Environment</h3>
                <p className="text-muted-foreground">
                  Agricultural chemical approvals face increasing scrutiny in developed markets. Companies with strong
                  regulatory expertise and sustainable product portfolios (biologicals, reduced-risk actives) may gain
                  competitive advantages.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Segment Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, segment margins, and business performance
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
              {agChemFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Agricultural chemicals segment analysis is based on publicly available data. Ag chem markets are subject to weather, commodity prices, and regulatory changes. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="agricultural-chemicals" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
