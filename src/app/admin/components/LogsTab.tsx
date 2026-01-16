"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Terminal, CheckCircle2, XCircle, Loader2,
  CircleDot, Pause, Play, Timer, AlertOctagon
} from "lucide-react"
import { SystemStatus, FunctionLog } from "../types"
import { formatTimeAgo } from "../utils"

interface LogsTabProps {
  status: SystemStatus | null
  functionLogs: FunctionLog[]
  isPollingLogs: boolean
  setIsPollingLogs: (value: boolean) => void
}

function LogsTabComponent({
  status,
  functionLogs,
  isPollingLogs,
  setIsPollingLogs
}: LogsTabProps) {
  return (
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
  )
}

export const LogsTab = memo(LogsTabComponent)
