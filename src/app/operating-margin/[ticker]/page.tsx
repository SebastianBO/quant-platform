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

  return {
    title: `${symbol} Operating Margin - Operating Profit Margin Analysis`,
    description: `${symbol} operating margin analysis. View operating profit margin, OpEx efficiency, compare to industry averages, and understand operational profitability.`,
    keywords: [
      `${symbol} operating margin`,
      `${symbol} operating profit margin`,
      `${symbol} OpEx`,
      `${symbol} operational efficiency`,
      `${symbol} EBIT margin`,
      `${symbol} profitability`,
    ],
    openGraph: {
      title: `${symbol} Operating Margin Analysis`,
      description: `Complete operating margin analysis for ${symbol} including operational efficiency and profitability.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/operating-margin/${ticker.toLowerCase()}`,
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
  if (margin >= 0.30) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding operational efficiency'
  }
  if (margin >= 0.20) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong operating profitability'
  }
  if (margin >= 0.10) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid operational performance'
  }
  if (margin >= 0.05) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Moderate efficiency'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Weak operational profitability'
  }
}

export default async function OperatingMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/operating-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get margin metrics
  const operatingMargin = metrics?.operating_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const netMargin = metrics?.net_margin || 0

  // Get latest income statement data
  const latestIncome = incomeStatements?.[0]
  const revenue = latestIncome?.revenue || 0
  const operatingIncome = latestIncome?.operating_income || latestIncome?.ebit || 0
  const grossProfit = latestIncome?.gross_profit || 0
  const opex = grossProfit - operatingIncome

  // Industry average estimates
  const industryAvgOperatingMargin = sector === 'Technology' ? 0.25 :
                                     sector === 'Software' ? 0.30 :
                                     sector === 'Financials' ? 0.20 :
                                     sector === 'Healthcare' ? 0.15 :
                                     sector === 'Retail' ? 0.05 :
                                     0.12 // Default

  const marginRating = getRatingLabel(operatingMargin)
  const vsIndustry = operatingMargin - industryAvgOperatingMargin
  const vsIndustryPercent = industryAvgOperatingMargin !== 0 ? ((vsIndustry / industryAvgOperatingMargin) * 100).toFixed(1) : '0.0'

  // OpEx ratio (Operating Expenses / Revenue)
  const opexRatio = revenue > 0 ? opex / revenue : 0

  // Generate operating margin FAQs
  const operatingMarginFaqs = [
    {
      question: `What is ${symbol} operating margin?`,
      answer: `${symbol}'s operating margin is ${(operatingMargin * 100).toFixed(1)}%, which is considered ${marginRating.label.toLowerCase()}. This means ${companyName} generates ${(operatingMargin * 100).toFixed(1)} cents in operating profit for every dollar of revenue after covering both cost of goods sold and operating expenses (R&D, sales, marketing, G&A). ${operatingMargin > 0 ? 'A positive operating margin indicates core business profitability.' : 'A negative operating margin indicates operating losses.'}`
    },
    {
      question: `Is ${symbol} operating margin good or bad?`,
      answer: `${symbol}'s operating margin of ${(operatingMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgOperatingMargin * 100).toFixed(1)}%. ${marginRating.description}. ${vsIndustry > 0 ? `${symbol} demonstrates superior operational efficiency compared to peers.` : `${symbol} has opportunities to improve operational efficiency to match industry standards.`}`
    },
    {
      question: `What's the difference between gross margin, operating margin, and net margin?`,
      answer: `${symbol}'s gross margin (${(grossMargin * 100).toFixed(1)}%) shows profitability after direct production costs. Operating margin (${(operatingMargin * 100).toFixed(1)}%) subtracts operating expenses like R&D (${(opexRatio * 100).toFixed(1)}% of revenue), revealing core business profitability. Net margin (${(netMargin * 100).toFixed(1)}%) includes interest and taxes. Operating margin is the best indicator of ${companyName}'s operational efficiency.`
    },
    {
      question: `How can ${symbol} improve operating margin?`,
      answer: `${symbol} can improve its ${(operatingMargin * 100).toFixed(1)}% operating margin by: (1) Increasing gross margins through better pricing or lower COGS, (2) Reducing operating expenses through automation, efficiency gains, or scaling, (3) Growing revenue faster than operating costs (operating leverage), (4) Optimizing R&D, sales, and marketing spending. The ${(opexRatio * 100).toFixed(1)}% OpEx ratio ${opexRatio < 0.30 ? 'is already efficient' : 'has room for optimization'}.`
    },
    {
      question: `Should I invest in ${symbol} based on operating margin?`,
      answer: `While ${symbol}'s operating margin of ${(operatingMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()}, operating margin alone shouldn't determine investment decisions. ${operatingMargin > 0.20 ? 'High operating margins indicate strong competitive positioning and scalable operations.' : operatingMargin > 0 ? 'Moderate operating margins suggest profitable but competitive operations.' : 'Negative operating margins require a clear path to profitability.'} Consider operating margin trends, revenue growth, capital requirements, and valuation.`
    },
    {
      question: `Why is operating margin important for ${symbol}?`,
      answer: `Operating margin reveals how efficiently ${companyName} runs its core business. Unlike net margin, it excludes financing decisions and taxes, focusing purely on operational excellence. ${sector ? `In the ${sector} sector, ` : ''}companies with strong operating margins like ${operatingMargin > industryAvgOperatingMargin ? symbol : 'industry leaders'} can invest more in growth, weather downturns better, and generate superior returns for shareholders over time.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Operating Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Operating Margin Analysis`,
    description: `Complete operating margin analysis for ${symbol} (${companyName}) including operational efficiency metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} operating margin`,
      `${symbol} operating profit margin`,
      `${symbol} operational efficiency`,
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

  const faqSchema = getFAQSchema(operatingMarginFaqs)

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
            <span>{symbol} Operating Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Operating Margin Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Operational efficiency and profitability analysis for {companyName}
          </p>

          {/* Current Price & Operating Margin Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-6 rounded-xl border border-indigo-500/30">
              <p className="text-muted-foreground mb-1">Operating Profit Margin</p>
              <p className={`text-4xl font-bold ${marginRating.color}`}>{(operatingMargin * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{marginRating.label} - {marginRating.description}</p>
            </div>
          </div>

          {/* Margin Metrics Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability Margin Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                </div>
                <p className="text-3xl font-bold">{(grossMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">After COGS</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                </div>
                <p className="text-3xl font-bold">{(operatingMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">After OpEx</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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
                  <p className="text-sm text-muted-foreground mb-1">{symbol} Operating Margin</p>
                  <p className={`text-3xl font-bold ${marginRating.color}`}>{(operatingMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgOperatingMargin * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior operational efficiency and cost management.`
                    : `${symbol} has lower operating margins than ${sector || 'industry'} peers, indicating opportunities for operational improvements.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Operating Profit Breakdown */}
          {revenue > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Operating Profit Breakdown</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                    <span className="text-sm">Revenue</span>
                    <span className="font-bold">${(revenue / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg">
                    <span className="text-sm">Gross Profit ({(grossMargin * 100).toFixed(1)}%)</span>
                    <span className="font-bold text-green-500">${(grossProfit / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                    <span className="text-sm">Operating Expenses ({(opexRatio * 100).toFixed(1)}% of revenue)</span>
                    <span className="font-bold text-red-500">-${(opex / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-500/20 rounded-lg border-2 border-indigo-500/50">
                    <span className="text-sm font-bold">Operating Income</span>
                    <span className={`font-bold ${operatingIncome >= 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                      ${operatingIncome >= 0 ? '' : '-'}${(Math.abs(operatingIncome) / 1e9).toFixed(2)}B
                    </span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    Operating Margin = (Operating Income / Revenue) × 100 = {(operatingMargin * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* What Operating Margin Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Operating Margin Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Core Business Profitability</h3>
                  <p className="text-sm text-muted-foreground">
                    {operatingMargin > 0.20
                      ? `${symbol}'s operating margin of ${(operatingMargin * 100).toFixed(1)}% demonstrates excellent core business profitability. ${companyName} efficiently converts revenue into operating profit.`
                      : operatingMargin > 0
                      ? `${symbol}'s operating margin of ${(operatingMargin * 100).toFixed(1)}% shows profitable core operations, though with room for efficiency improvements.`
                      : `${symbol}'s negative operating margin indicates the core business is unprofitable, requiring restructuring or growth to reach profitability.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Operating Leverage</h3>
                  <p className="text-sm text-muted-foreground">
                    The {(opexRatio * 100).toFixed(1)}% operating expense ratio indicates {opexRatio < 0.30 ? 'strong' : opexRatio < 0.50 ? 'moderate' : 'significant'} operating leverage potential. As revenue grows, ${companyName} {opexRatio < 0.30 ? 'should see substantial margin expansion' : 'needs to carefully manage costs to expand margins'}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Position</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `Operating margins significantly above industry peers suggest ${companyName} has operational advantages through scale, technology, or superior execution.`
                      : vsIndustry < -0.05
                      ? `Operating margins below peers may indicate higher cost structures or investments in growth that haven't yet scaled.`
                      : `Operating margins in line with industry suggest ${symbol} is competitively positioned but without clear operational advantages.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Management Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    {operatingMargin > industryAvgOperatingMargin
                      ? `Above-average operating margins reflect management's ability to control costs and run efficient operations, a key driver of long-term shareholder value.`
                      : `Improving operating margins to industry standards should be a management priority to enhance profitability and competitiveness.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {operatingMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Operating margin analysis is based on publicly available financial data and should not be considered financial advice. Operating margins vary by industry and business stage. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="operating-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
