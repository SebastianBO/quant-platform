"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Search,
  TrendingUp,
  BarChart3,
  Calendar,
  Wallet,
  Flame,
  Building2,
} from "lucide-react"
import StockLogo from "@/components/StockLogo"

interface SearchResult {
  symbol: string
  name: string
  exchange?: string
  type?: string
}

export function StockSearchCommand() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  // Keyboard shortcut (Cmd/Ctrl + K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounced search
  React.useEffect(() => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error('Search error:', error)
      }
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (symbol: string) => {
    router.push(`/${symbol}-stock`)
    setOpen(false)
    setQuery("")
    setResults([])
  }

  const handleQuickAction = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button in header - Fey ghost button style */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#868f97]
                   hover:text-white hover:bg-white/[0.05] rounded-lg
                   motion-safe:transition-colors motion-safe:duration-150
                   focus:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.24]"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search stocks...</span>
        {/* Fey badge/tag style for keyboard shortcut */}
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded-full
                        bg-white/[0.08] border border-white/[0.08] px-2
                        text-[10px] font-medium text-[#868f97] ml-2">
          <span className="text-xs">Cmd</span>K
        </kbd>
      </button>

      {/* Command dialog with Fey styling */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search stocks, companies, tools..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="py-8 text-center text-sm text-[#868f97]">
              {/* Fey-styled loading spinner */}
              <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-white/[0.08] border-t-[#4ebe96]" />
              Searching...
            </div>
          ) : results.length === 0 && query ? (
            <CommandEmpty>No stocks found for "{query}"</CommandEmpty>
          ) : null}

          {/* Stock results */}
          {results.length > 0 && (
            <CommandGroup heading="Stocks">
              {results.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  onSelect={() => handleSelect(stock.symbol)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <StockLogo symbol={stock.symbol} size="sm" />
                  <div className="flex-1 min-w-0">
                    {/* Stock symbol in monospace - Fey typography */}
                    <div className="font-mono font-medium tracking-[-0.8px] text-white">
                      {stock.symbol}
                    </div>
                    <div className="text-xs text-[#868f97] truncate">
                      {stock.name}
                    </div>
                  </div>
                  {stock.exchange && (
                    <span className="text-xs text-[#868f97] font-mono">
                      {stock.exchange}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query && (
            <>
              {/* Quick Actions */}
              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={() => handleQuickAction("/screener")}>
                  <BarChart3 className="mr-2 w-4 h-4 text-[#868f97]" />
                  <span className="text-white">Stock Screener</span>
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/earnings")}>
                  <Calendar className="mr-2 w-4 h-4 text-[#868f97]" />
                  <span className="text-white">Earnings Calendar</span>
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/markets/top-gainers")}>
                  <Flame className="mr-2 w-4 h-4 text-[#4ebe96]" />
                  <span className="text-white">Top Gainers</span>
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/markets/top-losers")}>
                  <TrendingUp className="mr-2 w-4 h-4 text-[#ff5c5c] rotate-180" />
                  <span className="text-white">Top Losers</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Portfolio">
                <CommandItem onSelect={() => handleQuickAction("/dashboard/portfolios")}>
                  <Wallet className="mr-2 w-4 h-4 text-[#4ebe96]" />
                  <span className="text-white">Connect Portfolio</span>
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/dashboard")}>
                  <Building2 className="mr-2 w-4 h-4 text-[#868f97]" />
                  <span className="text-white">Dashboard</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
