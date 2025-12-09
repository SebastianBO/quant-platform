"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Database, Server, Activity, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCw, Shield, Zap, Globe, HardDrive,
  TrendingUp, AlertOctagon, Loader2, ChevronDown, ChevronRight,
  Users, Briefcase, BarChart3, FileText, Bot, Wallet,
  Bell, Building, Settings, Link2, Eye, Play, Search, Filter
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

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'tables' | 'apis' | 'logs'>('overview')
  const [searchTerm, setSearchTerm] = useState("")

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
        ...Object.keys(status.edgeFunctions.byCategory),
        ...Object.keys(status.database.tablesByCategory || {})
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
              System monitoring for 170+ edge functions and 60+ database tables
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
              { id: 'functions', label: `Functions (${totalFunctions})`, icon: <Zap className="w-4 h-4" /> },
              { id: 'tables', label: `Tables (${totalTables})`, icon: <Database className="w-4 h-4" /> },
              { id: 'apis', label: `APIs (${healthyApis}/${totalApis})`, icon: <Globe className="w-4 h-4" /> },
              { id: 'logs', label: `Logs (${status?.errors?.length || 0})`, icon: <AlertOctagon className="w-4 h-4" /> }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
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

              {/* Sync Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RefreshCw className="w-5 h-5" />
                    Data Sync Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {status?.syncStatus?.length ? status.syncStatus.map((sync) => (
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
                        <div className="flex items-center gap-2">
                          {sync.recordsProcessed && (
                            <span className="text-xs text-muted-foreground">
                              {formatNumber(sync.recordsProcessed)} records
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            sync.status === 'fresh' ? 'bg-green-500/20 text-green-500' :
                            sync.status === 'stale' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {sync.lastSync ? formatTimeAgo(sync.lastSync) : 'Never'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4">No sync data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                          <div className="grid grid-cols-2 gap-1">
                            {(searchTerm ? filteredFunctions : functions).map((fn) => (
                              <div
                                key={fn.name}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs ${
                                  fn.status === 'active' ? 'bg-green-500/10' :
                                  fn.status === 'error' ? 'bg-red-500/10' : 'bg-secondary/30'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  fn.status === 'active' ? 'bg-green-500' :
                                  fn.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                                }`} />
                                <span className="font-mono truncate" title={fn.name}>{fn.name}</span>
                              </div>
                            ))}
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

                  return (
                    <Card key={category}>
                      <CardHeader
                        className="pb-2 cursor-pointer hover:bg-secondary/50 rounded-t-lg transition-colors"
                        onClick={() => toggleCategory(`db-${category}`)}
                      >
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {categoryIcons[category] || <Database className="w-4 h-4" />}
                            {category}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-normal text-muted-foreground">
                              {tables.length} tables
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {formatNumber(categoryTotal)} rows
                            </span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {(searchTerm ? filteredTables : tables).map((table) => (
                              <div
                                key={table.name}
                                className={`flex items-center justify-between py-1.5 px-2 rounded text-xs ${
                                  table.error ? 'bg-red-500/10' : 'bg-secondary/30'
                                }`}
                              >
                                <span className="font-mono truncate" title={table.name}>{table.name}</span>
                                <span className={`font-bold ${table.error ? 'text-red-500' : ''}`}>
                                  {table.error ? 'Error' : formatNumber(table.count)}
                                </span>
                              </div>
                            ))}
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
          <p>Lician Admin Dashboard v2.0</p>
          <p className="text-xs mt-1">
            {totalFunctions} edge functions | {totalTables} database tables | {totalApis} external APIs
          </p>
        </div>
      </div>
    </div>
  )
}
