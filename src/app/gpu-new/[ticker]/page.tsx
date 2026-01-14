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
    title: `${symbol} GPU New Vehicles ${currentYear} - Gross Profit Per Unit`,
    description: `${symbol} gross profit per unit (GPU) on new vehicle sales: profitability analysis, margin trends, and new vehicle GPU benchmarks for ${currentYear}.`,
    keywords: [
      `${symbol} GPU new vehicles`,
      `${symbol} gross profit per unit`,
      `${symbol} new vehicle margins`,
      `${symbol} new car profitability`,
      `${symbol} dealership GPU`,
      `${symbol} vehicle margins`,
    ],
    openGraph: {
      title: `${symbol} GPU New Vehicles ${currentYear} | Gross Profit Analysis`,
      description: `Complete ${symbol} gross profit per unit analysis for new vehicle sales.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gpu-new/${ticker.toLowerCase()}`,
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

export default async function GPUNewPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/gpu-new/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} GPU on new vehicles?`,
      answer: `GPU (Gross Profit Per Unit) on new vehicles measures the average profit ${companyName} earns on each new car, truck, or SUV sold after accounting for the cost of the vehicle from the manufacturer. Industry benchmarks typically range from $1,000-$2,500 per new vehicle, varying by brand, market conditions, and inventory availability.`
    },
    {
      question: `Why is new vehicle GPU important for ${symbol}?`,
      answer: `New vehicle GPU directly impacts ${companyName}'s profitability and operating margins. While new vehicles have lower margins than used vehicles, they drive high-volume sales that generate F&I revenue, create service customers, and maintain manufacturer relationships. GPU trends indicate pricing power and inventory management effectiveness.`
    },
    {
      question: `How does new vehicle GPU compare to used vehicle GPU?`,
      answer: `New vehicle GPU is typically $1,000-$2,500 per unit, while used vehicle GPU often ranges from $2,500-$4,000+. New vehicles have tighter margins due to manufacturer pricing controls and competition, but generate higher F&I attach rates and bring customers into the service ecosystem for ${companyName}.`
    },
    {
      question: `What factors affect new vehicle GPU?`,
      answer: `New vehicle GPU is influenced by manufacturer incentives, inventory levels (scarcity increases margins), market demand, competitive pricing, mix of luxury vs mainstream brands, customer financing options, and dealer holdbacks or bonuses from manufacturers. Recent supply chain disruptions significantly increased new vehicle margins industry-wide.`
    },
    {
      question: `How can ${symbol} improve new vehicle GPU?`,
      answer: `${companyName} can improve new vehicle GPU through strategic inventory management, premium brand mix, effective pricing strategies, reducing days to turn, capturing manufacturer incentives, selling higher-margin trims and packages, and maintaining disciplined discounting policies.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} GPU New Vehicles`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} GPU New Vehicles ${currentYear} - Gross Profit Per Unit`,
    description: `Complete GPU analysis for ${symbol} (${companyName}) new vehicle sales and profitability.`,
    url: pageUrl,
    keywords: [
      `${symbol} GPU new vehicles`,
      `${symbol} gross profit per unit`,
      `${symbol} new vehicle margins`,
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
            <span>{symbol} GPU New Vehicles</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} GPU New Vehicles {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gross profit per unit analysis for new vehicle sales at {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Understanding New Vehicle GPU</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Gross Profit Per Unit (GPU) on new vehicles is a critical profitability metric for automotive retailers like {companyName}. It represents the average profit earned on each new vehicle sold after deducting the cost from the manufacturer.
              </p>
              <p className="text-muted-foreground">
                While new vehicle margins are typically lower than used vehicles ($1,000-$2,500 vs $2,500-$4,000+), new vehicle sales drive volume, generate F&I opportunities, create service customers, and maintain essential manufacturer relationships. Recent industry disruptions have created historically high new vehicle margins due to inventory scarcity.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">New Vehicle GPU Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Industry Average</h3>
                <p className="text-3xl font-bold mb-1">$1,500-$2,000</p>
                <p className="text-muted-foreground text-sm">
                  Typical GPU range for mainstream brands under normal market conditions
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Luxury Brands</h3>
                <p className="text-3xl font-bold mb-1">$2,500-$4,000</p>
                <p className="text-muted-foreground text-sm">
                  Higher margins on premium and luxury brand new vehicles
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Supply Constrained</h3>
                <p className="text-3xl font-bold mb-1">$3,000-$5,000+</p>
                <p className="text-muted-foreground text-sm">
                  Elevated margins during inventory shortages and high demand
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting New Vehicle GPU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Inventory Availability</h3>
                <p className="text-muted-foreground text-sm">
                  Limited inventory increases pricing power and margins; excess inventory compresses GPU through discounting.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Manufacturer Incentives</h3>
                <p className="text-muted-foreground text-sm">
                  Dealer cash, volume bonuses, and holdback payments supplement front-end GPU.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Brand Mix</h3>
                <p className="text-muted-foreground text-sm">
                  Luxury and premium brands typically command higher margins than volume mainstream brands.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Competition</h3>
                <p className="text-muted-foreground text-sm">
                  Local market dynamics, online pricing transparency, and competitor strategies impact margin potential.
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
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. GPU metrics vary significantly by market conditions, brand portfolio, and economic cycles. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
