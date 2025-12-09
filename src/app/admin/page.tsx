"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Database, Server, Activity, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCw, Shield, Zap, Globe, HardDrive,
  TrendingUp, AlertOctagon, Loader2
} from "lucide-react"

interface SystemStatus {
  timestamp: string
  database: {
    connected: boolean
    tables: { name: string; count: number; lastUpdated?: string }[]
  }
  edgeFunctions: {
    name: string
    status: 'active' | 'error' | 'unknown'
    lastInvoked?: string
  }[]
  externalApis: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    responseTime?: number
    error?: string
  }[]
  syncStatus: {
    name: string
    lastSync: string | null
    status: 'fresh' | 'stale' | 'critical'
  }[]
  errors: {
    timestamp: string
    source: string
    message: string
  }[]
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStatus = async () => {
    if (!password) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      })

      if (response.status === 401) {
        setError('Invalid password')
        setIsAuthenticated(false)
        return
      }

      const data = await response.json()
      setStatus(data)
      setIsAuthenticated(true)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, password])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter admin password to access system monitoring
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStatus()}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                onClick={fetchStatus}
                disabled={loading || !password}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Access Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Lician Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System monitoring and health checks
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-sm text-muted-foreground">
                Last updated: {formatTimeAgo(lastRefresh.toISOString())}
              </span>
            )}
            <Button onClick={fetchStatus} disabled={loading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Database Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status?.database.connected ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <Database className={`w-5 h-5 ${
                      status?.database.connected ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Database</p>
                    <p className="font-semibold">
                      {status?.database.connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                {status?.database.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edge Functions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Edge Functions</p>
                    <p className="font-semibold">
                      {status?.edgeFunctions.filter(f => f.status === 'active').length || 0} Active
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-500">
                  {status?.edgeFunctions.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* External APIs */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status?.externalApis.every(a => a.status === 'healthy')
                      ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <Globe className={`w-5 h-5 ${
                      status?.externalApis.every(a => a.status === 'healthy')
                        ? 'text-green-500' : 'text-yellow-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">External APIs</p>
                    <p className="font-semibold">
                      {status?.externalApis.filter(a => a.status === 'healthy').length || 0} Healthy
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold">
                  {status?.externalApis.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    (status?.errors.length || 0) === 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <AlertOctagon className={`w-5 h-5 ${
                      (status?.errors.length || 0) === 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Errors</p>
                    <p className="font-semibold">
                      {(status?.errors.length || 0) === 0 ? 'None' : `${status?.errors.length} errors`}
                    </p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${
                  (status?.errors.length || 0) === 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {status?.errors.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Tables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status?.database.tables.map((table) => (
                  <div
                    key={table.name}
                    className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg"
                  >
                    <span className="font-mono text-sm">{table.name}</span>
                    <span className={`font-bold ${table.count < 0 ? 'text-red-500' : ''}`}>
                      {table.count < 0 ? 'Error' : formatNumber(table.count)}
                    </span>
                  </div>
                ))}
                {(!status?.database.tables || status.database.tables.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No table data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* External API Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                External API Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status?.externalApis.map((api) => (
                  <div
                    key={api.name}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                      api.status === 'healthy' ? 'bg-green-500/5 border-green-500/20' :
                      api.status === 'degraded' ? 'bg-yellow-500/5 border-yellow-500/20' :
                      'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {api.status === 'healthy' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : api.status === 'degraded' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{api.name}</p>
                        {api.error && (
                          <p className="text-xs text-red-500 truncate max-w-[200px]">{api.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        api.status === 'healthy' ? 'text-green-500' :
                        api.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {api.status.toUpperCase()}
                      </span>
                      {api.responseTime && (
                        <p className="text-xs text-muted-foreground">{api.responseTime}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Data Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status?.syncStatus.map((sync) => (
                  <div
                    key={sync.name}
                    className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        sync.status === 'fresh' ? 'bg-green-500' :
                        sync.status === 'stale' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">{sync.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        sync.status === 'fresh' ? 'bg-green-500/20 text-green-500' :
                        sync.status === 'stale' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {sync.status.toUpperCase()}
                      </span>
                      {sync.lastSync && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimeAgo(sync.lastSync)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!status?.syncStatus || status.syncStatus.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No sync data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edge Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Critical Edge Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {status?.edgeFunctions.map((fn) => (
                  <div
                    key={fn.name}
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg ${
                      fn.status === 'active' ? 'bg-green-500/10' :
                      fn.status === 'error' ? 'bg-red-500/10' : 'bg-secondary/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      fn.status === 'active' ? 'bg-green-500' :
                      fn.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs font-mono truncate">{fn.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Logs */}
        {status?.errors && status.errors.length > 0 && (
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertOctagon className="w-5 h-5" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status.errors.map((err, i) => (
                  <div
                    key={i}
                    className="py-3 px-4 bg-red-500/5 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-500">{err.source}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(err.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{err.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <p>Lician Admin Dashboard v1.0</p>
          <p className="text-xs mt-1">
            Monitoring {status?.edgeFunctions.length || 0} edge functions,{' '}
            {status?.database.tables.length || 0} database tables,{' '}
            {status?.externalApis.length || 0} external APIs
          </p>
        </div>
      </div>
    </div>
  )
}
