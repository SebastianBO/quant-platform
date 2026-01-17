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
    router.push(`/${symbol}`)
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
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#868f97]
                   hover:text-white hover:bg-white/[0.025] rounded-lg transition-colors duration-100"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search stocks...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border
                        bg-muted px-1.5 text-[10px] text-[#868f97] ml-2">
          <span className="text-xs">Cmd</span>K
        </kbd>
      </button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search stocks, companies, tools..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm text-[#868f97]">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary mx-auto mb-2" />
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
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-[#868f97] truncate">
                      {stock.name}
                    </div>
                  </div>
                  {stock.exchange && (
                    <span className="text-xs text-[#868f97]">
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
                  Stock Screener
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/earnings")}>
                  <Calendar className="mr-2 w-4 h-4 text-[#868f97]" />
                  Earnings Calendar
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/markets/top-gainers")}>
                  <Flame className="mr-2 w-4 h-4 text-[#4ebe96]" />
                  Top Gainers
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/markets/top-losers")}>
                  <TrendingUp className="mr-2 w-4 h-4 text-red-500 rotate-180" />
                  Top Losers
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Portfolio">
                <CommandItem onSelect={() => handleQuickAction("/dashboard/portfolios")}>
                  <Wallet className="mr-2 w-4 h-4 text-[#4ebe96]" />
                  Connect Portfolio
                </CommandItem>
                <CommandItem onSelect={() => handleQuickAction("/dashboard")}>
                  <Building2 className="mr-2 w-4 h-4 text-[#868f97]" />
                  Dashboard
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
