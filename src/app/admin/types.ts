// Admin dashboard shared types

export interface TableInfo {
  name: string
  count: number
  error?: string
}

export interface EdgeFunctionInfo {
  name: string
  status: 'active' | 'error' | 'unknown'
}

export interface FunctionLog {
  id: string
  functionName: string
  status: 'success' | 'error' | 'running'
  duration?: number
  timestamp: string
  message?: string
}

export interface SystemStatus {
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

export interface AnalystStats {
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
}

export interface FunctionTestResult {
  success: boolean
  message: string
  duration?: number
}
