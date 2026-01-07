import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Promotional Activity - Discounting & Trade Spend Analysis`,
    description: `${symbol} promotional activity and trade spending analysis. Track promotional depth, discounting trends, and pricing discipline for ${symbol}.`,
    keywords: [
      `${symbol} promotions`,
      `${symbol} promotional activity`,
      `${symbol} trade spending`,
      `${symbol} discounting`,
      `${symbol} promotional depth`,
      `${symbol} pricing discipline`,
    ],
    openGraph: {
      title: `${symbol} Promotional Activity | Discounting Analysis`,
      description: `Track ${symbol} promotional activity trends and trade spending metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/promotional-activity/${ticker.toLowerCase()}`,
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

export default async function PromotionalActivityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/promotional-activity/${ticker.toLowerCase()}`

  const promotionalActivityFaqs = [
    {
      question: `What is promotional activity for ${symbol}?`,
      answer: `Promotional activity for ${symbol} includes temporary price reductions, coupons, buy-one-get-one offers, rebates, and trade spending with retailers. These promotions aim to drive volume, trial, and competitive positioning but reduce average selling prices.`
    },
    {
      question: `Why does promotional activity matter for ${symbol} investors?`,
      answer: `Promotional activity directly impacts ${symbol}'s net price realization and margins. Heavy promotional activity signals competitive pressure or weak demand, while promotional discipline indicates brand strength and pricing power.`
    },
    {
      question: `How does ${symbol} balance volume and pricing?`,
      answer: `${symbol} uses promotional activity strategically to drive volume during peak seasons, compete with private label, gain trial, and clear inventory. However, excessive promotions can train consumers to wait for deals and erode brand value.`
    },
    {
      question: `What is trade spending for ${symbol}?`,
      answer: `Trade spending represents ${symbol}'s investments with retailers for shelf placement, promotional features, end-cap displays, and promotional support. This is a significant cost that impacts gross-to-net sales realization.`
    },
    {
      question: `How do investors analyze ${symbol} promotional trends?`,
      answer: `Investors track ${symbol}'s promotional depth (discount percentage), promotional frequency, trade spending as percentage of sales, and compare promotional activity to competitors to assess pricing power and brand health.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Promotional Activity', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Promotional Activity`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Promotional Activity - Discounting & Trade Spend Analysis`,
      description: `Comprehensive promotional activity analysis for ${symbol} (${companyName}) including discounting trends and trade spending.`,
      url: pageUrl,
      keywords: [`${symbol} promotions`, `${symbol} promotional activity`, `${symbol} trade spending`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(promotionalActivityFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Promotional Activity</Link>
            {' / '}
            <span>{symbol} Promotional Activity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Promotional Activity Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Discounting trends and pricing discipline</p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-rose-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Promotional Activity</h2>
            <p className="text-muted-foreground mb-4">
              Promotional activity is a critical lever for {companyName} to drive volume, compete for shelf space, and respond to competitive dynamics. However, excessive promotions can erode margins and weaken brand positioning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                <p className="text-lg font-bold">Drive Volume</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Risk</p>
                <p className="text-lg font-bold">Margin Erosion</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Goal</p>
                <p className="text-lg font-bold">Pricing Discipline</p>
              </div>
            </div>
          </div>

          {/* Types of Promotional Activity Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Promotional Activity</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Temporary Price Reductions</h3>
                    <p className="text-muted-foreground">
                      Direct price discounts for limited periods to drive volume spikes, clear inventory, or compete during peak promotional periods. Effectiveness measured by incremental volume versus baseline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎫</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Coupons & Rebates</h3>
                    <p className="text-muted-foreground">
                      Targeted discounts via digital or paper coupons, manufacturer rebates, and loyalty program rewards. Allows price discrimination and can drive trial without training all consumers to expect lower prices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Multi-buy Offers</h3>
                    <p className="text-muted-foreground">
                      Buy-one-get-one (BOGO), buy-two-get-one, or multi-pack promotions encourage larger basket sizes and pantry loading while providing perceived value to consumers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏪</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Trade Spending</h3>
                    <p className="text-muted-foreground">
                      Payments to retailers for shelf placement, promotional features in circulars, end-cap displays, and promotional support. Critical for maintaining distribution and visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Promotional Strategy Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Promotional Strategy Considerations</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">🎯 Strategic Promotions</h3>
                  <p className="text-muted-foreground">Well-timed promotions during peak consumption periods, new product launches, or competitive responses that drive incremental volume profitably.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">⚠️ Promotional Risks</h3>
                  <p className="text-muted-foreground">Training consumers to buy only on promotion, margin erosion, forward buying by retailers, and signaling weakness to competitors.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💪 Reducing Promotions</h3>
                  <p className="text-muted-foreground">Strong brands can reduce promotional intensity through brand building, innovation, and demonstrated value, improving net price realization.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">📊 Measuring ROI</h3>
                  <p className="text-muted-foreground">Tracking incremental volume, profitability, and long-term impact on baseline sales to ensure promotional efficiency and effectiveness.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Promotional Health Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Promotional Health Indicators</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Healthy Promotional Dynamics</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Declining promotional intensity</li>
                  <li>Improving net price realization</li>
                  <li>High ROI on promotions</li>
                  <li>Strategic promotional timing</li>
                  <li>Strong non-promoted sales</li>
                  <li>Effective trade spending</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Promotional Warning Signs</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Increasing promotional depth</li>
                  <li>Rising trade spending %</li>
                  <li>Weak baseline sales</li>
                  <li>Constant promotional pressure</li>
                  <li>Low non-promoted velocity</li>
                  <li>Ineffective promotional ROI</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Implications */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Implications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-green-500 mb-2">Positive Signals</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Reducing promotional activity</li>
                  <li>Improving pricing discipline</li>
                  <li>Strong non-promoted sales</li>
                  <li>Effective promotional ROI</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-2">Warning Signs</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Escalating promotional war</li>
                  <li>Margin compression from promos</li>
                  <li>Declining baseline sales</li>
                  <li>Heavy trade spending</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Pricing Power</h2>
            <p className="text-muted-foreground mb-6">Explore comprehensive pricing analysis and margin trends for {symbol}</p>
            <Link href={`/margins/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Margin Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {promotionalActivityFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
