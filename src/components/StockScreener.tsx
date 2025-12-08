"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface ScreenerCriteria {
  metric: string
  operator: 'gt' | 'lt' | 'between'
  value: number
  value2?: number
}

interface StockResult {
  ticker: string
  name: string
  price: number
  marketCap: number
  pe: number
  roic: number
  revenueGrowth: number
  grossMargin: number
  debtToEquity: number
  freeCashFlowYield: number
}

const PRESET_SCREENS = [
  {
    name: "Warren Buffett Quality",
    description: "High ROIC, low debt, consistent growth",
    criteria: [
      { metric: "roic", operator: "gt" as const, value: 0.15 },
      { metric: "debtToEquity", operator: "lt" as const, value: 1 },
      { metric: "grossMargin", operator: "gt" as const, value: 0.30 },
    ]
  },
  {
    name: "Deep Value",
    description: "Low P/E, high FCF yield",
    criteria: [
      { metric: "pe", operator: "lt" as const, value: 15 },
      { metric: "freeCashFlowYield", operator: "gt" as const, value: 0.06 },
    ]
  },
  {
    name: "Growth at Reasonable Price",
    description: "High growth with reasonable valuation",
    criteria: [
      { metric: "revenueGrowth", operator: "gt" as const, value: 0.15 },
      { metric: "pe", operator: "lt" as const, value: 30 },
      { metric: "roic", operator: "gt" as const, value: 0.10 },
    ]
  },
  {
    name: "Cash Machine",
    description: "Strong FCF generation",
    criteria: [
      { metric: "freeCashFlowYield", operator: "gt" as const, value: 0.08 },
      { metric: "grossMargin", operator: "gt" as const, value: 0.40 },
    ]
  },
  {
    name: "Quality Compounder",
    description: "Best of the best - high ROIC and growth",
    criteria: [
      { metric: "roic", operator: "gt" as const, value: 0.20 },
      { metric: "revenueGrowth", operator: "gt" as const, value: 0.10 },
      { metric: "grossMargin", operator: "gt" as const, value: 0.50 },
      { metric: "debtToEquity", operator: "lt" as const, value: 0.5 },
    ]
  }
]

const METRICS = [
  { key: "pe", name: "P/E Ratio", format: "number" },
  { key: "roic", name: "ROIC", format: "percent" },
  { key: "revenueGrowth", name: "Revenue Growth", format: "percent" },
  { key: "grossMargin", name: "Gross Margin", format: "percent" },
  { key: "debtToEquity", name: "Debt/Equity", format: "number" },
  { key: "freeCashFlowYield", name: "FCF Yield", format: "percent" },
  { key: "marketCap", name: "Market Cap", format: "currency" },
]

// Sample data - in production this would come from the API
const SAMPLE_STOCKS: StockResult[] = [
  { ticker: "AAPL", name: "Apple Inc", price: 278.20, marketCap: 4.13e12, pe: 33.8, roic: 0.513, revenueGrowth: 0.064, grossMargin: 0.469, debtToEquity: 3.87, freeCashFlowYield: 0.026 },
  { ticker: "MSFT", name: "Microsoft Corp", price: 445.50, marketCap: 3.31e12, pe: 36.2, roic: 0.35, revenueGrowth: 0.15, grossMargin: 0.70, debtToEquity: 0.32, freeCashFlowYield: 0.028 },
  { ticker: "NVDA", name: "NVIDIA Corp", price: 142.50, marketCap: 3.48e12, pe: 55.3, roic: 0.68, revenueGrowth: 1.22, grossMargin: 0.75, debtToEquity: 0.29, freeCashFlowYield: 0.015 },
  { ticker: "GOOG", name: "Alphabet Inc", price: 195.80, marketCap: 2.40e12, pe: 24.5, roic: 0.28, revenueGrowth: 0.14, grossMargin: 0.58, debtToEquity: 0.10, freeCashFlowYield: 0.038 },
  { ticker: "META", name: "Meta Platforms", price: 620.30, marketCap: 1.58e12, pe: 28.9, roic: 0.32, revenueGrowth: 0.22, grossMargin: 0.81, debtToEquity: 0.15, freeCashFlowYield: 0.031 },
  { ticker: "BRK.B", name: "Berkshire Hathaway", price: 475.20, marketCap: 1.02e12, pe: 15.2, roic: 0.11, revenueGrowth: 0.05, grossMargin: 0.35, debtToEquity: 0.23, freeCashFlowYield: 0.045 },
  { ticker: "JNJ", name: "Johnson & Johnson", price: 162.40, marketCap: 390e9, pe: 18.5, roic: 0.19, revenueGrowth: 0.03, grossMargin: 0.69, debtToEquity: 0.42, freeCashFlowYield: 0.052 },
  { ticker: "V", name: "Visa Inc", price: 325.80, marketCap: 650e9, pe: 32.1, roic: 0.42, revenueGrowth: 0.10, grossMargin: 0.80, debtToEquity: 0.55, freeCashFlowYield: 0.029 },
  { ticker: "PG", name: "Procter & Gamble", price: 178.90, marketCap: 420e9, pe: 28.4, roic: 0.18, revenueGrowth: 0.02, grossMargin: 0.52, debtToEquity: 0.72, freeCashFlowYield: 0.035 },
  { ticker: "HD", name: "Home Depot", price: 425.60, marketCap: 420e9, pe: 26.8, roic: 0.45, revenueGrowth: 0.04, grossMargin: 0.34, debtToEquity: 15.2, freeCashFlowYield: 0.038 },
]

export default function StockScreener() {
  const [criteria, setCriteria] = useState<ScreenerCriteria[]>([])
  const [results, setResults] = useState<StockResult[]>([])
  const [sortBy, setSortBy] = useState<string>("marketCap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const applyScreen = (newCriteria?: ScreenerCriteria[]) => {
    const filterCriteria = newCriteria || criteria

    let filtered = SAMPLE_STOCKS.filter(stock => {
      return filterCriteria.every(c => {
        const value = stock[c.metric as keyof StockResult] as number
        if (c.operator === 'gt') return value > c.value
        if (c.operator === 'lt') return value < c.value
        if (c.operator === 'between') return value >= c.value && value <= (c.value2 || c.value)
        return true
      })
    })

    // Sort results
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof StockResult] as number
      const bVal = b[sortBy as keyof StockResult] as number
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    setResults(filtered)
  }

  const applyPreset = (preset: typeof PRESET_SCREENS[0]) => {
    setCriteria(preset.criteria)
    applyScreen(preset.criteria)
  }

  const addCriteria = () => {
    setCriteria([...criteria, { metric: "roic", operator: "gt", value: 0.15 }])
  }

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const updateCriteria = (index: number, field: string, value: any) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Stock Screener
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Preset Screens */}
        <div className="mb-6">
          <p className="text-sm text-zinc-400 mb-2">Quick Screens</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCREENS.map((preset, i) => (
              <button
                key={i}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Criteria */}
        <div className="mb-6 p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">Custom Criteria</p>
            <button
              onClick={addCriteria}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
            >
              + Add Filter
            </button>
          </div>

          {criteria.map((c, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={c.metric}
                onChange={(e) => updateCriteria(i, 'metric', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
              >
                {METRICS.map(m => (
                  <option key={m.key} value={m.key}>{m.name}</option>
                ))}
              </select>

              <select
                value={c.operator}
                onChange={(e) => updateCriteria(i, 'operator', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
              >
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="between">Between</option>
              </select>

              <input
                type="number"
                value={c.value}
                onChange={(e) => updateCriteria(i, 'value', parseFloat(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm w-24"
                step="0.01"
              />

              {c.operator === 'between' && (
                <>
                  <span className="text-zinc-400">and</span>
                  <input
                    type="number"
                    value={c.value2 || ''}
                    onChange={(e) => updateCriteria(i, 'value2', parseFloat(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm w-24"
                    step="0.01"
                  />
                </>
              )}

              <button
                onClick={() => removeCriteria(i)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={() => applyScreen()}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-medium"
          >
            Run Screen
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium">{results.length} stocks match your criteria</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); applyScreen(); }}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
                >
                  {METRICS.map(m => (
                    <option key={m.key} value={m.key}>{m.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => { setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); applyScreen(); }}
                  className="px-2 py-1 bg-zinc-800 rounded text-sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="p-3 text-left">Ticker</th>
                    <th className="p-3 text-left">Company</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Market Cap</th>
                    <th className="p-3 text-right">P/E</th>
                    <th className="p-3 text-right">ROIC</th>
                    <th className="p-3 text-right">Revenue Growth</th>
                    <th className="p-3 text-right">Gross Margin</th>
                    <th className="p-3 text-right">FCF Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock) => (
                    <tr key={stock.ticker} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="p-3 font-bold text-emerald-400">{stock.ticker}</td>
                      <td className="p-3">{stock.name}</td>
                      <td className="p-3 text-right">${stock.price.toFixed(2)}</td>
                      <td className="p-3 text-right">{formatCurrency(stock.marketCap)}</td>
                      <td className="p-3 text-right">{stock.pe.toFixed(1)}</td>
                      <td className="p-3 text-right text-emerald-400">{formatPercent(stock.roic)}</td>
                      <td className="p-3 text-right">{formatPercent(stock.revenueGrowth)}</td>
                      <td className="p-3 text-right">{formatPercent(stock.grossMargin)}</td>
                      <td className="p-3 text-right">{formatPercent(stock.freeCashFlowYield)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
