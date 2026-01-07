import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Private Label Sales - Store Brand Competition Analysis`,
    description: `${symbol} private label exposure and store brand competition. Analyze private label share trends, competitive threats, and brand positioning for ${symbol}.`,
    keywords: [
      `${symbol} private label`,
      `${symbol} store brands`,
      `${symbol} private label competition`,
      `${symbol} store brand share`,
      `${symbol} brand vs private label`,
      `${symbol} retailer brands`,
    ],
    openGraph: {
      title: `${symbol} Private Label Sales | Store Brand Competition`,
      description: `Track ${symbol} private label exposure and competitive dynamics with store brands.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/private-label/${ticker.toLowerCase()}`,
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

export default async function PrivateLabelPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/private-label/${ticker.toLowerCase()}`

  const privateLabelFaqs = [
    {
      question: `What is private label competition for ${symbol}?`,
      answer: `Private label competition refers to store brands (like Kirkland, Great Value, or 365) that compete directly with ${symbol}'s branded products. These retailer-owned brands typically offer lower prices and are increasingly focused on quality, posing a significant competitive threat.`
    },
    {
      question: `Why does private label matter for ${symbol} investors?`,
      answer: `Private label growth directly impacts ${symbol} because it can erode market share, reduce pricing power, and pressure margins. Companies with strong brand equity and innovation can resist private label, while commodity-like products are more vulnerable to store brand substitution.`
    },
    {
      question: `How does ${symbol} compete against private label?`,
      answer: `${symbol} defends against private label through brand strength, product innovation, superior quality perception, marketing investments, unique formulations, and demonstrating value beyond price. Strong brands can maintain premium pricing despite private label presence.`
    },
    {
      question: `What categories are most vulnerable to private label for ${symbol}?`,
      answer: `Commodity categories with low differentiation are most vulnerable. Categories where ${symbol} can maintain strong brand preference through innovation, quality, and emotional connection are better protected from private label substitution.`
    },
    {
      question: `Does ${symbol} manufacture private label products?`,
      answer: `Some CPG companies manufacture private label products for retailers alongside their branded business. This can provide volume and capacity utilization but may cannibalize branded sales. Investors should understand ${symbol}'s private label manufacturing strategy and its impact on the overall business.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Private Label', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Private Label`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Private Label Sales - Store Brand Competition Analysis`,
      description: `Comprehensive private label analysis for ${symbol} (${companyName}) including competitive threats and brand positioning.`,
      url: pageUrl,
      keywords: [`${symbol} private label`, `${symbol} store brands`, `${symbol} competition`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(privateLabelFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Private Label</Link>
            {' / '}
            <span>{symbol} Private Label</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Private Label Competition</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Store brand dynamics and competitive positioning</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Private Label Impact</h2>
            <p className="text-muted-foreground mb-4">
              Private label brands represent a significant competitive force for {companyName}. Store brands have evolved from budget alternatives to quality competitors, with retailers investing heavily in product development, packaging, and marketing to capture market share.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Competitive Force</p>
                <p className="text-lg font-bold">Store Brands</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <p className="text-lg font-bold">Growing Share</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Impact</p>
                <p className="text-lg font-bold">Margin Pressure</p>
              </div>
            </div>
          </div>

          {/* Private Label Dynamics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Private Label Market Dynamics</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Growing Market Share</h3>
                    <p className="text-muted-foreground">
                      Private label share has been steadily increasing across categories, driven by improved quality, competitive pricing, and retailer marketing support. This trend accelerates during economic uncertainty.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏪</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Retailer Power</h3>
                    <p className="text-muted-foreground">
                      Large retailers leverage private label to improve margins, differentiate their stores, and negotiate better terms with branded manufacturers. Premium private labels like Kirkland and 365 compete on quality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Price Gap</h3>
                    <p className="text-muted-foreground">
                      Private label products typically price 20-40% below branded equivalents, creating significant value perception for price-sensitive consumers while maintaining good margins for retailers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⬆️</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Quality Improvement</h3>
                    <p className="text-muted-foreground">
                      Private label quality has improved dramatically, with premium store brands matching or exceeding branded products in taste tests and quality perception, reducing branded advantages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Defense Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brand Defense Strategies</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">🚀 Innovation Leadership</h3>
                  <p className="text-muted-foreground">Continuous product innovation creates differentiation that private label cannot easily replicate, maintaining brand premiums.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💪 Brand Building</h3>
                  <p className="text-muted-foreground">Strong marketing and emotional connections make brands worth the premium versus generic alternatives.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🎯 Value Demonstration</h3>
                  <p className="text-muted-foreground">Clearly communicating superior quality, ingredients, or benefits justifies price premiums over private label.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📊 Strategic Pricing</h3>
                  <p className="text-muted-foreground">Maintaining reasonable price gaps versus private label while protecting brand premium through value-added features.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Category Vulnerability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Private Label Vulnerability Assessment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Protected Categories</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Strong brand differentiation</li>
                  <li>Continuous innovation</li>
                  <li>Emotional brand connection</li>
                  <li>Complex formulations</li>
                  <li>Superior quality perception</li>
                  <li>Loyal consumer base</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Vulnerable Categories</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Commodity-like products</li>
                  <li>Minimal differentiation</li>
                  <li>Price-sensitive consumers</li>
                  <li>Low brand loyalty</li>
                  <li>Easily replicated products</li>
                  <li>Generic ingredients</li>
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
                  <li>Maintaining share vs private label</li>
                  <li>Strong brand equity metrics</li>
                  <li>Successful innovation launches</li>
                  <li>Premium positioning strength</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Share losses to store brands</li>
                  <li>Weakening brand preference</li>
                  <li>Inability to justify premiums</li>
                  <li>Increasing promotional activity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Competitive Position</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive competitive analysis and market positioning for {symbol}</p>
            <Link href={`/competitors/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Competitor Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {privateLabelFaqs.map((faq, i) => (
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
