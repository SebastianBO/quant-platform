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
    title: `${symbol} Payor Mix - Insurance Revenue Mix ${currentYear}`,
    description: `${symbol} payor mix analysis: Medicare, Medicaid, commercial insurance breakdown. Analyze ${symbol}'s revenue by insurance type and reimbursement rates.`,
    keywords: [
      `${symbol} payor mix`,
      `${symbol} Medicare revenue`,
      `${symbol} Medicaid`,
      `${symbol} commercial insurance`,
      `${symbol} reimbursement`,
      `${symbol} insurance mix`,
    ],
    openGraph: {
      title: `${symbol} Payor Mix ${currentYear} | Insurance Revenue Analysis`,
      description: `Complete ${symbol} payor mix analysis with Medicare, Medicaid, and commercial insurance breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/payor-mix/${ticker.toLowerCase()}`,
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

export default async function PayorMixPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/payor-mix/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate payor mix FAQs
  const payorMixFaqs = [
    {
      question: `What is ${symbol}'s payor mix?`,
      answer: `${symbol} (${companyName}) payor mix represents the percentage of revenue from different insurance types${sector === 'Healthcare' ? ' across their healthcare facilities' : ''}: Medicare, Medicaid, commercial insurance, and self-pay. Payor mix significantly impacts reimbursement rates and profitability.`
    },
    {
      question: `Why is payor mix important for ${symbol}?`,
      answer: `Payor mix is critical for ${companyName} profitability because reimbursement rates vary significantly. Commercial insurance typically pays 100-150%+ of Medicare rates, Medicare pays baseline rates, and Medicaid often pays 60-90% of Medicare${industry ? ` in ${industry}` : ''}.`
    },
    {
      question: `What is ${symbol}'s Medicare percentage?`,
      answer: `Medicare percentage reflects the portion of ${symbol} revenue from patients age 65+ and those with disabilities. Higher Medicare exposure provides stable volumes but lower reimbursement compared to commercial insurance.`
    },
    {
      question: `How does commercial insurance affect ${symbol}?`,
      answer: `Commercial insurance is the most profitable payor for ${companyName}, typically reimbursing at rates significantly above Medicare. Higher commercial payor mix indicates stronger pricing power and profitability${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `What is ${symbol}'s Medicaid exposure?`,
      answer: `Medicaid exposure for ${symbol} represents the percentage of revenue from low-income patients. Medicaid typically reimburses at the lowest rates, making high Medicaid exposure a profitability challenge for healthcare providers.`
    },
    {
      question: `Is ${symbol}'s payor mix improving?`,
      answer: `Improving payor mix for ${symbol} means increasing commercial insurance percentage while managing Medicare and Medicaid exposure. Geographic expansion, service line optimization, and strategic positioning influence payor mix evolution.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Payor Mix`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Payor Mix ${currentYear} - Insurance Revenue Analysis`,
    description: `Complete payor mix analysis for ${symbol} (${companyName}) with Medicare, Medicaid, and commercial insurance breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} payor mix`,
      `${symbol} Medicare`,
      `${symbol} insurance mix`,
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

  const faqSchema = getFAQSchema(payorMixFaqs)

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
            <span>{symbol} Payor Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Payor Mix {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Insurance revenue composition and reimbursement analysis for {companyName}
          </p>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Payor Mix Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Commercial Insurance</p>
                <p className="text-3xl font-bold text-green-500">Highest Rates</p>
                <p className="text-sm text-muted-foreground mt-1">Premium reimbursement</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medicare</p>
                <p className="text-3xl font-bold text-blue-500">Baseline Rates</p>
                <p className="text-sm text-muted-foreground mt-1">Age 65+ coverage</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medicaid</p>
                <p className="text-3xl font-bold text-yellow-500">Lower Rates</p>
                <p className="text-sm text-muted-foreground mt-1">State programs</p>
              </div>
            </div>
          </div>

          {/* Payor Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Payor Categories Explained</h2>
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-green-500">Commercial Insurance</h3>
                <p className="text-muted-foreground mb-3">
                  Private insurance from employers and individual plans. Includes Aetna, UnitedHealthcare, Blue Cross, Cigna, and others.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Reimbursement</p>
                    <p className="font-bold">100-150%+ of Medicare</p>
                  </div>
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Population</p>
                    <p className="font-bold">Working age adults</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-blue-500">Medicare</h3>
                <p className="text-muted-foreground mb-3">
                  Federal health insurance for Americans 65 and older, plus younger people with disabilities and end-stage renal disease.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Reimbursement</p>
                    <p className="font-bold">100% baseline (CMS rates)</p>
                  </div>
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Population</p>
                    <p className="font-bold">65+ and disabled</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-yellow-500">Medicaid</h3>
                <p className="text-muted-foreground mb-3">
                  State and federal program providing health coverage for low-income individuals and families.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Reimbursement</p>
                    <p className="font-bold">60-90% of Medicare</p>
                  </div>
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Population</p>
                    <p className="font-bold">Low-income families</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 border border-border p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Self-Pay & Other</h3>
                <p className="text-muted-foreground mb-3">
                  Uninsured patients paying out-of-pocket, plus workers' compensation, TRICARE, and other specialized programs.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Collection Rate</p>
                    <p className="font-bold">Variable (often low)</p>
                  </div>
                  <div className="bg-card p-3 rounded">
                    <p className="text-muted-foreground">Population</p>
                    <p className="font-bold">Uninsured</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Payor Mix Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Financial Impact of Payor Mix</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Payor mix directly impacts profitability. A hospital with 50% commercial insurance, 35% Medicare, and 15% Medicaid will have significantly higher revenue per patient than one with 20% commercial, 60% Medicare, and 20% Medicaid.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Optimal Payor Mix</span>
                  <span className="text-muted-foreground">High commercial, moderate Medicare, low Medicaid</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Revenue Impact</span>
                  <span className="text-muted-foreground">10% shift to commercial can increase revenue 5-10%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Geographic Factor</span>
                  <span className="text-muted-foreground">Market demographics determine payor mix potential</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Revenue Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, reimbursement trends, and profitability analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue-per-admission/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Per Admission
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {payorMixFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Payor mix data is based on publicly filed financial disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="payor-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
