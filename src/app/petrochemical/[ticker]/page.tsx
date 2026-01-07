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
    title: `${symbol} Petrochemical Revenue - Petrochemical Business Analysis ${currentYear}`,
    description: `${symbol} petrochemical revenue breakdown: petrochemical segment performance, product mix, capacity, and market trends. Analyze ${symbol}'s petrochemical operations.`,
    keywords: [
      `${symbol} petrochemical`,
      `${symbol} petrochemical revenue`,
      `${symbol} ethylene`,
      `${symbol} propylene`,
      `${symbol} chemicals business`,
      `${symbol} downstream operations`,
    ],
    openGraph: {
      title: `${symbol} Petrochemical Revenue ${currentYear} | Business Analysis`,
      description: `Complete ${symbol} petrochemical segment analysis with revenue trends, capacity metrics, and market positioning.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/petrochemical/${ticker.toLowerCase()}`,
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

export default async function PetrochemicalPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/petrochemical/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate petrochemical FAQs
  const petrochemicalFaqs = [
    {
      question: `Does ${symbol} have petrochemical operations?`,
      answer: `${companyName}${sector === 'Energy' || sector === 'Materials' ? ' operates in the energy/materials sector and' : ''} may have petrochemical business segments producing basic chemicals like ethylene, propylene, aromatics, and derivatives used in plastics, resins, and other applications.`
    },
    {
      question: `What is ${symbol}'s petrochemical revenue?`,
      answer: `Petrochemical revenue depends on production capacity, utilization rates, and commodity pricing. ${sector === 'Energy' ? 'Integrated energy companies often have downstream petrochemical operations complementing upstream oil and gas production.' : 'Pure-play chemical companies focus on converting hydrocarbon feedstocks into value-added products.'}`
    },
    {
      question: `How cyclical are ${symbol}'s petrochemical operations?`,
      answer: `Petrochemical margins are highly cyclical, driven by supply-demand dynamics, capacity additions, feedstock costs, and economic growth. Profitability can swing dramatically between upcycles (tight supply) and downcycles (overcapacity).`
    },
    {
      question: `What petrochemical products does ${symbol} produce?`,
      answer: `Common petrochemical products include ethylene (polyethylene feedstock), propylene (polypropylene), benzene, toluene, xylene, styrene, and various intermediates. Product mix determines margin profiles and end-market exposure.`
    },
    {
      question: `How do petrochemicals affect ${symbol}'s overall earnings?`,
      answer: `For integrated companies, petrochemical earnings provide diversification and downstream value capture. However, margin volatility can significantly impact quarterly results${sector ? ` in the ${sector} sector` : ''}, making segment analysis critical for investors.`
    },
    {
      question: `What drives ${symbol}'s petrochemical margins?`,
      answer: `Key margin drivers include feedstock costs (naphtha vs. ethane advantage), capacity utilization, product pricing, operating efficiency, and regional supply-demand balances. Integrated producers may benefit from captive feedstock supply.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Petrochemical`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Petrochemical Revenue ${currentYear} - Business Segment Analysis`,
    description: `Complete petrochemical analysis for ${symbol} (${companyName}) with revenue trends and margin drivers.`,
    url: pageUrl,
    keywords: [
      `${symbol} petrochemical`,
      `${symbol} petrochemical revenue`,
      `${symbol} chemicals`,
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

  const faqSchema = getFAQSchema(petrochemicalFaqs)

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
            <span>{symbol} Petrochemical</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Petrochemical Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Petrochemical business segment analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-6">Petrochemical Segment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Focus</p>
                <p className="text-xl font-bold">Petrochemicals</p>
                <p className="text-sm text-muted-foreground mt-1">Downstream operations</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-xl font-bold">{industry || sector || 'Chemicals'}</p>
                <p className="text-sm text-muted-foreground mt-1">Business sector</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cyclicality</p>
                <p className="text-xl font-bold">High</p>
                <p className="text-sm text-muted-foreground mt-1">Earnings volatility</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Petrochemical Business Analysis</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Major Petrochemical Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Olefins</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Ethylene (PE feedstock)</li>
                      <li>• Propylene (PP feedstock)</li>
                      <li>• Butadiene (synthetic rubber)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Aromatics</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Benzene (styrene, phenol)</li>
                      <li>• Toluene (solvents)</li>
                      <li>• Xylene (PET, polyester)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Derivatives</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Polyethylene (PE)</li>
                      <li>• Polypropylene (PP)</li>
                      <li>• Styrene</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Intermediates</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Ethylene oxide</li>
                      <li>• Vinyl chloride</li>
                      <li>• Cumene</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Margin Drivers & Cycle Dynamics</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Feedstock Economics</h4>
                    <p>Petrochemical profitability heavily depends on the feedstock slate. Ethane-based crackers
                    (predominantly US) enjoy cost advantages versus naphtha-based crackers (Asia, Europe) when oil prices are high.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Capacity Cycles</h4>
                    <p>Petrochemical margins follow multi-year cycles driven by capacity additions and demand growth.
                    Upcycles feature tight markets and high margins, while downcycles see overcapacity and margin compression.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Utilization Rates</h4>
                    <p>Operating rates above 90% typically signal strong pricing power and margin expansion. Rates below
                    80% indicate oversupply conditions and pricing pressure.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Implications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Considerations</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Cycle Positioning</h3>
                <p className="text-muted-foreground">
                  Understanding where {symbol} sits in the petrochemical cycle is crucial for valuation. Buying during
                  downcycles (depressed margins, low multiples) and selling during upcycles (peak margins, high multiples)
                  drives long-term returns in cyclical chemicals.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Integration Advantage</h3>
                <p className="text-muted-foreground">
                  {sector === 'Energy' ? 'Integrated energy companies' : 'Vertically integrated chemical companies'} with
                  captive feedstock supply may achieve more stable margins through the cycle compared to merchant crackers
                  dependent on purchased feedstocks.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Regional Dynamics</h3>
                <p className="text-muted-foreground">
                  Monitor capacity additions in key regions (US shale advantage, Middle East, China). Regional supply-demand
                  imbalances create trading opportunities and impact {companyName}'s competitive positioning.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Segment Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, segment margins, and business diversification
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
              {petrochemicalFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Segment analysis is based on publicly available financial disclosures. Petrochemical markets are highly cyclical and volatile. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="petrochemical" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
