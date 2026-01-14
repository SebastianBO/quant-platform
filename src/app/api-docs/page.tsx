import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Stock API Documentation | Lician',
  description: 'Access real-time stock quotes, financial statements, insider trades, institutional holdings, and more via our free REST API. No API key required for basic access.',
  openGraph: {
    title: 'Free Stock API Documentation | Lician',
    description: 'Access real-time stock data via our free REST API. No API key required.',
    url: 'https://lician.com/api-docs',
    siteName: 'Lician',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Stock API Documentation',
    description: 'Access real-time stock data via our free REST API.',
  },
}

const endpoints = [
  {
    category: 'Stock Prices',
    items: [
      {
        method: 'GET',
        path: '/api/v1/prices/snapshot',
        description: 'Get current stock price and daily change',
        params: [{ name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' }],
        example: '/api/v1/prices/snapshot?ticker=AAPL',
        response: `{
  "snapshot": {
    "ticker": "AAPL",
    "price": 185.92,
    "day_change": 2.34,
    "day_change_percent": 1.27,
    "volume": 45234567,
    "market_cap": 2890000000000
  }
}`,
      },
    ],
  },
  {
    category: 'Financial Statements',
    items: [
      {
        method: 'GET',
        path: '/api/v1/financials/income-statements',
        description: 'Get income statements (quarterly or annual)',
        params: [
          { name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' },
          { name: 'period', type: 'string', required: false, desc: 'quarterly or annual (default: quarterly)' },
          { name: 'limit', type: 'number', required: false, desc: 'Number of periods (default: 4)' },
        ],
        example: '/api/v1/financials/income-statements?ticker=AAPL&period=quarterly&limit=4',
        response: `{
  "income_statements": [
    {
      "ticker": "AAPL",
      "report_period": "2024-09-30",
      "period": "quarterly",
      "revenue": 94930000000,
      "gross_profit": 43879000000,
      "operating_income": 29592000000,
      "net_income": 14736000000
    }
  ]
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/financials/balance-sheets',
        description: 'Get balance sheet data',
        params: [
          { name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' },
          { name: 'period', type: 'string', required: false, desc: 'quarterly or annual' },
          { name: 'limit', type: 'number', required: false, desc: 'Number of periods' },
        ],
        example: '/api/v1/financials/balance-sheets?ticker=AAPL',
        response: `{
  "balance_sheets": [
    {
      "ticker": "AAPL",
      "report_period": "2024-09-30",
      "total_assets": 352583000000,
      "total_liabilities": 290437000000,
      "shareholders_equity": 62146000000
    }
  ]
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/financials/cash-flow-statements',
        description: 'Get cash flow statement data',
        params: [
          { name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' },
          { name: 'period', type: 'string', required: false, desc: 'quarterly or annual' },
          { name: 'limit', type: 'number', required: false, desc: 'Number of periods' },
        ],
        example: '/api/v1/financials/cash-flow-statements?ticker=AAPL',
        response: `{
  "cash_flow_statements": [
    {
      "ticker": "AAPL",
      "report_period": "2024-09-30",
      "operating_cash_flow": 26810000000,
      "investing_cash_flow": -1923000000,
      "financing_cash_flow": -29168000000,
      "free_cash_flow": 23910000000
    }
  ]
}`,
      },
    ],
  },
  {
    category: 'Insider Trading',
    items: [
      {
        method: 'GET',
        path: '/api/v1/insider-trades',
        description: 'Get SEC Form 4 insider transactions',
        params: [
          { name: 'ticker', type: 'string', required: false, desc: 'Filter by ticker' },
          { name: 'limit', type: 'number', required: false, desc: 'Number of trades (default: 50)' },
        ],
        example: '/api/v1/insider-trades?ticker=AAPL&limit=10',
        response: `{
  "insider_trades": [
    {
      "ticker": "AAPL",
      "insider_name": "Tim Cook",
      "insider_title": "CEO",
      "transaction_type": "S-Sale",
      "shares": 50000,
      "price": 185.50,
      "value": 9275000,
      "filing_date": "2024-12-15"
    }
  ]
}`,
      },
    ],
  },
  {
    category: 'Institutional Holdings',
    items: [
      {
        method: 'GET',
        path: '/api/v1/institutional-ownership',
        description: 'Get 13F institutional holder data',
        params: [
          { name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' },
          { name: 'limit', type: 'number', required: false, desc: 'Number of holders' },
        ],
        example: '/api/v1/institutional-ownership?ticker=AAPL&limit=10',
        response: `{
  "holdings": [
    {
      "ticker": "AAPL",
      "holder_name": "Vanguard Group",
      "shares": 1340000000,
      "value": 248710000000,
      "percent_of_shares": 8.72,
      "report_date": "2024-09-30"
    }
  ]
}`,
      },
    ],
  },
  {
    category: 'Embed Widget',
    items: [
      {
        method: 'GET',
        path: '/api/embed/stock',
        description: 'Get stock data for embedding (CORS enabled)',
        params: [
          { name: 'ticker', type: 'string', required: true, desc: 'Stock ticker symbol' },
          { name: 'callback', type: 'string', required: false, desc: 'JSONP callback function' },
        ],
        example: '/api/embed/stock?ticker=AAPL',
        response: `{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "price": 185.92,
  "change": 2.34,
  "changePercent": 1.27,
  "volume": 45234567,
  "source": "lician.com",
  "attribution": {
    "text": "Powered by Lician",
    "url": "https://lician.com",
    "required": true
  }
}`,
      },
    ],
  },
]

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Free Stock API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access real-time stock data, financial statements, insider trades, and more. No API key required for basic access.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Base URL</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <code className="text-green-400">https://lician.com</code>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2"><strong>Rate Limits:</strong> 100 requests/minute for anonymous users</p>
            <p><strong>Attribution:</strong> Required for embed endpoints - include "Powered by Lician" link</p>
          </div>
        </div>

        {/* Endpoints */}
        {endpoints.map((category) => (
          <div key={category.category} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">{category.category}</h2>

            {category.items.map((endpoint, idx) => (
              <div key={idx} className={idx > 0 ? 'mt-8 pt-8 border-t border-gray-200 dark:border-gray-700' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {endpoint.method}
                  </span>
                  <code className="text-blue-600 dark:text-blue-400 font-mono">{endpoint.path}</code>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{endpoint.description}</p>

                {/* Parameters */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Parameters</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((param) => (
                        <tr key={param.name} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 font-mono text-purple-600">{param.name}</td>
                          <td className="py-2 text-gray-500">{param.type}</td>
                          <td className="py-2">
                            {param.required ? (
                              <span className="text-red-500">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-400">{param.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Example */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Example Request</h4>
                  <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                    <code className="text-green-400 text-sm">
                      curl "https://lician.com{endpoint.example}"
                    </code>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-semibold mb-2">Example Response</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">{endpoint.response}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Widget Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Embeddable Widget</h2>
          <p className="opacity-90 mb-6">
            Add stock quotes to your website with just one line of code.
          </p>
          <Link
            href="/embed"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Get Widget Code
          </Link>
        </div>

        {/* Data Coverage */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Data Coverage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">US Markets</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>10,000+ US stocks (NYSE, NASDAQ, AMEX)</li>
                <li>Real-time prices (15-min delay)</li>
                <li>10+ years of financial statements</li>
                <li>SEC filings (10-K, 10-Q, 8-K)</li>
                <li>Insider trades (Form 4)</li>
                <li>Institutional holdings (13F)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">European Markets</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>100,000+ European companies</li>
                <li>Norway, Sweden, Denmark, Finland, UK</li>
                <li>IFRS financial statements</li>
                <li>Free government API sources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Questions? Contact us at <a href="mailto:api@lician.com" className="text-blue-600 hover:underline">api@lician.com</a>
          </p>
          <p className="mt-2">
            Data provided by <Link href="/" className="text-blue-600 hover:underline">Lician</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
