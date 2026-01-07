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
    title: `${symbol} Plastics Revenue - Plastics & Polymers Business ${currentYear}`,
    description: `${symbol} plastics revenue analysis: polyethylene, polypropylene, PVC, engineering plastics, and polymer sales. Analyze ${symbol}'s plastics segment performance.`,
    keywords: [
      `${symbol} plastics`,
      `${symbol} plastics revenue`,
      `${symbol} polymers`,
      `${symbol} polyethylene`,
      `${symbol} polypropylene`,
      `${symbol} resins`,
    ],
    openGraph: {
      title: `${symbol} Plastics Revenue ${currentYear} | Polymers Business`,
      description: `Complete ${symbol} plastics and polymers analysis with revenue trends, product mix, and market dynamics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/plastics/${ticker.toLowerCase()}`,
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

export default async function PlasticsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/plastics/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate plastics FAQs
  const plasticsFaqs = [
    {
      question: `Does ${symbol} produce plastics?`,
      answer: `${companyName}${sector === 'Materials' || industry?.toLowerCase().includes('chemical') ? ' operates in the materials/chemicals industry and' : ''} may manufacture plastics and polymers including polyethylene (PE), polypropylene (PP), polyvinyl chloride (PVC), and engineering resins for packaging, automotive, construction, and consumer applications.`
    },
    {
      question: `What is ${symbol}'s plastics revenue?`,
      answer: `Plastics revenue depends on resin prices, demand from packaging and durable goods markets, capacity utilization, and feedstock costs. Major product categories include commodity resins (PE, PP, PVC) and specialty/engineering polymers.`
    },
    {
      question: `How cyclical is ${symbol}'s plastics business?`,
      answer: `Commodity plastics are highly cyclical, with margins driven by supply-demand dynamics and feedstock economics. Specialty plastics offer more stable margins through differentiation. Overall cyclicality depends on portfolio mix.`
    },
    {
      question: `What drives ${symbol}'s plastics margins?`,
      answer: `Key margin drivers include monomer prices (ethylene, propylene), capacity utilization, product mix (commodity vs. specialty), operating efficiency, and the ability to pass through feedstock costs. Integrated producers may have cost advantages.`
    },
    {
      question: `Is ${symbol} affected by plastic sustainability concerns?`,
      answer: `Growing sustainability pressure drives demand for recycled content, bio-based plastics, and circular economy solutions. Companies investing in advanced recycling, renewable feedstocks, and sustainable packaging may gain competitive advantages${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What end markets does ${symbol}'s plastics business serve?`,
      answer: `Major end markets include flexible and rigid packaging (largest segment), automotive (lightweighting), construction (pipes, profiles), consumer goods, electronics, and industrial applications. End market exposure drives growth and cyclicality.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Plastics`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Plastics Revenue ${currentYear} - Polymers Business Analysis`,
    description: `Complete plastics analysis for ${symbol} (${companyName}) with revenue trends and market dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} plastics`,
      `${symbol} plastics revenue`,
      `${symbol} polymers`,
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

  const faqSchema = getFAQSchema(plasticsFaqs)

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
            <span>{symbol} Plastics</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Plastics Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plastics and polymers business analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Plastics Segment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Focus</p>
                <p className="text-xl font-bold">Polymers & Resins</p>
                <p className="text-sm text-muted-foreground mt-1">Plastics manufacturing</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Materials'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cyclicality</p>
                <p className="text-xl font-bold">Medium-High</p>
                <p className="text-sm text-muted-foreground mt-1">Demand driven</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Plastics Product Portfolio</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Commodity Plastics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Polyethylene (PE)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• LDPE (Low-density) - Films, bags</li>
                      <li>• LLDPE (Linear low-density) - Flexible packaging</li>
                      <li>• HDPE (High-density) - Bottles, containers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Polypropylene (PP)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Homopolymer - Rigid packaging</li>
                      <li>• Copolymer - Impact resistance</li>
                      <li>• Random copolymer - Transparency</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Polyvinyl Chloride (PVC)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Rigid PVC - Pipes, construction</li>
                      <li>• Flexible PVC - Wire/cable, film</li>
                      <li>• Medical grade - Healthcare</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Polystyrene (PS)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• GPPS - General purpose</li>
                      <li>• HIPS - High impact</li>
                      <li>• EPS - Expanded foam</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Engineering & Specialty Plastics</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Performance Polymers</h4>
                    <p>Nylon (PA), polycarbonate (PC), polyester (PET), acetal (POM), and other engineering resins
                    offering superior mechanical properties, heat resistance, and chemical stability for demanding applications.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Specialty Applications</h4>
                    <p>High-performance polymers (PEEK, PPS, fluoropolymers) for aerospace, medical devices, electronics,
                    and industrial applications. Premium margins but smaller volumes versus commodity resins.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Sustainable Solutions</h4>
                    <p>Bio-based plastics, recycled content resins, and advanced recycling technologies addressing
                    circular economy demands. Growing importance for brand protection and regulatory compliance.</p>
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
                <h3 className="font-bold text-lg mb-2">Supply-Demand Cycles</h3>
                <p className="text-muted-foreground">
                  Plastics markets follow multi-year cycles driven by capacity additions (new crackers, polymerization units)
                  and demand growth. {companyName}'s profitability depends on utilization rates and pricing power during
                  different cycle phases.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Feedstock Economics</h3>
                <p className="text-muted-foreground">
                  Plastics margins are highly sensitive to monomer prices (ethylene, propylene). Companies with integrated
                  monomer production may achieve more stable margins than merchant resin producers buying monomers externally.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Sustainability Transition</h3>
                <p className="text-muted-foreground">
                  Single-use plastics face regulatory pressure and consumer backlash. Winners will offer sustainable alternatives
                  (recycled content, bio-based, recyclable designs) while maintaining performance and cost competitiveness.
                  Monitor {symbol}'s sustainability investments and circular economy initiatives.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Business Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete segment breakdown, revenue trends, and profitability metrics
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
              {plasticsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Plastics segment analysis is based on publicly available information. Plastics markets are cyclical and subject to regulatory changes. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="plastics" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
