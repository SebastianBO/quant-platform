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
    title: `${symbol} Surgery Volume - Surgical Procedure Metrics ${currentYear}`,
    description: `${symbol} surgery volume analysis: total procedures, inpatient vs outpatient surgeries, case mix. Analyze ${symbol}'s surgical service line performance.`,
    keywords: [
      `${symbol} surgery volume`,
      `${symbol} surgical procedures`,
      `${symbol} operations`,
      `${symbol} outpatient surgery`,
      `${symbol} inpatient surgery`,
      `${symbol} OR utilization`,
    ],
    openGraph: {
      title: `${symbol} Surgery Volume ${currentYear} | Surgical Metrics`,
      description: `Complete ${symbol} surgery volume analysis with procedure mix, OR utilization, and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/surgery-volume/${ticker.toLowerCase()}`,
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

export default async function SurgeryVolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/surgery-volume/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate surgery volume FAQs
  const surgeryVolumeFaqs = [
    {
      question: `What is ${symbol}'s surgery volume?`,
      answer: `${symbol} (${companyName}) surgery volume measures the total number of surgical procedures performed${sector === 'Healthcare' ? ' across their facilities' : ''}, including inpatient operations and outpatient procedures. Surgery volume is a key revenue and profitability driver.`
    },
    {
      question: `How many surgeries does ${symbol} perform annually?`,
      answer: `${companyName} performs surgical procedures across multiple specialties including orthopedics, cardiovascular, general surgery, neurosurgery, and others${industry ? ` in their ${industry} facilities` : ''}. Total procedure volume reflects facility capacity and market demand.`
    },
    {
      question: `What is the difference between inpatient and outpatient surgery for ${symbol}?`,
      answer: `Inpatient surgeries for ${symbol} require overnight hospital admission and typically generate higher revenue but also higher costs. Outpatient surgeries are same-day procedures with lower costs and faster patient throughput, representing a growing share of total volumes.`
    },
    {
      question: `Is ${symbol}'s surgery volume growing?`,
      answer: `Surgery volume growth for ${companyName} indicates expanding market share, successful physician recruitment, and service line development. Growth in higher-margin procedures (orthopedics, cardiovascular) particularly enhances profitability${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What drives ${symbol}'s surgical volumes?`,
      answer: `${symbol} surgical volumes are driven by demographics (aging population), physician relationships, OR capacity, service line reputation, insurance network participation, and competitive positioning${industry ? ` in ${industry}` : ''}.`
    },
    {
      question: `How profitable are surgeries for ${symbol}?`,
      answer: `Surgical procedures are among the highest-margin services for ${companyName}. Profitability varies by procedure type, with orthopedics, cardiovascular, and neurosurgery typically commanding premium reimbursement rates from commercial payors.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Surgery Volume`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Surgery Volume ${currentYear} - Surgical Procedure Analysis`,
    description: `Complete surgery volume analysis for ${symbol} (${companyName}) with procedure mix, OR utilization, and growth metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} surgery volume`,
      `${symbol} surgical procedures`,
      `${symbol} operations`,
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

  const faqSchema = getFAQSchema(surgeryVolumeFaqs)

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
            <span>{symbol} Surgery Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Surgery Volume {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Surgical procedure metrics and OR utilization analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Surgery Volume Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Procedures</p>
                <p className="text-3xl font-bold">Annual Volume</p>
                <p className="text-sm text-muted-foreground mt-1">All surgical cases</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Inpatient vs Outpatient</p>
                <p className="text-3xl font-bold">Procedure Mix</p>
                <p className="text-sm text-muted-foreground mt-1">Case distribution</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">OR Utilization</p>
                <p className="text-3xl font-bold">Capacity Use</p>
                <p className="text-sm text-muted-foreground mt-1">Operating rooms</p>
              </div>
            </div>
          </div>

          {/* Surgical Service Lines */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Major Surgical Service Lines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Orthopedic Surgery</h3>
                <p className="text-muted-foreground mb-2">Joint replacements, spine procedures, sports medicine, and fracture repair.</p>
                <p className="text-sm text-green-500 font-medium">High-margin procedures</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Cardiovascular Surgery</h3>
                <p className="text-muted-foreground mb-2">Cardiac procedures, vascular surgery, interventional cardiology, and valve repairs.</p>
                <p className="text-sm text-green-500 font-medium">Premium reimbursement</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">General Surgery</h3>
                <p className="text-muted-foreground mb-2">Abdominal procedures, hernia repair, appendectomy, and bariatric surgery.</p>
                <p className="text-sm text-blue-500 font-medium">High volume</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Neurosurgery</h3>
                <p className="text-muted-foreground mb-2">Brain surgery, spine procedures, and complex neurological interventions.</p>
                <p className="text-sm text-purple-500 font-medium">Complex cases</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Obstetrics & Gynecology</h3>
                <p className="text-muted-foreground mb-2">Cesarean sections, hysterectomy, and women's health procedures.</p>
                <p className="text-sm text-pink-500 font-medium">Recurring demand</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Ophthalmology & ENT</h3>
                <p className="text-muted-foreground mb-2">Eye surgery, cataract removal, and ear, nose, throat procedures.</p>
                <p className="text-sm text-blue-500 font-medium">Outpatient focus</p>
              </div>
            </div>
          </section>

          {/* Inpatient vs Outpatient */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Inpatient vs Outpatient Surgeries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-3 text-blue-500">Inpatient Surgeries</h3>
                <p className="text-muted-foreground mb-4">
                  Complex procedures requiring overnight hospital admission and intensive post-operative monitoring.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Revenue Per Case</span>
                    <span className="font-bold">Higher</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Cost Per Case</span>
                    <span className="font-bold">Higher</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Patient Stay</span>
                    <span className="font-bold">1-7+ days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Examples</span>
                    <span className="font-bold text-xs">CABG, joint replacement</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-3 text-green-500">Outpatient Surgeries</h3>
                <p className="text-muted-foreground mb-4">
                  Same-day surgical procedures with discharge within 24 hours, representing growing share of total volumes.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Revenue Per Case</span>
                    <span className="font-bold">Moderate</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Cost Per Case</span>
                    <span className="font-bold">Lower</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Patient Stay</span>
                    <span className="font-bold">Same day</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span>Examples</span>
                    <span className="font-bold text-xs">Cataract, colonoscopy</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Industry Trend:</strong> Increasing shift from inpatient to outpatient surgeries driven by minimally invasive techniques, improved anesthesia, and payor pressure for lower-cost settings. Outpatient volume growth now exceeds inpatient growth across most specialties.
              </p>
            </div>
          </section>

          {/* OR Utilization */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Operating Room Utilization</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                OR utilization measures the percentage of available operating room time actively used for surgical procedures. Higher utilization indicates efficient resource use and strong surgical volumes.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Optimal Utilization</p>
                    <p className="text-sm text-muted-foreground">Efficient scheduling with flexibility</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">75-85%</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">High Utilization</p>
                    <p className="text-sm text-muted-foreground">Capacity constraints possible</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">85-95%</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div>
                    <p className="font-medium">Low Utilization</p>
                    <p className="text-sm text-muted-foreground">Underutilized capacity</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">&lt;65%</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Surgical Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete surgical metrics, service line performance, and profitability analysis
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
              {surgeryVolumeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Surgery volume data is based on publicly available operational reports. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="surgery-volume" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
