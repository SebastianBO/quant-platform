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
    title: `${symbol} F&I Revenue ${currentYear} - Finance & Insurance Metrics`,
    description: `${symbol} F&I revenue analysis: finance and insurance income, per vehicle retail (PVR), product penetration, and dealership F&I profitability for ${currentYear}.`,
    keywords: [
      `${symbol} F&I revenue`,
      `${symbol} finance insurance`,
      `${symbol} PVR`,
      `${symbol} per vehicle retail`,
      `${symbol} F&I penetration`,
      `${symbol} dealership finance`,
    ],
    openGraph: {
      title: `${symbol} F&I Revenue ${currentYear} | Finance & Insurance Metrics`,
      description: `Complete ${symbol} F&I revenue analysis with PVR and penetration insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/finance-insurance/${ticker.toLowerCase()}`,
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

export default async function FinanceInsurancePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/finance-insurance/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} F&I revenue?`,
      answer: `${symbol} F&I (Finance & Insurance) revenue represents income generated from financing vehicle purchases and selling insurance products, extended warranties, service contracts, GAP insurance, and other ancillary products at ${companyName} dealerships. F&I is a highly profitable revenue stream with minimal variable costs.`
    },
    {
      question: `What is PVR (Per Vehicle Retail) for ${symbol}?`,
      answer: `PVR measures the average F&I revenue earned per vehicle sold. Industry benchmarks range from $1,500-$2,500+ per vehicle. Higher PVR indicates effective F&I departments with strong product penetration and skilled F&I managers. ${companyName}'s PVR directly impacts overall dealership profitability.`
    },
    {
      question: `Why is F&I revenue so profitable?`,
      answer: `F&I products have extremely high gross profit margins (often 80-95%) because they involve minimal inventory or direct costs. The revenue from finance reserve (lender commissions) and product sales flows directly to gross profit, making F&I one of the most valuable profit centers in automotive retail.`
    },
    {
      question: `What products drive F&I revenue?`,
      answer: `Key F&I products include vehicle financing (dealer reserve from lenders), extended warranties, GAP insurance, tire and wheel protection, paint and fabric protection, theft protection, prepaid maintenance plans, and credit life/disability insurance. ${companyName}'s product mix and penetration rates determine F&I performance.`
    },
    {
      question: `How can ${symbol} increase F&I revenue?`,
      answer: `F&I growth comes from improving product penetration rates, training F&I managers, offering competitive financing options, expanding product menus, implementing digital F&I tools, improving customer satisfaction to reduce chargebacks, and optimizing lending relationships for better dealer reserve.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} F&I Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} F&I Revenue ${currentYear} - Finance & Insurance Metrics`,
    description: `Complete F&I revenue analysis for ${symbol} (${companyName}) with PVR and profitability insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} F&I revenue`,
      `${symbol} finance insurance`,
      `${symbol} PVR`,
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
            <span>{symbol} F&I Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} F&I Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Finance and insurance revenue metrics for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Understanding F&I Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Finance & Insurance (F&I) revenue is one of the most profitable segments for automotive dealership groups like {companyName}. F&I departments generate income from financing arrangements and selling protection products with gross profit margins often exceeding 80-95%.
              </p>
              <p className="text-muted-foreground">
                Unlike vehicle sales which require inventory investment and have modest margins, F&I revenue is nearly pure profit. Each vehicle sold represents an opportunity to generate $1,500-$2,500+ in F&I income through financing reserve, extended warranties, and ancillary products.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key F&I Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">PVR (Per Vehicle Retail)</h3>
                <p className="text-muted-foreground text-sm">
                  Average F&I revenue per vehicle sold, industry benchmark $1,500-$2,500+. Higher PVR drives profitability.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Product Penetration</h3>
                <p className="text-muted-foreground text-sm">
                  Percentage of sales with F&I products attached, measuring F&I department effectiveness.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Finance Reserve</h3>
                <p className="text-muted-foreground text-sm">
                  Commission earned from lenders when dealership arranges customer financing at marked-up rates.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Chargeback Rate</h3>
                <p className="text-muted-foreground text-sm">
                  Percentage of F&I revenue returned due to early loan payoffs or cancelled contracts.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">F&I Product Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Vehicle Financing</h3>
                <p className="text-sm text-muted-foreground">Dealer reserve from marked-up interest rates</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Extended Warranty</h3>
                <p className="text-sm text-muted-foreground">Service contracts beyond manufacturer coverage</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">GAP Insurance</h3>
                <p className="text-sm text-muted-foreground">Covers loan balance if vehicle is totaled</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Tire & Wheel</h3>
                <p className="text-sm text-muted-foreground">Protection plans for wheel and tire damage</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Paint Protection</h3>
                <p className="text-sm text-muted-foreground">Sealants and protection for exterior/interior</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Maintenance Plans</h3>
                <p className="text-sm text-muted-foreground">Prepaid service packages for scheduled maintenance</p>
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
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. F&I performance varies by dealership, market, and regulatory environment. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
