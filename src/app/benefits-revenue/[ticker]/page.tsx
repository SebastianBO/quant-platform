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
    title: `${symbol} Benefits Revenue - Employee Benefits Revenue & Growth`,
    description: `${symbol} benefits revenue analysis. View employee benefits administration revenue trends, benefits enrollment metrics, and benefits software earnings.`,
    keywords: [
      `${symbol} benefits revenue`,
      `${symbol} employee benefits revenue`,
      `${symbol} benefits administration`,
      `${symbol} benefits enrollment`,
      `${symbol} benefits software`,
      `${symbol} HCM benefits`,
    ],
    openGraph: {
      title: `${symbol} Benefits Revenue | Employee Benefits Earnings`,
      description: `Complete ${symbol} benefits revenue data including enrollment trends, administration fees, and benefits software earnings analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/benefits-revenue/${ticker.toLowerCase()}`,
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

export default async function BenefitsRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/benefits-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedBenefitsRevenue = revenue * 0.20 // Estimate 20% from benefits

  const benefitsFaqs = [
    {
      question: `What is ${symbol}'s benefits revenue?`,
      answer: `${companyName}'s benefits revenue includes earnings from benefits administration, enrollment management, carrier integrations, and benefits communication tools. We estimate benefits revenue at approximately $${(estimatedBenefitsRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate benefits revenue?`,
      answer: `${companyName} generates benefits revenue through per-employee-per-month (PEPM) fees for benefits administration, enrollment fees, carrier integration fees, benefits marketplace commissions, and premium features for benefits management and compliance.`
    },
    {
      question: `What is the growth rate of ${symbol}'s benefits business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s benefits segment grows through new client acquisition, increased employee enrollment, expansion of benefits offerings, and higher PEPM rates for comprehensive benefits packages.`
    },
    {
      question: `Why is benefits revenue important for ${symbol}?`,
      answer: `Benefits revenue is important because it's highly recurring, has strong retention rates (benefits are typically renewed annually), creates ecosystem lock-in with carrier integrations, and generates cross-selling opportunities for additional HCM modules.`
    },
    {
      question: `What types of benefits does ${symbol} manage?`,
      answer: `${companyName} typically manages health insurance, dental, vision, 401(k) retirement plans, FSA/HSA accounts, life insurance, disability insurance, commuter benefits, wellness programs, and other voluntary benefits through their platform.`
    },
    {
      question: `How does ${symbol}'s benefits revenue compare to competitors?`,
      answer: `${companyName}'s benefits revenue can be compared to competitors like Benefitfocus, bswift (Alight), and other HCM providers offering benefits administration. Key metrics include enrollment rates, PEPM pricing, carrier partnerships, and benefits marketplace penetration.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Benefits Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Benefits Revenue - Employee Benefits Revenue & Growth`,
    description: `Complete benefits revenue analysis for ${symbol} (${companyName}) including enrollment trends, administration metrics, and benefits software earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} benefits revenue`,
      `${symbol} employee benefits`,
      `${symbol} benefits administration`,
      `${symbol} benefits enrollment`,
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

  const faqSchema = getFAQSchema(benefitsFaqs)

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
            <span>{symbol} Benefits Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Benefits Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Employee benefits administration revenue and growth trends for {companyName}
          </p>

          {/* Current Price Card */}
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

          {/* Benefits Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Benefits Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Benefits Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedBenefitsRevenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ${(revenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Understanding Benefits Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Benefits Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Benefits revenue represents {companyName}'s earnings from employee benefits administration and enrollment services. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Administration Fees:</strong> PEPM fees for managing benefits enrollment and ongoing administration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Enrollment Services:</strong> Open enrollment management, life event changes, and employee support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Carrier Integrations:</strong> EDI connections with insurance carriers and benefits providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Marketplace Commissions:</strong> Revenue share from benefits carriers for employee enrollments</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Benefits Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Benefits Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Core Benefits</h3>
                <p className="text-sm text-muted-foreground">Health, dental, vision insurance, and 401(k) retirement plans</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Financial Benefits</h3>
                <p className="text-sm text-muted-foreground">FSA, HSA, commuter benefits, and tax-advantaged accounts</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Insurance Products</h3>
                <p className="text-sm text-muted-foreground">Life, disability, critical illness, and supplemental insurance</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Voluntary Benefits</h3>
                <p className="text-sm text-muted-foreground">Pet insurance, legal services, identity theft protection, wellness programs</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live benefits revenue data, HCM metrics, and detailed financial analysis
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

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {benefitsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue metrics are estimates based on publicly available data and should not be considered financial advice. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="benefits-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
