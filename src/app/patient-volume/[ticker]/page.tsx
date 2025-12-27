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
    title: `${symbol} Patient Volume - Healthcare Metrics ${currentYear}`,
    description: `${symbol} patient volume analysis: total patients, outpatient visits, inpatient admissions, emergency room visits. Track ${symbol}'s patient growth trends.`,
    keywords: [
      `${symbol} patient volume`,
      `${symbol} patients`,
      `${symbol} patient count`,
      `${symbol} outpatient volume`,
      `${symbol} inpatient volume`,
      `${symbol} ER visits`,
    ],
    openGraph: {
      title: `${symbol} Patient Volume ${currentYear} | Healthcare Metrics`,
      description: `Complete ${symbol} patient volume analysis with growth trends and demographic insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/patient-volume/${ticker.toLowerCase()}`,
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

export default async function PatientVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/patient-volume/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate patient volume FAQs
  const patientVolumeFaqs = [
    {
      question: `What is ${symbol}'s patient volume?`,
      answer: `${symbol} (${companyName}) serves patients across multiple healthcare facilities${sector === 'Healthcare' ? ' in the healthcare sector' : ''}. Patient volume includes inpatient admissions, outpatient visits, emergency room visits, and other healthcare services.`
    },
    {
      question: `How many patients does ${symbol} serve annually?`,
      answer: `${companyName} patient volume data includes all healthcare encounters across ${industry ? `${industry} facilities` : 'their network'}. This encompasses hospital admissions, outpatient procedures, diagnostic services, and emergency care visits.`
    },
    {
      question: `Is ${symbol} patient volume growing?`,
      answer: `Patient volume growth is a key indicator of ${symbol}'s operational performance${sector === 'Healthcare' ? ' in the healthcare sector' : ''}. Growing patient volumes typically indicate market share gains, expanded service offerings, or demographic tailwinds in served markets.`
    },
    {
      question: `What drives ${symbol}'s patient volume?`,
      answer: `${companyName} patient volume is driven by factors including demographics, service mix, facility locations, insurance network participation, quality of care metrics, and competitive positioning${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `How does ${symbol} patient volume compare to competitors?`,
      answer: `Compare ${symbol} patient volume metrics to industry peers to evaluate market position, growth trajectory, and operational efficiency. Patient volume per facility and revenue per patient are key comparative metrics.`
    },
    {
      question: `What patient services does ${symbol} provide?`,
      answer: `${companyName} provides healthcare services including ${industry || 'various medical services'}, with patient volume distributed across inpatient care, outpatient procedures, emergency services, and ancillary healthcare offerings.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Patient Volume`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Patient Volume ${currentYear} - Healthcare Metrics Analysis`,
    description: `Complete patient volume analysis for ${symbol} (${companyName}) with growth trends, service mix, and demographic insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} patient volume`,
      `${symbol} patients`,
      `${symbol} healthcare metrics`,
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

  const faqSchema = getFAQSchema(patientVolumeFaqs)

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
            <span>{symbol} Patient Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Patient Volume {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Healthcare metrics and patient volume analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Patient Volume Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Patient Encounters</p>
                <p className="text-3xl font-bold">Healthcare Services</p>
                <p className="text-sm text-muted-foreground mt-1">Inpatient + Outpatient</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service Mix</p>
                <p className="text-3xl font-bold">Multi-Specialty</p>
                <p className="text-sm text-muted-foreground mt-1">Comprehensive Care</p>
              </div>
            </div>
          </div>

          {/* Patient Volume Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Patient Volume by Service Type</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Inpatient Admissions</h3>
                <p className="text-muted-foreground">Overnight hospital stays requiring admission to medical facilities for treatment and care.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Outpatient Visits</h3>
                <p className="text-muted-foreground">Same-day medical services, procedures, and consultations without overnight admission.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Emergency Room Visits</h3>
                <p className="text-muted-foreground">Urgent and emergency medical care provided through emergency department facilities.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Ancillary Services</h3>
                <p className="text-muted-foreground">Diagnostic, therapeutic, and support services including lab work, imaging, and rehabilitation.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Healthcare Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, operational metrics, and AI-powered insights
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
              {patientVolumeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Healthcare metrics are based on publicly filed data and regulatory reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="patient-volume" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
