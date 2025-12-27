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

  return {
    title: `${symbol} Gross Margin - Gross Profit Margin Analysis & Trends`,
    description: `${symbol} gross margin analysis. View gross profit margin, COGS efficiency, compare to industry averages, and understand pricing power.`,
    keywords: [
      `${symbol} gross margin`,
      `${symbol} gross profit margin`,
      `${symbol} COGS`,
      `${symbol} pricing power`,
      `${symbol} profitability`,
      `${symbol} cost of goods sold`,
    ],
    openGraph: {
      title: `${symbol} Gross Margin Analysis`,
      description: `Complete gross margin analysis for ${symbol} including pricing power and COGS efficiency.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gross-margin/${ticker.toLowerCase()}`,
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
  if (margin >= 0.60) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Premium pricing power'
  }
  if (margin >= 0.40) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong gross profitability'
  }
  if (margin >= 0.25) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid pricing power'
  }
  if (margin >= 0.15) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Moderate margins'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Low pricing power'
  }
}

export default async function GrossMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gross-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get margin metrics
  const grossMargin = metrics?.gross_margin || 0
  const operatingMargin = metrics?.operating_margin || 0
  const netMargin = metrics?.net_margin || 0

  // Get latest income statement data
  const latestIncome = incomeStatements?.[0]
  const revenue = latestIncome?.revenue || 0
  const cogs = latestIncome?.cost_of_revenue || 0
  const grossProfit = latestIncome?.gross_profit || (revenue - cogs)

  // Industry average estimates
  const industryAvgGrossMargin = sector === 'Technology' ? 0.65 :
                                 sector === 'Software' ? 0.75 :
                                 sector === 'Healthcare' ? 0.55 :
                                 sector === 'Retail' ? 0.30 :
                                 sector === 'Energy' ? 0.35 :
                                 0.40 // Default

  const marginRating = getRatingLabel(grossMargin)
  const vsIndustry = grossMargin - industryAvgGrossMargin
  const vsIndustryPercent = industryAvgGrossMargin !== 0 ? ((vsIndustry / industryAvgGrossMargin) * 100).toFixed(1) : '0.0'

  // Generate gross margin FAQs
  const grossMarginFaqs = [
    {
      question: `What is ${symbol} gross margin?`,
      answer: `${symbol}'s gross margin is ${(grossMargin * 100).toFixed(1)}%, which is considered ${marginRating.label.toLowerCase()}. This means ${companyName} retains ${(grossMargin * 100).toFixed(1)} cents as gross profit for every dollar of revenue after paying for cost of goods sold (COGS). ${grossMargin > 0.40 ? 'High gross margins indicate strong pricing power and product differentiation.' : 'Lower gross margins suggest a more commoditized or competitive market.'}`
    },
    {
      question: `Is ${symbol} gross margin good or bad?`,
      answer: `${symbol}'s gross margin of ${(grossMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgGrossMargin * 100).toFixed(1)}%. ${marginRating.description}. ${vsIndustry > 0 ? `${symbol} demonstrates superior pricing power and efficient cost management compared to peers.` : `${symbol} may face pricing pressure or higher production costs relative to competitors.`}`
    },
    {
      question: `What's the difference between gross margin, operating margin, and net margin?`,
      answer: `${symbol}'s gross margin (${(grossMargin * 100).toFixed(1)}%) shows profitability after direct production costs. Operating margin (${(operatingMargin * 100).toFixed(1)}%) subtracts additional operating expenses like R&D, sales, and marketing. Net margin (${(netMargin * 100).toFixed(1)}%) is the final profit after all expenses including taxes and interest. Gross margin reveals ${companyName}'s fundamental pricing power before other costs.`
    },
    {
      question: `How can ${symbol} improve its gross margin?`,
      answer: `${symbol} can improve its ${(grossMargin * 100).toFixed(1)}% gross margin by: (1) Increasing prices through stronger brand positioning or product differentiation, (2) Reducing COGS through better supplier negotiations, automation, or economies of scale, (3) Shifting to higher-margin products or services, (4) Improving production efficiency and reducing waste. ${grossMargin > 0.50 ? `Current margins are already strong, suggesting ${companyName} executes well on these factors.` : `Margin improvement could significantly enhance profitability.`}`
    },
    {
      question: `Should I invest in ${symbol} based on gross margin?`,
      answer: `While ${symbol}'s gross margin of ${(grossMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()}, gross margin alone shouldn't determine investment decisions. ${grossMargin > 0.50 ? 'High gross margins provide cushion for operating expenses and indicate strong competitive positioning.' : grossMargin > 0.25 ? 'Moderate gross margins are typical for many industries and can still support profitable operations.' : 'Low gross margins require high volume and tight expense control to achieve profitability.'} Consider gross margin trends, competitive dynamics, operating leverage, and valuation.`
    },
    {
      question: `Why is gross margin important for ${symbol}?`,
      answer: `Gross margin is crucial because it shows ${companyName}'s fundamental profitability before operating costs. High gross margins like ${grossMargin > industryAvgGrossMargin ? symbol + "'s" : 'those of industry leaders'} provide flexibility to invest in growth (R&D, marketing) while maintaining profitability. ${sector ? `In the ${sector} sector, ` : ''}gross margin is a key indicator of competitive moat and pricing power. Companies with consistently high gross margins often outperform over the long term.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gross Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gross Margin Analysis`,
    description: `Complete gross margin analysis for ${symbol} (${companyName}) including pricing power and COGS efficiency.`,
    url: pageUrl,
    keywords: [
      `${symbol} gross margin`,
      `${symbol} gross profit margin`,
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

  const faqSchema = getFAQSchema(grossMarginFaqs)

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
            <span>{symbol} Gross Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gross Margin Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pricing power and cost efficiency analysis for {companyName}
          </p>

          {/* Current Price & Gross Margin Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 rounded-xl border border-cyan-500/30">
              <p className="text-muted-foreground mb-1">Gross Profit Margin</p>
              <p className={`text-4xl font-bold ${marginRating.color}`}>{(grossMargin * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{marginRating.label} - {marginRating.description}</p>
            </div>
          </div>

          {/* Margin Metrics Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Margin Metrics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                </div>
                <p className="text-3xl font-bold">{(grossMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">After COGS</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                </div>
                <p className="text-3xl font-bold">{(operatingMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">After OpEx</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                </div>
                <p className="text-3xl font-bold">{(netMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Final profit</p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{symbol} Gross Margin</p>
                  <p className={`text-3xl font-bold ${marginRating.color}`}>{(grossMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgGrossMargin * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior gross margins, indicating strong pricing power or cost advantages.`
                    : `${symbol} has lower gross margins than ${sector || 'industry'} peers, suggesting pricing pressure or higher production costs.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Gross Profit Breakdown */}
          {revenue > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Gross Profit Breakdown</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                    <span className="text-sm">Revenue</span>
                    <span className="font-bold">${(revenue / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                    <span className="text-sm">Cost of Goods Sold (COGS)</span>
                    <span className="font-bold text-red-500">-${(cogs / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-cyan-500/20 rounded-lg border-2 border-cyan-500/50">
                    <span className="text-sm font-bold">Gross Profit</span>
                    <span className="font-bold text-cyan-500">${(grossProfit / 1e9).toFixed(2)}B</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    Gross Margin = (Gross Profit / Revenue) × 100 = {(grossMargin * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* What Gross Margin Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Gross Margin Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-cyan-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Pricing Power Indicator</h3>
                  <p className="text-sm text-muted-foreground">
                    {grossMargin > 0.50
                      ? `${symbol}'s gross margin of ${(grossMargin * 100).toFixed(1)}% indicates exceptional pricing power. ${companyName} can charge premium prices due to strong brand, unique products, or market dominance.`
                      : grossMargin > 0.30
                      ? `${symbol}'s gross margin of ${(grossMargin * 100).toFixed(1)}% suggests moderate pricing power in a competitive market.`
                      : `${symbol}'s gross margin of ${(grossMargin * 100).toFixed(1)}% indicates limited pricing power, typical of commoditized markets.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Operating Leverage Potential</h3>
                  <p className="text-sm text-muted-foreground">
                    High gross margins provide room to invest in growth while maintaining profitability. ${symbol}'s {(grossMargin * 100).toFixed(1)}% gross margin {grossMargin > 0.40 ? 'offers significant operating leverage potential' : 'requires careful operating expense management to achieve strong net margins'}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Moat</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.10
                      ? `Gross margins significantly above industry peers suggest ${companyName} has a strong competitive moat protecting profitability.`
                      : vsIndustry < -0.10
                      ? `Gross margins below peers indicate competitive vulnerabilities that ${companyName} should address.`
                      : `Gross margins in line with industry suggest ${symbol} operates in a competitive equilibrium with peers.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Business Model Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    {grossMargin > 0.60
                      ? `Exceptional gross margins above 60% often indicate scalable business models like software or services that can grow efficiently.`
                      : grossMargin > 0.40
                      ? `Strong gross margins suggest a quality business model with room for profitability even with operating investments.`
                      : `Lower gross margins require volume and efficiency to generate attractive returns for investors.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {grossMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Gross margin analysis is based on publicly available financial data and should not be considered financial advice. Gross margins vary significantly by industry and business model. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="gross-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
