"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Database, Server, Activity, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCw, Shield, Zap, Globe, HardDrive,
  TrendingUp, AlertOctagon, Loader2, ChevronDown, ChevronRight,
  Users, Briefcase, BarChart3, FileText, Bot, Wallet,
  Bell, Building, Settings, Link2, Eye, Play, Search, Filter,
  Terminal, CircleDot, Pause, AlertCircle, Timer, Sparkles
} from "lucide-react"

interface TableInfo {
  name: string
  count: number
  error?: string
}

interface EdgeFunctionInfo {
  name: string
  status: 'active' | 'error' | 'unknown'
}

interface FunctionLog {
  id: string
  functionName: string
  status: 'success' | 'error' | 'running'
  duration?: number
  timestamp: string
  message?: string
}

interface SystemStatus {
  timestamp: string
  database: {
    connected: boolean
    tablesByCategory: Record<string, TableInfo[]>
    totalRows: number
  }
  edgeFunctions: {
    byCategory: Record<string, EdgeFunctionInfo[]>
    totalActive: number
    totalFunctions: number
  }
  externalApis: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    responseTime?: number
    error?: string
    critical: boolean
  }[]
  syncStatus: {
    name: string
    lastSync: string | null
    status: 'fresh' | 'stale' | 'critical'
    recordsProcessed?: number
  }[]
  errors: {
    timestamp: string
    source: string
    message: string
    severity: 'error' | 'warning'
  }[]
  metrics: {
    totalSymbols: number
    totalPortfolios: number
    totalUsers: number
    apiCallsToday: number
    lastEarningsSync: string | null
    lastPriceSync: string | null
  }
  functionLogs?: FunctionLog[]
  financialSync?: {
    syncProgress: {
      companiesSynced: number
      totalCompanies: number
      percentComplete: number
      isRunning: boolean
      lastBatchAt: string | null
    }
    dataFreshness: {
      dataType: string
      recordCount: number
      latestDate: string | null
      lastSync: string | null
    }[]
    pendingQueue: number
    recentSyncs: {
      ticker: string
      status: string
      syncedAt: string
      itemsCreated: number
    }[]
  }
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Data Ingestion': <Database className="w-4 h-4" />,
  'Symbol Management': <FileText className="w-4 h-4" />,
  'Options & Derivatives': <TrendingUp className="w-4 h-4" />,
  'Short Interest': <BarChart3 className="w-4 h-4" />,
  'Fundamentals': <Briefcase className="w-4 h-4" />,
  'AI & Analysis': <Bot className="w-4 h-4" />,
  'Portfolio': <Wallet className="w-4 h-4" />,
  'Real-time & WebSocket': <Activity className="w-4 h-4" />,
  'SEO & Content': <Search className="w-4 h-4" />,
  'Notifications': <Bell className="w-4 h-4" />,
  'Banking Integration': <Building className="w-4 h-4" />,
  'Infrastructure': <Settings className="w-4 h-4" />,
  'External Integrations': <Link2 className="w-4 h-4" />,
  'Core Financial': <Database className="w-4 h-4" />,
  'Earnings': <TrendingUp className="w-4 h-4" />,
  'Financial Statements': <FileText className="w-4 h-4" />,
  'Options': <BarChart3 className="w-4 h-4" />,
  'SEC & Insider': <Eye className="w-4 h-4" />,
  'Social & Chat': <Users className="w-4 h-4" />,
  'Users & Auth': <Shield className="w-4 h-4" />,
  'Banking': <Building className="w-4 h-4" />,
  'SEO': <Search className="w-4 h-4" />,
  'Email': <Bell className="w-4 h-4" />,
  'System & Logs': <Server className="w-4 h-4" />
}

// Data freshness thresholds (in hours)
const FRESHNESS_THRESHOLDS = {
  prices: { fresh: 1, stale: 4, critical: 24 },
  earnings: { fresh: 24, stale: 72, critical: 168 },
  fundamentals: { fresh: 24, stale: 168, critical: 720 },
  shortInterest: { fresh: 24, stale: 72, critical: 168 }
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'tables' | 'apis' | 'logs' | 'sync' | 'analysts'>('overview')
  const [analystStats, setAnalystStats] = useState<{
    totalRatings: number
    totalAnalysts: number
    totalFirms: number
    recentRatings: Array<{
      ticker: string
      firm: string
      rating: string
      priceTarget: number | null
      ratingDate: string
    }>
    newsSources: string[]
  } | null>(null)
  const [analystLoading, setAnalystLoading] = useState(false)
  const [syncActionLoading, setSyncActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [testingFunction, setTestingFunction] = useState<string | null>(null)
  const [functionTestResults, setFunctionTestResults] = useState<Record<string, { success: boolean; message: string; duration?: number }>>({})
  const [functionLogs, setFunctionLogs] = useState<FunctionLog[]>([])
  const [isPollingLogs, setIsPollingLogs] = useState(false)

  const fetchStatus = useCallback(async () => {
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

      // Update function logs if available
      if (data.functionLogs) {
        setFunctionLogs(data.functionLogs)
      }
    } catch (err) {
      setError('Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [password])

  // Test edge function
  const testFunction = async (functionName: string) => {
    setTestingFunction(functionName)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test-edge-function',
          functionName
        })
      })

      const result = await response.json()
      const duration = Date.now() - startTime

      setFunctionTestResults(prev => ({
        ...prev,
        [functionName]: {
          success: result.success,
          message: result.error || 'Function executed successfully',
          duration
        }
      }))

      // Add to logs
      setFunctionLogs(prev => [{
        id: `${functionName}-${Date.now()}`,
        functionName,
        status: result.success ? 'success' : 'error',
        duration,
        timestamp: new Date().toISOString(),
        message: result.error || 'Test invocation completed'
      }, ...prev.slice(0, 49)])

    } catch (err) {
      setFunctionTestResults(prev => ({
        ...prev,
        [functionName]: {
          success: false,
          message: String(err)
        }
      }))
    } finally {
      setTestingFunction(null)
    }
  }

  // Fetch analyst ratings stats
  const fetchAnalystStats = async () => {
    if (!password) return
    setAnalystLoading(true)

    try {
      // Fetch from multiple endpoints
      const [ratingsRes, firmsRes] = await Promise.all([
        fetch('/api/v1/analyst-ratings?limit=10', {
          headers: { 'Authorization': `Bearer ${password}` }
        }),
        fetch('/api/admin/status', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${password}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'get-analyst-stats' })
        })
      ])

      const ratingsData = await ratingsRes.json()
      const statsData = await firmsRes.json()

      setAnalystStats({
        totalRatings: statsData.analystStats?.totalRatings || ratingsData._meta?.count || 0,
        totalAnalysts: statsData.analystStats?.totalAnalysts || 0,
        totalFirms: statsData.analystStats?.totalFirms || 37,
        recentRatings: (ratingsData.analyst_ratings || []).map((r: Record<string, unknown>) => ({
          ticker: r.ticker,
          firm: (r.firm as Record<string, unknown>)?.name || 'Unknown',
          rating: r.rating,
          priceTarget: r.priceTarget,
          ratingDate: r.ratingDate
        })),
        newsSources: statsData.analystStats?.newsSources || []
      })
    } catch (err) {
      console.error('Failed to fetch analyst stats:', err)
    } finally {
      setAnalystLoading(false)
    }
  }

  // Trigger analyst ratings scraper
  const triggerAnalystScraper = async () => {
    setSyncActionLoading('analyst-scraper')

    try {
      const response = await fetch('/api/cron/sync-analyst-ratings', {
        headers: { 'Authorization': `Bearer ${password}` }
      })

      const result = await response.json()

      setFunctionLogs(prev => [{
        id: `analyst-scraper-${Date.now()}`,
        functionName: 'sync-analyst-ratings',
        status: result.success ? 'success' : 'error',
        duration: result.summary?.duration,
        timestamp: new Date().toISOString(),
        message: `Processed ${result.summary?.sourcesProcessed || 0} sources, extracted ${result.summary?.ratingsExtracted || 0} ratings`
      }, ...prev.slice(0, 49)])

      // Refresh stats after scrape
      setTimeout(fetchAnalystStats, 2000)
    } catch (err) {
      setFunctionLogs(prev => [{
        id: `analyst-scraper-${Date.now()}`,
        functionName: 'sync-analyst-ratings',
        status: 'error',
        timestamp: new Date().toISOString(),
        message: String(err)
      }, ...prev.slice(0, 49)])
    } finally {
      setSyncActionLoading(null)
    }
  }

  // Trigger financial sync action
  const triggerSyncAction = async (action: 'sync-financials' | 'watch-filings', mode?: string, limit?: number) => {
    const actionKey = `${action}-${mode || 'default'}`
    setSyncActionLoading(actionKey)

    try {
      const response = await fetch('/api/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          mode,
          limit
        })
      })

      const result = await response.json()

      // Add to logs
      setFunctionLogs(prev => [{
        id: `${action}-${Date.now()}`,
        functionName: action,
        status: result.success ? 'success' : 'error',
        duration: result.duration,
        timestamp: new Date().toISOString(),
        message: result.message || (result.success ? 'Sync triggered successfully' : result.error)
      }, ...prev.slice(0, 49)])

      // Refresh status after sync
      if (result.success) {
        setTimeout(fetchStatus, 2000)
      }

    } catch (err) {
      setFunctionLogs(prev => [{
        id: `${action}-${Date.now()}`,
        functionName: action,
        status: 'error',
        timestamp: new Date().toISOString(),
        message: String(err)
      }, ...prev.slice(0, 49)])
    } finally {
      setSyncActionLoading(null)
    }
  }

  // Auto-refresh every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchStatus])

  // Poll for live logs when enabled
  useEffect(() => {
    if (!isPollingLogs || !isAuthenticated) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/status?logsOnly=true', {
          headers: { 'Authorization': `Bearer ${password}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.functionLogs) {
            setFunctionLogs(data.functionLogs)
          }
        }
      } catch (e) {
        // Silent fail for log polling
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [isPollingLogs, isAuthenticated, password])

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

  const getDataFreshness = (tableName: string, count: number): 'fresh' | 'stale' | 'critical' | 'empty' => {
    if (count === 0) return 'empty'

    // Check based on table type
    if (tableName.includes('price') || tableName.includes('realtime')) {
      return 'fresh' // Would need lastUpdated timestamp for accurate check
    }
    if (tableName.includes('earnings')) {
      return count > 100 ? 'fresh' : 'stale'
    }
    if (tableName.includes('short')) {
      return count > 1000 ? 'fresh' : 'stale'
    }
    return 'fresh'
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const expandAll = () => {
    if (status?.edgeFunctions?.byCategory) {
      setExpandedCategories(new Set([
        ...Object.keys(status.edgeFunctions.byCategory).map(k => `fn-${k}`),
        ...Object.keys(status.database.tablesByCategory || {}).map(k => `db-${k}`)
      ]))
    }
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
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
            <CardTitle>Lician Admin Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              System monitoring for 150+ edge functions and 90+ database tables
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

  // Calculate totals
  const totalTables = status?.database?.tablesByCategory
    ? Object.values(status.database.tablesByCategory).flat().length
    : 0
  const totalFunctions = status?.edgeFunctions?.totalFunctions || 0
  const healthyApis = status?.externalApis?.filter(a => a.status === 'healthy').length || 0
  const totalApis = status?.externalApis?.length || 0

  // Calculate data freshness alerts
  const emptyTables = status?.database?.tablesByCategory
    ? Object.values(status.database.tablesByCategory).flat().filter(t => t.count === 0).length
    : 0
  const criticalTables = status?.database?.tablesByCategory
    ? Object.values(status.database.tablesByCategory).flat().filter(t => {
        const freshness = getDataFreshness(t.name, t.count)
        return freshness === 'critical' || freshness === 'empty'
      }).length
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-primary" />
                Lician Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoring {totalFunctions} functions, {totalTables} tables, {totalApis} APIs
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Data Freshness Alert Badge */}
              {(emptyTables > 0 || criticalTables > 0) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-500 font-medium">
                    {emptyTables} empty, {criticalTables} need attention
                  </span>
                </div>
              )}
              {lastRefresh && (
                <span className="text-sm text-muted-foreground">
                  Updated {formatTimeAgo(lastRefresh.toISOString())}
                </span>
              )}
              <Button onClick={fetchStatus} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'sync', label: 'Financial Sync', icon: <RefreshCw className="w-4 h-4" /> },
              { id: 'analysts', label: 'Analyst Ratings', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'functions', label: `Functions (${totalFunctions})`, icon: <Zap className="w-4 h-4" /> },
              { id: 'tables', label: `Tables (${totalTables})`, icon: <Database className="w-4 h-4" /> },
              { id: 'apis', label: `APIs (${healthyApis}/${totalApis})`, icon: <Globe className="w-4 h-4" /> },
              { id: 'logs', label: `Logs`, icon: <Terminal className="w-4 h-4" /> }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status?.database.connected ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Database className={`w-5 h-5 ${
                        status?.database.connected ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Database</p>
                      <p className="font-bold text-lg">
                        {status?.database.connected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Symbols</p>
                      <p className="font-bold text-lg">{formatNumber(status?.metrics?.totalSymbols || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Portfolios</p>
                      <p className="font-bold text-lg">{formatNumber(status?.metrics?.totalPortfolios || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Users</p>
                      <p className="font-bold text-lg">{formatNumber(status?.metrics?.totalUsers || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Rows</p>
                      <p className="font-bold text-lg">{formatNumber(status?.database?.totalRows || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">API Calls</p>
                      <p className="font-bold text-lg">{formatNumber(status?.metrics?.apiCallsToday || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Freshness Alerts */}
            {emptyTables > 0 && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-yellow-500">
                    <AlertCircle className="w-5 h-5" />
                    Data Freshness Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {status?.database?.tablesByCategory && Object.entries(status.database.tablesByCategory).map(([category, tables]) => {
                      const emptyInCategory = tables.filter(t => t.count === 0)
                      if (emptyInCategory.length === 0) return null

                      return (
                        <div key={category} className="flex items-center justify-between py-2 px-3 bg-yellow-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-yellow-600">
                              {emptyInCategory.length} empty tables: {emptyInCategory.slice(0, 3).map(t => t.name).join(', ')}
                              {emptyInCategory.length > 3 ? ` +${emptyInCategory.length - 3} more` : ''}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* External APIs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="w-5 h-5" />
                    External API Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {status?.externalApis?.map((api) => (
                      <div
                        key={api.name}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          api.status === 'healthy' ? 'bg-green-500/5' :
                          api.status === 'degraded' ? 'bg-yellow-500/5' :
                          'bg-red-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {api.status === 'healthy' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : api.status === 'degraded' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{api.name}</span>
                          {api.critical && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">CRITICAL</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {api.responseTime && (
                            <span className="text-xs text-muted-foreground">{api.responseTime}ms</span>
                          )}
                          <span className={`text-xs font-medium ${
                            api.status === 'healthy' ? 'text-green-500' :
                            api.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {api.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Function Invocations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Recent Function Activity
                    </div>
                    <Button
                      variant={isPollingLogs ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPollingLogs(!isPollingLogs)}
                      className="h-7 text-xs"
                    >
                      {isPollingLogs ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Live
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Start Live
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {functionLogs.length > 0 ? functionLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          log.status === 'success' ? 'bg-green-500/5' :
                          log.status === 'error' ? 'bg-red-500/5' :
                          'bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : log.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          )}
                          <span className="text-xs font-mono">{log.functionName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.duration && (
                            <span className="text-xs text-muted-foreground">{log.duration}ms</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4 text-sm">
                        No recent function activity. Test a function to see logs here.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sync Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RefreshCw className="w-5 h-5" />
                  Data Sync Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {status?.syncStatus?.length ? status.syncStatus.map((sync) => (
                    <div
                      key={sync.name}
                      className={`py-3 px-4 rounded-lg border ${
                        sync.status === 'fresh' ? 'bg-green-500/5 border-green-500/20' :
                        sync.status === 'stale' ? 'bg-yellow-500/5 border-yellow-500/20' :
                        'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          sync.status === 'fresh' ? 'bg-green-500' :
                          sync.status === 'stale' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium truncate">{sync.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {sync.lastSync ? formatTimeAgo(sync.lastSync) : 'Never'}
                        </span>
                        {sync.recordsProcessed && (
                          <span className="text-xs text-muted-foreground">
                            {formatNumber(sync.recordsProcessed)}
                          </span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4 col-span-4">No sync data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Errors */}
            {status?.errors && status.errors.length > 0 && (
              <Card className="border-red-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-red-500">
                    <AlertOctagon className="w-5 h-5" />
                    Recent Errors ({status.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {status.errors.slice(0, 5).map((err, i) => (
                      <div
                        key={i}
                        className="py-2 px-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-500">{err.source}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(err.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{err.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Analyst Ratings Tab */}
        {activeTab === 'analysts' && (
          <div className="space-y-6">
            {/* Scraper Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analyst Ratings Scraper
                  </div>
                  <Button
                    onClick={fetchAnalystStats}
                    disabled={analystLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${analystLoading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">{formatNumber(analystStats?.totalRatings || 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Ratings</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-500">{formatNumber(analystStats?.totalAnalysts || 0)}</p>
                    <p className="text-sm text-muted-foreground">Analysts Tracked</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-500">{analystStats?.totalFirms || 37}</p>
                    <p className="text-sm text-muted-foreground">Firms Covered</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-500">26</p>
                    <p className="text-sm text-muted-foreground">News Sources</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={triggerAnalystScraper}
                    disabled={syncActionLoading !== null}
                    className="flex-1"
                  >
                    {syncActionLoading === 'analyst-scraper' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Scraper Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/api/v1/analyst-ratings?limit=100', '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View API
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/api/v1/analysts?limit=50', '_blank')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Analyst Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Ratings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" />
                    Recent Analyst Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {analystStats?.recentRatings?.length ? (
                      analystStats.recentRatings.map((rating, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                            rating.rating?.toLowerCase().includes('buy') ? 'bg-green-500/10' :
                            rating.rating?.toLowerCase().includes('sell') ? 'bg-red-500/10' :
                            'bg-secondary/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold">{rating.ticker}</span>
                            <span className="text-sm text-muted-foreground">{rating.firm}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              rating.rating?.toLowerCase().includes('buy') ? 'text-green-500' :
                              rating.rating?.toLowerCase().includes('sell') ? 'text-red-500' :
                              'text-yellow-500'
                            }`}>
                              {rating.rating}
                            </span>
                            {rating.priceTarget && (
                              <p className="text-xs text-muted-foreground">${rating.priceTarget}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No ratings yet. Run the scraper to collect data.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* News Sources */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="w-5 h-5" />
                    News Sources (26 Active)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto text-xs">
                    {[
                      'PR Newswire - Business', 'PR Newswire - All News',
                      'GlobeNewswire - Analyst', 'GlobeNewswire - All',
                      'Business Wire', 'AccessWire',
                      'MarketWatch - Market Pulse', 'MarketWatch - Top Stories', 'MarketWatch - Stocks',
                      'Seeking Alpha - Market Currents', 'Seeking Alpha - Stock Ideas',
                      'Yahoo Finance', 'Benzinga - General', 'Benzinga - Analyst Ratings',
                      'TheStreet', 'Investor Place', 'Motley Fool',
                      'Reuters - Business', 'CNBC - Top News', 'CNBC - Stock Blog',
                      'Zacks - Commentary', 'Barrons', 'Financial Times', 'WSJ Markets',
                      'TechCrunch', 'BioPharma Dive'
                    ].map((source) => (
                      <div key={source} className="flex items-center gap-2 py-1.5 px-2 bg-secondary/30 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="font-mono">{source}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cron Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5" />
                  Automated Sync Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <span className="font-medium">scrape-analyst-ratings</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Every 2 hours on weekdays</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">0 */2 * * 1-5</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">update-analyst-performance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Daily at 6 AM UTC</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">0 6 * * *</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Sync Tab */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            {/* Sync Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Financial Data Sync Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => triggerSyncAction('sync-financials', 'priority', 10)}
                    disabled={syncActionLoading !== null}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    {syncActionLoading === 'sync-financials-priority' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <span className="text-xs">Sync Priority (Top 100)</span>
                  </Button>

                  <Button
                    onClick={() => triggerSyncAction('sync-financials', 'continue', 5)}
                    disabled={syncActionLoading !== null}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    {syncActionLoading === 'sync-financials-continue' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    <span className="text-xs">Continue Bulk Sync</span>
                  </Button>

                  <Button
                    onClick={() => triggerSyncAction('watch-filings')}
                    disabled={syncActionLoading !== null}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    {syncActionLoading === 'watch-filings-default' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                    <span className="text-xs">Watch SEC Filings</span>
                  </Button>

                  <Button
                    onClick={() => triggerSyncAction('sync-financials', 'single')}
                    disabled={syncActionLoading !== null}
                    variant="secondary"
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    {syncActionLoading === 'sync-financials-single' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                    <span className="text-xs">Sync Single Ticker</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sync Progress */}
            {status?.financialSync?.syncProgress && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Sync Progress
                    </div>
                    {status.financialSync.syncProgress.isRunning && (
                      <div className="flex items-center gap-2 text-green-500">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span className="text-xs">Running</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Companies Synced</span>
                      <span className="font-bold">
                        {formatNumber(status.financialSync.syncProgress.companiesSynced)} / {formatNumber(status.financialSync.syncProgress.totalCompanies)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${status.financialSync.syncProgress.percentComplete}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {status.financialSync.syncProgress.percentComplete.toFixed(1)}% complete
                      </span>
                      {status.financialSync.syncProgress.lastBatchAt && (
                        <span className="text-muted-foreground">
                          Last batch: {formatTimeAgo(status.financialSync.syncProgress.lastBatchAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Freshness */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5" />
                    Data Freshness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {status?.financialSync?.dataFreshness?.length ? (
                      status.financialSync.dataFreshness.map((item) => (
                        <div
                          key={item.dataType}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                            item.recordCount > 0 ? 'bg-green-500/5' : 'bg-yellow-500/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              item.recordCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-sm font-medium capitalize">
                              {item.dataType.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatNumber(item.recordCount)}</p>
                            {item.latestDate && (
                              <p className="text-xs text-muted-foreground">
                                Latest: {new Date(item.latestDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No freshness data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Queue & Recent Syncs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Sync Queue
                    </div>
                    {status?.financialSync?.pendingQueue !== undefined && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        status.financialSync.pendingQueue > 0
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {status.financialSync.pendingQueue} pending
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {status?.financialSync?.recentSyncs?.length ? (
                      status.financialSync.recentSyncs.map((sync, i) => (
                        <div
                          key={`${sync.ticker}-${i}`}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                            sync.status === 'completed' ? 'bg-green-500/5' :
                            sync.status === 'failed' ? 'bg-red-500/5' :
                            'bg-blue-500/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {sync.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : sync.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            )}
                            <span className="text-sm font-mono font-medium">{sync.ticker}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {sync.itemsCreated} items
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(sync.syncedAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No recent syncs
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Endpoints Reference */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="w-5 h-5" />
                  Financial Data API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="py-2 px-3 bg-secondary/30 rounded">
                    <span className="text-green-500">GET</span> /api/v1/financials/income-statements
                  </div>
                  <div className="py-2 px-3 bg-secondary/30 rounded">
                    <span className="text-green-500">GET</span> /api/v1/financials/balance-sheets
                  </div>
                  <div className="py-2 px-3 bg-secondary/30 rounded">
                    <span className="text-green-500">GET</span> /api/v1/financials/cash-flow-statements
                  </div>
                  <div className="py-2 px-3 bg-secondary/30 rounded">
                    <span className="text-blue-500">POST</span> /api/cron/sync-financials
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edge Functions Tab */}
        {activeTab === 'functions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search functions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {status?.edgeFunctions?.byCategory && Object.entries(status.edgeFunctions.byCategory)
                .filter(([category, functions]) =>
                  !searchTerm ||
                  category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  functions.some(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(([category, functions]) => {
                  const filteredFunctions = searchTerm
                    ? functions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    : functions

                  if (searchTerm && filteredFunctions.length === 0 && !category.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return null
                  }

                  const isExpanded = expandedCategories.has(`fn-${category}`) || searchTerm.length > 0

                  return (
                    <Card key={category}>
                      <CardHeader
                        className="pb-2 cursor-pointer hover:bg-secondary/50 rounded-t-lg transition-colors"
                        onClick={() => toggleCategory(`fn-${category}`)}
                      >
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {categoryIcons[category] || <Zap className="w-4 h-4" />}
                            {category}
                          </div>
                          <span className="text-xs font-normal text-muted-foreground">
                            {filteredFunctions.length} functions
                          </span>
                        </CardTitle>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {(searchTerm ? filteredFunctions : functions).map((fn) => {
                              const testResult = functionTestResults[fn.name]
                              const isTestingThis = testingFunction === fn.name

                              return (
                                <div
                                  key={fn.name}
                                  className={`flex items-center justify-between py-1.5 px-2 rounded text-xs group ${
                                    testResult?.success === false ? 'bg-red-500/10' :
                                    testResult?.success === true ? 'bg-green-500/10' :
                                    fn.status === 'active' ? 'bg-green-500/5' :
                                    fn.status === 'error' ? 'bg-red-500/10' : 'bg-secondary/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      testResult?.success === false ? 'bg-red-500' :
                                      testResult?.success === true ? 'bg-green-500' :
                                      fn.status === 'active' ? 'bg-green-500' :
                                      fn.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                                    }`} />
                                    <span className="font-mono truncate" title={fn.name}>{fn.name}</span>
                                    {testResult?.duration && (
                                      <span className="text-[10px] text-muted-foreground">{testResult.duration}ms</span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      testFunction(fn.name)
                                    }}
                                    disabled={isTestingThis}
                                  >
                                    {isTestingThis ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3 mr-1" />
                                        Test
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </div>
        )}

        {/* Database Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {status?.database?.tablesByCategory && Object.entries(status.database.tablesByCategory)
                .filter(([category, tables]) =>
                  !searchTerm ||
                  category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tables.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(([category, tables]) => {
                  const filteredTables = searchTerm
                    ? tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    : tables

                  if (searchTerm && filteredTables.length === 0 && !category.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return null
                  }

                  const isExpanded = expandedCategories.has(`db-${category}`) || searchTerm.length > 0
                  const categoryTotal = tables.reduce((sum, t) => sum + (t.count || 0), 0)
                  const emptyCount = tables.filter(t => t.count === 0).length

                  return (
                    <Card key={category} className={emptyCount > tables.length / 2 ? 'border-yellow-500/20' : ''}>
                      <CardHeader
                        className="pb-2 cursor-pointer hover:bg-secondary/50 rounded-t-lg transition-colors"
                        onClick={() => toggleCategory(`db-${category}`)}
                      >
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {categoryIcons[category] || <Database className="w-4 h-4" />}
                            {category}
                            {emptyCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                                {emptyCount} empty
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-normal text-muted-foreground">
                              {tables.length} tables
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {formatNumber(categoryTotal)}
                            </span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {(searchTerm ? filteredTables : tables).map((table) => {
                              const freshness = getDataFreshness(table.name, table.count)

                              return (
                                <div
                                  key={table.name}
                                  className={`flex items-center justify-between py-1.5 px-2 rounded text-xs ${
                                    table.error ? 'bg-red-500/10' :
                                    freshness === 'empty' ? 'bg-yellow-500/10' :
                                    freshness === 'critical' ? 'bg-orange-500/10' :
                                    'bg-secondary/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {freshness === 'empty' && (
                                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                                    )}
                                    <span className="font-mono truncate" title={table.name}>{table.name}</span>
                                  </div>
                                  <span className={`font-bold ${
                                    table.error ? 'text-red-500' :
                                    freshness === 'empty' ? 'text-yellow-500' :
                                    ''
                                  }`}>
                                    {table.error ? 'Error' : formatNumber(table.count)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </div>
        )}

        {/* APIs Tab */}
        {activeTab === 'apis' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  External API Health Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {status?.externalApis?.map((api) => (
                    <div
                      key={api.name}
                      className={`flex items-center justify-between py-4 px-4 rounded-lg border ${
                        api.status === 'healthy' ? 'bg-green-500/5 border-green-500/20' :
                        api.status === 'degraded' ? 'bg-yellow-500/5 border-yellow-500/20' :
                        'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {api.status === 'healthy' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : api.status === 'degraded' ? (
                          <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{api.name}</p>
                            {api.critical && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 font-medium">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          {api.error && (
                            <p className="text-sm text-red-500 mt-1">{api.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          api.status === 'healthy' ? 'text-green-500' :
                          api.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {api.status.toUpperCase()}
                        </span>
                        {api.responseTime && (
                          <p className="text-sm text-muted-foreground">{api.responseTime}ms response</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Live Function Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Function Invocation Logs
                  </div>
                  <div className="flex items-center gap-2">
                    {isPollingLogs && (
                      <div className="flex items-center gap-1 text-green-500">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        <span className="text-xs">Live</span>
                      </div>
                    )}
                    <Button
                      variant={isPollingLogs ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setIsPollingLogs(!isPollingLogs)}
                    >
                      {isPollingLogs ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start Live Feed
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {functionLogs.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-xs">
                    {functionLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 py-2 px-3 rounded border ${
                          log.status === 'success' ? 'bg-green-500/5 border-green-500/20' :
                          log.status === 'error' ? 'bg-red-500/5 border-red-500/20' :
                          'bg-blue-500/5 border-blue-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-[120px]">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : log.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          )}
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold">{log.functionName}</span>
                          {log.message && (
                            <span className="text-muted-foreground ml-2">{log.message}</span>
                          )}
                        </div>
                        {log.duration && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Timer className="w-3 h-3" />
                            {log.duration}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium">No Function Logs</p>
                    <p className="text-sm text-muted-foreground">
                      Test a function from the Functions tab or enable live feed to see logs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" />
                  Error Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status?.errors && status.errors.length > 0 ? (
                  <div className="space-y-3">
                    {status.errors.map((err, i) => (
                      <div
                        key={i}
                        className="py-3 px-4 bg-red-500/5 border border-red-500/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              err.severity === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {err.severity.toUpperCase()}
                            </span>
                            <span className="font-medium text-red-500">{err.source}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(err.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{err.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-green-500">No Errors</p>
                    <p className="text-sm text-muted-foreground">All systems operating normally</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Lician Admin Dashboard v3.0
          </p>
          <p className="text-xs mt-1">
            {totalFunctions} edge functions | {totalTables} database tables | {totalApis} external APIs
          </p>
        </div>
      </div>
    </div>
  )
}
