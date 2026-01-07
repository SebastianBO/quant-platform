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
    title: `${symbol} Profit Margin - Net, Gross, Operating Margins Analysis`,
    description: `${symbol} profit margin analysis. View net profit margin, gross margin, operating margin metrics, compare to industry averages, and understand profitability.`,
    keywords: [
      `${symbol} profit margin`,
      `${symbol} net margin`,
      `${symbol} profitability`,
      `${symbol} gross margin`,
      `${symbol} operating margin`,
      `${symbol} margins analysis`,
    ],
    openGraph: {
      title: `${symbol} Profit Margin Analysis`,
      description: `Complete profit margin analysis for ${symbol} including net, gross, and operating margins.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/profit-margin/${ticker.toLowerCase()}`,
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
    description: 'Outstanding profitability'
  }
  if (margin >= 0.15) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong profit margins'
  }
  if (margin >= 0.08) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid profitability'
  }
  if (margin >= 0.03) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Thin profit margins'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Weak profitability'
  }
}

export default async function ProfitMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/profit-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get margin metrics
  const netMargin = metrics?.net_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const operatingMargin = metrics?.operating_margin || 0

  // Calculate EBIT margin from latest income statement
  const latestIncome = incomeStatements?.[0]
  const revenue = latestIncome?.revenue || 0
  const ebit = latestIncome?.ebit || latestIncome?.operating_income || 0
  const ebitMargin = revenue > 0 ? ebit / revenue : 0

  // Industry average estimates
  const industryAvgNetMargin = sector === 'Technology' ? 0.20 :
                               sector === 'Financials' ? 0.15 :
                               sector === 'Healthcare' ? 0.12 :
                               sector === 'Energy' ? 0.08 :
                               sector === 'Retail' ? 0.05 :
                               0.10 // Default

  const marginRating = getRatingLabel(netMargin)
  const vsIndustry = netMargin - industryAvgNetMargin
  const vsIndustryPercent = ((vsIndustry / industryAvgNetMargin) * 100).toFixed(1)

  // Generate profit margin FAQs
  const profitMarginFaqs = [
    {
      question: `What is ${symbol} profit margin?`,
      answer: `${symbol}'s net profit margin is ${(netMargin * 100).toFixed(1)}%, which is considered ${marginRating.label.toLowerCase()}. This means ${companyName} keeps ${(netMargin * 100).toFixed(1)} cents as profit for every dollar of revenue. ${netMargin > 0 ? 'A positive profit margin indicates the company is profitable.' : 'A negative profit margin indicates the company is operating at a loss.'}`
    },
    {
      question: `Is ${symbol} profit margin good or bad?`,
      answer: `${symbol}'s net profit margin of ${(netMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgNetMargin * 100).toFixed(1)}%. ${marginRating.description}. ${vsIndustry > 0 ? `${symbol} demonstrates superior profitability compared to peers.` : `${symbol} has room to improve profitability to match industry standards.`}`
    },
    {
      question: `What's the difference between gross, operating, and net profit margins?`,
      answer: `${symbol}'s gross margin (${(grossMargin * 100).toFixed(1)}%) shows profitability after cost of goods sold. Operating margin (${(operatingMargin * 100).toFixed(1)}%) includes operating expenses like R&D and marketing. Net profit margin (${(netMargin * 100).toFixed(1)}%) is the final profitability after all expenses, taxes, and interest. Each level reveals different aspects of ${companyName}'s profitability structure.`
    },
    {
      question: `How does ${symbol} compare to competitors in profit margins?`,
      answer: `Compared to the ${sector || 'industry'} average net margin of ${(industryAvgNetMargin * 100).toFixed(1)}%, ${symbol}'s ${(netMargin * 100).toFixed(1)}% net margin is ${vsIndustry > 0 ? (Math.abs(parseFloat(vsIndustryPercent)) + '% higher') : (Math.abs(parseFloat(vsIndustryPercent)) + '% lower')}. ${netMargin > industryAvgNetMargin ? `This suggests ${companyName} has competitive advantages in pricing power, cost control, or operational efficiency.` : `This indicates potential for ${companyName} to improve cost structure or pricing strategies.`}`
    },
    {
      question: `Should I invest in ${symbol} based on profit margins?`,
      answer: `While ${symbol}'s net profit margin of ${(netMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()}, profit margins alone shouldn't determine investment decisions. ${netMargin > 0.15 ? 'High margins indicate strong pricing power and operational efficiency.' : netMargin > 0 ? 'Moderate margins suggest competitive but profitable operations.' : 'Negative margins require investigation into the path to profitability.'} Consider margin trends, revenue growth, competitive position, and valuation before investing.`
    },
    {
      question: `What affects ${symbol} profit margins?`,
      answer: `${symbol}'s profit margins are affected by: (1) Revenue growth and pricing power, (2) Cost of goods sold and supply chain efficiency, (3) Operating expense management including R&D and marketing, (4) Tax rates and interest expenses. ${sector ? `In the ${sector} sector, ` : ''}competitive dynamics, economies of scale, and operational leverage all play key roles in determining profitability.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Profit Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Profit Margin Analysis`,
    description: `Complete profit margin analysis for ${symbol} (${companyName}) including net, gross, and operating margins.`,
    url: pageUrl,
    keywords: [
      `${symbol} profit margin`,
      `${symbol} net margin`,
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

  const faqSchema = getFAQSchema(profitMarginFaqs)

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
            <span>{symbol} Profit Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Profit Margin Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive profitability metrics for {companyName}
          </p>

          {/* Current Price & Profit Margin Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-xl border border-emerald-500/30">
              <p className="text-muted-foreground mb-1">Net Profit Margin</p>
              <p className={`text-4xl font-bold ${marginRating.color}`}>{(netMargin * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{marginRating.label} - {marginRating.description}</p>
            </div>
          </div>

          {/* All Margin Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability Margin Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                </div>
                <p className="text-3xl font-bold">{(grossMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Revenue after COGS</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                </div>
                <p className="text-3xl font-bold">{(operatingMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Revenue after operating expenses</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">EBIT Margin</p>
                </div>
                <p className="text-3xl font-bold">{(ebitMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Earnings before interest & tax</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                </div>
                <p className="text-3xl font-bold">{(netMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Final profitability</p>
              </div>
            </div>
          </section>

          {/* Margin Waterfall */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability Waterfall</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-6">
                How revenue flows to net profit for {symbol}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <span className="text-sm">Revenue (100%)</span>
                  <span className="font-bold">100.0%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg">
                  <span className="text-sm">Gross Profit</span>
                  <span className="font-bold text-green-500">{(grossMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg">
                  <span className="text-sm">Operating Profit</span>
                  <span className="font-bold text-blue-500">{(operatingMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-500/20 rounded-lg">
                  <span className="text-sm">EBIT</span>
                  <span className="font-bold text-purple-500">{(ebitMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-500/20 rounded-lg border-2 border-emerald-500/50">
                  <span className="text-sm font-bold">Net Profit</span>
                  <span className={`font-bold ${marginRating.color}`}>{(netMargin * 100).toFixed(1)}%</span>
                </div>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior profitability and cost management.`
                    : `${symbol} is underperforming ${sector || 'industry'} peers, indicating opportunities for margin expansion.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* What Profit Margins Mean */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Profit Margins Mean for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Pricing Power</h3>
                  <p className="text-sm text-muted-foreground">
                    {netMargin > 0.15
                      ? `${symbol}'s high net margin of ${(netMargin * 100).toFixed(1)}% indicates strong pricing power. ${companyName} can charge premium prices due to brand strength, product differentiation, or market position.`
                      : netMargin > 0
                      ? `${symbol}'s moderate margins suggest average pricing power. The company operates in a competitive environment with limited pricing flexibility.`
                      : `Negative margins indicate ${companyName} is struggling with pricing and cost management, which requires attention.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Cost Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    The gap between gross margin ({(grossMargin * 100).toFixed(1)}%) and net margin ({(netMargin * 100).toFixed(1)}%) shows how well ${companyName} controls operating expenses. {(grossMargin - netMargin) < 0.15 ? 'Tight expense control' : 'High operating costs'} relative to gross profits.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Advantage</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `Margins significantly above industry average indicate ${companyName} has durable competitive advantages that enable superior profitability.`
                      : vsIndustry < -0.05
                      ? `Margins below peers may signal competitive pressures or inefficiencies that management should address.`
                      : `Margins in line with industry suggest ${symbol} operates in a competitive but stable market environment.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-yellow-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Investment Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    {netMargin > 0.15
                      ? `High-margin businesses like ${symbol} often generate superior returns for shareholders and have more flexibility during economic downturns.`
                      : `Improving profit margins should be a key focus for ${companyName} to enhance shareholder value and business resilience.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {profitMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Profit margin analysis is based on publicly available financial data and should not be considered financial advice. Margins vary significantly by industry and business model. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="profit-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
