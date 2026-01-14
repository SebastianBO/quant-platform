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
    title: `${symbol} Average Length of Stay - ALOS Metrics ${currentYear}`,
    description: `${symbol} average length of stay analysis: ALOS trends, bed utilization, patient throughput. Analyze ${symbol}'s operational efficiency metrics.`,
    keywords: [
      `${symbol} ALOS`,
      `${symbol} average length of stay`,
      `${symbol} bed utilization`,
      `${symbol} patient throughput`,
      `${symbol} hospital efficiency`,
      `${symbol} LOS`,
    ],
    openGraph: {
      title: `${symbol} Average Length of Stay ${currentYear} | Healthcare Metrics`,
      description: `Complete ${symbol} ALOS analysis with efficiency metrics and throughput optimization insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/average-length-of-stay/${ticker.toLowerCase()}`,
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

export default async function AverageLengthOfStayPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/average-length-of-stay/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate ALOS FAQs
  const alosFaqs = [
    {
      question: `What is ${symbol}'s average length of stay?`,
      answer: `${symbol} (${companyName}) average length of stay (ALOS) measures the average number of days patients remain hospitalized${sector === 'Healthcare' ? ' across their facilities' : ''}. ALOS reflects clinical efficiency, care protocols, and case complexity.`
    },
    {
      question: `Why is average length of stay important for ${symbol}?`,
      answer: `ALOS is a critical efficiency metric for ${companyName}. Shorter stays can indicate efficient care delivery and faster patient throughput, while longer stays may suggest complex cases or potential inefficiencies${industry ? ` in ${industry}` : ''}.`
    },
    {
      question: `How is ${symbol}'s ALOS calculated?`,
      answer: `${symbol} ALOS is calculated by dividing total inpatient days by total admissions during a reporting period. This metric is typically reported for different service lines and case types to enable meaningful comparisons.`
    },
    {
      question: `What affects ${symbol}'s average length of stay?`,
      answer: `${companyName} ALOS is influenced by case mix index, care protocols, physician practice patterns, discharge planning efficiency, post-acute care availability, and patient demographics${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `Is a lower ALOS better for ${symbol}?`,
      answer: `Generally, lower ALOS indicates operational efficiency for ${symbol}, but it must be balanced with quality outcomes. Optimal ALOS varies by diagnosis, with shorter stays preferred when medically appropriate and quality metrics are maintained.`
    },
    {
      question: `How does ${symbol}'s ALOS compare to industry benchmarks?`,
      answer: `Compare ${symbol} average length of stay to industry peers and national benchmarks by diagnosis-related group (DRG) to evaluate care efficiency, discharge planning, and operational performance.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Average Length of Stay`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Average Length of Stay ${currentYear} - Efficiency Metrics`,
    description: `Complete ALOS analysis for ${symbol} (${companyName}) with efficiency metrics and operational insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} ALOS`,
      `${symbol} average length of stay`,
      `${symbol} efficiency`,
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

  const faqSchema = getFAQSchema(alosFaqs)

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
            <span>{symbol} Average Length of Stay</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Average Length of Stay {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            ALOS efficiency metrics and patient throughput analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">ALOS Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average LOS</p>
                <p className="text-3xl font-bold">Patient Days</p>
                <p className="text-sm text-muted-foreground mt-1">Per admission</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bed Utilization</p>
                <p className="text-3xl font-bold">Occupancy Rate</p>
                <p className="text-sm text-muted-foreground mt-1">Capacity efficiency</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Throughput</p>
                <p className="text-3xl font-bold">Patient Turnover</p>
                <p className="text-sm text-muted-foreground mt-1">Annual admissions</p>
              </div>
            </div>
          </div>

          {/* ALOS by Service Line */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ALOS by Service Line</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Medical Services</h3>
                <p className="text-muted-foreground mb-2">General medicine, cardiology, pulmonology, and other non-surgical admissions.</p>
                <p className="text-sm text-blue-500 font-medium">Typical ALOS: 4-5 days</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Surgical Services</h3>
                <p className="text-muted-foreground mb-2">Elective and emergency surgical procedures requiring inpatient recovery.</p>
                <p className="text-sm text-blue-500 font-medium">Typical ALOS: 3-4 days</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Critical Care</h3>
                <p className="text-muted-foreground mb-2">ICU and intensive monitoring for critically ill patients.</p>
                <p className="text-sm text-red-500 font-medium">Typical ALOS: 7-10+ days</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Obstetrics</h3>
                <p className="text-muted-foreground mb-2">Normal deliveries and uncomplicated cesarean sections.</p>
                <p className="text-sm text-green-500 font-medium">Typical ALOS: 2-3 days</p>
              </div>
            </div>
          </section>

          {/* Efficiency Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting ALOS</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Clinical Protocols</h3>
                <p className="text-muted-foreground">Standardized care pathways, evidence-based medicine, and clinical guidelines that optimize recovery timelines.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Discharge Planning</h3>
                <p className="text-muted-foreground">Efficient coordination of post-acute care, home health services, and follow-up appointments to enable timely discharge.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Case Complexity</h3>
                <p className="text-muted-foreground">Patient acuity, comorbidities, and complications that extend recovery periods and hospital stays.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Resource Availability</h3>
                <p className="text-muted-foreground">Access to specialized services, diagnostic capabilities, and post-acute care facilities affecting discharge timing.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Operational Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete efficiency metrics, capacity utilization, and financial performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/admissions/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Admissions Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {alosFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Healthcare operational data is based on publicly filed reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="average-length-of-stay" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
