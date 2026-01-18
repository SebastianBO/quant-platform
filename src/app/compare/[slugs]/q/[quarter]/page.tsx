import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { QUARTERS } from '@/lib/stocks-full'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

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

async function getQuarterlyData(ticker: string, quarter: string): Promise<IncomeStatement | null> {
  // Parse quarter format: "2024-Q3" -> year: 2024, period: Q3
  const [yearStr, period] = quarter.split('-')

  try {
    // Query Supabase directly for quarterly income statements
    const { data, error } = await supabase
      .from('income_statements')
      .select('ticker, report_period, fiscal_period, revenue, gross_profit, operating_income, net_income, earnings_per_share_diluted')
      .eq('ticker', ticker.toUpperCase())
      .eq('period', 'quarterly')
      .eq('fiscal_period', period)
      .gte('report_period', `${yearStr}-01-01`)
      .lte('report_period', `${yearStr}-12-31`)
      .order('report_period', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data as IncomeStatement
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
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <nav className="text-sm text-[#868f97] mb-4">
          <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Home</Link>
          {' > '}
          <Link href="/compare" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Compare</Link>
          {' > '}
          <Link href={`/compare/${slugs}`} className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">
            {t1} vs {t2}
          </Link>
          {' > '}
          <span>{period} {yearStr}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">
          {t1} vs {t2} — {period} {yearStr} Earnings
        </h1>

        <p className="text-[#868f97] mb-6">
          Quarterly earnings comparison for {period} {yearStr}. Compare revenue, profits, margins, and EPS.
        </p>

        {/* Winner Summary */}
        {(data1 || data2) && (
          <div className="bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className={`text-2xl font-bold tabular-nums ${wins1 > wins2 ? 'text-[#4ebe96]' : 'text-[#868f97]'}`}>{t1}</div>
                <div className="text-sm text-[#868f97]">{wins1} wins</div>
              </div>
              <div className="text-2xl font-bold text-[#868f97]">vs</div>
              <div className="text-center flex-1">
                <div className={`text-2xl font-bold tabular-nums ${wins2 > wins1 ? 'text-[#4ebe96]' : 'text-[#868f97]'}`}>{t2}</div>
                <div className="text-sm text-[#868f97]">{wins2} wins</div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.05]">
                <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  <Link href={`/stock/${ticker1}`} className="hover:text-[#479ffa] motion-safe:transition-colors motion-safe:duration-150 ease-out">{t1}</Link>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  <Link href={`/stock/${ticker2}`} className="hover:text-[#479ffa] motion-safe:transition-colors motion-safe:duration-150 ease-out">{t2}</Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {comparisonRows.map((row, i) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 text-sm font-medium">{row.label}</td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${row.winner === 1 ? 'text-[#4ebe96] font-semibold' : ''}`}>
                    {row.v1}
                    {row.winner === 1 && <span className="ml-1">✓</span>}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${row.winner === 2 ? 'text-[#4ebe96] font-semibold' : ''}`}>
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
          <div className="bg-[#ffa16c]/10 border border-[#ffa16c]/20 rounded-2xl p-4 mb-6">
            <p className="text-[#ffa16c]">
              Financial data for {period} {yearStr} is not yet available for these stocks.
            </p>
          </div>
        )}

        {/* Related Quarters */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Compare Other Quarters</h2>
          <div className="flex flex-wrap gap-2">
            {QUARTERS.filter(q => q !== quarter).slice(-12).reverse().map(q => (
              <Link
                key={q}
                href={`/compare/${slugs}/q/${q}`}
                className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Year Comparisons */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Annual Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {[2024, 2023, 2022, 2021, 2020].map(year => (
              <Link
                key={year}
                href={`/compare/${slugs}/${year}`}
                className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-white/[0.05] hover:border-white/[0.15] text-sm font-medium motion-safe:transition-all motion-safe:duration-150 ease-out tabular-nums"
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
            className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
          >
            <div className="text-lg font-bold text-[#479ffa]">{t1}</div>
            <div className="text-sm text-[#868f97]">View full analysis →</div>
          </Link>
          <Link
            href={`/stock/${ticker2}`}
            className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
          >
            <div className="text-lg font-bold text-[#479ffa]">{t2}</div>
            <div className="text-sm text-[#868f97]">View full analysis →</div>
          </Link>
        </div>

        <div className="text-center">
          <Link href={`/compare/${slugs}`} className="text-[#479ffa] hover:text-[#479ffa]/80 font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out">
            ← View Current {t1} vs {t2} Comparison
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
