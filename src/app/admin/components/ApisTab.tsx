"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Globe, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react"
import { SystemStatus } from "../types"

interface ApisTabProps {
  status: SystemStatus | null
}

function ApisTabComponent({ status }: ApisTabProps) {
  return (
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
  )
}

export const ApisTab = memo(ApisTabComponent)
