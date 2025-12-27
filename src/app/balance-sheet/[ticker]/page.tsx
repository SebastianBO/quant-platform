import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Balance Sheet - Assets, Liabilities & Equity`,
    description: `${symbol} balance sheet analysis with total assets, liabilities, and stockholders' equity. View current assets, long-term debt, cash position, and key financial ratios.`,
    keywords: [
      `${symbol} balance sheet`,
      `${symbol} assets`,
      `${symbol} liabilities`,
      `${symbol} equity`,
      `${symbol} total assets`,
      `${symbol} debt`,
      `${symbol} cash position`,
      `${symbol} current ratio`,
      `${symbol} debt to equity`,
    ],
    openGraph: {
      title: `${symbol} Balance Sheet | Assets, Liabilities & Equity Analysis`,
      description: `Complete balance sheet analysis for ${symbol} including assets, liabilities, debt ratios, and cash position.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/balance-sheet/${ticker.toLowerCase()}`,
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

function formatValue(value: number | null | undefined): string {
  if (!value) return '-'
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals)
}

export default async function BalanceSheetPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics, balanceSheets } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/balance-sheet/${ticker.toLowerCase()}`

  const latestBalance = balanceSheets?.[0]
  const previousBalance = balanceSheets?.[1]

  // Calculate key ratios
  const currentRatio = latestBalance?.current_assets && latestBalance?.current_liabilities
    ? latestBalance.current_assets / latestBalance.current_liabilities
    : null

  const debtToEquity = latestBalance?.total_debt && latestBalance?.shareholders_equity
    ? latestBalance.total_debt / latestBalance.shareholders_equity
    : null

  const debtToAssets = latestBalance?.total_debt && latestBalance?.total_assets
    ? latestBalance.total_debt / latestBalance.total_assets
    : null

  const workingCapital = latestBalance?.current_assets && latestBalance?.current_liabilities
    ? latestBalance.current_assets - latestBalance.current_liabilities
    : null

  const balanceSheetFaqs = [
    {
      question: `What are ${symbol}'s total assets?`,
      answer: latestBalance?.total_assets
        ? `${symbol} has total assets of ${formatValue(latestBalance.total_assets)}${previousBalance?.total_assets ? `, ${latestBalance.total_assets > previousBalance.total_assets ? 'up' : 'down'} from ${formatValue(previousBalance.total_assets)} in the previous period` : ''}.`
        : `View ${symbol}'s balance sheet for detailed asset information.`
    },
    {
      question: `How much debt does ${symbol} have?`,
      answer: latestBalance?.total_debt
        ? `${symbol} has total debt of ${formatValue(latestBalance.total_debt)}.${debtToEquity ? ` The debt-to-equity ratio is ${formatRatio(debtToEquity)}, which is ${debtToEquity < 0.5 ? 'low and conservative' : debtToEquity < 1.5 ? 'moderate' : 'relatively high'}.` : ''}`
        : `Debt information for ${symbol} can be found in the balance sheet.`
    },
    {
      question: `What is ${symbol}'s cash position?`,
      answer: latestBalance?.cash_and_equivalents
        ? `${symbol} has ${formatValue(latestBalance.cash_and_equivalents)} in cash and cash equivalents${latestBalance.total_assets ? `, representing ${((latestBalance.cash_and_equivalents / latestBalance.total_assets) * 100).toFixed(1)}% of total assets` : ''}.`
        : `Cash position data is available in the detailed balance sheet.`
    },
    {
      question: `What is ${symbol}'s stockholders' equity?`,
      answer: latestBalance?.shareholders_equity
        ? `${symbol}'s stockholders' equity is ${formatValue(latestBalance.shareholders_equity)}. This represents the book value of the company and shareholder ownership stake.`
        : `Equity information for ${symbol} is available in the balance sheet.`
    },
    {
      question: `What is ${symbol}'s current ratio?`,
      answer: currentRatio
        ? `${symbol} has a current ratio of ${formatRatio(currentRatio)}. This means the company has $${formatRatio(currentRatio)} in current assets for every $1 in current liabilities. A ratio above 1.0 indicates good short-term financial health.`
        : `The current ratio can be calculated from ${symbol}'s current assets and current liabilities.`
    },
    {
      question: `How healthy is ${symbol}'s balance sheet?`,
      answer: latestBalance
        ? `${symbol}'s balance sheet shows ${formatValue(latestBalance.total_assets)} in total assets, ${formatValue(latestBalance.total_liabilities)} in liabilities, and ${formatValue(latestBalance.shareholders_equity)} in equity.${currentRatio ? ` The current ratio of ${formatRatio(currentRatio)} suggests ${currentRatio >= 2 ? 'strong' : currentRatio >= 1 ? 'adequate' : 'potentially stressed'} liquidity.` : ''}${debtToEquity ? ` The debt-to-equity ratio of ${formatRatio(debtToEquity)} indicates ${debtToEquity < 0.5 ? 'conservative' : debtToEquity < 1.5 ? 'moderate' : 'high'} leverage.` : ''}`
        : `Review the complete balance sheet for a comprehensive health assessment.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Balance Sheet`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Balance Sheet - Assets, Liabilities & Equity`,
      description: `Complete balance sheet analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} balance sheet`, `${symbol} assets`, `${symbol} liabilities`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(balanceSheetFaqs),
    getTableSchema({
      name: `${symbol} Balance Sheet History`,
      description: `Historical Balance Sheet data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Balance Sheet', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Balance Sheet</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Balance Sheet</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Assets, Liabilities & Stockholders' Equity</p>

          {/* Key Balance Sheet Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold text-green-500">{formatValue(latestBalance?.total_assets)}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-500">{formatValue(latestBalance?.total_liabilities)}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Shareholders' Equity</p>
              <p className="text-2xl font-bold text-blue-500">{formatValue(latestBalance?.shareholders_equity)}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Cash Position</p>
              <p className="text-2xl font-bold">{formatValue(latestBalance?.cash_and_equivalents)}</p>
            </div>
          </div>

          {/* Assets Breakdown */}
          {latestBalance && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Assets</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">As of: {latestBalance.fiscal_period || latestBalance.report_period}</p>

                <h3 className="font-semibold text-lg mb-3 text-green-500">Current Assets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Cash & Equivalents</p>
                    <p className="text-xl font-bold">{formatValue(latestBalance.cash_and_equivalents)}</p>
                  </div>
                  {latestBalance.current_assets && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Current Assets</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.current_assets)}</p>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-3 mt-6 text-green-600">Non-Current Assets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {latestBalance.property_plant_equipment && (
                    <div>
                      <p className="text-sm text-muted-foreground">Property, Plant & Equipment</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.property_plant_equipment)}</p>
                    </div>
                  )}
                  {latestBalance.goodwill && (
                    <div>
                      <p className="text-sm text-muted-foreground">Goodwill</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.goodwill)}</p>
                    </div>
                  )}
                  {latestBalance.intangible_assets && (
                    <div>
                      <p className="text-sm text-muted-foreground">Intangible Assets</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.intangible_assets)}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg">Total Assets</p>
                    <p className="text-2xl font-bold text-green-500">{formatValue(latestBalance.total_assets)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Liabilities & Equity Breakdown */}
          {latestBalance && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Liabilities & Equity</h2>
              <div className="bg-card p-6 rounded-lg border border-border">

                <h3 className="font-semibold text-lg mb-3 text-red-500">Current Liabilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {latestBalance.current_liabilities && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Current Liabilities</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.current_liabilities)}</p>
                    </div>
                  )}
                  {latestBalance.accounts_payable && (
                    <div>
                      <p className="text-sm text-muted-foreground">Accounts Payable</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.accounts_payable)}</p>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-3 mt-6 text-red-600">Non-Current Liabilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {latestBalance.long_term_debt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Long-term Debt</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.long_term_debt)}</p>
                    </div>
                  )}
                  {latestBalance.total_debt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debt</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.total_debt)}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg">Total Liabilities</p>
                    <p className="text-2xl font-bold text-red-500">{formatValue(latestBalance.total_liabilities)}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-3 mt-6 text-blue-500">Stockholders' Equity</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {latestBalance.retained_earnings && (
                    <div>
                      <p className="text-sm text-muted-foreground">Retained Earnings</p>
                      <p className="text-xl font-bold">{formatValue(latestBalance.retained_earnings)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equity</p>
                    <p className="text-xl font-bold text-blue-500">{formatValue(latestBalance.shareholders_equity)}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg">Total Liabilities & Equity</p>
                    <p className="text-2xl font-bold">{formatValue(latestBalance.total_assets)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Should equal Total Assets</p>
                </div>
              </div>
            </section>
          )}

          {/* Key Ratios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Balance Sheet Ratios</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentRatio !== null && (
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">Current Ratio</p>
                  <p className={`text-2xl font-bold ${currentRatio >= 1.5 ? 'text-green-500' : currentRatio >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {formatRatio(currentRatio)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current Assets / Current Liabilities</p>
                </div>
              )}
              {debtToEquity !== null && (
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
                  <p className={`text-2xl font-bold ${debtToEquity < 0.5 ? 'text-green-500' : debtToEquity < 1.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {formatRatio(debtToEquity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Debt / Shareholders' Equity</p>
                </div>
              )}
              {debtToAssets !== null && (
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">Debt-to-Assets</p>
                  <p className="text-2xl font-bold">{formatRatio(debtToAssets)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Debt / Total Assets</p>
                </div>
              )}
              {workingCapital !== null && (
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">Working Capital</p>
                  <p className={`text-2xl font-bold ${workingCapital > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatValue(workingCapital)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current Assets - Current Liabilities</p>
                </div>
              )}
            </div>
          </section>

          {/* Balance Sheet Health Assessment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Balance Sheet Health</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                {currentRatio !== null && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${currentRatio >= 1.5 ? 'bg-green-500' : currentRatio >= 1 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-semibold">Liquidity: {currentRatio >= 1.5 ? 'Strong' : currentRatio >= 1 ? 'Adequate' : 'Weak'}</p>
                      <p className="text-sm text-muted-foreground">
                        Current ratio of {formatRatio(currentRatio)} indicates the company has {currentRatio >= 1.5 ? 'ample' : currentRatio >= 1 ? 'sufficient' : 'limited'} short-term assets to cover short-term liabilities.
                      </p>
                    </div>
                  </div>
                )}
                {debtToEquity !== null && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${debtToEquity < 0.5 ? 'bg-green-500' : debtToEquity < 1.5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-semibold">Leverage: {debtToEquity < 0.5 ? 'Conservative' : debtToEquity < 1.5 ? 'Moderate' : 'High'}</p>
                      <p className="text-sm text-muted-foreground">
                        Debt-to-equity ratio of {formatRatio(debtToEquity)} suggests {debtToEquity < 0.5 ? 'low financial risk' : debtToEquity < 1.5 ? 'balanced use of debt' : 'significant reliance on debt financing'}.
                      </p>
                    </div>
                  </div>
                )}
                {latestBalance?.cash_and_equivalents && latestBalance.total_assets && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${(latestBalance.cash_and_equivalents / latestBalance.total_assets) > 0.1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-semibold">Cash Position: {((latestBalance.cash_and_equivalents / latestBalance.total_assets) * 100).toFixed(1)}% of Assets</p>
                      <p className="text-sm text-muted-foreground">
                        {formatValue(latestBalance.cash_and_equivalents)} in cash provides {(latestBalance.cash_and_equivalents / latestBalance.total_assets) > 0.15 ? 'strong' : (latestBalance.cash_and_equivalents / latestBalance.total_assets) > 0.05 ? 'adequate' : 'limited'} financial flexibility.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Explore detailed financials, income statements, cash flows, and more</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Open Full Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {balanceSheetFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="balance-sheet" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
