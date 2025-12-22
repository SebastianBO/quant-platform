'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

const featuredAnalyses = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
]

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Stock Analysis & Research
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Deep-dive valuation analysis, fundamental research, and investment insights
            to help you make informed decisions.
          </p>
        </div>

        {/* Analysis Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">📊</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Valuation Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              DCF models, P/E ratios, and fair value estimates to determine if a stock is undervalued or overvalued.
            </p>
            <Link href="/analysis/aapl/valuation" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View sample analysis →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Growth Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Revenue trends, profit margins, and expansion potential to identify high-growth opportunities.
            </p>
            <div className="text-sm text-gray-400">
              Coming soon
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Quality Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Financial health, competitive advantages, and business quality metrics.
            </p>
            <div className="text-sm text-gray-400">
              Coming soon
            </div>
          </div>
        </div>

        {/* Featured Analyses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Valuation Analyses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredAnalyses.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/analysis/${stock.ticker.toLowerCase()}/valuation`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stock.ticker}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-4">
                  View valuation analysis →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Analyze Any Stock
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get instant valuation analysis for any publicly traded company. Enter a ticker symbol below.
          </p>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter ticker (e.g., AAPL)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="ticker-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget as HTMLInputElement
                  const ticker = input.value.trim().toUpperCase()
                  if (ticker) {
                    window.location.href = `/analysis/${ticker.toLowerCase()}/valuation`
                  }
                }
              }}
            />
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              onClick={() => {
                const input = document.getElementById('ticker-input') as HTMLInputElement
                const ticker = input?.value.trim().toUpperCase()
                if (ticker) {
                  window.location.href = `/analysis/${ticker.toLowerCase()}/valuation`
                }
              }}
            >
              Analyze
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How Our Analysis Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                1. Data Collection
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We gather comprehensive financial data including income statements, balance sheets,
                cash flows, and market data.
              </p>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                2. Valuation Models
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Our DCF models and relative valuation methods calculate fair value estimates
                based on fundamental analysis.
              </p>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                3. Expert Insights
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We provide clear, actionable insights presented in an easy-to-understand
                narrative format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
