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
    color: 'text-[#4ebe96]',
    description: 'Outstanding asset efficiency'
  }
  if (roa >= 0.10) return {
    label: 'Very Good',
    color: 'text-[#4ebe96]',
    description: 'Strong asset utilization'
  }
  if (roa >= 0.05) return {
    label: 'Good',
    color: 'text-[#479ffa]',
    description: 'Solid asset returns'
  }
  if (roa >= 0.02) return {
    label: 'Fair',
    color: 'text-[#ffa16c]',
    description: 'Below average efficiency'
  }
  return {
    label: 'Poor',
    color: 'text-[#ff5c5c]',
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
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Stocks</Link>
            {' / '}
            <span>{symbol} ROA</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            {symbol} ROA - Return on Assets
          </h1>
          <p className="text-xl text-[#868f97] mb-8">
            Asset efficiency analysis for {companyName}
          </p>

          {/* Current Price & ROA Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-[#868f97] mb-1">Stock Price</p>
              <p className="text-4xl font-bold tabular-nums">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-[#868f97] mb-1">Return on Assets (ROA)</p>
              <p className={`text-4xl font-bold tabular-nums ${roaRating.color}`}>{(roa * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{roaRating.label} - {roaRating.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key Efficiency Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#479ffa]"></div>
                  <p className="text-sm text-[#868f97]">Return on Assets</p>
                </div>
                <p className="text-3xl font-bold tabular-nums">{(roa * 100).toFixed(1)}%</p>
                <p className="text-xs text-[#868f97] mt-2">Profit per dollar of assets</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ebe96]"></div>
                  <p className="text-sm text-[#868f97]">Return on Equity</p>
                </div>
                <p className="text-3xl font-bold tabular-nums">{(roe * 100).toFixed(1)}%</p>
                <p className="text-xs text-[#868f97] mt-2">Profit per dollar of equity</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-[#868f97]">Return on Invested Capital</p>
                </div>
                <p className="text-3xl font-bold tabular-nums">{(roic * 100).toFixed(1)}%</p>
                <p className="text-xs text-[#868f97] mt-2">Profit per dollar invested</p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Industry Comparison</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#868f97] mb-1">{symbol} ROA</p>
                  <p className={`text-3xl font-bold tabular-nums ${roaRating.color}`}>{(roa * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-[#868f97] mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold tabular-nums text-[#868f97]">{(industryAvgROA * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-[#868f97] mb-1">Difference</p>
                  <p className={`text-3xl font-bold tabular-nums ${vsIndustry > 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                    {vsIndustry > 0 ? '+' : ''}{(vsIndustry * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-[#868f97] mt-1 tabular-nums">
                    {vsIndustry > 0 ? 'Above' : 'Below'} industry by {Math.abs(parseFloat(vsIndustryPercent))}%
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/[0.08]">
                <p className="text-sm text-[#868f97]">
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
            <h2 className="text-2xl font-bold mb-4 text-balance">ROA Breakdown</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-sm text-[#868f97] mb-6">
                ROA can be decomposed into two key components:
                <br />
                <span className="font-mono text-xs mt-2 block">ROA = Net Profit Margin × Asset Turnover</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                  <p className="text-xs text-[#868f97] mb-1">Net Profit Margin</p>
                  <p className="text-2xl font-bold tabular-nums">{(netMargin * 100).toFixed(1)}%</p>
                  <p className="text-xs text-[#868f97] mt-2">
                    {netMargin > 0.15 ? 'Strong pricing power' : netMargin > 0.05 ? 'Moderate profitability' : 'Thin margins'}
                  </p>
                </div>
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                  <p className="text-xs text-[#868f97] mb-1">Asset Turnover</p>
                  <p className="text-2xl font-bold tabular-nums">{assetTurnover.toFixed(2)}x</p>
                  <p className="text-xs text-[#868f97] mt-2">
                    {assetTurnover > 1 ? 'Efficient asset use' : 'Capital intensive'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <p className="text-sm font-mono tabular-nums">
                  {(roa * 100).toFixed(1)}% = {(netMargin * 100).toFixed(1)}% × {assetTurnover.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* What ROA Means for Investors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">What ROA Means for Investors</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#479ffa]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#479ffa] text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Asset Efficiency</h3>
                  <p className="text-sm text-[#868f97]">
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
                <div className="w-6 h-6 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#4ebe96] text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Requirements</h3>
                  <p className="text-sm text-[#868f97]">
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
                  <p className="text-sm text-[#868f97]">
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
              <h2 className="text-2xl font-bold mb-4 text-balance">ROA Calculation Data</h2>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <p className="text-sm text-[#868f97] mb-4">Most Recent Quarter</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#868f97]">Net Income</p>
                    <p className={`text-2xl font-bold tabular-nums ${netIncome >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                      ${netIncome >= 0 ? '' : '-'}${(Math.abs(netIncome) / 1e9).toFixed(2)}B
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#868f97]">Total Assets</p>
                    <p className="text-2xl font-bold tabular-nums">
                      ${(totalAssets / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  <p className="text-xs text-[#868f97] mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    ROA = (Net Income / Total Assets) × 100
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <h2 className="text-2xl font-bold mb-4 text-balance">Analyze {symbol} in Depth</h2>
            <p className="text-[#868f97] mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-[#479ffa] hover:bg-[#479ffa]/80 text-white px-8 py-3 rounded-2xl font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] px-8 py-3 rounded-2xl font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {roaFaqs.map((faq, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-[#868f97] bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl mb-8">
            <p><strong>Disclaimer:</strong> ROA analysis is based on publicly available financial data and should not be considered financial advice. Asset efficiency metrics should be analyzed in the context of industry norms and business models. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="roa" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
