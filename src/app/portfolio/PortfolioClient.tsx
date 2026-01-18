"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, DollarSign, PieChart, X } from 'lucide-react'

interface Holding {
  id: string
  symbol: string
  shares: number
  costBasis: number
  currentPrice?: number
  change?: number
  changePercent?: number
}

interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export default function PortfolioClient() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [newShares, setNewShares] = useState('')
  const [newCostBasis, setNewCostBasis] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Load holdings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lician-portfolio')
    if (saved) {
      try {
        setHoldings(JSON.parse(saved))
      } catch {
        console.error('Failed to parse saved portfolio')
      }
    }
  }, [])

  // Save holdings to localStorage
  useEffect(() => {
    if (holdings.length > 0) {
      localStorage.setItem('lician-portfolio', JSON.stringify(holdings))
    }
  }, [holdings])

  // Fetch quotes for all holdings
  const fetchQuotes = useCallback(async () => {
    if (holdings.length === 0) return

    setLoading(true)
    try {
      const symbols = holdings.map(h => h.symbol).join(',')
      const response = await fetch(`/api/quotes/realtime?symbols=${symbols}`)
      const data = await response.json()

      if (data.quotes) {
        setHoldings(prev => prev.map(holding => {
          const quote: Quote = data.quotes[holding.symbol]
          if (quote) {
            return {
              ...holding,
              currentPrice: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
            }
          }
          return holding
        }))
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
    setLoading(false)
  }, [holdings])

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (holdings.length > 0) {
      fetchQuotes()
      const interval = setInterval(fetchQuotes, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [holdings.length, fetchQuotes])

  const addHolding = () => {
    if (!newSymbol || !newShares) return

    const holding: Holding = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      shares: parseFloat(newShares),
      costBasis: parseFloat(newCostBasis) || 0,
    }

    setHoldings(prev => [...prev, holding])
    setNewSymbol('')
    setNewShares('')
    setNewCostBasis('')
    setShowAddModal(false)
  }

  const removeHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id))
  }

  // Calculate portfolio stats
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice || 0) * h.shares, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis * h.shares, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const todayChange = holdings.reduce((sum, h) => sum + (h.change || 0) * h.shares, 0)

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 text-[#868f97] mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatMoney(totalValue)}</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 text-[#868f97] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Today</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${todayChange >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
            {todayChange >= 0 ? '+' : ''}{formatMoney(todayChange)}
          </p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 text-[#868f97] mb-1">
            <PieChart className="w-4 h-4" />
            <span className="text-xs">Total Gain/Loss</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${totalGain >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
            {totalGain >= 0 ? '+' : ''}{formatMoney(totalGain)}
          </p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 text-[#868f97] mb-1">
            <span className="text-xs">Return</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${totalGainPercent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
            {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4ebe96] hover:bg-[#45ab88] text-white rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-[#868f97]">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-full hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'motion-safe:animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      {holdings.length === 0 ? (
        <div className="bg-white/[0.03] backdrop-blur-[10px] p-12 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center">
          <PieChart className="w-12 h-12 text-[#868f97] mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Holdings Yet</h3>
          <p className="text-[#868f97] mb-4">
            Add your first stock to start tracking your portfolio
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4ebe96] hover:bg-[#45ab88] text-white rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 font-medium">Shares</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">Change</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Cost Basis</th>
                  <th className="text-right py-3 px-4 font-medium">Value</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Gain/Loss</th>
                  <th className="text-right py-3 px-4 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(holding => {
                  const value = (holding.currentPrice || 0) * holding.shares
                  const cost = holding.costBasis * holding.shares
                  const gain = value - cost
                  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0
                  const isPositive = (holding.change || 0) >= 0
                  const isGainPositive = gain >= 0

                  return (
                    <tr key={holding.id} className="border-t border-white/[0.08] hover:bg-white/[0.05] motion-safe:transition-all motion-safe:duration-150 ease-out">
                      <td className="py-3 px-4">
                        <Link href={`/stock/${holding.symbol.toLowerCase()}`} className="font-bold text-[#4ebe96] hover:underline">
                          {holding.symbol}
                        </Link>
                      </td>
                      <td className="text-right py-3 px-4 tabular-nums">{holding.shares}</td>
                      <td className="text-right py-3 px-4 tabular-nums">
                        {holding.currentPrice ? formatMoney(holding.currentPrice) : '-'}
                      </td>
                      <td className={`text-right py-3 px-4 tabular-nums ${isPositive ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {holding.changePercent?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-[#868f97] hidden md:table-cell tabular-nums">
                        {holding.costBasis > 0 ? formatMoney(holding.costBasis) : '-'}
                      </td>
                      <td className="text-right py-3 px-4 font-medium tabular-nums">
                        {formatMoney(value)}
                      </td>
                      <td className={`text-right py-3 px-4 hidden md:table-cell tabular-nums ${isGainPositive ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                        {holding.costBasis > 0 ? (
                          <>
                            {isGainPositive ? '+' : ''}{formatMoney(gain)}
                            <span className="text-xs ml-1">({gainPercent.toFixed(1)}%)</span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="text-right py-3 px-4">
                        <button
                          onClick={() => removeHolding(holding.id)}
                          className="p-1 text-[#868f97] hover:text-[#ff5c5c] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#868f97] hover:text-foreground motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shares</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Basis (per share)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={newCostBasis}
                  onChange={(e) => setNewCostBasis(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
                />
                <p className="text-xs text-[#868f97] mt-1">Optional - used to calculate gains</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-white/[0.05] rounded-full hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                >
                  Cancel
                </button>
                <button
                  onClick={addHolding}
                  disabled={!newSymbol || !newShares}
                  className="flex-1 px-4 py-2 bg-[#4ebe96] hover:bg-[#45ab88] disabled:bg-[#4ebe96]/50 text-white rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                >
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
