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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Dollar-Based Net Retention (NRR) - Revenue Retention ${currentYear}`,
    description: `${symbol} dollar-based net retention rate (NRR): track revenue retention, customer expansion, and churn metrics for ${symbol}.`,
    keywords: [
      `${symbol} NRR`,
      `${symbol} net retention`,
      `${symbol} dollar based retention`,
      `${symbol} revenue retention`,
      `${symbol} customer retention`,
      `${symbol} expansion revenue`,
    ],
    openGraph: {
      title: `${symbol} Dollar-Based NRR ${currentYear} | Net Revenue Retention`,
      description: `Complete ${symbol} net revenue retention analysis with retention trends, expansion metrics, and cohort performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dollar-based-retention/${ticker.toLowerCase()}`,
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

export default async function DollarBasedRetentionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/dollar-based-retention/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate NRR FAQs
  const nrrFaqs = [
    {
      question: `What is ${symbol}'s net revenue retention (NRR)?`,
      answer: `Net revenue retention (NRR) for ${companyName} measures the percentage of revenue retained and expanded from existing customers over time. NRR above 100% indicates customers are spending more year-over-year through expansion, upsells, and cross-sells, even after accounting for churn.`
    },
    {
      question: `Why is dollar-based net retention important for ${symbol}?`,
      answer: `NRR is a critical metric for ${companyName} because it shows the health and growth potential of the existing customer base. High NRR (>110%) indicates strong product-market fit, effective upselling, and low churn, reducing dependence on new customer acquisition for growth.`
    },
    {
      question: `What is a good NRR rate?`,
      answer: `For SaaS companies, NRR benchmarks are: <90% (poor), 90-100% (average), 100-110% (good), 110-120% (great), >120% (exceptional). Best-in-class companies often maintain NRR above 120%, indicating strong expansion revenue and customer success.`
    },
    {
      question: `How does ${symbol} calculate NRR?`,
      answer: `${companyName} calculates NRR by tracking a cohort of customers from one period and measuring their revenue in the next period, including expansions, upsells, downgrades, and churn. The formula is: (Starting ARR + Expansion - Downgrades - Churn) / Starting ARR.`
    },
    {
      question: `What drives ${symbol}'s NRR?`,
      answer: `${companyName}'s NRR is driven by product adoption, customer success programs, expansion opportunities, pricing strategy, and overall customer satisfaction. High NRR requires both low churn and strong expansion from existing customers.`
    },
    {
      question: `How does ${symbol}'s NRR compare to competitors?`,
      answer: `${companyName}'s NRR can be benchmarked against peers in the ${sector || 'industry'} sector. Leading SaaS companies typically maintain NRR above 110%. Compare ${symbol} to competitors using our comparison tools.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} NRR`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Dollar-Based Net Retention ${currentYear} - NRR Analysis`,
    description: `Complete net revenue retention analysis for ${symbol} (${companyName}) with retention trends, expansion metrics, and cohort performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} NRR`,
      `${symbol} net retention`,
      `${symbol} revenue retention`,
      `${symbol} customer retention`,
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

  const faqSchema = getFAQSchema(nrrFaqs)

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
            <span>{symbol} Dollar-Based NRR</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Dollar-Based Net Retention {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Net revenue retention and customer expansion metrics for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Net Revenue Retention (NRR)</h2>
            <p className="text-muted-foreground">
              {companyName} reports dollar-based net retention in quarterly earnings.
              NRR measures revenue retained and expanded from existing customers,
              making it a critical indicator of business health and growth efficiency.
            </p>
          </div>

          {/* Why NRR Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Dollar-Based NRR Matters</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Predictability</h3>
                <p className="text-muted-foreground">
                  NRR above 100% means the business grows even without adding new customers.
                  High NRR provides predictable, compounding revenue growth from the existing base.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Growth Efficiency</h3>
                <p className="text-muted-foreground">
                  Companies with high NRR can grow faster with lower customer acquisition costs.
                  Each dollar spent on new customers goes further when existing customers expand.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product Validation</h3>
                <p className="text-muted-foreground">
                  Strong NRR validates product-market fit and customer success strategies.
                  Customers vote with their wallets by expanding usage when they see value.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Valuation Multiple</h3>
                <p className="text-muted-foreground">
                  Companies with higher NRR command premium valuation multiples.
                  Investors pay more for businesses with strong retention and expansion characteristics.
                </p>
              </div>
            </div>
          </section>

          {/* NRR Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Components of NRR</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 text-green-500">Expansion Revenue</h3>
                    <p className="text-sm text-muted-foreground">
                      Increased spending from upsells, cross-sells, and usage growth
                    </p>
                  </div>
                  <span className="text-green-500 font-bold">+</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 text-yellow-500">Downgrades</h3>
                    <p className="text-sm text-muted-foreground">
                      Customers reducing spend or moving to lower tiers
                    </p>
                  </div>
                  <span className="text-yellow-500 font-bold">-</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 text-red-500">Churn</h3>
                    <p className="text-sm text-muted-foreground">
                      Revenue lost from customers who cancel or don't renew
                    </p>
                  </div>
                  <span className="text-red-500 font-bold">-</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">Net Revenue Retention</h3>
                    <span className="font-bold text-lg">= NRR %</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    NRR &gt; 100% indicates net revenue growth from existing customers
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* NRR Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">NRR Benchmarks</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-red-500">&lt; 90% NRR</h3>
                    <p className="text-sm text-muted-foreground">Concerning - high churn, low expansion</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-orange-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-orange-500">90-100% NRR</h3>
                    <p className="text-sm text-muted-foreground">Average - retention challenges</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-yellow-500">100-110% NRR</h3>
                    <p className="text-sm text-muted-foreground">Good - modest expansion</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-green-500">110-120% NRR</h3>
                    <p className="text-sm text-muted-foreground">Great - strong expansion</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-emerald-500">&gt; 120% NRR</h3>
                    <p className="text-sm text-muted-foreground">Exceptional - best-in-class</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retention Metrics</h2>
            <p className="text-muted-foreground mb-6">
              View complete retention data, cohort analysis, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {nrrFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> NRR data is based on publicly disclosed information in earnings reports and investor presentations. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
