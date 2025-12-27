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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Used Vehicle Sales ${currentYear} - Pre-Owned Auto Metrics`,
    description: `${symbol} used vehicle sales analysis: pre-owned unit sales, gross profit margins, inventory turnover, and certified pre-owned performance for ${currentYear}.`,
    keywords: [
      `${symbol} used vehicle sales`,
      `${symbol} pre-owned sales`,
      `${symbol} used car sales`,
      `${symbol} CPO sales`,
      `${symbol} used auto metrics`,
      `${symbol} gross profit per unit`,
    ],
    openGraph: {
      title: `${symbol} Used Vehicle Sales ${currentYear} | Pre-Owned Metrics`,
      description: `Complete ${symbol} used vehicle sales analysis with profitability and inventory insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/used-vehicle-sales/${ticker.toLowerCase()}`,
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

export default async function UsedVehicleSalesPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/used-vehicle-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} used vehicle sales?`,
      answer: `${symbol} used vehicle sales represent the total number of pre-owned vehicles sold through ${companyName} dealerships. This includes certified pre-owned (CPO) vehicles and non-certified used inventory. Used vehicle sales are typically higher margin than new vehicles, making them a critical profit driver for automotive retailers.`
    },
    {
      question: `Why are used vehicle sales important for ${symbol}?`,
      answer: `Used vehicle sales are often more profitable than new vehicle sales, with higher gross profit margins per unit. They also provide flexibility in inventory management, allow dealerships to capture trade-ins, and serve price-sensitive customers who still generate service and F&I revenue.`
    },
    {
      question: `What is the difference between CPO and regular used vehicles?`,
      answer: `Certified Pre-Owned (CPO) vehicles undergo rigorous inspections, come with manufacturer warranties, and typically command higher prices and margins. Regular used vehicles may not meet CPO standards but still provide profitable sales opportunities for ${companyName}.`
    },
    {
      question: `How do used vehicle margins compare to new vehicles?`,
      answer: `Used vehicle gross profit per unit is typically significantly higher than new vehicles. While new vehicles might have margins of $1,000-$2,000 per unit, used vehicles can generate $2,500-$4,000+ depending on market conditions, creating substantial profitability for ${symbol}.`
    },
    {
      question: `What drives used vehicle pricing and profitability?`,
      answer: `Used vehicle pricing is influenced by wholesale auction values, inventory age, market demand, vehicle condition, mileage, and certification status. ${companyName}'s ability to source quality inventory at competitive prices and turn it quickly is key to maintaining strong used vehicle margins.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Used Vehicle Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Used Vehicle Sales ${currentYear} - Pre-Owned Auto Metrics`,
    description: `Complete used vehicle sales analysis for ${symbol} (${companyName}) with profitability and margin insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} used vehicle sales`,
      `${symbol} pre-owned sales`,
      `${symbol} automotive metrics`,
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
            <span>{symbol} Used Vehicle Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Used Vehicle Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pre-owned vehicle sales and profitability metrics for {companyName}
          </p>

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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Used Vehicle Sales</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Used vehicle sales are a high-margin profit center for automotive dealership groups like {companyName}. Pre-owned vehicles typically generate higher gross profit per unit than new vehicles while serving a broader customer base.
              </p>
              <p className="text-muted-foreground">
                The used vehicle market has evolved significantly with online retail, third-party platforms, and certified pre-owned programs. Successful dealers balance inventory acquisition costs, reconditioning expenses, days-to-turn metrics, and market pricing to maximize profitability.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Used Vehicle Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Gross Profit Per Unit (GPU)</h3>
                <p className="text-muted-foreground text-sm">
                  The average profit earned on each used vehicle sold, typically $2,500-$4,000+, significantly higher than new vehicles.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Unit Sales Volume</h3>
                <p className="text-muted-foreground text-sm">
                  Total number of used vehicles sold, combining retail sales with wholesale transactions.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Days to Turn</h3>
                <p className="text-muted-foreground text-sm">
                  Average number of days from acquisition to sale, with faster turnover reducing carrying costs.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">CPO Penetration</h3>
                <p className="text-muted-foreground text-sm">
                  Percentage of used sales that are certified pre-owned, commanding premium pricing and margins.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access complete automotive metrics, financial analysis, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

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

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Used vehicle market conditions vary significantly by region and economic cycle. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
