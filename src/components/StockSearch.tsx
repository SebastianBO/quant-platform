"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, TrendingUp, TrendingDown, Clock, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getSymbolColor } from "@/lib/logoService"

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type?: string
  price?: number
  changePercent?: number
  logoUrl?: string | null
}

interface StockSearchProps {
  onSelect: (symbol: string) => void
  placeholder?: string
  className?: string
}

// Popular stocks for quick access (shown when no query)
const POPULAR_STOCKS: SearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/AAPL.png' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/MSFT.png' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/GOOGL.png' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/AMZN.png' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/NVDA.png' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/TSLA.png' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/META.png' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'US', logoUrl: 'https://eodhistoricaldata.com/img/logos/US/JPM.png' },
]

export default function StockSearch({ onSelect, placeholder = "Search for news, tickers or companies", className }: StockSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentStockSearches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      } catch { }
    }
  }, [])

  // Search function - calls EODHD API
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=12`)
      const data = await response.json()

      if (data.results) {
        setResults(data.results)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    }
    setLoading(false)
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchStocks(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, searchStocks])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: SearchResult) => {
    onSelect(result.symbol)
    setQuery("")
    setIsOpen(false)

    // Save to recent searches
    const updated = [result, ...recentSearches.filter(r => r.symbol !== result.symbol)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentStockSearches', JSON.stringify(updated))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? results : (recentSearches.length > 0 ? recentSearches : POPULAR_STOCKS)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSelect(items[selectedIndex])
      } else if (query) {
        onSelect(query.toUpperCase())
        setQuery("")
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const displayItems = query ? results : (recentSearches.length > 0 ? recentSearches : POPULAR_STOCKS.slice(0, 6))
  const showRecent = !query && recentSearches.length > 0

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase())
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-12 pr-12 h-12 bg-secondary/80 border-border/50 rounded-xl text-base
                     focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50
                     placeholder:text-muted-foreground/60"
        />
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {query && (
          <button
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                       hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl
                     shadow-2xl shadow-black/20 overflow-hidden z-50 backdrop-blur-xl"
        >
          {/* Section Header */}
          <div className="px-4 py-2 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {showRecent ? 'Recent Searches' : query ? 'Search Results' : 'Popular Stocks'}
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {displayItems.map((item, index) => (
              <SearchResultItem
                key={item.symbol}
                result={item}
                isSelected={index === selectedIndex}
                isRecent={showRecent}
                onClick={() => handleSelect(item)}
              />
            ))}

            {query && results.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
                <button
                  onClick={() => {
                    onSelect(query)
                    setQuery("")
                    setIsOpen(false)
                  }}
                  className="mt-2 text-green-500 hover:underline text-sm"
                >
                  Search anyway
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResultItem({
  result,
  isSelected,
  isRecent,
  onClick
}: {
  result: SearchResult
  isSelected: boolean
  isRecent: boolean
  onClick: () => void
}) {
  const [logoError, setLogoError] = useState(false)
  const symbolColor = getSymbolColor(result.symbol)
  const logoUrl = result.logoUrl

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-4 transition-colors text-left
                  ${isSelected ? 'bg-green-500/10' : 'hover:bg-secondary/50'}`}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: logoUrl && !logoError ? 'white' : symbolColor + '20' }}
      >
        {logoUrl && !logoError ? (
          <img
            src={logoUrl}
            alt={result.symbol}
            className="w-8 h-8 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className="text-lg font-bold" style={{ color: symbolColor }}>
            {result.symbol.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{result.symbol}</span>
          {isRecent && (
            <Clock className="w-3 h-3 text-muted-foreground" />
          )}
          {result.type && result.type !== 'Stock' && (
            <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
              {result.type}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{result.name}</p>
        <p className="text-xs text-muted-foreground/70">{result.exchange}</p>
      </div>

      {/* Price Info (if available) */}
      {result.price !== undefined && typeof result.price === 'number' && (
        <div className="text-right flex-shrink-0">
          <p className="font-medium text-foreground">${result.price.toFixed(2)}</p>
          {result.changePercent !== undefined && typeof result.changePercent === 'number' && (
            <div className={`flex items-center justify-end gap-1 text-sm ${result.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
              {result.changePercent >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%</span>
            </div>
          )}
        </div>
      )}
    </button>
  )
}
