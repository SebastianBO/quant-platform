import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { QUARTERS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ slugs: string; quarter: string }>
}

interface IncomeStatement {
  ticker: string
  report_period: string
  fiscal_period: string
  revenue: number | null
  gross_profit: number | null
  operating_income: number | null
  net_income: number | null
  earnings_per_share_diluted: number | null
  ebit: number | null
}

function formatValue(value: number | null | undefined): string {
  if (!value) return '-'
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatPercent(value: number | null | undefined): string {
  if (!value) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

async function getQuarterlyData(ticker: string, quarter: string): Promise<IncomeStatement | null> {
  // Parse quarter format: "2024-Q3" -> year: 2024, period: Q3
  const [yearStr, period] = quarter.split('-')
  const year = parseInt(yearStr)

  try {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/financials/income-statements?ticker=${ticker.toUpperCase()}&period=quarterly&limit=24`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) return null
    const data = await response.json()

    // Find matching quarter - report_period is like "2024-06-29"
    const statements = data.income_statements || []
    return statements.find((s: IncomeStatement) => {
      const reportYear = parseInt(s.report_period?.split('-')[0] || '0')
      return reportYear === year && s.fiscal_period === period
    }) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs, quarter } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !QUARTERS.includes(quarter)) {
    return { title: 'Not Found' }
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()
  const [yearStr, period] = quarter.split('-')
  const title = `${t1} vs ${t2} ${period} ${yearStr} Earnings Comparison`
  const description = `Compare ${t1} and ${t2} quarterly earnings for ${period} ${yearStr}. Side-by-side revenue, net income, EPS, and profit margins comparison.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://lician.com/compare/${slugs}/q/${quarter}`,
    },
  }
}

export default async function QuarterlyComparisonPage({ params }: Props) {
  const { slugs, quarter } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !QUARTERS.includes(quarter)) {
    notFound()
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()
  const [yearStr, period] = quarter.split('-')

  // Fetch quarterly data for both stocks
  const [data1, data2] = await Promise.all([
    getQuarterlyData(t1, quarter),
    getQuarterlyData(t2, quarter)
  ])

  // Calculate margins if we have data
  const margins1 = data1 ? {
    gross: data1.gross_profit && data1.revenue ? data1.gross_profit / data1.revenue : null,
    operating: data1.operating_income && data1.revenue ? data1.operating_income / data1.revenue : null,
    net: data1.net_income && data1.revenue ? data1.net_income / data1.revenue : null,
  } : { gross: null, operating: null, net: null }

  const margins2 = data2 ? {
    gross: data2.gross_profit && data2.revenue ? data2.gross_profit / data2.revenue : null,
    operating: data2.operating_income && data2.revenue ? data2.operating_income / data2.revenue : null,
    net: data2.net_income && data2.revenue ? data2.net_income / data2.revenue : null,
  } : { gross: null, operating: null, net: null }

  const comparisonRows = [
    { label: 'Revenue', v1: formatValue(data1?.revenue), v2: formatValue(data2?.revenue), winner: (data1?.revenue || 0) > (data2?.revenue || 0) ? 1 : (data2?.revenue || 0) > (data1?.revenue || 0) ? 2 : 0 },
    { label: 'Gross Profit', v1: formatValue(data1?.gross_profit), v2: formatValue(data2?.gross_profit), winner: (data1?.gross_profit || 0) > (data2?.gross_profit || 0) ? 1 : (data2?.gross_profit || 0) > (data1?.gross_profit || 0) ? 2 : 0 },
    { label: 'Operating Income', v1: formatValue(data1?.operating_income), v2: formatValue(data2?.operating_income), winner: (data1?.operating_income || 0) > (data2?.operating_income || 0) ? 1 : (data2?.operating_income || 0) > (data1?.operating_income || 0) ? 2 : 0 },
    { label: 'Net Income', v1: formatValue(data1?.net_income), v2: formatValue(data2?.net_income), winner: (data1?.net_income || 0) > (data2?.net_income || 0) ? 1 : (data2?.net_income || 0) > (data1?.net_income || 0) ? 2 : 0 },
    { label: 'EPS (Diluted)', v1: data1?.earnings_per_share_diluted ? `$${data1.earnings_per_share_diluted.toFixed(2)}` : '-', v2: data2?.earnings_per_share_diluted ? `$${data2.earnings_per_share_diluted.toFixed(2)}` : '-', winner: (data1?.earnings_per_share_diluted || 0) > (data2?.earnings_per_share_diluted || 0) ? 1 : (data2?.earnings_per_share_diluted || 0) > (data1?.earnings_per_share_diluted || 0) ? 2 : 0 },
    { label: 'Gross Margin', v1: formatPercent(margins1.gross), v2: formatPercent(margins2.gross), winner: (margins1.gross || 0) > (margins2.gross || 0) ? 1 : (margins2.gross || 0) > (margins1.gross || 0) ? 2 : 0 },
    { label: 'Operating Margin', v1: formatPercent(margins1.operating), v2: formatPercent(margins2.operating), winner: (margins1.operating || 0) > (margins2.operating || 0) ? 1 : (margins2.operating || 0) > (margins1.operating || 0) ? 2 : 0 },
    { label: 'Net Margin', v1: formatPercent(margins1.net), v2: formatPercent(margins2.net), winner: (margins1.net || 0) > (margins2.net || 0) ? 1 : (margins2.net || 0) > (margins1.net || 0) ? 2 : 0 },
  ]

  const wins1 = comparisonRows.filter(r => r.winner === 1).length
  const wins2 = comparisonRows.filter(r => r.winner === 2).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href="/compare" className="text-blue-600 hover:underline">Compare</Link>
          {' > '}
          <Link href={`/compare/${slugs}`} className="text-blue-600 hover:underline">
            {t1} vs {t2}
          </Link>
          {' > '}
          <span className="text-gray-600 dark:text-gray-400">{period} {yearStr}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">
          {t1} vs {t2} — {period} {yearStr} Earnings
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Quarterly earnings comparison for {period} {yearStr}. Compare revenue, profits, margins, and EPS.
        </p>

        {/* Winner Summary */}
        {(data1 || data2) && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className={`text-2xl font-bold ${wins1 > wins2 ? 'text-green-500' : 'text-gray-600'}`}>{t1}</div>
                <div className="text-sm text-gray-500">{wins1} wins</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">vs</div>
              <div className="text-center flex-1">
                <div className={`text-2xl font-bold ${wins2 > wins1 ? 'text-green-500' : 'text-gray-600'}`}>{t2}</div>
                <div className="text-sm text-gray-500">{wins2} wins</div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  <Link href={`/stock/${ticker1}`} className="hover:text-blue-500">{t1}</Link>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  <Link href={`/stock/${ticker2}`} className="hover:text-blue-500">{t2}</Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium">{row.label}</td>
                  <td className={`px-4 py-3 text-sm text-right ${row.winner === 1 ? 'text-green-600 font-semibold' : ''}`}>
                    {row.v1}
                    {row.winner === 1 && <span className="ml-1">✓</span>}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right ${row.winner === 2 ? 'text-green-600 font-semibold' : ''}`}>
                    {row.v2}
                    {row.winner === 2 && <span className="ml-1">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Data Message */}
        {!data1 && !data2 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              Financial data for {period} {yearStr} is not yet available for these stocks.
            </p>
          </div>
        )}

        {/* Related Quarters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Compare Other Quarters</h2>
          <div className="flex flex-wrap gap-2">
            {QUARTERS.filter(q => q !== quarter).slice(-12).reverse().map(q => (
              <Link
                key={q}
                href={`/compare/${slugs}/q/${q}`}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Year Comparisons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Annual Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {[2024, 2023, 2022, 2021, 2020].map(year => (
              <Link
                key={year}
                href={`/compare/${slugs}/${year}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm font-medium transition-colors"
              >
                {year} Full Year
              </Link>
            ))}
          </div>
        </div>

        {/* Stock Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href={`/stock/${ticker1}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-bold text-blue-600">{t1}</div>
            <div className="text-sm text-gray-500">View full analysis →</div>
          </Link>
          <Link
            href={`/stock/${ticker2}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-bold text-blue-600">{t2}</div>
            <div className="text-sm text-gray-500">View full analysis →</div>
          </Link>
        </div>

        <div className="text-center">
          <Link href={`/compare/${slugs}`} className="text-blue-600 hover:underline font-medium">
            ← View Current {t1} vs {t2} Comparison
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
