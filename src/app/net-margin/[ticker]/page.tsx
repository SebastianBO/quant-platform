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

  return {
    title: `${symbol} Net Margin - Net Profit Margin Analysis & Bottom Line`,
    description: `${symbol} net profit margin analysis. View net margin, bottom-line profitability, compare to industry averages, and understand final profitability.`,
    keywords: [
      `${symbol} net margin`,
      `${symbol} net profit margin`,
      `${symbol} bottom line`,
      `${symbol} profitability`,
      `${symbol} earnings margin`,
      `${symbol} profit analysis`,
    ],
    openGraph: {
      title: `${symbol} Net Margin - Net Profit Margin Analysis`,
      description: `Complete net margin analysis for ${symbol} including bottom-line profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/net-margin/${ticker.toLowerCase()}`,
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

function getRatingLabel(margin: number): { label: string; color: string; description: string } {
  if (margin >= 0.25) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding bottom-line profitability'
  }
  if (margin >= 0.15) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong net profitability'
  }
  if (margin >= 0.08) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid bottom line'
  }
  if (margin >= 0.03) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Thin net margins'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Weak or negative profitability'
  }
}

export default async function NetMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/net-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get margin metrics
  const netMargin = metrics?.net_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const operatingMargin = metrics?.operating_margin || 0

  // Get latest income statement data
  const latestIncome = incomeStatements?.[0]
  const revenue = latestIncome?.revenue || 0
  const netIncome = latestIncome?.net_income || 0
  const grossProfit = latestIncome?.gross_profit || 0
  const operatingIncome = latestIncome?.operating_income || 0

  // Industry average estimates
  const industryAvgNetMargin = sector === 'Technology' ? 0.20 :
                               sector === 'Software' ? 0.25 :
                               sector === 'Financials' ? 0.15 :
                               sector === 'Healthcare' ? 0.12 :
                               sector === 'Retail' ? 0.05 :
                               sector === 'Energy' ? 0.08 :
                               0.10 // Default

  const marginRating = getRatingLabel(netMargin)
  const vsIndustry = netMargin - industryAvgNetMargin
  const vsIndustryPercent = ((vsIndustry / industryAvgNetMargin) * 100).toFixed(1)

  // Generate net margin FAQs
  const netMarginFaqs = [
    {
      question: `What is ${symbol} net profit margin?`,
      answer: `${symbol}'s net profit margin is ${(netMargin * 100).toFixed(1)}%, which is considered ${marginRating.label.toLowerCase()}. This means ${companyName} keeps ${(netMargin * 100).toFixed(1)} cents as net profit for every dollar of revenue after all expenses, including cost of goods sold, operating expenses, interest, and taxes. ${netMargin > 0 ? 'A positive net margin indicates the company is profitable at the bottom line.' : 'A negative net margin indicates the company is operating at a loss.'}`
    },
    {
      question: `Is ${symbol} net margin good or bad?`,
      answer: `${symbol}'s net margin of ${(netMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgNetMargin * 100).toFixed(1)}%. ${marginRating.description}. ${vsIndustry > 0 ? `${symbol} demonstrates superior bottom-line profitability compared to peers.` : `${symbol} has opportunities to improve overall profitability to match industry standards.`}`
    },
    {
      question: `What's the difference between gross, operating, and net margin?`,
      answer: `${symbol} shows a profitability progression: Gross margin (${(grossMargin * 100).toFixed(1)}%) after production costs, operating margin (${(operatingMargin * 100).toFixed(1)}%) after operating expenses, and net margin (${(netMargin * 100).toFixed(1)}%) as the final bottom line after all costs. The gap from ${(grossMargin * 100).toFixed(1)}% to ${(netMargin * 100).toFixed(1)}% shows how much profit is consumed by operating costs, interest, and taxes.`
    },
    {
      question: `How can ${symbol} improve its net margin?`,
      answer: `${symbol} can improve its ${(netMargin * 100).toFixed(1)}% net margin by: (1) Increasing gross margins through better pricing or lower COGS, (2) Reducing operating expenses (${((grossMargin - operatingMargin) * 100).toFixed(1)}% of revenue), (3) Minimizing interest expenses through debt reduction, (4) Optimizing tax strategy, (5) Eliminating one-time charges. ${netMargin > 0.15 ? `Current margins are strong, indicating effective management across all these areas.` : `Margin improvement could significantly enhance shareholder value.`}`
    },
    {
      question: `Should I invest in ${symbol} based on net margin?`,
      answer: `While ${symbol}'s net margin of ${(netMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()}, net margin alone shouldn't determine investment decisions. ${netMargin > 0.15 ? 'High net margins indicate efficient operations and strong profitability that can fund growth and dividends.' : netMargin > 0 ? 'Moderate net margins suggest profitable operations but with room for optimization.' : 'Negative net margins require a clear path to profitability and strong growth prospects.'} Consider net margin trends, revenue growth, return on equity, free cash flow, and valuation.`
    },
    {
      question: `Why is net margin the most important profitability metric?`,
      answer: `Net margin represents ${companyName}'s true bottom-line profitability after all costs. Unlike gross or operating margin, it accounts for everything - COGS, OpEx, interest, taxes, and one-time items. ${symbol}'s ${(netMargin * 100).toFixed(1)}% net margin ${netMargin > industryAvgNetMargin ? 'shows superior overall profitability management' : 'indicates areas for improvement in cost control or pricing'}. ${sector ? `In the ${sector} sector, ` : ''}net margin is the ultimate measure of how much profit flows to shareholders.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Net Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Net Margin - Net Profit Margin Analysis`,
    description: `Complete net margin analysis for ${symbol} (${companyName}) including bottom-line profitability metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} net margin`,
      `${symbol} net profit margin`,
      `${symbol} profitability`,
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

  const faqSchema = getFAQSchema(netMarginFaqs)

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
            <span>{symbol} Net Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Net Margin - Net Profit Margin
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Bottom-line profitability analysis for {companyName}
          </p>

          {/* Current Price & Net Margin Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-6 rounded-xl border border-teal-500/30">
              <p className="text-muted-foreground mb-1">Net Profit Margin</p>
              <p className={`text-4xl font-bold ${marginRating.color}`}>{(netMargin * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{marginRating.label} - {marginRating.description}</p>
            </div>
          </div>

          {/* Profitability Cascade */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability Cascade - Revenue to Net Income</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-6">
                How {symbol} converts revenue to bottom-line profit
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-500/10 rounded-lg">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="font-bold">100.0%</span>
                </div>
                <div className="ml-4 flex items-center justify-between p-4 bg-green-500/20 rounded-lg">
                  <span className="text-sm">Gross Profit</span>
                  <span className="font-bold text-green-500">{(grossMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="ml-8 flex items-center justify-between p-4 bg-blue-500/20 rounded-lg">
                  <span className="text-sm">Operating Income</span>
                  <span className="font-bold text-blue-500">{(operatingMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="ml-12 flex items-center justify-between p-4 bg-teal-500/20 rounded-lg border-2 border-teal-500/50">
                  <span className="text-sm font-bold">Net Income</span>
                  <span className={`font-bold ${marginRating.color}`}>{(netMargin * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {(grossMargin - netMargin) > 0.30
                    ? `High cost burden: ${((grossMargin - netMargin) * 100).toFixed(1)}% of revenue consumed by operating expenses, interest, and taxes.`
                    : `Efficient conversion: Only ${((grossMargin - netMargin) * 100).toFixed(1)}% of revenue lost to operating costs and taxes.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{symbol} Net Margin</p>
                  <p className={`text-3xl font-bold ${marginRating.color}`}>{(netMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgNetMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Difference</p>
                  <p className={`text-3xl font-bold ${vsIndustry > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {vsIndustry > 0 ? '+' : ''}{(vsIndustry * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vsIndustry > 0 ? 'Above' : 'Below'} industry by {Math.abs(parseFloat(vsIndustryPercent))}%
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {vsIndustry > 0
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior bottom-line profitability and cost management.`
                    : `${symbol} trails ${sector || 'industry'} peers in net profitability, indicating opportunities for margin expansion.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Net Income Calculation */}
          {revenue > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Net Income Calculation</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${(revenue / 1e9).toFixed(2)}B</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${netIncome >= 0 ? '' : '-'}${(Math.abs(netIncome) / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    Net Margin = (Net Income / Revenue) × 100 = {(netMargin * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* What Net Margin Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Net Margin Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-teal-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Bottom-Line Profitability</h3>
                  <p className="text-sm text-muted-foreground">
                    {netMargin > 0.15
                      ? `${symbol}'s net margin of ${(netMargin * 100).toFixed(1)}% indicates exceptional bottom-line profitability. ${companyName} efficiently converts revenue into profit available for shareholders.`
                      : netMargin > 0
                      ? `${symbol}'s net margin of ${(netMargin * 100).toFixed(1)}% shows profitable operations, though with room for efficiency gains.`
                      : `${symbol}'s negative net margin indicates losses at the bottom line, requiring a path to profitability.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Shareholder Returns</h3>
                  <p className="text-sm text-muted-foreground">
                    Net margin directly impacts returns to shareholders through dividends and reinvestment. ${symbol}'s ${(netMargin * 100).toFixed(1)}% net margin {netMargin > 0.15 ? 'provides ample cash for dividends and growth investments' : netMargin > 0 ? 'supports moderate shareholder distributions' : 'limits shareholder distributions until profitability improves'}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Strength</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `Net margins significantly above peers indicate ${companyName} has superior cost management, pricing power, or capital structure advantages.`
                      : vsIndustry < -0.05
                      ? `Net margins below peers suggest ${companyName} faces higher costs, lower pricing power, or suboptimal capital structure.`
                      : `Net margins in line with industry indicate ${symbol} is competitively positioned without clear profitability advantages.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Investment Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    {netMargin > 0.15
                      ? `High net margins are hallmarks of quality businesses with pricing power, operational efficiency, and financial discipline - key drivers of long-term outperformance.`
                      : netMargin > 0
                      ? `Moderate net margins indicate a viable business, though improving profitability would enhance investment quality.`
                      : `Negative net margins require careful evaluation of the path to profitability and growth potential before investing.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 rounded-xl border border-teal-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {netMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Net margin analysis is based on publicly available financial data and should not be considered financial advice. Net margins vary by industry and can be affected by one-time charges. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="net-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
