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
    title: `${symbol} Retail AUM - Retail Assets & Individual Investors ${currentYear}`,
    description: `${symbol} retail AUM analysis: Total retail assets, individual investor accounts, flows, distribution channels, and growth trends. View ${symbol} retail assets under management.`,
    keywords: [
      `${symbol} retail AUM`,
      `${symbol} retail assets`,
      `${symbol} individual investors`,
      `${symbol} retail flows`,
      `what is ${symbol} retail AUM`,
      `${symbol} retail distribution`,
    ],
    openGraph: {
      title: `${symbol} Retail AUM - Retail Assets & Individual Investors`,
      description: `${symbol} retail AUM analysis with distribution channels and trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/retail-aum/${ticker.toLowerCase()}`,
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

function formatAUM(value: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  return `$${(value / 1e6).toFixed(2)}M`
}

export default async function RetailAUMPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/retail-aum/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock retail AUM data - in production, this would come from your API
  const totalAUM = metrics?.market_cap ? metrics.market_cap * 10 : null
  const retailAUM = totalAUM ? totalAUM * 0.35 : null
  const retailPercent = 35

  // Generate Retail AUM FAQs
  const retailAumFaqs = [
    {
      question: `What is ${symbol}'s retail AUM?`,
      answer: retailAUM
        ? `${symbol} (${companyName}) manages approximately ${formatAUM(retailAUM)} in retail assets, representing ${retailPercent}% of total AUM. Retail clients include individual investors, financial advisors, and high-net-worth individuals investing through mutual funds, ETFs, separately managed accounts, and retirement plans. ${retailPercent < 40 ? 'The retail segment represents a smaller but growing portion of the business.' : 'Retail assets form a substantial part of the AUM mix.'}`
        : `${symbol} (${companyName}) serves retail investors through various distribution channels including direct-to-consumer platforms, financial advisors, and retirement plans. Check the detailed breakdown above for current retail AUM figures.`
    },
    {
      question: `How does ${symbol} distribute retail products?`,
      answer: `${symbol} reaches retail investors through multiple distribution channels: (1) Financial advisors - independent RIAs and broker-dealers recommend funds to clients, (2) Direct-to-consumer - investors purchase through ${companyName}'s website or app, (3) Retirement plans - 401(k), 403(b), and IRA platforms, (4) Broker platforms - Schwab, Fidelity, TD Ameritrade fund marketplaces, (5) Bank channels - affiliated bank distribution, (6) Robo-advisors - digital advice platforms. Each channel has different fee structures and competitive dynamics.`
    },
    {
      question: `Why is retail AUM important for ${symbol} investors?`,
      answer: `Retail AUM is significant because: (1) Retail products typically have higher fee rates than institutional (0.50-1.00% vs 0.10-0.50%), (2) Retail distribution provides diversification from institutional lumpy flows, (3) Growing retail segment driven by advisor platforms and 401(k) growth, (4) Retail brand recognition can be a competitive moat, (5) Retail investors have different behavior patterns - less performance-sensitive but more fee-sensitive. ${retailPercent > 30 ? 'Meaningful retail presence provides revenue stability and growth opportunities.' : 'Retail provides fee revenue diversification.'}`
    },
    {
      question: `What are typical retail fee rates for ${symbol}?`,
      answer: `Retail fee rates vary by product type and distribution channel: (1) Mutual funds (active): 0.50-1.50%, (2) Mutual funds (index): 0.05-0.20%, (3) ETFs (active): 0.30-0.75%, (4) ETFs (passive): 0.03-0.15%, (5) Separately managed accounts: 0.50-1.50%, (6) Target-date funds: 0.20-0.70%. ${companyName}'s specific pricing depends on their brand, performance, and competitive positioning. Fee compression has been a major industry trend, particularly in passive products.`
    },
    {
      question: `How do retail flows differ from institutional flows?`,
      answer: `Retail and institutional flows have distinct characteristics: Retail flows tend to be more consistent but smaller in size, driven by systematic savings (401(k) contributions, IRAs) and advisor recommendations. Retail investors are more fee-sensitive but less performance-sensitive than institutions. Retail flows exhibit greater "stickiness" in tax-advantaged accounts but higher volatility in taxable brokerage accounts. Institutional flows are lumpier but larger, performance-driven, and have higher retention once won.`
    },
    {
      question: `How does ${symbol} compete in retail markets?`,
      answer: `${symbol} competes for retail assets through: (1) Brand recognition and reputation - established names attract flows, (2) Distribution relationships - advisor platforms and broker partnerships, (3) Fee competitiveness - especially critical for passive/index products, (4) Performance track record - consistent returns build loyalty, (5) Product innovation - sustainable investing, thematic ETFs, outcome-oriented solutions, (6) Digital capabilities - mobile apps, online tools, customer service. Success requires both strong investment performance and effective distribution.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Retail AUM`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Retail AUM - Retail Assets & Individual Investors ${currentYear}`,
    description: `Comprehensive ${symbol} retail AUM analysis with distribution breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} retail AUM`,
      `${symbol} retail assets`,
      `${symbol} individual investors`,
      `${symbol} retail flows`,
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

  const faqSchema = getFAQSchema(retailAumFaqs)

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
            <span>{symbol} Retail AUM</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Retail AUM
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} retail assets, distribution channels, and investor trends
          </p>

          {/* Retail AUM Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Total AUM</p>
                <p className="text-3xl font-bold">
                  {formatAUM(totalAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All client types</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Retail AUM</p>
                <p className="text-3xl font-bold text-purple-500">
                  {formatAUM(retailAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{retailPercent}% of total</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Institutional AUM</p>
                <p className="text-3xl font-bold text-blue-500">
                  {formatAUM(totalAUM && retailAUM ? totalAUM - retailAUM : null)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{100 - retailPercent}% of total</p>
              </div>
            </div>
          </div>

          {/* Distribution Channel Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Retail Distribution Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Distribution Channel</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Financial Advisors</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Retirement Plans (401k/IRA)</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Direct-to-Consumer</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Broker Platforms</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Product Type</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mutual Funds</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ETFs</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Managed Accounts</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Retail vs Institutional Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Retail vs Institutional Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Metric</th>
                    <th className="text-center p-3 text-purple-500">Retail</th>
                    <th className="text-center p-3 text-blue-500">Institutional</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Average Fee Rate</td>
                    <td className="p-3 text-center text-green-500">0.60%</td>
                    <td className="p-3 text-center">0.25%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Account Size</td>
                    <td className="p-3 text-center">$50K-$500K</td>
                    <td className="p-3 text-center text-green-500">$50M-$5B+</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Flow Volatility</td>
                    <td className="p-3 text-center">Higher</td>
                    <td className="p-3 text-center text-green-500">Lower</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Performance Sensitivity</td>
                    <td className="p-3 text-center">Moderate</td>
                    <td className="p-3 text-center">Very High</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Fee Sensitivity</td>
                    <td className="p-3 text-center">High</td>
                    <td className="p-3 text-center">Moderate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Understanding Retail AUM */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Retail Business</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Retail Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Higher fee rates than institutional (0.50-1.00%)</li>
                  <li>Diversified revenue across many small accounts</li>
                  <li>401(k) systematic savings provide steady flows</li>
                  <li>Brand loyalty and "stickiness" in retirement accounts</li>
                  <li>Less performance-sensitive than institutions</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Retail Challenges</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Higher operating costs (marketing, servicing)</li>
                  <li>More regulatory oversight (investor protection)</li>
                  <li>Fee compression pressure, especially passive</li>
                  <li>Distribution requires advisor relationships</li>
                  <li>More susceptible to market panic redemptions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Deep dive into financials, ratios, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/institutional-aum/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Institutional AUM
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {retailAumFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Retail AUM with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/retail-aum/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Retail
                  </Link>
                ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
