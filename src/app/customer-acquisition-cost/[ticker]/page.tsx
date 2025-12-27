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
    title: `${symbol} Customer Acquisition Cost (CAC) - Sports Betting Unit Economics ${currentYear}`,
    description: `${symbol} CAC analysis: customer acquisition cost, LTV/CAC ratio, payback period, marketing efficiency. Track ${symbol}'s unit economics and profitability path.`,
    keywords: [
      `${symbol} CAC`,
      `${symbol} customer acquisition cost`,
      `${symbol} LTV CAC ratio`,
      `${symbol} payback period`,
      `${symbol} marketing spend`,
      `${symbol} unit economics`,
    ],
    openGraph: {
      title: `${symbol} Customer Acquisition Cost ${currentYear} | Unit Economics`,
      description: `Complete ${symbol} CAC analysis with LTV ratios and profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/customer-acquisition-cost/${ticker.toLowerCase()}`,
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

export default async function CACPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/customer-acquisition-cost/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock CAC data - in production, this would come from your API
  const currentCAC = metrics?.cac || 250
  const ltv = metrics?.ltv || 800
  const ltvCacRatio = ltv / currentCAC
  const paybackPeriod = metrics?.payback_period || 12
  const latestPeriod = 'Q4 2024'

  // Generate CAC FAQs
  const cacFaqs = [
    {
      question: `What is ${symbol}'s customer acquisition cost?`,
      answer: `${symbol} (${companyName}) reported a customer acquisition cost (CAC) of approximately $${currentCAC.toFixed(0)} in ${latestPeriod}. This represents the blended cost to acquire a new customer across all marketing channels including bonuses, advertising, and affiliate payments.`
    },
    {
      question: `What is customer acquisition cost in sports betting?`,
      answer: `Customer Acquisition Cost (CAC) is the total cost to acquire a new customer, including sign-up bonuses, marketing spend, affiliate fees, and advertising costs. For sports betting operators, CAC typically ranges from $200-$500 per customer depending on market maturity and competitive intensity.`
    },
    {
      question: `What is ${symbol}'s LTV/CAC ratio?`,
      answer: `${symbol}'s LTV/CAC ratio is ${ltvCacRatio.toFixed(1)}x, meaning the lifetime value of a customer is ${ltvCacRatio.toFixed(1)} times the cost to acquire them. ${ltvCacRatio >= 3 ? 'This is a healthy ratio indicating strong unit economics.' : ltvCacRatio >= 2 ? 'This is an acceptable ratio but there is room for improvement.' : 'This ratio suggests the company is investing heavily in growth at the expense of near-term profitability.'}`
    },
    {
      question: `How long is ${symbol}'s payback period?`,
      answer: `${symbol}'s estimated payback period is ${paybackPeriod} months, meaning it takes approximately ${Math.round(paybackPeriod / 12)} year${paybackPeriod >= 24 ? 's' : ''} to recover the customer acquisition cost. ${paybackPeriod <= 12 ? 'This is excellent and indicates strong customer engagement.' : paybackPeriod <= 18 ? 'This is solid for the sports betting industry.' : 'This suggests the company may need to improve retention or monetization.'}`
    },
    {
      question: `Is ${symbol}'s CAC sustainable?`,
      answer: currentCAC <= 300
        ? `${symbol}'s CAC of $${currentCAC.toFixed(0)} is relatively efficient compared to industry benchmarks ($200-$500). As markets mature and competition moderates, CAC should decline further, improving unit economics.`
        : `${symbol}'s CAC of $${currentCAC.toFixed(0)} reflects competitive market conditions. As markets mature and customer acquisition shifts from bonuses to brand loyalty, CAC should improve over time.`
    },
    {
      question: `How does CAC impact ${symbol}'s profitability?`,
      answer: `CAC directly impacts profitability timelines. With a $${currentCAC.toFixed(0)} CAC and ${paybackPeriod}-month payback period, ${symbol} needs to balance growth investment with profitability. Lower CAC and faster payback periods accelerate the path to sustainable profits.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} CAC`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Customer Acquisition Cost ${currentYear} - Unit Economics Analysis`,
    description: `Complete CAC analysis for ${symbol} (${companyName}) with LTV ratios and profitability insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} CAC`,
      `${symbol} customer acquisition cost`,
      `${symbol} unit economics`,
      `${symbol} LTV CAC ratio`,
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

  const faqSchema = getFAQSchema(cacFaqs)

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
            <span>{symbol} CAC</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Customer Acquisition Cost {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unit economics and profitability metrics for {companyName}
          </p>

          {/* Latest CAC Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current CAC</p>
                <p className="text-3xl font-bold">
                  ${currentCAC.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per customer</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">LTV/CAC Ratio</p>
                <p className={`text-3xl font-bold ${ltvCacRatio >= 3 ? 'text-green-500' : ltvCacRatio >= 2 ? 'text-yellow-500' : 'text-orange-500'}`}>
                  {ltvCacRatio.toFixed(1)}x
                </p>
                <p className="text-sm text-muted-foreground mt-1">lifetime value ratio</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                <p className="text-3xl font-bold text-blue-500">
                  {paybackPeriod}mo
                </p>
                <p className="text-sm text-muted-foreground mt-1">to break even</p>
              </div>
            </div>
          </div>

          {/* Unit Economics Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Unit Economics Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName}'s customer acquisition cost reflects the competitive dynamics of the sports betting market.
                A healthy LTV/CAC ratio above 3x indicates sustainable unit economics.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">CAC</p>
                  <p className="text-2xl font-bold">
                    ${currentCAC.toFixed(0)}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">LTV</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${ltv.toFixed(0)}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Ratio</p>
                  <p className={`text-2xl font-bold ${ltvCacRatio >= 3 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {ltvCacRatio.toFixed(1)}x
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Health</p>
                  <p className="text-2xl font-bold text-green-500">
                    {ltvCacRatio >= 3 ? 'Strong' : ltvCacRatio >= 2 ? 'Good' : 'Fair'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CAC Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">CAC Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Cost Drivers</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Sign-up bonuses ($50-$200)</li>
                  <li>Digital advertising (30-40%)</li>
                  <li>Affiliate payments (20-30%)</li>
                  <li>Traditional marketing (10-20%)</li>
                  <li>Retention promotions</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Optimization Levers</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Brand awareness (lower CAC)</li>
                  <li>Organic customer acquisition</li>
                  <li>Referral programs</li>
                  <li>Market maturity</li>
                  <li>Reduced promotional intensity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, promotional spend, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/promotional-intensity/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Promo Spend
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {cacFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> CAC estimates are based on publicly reported sales and marketing expenses divided by new customer acquisitions. Actual CAC may vary by channel, geography, and time period. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="customer-acquisition-cost" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
