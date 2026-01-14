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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Free Cash Flow Margin - FCF Margin ${currentYear}`,
    description: `${symbol} free cash flow margin analysis: track FCF margin trends, cash generation efficiency, and profitability metrics for ${symbol}.`,
    keywords: [
      `${symbol} FCF margin`,
      `${symbol} free cash flow margin`,
      `${symbol} cash flow margin`,
      `${symbol} FCF`,
      `${symbol} cash generation`,
      `${symbol} profitability`,
    ],
    openGraph: {
      title: `${symbol} Free Cash Flow Margin ${currentYear} | FCF Margin`,
      description: `Complete ${symbol} FCF margin analysis with cash generation trends, profitability metrics, and efficiency ratios.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/free-cash-flow-margin/${ticker.toLowerCase()}`,
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

export default async function FreeCashFlowMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, cashFlowStatements, incomeStatements, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/free-cash-flow-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest cash flow data
  const latestCF = cashFlowStatements?.[0]
  const latestIncome = incomeStatements?.[0]
  const operatingCF = latestCF?.operating_cash_flow || 0
  const capex = Math.abs(latestCF?.capital_expenditure || 0)
  const freeCashFlow = operatingCF - capex
  const revenue = latestIncome?.revenue || 1
  const fcfMargin = (freeCashFlow / revenue) * 100

  const latestPeriod = latestCF?.report_period || ''

  // Calculate trends
  const previousCF = cashFlowStatements?.[1]
  const previousIncome = incomeStatements?.[1]
  const previousFCF = previousCF ? (previousCF.operating_cash_flow - Math.abs(previousCF.capital_expenditure || 0)) : 0
  const previousRevenue = previousIncome?.revenue || 1
  const previousFCFMargin = (previousFCF / previousRevenue) * 100
  const marginChange = fcfMargin - previousFCFMargin

  // Generate FCF Margin FAQs
  const fcfMarginFaqs = [
    {
      question: `What is ${symbol}'s free cash flow margin?`,
      answer: `${companyName} has a free cash flow margin of ${fcfMargin.toFixed(1)}% as of ${latestPeriod}. This means the company generates $${fcfMargin.toFixed(2)} in free cash flow for every $100 of revenue. ${fcfMargin > 20 ? 'This is a strong margin indicating efficient cash generation.' : fcfMargin > 10 ? 'This is a healthy margin for sustainable growth.' : 'This suggests the company is investing heavily or facing margin pressure.'}`
    },
    {
      question: `How is free cash flow margin calculated?`,
      answer: `Free cash flow margin is calculated as: (Free Cash Flow / Revenue) × 100. For ${companyName}, this is: (Operating Cash Flow - Capital Expenditures) / Revenue × 100. This metric shows how efficiently revenue converts to actual cash available for investors.`
    },
    {
      question: `Why is FCF margin important for ${symbol}?`,
      answer: `FCF margin is critical for ${companyName} because it measures the quality of earnings and cash generation efficiency. High FCF margins indicate the business can fund growth, pay dividends, buy back stock, or reduce debt without external financing.`
    },
    {
      question: `What is a good free cash flow margin?`,
      answer: `FCF margin benchmarks vary by industry. For ${sector || 'most companies'}: >20% is excellent, 10-20% is good, 5-10% is moderate, <5% may indicate growth investments or efficiency challenges. ${companyName}'s ${fcfMargin.toFixed(1)}% margin should be compared to sector peers.`
    },
    {
      question: `Is ${symbol}'s FCF margin improving?`,
      answer: marginChange > 0
        ? `Yes, ${symbol}'s FCF margin improved by ${marginChange.toFixed(1)} percentage points year-over-year (from ${previousFCFMargin.toFixed(1)}% to ${fcfMargin.toFixed(1)}%). This indicates improving cash generation efficiency.`
        : marginChange < 0
        ? `${symbol}'s FCF margin declined by ${Math.abs(marginChange).toFixed(1)} percentage points year-over-year (from ${previousFCFMargin.toFixed(1)}% to ${fcfMargin.toFixed(1)}%). This could indicate higher growth investments or margin pressure.`
        : `${symbol}'s FCF margin remained stable at ${fcfMargin.toFixed(1)}% year-over-year.`
    },
    {
      question: `How does ${symbol}'s FCF margin compare to competitors?`,
      answer: `${companyName}'s ${fcfMargin.toFixed(1)}% FCF margin should be compared to competitors in the ${sector || 'industry'} sector. Use our comparison tools to benchmark ${symbol} against peers and identify relative cash generation efficiency.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} FCF Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Free Cash Flow Margin ${currentYear} - FCF Margin Analysis`,
    description: `Complete FCF margin analysis for ${symbol} (${companyName}) with cash generation trends, profitability metrics, and efficiency ratios.`,
    url: pageUrl,
    keywords: [
      `${symbol} FCF margin`,
      `${symbol} free cash flow margin`,
      `${symbol} cash flow margin`,
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

  const faqSchema = getFAQSchema(fcfMarginFaqs)

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
            <span>{symbol} FCF Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Free Cash Flow Margin {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cash generation efficiency and profitability analysis for {companyName}
          </p>

          {/* Latest FCF Margin Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">FCF Margin</p>
                <p className={`text-3xl font-bold ${fcfMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fcfMargin.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Free Cash Flow</p>
                <p className="text-3xl font-bold">
                  {freeCashFlow >= 1e9
                    ? `$${(freeCashFlow / 1e9).toFixed(2)}B`
                    : `$${(freeCashFlow / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">annual</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Margin Change (YoY)</p>
                <p className={`text-3xl font-bold ${marginChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marginChange >= 0 ? '+' : ''}{marginChange.toFixed(1)}pp
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* Why FCF Margin Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Free Cash Flow Margin Matters</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Quality of Earnings</h3>
                <p className="text-muted-foreground">
                  FCF margin shows how much accounting profit converts to actual cash.
                  High FCF margins relative to net income margins indicate high-quality,
                  sustainable earnings.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Capital Allocation Flexibility</h3>
                <p className="text-muted-foreground">
                  Strong FCF margins give management flexibility to invest in growth,
                  return cash to shareholders through dividends and buybacks, or strengthen
                  the balance sheet without relying on external financing.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Business Efficiency</h3>
                <p className="text-muted-foreground">
                  FCF margin measures operational efficiency and working capital management.
                  Improving margins indicate better cash conversion and operational leverage.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Valuation Signal</h3>
                <p className="text-muted-foreground">
                  Companies with high and growing FCF margins typically command premium valuations.
                  Investors pay more for businesses that efficiently convert revenue to cash.
                </p>
              </div>
            </div>
          </section>

          {/* FCF Margin Formula */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding FCF Margin</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Calculation</h3>
                  <div className="bg-secondary/30 p-4 rounded-lg font-mono text-sm space-y-2">
                    <div>Free Cash Flow = Operating Cash Flow - Capital Expenditures</div>
                    <div>FCF Margin = (Free Cash Flow / Revenue) × 100</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3">For {symbol}:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-secondary/20 rounded">
                      <span className="text-muted-foreground">Operating Cash Flow</span>
                      <span className="font-bold">
                        ${operatingCF >= 1e9 ? `${(operatingCF / 1e9).toFixed(2)}B` : `${(operatingCF / 1e6).toFixed(0)}M`}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary/20 rounded">
                      <span className="text-muted-foreground">Capital Expenditures</span>
                      <span className="font-bold text-red-500">
                        -${capex >= 1e9 ? `${(capex / 1e9).toFixed(2)}B` : `${(capex / 1e6).toFixed(0)}M`}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <span className="font-bold">Free Cash Flow</span>
                      <span className="font-bold text-green-500">
                        ${freeCashFlow >= 1e9 ? `${(freeCashFlow / 1e9).toFixed(2)}B` : `${(freeCashFlow / 1e6).toFixed(0)}M`}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary/20 rounded">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-bold">
                        ${revenue >= 1e9 ? `${(revenue / 1e9).toFixed(2)}B` : `${(revenue / 1e6).toFixed(0)}M`}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                      <span className="font-bold">FCF Margin</span>
                      <span className="font-bold text-blue-500">{fcfMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FCF Margin Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">FCF Margin Benchmarks</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-emerald-500">&gt; 20% FCF Margin</h3>
                    <p className="text-sm text-muted-foreground">Excellent - highly efficient cash generation</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-green-500">10-20% FCF Margin</h3>
                    <p className="text-sm text-muted-foreground">Good - healthy cash conversion</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-yellow-500">5-10% FCF Margin</h3>
                    <p className="text-sm text-muted-foreground">Moderate - room for improvement</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-orange-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-orange-500">0-5% FCF Margin</h3>
                    <p className="text-sm text-muted-foreground">Low - efficiency or growth investment challenges</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-red-500">Negative FCF Margin</h3>
                    <p className="text-sm text-muted-foreground">Cash burn - monitor liquidity and funding needs</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Historical FCF Margin */}
          {cashFlowStatements && cashFlowStatements.length > 1 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Historical FCF Margin Trend</h2>
              <div className="space-y-3">
                {cashFlowStatements.slice(0, 5).map((cf: any, index: number) => {
                  const income = incomeStatements[index]
                  const fcf = (cf.operating_cash_flow || 0) - Math.abs(cf.capital_expenditure || 0)
                  const rev = income?.revenue || 1
                  const margin = (fcf / rev) * 100

                  return (
                    <div key={cf.report_period} className="bg-card p-5 rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.report_period}</p>
                          <p className="font-bold text-lg">
                            FCF: ${fcf >= 1e9 ? `${(fcf / 1e9).toFixed(2)}B` : `${(fcf / 1e6).toFixed(0)}M`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">FCF Margin</p>
                          <p className={`text-xl font-bold ${margin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Cash Flow Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete cash flow statements, profitability metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cash-flow/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Cash Flow Statement
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fcfMarginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> FCF margin data is calculated from cash flow statements and income statements reported in SEC filings. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
