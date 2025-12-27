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
    title: `${symbol} Specialty Chemicals - Specialty vs Commodity Mix ${currentYear}`,
    description: `${symbol} specialty chemicals analysis: specialty vs commodity product mix, margin profiles, and revenue breakdown. Analyze ${symbol}'s chemical portfolio composition.`,
    keywords: [
      `${symbol} specialty chemicals`,
      `${symbol} commodity chemicals`,
      `${symbol} product mix`,
      `${symbol} chemical margins`,
      `${symbol} specialty vs commodity`,
      `${symbol} chemical portfolio`,
    ],
    openGraph: {
      title: `${symbol} Specialty Chemicals ${currentYear} | Product Mix Analysis`,
      description: `Complete ${symbol} specialty vs commodity chemicals breakdown with margin analysis and revenue composition.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/specialty-chemicals/${ticker.toLowerCase()}`,
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

export default async function SpecialtyChemicalsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/specialty-chemicals/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate specialty chemicals FAQs
  const specialtyFaqs = [
    {
      question: `Does ${symbol} produce specialty chemicals?`,
      answer: `${companyName}${sector === 'Materials' || industry?.toLowerCase().includes('chemical') ? ' operates in the chemicals industry and' : ''} may produce both specialty and commodity chemicals. Specialty chemicals typically offer higher margins due to differentiation and specialized applications.`
    },
    {
      question: `What is the difference between specialty and commodity chemicals?`,
      answer: `Specialty chemicals are high-value, differentiated products sold based on performance rather than composition, typically commanding premium pricing. Commodity chemicals are standardized products sold primarily on price and volume, with lower margins but stable demand.`
    },
    {
      question: `Why does ${symbol}'s specialty vs commodity mix matter?`,
      answer: `The product mix significantly impacts ${symbol}'s profitability and valuation. Companies with higher specialty chemical exposure typically achieve better margins, pricing power, and less cyclicality compared to commodity-heavy portfolios.`
    },
    {
      question: `How does ${symbol}'s chemical mix affect margins?`,
      answer: `Specialty chemicals generally deliver gross margins of 30-50%+, while commodity chemicals often operate at 10-20% margins. ${companyName}'s overall margin profile reflects its portfolio composition and market positioning.`
    },
    {
      question: `Is ${symbol} shifting toward specialty chemicals?`,
      answer: `Many chemical companies strategically shift toward specialty products to improve margins and reduce cyclicality. Investors should monitor ${symbol}'s portfolio evolution, R&D investments, and acquisition activity for signs of this strategic transition.`
    },
    {
      question: `What specialty chemical markets does ${symbol} serve?`,
      answer: `Specialty chemical markets include pharmaceuticals, agriculture, electronics, coatings, adhesives, and personal care. ${companyName}'s market exposure${industry ? ` in the ${industry} industry` : ''} determines its growth potential and competitive positioning.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Specialty Chemicals`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Specialty Chemicals ${currentYear} - Specialty vs Commodity Analysis`,
    description: `Complete specialty chemicals analysis for ${symbol} (${companyName}) with product mix and margin breakdowns.`,
    url: pageUrl,
    keywords: [
      `${symbol} specialty chemicals`,
      `${symbol} commodity chemicals`,
      `${symbol} product mix`,
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

  const faqSchema = getFAQSchema(specialtyFaqs)

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
            <span>{symbol} Specialty Chemicals</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Specialty Chemicals {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Specialty vs commodity chemical product mix for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Chemical Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Product Focus</p>
                <p className="text-xl font-bold">Specialty Chemicals</p>
                <p className="text-sm text-muted-foreground mt-1">High-margin differentiation</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Chemicals'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Driver</p>
                <p className="text-xl font-bold">Margin Profile</p>
                <p className="text-sm text-muted-foreground mt-1">Profitability indicator</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Specialty vs Commodity Analysis</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-purple-500">Specialty Chemicals</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Higher Margins:</strong> Typically 30-50%+ gross margins due to differentiation and performance-based pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Customer Stickiness:</strong> Long-term relationships and switching costs protect pricing power</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Innovation Focus:</strong> R&D-intensive with custom solutions and technical expertise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Less Cyclical:</strong> More stable demand patterns compared to commodity chemicals</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 text-blue-500">Commodity Chemicals</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Lower Margins:</strong> Typically 10-20% gross margins due to standardization and price competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Volume-Driven:</strong> Profitability depends on scale, capacity utilization, and operational efficiency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Cyclical Nature:</strong> Highly sensitive to economic cycles and supply-demand dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Cost Focus:</strong> Competitive advantage through operational excellence and feedstock costs</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Implications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Implications</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Why Product Mix Matters</h3>
                <p className="text-muted-foreground">
                  {companyName}'s specialty vs commodity mix fundamentally shapes its valuation multiple, margin sustainability,
                  and growth trajectory. Companies with higher specialty exposure typically trade at premium valuations due to
                  superior returns on capital and more predictable earnings.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Strategic Transitions</h3>
                <p className="text-muted-foreground">
                  Many chemical companies pursue strategic shifts toward specialty products through portfolio optimization,
                  divestitures of commodity assets, and acquisitions of high-margin specialty businesses. Monitor {symbol}'s
                  capital allocation and M&A activity for evidence of this transformation.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Margin Analysis</h3>
                <p className="text-muted-foreground">
                  Track {symbol}'s gross margin trends, EBITDA margins, and return on invested capital (ROIC) to assess the
                  quality of its chemical portfolio. Improving margins often signal successful specialty mix shifts or pricing
                  power in existing product lines.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete margin analysis, revenue breakdowns, and profitability metrics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Margin Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {specialtyFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Product portfolio analysis is based on publicly available information. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="specialty-chemicals" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
