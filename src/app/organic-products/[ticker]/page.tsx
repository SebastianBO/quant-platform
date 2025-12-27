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
    title: `${symbol} Organic Products - Natural & Organic Portfolio Growth`,
    description: `${symbol} organic products portfolio and natural category sales. Analyze organic revenue growth, category trends, and premium positioning for ${symbol}.`,
    keywords: [
      `${symbol} organic products`,
      `${symbol} natural products`,
      `${symbol} organic revenue`,
      `${symbol} organic growth`,
      `${symbol} organic portfolio`,
      `${symbol} natural category`,
    ],
    openGraph: {
      title: `${symbol} Organic Products | Natural Portfolio Growth`,
      description: `Track ${symbol} organic and natural products sales growth and portfolio expansion.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/organic-products/${ticker.toLowerCase()}`,
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

export default async function OrganicProductsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/organic-products/${ticker.toLowerCase()}`

  const organicProductsFaqs = [
    {
      question: `What are organic products for ${symbol}?`,
      answer: `Organic products for ${symbol} refer to food and beverage items certified organic under USDA standards, grown without synthetic pesticides, GMOs, or artificial additives. This category represents a growing premium segment with higher margins and strong consumer demand.`
    },
    {
      question: `Why is organic product growth important for ${symbol}?`,
      answer: `Organic products are critical for ${symbol} because they typically command 20-50% price premiums, attract health-conscious consumers, drive margin expansion, and position the company in fast-growing premium categories with favorable long-term trends.`
    },
    {
      question: `How does ${symbol} grow organic product sales?`,
      answer: `${symbol} expands organic sales through new product launches, acquiring organic brands, converting existing products to organic certification, expanding distribution in natural channels, and marketing to health-conscious consumers.`
    },
    {
      question: `What are the margins on ${symbol} organic products?`,
      answer: `${symbol}'s organic products typically generate higher gross margins due to premium pricing, though they may have higher input costs. The net margin benefit comes from strong pricing power and consumer willingness to pay for organic certification and quality.`
    },
    {
      question: `How do investors evaluate ${symbol} organic portfolio?`,
      answer: `Investors assess ${symbol}'s organic portfolio by tracking organic revenue as a percentage of total sales, growth rates compared to conventional products, distribution gains in natural and mainstream channels, and success of new organic launches.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Organic Products', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Organic Products`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Organic Products - Natural & Organic Portfolio Growth`,
      description: `Comprehensive organic products analysis for ${symbol} (${companyName}) including natural category sales and premium positioning.`,
      url: pageUrl,
      keywords: [`${symbol} organic products`, `${symbol} natural products`, `${symbol} organic growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(organicProductsFaqs),
    getTableSchema({
      name: `${symbol} Organic Products History`,
      description: `Historical Organic Products data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Organic Products', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Organic Products</Link>
            {' / '}
            <span>{symbol} Organic Products</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Organic Products Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Natural and organic portfolio growth</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Organic Products</h2>
            <p className="text-muted-foreground mb-4">
              Organic products represent a premium category for {companyName}, offering higher margins and tapping into strong consumer trends toward health, sustainability, and natural ingredients. Growth in this segment signals successful premiumization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="text-lg font-bold">Premium / Organic</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <p className="text-lg font-bold">High Growth</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Benefit</p>
                <p className="text-lg font-bold">Margin Expansion</p>
              </div>
            </div>
          </div>

          {/* Organic Growth Drivers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Organic Product Growth Drivers</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Consumer Health Trends</h3>
                    <p className="text-muted-foreground">
                      Growing consumer focus on health, wellness, and clean labels drives sustained demand for organic products. Millennials and Gen Z show particularly strong preference for organic certification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Premium Pricing Power</h3>
                    <p className="text-muted-foreground">
                      Organic products command 20-50% price premiums over conventional alternatives, providing strong margin expansion opportunities while meeting consumer willingness to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏪</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Mainstream Distribution</h3>
                    <p className="text-muted-foreground">
                      Organic products expanding beyond natural channels into mainstream grocery, mass merchandise, and online provides significant growth runway and accessibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">♻️</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Sustainability Focus</h3>
                    <p className="text-muted-foreground">
                      Organic farming aligns with environmental sustainability goals, attracting eco-conscious consumers and supporting corporate ESG initiatives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Growth Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Organic Portfolio Growth Strategies</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">🚀 New Product Innovation</h3>
                  <p className="text-muted-foreground">Launch organic versions of existing products and develop new organic-only brands to capture category growth.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🏢 Acquisitions</h3>
                  <p className="text-muted-foreground">Acquire successful organic brands with established market positions to rapidly scale organic portfolio.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📈 Distribution Expansion</h3>
                  <p className="text-muted-foreground">Expand organic products into new channels and geographies to increase penetration and awareness.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🎯 Marketing Investment</h3>
                  <p className="text-muted-foreground">Increase marketing support for organic brands to build awareness and drive trial among target consumers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Organic Market Trends</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Growth Opportunities</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Category growing 8-12% annually</li>
                  <li>Expanding consumer base</li>
                  <li>Mainstream channel growth</li>
                  <li>International expansion potential</li>
                  <li>New category penetration</li>
                  <li>E-commerce acceleration</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Key Challenges</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Higher input costs</li>
                  <li>Supply chain complexity</li>
                  <li>Certification requirements</li>
                  <li>Price premium sensitivity</li>
                  <li>Competitive intensity</li>
                  <li>Private label competition</li>
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
                  <li>Growing organic revenue share</li>
                  <li>Successful product launches</li>
                  <li>Distribution expansion</li>
                  <li>Margin improvement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Slowing organic growth</li>
                  <li>Share loss to competitors</li>
                  <li>Supply chain disruptions</li>
                  <li>Margin pressure</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Growth Trends</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive growth analysis and revenue metrics for {symbol}</p>
            <Link href={`/growth/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Growth Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {organicProductsFaqs.map((faq, i) => (
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
