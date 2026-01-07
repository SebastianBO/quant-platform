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
    title: `${symbol} Gross Margin - Retail Profitability Data ${currentYear}`,
    description: `${symbol} gross margin analysis: retail profitability, pricing power, and margin trends for ${symbol}.`,
    keywords: [
      `${symbol} gross margin`,
      `${symbol} profit margin`,
      `${symbol} gross profit`,
      `${symbol} retail margins`,
      `${symbol} profitability`,
      `${symbol} pricing power`,
    ],
    openGraph: {
      title: `${symbol} Gross Margin ${currentYear} | Retail Profitability Analysis`,
      description: `Complete ${symbol} gross margin analysis with profitability trends and pricing power metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gross-margin-retail/${ticker.toLowerCase()}`,
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

export default async function GrossMarginRetailPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gross-margin-retail/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate gross margin from latest income statement
  const latestIncome = incomeStatements?.[0]
  const grossProfit = latestIncome?.gross_profit || 0
  const revenue = latestIncome?.revenue || 0
  const grossMargin = revenue > 0 ? (grossProfit / revenue) : metrics?.gross_margin || 0

  // Generate gross margin FAQs
  const marginFaqs = [
    {
      question: `What is ${symbol}'s gross margin?`,
      answer: `${symbol} (${companyName}) gross margin measures profitability after accounting for cost of goods sold (COGS), calculated as (Revenue - COGS) / Revenue. ${grossMargin > 0 ? `Currently, ${symbol}'s gross margin is approximately ${(grossMargin * 100).toFixed(1)}%, ` : ''}This metric reveals ${symbol}'s pricing power, product mix efficiency, and ability to control direct costs${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `How does ${symbol} calculate gross margin?`,
      answer: `Gross margin for ${companyName} is calculated by subtracting cost of goods sold from total revenue, then dividing by revenue. This percentage shows how much profit ${symbol} retains from each sales dollar after covering direct product costs, before operating expenses.`
    },
    {
      question: `Is ${symbol}'s gross margin improving?`,
      answer: `${symbol}'s gross margin trends indicate pricing power, product mix optimization, and supply chain efficiency${industry ? ` in the ${industry} industry` : ''}. Improving margins suggest ${companyName} can command premium prices, reduce costs, or shift toward higher-margin products.`
    },
    {
      question: `Why is gross margin important for ${symbol}?`,
      answer: `For ${companyName}, gross margin is fundamental because it determines how much revenue is available to cover operating expenses and generate net profit. Higher gross margins provide ${symbol} more financial flexibility${sector ? ` in the competitive ${sector} market` : ''} for investments, marketing, and shareholder returns.`
    },
    {
      question: `What drives ${symbol}'s gross margin?`,
      answer: `${symbol}'s gross margin is influenced by pricing strategies, product mix (private label vs. branded), purchasing power with suppliers, shrinkage control, promotional intensity${industry ? ` within ${industry}` : ''}, and competitive dynamics. Operational efficiency and vendor negotiations also impact margins.`
    },
    {
      question: `How does ${symbol}'s gross margin compare to competitors?`,
      answer: `Comparing ${symbol}'s gross margin to industry peers reveals competitive positioning and business model advantages. Higher margins than competitors suggest ${companyName} has superior pricing power${sector ? ` in ${sector}` : ''}, better cost management, or a more profitable product mix.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gross Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gross Margin ${currentYear} - Retail Profitability Analysis`,
    description: `Complete gross margin analysis for ${symbol} (${companyName}) with profitability trends and pricing power metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} gross margin`,
      `${symbol} profit margin`,
      `${symbol} gross profit`,
      `${symbol} retail margins`,
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

  const faqSchema = getFAQSchema(marginFaqs)

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
            <span>{symbol} Gross Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gross Margin {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Retail profitability and pricing power analysis for {companyName}
          </p>

          {/* Gross Margin Highlight Card */}
          {grossMargin > 0 && (
            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Current Gross Margin</p>
                <p className="text-5xl font-bold text-green-500">{(grossMargin * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {grossProfit >= 1e9
                    ? `$${(grossProfit / 1e9).toFixed(2)}B gross profit`
                    : `$${(grossProfit / 1e6).toFixed(0)}M gross profit`}
                </p>
              </div>
            </div>
          )}

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Gross Margin</h2>
            <p className="text-muted-foreground leading-relaxed">
              Gross margin for {companyName} represents the percentage of revenue remaining after deducting cost of goods sold. This fundamental profitability metric reveals {symbol}'s pricing power, product mix strategy, and efficiency in managing direct costs before operating expenses.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Gross Margin Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Profitability Foundation</h3>
                <p className="text-muted-foreground text-sm">
                  Gross margin determines how much revenue {symbol} has available to cover operating expenses, marketing, and generate net profit{sector ? ` in ${sector}` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Pricing Power</h3>
                <p className="text-muted-foreground text-sm">
                  Higher gross margins indicate {companyName} can command premium prices or has negotiated favorable supplier terms{industry ? ` in ${industry}` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Business Model Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Strong margins suggest {symbol} offers differentiated products, strong brand value, or operates in attractive market segments with less price competition.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Financial Flexibility</h3>
                <p className="text-muted-foreground text-sm">
                  Higher gross margins give {companyName} more resources for growth investments, technology adoption, customer acquisition, and shareholder returns.
                </p>
              </div>
            </div>
          </section>

          {/* Margin Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Gross Margin Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product Mix</h3>
                <p className="text-muted-foreground text-sm">
                  {symbol}'s mix of high-margin vs. low-margin products significantly impacts overall gross margin. Private label typically offers higher margins than branded goods.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Pricing Strategy</h3>
                <p className="text-muted-foreground text-sm">
                  {companyName}'s pricing decisions, promotional frequency, and ability to pass cost increases to customers directly affect gross margin performance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Supplier Negotiations</h3>
                <p className="text-muted-foreground text-sm">
                  {symbol}'s purchasing power and vendor relationships enable favorable pricing, volume discounts, and better payment terms that improve margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Shrinkage Control</h3>
                <p className="text-muted-foreground text-sm">
                  Effective loss prevention at {companyName} protects gross margin by reducing theft, damage, and waste that erode profitability.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete margin analysis, profitability metrics, and AI-powered financial insights
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
                All Margin Metrics
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Gross margin data is derived from company financial statements. Calculation methodologies and reporting may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
