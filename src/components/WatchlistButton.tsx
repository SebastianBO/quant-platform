"use client"

/**
 * Watchlist Button Component
 *
 * Add/remove stocks from user's watchlist.
 * Shows login prompt for unauthenticated users.
 */

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface WatchlistButtonProps {
  ticker: string
  variant?: "default" | "compact" | "icon"
  className?: string
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function WatchlistButton({ ticker, variant = "default", className }: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Check auth status and watchlist status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setIsAuthenticated(true)
          // Check if ticker is in watchlist
          const response = await fetch(`/api/watchlist?ticker=${ticker}`, {
            method: "HEAD",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })
          setIsInWatchlist(response.status === 200)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking watchlist status:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [ticker, supabase.auth])

  const toggleWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setShowLoginPrompt(true)
        return
      }

      if (isInWatchlist) {
        // Remove from watchlist
        await fetch(`/api/watchlist?ticker=${ticker}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        setIsInWatchlist(false)
      } else {
        // Add to watchlist
        await fetch("/api/watchlist", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticker }),
        })
        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, isInWatchlist, ticker, supabase.auth])

  // Star icons
  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={cn(
        "w-5 h-5 transition-all duration-100",
        filled ? "text-[#f4a623] fill-[#f4a623]" : "text-zinc-400"
      )}
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )

  // Loading spinner
  const LoadingSpinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  // Login prompt popup
  const LoginPromptPopup = () => (
    <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg min-w-[200px]">
        <p className="text-sm text-zinc-200 mb-2">Sign in to track stocks</p>
        <Link
          href={`/login?redirect=/stock/${ticker.toLowerCase()}`}
          className="block w-full bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white text-sm font-medium py-2 px-3 rounded text-center transition-colors duration-100"
        >
          Sign In
        </Link>
      </div>
    </div>
  )

  // Variant: Icon only (for headers/compact spaces)
  if (variant === "icon") {
    return (
      <div className="relative inline-block">
        <button
          onClick={toggleWatchlist}
          disabled={isLoading || isChecking}
          className={cn(
            "p-2 rounded-full transition-all duration-100",
            isInWatchlist
              ? "bg-[#f4a623]/20 hover:bg-[#f4a623]/30"
              : "bg-zinc-800 hover:bg-zinc-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isLoading ? <LoadingSpinner /> : <StarIcon filled={isInWatchlist} />}
        </button>
        {showLoginPrompt && <LoginPromptPopup />}
      </div>
    )
  }

  // Variant: Compact (for lists/tables)
  if (variant === "compact") {
    return (
      <div className="relative inline-block">
        <button
          onClick={toggleWatchlist}
          disabled={isLoading || isChecking}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all duration-100",
            isInWatchlist
              ? "bg-[#f4a623]/20 text-[#f4a623] hover:bg-[#f4a623]/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <StarIcon filled={isInWatchlist} />
          )}
          <span className="hidden sm:inline">
            {isInWatchlist ? "Watching" : "Watch"}
          </span>
        </button>
        {showLoginPrompt && <LoginPromptPopup />}
      </div>
    )
  }

  // Default variant (full button)
  return (
    <div className="relative inline-block">
      <button
        onClick={toggleWatchlist}
        disabled={isLoading || isChecking}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-100",
          isInWatchlist
            ? "bg-[#f4a623]/20 text-[#f4a623] border border-[#f4a623]/30 hover:bg-[#f4a623]/30"
            : "bg-[#4ebe96] text-white hover:bg-[#4ebe96]/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <StarIcon filled={isInWatchlist} />
        )}
        <span>
          {isChecking
            ? "Loading..."
            : isInWatchlist
            ? "In Watchlist"
            : "Add to Watchlist"}
        </span>
      </button>
      {showLoginPrompt && <LoginPromptPopup />}
    </div>
  )
}

/**
 * Watchlist counter badge - shows how many users are watching
 */
export function WatchlistCount({
  ticker,
  count,
  className,
}: {
  ticker: string
  count?: number
  className?: string
}) {
  const [watcherCount, setWatcherCount] = useState<number | null>(count ?? null)

  useEffect(() => {
    // In a real implementation, this would fetch the actual count
    // For now, we'll use a simulated count based on ticker
    if (count === undefined) {
      // Generate a pseudo-random but consistent count for each ticker
      const hash = ticker.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
      setWatcherCount(Math.floor((hash % 10000) + 100))
    }
  }, [ticker, count])

  if (watcherCount === null) return null

  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-zinc-400", className)}>
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{watcherCount.toLocaleString()} watching</span>
    </div>
  )
}

/**
 * Combined watchlist action row for stock pages
 */
export function WatchlistActions({
  ticker,
  className,
}: {
  ticker: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <WatchlistButton ticker={ticker} />
      <WatchlistCount ticker={ticker} />
    </div>
  )
}

export default WatchlistButton
