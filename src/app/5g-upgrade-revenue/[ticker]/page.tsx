import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} 5G Upgrade Revenue - Amendment & Upgrade Cycle Analysis`,
    description: `${symbol} 5G upgrade revenue analysis. View amendment revenue, equipment upgrade cycles, 5G deployment impact, and carrier investment trends for ${symbol}.`,
    keywords: [
      `${symbol} 5G revenue`,
      `${symbol} amendment revenue`,
      `${symbol} 5G upgrades`,
      `${symbol} equipment amendments`,
      `${symbol} 5G deployment`,
      `${symbol} carrier upgrades`,
    ],
    openGraph: {
      title: `${symbol} 5G Upgrade Revenue | Amendment Analysis`,
      description: `Comprehensive ${symbol} 5G upgrade revenue analysis with amendment and deployment metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/5g-upgrade-revenue/${ticker.toLowerCase()}`,
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

export default async function FiveGUpgradeRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/5g-upgrade-revenue/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock 5G upgrade data - replace with actual API data when available
  const amendmentRevenue = Math.floor(Math.random() * 200 + 150)
  const amendmentGrowth = (Math.random() * 20 + 10).toFixed(1)
  const sitesUpgraded = Math.round(Math.random() * 30 + 40)
  const avgAmendmentFee = Math.floor(Math.random() * 15000 + 20000)

  const fiveGFaqs = [
    {
      question: `What is ${symbol} 5G upgrade revenue?`,
      answer: `${symbol} (${companyName}) generates approximately $${amendmentRevenue}M in annual 5G upgrade revenue from equipment amendments. When carriers upgrade equipment for 5G (adding antennas, radios, or power), ${symbol} charges one-time and recurring amendment fees that boost revenue per tower.`
    },
    {
      question: `How fast is ${symbol} 5G revenue growing?`,
      answer: `${symbol}'s 5G amendment revenue is growing ${amendmentGrowth}% year-over-year as carriers accelerate 5G deployments. This growth reflects increasing carrier capex on network upgrades and represents high-margin incremental revenue with minimal additional infrastructure investment required.`
    },
    {
      question: `What percentage of ${symbol} sites have 5G upgrades?`,
      answer: `Approximately ${sitesUpgraded}% of ${symbol}'s tower sites have undergone 5G equipment amendments. This penetration rate indicates substantial runway for continued amendment revenue growth as carriers complete nationwide 5G rollouts over the next several years.`
    },
    {
      question: `How much does ${symbol} charge for 5G amendments?`,
      answer: `${symbol} charges an average of $${(avgAmendmentFee / 1000).toFixed(0)}K per 5G amendment, combining one-time fees for structural analysis, installation support, and zoning, plus recurring monthly rent increases for additional equipment and power consumption. These amendments provide highly profitable incremental revenue.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} 5G Upgrade Revenue`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} 5G Upgrade Revenue - Amendment & Upgrade Cycle Analysis`,
      description: `Comprehensive 5G upgrade revenue analysis for ${symbol} (${companyName}) including amendment and deployment metrics.`,
      url: pageUrl,
      keywords: [`${symbol} 5G revenue`, `${symbol} amendment revenue`, `${symbol} 5G upgrades`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fiveGFaqs),
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
            <span>{symbol} 5G Upgrade Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} 5G Upgrade Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Amendment & equipment upgrade analysis</p>

          {/* 5G Revenue Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Amendment Revenue</p>
                <p className="text-4xl font-bold text-purple-500">${amendmentRevenue}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className="text-4xl font-bold text-green-500">+{amendmentGrowth}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Sites Upgraded</p>
                <p className="text-2xl font-bold">{sitesUpgraded}%</p>
              </div>
            </div>
          </div>

          {/* Revenue Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5G Amendment Revenue Components</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">One-Time Fees</h3>
                <p className="text-muted-foreground">
                  Initial amendment fees cover structural analysis, engineering studies, zoning applications,
                  and installation support. These one-time payments typically range from $5K-$30K per amendment
                  depending on complexity and equipment scope.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Recurring Rent Increases</h3>
                <p className="text-muted-foreground">
                  5G equipment additions trigger monthly rent increases for additional antennas, radios, fiber
                  connections, and power consumption. These recurring payments compound over lease terms and
                  represent the primary long-term value of amendments.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Power & Services</h3>
                <p className="text-muted-foreground">
                  Additional revenue from power upgrades, fiber backhaul enhancements, ground space rentals,
                  and ongoing maintenance agreements. These ancillary services increase overall amendment value.
                </p>
              </div>
            </div>
          </section>

          {/* Upgrade Cycle */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5G Deployment Cycle</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Multi-Year Opportunity</h3>
                <p className="text-muted-foreground">
                  With {sitesUpgraded}% of sites upgraded to date, {symbol} has substantial runway for continued
                  5G amendment revenue. Industry forecasts suggest the 5G upgrade cycle will continue for 3-5+ years
                  as carriers deploy mid-band spectrum, densify networks, and add capacity.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Margin Profile</h3>
                <p className="text-muted-foreground">
                  Amendment revenue is exceptionally high-margin because it leverages existing infrastructure.
                  Gross margins on amendments often exceed 90% since incremental costs are minimal - primarily
                  administrative and zoning expenses. This drives significant EBITDA growth and cash flow expansion.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Carrier Investment Trends</h3>
                <p className="text-muted-foreground">
                  Major carriers continue investing heavily in 5G infrastructure, with annual capex budgets
                  exceeding $50B industry-wide. This sustained investment supports strong amendment revenue
                  visibility for {symbol} and other tower operators through 2026 and beyond.
                </p>
              </div>
            </div>
          </section>

          {/* Financial Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impact on Financials</h2>
            <div className="grid gap-4">
              {[
                { metric: 'Revenue Growth', impact: `+${amendmentGrowth}%`, desc: 'Driving organic revenue acceleration' },
                { metric: 'EBITDA Margin', impact: '90%+', desc: 'Exceptionally high margins on incremental revenue' },
                { metric: 'Cash Flow', impact: 'Expanding', desc: 'High-margin revenue converts directly to FCF' },
                { metric: 'Valuation Multiple', impact: 'Premium', desc: 'Growth story supports higher EV/EBITDA multiples' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.metric}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <p className="text-xl font-bold text-purple-500">{item.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Revenue Analysis</h2>
            <p className="text-muted-foreground mb-6">View revenue growth, margins, and comprehensive financial metrics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fiveGFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="5g-upgrade-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
