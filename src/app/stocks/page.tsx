import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering since we need runtime env vars
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Stocks - 10,000+ US Stock Tickers | Lician',
  description: 'Complete directory of 10,000+ US stocks with real-time quotes, financial data, insider trades, and analyst ratings. Browse stocks alphabetically.',
  openGraph: {
    title: 'All Stocks - 10,000+ US Stock Tickers | Lician',
    description: 'Complete directory of 10,000+ US stocks with financial data and analysis.',
    url: 'https://lician.com/stocks',
    siteName: 'Lician',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Stocks - 10,000+ Tickers',
    description: 'Complete directory of US stocks with financial data.',
  },
}

async function getStocksByLetter() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get distinct tickers grouped by first letter
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('ticker, name')
    .order('ticker', { ascending: true })

  if (error) {
    console.error('Error fetching stocks:', error)
    return {}
  }

  // Group by first letter
  const grouped: Record<string, { ticker: string; name: string }[]> = {}

  const uniqueTickers = new Map<string, { ticker: string; name: string }>()

  data?.forEach((row) => {
    if (!uniqueTickers.has(row.ticker)) {
      uniqueTickers.set(row.ticker, { ticker: row.ticker, name: row.name || row.ticker })
    }
  })

  uniqueTickers.forEach(({ ticker, name }) => {
    const letter = ticker.charAt(0).toUpperCase()
    if (!grouped[letter]) {
      grouped[letter] = []
    }
    grouped[letter].push({ ticker, name })
  })

  return grouped
}

export default async function StocksPage() {
  const stocksByLetter = await getStocksByLetter()
  const letters = Object.keys(stocksByLetter).sort()
  const totalStocks = Object.values(stocksByLetter).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Stocks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {totalStocks.toLocaleString()} US stocks with real-time quotes and financial data
          </p>
        </div>

        {/* Letter Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#${letter}`}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300 transition"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Popular Stocks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Stocks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'JPM', 'V', 'JNJ', 'WMT'].map((ticker) => (
              <Link
                key={ticker}
                href={`/stock/${ticker}`}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition text-center"
              >
                <div className="font-bold text-blue-600 dark:text-blue-400">{ticker}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stocks by Letter */}
        {letters.map((letter) => (
          <div key={letter} id={letter} className="mb-12 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
              <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white">
                {letter}
              </span>
              <span className="text-gray-400 text-lg font-normal">
                {stocksByLetter[letter].length} stocks
              </span>
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {stocksByLetter[letter].map(({ ticker, name }) => (
                  <Link
                    key={ticker}
                    href={`/stock/${ticker}`}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                      {ticker}
                    </div>
                    <div className="text-xs text-gray-500 truncate" title={name}>
                      {name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* SEO Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-12">
          <h2 className="text-2xl font-bold mb-4">Stock Data & Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Lician provides comprehensive financial data for over 10,000 US stocks including real-time quotes,
            historical prices, financial statements (income statements, balance sheets, cash flow statements),
            insider trading data, institutional holdings, analyst ratings, and more.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/api-docs" className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 transition">
              <h3 className="font-semibold mb-2">Free API</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access stock data via our REST API</p>
            </Link>
            <Link href="/embed" className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 transition">
              <h3 className="font-semibold mb-2">Embeddable Widget</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add stock quotes to your website</p>
            </Link>
            <Link href="/screener" className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 transition">
              <h3 className="font-semibold mb-2">Stock Screener</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Filter stocks by metrics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
