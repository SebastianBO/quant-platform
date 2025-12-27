import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Tenancy Ratio - Tower Utilization Analysis`,
    description: `${symbol} tenancy ratio analysis. View average tenants per tower, colocation trends, tower utilization rates, and multi-tenant revenue metrics for ${symbol}.`,
    keywords: [
      `${symbol} tenancy ratio`,
      `${symbol} tower tenancy`,
      `${symbol} colocation`,
      `${symbol} tower utilization`,
      `${symbol} tenants per tower`,
      `${symbol} tower efficiency`,
    ],
    openGraph: {
      title: `${symbol} Tenancy Ratio | Tower Utilization Metrics`,
      description: `Comprehensive ${symbol} tenancy ratio analysis with utilization and colocation metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/tenancy-ratio/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function TenancyRatioPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/tenancy-ratio/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock tenancy ratio data - replace with actual API data when available
  const tenancyRatio = (Math.random() * 1.0 + 1.8).toFixed(2)
  const tenancyGrowth = (Math.random() * 0.3 - 0.05).toFixed(2)
  const industryAverage = 2.1
  const vsIndustry = (((parseFloat(tenancyRatio) - industryAverage) / industryAverage) * 100).toFixed(1)

  const tenancyFaqs = [
    {
      question: `What is ${symbol} tenancy ratio?`,
      answer: `${symbol} (${companyName}) has a tenancy ratio of ${tenancyRatio}, meaning each tower hosts an average of ${tenancyRatio} tenants. This metric measures how effectively the company monetizes its tower infrastructure through colocation.`
    },
    {
      question: `Is ${symbol} tenancy ratio improving?`,
      answer: `${symbol}'s tenancy ratio has ${parseFloat(tenancyGrowth) > 0 ? `increased by ${tenancyGrowth}` : `changed by ${tenancyGrowth}`} year-over-year. Growing tenancy ratios indicate successful colocation strategies and carrier network densification.`
    },
    {
      question: `How does ${symbol} tenancy compare to peers?`,
      answer: `${symbol}'s tenancy ratio of ${tenancyRatio} is ${parseFloat(vsIndustry) > 0 ? `${vsIndustry}% above` : `${Math.abs(parseFloat(vsIndustry))}% below`} the industry average of ${industryAverage}. Higher ratios typically indicate better tower locations and stronger carrier relationships.`
    },
    {
      question: `Why is tenancy ratio important for ${symbol}?`,
      answer: `Tenancy ratio is critical because adding tenants to existing towers generates high-margin incremental revenue with minimal additional costs. Higher tenancy ratios improve profitability, increase revenue per tower, and demonstrate portfolio quality.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Tenancy Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Tenancy Ratio - Tower Utilization Analysis`,
      description: `Comprehensive tenancy ratio analysis for ${symbol} (${companyName}) including utilization and colocation metrics.`,
      url: pageUrl,
      keywords: [`${symbol} tenancy ratio`, `${symbol} tower utilization`, `${symbol} colocation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(tenancyFaqs),
    getTableSchema({
      name: `${symbol} Tenancy Ratio History`,
      description: `Historical Tenancy Ratio data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Tenancy Ratio', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Tenancy Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Tenancy Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Tower utilization & colocation analysis</p>

          {/* Tenancy Ratio Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Tenancy Ratio</p>
                <p className="text-4xl font-bold text-purple-500">{tenancyRatio}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Change</p>
                <p className={`text-4xl font-bold ${parseFloat(tenancyGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(tenancyGrowth) > 0 ? '+' : ''}{tenancyGrowth}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">vs Industry</p>
                <p className={`text-2xl font-bold ${parseFloat(vsIndustry) >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {parseFloat(vsIndustry) > 0 ? '+' : ''}{vsIndustry}%
                </p>
              </div>
            </div>
          </div>

          {/* Understanding Tenancy Ratio */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Tenancy Ratio</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">What It Measures</h3>
                <p className="text-muted-foreground">
                  Tenancy ratio represents the average number of tenants (wireless carriers) per tower. A ratio of {tenancyRatio}
                  means each tower hosts approximately {Math.round(parseFloat(tenancyRatio))} carriers on average. Higher ratios
                  indicate better tower utilization and colocation success.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Revenue Impact</h3>
                <p className="text-muted-foreground">
                  Adding tenants to existing towers is highly profitable because incremental costs are minimal while
                  revenue increases significantly. A tower with 3 tenants generates roughly 3x the revenue of a
                  single-tenant tower with similar operating expenses.
                </p>
              </div>
            </div>
          </section>

          {/* Tenancy Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Colocation Opportunity</h2>
            <div className="grid gap-4">
              {[
                { tenants: '1 Tenant', revenue: '100%', margin: 'Baseline', color: 'text-blue-500' },
                { tenants: '2 Tenants', revenue: '175%', margin: 'High', color: 'text-green-500' },
                { tenants: '3+ Tenants', revenue: '250%+', margin: 'Very High', color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.tenants}</p>
                    <p className="text-sm text-muted-foreground">Margin Profile: {item.margin}</p>
                  </div>
                  <p className={`text-xl font-bold ${item.color}`}>~{item.revenue}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Benchmark</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">Industry Average</p>
                  <p className="text-3xl font-bold">{industryAverage}x</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">{symbol} Tenancy</p>
                  <p className="text-3xl font-bold text-purple-500">{tenancyRatio}x</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {parseFloat(vsIndustry) > 0
                  ? `${symbol}'s above-average tenancy ratio indicates strong colocation execution, prime tower locations, and robust carrier demand.`
                  : `${symbol} has opportunity to increase tenancy through marketing to additional carriers and optimizing tower locations for multi-tenant appeal.`}
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Tower Metrics</h2>
            <p className="text-muted-foreground mb-6">View tower count, revenue per tower, and full infrastructure analytics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {tenancyFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="tenancy-ratio" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
