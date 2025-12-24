import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Case Volume - Physical Volume Growth Analysis`,
    description: `${symbol} case volume growth analysis for consumer packaged goods. Track unit volume trends, market share expansion, and physical case shipments for ${symbol}.`,
    keywords: [
      `${symbol} case volume`,
      `${symbol} unit volume`,
      `${symbol} volume growth`,
      `${symbol} case shipments`,
      `${symbol} physical volume`,
      `${symbol} CPG metrics`,
    ],
    openGraph: {
      title: `${symbol} Case Volume | Physical Volume Growth Analysis`,
      description: `Track ${symbol} case volume trends and unit growth metrics for CPG analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/case-volume/${ticker.toLowerCase()}`,
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

export default async function CaseVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/case-volume/${ticker.toLowerCase()}`

  const caseVolumeFaqs = [
    {
      question: `What is case volume for ${symbol}?`,
      answer: `Case volume for ${symbol} measures the physical number of product cases shipped or sold in a given period. This metric is crucial for consumer packaged goods (CPG) companies as it indicates actual product demand independent of pricing changes.`
    },
    {
      question: `Why is case volume important for ${symbol}?`,
      answer: `Case volume is a key indicator of ${symbol}'s market penetration and brand strength. Growing case volume shows increasing consumer demand and market share gains, while declining volume may signal competitive pressures or changing consumer preferences.`
    },
    {
      question: `How does case volume differ from revenue for ${symbol}?`,
      answer: `While revenue can increase through price increases, case volume measures actual physical units sold. For ${symbol}, analyzing both metrics helps investors separate organic growth from pricing power and understand true demand trends.`
    },
    {
      question: `What drives case volume growth for ${symbol}?`,
      answer: `${symbol}'s case volume growth is driven by factors including new distribution expansion, product innovation, marketing effectiveness, category growth, market share gains from competitors, and changes in consumer purchasing behavior.`
    },
    {
      question: `How do investors analyze ${symbol} case volume trends?`,
      answer: `Investors analyze ${symbol} case volume by tracking quarter-over-quarter and year-over-year growth rates, comparing volume growth to revenue growth, examining geographic and product mix shifts, and comparing performance to industry peers and category growth rates.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Case Volume', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Case Volume`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Case Volume - Physical Volume Growth Analysis`,
      description: `Comprehensive case volume analysis for ${symbol} (${companyName}) including unit growth trends and market share metrics.`,
      url: pageUrl,
      keywords: [`${symbol} case volume`, `${symbol} unit volume`, `${symbol} volume growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(caseVolumeFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Case Volume</Link>
            {' / '}
            <span>{symbol} Case Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Case Volume Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Physical unit volume and growth trends</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Case Volume</h2>
            <p className="text-muted-foreground mb-4">
              Case volume measures the physical quantity of products sold by {companyName}, providing insights into actual consumer demand independent of pricing strategies. This metric is essential for understanding market share trends and organic growth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-lg font-bold">Unit Growth</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Indicates</p>
                <p className="text-lg font-bold">Market Demand</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="text-lg font-bold">CPG / Consumer Goods</p>
              </div>
            </div>
          </div>

          {/* Key Drivers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Case Volume Growth Drivers</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏪</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Distribution Expansion</h3>
                    <p className="text-muted-foreground">
                      Growing case volume through new retail partnerships, expanded geographic coverage, and increased shelf space in existing stores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Product Innovation</h3>
                    <p className="text-muted-foreground">
                      New product launches and line extensions drive incremental case volume while attracting new customer segments and usage occasions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Market Share Gains</h3>
                    <p className="text-muted-foreground">
                      Case volume growth outpacing category growth indicates market share gains from competitors through superior marketing, quality, or value propositions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Marketing & Brand Strength</h3>
                    <p className="text-muted-foreground">
                      Effective advertising campaigns and strong brand loyalty drive repeat purchases and trial from new consumers, supporting sustained volume growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Analyze Case Volume</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">📊 Growth Rate Trends</h3>
                  <p className="text-muted-foreground">Track quarter-over-quarter and year-over-year case volume growth to identify acceleration or deceleration in demand.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💰 Volume vs. Revenue</h3>
                  <p className="text-muted-foreground">Compare case volume growth to revenue growth to understand pricing impact and value realization.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🌍 Geographic Mix</h3>
                  <p className="text-muted-foreground">Analyze case volume by region to identify high-growth markets and opportunities for expansion.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🏆 Competitive Benchmarking</h3>
                  <p className="text-muted-foreground">Compare case volume growth to competitors and industry peers to assess relative market performance.</p>
                </div>
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
                  <li>Consistent case volume growth</li>
                  <li>Volume growth exceeding category</li>
                  <li>Strong growth in key markets</li>
                  <li>New product success</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Declining case volume trends</li>
                  <li>Volume loss despite pricing</li>
                  <li>Share losses to competitors</li>
                  <li>Category headwinds</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Fundamentals</h2>
            <p className="text-muted-foreground mb-6">Get comprehensive fundamental analysis including revenue, margins, and growth metrics</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {caseVolumeFaqs.map((faq, i) => (
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
