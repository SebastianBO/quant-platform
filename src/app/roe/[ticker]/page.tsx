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
    title: `${symbol} ROE - Return on Equity Analysis & Profitability Metrics`,
    description: `${symbol} Return on Equity (ROE) analysis. View ROE, ROA, ROIC metrics, compare to industry averages, and understand what profitability means for investors.`,
    keywords: [
      `${symbol} ROE`,
      `${symbol} return on equity`,
      `${symbol} profitability`,
      `${symbol} ROA`,
      `${symbol} ROIC`,
      `${symbol} return on assets`,
      `${symbol} return on invested capital`,
    ],
    openGraph: {
      title: `${symbol} ROE - Return on Equity Analysis`,
      description: `Complete ROE analysis for ${symbol} including ROA, ROIC, and industry comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/roe/${ticker.toLowerCase()}`,
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

function getRatingLabel(roe: number): { label: string; color: string; description: string } {
  if (roe >= 0.20) return {
    label: 'Excellent',
    color: 'text-green-500',
    description: 'Outstanding capital efficiency'
  }
  if (roe >= 0.15) return {
    label: 'Very Good',
    color: 'text-green-400',
    description: 'Strong profitability'
  }
  if (roe >= 0.10) return {
    label: 'Good',
    color: 'text-blue-500',
    description: 'Solid returns'
  }
  if (roe >= 0.05) return {
    label: 'Fair',
    color: 'text-yellow-500',
    description: 'Below average efficiency'
  }
  return {
    label: 'Poor',
    color: 'text-red-500',
    description: 'Low capital efficiency'
  }
}

export default async function ROEPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, balanceSheets, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/roe/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get profitability metrics
  const roe = metrics?.return_on_equity || 0
  const roa = metrics?.return_on_assets || 0
  const roic = metrics?.return_on_invested_capital || 0
  const netMargin = metrics?.net_margin || 0
  const assetTurnover = metrics?.asset_turnover || 0
  const equityMultiplier = metrics?.equity_multiplier || 0

  // Get latest financial data
  const latestIncome = incomeStatements?.[0]
  const latestBalance = balanceSheets?.[0]
  const netIncome = latestIncome?.net_income || 0
  const shareholdersEquity = latestBalance?.shareholders_equity || 0

  // Industry average estimates (these would ideally come from a database)
  const industryAvgROE = sector === 'Technology' ? 0.18 :
                         sector === 'Financials' ? 0.12 :
                         sector === 'Healthcare' ? 0.15 :
                         sector === 'Energy' ? 0.10 :
                         0.12 // Default

  const roeRating = getRatingLabel(roe)
  const vsIndustry = roe - industryAvgROE
  const vsIndustryPercent = ((vsIndustry / industryAvgROE) * 100).toFixed(1)

  // Generate ROE FAQs
  const roeFaqs = [
    {
      question: `What is ${symbol} ROE (Return on Equity)?`,
      answer: `${symbol}'s Return on Equity (ROE) is ${(roe * 100).toFixed(1)}%, which is considered ${roeRating.label.toLowerCase()}. ROE measures how efficiently ${companyName} generates profit from shareholders' equity. ${roe > 0 ? `For every dollar of equity, ${symbol} generates ${(roe * 100).toFixed(1)} cents in profit.` : `A negative ROE indicates the company is not profitable.`}`
    },
    {
      question: `Is ${symbol} ROE good or bad?`,
      answer: `${symbol}'s ROE of ${(roe * 100).toFixed(1)}% is ${roeRating.label.toLowerCase()} and ${vsIndustry > 0 ? 'above' : 'below'} the ${sector || 'industry'} average of approximately ${(industryAvgROE * 100).toFixed(1)}%. ${roeRating.description}. ${vsIndustry > 0 ? `${symbol} is outperforming peers by ${Math.abs(parseFloat(vsIndustryPercent))}%.` : `It trails industry peers by ${Math.abs(parseFloat(vsIndustryPercent))}%.`}`
    },
    {
      question: `What is the difference between ROE, ROA, and ROIC?`,
      answer: `ROE (Return on Equity) at ${(roe * 100).toFixed(1)}% measures returns on shareholder equity. ROA (Return on Assets) at ${(roa * 100).toFixed(1)}% measures how efficiently ${symbol} uses its total assets. ROIC (Return on Invested Capital) at ${(roic * 100).toFixed(1)}% shows returns on all capital invested, including debt. All three metrics help evaluate ${companyName}'s profitability from different angles.`
    },
    {
      question: `How does ${symbol} generate its ROE?`,
      answer: `${symbol} generates its ${(roe * 100).toFixed(1)}% ROE through the DuPont formula: Net Margin (${(netMargin * 100).toFixed(1)}%) × Asset Turnover (${assetTurnover.toFixed(2)}) × Equity Multiplier (${equityMultiplier.toFixed(2)}). This shows ${netMargin > 0.15 ? 'strong pricing power and cost control' : netMargin > 0.05 ? 'moderate profitability' : 'thin profit margins'}, ${assetTurnover > 1 ? 'efficient asset utilization' : 'capital-intensive operations'}, and ${equityMultiplier > 2 ? 'significant financial leverage' : 'conservative capital structure'}.`
    },
    {
      question: `Should I invest in ${symbol} based on ROE?`,
      answer: `While ${symbol}'s ROE of ${(roe * 100).toFixed(1)}% is ${roeRating.label.toLowerCase()}, ROE alone shouldn't determine investment decisions. ${roe > 0.15 ? 'High ROE can indicate competitive advantages and efficient management.' : roe > 0 ? 'Moderate ROE suggests steady but unexceptional returns.' : 'Negative ROE indicates profitability concerns that require investigation.'} Consider ROE alongside other metrics like debt levels, growth rates, valuation multiples, and industry trends before investing.`
    },
    {
      question: `What factors affect ${symbol} Return on Equity?`,
      answer: `${symbol}'s ROE is affected by three key drivers: (1) Profitability - net margins from pricing power and cost management, (2) Efficiency - how well ${companyName} uses its assets to generate sales, and (3) Leverage - the amount of debt used to finance operations. ${sector ? `${sector} sector dynamics, ` : ''}competitive positioning, management quality, and economic conditions all impact these drivers.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ROE`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ROE - Return on Equity Analysis`,
    description: `Complete ROE analysis for ${symbol} (${companyName}) including profitability metrics and industry comparisons.`,
    url: pageUrl,
    keywords: [
      `${symbol} ROE`,
      `${symbol} return on equity`,
      `${symbol} profitability`,
      `${symbol} ROA`,
      `${symbol} ROIC`,
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

  const faqSchema = getFAQSchema(roeFaqs)

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
            <span>{symbol} ROE</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ROE - Return on Equity
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Profitability analysis for {companyName}
          </p>

          {/* Current Price & ROE Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-1">Stock Price</p>
              <p className="text-4xl font-bold">${snapshot.price?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}% today
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 p-6 rounded-xl border border-green-500/30">
              <p className="text-muted-foreground mb-1">Return on Equity (ROE)</p>
              <p className={`text-4xl font-bold ${roeRating.color}`}>{(roe * 100).toFixed(1)}%</p>
              <p className="text-sm mt-2">{roeRating.label} - {roeRating.description}</p>
            </div>
          </div>

          {/* Key Profitability Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Profitability Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Return on Assets</p>
                </div>
                <p className="text-3xl font-bold">{(roa * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Profit per dollar of assets</p>
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
                  <p className="text-sm text-muted-foreground mb-1">{symbol} ROE</p>
                  <p className={`text-3xl font-bold ${roeRating.color}`}>{(roe * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{sector || 'Industry'} Average</p>
                  <p className="text-3xl font-bold text-muted-foreground">{(industryAvgROE * 100).toFixed(1)}%</p>
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
                    ? `${symbol} is outperforming ${sector || 'industry'} peers with superior capital efficiency and profitability.`
                    : `${symbol} is underperforming ${sector || 'industry'} peers, suggesting potential for operational improvements.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* DuPont Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DuPont Analysis - ROE Breakdown</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-6">
                ROE can be decomposed into three components using the DuPont formula:
                <br />
                <span className="font-mono text-xs mt-2 block">ROE = Net Margin × Asset Turnover × Equity Multiplier</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Equity Multiplier</p>
                  <p className="text-2xl font-bold">{equityMultiplier.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {equityMultiplier > 2 ? 'High leverage' : 'Conservative'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm font-mono">
                  {(roe * 100).toFixed(1)}% = {(netMargin * 100).toFixed(1)}% × {assetTurnover.toFixed(2)} × {equityMultiplier.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* What ROE Means for Investors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What ROE Means for Investors</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Capital Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    {roe > 0.15
                      ? `${symbol}'s high ROE of ${(roe * 100).toFixed(1)}% indicates excellent capital efficiency. Management is generating strong returns on shareholder investments.`
                      : roe > 0
                      ? `${symbol}'s ROE of ${(roe * 100).toFixed(1)}% shows moderate capital efficiency. There may be room for improvement in profitability.`
                      : `${symbol}'s negative ROE indicates the company is not generating positive returns on equity, which is a red flag for investors.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Competitive Advantage</h3>
                  <p className="text-sm text-muted-foreground">
                    {vsIndustry > 0.05
                      ? `Consistently high ROE above industry peers suggests ${companyName} has durable competitive advantages like brand strength, pricing power, or operational excellence.`
                      : vsIndustry < -0.05
                      ? `ROE below industry average may indicate competitive pressures, operational inefficiencies, or industry headwinds affecting ${companyName}.`
                      : `${symbol}'s ROE is roughly in line with industry peers, suggesting average competitive positioning in the ${sector || 'market'}.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Growth Potential</h3>
                  <p className="text-sm text-muted-foreground">
                    {roe > 0.15
                      ? `High ROE companies can fund growth internally by reinvesting profits. ${symbol} may not need to raise external capital for expansion, which is investor-friendly.`
                      : `With moderate ROE, ${symbol} may need external financing or debt to fund significant growth initiatives, potentially diluting shareholders or increasing leverage.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-yellow-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Leverage Consideration</h3>
                  <p className="text-sm text-muted-foreground">
                    {equityMultiplier > 3
                      ? `Be cautious: ${symbol}'s high equity multiplier of ${equityMultiplier.toFixed(1)}x means ROE is boosted by significant debt leverage, which increases financial risk.`
                      : equityMultiplier > 2
                      ? `${symbol} uses moderate leverage (${equityMultiplier.toFixed(1)}x equity multiplier), which amplifies returns but also adds some financial risk.`
                      : `${symbol} has conservative leverage (${equityMultiplier.toFixed(1)}x equity multiplier), suggesting the ROE reflects genuine operational efficiency rather than financial engineering.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Data */}
          {(netIncome || shareholdersEquity) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">ROE Calculation Data</h2>
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
                    <p className="text-sm text-muted-foreground">Shareholders Equity</p>
                    <p className="text-2xl font-bold">
                      ${(shareholdersEquity / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-sm font-mono">
                    ROE = (Net Income / Shareholders Equity) × 100
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} in Depth</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, quant models, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {roeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ROE analysis is based on publicly available financial data and should not be considered financial advice. High ROE can be misleading if driven primarily by excessive leverage. Always analyze multiple metrics and consider your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="roe" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
