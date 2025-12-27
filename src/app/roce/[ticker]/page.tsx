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
    title: `${symbol} ROCE - Return on Capital Employed Analysis & Profitability`,
    description: `${symbol} Return on Capital Employed (ROCE) analysis. View ROCE metrics, capital efficiency, compare to industry peers, and understand profitability.`,
    keywords: [
      `${symbol} ROCE`,
      `${symbol} return on capital employed`,
      `${symbol} capital efficiency`,
      `${symbol} profitability`,
      `${symbol} operating efficiency`,
      `${symbol} capital productivity`,
    ],
    openGraph: {
      title: `${symbol} ROCE - Return on Capital Employed Analysis`,
      description: `Complete ROCE analysis for ${symbol} including capital efficiency and profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/roce/${ticker.toLowerCase()}`,
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

function getRatingLabel(roce: number): { label: string; color: string; description: string } {
  if (roce >= 0.20) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding capital productivity'
  }
  if (roce >= 0.15) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong capital returns'
  }
  if (roce >= 0.10) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid capital efficiency'
  }
  if (roce >= 0.05) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Below average returns'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Low capital productivity'
  }
}

export default async function ROCEPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, balanceSheets, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/roce/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate ROCE (EBIT / Capital Employed)
  // Capital Employed = Total Assets - Current Liabilities
  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]

  const ebit = latestIncome?.ebit || latestIncome?.operating_income || 0
  const totalAssets = latestBalance?.total_assets || 0
  const currentLiabilities = latestBalance?.current_liabilities || 0
  const capitalEmployed = totalAssets - currentLiabilities

  const roce = capitalEmployed > 0 ? ebit / capitalEmployed : 0

  // Get other profitability metrics
  const roe = metrics?.return_on_equity || 0
  const roa = metrics?.return_on_assets || 0
  const roic = metrics?.return_on_invested_capital || 0
  const netMargin = metrics?.net_margin || 0

  // Industry average estimates
  const industryAvgROCE = sector === 'Technology' ? 0.18 :
                          sector === 'Financials' ? 0.08 :
                          sector === 'Healthcare' ? 0.15 :
                          sector === 'Energy' ? 0.10 :
                          0.12 // Default

  const roceRating = getRatingLabel(roce)
  const vsIndustry = roce - industryAvgROCE
  const vsIndustryPercent = ((vsIndustry / industryAvgROCE) * 100).toFixed(1)

  // Generate ROCE FAQs
  const roceFaqs = [
    {
      question: `What is ${symbol} ROCE (Return on Capital Employed)?`,
      answer: `${symbol}'s Return on Capital Employed (ROCE) is ${(roce * 100).toFixed(1)}%, which is considered ${roceRating.label.toLowerCase()}. ROCE measures how efficiently ${companyName} generates operating profits from the capital employed in its business. ${roce > 0 ? `For every dollar of capital employed, ${symbol} generates ${(roce * 100).toFixed(1)} cents in operating profit (EBIT).` : `A negative ROCE indicates the company is not generating positive operating returns.`}`
    },
    {
      question: `Is ${symbol} ROCE good or bad?`,
      answer: `${symbol}'s ROCE of ${(roce * 100).toFixed(1)}% is ${roceRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgROCE * 100).toFixed(1)}%. ${roceRating.description}. ${vsIndustry > 0 ? `${symbol} is outperforming peers by ${Math.abs(parseFloat(vsIndustryPercent))}%, indicating superior capital efficiency.` : `It trails industry peers by ${Math.abs(parseFloat(vsIndustryPercent))}%, suggesting room for improvement.`}`
    },
    {
      question: `What is the difference between ROCE, ROIC, and ROE?`,
      answer: `ROCE (Return on Capital Employed) at ${(roce * 100).toFixed(1)}% measures operating profit (EBIT) relative to long-term capital. ROIC (Return on Invested Capital) at ${(roic * 100).toFixed(1)}% uses net operating profit after tax and all invested capital. ROE (Return on Equity) at ${(roe * 100).toFixed(1)}% measures net income relative to shareholder equity only. ROCE focuses on operating efficiency before financing costs.`
    },
    {
      question: `How is ${symbol} ROCE calculated?`,
      answer: `${symbol}'s ROCE is calculated as: EBIT / Capital Employed × 100. EBIT (Earnings Before Interest and Tax) is ${(ebit / 1e9).toFixed(2)}B, and Capital Employed (Total Assets - Current Liabilities) is ${(capitalEmployed / 1e9).toFixed(2)}B. This gives a ROCE of ${(roce * 100).toFixed(1)}%, showing ${roceRating.description.toLowerCase()}.`
    },
    {
      question: `Should I invest in ${symbol} based on ROCE?`,
      answer: `While ${symbol}'s ROCE of ${(roce * 100).toFixed(1)}% is ${roceRating.label.toLowerCase()}, ROCE alone shouldn't determine investment decisions. ${roce > 0.15 ? 'High ROCE indicates efficient capital management and strong competitive positioning.' : roce > 0 ? 'Moderate ROCE suggests average capital productivity.' : 'Negative ROCE raises concerns about operational profitability.'} Consider ROCE trends over time, along with growth prospects, industry dynamics, and valuation before investing.`
    },
    {
      question: `Why is ROCE important for ${symbol} investors?`,
      answer: `ROCE is crucial because it shows how well ${companyName} generates operating profits from its long-term capital base. Unlike ROE, ROCE isn't distorted by capital structure or one-time items. A consistently high ROCE ${roce > industryAvgROCE ? 'like ' + symbol + "'s" : ''} suggests strong competitive advantages, pricing power, and operational excellence. ${sector ? `In the ${sector} sector, ` : ''}ROCE helps identify companies that efficiently deploy capital for growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ROCE`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ROCE - Return on Capital Employed Analysis`,
    description: `Complete ROCE analysis for ${symbol} (${companyName}) including capital efficiency and profitability metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ROCE`,
      `${symbol} return on capital employed`,
      `${symbol} capital efficiency`,
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

  const faqSchema = getFAQSchema(roceFaqs)

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
            <span>{symbol} ROCE</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ROCE - Return on Capital Employed
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Capital productivity and operating efficiency analysis for {companyName}
          </p>

          {/* Current Price & ROCE Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-500/30">
              <p className="text-muted-foreground mb-1">Return on Capital Employed (ROCE)</p>
              <p className={`text-4xl font-bold ${roceRating.color}`}>{(roce * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{roceRating.label} - {roceRating.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Return Metrics Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <p className="text-sm text-muted-foreground">ROCE</p>
                </div>
                <p className="text-3xl font-bold">{(roce * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Operating returns</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">ROIC</p>
                </div>
                <p className="text-3xl font-bold">{(roic * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">After-tax returns</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">ROE</p>
                </div>
                <p className="text-3xl font-bold">{(roe * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Equity returns</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">ROA</p>
                </div>
                <p className="text-3xl font-bold">{(roa * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Asset returns</p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{symbol} ROCE</p>
                  <p className={`text-3xl font-bold ${roceRating.color}`}>{(roce * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgROCE * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior capital productivity and operating efficiency.`
                    : `${symbol} is underperforming ${sector || 'industry'} peers, indicating potential operational inefficiencies or capital allocation issues.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* What ROCE Means for Investors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What ROCE Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Operating Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    {roce > 0.15
                      ? `${symbol}'s high ROCE of ${(roce * 100).toFixed(1)}% demonstrates excellent operating efficiency. ${companyName} generates strong operating profits from its long-term capital base.`
                      : roce > 0
                      ? `${symbol}'s ROCE of ${(roce * 100).toFixed(1)}% shows moderate operating efficiency. There may be opportunities to improve capital productivity.`
                      : `${symbol}'s negative ROCE indicates operational challenges and inefficient capital deployment.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Positioning</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `ROCE significantly above industry average suggests ${companyName} has durable competitive advantages that enable superior capital returns.`
                      : vsIndustry < -0.05
                      ? `ROCE below peers may indicate competitive pressures, operational inefficiencies, or heavy investments not yet generating returns.`
                      : `${symbol}'s ROCE is roughly in line with ${sector || 'industry'} peers, suggesting average competitive dynamics.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Allocation Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    {roce > 0.15
                      ? `High ROCE indicates management is making excellent capital allocation decisions, investing in projects that generate strong returns.`
                      : `ROCE levels suggest management should carefully evaluate capital allocation strategies and focus on higher-return opportunities.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Long-term Sustainability</h3>
                  <p className="text-sm text-muted-foreground">
                    Consistently high ROCE is often sustainable only with strong competitive moats. ${symbol}'s ${roceRating.label.toLowerCase()} ROCE of ${(roce * 100).toFixed(1)}% ${roce > 0.15 ? 'suggests durable competitive advantages' : 'should be monitored for improvement trends'}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Data */}
          {capitalEmployed > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">ROCE Calculation Data</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">Most Recent Quarter</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">EBIT (Operating Income)</p>
                    <p className={`text-2xl font-bold ${ebit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${ebit >= 0 ? '' : '-'}${(Math.abs(ebit) / 1e9).toFixed(2)}B
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capital Employed</p>
                    <p className="text-2xl font-bold">
                      ${(capitalEmployed / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="text-xs text-muted-foreground">Total Assets</p>
                    <p className="font-mono">${(totalAssets / 1e9).toFixed(2)}B</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded">
                    <p className="text-xs text-muted-foreground">Current Liabilities</p>
                    <p className="font-mono">${(currentLiabilities / 1e9).toFixed(2)}B</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    ROCE = (EBIT / Capital Employed) × 100
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    where Capital Employed = Total Assets - Current Liabilities
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {roceFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ROCE analysis is based on publicly available financial data and should not be considered financial advice. ROCE calculations may vary based on methodology. Always conduct comprehensive research and consult financial professionals before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="roce" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
