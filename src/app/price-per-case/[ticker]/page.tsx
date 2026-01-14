import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Price Per Case - Pricing Power & Unit Economics`,
    description: `${symbol} price per case analysis showing pricing trends, price realization, and unit economics for consumer packaged goods. Track ${symbol} pricing power and margin expansion.`,
    keywords: [
      `${symbol} price per case`,
      `${symbol} pricing`,
      `${symbol} unit economics`,
      `${symbol} price realization`,
      `${symbol} pricing power`,
      `${symbol} average selling price`,
    ],
    openGraph: {
      title: `${symbol} Price Per Case | Pricing Power Analysis`,
      description: `Track ${symbol} price per case trends and unit pricing metrics for CPG analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price-per-case/${ticker.toLowerCase()}`,
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

export default async function PricePerCasePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price-per-case/${ticker.toLowerCase()}`

  const pricePerCaseFaqs = [
    {
      question: `What is price per case for ${symbol}?`,
      answer: `Price per case for ${symbol} represents the average selling price for each case of product sold. This metric helps investors understand ${symbol}'s pricing strategy, pricing power, and ability to pass through cost inflation to customers.`
    },
    {
      question: `Why is price per case important for analyzing ${symbol}?`,
      answer: `Price per case is crucial for ${symbol} because it directly impacts profitability and margins. Rising price per case indicates strong pricing power and brand strength, while declining prices may suggest competitive pressures or the need for promotional activity.`
    },
    {
      question: `How does ${symbol} increase price per case?`,
      answer: `${symbol} can increase price per case through list price increases, reduced promotional activity, favorable product mix shifts toward premium products, package size optimization, and by introducing higher-value product innovations.`
    },
    {
      question: `What affects ${symbol} price per case trends?`,
      answer: `Factors affecting ${symbol} price per case include commodity cost inflation, competitive dynamics, promotional intensity, product mix changes, consumer demand elasticity, brand strength, and overall pricing strategy decisions by management.`
    },
    {
      question: `How do investors use price per case data for ${symbol}?`,
      answer: `Investors analyze ${symbol} price per case alongside volume trends to separate revenue growth between volume and pricing. Strong price per case growth with maintained volume indicates pricing power, while price increases that hurt volume may signal elasticity concerns.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Price Per Case', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Price Per Case`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price Per Case - Pricing Power & Unit Economics`,
      description: `Comprehensive price per case analysis for ${symbol} (${companyName}) including pricing trends and unit economics.`,
      url: pageUrl,
      keywords: [`${symbol} price per case`, `${symbol} pricing`, `${symbol} unit economics`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(pricePerCaseFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Price Per Case</Link>
            {' / '}
            <span>{symbol} Price Per Case</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price Per Case Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Pricing trends and unit economics</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Price Per Case</h2>
            <p className="text-muted-foreground mb-4">
              Price per case measures {companyName}'s average selling price for each case of product. This metric reveals pricing power, margin trends, and the company's ability to offset input cost inflation through price increases.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-lg font-bold">Pricing Power</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Indicates</p>
                <p className="text-lg font-bold">Brand Strength</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Affects</p>
                <p className="text-lg font-bold">Margins & Profitability</p>
              </div>
            </div>
          </div>

          {/* Pricing Levers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Price Per Case Growth Drivers</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💵</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">List Price Increases</h3>
                    <p className="text-muted-foreground">
                      Direct price increases across product lines to offset commodity inflation, improve margins, or reflect brand value and market positioning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Promotional Discipline</h3>
                    <p className="text-muted-foreground">
                      Reducing promotional depth and frequency improves net price realization and average price per case while maintaining volume through brand strength.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌟</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Premium Mix Shift</h3>
                    <p className="text-muted-foreground">
                      Growing sales of premium, organic, or specialty products naturally increases average price per case while improving overall margins.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Package Optimization</h3>
                    <p className="text-muted-foreground">
                      Strategic package size changes and multi-pack offerings can improve price per unit while providing value perception to consumers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Analyze Price Per Case Trends</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">📊 Price Realization</h3>
                  <p className="text-muted-foreground">Track price per case growth rates to assess pricing power and ability to offset commodity cost inflation.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">⚖️ Price-Volume Trade-off</h3>
                  <p className="text-muted-foreground">Analyze price increases alongside volume trends to understand demand elasticity and consumer acceptance.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💰 Margin Impact</h3>
                  <p className="text-muted-foreground">Connect price per case trends to gross margin and operating margin expansion or compression.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🏆 Competitive Context</h3>
                  <p className="text-muted-foreground">Compare pricing trends to competitors to assess relative brand strength and market positioning.</p>
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
                  <li>Consistent price increases</li>
                  <li>Price growth with stable volume</li>
                  <li>Margin expansion from pricing</li>
                  <li>Premium mix improvement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Price declines or stagnation</li>
                  <li>Heavy promotional activity</li>
                  <li>Volume losses from pricing</li>
                  <li>Competitive price pressure</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Margins</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive margin analysis and profitability metrics for {symbol}</p>
            <Link href={`/margins/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Margin Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pricePerCaseFaqs.map((faq, i) => (
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
