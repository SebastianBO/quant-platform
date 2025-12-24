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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Category Mix ${currentYear} - Product Revenue Breakdown`,
    description: `${symbol} product category mix analysis for ${currentYear}. Track revenue by product category, segment performance, and portfolio diversification.`,
    keywords: [
      `${symbol} category mix`,
      `${symbol} product categories`,
      `${symbol} segment revenue`,
      `${symbol} product breakdown`,
      `${symbol} revenue mix`,
      `${symbol} product portfolio`,
    ],
    openGraph: {
      title: `${symbol} Category Mix ${currentYear} | Product Analysis`,
      description: `Complete ${symbol} category mix analysis with product segment revenue and portfolio performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/category-mix/${ticker.toLowerCase()}`,
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

export default async function CategoryMixPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/category-mix/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate category metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0

  // Generate category FAQs
  const categoryFaqs = [
    {
      question: `What product categories does ${symbol} sell?`,
      answer: `${companyName} operates across multiple product categories ${sector ? `within the ${sector} sector` : ''}. The exact category breakdown varies, but typically includes core products, adjacent categories, and growth segments. Check the company's 10-K and investor presentations for detailed segment reporting.`
    },
    {
      question: `Which category drives most of ${symbol}'s revenue?`,
      answer: `Most companies have a dominant category representing 40-60% of revenue, with the balance across complementary products. ${companyName}'s category mix reflects its strategic positioning ${industry ? `in the ${industry} industry` : ''}. Review segment disclosures for precise revenue attribution.`
    },
    {
      question: `How is ${symbol}'s category mix changing?`,
      answer: `Companies evolve their category mix through new product launches, acquisitions, and strategic exits. With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${symbol} may be shifting category priorities to drive higher margins or growth.`
    },
    {
      question: `What are ${symbol}'s fastest-growing categories?`,
      answer: `Growth categories typically include premium products, digital offerings, and emerging market segments. ${companyName}'s product innovation and category expansion are key drivers of future revenue growth and market share gains.`
    },
    {
      question: `How diversified is ${symbol}'s product portfolio?`,
      answer: `Portfolio diversification reduces risk and provides multiple growth vectors. ${symbol}'s category mix reflects its strategy to balance core products with growth opportunities${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `Should I analyze ${symbol}'s category performance?`,
      answer: `Understanding category dynamics helps assess competitive positioning, margin trends, and growth sustainability. Monitor which categories ${symbol} is prioritizing through marketing spend, innovation, and management commentary in earnings calls.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Category Mix`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Category Mix ${currentYear} - Product Revenue Breakdown`,
    description: `Complete category mix analysis for ${symbol} (${companyName}) with product segment revenue and portfolio performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} category mix`,
      `${symbol} product categories`,
      `${symbol} segment revenue`,
      `${symbol} product analysis`,
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

  const faqSchema = getFAQSchema(categoryFaqs)

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
            <span>{symbol} Category Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Product Category Mix
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revenue breakdown by product category for {companyName}
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

          {/* Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${(revenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-green-500 mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">YoY</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-3xl font-bold">${(snapshot.market_cap / 1e9).toFixed(1)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Current</p>
              </div>
            </div>
          </section>

          {/* Category Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Category Strategy & Portfolio</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s category mix reflects strategic priorities across:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Core Categories:</strong> Established products driving majority of revenue and profitability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Growth Categories:</strong> Emerging products with high growth potential and market expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Premium Segments:</strong> Higher-margin products targeting premium consumers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Adjacent Categories:</strong> Complementary products leveraging brand strength and distribution</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Deep Dive into {symbol} Segments</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed segment analysis and category performance metrics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {categoryFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Category mix details depend on company segment reporting. Always review official 10-K filings and investor presentations for accurate product category breakdowns and performance metrics.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="category-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
