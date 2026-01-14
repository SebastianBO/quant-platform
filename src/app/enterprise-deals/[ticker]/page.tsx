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

  return {
    title: `${symbol} Enterprise Deals - Large Customer Wins & Contract Value`,
    description: `${symbol} enterprise deals analysis. Track large customer acquisitions, contract values, sales pipeline, and enterprise revenue growth.`,
    keywords: [
      `${symbol} enterprise deals`,
      `${symbol} large customers`,
      `${symbol} contract value`,
      `${symbol} enterprise sales`,
      `${symbol} customer wins`,
      `${symbol} ACV`,
    ],
    openGraph: {
      title: `${symbol} Enterprise Deals | Large Customer Analysis`,
      description: `Comprehensive analysis of ${symbol} enterprise customer acquisitions and contract values.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/enterprise-deals/${ticker.toLowerCase()}`,
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

export default async function EnterpriseDealsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/enterprise-deals/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many enterprise deals does ${symbol} close?`,
      answer: `${symbol} (${companyName}) reports enterprise deal activity as a key indicator of upmarket traction and high-value customer acquisition. Enterprise deals typically represent contracts over $100K in annual contract value.`
    },
    {
      question: `What is the average enterprise deal size for ${symbol}?`,
      answer: `Average contract value (ACV) for enterprise deals shows ${companyName}'s ability to land large customers. Higher ACV indicates stronger product-market fit in the enterprise segment.`
    },
    {
      question: `How do enterprise deals affect ${symbol} stock?`,
      answer: `Enterprise deals significantly impact ${symbol}'s revenue predictability, margin profile, and market positioning. Large deals often come with multi-year commitments and expansion potential.`
    },
    {
      question: `What is ${symbol}'s enterprise sales cycle?`,
      answer: `Enterprise sales cycles typically range from 3-12 months for companies like ${companyName}. Understanding this timeline is crucial for forecasting revenue recognition and growth rates.`
    },
    {
      question: `Does ${symbol} disclose major customer wins?`,
      answer: `${companyName} may announce significant enterprise wins in earnings calls, press releases, or SEC filings. Major deals with Fortune 500 companies serve as validation and reference customers.`
    },
    {
      question: `How does ${symbol} compete for enterprise deals?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}enterprise deal competition focuses on product capabilities, security compliance, integration ecosystem, and total cost of ownership.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Enterprise Deals`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Enterprise Deals - Large Customer Wins & Contract Value`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) enterprise customer acquisitions and deal metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} enterprise deals`,
      `${symbol} large customers`,
      `${symbol} contract value`,
      `${symbol} enterprise sales`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Enterprise Deals</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Enterprise Deals
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Large customer wins and contract analysis for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Deals Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Enterprise Deals Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Enterprise deals represent high-value contracts with large organizations, typically exceeding $100K in
                annual contract value (ACV). These deals are critical for {companyName}'s growth strategy.
              </p>
              <p className="text-muted-foreground">
                Enterprise customers provide stable recurring revenue, expansion opportunities, and serve as
                reference accounts for future sales.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Enterprise Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(snapshot.market_cap / 1e9).toFixed(1)}B
                </p>
              </div>
              {metrics?.revenue_growth && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(metrics.revenue_growth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {metrics?.operating_margin && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                  <p className="text-xl font-bold">{(metrics.operating_margin * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </section>

          {/* Why Enterprise Deals Matter */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Enterprise Deals Matter</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Revenue Quality:</strong> Multi-year contracts provide predictable recurring revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Margin Expansion:</strong> Higher ACVs and better pricing power improve profitability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Market Validation:</strong> Fortune 500 wins validate product capabilities and enterprise readiness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Expansion Revenue:</strong> Land-and-expand strategies drive net dollar retention</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Enterprise Growth</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed customer analytics, revenue quality metrics, and growth projections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="enterprise-deals" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
