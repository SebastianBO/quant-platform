"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  RefreshCw, Activity, Clock, Server, Link2,
  TrendingUp, Play, Eye, FileText, CheckCircle2,
  XCircle, Loader2, CircleDot
} from "lucide-react"
import { SystemStatus } from "../types"
import { formatNumber, formatTimeAgo } from "../utils"

interface FinancialSyncTabProps {
  status: SystemStatus | null
  syncActionLoading: string | null
  triggerSyncAction: (action: 'sync-financials' | 'watch-filings', mode?: string, limit?: number) => void
}

function FinancialSyncTabComponent({
  status,
  syncActionLoading,
  triggerSyncAction
}: FinancialSyncTabProps) {
  return (
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
  )
}

export const FinancialSyncTab = memo(FinancialSyncTabComponent)
