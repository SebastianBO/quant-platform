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
    title: `${symbol} GPU Used Vehicles ${currentYear} - Used Car Profit Margins`,
    description: `${symbol} gross profit per unit (GPU) on used vehicle sales: profitability analysis, pre-owned margins, and used car GPU benchmarks for ${currentYear}.`,
    keywords: [
      `${symbol} GPU used vehicles`,
      `${symbol} used car margins`,
      `${symbol} pre-owned profitability`,
      `${symbol} used vehicle GPU`,
      `${symbol} used car profit`,
      `${symbol} CPO margins`,
    ],
    openGraph: {
      title: `${symbol} GPU Used Vehicles ${currentYear} | Used Car Margins`,
      description: `Complete ${symbol} gross profit per unit analysis for used vehicle sales.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gpu-used/${ticker.toLowerCase()}`,
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

export default async function GPUUsedPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/gpu-used/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} GPU on used vehicles?`,
      answer: `GPU (Gross Profit Per Unit) on used vehicles measures the average profit ${companyName} earns on each pre-owned vehicle sold. Industry benchmarks typically range from $2,500-$4,000 per used vehicle, significantly higher than new vehicle margins of $1,000-$2,500. Used vehicle GPU is a critical profitability driver for automotive retailers.`
    },
    {
      question: `Why is used vehicle GPU higher than new vehicle GPU?`,
      answer: `Used vehicle GPU is higher because dealers have more pricing flexibility without manufacturer constraints. ${companyName} can source inventory at wholesale auctions, accept trade-ins below market value, add reconditioning value, and price based on local demand rather than MSRP. This creates substantially higher margins than manufacturer-controlled new vehicle pricing.`
    },
    {
      question: `How does ${symbol} maximize used vehicle GPU?`,
      answer: `${companyName} maximizes used vehicle GPU through strategic sourcing at auctions and trade-ins, efficient reconditioning, optimal pricing strategies, fast inventory turnover (reducing carrying costs), CPO certification for premium pricing, and effective online merchandising to reach wider buyer audiences.`
    },
    {
      question: `What is the difference between CPO and non-CPO used GPU?`,
      answer: `Certified Pre-Owned (CPO) vehicles typically command 10-20% higher margins than non-certified used vehicles due to manufacturer warranties, rigorous inspections, and premium positioning. However, CPO certification costs reduce net GPU. ${companyName}'s mix of CPO vs non-CPO affects overall used vehicle profitability.`
    },
    {
      question: `How do market conditions affect used vehicle GPU?`,
      answer: `Used vehicle GPU fluctuates with wholesale values, consumer demand, new vehicle availability, financing rates, and economic conditions. The pandemic created historically high used GPU ($4,000-$6,000+) due to new vehicle shortages. As markets normalize, ${symbol}'s ability to maintain strong margins indicates operational excellence.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} GPU Used Vehicles`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} GPU Used Vehicles ${currentYear} - Used Car Profit Margins`,
    description: `Complete GPU analysis for ${symbol} (${companyName}) used vehicle sales and profitability.`,
    url: pageUrl,
    keywords: [
      `${symbol} GPU used vehicles`,
      `${symbol} used car margins`,
      `${symbol} pre-owned profitability`,
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
            <span>{symbol} GPU Used Vehicles</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} GPU Used Vehicles {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gross profit per unit analysis for used vehicle sales at {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Understanding Used Vehicle GPU</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Gross Profit Per Unit (GPU) on used vehicles is typically the highest-margin sales activity for automotive retailers like {companyName}. Used vehicle GPU generally ranges from $2,500-$4,000, compared to $1,000-$2,500 for new vehicles.
              </p>
              <p className="text-muted-foreground">
                The superior margins on used vehicles come from flexible sourcing, freedom from manufacturer pricing constraints, value-add through reconditioning, and pricing power based on local market dynamics. Strong used vehicle GPU performance directly drives overall dealership profitability and return on invested capital.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Used Vehicle GPU Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Industry Average</h3>
                <p className="text-3xl font-bold mb-1">$2,500-$3,500</p>
                <p className="text-muted-foreground text-sm">
                  Typical GPU range for used vehicles under normal market conditions
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Premium Performance</h3>
                <p className="text-3xl font-bold mb-1">$3,500-$4,500</p>
                <p className="text-muted-foreground text-sm">
                  Best-in-class operators with efficient sourcing and pricing strategies
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">CPO Vehicles</h3>
                <p className="text-3xl font-bold mb-1">$3,000-$5,000</p>
                <p className="text-muted-foreground text-sm">
                  Certified pre-owned commanding premium margins with warranty backing
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">GPU Drivers for Used Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Acquisition Cost</h3>
                <p className="text-muted-foreground text-sm">
                  Buying vehicles below market at auctions or securing favorable trade-in values creates margin opportunity.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Reconditioning Efficiency</h3>
                <p className="text-muted-foreground text-sm">
                  Minimizing time and cost to make vehicles retail-ready while adding market value.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Inventory Turnover</h3>
                <p className="text-muted-foreground text-sm">
                  Faster days-to-turn reduces carrying costs (flooring interest, depreciation) preserving margin.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Positioning</h3>
                <p className="text-muted-foreground text-sm">
                  Effective pricing, merchandising, and marketing to capture maximum value per unit sold.
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
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. GPU metrics vary significantly by market conditions, inventory sourcing strategies, and economic cycles. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
