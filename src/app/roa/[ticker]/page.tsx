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
    title: `${symbol} ROA - Return on Assets Analysis & Efficiency Metrics`,
    description: `${symbol} Return on Assets (ROA) analysis. View ROA, asset efficiency metrics, compare to industry averages, and understand what ROA means for investors.`,
    keywords: [
      `${symbol} ROA`,
      `${symbol} return on assets`,
      `${symbol} asset efficiency`,
      `${symbol} profitability`,
      `${symbol} asset turnover`,
      `${symbol} operational efficiency`,
    ],
    openGraph: {
      title: `${symbol} ROA - Return on Assets Analysis`,
      description: `Complete ROA analysis for ${symbol} including asset efficiency metrics and industry comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/roa/${ticker.toLowerCase()}`,
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

function getRatingLabel(roa: number): { label: string; color: string; description: string } {
  if (roa >= 0.15) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding asset efficiency'
  }
  if (roa >= 0.10) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong asset utilization'
  }
  if (roa >= 0.05) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid asset returns'
  }
  if (roa >= 0.02) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Below average efficiency'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Low asset efficiency'
  }
}

export default async function ROAPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, balanceSheets, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/roa/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get profitability metrics
  const roa = metrics?.return_on_assets || 0
  const roe = metrics?.return_on_equity || 0
  const roic = metrics?.return_on_invested_capital || 0
  const netMargin = metrics?.net_margin || 0
  const assetTurnover = metrics?.asset_turnover || 0

  // Get latest financial data
  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]
  const netIncome = latestIncome?.net_income || 0
  const totalAssets = latestBalance?.total_assets || 0

  // Industry average estimates
  const industryAvgROA = sector === 'Technology' ? 0.12 :
                         sector === 'Financials' ? 0.01 :
                         sector === 'Healthcare' ? 0.08 :
                         sector === 'Energy' ? 0.05 :
                         0.06 // Default

  const roaRating = getRatingLabel(roa)
  const vsIndustry = roa - industryAvgROA
  const vsIndustryPercent = ((vsIndustry / industryAvgROA) * 100).toFixed(1)

  // Generate ROA FAQs
  const roaFaqs = [
    {
      question: `What is ${symbol} ROA (Return on Assets)?`,
      answer: `${symbol}'s Return on Assets (ROA) is ${(roa * 100).toFixed(1)}%, which is considered ${roaRating.label.toLowerCase()}. ROA measures how efficiently ${companyName} uses its assets to generate profit. ${roa > 0 ? `For every dollar of assets, ${symbol} generates ${(roa * 100).toFixed(1)} cents in profit.` : `A negative ROA indicates the company is not generating positive returns from its assets.`}`
    },
    {
      question: `Is ${symbol} ROA good or bad?`,
      answer: `${symbol}'s ROA of ${(roa * 100).toFixed(1)}% is ${roaRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgROA * 100).toFixed(1)}%. ${roaRating.description}. ${vsIndustry > 0 ? `${symbol} is outperforming peers by ${Math.abs(parseFloat(vsIndustryPercent))}%.` : `It trails industry peers by ${Math.abs(parseFloat(vsIndustryPercent))}%.`}`
    },
    {
      question: `What is the difference between ROA, ROE, and ROIC?`,
      answer: `ROA (Return on Assets) at ${(roa * 100).toFixed(1)}% measures how efficiently ${symbol} uses all its assets. ROE (Return on Equity) at ${(roe * 100).toFixed(1)}% measures returns on shareholder equity only. ROIC (Return on Invested Capital) at ${(roic * 100).toFixed(1)}% shows returns on both equity and debt capital. ROA is the broadest measure of asset efficiency.`
    },
    {
      question: `How does ${symbol} improve ROA?`,
      answer: `${symbol} can improve its ${(roa * 100).toFixed(1)}% ROA by: (1) increasing profitability through higher margins or revenue growth, (2) improving asset turnover by generating more sales from existing assets, or (3) divesting underperforming or non-core assets. The current asset turnover of ${assetTurnover.toFixed(2)}x and net margin of ${(netMargin * 100).toFixed(1)}% indicate where ${companyName} stands on these metrics.`
    },
    {
      question: `Should I invest in ${symbol} based on ROA?`,
      answer: `While ${symbol}'s ROA of ${(roa * 100).toFixed(1)}% is ${roaRating.label.toLowerCase()}, ROA alone shouldn't determine investment decisions. ${roa > 0.10 ? 'High ROA indicates efficient asset management and strong operational performance.' : roa > 0 ? 'Moderate ROA suggests room for operational improvements.' : 'Negative ROA indicates profitability concerns that require investigation.'} Consider ROA alongside growth prospects, competitive position, valuation, and industry trends before investing.`
    },
    {
      question: `Why is ${symbol} ROA important?`,
      answer: `ROA reveals how well ${companyName} converts its investments in assets into profits. A higher ROA means the company needs less capital to generate earnings, which is especially important in capital-intensive industries. ${symbol}'s ${(roa * 100).toFixed(1)}% ROA ${roa > industryAvgROA ? 'suggests competitive advantages in asset efficiency' : 'indicates potential for operational optimization'} compared to ${sector || 'industry'} peers.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ROA`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ROA - Return on Assets Analysis`,
    description: `Complete ROA analysis for ${symbol} (${companyName}) including asset efficiency metrics and industry comparisons.`,
    url: pageUrl,
    keywords: [
      `${symbol} ROA`,
      `${symbol} return on assets`,
      `${symbol} asset efficiency`,
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

  const faqSchema = getFAQSchema(roaFaqs)

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
            <span>{symbol} ROA</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ROA - Return on Assets
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Asset efficiency analysis for {companyName}
          </p>

          {/* Current Price & ROA Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30">
              <p className="text-muted-foreground mb-1">Return on Assets (ROA)</p>
              <p className={`text-4xl font-bold ${roaRating.color}`}>{(roa * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{roaRating.label} - {roaRating.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Efficiency Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Assets</p>
                </div>
                <p className="text-3xl font-bold">{(roa * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Profit per dollar of assets</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Equity</p>
                </div>
                <p className="text-3xl font-bold">{(roe * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Profit per dollar of equity</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Invested Capital</p>
                </div>
                <p className="text-3xl font-bold">{(roic * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Profit per dollar invested</p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Comparison</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{symbol} ROA</p>
                  <p className={`text-3xl font-bold ${roaRating.color}`}>{(roa * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgROA * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior asset efficiency.`
                    : `${symbol} is underperforming ${sector || 'industry'} peers, suggesting room for operational improvements.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ROA Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ROA Breakdown</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-6">
                ROA can be decomposed into two key components:
                <br />
                <span className="font-mono text-xs mt-2 block">ROA = Net Profit Margin × Asset Turnover</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Net Profit Margin</p>
                  <p className="text-2xl font-bold">{(netMargin * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {netMargin > 0.15 ? 'Strong pricing power' : netMargin > 0.05 ? 'Moderate profitability' : 'Thin margins'}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Asset Turnover</p>
                  <p className="text-2xl font-bold">{assetTurnover.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {assetTurnover > 1 ? 'Efficient asset use' : 'Capital intensive'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm font-mono">
                  {(roa * 100).toFixed(1)}% = {(netMargin * 100).toFixed(1)}% × {assetTurnover.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* What ROA Means for Investors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What ROA Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Asset Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    {roa > 0.10
                      ? `${symbol}'s high ROA of ${(roa * 100).toFixed(1)}% indicates excellent asset efficiency. The company generates strong returns from its asset base.`
                      : roa > 0
                      ? `${symbol}'s ROA of ${(roa * 100).toFixed(1)}% shows moderate asset efficiency. There may be opportunities to optimize asset utilization.`
                      : `${symbol}'s negative ROA indicates the company is not generating positive returns from its assets, which is a concern for investors.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    {roa > 0.10
                      ? `High ROA means ${companyName} requires less capital to generate profits, making it more capital-efficient than peers.`
                      : `Lower ROA suggests ${symbol} may be more capital-intensive, requiring significant asset investments to maintain growth.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Operational Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.02
                      ? `ROA above industry average indicates ${companyName} has operational advantages in managing its asset base efficiently.`
                      : vsIndustry < -0.02
                      ? `ROA below industry peers may signal operational inefficiencies or heavy capital investments not yet generating returns.`
                      : `${symbol}'s ROA is roughly in line with industry peers, suggesting average operational efficiency.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Data */}
          {(netIncome || totalAssets) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">ROA Calculation Data</h2>
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
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold">
                      ${(totalAssets / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    ROA = (Net Income / Total Assets) × 100
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {roaFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ROA analysis is based on publicly available financial data and should not be considered financial advice. Asset efficiency metrics should be analyzed in the context of industry norms and business models. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="roa" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
