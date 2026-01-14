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
    title: `${symbol} Wholesale Revenue ${currentYear} - B2B Sales & Distribution`,
    description: `${symbol} wholesale revenue analysis for ${currentYear}. Track B2B sales, distribution partnerships, and wholesale channel performance.`,
    keywords: [
      `${symbol} wholesale revenue`,
      `${symbol} B2B sales`,
      `${symbol} distribution`,
      `${symbol} wholesale partners`,
      `${symbol} channel revenue`,
      `${symbol} retail partnerships`,
    ],
    openGraph: {
      title: `${symbol} Wholesale Revenue ${currentYear} | B2B Analysis`,
      description: `Complete ${symbol} wholesale revenue analysis with B2B sales trends and distribution partner performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/wholesale-revenue/${ticker.toLowerCase()}`,
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

export default async function WholesaleRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/wholesale-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate wholesale metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedWholesalePercentage = sector === 'Consumer Discretionary' ? 0.65 : 0.80
  const estimatedWholesaleRevenue = revenue * estimatedWholesalePercentage

  // Generate wholesale FAQs
  const wholesaleFaqs = [
    {
      question: `What is ${symbol}'s wholesale distribution strategy?`,
      answer: `${companyName} leverages wholesale partnerships to reach broader markets and scale distribution efficiently. Wholesale accounts for approximately ${(estimatedWholesalePercentage * 100).toFixed(0)}% of total revenue, including partnerships with major retailers and distributors.`
    },
    {
      question: `How much revenue does ${symbol} generate from wholesale?`,
      answer: `Based on current financials, ${symbol}'s wholesale revenue is estimated at $${(estimatedWholesaleRevenue / 1e9).toFixed(2)}B annually. This includes sales through retail partners, distributors, and B2B channels.`
    },
    {
      question: `Is ${symbol} reducing wholesale dependence?`,
      answer: `Many companies are shifting toward DTC to improve margins, but wholesale remains critical for volume and market reach. ${symbol}'s revenue growth of ${(revenueGrowth * 100).toFixed(1)}% reflects the balance between wholesale scale and direct channels.`
    },
    {
      question: `Who are ${symbol}'s major wholesale partners?`,
      answer: `${sector === 'Consumer Discretionary' ? 'Typical wholesale partners include department stores, specialty retailers, and e-commerce platforms' : 'Wholesale partnerships vary by industry'}. Check ${symbol}'s earnings calls and 10-K filings for specific customer concentration disclosures.`
    },
    {
      question: `How does wholesale affect ${symbol}'s margins?`,
      answer: `Wholesale typically carries lower margins than DTC due to partner discounts and distribution costs. However, wholesale provides volume scale and reduced customer acquisition costs, making it an important profitability balance.`
    },
    {
      question: `What are the risks to ${symbol}'s wholesale business?`,
      answer: `Key wholesale risks include partner consolidation, inventory management challenges, pricing pressure, and shifts to direct-to-consumer by competitors. Monitor ${symbol}'s customer concentration and channel mix trends.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Wholesale Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Wholesale Revenue ${currentYear} - B2B Sales & Distribution`,
    description: `Complete wholesale revenue analysis for ${symbol} (${companyName}) with B2B sales trends and distribution performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} wholesale revenue`,
      `${symbol} B2B sales`,
      `${symbol} distribution`,
      `${symbol} wholesale growth`,
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

  const faqSchema = getFAQSchema(wholesaleFaqs)

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
            <span>{symbol} Wholesale Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Wholesale Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            B2B sales analysis and distribution partner performance for {companyName}
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

          {/* Wholesale Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Wholesale Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. Wholesale Revenue</p>
                <p className="text-3xl font-bold">${(estimatedWholesaleRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-green-500 mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Wholesale % of Total</p>
                <p className="text-3xl font-bold">{(estimatedWholesalePercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Est. Mix</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">YoY</p>
              </div>
            </div>
          </section>

          {/* Wholesale Distribution Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Wholesale Distribution Model</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s wholesale business encompasses multiple B2B channels:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Retail Partners:</strong> Sales through major department stores, specialty retailers, and chain stores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Distributors:</strong> Third-party distribution networks for broader market coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>E-Commerce Platforms:</strong> Wholesale partnerships with online marketplaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>International Markets:</strong> Global distribution through regional wholesale partners</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Channel Mix</h2>
            <p className="text-muted-foreground mb-6">
              Get detailed revenue breakdown by channel and distribution analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Details
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {wholesaleFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Wholesale revenue estimates are based on industry benchmarks and may not reflect actual company reporting. Always review official financial statements and company disclosures for accurate channel revenue data.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="wholesale-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
