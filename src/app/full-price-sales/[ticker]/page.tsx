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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Full Price vs Markdown ${currentYear} - Pricing Strategy`,
    description: `${symbol} full-price sales vs markdown analysis for ${currentYear}. Track pricing power, promotional activity, and margin impact.`,
    keywords: [
      `${symbol} full price sales`,
      `${symbol} markdown`,
      `${symbol} pricing strategy`,
      `${symbol} promotional activity`,
      `${symbol} pricing power`,
      `${symbol} discount strategy`,
    ],
    openGraph: {
      title: `${symbol} Full Price vs Markdown ${currentYear} | Pricing Analysis`,
      description: `Complete ${symbol} pricing analysis with full-price sales mix and markdown trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/full-price-sales/${ticker.toLowerCase()}`,
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

export default async function FullPriceSalesPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/full-price-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate pricing metrics (simulated)
  const revenue = metrics?.revenue || 0
  const grossMargin = metrics?.gross_margin || 0.40
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedFullPricePercentage = sector === 'Consumer Discretionary' ? 0.65 : 0.75
  const estimatedMarkdownPercentage = 1 - estimatedFullPricePercentage

  // Generate pricing FAQs
  const pricingFaqs = [
    {
      question: `What percentage of ${symbol}'s sales are full-price?`,
      answer: `Full-price sales indicate strong brand power and demand. Based on ${sector || 'industry'} benchmarks, ${symbol}'s estimated full-price sales represent ${(estimatedFullPricePercentage * 100).toFixed(0)}% of revenue, with ${(estimatedMarkdownPercentage * 100).toFixed(0)}% sold at markdown or promotional prices.`
    },
    {
      question: `How do markdowns affect ${symbol}'s profitability?`,
      answer: `Markdowns directly impact margins. With a gross margin of ${(grossMargin * 100).toFixed(1)}%, ${symbol}'s profitability depends on minimizing discounts while clearing inventory. Higher full-price sales improve operating leverage and bottom-line results.`
    },
    {
      question: `Is ${symbol} improving its full-price sales mix?`,
      answer: `Improving full-price mix indicates stronger brand demand, better inventory management, and reduced promotional dependency. ${symbol}'s revenue growth of ${(revenueGrowth * 100).toFixed(1)}% should be evaluated alongside pricing power trends.`
    },
    {
      question: `What drives ${symbol}'s need for markdowns?`,
      answer: `Common markdown drivers include excess inventory, seasonal clearance, competitive pricing pressure, weak demand, and strategic promotions to drive traffic. ${companyName}'s markdown strategy balances inventory turnover with margin protection.`
    },
    {
      question: `How does ${symbol} compare to competitors on pricing?`,
      answer: `${sector === 'Consumer Discretionary' ? 'Leading retailers typically achieve 60-70% full-price sales' : 'Full-price mix varies significantly by industry'}. Monitor ${symbol}'s promotional cadence relative to peers to assess competitive pricing dynamics.`
    },
    {
      question: `Why is full-price selling important for ${symbol}?`,
      answer: `Full-price sales maximize margins, validate brand strength, reduce inventory risk, and improve cash flow predictability. For ${symbol}, sustaining healthy full-price ratios is critical for long-term profitability and shareholder returns.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Full Price Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Full Price vs Markdown ${currentYear} - Pricing Strategy`,
    description: `Complete pricing analysis for ${symbol} (${companyName}) with full-price sales mix and markdown trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} full price sales`,
      `${symbol} markdown`,
      `${symbol} pricing strategy`,
      `${symbol} pricing power`,
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

  const faqSchema = getFAQSchema(pricingFaqs)

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
            <span>{symbol} Full Price Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Full Price vs Markdown
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pricing strategy and promotional mix analysis for {companyName}
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

          {/* Pricing Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Pricing Mix Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <p className="text-sm text-muted-foreground">Est. Full-Price Sales</p>
                <p className="text-3xl font-bold text-green-500">{(estimatedFullPricePercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Higher Margins</p>
              </div>
              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <p className="text-sm text-muted-foreground">Est. Markdown Sales</p>
                <p className="text-3xl font-bold text-red-500">{(estimatedMarkdownPercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Lower Margins</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Gross Margin</p>
                <p className="text-3xl font-bold">{(grossMargin * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Overall</p>
              </div>
            </div>
          </section>

          {/* Pricing Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Pricing & Promotional Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s pricing approach balances multiple objectives:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Full-Price Selling:</strong> Maximize margins through strong brand positioning and demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><strong>Strategic Promotions:</strong> Targeted discounts to drive traffic and acquire customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Seasonal Clearance:</strong> End-of-season markdowns to refresh inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span><strong>Competitive Matching:</strong> Price adjustments to remain competitive in key categories</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Monitor {symbol} Pricing Power</h2>
            <p className="text-muted-foreground mb-6">
              Track full-price trends, promotional activity, and margin impact
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Margin Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pricingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Full-price sales estimates are based on industry benchmarks. Actual pricing mix varies by company and season. Consult earnings calls and investor presentations for specific promotional strategies and pricing trends.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="full-price-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
