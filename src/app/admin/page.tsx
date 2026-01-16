"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Shield, RefreshCw, AlertCircle, BarChart3, TrendingUp,
  Zap, Database, Globe, Terminal, Sparkles
} from "lucide-react"

import { SystemStatus, FunctionLog, AnalystStats, FunctionTestResult } from "./types"
import { formatTimeAgo, getDataFreshness } from "./utils"
import {
  OverviewTab,
  AnalystRatingsTab,
  FinancialSyncTab,
  FunctionsTab,
  TablesTab,
  ApisTab,
  LogsTab,
  LoginScreen
} from "./components"

type TabType = 'overview' | 'functions' | 'tables' | 'apis' | 'logs' | 'sync' | 'analysts'

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [analystStats, setAnalystStats] = useState<AnalystStats | null>(null)
  const [analystLoading, setAnalystLoading] = useState(false)
  const [syncActionLoading, setSyncActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [testingFunction, setTestingFunction] = useState<string | null>(null)
  const [functionTestResults, setFunctionTestResults] = useState<Record<string, FunctionTestResult>>({})
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

      if (data.functionLogs) {
        setFunctionLogs(data.functionLogs)
      }
    } catch {
      setError('Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [password])

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

  const fetchAnalystStats = async () => {
    if (!password) return
    setAnalystLoading(true)

    try {
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
        body: JSON.stringify({ action, mode, limit })
      })

      const result = await response.json()

      setFunctionLogs(prev => [{
        id: `${action}-${Date.now()}`,
        functionName: action,
        status: result.success ? 'success' : 'error',
        duration: result.duration,
        timestamp: new Date().toISOString(),
        message: result.message || (result.success ? 'Sync triggered successfully' : result.error)
      }, ...prev.slice(0, 49)])

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
      } catch {
        // Silent fail for log polling
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [isPollingLogs, isAuthenticated, password])

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
      <LoginScreen
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
        onLogin={fetchStatus}
      />
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

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'sync' as const, label: 'Financial Sync', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'analysts' as const, label: 'Analyst Ratings', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'functions' as const, label: `Functions (${totalFunctions})`, icon: <Zap className="w-4 h-4" /> },
    { id: 'tables' as const, label: `Tables (${totalTables})`, icon: <Database className="w-4 h-4" /> },
    { id: 'apis' as const, label: `APIs (${healthyApis}/${totalApis})`, icon: <Globe className="w-4 h-4" /> },
    { id: 'logs' as const, label: `Logs`, icon: <Terminal className="w-4 h-4" /> }
  ]

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
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'overview' && (
          <OverviewTab
            status={status}
            functionLogs={functionLogs}
            isPollingLogs={isPollingLogs}
            setIsPollingLogs={setIsPollingLogs}
            emptyTables={emptyTables}
          />
        )}

        {activeTab === 'analysts' && (
          <AnalystRatingsTab
            analystStats={analystStats}
            analystLoading={analystLoading}
            syncActionLoading={syncActionLoading}
            fetchAnalystStats={fetchAnalystStats}
            triggerAnalystScraper={triggerAnalystScraper}
          />
        )}

        {activeTab === 'sync' && (
          <FinancialSyncTab
            status={status}
            syncActionLoading={syncActionLoading}
            triggerSyncAction={triggerSyncAction}
          />
        )}

        {activeTab === 'functions' && (
          <FunctionsTab
            status={status}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            expandAll={expandAll}
            collapseAll={collapseAll}
            testFunction={testFunction}
            testingFunction={testingFunction}
            functionTestResults={functionTestResults}
          />
        )}

        {activeTab === 'tables' && (
          <TablesTab
            status={status}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            expandAll={expandAll}
            collapseAll={collapseAll}
          />
        )}

        {activeTab === 'apis' && (
          <ApisTab status={status} />
        )}

        {activeTab === 'logs' && (
          <LogsTab
            status={status}
            functionLogs={functionLogs}
            isPollingLogs={isPollingLogs}
            setIsPollingLogs={setIsPollingLogs}
          />
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
