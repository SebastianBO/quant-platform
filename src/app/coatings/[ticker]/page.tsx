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
    title: `${symbol} Coatings Revenue - Paints & Coatings Business ${currentYear}`,
    description: `${symbol} coatings revenue analysis: architectural paints, industrial coatings, automotive refinish, and protective coatings. Analyze ${symbol}'s coatings segment.`,
    keywords: [
      `${symbol} coatings`,
      `${symbol} coatings revenue`,
      `${symbol} paints`,
      `${symbol} industrial coatings`,
      `${symbol} automotive coatings`,
      `${symbol} protective coatings`,
    ],
    openGraph: {
      title: `${symbol} Coatings Revenue ${currentYear} | Paints & Coatings`,
      description: `Complete ${symbol} coatings business analysis with revenue trends, product mix, and market positioning.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/coatings/${ticker.toLowerCase()}`,
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

export default async function CoatingsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/coatings/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate coatings FAQs
  const coatingsFaqs = [
    {
      question: `Does ${symbol} produce coatings and paints?`,
      answer: `${companyName}${sector === 'Materials' || industry?.toLowerCase().includes('chemical') ? ' operates in the materials/chemicals industry and' : ''} may manufacture coatings including architectural paints, industrial coatings, automotive finishes, protective coatings, and specialty coating systems for diverse end markets.`
    },
    {
      question: `What is ${symbol}'s coatings revenue?`,
      answer: `Coatings revenue depends on construction activity (architectural), manufacturing production (industrial), automotive markets (OEM and refinish), infrastructure spending (protective), and raw material costs. Revenue mix drives overall margin profile.`
    },
    {
      question: `How cyclical is ${symbol}'s coatings business?`,
      answer: `Architectural coatings tied to housing and construction are moderately cyclical. Industrial and automotive coatings correlate strongly with manufacturing activity and auto production. Protective coatings for infrastructure offer more stable demand${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What drives ${symbol}'s coatings margins?`,
      answer: `Margin drivers include raw material costs (TiO2, resins, solvents), product mix (specialty vs. commodity), pricing power, volume/scale, innovation (sustainable formulations), and distribution efficiency. Brand strength matters in architectural markets.`
    },
    {
      question: `Is ${symbol} affected by sustainability trends in coatings?`,
      answer: `Growing demand for low-VOC, waterborne, powder, and high-solids coatings driven by environmental regulations and customer preferences. Companies with sustainable product portfolios may gain share and premium pricing.`
    },
    {
      question: `What end markets does ${symbol}'s coatings business serve?`,
      answer: `Major segments include architectural (residential/commercial paints), industrial (OEM coatings for appliances, machinery), automotive (OEM and refinish), protective (marine, infrastructure, oil & gas), and specialty (aerospace, electronics, packaging).`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Coatings`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Coatings Revenue ${currentYear} - Paints & Coatings Analysis`,
    description: `Complete coatings analysis for ${symbol} (${companyName}) with revenue trends and market dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} coatings`,
      `${symbol} coatings revenue`,
      `${symbol} paints`,
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

  const faqSchema = getFAQSchema(coatingsFaqs)

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
            <span>{symbol} Coatings</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Coatings Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Paints and coatings business analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Coatings Segment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Focus</p>
                <p className="text-xl font-bold">Paints & Coatings</p>
                <p className="text-sm text-muted-foreground mt-1">Surface protection</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Specialty Chemicals'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cyclicality</p>
                <p className="text-xl font-bold">Moderate</p>
                <p className="text-sm text-muted-foreground mt-1">Construction linked</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Coatings Product Portfolio</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Product Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Architectural Coatings</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Interior paints - Walls, ceilings</li>
                      <li>• Exterior paints - Weather resistance</li>
                      <li>• Primers & specialty finishes</li>
                      <li>• DIY and professional segments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Industrial Coatings</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• OEM coatings - Appliances, machinery</li>
                      <li>• Powder coatings - Electrostatic</li>
                      <li>• Coil coatings - Pre-painted metal</li>
                      <li>• Wood coatings - Furniture, flooring</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Automotive Coatings</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• OEM finishes - New vehicles</li>
                      <li>• Refinish - Collision repair</li>
                      <li>• Electrocoat - Corrosion protection</li>
                      <li>• Multi-layer systems</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Protective Coatings</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Marine coatings - Ships, offshore</li>
                      <li>• Infrastructure - Bridges, pipelines</li>
                      <li>• Oil & gas - Corrosion resistance</li>
                      <li>• Heavy-duty industrial</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Technology Trends</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Sustainability Shift</h4>
                    <p>Migration from solvent-based to waterborne, high-solids, and powder coatings driven by VOC
                    regulations and environmental concerns. Bio-based resins and recycled content gaining traction.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Performance Innovation</h4>
                    <p>Advanced formulations offering superior durability, weather resistance, antimicrobial properties,
                    self-healing, and functional benefits. R&D capabilities differentiate specialty coating producers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Raw Material Challenges</h4>
                    <p>Titanium dioxide (TiO2) is the largest raw material cost (opacity/whiteness). Resin costs (acrylic,
                    epoxy, polyurethane) also significant. Companies with reformulation capabilities and pricing power manage
                    inflation better.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Market Dynamics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Market Dynamics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">End Market Exposure</h3>
                <p className="text-muted-foreground">
                  {companyName}'s coatings performance correlates with housing starts and residential remodeling (architectural),
                  manufacturing PMI and auto production (industrial/automotive), and infrastructure spending (protective).
                  Diversified exposure across segments reduces cyclicality.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Competitive Positioning</h3>
                <p className="text-muted-foreground">
                  Coatings markets feature global leaders (PPG, Sherwin-Williams, AkzoNobel) and regional specialists.
                  Competitive advantages come from brand strength (architectural), technical service (industrial), innovation
                  (specialty), and distribution scale. Evaluate {symbol}'s market position and differentiation.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Margin Resilience</h3>
                <p className="text-muted-foreground">
                  Specialty coatings typically achieve 15-20%+ EBITDA margins through differentiation, while commodity
                  architectural paints operate at 10-15%. Product mix, pricing power, and operational efficiency determine
                  profitability through raw material inflation cycles.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete segment breakdown, margin trends, and profitability metrics
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
              {coatingsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Coatings segment analysis is based on publicly available information. Market conditions and raw material costs subject to volatility. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="coatings" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
