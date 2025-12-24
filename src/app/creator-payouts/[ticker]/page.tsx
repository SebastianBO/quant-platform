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
    title: `${symbol} Creator Payouts - Content Creator Revenue Share ${currentYear}`,
    description: `${symbol} creator payouts: Total creator payments, revenue share programs, creator economics, and platform ecosystem. Analyze ${symbol}'s creator monetization.`,
    keywords: [
      `${symbol} creator payouts`,
      `${symbol} creator revenue`,
      `${symbol} creator payments`,
      `${symbol} revenue share`,
      `${symbol} creator program`,
      `${symbol} creator economy`,
    ],
    openGraph: {
      title: `${symbol} Creator Payouts - Revenue Share Analysis`,
      description: `${symbol} creator payouts analysis with revenue share programs and creator economics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/creator-payouts/${ticker.toLowerCase()}`,
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

export default async function CreatorPayoutsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/creator-payouts/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const creatorPayoutsFaqs = [
    {
      question: `What are ${symbol}'s creator payouts?`,
      answer: `${symbol} (${companyName}) creator payouts represent the total revenue shared with content creators on the platform. This includes ad revenue sharing, subscription splits, tipping, and other monetization programs. Creator payouts are a critical investment for ${sector || 'technology'} platforms to attract and retain quality content.`
    },
    {
      question: `How does ${symbol}'s creator revenue share work?`,
      answer: `${symbol} typically shares a percentage of advertising revenue, subscription fees, or other monetization with eligible creators. Common models include 55-70% ad revenue share, subscription revenue splits, and bonus programs for top performers. The exact structure varies by platform and creator tier.`
    },
    {
      question: `Why are creator payouts important for ${symbol}?`,
      answer: `Creator payouts are essential for ${symbol} because they incentivize high-quality content creation, attract top talent, drive platform engagement, and create network effects. Higher payouts can increase content supply, but they also reduce platform margins, making this a key balancing act for management.`
    },
    {
      question: `How much does ${symbol} pay creators?`,
      answer: `${symbol}'s total creator payouts vary based on platform revenue, creator program structure, and number of monetized creators. Some platforms disclose annual payout totals in earnings reports or investor presentations. The average payout per creator can range from hundreds to millions of dollars depending on content quality and reach.`
    },
    {
      question: `What is the revenue share percentage for ${symbol}?`,
      answer: `${symbol}'s revenue share percentage determines what portion of monetization goes to creators versus the platform. Industry standards range from 50-70% for creators, with platforms retaining 30-50%. Higher creator shares attract more content but reduce platform margins. This ratio significantly impacts profitability.`
    },
    {
      question: `How do creator payouts affect ${symbol}'s profitability?`,
      answer: `Creator payouts are a major expense for ${symbol}, directly impacting gross margins and profitability. While essential for content supply, they reduce the platform's revenue retention. Investors should monitor the payout ratio (payouts / revenue) to understand margin trends and profitability potential.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Creator Payouts`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Creator Payouts - Revenue Share Analysis ${currentYear}`,
    description: `Complete ${symbol} creator payouts analysis with revenue share programs and creator economics.`,
    url: pageUrl,
    keywords: [
      `${symbol} creator payouts`,
      `${symbol} creator revenue`,
      `${symbol} revenue share`,
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

  const faqSchema = getFAQSchema(creatorPayoutsFaqs)

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
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Creator Payouts</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Creator Payouts
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} content creator revenue share and economics
          </p>

          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Creator Revenue Share</p>
              <p className="text-4xl font-bold mb-4">Payout Metrics</p>
              <p className="text-muted-foreground">
                Track creator economics for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Creator Payouts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-pink-500 mb-2">What Payouts Include</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Ad revenue sharing</li>
                  <li>Subscription splits</li>
                  <li>Tips and donations</li>
                  <li>Bonus programs</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-rose-500 mb-2">Why Payouts Matter</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Attracts quality creators</li>
                  <li>Drives content supply</li>
                  <li>Impacts gross margins</li>
                  <li>Affects profitability</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Creator Economics Model</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Revenue Share Structure</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded">
                      <span className="text-sm">Creator Share</span>
                      <span className="font-bold text-pink-500">55-70%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded">
                      <span className="text-sm">Platform Share</span>
                      <span className="font-bold text-blue-500">30-45%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Payout Calculation Example</p>
                  <p className="text-sm text-muted-foreground">
                    If {symbol} generates $1B in monetizable revenue with 60% creator share:
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Creator Payouts = $1,000,000,000 × 60% = $600 million
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Platform Revenue = $1,000,000,000 × 40% = $400 million
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impact on Business Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Content Supply</h3>
                <p className="text-sm text-muted-foreground">
                  Higher payouts attract more creators and increase content volume and quality
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Gross Margins</h3>
                <p className="text-sm text-muted-foreground">
                  Payout percentage directly impacts gross margins and profitability metrics
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Position</h3>
                <p className="text-sm text-muted-foreground">
                  Attractive payouts help win creator mindshare vs competing platforms
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Creator Payout Programs</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad Revenue Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  Most common model where creators earn a percentage of ads shown on their content
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Subscription Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Creators receive portion of subscriber fees or membership revenue
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Creator Funds</h3>
                <p className="text-sm text-muted-foreground">
                  Direct payments from platform fund based on views, engagement, or other metrics
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Tips & Donations</h3>
                <p className="text-sm text-muted-foreground">
                  Direct payments from users to creators, platform may take small commission
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600/20 to-pink-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, user metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Analysis
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {creatorPayoutsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Creator payout data is based on company disclosures and public information. Actual payout structures may vary. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
