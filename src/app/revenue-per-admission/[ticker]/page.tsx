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
    title: `${symbol} Revenue Per Admission - Healthcare Profitability ${currentYear}`,
    description: `${symbol} revenue per admission analysis: patient revenue, reimbursement rates, pricing trends. Analyze ${symbol}'s profitability per patient admission.`,
    keywords: [
      `${symbol} revenue per admission`,
      `${symbol} patient revenue`,
      `${symbol} reimbursement`,
      `${symbol} pricing`,
      `${symbol} hospital revenue`,
      `${symbol} profitability`,
    ],
    openGraph: {
      title: `${symbol} Revenue Per Admission ${currentYear} | Healthcare Metrics`,
      description: `Complete ${symbol} revenue per admission analysis with reimbursement trends and profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/revenue-per-admission/${ticker.toLowerCase()}`,
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

export default async function RevenuePerAdmissionPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/revenue-per-admission/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate revenue per admission FAQs
  const revPerAdmissionFaqs = [
    {
      question: `What is ${symbol}'s revenue per admission?`,
      answer: `${symbol} (${companyName}) revenue per admission measures the average revenue generated from each inpatient admission${sector === 'Healthcare' ? ' across their healthcare facilities' : ''}. This metric reflects pricing, case mix, reimbursement rates, and service intensity.`
    },
    {
      question: `How is revenue per admission calculated for ${symbol}?`,
      answer: `${companyName} revenue per admission is calculated by dividing total inpatient revenue by total admissions. This includes Medicare, Medicaid, commercial insurance, and self-pay revenues across all service lines.`
    },
    {
      question: `Why is revenue per admission important for ${symbol}?`,
      answer: `Revenue per admission is a key profitability indicator for ${symbol}. Higher revenue per admission can result from complex case mix, favorable payor mix, pricing power, or value-added services${industry ? ` in ${industry}` : ''}.`
    },
    {
      question: `What affects ${symbol}'s revenue per admission?`,
      answer: `${companyName} revenue per admission is influenced by case mix index, payor mix (Medicare vs. commercial), service offerings, geographic markets, quality metrics, and contract reimbursement rates${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `Is ${symbol}'s revenue per admission growing?`,
      answer: `Revenue per admission growth for ${symbol} indicates pricing power and service line optimization. Growth can come from improved payor mix, higher acuity cases, expanded services, or favorable rate negotiations.`
    },
    {
      question: `How does ${symbol} compare to peers in revenue per admission?`,
      answer: `Compare ${symbol} revenue per admission to industry benchmarks to evaluate pricing strategy, case complexity, and operational efficiency. Geographic market dynamics and service mix significantly impact comparability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Revenue Per Admission`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Revenue Per Admission ${currentYear} - Healthcare Profitability`,
    description: `Complete revenue per admission analysis for ${symbol} (${companyName}) with reimbursement trends and profitability metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} revenue per admission`,
      `${symbol} patient revenue`,
      `${symbol} reimbursement`,
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

  const faqSchema = getFAQSchema(revPerAdmissionFaqs)

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
            <span>{symbol} Revenue Per Admission</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Revenue Per Admission {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Profitability metrics and reimbursement analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Revenue Per Admission Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Revenue</p>
                <p className="text-3xl font-bold">Per Patient</p>
                <p className="text-sm text-muted-foreground mt-1">Inpatient admission</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reimbursement</p>
                <p className="text-3xl font-bold">Payor Mix</p>
                <p className="text-sm text-muted-foreground mt-1">Revenue composition</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pricing Trend</p>
                <p className="text-3xl font-bold">Growth Rate</p>
                <p className="text-sm text-muted-foreground mt-1">YoY change</p>
              </div>
            </div>
          </div>

          {/* Revenue Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Per Admission Components</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Base Reimbursement</h3>
                <p className="text-muted-foreground">Primary payment from Medicare, Medicaid, and commercial insurers based on DRG classification and contracted rates.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Ancillary Services</h3>
                <p className="text-muted-foreground">Additional revenue from lab tests, imaging, pharmacy, therapy services, and other billable ancillary offerings.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Outlier Payments</h3>
                <p className="text-muted-foreground">Additional reimbursement for extraordinarily costly cases exceeding standard DRG payment thresholds.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Quality Adjustments</h3>
                <p className="text-muted-foreground">Payment adjustments based on quality metrics, readmission rates, and value-based care performance.</p>
              </div>
            </div>
          </section>

          {/* Payor Mix Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Payor Mix Impact on Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Revenue per admission varies significantly by payor type. Commercial insurance typically reimburses at higher rates than Medicare or Medicaid, making payor mix a critical driver of profitability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Commercial Insurance</p>
                  <p className="text-xl font-bold text-green-500">Highest</p>
                  <p className="text-xs text-muted-foreground mt-1">100-150%+ of Medicare</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Medicare</p>
                  <p className="text-xl font-bold text-yellow-500">Moderate</p>
                  <p className="text-xs text-muted-foreground mt-1">100% baseline</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Medicaid</p>
                  <p className="text-xl font-bold text-red-500">Lower</p>
                  <p className="text-xs text-muted-foreground mt-1">60-90% of Medicare</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue metrics, profitability analysis, and operational performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {revPerAdmissionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue and reimbursement data is based on publicly filed financial statements. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue-per-admission" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
