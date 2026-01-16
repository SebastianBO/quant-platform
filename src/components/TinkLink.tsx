"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Link2, CheckCircle, Loader2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TinkLinkProps {
  userId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

const EUROPEAN_MARKETS = [
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
]

export default function TinkLink({ userId, onSuccess, onError }: TinkLinkProps) {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(EUROPEAN_MARKETS[0])

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tink/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          market: selectedMarket.code,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Open Tink Link in a new window
      window.open(data.linkUrl, '_blank', 'width=500,height=700')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshInvestments = async () => {
    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/tink/get-investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setConnected(true)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync investments'
      setError(message)
    } finally {
      setSyncing(false)
    }
  }

  if (connected) {
    return (
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium">Connected to European Broker</p>
                <p className="text-sm text-muted-foreground">
                  Your investments are synced automatically
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshInvestments}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2">{syncing ? 'Syncing...' : 'Refresh'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Connect European Bank</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Securely connect your European brokerage or bank to automatically sync your portfolio holdings.
            </p>
          </div>

          {/* Country Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-48">
                <span className="mr-2">{selectedMarket.flag}</span>
                {selectedMarket.name}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {EUROPEAN_MARKETS.map((market) => (
                <DropdownMenuItem
                  key={market.code}
                  onClick={() => setSelectedMarket(market)}
                >
                  <span className="mr-2">{market.flag}</span>
                  {market.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Connect {selectedMarket.name} Bank
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Powered by Tink (Visa). Your credentials are never stored.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
