'use client'

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge, PriceBadge, LiveBadge, AvatarBadge } from '../base/Badge'
import { Input } from '../base/Input'
import { Text } from '../base/Text'
import { transitions } from '../animations'
import {
  TrendUpIcon,
  TrendDownIcon,
  CalendarIcon,
  FireIcon,
  BriefcaseIcon,
  SparklesIcon,
  FilterIcon,
} from '../base/Icons'

// =============================================================================
// TYPES
// =============================================================================

interface StockResult {
  symbol: string
  name: string
  price?: number
  change?: number
  exchange?: string
  type?: string
  logo?: string
  logoUrl?: string  // From Clearbit
  sector?: string
  industry?: string
  marketCap?: number
}

interface BriefingResult {
  id: string
  title: string
  content: string
  timestamp: string
  category: 'market' | 'earnings' | 'news' | 'alert'
}

interface CommandSearchProps {
  onSelect?: (type: 'stock' | 'briefing' | 'action', value: string) => void
  onClose?: () => void
  className?: string
}

// =============================================================================
// COMMAND SEARCH - Fey-style CMD+K search
// =============================================================================

export function CommandSearch({ onSelect, onClose, className }: CommandSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [stocks, setStocks] = useState<StockResult[]>([])
  const [briefings, setBriefings] = useState<BriefingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
        onClose?.()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onClose])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) {
      setStocks([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        // Fetch from Lician API
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          // Deduplicate by symbol and map logoUrl to logo
          const uniqueStocks = (data.results || []).reduce((acc: StockResult[], stock: StockResult) => {
            if (!acc.find(s => s.symbol === stock.symbol)) {
              acc.push({
                ...stock,
                logo: stock.logoUrl || stock.logo,
              })
            }
            return acc
          }, []).slice(0, 6)
          setStocks(uniqueStocks)
        }
      } catch (error) {
        console.error('Search error:', error)
      }
      setLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = stocks.length + quickActions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex < stocks.length) {
        handleSelectStock(stocks[selectedIndex])
      } else {
        const actionIndex = selectedIndex - stocks.length
        handleQuickAction(quickActions[actionIndex].path)
      }
    }
  }, [stocks, selectedIndex])

  const handleSelectStock = (stock: StockResult) => {
    onSelect?.('stock', stock.symbol)
    setOpen(false)
    setQuery('')
  }

  const handleQuickAction = (path: string) => {
    onSelect?.('action', path)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setQuery('')
    onClose?.()
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-white/[0.05] hover:bg-white/[0.08] rounded-lg',
          'border border-white/[0.08] hover:border-white/[0.12]',
          'text-[#868f97] hover:text-white transition-all duration-200',
          className
        )}
      >
        <SearchIcon className="size-4" />
        <span className="text-[13px] hidden md:inline">Search stocks...</span>
        <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 ml-2 text-[10px] bg-white/[0.05] rounded border border-white/[0.08]">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Command Dialog */}
            <motion.div
              className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[640px] z-50"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={transitions.smooth}
            >
              <div className={cn(
                'bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl',
                'border border-white/[0.1]',
                'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]',
                'overflow-hidden'
              )}>
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
                  <SearchIcon className="size-5 text-[#868f97]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search stocks, companies, tools..."
                    className="flex-1 bg-transparent text-white text-[15px] placeholder:text-[#555] outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1 hover:bg-white/[0.1] rounded"
                    >
                      <CloseIcon className="size-4 text-[#868f97]" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <LoadingState />
                  ) : stocks.length > 0 ? (
                    <StockResults
                      stocks={stocks}
                      selectedIndex={selectedIndex}
                      onSelect={handleSelectStock}
                    />
                  ) : query ? (
                    <EmptyState query={query} />
                  ) : (
                    <QuickActions
                      selectedIndex={selectedIndex - stocks.length}
                      onSelect={handleQuickAction}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.08] text-[11px] text-[#555]">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/[0.05] rounded">↵</kbd> select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/[0.05] rounded">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/[0.05] rounded">esc</kbd> close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// =============================================================================
// STOCK RESULTS
// =============================================================================

interface StockResultsProps {
  stocks: StockResult[]
  selectedIndex: number
  onSelect: (stock: StockResult) => void
}

function StockResults({ stocks, selectedIndex, onSelect }: StockResultsProps) {
  return (
    <div className="py-2">
      <div className="px-4 py-1.5">
        <Text variant="label" className="text-[11px]">STOCKS</Text>
      </div>
      {stocks.map((stock, i) => (
        <motion.button
          key={stock.symbol}
          onClick={() => onSelect(stock)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5',
            'hover:bg-white/[0.05] transition-colors',
            selectedIndex === i && 'bg-white/[0.08]'
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          {/* Logo */}
          <div className="size-10 rounded-lg bg-gradient-to-br from-white/[0.1] to-white/[0.05] flex items-center justify-center overflow-hidden shrink-0">
            {stock.logo ? (
              <img
                src={stock.logo}
                alt={stock.symbol}
                className="size-7 object-contain"
                onError={(e) => {
                  // Fallback to letter if image fails
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<span class="text-[14px] font-semibold text-white">${stock.symbol.charAt(0)}</span>`
                }}
              />
            ) : (
              <span className="text-[14px] font-semibold text-white">
                {stock.symbol.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-white">{stock.symbol}</span>
              {stock.exchange && (
                <span className="text-[10px] text-[#555] px-1.5 py-0.5 bg-white/[0.05] rounded">
                  {stock.exchange}
                </span>
              )}
              {stock.sector && (
                <span className="text-[10px] text-[#479ffa] truncate max-w-[100px]">
                  {stock.sector}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#868f97] truncate">{stock.name}</p>
          </div>

          {/* Price & Change */}
          {stock.price !== undefined && (
            <div className="text-right">
              <p className="text-[14px] font-medium text-white tabular-nums">
                ${stock.price.toFixed(2)}
              </p>
              {stock.change !== undefined && (
                <PriceBadge value={stock.change} size="xs" />
              )}
            </div>
          )}
        </motion.button>
      ))}
    </div>
  )
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

const quickActions: Array<{ icon: ReactNode; label: string; description: string; path: string }> = [
  { icon: <FilterIcon size="md" className="text-[#479ffa]" />, label: 'Stock Screener', description: 'Filter stocks by metrics', path: '/screener' },
  { icon: <CalendarIcon size="md" className="text-[#f4a623]" />, label: 'Earnings Calendar', description: 'Upcoming earnings dates', path: '/earnings' },
  { icon: <FireIcon size="md" className="text-[#4ebe96]" />, label: 'Top Gainers', description: "Today's best performers", path: '/markets/top-gainers' },
  { icon: <TrendDownIcon size="md" className="text-[#e15241]" />, label: 'Top Losers', description: "Today's worst performers", path: '/markets/top-losers' },
  { icon: <BriefcaseIcon size="md" className="text-[#9b59b6]" />, label: 'Portfolio', description: 'View your holdings', path: '/dashboard/portfolios' },
  { icon: <SparklesIcon size="md" className="text-[#479ffa]" />, label: 'AI Chat', description: 'Ask anything about markets', path: '/chat' },
]

interface QuickActionsProps {
  selectedIndex: number
  onSelect: (path: string) => void
}

function QuickActions({ selectedIndex, onSelect }: QuickActionsProps) {
  return (
    <div className="py-2">
      <div className="px-4 py-1.5">
        <Text variant="label" className="text-[11px]">QUICK ACTIONS</Text>
      </div>
      {quickActions.map((action, i) => (
        <motion.button
          key={action.path}
          onClick={() => onSelect(action.path)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5',
            'hover:bg-white/[0.05] transition-colors',
            selectedIndex === i && 'bg-white/[0.08]'
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          {action.icon}
          <div className="flex-1 text-left">
            <p className="text-[14px] font-medium text-white">{action.label}</p>
            <p className="text-[12px] text-[#868f97]">{action.description}</p>
          </div>
          <ChevronRight className="size-4 text-[#555]" />
        </motion.button>
      ))}

      {/* Recent Searches */}
      <div className="mt-2 pt-2 border-t border-white/[0.06]">
        <div className="px-4 py-1.5">
          <Text variant="label" className="text-[11px]">TRENDING</Text>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-2">
          {['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN'].map((ticker) => (
            <button
              key={ticker}
              onClick={() => onSelect(`/${ticker}`)}
              className="px-3 py-1.5 text-[12px] font-medium text-[#868f97] bg-white/[0.05] hover:bg-white/[0.1] hover:text-white rounded-full transition-colors"
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// STATES
// =============================================================================

function LoadingState() {
  return (
    <div className="py-12 text-center">
      <motion.div
        className="size-8 border-2 border-[#479ffa] border-t-transparent rounded-full mx-auto"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-3 text-[13px] text-[#868f97]">Searching...</p>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <div className="size-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
        <SearchIcon className="size-6 text-[#555]" />
      </div>
      <p className="text-[14px] text-white mb-1">No results found</p>
      <p className="text-[12px] text-[#868f97]">
        No stocks match "{query}"
      </p>
    </div>
  )
}

// =============================================================================
// ICONS
// =============================================================================

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// =============================================================================
// COMMAND SEARCH TRIGGER - Minimal trigger for navbar
// =============================================================================

export function CommandSearchTrigger({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => {
        // Dispatch keyboard event to trigger command search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5',
        'bg-white/[0.05] hover:bg-white/[0.08] rounded-lg',
        'border border-white/[0.08]',
        'text-[#868f97] hover:text-white transition-all',
        className
      )}
    >
      <SearchIcon className="size-4" />
      <span className="text-[13px]">Search</span>
      <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-white/[0.05] rounded">
        ⌘K
      </kbd>
    </button>
  )
}
