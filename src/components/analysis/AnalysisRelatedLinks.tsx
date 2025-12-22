import Link from 'next/link'
import { getRelatedStocks } from '@/lib/seo'
import { TrendingUp, DollarSign, BarChart3, Shield, Target, Sparkles } from 'lucide-react'

interface AnalysisRelatedLinksProps {
  ticker: string
  currentAnalysisType: 'valuation' | 'dividend' | 'growth' | 'health'
  companyName?: string
}

const POPULAR_ANALYSIS_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA']

export function AnalysisRelatedLinks({
  ticker,
  currentAnalysisType,
  companyName,
}: AnalysisRelatedLinksProps) {
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const relatedStocks = getRelatedStocks(symbol)

  const analysisTypes = [
    { key: 'valuation', label: 'Valuation', icon: DollarSign },
    { key: 'dividend', label: 'Dividend', icon: TrendingUp },
    { key: 'growth', label: 'Growth', icon: BarChart3 },
    { key: 'health', label: 'Financial Health', icon: Shield },
  ]

  const otherAnalysisTypes = analysisTypes.filter(
    (type) => type.key !== currentAnalysisType
  )

  return (
    <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
      {/* More Analysis Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          More Analysis for {symbol}
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {otherAnalysisTypes.map((type) => {
            const Icon = type.icon
            return (
              <Link
                key={type.key}
                href={`/analysis/${ticker.toLowerCase()}/${type.key}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {symbol} {type.label} Analysis
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {type.key === 'valuation' && 'Fair value, DCF model, and P/E analysis'}
                  {type.key === 'dividend' && 'Dividend yield, payout ratio, and history'}
                  {type.key === 'growth' && 'Revenue trends, earnings growth, and projections'}
                  {type.key === 'health' && 'Balance sheet, debt levels, and liquidity ratios'}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Additional Links */}
        <div className="grid md:grid-cols-3 gap-3">
          <Link
            href={`/stock/${ticker.toLowerCase()}`}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {symbol} Stock Page
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Complete overview & live data
            </div>
          </Link>
          <Link
            href={`/should-i-buy/${ticker.toLowerCase()}`}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white text-sm mb-1">
              <Target className="w-4 h-4" />
              Should I Buy {symbol}?
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              AI-powered buy/hold/sell recommendation
            </div>
          </Link>
          <Link
            href={`/prediction/${ticker.toLowerCase()}`}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              {symbol} Price Prediction
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {currentYear} forecast & targets
            </div>
          </Link>
        </div>
      </div>

      {/* Compare with Peers */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Compare with Peers
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          See how {companyName || symbol} stacks up against similar companies
        </p>
        <div className="flex flex-wrap gap-2">
          {relatedStocks.slice(0, 4).map((stock) => (
            <Link
              key={stock}
              href={`/compare/${ticker.toLowerCase()}-vs-${stock.toLowerCase()}`}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm font-medium text-gray-900 dark:text-white"
            >
              {symbol} vs {stock}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Analysis */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Popular {analysisTypes.find(t => t.key === currentAnalysisType)?.label} Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Explore {currentAnalysisType} analysis for top stocks
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_ANALYSIS_STOCKS.filter((stock) => stock !== symbol).map((stock) => (
            <Link
              key={stock}
              href={`/analysis/${stock.toLowerCase()}/${currentAnalysisType}`}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-colors group"
            >
              <div className="font-bold text-green-600 dark:text-green-400 mb-1 group-hover:text-green-700 dark:group-hover:text-green-300">
                {stock}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {analysisTypes.find(t => t.key === currentAnalysisType)?.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO-friendly text links */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-2">
          <p>
            <strong>Related:</strong>{' '}
            {otherAnalysisTypes.map((type, index) => (
              <span key={type.key}>
                <Link
                  href={`/analysis/${ticker.toLowerCase()}/${type.key}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {symbol} {type.label}
                </Link>
                {index < otherAnalysisTypes.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p>
            <strong>Compare:</strong>{' '}
            {relatedStocks.slice(0, 3).map((stock, index) => (
              <span key={stock}>
                <Link
                  href={`/compare/${ticker.toLowerCase()}-vs-${stock.toLowerCase()}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {symbol} vs {stock}
                </Link>
                {index < 2 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
