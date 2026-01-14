import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // 1 hour

interface Props {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const upperTicker = ticker.toUpperCase()

  return {
    title: `${upperTicker} Stock Report | Lician`,
    description: `Comprehensive stock report for ${upperTicker} including financials, valuation metrics, insider trades, and analysis. Download as PDF.`,
    openGraph: {
      title: `${upperTicker} Stock Report | Lician`,
      description: `Comprehensive stock report for ${upperTicker}. Download as PDF.`,
      url: `https://lician.com/report/${upperTicker}`,
      siteName: 'Lician',
      type: 'article',
    },
  }
}

async function getStockData(ticker: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const upperTicker = ticker.toUpperCase()

  // Fetch all data in parallel
  const [priceResult, fundamentalsResult, incomeResult, balanceResult] = await Promise.all([
    supabase
      .from('stock_prices_snapshot')
      .select('*')
      .eq('ticker', upperTicker)
      .single(),
    supabase
      .from('company_fundamentals')
      .select('*')
      .eq('ticker', upperTicker)
      .order('report_period', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('income_statements')
      .select('*')
      .eq('ticker', upperTicker)
      .order('report_period', { ascending: false })
      .limit(4),
    supabase
      .from('balance_sheets')
      .select('*')
      .eq('ticker', upperTicker)
      .order('report_period', { ascending: false })
      .limit(1)
      .single(),
  ])

  return {
    price: priceResult.data,
    fundamentals: fundamentalsResult.data,
    income: incomeResult.data,
    balance: balanceResult.data,
  }
}

function formatNumber(num: number | null | undefined, decimals = 2) {
  if (num === null || num === undefined) return 'N/A'
  if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(decimals) + 'T'
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(decimals) + 'B'
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(decimals) + 'M'
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(decimals) + 'K'
  return num.toFixed(decimals)
}

function formatCurrency(num: number | null | undefined) {
  if (num === null || num === undefined) return 'N/A'
  return '$' + formatNumber(num)
}

function formatPercent(num: number | null | undefined) {
  if (num === null || num === undefined) return 'N/A'
  return num.toFixed(2) + '%'
}

export default async function ReportPage({ params }: Props) {
  const { ticker } = await params
  const upperTicker = ticker.toUpperCase()
  const data = await getStockData(ticker)

  if (!data.fundamentals && !data.price) {
    notFound()
  }

  const name = data.fundamentals?.name || upperTicker
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Calculate metrics
  const marketCap = data.fundamentals?.market_cap || data.price?.market_cap
  const peRatio = marketCap && data.income?.[0]?.net_income
    ? marketCap / (data.income[0].net_income * 4) // Annualize quarterly
    : null
  const pbRatio = marketCap && data.balance?.shareholders_equity
    ? marketCap / data.balance.shareholders_equity
    : null

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition font-semibold"
        >
          Download PDF
        </button>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{upperTicker}</h1>
              <p className="text-xl text-gray-600 mt-1">{name}</p>
              <p className="text-sm text-gray-500 mt-2">{data.fundamentals?.sector} | {data.fundamentals?.industry}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${data.price?.close?.toFixed(2) || data.price?.price?.toFixed(2) || 'N/A'}
              </div>
              {data.price?.change_percent && (
                <div className={`text-lg font-semibold ${data.price.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.price.change_percent >= 0 ? '+' : ''}{data.price.change_percent.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Market Cap</div>
              <div className="text-xl font-bold">{formatCurrency(marketCap)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">P/E Ratio</div>
              <div className="text-xl font-bold">{peRatio ? peRatio.toFixed(1) : 'N/A'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">P/B Ratio</div>
              <div className="text-xl font-bold">{pbRatio ? pbRatio.toFixed(2) : 'N/A'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Volume</div>
              <div className="text-xl font-bold">{formatNumber(data.price?.volume, 0)}</div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        {data.income && data.income.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Financial Summary (Latest Quarter)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Revenue</div>
                <div className="text-xl font-bold">{formatCurrency(data.income[0].revenue)}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Gross Profit</div>
                <div className="text-xl font-bold">{formatCurrency(data.income[0].gross_profit)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Operating Income</div>
                <div className="text-xl font-bold">{formatCurrency(data.income[0].operating_income)}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600">Net Income</div>
                <div className="text-xl font-bold">{formatCurrency(data.income[0].net_income)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quarterly Trend */}
        {data.income && data.income.length > 1 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quarterly Trend</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-gray-600">Period</th>
                  <th className="text-right py-2 text-gray-600">Revenue</th>
                  <th className="text-right py-2 text-gray-600">Gross Profit</th>
                  <th className="text-right py-2 text-gray-600">Net Income</th>
                </tr>
              </thead>
              <tbody>
                {data.income.map((q: any) => (
                  <tr key={q.report_period} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{q.report_period}</td>
                    <td className="py-2 text-right">{formatCurrency(q.revenue)}</td>
                    <td className="py-2 text-right">{formatCurrency(q.gross_profit)}</td>
                    <td className="py-2 text-right">{formatCurrency(q.net_income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Balance Sheet */}
        {data.balance && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Balance Sheet</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Assets</div>
                <div className="text-xl font-bold">{formatCurrency(data.balance.total_assets)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Liabilities</div>
                <div className="text-xl font-bold">{formatCurrency(data.balance.total_liabilities)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Equity</div>
                <div className="text-xl font-bold">{formatCurrency(data.balance.shareholders_equity)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This report is for informational purposes only and should not be considered
            investment advice. Data may be delayed or inaccurate. Always do your own research before making investment decisions.
          </p>
          <p>Report generated on {currentDate}</p>
        </div>

        {/* Branding Footer */}
        <div className="mt-8 pt-6 border-t-4 border-blue-600">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">Lician</div>
              <div className="text-sm text-gray-500">Financial Data & Analysis</div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>lician.com</div>
              <div>Free stock data for everyone</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
