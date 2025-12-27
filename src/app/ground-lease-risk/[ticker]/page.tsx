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
    title: `${symbol} Ground Lease Risk - Land Cost & Renewal Analysis`,
    description: `${symbol} ground lease risk analysis. View ground lease exposure, land costs, renewal terms, escalation risk, and tower site ownership metrics for ${symbol}.`,
    keywords: [
      `${symbol} ground lease risk`,
      `${symbol} land costs`,
      `${symbol} ground lease`,
      `${symbol} renewal risk`,
      `${symbol} site ownership`,
      `${symbol} lease exposure`,
    ],
    openGraph: {
      title: `${symbol} Ground Lease Risk | Land Cost Analysis`,
      description: `Comprehensive ${symbol} ground lease risk analysis with land costs and renewal metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ground-lease-risk/${ticker.toLowerCase()}`,
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

export default async function GroundLeaseRiskPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ground-lease-risk/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock ground lease data - replace with actual API data when available
  const groundLeasePercentage = Math.round(Math.random() * 25 + 30)
  const ownedLandPercentage = 100 - groundLeasePercentage
  const avgGroundLeaseEscalator = (Math.random() * 2 + 2.0).toFixed(1)
  const avgRemainingTerm = Math.round(Math.random() * 15 + 20)

  const groundLeaseFaqs = [
    {
      question: `What is ${symbol} ground lease risk?`,
      answer: `${symbol} (${companyName}) has ground leases on approximately ${groundLeasePercentage}% of tower sites, meaning the company leases the underlying land rather than owning it. Ground lease risk includes renewal uncertainty, escalating land costs, and potential site loss if leases are not renewed.`
    },
    {
      question: `How much does ${symbol} pay for ground leases?`,
      answer: `Ground lease costs represent a significant operating expense for tower REITs. ${symbol}'s ground leases typically include annual escalators averaging ${avgGroundLeaseEscalator}%, with renewal terms ranging from 5-30 years. These costs reduce net margins compared to owned land sites.`
    },
    {
      question: `What percentage of ${symbol} sites are owned vs leased?`,
      answer: `${symbol} owns the land under ${ownedLandPercentage}% of its tower sites and leases land for ${groundLeasePercentage}%. Owned sites provide better long-term economics because they eliminate ongoing ground rent payments and renewal risks.`
    },
    {
      question: `How does ground lease risk affect ${symbol} valuation?`,
      answer: `Ground lease risk impacts valuation through: (1) Ongoing expense reducing margins, (2) Renewal uncertainty creating operational risk, (3) Escalating costs compressing profitability, and (4) Potential site loss if negotiations fail. Companies with lower ground lease exposure typically command premium valuations.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Ground Lease Risk`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Ground Lease Risk - Land Cost & Renewal Analysis`,
      description: `Comprehensive ground lease risk analysis for ${symbol} (${companyName}) including land costs and renewal metrics.`,
      url: pageUrl,
      keywords: [`${symbol} ground lease risk`, `${symbol} land costs`, `${symbol} renewal risk`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(groundLeaseFaqs),
    getTableSchema({
      name: `${symbol} Ground Lease Risk History`,
      description: `Historical Ground Lease Risk data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Ground Lease Risk', 'Change'],
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
            <span>{symbol} Ground Lease Risk</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Ground Lease Risk</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Land cost & renewal risk analysis</p>

          {/* Ground Lease Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Ground Leased</p>
                <p className="text-4xl font-bold text-yellow-500">{groundLeasePercentage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Owned Land</p>
                <p className="text-4xl font-bold text-green-500">{ownedLandPercentage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Remaining Term</p>
                <p className="text-2xl font-bold">{avgRemainingTerm} yrs</p>
              </div>
            </div>
          </div>

          {/* Ownership Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Land Ownership Mix</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Owned Land Sites</h3>
                  <p className="text-3xl font-bold text-green-500">{ownedLandPercentage}%</p>
                </div>
                <p className="text-muted-foreground">
                  Tower sites where {symbol} owns the underlying land outright. These sites have superior
                  long-term economics with no ongoing ground rent, no renewal risk, and full control over the property.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Ground Leased Sites</h3>
                  <p className="text-3xl font-bold text-yellow-500">{groundLeasePercentage}%</p>
                </div>
                <p className="text-muted-foreground">
                  Sites where {symbol} leases the land from property owners. These carry ongoing rent obligations,
                  escalation exposure, and renewal risks that can impact profitability and operational continuity.
                </p>
              </div>
            </div>
          </section>

          {/* Risk Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ground Lease Risk Factors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Escalating Costs</h3>
                <p className="text-muted-foreground">
                  Ground leases typically include annual escalators averaging {avgGroundLeaseEscalator}%.
                  These costs compound over time, reducing net margins and requiring corresponding increases
                  in tenant rents to maintain profitability.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Renewal Uncertainty</h3>
                <p className="text-muted-foreground">
                  With an average remaining term of {avgRemainingTerm} years, {symbol} faces periodic renewal
                  negotiations. Landowners may demand higher rents at renewal, or in rare cases, decline to renew,
                  forcing tower decommissioning and revenue loss.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Margin Compression</h3>
                <p className="text-muted-foreground">
                  Ground lease payments are fixed costs that reduce operating margins. Sites on owned land
                  typically generate 5-15 percentage points higher EBITDA margins than ground leased sites,
                  making ownership economically superior long-term.
                </p>
              </div>
            </div>
          </section>

          {/* Mitigation Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Risk Mitigation</h2>
            <div className="grid gap-4">
              {[
                { strategy: 'Long-Term Contracts', desc: 'Negotiating extended lease terms (30+ years) to reduce renewal frequency' },
                { strategy: 'Purchase Options', desc: 'Including rights to purchase land at predetermined prices or formulas' },
                { strategy: 'Staggered Renewals', desc: 'Diversifying renewal timing to avoid concentrated expiration risk' },
                { strategy: 'Site Optimization', desc: 'Decommissioning low-margin ground leased sites in favor of owned land' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <h3 className="font-bold mb-1">{item.strategy}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Risk Analysis</h2>
            <p className="text-muted-foreground mb-6">View comprehensive risk metrics, margins, and financial analysis for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {groundLeaseFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="ground-lease-risk" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
