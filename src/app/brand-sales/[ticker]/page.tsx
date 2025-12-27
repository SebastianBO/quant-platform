import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Brand Sales Mix - Product Portfolio Analysis`,
    description: `${symbol} brand sales mix and product portfolio breakdown. Analyze brand performance, portfolio diversification, and revenue contribution by brand for ${symbol}.`,
    keywords: [
      `${symbol} brand sales`,
      `${symbol} product mix`,
      `${symbol} brand portfolio`,
      `${symbol} revenue by brand`,
      `${symbol} brand performance`,
      `${symbol} portfolio analysis`,
    ],
    openGraph: {
      title: `${symbol} Brand Sales Mix | Product Portfolio Analysis`,
      description: `Track ${symbol} brand sales mix and product portfolio revenue contribution.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/brand-sales/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function BrandSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/brand-sales/${ticker.toLowerCase()}`

  const brandSalesFaqs = [
    {
      question: `What is brand sales mix for ${symbol}?`,
      answer: `Brand sales mix for ${symbol} shows the revenue contribution from each brand or product line in the company's portfolio. This metric helps investors understand which brands drive growth, profitability, and overall business performance.`
    },
    {
      question: `Why is analyzing ${symbol} brand sales mix important?`,
      answer: `Understanding ${symbol}'s brand sales mix is crucial because different brands have varying growth rates, margins, and market positions. A strong mix shift toward premium brands can drive profitability even with modest volume growth.`
    },
    {
      question: `How does brand mix affect ${symbol} valuation?`,
      answer: `Brand mix significantly impacts ${symbol}'s valuation because premium brands typically command higher multiples due to pricing power, margins, and growth potential. Investors favor portfolios with strong flagship brands and growing premium segments.`
    },
    {
      question: `What drives brand mix changes for ${symbol}?`,
      answer: `${symbol}'s brand mix evolves through consumer preference shifts, marketing investments, product innovation, portfolio acquisitions and divestitures, geographic expansion of specific brands, and strategic resource allocation across the portfolio.`
    },
    {
      question: `How do investors evaluate ${symbol} brand portfolio strength?`,
      answer: `Investors assess ${symbol}'s brand portfolio by analyzing market share trends by brand, revenue growth rates, margin profiles, brand health metrics, innovation pipelines, and competitive positioning of key brands in their respective categories.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Brand Sales', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Brand Sales`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Brand Sales Mix - Product Portfolio Analysis`,
      description: `Comprehensive brand sales mix analysis for ${symbol} (${companyName}) including portfolio breakdown and brand performance.`,
      url: pageUrl,
      keywords: [`${symbol} brand sales`, `${symbol} product mix`, `${symbol} brand portfolio`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(brandSalesFaqs),
    getTableSchema({
      name: `${symbol} Brand Sales History`,
      description: `Historical Brand Sales data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Brand Sales', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Brand Sales</Link>
            {' / '}
            <span>{symbol} Brand Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Brand Sales Mix Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Product portfolio and brand performance</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Brand Sales Mix</h2>
            <p className="text-muted-foreground mb-4">
              Brand sales mix reveals how {companyName}'s revenue is distributed across its product portfolio. This analysis helps identify growth drivers, portfolio quality, and opportunities for margin expansion through mix improvement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-lg font-bold">Portfolio Mix</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Indicates</p>
                <p className="text-lg font-bold">Brand Strength</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Affects</p>
                <p className="text-lg font-bold">Growth & Margins</p>
              </div>
            </div>
          </div>

          {/* Brand Strategy Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brand Portfolio Strategy</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👑</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Flagship Brands</h3>
                    <p className="text-muted-foreground">
                      Core brands with strong market positions, high brand equity, and consistent revenue generation. These typically receive the largest marketing investments and drive overall portfolio performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌟</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Premium Segment</h3>
                    <p className="text-muted-foreground">
                      High-margin premium and super-premium brands that enhance portfolio quality. Growth in this segment indicates trading up behavior and improving consumer perception.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Growth Brands</h3>
                    <p className="text-muted-foreground">
                      Emerging brands with high growth potential, often in trending categories. Success here can drive future revenue and offset maturity in legacy brands.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚖️</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Value Brands</h3>
                    <p className="text-muted-foreground">
                      Economy-positioned brands providing volume and market coverage. While lower margin, they defend share and provide entry points for consumers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mix Analysis Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Analyze Brand Mix</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">📊 Revenue Contribution</h3>
                  <p className="text-muted-foreground">Track each brand's percentage of total sales to identify concentration risks and growth contributors.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📈 Growth Trajectory</h3>
                  <p className="text-muted-foreground">Compare growth rates across brands to spot emerging winners and declining legacy products.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💰 Profitability Profile</h3>
                  <p className="text-muted-foreground">Assess margin contribution by brand to understand how mix shifts impact overall profitability.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🎯 Strategic Fit</h3>
                  <p className="text-muted-foreground">Evaluate whether the brand portfolio aligns with consumer trends and company strategy.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Health Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brand Health Indicators</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Strong Brand Portfolio</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Growing premium brand share</li>
                  <li>Successful new product launches</li>
                  <li>Market share gains in key brands</li>
                  <li>Strong brand awareness metrics</li>
                  <li>Pricing power across portfolio</li>
                  <li>Balanced revenue distribution</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Portfolio Risks</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Over-reliance on single brand</li>
                  <li>Declining flagship brand sales</li>
                  <li>Weak innovation pipeline</li>
                  <li>Share losses to competitors</li>
                  <li>Premiumization headwinds</li>
                  <li>Aging brand portfolio</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Implications */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Implications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-green-500 mb-2">Positive Signals</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Premium mix expansion</li>
                  <li>Strong flagship brand growth</li>
                  <li>Successful brand launches</li>
                  <li>Diversified portfolio</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Mix shift to value brands</li>
                  <li>Legacy brand decline</li>
                  <li>Failed innovations</li>
                  <li>Brand concentration risk</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Revenue Trends</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive revenue analysis and growth metrics for {symbol}</p>
            <Link href={`/revenue/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Revenue Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {brandSalesFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
