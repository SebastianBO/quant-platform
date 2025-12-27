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
    title: `${symbol} EBIT Margin - Earnings Before Interest & Tax Analysis`,
    description: `${symbol} EBIT margin analysis. View EBIT, operating profitability before financing costs, compare to industry averages, and understand core earnings.`,
    keywords: [
      `${symbol} EBIT margin`,
      `${symbol} EBIT`,
      `${symbol} earnings before interest and tax`,
      `${symbol} operating earnings`,
      `${symbol} core profitability`,
      `${symbol} operating margin`,
    ],
    openGraph: {
      title: `${symbol} EBIT Margin Analysis`,
      description: `Complete EBIT margin analysis for ${symbol} including core operating profitability.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ebit-margin/${ticker.toLowerCase()}`,
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
    description: 'Outstanding operating earnings'
  }
  if (margin >= 0.20) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong EBIT profitability'
  }
  if (margin >= 0.10) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid operating earnings'
  }
  if (margin >= 0.05) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Moderate EBIT margins'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Weak operating profitability'
  }
}

export default async function EBITMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ebit-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get margin metrics
  const operatingMargin = metrics?.operating_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const netMargin = metrics?.net_margin || 0

  // Get latest income statement data
  const latestIncome = incomeStatements?.[0]
  const revenue = latestIncome?.revenue || 0
  const ebit = latestIncome?.ebit || latestIncome?.operating_income || 0
  const netIncome = latestIncome?.net_income || 0
  const grossProfit = latestIncome?.gross_profit || 0

  // EBIT margin (typically same as operating margin)
  const ebitMargin = revenue > 0 ? ebit / revenue : operatingMargin

  // Industry average estimates
  const industryAvgEBITMargin = sector === 'Technology' ? 0.25 :
                                sector === 'Software' ? 0.30 :
                                sector === 'Financials' ? 0.20 :
                                sector === 'Healthcare' ? 0.15 :
                                sector === 'Retail' ? 0.05 :
                                0.12 // Default

  const marginRating = getRatingLabel(ebitMargin)
  const vsIndustry = ebitMargin - industryAvgEBITMargin
  const vsIndustryPercent = industryAvgEBITMargin !== 0 ? ((vsIndustry / industryAvgEBITMargin) * 100).toFixed(1) : '0.0'

  // Interest and tax burden
  const interestAndTaxBurden = ebit > 0 ? (ebit - netIncome) / ebit : 0

  // Generate EBIT margin FAQs
  const ebitMarginFaqs = [
    {
      question: `What is ${symbol} EBIT margin?`,
      answer: `${symbol}'s EBIT (Earnings Before Interest and Tax) margin is ${(ebitMargin * 100).toFixed(1)}%, which is considered ${marginRating.label.toLowerCase()}. This means ${companyName} generates ${(ebitMargin * 100).toFixed(1)} cents in operating earnings for every dollar of revenue before paying interest and taxes. ${ebitMargin > 0 ? 'A positive EBIT margin indicates core operational profitability.' : 'A negative EBIT margin indicates operating losses.'}`
    },
    {
      question: `Is ${symbol} EBIT margin good or bad?`,
      answer: `${symbol}'s EBIT margin of ${(ebitMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgEBITMargin * 100).toFixed(1)}%. ${marginRating.description}. ${vsIndustry > 0 ? `${symbol} demonstrates superior operating profitability before financing costs.` : `${symbol} has opportunities to improve core operational efficiency.`}`
    },
    {
      question: `What's the difference between EBIT margin, operating margin, and net margin?`,
      answer: `${symbol}'s EBIT margin (${(ebitMargin * 100).toFixed(1)}%) and operating margin (${(operatingMargin * 100).toFixed(1)}%) are typically similar, both measuring profitability from operations. The key difference: EBIT margin focuses on earnings before financing decisions (interest) and taxes, while net margin (${(netMargin * 100).toFixed(1)}%) includes everything. EBIT margin is ideal for comparing companies with different capital structures or tax situations.`
    },
    {
      question: `Why is EBIT important for analyzing ${symbol}?`,
      answer: `EBIT is crucial because it shows ${companyName}'s operating profitability independent of capital structure (debt vs. equity) and tax jurisdictions. With EBIT margin at ${(ebitMargin * 100).toFixed(1)}%, you can compare ${symbol} to peers regardless of their financing choices or tax rates. This makes EBIT margin ideal for evaluating core business performance and for comparing companies across different countries or with varying debt levels.`
    },
    {
      question: `How much of ${symbol} EBIT goes to interest and taxes?`,
      answer: `${symbol} keeps ${ebit > 0 ? ((1 - interestAndTaxBurden) * 100).toFixed(1) : '0'}% of EBIT as net income, with ${(interestAndTaxBurden * 100).toFixed(1)}% going to interest and taxes. From an EBIT margin of ${(ebitMargin * 100).toFixed(1)}% to a net margin of ${(netMargin * 100).toFixed(1)}%, the ${((ebitMargin - netMargin) * 100).toFixed(1)}% difference represents financing costs and tax obligations. ${interestAndTaxBurden < 0.20 ? 'Low financial burden indicates minimal debt and efficient tax management.' : 'Significant financial burden from debt interest and taxes.'}`
    },
    {
      question: `Should I invest in ${symbol} based on EBIT margin?`,
      answer: `While ${symbol}'s EBIT margin of ${(ebitMargin * 100).toFixed(1)}% is ${marginRating.label.toLowerCase()}, EBIT margin alone shouldn't determine investment decisions. ${ebitMargin > 0.20 ? 'High EBIT margins indicate strong pricing power and operational efficiency.' : ebitMargin > 0 ? 'Moderate EBIT margins suggest competitive but profitable operations.' : 'Negative EBIT margins indicate operating losses requiring investigation.'} Consider EBIT margin trends, revenue growth, capital intensity, debt levels, and valuation before investing.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} EBIT Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EBIT Margin Analysis`,
    description: `Complete EBIT margin analysis for ${symbol} (${companyName}) including operating earnings metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} EBIT margin`,
      `${symbol} EBIT`,
      `${symbol} operating earnings`,
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

  const faqSchema = getFAQSchema(ebitMarginFaqs)

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
            <span>{symbol} EBIT Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EBIT Margin Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Earnings before interest and tax analysis for {companyName}
          </p>

          {/* Current Price & EBIT Margin Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 rounded-xl border border-amber-500/30">
              <p className="text-muted-foreground mb-1">EBIT Margin</p>
              <p className={`text-4xl font-bold ${marginRating.color}`}>{(ebitMargin * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{marginRating.label} - {marginRating.description}</p>
            </div>
          </div>

          {/* Margin Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Margin Metrics Overview</h2>
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
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <p className="text-sm text-muted-foreground">EBIT Margin</p>
                </div>
                <p className="text-3xl font-bold">{(ebitMargin * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Before interest & tax</p>
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
                  <p className="text-sm text-muted-foreground mb-1">{symbol} EBIT Margin</p>
                  <p className={`text-3xl font-bold ${marginRating.color}`}>{(ebitMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgEBITMargin * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior EBIT margins, indicating strong core business profitability.`
                    : `${symbol} has lower EBIT margins than ${sector || 'industry'} peers, suggesting opportunities for operational improvements.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* EBIT to Net Income Bridge */}
          {ebit > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">EBIT to Net Income Bridge</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-amber-500/20 rounded-lg border-2 border-amber-500/50">
                    <span className="text-sm font-bold">EBIT (Operating Earnings)</span>
                    <span className="font-bold text-amber-500">${(ebit / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                    <span className="text-sm">Less: Interest & Taxes</span>
                    <span className="font-bold text-red-500">-${((ebit - netIncome) / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg border-2 border-blue-500/50">
                    <span className="text-sm font-bold">Net Income</span>
                    <span className={`font-bold ${netIncome >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      ${netIncome >= 0 ? '' : '-'}${(Math.abs(netIncome) / 1e9).toFixed(2)}B
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">EBIT Margin</p>
                    <p className="text-xl font-bold">{(ebitMargin * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Interest & Tax Burden</p>
                    <p className="text-xl font-bold">{(interestAndTaxBurden * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* What EBIT Margin Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What EBIT Margin Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Core Operating Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    {ebitMargin > 0.20
                      ? `${symbol}'s EBIT margin of ${(ebitMargin * 100).toFixed(1)}% indicates excellent core business profitability before financing decisions. ${companyName} generates strong operating earnings.`
                      : ebitMargin > 0
                      ? `${symbol}'s EBIT margin of ${(ebitMargin * 100).toFixed(1)}% shows profitable operations, with room for improvement in operational efficiency.`
                      : `${symbol}'s negative EBIT margin indicates core business losses that need to be addressed regardless of capital structure.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Structure Neutrality</h3>
                  <p className="text-sm text-muted-foreground">
                    EBIT margin allows comparing ${symbol} to peers regardless of debt levels or tax rates. The ${((ebitMargin - netMargin) * 100).toFixed(1)}% difference between EBIT and net margin shows {interestAndTaxBurden > 0.30 ? 'significant' : interestAndTaxBurden > 0.15 ? 'moderate' : 'minimal'} impact from financing and taxes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Debt Servicing Capacity</h3>
                  <p className="text-sm text-muted-foreground">
                    {ebitMargin > 0.15
                      ? `High EBIT margins provide ${companyName} with substantial capacity to service debt obligations and invest in growth.`
                      : ebitMargin > 0
                      ? `Moderate EBIT margins provide adequate debt servicing capacity but limit financial flexibility.`
                      : `Negative EBIT margins raise concerns about ${companyName}'s ability to service debt and achieve sustainable profitability.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Benchmarking</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `EBIT margins significantly above industry peers indicate ${companyName} has operational excellence and competitive advantages.`
                      : vsIndustry < -0.05
                      ? `EBIT margins below peers suggest operational inefficiencies or heavy investments not yet generating returns.`
                      : `EBIT margins in line with industry indicate ${symbol} is competitively positioned without clear operational advantages.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {ebitMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> EBIT margin analysis is based on publicly available financial data and should not be considered financial advice. EBIT calculations may vary slightly depending on methodology. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ebit-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
