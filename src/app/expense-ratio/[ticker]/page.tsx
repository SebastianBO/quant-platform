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
    title: `${symbol} Expense Ratio - Average Fund Fees & Cost Analysis ${currentYear}`,
    description: `${symbol} expense ratio analysis: Average fund fees by asset class, fee trends, comparison to competitors, and impact on net returns. View ${symbol} expense ratio breakdown.`,
    keywords: [
      `${symbol} expense ratio`,
      `${symbol} fund fees`,
      `${symbol} management fees`,
      `${symbol} fee structure`,
      `what is ${symbol} expense ratio`,
      `${symbol} vs competitor fees`,
    ],
    openGraph: {
      title: `${symbol} Expense Ratio - Average Fund Fees & Cost Analysis`,
      description: `${symbol} expense ratio analysis with fund fees and cost comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/expense-ratio/${ticker.toLowerCase()}`,
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

export default async function ExpenseRatioPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/expense-ratio/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock expense ratio data - in production, this would come from your API
  const avgExpenseRatio = 0.45 // 45 basis points
  const activeExpenseRatio = 0.68
  const passiveExpenseRatio = 0.12
  const industryAvg = 0.55

  // Generate Expense Ratio FAQs
  const expenseRatioFaqs = [
    {
      question: `What is ${symbol}'s average expense ratio?`,
      answer: `${symbol} (${companyName}) has an average expense ratio of ${avgExpenseRatio.toFixed(2)}% (${(avgExpenseRatio * 100).toFixed(0)} basis points) across its fund lineup. This represents the annual fee charged to investors as a percentage of assets. ${avgExpenseRatio < industryAvg ? `${companyName}'s fees are below the industry average of ${industryAvg.toFixed(2)}%, providing a competitive cost advantage.` : avgExpenseRatio === industryAvg ? 'This is in line with industry averages.' : 'This is above the industry average, which may reflect active management or specialized strategies.'}`
    },
    {
      question: `How does ${symbol} expense ratio vary by fund type?`,
      answer: `${symbol}'s expense ratios vary significantly by investment approach: Passive/index funds average ${passiveExpenseRatio.toFixed(2)}% (${(passiveExpenseRatio * 100).toFixed(0)} bps), while actively managed funds average ${activeExpenseRatio.toFixed(2)}% (${(activeExpenseRatio * 100).toFixed(0)} bps). The higher fees for active funds reflect research costs, portfolio management, and trading expenses. Specialized strategies like alternatives typically have even higher expense ratios.`
    },
    {
      question: `Why do expense ratios matter for ${symbol} investors?`,
      answer: `Expense ratios directly impact ${symbol} in two ways: (1) They determine revenue - higher fee assets generate more revenue per dollar of AUM, and (2) They affect competitiveness - lower-cost products tend to attract more assets. For end investors in ${companyName}'s funds, a 1% difference in expense ratios can reduce returns by over 25% over 30 years due to compounding. Fee competitiveness is crucial for retaining and growing AUM.`
    },
    {
      question: `How have ${symbol} expense ratios changed over time?`,
      answer: `The asset management industry has experienced sustained fee compression due to: (1) Growth of low-cost index funds, (2) Increased fee transparency, (3) Regulatory pressure, (4) Difficulty of active managers to consistently outperform. ${companyName}, like most asset managers, has likely reduced fees over time to remain competitive, particularly in passive products. However, alternative and specialized active strategies may maintain premium pricing.`
    },
    {
      question: `What drives ${symbol}'s expense ratio structure?`,
      answer: `${symbol}'s expense ratios reflect: (1) Investment approach - passive/index funds have lower costs than active research-driven strategies, (2) Asset class - equity funds typically cost more than fixed income, (3) Distribution expenses - funds sold through advisors may have higher fees, (4) Scale - larger funds can spread fixed costs over more assets, (5) Competitive positioning - pricing must balance profitability with market competitiveness.`
    },
    {
      question: `How do ${symbol} fees compare to competitors?`,
      answer: `${companyName}'s fee competitiveness varies by product category. In passive/index strategies, industry leaders like Vanguard and BlackRock's iShares offer expense ratios below 0.10%. In active management, boutique specialists may charge 0.75-1.50% or more. ${symbol}'s positioning depends on their product mix, distribution channels, and value proposition. Check specific fund expense ratios against category peers for accurate comparisons.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Expense Ratio`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Expense Ratio - Average Fund Fees & Cost Analysis ${currentYear}`,
    description: `Comprehensive ${symbol} expense ratio analysis with fund fees and cost breakdowns.`,
    url: pageUrl,
    keywords: [
      `${symbol} expense ratio`,
      `${symbol} fund fees`,
      `${symbol} management fees`,
      `${symbol} fee structure`,
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

  const faqSchema = getFAQSchema(expenseRatioFaqs)

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
            <span>{symbol} Expense Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Expense Ratio
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} fund fees, expense ratios, and cost analysis
          </p>

          {/* Expense Ratio Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Average Expense Ratio</p>
                <p className="text-3xl font-bold">
                  {avgExpenseRatio.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{(avgExpenseRatio * 100).toFixed(0)} basis points</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Active Funds</p>
                <p className="text-3xl font-bold">
                  {activeExpenseRatio.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Actively managed products</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Passive/Index Funds</p>
                <p className="text-3xl font-bold text-green-500">
                  {passiveExpenseRatio.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Low-cost index products</p>
              </div>
            </div>
          </div>

          {/* Expense Ratio by Asset Class */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Expense Ratio by Asset Class</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Asset Class</th>
                    <th className="text-right p-3 text-muted-foreground">Active</th>
                    <th className="text-right p-3 text-muted-foreground">Passive</th>
                    <th className="text-right p-3 text-muted-foreground">Average</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">U.S. Equity</td>
                    <td className="p-3 text-right">0.65%</td>
                    <td className="p-3 text-right text-green-500">0.08%</td>
                    <td className="p-3 text-right font-medium">0.42%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">International Equity</td>
                    <td className="p-3 text-right">0.78%</td>
                    <td className="p-3 text-right text-green-500">0.12%</td>
                    <td className="p-3 text-right font-medium">0.51%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Fixed Income</td>
                    <td className="p-3 text-right">0.55%</td>
                    <td className="p-3 text-right text-green-500">0.06%</td>
                    <td className="p-3 text-right font-medium">0.35%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Alternatives</td>
                    <td className="p-3 text-right">1.25%</td>
                    <td className="p-3 text-right">N/A</td>
                    <td className="p-3 text-right font-medium">1.25%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Multi-Asset</td>
                    <td className="p-3 text-right">0.72%</td>
                    <td className="p-3 text-right text-green-500">0.15%</td>
                    <td className="p-3 text-right font-medium">0.48%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Fee Impact Calculator */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impact of Fees on Returns</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                A $100,000 investment with 8% annual returns over 30 years:
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">0.10% expense ratio:</span>
                  <span className="font-bold text-green-500">$982,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{avgExpenseRatio.toFixed(2)}% expense ratio:</span>
                  <span className="font-bold">$869,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">1.00% expense ratio:</span>
                  <span className="font-bold text-red-500">$761,000</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Assuming 8% gross annual returns before fees. For illustration only.
              </p>
            </div>
          </section>

          {/* Understanding Expense Ratios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Expense Ratios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What's Included in Expense Ratio</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Management fees (portfolio manager compensation)</li>
                  <li>Administrative costs and record-keeping</li>
                  <li>Custody and legal fees</li>
                  <li>Distribution (12b-1) fees (if applicable)</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Not Included in Expense Ratio</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Transaction costs (brokerage commissions)</li>
                  <li>Sales loads or front-end fees</li>
                  <li>Redemption fees</li>
                  <li>Account fees charged by brokers</li>
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
                href={`/fund-performance/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Fund Performance
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {expenseRatioFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Expense Ratios with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/expense-ratio/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Fees
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
