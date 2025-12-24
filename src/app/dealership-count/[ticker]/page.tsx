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
    title: `${symbol} Dealership Count ${currentYear} - Auto Retail Network`,
    description: `${symbol} dealership count analysis: total rooftops, franchise portfolio, geographic footprint, acquisition strategy, and automotive retail expansion for ${currentYear}.`,
    keywords: [
      `${symbol} dealership count`,
      `${symbol} rooftops`,
      `${symbol} dealerships`,
      `${symbol} franchise network`,
      `${symbol} store count`,
      `${symbol} auto retail`,
    ],
    openGraph: {
      title: `${symbol} Dealership Count ${currentYear} | Auto Retail Network`,
      description: `Complete ${symbol} dealership count and franchise portfolio analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/dealership-count/${ticker.toLowerCase()}`,
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

export default async function DealershipCountPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/dealership-count/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `How many dealerships does ${symbol} operate?`,
      answer: `${companyName}'s dealership count represents the total number of automotive retail locations ("rooftops") across its network. This includes franchises for various manufacturers across multiple geographic markets. Dealership count is a key indicator of scale, market presence, and revenue potential. Check ${symbol}'s latest investor presentations for current rooftop count and brand portfolio details.`
    },
    {
      question: `Why is dealership count important for ${symbol}?`,
      answer: `Dealership count drives total addressable market, revenue scale, operating leverage, and geographic diversification for ${companyName}. A larger network provides negotiating power with manufacturers, enables shared services across locations, attracts talent, and creates acquisition opportunities. However, profitability per rooftop matters more than absolute count.`
    },
    {
      question: `How does ${symbol} grow its dealership count?`,
      answer: `${companyName} grows through acquisitions of existing dealerships, obtaining new franchise points from manufacturers, building greenfield locations, and expanding into new markets. Growth strategy balances brand portfolio (luxury vs mainstream), geographic expansion, market consolidation, and capital allocation returns.`
    },
    {
      question: `What is the ideal dealership portfolio for automotive retailers?`,
      answer: `Leading automotive retailers seek diverse brand portfolios (mixing luxury and volume brands), geographic diversification (reducing market concentration risk), strong manufacturers (reliable inventory and incentives), and markets with favorable demographics. ${symbol}'s brand mix and market selection impact long-term value creation.`
    },
    {
      question: `How does dealership count affect ${symbol} valuation?`,
      answer: `Investors value automotive retailers on metrics like revenue per rooftop, EBITDA per store, and same-store sales growth rather than absolute dealership count. Highly profitable, well-positioned dealerships create more value than a large network of underperforming stores. ${companyName}'s portfolio quality matters as much as quantity.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Dealership Count`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Dealership Count ${currentYear} - Auto Retail Network`,
    description: `Complete dealership count and franchise portfolio analysis for ${symbol} (${companyName}).`,
    url: pageUrl,
    keywords: [
      `${symbol} dealership count`,
      `${symbol} rooftops`,
      `${symbol} franchise network`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Dealership Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Dealership Count {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automotive retail network and franchise portfolio for {companyName}
          </p>

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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Dealership Count</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Dealership count (or "rooftops") represents the total number of automotive retail locations operated by {companyName}. This metric indicates scale, market presence, and potential for revenue generation across the company's geographic footprint and brand portfolio.
              </p>
              <p className="text-muted-foreground">
                While dealership count provides context for size, investors focus more on quality metrics like same-store sales growth, revenue per rooftop, EBITDA margins, and return on invested capital. A smaller network of highly profitable, well-positioned dealerships creates more shareholder value than a large portfolio of underperforming stores.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Dealership Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Total Rooftops</h3>
                <p className="text-muted-foreground text-sm">
                  The total number of dealership locations providing scale and market coverage.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Brand Portfolio Mix</h3>
                <p className="text-muted-foreground text-sm">
                  Diversity across luxury, premium, and mainstream brands balancing profitability and volume.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Geographic Footprint</h3>
                <p className="text-muted-foreground text-sm">
                  Market diversification reducing exposure to regional economic downturns.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Revenue Per Rooftop</h3>
                <p className="text-muted-foreground text-sm">
                  Productivity metric showing average revenue generation per dealership location.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Strategies</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-3">
              <div>
                <h3 className="font-bold mb-1">Acquisitions</h3>
                <p className="text-sm text-muted-foreground">
                  Purchasing existing dealerships in strategic markets, providing immediate scale and revenue.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">New Franchise Points</h3>
                <p className="text-sm text-muted-foreground">
                  Obtaining manufacturer approvals to open additional franchise locations for existing or new brands.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Geographic Expansion</h3>
                <p className="text-sm text-muted-foreground">
                  Entering new markets to diversify revenue sources and reduce regional concentration risk.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Portfolio Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Divesting underperforming stores while acquiring high-quality franchises to improve overall portfolio returns.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access complete automotive metrics, financial analysis, and AI-powered insights
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Dealership count information should be verified from company investor relations materials. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
