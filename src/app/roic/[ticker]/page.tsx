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
    title: `${symbol} ROIC - Return on Invested Capital Analysis & Value Creation`,
    description: `${symbol} Return on Invested Capital (ROIC) analysis. View ROIC, capital efficiency metrics, compare to WACC, and understand value creation for investors.`,
    keywords: [
      `${symbol} ROIC`,
      `${symbol} return on invested capital`,
      `${symbol} capital efficiency`,
      `${symbol} value creation`,
      `${symbol} WACC`,
      `${symbol} economic profit`,
    ],
    openGraph: {
      title: `${symbol} ROIC - Return on Invested Capital Analysis`,
      description: `Complete ROIC analysis for ${symbol} including capital efficiency and value creation metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/roic/${ticker.toLowerCase()}`,
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

function getRatingLabel(roic: number): { label: string; color: string; description: string } {
  if (roic >= 0.20) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding value creation'
  }
  if (roic >= 0.15) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong capital returns'
  }
  if (roic >= 0.10) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid capital efficiency'
  }
  if (roic >= 0.05) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Marginal value creation'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Capital destruction risk'
  }
}

export default async function ROICPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, balanceSheets, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/roic/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get profitability metrics
  const roic = metrics?.return_on_invested_capital || 0
  const roe = metrics?.return_on_equity || 0
  const roa = metrics?.return_on_assets || 0
  const netMargin = metrics?.net_margin || 0

  // Get latest financial data
  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]
  const netIncome = latestIncome?.net_income || 0
  const totalEquity = latestBalance?.shareholders_equity || 0
  const totalDebt = latestBalance?.total_debt || 0
  const investedCapital = totalEquity + totalDebt

  // Estimated WACC (simplified - typically 8-12% for most companies)
  const estimatedWACC = sector === 'Technology' ? 0.09 :
                        sector === 'Utilities' ? 0.06 :
                        sector === 'Financials' ? 0.08 :
                        0.08 // Default

  // Industry average estimates
  const industryAvgROIC = sector === 'Technology' ? 0.20 :
                          sector === 'Financials' ? 0.08 :
                          sector === 'Healthcare' ? 0.15 :
                          sector === 'Energy' ? 0.08 :
                          0.12 // Default

  const roicRating = getRatingLabel(roic)
  const vsIndustry = roic - industryAvgROIC
  const vsIndustryPercent = ((vsIndustry / industryAvgROIC) * 100).toFixed(1)
  const vsWACC = roic - estimatedWACC
  const creatingValue = vsWACC > 0

  // Generate ROIC FAQs
  const roicFaqs = [
    {
      question: `What is ${symbol} ROIC (Return on Invested Capital)?`,
      answer: `${symbol}'s Return on Invested Capital (ROIC) is ${(roic * 100).toFixed(1)}%, which is considered ${roicRating.label.toLowerCase()}. ROIC measures how efficiently ${companyName} generates returns from all capital invested (both equity and debt). ${roic > 0 ? `For every dollar of capital invested, ${symbol} generates ${(roic * 100).toFixed(1)} cents in profit.` : `A negative ROIC indicates the company is destroying capital value.`}`
    },
    {
      question: `Is ${symbol} ROIC good or bad?`,
      answer: `${symbol}'s ROIC of ${(roic * 100).toFixed(1)}% is ${roicRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgROIC * 100).toFixed(1)}%. ${roicRating.description}. ${creatingValue ? `ROIC exceeds the estimated cost of capital (${(estimatedWACC * 100).toFixed(1)}%), indicating ${symbol} creates value for shareholders.` : `ROIC is below the estimated cost of capital, suggesting value destruction.`}`
    },
    {
      question: `What is the difference between ROIC, ROE, and ROA?`,
      answer: `ROIC (Return on Invested Capital) at ${(roic * 100).toFixed(1)}% measures returns on all capital (equity + debt). ROE (Return on Equity) at ${(roe * 100).toFixed(1)}% measures returns only on shareholder equity. ROA (Return on Assets) at ${(roa * 100).toFixed(1)}% measures returns on total assets. ROIC is considered the best metric for measuring value creation as it accounts for all capital sources.`
    },
    {
      question: `How does ${symbol} create value with ROIC?`,
      answer: `${symbol} creates value when ROIC exceeds its Weighted Average Cost of Capital (WACC). With ROIC at ${(roic * 100).toFixed(1)}% and estimated WACC around ${(estimatedWACC * 100).toFixed(1)}%, ${symbol} ${creatingValue ? `is creating value with an economic spread of ${(vsWACC * 100).toFixed(1)}%` : `may be destroying value with a negative spread of ${(vsWACC * 100).toFixed(1)}%`}. The larger the positive spread, the more value created for shareholders.`
    },
    {
      question: `Should I invest in ${symbol} based on ROIC?`,
      answer: `While ${symbol}'s ROIC of ${(roic * 100).toFixed(1)}% is ${roicRating.label.toLowerCase()}, ROIC alone shouldn't determine investment decisions. ${roic > estimatedWACC + 0.05 ? 'High ROIC above WACC indicates strong competitive advantages and value creation.' : roic > estimatedWACC ? 'ROIC slightly above WACC suggests modest value creation.' : 'ROIC below WACC raises concerns about capital allocation and profitability.'} Consider ROIC trends over time, industry dynamics, growth opportunities, and valuation before investing.`
    },
    {
      question: `What drives ${symbol} ROIC performance?`,
      answer: `${symbol}'s ROIC is driven by: (1) Operating profitability - generating strong margins from operations, (2) Capital efficiency - minimizing capital requirements for growth, (3) Asset productivity - maximizing output from invested capital. ${sector ? `In the ${sector} sector, ` : ''}competitive advantages like brand strength, technology leadership, or economies of scale typically enable sustained high ROIC.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ROIC`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ROIC - Return on Invested Capital Analysis`,
    description: `Complete ROIC analysis for ${symbol} (${companyName}) including capital efficiency and value creation metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ROIC`,
      `${symbol} return on invested capital`,
      `${symbol} value creation`,
      `${symbol} capital efficiency`,
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

  const faqSchema = getFAQSchema(roicFaqs)

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
            <span>{symbol} ROIC</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ROIC - Return on Invested Capital
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Capital efficiency and value creation analysis for {companyName}
          </p>

          {/* Current Price & ROIC Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
              <p className="text-muted-foreground mb-1">Return on Invested Capital (ROIC)</p>
              <p className={`text-4xl font-bold ${roicRating.color}`}>{(roic * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{roicRating.label} - {roicRating.description}</p>
            </div>
          </div>

          {/* Value Creation Metric */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Value Creation Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ROIC</p>
                  <p className={`text-3xl font-bold ${roicRating.color}`}>{(roic * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. WACC</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(estimatedWACC * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Economic Spread</p>
                  <p className={`text-3xl font-bold ${creatingValue ? 'text-green-500' : 'text-red-500'}`}>
                    {vsWACC > 0 ? '+' : ''}{(vsWACC * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creatingValue ? 'Value Creation' : 'Value Destruction'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {creatingValue
                    ? `${symbol} is creating shareholder value as its ROIC of ${(roic * 100).toFixed(1)}% exceeds the cost of capital. Every dollar invested generates returns above what investors require.`
                    : `${symbol} may be destroying value as its ROIC of ${(roic * 100).toFixed(1)}% is below the estimated cost of capital. This suggests inefficient capital allocation.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Return Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Invested Capital</p>
                </div>
                <p className="text-3xl font-bold">{(roic * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Returns on all capital</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Equity</p>
                </div>
                <p className="text-3xl font-bold">{(roe * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Returns on equity only</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Assets</p>
                </div>
                <p className="text-3xl font-bold">{(roa * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Returns on total assets</p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{symbol} ROIC</p>
                  <p className={`text-3xl font-bold ${roicRating.color}`}>{(roic * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgROIC * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior capital efficiency and value creation.`
                    : `${symbol} is underperforming ${sector || 'industry'} peers, suggesting competitive disadvantages or capital allocation challenges.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* What ROIC Means for Investors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What ROIC Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Value Creation Power</h3>
                  <p className="text-sm text-muted-foreground">
                    {creatingValue
                      ? `${symbol}'s ROIC of ${(roic * 100).toFixed(1)}% exceeds its cost of capital, meaning every dollar invested creates value. This indicates strong competitive advantages and pricing power.`
                      : `${symbol}'s ROIC below cost of capital suggests the company may be destroying value. Management should focus on improving returns or returning capital to shareholders.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Moat</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `Sustained high ROIC above peers indicates ${companyName} has a durable competitive moat - barriers that protect profitability from competition.`
                      : vsIndustry < -0.05
                      ? `ROIC below industry average may indicate weak competitive positioning or an industry with generally poor economics.`
                      : `${symbol}'s ROIC is roughly in line with peers, suggesting average competitive dynamics in the ${sector || 'market'}.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Allocation</h3>
                  <p className="text-sm text-muted-foreground">
                    {roic > estimatedWACC + 0.05
                      ? `High ROIC suggests ${symbol} should reinvest cash flows into growth opportunities rather than returning capital, as it can generate superior returns.`
                      : `With ROIC near or below cost of capital, ${symbol} may create more value by returning cash to shareholders through dividends or buybacks rather than investing in marginal projects.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-yellow-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Long-term Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Companies with consistently high ROIC tend to outperform over the long term. ${symbol}'s ${roicRating.label.toLowerCase()} ROIC of ${(roic * 100).toFixed(1)}% ${roic > 0.15 ? 'suggests strong long-term wealth creation potential' : 'indicates the need to monitor capital allocation decisions closely'}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Data */}
          {investedCapital > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">ROIC Calculation Data</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${netIncome >= 0 ? '' : '-'}${(Math.abs(netIncome) / 1e9).toFixed(2)}B
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invested Capital</p>
                    <p className="text-2xl font-bold">
                      ${(investedCapital / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="text-xs text-muted-foreground">Equity</p>
                    <p className="font-mono">${(totalEquity / 1e9).toFixed(2)}B</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="text-xs text-muted-foreground">Debt</p>
                    <p className="font-mono">${(totalDebt / 1e9).toFixed(2)}B</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    ROIC = (Net Income / Invested Capital) × 100
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    where Invested Capital = Equity + Debt
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {roicFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ROIC analysis is based on publicly available financial data and estimated cost of capital. Actual WACC varies by company and market conditions. This should not be considered financial advice. Always conduct comprehensive research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="roic" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
