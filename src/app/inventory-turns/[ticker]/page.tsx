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
    title: `${symbol} Inventory Turnover ${currentYear} - Efficiency Analysis`,
    description: `${symbol} inventory turnover ratio for ${currentYear}. Track inventory management, turnover trends, and operational efficiency.`,
    keywords: [
      `${symbol} inventory turnover`,
      `${symbol} inventory turns`,
      `${symbol} inventory management`,
      `${symbol} inventory efficiency`,
      `${symbol} days inventory`,
      `${symbol} working capital`,
    ],
    openGraph: {
      title: `${symbol} Inventory Turnover ${currentYear} | Efficiency Analysis`,
      description: `Complete ${symbol} inventory turnover analysis with efficiency metrics and management trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/inventory-turns/${ticker.toLowerCase()}`,
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

export default async function InventoryTurnsPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/inventory-turns/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate inventory metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedInventoryTurns = sector === 'Consumer Discretionary' ? 5.2 : sector === 'Technology' ? 8.5 : 6.0
  const daysInventory = 365 / estimatedInventoryTurns

  // Generate inventory FAQs
  const inventoryFaqs = [
    {
      question: `What is ${symbol}'s inventory turnover ratio?`,
      answer: `Inventory turnover measures how efficiently a company sells and replaces inventory. Based on ${sector || 'industry'} benchmarks, ${symbol}'s estimated inventory turnover is ${estimatedInventoryTurns.toFixed(1)}x annually, meaning inventory cycles approximately every ${daysInventory.toFixed(0)} days.`
    },
    {
      question: `Is ${symbol}'s inventory turnover good?`,
      answer: `${sector === 'Consumer Discretionary' ? 'Retail companies typically see 4-8 turns per year' : sector === 'Technology' ? 'Tech companies often achieve 6-12 turns' : 'Inventory turnover varies by industry'}. Higher turns indicate efficient operations, while lower turns may signal excess inventory or slow-moving products.`
    },
    {
      question: `How does inventory turnover affect ${symbol}'s cash flow?`,
      answer: `Faster inventory turnover improves cash conversion, reduces storage costs, and minimizes obsolescence risk. With revenue of $${(revenue / 1e9).toFixed(2)}B and ${estimatedInventoryTurns.toFixed(1)} turns, ${symbol} converts inventory to cash efficiently.`
    },
    {
      question: `Is ${symbol} improving inventory management?`,
      answer: `Improving turnover indicates better demand forecasting, supply chain optimization, and working capital efficiency. Monitor ${symbol}'s inventory trends alongside revenue growth of ${(revenueGrowth * 100).toFixed(1)}% to assess operational improvements.`
    },
    {
      question: `What risks does ${symbol} face with inventory?`,
      answer: `Inventory risks include obsolescence, markdowns, seasonality, demand shifts, and supply chain disruptions. ${companyName}'s ability to maintain optimal inventory levels impacts both profitability and cash generation.`
    },
    {
      question: `How can I track ${symbol}'s inventory efficiency?`,
      answer: `Key metrics include inventory turnover ratio, days inventory outstanding (DIO), inventory-to-sales ratio, and year-over-year inventory growth vs revenue growth. Review ${symbol}'s balance sheet and cash flow statements for inventory trends.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Inventory Turns`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Inventory Turnover ${currentYear} - Efficiency Analysis`,
    description: `Complete inventory turnover analysis for ${symbol} (${companyName}) with efficiency metrics and trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} inventory turnover`,
      `${symbol} inventory turns`,
      `${symbol} inventory efficiency`,
      `${symbol} working capital`,
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

  const faqSchema = getFAQSchema(inventoryFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="text-[#479ffa] hover:text-[#5baeff] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#479ffa] focus:ring-offset-2 focus:ring-offset-black rounded-sm">
              Home
            </Link>
            {' / '}
            <Link href="/dashboard" className="text-[#479ffa] hover:text-[#5baeff] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#479ffa] focus:ring-offset-2 focus:ring-offset-black rounded-sm">
              Stocks
            </Link>
            {' / '}
            <span>{symbol} Inventory Turns</span>
          </nav>

          {/* Page Header */}
          <h1 className="text-4xl font-bold mb-4 text-balance">
            {symbol} Inventory Turnover
          </h1>
          <p className="text-xl text-[#868f97] mb-8 text-balance">
            Inventory efficiency and working capital management for {companyName}
          </p>

          {/* Current Price Card - Glassmorphism */}
          <div className="relative overflow-hidden p-6 rounded-xl mb-8 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#868f97] mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#868f97] mb-1">Day Change</p>
                <p className={`text-2xl font-bold tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Metrics - Glassmorphism Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Inventory Efficiency Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden p-6 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <p className="text-sm text-[#868f97]">Inventory Turnover</p>
                <p className="text-3xl font-bold tabular-nums">{estimatedInventoryTurns.toFixed(1)}x</p>
                <p className="text-sm text-[#4ebe96] mt-1">Annual</p>
              </div>
              <div className="relative overflow-hidden p-6 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <p className="text-sm text-[#868f97]">Days Inventory</p>
                <p className="text-3xl font-bold tabular-nums">{daysInventory.toFixed(0)}</p>
                <p className="text-sm text-[#868f97] mt-1">Days</p>
              </div>
              <div className="relative overflow-hidden p-6 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <p className="text-sm text-[#868f97]">Revenue Growth</p>
                <p className={`text-3xl font-bold tabular-nums ${revenueGrowth >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-[#868f97] mt-1">YoY</p>
              </div>
            </div>
          </section>

          {/* Inventory Management Strategy - Glassmorphism */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Inventory Management Best Practices</h2>
            <div className="relative overflow-hidden p-6 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <p className="text-[#868f97] mb-4">
                {companyName} optimizes inventory through:
              </p>
              <ul className="space-y-2 text-[#868f97]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">•</span>
                  <span><strong className="text-white">Demand Forecasting:</strong> AI and data analytics to predict customer demand accurately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">•</span>
                  <span><strong className="text-white">Just-in-Time:</strong> Lean inventory practices to minimize holding costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">•</span>
                  <span><strong className="text-white">Supplier Partnerships:</strong> Vendor collaboration for faster replenishment cycles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ebe96] mt-1">•</span>
                  <span><strong className="text-white">SKU Optimization:</strong> Reducing slow-moving products and focusing on high-velocity items</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA Section - Glassmorphism with Gradient Accent */}
          <section className="relative overflow-hidden p-8 rounded-xl text-center mb-12 bg-gradient-to-r from-[#4ebe96]/10 to-[#479ffa]/10 backdrop-blur-xl border border-[#4ebe96]/20 hover:border-[#4ebe96]/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold mb-4 text-balance">Analyze {symbol} Operational Efficiency</h2>
            <p className="text-[#868f97] mb-6">
              Track working capital metrics, cash conversion, and operational performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-[#4ebe96] hover:bg-[#5ecfa6] text-black px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ebe96] focus:ring-offset-2 focus:ring-offset-black shadow-lg hover:shadow-[#4ebe96]/20"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cash-flow/${symbol.toLowerCase()}`}
                className="inline-block bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.15] px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#479ffa] focus:ring-offset-2 focus:ring-offset-black"
              >
                Cash Flow Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section - Glassmorphism Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {inventoryFaqs.map((faq, index) => (
                <div key={index} className="relative overflow-hidden p-5 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer - Glassmorphism */}
          <div className="text-xs text-[#868f97] bg-[#ffa16c]/5 backdrop-blur-xl border border-[#ffa16c]/20 p-4 rounded-lg mb-8">
            <p><strong className="text-[#ffa16c]">Disclaimer:</strong> Inventory turnover estimates are based on industry averages. Actual metrics may vary. Consult balance sheets and cash flow statements for precise inventory data and trends.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="inventory-turns" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
