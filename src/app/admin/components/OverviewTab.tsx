"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Database, Activity, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, Globe, HardDrive,
  AlertCircle, Loader2, FileText, Users, Wallet,
  Terminal, Pause, Play
} from "lucide-react"
import { SystemStatus, FunctionLog } from "../types"
import { formatNumber, formatTimeAgo, getDataFreshness } from "../utils"

interface OverviewTabProps {
  status: SystemStatus | null
  functionLogs: FunctionLog[]
  isPollingLogs: boolean
  setIsPollingLogs: (value: boolean) => void
  emptyTables: number
}

function OverviewTabComponent({
  status,
  functionLogs,
  isPollingLogs,
  setIsPollingLogs,
  emptyTables
}: OverviewTabProps) {
  return (
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
              <AlertTriangle className="w-5 h-5" />
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
  )
}

export const OverviewTab = memo(OverviewTabComponent)
