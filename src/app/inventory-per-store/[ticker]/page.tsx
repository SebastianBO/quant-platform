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
    title: `${symbol} Inventory Per Store - Stock Level Data ${currentYear}`,
    description: `${symbol} inventory per store analysis: stock levels, inventory turnover, and working capital efficiency metrics for ${symbol}.`,
    keywords: [
      `${symbol} inventory per store`,
      `${symbol} stock levels`,
      `${symbol} inventory turnover`,
      `${symbol} working capital`,
      `${symbol} inventory management`,
      `${symbol} stock efficiency`,
    ],
    openGraph: {
      title: `${symbol} Inventory Per Store ${currentYear} | Stock Management Analysis`,
      description: `Complete ${symbol} inventory per store analysis with stock level trends and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/inventory-per-store/${ticker.toLowerCase()}`,
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

export default async function InventoryPerStorePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/inventory-per-store/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate inventory per store FAQs
  const inventoryFaqs = [
    {
      question: `What is ${symbol}'s inventory per store?`,
      answer: `${symbol} (${companyName}) inventory per store measures the average dollar value of merchandise held at each retail location. This metric is calculated by dividing total inventory by number of stores, revealing how much capital ${symbol} ties up in stock at each location.`
    },
    {
      question: `How does ${symbol} manage inventory per store?`,
      answer: `${companyName} manages inventory per store by balancing stock levels to meet customer demand while minimizing carrying costs. Optimal inventory levels ensure product availability${sector ? ` in the ${sector} sector` : ''} without excessive capital tied up in unsold merchandise.`
    },
    {
      question: `Is ${symbol}'s inventory per store efficient?`,
      answer: `${symbol}'s inventory efficiency is measured by turnover ratios and days of inventory. Lower inventory per store (relative to sales) typically indicates better working capital management, faster inventory turns${industry ? ` in the ${industry} industry` : ''}, and reduced obsolescence risk.`
    },
    {
      question: `Why is inventory per store important for ${symbol}?`,
      answer: `For ${companyName}, inventory per store is critical because it directly impacts cash flow, profitability, and operational efficiency. Excessive inventory ties up capital and increases storage costs, while insufficient inventory leads to stockouts and lost sales.`
    },
    {
      question: `What drives ${symbol}'s inventory levels?`,
      answer: `${symbol}'s inventory per store is influenced by demand forecasting, supply chain efficiency, product lifecycles, seasonal patterns, promotional strategies${sector ? ` in the ${sector} market` : ''}, and distribution capabilities. Lead times and vendor reliability also affect stock levels.`
    },
    {
      question: `How does ${symbol}'s inventory compare to competitors?`,
      answer: `Comparing ${symbol}'s inventory per store to industry peers reveals relative efficiency in working capital management. Lower inventory levels with similar sales suggest ${companyName} has superior supply chain operations${industry ? ` within ${industry}` : ''}, better demand forecasting, or faster inventory turnover.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Inventory Per Store`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Inventory Per Store ${currentYear} - Stock Management Analysis`,
    description: `Complete inventory per store analysis for ${symbol} (${companyName}) with stock level trends and efficiency metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} inventory per store`,
      `${symbol} stock levels`,
      `${symbol} inventory turnover`,
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
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Inventory Per Store</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Inventory Per Store {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Stock levels and inventory management analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Inventory Per Store</h2>
            <p className="text-muted-foreground leading-relaxed">
              Inventory per store for {companyName} measures the average value of merchandise held at each location, calculated as total inventory divided by store count. This metric reveals working capital efficiency and how effectively {symbol} manages stock levels to balance availability with cost control.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Inventory Per Store Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Working Capital Efficiency</h3>
                <p className="text-muted-foreground text-sm">
                  Lower inventory per store frees up cash for {symbol} to invest in growth, pay dividends, or reduce debt while maintaining adequate stock.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Profitability Impact</h3>
                <p className="text-muted-foreground text-sm">
                  Efficient inventory management reduces carrying costs, markdowns, and obsolescence risk{sector ? ` in the ${sector} sector` : ''}, directly improving {companyName}'s margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Supply Chain Performance</h3>
                <p className="text-muted-foreground text-sm">
                  Optimal inventory levels indicate {symbol} has responsive supply chains, accurate demand forecasting{industry ? ` for ${industry}` : ''}, and strong vendor relationships.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Sales Performance</h3>
                <p className="text-muted-foreground text-sm">
                  Inventory turnover reveals how quickly {companyName} converts stock into sales, with faster turns indicating strong demand and efficient operations.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete inventory metrics, working capital data, and AI-powered retail insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/balance-sheet/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Balance Sheet
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {inventoryFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Inventory data is derived from company financial statements. Methodologies and reporting practices may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
