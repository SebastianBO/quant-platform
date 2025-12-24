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
    title: `${symbol} Fitness Equipment Sales - Equipment Revenue & Growth ${currentYear}`,
    description: `${symbol} fitness equipment sales analysis: equipment revenue, sales growth, product mix, and market trends. Analyze ${symbol}'s equipment business performance.`,
    keywords: [
      `${symbol} fitness equipment`,
      `${symbol} equipment sales`,
      `${symbol} equipment revenue`,
      `${symbol} workout equipment`,
      `${symbol} gym equipment`,
      `${symbol} exercise equipment`,
    ],
    openGraph: {
      title: `${symbol} Fitness Equipment Sales ${currentYear} | Equipment Revenue Analysis`,
      description: `Complete ${symbol} fitness equipment analysis with sales data, growth trends, and product mix.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fitness-equipment/${ticker.toLowerCase()}`,
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

export default async function FitnessEquipmentPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fitness-equipment/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate fitness equipment FAQs
  const fitnessEquipmentFaqs = [
    {
      question: `What fitness equipment does ${symbol} sell?`,
      answer: `${companyName} offers a range of fitness equipment including cardio machines (treadmills, bikes, ellipticals), strength training equipment, and accessories. The specific product lineup varies based on the company's target market and business model.`
    },
    {
      question: `How much revenue does ${symbol} generate from equipment sales?`,
      answer: `Equipment sales revenue is a key component for fitness companies. ${symbol}'s equipment revenue can be found in the company's quarterly and annual reports, often broken out as a separate segment or product category.`
    },
    {
      question: `Is ${symbol}'s equipment sales revenue growing?`,
      answer: `Equipment sales growth depends on factors like new product launches, market demand, competition, and economic conditions. Review ${symbol}'s earnings reports to track equipment revenue trends over time.`
    },
    {
      question: `What is ${symbol}'s equipment gross margin?`,
      answer: `Gross margin on fitness equipment indicates profitability after manufacturing costs. Higher margins suggest premium pricing power or efficient production. Check financial disclosures for segment-specific margin data.`
    },
    {
      question: `Does ${symbol} sell equipment direct-to-consumer or wholesale?`,
      answer: `Distribution channels affect margins and growth potential. Some companies sell primarily through retail partnerships, while others focus on direct-to-consumer sales. ${symbol}'s channel mix may be disclosed in investor presentations.`
    },
    {
      question: `How does ${symbol}'s equipment business compare to competitors?`,
      answer: `Compare ${symbol} to other fitness equipment manufacturers and retailers to evaluate market share, product innovation, pricing strategy, and growth rates in the equipment segment.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Fitness Equipment`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Fitness Equipment Sales ${currentYear} - Equipment Revenue Analysis`,
    description: `Complete fitness equipment analysis for ${symbol} (${companyName}) with sales data, growth trends, and product mix.`,
    url: pageUrl,
    keywords: [
      `${symbol} fitness equipment`,
      `${symbol} equipment sales`,
      `${symbol} equipment revenue`,
      `${symbol} workout equipment`,
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

  const faqSchema = getFAQSchema(fitnessEquipmentFaqs)

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
            <span>{symbol} Fitness Equipment</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Fitness Equipment Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Equipment revenue and growth analysis for {companyName}
          </p>

          {/* Equipment Sales Overview */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Equipment Sales Overview</h2>
            <p className="text-muted-foreground">
              Fitness equipment sales represent a significant revenue stream for {companyName}.
              Equipment revenue, product mix, and sales channels provide insights into the company's
              manufacturing capabilities, brand strength, and market positioning. Review earnings reports
              for detailed equipment sales metrics.
            </p>
          </div>

          {/* Key Equipment Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Equipment Sales Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Equipment Revenue</h3>
                <p className="text-muted-foreground">
                  Total sales from fitness equipment, including cardio machines, strength equipment, and accessories.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product Mix</h3>
                <p className="text-muted-foreground">
                  Revenue distribution across equipment categories, showing which products drive the most sales.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average Selling Price (ASP)</h3>
                <p className="text-muted-foreground">
                  Average price per equipment unit sold, indicating pricing power and product positioning.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Equipment Gross Margin</h3>
                <p className="text-muted-foreground">
                  Profitability of equipment sales after manufacturing costs, showing operational efficiency.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Equipment Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, equipment trends, and AI-powered insights
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
              {fitnessEquipmentFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Equipment sales data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="fitness-equipment" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
