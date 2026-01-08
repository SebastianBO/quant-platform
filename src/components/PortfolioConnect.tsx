"use client"

import { useState, useCallback, useEffect } from "react"
import { usePlaidLink } from "react-plaid-link"
import {
  Wallet,
  Building2,
  TrendingUp,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PortfolioConnectProps {
  userId: string
  onSuccess?: (holdings: any[]) => void
  compact?: boolean
  className?: string
}

export default function PortfolioConnect({
  userId,
  onSuccess,
  compact = false,
  className,
}: PortfolioConnectProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [holdings, setHoldings] = useState<any[]>([])

  // Create link token on mount
  useEffect(() => {
    if (!userId) return

    const createLinkToken = async () => {
      try {
        const res = await fetch("/api/plaid/create-link-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to create link token")
        }

        const { link_token } = await res.json()
        setLinkToken(link_token)
      } catch (err) {
        console.error("Link token error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize")
      }
    }

    createLinkToken()
  }, [userId])

  // Handle successful Plaid Link connection
  const onPlaidSuccess = useCallback(
    async (publicToken: string) => {
      setLoading(true)
      setError(null)

      try {
        // Exchange public token for access token
        const exchangeRes = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken, userId }),
        })

        if (!exchangeRes.ok) {
          throw new Error("Failed to connect account")
        }

        // Get investment holdings
        const holdingsRes = await fetch("/api/plaid/get-investments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })

        if (holdingsRes.ok) {
          const data = await holdingsRes.json()
          setHoldings(data.holdings || [])
          setConnected(true)
          onSuccess?.(data.holdings || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed")
      } finally {
        setLoading(false)
      }
    },
    [userId, onSuccess]
  )

  // Plaid Link configuration
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => setLoading(false),
  })

  // Compact button version
  if (compact) {
    return (
      <Button
        onClick={() => open()}
        disabled={!ready || loading}
        variant="outline"
        className={cn("gap-2", className)}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : connected ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {connected ? "Connected" : "Connect Portfolio"}
      </Button>
    )
  }

  // Full card version
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Connect Your Portfolio</h3>
          <p className="text-sm text-muted-foreground">
            Link your brokerage account to get personalized insights
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-green-500" />
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span className="text-sm">Track performance</span>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-purple-500" />
          <span className="text-sm">AI analysis</span>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm">Bank-level security</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      {/* Connected state */}
      {connected && holdings.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Portfolio Connected</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => open()}
              disabled={!ready}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Add Another
            </Button>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              {holdings.length} holdings synced
            </p>
            <div className="flex flex-wrap gap-2">
              {holdings.slice(0, 5).map((h, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-card rounded text-xs font-mono"
                >
                  {h.symbol || h.name}
                </span>
              ))}
              {holdings.length > 5 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{holdings.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Connect button */
        <Button
          onClick={() => open()}
          disabled={!ready || loading}
          className="w-full h-12 bg-green-600 hover:bg-green-500 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Connect Brokerage Account
            </>
          )}
        </Button>
      )}

      {/* Security note */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Secured by Plaid. We never store your login credentials.
      </p>
    </div>
  )
}
