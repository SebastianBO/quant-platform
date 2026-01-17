"use client"

/**
 * Earnings Alert Signup Component
 *
 * Targeted newsletter signup for earnings alerts specific to a stock.
 * Can be embedded on stock pages and earnings pages.
 */

import { useState } from "react"
import { cn } from "@/lib/utils"

interface EarningsAlertSignupProps {
  ticker?: string
  companyName?: string
  earningsDate?: string
  variant?: "inline" | "card" | "banner"
  className?: string
}

export function EarningsAlertSignup({
  ticker,
  companyName,
  earningsDate,
  variant = "card",
  className,
}: EarningsAlertSignupProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email")
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: ticker ? `earnings_alert_${ticker}` : "earnings_alerts",
          interests: ["earnings", ticker].filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("You'll be notified before earnings!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong")
      }
    } catch {
      setStatus("error")
      setMessage("Failed to subscribe. Please try again.")
    }
  }

  // Bell icon
  const BellIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  )

  // Check icon
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-[#4ebe96]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )

  // Loading spinner
  const Spinner = () => (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  // Inline variant (for embedding in lists/tables)
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {status === "success" ? (
          <span className="flex items-center gap-1 text-sm text-[#4ebe96]">
            <CheckIcon /> Subscribed
          </span>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for alerts"
              disabled={status === "loading"}
              className="px-3 py-1.5 text-sm bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-full focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:border-transparent motion-safe:transition-all motion-safe:duration-150 ease-out"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-3 py-1.5 text-sm font-medium bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-full disabled:opacity-50 motion-safe:transition-all motion-safe:duration-150 ease-out"
            >
              {status === "loading" ? <Spinner /> : <BellIcon />}
            </button>
          </form>
        )}
      </div>
    )
  }

  // Banner variant (for page headers)
  if (variant === "banner") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-[#4ebe96]/20 to-[#479ffa]/20 border border-[#4ebe96]/30 rounded-2xl p-4",
        className
      )}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4ebe96]/20 rounded-2xl">
              <BellIcon />
            </div>
            <div>
              <p className="font-medium text-white">
                {ticker ? `Get ${ticker} Earnings Alerts` : "Get Earnings Alerts"}
              </p>
              <p className="text-sm text-[#868f97]">
                {earningsDate
                  ? `Next earnings: ${earningsDate}`
                  : "We'll notify you before earnings reports"}
              </p>
            </div>
          </div>

          {status === "success" ? (
            <span className="flex items-center gap-2 text-[#4ebe96]">
              <CheckIcon /> You're subscribed!
            </span>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={status === "loading"}
                className="flex-1 sm:w-48 px-3 py-2 text-sm bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-full focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:border-transparent motion-safe:transition-all motion-safe:duration-150 ease-out"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-4 py-2 text-sm font-medium bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-full disabled:opacity-50 whitespace-nowrap motion-safe:transition-all motion-safe:duration-150 ease-out"
              >
                {status === "loading" ? <Spinner /> : "Notify Me"}
              </button>
            </form>
          )}
        </div>
        {status === "error" && (
          <p className="mt-2 text-sm text-[#ff5c5c]">{message}</p>
        )}
      </div>
    )
  }

  // Card variant (default - for sidebar/standalone use)
  return (
    <div className={cn(
      "bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5",
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#4ebe96]/20 rounded-2xl text-[#4ebe96]">
          <BellIcon />
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {ticker ? `${ticker} Earnings Alerts` : "Earnings Alerts"}
          </h3>
          <p className="text-sm text-[#868f97]">
            Get notified before earnings
          </p>
        </div>
      </div>

      {ticker && companyName && (
        <div className="mb-4 p-3 bg-white/[0.03] rounded-2xl">
          <p className="text-sm text-[#868f97]">
            <span className="font-medium text-white">{companyName}</span>
            {earningsDate && (
              <> reports earnings on <span className="text-[#4ebe96]">{earningsDate}</span></>
            )}
          </p>
        </div>
      )}

      {status === "success" ? (
        <div className="flex items-center gap-2 p-3 bg-[#4ebe96]/10 rounded-2xl text-[#4ebe96]">
          <CheckIcon />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={status === "loading"}
            className="w-full px-4 py-2.5 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-full focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:border-transparent placeholder-[#868f97] motion-safe:transition-all motion-safe:duration-150 ease-out"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-2.5 font-medium bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-full disabled:opacity-50 motion-safe:transition-all motion-safe:duration-150 ease-out flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <Spinner />
            ) : (
              <>
                <BellIcon />
                Subscribe to Alerts
              </>
            )}
          </button>
          {status === "error" && (
            <p className="text-sm text-[#ff5c5c]">{message}</p>
          )}
        </form>
      )}

      <p className="mt-4 text-xs text-[#868f97] text-center">
        We'll email you 24 hours before earnings. Unsubscribe anytime.
      </p>
    </div>
  )
}

/**
 * Quick signup button for use in stock headers
 */
export function EarningsAlertButton({
  ticker,
  className,
}: {
  ticker: string
  className?: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) return

    setStatus("loading")
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: `earnings_alert_${ticker}`,
          interests: ["earnings", ticker],
        }),
      })
      setStatus("success")
      setTimeout(() => {
        setShowForm(false)
        setStatus("idle")
        setEmail("")
      }, 2000)
    } catch {
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <span className={cn("text-sm text-[#4ebe96] flex items-center gap-1", className)}>
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Subscribed!
      </span>
    )
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className={cn("flex items-center gap-2", className)}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
          className="px-2 py-1 text-sm bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-full w-32 focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:border-transparent motion-safe:transition-all motion-safe:duration-150 ease-out"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-2 py-1 text-sm bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out"
        >
          {status === "loading" ? "..." : "Go"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out"
        >
          ×
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
        "bg-[#4ebe96]/20 text-[#4ebe96] hover:bg-white/[0.08] rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out",
        className
      )}
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      Earnings Alert
    </button>
  )
}

export default EarningsAlertSignup
