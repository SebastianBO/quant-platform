"use client"

import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Link2, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface PlaidLinkProps {
  userId: string
  onSuccess?: (itemId: string) => void
  onError?: (error: string) => void
}

export default function PlaidLink({ userId, onSuccess, onError }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [institutionName, setInstitutionName] = useState<string | null>(null)

  // Create link token on component mount
  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        const data = await response.json()

        if (data.error) {
          console.error('Error creating link token:', data.error)
          return
        }

        setLinkToken(data.link_token)
      } catch (err) {
        console.error('Failed to create link token:', err)
      }
    }

    if (userId) {
      createLinkToken()
    }
  }, [userId])

  const handleOnSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setLoading(true)
    setError(null)

    try {
      // Exchange the public token for an access token
      const exchangeResponse = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token: publicToken,
          userId,
          institution_id: metadata.institution?.institution_id,
          institution_name: metadata.institution?.name,
        }),
      })

      const exchangeData = await exchangeResponse.json()

      if (exchangeData.error) {
        throw new Error(exchangeData.error)
      }

      setInstitutionName(metadata.institution?.name || 'Brokerage')
      setConnected(true)

      // Now fetch and sync investments
      setSyncing(true)
      const investmentsResponse = await fetch('/api/plaid/get-investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: exchangeData.itemId,
        }),
      })

      const investmentsData = await investmentsResponse.json()
      setSyncing(false)

      if (investmentsData.error) {
        console.error('Error syncing investments:', investmentsData.error)
      }

      onSuccess?.(exchangeData.itemId)
    } catch (err: any) {
      setError(err.message || 'Failed to connect account')
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, onSuccess, onError])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link exited with error:', err)
        setError('Connection was cancelled or failed')
      }
    },
  })

  const handleRefreshInvestments = async () => {
    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/plaid/get-investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Success - investments are synced
    } catch (err: any) {
      setError(err.message || 'Failed to sync investments')
    } finally {
      setSyncing(false)
    }
  }

  if (connected) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium">Connected to {institutionName}</p>
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
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Connect Your Brokerage</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Securely connect your investment accounts to automatically sync your portfolio holdings.
              Supports 10,000+ US financial institutions.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={() => open()}
            disabled={!ready || loading}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Connect Account
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Powered by Plaid. Your credentials are never stored.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
