"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, RefreshCw, Zap, Clock, DollarSign, Bitcoin } from 'lucide-react'

interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  source: string
}

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  price: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  image: string
}

const WATCHLIST_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM']
const TOP_CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin', 'avalanche-2']

export default function MarketPulseClient() {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [crypto, setCrypto] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks')

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`/api/quotes/realtime?symbols=${WATCHLIST_STOCKS.join(',')}`)
      const data = await response.json()
      if (data.quotes) {
        setQuotes(data.quotes)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
  }

  const fetchCrypto = async () => {
    try {
      const response = await fetch(`/api/crypto/prices?ids=${TOP_CRYPTO_IDS.join(',')}`)
      const data = await response.json()
      if (data.prices) {
        setCrypto(data.prices)
      }
    } catch (error) {
      console.error('Error fetching crypto:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchQuotes(), fetchCrypto()])
      setLoading(false)
    }

    loadData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQuotes()
      fetchCrypto()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(2)
    return price.toFixed(4)
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
    return vol.toString()
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Markets Open</span>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={() => { fetchQuotes(); fetchCrypto(); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'stocks'
              ? 'bg-green-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Stocks
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'crypto'
              ? 'bg-orange-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          <Bitcoin className="w-4 h-4" />
          Crypto
        </button>
      </div>

      {/* Stock Quotes */}
      {activeTab === 'stocks' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Real-Time Stock Quotes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">Change</th>
                  <th className="text-right py-3 px-4 font-medium">% Change</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Volume</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Day Range</th>
                </tr>
              </thead>
              <tbody>
                {WATCHLIST_STOCKS.map(symbol => {
                  const quote = quotes[symbol]
                  if (!quote) return null

                  const isPositive = quote.change >= 0

                  return (
                    <tr key={symbol} className="border-t border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4">
                        <Link href={`/stock/${symbol.toLowerCase()}`} className="font-bold text-green-500 hover:underline">
                          {symbol}
                        </Link>
                      </td>
                      <td className="text-right py-3 px-4 font-mono font-medium">
                        ${formatPrice(quote.price)}
                      </td>
                      <td className={`text-right py-3 px-4 font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{quote.change.toFixed(2)}
                        </span>
                      </td>
                      <td className={`text-right py-3 px-4 font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {formatVolume(quote.volume)}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">
                        ${formatPrice(quote.low)} - ${formatPrice(quote.high)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border text-center">
            <Link href="/screener" className="text-sm text-green-500 hover:underline">
              View all stocks →
            </Link>
          </div>
        </div>
      )}

      {/* Crypto Prices */}
      {activeTab === 'crypto' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              Cryptocurrency Prices
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">24h %</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Volume (24h)</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {crypto.map((coin, index) => {
                  const isPositive = coin.changePercent24h >= 0

                  return (
                    <tr key={coin.id} className="border-t border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {coin.image && (
                            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          )}
                          <div>
                            <span className="font-bold">{coin.symbol}</span>
                            <span className="text-muted-foreground ml-2 hidden sm:inline">{coin.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-mono font-medium">
                        ${formatPrice(coin.price)}
                      </td>
                      <td className={`text-right py-3 px-4 font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{coin.changePercent24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {formatMarketCap(coin.volume24h)}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {formatMarketCap(coin.marketCap)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">
              Data from CoinGecko • Updates every 30 seconds
            </span>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/markets/top-gainers"
          className="p-4 bg-card rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
        >
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <span className="text-sm font-medium">Top Gainers</span>
        </Link>
        <Link
          href="/markets/top-losers"
          className="p-4 bg-card rounded-xl border border-border hover:border-red-500/50 transition-colors text-center"
        >
          <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <span className="text-sm font-medium">Top Losers</span>
        </Link>
        <Link
          href="/markets/most-active"
          className="p-4 bg-card rounded-xl border border-border hover:border-blue-500/50 transition-colors text-center"
        >
          <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <span className="text-sm font-medium">Most Active</span>
        </Link>
        <Link
          href="/battle"
          className="p-4 bg-card rounded-xl border border-border hover:border-purple-500/50 transition-colors text-center"
        >
          <span className="text-2xl mb-2 block">⚔️</span>
          <span className="text-sm font-medium">Stock Battle</span>
        </Link>
      </div>
    </div>
  )
}
