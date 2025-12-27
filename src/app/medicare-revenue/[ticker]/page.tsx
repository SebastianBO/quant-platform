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
    title: `${symbol} Medicare Revenue - Government Payor Analysis ${currentYear}`,
    description: `${symbol} Medicare revenue analysis: Medicare percentage, reimbursement rates, CMS payments. Analyze ${symbol}'s government payor exposure and trends.`,
    keywords: [
      `${symbol} Medicare revenue`,
      `${symbol} Medicare`,
      `${symbol} CMS payments`,
      `${symbol} government revenue`,
      `${symbol} Medicare percentage`,
      `${symbol} reimbursement`,
    ],
    openGraph: {
      title: `${symbol} Medicare Revenue ${currentYear} | Government Payor Analysis`,
      description: `Complete ${symbol} Medicare revenue analysis with reimbursement trends and government payor exposure.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/medicare-revenue/${ticker.toLowerCase()}`,
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

export default async function MedicareRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/medicare-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate Medicare revenue FAQs
  const medicareRevenueFaqs = [
    {
      question: `What is ${symbol}'s Medicare revenue?`,
      answer: `${symbol} (${companyName}) Medicare revenue represents the portion of total revenue from Medicare patients${sector === 'Healthcare' ? ' across their healthcare facilities' : ''}. Medicare covers Americans 65 and older, plus certain younger individuals with disabilities and end-stage renal disease.`
    },
    {
      question: `What percentage of ${symbol}'s revenue is from Medicare?`,
      answer: `${companyName} Medicare percentage indicates government payor dependence and reimbursement risk. Higher Medicare exposure (40%+) provides stable patient volumes but faces ongoing reimbursement pressure from CMS rate adjustments${industry ? ` in ${industry}` : ''}.`
    },
    {
      question: `How does Medicare reimbursement work for ${symbol}?`,
      answer: `Medicare reimburses ${symbol} through CMS-determined rates based on diagnosis-related groups (DRGs) for inpatient care and fee schedules for outpatient services. Reimbursement rates are adjusted annually based on inflation, quality metrics, and policy changes.`
    },
    {
      question: `Is Medicare revenue growing for ${symbol}?`,
      answer: `${companyName} Medicare revenue growth reflects aging demographics (65+ population growth), volume increases, and annual CMS rate adjustments. Growth must outpace cost inflation to maintain profitability${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What are Medicare Advantage impacts on ${symbol}?`,
      answer: `Medicare Advantage (MA) plans represent private insurance alternatives to traditional Medicare. ${symbol} may receive different reimbursement rates from MA plans compared to traditional Medicare, affecting overall Medicare revenue composition.`
    },
    {
      question: `How do CMS policy changes affect ${symbol}?`,
      answer: `CMS policy changes including reimbursement rate updates, quality measure adjustments, and value-based care initiatives directly impact ${companyName} Medicare revenue. Annual rate changes typically range from -2% to +3%, significantly affecting profitability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Medicare Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Medicare Revenue ${currentYear} - Government Payor Analysis`,
    description: `Complete Medicare revenue analysis for ${symbol} (${companyName}) with CMS reimbursement trends and policy impacts.`,
    url: pageUrl,
    keywords: [
      `${symbol} Medicare revenue`,
      `${symbol} Medicare`,
      `${symbol} CMS payments`,
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

  const faqSchema = getFAQSchema(medicareRevenueFaqs)

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
            <span>{symbol} Medicare Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Medicare Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Government payor analysis and CMS reimbursement metrics for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Medicare Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medicare Percentage</p>
                <p className="text-3xl font-bold">Revenue Mix</p>
                <p className="text-sm text-muted-foreground mt-1">Government payor</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual CMS Payments</p>
                <p className="text-3xl font-bold">Total Revenue</p>
                <p className="text-sm text-muted-foreground mt-1">From Medicare</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rate Growth</p>
                <p className="text-3xl font-bold">CMS Updates</p>
                <p className="text-sm text-muted-foreground mt-1">Annual adjustment</p>
              </div>
            </div>
          </div>

          {/* Medicare Program Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Medicare Program Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medicare Part A - Inpatient</h3>
                <p className="text-muted-foreground mb-2">Hospital inpatient care, skilled nursing facility care, hospice, and home health services.</p>
                <p className="text-sm text-blue-500 font-medium">DRG-based reimbursement</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medicare Part B - Outpatient</h3>
                <p className="text-muted-foreground mb-2">Physician services, outpatient care, preventive services, and medical equipment.</p>
                <p className="text-sm text-blue-500 font-medium">Fee schedule payments</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medicare Advantage (Part C)</h3>
                <p className="text-muted-foreground mb-2">Private insurance plans that provide Medicare benefits through contracted networks.</p>
                <p className="text-sm text-green-500 font-medium">Varies by contract</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medicare Part D - Prescription</h3>
                <p className="text-muted-foreground mb-2">Prescription drug coverage provided through private plans.</p>
                <p className="text-sm text-purple-500 font-medium">Pharmacy benefit</p>
              </div>
            </div>
          </section>

          {/* Reimbursement Dynamics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Medicare Reimbursement Dynamics</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">DRG Payment System</h3>
                <p className="text-muted-foreground mb-3">
                  Diagnosis-Related Groups (DRGs) determine fixed payments for inpatient stays based on diagnosis and procedure codes. Payments are adjusted for case complexity, geographic location, and teaching hospital status.
                </p>
                <div className="flex gap-3 text-sm">
                  <div className="bg-secondary/30 p-3 rounded flex-1">
                    <p className="text-muted-foreground mb-1">Base Rate</p>
                    <p className="font-bold">National Average</p>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded flex-1">
                    <p className="text-muted-foreground mb-1">Adjustments</p>
                    <p className="font-bold">Regional + Quality</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Annual Rate Updates</h3>
                <p className="text-muted-foreground mb-3">
                  CMS updates Medicare rates annually based on the market basket index (inflation measure), productivity adjustments, and legislative changes. Recent updates have ranged from -0.5% to +3.0%.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                  <p className="text-sm font-medium mb-1">Rate Update Impact</p>
                  <p className="text-xs text-muted-foreground">A 1% rate change affects profits significantly more than 1% due to operating leverage</p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Quality-Based Adjustments</h3>
                <p className="text-muted-foreground mb-3">
                  Value-based purchasing programs tie Medicare payments to quality metrics including readmission rates, patient satisfaction, and clinical outcomes. Poor performance can reduce payments by 2-3%.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <p className="font-medium">High Quality</p>
                    <p className="text-xs text-muted-foreground mt-1">Bonus payments</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                    <p className="font-medium">Low Quality</p>
                    <p className="text-xs text-muted-foreground mt-1">Payment penalties</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Medicare vs Other Payors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Medicare Compared to Other Payors</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Medicare serves as the baseline for healthcare reimbursement. Commercial insurance typically pays 100-150%+ of Medicare rates, while Medicaid pays 60-90% of Medicare.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Commercial Insurance</p>
                    <p className="text-sm text-muted-foreground">Private employer and individual plans</p>
                  </div>
                  <p className="text-xl font-bold text-green-500">100-150%+</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Medicare (Baseline)</p>
                    <p className="text-sm text-muted-foreground">CMS-determined rates</p>
                  </div>
                  <p className="text-xl font-bold text-blue-500">100%</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Medicaid</p>
                    <p className="text-sm text-muted-foreground">State/federal low-income program</p>
                  </div>
                  <p className="text-xl font-bold text-yellow-500">60-90%</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Payor Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete payor mix, reimbursement trends, and profitability analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/payor-mix/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Payor Mix
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {medicareRevenueFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Medicare revenue data is based on publicly filed financial disclosures and regulatory reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="medicare-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
