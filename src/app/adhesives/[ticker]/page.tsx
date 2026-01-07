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
    title: `${symbol} Adhesives Revenue - Adhesives & Sealants Business ${currentYear}`,
    description: `${symbol} adhesives revenue analysis: industrial adhesives, construction sealants, packaging adhesives, and specialty bonding solutions. Analyze ${symbol}'s adhesives segment.`,
    keywords: [
      `${symbol} adhesives`,
      `${symbol} adhesives revenue`,
      `${symbol} sealants`,
      `${symbol} industrial adhesives`,
      `${symbol} construction adhesives`,
      `${symbol} bonding solutions`,
    ],
    openGraph: {
      title: `${symbol} Adhesives Revenue ${currentYear} | Adhesives & Sealants`,
      description: `Complete ${symbol} adhesives business analysis with revenue trends, product mix, and market positioning.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/adhesives/${ticker.toLowerCase()}`,
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

export default async function AdhesivesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/adhesives/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate adhesives FAQs
  const adhesivesFaqs = [
    {
      question: `Does ${symbol} produce adhesives and sealants?`,
      answer: `${companyName}${sector === 'Materials' || industry?.toLowerCase().includes('chemical') ? ' operates in the materials/chemicals industry and' : ''} may manufacture adhesives and sealants including structural adhesives, hot melts, pressure-sensitive adhesives, construction sealants, and specialty bonding solutions for diverse industries.`
    },
    {
      question: `What is ${symbol}'s adhesives revenue?`,
      answer: `Adhesives revenue depends on end market activity (packaging, construction, automotive, electronics), raw material costs, product mix (commodity vs. specialty), and innovation in bonding technologies. Specialty adhesives typically command premium margins.`
    },
    {
      question: `How cyclical is ${symbol}'s adhesives business?`,
      answer: `Adhesives for packaging and consumer goods offer stability, while construction and automotive adhesives are more cyclical${sector ? ` in the ${sector} sector` : ''}. Industrial adhesives correlate with manufacturing activity. Portfolio diversification reduces overall cyclicality.`
    },
    {
      question: `What drives ${symbol}'s adhesives margins?`,
      answer: `Margin drivers include product differentiation, technical service value, raw material costs (polymers, resins), application efficiency, and switching costs. Companies with proprietary formulations and strong customer relationships achieve better margins.`
    },
    {
      question: `What end markets does ${symbol}'s adhesives business serve?`,
      answer: `Major segments include packaging (flexible packaging, labels, tapes), construction (structural bonding, sealants), automotive (lightweighting, assembly), electronics (displays, semiconductors), woodworking, and general industrial assembly applications.`
    },
    {
      question: `How is ${symbol} innovating in adhesives?`,
      answer: `Innovation focuses on sustainable formulations (bio-based, recycled content), structural bonding for lightweighting, fast-cure systems for manufacturing efficiency, and high-performance adhesives for demanding applications (aerospace, medical, electronics).`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Adhesives`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Adhesives Revenue ${currentYear} - Adhesives & Sealants Analysis`,
    description: `Complete adhesives analysis for ${symbol} (${companyName}) with revenue trends and market dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} adhesives`,
      `${symbol} adhesives revenue`,
      `${symbol} sealants`,
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

  const faqSchema = getFAQSchema(adhesivesFaqs)

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
            <span>{symbol} Adhesives</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Adhesives Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Adhesives and sealants business analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Adhesives Segment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Focus</p>
                <p className="text-xl font-bold">Bonding Solutions</p>
                <p className="text-sm text-muted-foreground mt-1">Adhesives & sealants</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Specialty Chemicals'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cyclicality</p>
                <p className="text-xl font-bold">Low-Moderate</p>
                <p className="text-sm text-muted-foreground mt-1">Diversified exposure</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Adhesives Product Portfolio</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Product Categories by Technology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Hot Melt Adhesives</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Packaging - Case & carton sealing</li>
                      <li>• Product assembly - Disposables</li>
                      <li>• Bookbinding - Publishing</li>
                      <li>• Fast setting, thermoplastic</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Pressure-Sensitive Adhesives (PSA)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Labels & tapes - Consumer/industrial</li>
                      <li>• Graphics - Signage, decals</li>
                      <li>• Medical - Wound care, devices</li>
                      <li>• Instant bonding, removable</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Structural Adhesives</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Automotive - Multi-material bonding</li>
                      <li>• Construction - Panels, assemblies</li>
                      <li>• Aerospace - Lightweight structures</li>
                      <li>• High strength, durability</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Sealants</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Construction - Windows, joints</li>
                      <li>• Automotive - Windshields, bodies</li>
                      <li>• Industrial - Gaskets, sealing</li>
                      <li>• Weather & chemical resistance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">End Market Applications</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Packaging</h4>
                    <p>Largest adhesives segment by volume. Hot melts and water-based adhesives for corrugated, flexible
                    packaging, labels, and tapes. Stable demand tied to e-commerce growth and consumer goods production.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Construction</h4>
                    <p>Structural adhesives and sealants for residential and commercial building. Growth driven by energy
                    efficiency requirements, prefabrication trends, and substitution of mechanical fasteners.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Transportation</h4>
                    <p>Automotive lightweighting drives structural adhesive adoption (metal-to-composite bonding). Also
                    aerospace, marine, and rail applications requiring high-performance bonding solutions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Electronics</h4>
                    <p>Specialty adhesives for semiconductors, displays, PCB assembly, and consumer electronics. Precision
                    bonding, thermal management, and optical applications command premium pricing.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Market Dynamics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Market Dynamics & Trends</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Growth Drivers</h3>
                <p className="text-muted-foreground">
                  Long-term adhesives growth driven by substitution of mechanical fastening (weight reduction, design flexibility),
                  multi-material bonding (dissimilar substrates), e-commerce packaging demand, and emerging market industrialization.
                  {companyName}'s exposure to these trends affects growth potential.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Competitive Positioning</h3>
                <p className="text-muted-foreground">
                  Adhesives markets feature global leaders (Henkel, 3M, H.B. Fuller, Sika) and regional specialists.
                  Differentiation comes from application expertise, technical service, formulation capabilities, and
                  customer intimacy. Evaluate {symbol}'s market position across segments.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Sustainability Innovation</h3>
                <p className="text-muted-foreground">
                  Industry shift toward bio-based adhesives (renewable content), solvent-free formulations, and circular
                  economy solutions (debonding for recycling). Companies investing in sustainable technologies may capture
                  premium pricing and regulatory advantages.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Margin Profile</h3>
                <p className="text-muted-foreground">
                  Specialty adhesives (structural, electronics, medical) achieve 20-25%+ EBITDA margins through differentiation
                  and technical service. Commodity packaging adhesives operate at 10-15%. Product mix determines overall
                  profitability${sector ? ` in the ${sector} sector` : ''}.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Segment Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, margin trends, and business performance
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
              {adhesivesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Adhesives segment analysis is based on publicly available information. Market conditions and raw material costs subject to volatility. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="adhesives" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
