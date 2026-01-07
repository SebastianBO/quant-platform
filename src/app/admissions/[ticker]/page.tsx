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
    title: `${symbol} Hospital Admissions - Admission Metrics ${currentYear}`,
    description: `${symbol} hospital admissions analysis: total admissions, admission rates, case mix, readmission rates. Analyze ${symbol}'s patient admission trends.`,
    keywords: [
      `${symbol} admissions`,
      `${symbol} hospital admissions`,
      `${symbol} admission rate`,
      `${symbol} inpatient admissions`,
      `${symbol} case mix`,
      `${symbol} readmissions`,
    ],
    openGraph: {
      title: `${symbol} Hospital Admissions ${currentYear} | Healthcare Metrics`,
      description: `Complete ${symbol} hospital admissions analysis with admission rates, case mix, and quality metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/admissions/${ticker.toLowerCase()}`,
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

export default async function AdmissionsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/admissions/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate admissions FAQs
  const admissionsFaqs = [
    {
      question: `What are ${symbol}'s hospital admissions?`,
      answer: `${symbol} (${companyName}) hospital admissions include all inpatient cases requiring overnight stays${sector === 'Healthcare' ? ' across their healthcare facilities' : ''}. Admission metrics track both elective and emergency cases across various medical specialties.`
    },
    {
      question: `How many hospital admissions does ${symbol} have annually?`,
      answer: `${companyName} processes hospital admissions across ${industry || 'their healthcare network'}, including medical, surgical, obstetric, and psychiatric cases. Annual admission volumes reflect facility capacity and market demand.`
    },
    {
      question: `What is ${symbol}'s case mix?`,
      answer: `${symbol}'s case mix represents the distribution of patient diagnoses and procedures, measured by diagnosis-related groups (DRGs). Case mix index (CMI) indicates the average complexity and resource intensity of admitted patients.`
    },
    {
      question: `What is ${symbol}'s readmission rate?`,
      answer: `Hospital readmission rates for ${companyName} measure patients returning within 30 days of discharge. Lower readmission rates indicate better care quality and patient outcomes, while also affecting Medicare reimbursement rates.`
    },
    {
      question: `How does ${symbol} compare to industry admission rates?`,
      answer: `Compare ${symbol} admission rates, case mix index, and average length of stay to industry benchmarks to evaluate operational efficiency, service quality, and market positioning${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What affects ${symbol}'s admission volumes?`,
      answer: `${companyName} admission volumes are influenced by demographics, seasonal patterns, facility capacity, service offerings, physician relationships, insurance networks, and competitive dynamics${industry ? ` in the ${industry} market` : ''}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Admissions`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Hospital Admissions ${currentYear} - Healthcare Metrics`,
    description: `Complete hospital admissions analysis for ${symbol} (${companyName}) with case mix, readmission rates, and quality metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} admissions`,
      `${symbol} hospital admissions`,
      `${symbol} case mix`,
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

  const faqSchema = getFAQSchema(admissionsFaqs)

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
            <span>{symbol} Admissions</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Hospital Admissions {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Hospital admission metrics and case mix analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Admission Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Admissions</p>
                <p className="text-3xl font-bold">Inpatient Care</p>
                <p className="text-sm text-muted-foreground mt-1">Annual volume</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Case Mix Index</p>
                <p className="text-3xl font-bold">Clinical Complexity</p>
                <p className="text-sm text-muted-foreground mt-1">DRG-weighted</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quality Metrics</p>
                <p className="text-3xl font-bold">Readmission Rate</p>
                <p className="text-sm text-muted-foreground mt-1">30-day measure</p>
              </div>
            </div>
          </div>

          {/* Admission Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Hospital Admission Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Emergency Admissions</h3>
                <p className="text-muted-foreground">Unscheduled admissions through the emergency department requiring immediate inpatient care.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Elective Admissions</h3>
                <p className="text-muted-foreground">Scheduled admissions for planned surgical procedures and medical treatments.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Observation Stays</h3>
                <p className="text-muted-foreground">Short-term stays to monitor patient condition before discharge or full admission.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Direct Admissions</h3>
                <p className="text-muted-foreground">Physician-ordered admissions bypassing the emergency department for planned care.</p>
              </div>
            </div>
          </section>

          {/* Case Mix Index */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Case Mix Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Case Mix Index (CMI) measures the average complexity and resource intensity of patient admissions. Higher CMI indicates more complex cases requiring intensive resources, which typically command higher reimbursement rates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Medical Admissions</p>
                  <p className="text-xl font-bold">General Medicine</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Surgical Admissions</p>
                  <p className="text-xl font-bold">Procedures</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Critical Care</p>
                  <p className="text-xl font-bold">ICU Admissions</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Healthcare Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete operational metrics, quality indicators, and financial performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/patient-volume/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Patient Volume
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {admissionsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Hospital admission data is based on publicly filed reports and regulatory disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="admissions" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
